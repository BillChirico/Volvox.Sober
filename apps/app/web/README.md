# Web Platform

Web-specific code and configurations for Expo Web.

## Platform-Specific Components

You can create web-specific versions of components by using the `.web.tsx` extension:

```
src/components/
  Button.tsx        # Shared component (iOS, Android, Web)
  Button.web.tsx    # Web-specific override
```

## Web Configuration

Web-specific settings are in `app.json` under the `web` key.

## Running Web

```bash
pnpm web
# or
pnpm --filter app web
```
