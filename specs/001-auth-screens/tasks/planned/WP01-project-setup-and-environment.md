# WP01: Project Setup and Environment Configuration

**Status**: 📋 Planned
**Priority**: Setup
**Dependencies**: None
**Estimated Effort**: 2-3 hours

---

## Objective

Set up the foundational infrastructure for the authentication feature, including Supabase configuration, deep linking, and Redux Persist setup. This work package establishes the necessary environment and tooling for all subsequent authentication development.

---

## Context

From [spec.md](../../spec.md):
- FR-016: System MUST use Supabase Auth for all authentication operations
- FR-007: System MUST maintain user sessions across app restarts (persistent authentication)
- FR-004: System MUST send email verification links to new users

From [plan.md](../../plan.md):
- Technical Stack: Expo 54.x, React Native 0.81+, Supabase Auth, Redux Toolkit + Redux Persist
- Deep linking scheme: `volvoxsober://`

From [data-model.md](../../data-model.md):
- Environment variables: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Redux Persist configuration with AsyncStorage backend
- Email verification redirect: `volvoxsober://auth/verify`
- Password reset redirect: `volvoxsober://auth/forgot-password`

---

## Subtasks

### T001 [P]: Configure Supabase project and environment variables

**What**: Set up Supabase project and configure environment variables for the Expo app.

**Steps**:
1. Create/verify Supabase project at https://supabase.com/dashboard
2. Navigate to Project Settings → API
3. Copy "Project URL" and "anon public" key
4. Create `.env` file in project root (if not exists)
5. Add environment variables:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
   ```
6. Verify variables load in Expo by adding test log in `app/_layout.tsx`
7. Remove test log after verification

**Acceptance Criteria**:
- `.env` file exists with correct variables
- Environment variables accessible via `process.env.EXPO_PUBLIC_SUPABASE_URL` and `process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY`
- No environment variables committed to git (verify `.env` in `.gitignore`)

**Testing**:
- Manual: Log environment variables in app, verify they load
- Check: Ensure `.env` file not tracked by git

---

### T002 [P]: Set up deep linking configuration (app.json)

**What**: Configure deep linking to handle email verification and password reset redirects from Supabase emails.

**Steps**:
1. Open `app.json`
2. Add/verify `scheme` property:
   ```json
   {
     "expo": {
       "scheme": "volvoxsober",
       "ios": {
         "associatedDomains": ["applinks:volvoxsober.app"]
       },
       "android": {
         "intentFilters": [
           {
             "action": "VIEW",
             "data": [{ "scheme": "volvoxsober" }],
             "category": ["BROWSABLE", "DEFAULT"]
           }
         ]
       }
     }
   }
   ```
3. Test deep link handling on iOS:
   ```bash
   npx uri-scheme open volvoxsober://auth/verify --ios
   ```
4. Test deep link handling on Android (if Android emulator available)
5. Verify app opens when deep link is triggered

**Acceptance Criteria**:
- `app.json` contains correct deep linking configuration
- Deep links with `volvoxsober://` scheme open the app
- iOS and Android configurations present
- Test deep link opens app (no crash)

**Testing**:
- Manual: Use `npx uri-scheme open` to test deep links
- Verify: App opens when deep link triggered

---

### T003: Configure email templates in Supabase dashboard

**What**: Configure Supabase Auth email templates for verification and password reset emails.

**Steps**:
1. Go to Supabase Dashboard → Authentication → Email Templates
2. **Enable Email Confirmations**:
   - Navigate to Settings → Enable "Confirm email" toggle
3. **Configure Verification Email Template**:
   - Subject: `Confirm your email for Volvox.Sober`
   - Body: Use default template or customize
   - Redirect URL: `volvoxsober://auth/verify`
4. **Configure Password Recovery Email Template**:
   - Subject: `Reset your password for Volvox.Sober`
   - Body: Use default template or customize
   - Redirect URL: `volvoxsober://auth/forgot-password`
5. **Set Email Expiry**:
   - Confirmation expiry: 24 hours
   - Recovery expiry: 24 hours
6. **Configure Site URL** (Authentication → URL Configuration):
   - Site URL: `http://localhost:8081` (for local development)
7. **Add Redirect URLs**:
   - `volvoxsober://auth/verify`
   - `volvoxsober://auth/forgot-password`
   - `exp://localhost:8081` (for Expo dev)
8. **Test Email Sending**:
   - Create test user via Supabase dashboard
   - Trigger verification email
   - Check email inbox for test email
   - Verify email contains correct redirect URL

