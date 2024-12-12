<!-- markdownlint-disable MD014 -->
<!-- markdownlint-disable MD033 -->
<!-- markdownlint-disable MD041 -->
<!-- markdownlint-disable MD029 -->

<div align="center">

<h1 style="font-size: 2.5rem; font-weight: bold;">Public Goods News Curation</h1>

  <p>
    <strong>Bot to curate and to streamline public goods news</strong>
  </p>

</div>

<details>
  <summary>Table of Contents</summary>

- [Getting Started](#getting-started)
  - [Installing dependencies](#installing-dependencies)
  - [Environment Setup](#environment-setup)
  - [Running the app](#running-the-app)
  - [Building for production](#building-for-production)
  - [Running tests](#running-tests)
- [Usage](#usage)
- [Contributing](#contributing)

</details>

## Getting Started

### Installing dependencies

```bash
bun install
```

### Environment Setup

Copy the environment template and configure your credentials:

```bash
cp .env.example .env
```

Required environment variables:

- Twitter API credentials for bot functionality
- NEAR network configuration
- Environment settings

### Running the app

First, run the development server:

```bash
bun run dev
```

### Building for production

```bash
bun run build
```

### Running tests

```bash
bun run test
```

See the full [testing guide](./playwright-tests/README.md).

## Usage

The bot provides two main interactions:

1. **Submit News**: Tweet with `!submit` to submit news content
2. **Approve Content**: Moderators can approve content using the `#approve` hashtag

Each user is limited to 10 submissions per day to maintain quality.

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you're interested in contributing to this project, please read the [contribution guide](./CONTRIBUTING).

<div align="right">
<a href="https://nearbuilders.org" target="_blank">
<img
  src="https://builders.mypinata.cloud/ipfs/QmWt1Nm47rypXFEamgeuadkvZendaUvAkcgJ3vtYf1rBFj"
  alt="Near Builders"
  height="40"
/>
</a>
</div>
