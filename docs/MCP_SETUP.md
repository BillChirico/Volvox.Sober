# MCP Server Setup Guide

This guide explains how to configure MCP (Model Context Protocol) servers for Volvox.Sober development.

## Overview

Volvox.Sober leverages two types of MCP capabilities:

1. **Primary MCP Servers**: Built into Claude Code (no setup required)
2. **Docker MCP Tools**: Extended capabilities requiring API key configuration

## Primary MCP Servers (Built-in)

These are automatically available in Claude Code:

| Server         | Purpose                 | When to Use                                 |
| -------------- | ----------------------- | ------------------------------------------- |
| **Context7**   | Official library docs   | React Native features, library integrations |
| **Magic**      | UI component generation | Building forms, screens, navigation         |
| **Playwright** | Browser automation      | E2E tests, visual testing, accessibility    |
| **Sequential** | Complex analysis        | Debugging, architecture decisions           |
| **Serena**     | Semantic code ops       | Refactoring, symbol operations              |
| **Morphllm**   | Pattern transformations | Bulk edits, style enforcement               |
| **Supabase**   | Backend development     | Migrations, RLS policies, Edge Functions    |
| **Tavily**     | Web research            | Best practices, documentation search        |

**No configuration needed** - these work out of the box in Claude Code.

## Docker MCP Tools (Optional)

Extended capabilities that enhance development but require API keys.

### GitHub Integration (Recommended)

**Purpose**: Automate PR creation, issue tracking, code operations

**Setup**:

1. Generate Personal Access Token at: https://github.com/settings/tokens
2. Required scopes: `repo`, `workflow`, `admin:org` (if using organization)
3. Add to `.env`:
   ```bash
   GITHUB_TOKEN=ghp_your_token_here
   ```

**Use Cases**:

- Automated PR creation with proper formatting
- Issue management and labeling
- Branch operations and repository management
- Code review workflow automation

**Verification**:

```bash
./scripts/check-mcp-servers.sh
# Should show: [GitHub] ✓ Configured
```

### Brave Search (Recommended)

**Purpose**: Web, news, image, and video search capabilities

**Setup**:

1. Get API key at: https://brave.com/search/api/
2. Add to `.env`:
   ```bash
   BRAVE_API_KEY=your_key_here
   ```

**Use Cases**:

- Technical documentation research
- Best practice discovery
- Library comparison and evaluation
- Current security vulnerability research

**Verification**:

```bash
./scripts/check-mcp-servers.sh
# Should show: [Brave Search] ✓ Configured
```

### Tavily Search (Recommended)

**Purpose**: Advanced web research and content extraction

**Setup**:

1. Get API key at: https://app.tavily.com
2. Add to `.env`:
   ```bash
   TAVILY_API_KEY=tvly-your_key_here
   ```

**Use Cases**:

- Deep research investigations
- Website content extraction
- Multi-source information synthesis
- Site structure mapping

**Verification**:

```bash
./scripts/check-mcp-servers.sh
# Should show: [Tavily Search] ✓ Configured
```

### Stripe (Optional - Future Use)

**Purpose**: Payment processing for premium features/donations

**Setup**:

1. Get API keys at: https://dashboard.stripe.com/apikeys
2. Add to `.env`:

   ```bash
   # Test environment (development)
   STRIPE_SECRET_KEY_TEST=sk_test_your_key
   STRIPE_PUBLISHABLE_KEY_TEST=pk_test_your_key

   # Production (only when ready)
   # STRIPE_SECRET_KEY=sk_live_your_key
   # STRIPE_PUBLISHABLE_KEY=pk_live_your_key
   ```

**Use Cases** (Future):

- Premium feature subscriptions
- Donation processing
- Sponsorship program payments

**Note**: Not required for current development phase.

### Other Docker MCPs (No API Keys)

These work automatically without configuration:

- **Playwright Docker**: Browser automation (uses Playwright MCP)
- **Knowledge Graph**: Project documentation persistence
- **Time/Timezone Tools**: Timezone-aware operations for check-ins
- **Sequential Docker**: Multi-step reasoning (enhanced Sequential)

## Setup Validation

### Automated Check

Run the validation script to check all MCP servers:

```bash
./scripts/check-mcp-servers.sh
```

**Expected Output**:

