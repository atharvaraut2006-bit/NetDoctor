/**
 * NetDoctor — Wi-Fi Interface Output Parser
 * Regex pattern matching for Windows netsh wlan, Linux nmcli, and macOS airport
 */

import type { ParsedWifiState } from './types';

export function parseWifiOutput(raw: string): ParsedWifiState {
  const text = raw.trim();
  if (!text) {
    return {
      isWeakSignal: false,
      isDisconnected: true,
      isValidOutput: false
    };
  }

  const hasWifiSignatures = /(?:SSID|Signal\s*:|Radio\s+type|Receive\s+rate|Transmit\s+rate|BSSID|Authentication|Cipher|Channel|agrCtlRSSI|SIGNAL|wlan|Wi-Fi|airport)/i.test(text);

  // 1. Match State
  let state: string | undefined;
  const stateMatch = text.match(/State\s*:\s*([^\r\n]+)/i) || text.match(/status:\s*([^\r\n]+)/i);
  if (stateMatch && stateMatch[1]) {
    state = stateMatch[1].trim().toLowerCase();
  }

  const isDisconnected =
    state === 'disconnected' ||
    /disconnected/i.test(text) ||
    /no interface/i.test(text) ||
    /not connected/i.test(text);

  // 2. Match SSID
  let ssid: string | undefined;
  const ssidMatch = text.match(/SSID\s*:\s*([^\r\n]+)/i) || text.match(/connected to ([^\r\n]+)/i);
  if (ssidMatch && ssidMatch[1]) {
    ssid = ssidMatch[1].trim();
  }

  // 3. Match Signal Percentage or RSSI
  let signalPercentage: number | undefined;
  const sigMatch = text.match(/Signal\s*:\s*(\d+)%/i) || text.match(/SIGNAL\s*(\d+)/i);
  if (sigMatch && sigMatch[1]) {
    signalPercentage = parseInt(sigMatch[1], 10);
  } else {
    // RSSI e.g. -65 dBm -> convert roughly to percentage
    const rssiMatch = text.match(/agrCtlRSSI:\s*(-?\d+)/i) || text.match(/signal:\s*(-?\d+)\s*dBm/i);
    if (rssiMatch && rssiMatch[1]) {
      const rssi = parseInt(rssiMatch[1], 10);
      // -50 dBm = 100%, -100 dBm = 0%
      signalPercentage = Math.max(0, Math.min(100, Math.round(2 * (rssi + 100))));
    }
  }

  // 4. Match Radio Type
  let radioType: string | undefined;
  const radioMatch = text.match(/Radio\s+type\s*:\s*([^\r\n]+)/i);
  if (radioMatch && radioMatch[1]) {
    radioType = radioMatch[1].trim();
  }

  // 5. Match Receive Rate
  let receiveRate: number | undefined;
  const rateMatch = text.match(/Receive\s+rate\s*\([^\)]+\)\s*:\s*(\d+)/i);
  if (rateMatch && rateMatch[1]) {
    receiveRate = parseInt(rateMatch[1], 10);
  }

  if (!hasWifiSignatures && !stateMatch) {
    return {
      isWeakSignal: false,
      isDisconnected: true,
      isValidOutput: false
    };
  }

  const isWeakSignal = signalPercentage !== undefined && signalPercentage < 45;

  return {
    state: state || (isDisconnected ? 'disconnected' : 'connected'),
    ssid,
    signalPercentage,
    radioType,
    receiveRate,
    isWeakSignal,
    isDisconnected,
    isValidOutput: true
  };
}
