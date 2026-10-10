import React from 'react';
import type { RoadmapStepItem as IRoadmapStepItem, OperatingSystem } from '../../types/diagnostic';
import { RoadmapStepItem } from './RoadmapStepItem';
import { StopCircleIcon, RotateCcwIcon, LaptopIcon } from '../common/Icons';

interface DiagnosticRoadmapProps {
  category: string;
  selectedOS: OperatingSystem;
  roadmap: IRoadmapStepItem[];
  currentStepId: string;
  onSelectStep: (stepId: string) => void;
  onStopDiagnosis: () => void;
  onStartOver: () => void;
}

export const DiagnosticRoadmap: React.FC<DiagnosticRoadmapProps> = ({
  category,
  selectedOS,
  roadmap,
  currentStepId,
  onSelectStep,
  onStopDiagnosis,
  onStartOver
}) => {
  const completedCount = roadmap.filter((s) => s.status === 'COMPLETED').length;
  const progressPercent = Math.round((completedCount / (roadmap.length || 1)) * 100);

  return (
    <aside className="workspace-sidebar" aria-label="Diagnostic Roadmap Sidebar">
      <div className="card roadmap-card">
        <div className="roadmap-header">
          <div className="roadmap-title">
            <span>Diagnostic Roadmap</span>
            <span className="badge badge-blue">{completedCount} of {roadmap.length} Steps</span>
          </div>

          <div className="roadmap-meta">
            <span style={{ textTransform: 'capitalize', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <LaptopIcon size={13} />
              {selectedOS}
            </span>
            <span>•</span>
            <span style={{ color: 'var(--secondary-teal)', fontWeight: 500 }}>{category}</span>
          </div>

          <div className="roadmap-progress-bar" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
            <div className="roadmap-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <ul className="roadmap-step-list">
          {roadmap.map((step) => (
            <RoadmapStepItem
              key={step.id}
              step={step}
              isActive={step.id === currentStepId}
              onSelectStep={onSelectStep}
            />
          ))}
        </ul>

        <div className="sidebar-controls" style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onStopDiagnosis}
            style={{ justifyContent: 'flex-start', color: 'var(--text-secondary)' }}
          >
            <StopCircleIcon size={15} color="var(--color-error)" />
            <span>Stop Diagnosis</span>
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onStartOver}
            style={{ justifyContent: 'flex-start', color: 'var(--text-secondary)' }}
          >
            <RotateCcwIcon size={15} color="var(--primary-blue)" />
            <span>New Diagnosis</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
