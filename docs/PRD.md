# NetDoctor — Product Requirements Document

**Project Name:** NetDoctor  
**Project Type:** Network Diagnostic and Troubleshooting System  
**MVP Language:** English  
**Target Platform:** Web Application  
**Document Type:** Product Requirements Document  

---

## 1. Product Overview

NetDoctor is a network diagnostic system designed to help users identify and troubleshoot common networking problems through a structured, step-by-step diagnostic process.

The system allows users to describe their networking problem in natural language. NetDoctor determines whether the problem is networking-related, asks only the necessary follow-up questions, creates an appropriate diagnostic path, guides the user through network tests, interprets the results, identifies the likely root cause, provides a solution, and verifies whether the problem has been resolved.

NetDoctor is designed as a **network diagnostic system rather than a generic conversational application**.

### Core concept

**User Problem → Problem Identification → Diagnostic Roadmap → Tests → Result Analysis → Root Cause → Solution → Verification**

---

## 2. Product Goals

### Primary Goals

1. Identify common networking problems from natural-language descriptions.
2. Reject clearly non-networking problems immediately.
3. Handle vague networking problems through targeted follow-up questions.
4. Guide users through troubleshooting step by step.
5. Use evidence collected during diagnosis to determine the next step.
6. Explain why each diagnostic step is being performed.
7. Provide beginner-friendly instructions for running network commands.
8. Interpret command results in simple language.
9. Provide a clear final diagnosis.
10. Provide an appropriate solution and verify whether it worked.
11. Maintain the user's diagnostic progress throughout the current session.
12. Provide a professional, clean network-focused interface.

---

## 3. Problems Supported in MVP

The first version will focus on common end-user networking problems.

### Supported categories

* Internet not working
* Wi-Fi connection problems
* Slow Internet
* High ping / latency
* Packet loss
* DNS problems
* IP/DHCP problems
* Router connectivity
* Network adapter problems
* Website connectivity problems
* LAN/local network connectivity

### Unsupported problems

If a problem falls outside the supported diagnostic scope, NetDoctor should clearly state that the problem is currently outside the supported diagnostic scope rather than producing an unsupported or unreliable solution.

---

## 4. User Input Requirements

### 4.1 Natural-language input

Users should be able to describe their problem naturally.

Examples:
* "My internet is not working."
* "WiFi connected but no internet."
* "My internet keeps disconnecting."
* "Websites won't open."
* "My ping is very high."
* "The network is extremely slow."

NetDoctor should not require users to know networking terminology.

### 4.2 Different phrasings

The system should recognize different descriptions of the same problem.

For example:
* "Net is gone"
* "Internet isn't working"
* "WiFi connected but no internet"
* "Connected but can't browse"
* "Websites won't open"

These should be interpreted as potentially related networking problems.

### 4.3 Spelling mistakes and informal language

Minor spelling mistakes and informal language should be tolerated.

Example:
* "wifi keeps disconecting" should still be understood as a Wi-Fi disconnection problem.

---

## 5. Problem Validation

Before starting diagnosis, NetDoctor should determine whether the user's problem is related to networking.

### Networking problem
Proceed with diagnosis.

### Non-networking problem
Immediately inform the user that the entered problem is not related to networking and request a valid networking-related problem.

### Vague networking problem
Do not immediately choose a solution. Instead, ask only the questions required to identify the correct diagnostic path.

Example:
**User:** "My internet isn't working."  
**NetDoctor:** "Is the problem occurring on one device or multiple devices?"  

The system should not display a long questionnaire at the beginning.

---

## 6. OS Selection

NetDoctor should ask the user which operating system they are using.

### Supported options
* Windows
* macOS
* Linux
* Other

If the user selects **Other**, NetDoctor should explain that only the listed operating systems are currently supported.

OS selection should occur before providing OS-specific troubleshooting instructions.

---

## 7. Diagnostic Approach

NetDoctor should use a combination of:

### 1. Natural-language understanding
Used to understand the user's description and classify the networking problem.

### 2. Curated networking knowledge base
Contains:
* Networking concepts
* Troubleshooting procedures
* Commands
* Expected command results
* Common causes
* Solutions
* Prevention recommendations

### 3. Diagnostic rule engine
Controls:
* Diagnostic sequence
* Conditions
* Test selection
* Result interpretation
* Branching
* Reassessment
* Root-cause identification

The system should not rely on unrestricted generation for technical troubleshooting.

---

## 8. Diagnostic Workflow

The general diagnostic flow is:

```text
User describes problem
        ↓
Validate networking relevance
        ↓
Identify problem category
        ↓
Ask necessary follow-up questions
        ↓
Select diagnostic path
        ↓
Display diagnostic roadmap
        ↓
Perform diagnostic step
        ↓
User provides result
        ↓
Interpret result
        ↓
Select next step
        ↓
Identify root cause
        ↓
Provide solution
        ↓
Ask "Is your problem fixed?"
        ↓
Yes → Final summary
No  → Continue diagnosis
```

---

