import React, { useState } from 'react';
import type { OperatingSystem } from '../../types/diagnostic';
import {
  ServerIcon,
  TerminalIcon,
  CopyIcon,
  CheckCheckIcon,
  HelpCircleIcon,
  InfoIcon,
  CheckIcon
} from '../common/Icons';

interface GatewayHelperProps {
  selectedOS: OperatingSystem;
  activeGateway: string;
  onUpdateGateway: (gateway: string) => void;
}

interface OSGatewayGuide {
  name: string;
  command: string;
  alternativeCommand: string;
  howToRun: string;
  sampleOutput: string;
  keyLabel: string;
}

const OS_GUIDES: Record<'windows' | 'macos' | 'linux', OSGatewayGuide> = {
  windows: {
    name: 'Windows',
    command: 'ipconfig | findstr /i "Gateway"',
    alternativeCommand: 'ipconfig',
    howToRun: 'Press Win + R, type cmd and press Enter. Run the command below to isolate your router IP:',
    sampleOutput: '   Default Gateway . . . . . . . . . : 192.168.1.1',
    keyLabel: 'Default Gateway'
  },
  macos: {
    name: 'macOS',
    command: 'route -n get default | grep gateway',
    alternativeCommand: 'netstat -nr | grep default',
    howToRun: 'Press Cmd + Space, type Terminal and press Return. Enter the command below:',
    sampleOutput: '   gateway: 192.168.1.1',
    keyLabel: 'gateway:'
  },
  linux: {
    name: 'Linux',
    command: 'ip route show default',
    alternativeCommand: 'ip route | grep default',
    howToRun: 'Open your terminal (Ctrl + Alt + T) and run the command below:',
    sampleOutput: 'default via 192.168.1.1 dev eth0 proto dhcp metric 100',
    keyLabel: 'default via'
  }
};

const COMMON_PRESETS = [
  '192.168.1.1',
  '192.168.0.1',
  '10.0.0.1',
  '192.168.29.1'
];

