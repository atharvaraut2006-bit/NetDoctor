# NetDoctor — Technical Architecture & System Specification

**Project Name:** NetDoctor  
**Project Type:** Network Diagnostic and Troubleshooting System  
**Target Platform:** Web Application  
**Document Version:** 1.0  
**Specification Date:** October 2026  

---

## 1. Technical Stack & Technology Rationale

The NetDoctor technical stack is purposefully selected to deliver a fast, reliable, deterministic, and self-contained system suitable for college project evaluation, viva demonstration, and production deployment without requiring paid third-party APIs or complex cloud configurations.

| Layer | Technology Choice | Purpose in NetDoctor | Appropriateness & Rationale for College Project & PRD |
|---|---|---|---|
| **Frontend Framework** | **React 18 with Vite** | Single-page application UI, component modularity, state reactivity | • Fast startup and instant Hot Module Replacement (HMR) with Vite.<br>• Component-driven architecture allows clean separation of the Diagnostic Roadmap, Step Viewer, and Command Box.<br>• Standard, well-understood web framework for academic defense and examiner review. |
| **Styling & Design System** | **Vanilla CSS (CSS Custom Properties)** | Implementation of "Clean Network Dashboard" design | • Zero external CSS framework bloat (no Tailwind collisions or unneeded utilities).<br>• Complete pixel-level adherence to PRD design tokens (`#F7F9FC`, `#2563EB`, `#0F9D9A`, `#172033`).<br>• Lightweight, ultra-fast rendering, and native CSS variable theme management. |
| **Icons & Visuals** | **Custom SVG & Lucide SVG Icons** | Professional UI icons and network diagrams | • PRD strictly prohibits emojis and stickers.<br>• Clean, crisp vector rendering across all screen resolutions.<br>• Zero external runtime dependencies. |
| **Backend Runtime & Framework** | **Node.js 24 + Express (TypeScript)** | REST API, Diagnostic Rule Engine, Classifier, Output Interpreter | • Unified TypeScript stack across frontend and backend allows shared interface types (`DiagnosticStep`, `SessionState`, `CommandResult`).<br>• Lightweight, fast asynchronous execution for regex string parsing and text processing.<br>• Simple single-command setup (`npm run dev`) that runs offline on any computer. |
| **Natural-Language Understanding** | **Deterministic Tokenized NLP & Fuzzy Matcher** | Classify user problem, detect typos, filter non-networking, handle vague inputs | • **Strictly adheres to PRD requirement:** No external AI branding or black-box non-deterministic LLMs.<br>• 100% offline, predictable, fast, and testable with standard unit test fixtures.<br>• Employs keyword weight graphs, synonym expansion, and Levenshtein distance for spelling mistake tolerance. |
| **Command Output & OCR Interpreter** | **Regex Parsing Engine + Tesseract.js (OCR)** | Parsing raw CLI output (`ipconfig`, `ping`, `nslookup`, `tracert`) and screenshot OCR | • Deterministic pattern recognition matches operating system-specific error strings.<br>• Client/Server OCR extracts text from user screenshots without requiring cloud computer vision APIs.<br>• Beginner-friendly translations mapped directly to technical error signatures. |
| **Session & State Storage** | **In-Memory Session Store + React Context** | Active diagnostic session tracking, evidence log, roadmap states | • PRD mandates session-bound diagnosis with no cross-session user history.<br>• Eliminates database setup, migrations, or database server dependencies for project evaluation.<br>• High performance with instant state restoration and backtracking support. |
| **Testing & Quality Assurance** | **Vitest / Jest** | Unit and integration testing of rules, parsers, and diagnostic paths | • Fast test execution for verifying 100+ diagnostic branching scenarios.<br>• Provides verifiable code coverage and validation metrics for college evaluation. |

---

## 2. System Architecture

NetDoctor operates as an evidence-driven, closed-loop diagnostic system. The architecture separates presentation, diagnostic decision logic, command interpretation, and domain knowledge.

