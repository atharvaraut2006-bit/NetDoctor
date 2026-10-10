import { describe, it, expect } from 'vitest';
import {
  DIAGNOSTIC_STEPS_LIBRARY,
  CATEGORY_ROADMAPS,
  ROOT_CAUSES_LIBRARY,
  ALL_PROCEDURES,
  getProcedure,
  internetNotWorkingProcedure,
  wifiConnectionProcedure,
  slowInternetProcedure,
  highLatencyProcedure,
  packetLossProcedure,
  dnsProblemProcedure,
  ipDhcpProblemProcedure,
  routerConnectivityProcedure,
  networkAdapterProcedure,
  websiteConnectivityProcedure,
  lanConnectivityProcedure
} from '../knowledge';
import { MVP_CATEGORIES } from '../engine/categories';
import type { ProblemCategoryKey } from '../engine/types';

describe('Phase 3 — Knowledge Base Integrity & Schema Validation', () => {
  describe('Curated Diagnostic Steps Library (13 Steps)', () => {
    const stepIds = Object.keys(DIAGNOSTIC_STEPS_LIBRARY);

    it('contains all 13 required diagnostic procedures', () => {
      expect(stepIds.length).toBe(13);
      expect(stepIds).toContain('step_network_adapter');
      expect(stepIds).toContain('step_ip_dhcp');
      expect(stepIds).toContain('step_gateway_ping');
      expect(stepIds).toContain('step_dns_lookup');
      expect(stepIds).toContain('step_internet_ping');
      expect(stepIds).toContain('step_wifi_signal');
      expect(stepIds).toContain('step_ping_latency_jitter');
      expect(stepIds).toContain('step_trace_route');
      expect(stepIds).toContain('step_dns_flush');
      expect(stepIds).toContain('step_ip_release_renew');
      expect(stepIds).toContain('step_http_reachability');
      expect(stepIds).toContain('step_lan_peer_ping');
      expect(stepIds).toContain('step_adapter_restart');
    });

    it('every diagnostic step defines complete multi-OS commands and instructions', () => {
      for (const stepId of stepIds) {
        const step = DIAGNOSTIC_STEPS_LIBRARY[stepId];
        expect(step.id).toBe(stepId);
        expect(step.title.trim().length).toBeGreaterThan(5);
        expect(step.layer).toBeDefined();
        expect(step.whyNeeded.trim().length).toBeGreaterThan(15);
        expect(step.detailedWhy.trim().length).toBeGreaterThan(25);

        // Check Windows, macOS, Linux commands
        expect(step.command.windows.trim().length).toBeGreaterThan(0);
        expect(step.command.macos.trim().length).toBeGreaterThan(0);
        expect(step.command.linux.trim().length).toBeGreaterThan(0);

        // Check Windows, macOS, Linux instructions
        expect(step.instructions.windows.length).toBeGreaterThanOrEqual(3);
        expect(step.instructions.macos.length).toBeGreaterThanOrEqual(3);
        expect(step.instructions.linux.length).toBeGreaterThanOrEqual(3);

        // Check expected results
        expect(step.expectedResult.summary.trim().length).toBeGreaterThan(10);
        expect(step.expectedResult.sampleOutput.trim().length).toBeGreaterThan(10);

        // Check root cause reference if present
        if (step.rootCauseIdOnFailure) {
          expect(ROOT_CAUSES_LIBRARY[step.rootCauseIdOnFailure]).toBeDefined();
        }
      }
    });

    it('disruptive steps include clear safety warnings', () => {
      const releaseRenewStep = DIAGNOSTIC_STEPS_LIBRARY.step_ip_release_renew;
      expect(releaseRenewStep.isDisruptive).toBe(true);
      expect(releaseRenewStep.disruptiveWarning).toBeDefined();
      expect(releaseRenewStep.disruptiveWarning?.length).toBeGreaterThan(20);

      const adapterRestartStep = DIAGNOSTIC_STEPS_LIBRARY.step_adapter_restart;
      expect(adapterRestartStep.isDisruptive).toBe(true);
      expect(adapterRestartStep.disruptiveWarning).toBeDefined();
    });
  });

  describe('Modular Diagnostic Procedures (11 Dedicated Category Modules)', () => {
    const allCategoryKeys = Object.keys(MVP_CATEGORIES) as ProblemCategoryKey[];

    it('exports all 11 dedicated category procedures individually and in ALL_PROCEDURES', () => {
      expect(internetNotWorkingProcedure.categoryKey).toBe('internet_not_working');
      expect(wifiConnectionProcedure.categoryKey).toBe('wifi_connection');
      expect(slowInternetProcedure.categoryKey).toBe('slow_internet');
      expect(highLatencyProcedure.categoryKey).toBe('high_latency');
      expect(packetLossProcedure.categoryKey).toBe('packet_loss');
      expect(dnsProblemProcedure.categoryKey).toBe('dns_problem');
      expect(ipDhcpProblemProcedure.categoryKey).toBe('ip_dhcp_problem');
      expect(routerConnectivityProcedure.categoryKey).toBe('router_connectivity');
      expect(networkAdapterProcedure.categoryKey).toBe('network_adapter');
      expect(websiteConnectivityProcedure.categoryKey).toBe('website_connectivity');
      expect(lanConnectivityProcedure.categoryKey).toBe('lan_connectivity');

      expect(Object.keys(ALL_PROCEDURES).length).toBe(11);
    });

    it('getProcedure factory returns the correct procedure for every category and falls back safely', () => {
      for (const catKey of allCategoryKeys) {
        const proc = getProcedure(catKey);
        expect(proc.categoryKey).toBe(catKey);
        expect(proc.displayName).toBe(MVP_CATEGORIES[catKey].displayName);
      }

      // Unknown category fallback
      const fallback = getProcedure('unknown_key' as any);
      expect(fallback.categoryKey).toBe('internet_not_working');
    });

    it('every procedure defines a valid initial step, ordered steps, expected evidence keys, and root causes', () => {
      for (const catKey of allCategoryKeys) {
        const proc = ALL_PROCEDURES[catKey];
        expect(proc.initialStepId).toBe(proc.stepIds[0]);
        expect(proc.stepIds.length).toBeGreaterThanOrEqual(3);
        expect(proc.expectedEvidenceKeys.length).toBeGreaterThanOrEqual(3);
        expect(proc.potentialRootCauses.length).toBeGreaterThanOrEqual(2);

        // Verify every referenced stepId exists
        for (const stepId of proc.stepIds) {
          expect(
            DIAGNOSTIC_STEPS_LIBRARY[stepId],
            `Procedure ${catKey} references invalid stepId: ${stepId}`
          ).toBeDefined();
        }

        // Verify every referenced root cause exists
        for (const rcId of proc.potentialRootCauses) {
          expect(
            ROOT_CAUSES_LIBRARY[rcId],
            `Procedure ${catKey} references invalid rootCause: ${rcId}`
          ).toBeDefined();
        }
      }
    });

    it('categories with disruptive steps define safety metadata', () => {
      expect(ipDhcpProblemProcedure.isDisruptive).toBe(true);
      expect(ipDhcpProblemProcedure.disruptiveWarning?.length).toBeGreaterThan(15);

      expect(networkAdapterProcedure.isDisruptive).toBe(true);
      expect(networkAdapterProcedure.disruptiveWarning?.length).toBeGreaterThan(15);
    });
  });

  describe('Category Roadmap Configurations (11 MVP Categories)', () => {
    const allCategoryKeys = Object.keys(MVP_CATEGORIES) as ProblemCategoryKey[];

    it('defines a valid roadmap for all 11 MVP problem categories', () => {
      for (const catKey of allCategoryKeys) {
        const roadmapConfig = CATEGORY_ROADMAPS[catKey];
        expect(roadmapConfig, `Missing roadmap for category: ${catKey}`).toBeDefined();
        expect(roadmapConfig.categoryKey).toBe(catKey);
        expect(roadmapConfig.displayName).toBe(MVP_CATEGORIES[catKey].displayName);
        expect(roadmapConfig.stepIds.length).toBeGreaterThanOrEqual(3);
        expect(roadmapConfig.primaryObjective.length).toBeGreaterThan(10);

        // Verify every referenced stepId exists in DIAGNOSTIC_STEPS_LIBRARY
        for (const stepId of roadmapConfig.stepIds) {
          expect(
            DIAGNOSTIC_STEPS_LIBRARY[stepId],
            `Category ${catKey} references invalid stepId: ${stepId}`
          ).toBeDefined();
        }
      }
    });

    it('maps categories to structured OSI-ordered diagnostic procedures', () => {
      expect(CATEGORY_ROADMAPS.wifi_connection.stepIds).toContain('step_wifi_signal');
      expect(CATEGORY_ROADMAPS.slow_internet.stepIds).toContain('step_ping_latency_jitter');
      expect(CATEGORY_ROADMAPS.high_latency.stepIds).toContain('step_ping_latency_jitter');
      expect(CATEGORY_ROADMAPS.dns_problem.stepIds).toContain('step_dns_lookup');
      expect(CATEGORY_ROADMAPS.router_connectivity.stepIds).toContain('step_gateway_ping');
      expect(CATEGORY_ROADMAPS.website_connectivity.stepIds).toContain('step_http_reachability');
      expect(CATEGORY_ROADMAPS.lan_connectivity.stepIds).toContain('step_lan_peer_ping');
    });
  });

  describe('Root Causes & Solutions Library (12 Root Causes)', () => {
    const rootCauseIds = Object.keys(ROOT_CAUSES_LIBRARY);

    it('contains 12 comprehensive root causes covering common network failure modes', () => {
      expect(rootCauseIds.length).toBe(12);
      expect(rootCauseIds).toContain('rc_no_physical_link');
      expect(rootCauseIds).toContain('rc_apipa_dhcp_failure');
      expect(rootCauseIds).toContain('rc_gateway_unreachable');
      expect(rootCauseIds).toContain('rc_dns_server_failure');
      expect(rootCauseIds).toContain('rc_dns_cache_corruption');
      expect(rootCauseIds).toContain('rc_isp_wan_outage');
      expect(rootCauseIds).toContain('rc_wifi_weak_signal');
      expect(rootCauseIds).toContain('rc_bufferbloat_congestion');
      expect(rootCauseIds).toContain('rc_packet_loss_hop');
      expect(rootCauseIds).toContain('rc_target_server_outage');
      expect(rootCauseIds).toContain('rc_lan_subnet_mismatch');
      expect(rootCauseIds).toContain('rc_adapter_driver_glitch');
    });

    it('every root cause has actionable solutions, verification step, and prevention recommendations', () => {
      for (const rcId of rootCauseIds) {
        const rc = ROOT_CAUSES_LIBRARY[rcId];
        expect(rc.id).toBe(rcId);
        expect(rc.problemTitle.length).toBeGreaterThan(5);
        expect(rc.rootCause.length).toBeGreaterThan(15);
        expect(rc.technicalExplanation.length).toBeGreaterThan(25);
        expect(rc.solutionSteps.length).toBeGreaterThanOrEqual(3);
        expect(rc.preventionRecommendations.length).toBeGreaterThanOrEqual(1);

        // Verification step must exist in DIAGNOSTIC_STEPS_LIBRARY
        expect(
          DIAGNOSTIC_STEPS_LIBRARY[rc.verificationStepId],
          `Root cause ${rcId} references invalid verificationStepId: ${rc.verificationStepId}`
        ).toBeDefined();
      }
    });
  });
});

