import React from 'react';
import type { OperatingSystem } from '../../types/diagnostic';

interface OSSelectorProps {
  selectedOS: OperatingSystem;
  onSelectOS: (os: OperatingSystem) => void;
}

export const OSSelector: React.FC<OSSelectorProps> = ({ selectedOS, onSelectOS }) => {
  return (
    <div className="os-selector-group">
      <span className="os-label">Select OS:</span>
      <div className="os-pills" role="radiogroup" aria-label="Operating System Selection">
        <button
          type="button"
          role="radio"
          aria-checked={selectedOS === 'windows'}
          className={`os-pill-btn ${selectedOS === 'windows' ? 'active' : ''}`}
          onClick={() => onSelectOS('windows')}
        >
          Windows
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={selectedOS === 'macos'}
          className={`os-pill-btn ${selectedOS === 'macos' ? 'active' : ''}`}
          onClick={() => onSelectOS('macos')}
        >
          macOS
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={selectedOS === 'linux'}
          className={`os-pill-btn ${selectedOS === 'linux' ? 'active' : ''}`}
          onClick={() => onSelectOS('linux')}
        >
          Linux
        </button>
      </div>
    </div>
  );
};
