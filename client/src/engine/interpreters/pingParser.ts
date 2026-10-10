/**
 * NetDoctor — Ping Output Parser
 * Regex pattern matching for Windows, macOS, and Linux ICMP ping outputs
 * Seamlessly handles full terminal buffers, partial replies, and command prompts
 */

import type { ParsedPingStats } from './types';

export function parsePingOutput(raw: string): ParsedPingStats {
  const text = raw.trim();
  if (!text) {
    return {
      packetsSent: 0,
      packetsReceived: 0,
      packetsLost: 0,
      lossPercentage: 0,
      isTimeout: false,
      isUnreachable: false,
      isGeneralFailure: false,
      isValidOutput: false
    };
  }

  const hasPingSignatures = /(?:Pinging\s+|Ping\s+statistics|Reply\s+from|bytes\s+from|bytes\s+of\s+data|Request\s+timed\s+out|Destination\s+host\s+unreachable|Destination\s+net\s+unreachable|General\s+failure|Transmit\s+failed|could\s+not\s+find\s+host|Unknown\s+host|packets\s+transmitted|packet\s+loss|rtt\s+min\/avg\/max|round-trip\s+min\/avg\/max|time[=<]\d+\.?\d*\s*ms|TTL=\d+|ttl=\d+)/i.test(text);

  // 1. Detect Failure Signatures
  const isTimeout =
    /Request timed out/i.test(text) ||
    /100%\s*(?:packet\s*)?loss/i.test(text) ||
    /100\.0%\s*packet\s*loss/i.test(text);

  const isUnreachable =
    /Destination host unreachable/i.test(text) ||
    /Host Unreachable/i.test(text) ||
    /Network is unreachable/i.test(text) ||
    /No route to host/i.test(text);

  const isGeneralFailure =
    /General failure/i.test(text) ||
    /Transmit failed/i.test(text) ||
    /could not find host/i.test(text) ||
    /Unknown host/i.test(text) ||
    /Name or service not known/i.test(text) ||
    /cannot resolve/i.test(text);

  // 2. Parse Windows Packet Statistics Summary
  // Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)
  const winStatsMatch = text.match(
    /Packets:\s*Sent\s*=\s*(\d+),\s*Received\s*=\s*(\d+),\s*Lost\s*=\s*(\d+)\s*\(([\d.]+)%\s*loss\)/i
  );

  // 3. Parse Unix/macOS Packet Statistics Summary
  // 4 packets transmitted, 4 received, 0% packet loss, time 3004ms
  const unixStatsMatch = text.match(
    /(\d+)\s*packets?\s*transmitted,\s*(\d+)\s*(?:packets?\s*)?received,\s*(?:[+-]\d+\s*errors,?\s*)?([\d.]+)%\s*packet\s*loss/i
  );

  let packetsSent = 0;
  let packetsReceived = 0;
  let packetsLost = 0;
  let lossPercentage = 0;

  // Extract individual reply lines e.g.:
  // "Reply from 8.8.8.8: bytes=32 time=11ms TTL=113"
  // "64 bytes from 8.8.8.8: icmp_seq=1 ttl=117 time=18.4 ms"
  const replyLines = Array.from(text.matchAll(/(?:Reply from|bytes from)\s+([^\s:]+):\s*(?:bytes=\d+\s*)?(?:time[=<]([\d.]+)\s*ms)?.*?(?:TTL=(\d+)|ttl=(\d+))?/gi));
  const replyCount = replyLines.length;
  const timeoutLines = (text.match(/Request timed out|Destination host unreachable/gi) || []).length;

  if (winStatsMatch) {
    packetsSent = parseInt(winStatsMatch[1], 10);
    packetsReceived = parseInt(winStatsMatch[2], 10);
    packetsLost = parseInt(winStatsMatch[3], 10);
    lossPercentage = parseFloat(winStatsMatch[4]);
  } else if (unixStatsMatch) {
    packetsSent = parseInt(unixStatsMatch[1], 10);
    packetsReceived = parseInt(unixStatsMatch[2], 10);
    lossPercentage = parseFloat(unixStatsMatch[3]);
    packetsLost = Math.max(0, packetsSent - packetsReceived);
  } else if (replyCount > 0 || timeoutLines > 0) {
    // If no summary line, calculate from parsed reply lines
    const total = replyCount + timeoutLines;
    packetsSent = total;
    packetsReceived = replyCount;
    packetsLost = timeoutLines;
    lossPercentage = total > 0 ? (timeoutLines / total) * 100 : 0;
  } else if (isTimeout || isUnreachable || isGeneralFailure) {
    packetsSent = 4;
    packetsReceived = 0;
    packetsLost = 4;
    lossPercentage = 100;
  }

  // If no ping signatures found and no packets parsed
  if (!hasPingSignatures && replyCount === 0 && !isTimeout && !isUnreachable && !isGeneralFailure) {
    return {
      packetsSent: 0,
      packetsReceived: 0,
      packetsLost: 0,
      lossPercentage: 0,
      isTimeout: false,
      isUnreachable: false,
      isGeneralFailure: false,
      isValidOutput: false
    };
  }

  // 4. Parse Windows Latency Summary
  // Minimum = 1ms, Maximum = 4ms, Average = 2ms
  let minRtt: number | undefined;
  let maxRtt: number | undefined;
  let avgRtt: number | undefined;

  const winRttMatch = text.match(
    /Minimum\s*=\s*(\d+)\s*ms,\s*Maximum\s*=\s*(\d+)\s*ms,\s*Average\s*=\s*(\d+)\s*ms/i
  );
  if (winRttMatch) {
    minRtt = parseInt(winRttMatch[1], 10);
    maxRtt = parseInt(winRttMatch[2], 10);
    avgRtt = parseInt(winRttMatch[3], 10);
  }

  // 5. Parse Unix/macOS RTT
  // rtt min/avg/max/mdev = 1.234/2.345/3.456/0.567 ms
  const unixRttMatch = text.match(/(?:rtt|round-trip)\s*min\/avg\/max\/(?:mdev|stddev)\s*=\s*([\d.]+)\/([\d.]+)\/([\d.]+)/i);
  if (unixRttMatch) {
    minRtt = parseFloat(unixRttMatch[1]);
    avgRtt = parseFloat(unixRttMatch[2]);
    maxRtt = parseFloat(unixRttMatch[3]);
  }

  // 6. Extract RTT from individual reply lines if summary was omitted
  const individualTimes: number[] = [];
  for (const match of text.matchAll(/time[=<]([\d.]+)\s*ms/gi)) {
    const val = parseFloat(match[1]);
    if (!isNaN(val)) individualTimes.push(val);
  }

  if (avgRtt === undefined && individualTimes.length > 0) {
    minRtt = Math.min(...individualTimes);
    maxRtt = Math.max(...individualTimes);
    const sum = individualTimes.reduce((a, b) => a + b, 0);
    avgRtt = Math.round((sum / individualTimes.length) * 10) / 10;
  }

  // 7. Parse TTL
  let ttl: number | undefined;
  const ttlMatch = text.match(/TTL\s*=\s*(\d+)/i) || text.match(/ttl\s*=\s*(\d+)/i);
  if (ttlMatch && ttlMatch[1]) {
    ttl = parseInt(ttlMatch[1], 10);
  }

  // 8. Determine Error Signature
  let errorSignature: string | undefined;
  if (isGeneralFailure) {
    errorSignature = 'General hardware or driver transmission failure';
  } else if (isUnreachable) {
    errorSignature = 'Destination host or network unreachable';
  } else if (isTimeout && lossPercentage === 100) {
    errorSignature = 'Request timed out (100% packet loss)';
  } else if (lossPercentage > 0) {
    errorSignature = `Intermittent packet loss (${lossPercentage.toFixed(0)}% loss)`;
  }

  return {
    packetsSent,
    packetsReceived,
    packetsLost,
    lossPercentage,
    minRtt,
    maxRtt,
    avgRtt,
    ttl,
    errorSignature,
    isTimeout,
    isUnreachable,
    isGeneralFailure,
    isValidOutput: true
  };
}
