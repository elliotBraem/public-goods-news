---
sidebar_position: 5
---

# Deployment

This guide covers deploying the application to various environments.

## Deploying to Fly.io

The backend service can be deployed to Fly.io with SQLite support.

### Prerequisites

Install the Fly CLI:

```bash
# macOS
brew install flyctl

# Windows
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

# Linux
curl -L https://fly.io/install.sh | sh
```

### Authentication

Sign up and authenticate with Fly.io:

```bash
fly auth signup
# or
fly auth login
```

### Deployment Steps

1. Initialize your Fly.io application:

```bash
cd backend/
bun run deploy:init
```

2. Create persistent volumes for SQLite and cache:

```bash
bun run deploy:volumes
```

3. Deploy the application:

```bash
bun run deploy
```

### Configuration

The deployment includes:

- Persistent storage for SQLite database
- Cache directory support
- Auto-scaling configuration
- HTTPS enabled by default

### Environment Variables

Make sure to configure your environment variables in Fly.io:

```bash
fly secrets set TWITTER_USERNAME=your_twitter_username
fly secrets set TWITTER_PASSWORD=your_twitter_password
fly secrets set TWITTER_EMAIL=your_twitter_email
```

For distribution services, these will hydrate the curate.config.json:

```bash
# Telegram
fly secrets set TELEGRAM_BOT_TOKEN=your_bot_token
fly secrets set TELEGRAM_CHANNEL_ID=your_channel_id
```

### Monitoring

Monitor your deployment:

```bash
# View deployment status
fly status

# View logs
fly logs

# Access the Fly.io dashboard
fly dashboard
```

### Troubleshooting

Common issues and solutions:

1. **Database Connection Issues**
   - Verify volume mount paths
   - Check SQLite file permissions
   - Ensure volumes are properly created

2. **Memory/CPU Issues**
   - Monitor resource usage with `fly status`
   - Adjust VM size if needed
   - Consider enabling auto-scaling

3. **Network Issues**
   - Check Fly.io region configuration
   - Verify firewall settings
   - Test network connectivity

For more help, consult the [Fly.io documentation](https://fly.io/docs/) or join their [community Discord](https://fly.io/discord).
