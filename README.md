# sempe.dev

Personal website and blog for Lucas Sempé, built with [Astro](https://astro.build/) and deployed to GitHub Pages.

Live: [sempe.dev](https://sempe.dev)

## Running locally

```powershell
npm install
npm run dev      # http://localhost:4321
npm run build    # writes static output to dist/
npm run preview  # serve the built output
```

Node 20 or later, matching the CI runner.

## Layout

The repository root **is** the Astro project. There is no nested site folder.

```
astro.config.mjs        site URL + Tailwind v4 via @tailwindcss/vite
src/pages/              routes: index, cv, projects, publications, rss.xml.ts, blog/
src/layouts/Layout.astro  shared shell: nav, footer, meta, RSS link
src/content/blog/*.md   blog posts (27)
src/content/config.ts   blog frontmatter schema
src/styles/global.css   Tailwind entry point
public/                 shipped verbatim into the build root
scripts/                local helpers, never run by CI
.github/workflows/      astro-deploy.yml
```

## Adding a blog post

Drop a Markdown file into `src/content/blog/`, add a matching PNG at `public/images/blog/<slug>.png`, and include frontmatter:

```yaml
---
title: "..."
subtitle: "..."     # optional
summary: "..."      # optional, shown on the blog index and homepage cards
date: 2026-09-28
tags: ["..."]       # optional
categories: ["..."]# optional
featured: false     # optional, pins the post to the homepage
draft: false        # optional, set true to keep it out of the build
---
```

The slug is the filename. Header images are generated rather than sourced: `npm run blog-images` runs `scripts/generate-blog-images.js`, which uses `canvas` and `roughjs` to draw each theme's icon into `public/images/blog/`. Those two packages are devDependencies, so the script only runs locally.

## What lives in `public/`

Astro does not process `public/`; it copies it to the build root unchanged. Most of the site's weight sits here, produced outside this repository.

- `books/ml/` — *Machine Learning Concepts*, 49 chapters plus an appendix, served at `/books/ml/`.
- `books/small-n/` — *Small-n Approaches to Impact Evaluation*, 19 chapters plus three appendices and a separate evidence-synthesis page, served at `/books/small-n/`.
- `small-n/` — an earlier 13-chapter build of the same book, left at the old path. Nothing links to it any more; `/books/small-n/` is the live copy, and this directory is a candidate for deletion.
- `sr-platform/` — ten saved HTML pages documenting the systematic review platform, each alongside a `*_files/` directory of assets. These carry `meta robots noindex`.
- `orthogonality-report.html` — a standalone rendered report, linked from Projects.
- `uploads/` — CV, résumé and paper PDFs.

`images/`, `CNAME` and the favicons are here too.

Both books are Quarto output. Rebuilding one means rendering it with Quarto elsewhere and copying the result back in; the Astro build never touches these files, and a `npm run build` will not notice if they change.

## Deployment

Pushing to `main` triggers `.github/workflows/astro-deploy.yml`, which runs `npm ci`, `npm run build`, and publishes `dist/` to GitHub Pages. No manual build step, and no branch to merge into first.

The custom domain comes from `public/CNAME`, which is copied into the build output.

## History worth knowing

An `astro-site/` folder used to sit here. The Astro migration originally lived inside it, was flattened to the root, and the folder was deleted. It was then accidentally re-created holding a single stale copy of `index.astro`, which stayed tracked for months and absorbed two profile edits that were meant for the live page. It was removed in `4c52f39`. Nothing should recreate it: edit `src/pages/` at the root, not a subfolder.

The repository lives in a OneDrive folder, which periodically drops Windows `desktop.ini` files into every directory, `.git` included. Those files inside `.git/refs/` are read as refs and break `git fetch` with `fatal: bad object refs/desktop.ini`. If that happens, delete them:

```powershell
Get-ChildItem .git -Recurse -Force -Filter desktop.ini -File | Remove-Item -Force
```

