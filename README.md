# tooManyHours — web app

React 19 + TypeScript + Vite. Keeps a list of games across three categories and
shares it at a public `/u/<username>` URL.

The Go API lives in its own repository beside this one. Both are developed
together and versioned independently.

## Commands

```bash
npm run dev          # dev server on :3100, bound to all interfaces
npm test             # Vitest, run once
npm run test:watch
npm run build        # tsc -b && vite build
npm run lint         # eslint, --max-warnings=0 (prettier runs as a rule)
npm run format       # prettier --write src/
npm run check-format
npm run codegen      # Orval, from ../toomanyhours-api/openapi.yml
```

Run `npm run format` before `npm run lint`: prettier reports through eslint, so
a formatting slip otherwise arrives as a confusing lint error.

`src/api/generated/` is a build output — `codegen` wipes the directory on every
run, so a hand edit there is lost silently.

## Environment

`.env.local`, gitignored:

```
VITE_API_URL=http://localhost:3130
```

The app never calls that host directly. `httpRequest` hardcodes `/api`, and
Vite proxies `/api/*` there while stripping the prefix — so a production deploy
needs an equivalent rewrite rule.

**Never put a secret in this file.** Vite inlines `VITE_*` variables at build
time, which publishes them to every visitor with no way to un-publish. The IGDB
and Twitch credentials belong to the API's `.env` and only there; the browser
never talks to IGDB.

## Testing on a phone or another machine

The dev server already binds to every interface (`server.host: true`), so no
change here is needed. Check first that both devices are actually on the same
network — a phone that has quietly joined a different SSID looks exactly like a
firewall problem and wastes far more time. Then two things outside this repo
usually are needed:

**A firewall rule.** With `ufw` enabled the default input policy is `DROP`, and
a phone's connection is refused before Vite ever sees it — "site can't be
reached", with the server running perfectly. Allow the port for the local
subnet rather than the world; the dev server has no authentication in front of
it:

```bash
ip -4 -o addr show scope global          # find the subnet, e.g. 10.100.3.186/16
sudo ufw allow from 10.100.0.0/16 to any port 3100 proto tcp
```

**Connect by IP, not by hostname.** Vite checks the `Host` header. A raw IP is
accepted; a hostname such as `desktop.local` is rejected with "Blocked request.
This host is not allowed." and has to be listed in `server.allowedHosts`.

A device on a different subnet — wired while the laptop is on wifi — needs its
own rule. If a rule for the right subnet still does not work, the next suspect
is client isolation on the access point, which nothing on this machine can fix.

## Notes

- Vitest runs in `environment: "node"` and collects `src/**/*.test.ts` only, so
  every test here is a pure function and no component is rendered.
- Component-local styles are CSS modules beside the component; everything else
  is Tailwind v4, configured entirely in `src/index.css`.
- `/changelog` is rendered from `src/changelog.ts`, and an entry lands in the
  same commit as the version bump it describes.