```text
                               ┌─────────────────────────────────────────┐
                               │               USER BROWSER              │
                               │  ┌───────────────────────────────────┐  │
                               │  │   Clean Network Dashboard (React) │  │
                               │  │   - Natural Language Input Box    │  │
                               │  │   - Dynamic Diagnostic Roadmap    │  │
                               │  │   - Interactive Step Action Card  │  │
                               │  │   - "Why?" Modal & Output Forms   │  │
                               │  └─────────────────▲─────────────────┘  │
                               └────────────────────┼────────────────────┘
                                                    │ HTTP / JSON REST API
                               ┌────────────────────▼────────────────────┐
                               │             EXPRESS BACKEND             │
                               │                                         │
                               │  ┌───────────────────────────────────┐  │
                               │  │         API Route Handlers        │  │
                               │  │   (/api/diagnostics/*)            │  │
                               │  └─────────────────▲─────────────────┘  │
                               │                    │                    │
┌──────────────────────────────┼────────────────────┼────────────────────┼──────────────────────────────┐
│                              │  ┌─────────────────▼─────────────────┐  │                              │
│                              │  │      DIAGNOSTIC CONTROLLER        │  │                              │
│                              │  └───────▲───────────▲─────────▲─────┘  │                              │
│                              │          │           │         │        │                              │
│  ┌────────────────────────┐  │  ┌───────▼────────┐  │  ┌──────▼──────┐ │  ┌────────────────────────┐  │
│  │   PROBLEM CLASSIFIER   │  │  │   RULE ENGINE  │  │  │   COMMAND   │ │  │     KNOWLEDGE BASE     │  │
│  │  - Relevance Filter    ├──┼──► - State Graph  │  └──► INTERPRETER │◄┼──┤  - 11 MVP Categories   │  │
│  │  - Vague Detector      │  │  │ - Branching    │     │ - Regexes   │ │  │  - Multi-OS Commands   │  │
│  │  - Typo / Fuzzy Parser │  │  │ - Backtracking │     │ - Plain Lang│ │  │  - Root Cause Mappings │  │
│  └────────────────────────┘  │  └───────▲────────┘     └─────────────┘ │  │  - Explanations ("Why")│  │
│                              │          │                              │  └────────────────────────┘  │
│                              │  ┌───────▼────────┐                     │                              │
│                              │  │    EVIDENCE    │                     │                              │
│                              │  │    TRACKER     │                     │                              │
│                              │  └────────────────┘                     │                              │
└──────────────────────────────┼─────────────────────────────────────────┼──────────────────────────────┘
                               │  ┌───────────────────────────────────┐  │
                               │  │      IN-MEMORY SESSION STORE      │  │
                               │  └───────────────────────────────────┘  │
                               └─────────────────────────────────────────┘
```

---

## 3. Frontend Architecture

### 3.1 Design Principles & UI Layout
The user interface implements the **Clean Network Dashboard** specification:
- **Light Theme:** `#F7F9FC` background with crisp `#FFFFFF` cards and `#E2E8F0` borders.
- **Typography:** `Inter` Google font with weights `600` (headings), `500` (buttons/subheadings), and `400` (body).
- **Two-Column Diagnostic Workspace:**
  - **Left Panel (30% width):** Sticky Diagnostic Roadmap showing active step, completed steps with checkmarks, pending steps, and failed steps.
  - **Right Panel (70% width):** Active diagnostic step details, "Why are we doing this?" badge, beginner command instructions with a copy button, output submission tabs (Quick Result buttons, Paste Output, Screenshot Upload), and Backtrack/Skip controls.

### 3.2 Component Hierarchy

