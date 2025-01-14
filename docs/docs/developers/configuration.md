---
sidebar_position: 4
---

# Configuration

The application is configured through a `curate.config.json` file that defines global settings, plugins, and feed configurations.

## Structure

### Global Settings

```json
{
  "global": {
    "defaultStatus": "pending",
    "maxSubmissionsPerUser": 5
  }
}
```

### Plugins

Plugins are external modules that provide transformation or distribution capabilities:

```json
{
  "plugins": {
    "@curatedotfun/telegram": {
      "type": "distributor",
      "url": "./external/telegram"
    },
    "@curatedotfun/gpt-transform": {
      "type": "transformer",
      "url": "./external/gpt-transform"
    }
  }
}
```

### Feeds

Each feed represents a distinct content stream with its own configuration:

```json
{
  "feeds": [
    {
      "id": "example",
      "name": "Example Feed",
      "description": "Example feed description",
      "moderation": {
        "approvers": {
          "twitter": ["approver1", "approver2"] // twitter handle, without @
        }
      },
      "outputs": {
        "stream": {
          "enabled": true, // if enabled but no distribute, then will sit in queue
          "transform": {  // Optional
            "plugin": "@curatedotfun/gpt-transform",
            "config": {
              "prompt": "Format this update..."
            }
          },
          "distribute": [  // Optional
            {
              "plugin": "@curatedotfun/telegram",
              "config": {
                "botToken": "{TELEGRAM_BOT_TOKEN}",
                "channelId": "{TELEGRAM_CHANNEL_ID}"
              }
            }
          ]
        },
        "recap": {
          "enabled": true,
          "schedule": "0 0 * * *",
          "transform": {  // Required for recap
            "plugin": "@curatedotfun/gpt-transform",
            "config": {
              "prompt": "./prompts/recap.txt"
            }
          },
          "distribute": [
            {
              "plugin": "@curatedotfun/telegram",
              "config": {
                "botToken": "{TELEGRAM_RECAP_BOT_TOKEN}",
                "channelId": "{TELEGRAM_RECAP_CHANNEL_ID}"
              }
            }
          ]
        }
      }
    }
  ]
}
```

## Stream Configuration

A stream means that content will be distributed on approval. The stream output configuration itself is optional and has several optional components:

```typescript
outputs: {
  stream?: {
    enabled: boolean;
    transform?: {  // Optional transformation to content before distribution
      plugin: string;
      config: {
        prompt: string;
      };
    };
    distribute?: [  // Optional distribution, can configure multiple
      {
        plugin: string;
        config: Record<string, string>;
      }
    ];
  };
}
```

When `stream` is enabled:

- If `transform` is not provided, content will be distributed as-is
- If `distribute` is not provided, approved submissions will remain in the submissions feed table (queue) until:
  - They are distributed (if distribution is added later)
  - The recap schedule completes (if a recap is configured)
  - They are manually removed

This queue behavior is particularly useful when you want to:

- Collect approved submissions without immediate distribution
- Add distribution channels later
- Use submissions only in recaps

## Recap Configuration

A recap means that content within the specified time frame will be summarized (transformed) and then distributed. The recap output configuration is optional but when provided requires certain fields:

```typescript
outputs: {
  recap?: {
    enabled: boolean;
    schedule: string;  // Cron expression
    transform: {      // Required for recap
      plugin: string;
      config: {
        prompt: string;
      };
    };
    distribute: [     // Required for recap
      {
        plugin: string;
        config: Record<string, string>;
      }
    ];
  };
}
```

Note that unlike stream configuration:

- `transform` is required for recap (content must be summarized)
- `distribute` is required for recap (summarized content must be distributed)

Messages included in a recap will be removed from the submissions feed table after the recap is generated and distributed.
