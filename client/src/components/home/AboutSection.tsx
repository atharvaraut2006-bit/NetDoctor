import React from 'react';
import { InfoIcon, LayersIcon, ShieldIcon, TerminalIcon, CheckCheckIcon } from '../common/Icons';

export const AboutSection: React.FC = () => {
  return (
    <section className="about-section" aria-label="About NetDoctor">
      <div className="card about-main-card">
        {/* About Header */}
        <div className="about-header">
          <div className="about-badge">
            <InfoIcon size={13} color="var(--primary-blue)" />
            <span>About NetDoctor</span>
          </div>
          <h2 className="about-title">Intelligent Network Troubleshooting, Without the Guesswork</h2>
          <p className="about-intro">
            NetDoctor is a structured, deterministic network diagnostic system designed to isolate and resolve computer connectivity problems. Rather than relying on guesswork, NetDoctor guides you through proven OSI-layer diagnostic procedures using your operating system's native terminal commands.
          </p>
        </div>

        {/* 3 Step Process Flow */}
        <div className="about-steps-row">
          <div className="about-step-item">
            <div className="about-step-number">01</div>
            <div className="about-step-content">
              <h3 className="about-step-title">Describe Your Issue</h3>
              <p className="about-step-desc">
                Explain symptoms in everyday language. NetDoctor validates network relevance and maps your issue to a targeted diagnostic procedure.
              </p>
            </div>
          </div>

          <div className="about-step-divider" aria-hidden="true">
            <div className="divider-line" />
          </div>

          <div className="about-step-item">
            <div className="about-step-number">02</div>
            <div className="about-step-content">
              <h3 className="about-step-title">Run Safe Inspections</h3>
              <p className="about-step-desc">
                Follow tailored native commands for Windows, macOS, or Linux with expected outputs and clear technical explanations for each step.
              </p>
            </div>
          </div>

          <div className="about-step-divider" aria-hidden="true">
            <div className="divider-line" />
          </div>

          <div className="about-step-item">
            <div className="about-step-number">03</div>
            <div className="about-step-content">
              <h3 className="about-step-title">Isolate & Fix Root Cause</h3>
              <p className="about-step-desc">
                Submit test results or pasted outputs to pinpoint the precise failure and verify that your internet connectivity is restored.
              </p>
            </div>
          </div>
        </div>

        {/* Core Capabilities Grid */}
        <div className="about-pillars-grid">
          <div className="about-feature-box">
            <div className="about-feature-icon icon-blue" aria-hidden="true">
              <LayersIcon size={18} />
            </div>
            <div>
              <h4 className="about-feature-title">Deterministic Layer Isolation</h4>
              <p className="about-feature-desc">
                Systematically inspects hardware adapters, DHCP leases, local router gateway, DNS resolvers, and WAN routing in strict OSI order.
              </p>
            </div>
          </div>

          <div className="about-feature-box">
            <div className="about-feature-icon icon-teal" aria-hidden="true">
              <ShieldIcon size={18} />
            </div>
            <div>
              <h4 className="about-feature-title">Safe & Non-Destructive First</h4>
              <p className="about-feature-desc">
                Diagnostic steps are non-invasive inspections first. Potentially disruptive actions like IP lease renewal require safety confirmation.
              </p>
            </div>
          </div>

          <div className="about-feature-box">
            <div className="about-feature-icon icon-indigo" aria-hidden="true">
              <TerminalIcon size={18} />
            </div>
            <div>
              <h4 className="about-feature-title">Native Cross-Platform Commands</h4>
              <p className="about-feature-desc">
                Generates exact shell syntax for Windows (CMD/PowerShell), macOS (zsh), and Linux (bash) without installing third-party utilities.
              </p>
            </div>
          </div>

          <div className="about-feature-box">
            <div className="about-feature-icon icon-amber" aria-hidden="true">
              <CheckCheckIcon size={18} />
            </div>
            <div>
              <h4 className="about-feature-title">Closed-Loop Verification</h4>
              <p className="about-feature-desc">
                Concludes each identified solution with verification checks to ensure the network issue is actually fixed and prevent repeat faults.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
