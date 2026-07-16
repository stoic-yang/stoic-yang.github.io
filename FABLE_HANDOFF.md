# Fable frontend handoff

This branch is the reproducible handoff point for the current Hexo blog. It
contains the current site configuration, imported posts and assets, the active
theme, validation tooling, and deployment workflow.

## Start here

- Runtime: Node.js 18 or newer
- Static-site generator: Hexo 7.3
- Active theme: `themes/ink`
- Site configuration: `_config.yml`
- Theme configuration: `themes/ink/_config.yml`
- Deployment: `.github/workflows/pages.yml`

Install and run the local preview:

```bash
npm ci
npm run server
```

Before handing work back, run:

```bash
npm run clean
npm run build
npm run validate
```

`npm run validate` checks article frontmatter, generated local links and assets,
and accidental `public/1970/` output.

## Frontend entry points

The current frontend is deliberately small and repo-native:

- `themes/ink/layout/layout.ejs`: shared document shell, header, navigation,
  footer, and ambient background
- `themes/ink/layout/index.ejs`: home/article-list page
- `themes/ink/layout/post.ejs`: article page
- `themes/ink/layout/page.ejs`: standalone pages such as About
- `themes/ink/layout/archive.ejs`: archive page
- `themes/ink/source/css/style.css`: the complete visual system and responsive
  styles
- `themes/ink/source/js/ambient.js`: progressive ambient pointer interaction

The inactive `themes/shoka` directory is retained only because it is part of the
incoming working state. Do not treat it as the production theme or spend time
modifying it unless the user explicitly asks to switch themes.

## Content and routing constraints

- Treat `source/_posts/**` and its colocated images as user content. Do not
  rewrite, rename, or delete them as part of a visual redesign.
- Preserve `source/about/index.md`, `source/links/**`, and shared images under
  `source/assets/**` and `source/images/**`.
- Preserve existing permalinks and the routes `/`, `/archives/`, and `/about/`.
- Keep the site statically buildable by GitHub Actions; do not introduce a
  backend or runtime-only dependency.
- Do not commit `node_modules/`, `public/`, local Obsidian state, books, or other
  ignored personal directories.

## Redesign boundary

The user's design prompt should be treated as the authority for visual
direction. Unless that prompt explicitly expands the scope, focus changes on
`themes/ink/**` and make only the minimum supporting configuration changes.

At minimum, verify:

- home, archive, About, and article layouts
- desktop and narrow mobile widths down to 320 px
- long Chinese article titles, code blocks, images, and navigation wrapping
- keyboard focus visibility and reduced-motion behavior
- local links and assets via `npm run validate`

## Expected handback

Return the redesign on a separate branch or a clean sequence of commits based
on `codex/fable-frontend-handoff`. Include:

1. a short summary of the visual and interaction changes;
2. the exact files changed;
3. screenshots of the main desktop and mobile views;
4. the results of `npm run build` and `npm run validate`;
5. any deliberate content, routing, dependency, or deployment changes.

Do not push directly to `main`.
