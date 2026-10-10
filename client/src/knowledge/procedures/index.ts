/**
 * NetDoctor — Diagnostic Procedures Index & Factory
 * Central repository for all 11 MVP category-specific diagnostic procedures
 */

import type { ProblemCategoryKey } from '../../engine/types';
import type { DiagnosticProcedure } from '../types';

import { internetNotWorkingProcedure } from './internetNotWorking';
import { wifiConnectionProcedure } from './wifiConnection';
import { slowInternetProcedure } from './slowInternet';
import { highLatencyProcedure } from './highLatency';
import { packetLossProcedure } from './packetLoss';
import { dnsProblemProcedure } from './dnsProblem';
import { ipDhcpProblemProcedure } from './ipDhcpProblem';
import { routerConnectivityProcedure } from './routerConnectivity';
import { networkAdapterProcedure } from './networkAdapter';
import { websiteConnectivityProcedure } from './websiteConnectivity';
import { lanConnectivityProcedure } from './lanConnectivity';

export {
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
};

export const ALL_PROCEDURES: Record<ProblemCategoryKey, DiagnosticProcedure> = {
  internet_not_working: internetNotWorkingProcedure,
  wifi_connection: wifiConnectionProcedure,
  slow_internet: slowInternetProcedure,
  high_latency: highLatencyProcedure,
  packet_loss: packetLossProcedure,
  dns_problem: dnsProblemProcedure,
  ip_dhcp_problem: ipDhcpProblemProcedure,
  router_connectivity: routerConnectivityProcedure,
  network_adapter: networkAdapterProcedure,
  website_connectivity: websiteConnectivityProcedure,
  lan_connectivity: lanConnectivityProcedure
};

/**
 * Returns the curated diagnostic procedure for a given problem category.
 * Defaults to `internet_not_working` if the category key is not found.
 */
export function getProcedure(categoryKey: ProblemCategoryKey): DiagnosticProcedure {
  return ALL_PROCEDURES[categoryKey] || ALL_PROCEDURES.internet_not_working;
}
