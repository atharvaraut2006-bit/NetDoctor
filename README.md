# NetDoctor — Network Diagnostic System

NetDoctor is a structured network diagnostic and troubleshooting system designed to help users identify, troubleshoot, and fix common networking problems through an evidence-based, step-by-step diagnostic workflow.

---

## 1. Project Overview

NetDoctor transforms natural-language problem descriptions into an adaptive diagnostic roadmap. Rather than acting as a generic conversational chatbot or generating ungrounded advice, NetDoctor pairs a deterministic **Diagnostic Rule Engine** with a **Curated Networking Knowledge Base** and **Natural-Language Understanding** to systematically pinpoint root causes, guide command execution, interpret technical outputs, and verify problem resolution.

### Core Concept

```text
User Problem → Problem Identification → Diagnostic Roadmap → Tests → Result Analysis → Root Cause → Solution → Verification
```

---

## 2. Key Features

- **Natural-Language Problem Ingestion:** Understands informal descriptions, varied phrasing, and minor spelling mistakes without demanding networking jargon.
- **Problem Relevance Validation:** Instantly differentiates networking issues from non-networking issues and clarifies vague descriptions via targeted follow-ups.
- **11 MVP Problem Categories:** Supports Internet loss, Wi-Fi drops, slow throughput, latency/ping, packet loss, DNS, IP/DHCP, router gateway, adapter, website, and LAN issues.
- **OS-Aware Guidance:** Delivers precise, beginner-friendly instructions for Windows, macOS, and Linux.
- **Live Diagnostic Roadmap:** Visual step tracker displaying completed, active, pending, and failed states.
- **Command Output & Screenshot Interpretation:** Translates complex terminal outputs (`ipconfig`, `ping`, `nslookup`, `traceroute`) into plain-language explanations.
- **Adaptive Branching & Evidence Tracking:** Dynamically adjusts troubleshooting paths based on test evidence and avoids repeating known steps.
- **Transparent "Why?" Explanations:** Explains the engineering rationale behind every diagnostic step on demand.
- **Resolution Verification & Summary:** Tests whether solutions worked and provides a structured final diagnostic report with prevention tips.

---

## 3. Supported Problem Categories (MVP)

1. `internet_not_working` — Internet not working / Complete loss of connectivity
2. `wifi_connection` — Wi-Fi connection problems & drops
3. `slow_internet` — Slow Internet throughput & buffering
4. `high_latency` — High ping, gaming lag & jitter
5. `packet_loss` — Packet loss & voice/video stutter
6. `dns_problem` — DNS resolution failures (`ERR_NAME_NOT_RESOLVED`)
7. `ip_dhcp_problem` — IP / DHCP errors & APIPA `169.254.x.x`
8. `router_connectivity` — Default Gateway & router reachability issues
9. `network_adapter` — Network adapter status & driver problems
10. `website_connectivity` — Specific website connectivity issues
11. `lan_connectivity` — Local LAN & network device connectivity

---

## 4. Development Phases & Current Status

| Phase | Phase Name | Status |
|---|---|---|
| **Phase 1** | UI & Project Foundation | **COMPLETED** (Report: [`docs/NetDoctor_Phase1_Completion_Report.pdf`](file:///c:/Users/athar/OneDrive/Desktop/NetDoctor/docs/NetDoctor_Phase1_Completion_Report.pdf)) |
| **Phase 2** | Networking Problem Detection & Validation | **COMPLETED** (Report: [`docs/NetDoctor_Phase2_Completion_Report.pdf`](file:///c:/Users/athar/OneDrive/Desktop/NetDoctor/docs/NetDoctor_Phase2_Completion_Report.pdf)) |
| **Phase 3** | Structured Diagnosis & Troubleshooting | **NEXT UP (Ready for implementation)** |
| **Phase 4** | Interactive Diagnostic Engine | *Planned* *(Review 2 Target: Phases 1–4)* |
| **Phase 5** | Advanced Diagnosis, Visual Guidance & Safety | *Planned* |
| **Phase 6** | Testing, Refinement & Final Polish | *Planned* |

---

## 5. How to Run the Application

### Start Development Server
```powershell
cd client
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your web browser.

### Run Automated Tests (32 Tests Passing)
```powershell
npm test
```

### Build Production Bundle
```powershell
npm run build
```

---

## 6. Project Documentation

- **Master PRD:** [`docs/PRD.md`](file:///c:/Users/athar/OneDrive/Desktop/NetDoctor/docs/PRD.md)
- **Technical Architecture:** [`docs/ARCHITECTURE.md`](file:///c:/Users/athar/OneDrive/Desktop/NetDoctor/docs/ARCHITECTURE.md)
- **Chat Handoff & Progress State:** [`docs/CHAT_HANDOFF_PROGRESS.md`](file:///c:/Users/athar/OneDrive/Desktop/NetDoctor/docs/CHAT_HANDOFF_PROGRESS.md)
- **Phase 1 Completion PDF:** [`docs/NetDoctor_Phase1_Completion_Report.pdf`](file:///c:/Users/athar/OneDrive/Desktop/NetDoctor/docs/NetDoctor_Phase1_Completion_Report.pdf)
- **Phase 2 Completion PDF:** [`docs/NetDoctor_Phase2_Completion_Report.pdf`](file:///c:/Users/athar/OneDrive/Desktop/NetDoctor/docs/NetDoctor_Phase2_Completion_Report.pdf)
