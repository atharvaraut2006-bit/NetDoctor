import React, { useState, useEffect } from 'react';
import type { QuickResultOption, SubmissionType } from '../../types/diagnostic';
import { CheckIcon, AlertTriangleIcon, TerminalIcon, UploadIcon, InfoIcon, ArrowRightIcon } from '../common/Icons';

interface ResultSubmissionProps {
  stepId: string;
  initialOutput?: string;
  onSubmitQuickResult: (option: QuickResultOption) => void;
  onSubmitPastedOutput: (output: string) => void;
  onSubmitScreenshot: (file: File) => void;
}

export const ResultSubmission: React.FC<ResultSubmissionProps> = ({
  stepId,
  initialOutput,
  onSubmitQuickResult,
  onSubmitPastedOutput,
  onSubmitScreenshot
}) => {
  const [activeTab, setActiveTab] = useState<SubmissionType>('QUICK');
  const [pastedOutput, setPastedOutput] = useState(initialOutput || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Requirement 1: Reset textarea and screenshot selection when moving to a different step
  useEffect(() => {
    setPastedOutput(initialOutput || '');
    setSelectedFile(null);
    setImagePreviewUrl(null);
  }, [stepId, initialOutput]);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setImagePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImagePreviewUrl(null);
    }
  }, [selectedFile]);

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedOutput.trim()) return;
    onSubmitPastedOutput(pastedOutput.trim());
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
    }
  };

  // Requirement 4: Intercept Clipboard Paste (Ctrl+V) for Screenshot Uploads
  const handleGlobalPaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            const namedFile = new File([file], `screenshot_${Date.now()}.png`, { type: file.type });
            setSelectedFile(namedFile);
            setActiveTab('SCREENSHOT');
            return;
          }
        }
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="card submission-card" onPaste={handleGlobalPaste}>
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
          <UploadIcon size={15} />
          <span>Upload Screenshot</span>
        </button>
      </div>

      {/* Tab 1: Quick Option Buttons */}
      {activeTab === 'QUICK' && (
        <div className="quick-options-grid">
          <button
            type="button"
            className="quick-btn success-option"
            onClick={() => onSubmitQuickResult('SUCCESS')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)' }}>
              <CheckIcon size={18} />
              <span className="quick-btn-title">Command Worked as Expected</span>
            </div>
            <span className="quick-btn-desc">Output matches the sample expected result with no errors.</span>
          </button>

          <button
            type="button"
            className="quick-btn failure-option"
            onClick={() => onSubmitQuickResult('FAILURE')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-error)' }}>
              <AlertTriangleIcon size={18} />
              <span className="quick-btn-title">Command Failed / Timed Out</span>
            </div>
            <span className="quick-btn-desc">Received errors, 100% packet loss, or request timeout.</span>
          </button>

          <button
            type="button"
            className="quick-btn"
            onClick={() => onSubmitQuickResult('DIFFERENT')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-blue)' }}>
              <InfoIcon size={18} />
              <span className="quick-btn-title">Different / Inconclusive Result</span>
            </div>
            <span className="quick-btn-desc">Partial response or unexpected network behavior observed.</span>
          </button>
        </div>
      )}

      {/* Tab 2: Paste Output */}
      {activeTab === 'OUTPUT' && (
        <form onSubmit={handlePasteSubmit} className="paste-output-form">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label htmlFor="terminal-output-area" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Paste the raw output copied from your Command Prompt or Terminal:
            </label>
          </div>
          <textarea
            id="terminal-output-area"
            className="terminal-textarea"
            placeholder="Paste your command output here... (e.g. Reply from 8.8.8.8: bytes=32 time=11ms TTL=113...)"
            value={pastedOutput}
            onChange={(e) => setPastedOutput(e.target.value)}
            rows={5}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              NetDoctor automatically extracts IP addresses, gateways, packet loss %, and response latency.
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

      {/* Tab 3: Upload Screenshot (File Picker, Drag & Drop, and Direct Clipboard Ctrl+V Paste) */}
      {activeTab === 'SCREENSHOT' && (
        <div className="screenshot-upload-container">
          {!selectedFile ? (
            <label
              htmlFor="screenshot-input"
              className="screenshot-dropzone"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              style={{ cursor: 'pointer' }}
            >
              <div className="dropzone-icon">
                <UploadIcon size={22} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Paste image directly (Ctrl + V), drag & drop, or click to browse
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Supports PNG, JPG, JPEG from Snipping Tool or screenshot hotkeys
                </div>
              </div>
              <input
                id="screenshot-input"
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </label>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 16px',
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              border: '1px solid var(--color-border)'
            }}>
              {imagePreviewUrl && (
                <img
                  src={imagePreviewUrl}
                  alt="Terminal screenshot preview"
                  style={{
                    width: '88px',
                    height: '56px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1'
                  }}
                />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {selectedFile.name || 'Pasted Clipboard Screenshot'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {(selectedFile.size / 1024).toFixed(1)} KB • Image ready for terminal OCR extraction
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setSelectedFile(null)}
                >
                  Remove
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => onSubmitScreenshot(selectedFile)}
                >
                  <span>Extract & Analyze Image</span>
                  <ArrowRightIcon size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
