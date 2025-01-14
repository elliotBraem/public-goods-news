<!-- markdownlint-disable MD014 -->
<!-- markdownlint-disable MD033 -->
<!-- markdownlint-disable MD041 -->
<!-- markdownlint-disable MD029 -->

<div align="center">

<h1 style="font-size: 2.5rem; font-weight: bold;">curate.fun</h1>

  <p>
    <strong>Bot to curate and to streamline to different news feeds</strong>
  </p>

</div>

<details>
  <summary>Table of Contents</summary>

- [Project Structure](#project-structure)
  - [Monorepo Overview](#monorepo-overview)
  - [Key Components](#key-components)
- [Getting Started](#getting-started)
  - [Installing dependencies](#installing-dependencies)
  - [Environment Setup](#environment-setup)
  - [Running the app](#running-the-app)
  - [Building for production](#building-for-production)
  - [Deploying to Fly.io](#deploying-to-flyio)
  - [Running tests](#running-tests)
- [Configuration](#configuration)
  - [Twitter Setup](#twitter-setup)
  - [Admin Configuration](#admin-configuration)
- [Bot Functionality](#bot-functionality)
  - [Submission Process](#submission-process)
  - [Moderation System](#moderation-system)
  - [Rate Limiting](#rate-limiting)
- [Contributing](#contributing)

</details>

## Project Structure

### Monorepo Overview

This project uses a monorepo structure managed with [Turborepo](https://turbo.build/repo) for efficient build orchestration:

```bash
curation-bot/
├── frontend/          # React frontend application
├── backend/          # Bun-powered backend service
├── package.json      # Root package.json for shared dependencies
└── turbo.json       # Turborepo configuration
```

### Key Components

- **Frontend** ([Documentation](./frontend/README.md))
  - React-based web interface
  - Built with Vite and Tailwind CSS
  - Handles user interactions and submissions

- **Backend** ([Documentation](./backend/README.md))
  - Bun runtime for high performance
  - Twitter bot functionality
  - API endpoints for frontend
  - Export services for RSS and Telegram

### Export Services

The platform supports multiple channels for content distribution:

#### RSS Feed

- Automatically generates an RSS feed of approved submissions
- Configurable feed properties (title, description, max items)
- XML-compliant output with proper escaping
- Ideal for content aggregators and RSS readers

#### Telegram Channel

- Posts approved submissions to a configured Telegram channel
- Formatted messages with submission details and source links
- Real-time updates as content is approved
- Requires a Telegram bot token and channel ID



# Futre Features
- Regular posting of information on regular intervals
- Creation of content from these feeds, example blogs, articiles
- Integrating to different channels to post

The export system is extensible - new export types can be added by implementing the ExportService interface in [backend/src/services/exports/types.ts](./backend/src/services/exports/types.ts).

## Getting Started

### Installing dependencies

The monorepo uses Bun for package management. Install all dependencies with:

```bash
bun install
```

This will install dependencies for both frontend and backend packages.

### Environment Setup

Copy the environment template and configure your credentials:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Twitter API Credentials
TWITTER_USERNAME=your_twitter_username
TWITTER_PASSWORD=your_twitter_password
TWITTER_EMAIL=your_twitter_email

# Export Services Configuration
# Telegram (Optional)
TELEGRAM_ENABLED=false        # Set to true to enable Telegram export
TELEGRAM_BOT_TOKEN=          # Your Telegram bot token
TELEGRAM_CHANNEL_ID=         # Target channel ID for posts

# RSS Feed (Optional)
RSS_ENABLED=false           # Set to true to enable RSS feed
RSS_TITLE=                  # Title of your RSS feed
RSS_DESCRIPTION=            # Description of your RSS feed
RSS_FEED_PATH=             # Path where RSS feed will be generated
RSS_MAX_ITEMS=100          # Maximum number of items to keep in feed
```

### Running the app

Start both frontend and backend development servers:

```bash
bun run dev
```

This will launch:

- Frontend at http://localhost:5173
- Backend at http://localhost:3000

### Building for production

Build all packages:

```bash
bun run build
```

### Deploying to Fly.io

The backend service can be deployed to Fly.io with SQLite support. First, install the Fly CLI:

```bash
# macOS
brew install flyctl

# Windows
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

# Linux
curl -L https://fly.io/install.sh | sh
```

Then sign up and authenticate:

```bash
fly auth signup
# or
fly auth login
```

Deploy the application using the provided npm scripts:

```bash
# Initialize Fly.io app
bun run deploy:init

# Create persistent volumes for SQLite and cache
bun run deploy:volumes

# Deploy the application
bun run deploy
```

The deployment configuration includes:

- Persistent storage for SQLite database
- Cache directory support
- Auto-scaling configuration
- HTTPS enabled by default

### Running tests

```bash
bun run test
```

See the full [testing guide](./playwright-tests/README.md).

## Configuration

### Twitter Setup

The bot requires a Twitter account to function. Configure the following in your `.env` file:

```env
TWITTER_USERNAME=your_twitter_username
TWITTER_PASSWORD=your_twitter_password
TWITTER_EMAIL=your_twitter_email
```

It will use these credentials to login and cache cookies via [agent-twitter-client](https://github.com/ai16z/agent-twitter-client).

### Configuration

See the [Configuration Documentation](./docs/docs/developers/configuration.md) for detailed information about:

- Feed configuration and structure
- Stream and recap behavior
- Plugin system
- Message queue handling

### Admin Configuration

Admins are Twitter accounts that have moderation privileges (Twitter handles without @). Configure admin accounts in `backend/src/config/admins.ts`:

```typescript
export const ADMIN_ACCOUNTS: string[] = [
  "admin_handle_1",
  "admin_handle_2"
  // Add admin Twitter handles here (without @)
]
```

Admin accounts are automatically tagged in submission acknowledgements and can:

- Approve submissions using the `#approve` hashtag
- Reject submissions using the `#reject` hashtag

Only the first moderation will be recorded.

## Bot Functionality

### Submission Process

1. **Submit News**: Users can submit news by mentioning the bot with `!submit` in their tweet
2. **Acknowledgment**: The bot responds with a confirmation tweet, tagging the admins for review
3. **Moderation**: Admins will reply to the bot's acknowledgement with either #approve or #reject
4. **Notification**: Users receive a tweet notification about their submission's status

### Moderation System

1. **Queue**: All submissions enter a moderation queue
2. **Admin Review**: Admins can review submissions by replying to the bot's acknowledgment tweet
3. **Actions**:
   - Approve: Reply with `#approve` hashtag
   - Reject: Reply with `#reject` hashtag
4. **Outcome**: Users receive a notification tweet about the moderation decision

### Rate Limiting

To maintain quality:

- Users are limited to 10 submissions per day
- Rate limits reset daily
- Exceeding the limit results in a notification tweet

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
