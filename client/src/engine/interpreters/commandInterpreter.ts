/**
 * NetDoctor — Master Command Interpreter
 * Coordinates regex parsers, metric extraction, plain-language translation, and root-cause mapping
 */

import type { OperatingSystem, QuickResultOption } from '../../types/diagnostic';
import type { InterpreterResult, OutcomeType } from './types';
import { parseAdapterOutput } from './adapterParser';
import { parseIpConfigOutput } from './ipConfigParser';
import { parsePingOutput } from './pingParser';
import { parseDnsOutput } from './dnsParser';
import { parseTraceOutput } from './traceParser';
import { parseWifiOutput } from './wifiParser';
import { parseHttpOutput } from './httpParser';
import { translateOutcomeToPlainLanguage } from './plainLanguageTranslator';
import { DIAGNOSTIC_STEPS_LIBRARY } from '../../knowledge/steps';

/**
 * Interpret raw terminal output pasted by the user for a specific diagnostic step
 */
export function interpretCommandOutput(
  stepId: string,
  _os: OperatingSystem,
  rawOutput: string
): InterpreterResult {
  const text = rawOutput.trim();
  const stepDef = DIAGNOSTIC_STEPS_LIBRARY[stepId];

  let outcomeType: OutcomeType = 'SUCCESS';
  let isPassed = true;
  let extractedMetrics: Record<string, any> = {};

  switch (stepId) {
    case 'step_network_adapter': {
      const parsed = parseAdapterOutput(text);
      extractedMetrics = parsed;
      if (!parsed.isValidOutput) {
        outcomeType = 'UNRECOGNIZED_OUTPUT';
        isPassed = false;
      } else if (!parsed.isConnected || parsed.isDisconnected || parsed.isDisabled) {
        outcomeType = 'DISCONNECTED';
        isPassed = false;
      } else {
        outcomeType = 'SUCCESS';
        isPassed = true;
      }
      break;
    }

    case 'step_ip_dhcp': {
      const parsed = parseIpConfigOutput(text);
      extractedMetrics = parsed;
      if (!parsed.isValidOutput) {
        outcomeType = 'UNRECOGNIZED_OUTPUT';
        isPassed = false;
      } else if (parsed.isApipa) {
        outcomeType = 'APIPA';
        isPassed = false;
      } else if (parsed.isDisconnected) {
        outcomeType = 'DISCONNECTED';
        isPassed = false;
      } else if (parsed.ipv4 && !parsed.isApipa) {
        outcomeType = 'SUCCESS';
        isPassed = true;
      } else {
        outcomeType = 'INVALID_CONFIG';
        isPassed = false;
      }
      break;
    }

    case 'step_gateway_ping':
    case 'step_internet_ping':
    case 'step_ping_latency_jitter':
    case 'step_lan_peer_ping': {
      const parsed = parsePingOutput(text);
      extractedMetrics = parsed;
      if (!parsed.isValidOutput) {
        outcomeType = 'UNRECOGNIZED_OUTPUT';
        isPassed = false;
      } else if (parsed.isGeneralFailure) {
        outcomeType = 'FAILURE';
        isPassed = false;
      } else if (parsed.isUnreachable) {
        outcomeType = 'UNREACHABLE';
        isPassed = false;
      } else if (parsed.isTimeout || parsed.lossPercentage === 100 || (parsed.packetsSent > 0 && parsed.packetsReceived === 0)) {
        outcomeType = 'TIMEOUT';
        isPassed = false;
      } else if (parsed.lossPercentage > 0) {
        outcomeType = 'PACKET_LOSS';
        isPassed = false;
      } else if (stepId === 'step_ping_latency_jitter' && parsed.avgRtt && parsed.avgRtt > 120) {
        outcomeType = 'HIGH_LATENCY';
        isPassed = true; // Received replies, but elevated latency
      } else {
        outcomeType = 'SUCCESS';
        isPassed = true;
      }
      break;
    }

    case 'step_dns_lookup': {
      const parsed = parseDnsOutput(text);
      extractedMetrics = parsed;
      if (!parsed.isValidOutput) {
        outcomeType = 'UNRECOGNIZED_OUTPUT';
        isPassed = false;
      } else if (parsed.isTimeout) {
        outcomeType = 'TIMEOUT';
        isPassed = false;
      } else if (parsed.isNxDomain || parsed.isServerFailure || parsed.ipAddresses.length === 0) {
        outcomeType = 'DNS_FAIL';
        isPassed = false;
      } else {
        outcomeType = 'SUCCESS';
        isPassed = true;
      }
      break;
    }

    case 'step_wifi_signal': {
      const parsed = parseWifiOutput(text);
      extractedMetrics = parsed;
      if (!parsed.isValidOutput) {
        outcomeType = 'UNRECOGNIZED_OUTPUT';
        isPassed = false;
      } else if (parsed.isDisconnected) {
        outcomeType = 'DISCONNECTED';
        isPassed = false;
      } else if (parsed.isWeakSignal) {
        outcomeType = 'PARTIAL';
        isPassed = false;
      } else {
        outcomeType = 'SUCCESS';
        isPassed = true;
      }
      break;
    }

    case 'step_trace_route': {
      const parsed = parseTraceOutput(text);
      extractedMetrics = parsed;
      if (!parsed.isValidOutput) {
        outcomeType = 'UNRECOGNIZED_OUTPUT';
        isPassed = false;
      } else if (parsed.isHop1Timeout) {
        outcomeType = 'TIMEOUT';
        isPassed = false;
      } else if (parsed.failingHop) {
        outcomeType = 'PARTIAL';
        isPassed = false;
      } else {
        outcomeType = 'SUCCESS';
        isPassed = true;
      }
      break;
    }

    case 'step_http_reachability': {
      const parsed = parseHttpOutput(text);
      extractedMetrics = parsed;
      if (!parsed.isValidOutput) {
        outcomeType = 'UNRECOGNIZED_OUTPUT';
        isPassed = false;
      } else if (parsed.isConnectionRefused || parsed.isHostUnresolved) {
        outcomeType = 'FAILURE';
        isPassed = false;
      } else if (parsed.statusCode && parsed.statusCode >= 400) {
        outcomeType = 'FAILURE';
        isPassed = false;
      } else {
        outcomeType = 'SUCCESS';
        isPassed = true;
      }
      break;
    }

    case 'step_dns_flush': {
      outcomeType = 'SUCCESS';
      isPassed = true;
      extractedMetrics = { flushed: true };
      break;
    }

    case 'step_ip_release_renew': {
      const parsed = parseIpConfigOutput(text);
      extractedMetrics = parsed;
      if (!parsed.isValidOutput) {
        outcomeType = 'UNRECOGNIZED_OUTPUT';
        isPassed = false;
      } else if (parsed.isApipa) {
        outcomeType = 'APIPA';
        isPassed = false;
      } else {
        outcomeType = 'SUCCESS';
        isPassed = true;
      }
      break;
    }

    default: {
      // Generic fallback
      const hasErrors = /error|failed|timeout|timed out|unreachable/i.test(text);
      outcomeType = hasErrors ? 'FAILURE' : 'SUCCESS';
      isPassed = !hasErrors;
      extractedMetrics = { rawTextLength: text.length };
      break;
    }
  }

  const { summary, plainLanguageExplanation, technicalDetails } = translateOutcomeToPlainLanguage({
    stepId,
    outcomeType,
    metrics: extractedMetrics
  });

  const rootCauseId = !isPassed && outcomeType !== 'UNRECOGNIZED_OUTPUT' ? stepDef?.rootCauseIdOnFailure : undefined;

  return {
    stepId,
    outcomeType,
    isPassed,
    summary,
    plainLanguageExplanation,
    technicalDetails,
    extractedMetrics,
    rootCauseId
  };
}