## 9. Diagnostic Roadmap

The complete diagnostic roadmap should be visible to the user.

Example:
```text
Network Diagnosis

1. Check network connection          Completed
2. Check IP configuration            Current
3. Check default gateway             Pending
4. Test DNS resolution               Pending
5. Verify Internet connectivity     Pending
```

The roadmap should visually indicate:
* Completed steps
* Current step
* Pending steps
* Failed steps where relevant

Users should understand where they are in the diagnosis.

---

## 10. Diagnostic Step Requirements

Every diagnostic step should contain:

### Step title
Example: *Check IP Configuration*

### Why this step is needed
Example: *This checks whether your device has received a valid IP address from the network.*

### Instructions
Provide detailed beginner-friendly instructions.

### Expected result
Explain what the user should normally see.

### Result submission
The user can:
* Paste command output
* Upload a screenshot
* Select a simple result option where appropriate

Example:
```text
Paste Output
Upload Screenshot

[The command worked]
[The command failed]
[Different result]
```

---

## 11. Command Instructions

NetDoctor should not automatically execute commands on the user's computer. The user must execute commands themselves.

Instructions should be beginner-friendly and detailed.

Example for Windows:
```text
1. Click the Windows Start button.
2. Type "Command Prompt".
3. Right-click Command Prompt.
4. Select "Run as administrator".
5. Enter:
   ipconfig /flushdns
6. Press Enter.
7. Copy the result and paste it below.
```

The instructions should explain what the command is checking and what the user should expect.

---

## 12. Command Result Interpretation

NetDoctor should automatically translate technical results into simple language.

Example:
Command result:
```text
Request timed out.
```
NetDoctor explanation:
> No response was received from the destination. This may indicate a connectivity, routing, firewall, or destination-side issue. The next diagnostic step will help narrow down the cause.

The system should use the result as evidence for selecting the next diagnostic step.

---

## 13. Adaptive Diagnosis

The diagnostic process must adapt based on test results.

Example:
```text
Check IP configuration
        ↓
Valid IP
        ↓
Check gateway
        ↓
Gateway reachable
        ↓
Check DNS
```

If the result contradicts the current diagnostic path:
```text
Current diagnosis
        ↓
Contradicting result
        ↓
Reassess
        ↓
Select different diagnostic path
```

NetDoctor must not continue blindly along an incorrect path.

---

## 14. Evidence Tracking

During the current diagnosis, NetDoctor should retain:
* User-provided information
* Follow-up answers
* Commands performed
* Command results
* Screenshots/results submitted
* Completed diagnostic steps
* Skipped steps
* Failed steps
* Reasons for selecting subsequent tests

This information should be used when producing the final diagnosis.

---

## 15. Avoiding Repeated Tests

NetDoctor should remember completed tests during the current diagnosis.

A test should not be repeated unless:
* The result needs verification
* Network conditions have changed
* The previous result was unclear
* A new diagnostic path requires confirmation

---

## 16. Skip Diagnostic Step

Users should be able to skip a diagnostic step if they already know the result.

Example:
> "I already know that my device has a valid IP address."

NetDoctor should record the known result and continue without unnecessarily repeating the test.

---

## 17. Backtracking

Users should be able to return to an earlier diagnostic step.

If the current path reaches a dead end:
```text
Current path
     ↓
No useful result
     ↓
Return to earlier decision
     ↓
Select alternate diagnostic path
```

Previously collected information should remain available.

---

## 18. "Why?" Functionality

Users should be able to ask why a diagnostic step is being performed.

Example:
**User:** "Why are you checking DNS?"  
NetDoctor should explain the purpose without resetting or losing diagnostic progress.

---

## 19. Resolution Verification

After a troubleshooting action that may resolve the problem, NetDoctor should explicitly ask:
> Is your problem fixed?

* **If Yes:** Proceed to final diagnosis summary.
* **If No:** Continue with the next diagnostic step.

---

## 20. Final Diagnosis

The final diagnosis should clearly communicate:
* **Problem identified:** What the user was experiencing.
* **Root cause:** What caused the problem.
* **Evidence:** Which tests/results supported the diagnosis.
* **Solution:** What action resolved or should resolve the problem.
* **What happened:** A simple explanation of the technical issue.
* **Steps that fixed it:** The relevant actions performed.
* **Prevention:** Useful recommendations to reduce recurrence where appropriate.

The system should present the most prominent cause first. Secondary possible causes should initially remain hidden and only be presented if the primary diagnostic path fails.

---

## 21. No Confidence Ratios

NetDoctor should **not display confidence percentages or confidence ratios**.

Do not display:
* `Confidence: 87%`
* `Probability: 0.87`

Once sufficient diagnostic evidence has been collected, the system should provide a clear diagnosis.

---

## 22. Session Context

During the current diagnosis, NetDoctor should remember everything already provided by the user.

The user should not have to repeatedly provide:
* Problem description
* OS
* Previous answers
* Test results
* Completed steps

However, NetDoctor should **not maintain a diagnosis history feature** after the session.