```text
App
├── Header (Branding: NetDoctor | Network Diagnostic System, Status Indicator, Reset Button)
├── Main Content Container
│   ├── [Home View] (Active when no diagnostic session running)
│   │   ├── HeroPrompt ("What's wrong with your network?")
│   │   ├── NaturalLanguageInput (Textarea + Submit button)
│   │   ├── CommonProblemsGrid (Clickable problem pill cards)
│   │   └── OSSelectorModal (Windows, macOS, Linux, Other)
│   │
│   ├── [FollowUp View] (Active when problem is vague or ambiguous)
│   │   ├── ProblemSummaryBadge
│   │   ├── FollowUpQuestionCard (Single targeted question with clear choices)
│   │   └── ClarificationHelperText
│   │
│   ├── [Workspace View] (Active during diagnostic process)
│   │   ├── RoadmapSidebar
│   │   │   ├── SessionHeader (Category, Selected OS, Progress Bar)
│   │   │   ├── StepList (Completed, Active, Pending, Failed items)
│   │   │   └── SessionControls (Skip Step, Backtrack, Stop Diagnosis)
│   │   │
│   │   └── ActionPanel
│   │       ├── StepHeader (Title, Step Number, Category Tag)
│   │       ├── WhyBadge (Clickable button opening "Why this step is needed" drawer)
│   │       ├── InstructionsCard (Step-by-step beginner guide + expected outcome)
│   │       ├── CommandBox (Syntax-highlighted command with 1-click Copy button)
│   │       ├── ResultSubmissionTabs
│   │       │   ├── QuickOptionButtons ([Worked as expected], [Failed/Timed out], [Different result])
│   │       │   ├── PasteOutputForm (Textarea for terminal outputs + "Analyze Result" button)
│   │       │   └── ScreenshotUploadForm (Drag-and-drop image dropzone + OCR extraction)
│   │       └── OutputInterpretationBox (Plain-language technical explanation of submitted result)
│   │
│   └── [Resolution View] (Active when root cause is identified or verified)
│       ├── VerificationPrompt ("Is your problem fixed?" -> [Yes] / [No])
│       ├── FinalDiagnosisSummary
│       │   ├── ProblemIdentifiedCard
│       │   ├── RootCauseCard
│       │   ├── EvidenceList (List of all verified test outcomes)
│       │   ├── SolutionInstructionsCard
│       │   ├── TechnicalSummary ("What Happened")
│       │   └── PreventionRecommendationsCard
│       └── StartOverButton (Opens confirmation modal)
│
├── WhyModal / Drawer (Displays engineering context for active step without resetting progress)
├── WarningModal (Safety warnings for disruptive actions like DNS flush or Network Reset)
└── ConfirmModal (Start over / Cancel confirmation)
```

### 3.3 Frontend State Management (`DiagnosticContext`)

```typescript
interface DiagnosticUIState {
  sessionId: string | null;
  currentView: 'HOME' | 'FOLLOW_UP' | 'WORKSPACE' | 'RESOLUTION';
  selectedOS: 'windows' | 'macos' | 'linux' | 'other' | null;
  rawUserInput: string;
  identifiedCategory: string | null;
  isVague: boolean;
  activeFollowUp: FollowUpQuestion | null;
  
  // Diagnostic Progress
  roadmap: RoadmapStep[];
  currentStepIndex: number;
  activeStep: DiagnosticStep | null;
  
  // Execution & Evidence
  history: StepHistoryEntry[];
  evidence: EvidenceRecord[];
  currentInterpretation: InterpretationResult | null;
  
  // Resolution & Verification
  rootCause: RootCauseRecord | null;
  solution: SolutionRecord | null;
  isResolved: boolean | null;
  
  // UI Status
  isLoading: boolean;
  error: string | null;
  showWhyModal: boolean;
  showWarningModal: boolean;
  warningDetails: WarningConfig | null;
}
```

---

## 4. Backend Architecture

### 4.1 Modular Structure
The Express backend is organized into specialized services:
1. **`ProblemClassifierService`**: Processes raw text input, performs classification, handles spelling corrections, detects non-networking topics, and triggers targeted follow-up questions.
2. **`RuleEngineService`**: Maintains the diagnostic state graph, determines the initial roadmap, computes next step transitions based on test evidence, handles adaptive path switching, and resolves root causes.
3. **`CommandInterpreterService`**: Receives raw terminal output or OCR text, executes regex-based syntax and error parsing, categorizes the outcome (SUCCESS, PARTIAL, FAILURE, TIMEOUT, UNREACHABLE, INVALID_CONFIG), and generates beginner-friendly explanations.
4. **`KnowledgeBaseService`**: Curates all domain knowledge, commands for Windows/macOS/Linux, step rationale ("Why"), solutions, and prevention recommendations.
5. **`SessionManager`**: Handles active in-memory session records with automatic eviction of stale sessions (e.g., after 2 hours of inactivity).

---

## 5. Diagnostic Engine Design

### 5.1 Directed Graph State Machine
The diagnostic engine models network troubleshooting as a deterministic Directed Graph where nodes represent diagnostic steps and edges represent evidence-based transitions.

