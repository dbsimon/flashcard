腦霧救星 v42

Deployment Guide

Package contents
- naowu-hero_v42.html: the main app file.
- gas_sync_backend.gs: optional Google Apps Script backend for Google Sheets sync.
- README.txt: this guide.

Quick start
1. Download the zip and extract it.
2. Open naowu-hero_v42.html directly in a modern browser to use the app locally.
3. All cards and settings are stored in your browser using IndexedDB, so each browser/device keeps its own local copy unless you set up sync.

Deploy on GitHub Pages
1. Create a GitHub repository.
2. Upload naowu-hero_v42.html to the repository root.
3. Rename naowu-hero_v42.html to index.html before publishing, or GitHub Pages will not load it as the default page.
4. In the repository, go to Settings > Pages.
5. Under Build and deployment, choose Deploy from a branch.
6. Select the main branch and the /(root) folder, then save.
7. Wait for GitHub Pages to publish.
8. Open your site at https://YOUR-USERNAME.github.io/YOUR-REPO/

Important notes for GitHub Pages
- File names are case-sensitive. Use index.html in lowercase.
- If you update the app later, replace index.html with the newer version.
- Your local browser data does not automatically move to GitHub Pages, because the hosted site uses a different browser storage origin.
- If the page shows 404, check that the repository contains index.html in the root and that Pages is enabled for the correct branch.

Deploy on other static hosts
You can also host the app on any static web host that serves plain HTML files, such as:
- GitHub Pages
- Netlify
- Cloudflare Pages
- Vercel static hosting
- Any normal web server

For any static host
1. Upload the HTML file.
2. Make it the default landing page, usually named index.html.
3. Open the public URL in a modern browser.

Google Sheets sync overview
The app works without sync. Google Sheets sync is optional.

If you want sync, you need:
- One Google Sheet.
- One Apps Script project bound to that sheet.
- The gas_sync_backend.gs file pasted into that Apps Script project.
- A deployed Apps Script Web App URL ending in /exec.
- A shared token stored in the sheet and entered in the app.

Set up Google Sheets sync
1. Create or open a Google Sheet.
2. Open Extensions > Apps Script from that sheet.
3. Replace the script contents with gas_sync_backend.gs.
4. Save the project.
5. Deploy it as a Web app.
6. Set Execute as: Me.
7. Set Who has access: Anyone.
8. Copy the deployed /exec URL.
9. In the app, open Sync Settings and paste the /exec URL.
10. Enter the same token in the app that you store in the sheet.

Sheet structure
The backend expects a sheet tab named leitner_sync.
If it does not exist yet, create it manually or let the script create it after first successful execution.

Use this layout:
- A1 = token
- B1 = payload_json
- C1 = updated_at
- A2 = your shared token, for example abc123

How sync works
- Push sends your current folders and cards from the browser to Google Sheets.
- Pull replaces the current browser data with the dataset stored in Google Sheets.
- After pull, the app saves the pulled dataset back into local browser storage.

Troubleshooting
- 404 on GitHub Pages: confirm the published file is named index.html and is in the repository root.
- Sync does not work: confirm you deployed the Apps Script as a Web App and used the /exec URL, not the editor URL.
- Invalid token: confirm the token in the app matches leitner_sync!A2 exactly.
- No sync sheet found: create a tab named leitner_sync and add the required headers and token.
- No old cards appear after deployment: this is expected if you did not set up sync, because each browser/site keeps separate local IndexedDB data.
- Browser restrictions: use a modern browser with JavaScript and IndexedDB enabled.

Upgrade workflow
1. Download a newer version package.
2. Replace the deployed index.html with the newer HTML file.
3. If the package includes a new gas_sync_backend.gs, update and redeploy the Apps Script Web App as well.
4. Refresh the site in the browser.

Recommended deployment checklist
- index.html exists in the publish root.
- GitHub Pages or your chosen host is enabled.
- The site opens without 404.
- The set menu, review mode, and card editing all work.
- If using sync, the Apps Script deployment is live.
- If using sync, the token in the app matches the token in leitner_sync!A2.

Copyright
Copyright (c) Westdoor Streetson 2026


Version 43 note
- Review launch was hardened for iPhone/mobile Safari by replacing the legacy start-review button path with a single clean launcher and a more tolerant due-date parser.
