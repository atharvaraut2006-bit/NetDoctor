/**
 * NetDoctor — HTTP / Web Server Output Parser
 * Regex pattern matching for curl -I and web response headers
 */

import type { ParsedHttpResult } from './types';

export function parseHttpOutput(raw: string): ParsedHttpResult {
  const text = raw.trim();
  if (!text) {
    return {
      isSuccess: false,
      isConnectionRefused: false,
      isHostUnresolved: false,
      isValidOutput: false
    };
  }

  const hasHttpSignatures = /(?:HTTP\/(?:1\.[01]|2|3)|curl:|content-type:|server:|failed\s+to\s+connect|connection\s+refused|could\s+not\s+resolve\s+host)/i.test(text);

  // 1. Detect Connection Failures
  const isConnectionRefused =
    /connection refused/i.test(text) ||
    /failed to connect/i.test(text) ||
    /connection timed out/i.test(text);

  const isHostUnresolved =
    /could not resolve host/i.test(text) ||
    /cannot resolve/i.test(text) ||
    /name or service not known/i.test(text);

  // 2. Parse HTTP Status Code
  // HTTP/1.1 200 OK or HTTP/2 200 or HTTP/1.1 404 Not Found
  let httpVersion: string | undefined;
  let statusCode: number | undefined;
  let statusMessage: string | undefined;

  const statusMatch = text.match(/HTTP\/(1\.[01]|2(?:\.0)?|3)\s+(\d{3})(?:\s+([^\r\n]+))?/i);
  if (statusMatch) {
    httpVersion = `HTTP/${statusMatch[1]}`;
    statusCode = parseInt(statusMatch[2], 10);
    statusMessage = statusMatch[3]?.trim() || '';
  }

  if (!hasHttpSignatures && statusCode === undefined && !isConnectionRefused && !isHostUnresolved) {
    return {
      isSuccess: false,
      isConnectionRefused: false,
      isHostUnresolved: false,
      isValidOutput: false
    };
  }

  const isSuccess = statusCode !== undefined && statusCode >= 200 && statusCode < 400;

  return {
    httpVersion,
    statusCode,
    statusMessage,
    isSuccess,
    isConnectionRefused,
    isHostUnresolved,
    isValidOutput: true
  };
}
