import React from 'react';
import { NetworkIcon, RotateCcwIcon } from './Icons';
import type { ActiveView } from '../../types/diagnostic';

interface HeaderProps {
  currentView: ActiveView;
  onBrandClick: () => void;
  onStartOverClick: () => void;
  categoryName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onBrandClick,
  onStartOverClick,
  categoryName: _categoryName
}) => {
  return (
    <header className="site-header" role="banner">
      <div className="header-inner">
        <div className="brand-group" onClick={onBrandClick} title="NetDoctor Home">
          <div className="brand-icon-wrapper" aria-hidden="true">
            <NetworkIcon size={22} color="#FFFFFF" />
          </div>
          <div className="brand-text">
            <span className="brand-title">NetDoctor</span>
            <span className="brand-subtitle">Network Diagnostic System</span>
          </div>
        </div>

        <div className="header-actions">
          {currentView === 'WORKSPACE' && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={onStartOverClick}
              title="Start a new diagnosis"
            >
              <RotateCcwIcon size={14} />
              <span>Start Over</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