```
🔍 Volvox.Sober MCP Server Availability Check
==============================================

📦 Primary MCP Servers (Essential)
-----------------------------------
  [Context7] Official library documentation... ✓ Available
  [Magic] UI component generation... ✓ Available
  [Playwright] Browser automation & E2E testing... ✓ Available
  [Sequential] Complex analysis & reasoning... ✓ Available
  [Serena] Semantic code understanding... ✓ Available
  [Morphllm] Pattern-based code editing... ✓ Available
  [Supabase] Backend development... ✓ Available
  [Tavily] Web search & research... ✓ Available

🐳 Docker MCP Tools (Extended)
-------------------------------
  [GitHub] PR/Issue/Repo management... ✓ Configured
  [Brave Search] Web/News/Image search... ✓ Configured
  [Tavily Search] Advanced web research... ✓ Configured
  [Playwright Docker] Browser automation... ✓ Available
  [Knowledge Graph] Project documentation... ✓ Available
  [Time/Timezone] Timezone operations... ✓ Available
  [Sequential Docker] Multi-step reasoning... ✓ Available

💳 Future Features (Optional)
-----------------------------
  [Stripe] Payment processing... ○ Optional (not configured)

==============================================
📊 Summary
==============================================
  Total Checks: 16
  Passed: 16
  Warnings: 0
  Failed: 0

✅ All MCP servers are available! Development environment is ready.
```

### Manual Verification

Check individual API keys:

```bash
# Check if GitHub token is set
echo $GITHUB_TOKEN
# Should output: ghp_xxxxx...

# Check if Brave API key is set
echo $BRAVE_API_KEY
# Should output: your_key...

# Check if Tavily API key is set
echo $TAVILY_API_KEY
# Should output: tvly-xxxxx...
```

## Configuration Levels

### Minimal Setup (Core Features Only)

- ✅ Primary MCP Servers (built-in)
- ❌ No Docker MCP API keys

**Capabilities**: Basic development, code generation, local testing
**Limitations**: No GitHub automation, no web search, limited research

### Recommended Setup (Full Development Experience)

- ✅ Primary MCP Servers (built-in)
- ✅ GitHub Token
- ✅ Brave OR Tavily API key

**Capabilities**: Full development workflow, automated PR/issue management, web research
**Recommended for**: All active developers

### Complete Setup (All Features)

- ✅ Primary MCP Servers (built-in)
- ✅ GitHub Token
- ✅ Brave API key
- ✅ Tavily API key
- ✅ Stripe keys (test environment)

**Capabilities**: Everything + payment feature development
**Recommended for**: Lead developers, future monetization work

## Troubleshooting

### "Missing API Key" Warnings

**Issue**: `./scripts/check-mcp-servers.sh` shows warnings

**Solution**:

1. Check `.env` file exists: `ls -la .env`
2. Verify API keys are set: `cat .env | grep TOKEN`
3. Reload environment: `source .env`
4. Re-run check script

### GitHub Token Not Working

**Issue**: GitHub MCP operations fail despite token being set

**Solution**:

1. Verify token scopes at: https://github.com/settings/tokens
2. Required scopes: `repo`, `workflow`, `admin:org`
3. Regenerate token if scopes are incorrect
4. Update `.env` with new token

### Brave/Tavily Search Not Working

**Issue**: Search operations fail or return no results

**Solution**:

1. Verify API key is active in provider dashboard
2. Check API usage limits haven't been exceeded
3. Test API key with curl:

   ```bash
   # Brave
   curl -H "X-Subscription-Token: $BRAVE_API_KEY" \
        "https://api.search.brave.com/res/v1/web/search?q=test"

   # Tavily
   curl -X POST "https://api.tavily.com/search" \
        -H "Content-Type: application/json" \
        -d '{"api_key": "'$TAVILY_API_KEY'", "query": "test"}'
   ```

### Primary MCP Servers Not Available

**Issue**: Built-in MCPs show as unavailable

**Solution**:

1. Verify you're using Claude Code (not standard Claude)
2. Check Claude Code version is up to date
3. Restart Claude Code application
4. Contact support if issue persists

## Security Best Practices

### API Key Management

1. **Never commit `.env` to version control**

   ```bash
   # Verify .env is in .gitignore
   cat .gitignore | grep .env
   ```

2. **Use different keys for different environments**
   - Development: Test/sandbox keys
   - Staging: Limited production keys
   - Production: Full production keys with strict access

3. **Rotate keys regularly**
   - GitHub tokens: Every 90 days
   - API keys: Every 180 days
   - Production keys: Every 90 days

4. **Limit token scopes**
   - Only grant minimum necessary permissions
   - Use read-only tokens when possible

### Environment Separation

```bash
# Development
.env

# Staging
.env.staging

# Production
.env.production  # Never commit!
```

## Additional Resources

- [Constitution - MCP Server Integration](.kittify/memory/constitution.md#mcp-server-integration)
- [Constitution - Docker MCP Tools](.kittify/memory/constitution.md#docker-mcp-tools)
- [Environment Variables](.env.example)
- [MCP Check Script](scripts/check-mcp-servers.sh)

## Support

For MCP server configuration issues:

1. Check this documentation first
2. Review constitution for usage guidelines
3. Run validation script: `./scripts/check-mcp-servers.sh`
4. Consult with team lead if issues persist

---

**Last Updated**: 2025-11-04
