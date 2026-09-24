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
  another host — only the community's own origin has the API, without CORS.
- The API is `/api/public/site/v1/initial-data` (name, logo, favicon — no
  description, no colours; don't invent fields), `/api/public/blog/post/all-posts?page=&per_page=`
  (`per_page`, not `limit`; envelope `{data: {meta, data: [...]}}`) and
  `/api/public/blog/post/<slug>/read`.
- Write API data with `textContent` / attributes. The ONLY `innerHTML` is the
  post body (rich text from the community's own blog editor, rendered the same
  way the platform's blog renders it).
- Show authors by name only; never render or store an email address.
- No `.github/workflows/` — the site deploys from the platform, not Actions.