```text
                      [Start Diagnostic Path]
                                 │
                     ┌───────────▼───────────┐
                     │ STEP: Physical/Wi-Fi  │
                     │ Check Interface Link  │
                     └───────────┬───────────┘
                       Connected │ Disconnected
             ┌───────────────────┴───────────────────┐
             ▼                                       ▼
  ┌───────────────────────┐               ┌───────────────────────┐
  │ STEP: IP / DHCP Check │               │ ROOT CAUSE:           │
  │ Run ipconfig/ifconfig │               │ Wi-Fi/NIC Interface   │
  └──────────┬────────────┘               │ Disabled or Unlinked  │
     Valid IP│ 169.254.x.x (APIPA) / No IP └───────────────────────┘
  ┌──────────┴────────────┐
  ▼                       ▼
┌──────────────────┐    ┌───────────────────────────────────┐
│ STEP: Gateway    │    │ ROOT CAUSE:                       │
│ Ping Gateway IP  │    │ DHCP Server Unreachable / IP Fail │
└────────┬─────────┘    └───────────────────────────────────┘
   Success│ Failure
  ┌───────┴───────────────┐
  ▼                       ▼
┌──────────────────┐    ┌───────────────────────────────────┐
│ STEP: DNS Query  │    │ ROOT CAUSE:                       │
│ nslookup / dig   │    │ Local Router / Gateway Down       │
└────────┬─────────┘    └───────────────────────────────────┘
   Success│ Failure
  ┌───────┴───────────────┐
  ▼                       ▼
┌──────────────────┐    ┌───────────────────────────────────┐
│ STEP: Internet   │    │ ROOT CAUSE:                       │
│ Ping 8.8.8.8     │    │ DNS Server Configuration Failure  │
└────────┬─────────┘    └───────────────────────────────────┘
   Success│ Failure
  ┌───────┴───────────────┐
  ▼                       ▼
┌──────────────────┐    ┌───────────────────────────────────┐
│ STEP: HTTP Ping  │    │ ROOT CAUSE:                       │
│ Curl / Browser   │    │ ISP WAN / Routing Disconnection   │
└──────────────────┘    └───────────────────────────────────┘
```

### 5.2 Adaptive Reassessment & Backtracking Logic
When a user submits a test result that contradicts the current hypothesis (e.g., user reported "Internet down" but Gateway and 8.8.8.8 are both reachable):
1. The engine records the new evidence item in `evidenceTracker`.
2. It detects a path contradiction.
3. It recalculates the active hypothesis and dynamically reconfigures the roadmap (e.g., switches path to *DNS / Host Resolution Failure* or *Firewall / Proxy Blocking*).
4. Completed valid steps are preserved so tests are **never repeated unnecessarily**.

---

## 6. Knowledge-Base Structure

The knowledge base is structured as strongly-typed, immutable modules:

### 6.1 Knowledge Base Data Schemas

```typescript
// 1. Problem Category Definition
interface ProblemCategory {
  id: string; // e.g., 'dns_failure', 'wifi_disconnect', 'slow_internet'
  displayName: string;
  description: string;
  keywords: string[];
  vagueIndicators: string[];
  defaultFirstStepId: string;
  primaryRoadmap: string[]; // Sequence of step IDs
}

// 2. Diagnostic Step Procedure
interface DiagnosticStepDefinition {
  id: string;
  title: string;
  category: string;
  whyNeeded: string;
  explanation: string;
  instructions: {
    windows: string[];
    macos: string[];
    linux: string[];
  };
  commands: {
    windows: string;
    macos: string;
    linux: string;
  };
  expectedResult: {
    summary: string;
    sampleOutput: string;
  };
  isDisruptive: boolean;
  disruptiveWarning?: string;
}

// 3. Command Result Interpretation Pattern
interface ResultPatternRule {
  stepId: string;
  pattern: RegExp;
  outcomeType: 'SUCCESS' | 'FAILURE' | 'PARTIAL' | 'TIMEOUT' | 'UNREACHABLE' | 'APIPA' | 'DNS_FAIL';
  plainLanguageExplanation: string;
  evidenceKey: string;
  evidenceValue: any;
  nextStepId?: string;
  rootCauseId?: string;
}

// 4. Root Cause & Solution Definition
interface RootCauseDefinition {
  id: string;
  problemTitle: string;
  rootCause: string;
  technicalExplanation: string;
  evidenceSummaryTemplate: string;
  solutionSteps: string[];
  verificationStepId: string;
  preventionRecommendations: string[];
}
```

