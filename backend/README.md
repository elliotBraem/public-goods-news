<!-- markdownlint-disable MD014 -->
<!-- markdownlint-disable MD033 -->
<!-- markdownlint-disable MD041 -->
<!-- markdownlint-disable MD029 -->

<div align="center">

<h1 style="font-size: 2.5rem; font-weight: bold;">Public Goods News Backend</h1>

  <p>
    <strong>TypeScript-based backend service for the Public Goods News Curation platform</strong>
  </p>

</div>

<details>
  <summary>Table of Contents</summary>

- [Architecture Overview](#architecture-overview)
  - [Tech Stack](#tech-stack)
  - [Service Architecture](#service-architecture)
- [Key Components](#key-components)
  - [Database Service](#database-service)
  - [Twitter Service](#twitter-service)
- [Development](#development)
  - [Prerequisites](#prerequisites)
  - [Local Setup](#local-setup)
- [API Documentation](#api-documentation)

</details>

## Architecture Overview

### Tech Stack

The backend is built with modern technologies chosen for their performance, developer experience, and ecosystem:

- **Runtime**: [Bun](https://bun.sh)
  - Chosen for its exceptional performance and built-in TypeScript support
  - Provides native testing capabilities and package management
  - Offers excellent developer experience with fast startup times

- **Language**: TypeScript
  - Ensures type safety and better developer experience
  - Enables better code organization and maintainability
  - Provides excellent IDE support and code navigation

### Service Architecture

The backend follows a modular service-based architecture:

```
src/
├── config/     # Configuration management
├── services/   # Core service implementations
├── types/      # TypeScript type definitions
└── utils/      # Shared utilities
```

## Key Components

### Database Service

Located in `src/services/db`, handles:

- Data persistence
- Caching layer
- Query optimization

### Twitter Service

Twitter integration (`src/services/twitter`) manages:

- Authentication
- Tweet interactions
- Rate limiting
- User management

## Development

### Prerequisites

- Bun runtime installed
- Node.js 18+ (for some dev tools)
- Twitter API credentials

### Local Setup

1. Install dependencies:

```bash
bun install
```

2. Configure environment:

```bash
cp .env.example .env
```

3. Start development server:

```bash
bun run dev
```

## API Documentation

The backend exposes several endpoints for frontend interaction:

- `POST /submit`: Submit new content
- `GET /submissions`: Retrieve submission list
- `POST /moderate`: Handle moderation actions

See the [Frontend README](../frontend/README.md) for integration details.

<div align="right">
<a href="https://nearbuilders.org" target="_blank">
<img
  src="https://builders.mypinata.cloud/ipfs/QmWt1Nm47rypXFEamgeuadkvZendaUvAkcgJ3vtYf1rBFj"
  alt="Near Builders"
  height="40"
/>
</a>
</div>
