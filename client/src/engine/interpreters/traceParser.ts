/**
 * NetDoctor — Traceroute Output Parser
 * Regex pattern matching for tracert, traceroute, and tracepath commands
 */

import type { ParsedTraceResult } from './types';

export function parseTraceOutput(raw: string): ParsedTraceResult {
  const text = raw.trim();
  if (!text) {
    return {
      totalHops: 0,
      destinationReached: false,
      hopLatencies: [],
      isHop1Timeout: false,
      isValidOutput: false
    };
  }

  const lines = text.split('\n');

  let totalHops = 0;
  let destinationReached = false;
  let isHop1Timeout = false;
  let failingHop: number | undefined;
  const hopLatencies: number[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Match hop line e.g., "  1     1 ms     1 ms     1 ms  192.168.1.1" or " 1  192.168.1.1  1.234 ms"
    const hopMatch = trimmed.match(/^(\d{1,2})\s+(.+)$/);
    if (hopMatch) {
      const hopNum = parseInt(hopMatch[1], 10);
      totalHops = Math.max(totalHops, hopNum);
      const hopContent = hopMatch[2];

      // Check if hop 1 timed out
      if (hopNum === 1 && /\*\s+\*\s+\*/.test(hopContent)) {
        isHop1Timeout = true;
        if (!failingHop) failingHop = 1;
      } else if (/\*\s+\*\s+\*/.test(hopContent)) {
        if (!failingHop) failingHop = hopNum;
      }

      // Check if target IP reached on a hop line
      if (/8\.8\.8\.8/i.test(hopContent) || /google\.com/i.test(hopContent)) {
        destinationReached = true;
      }

      // Extract hop latencies
      const latencies = Array.from(hopContent.matchAll(/([\d.]+)\s*ms/gi)).map((m) => parseFloat(m[1]));
      if (latencies.length > 0) {
        const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
        hopLatencies.push(avg);
      }
    }

    if (/Trace complete/i.test(trimmed) || /destination reached/i.test(trimmed)) {
      destinationReached = true;
    }
  }

  const hasTraceSignatures = /(?:Tracing\s+route|traceroute\s+to|tracepath|Trace\s+complete|maximum\s+of\s+\d+\s+hops|hops\s+max)/i.test(text) || totalHops > 0;

  if (!hasTraceSignatures && totalHops === 0) {
    return {
      totalHops: 0,
      destinationReached: false,
      hopLatencies: [],
      isHop1Timeout: false,
      isValidOutput: false
    };
  }

  let errorSignature: string | undefined;
  if (isHop1Timeout) {
    errorSignature = 'Hop 1 (Local Router / Gateway) is not responding';
  } else if (failingHop) {
    errorSignature = `Intermediate packet drop detected at Hop ${failingHop}`;
  }

  return {
    totalHops,
    destinationReached,
    failingHop,
    hopLatencies,
    isHop1Timeout,
    errorSignature,
    isValidOutput: true
  };
}