---

## 7. Natural-Language Problem Classification Approach

To adhere strictly to PRD requirements (zero ungrounded generation, zero AI branding, high predictability, and tolerance for typos/phrasings):

```text
Raw User String: "wifi keeps disconecting on my laptop"
                      │
                      ▼
 ┌────────────────────────────────────────────────────────┐
 │ Stage 1: Text Sanitization & Normalization             │
 │ - Lowercase, strip punctuation, tokenize               │
 │ - Normalized Tokens: ['wifi', 'keeps', 'disconecting', │
 │                       'on', 'my', 'laptop']            │
 └────────────────────────────┬───────────────────────────┘
                              │
                              ▼
 ┌────────────────────────────────────────────────────────┐
 │ Stage 2: Non-Networking Filter Check                   │
 │ - Check against blacklists (printers, screen, audio)   │
 │ - Result: Is Networking = TRUE                         │
 └────────────────────────────┬───────────────────────────┘
                              │
                              ▼
 ┌────────────────────────────────────────────────────────┐
 │ Stage 3: Typo Correction & Fuzzy Stemming              │
 │ - Levenshtein distance matching against domain lexicon │
 │ - 'disconecting' -> 'disconnecting' (edit distance 1)  │
 └────────────────────────────┬───────────────────────────┘
                              │
                              ▼
 ┌────────────────────────────────────────────────────────┐
 │ Stage 4: Vague Input Detector                          │
 │ - Matches vague patterns ("net not working", "slow")   │
 │ - Result: Specific (Wi-Fi disconnection pattern)       │
 └────────────────────────────┬───────────────────────────┘
                              │
                              ▼
 ┌────────────────────────────────────────────────────────┐
 │ Stage 5: Category Scoring & Confidence Ranking         │
 │ - Score weights for categories:                        │
 │   * wifi_connection_issues: 95 pts                     │
 │   * internet_not_working: 30 pts                       │
 │ - Matched Category: 'wifi_connection_issues'           │
 └────────────────────────────────────────────────────────┘
```

---

## 8. Diagnostic State Model

```typescript
export interface SessionState {
  sessionId: string;
  createdAt: number;
  lastActiveAt: number;
  os: 'windows' | 'macos' | 'linux' | 'other';
  rawProblemDescription: string;
  category: string;
  status: 'ANALYZING' | 'IN_PROGRESS' | 'AWAITING_VERIFICATION' | 'RESOLVED' | 'STOPPED';
  
  // Roadmap & Steps
  activeStepId: string;
  roadmap: Array<{
    stepId: string;
    title: string;
    status: 'COMPLETED' | 'ACTIVE' | 'PENDING' | 'FAILED' | 'SKIPPED';
    executedAt?: number;
  }>;
  
  // Evidence & Step History
  stepHistory: Array<{
    stepId: string;
    submittedAt: number;
    submissionType: 'QUICK_OPTION' | 'PASTE_OUTPUT' | 'SCREENSHOT';
    rawInput: string;
    outcomeType: string;
    interpretation: string;
  }>;
  
  evidence: Record<string, any>;
  
  // Result
  diagnosisResult?: {
    problemTitle: string;
    rootCause: string;
    evidenceItems: string[];
    solutionSteps: string[];
    technicalExplanation: string;
    preventionTips: string[];
  };
}
```

---

## 9. API Structure

All API routes follow standard REST conventions, accepting and returning `application/json`.

