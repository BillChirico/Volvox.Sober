# API Contracts

This directory contains API contract specifications for the authentication feature.

## Files

- **auth.yaml**: Supabase Auth API contracts for authentication endpoints

## Purpose

API contracts define the interface between the client (Expo app) and server (Supabase Auth). They serve as:

1. **Implementation Guide**: Developers implement exactly what's specified
2. **Test Specification**: Test cases validate contract compliance
3. **Documentation**: Clear reference for all auth endpoints
4. **Integration Validation**: Ensures client and server remain in sync

## Contract Format

Each contract includes:
- **Endpoint**: HTTP method and path
- **Request**: Headers, body, query parameters
- **Response**: Success (2xx) and error (4xx, 5xx) formats
- **User Story**: Which user story this endpoint supports
- **Success Criteria**: Measurable outcomes from spec.md
- **Example Requests/Responses**: Real-world usage examples
- **Error Mapping**: Client-side error message translations

## Usage

### For Developers

1. Read contract before implementing endpoint integration
2. Follow request/response formats exactly as specified
3. Use example requests as integration test cases
4. Implement error mapping as documented

### For Testers

1. Use contract as test specification
2. Validate all success scenarios return correct format
3. Validate all error scenarios return documented errors
4. Verify client-side error mapping works correctly

### For Reviewers

1. Verify implementation matches contract specification
2. Check error handling covers all documented error codes
3. Validate request/response formats are correct
4. Ensure success criteria from spec.md are met

## Testing Contracts

Run integration tests against contracts:

```bash
# Example: Test auth.yaml contract compliance
pnpm test:integration -- auth.contract.test.ts
```

Integration tests should validate:
- Request formats match specification
- Response formats match specification
- Error codes and messages match specification
- Client-side error mapping works correctly

## Supabase Auth Documentation

Official Supabase Auth API reference:
https://supabase.com/docs/reference/javascript/auth-api

**Note**: Our contracts are derived from Supabase Auth API but include:
- Client-side error mapping for UX
- User story references for traceability
- Success criteria validation
- Example requests/responses for clarity
