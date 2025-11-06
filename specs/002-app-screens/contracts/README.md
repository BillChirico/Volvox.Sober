# API Contracts: All Application Screens

**Feature**: 002-app-screens
**Date**: 2025-11-05
**Protocol**: REST API via Supabase Client SDK

## Overview

This directory contains OpenAPI-style contract specifications for all APIs used by the main application screens. All APIs are implemented using Supabase's client SDK, which provides:

- Automatic authentication (JWT in Authorization header)
- Row Level Security (RLS) enforcement
- Real-time subscriptions via WebSockets
- TypeScript type generation

## Contract Files

| File | Purpose | Endpoints |
|------|---------|-----------|
| `profiles.yaml` | User profile CRUD | 3 endpoints |
| `onboarding.yaml` | Onboarding flow | 4 endpoints |
| `sobriety.yaml` | Sobriety tracking | 4 endpoints |
| `matches.yaml` | Matching algorithm | 4 endpoints |
| `connections.yaml` | Connection management | 5 endpoints |
| `messages.yaml` | Real-time messaging | 5 endpoints + WebSocket |

## Authentication

All endpoints require authentication via Supabase Auth:

```typescript
// Client automatically includes JWT
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();
```

## Error Handling

Standard Supabase error format:

```typescript
{
  message: string;  // Human-readable error message
  code: string;     // Error code (e.g., 'PGRST116', '23505')
  details: string;  // Additional details
  hint: string;     // Suggestion for resolution
}
```

## Rate Limiting

- Connection requests: 5 per day per user
- Messages: 100 per hour per connection
- Match requests: 20 per day per user

## TypeScript Type Generation

Generate TypeScript types from database schema:

```bash
supabase gen types typescript --local > src/types/database.ts
```

## Testing

Contract tests validate:
- Request/response schemas
- Authentication requirements
- RLS policy enforcement
- Error handling

Run contract tests:

```bash
pnpm test:contracts
```

## References

- [Supabase JS Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Database Schema](../data-model.md)
- [Research Decisions](../research.md)
