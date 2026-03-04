# EcoMart AI — Frontend

> React 18 + Vite frontend for the EcoMart AI sustainable B2B commerce backend.

## Design System — "Forest Luxe"

| Token | Value |
|---|---|
| Primary font | Cormorant Garamond (display headings) |
| Body font | Plus Jakarta Sans |
| Primary dark | `#0A1F14` — deep forest green |
| Accent | `#C9943A` — burnished gold |
| Background | `#F7F3EC` — warm ivory |
| Border | `rgba(93,176,126,0.15)` |

## Folder Structure

```
src/
├── api/
│   ├── apiClient.js        ← Axios instance, interceptors, error handling
│   ├── categoryApi.js      ← Module 1 API calls (mirrors backend routes)
│   └── proposalApi.js      ← Module 2 API calls
├── components/
│   ├── layout/
│   │   ├── Layout.jsx      ← App shell, page header
│   │   └── Sidebar.jsx     ← Navigation sidebar with active states
│   ├── common/
│   │   ├── AiLoader.jsx    ← Animated AI processing indicator
│   │   ├── Badge.jsx       ← Status/filter badges
│   │   ├── Button.jsx      ← Multi-variant button
│   │   ├── EmptyState.jsx  ← Empty content placeholder
│   │   ├── ErrorAlert.jsx  ← Inline error display
│   │   ├── Pagination.jsx  ← Page controls
│   │   └── TagsInput.jsx   ← Chip input for materials
│   ├── category/
│   │   ├── CategoryForm.jsx       ← Product input form (Module 1)
│   │   └── CategoryResultCard.jsx ← Structured result display
│   └── proposal/
│       ├── ProposalForm.jsx    ← Multi-section B2B brief form (Module 2)
│       ├── BudgetGauge.jsx     ← Animated budget visualisation
│       ├── LineItemsTable.jsx  ← Product breakdown with DB-verified prices
│       └── ProposalCard.jsx    ← Proposal list item card
├── hooks/
│   ├── useCategory.js      ← API + loading state for Module 1
│   └── useProposal.js      ← API + loading state for Module 2
├── pages/
│   ├── Dashboard.jsx           ← Overview with stats + recent activity
│   ├── CategoryGenerator.jsx   ← Module 1 generate page
│   ├── CategoryResults.jsx     ← Paginated list of all categorisations
│   ├── ProposalGenerator.jsx   ← Module 2 generate page
│   ├── ProposalList.jsx        ← Paginated grid of all proposals
│   └── ProposalDetail.jsx      ← Full proposal view by code
├── store/
│   └── appStore.js         ← Zustand global state (last results)
├── styles/
│   └── globals.css         ← Full design system CSS (tokens, components)
└── utils/
    ├── constants.js        ← Mirrors backend constants exactly
    └── formatters.js       ← Date, currency, token formatters
```

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — set VITE_API_BASE_URL to your backend URL

# 3. Start dev server (backend must be running on port 3000)
npm run dev
```

Visit: http://localhost:5173

## Backend Sync

| Frontend Route | Backend Endpoint |
|---|---|
| `/categories/generate` | `POST /api/v1/categories/generate` |
| `/categories/results` | `GET /api/v1/categories/results` |
| `/proposals/generate` | `POST /api/v1/proposals/generate` |
| `/proposals` | `GET /api/v1/proposals` |
| `/proposals/:code` | `GET /api/v1/proposals/:code` |

## Build for Production

```bash
npm run build
# Output: /dist — serve with any static host (Netlify, Vercel, S3, Nginx)
```
