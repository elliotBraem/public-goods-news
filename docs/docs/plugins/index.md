---
sidebar_position: 0
---

# 🔌 Plugins

curate.fun supports various plugins that extend its functionality, particularly for content distribution. Each plugin enables you to distribute curated content to different platforms and channels.

## Available Plugins

### [📱 Telegram Plugin](./telegram.md)

Distribute curated content to Telegram channels and topics.

## Plugin Structure

Each plugin follows a consistent configuration structure in your `curate.config.json`:

```json
{
  "outputs": {
    "stream": {
      "enabled": true,
      "distribute": [
        {
          "plugin": "@curatedotfun/[plugin-name]",
          "config": {
            // Plugin-specific configuration
          }
        }
      ]
    }
  }
}
```

Select a plugin from the sidebar to view its detailed configuration and setup instructions.
