# API Contracts

This directory contains the API contracts and database schema for Volvox.Sober.

## Files

- **`database.sql`**: PostgreSQL schema migrations (tables, indexes, RLS policies, triggers)
- **`types.ts`**: TypeScript type definitions matching database schema
- **`api-schema.yaml`**: Supabase Edge Function signatures and RPC definitions

## Generation Commands

### Generate TypeScript Types from Database

```bash
supabase gen types typescript --local > contracts/types.ts
```

### Validate Database Schema

```bash
supabase db lint
```

### Test RLS Policies

```bash
supabase test db
```

## Implementation Status

- [x] Data model designed (`data-model.md`)
- [ ] `database.sql` - PostgreSQL migrations (pending implementation)
- [ ] `types.ts` - TypeScript definitions (auto-generated after migrations)
- [ ] `api-schema.yaml` - Edge Function contracts (pending implementation)

**Note**: These contracts will be implemented during `/spec-kitty.tasks` execution phase.
