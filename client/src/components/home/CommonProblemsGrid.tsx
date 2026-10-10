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
        return <WifiIcon size={20} />;
      case 'globe':
        return <GlobeIcon size={20} />;
      case 'gauge':
        return <GaugeIcon size={20} />;
      case 'server':
        return <ServerIcon size={20} />;
      case 'activity':
      default:
        return <ActivityIcon size={20} />;
    }
  };

  const getProblemMeta = (id: string) => {
    switch (id) {
      case 'wifi_no_internet':
        return { tag: 'Physical / Wireless Link', colorScheme: 'teal' };
      case 'internet_not_working':
        return { tag: 'Default Gateway & IP Route', colorScheme: 'blue' };
      case 'slow_internet':
        return { tag: 'Throughput & Jitter', colorScheme: 'amber' };
      case 'dns_issues':
        return { tag: 'Domain Name Resolution', colorScheme: 'indigo' };
      case 'packet_loss':
      default:
        return { tag: 'Packet Loss & Stability', colorScheme: 'rose' };
    }
  };

  return (
    <div className="common-problems-section">
      <div className="common-problems-header">
        <div>
          <span className="section-label">Quick Diagnostic Presets</span>
          <h2 className="section-title">Common Network Issues</h2>
        </div>
        <span className="section-subtitle">Click any common issue to launch a tailored diagnosis</span>
      </div>

      <div className="common-problems-grid">
        {COMMON_PROBLEMS.map((problem) => {
          const meta = getProblemMeta(problem.id);
          return (
            <div
              key={problem.id}
              className={`problem-card problem-card-${meta.colorScheme}`}
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
                <div className={`problem-card-icon icon-bg-${meta.colorScheme}`} aria-hidden="true">
                  {getIcon(problem.iconName)}
                </div>
                <div className="problem-card-meta">
                  <span className={`problem-badge badge-${meta.colorScheme}`}>{meta.tag}</span>
                  <div className="problem-card-title">{problem.title}</div>
                </div>
                <div className="problem-card-arrow" aria-hidden="true">
                  <ArrowRightIcon size={15} />
                </div>
              </div>
              <p className="problem-card-desc">{problem.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