| Method | Endpoint | Request Body | Response Payload | Description |
|---|---|---|---|---|
| `POST` | `/api/diagnostics/classify` | `{ text: string }` | `{ isNetworking: boolean, category: string, isVague: boolean, followUp?: Question }` | Analyzes problem description and validates relevance |
| `POST` | `/api/diagnostics/start` | `{ category: string, os: string, followUpAnswer?: string }` | `{ sessionId: string, roadmap: RoadmapStep[], activeStep: DiagnosticStep }` | Initializes diagnostic session and builds initial roadmap |
| `POST` | `/api/diagnostics/submit-result` | `{ sessionId: string, stepId: string, type: 'QUICK'\|'OUTPUT'\|'OCR', content: string }` | `{ interpretation: string, outcome: string, nextStep?: DiagnosticStep, rootCause?: RootCause }` | Evaluates test result, updates evidence, and advances workflow |
| `POST` | `/api/diagnostics/ocr-parse` | `Multipart FormData (image file)` | `{ extractedText: string, detectedCommand?: string }` | Performs OCR on uploaded terminal screenshot |
| `POST` | `/api/diagnostics/skip` | `{ sessionId: string, stepId: string, knownResult?: string }` | `{ roadmap: RoadmapStep[], nextStep: DiagnosticStep }` | Skips current step while recording user-known outcome |
| `POST` | `/api/diagnostics/backtrack` | `{ sessionId: string, targetStepId: string }` | `{ roadmap: RoadmapStep[], activeStep: DiagnosticStep }` | Returns to a previously completed step to re-evaluate |
| `GET` | `/api/diagnostics/why/:stepId` | *None* | `{ stepId: string, whyNeeded: string, technicalContext: string }` | Retrieves beginner-friendly rationale for a specific step |
| `POST` | `/api/diagnostics/verify` | `{ sessionId: string, isFixed: boolean }` | `{ isResolved: boolean, finalSummary?: FinalDiagnosis, nextStep?: DiagnosticStep }` | Handles "Is your problem fixed?" verification response |
| `POST` | `/api/diagnostics/reset` | `{ sessionId: string }` | `{ success: boolean }` | Clears active session state on user confirmation |

---

## 10. Folder Structure

```text
NetDoctor/
├── docs/
│   ├── PRD.md                       # Master Product Requirements Document
│   └── ARCHITECTURE.md              # Technical Architecture & System Specification
├── README.md                        # Project Overview & Setup Instructions
│
├── client/                          # React Frontend (Vite)
│   ├── public/
│   │   ├── favicon.ico
│   │   └── assets/                  # Clean SVGs (Network logos, topology diagrams)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Header.tsx       # NetDoctor branding, Clean status indicator
│   │   │   │   ├── Button.tsx       # Primary blue (#2563EB), Outline, Danger buttons
│   │   │   │   ├── Card.tsx         # White card containers (#FFFFFF, #E2E8F0 borders)
│   │   │   │   ├── Modal.tsx        # Accessible confirmation and warning dialogs
│   │   │   │   └── Icons.tsx        # Custom SVG icon set (strictly no emojis)
│   │   │   ├── home/
│   │   │   │   ├── ProblemInput.tsx # Natural-language prompt box & submit
│   │   │   │   ├── CommonProblems.tsx # 5 quick-select problem pill cards
│   │   │   │   └── OSSelector.tsx   # Windows, macOS, Linux selector dialog
│   │   │   ├── roadmap/
│   │   │   │   ├── RoadmapList.tsx  # Left-panel diagnostic step tracker
│   │   │   │   └── RoadmapItem.tsx  # Completed, Active, Pending, Failed item rows
│   │   │   ├── workspace/
│   │   │   │   ├── StepViewer.tsx   # Right-panel active step instructions & why badge
│   │   │   │   ├── CommandBox.tsx   # OS-specific command display + copy button
│   │   │   │   ├── QuickOptions.tsx # Simple [Worked] / [Failed] / [Other] buttons
│   │   │   │   ├── OutputForm.tsx   # Pasted CLI output text submission
│   │   │   │   └── OCRUpload.tsx    # Drag-and-drop screenshot submission
│   │   │   └── resolution/
│   │   │       ├── Verification.tsx # "Is your problem fixed?" prompt
│   │   │       └── DiagnosisSummary.tsx # Structured final report & prevention tips
│   │   ├── context/
│   │   │   └── DiagnosticContext.tsx # Centralized active session state provider
│   │   ├── services/
│   │   │   └── api.ts               # Axios / Fetch client for backend endpoints
│   │   ├── styles/
│   │   │   ├── variables.css        # PRD Colors (#F7F9FC, #2563EB, #0F9D9A, etc.)
│   │   │   ├── global.css           # Global typography (Inter) and CSS reset
│   │   │   ├── layout.css           # Workspace grid (Roadmap + Action panel)
│   │   │   └── components.css       # Clean Network Dashboard component styling
│   │   ├── types/
│   │   │   └── diagnostic.ts        # Shared TypeScript client models
│   │   ├── App.tsx                  # Main app container & view router
│   │   └── main.tsx                 # Client entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                          # Express Backend (Node.js + TypeScript)
│   ├── src/
│   │   ├── controllers/
│   │   │   └── diagnosticController.ts # REST API route handlers
│   │   ├── engine/
│   │   │   ├── classifier.ts        # Problem NLP classifier & typo handler
│   │   │   ├── ruleEngine.ts        # Diagnostic state machine & branching engine
│   │   │   ├── commandInterpreter.ts# Output regex parsers & plain-language engine
│   │   │   └── evidenceTracker.ts   # Session evidence aggregator
│   │   ├── knowledge/
│   │   │   ├── categories.ts        # 11 MVP problem category definitions
│   │   │   ├── steps.ts             # Step procedures, instructions, expected results
│   │   │   ├── commands.ts          # OS-specific CLI commands (Win, Mac, Linux)
│   │   │   ├── interpretations.ts   # Regex patterns & plain explanations
│   │   │   └── rootCauses.ts        # Root causes, solutions, prevention guides
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts      # Global API error handler
│   │   │   └── sessionValidator.ts  # In-memory session validator
│   │   ├── routes/
│   │   │   └── diagnosticRoutes.ts  # API route definitions
│   │   ├── types/
│   │   │   └── index.ts             # Backend TypeScript interfaces
│   │   └── index.ts                 # Express server startup
│   ├── package.json
│   └── tsconfig.json
│
└── tests/                           # Test Suites
    ├── classifier.test.ts           # Problem parser & typo tolerance test cases
    ├── commandInterpreter.test.ts   # CLI regex parsing & interpretation test cases
    └── diagnosticFlows.test.ts      # End-to-end simulated troubleshooting paths
```

