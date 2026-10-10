import React, { useState, useEffect } from 'react';
import type { QuickResultOption } from '../../types/diagnostic';
import {
  CheckIcon,
  AlertTriangleIcon,
  TerminalIcon,
  InfoIcon,
  ArrowRightIcon,
  ImageIcon,
  UploadIcon,
  XIcon,
  ActivityIcon
} from '../common/Icons';

export function getSampleOutput(stepId: string, outcome: 'SUCCESS' | 'FAILURE' | 'JITTER'): string {
  // Step: Check Network Adapter
  if (stepId === 'step_network_adapter') {
    if (outcome === 'SUCCESS') {
      return `Admin State    State          Type             Interface Name\n-------------------------------------------------------------------------\nEnabled        Connected      Dedicated        Wi-Fi\nEnabled        Connected      Dedicated        Ethernet`;
    }
    if (outcome === 'FAILURE') {
      return `Admin State    State          Type             Interface Name\n-------------------------------------------------------------------------\nDisabled       Disconnected   Dedicated        Wi-Fi`;
    }
    return `Admin State    State          Type             Interface Name\n-------------------------------------------------------------------------\nEnabled        Connected      Dedicated        Wi-Fi`;
  }

  // Step: Check IP Address & DHCP
  if (stepId === 'step_ip_dhcp') {
    if (outcome === 'SUCCESS') {
      return `Windows IP Configuration\n\nWireless LAN adapter Wi-Fi:\n   Connection-specific DNS Suffix  . : home\n   IPv4 Address. . . . . . . . . . . : 192.168.1.145\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 192.168.1.1`;
    }
    if (outcome === 'FAILURE') {
      return `Windows IP Configuration\n\nWireless LAN adapter Wi-Fi:\n   Connection-specific DNS Suffix  . :\n   Autoconfiguration IPv4 Address. . : 169.254.142.88\n   Subnet Mask . . . . . . . . . . . : 255.255.0.0\n   Default Gateway . . . . . . . . . :`;
    }
    return `Windows IP Configuration\n\nWireless LAN adapter Wi-Fi:\n   Connection-specific DNS Suffix  . : home\n   IPv4 Address. . . . . . . . . . . : 192.168.1.145\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 192.168.1.1`;
  }

  // Step: Gateway Ping
  if (stepId === 'step_gateway_ping') {
    if (outcome === 'SUCCESS') {
      return `Pinging 192.168.1.1 with 32 bytes of data:\nReply from 192.168.1.1: bytes=32 time=1ms TTL=64\nReply from 192.168.1.1: bytes=32 time=2ms TTL=64\nReply from 192.168.1.1: bytes=32 time=1ms TTL=64\nReply from 192.168.1.1: bytes=32 time=1ms TTL=64\n\nPing statistics for 192.168.1.1:\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),\nApproximate round trip times in milli-seconds:\n    Minimum = 1ms, Maximum = 2ms, Average = 1ms`;
    }
    if (outcome === 'FAILURE') {
      return `Pinging 192.168.1.1 with 32 bytes of data:\nRequest timed out.\nRequest timed out.\nRequest timed out.\nRequest timed out.\n\nPing statistics for 192.168.1.1:\n    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss),`;
    }
    return `Pinging 192.168.1.1 with 32 bytes of data:\nReply from 192.168.1.1: bytes=32 time=2ms TTL=64\nRequest timed out.\nReply from 192.168.1.1: bytes=32 time=180ms TTL=64\nReply from 192.168.1.1: bytes=32 time=3ms TTL=64\n\nPing statistics for 192.168.1.1:\n    Packets: Sent = 4, Received = 3, Lost = 1 (25% loss),\nApproximate round trip times in milli-seconds:\n    Minimum = 2ms, Maximum = 180ms, Average = 61ms`;
  }

  // Step: Ping Public IP (8.8.8.8)
  if (stepId === 'step_ping_public_ip') {
    if (outcome === 'SUCCESS') {
      return `Pinging 8.8.8.8 with 32 bytes of data:\nReply from 8.8.8.8: bytes=32 time=14ms TTL=115\nReply from 8.8.8.8: bytes=32 time=13ms TTL=115\nReply from 8.8.8.8: bytes=32 time=15ms TTL=115\nReply from 8.8.8.8: bytes=32 time=14ms TTL=115\n\nPing statistics for 8.8.8.8:\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),\nApproximate round trip times in milli-seconds:\n    Minimum = 13ms, Maximum = 15ms, Average = 14ms`;
    }
    if (outcome === 'FAILURE') {
      return `Pinging 8.8.8.8 with 32 bytes of data:\nRequest timed out.\nRequest timed out.\nRequest timed out.\nRequest timed out.\n\nPing statistics for 8.8.8.8:\n    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss),`;
    }
    return `Pinging 8.8.8.8 with 32 bytes of data:\nReply from 8.8.8.8: bytes=32 time=16ms TTL=115\nReply from 8.8.8.8: bytes=32 time=240ms TTL=115\nRequest timed out.\nReply from 8.8.8.8: bytes=32 time=150ms TTL=115\n\nPing statistics for 8.8.8.8:\n    Packets: Sent = 4, Received = 3, Lost = 1 (25% loss),\nApproximate round trip times in milli-seconds:\n    Minimum = 16ms, Maximum = 240ms, Average = 135ms`;
  }

  // Step: DNS Resolution / Flush
  if (stepId === 'step_dns_resolution' || stepId === 'step_dns_cache_flush') {
    if (outcome === 'SUCCESS') {
      return `Server:  dns.google\nAddress:  8.8.8.8\n\nNon-authoritative answer:\nName:    google.com\nAddresses:  142.250.190.46`;
    }
    if (outcome === 'FAILURE') {
      return `Server:  UnKnown\nAddress:  192.168.1.1\n\n*** UnKnown can't find google.com: Server failed\nDNS request timed out.\n    timeout was 2 seconds.`;
    }
    return `Server:  dns.google\nAddress:  8.8.8.8\n\nDNS request timed out.\n    timeout was 2 seconds.\nNon-authoritative answer:\nName:    google.com\nAddresses:  142.250.190.46`;
  }

  // Generic fallback for any other diagnostic test step
  if (outcome === 'SUCCESS') {
    return `Pinging target with 32 bytes of data:\nReply from target: bytes=32 time=12ms TTL=64\nReply from target: bytes=32 time=11ms TTL=64\nReply from target: bytes=32 time=14ms TTL=64\nReply from target: bytes=32 time=12ms TTL=64\n\nPing statistics for target:\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),\nApproximate round trip times in milli-seconds:\n    Minimum = 11ms, Maximum = 14ms, Average = 12ms`;
  }
  if (outcome === 'FAILURE') {
    return `Pinging target with 32 bytes of data:\nRequest timed out.\nRequest timed out.\nRequest timed out.\nRequest timed out.\n\nPing statistics for target:\n    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss),`;
  }
  return `Pinging target with 32 bytes of data:\nReply from target: bytes=32 time=15ms TTL=64\nRequest timed out.\nReply from target: bytes=32 time=220ms TTL=64\nReply from target: bytes=32 time=18ms TTL=64\n\nPing statistics for target:\n    Packets: Sent = 4, Received = 3, Lost = 1 (25% loss),\nApproximate round trip times in milli-seconds:\n    Minimum = 15ms, Maximum = 220ms, Average = 84ms`;
}

