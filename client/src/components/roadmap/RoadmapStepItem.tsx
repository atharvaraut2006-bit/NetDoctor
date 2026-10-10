import React from 'react';
import type { RoadmapStepItem as IRoadmapStepItem, StepStatus } from '../../types/diagnostic';
import { CheckIcon, ArrowRightIcon, AlertTriangleIcon } from '../common/Icons';

interface RoadmapStepItemProps {
  step: IRoadmapStepItem;
  isActive: boolean;
  onSelectStep: (stepId: string) => void;
}

export const RoadmapStepItem: React.FC<RoadmapStepItemProps> = ({ step, isActive, onSelectStep }) => {
  const isCurrent = isActive;
  const isCompleted = step.status === 'COMPLETED';

  const renderStatusIcon = (status: StepStatus) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <div className="roadmap-status-icon status-completed" title="Step Completed">
            <CheckIcon size={14} color="var(--color-success)" />
          </div>
        );
      case 'CURRENT':
        return (
          <div className="roadmap-status-icon status-current" title="Active Diagnostic Step">
            <ArrowRightIcon size={14} color="#FFFFFF" />
          </div>
        );
      case 'FAILED':
        return (
          <div className="roadmap-status-icon status-failed" title="Test Failed / Issue Identified">
            <AlertTriangleIcon size={14} color="var(--color-error)" />
          </div>
        );
      case 'SKIPPED':
        return (
          <div className="roadmap-status-icon status-pending" title="Step Skipped">
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>-</span>
          </div>
        );
      case 'PENDING':
      default:
        return (
          <div className="roadmap-status-icon status-pending" title="Pending Step">
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{step.stepNumber}</span>
          </div>
        );
    }
  };

  const getStatusLabel = (status: StepStatus) => {
    switch (status) {
      case 'COMPLETED':
        return 'Completed';
      case 'CURRENT':
        return 'In Progress';
      case 'FAILED':
        return 'Failed Test';
      case 'SKIPPED':
        return 'Skipped';
      case 'PENDING':
      default:
        return 'Pending';
    }
  };

  // If this item is not the currently active step, it must never display as CURRENT
  const displayStatus: StepStatus = !isCurrent && step.status === 'CURRENT'
    ? 'PENDING'
    : step.status;

  return (
    <li
      className={`roadmap-item ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''}`}
      onClick={() => onSelectStep(step.id)}
      role="button"
      tabIndex={0}
    >
      {renderStatusIcon(displayStatus)}
      <div className="roadmap-item-content">
        <span className="roadmap-item-title">{step.title}</span>
        <span className="roadmap-item-status-text">
          {getStatusLabel(displayStatus)} {step.resultSummary ? `• ${step.resultSummary}` : ''}
        </span>
      </div>
    </li>
  );
};
