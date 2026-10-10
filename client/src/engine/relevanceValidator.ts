/**
 * NetDoctor — Networking Relevance Validator
 * Differentiates genuine networking issues from unrelated non-networking requests
 */

import { NON_NETWORKING_INDICATORS } from './dictionary';
import type { NormalizationResult } from './normalizer';

export interface RelevanceCheckResult {
  isNetworking: boolean;
  rejectionReason?: string;
  matchedNegativeIndicators: string[];
  matchedPositiveIndicators: string[];
}

const STRONG_NETWORKING_KEYWORDS = [
  'wifi', 'wireless', 'internet', 'network', 'router', 'gateway', 'dns', 'ip',
  'dhcp', 'ping', 'latency', 'lag', 'packet', 'loss', 'adapter', 'ethernet',
  'lan', 'wan', 'modem', 'broadband', 'offline', 'disconnect', 'disconnecting',
  'website', 'websites', 'browse', 'browsing', 'load', 'loading', 'url', 'domain',
  'speed', 'slow', 'bandwidth', 'timeout', 'unreachable', 'net'
];

export function validateNetworkingRelevance(normalizedData: NormalizationResult): RelevanceCheckResult {
  const { normalized, tokens, networkingTokens } = normalizedData;

  const matchedNegative: string[] = [];
  const matchedPositive: string[] = [];

  // Check for non-networking negative indicators
  for (const indicator of NON_NETWORKING_INDICATORS) {
    if (indicator.includes(' ')) {
      if (normalized.includes(indicator)) {
        matchedNegative.push(indicator);
      }
    } else {
      if (tokens.includes(indicator)) {
        matchedNegative.push(indicator);
      }
    }
  }

  // Check for positive networking signals
  for (const keyword of STRONG_NETWORKING_KEYWORDS) {
    if (tokens.includes(keyword) || normalized.includes(keyword)) {
      matchedPositive.push(keyword);
    }
  }

  // Also include any fuzzy corrected networking tokens
  for (const netToken of networkingTokens) {
    if (!matchedPositive.includes(netToken)) {
      matchedPositive.push(netToken);
    }
  }

  // Decision Logic:
  // 1. If positive networking indicators exist and no strong negative indicators exist -> Valid
  if (matchedPositive.length > 0 && matchedNegative.length === 0) {
    return {
      isNetworking: true,
      matchedNegativeIndicators: [],
      matchedPositiveIndicators: matchedPositive
    };
  }

  // 2. If negative indicators exist without overwhelming networking context -> Reject
  if (matchedNegative.length > 0 && matchedPositive.length <= 1) {
    return {
      isNetworking: false,
      rejectionReason: 'This problem does not appear to be related to networking. Please describe a network-related issue such as Wi-Fi connectivity, Internet access, DNS, latency, or packet loss.',
      matchedNegativeIndicators: matchedNegative,
      matchedPositiveIndicators: matchedPositive
    };
  }

  // 3. If zero networking tokens detected in the query -> Reject
  if (matchedPositive.length === 0) {
    return {
      isNetworking: false,
      rejectionReason: 'This problem does not appear to be related to networking. Please describe a network-related issue such as Wi-Fi connectivity, Internet access, DNS, latency, or packet loss.',
      matchedNegativeIndicators: matchedNegative,
      matchedPositiveIndicators: []
    };
  }

  // Fallback: Positive indicators outweigh negative
  return {
    isNetworking: true,
    matchedNegativeIndicators: matchedNegative,
    matchedPositiveIndicators: matchedPositive
  };
}
