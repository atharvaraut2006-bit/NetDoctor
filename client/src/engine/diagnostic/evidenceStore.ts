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
    status: EvidenceStatus
  ): { record: EvidenceRecord; isContradiction: boolean; contradictionMessage?: string } {
    const existing = this.store[key];
    let isContradiction = false;
    let contradictionMessage: string | undefined;

    if (existing && existing.status !== status && existing.status !== 'INCONCLUSIVE' && status !== 'INCONCLUSIVE') {
      isContradiction = true;
      contradictionMessage = `Contradiction detected for "${label}": previously recorded as ${existing.status} from ${existing.sourceStepId}, now reported as ${status}. Updated to newest observation.`;
    }

    const record: EvidenceRecord = {
      key,
      label,
      value,
      layer,
      sourceStepId,
      observedAt: new Date(),
      status
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
  public isFault(key: string): boolean {
    return this.hasStatus(key, 'FAULT_DETECTED');
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