export const GatewayHelper: React.FC<GatewayHelperProps> = ({
  selectedOS,
  activeGateway,
  onUpdateGateway
}) => {
  const initialOS: 'windows' | 'macos' | 'linux' =
    selectedOS === 'macos' ? 'macos' : selectedOS === 'linux' ? 'linux' : 'windows';

  const [activeOS, setActiveOS] = useState<'windows' | 'macos' | 'linux'>(initialOS);
  const [isOpen, setIsOpen] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [pasteInput, setPasteInput] = useState('');
  const [extractFeedback, setExtractFeedback] = useState<{ isSuccess: boolean; message: string } | null>(null);

  const guide = OS_GUIDES[activeOS];

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCmd(text);
      setTimeout(() => setCopiedCmd(null), 2000);
    } catch {
      // Fallback
    }
  };

  const handleExtractFromPaste = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteInput.trim()) return;

    // Scan for standard IPv4 regex
    const ipMatch = pasteInput.match(/\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/);

    if (ipMatch) {
      const extractedIp = ipMatch[0];
      onUpdateGateway(extractedIp);
      setExtractFeedback({
        isSuccess: true,
        message: `Extracted and saved: ${extractedIp}`
      });
      setPasteInput('');
    } else {
      setExtractFeedback({
        isSuccess: false,
        message: 'No valid IP address found. Try pasting the terminal line (e.g. 192.168.1.1).'
      });
    }
  };

  return (
    <div className="gateway-finder-card" aria-label="Default Gateway Configuration and Helper">
      {/* Target Gateway Bar */}
      <div className="gateway-target-bar">
        <div className="gateway-input-section">
          <div className="gateway-label-group">
            <ServerIcon size={16} color="var(--primary-blue)" />
            <label htmlFor="gateway-ip-input" className="gateway-label">
              Target Gateway IP:
            </label>
          </div>

          <input
            id="gateway-ip-input"
            type="text"
            value={activeGateway}
            onChange={(e) => onUpdateGateway(e.target.value.trim())}
            placeholder="192.168.1.1 (or enter your router IP)"
            className="gateway-input"
          />

          {activeGateway ? (
            <span className="badge badge-teal gateway-status-badge">
              <CheckIcon size={12} />
              <span>Configured</span>
            </span>
          ) : (
            <span className="badge badge-warning gateway-status-badge">
              <span>Defaults to 192.168.1.1</span>
            </span>
          )}
        </div>

        {/* Quick presets and helper toggle */}
        <div className="gateway-actions-group">
          <div className="gateway-presets-row">
            <span className="presets-label">Common:</span>
            {COMMON_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                className={`gateway-preset-btn ${activeGateway === preset ? 'active' : ''}`}
                onClick={() => onUpdateGateway(preset)}
                title={`Set gateway target to ${preset}`}
              >
                {preset}
              </button>
            ))}
          </div>

          <button
            type="button"
            className={`btn btn-sm gateway-help-toggle-btn ${isOpen ? 'active' : ''}`}
            onClick={() => setIsOpen(!isOpen)}
            title="Commands to find your Default Gateway"
          >
            <HelpCircleIcon size={14} />
            <span>{isOpen ? 'Hide Gateway Commands' : "Don't know your Gateway? Find it"}</span>
          </button>
        </div>
      </div>

      {/* Expanded Instruction & Discovery Panel */}
      {isOpen && (
        <div className="gateway-helper-panel">
          <div className="gateway-helper-header">
            <div className="gateway-helper-title-group">
              <TerminalIcon size={16} color="var(--primary-blue)" />
              <div>
                <h4 className="gateway-helper-title">Commands to Identify Your Default Gateway</h4>
                <p className="gateway-helper-subtitle">
                  Run the command below in your terminal to discover your local router's IP address:
                </p>
              </div>
            </div>

            {/* OS Tabs */}
            <div className="gateway-os-pills">
              {(['windows', 'macos', 'linux'] as const).map((os) => (
                <button
                  key={os}
                  type="button"
                  className={`gateway-os-pill ${activeOS === os ? 'active' : ''}`}
                  onClick={() => setActiveOS(os)}
                >
                  {os === 'windows' ? 'Windows' : os === 'macos' ? 'macOS' : 'Linux'}
                </button>
              ))}
            </div>
          </div>

          {/* Guide Content */}
          <div className="gateway-guide-body">
            <p className="gateway-run-instructions">{guide.howToRun}</p>

            {/* Primary Command Box */}
            <div className="gateway-code-box">
              <div className="gateway-code-header">
                <span className="gateway-code-tag">{guide.name.toUpperCase()} TERMINAL</span>
                <button
                  type="button"
                  className={`btn btn-sm btn-ghost gateway-copy-btn ${copiedCmd === guide.command ? 'copied' : ''}`}
                  onClick={() => handleCopy(guide.command)}
                >
                  {copiedCmd === guide.command ? (
                    <>
                      <CheckCheckIcon size={13} color="var(--color-success)" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon size={13} />
                      <span>Copy Command</span>
                    </>
                  )}
                </button>
              </div>
              <div className="gateway-code-content">
                <code>{guide.command}</code>
              </div>
            </div>

            {/* Expected Result & Sample Output */}
            <div className="gateway-sample-box">
              <div className="gateway-sample-label">
                <InfoIcon size={13} color="var(--text-secondary)" />
                <span>What to look for in the result:</span>
              </div>
              <pre className="gateway-sample-pre">
                <code>{guide.sampleOutput}</code>
              </pre>
              <div className="gateway-tip-note">
                Alternative: You can also run <code>{guide.alternativeCommand}</code> and locate the line labeled <strong>{guide.keyLabel}</strong>.
              </div>
            </div>

            {/* Auto-Extract Paste Tool */}
            <form onSubmit={handleExtractFromPaste} className="gateway-paste-extractor">
              <label htmlFor="gateway-paste-input" className="gateway-paste-label">
                Found the output? Paste the terminal text or line here to auto-fill:
              </label>
              <div className="gateway-paste-row">
                <input
                  id="gateway-paste-input"
                  type="text"
                  value={pasteInput}
                  onChange={(e) => {
                    setPasteInput(e.target.value);
                    if (extractFeedback) setExtractFeedback(null);
                  }}
                  placeholder={`E.g., ${guide.sampleOutput.trim()}`}
                  className="gateway-paste-input"
                />
                <button
                  type="submit"
                  className="btn btn-outline btn-sm"
                  disabled={!pasteInput.trim()}
                >
                  <span>Extract IP</span>
                </button>
              </div>

              {extractFeedback && (
                <div
                  className={`gateway-feedback-msg ${extractFeedback.isSuccess ? 'success' : 'error'}`}
                  role="alert"
                >
                  {extractFeedback.isSuccess ? (
                    <CheckIcon size={14} />
                  ) : (
                    <InfoIcon size={14} />
                  )}
                  <span>{extractFeedback.message}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
