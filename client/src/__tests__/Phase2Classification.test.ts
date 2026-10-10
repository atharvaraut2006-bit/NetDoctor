import { describe, it, expect } from 'vitest';
import {
  classifyProblem,
  normalizeInput,
  validateNetworkingRelevance,
  createValidatedProblemContext
} from '../engine';

describe('NetDoctor Phase 2 — Problem Detection & Validation Engine', () => {

  describe('1. Text Normalization & Typo Tolerance', () => {
    it('normalizes uppercase, spacing, and punctuation', () => {
      const result = normalizeInput('  WIFI  IS   NOT WORKING!!  ');
      expect(result.normalized).toBe('wifi is not working');
      expect(result.tokens).toEqual(['wifi', 'is', 'not', 'working']);
    });

    it('corrects known typos to standard networking terms', () => {
      const typos = [
        { input: 'wifi keeps disconecting', expected: 'wifi keeps disconnecting' },
        { input: 'internat not working', expected: 'internet not working' },
        { input: 'pign is high', expected: 'ping is high' },
        { input: 'DNS not workng', expected: 'dns not working' },
        { input: 'wierless keeps dropping', expected: 'wireless keeps dropping' }
      ];

      for (const item of typos) {
        const result = normalizeInput(item.input);
        expect(result.normalized).toBe(item.expected);
      }
    });
  });

  describe('2. Networking Relevance Validation', () => {
    it('accepts valid networking problems', () => {
      const validProblems = [
        'My internet is not working.',
        'WiFi keeps disconnecting.',
        'wifi keeps disconecting',
        'My ping is very high.',
        'The internet is extremely slow.',
        'I am getting packet loss.',
        'DNS is not working.',
        "My computer isn't getting an IP address.",
        'I cannot reach my router.',
        "My network adapter isn't working.",
        "One website won't open.",
        'I cannot connect to another computer on my LAN.'
      ];

      for (const query of validProblems) {
        const normalized = normalizeInput(query);
        const relevance = validateNetworkingRelevance(normalized);
        expect(relevance.isNetworking).toBe(true);
      }
    });

    it('rejects clearly non-networking queries', () => {
      const nonNetworkingQueries = [
        'My Java code has an error.',
        'My laptop battery is draining.',
        'How do I cook pasta?',
        'Why is my printer out of ink?'
      ];

      for (const query of nonNetworkingQueries) {
        const result = classifyProblem(query);
        expect(result.isNetworkingRelated).toBe(false);
        expect(result.rejectionReason).toContain('This problem does not appear to be related to networking');
      }
    });
  });

  describe('3. Classification of 11 Supported MVP Problem Categories', () => {
    const testMatrix: Array<{ query: string; expectedCategory: string }> = [
      { query: 'My internet is down and completely offline', expectedCategory: 'internet_not_working' },
      { query: 'WiFi keeps disconnecting from my access point', expectedCategory: 'wifi_connection' },
      { query: 'The internet speed is extremely slow and buffering', expectedCategory: 'slow_internet' },
      { query: 'My ping is very high and gaming lag is bad', expectedCategory: 'high_latency' },
      { query: 'I am getting 20% packet loss in Discord calls', expectedCategory: 'packet_loss' },
      { query: 'DNS lookup failed and cannot resolve domain', expectedCategory: 'dns_problem' },
      { query: "My computer isn't getting an IP address from DHCP (169.254)", expectedCategory: 'ip_dhcp_problem' },
      { query: 'I cannot reach my router gateway at 192.168.1.1', expectedCategory: 'router_connectivity' },
      { query: "My network adapter isn't working or recognized", expectedCategory: 'network_adapter' },
      { query: "One specific website won't open but others work", expectedCategory: 'website_connectivity' },
      { query: 'I cannot connect to another computer on my LAN', expectedCategory: 'lan_connectivity' }
    ];

    for (const testCase of testMatrix) {
      it(`correctly classifies "${testCase.query}" into "${testCase.expectedCategory}"`, () => {
        const result = classifyProblem(testCase.query);
        expect(result.isNetworkingRelated).toBe(true);
        expect(result.category).toBe(testCase.expectedCategory);
      });
    }
  });

  describe('4. Vague Query Detection & Targeted Follow-Up', () => {
    const vagueQueries = [
      "My internet isn't working.",
      'Network problem.',
      'My net is gone.',
      'WiFi problem.',
      'Something is wrong with my internet.'
    ];

    for (const query of vagueQueries) {
      it(`detects vague query: "${query}" and provides a targeted follow-up question`, () => {
        const result = classifyProblem(query);
        expect(result.isNetworkingRelated).toBe(true);
        expect(result.isVague).toBe(true);
        expect(result.followUpQuestion).toBeDefined();
        expect(result.followUpQuestion?.question).toContain('Is the problem occurring on only one device or all devices');
        expect(result.followUpQuestion?.options.length).toBeGreaterThanOrEqual(2);
      });
    }
  });

  describe('5. Validated Problem Context Generation (Phase 3 Handoff)', () => {
    it('builds structured context package with OS and follow-up answer', () => {
      const raw = 'wifi keeps disconecting';
      const classification = classifyProblem(raw);

      const context = createValidatedProblemContext({
        rawInput: raw,
        classification,
        selectedOS: 'windows',
        followUpAnswer: {
          id: 'single_device',
          label: 'Only on this device'
        }
      });

      expect(context.originalDescription).toBe('wifi keeps disconecting');
      expect(context.normalizedDescription).toBe('wifi keeps disconnecting');
      expect(context.category).toBe('wifi_connection');
      expect(context.categoryDisplayName).toBe('Wi-Fi Connection Problems');
      expect(context.operatingSystem).toBe('windows');
      expect(context.isOSSupported).toBe(true);
      expect(context.followUpAnswer).toBe('single_device');
      expect(context.contextSummary).toContain('Wi-Fi Connection Problems');
    });

    it('correctly handles OS "other" without crash', () => {
      const raw = 'DNS is not working';
      const classification = classifyProblem(raw);

      const context = createValidatedProblemContext({
        rawInput: raw,
        classification,
        selectedOS: 'other'
      });

      expect(context.operatingSystem).toBe('other');
      expect(context.isOSSupported).toBe(false);
      expect(context.category).toBe('dns_problem');
    });
  });

  describe('6. Disambiguation and Context Priority', () => {
    it('correctly disambiguates "wifi is connected but websites will not open" into DNS / Internet issue', () => {
      const result = classifyProblem('wifi is connected but websites will not open');
      expect(result.isNetworkingRelated).toBe(true);
      expect(result.category).not.toBe('wifi_connection'); // Not a physical WiFi drop
      expect(result.category).toBe('dns_problem');
    });
  });

});
