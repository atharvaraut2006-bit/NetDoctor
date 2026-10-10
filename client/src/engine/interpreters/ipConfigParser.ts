/**
 * NetDoctor — IP & DHCP Configuration Output Parser
 * Robust multi-adapter parser for Windows (ipconfig /all), macOS (ifconfig), and Linux (ip addr)
 * Line-by-line adapter section scanner to accurately identify active vs disconnected adapters
 */

import type { ParsedIpConfig } from './types';

interface AdapterBlock {
  name: string;
  rawText: string;
  ipv4?: string;
  subnetMask?: string;
  defaultGateway?: string;
  dhcpServer?: string;
  dnsServers: string[];
  isApipa: boolean;
  isDisconnected: boolean;
}

export function parseIpConfigOutput(raw: string): ParsedIpConfig {
  const text = raw.trim();
  if (!text) {
    return { isApipa: false, isDisconnected: true, dnsServers: [], isValidOutput: false };
  }

  const hasIpConfigSignatures = /(?:IPv4\s+Address|IP\s+Address|Autoconfiguration|Subnet\s+Mask|Default\s+Gateway|DHCP\s+Server|DNS\s+Servers?|Windows\s+IP\s+Configuration|Wireless\s+LAN\s+adapter|Ethernet\s+adapter|Tunnel\s+adapter|Media\s+disconnected|inet\s+\d+|netmask\s+|brd\s+|valid_lft|link\/ether)/i.test(text);

  const adapterBlocks: AdapterBlock[] = [];
  const lines = text.split('\n');
  let currentBlock: AdapterBlock | null = null;

  for (const line of lines) {
    // Check for adapter header (e.g., "Wireless LAN adapter Wi-Fi:" or "Ethernet adapter Ethernet:")
    const headerMatch = line.match(/(?:Wireless LAN adapter|Ethernet adapter|Tunnel adapter|Unknown adapter|adapter)\s+([^:\r\n]+):/i);
    if (headerMatch) {
      if (currentBlock) {
        adapterBlocks.push(currentBlock);
      }
      currentBlock = {
        name: headerMatch[1].trim(),
        rawText: line,
        dnsServers: [],
        isApipa: false,
        isDisconnected: false
      };
      continue;
    }

    if (currentBlock) {
      currentBlock.rawText += '\n' + line;

      // Disconnected state
      if (/media\s+disconnected/i.test(line) || /cable\s+unplugged/i.test(line) || /status:\s*inactive/i.test(line)) {
        currentBlock.isDisconnected = true;
      }

      // IPv4 match
      const ipMatch = line.match(/(?:IPv4\s+Address|IP\s+Address|Autoconfiguration\s+IPv4\s+Address)[.\s:]+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/i);
      if (ipMatch && ipMatch[1]) {
        currentBlock.ipv4 = ipMatch[1].trim();
        if (/^169\.254\./.test(currentBlock.ipv4) || /Autoconfiguration/i.test(line)) {
          currentBlock.isApipa = true;
        }
      }

      // Subnet Mask
      const maskMatch = line.match(/Subnet\s+Mask[.\s:]+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/i);
      if (maskMatch && maskMatch[1]) {
        currentBlock.subnetMask = maskMatch[1].trim();
      }

      // Default Gateway
      const gwMatch = line.match(/Default\s+Gateway[.\s:]+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/i);
      if (gwMatch && gwMatch[1]) {
        currentBlock.defaultGateway = gwMatch[1].trim();
      }

      // DHCP Server
      const dhcpMatch = line.match(/DHCP\s+Server[.\s:]+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/i);
      if (dhcpMatch && dhcpMatch[1]) {
        currentBlock.dhcpServer = dhcpMatch[1].trim();
      }

      // DNS Servers
      const dnsMatch = line.match(/DNS\s+Servers?[.\s:]+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/i);
      if (dnsMatch && dnsMatch[1] && !currentBlock.dnsServers.includes(dnsMatch[1])) {
        currentBlock.dnsServers.push(dnsMatch[1]);
      }

      const secDns = line.match(/^\s+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\s*$/);
      if (secDns && secDns[1] && !currentBlock.dnsServers.includes(secDns[1])) {
        currentBlock.dnsServers.push(secDns[1]);
      }
    }
  }

  if (currentBlock) {
    adapterBlocks.push(currentBlock);
  }

  // If no Windows adapter headers found, treat as Unix / Linux / Single Block
  if (adapterBlocks.length === 0 && hasIpConfigSignatures) {
    const isDisconnected =
      /media\s+disconnected/i.test(text) ||
      /\bdisconnected\b/i.test(text) ||
      /state\s+DOWN/i.test(text) ||
      /status:\s*inactive/i.test(text) ||
      /cable\s+unplugged/i.test(text);

    let ipv4: string | undefined;
    const unixIpv4Match = text.match(/inet\s+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/i) ||
                          text.match(/(?:IPv4\s+Address|IP\s+Address)[.\s:]+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/i);

    if (unixIpv4Match && unixIpv4Match[1] && unixIpv4Match[1] !== '127.0.0.1') {
      ipv4 = unixIpv4Match[1].trim();
    } else {
      const allIps = text.match(/\b(?!(?:127\.0\.0\.1|0\.0\.0\.0|255\.255\.\d+\.\d+))\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g);
      if (allIps && allIps.length > 0) {
        ipv4 = allIps[0];
      }
    }

    const isApipa =
      (ipv4 !== undefined && /^169\.254\./.test(ipv4)) ||
      /169\.254\.\d{1,3}\.\d{1,3}/.test(text);

    let subnetMask: string | undefined;
    const maskMatch = text.match(/Subnet\s+Mask[.\s:]+(\d{1,3}\.\d{1,3}\.\d{1,3})/i) ||
                      text.match(/netmask\s+([\d.xabcdef]+)/i);
    if (maskMatch && maskMatch[1]) {
      subnetMask = maskMatch[1].trim();
    }

    let defaultGateway: string | undefined;
    const gwMatch =
      text.match(/Default\s+Gateway[.\s:]+(\d{1,3}\.\d{1,3}\.\d{1,3})/i) ||
      text.match(/default\s+via\s+(\d{1,3}\.\d{1,3}\.\d{1,3})/i) ||
      text.match(/gateway\s+(\d{1,3}\.\d{1,3}\.\d{1,3})/i);
    if (gwMatch && gwMatch[1]) {
      defaultGateway = gwMatch[1].trim();
    }

    adapterBlocks.push({
      name: 'Active Adapter',
      rawText: text,
      ipv4,
      subnetMask,
      defaultGateway,
      dhcpServer: undefined,
      dnsServers: [],
      isApipa,
      isDisconnected
    });
  }

  // If no signatures matched and no adapter blocks created
  if (adapterBlocks.length === 0) {
    return {
      isApipa: false,
      isDisconnected: false,
      dnsServers: [],
      isValidOutput: false
    };
  }

  // Priority Selection:
  // 1. Fully connected adapter with valid non-APIPA IPv4 and Default Gateway
  const connectedWithGateway = adapterBlocks.find(
    (b) => !b.isDisconnected && b.ipv4 && !b.isApipa && b.defaultGateway
  );
  if (connectedWithGateway) {
    return {
      adapterName: connectedWithGateway.name,
      ipv4: connectedWithGateway.ipv4,
      subnetMask: connectedWithGateway.subnetMask,
      defaultGateway: connectedWithGateway.defaultGateway,
      dhcpServer: connectedWithGateway.dhcpServer,
      dnsServers: connectedWithGateway.dnsServers,
      isApipa: false,
      isDisconnected: false,
      isValidOutput: true
    };
  }

  // 2. Connected adapter with valid non-APIPA IPv4 (even if gateway is pending)
  const connectedWithIp = adapterBlocks.find(
    (b) => !b.isDisconnected && b.ipv4 && !b.isApipa
  );
  if (connectedWithIp) {
    return {
      adapterName: connectedWithIp.name,
      ipv4: connectedWithIp.ipv4,
      subnetMask: connectedWithIp.subnetMask,
      defaultGateway: connectedWithIp.defaultGateway,
      dhcpServer: connectedWithIp.dhcpServer,
      dnsServers: connectedWithIp.dnsServers,
      isApipa: false,
      isDisconnected: false,
      isValidOutput: true
    };
  }

  // 3. Adapter with APIPA (169.254.x.x)
  const apipaAdapter = adapterBlocks.find((b) => b.isApipa || (b.ipv4 && /^169\.254\./.test(b.ipv4)));
  if (apipaAdapter) {
    return {
      adapterName: apipaAdapter.name,
      ipv4: apipaAdapter.ipv4,
      subnetMask: apipaAdapter.subnetMask,
      defaultGateway: undefined,
      dhcpServer: apipaAdapter.dhcpServer,
      dnsServers: apipaAdapter.dnsServers,
      isApipa: true,
      isDisconnected: false,
      isValidOutput: true
    };
  }

  // 4. If all adapters are disconnected
  const allDisconnected = adapterBlocks.every((b) => b.isDisconnected);
  if (allDisconnected && adapterBlocks.length > 0) {
    return {
      adapterName: adapterBlocks[0].name,
      isApipa: false,
      isDisconnected: true,
      dnsServers: [],
      isValidOutput: true
    };
  }

  // 5. General fallback
  const firstBlock = adapterBlocks[0];
  return {
    adapterName: firstBlock?.name,
    ipv4: firstBlock?.ipv4,
    subnetMask: firstBlock?.subnetMask,
    defaultGateway: firstBlock?.defaultGateway,
    dhcpServer: firstBlock?.dhcpServer,
    dnsServers: firstBlock?.dnsServers || [],
    isApipa: firstBlock?.isApipa || false,
    isDisconnected: firstBlock?.isDisconnected || false,
    isValidOutput: hasIpConfigSignatures
  };
}