---

## 23. Stop Diagnosis

The interface should contain a **Stop Diagnosis** option to allow the user to leave the current troubleshooting process.

---

## 24. Start Over

A **Start Over** or **New Diagnosis** option should be available with a confirmation modal:
> "Starting a new diagnosis will clear your current diagnostic progress. Do you want to continue?"
> Options: [Cancel] [Start New Diagnosis]

---

## 25. Network Configuration Changes

NetDoctor may recommend network configuration changes when appropriate (DNS changes, network reset, adapter reset).

Potentially disruptive actions should display a warning before proceeding:
> "Network reset will remove saved network configurations and Wi-Fi networks. Continue only if you want to reset the network configuration."
> Options: [Cancel] [Continue]

---

## 26. Critical Problems

NetDoctor should identify situations that may require urgent attention (e.g., severe packet corruption, gateway ARP poisoning signs, interface hardware failure) and clearly warn the user.

---

## 27. Explanation Style

The system should use a consistent **beginner-friendly explanation style**. Technical terminology should be explained whenever necessary (e.g., explaining DNS, DHCP, Gateway, Subnet).

---

## 28. User Interface Direction

**Clean Network Dashboard** combining:
* Clean network dashboard
* Conversational interaction
* Subtle network visuals
* Structured diagnostic roadmap

The interface should look like a **professional network diagnostic product**, not a generic chatbot.

---

## 29. UI Design Principles

### Overall style
* Clean, professional, modern, light, network-focused, minimal, easy to understand.

### Strictly Avoid
* Cyberpunk / hacker appearance
* Excessive dark mode
* Excessive gradients or animations
* Cluttered dashboards
* Decorative elements that do not help the user
* Generic chatbot appearance

---

## 30. Color System

| Element | Color | Hex |
| --- | --- | --- |
| Page background | Very light blue-gray | `#F7F9FC` |
| Cards | White | `#FFFFFF` |
| Primary text | Dark navy | `#172033` |
| Secondary text | Slate gray | `#5B6577` |
| Primary action | Network blue | `#2563EB` |
| Secondary accent | Teal | `#0F9D9A` |
| Borders | Light gray-blue | `#E2E8F0` |
| Success | Green | `#16A34A` |
| Warning | Amber | `#D97706` |
| Error | Red | `#DC2626` |

---

## 31. Typography

* **Primary Font:** Inter (Fallback: `Arial, sans-serif`)
* **Weights:** Main/Section Headings: 600 Semi-Bold | Subheadings/Buttons: 500 Medium | Normal text: 400 Regular
* **Sizes:** Main Heading (28px), Section Heading (22px), Normal Content (15px), Buttons (14px).

---

## 32. Icon and Graphic Policy

* Clean, professional UI icons.
* Network topology visuals where they improve comprehension.
* Subtle, non-cluttering visuals.

---

## 33. No Emojis or Stickers

NetDoctor should **not use emojis or sticker-style graphics**. Use text, clean SVG icons, status indicators, and clean typography.

---

## 34. No AI Branding

The user-facing product should **not mention AI** (no "AI-powered", "AI diagnosis", "AI assistant", etc.). The system presents itself purely as:
**NetDoctor — Network Diagnostic System**

---

## 35. No Confidence Information

No probability scores, confidence percentages, or certainty ratios anywhere in the interface.

---

## 36. Home Screen

* **Header:** NetDoctor | Network Diagnostic System
* **Main Prompt:** What’s wrong with your network?
* **Input:** Large natural-language input field.
* **Action:** Start Diagnosis button.
* **Common problems:** Quick select pills/cards (Internet not working, Wi-Fi problems, Slow Internet, High ping, DNS problems).

---

## 37. Diagnostic Workspace

Two-panel / structured layout:
* Left / Top Roadmap: Diagnostic steps with completed, current, pending, failed statuses.
* Right / Center Action Area: Current step title, "Why we are doing this", instructions, expected results, copyable commands, result submission (pasted output, screenshot upload, quick outcome buttons).

---

## 38. Information & System Architecture

```text
Home → Problem Validation → OS Selection → Follow-up Questions → Diagnostic Roadmap → Step Execution → Result Analysis → Root Cause → Solution → Verification → Summary
```

Modular components:
1. Frontend/UI
2. Problem Parser & Classifier
3. Follow-up Question Manager
4. Diagnostic Rule Engine
5. Curated Networking Knowledge Base
6. Diagnostic State Manager
7. Command/Result Interpreter
8. Solution & Verification Engine

---

## 39. Six Development Phases

1. **Phase 1 — UI & Project Foundation**
2. **Phase 2 — Networking Problem Detection & Validation**
3. **Phase 3 — Structured Diagnosis & Troubleshooting**
4. **Phase 4 — Interactive Diagnostic Engine**
5. **Phase 5 — Advanced Diagnosis, Visual Guidance & Safety**
6. **Phase 6 — Testing, Refinement & Final Polish**

*Review 2 Target:* Demonstration of Phases 1 through 4.
