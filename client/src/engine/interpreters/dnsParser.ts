/**
 * NetDoctor — DNS Output Parser
 * Regex pattern matching for nslookup, dig, and host commands
 */

import type { ParsedDnsResult } from './types';

export function parseDnsOutput(raw: string): ParsedDnsResult {
  const text = raw.trim();
  if (!text) {
    return {
      ipAddresses: [],
      isTimeout: false,
      isNxDomain: false,
      isServerFailure: false,
      isValidOutput: false
    };
  }

  const hasDnsSignatures = /(?:Server:|Address:|Addresses:|Non-authoritative\s+answer:|ANSWER\s+SECTION:|Name:\s+|DNS\s+request\s+timed\s+out|Non-existent\s+domain|NXDOMAIN|SERVFAIL|Server\s+failed|Query\s+refused|REFUSED|has\s+address|points\s+to)/i.test(text);

  // 1. Detect DNS Failure Signatures
  const isTimeout =
    /DNS request timed out/i.test(text) ||
    /connection timed out/i.test(text) ||
    /timed out/i.test(text) ||
    /no servers could be reached/i.test(text);

  const isNxDomain =
    /Non-existent domain/i.test(text) ||
    /NXDOMAIN/i.test(text) ||
    /Can't find [^:]+:\s*Non-existent domain/i.test(text) ||
    /Host [^\s]+ not found/i.test(text) ||
    /status:\s*NXDOMAIN/i.test(text);

  const isServerFailure =
    /Server failed/i.test(text) ||
    /SERVFAIL/i.test(text) ||
    /Query refused/i.test(text) ||
    /REFUSED/i.test(text) ||
    /No response from server/i.test(text) ||
    /status:\s*SERVFAIL/i.test(text);

  // 2. Parse DNS Server Name and Address
  let server: string | undefined;
  let serverAddress: string | undefined;

  const serverMatch = text.match(/Server:\s*([^\r\n]+)/i) || text.match(/SERVER:\s*([^\r\n()]+)/i);
  if (serverMatch && serverMatch[1]) {
    server = serverMatch[1].trim();
  }

  const addrMatch = text.match(/Address:\s*([\d.]+)/i) || text.match(/SERVER:\s*[\d.]+#\d+\(([\d.]+)\)/i);
  if (addrMatch && addrMatch[1]) {
    serverAddress = addrMatch[1].trim();
  }

  // 3. Parse Resolved Domain Name
  let resolvedName: string | undefined;
  const nameMatch = text.match(/Name:\s*([^\r\n\s]+)/i);
  if (nameMatch && nameMatch[1]) {
    resolvedName = nameMatch[1].trim();
  }

  // 4. Parse Resolved IP Addresses (A / AAAA records)
  const ipAddresses: string[] = [];

  // Match Windows nslookup "Addresses: 142.250.190.46, ..." or "Address: 142.250.190.46" after Name
  const lines = text.split('\n');
  let isAnswerSection = false;

  for (const line of lines) {
    if (/Non-authoritative answer:|ANSWER SECTION:|Addresses?:/i.test(line)) {
      isAnswerSection = true;
    }

    if (isAnswerSection) {
      // Find IPv4 addresses in answer section (excluding the DNS server's address)
      const ips = line.match(/\b(?!(?:127\.0\.0\.1|0\.0\.0\.0))\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g);
      if (ips) {
        for (const ip of ips) {
          if (ip !== serverAddress && !ipAddresses.includes(ip)) {
            ipAddresses.push(ip);
          }
        }
      }
    }
  }

  // If no answer section header found, collect non-server IPs
  if (ipAddresses.length === 0 && !isTimeout && !isNxDomain && !isServerFailure && hasDnsSignatures) {
    const allIps = text.match(/\b(?!(?:127\.0\.0\.1|0\.0\.0\.0))\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g) || [];
    for (const ip of allIps) {
      if (ip !== serverAddress && !ipAddresses.includes(ip)) {
        ipAddresses.push(ip);
      }
    }
  }

  if (!hasDnsSignatures && ipAddresses.length === 0 && !isTimeout && !isNxDomain && !isServerFailure) {
    return {
      ipAddresses: [],
      isTimeout: false,
      isNxDomain: false,
      isServerFailure: false,
      isValidOutput: false
    };
  }

  // 5. Determine Error Signature
  let errorSignature: string | undefined;
  if (isTimeout) {
    errorSignature = 'DNS server query timed out (no response received)';
  } else if (isNxDomain) {
    errorSignature = 'Domain does not exist (NXDOMAIN)';
  } else if (isServerFailure) {
    errorSignature = 'DNS server returned SERVFAIL / query refused';
  } else if (ipAddresses.length === 0) {
    errorSignature = 'No IP address records returned by DNS resolver';
  }

  return {
    server,
    serverAddress,
    resolvedName,
    ipAddresses,
    isTimeout,
    isNxDomain,
    isServerFailure,
    errorSignature,
    isValidOutput: true
  };
}