/**
 * Interpret a Quick Outcome selection ([Worked], [Failed], [Different])
 */
export function interpretQuickOption(
  stepId: string,
  option: QuickResultOption
): InterpreterResult {
  const stepDef = DIAGNOSTIC_STEPS_LIBRARY[stepId];

  let outcomeType: OutcomeType = 'SUCCESS';
  let isPassed = true;
  let summary = '';
  let plainLanguageExplanation = '';
  let technicalDetails = '';

  if (option === 'SUCCESS') {
    outcomeType = 'SUCCESS';
    isPassed = true;
    summary = `${stepDef?.title || 'Diagnostic test'} passed`;
    plainLanguageExplanation =
      'The diagnostic command completed as expected with no detected errors. Parameters match normal operating values.';
    technicalDetails = 'User confirmed command executed cleanly matching expected sample output.';
  } else if (option === 'FAILURE') {
    outcomeType = 'FAILURE';
    isPassed = false;
    summary = `${stepDef?.title || 'Diagnostic test'} failed or timed out`;
    plainLanguageExplanation =
      'The command encountered an error, request timeout, or unreachable response. The diagnostic engine will isolate the root cause.';
    technicalDetails = 'User confirmed test failed, timed out, or returned error messages.';
  } else {
    outcomeType = 'PARTIAL';
    isPassed = false;
    summary = `${stepDef?.title || 'Diagnostic test'} produced inconclusive results`;
    plainLanguageExplanation =
      'The command returned partial or unexpected output. Further verification steps will confirm the network status.';
    technicalDetails = 'User indicated different or inconclusive command output.';
  }

  const rootCauseId = !isPassed ? stepDef?.rootCauseIdOnFailure : undefined;

  return {
    stepId,
    outcomeType,
    isPassed,
    summary,
    plainLanguageExplanation,
    technicalDetails,
    extractedMetrics: { optionSelected: option },
    rootCauseId
  };
}
