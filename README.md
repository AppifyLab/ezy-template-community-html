# Community site — plain HTML

A starter for your community's **public website**, in plain HTML, CSS and one
small script. No framework, no build step: what is in this folder is exactly
what visitors get.

## Put it live

Make your own copy first — this repository is a template, you never edit it
directly:

- **Upload a zip** — download this template as a zip, change what you like and
  upload the zip on the **Custom code** page of your EzyCommunity dashboard.
  Every new upload replaces the live site.
- **Or connect GitHub** — click **Use this template** on GitHub to copy it into
  your own account, then pick that repository and a branch on the dashboard.
  Every push to that branch redeploys your site.

The platform sees a root `index.html` and publishes the files as they are.

## What this site controls — and what it doesn't

Your community lives on one address (for example
`https://intel.ezycommunity.com`). Two things serve it, and the split is fixed:

| Address                   | Served by        |
| ------------------------- | ---------------- |
| `/` (home)                | **this site**    |
| `/about/`, any page slug  | **this site**    |
| `/blog/`, `/blog/post/`   | **this site**    |
| `/login`, `/join`         | EzyCommunity     |
| `/feeds`, `/dashboard`    | EzyCommunity     |
| `/api`, other app paths   | EzyCommunity     |

So your public, marketing pages live here; the community product itself
(sign-up, log in, the feed, courses, events, settings) is run by EzyCommunity.
Link to it with ordinary links (`<a href="/feeds">`), as these pages do. A file
you add under an app path (say `login/index.html`, `robots.txt` or
`sitemap.xml`) is never reached by visitors — the dashboard lists any it finds.

## Your content comes from your community

Nothing is hard-coded. `site.js` reads your **live** community data in the
visitor's browser, from your site's own address:

- your name, logo and favicon (`/api/public/site/v1/initial-data`)
- your published blog posts (`/api/public/blog/post/...`)

Edit a post in your dashboard and it shows here on the next visit — no
redeploy needed.

## Where things are

```
index.html              the home page
about/index.html        /about/ — a page is a folder with an index.html
blog/index.html         /blog/ — the blog list (?page=2 for older posts)
blog/post/index.html    /blog/post/?slug=<post> — one blog post
404.html                any address that has no page
styles.css              all the styling
site.js                 fetches your brand and posts and fills the pages
```

Add a page by adding a folder with an `index.html` in it: `team/index.html`
becomes `/team/`. Copy the header and footer from an existing page, and keep
`<script src="/site.js" defer>` if the page should show your brand.

Always link to files from the root (`/styles.css`, not `styles.css`): the 404
page is shown at any address, so relative links would break there.

## Preview on your machine

The pages call your community's API on the same address they are served from,
so a preview needs a small server that passes `/api` through to your community:

```bash
npx local-web-server --port 4400 \
  --rewrite '/api/(.*) -> https://intel.ezycommunity.com/api/$1'
```

Replace `intel.ezycommunity.com` with your community's address, then open
`http://localhost:4400`. Opening the files directly (`file://`) shows the pages
without your brand or posts.

## Getting help

Broke something? Your recent deploys are kept, so you can redeploy an earlier one
from your dashboard while you fix it.
