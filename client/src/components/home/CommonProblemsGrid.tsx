import React from 'react';
import type { CommonProblem } from '../../types/diagnostic';
import { COMMON_PROBLEMS } from '../../data/mockDiagnosticData';
import { WifiIcon, GlobeIcon, GaugeIcon, ServerIcon, ActivityIcon, ArrowRightIcon } from '../common/Icons';

interface CommonProblemsGridProps {
  onSelectProblem: (problem: CommonProblem) => void;
}

export const CommonProblemsGrid: React.FC<CommonProblemsGridProps> = ({ onSelectProblem }) => {
  const getIcon = (name: CommonProblem['iconName']) => {
    switch (name) {
      case 'wifi':
        return <WifiIcon size={18} />;
      case 'globe':
        return <GlobeIcon size={18} />;
      case 'gauge':
        return <GaugeIcon size={18} />;
      case 'server':
        return <ServerIcon size={18} />;
      case 'activity':
      default:
        return <ActivityIcon size={18} />;
    }
  };

  return (
    <div className="common-problems-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="section-label">Or Select a Common Problem</span>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Quick Diagnostic Preset</span>
      </div>

      <div className="common-problems-grid">
        {COMMON_PROBLEMS.map((problem) => (
          <div
            key={problem.id}
            className="problem-card"
            onClick={() => onSelectProblem(problem)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectProblem(problem);
              }
            }}
          >
            <div className="problem-card-top">
              <div className="problem-card-icon" aria-hidden="true">
                {getIcon(problem.iconName)}
              </div>
              <div style={{ flex: 1 }}>
                <div className="problem-card-title">{problem.title}</div>
              </div>
              <ArrowRightIcon size={16} color="var(--primary-blue)" />
            </div>
            <div className="problem-card-desc">{problem.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
