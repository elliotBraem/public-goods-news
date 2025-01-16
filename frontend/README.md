<!-- markdownlint-disable MD014 -->
<!-- markdownlint-disable MD033 -->
<!-- markdownlint-disable MD041 -->
<!-- markdownlint-disable MD029 -->

<div align="center">

<h1 style="font-size: 2.5rem; font-weight: bold;">Curation Bot Frontend</h1>

  <p>
    <strong>React-based frontend application for the Curation Bot platform</strong>
  </p>

</div>

<details>
  <summary>Table of Contents</summary>

- [Architecture Overview](#architecture-overview)
  - [Tech Stack](#tech-stack)
  - [Application Structure](#application-structure)
- [Key Features](#key-features)
  - [Submission Interface](#submission-interface)
  - [Real-time Updates](#real-time-updates)
  - [Responsive Design](#responsive-design)
- [Development](#development)
  - [Prerequisites](#prerequisites)
  - [Local Setup](#local-setup)
- [Backend Integration](#backend-integration)

</details>

## Architecture Overview

### Tech Stack

The frontend leverages modern web technologies for optimal performance and developer experience:

- **Framework**: [React](https://reactjs.org) + TypeScript
  - Component-based architecture
  - Strong type safety
  - Excellent ecosystem support

- **Build Tool**: [Vite](https://vitejs.dev)
  - Lightning-fast development server
  - Optimized production builds
  - Modern development experience

- **Styling**: [Tailwind CSS](https://tailwindcss.com)
  - Utility-first CSS framework
  - Highly customizable
  - Zero runtime overhead

### Application Structure

```bash
src/
├── assets/     # Static assets
├── components/ # React components
├── types/      # TypeScript definitions
└── App.tsx     # Root component
```

## Key Features

### Submission Interface

The submission system provides:

- Intuitive submission form
- Real-time validation
- Status tracking
- Moderation feedback

### Real-time Updates

- Live submission status updates
- Dynamic content loading
- Optimistic UI updates

### Responsive Design

- Mobile-first approach
- Adaptive layouts
- Cross-browser compatibility

## Development

### Prerequisites

- Node.js 18+
- Bun (recommended) or npm
- Backend service running

### Local Setup

1. Install dependencies:

```bash
bun install
```

2. Start development server:

```bash
bun run dev
```

The app will be available at `http://localhost:5173`

## Backend Integration

The frontend communicates with the [backend service](../backend/README.md) through a RESTful API:

- Submission handling via `/submit` endpoint
- Content retrieval through `/submissions`

See the [Backend README](../backend/README.md) for detailed API documentation.

<div align="right">
<a href="https://nearbuilders.org" target="_blank">
<img
  src="https://builders.mypinata.cloud/ipfs/QmWt1Nm47rypXFEamgeuadkvZendaUvAkcgJ3vtYf1rBFj"
  alt="Near Builders"
  height="40"
/>
</a>
</div>
