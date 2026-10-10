/**
 * NetDoctor — Command Interpreter Types
 * Schemas for regex output matchers, metric extractors, and plain-language translations
 */

export type OutcomeType =
  | 'SUCCESS'
  | 'FAILURE'
  | 'PARTIAL'
  | 'TIMEOUT'
  | 'UNREACHABLE'
  | 'APIPA'
  | 'DNS_FAIL'
  | 'DISCONNECTED'
  | 'HIGH_LATENCY'
  | 'PACKET_LOSS'
  | 'INVALID_CONFIG'
  | 'UNRECOGNIZED_OUTPUT';

export interface ParsedAdapterInterface {
  name: string;
  adminState: string;
  state: string;
  type?: string;
  isPrimary: boolean;
  isVirtual: boolean;
}

export interface ParsedAdapterResult {
  interfaces: ParsedAdapterInterface[];
  activeAdapterName?: string;
  adminState?: string;
  state?: string;
  isConnected: boolean;
  isDisconnected: boolean;
  isDisabled: boolean;
  isValidOutput: boolean;
  rawSummary?: string;
}

export interface ParsedIpConfig {
  ipv4?: string;
  subnetMask?: string;
  defaultGateway?: string;
  dhcpServer?: string;
  dnsServers?: string[];
  isApipa: boolean;
  isDisconnected: boolean;
  isValidOutput: boolean;
  adapterName?: string;
}

export interface ParsedPingStats {
  destination?: string;
  packetsSent: number;
  packetsReceived: number;
  packetsLost: number;
  lossPercentage: number;
  packetLossPercent?: number;
  minRtt?: number;
  maxRtt?: number;
  avgRtt?: number;
  ttl?: number;
  errorSignature?: string;
  isTimeout: boolean;
  isUnreachable: boolean;
  isGeneralFailure: boolean;
  isIntermittentLoss?: boolean;
  isValidOutput: boolean;
}

export interface ParsedDnsResult {
  server?: string;
  serverAddress?: string;
  resolvedName?: string;
  ipAddresses: string[];
  isTimeout: boolean;
  isNxDomain: boolean;
  isServerFailure: boolean;
  isValidOutput: boolean;
  errorSignature?: string;
}

export interface ParsedTraceResult {
  totalHops: number;
  destinationReached: boolean;
  failingHop?: number;
  hopLatencies: number[];
  isHop1Timeout: boolean;
  isValidOutput: boolean;
  errorSignature?: string;
}

export interface ParsedWifiState {
  state?: string;
  ssid?: string;
  signalPercentage?: number;
  radioType?: string;
  receiveRate?: number;
  isWeakSignal: boolean;
  isDisconnected: boolean;
  isValidOutput: boolean;
}

export interface ParsedHttpResult {
  httpVersion?: string;
  statusCode?: number;
  statusMessage?: string;
  isSuccess: boolean;
  isConnectionRefused: boolean;
  isHostUnresolved: boolean;
  isValidOutput: boolean;
}

export interface InterpreterResult {
  stepId: string;
  outcomeType: OutcomeType;
  isPassed: boolean;
  summary: string;
  plainLanguageExplanation: string;
  technicalDetails: string;
  extractedMetrics: Record<string, any>;
  rootCauseId?: string;
}
