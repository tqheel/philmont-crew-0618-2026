# Philmont Crew 618 Planning Hub

Single-page web app that turns Philmont planning guides into a navigable reading experience for Crew 618 (June 2026). The site loads the Markdown versions of the 2025 Philmont guides and presents them with a sidebar table of contents, document tabs, and next/previous navigation.

## What’s Included

- Advisor’s Guidebook (Markdown + images)
- Guidebook to Adventure (Markdown + images)
- Parent’s Peace of Mind Guide (Markdown + images)
- Static SPA with a Philmont-inspired design system

## Project Structure

- app.js: SPA logic (document loading, section parsing, navigation)
- index.html: Layout and document tabs
- styles.css: Full UI styling
- start_server.sh: Local static server helper
- update_guidebook_toc.py: Script that renames “Page #” headings in the Guidebook to Adventure
- 2025-*/ and Parents-Guide/: Markdown content and images
- *.pdf: Original source PDFs

## Run Locally

1. Ensure Python 3 is installed.
2. Start a local server:

   ./start_server.sh

3. Open the site:

   http://localhost:3000

If you prefer another port, edit the PORT value in start_server.sh.

## Notes

- The app uses the Marked.js CDN to render Markdown in the browser.
- Image paths are rewritten at runtime to load from each guide’s images folder.
- The home screen links into each guide via the document tabs.

## Updating the Guidebook TOC

If the Guidebook to Adventure headings need to be replaced with the official table of contents titles, run:

python3 update_guidebook_toc.py
