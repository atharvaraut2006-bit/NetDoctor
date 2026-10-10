/**
 * NetDoctor — Category Roadmap Mappings
 * Maps each of the 11 MVP problem categories to an optimized sequence of diagnostic steps
 * Follows standard bottom-up OSI troubleshooting (Physical -> Data Link -> IP/DHCP -> Gateway -> DNS/Transport -> Application)
 */

import type { ProblemCategoryKey } from '../engine/types';
import type { CategoryRoadmapConfig } from './types';
import { ALL_PROCEDURES } from './procedures';


export const CATEGORY_ROADMAPS: Record<ProblemCategoryKey, CategoryRoadmapConfig> = Object.keys(
  ALL_PROCEDURES
).reduce((acc, key) => {
  const catKey = key as ProblemCategoryKey;
  const proc = ALL_PROCEDURES[catKey];
  acc[catKey] = {
    categoryKey: proc.categoryKey,
    displayName: proc.displayName,
    description: proc.description,
    stepIds: proc.stepIds,
    primaryObjective: proc.primaryObjective
  };
  return acc;
}, {} as Record<ProblemCategoryKey, CategoryRoadmapConfig>);