interface ResultSubmissionProps {
  stepId: string;
  initialOutput?: string;
  onSubmitQuickResult: (option: QuickResultOption, clarification?: string) => void;
  onSubmitPastedOutput: (output: string) => void;
  onSubmitScreenshot?: (fileName: string, option: QuickResultOption, userDescription?: string) => void;
}

export const ResultSubmission: React.FC<ResultSubmissionProps> = ({
  stepId,
  initialOutput,
  onSubmitQuickResult,
  onSubmitPastedOutput,
  onSubmitScreenshot
}) => {
  const [activeTab, setActiveTab] = useState<'QUICK' | 'OUTPUT' | 'SCREENSHOT'>('QUICK');
  const [pastedOutput, setPastedOutput] = useState(initialOutput || '');

  // Clarification state for ambiguous/different results
  const [showClarification, setShowClarification] = useState(false);
  const [selectedClarification, setSelectedClarification] = useState<string>('Intermittent connection or packet variance');

  // Screenshot state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [screenshotOutcome, setScreenshotOutcome] = useState<QuickResultOption>('SUCCESS');
  const [screenshotDescription, setScreenshotDescription] = useState<string>('');

  // Reset state when moving to a different step
  useEffect(() => {
    setPastedOutput(initialOutput || '');
    setShowClarification(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileError(null);
  }, [stepId, initialOutput]);

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedOutput.trim()) return;
    onSubmitPastedOutput(pastedOutput.trim());
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);
    if (!file) return;

    // Validate type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setFileError('Invalid file type. Please upload a PNG, JPEG, or WEBP image screenshot.');
      return;
    }

    // Validate size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please upload an image under 5MB.`);
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setFileError(null);
  };

  const handleScreenshotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    if (onSubmitScreenshot) {
      onSubmitScreenshot(selectedFile.name, screenshotOutcome, screenshotDescription);
    } else {
      onSubmitQuickResult(screenshotOutcome, `Screenshot: ${selectedFile.name}`);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="card submission-card">
      <div className="card-header" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>
        <span className="card-title" style={{ fontSize: '16px' }}>Submit Test Outcome</span>
      </div>

      <div className="submission-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'QUICK'}
          className={`tab-btn ${activeTab === 'QUICK' ? 'active' : ''}`}
          onClick={() => setActiveTab('QUICK')}
        >
          <CheckIcon size={15} />
          <span>Quick Outcome</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'OUTPUT'}
          className={`tab-btn ${activeTab === 'OUTPUT' ? 'active' : ''}`}
          onClick={() => setActiveTab('OUTPUT')}
        >
          <TerminalIcon size={15} />
          <span>Paste Output</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'SCREENSHOT'}
          className={`tab-btn ${activeTab === 'SCREENSHOT' ? 'active' : ''}`}
          onClick={() => setActiveTab('SCREENSHOT')}
        >
          <ImageIcon size={15} />
          <span>Screenshot Upload</span>
        </button>
      </div>

      {/* Tab 1: Quick Option Buttons */}
      {activeTab === 'QUICK' && (
        <div>
          <div className="quick-options-grid">
            <button
              type="button"
              className="quick-btn success-option"
              onClick={() => {
                setShowClarification(false);
                onSubmitQuickResult('SUCCESS');
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)' }}>
                <CheckIcon size={18} />
                <span className="quick-btn-title">Command Worked as Expected</span>
              </div>
              <span className="quick-btn-desc">Output matches the sample expected result with 0% loss and no errors.</span>
            </button>

            <button
              type="button"
              className="quick-btn failure-option"
              onClick={() => {
                setShowClarification(false);
                onSubmitQuickResult('FAILURE');
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-error)' }}>
                <AlertTriangleIcon size={18} />
                <span className="quick-btn-title">Command Failed / Timed Out</span>
              </div>
              <span className="quick-btn-desc">Received errors, 100% packet loss, or request timeout.</span>
            </button>

            <button
              type="button"
              className={`quick-btn ${showClarification ? 'active-border' : ''}`}
              onClick={() => setShowClarification(true)}
              style={{
                borderColor: showClarification ? 'var(--primary-blue)' : undefined,
                backgroundColor: showClarification ? '#F0F9FF' : undefined
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-blue)' }}>
                <InfoIcon size={18} />
                <span className="quick-btn-title">Different / Inconclusive Result</span>
              </div>
              <span className="quick-btn-desc">Partial response, intermittent packet drops, or unusual error text.</span>
            </button>
          </div>

          {/* Focused Clarification Selector when Different/Inconclusive selected */}
          {showClarification && (
            <div
              style={{
                marginTop: '14px',
                padding: '14px 16px',
                backgroundColor: '#F8FAFC',
                borderRadius: '6px',
                border: '1px solid #BFDBFE'
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Clarify Observed Network Behavior:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                {[
                  'Intermittent connection or fluctuating ping latency',
                  'Destination host unreachable / no route to host',
                  'Unrecognized command error or syntax error',
                  'Partial packets received with dropouts'
                ].map((optionText, idx) => (
                  <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="clarification_choice"
                      value={optionText}
                      checked={selectedClarification === optionText}
                      onChange={(e) => setSelectedClarification(e.target.value)}
                    />
                    <span>{optionText}</span>
                  </label>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => onSubmitQuickResult('DIFFERENT', selectedClarification)}
              >
                <span>Submit Clarified Outcome</span>
                <ArrowRightIcon size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Paste Output */}
      {activeTab === 'OUTPUT' && (
        <form onSubmit={handlePasteSubmit} className="paste-output-form">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
            <label htmlFor="terminal-output-area" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Paste raw terminal output or generate authentic test scenarios:
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} role="group" aria-label="CLI Simulation Generators">
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Simulator:
              </span>
              <button
                type="button"
                className="btn btn-outline btn-xs"
                onClick={() => setPastedOutput(getSampleOutput(stepId, 'SUCCESS'))}
                title="Populate authentic successful command output"
                style={{ fontSize: '11px', padding: '3px 8px', color: 'var(--color-success)', borderColor: '#A7F3D0', backgroundColor: '#F0FDF4' }}
              >
                <CheckIcon size={12} />
                <span>Success</span>
              </button>
              <button
                type="button"
                className="btn btn-outline btn-xs"
                onClick={() => setPastedOutput(getSampleOutput(stepId, 'FAILURE'))}
                title="Populate authentic failure or timeout command output"
                style={{ fontSize: '11px', padding: '3px 8px', color: 'var(--color-error)', borderColor: '#FECACA', backgroundColor: '#FEF2F2' }}
              >
                <AlertTriangleIcon size={12} />
                <span>100% Loss</span>
              </button>
              <button
                type="button"
                className="btn btn-outline btn-xs"
                onClick={() => setPastedOutput(getSampleOutput(stepId, 'JITTER'))}
                title="Populate authentic jitter / intermittent packet loss output"
                style={{ fontSize: '11px', padding: '3px 8px', color: '#D97706', borderColor: '#FDE68A', backgroundColor: '#FFFBEB' }}
              >
                <ActivityIcon size={12} />
                <span>Jitter / High Latency</span>
              </button>
            </div>
          </div>
          <textarea
            id="terminal-output-area"
            className="terminal-textarea"
            placeholder="Paste your command output here... (e.g. Reply from 8.8.8.8: bytes=32 time=11ms TTL=113...)"
            value={pastedOutput}
            onChange={(e) => setPastedOutput(e.target.value)}
            rows={5}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              NetDoctor deterministically extracts IP configuration, packet loss %, and round-trip latency.
            </span>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!pastedOutput.trim()}
            >
              <span>Submit & Analyze Result</span>
              <ArrowRightIcon size={15} />
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Screenshot Upload */}
      {activeTab === 'SCREENSHOT' && (
        <form onSubmit={handleScreenshotSubmit} style={{ marginTop: '10px' }}>
          {fileError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '6px',
                color: 'var(--color-error)',
                fontSize: '13px',
                marginBottom: '12px'
              }}
            >
              <AlertTriangleIcon size={16} />
              <span>{fileError}</span>
            </div>
          )}

          {!selectedFile ? (
            <div
              style={{
                border: '2px dashed #CBD5E1',
                borderRadius: '8px',
                padding: '24px 16px',
                textAlign: 'center',
                backgroundColor: '#F8FAFC',
                cursor: 'pointer'
              }}
              onClick={() => document.getElementById('screenshot-file-input')?.click()}
            >
              <input
                id="screenshot-file-input"
                type="file"
                accept=".png,.jpg,.jpeg,.webp"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <div style={{ color: 'var(--primary-blue)', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                <UploadIcon size={28} />
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Click to browse or upload a terminal screenshot
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Supports PNG, JPEG, and WEBP formats (up to 5MB)
              </div>
            </div>
          ) : (
            <div
              style={{
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '14px',
                backgroundColor: '#F8FAFC',
                marginBottom: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ImageIcon size={18} color="var(--primary-blue)" />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {selectedFile.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {formatFileSize(selectedFile.size)}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleRemoveFile}
                  title="Remove selected screenshot"
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                >
                  <XIcon size={14} />
                  <span>Remove</span>
                </button>
              </div>

              {previewUrl && (
                <div style={{ marginBottom: '12px', textAlign: 'center', maxHeight: '180px', overflow: 'hidden', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                  <img
                    src={previewUrl}
                    alt="Uploaded terminal capture preview"
                    style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'contain' }}
                  />
                </div>
              )}

              {/* Manual Outcome Selection for Screenshot */}
              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '10px' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Select the visible outcome displayed in your screenshot:
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {[
                    { key: 'SUCCESS' as const, label: 'It worked / No errors' },
                    { key: 'FAILURE' as const, label: 'Failed / Timed out' },
                    { key: 'DIFFERENT' as const, label: 'Inconclusive / Other' }
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      className={`btn btn-sm ${screenshotOutcome === opt.key ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setScreenshotOutcome(opt.key)}
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Optional note: describe key lines shown in the image..."
                  value={screenshotDescription}
                  onChange={(e) => setScreenshotDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12.5px',
                    marginBottom: '10px'
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary">
                    <CheckIcon size={15} />
                    <span>Confirm & Submit Screenshot</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
