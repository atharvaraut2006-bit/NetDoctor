/**
 * NetDoctor — Evidence Store & Contradiction Manager (Phase 4)
 * Deterministic repository for recording, querying, and reconciling diagnostic facts
 */

import type { EvidenceRecord, EvidenceStatus } from './types';
import type { DiagnosticLayer } from '../../knowledge/types';

export class EvidenceStore {
  private store: Record<string, EvidenceRecord> = {};
  private history: EvidenceRecord[] = [];

  constructor(initialRecords?: Record<string, EvidenceRecord>) {
    if (initialRecords) {
      this.store = { ...initialRecords };
    }
  }

  /**
   * Records a new evidence fact. Checks for contradictions against existing facts.
   * Returns whether a contradiction with an earlier fact was detected.
   */
  public addEvidence(
    key: string,
    label: string,
    value: any,
    layer: DiagnosticLayer,
    sourceStepId: string,
    status: EvidenceStatus,
    metadata?: {
      observationIndex?: number;
      destination?: string;
      commandExecuted?: string;
      isIntermittent?: boolean;
    }
  ): { record: EvidenceRecord; isContradiction: boolean; contradictionMessage?: string } {
    const existing = this.store[key];
    let isContradiction = false;
    let contradictionMessage: string | undefined;

    const existingObsCount = this.history.filter((h) => h.key === key).length;
    const observationIndex = metadata?.observationIndex ?? (existingObsCount + 1);

    if (existing && existing.status !== status && existing.status !== 'INCONCLUSIVE' && status !== 'INCONCLUSIVE') {
      isContradiction = true;
      const priorTime = existing.observedAt ? existing.observedAt.toLocaleTimeString() : 'earlier';
      contradictionMessage = `Contradiction detected: Reassessment triggered for "${label}": previously recorded as ${existing.status} at ${priorTime} (Step: ${existing.sourceStepId}), but now reported as ${status}. Preserving all session observations.`;
    }

    const record: EvidenceRecord = {
      key,
      label,
      value,
      layer,
      sourceStepId,
      observedAt: new Date(),
      status: metadata?.isIntermittent ? 'INTERMITTENT' : status,
      observationIndex,
      destination: metadata?.destination,
      commandExecuted: metadata?.commandExecuted,
      isIntermittent: Boolean(metadata?.isIntermittent || status === 'INTERMITTENT' || existing?.isIntermittent)
    };

    this.store[key] = record;
    this.history.push(record);

    return { record, isContradiction, contradictionMessage };
  }

  /**
   * Retrieves a specific evidence fact by key
   */
  public get(key: string): EvidenceRecord | undefined {
    return this.store[key];
  }

  /**
   * Checks if an evidence key exists with a specific status
   */
  public hasStatus(key: string, status: EvidenceStatus): boolean {
    const item = this.store[key];
    return item !== undefined && item.status === status;
  }

  /**
   * Checks if an evidence key is verified OK (positive finding)
   */
  public isOk(key: string): boolean {
    return this.hasStatus(key, 'VERIFIED_OK');
  }

  /**
   * Checks if an evidence key has a fault detected (negative finding)
   */
  /**
   * Checks if an evidence key has a fault detected (negative finding)
   */
  public isFault(key: string): boolean {
    return this.hasStatus(key, 'FAULT_DETECTED');
  }

  /**
   * Checks if an evidence key is marked as intermittent
   */
  public isIntermittent(key: string): boolean {
    const item = this.store[key];
    if (item !== undefined && (item.status === 'INTERMITTENT' || Boolean(item.isIntermittent))) {
      return true;
    }
    return this.history.some((h) => h.key === key && (h.status === 'INTERMITTENT' || Boolean(h.isIntermittent)));
  }

  /**
   * Retrieves full chronological observation history for a key or all keys
   */
  public getHistory(key?: string): EvidenceRecord[] {
    if (key) {
      return this.history.filter((h) => h.key === key);
    }
    return [...this.history];
  }

  /**
   * Returns count of recorded observations for an evidence key
   */
  public getObservationCount(key: string): number {
    return this.history.filter((h) => h.key === key).length;
  }

  /**
   * Returns all stored evidence records as a dictionary
   */
  public getAll(): Record<string, EvidenceRecord> {
    return { ...this.store };
  }

  /**
   * Returns all evidence records as an array
   */
  public toArray(): EvidenceRecord[] {
    return Object.values(this.store);
  }

  /**
   * Generates a plain-language summary list of all verified findings for final diagnosis reports
   */
  public generateSummaryList(): string[] {
    const list: string[] = [];

    for (const item of Object.values(this.store)) {
      if (item.status === 'VERIFIED_OK') {
        list.push(`Verified normal: ${item.label}`);
      } else if (item.status === 'FAULT_DETECTED') {
        list.push(`Fault identified: ${item.label}`);
      } else if (item.status === 'INTERMITTENT') {
        list.push(`Intermittent variance observed: ${item.label}`);
      }
    }

    return list;
  }

  /**
   * Clears all evidence facts
   */
  public clear(): void {
    this.store = {};
    this.history = [];
  }
}
