import React, { useState } from 'react';
import { TerminalIcon, CopyIcon, CheckCheckIcon } from '../common/Icons';

interface CommandBoxProps {
  command: string;
  osName: string;
}

export const CommandBox: React.FC<CommandBoxProps> = ({ command, osName }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="command-container" aria-label="Terminal Command Box">
      <div className="command-header">
        <div className="command-label">
          <TerminalIcon size={14} color="#38BDF8" />
          <span>{osName.toUpperCase()} TERMINAL COMMAND</span>
        </div>
        <button
          type="button"
          className={`copy-btn ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          title="Copy command to clipboard"
        >
          {copied ? (
            <>
              <CheckCheckIcon size={13} color="#FFFFFF" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <CopyIcon size={13} color="#E2E8F0" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="command-body">
        <code className="command-text">{command}</code>
      </div>
    </div>
  );
};
