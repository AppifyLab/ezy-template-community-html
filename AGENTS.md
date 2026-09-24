# Rules for AI agents working in this site

This folder is ONE community's public Site, published as-is (no build): `/`,
`/about/`, `/blog/`, `/blog/post/?slug=<slug>` and `404.html` for any address
with no file. Every other path on the hostname (`/login`, `/join`, `/feeds`,
`/dashboard`, `/api`, `/_next`, `/robots.txt`, `/sitemap.xml`…) is served by
the EzyCommunity App and never reaches these files — link to it with a plain
`<a href>`.

- Keep it a plain static site: the platform publishes it because there is a
  root `index.html` and NO `package.json`. Adding a `package.json` with a
  framework or build tool changes how it is detected — don't.
- A page is `<name>/index.html` (served at `/<name>/`). Never create files
  under an App path (`login/`, `api/`, `feeds/`…) or a `robots.txt` /
  `sitemap.xml` — the App owns those URLs and visitors never see the file.
- Reference assets from the root (`/styles.css`, `/site.js`), never relative:
  `404.html` is served at arbitrary depths.
- ALL data comes from `site.js`, fetched in the browser from the SAME origin
  (`/api/public/...`). There is no server and no build-time data. Never call
  another host: the API lives only on the community's own origin and sends no
  CORS headers to other sites.
- The API is `/api/public/site/v1/initial-data` (name, logo, favicon — no
  description, no colours; don't invent fields), `/api/public/blog/post/all-posts?page=&per_page=`
  (`per_page`, not `limit`; envelope `{data: {meta, data: [...]}}`) and
  `/api/public/blog/post/<slug>/read`.
- Write API data with `textContent` / attributes. The ONLY `innerHTML` is the
  post body (rich text from the community's own blog editor, rendered the same
  way the platform's blog renders it).
- Show authors by name only; never render or store an email address.
- No `.github/workflows/` — the site deploys from the platform, not Actions.

## Platform rules

True for any code on an EzyCommunity Site, not only this Template:

- **What is built is detected from the files, and the verdict is final:**
  TanStack Start (`@tanstack/react-start`), Astro (static, or SSR with
  `@astrojs/cloudflare` only), or a root `index.html` published as-is.
  Next.js, Nuxt, SvelteKit, Remix, React Router (framework mode), Gatsby,
  Angular and un-built Vite / CRA / Eleventy source are refused. The project
  sits at the repository root (a zip may wrap it in one folder); a Node project
  has one lockfile (npm, pnpm or yarn; bun is refused). Server code runs on
  Cloudflare Workers (`nodejs_compat`), not Node.
- **The App owns** `/api`, `/login`, `/join`, `/feeds`, `/dashboard`,
  `/settings`, `/_next`, `/robots.txt`, `/sitemap.xml`,
  `/<product>/<id>/checkout` and more: a file or route there is never served
  (the dashboard lists it as a shadowed path). Link to App pages with a plain
  `<a href>`.
- **Community data comes only from its public API on its own hostname**
  (`/api/public/...`): server code builds the URL from `EZY_SITE_URL` (the
  only environment variable), browser code uses relative URLs. Deployed server
  code can reach no other host. Data fetched during the Build is frozen until
  the next Build (a Redeploy reuses the old output) — fetch at request time or
  in the browser.
- **There are no secrets.** No secret store exists: never put keys, tokens or
  passwords in code, `.env` or config — assume anything in the project can end
  up public. Never send a member's email address to the browser.
- **No deploy config.** Don't commit `wrangler.*`: the platform writes the
  Worker config and drops any KV, R2, D1 or other binding.