---

## 11. Testing Strategy

| Test Layer | Tools | Scope & Key Test Cases |
|---|---|---|
| **Problem Classifier Unit Tests** | Vitest | • Validates all 11 MVP categories.<br>• Non-networking rejection (e.g., "mouse not working", "printer paper jam").<br>• Typo tolerance (e.g., "wifi keeps disconecting", "dns errer").<br>• Vague query detection (e.g., "internet broken" -> triggers follow-up). |
| **Command Interpreter Unit Tests** | Vitest | • Windows `ipconfig /all` parsing (APIPA `169.254.x.x`, valid gateway).<br>• `ping` output parsing (TTL, packet loss, "Request timed out").<br>• `nslookup` output parsing (DNS request timed out, Non-existent domain).<br>• Linux `ip addr` and macOS `networksetup` output parsing. |
| **Diagnostic Rule Engine Tests** | Vitest | • Simulates complete diagnostic paths (e.g., DNS failure path, Gateway unreachable, Wi-Fi adapter disabled).<br>• Backtracking test: verifies evidence retention when returning to prior steps.<br>• Skip test: confirms correct pathway continuation when steps are skipped. |
| **End-to-End API Tests** | Supertest | • Full session lifecycle: Classify -> Start -> Submit Step 1 -> Submit Step 2 -> Root Cause -> Verify -> Final Summary. |
| **UI Adherence Tests** | Playwright / Browser Agent | • Verifies Clean Network Dashboard design, Inter font, color tokens, and strict absence of emojis/AI badges. |

---

## 12. Phase-by-Phase Implementation Plan

```text
Phase 1: UI & Project Foundation (Clean Network Dashboard, Home, Workspace Shell)
Phase 2: Networking Problem Detection & Validation (NLP parser, typos, follow-ups, OS selection)
Phase 3: Structured Diagnosis & Troubleshooting (Knowledge Base, CLI command library, regex engine)
Phase 4: Interactive Diagnostic Engine (Roadmap tracking, branching, verification, final summary)
         ───► [REVIEW 2 MILESTONE: Complete demonstration of Phases 1 to 4]
Phase 5: Advanced Diagnosis, Visual Guidance & Safety (Screenshot OCR, safety warnings, network diagrams)
Phase 6: Testing, Refinement & Final Polish (Edge cases, cross-platform validation, demo readiness)
         ───► [FINAL SUBMISSION]
```

---
*NetDoctor Technical Architecture Document — Ready for Review and Execution.*
