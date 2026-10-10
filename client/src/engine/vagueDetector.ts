/**
 * NetDoctor — Vague Problem Detector & Targeted Follow-Up Manager
 * Identifies insufficient descriptions and triggers single targeted follow-up questions
 */

import type { FollowUpQuestion, ProblemCategoryKey } from './types';

interface VagueCheckResult {
  isVague: boolean;
  followUpQuestion?: FollowUpQuestion;
  provisionalCategory?: ProblemCategoryKey;
}

const SPECIFIC_SYMPTOM_KEYWORDS = [
  'disconnecting', 'disconnects', 'drops', 'dropping', 'slow', 'speed',
  'ping', 'latency', 'lag', 'packet', 'loss', 'ip', 'dhcp', 'apipa', '169.254',
  'router', 'gateway', '192.168', 'adapter', 'nic', 'lan', 'share', 'dns'
];

const VAGUE_PATTERNS = [
  'internet not working',
  'internet isn t working',
  'my internet is not working',
  'my internet isn t working',
  'internet is not working',
  'network problem',
  'my net is gone',
  'net is gone',
  'wifi problem',
  'something is wrong with my internet',
  'something wrong with network',
  'no internet',
  'connection problem',
  'internet down',
  'internet broken',
  'cant browse',
  'cannot browse',
  'offline'
];

export const DEVICE_SCOPE_FOLLOW_UP: FollowUpQuestion = {
  id: 'device_scope_question',
  question: 'Is the problem occurring on only one device or all devices on your network?',
  whyNeeded: 'This determines whether the fault is isolated to your computer (adapter/IP/DNS) or affects the whole network (router/ISP line).',
  options: [
    {
      id: 'single_device',
      label: 'Only on this device',
      description: 'Other phones, tablets, or laptops in the house/office are connecting fine.'
    },
    {
      id: 'all_devices',
      label: 'On all devices on the network',
      description: 'Every device connected to the router has lost internet access.'
    },
    {
      id: 'not_sure',
      label: 'Not sure / Only have one device',
      description: 'Troubleshoot this device step-by-step.'
    }
  ]
};

export const WEBSITE_SCOPE_FOLLOW_UP: FollowUpQuestion = {
  id: 'website_scope_question',
  question: 'Are all websites failing to load, or is only one specific website affected?',
  whyNeeded: 'This isolates whether you have a complete connectivity failure or a specific DNS/remote server block.',
  options: [
    {
      id: 'all_websites',
      label: 'All websites & apps fail to load',
      resolvedCategoryModifier: 'internet_not_working'
    },
    {
      id: 'single_website',
      label: 'Only one specific website is blocked/failing',
      resolvedCategoryModifier: 'website_connectivity'
    }
  ]
};

/**
 * Checks if a query is vague and needs a targeted follow-up question
 */
export function checkVagueQuery(normalizedText: string, tokens: string[], detectedCategory: ProblemCategoryKey): VagueCheckResult {
  // If the description contains specific symptoms like "disconnecting", "slow", "ping", "packet loss", "adapter", "dns", it is NOT vague
  const hasSpecificSymptom = tokens.some((token) => SPECIFIC_SYMPTOM_KEYWORDS.includes(token));
  if (hasSpecificSymptom) {
    return { isVague: false };
  }

  // Check if normalized text matches known vague patterns
  const matchesVaguePhrase = VAGUE_PATTERNS.some((pattern) => {
    return normalizedText === pattern || normalizedText.includes(pattern);
  });

  if (matchesVaguePhrase || detectedCategory === 'internet_not_working') {
    return {
      isVague: true,
      followUpQuestion: DEVICE_SCOPE_FOLLOW_UP,
      provisionalCategory: detectedCategory
    };
  }

  return {
    isVague: false
  };
}
