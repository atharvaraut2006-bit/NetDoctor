/**
 * NetDoctor — Network Adapter & Link State Output Parser
 * Regex pattern matching for Windows (netsh interface show interface),
 * Linux (ip link show, ip -br link, ifconfig), and macOS (networksetup, ifconfig)
 */

import type { ParsedAdapterInterface, ParsedAdapterResult } from './types';
import { parseIpConfigOutput } from './ipConfigParser';

const VIRTUAL_ADAPTER_PATTERN = /(?:vpn|virtual|tap|hyper-v|vethernet|bluetooth|loopback|pseudo|teredo|isatap|mcafee|nord|wireguard)/i;
const PRIMARY_ADAPTER_PATTERN = /(?:wi-fi|wifi|wireless|wlan|ethernet|local area connection|eth\d*|en\d*|wl\w*)/i;

/**
 * Parses terminal outputs checking network adapter hardware and link state
 */
export function parseAdapterOutput(raw: string): ParsedAdapterResult {
  const text = raw.trim();
  if (!text) {
    return {
      interfaces: [],
      isConnected: false,
      isDisconnected: true,
      isDisabled: false,
      isValidOutput: false
    };
  }

  const interfaces: ParsedAdapterInterface[] = [];
  const lines = text.split('\n');

  // 1. Scan for Windows "netsh interface show interface" table rows
  // Example lines:
  // Admin State    State          Type             Interface Name
  // Enabled        Connected      Dedicated        Wi-Fi
  // Enabled        Disconnected   Dedicated        McAfee VPN
  // Disabled       Disconnected   Dedicated        Ethernet
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || /^Admin State/i.test(trimmed) || /^-+$/.test(trimmed)) {
      continue;
    }

    // Match Windows netsh table format: [Admin State] [State] [Type] [Interface Name]
    const netshMatch = trimmed.match(/^(Enabled|Disabled)\s+(Connected|Disconnected|Connecting|Disabling)\s+(\S+)\s+(.+)$/i);
    if (netshMatch) {
      const adminState = netshMatch[1].trim();
      const state = netshMatch[2].trim();
      const type = netshMatch[3].trim();
      const name = netshMatch[4].trim();

      const isVirtual = VIRTUAL_ADAPTER_PATTERN.test(name);
      const isPrimary = PRIMARY_ADAPTER_PATTERN.test(name) || !isVirtual;

      interfaces.push({
        name,
        adminState,
        state,
        type,
        isPrimary,
        isVirtual
      });
      continue;
    }

    // Match partial netsh row without Type column: [Admin State] [State] [Interface Name]
    const shortMatch = trimmed.match(/^(Enabled|Disabled)\s+(Connected|Disconnected|Connecting|Disabling)\s+(.+)$/i);
    if (shortMatch) {
      const adminState = shortMatch[1].trim();
      const state = shortMatch[2].trim();
      const name = shortMatch[3].trim();
      const isVirtual = VIRTUAL_ADAPTER_PATTERN.test(name);
      const isPrimary = PRIMARY_ADAPTER_PATTERN.test(name) || !isVirtual;

      interfaces.push({
        name,
        adminState,
        state,
        type: 'Dedicated',
        isPrimary,
        isVirtual
      });
      continue;
    }

    // 2. Scan for Linux "ip -br link" format: [Interface] [State (UP/DOWN)] ...
    const ipBrMatch = trimmed.match(/^([a-z0-9_.-]+)\s+(UP|DOWN|UNKNOWN)\s+/i);
    if (ipBrMatch && ipBrMatch[1] !== 'lo') {
      const name = ipBrMatch[1];
      const state = ipBrMatch[2].toUpperCase() === 'UP' ? 'Connected' : 'Disconnected';
      const isVirtual = VIRTUAL_ADAPTER_PATTERN.test(name);
      const isPrimary = PRIMARY_ADAPTER_PATTERN.test(name) || !isVirtual;

      interfaces.push({
        name,
        adminState: 'Enabled',
        state,
        isPrimary,
        isVirtual
      });
      continue;
    }

    // 3. Scan for Linux "ip link show" format: 2: eth0: <BROADCAST... state UP/DOWN ...>
    const ipLinkMatch = trimmed.match(/^\d+:\s*([^:]+):\s*<([^>]+)>.*?\bstate\s+([A-Z]+)/i);
    if (ipLinkMatch && ipLinkMatch[1].trim() !== 'lo') {
      const name = ipLinkMatch[1].trim();
      const rawState = ipLinkMatch[3].toUpperCase();
      const flags = ipLinkMatch[2].toUpperCase();
      const isDown = rawState === 'DOWN' || flags.includes('NO-CARRIER');
      const state = isDown ? 'Disconnected' : 'Connected';
      const isVirtual = VIRTUAL_ADAPTER_PATTERN.test(name);
      const isPrimary = PRIMARY_ADAPTER_PATTERN.test(name) || !isVirtual;

      interfaces.push({
        name,
        adminState: 'Enabled',
        state,
        isPrimary,
        isVirtual
      });
      continue;
    }

    // 4. Scan for macOS networksetup: Hardware Port: Wi-Fi \n Device: en0 \n status: active/inactive
    const macPortMatch = trimmed.match(/Hardware Port:\s*([^\r\n]+)/i);
    if (macPortMatch) {
      const name = macPortMatch[1].trim();
      const isActive = /status:\s*active/i.test(text);
      const isVirtual = VIRTUAL_ADAPTER_PATTERN.test(name);
      interfaces.push({
        name,
        adminState: 'Enabled',
        state: isActive ? 'Connected' : 'Disconnected',
        isPrimary: PRIMARY_ADAPTER_PATTERN.test(name) || !isVirtual,
        isVirtual
      });
    }
  }

  // If structured interfaces were discovered:
  if (interfaces.length > 0) {
    // Priority 1: Check if any primary physical interface (e.g. Wi-Fi, Ethernet) is Connected and Enabled
    const primaryConnected = interfaces.find(
      (iface) =>
        iface.isPrimary &&
        !iface.isVirtual &&
        iface.state.toLowerCase() === 'connected' &&
        iface.adminState.toLowerCase() === 'enabled'
    );

    if (primaryConnected) {
      return {
        interfaces,
        activeAdapterName: primaryConnected.name,
        adminState: primaryConnected.adminState,
        state: primaryConnected.state,
        isConnected: true,
        isDisconnected: false,
        isDisabled: false,
        isValidOutput: true
      };
    }

    // Priority 2: Check any primary interface that is disconnected or disabled
    const primaryInactive = interfaces.find((iface) => iface.isPrimary && !iface.isVirtual);
    if (primaryInactive) {
      const isDisabled = primaryInactive.adminState.toLowerCase() === 'disabled';
      const isConnected = !isDisabled && primaryInactive.state.toLowerCase() === 'connected';
      return {
        interfaces,
        activeAdapterName: primaryInactive.name,
        adminState: primaryInactive.adminState,
        state: primaryInactive.state,
        isConnected,
        isDisconnected: !isConnected,
        isDisabled,
        isValidOutput: true
      };
    }

    // Priority 3: Fallback to non-primary / virtual interfaces (e.g. user pasted McAfee VPN)
    const activeVirtual = interfaces.find(
      (iface) => iface.state.toLowerCase() === 'connected' && iface.adminState.toLowerCase() === 'enabled'
    );
    if (activeVirtual) {
      return {
        interfaces,
        activeAdapterName: activeVirtual.name,
        adminState: activeVirtual.adminState,
        state: activeVirtual.state,
        isConnected: true,
        isDisconnected: false,
        isDisabled: false,
        isValidOutput: true
      };
    }

    // All discovered interfaces are disconnected or disabled
    const firstIface = interfaces[0];
    const isDisabled = firstIface.adminState.toLowerCase() === 'disabled';
    return {
      interfaces,
      activeAdapterName: firstIface.name,
      adminState: firstIface.adminState,
      state: firstIface.state,
      isConnected: false,
      isDisconnected: true,
      isDisabled,
      isValidOutput: true
    };
  }

  // Fallback: If user pasted "ipconfig /all" or generic output into this step
  const ipConfigParsed = parseIpConfigOutput(text);
  if (ipConfigParsed.isValidOutput && ipConfigParsed.ipv4 && !ipConfigParsed.isDisconnected && !ipConfigParsed.isApipa) {
    return {
      interfaces: [],
      activeAdapterName: ipConfigParsed.adapterName || 'Primary Adapter',
      adminState: 'Enabled',
      state: 'Connected',
      isConnected: true,
      isDisconnected: false,
      isDisabled: false,
      isValidOutput: true
    };
  }

  const isExplicitlyDisconnected =
    /media\s+disconnected/i.test(text) ||
    /state\s+DOWN/i.test(text) ||
    /status:\s*inactive/i.test(text) ||
    /cable\s+unplugged/i.test(text) ||
    /no\s+carrier/i.test(text);

  const isExplicitlyConnected =
    /state\s+UP/i.test(text) ||
    /status:\s*active/i.test(text);

  const isValid = isExplicitlyConnected || isExplicitlyDisconnected;

  if (isValid) {
    const isConnected = isExplicitlyConnected && !isExplicitlyDisconnected;
    return {
      interfaces: [],
      isConnected,
      isDisconnected: !isConnected,
      isDisabled: /disabled/i.test(text),
      isValidOutput: true
    };
  }

  return {
    interfaces: [],
    isConnected: false,
    isDisconnected: true,
    isDisabled: false,
    isValidOutput: false
  };
}
