/**
 * NetDoctor — Text Normalizer & Typo Tolerance Engine
 * Deterministic text cleaning, tokenization, and Levenshtein fuzzy matching
 */

import { KNOWN_TYPOS_MAP, NETWORKING_LEXICON } from './dictionary';

export interface NormalizationResult {
  raw: string;
  normalized: string;
  tokens: string[];
  correctedTokens: Array<{ original: string; corrected: string }>;
  networkingTokens: string[];
}

/**
 * Computes the Levenshtein distance between two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Normalizes input string and performs typo correction
 */
export function normalizeInput(rawInput: string): NormalizationResult {
  if (!rawInput) {
    return {
      raw: '',
      normalized: '',
      tokens: [],
      correctedTokens: [],
      networkingTokens: []
    };
  }

  // 1. Lowercase and basic punctuation cleanup (preserve words, hyphens, alphanumeric)
  const cleanStr = rawInput
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 2. Tokenize
  const rawTokens = cleanStr.split(' ').filter((t) => t.length > 0);
  const correctedTokens: Array<{ original: string; corrected: string }> = [];
  const processedTokens: string[] = [];
  const networkingTokens: string[] = [];

  for (const token of rawTokens) {
    // Check known exact typo mapping first
    if (KNOWN_TYPOS_MAP[token]) {
      const corrected = KNOWN_TYPOS_MAP[token];
      correctedTokens.push({ original: token, corrected });
      processedTokens.push(corrected);
      networkingTokens.push(corrected);
      continue;
    }

    // Check direct match in networking lexicon
    if (NETWORKING_LEXICON.includes(token)) {
      processedTokens.push(token);
      networkingTokens.push(token);
      continue;
    }

    // Check fuzzy match against networking lexicon for words >= 4 chars
    let fuzzyMatchFound = false;
    if (token.length >= 4) {
      for (const lex of NETWORKING_LEXICON) {
        const dist = levenshteinDistance(token, lex);
        // Distance 1 for 4-6 char words, distance <= 2 for 7+ char words
        const maxDist = token.length <= 6 ? 1 : 2;
        if (dist <= maxDist && Math.abs(token.length - lex.length) <= 1) {
          correctedTokens.push({ original: token, corrected: lex });
          processedTokens.push(lex);
          networkingTokens.push(lex);
          fuzzyMatchFound = true;
          break;
        }
      }
    }

    if (!fuzzyMatchFound) {
      processedTokens.push(token);
    }
  }

  const normalized = processedTokens.join(' ');

  return {
    raw: rawInput,
    normalized,
    tokens: processedTokens,
    correctedTokens,
    networkingTokens
  };
}
