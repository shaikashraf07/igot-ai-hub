
# Aevoryn — iGOT AI Hub

<div align="center">

### AI-Enabled Learning Intelligence for India's Official Statistical System

**Smart India Hackathon 2026 · Team Aevoryn · Team ID 149685**

**Saveetha Institute of Medical and Technical Sciences**

<br/>

[![Status](https://img.shields.io/badge/status-Phase%2010%20validated-1f6feb?style=for-the-badge)](./)
[![Build](https://img.shields.io/badge/build-passing-2ea44f?style=for-the-badge)](./)
[![Repository](https://img.shields.io/badge/repository-private-8250df?style=for-the-badge)](./)

</div>

---

## ✦ The Idea

**Aevoryn** is an AI-enabled learning platform prototype designed around a closed-loop competency development journey for the Official Statistical System.

Instead of treating learning as a collection of courses, the platform connects **competency assessment, gap identification, personalized learning, progress, reassessment, and analytics** into one continuous intelligence loop.

> **Assess → Analyze → Recommend → Learn → Reassess → Improve**

The current implementation is an **SIH prototype**. iGOT connectivity is represented through a replaceable adapter layer so that authorized institutional integration can be introduced without redesigning the learning experience.

---

## ◈ Learning Intelligence Loop

~~~mermaid
flowchart LR
    A[👤 Learner] --> B[🎯 Diagnostic Assessment]
    B --> C[📊 Competency Profile]
    C --> D[🔎 Skill Gap Analysis]
    D --> E[🤖 Intelligent Recommendations]
    E --> F[📚 Personalized Learning]
    F --> G[📈 Progress Tracking]
    G --> H[🏁 Course Completion]
    H --> I[🔄 Reassessment]
    I --> C
    G --> J[📉 Analytics & Readiness]
~~~

The loop is intentionally persistent: learning activity feeds back into competency state rather than ending at course completion.

---

## ⚡ What the Platform Does

| Intelligence Layer | Capability |
|---|---|
| **Competency Intelligence** | Diagnostic assessment, competency profiling, benchmark comparison |
| **Gap Intelligence** | Dynamic skill-gap detection, severity, prioritization and development areas |
| **Learning Intelligence** | Personalized course discovery, matching and learning pathways |
| **Assessment Intelligence** | Automated scoring, assessment feedback and reassessment |
| **Progress Intelligence** | Enrollment, completion, learning progress and competency movement |
| **Analytics Intelligence** | Growth trends, readiness indicators, training hours and pathway milestones |
| **AI Insights** | Explainable assessment feedback, gap insights and recommendation rationale |
| **Integration Layer** | Replaceable iGOT adapter for future authorized ecosystem integration |

---

## 🧭 End-to-End Experience

~~~text
SIGN UP / LOGIN
      │
      ▼
PROFILE INITIALIZATION
      │
      ▼
DIAGNOSTIC ASSESSMENT
      │
      ▼
COMPETENCY PROFILE
      │
      ▼
SKILL GAP ANALYSIS
      │
      ▼
PERSONALIZED RECOMMENDATIONS
      │
      ▼
COURSE ENROLLMENT
      │
      ▼
LEARNING PROGRESS
      │
      ▼
COURSE COMPLETION
      │
      ▼
REASSESSMENT
      │
      ▼
UPDATED COMPETENCY STATE
      │
      ▼
ANALYTICS & READINESS
~~~

---

## 🏗️ System Architecture

~~~mermaid
flowchart TB
    U[👤 Learner / Administrator]

    UI[Web Application<br/>React + TypeScript]

    AUTH[Authentication]
    DB[(Supabase PostgreSQL)]
    AI[AI / LLM Insight Layer]
    N8N["n8n Automation Layer (planned)"]
    ADAPTER[iGOT Adapter]
    MOCK[Mock iGOT / Prototype Integration]

    U --> UI
    UI --> AUTH
    UI --> DB
    UI --> AI
    UI -.->|planned| N8N
    UI --> ADAPTER
    ADAPTER --> MOCK
    AI --> DB
    N8N -.->|planned| AI
    N8N -.->|planned| DB
~~~

### Integration principle

The prototype keeps iGOT connectivity behind an adapter boundary:

**Frontend → iGOT Adapter → Integration Provider**

This keeps the current prototype testable while preserving a path toward authorized institutional integration.

---

## 🧠 Core Modules

### 01 — Competency Profiling
- Role and cadre-aware learner profile
- Five competency dimensions
- Baseline competency initialization
- Persistent competency state

### 02 — Skill Gap Intelligence
- Competency-to-benchmark comparison
- Gap severity
- Development prioritization
- Personalized insight generation

### 03 — Personalized Learning
- Course catalogue
- Competency-gap-based matching
- Enrollment
- Progress tracking
- Completion state

### 04 — Assessment & Reassessment
- Diagnostic assessment
- Automated scoring
- AI-assisted feedback
- Post-learning reassessment
- Updated competency state

### 05 — Analytics
- Learning activity
- Competency movement
- Training hours
- Completion state
- Readiness indicators

### 06 — Secure Multi-User State
- Authenticated user-scoped data
- Persistent Supabase state
- Row-level access controls
- No cross-account course or assessment inheritance

---

## 🔐 Security & Data Integrity

The Phase 6/7 hardening work focused heavily on preventing prototype state from behaving like shared demo data.

Implemented controls include:

- Authenticated session-scoped learner data
- Supabase Row Level Security policies
- User-specific profiles, competencies, enrollments and assessments
- No frontend service-role key
- Protected assessment and reassessment persistence
- Clean initialization for new authenticated accounts
- Government-domain signup validation for new registrations
- Separation of mock/demo state from authenticated state
- Defensive null handling in AI insight generation

> **Prototype note:** real government employee data and production iGOT connectivity require authorized institutional integration and approved data-sharing arrangements.

---

## 🧪 Validation & QA

Phase 6/7 validation covered the complete learner journey rather than isolated screens.

### End-to-End QA

| Validation | Result |
|---|---:|
| Automated test steps | **25** |
| Passed | **22** |
| Non-fatal warnings | **2** |
| Informational observations | **1** |
| Failed | **0** |
| Blocked | **0** |
| TypeScript check | **Passed** |
| Production build | **Passed** |
| Multi-user isolation | **Verified** |
| Logout / re-login persistence | **Verified** |

### Verified Journey

**Login → Dashboard → Profile → Competencies → Skill Gaps → Assessment → AI Feedback → Recommendations → Course → Enrollment → Progress → Completion → Reassessment → Analytics → Logout → Re-login**

The QA process also verified that a second authenticated account starts from its own clean state and does not inherit another user's course progress, assessment history or learning activity.

---

## 🛠️ Technology Stack

<div align="center">

| Layer | Technology |
|---|---|
| Frontend | **React + TypeScript** |
| Application Build | **Vite** |
| Routing | **TanStack Router** |
| Data & Auth | **Supabase** |
| Database | **PostgreSQL** |
| AI Layer | **Mock AI Insight Engine (rule-based, context-grounded)** |
| Automation | **n8n (planned — not currently deployed)** |
| Integration | **iGOT Adapter (architectural boundary)** |
| Prototype Integration | **Mock iGOT Adapter (active)** |
| Validation | **TypeScript + automated UI QA** |

</div>

---

## 🚀 Local Development

### Prerequisites

- Node.js
- npm
- Supabase project credentials
- Git

### Setup

~~~bash
git clone https://github.com/Jaswanth300/igot-ai-hub-sih.git
cd igot-ai-hub-sih/frontend
npm install
~~~

Create a local environment file:

~~~env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_publishable_key
~~~

Start the development server:

~~~bash
npm run dev
~~~

For a production validation:

~~~bash
npx tsc --noEmit
npm run build
~~~

**Never commit private Supabase secret/service-role credentials or other sensitive environment values.**

---

## 📁 Project Structure

~~~text
igot-ai-hub-sih/
│
├── frontend/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── components/
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── PROMPTS/
│   ├── ...
│   └── ...
│
└── README.md
~~~

The application logic is intentionally organized around services and adapters so the UI remains separated from persistence, AI insights, domain logic and external integration concerns.

---

## 👥 Team Aevoryn

### Smart India Hackathon 2026

**Team ID:** <code>149685</code>

**Saveetha Institute of Medical and Technical Sciences**

| Role | Team Member |
|---|---|
| **Team Leader** | **Maniyar Mohammad Rehan** |
| Team Member | **Asmitha K** |
| Team Member | **Naga Jaswanth B** |
| Team Member | **Boorlagadda Chakritha** |
| Team Member | **Shaik Ashraf** |
| Team Member | **Maddirala Gopi Krishna Reddy** |

> Team contact details are intentionally not published in the repository README.

---

## 📌 Project Status

| Milestone | Status |
|---|---|
| Core prototype (Phase 1–3) | ✅ Completed |
| Competency Intelligence (Phase 4) | ✅ Completed |
| AI Insights & Personalization (Phase 5) | ✅ Completed |
| Supabase + Authentication (Phase 6) | ✅ Completed |
| Security & Data Hardening (Phase 7) | ✅ Validated |
| UI/UX + Accessibility Polish (Phase 8) | ✅ Completed |
| Full SIH QA + Demo Optimization (Phase 9) | ✅ Completed |
| Government Dataset Integration (Phase 10) | ✅ Completed |
| Final Technical Hardening + Freeze Prep | ✅ Completed |
| TypeScript check | ✅ Passing |
| Production build | ✅ Passing |
| Multi-user isolation | ✅ Validated |
| Live demo | ⏳ Coming later |
| Demo video | ⏳ Coming later |
| Final presentation | ⏳ Coming later |

---

## 🎬 Demo & Presentation

<div align="center">

**Live Demo**  
_Coming Soon_

**Demo Video**  
_Coming Soon_

**Final Presentation**  
_To be added after Phase 8/9 completion_

</div>

---

## 🔭 Roadmap

### Implemented (SIH Prototype)
- ✅ Competency-driven closed-loop learning workflow
- ✅ Persistent authenticated state (Supabase)
- ✅ Rule-based AI insights (context-grounded, no hallucination)
- ✅ Diagnostic assessment and reassessment
- ✅ Progress analytics and readiness indicators
- ✅ Multi-user isolation with RLS
- ✅ Government dataset integration (NSSTA/MoSPI reference data, Phase 10)
- ✅ iGOT Adapter boundary (ready for authorized institutional integration)

### Planned (Production Target / Future)
- ⏳ Authorized iGOT Karmayogi live API integration
- ⏳ n8n automation layer
- ⏳ Production observability infrastructure
- ⏳ Demo video and final presentation

---

<div align="center">

### Aevoryn

**Turning assessment data into an adaptive learning journey.**

<br/>

**Smart India Hackathon 2026 · Team 149685**

</div>
