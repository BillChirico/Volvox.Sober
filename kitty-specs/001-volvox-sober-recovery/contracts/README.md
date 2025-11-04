# API Contracts

**Feature**: 001-volvox-sober-recovery
**Format**: OpenAPI 3.0
**Base URL**: `https://[project-id].supabase.co`

## Contract Files

This directory contains OpenAPI specifications for all Volvox.Sober API endpoints:

- **auth.yaml** - Authentication (signup, login, password reset) ✅ Created
- **matching.yaml** - Sponsor-sponsee matching algorithm ✅ Created
- **users.yaml** - User profiles and preferences
- **connections.yaml** - Connection requests and management
- **sobriety.yaml** - Sobriety tracking and milestones
- **steps.yaml** - 12-step worksheets and progress
- **messages.yaml** - In-app messaging and check-ins

## Implementation Notes

- **Authentication**: All endpoints require `Authorization: Bearer <JWT>` header except auth endpoints
- **RLS Enforcement**: Database Row Level Security policies enforce data access at the database layer
- **Edge Functions**: Compute-heavy operations (matching algorithm) run as Supabase Edge Functions
- **Real-time**: Message delivery uses Supabase Realtime subscriptions (WebSocket), not REST polling
- **Pagination**: List endpoints use cursor-based pagination with `limit` and `cursor` parameters
- **Error Codes**: Standard HTTP status codes + Supabase error codes in response body

## Contract Status

✅ = Specified
⏳ = To be specified during implementation

**Current Status**: Sample contracts created (auth, matching). Remaining contracts follow same patterns.