**Acceptance Criteria**:
- Email confirmations enabled in Supabase Auth settings
- Verification email template configured with correct redirect URL
- Password reset email template configured with correct redirect URL
- Token expiry set to 24 hours (FR-009)
- Test email sends successfully and contains correct redirect URLs

**Testing**:
- Manual: Create test user in Supabase dashboard, verify email sent
- Verify: Email contains `volvoxsober://auth/verify` link
- Check: Email received in inbox (may be in spam folder for test accounts)

---

### T004 [P]: Set up Redux store with Redux Persist configuration

**What**: Initialize Redux Toolkit store with Redux Persist for session persistence.

**Steps**:
1. **Install Dependencies**:
   ```bash
   pnpm add @reduxjs/toolkit react-redux redux-persist @react-native-async-storage/async-storage
   ```
2. **Create Store Configuration**:
   - Create `src/store/index.ts`:
   ```typescript
   import { configureStore } from '@reduxjs/toolkit'
   import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
   import AsyncStorage from '@react-native-async-storage/async-storage'
   import { combineReducers } from 'redux'

   const rootReducer = combineReducers({
     // auth slice will be added in WP03
   })

   const persistConfig = {
     key: 'root',
     storage: AsyncStorage,
     whitelist: [] // will add 'auth' in WP03
   }

   const persistedReducer = persistReducer(persistConfig, rootReducer)

   export const store = configureStore({
     reducer: persistedReducer,
     middleware: (getDefaultMiddleware) =>
       getDefaultMiddleware({
         serializableCheck: {
           ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
         }
       })
   })

   export const persistor = persistStore(store)
   export type RootState = ReturnType<typeof store.getState>
   export type AppDispatch = typeof store.dispatch
   ```
3. **Wrap App with Providers**:
   - Modify `app/_layout.tsx`:
   ```typescript
   import { Provider } from 'react-redux'
   import { PersistGate } from 'redux-persist/integration/react'
   import { store, persistor } from '../src/store'

   export default function RootLayout() {
     return (
       <Provider store={store}>
         <PersistGate loading={null} persistor={persistor}>
           <Stack />
         </PersistGate>
       </Provider>
     )
   }
   ```
4. **Test Store Initialization**:
   - Run app: `pnpm start`
   - Verify no errors in console
   - Check Redux DevTools (if available) to see store initialized

**Acceptance Criteria**:
- Dependencies installed successfully
- `src/store/index.ts` created with Redux Persist configuration
- `app/_layout.tsx` wrapped with `<Provider>` and `<PersistGate>`
- App runs without errors
- Redux store initializes (verify in console or Redux DevTools)

**Testing**:
- Manual: Run `pnpm start`, verify app loads without errors
- Check: Redux DevTools shows store initialized (if extension installed)
- Verify: No TypeScript errors in `src/store/index.ts`

---

## Completion Checklist

Before marking this work package as complete:

- [ ] All 4 subtasks completed (T001-T004)
- [ ] `.env` file created with Supabase credentials
- [ ] Deep linking tested on at least one platform (iOS or Android)
- [ ] Email templates configured in Supabase dashboard
- [ ] Test email sent and received successfully
- [ ] Redux store with Redux Persist operational
- [ ] App runs without errors
- [ ] No TypeScript errors (`pnpm typecheck`)
- [ ] All changes committed to git

---

## Files Created/Modified

**Created**:
- `.env` - Environment variables (DO NOT COMMIT)
- `src/store/index.ts` - Redux store configuration

**Modified**:
- `app.json` - Deep linking configuration
- `app/_layout.tsx` - Redux Provider and PersistGate wrappers
- `package.json` - New dependencies added

**External Configuration**:
- Supabase Dashboard: Email templates, redirect URLs, auth settings

---

## Dependencies

**Blocks**:
- WP02: Authentication Service Foundation (needs Supabase credentials and store setup)

**Blocked By**: None (this is the first work package)

---

## Notes

- **Security**: Never commit `.env` file to version control. Verify it's in `.gitignore`.
- **Deep Linking**: Deep link testing requires either a physical device or simulator/emulator. Web doesn't support deep linking in the same way.
- **Supabase Email**: For development, Supabase's built-in email service is sufficient. Production will require SendGrid or AWS SES configuration.
- **Redux Persist**: The actual auth slice will be added in WP03. This task just sets up the infrastructure.
- **Testing**: This work package is primarily configuration, so testing is mostly manual verification. Automated tests will be added in subsequent work packages.

---

## Reference Links

- [Supabase Auth Setup](https://supabase.com/docs/guides/auth/auth-email)
- [Expo Deep Linking](https://docs.expo.dev/guides/linking/)
- [Redux Persist](https://github.com/rt2zz/redux-persist)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
