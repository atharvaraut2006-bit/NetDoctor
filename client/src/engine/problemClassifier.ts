/**
 * NetDoctor — Natural Language Problem Classifier
 * Master deterministic classification engine for the 11 MVP categories
 */

import { normalizeInput } from './normalizer';
import { validateNetworkingRelevance } from './relevanceValidator';
import { MVP_CATEGORIES } from './categories';
import { checkVagueQuery } from './vagueDetector';
import type { ClassificationResult, ProblemCategoryKey } from './types';

export function classifyProblem(rawInput: string): ClassificationResult {
  // 1. Text Normalization & Typo Correction
  const normalizedData = normalizeInput(rawInput);
  const { normalized, tokens, correctedTokens, networkingTokens } = normalizedData;

  // 2. Networking Relevance Validation
  const relevance = validateNetworkingRelevance(normalizedData);
  if (!relevance.isNetworking) {
    return {
      isNetworkingRelated: false,
      rejectionReason: relevance.rejectionReason,
      suggestedPrompt: 'Describe a network-related issue such as Wi-Fi dropping, high ping in games, slow download speeds, or DNS errors.',
      normalizedText: normalized,
      correctedTokens,
      detectedConcepts: networkingTokens,
      isVague: false,
      explanation: {
        matchedKeywords: [],
        matchedPhrases: [],
        relevanceSignals: relevance.matchedPositiveIndicators,
        categoryScores: {}
      }
    };
  }

  // 3. Category Scoring Pipeline
  const categoryScores: Record<ProblemCategoryKey, number> = {
    internet_not_working: 0,
    wifi_connection: 0,
    slow_internet: 0,
    high_latency: 0,
    packet_loss: 0,
    dns_problem: 0,
    ip_dhcp_problem: 0,
    router_connectivity: 0,
    network_adapter: 0,
    website_connectivity: 0,
    lan_connectivity: 0
  };

  const matchedPhrases: string[] = [];
  const matchedKeywords: string[] = [];

  for (const [catKey, catDef] of Object.entries(MVP_CATEGORIES) as Array<[ProblemCategoryKey, typeof MVP_CATEGORIES[ProblemCategoryKey]]>) {
    // A. Phrase matching (Weight: 15)
    for (const phrase of catDef.keyPhrases) {
      if (normalized.includes(phrase)) {
        categoryScores[catKey] += 15;
        matchedPhrases.push(`${catKey}: "${phrase}"`);
      }
    }

    // B. Primary keyword matching (Weight: 10)
    for (const keyword of catDef.primaryKeywords) {
      if (tokens.includes(keyword) || normalized.includes(keyword)) {
        categoryScores[catKey] += 10;
        matchedKeywords.push(`${catKey}: "${keyword}"`);
      }
    }

    // C. Secondary keyword matching (Weight: 4)
    for (const secKey of catDef.secondaryKeywords) {
      if (tokens.includes(secKey) || normalized.includes(secKey)) {
        categoryScores[catKey] += 4;
      }
    }
  }

  // 4. Compound Context Disambiguation Rules (PRD Section 13)
  // Rule A: "wifi connected but no internet / websites won't open" (DNS / Name resolution)
  if (
    normalized.includes('wifi') &&
    (normalized.includes('connected') || normalized.includes('connect')) &&
    (normalized.includes('no internet') ||
      normalized.includes('cant browse') ||
      normalized.includes('wont open') ||
      normalized.includes('will not open') ||
      normalized.includes('cannot browse'))
  ) {
    categoryScores.dns_problem += 45;
  }

  // Rule B: Specific single website mentions
  if (normalized.includes('one website') || normalized.includes('specific website') || normalized.includes('one site')) {
    categoryScores.website_connectivity += 30;
  }

  // Rule C: Adapter / NIC hardware context
  if (normalized.includes('adapter') || normalized.includes('nic') || normalized.includes('network card')) {
    categoryScores.network_adapter += 30;
  }

  // Rule D: Router / Gateway IP numbers
  if (normalized.includes('192.168') || normalized.includes('10.0.0') || normalized.includes('default gateway')) {
    categoryScores.router_connectivity += 30;
  }

  // Rule E: IP / DHCP self-assigned (169.254 / APIPA)
  if (normalized.includes('169.254') || normalized.includes('apipa') || normalized.includes('dhcp') || normalized.includes('ip address')) {
    categoryScores.ip_dhcp_problem += 30;
  }

  // Find category with highest score
  let bestCategory: ProblemCategoryKey = 'internet_not_working';
  let highestScore = -1;

  for (const [catKey, score] of Object.entries(categoryScores) as Array<[ProblemCategoryKey, number]>) {
    if (score > highestScore) {
      highestScore = score;
      bestCategory = catKey;
    }
  }

  if (highestScore === 0) {
    bestCategory = 'internet_not_working';
  }

  // 5. Vague Query Detection
  const vagueCheck = checkVagueQuery(normalized, tokens, bestCategory);

  return {
    isNetworkingRelated: true,
    category: vagueCheck.provisionalCategory || bestCategory,
    categoryDisplayName: MVP_CATEGORIES[vagueCheck.provisionalCategory || bestCategory].displayName,
    normalizedText: normalized,
    correctedTokens,
    detectedConcepts: networkingTokens,
    isVague: vagueCheck.isVague,
    followUpQuestion: vagueCheck.followUpQuestion,
    explanation: {
      matchedKeywords,
      matchedPhrases,
      relevanceSignals: relevance.matchedPositiveIndicators,
      categoryScores
    }
  };
}
