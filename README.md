# Page Description Editor

Vanilla JavaScript editor for a Squiz Matrix Asset Listing. The initial UI edits asset status, page name, web path, and `seo.description` metadata.

## Local development

```sh
npm install
npm run dev
```

Local Vite development uses the representative rows in `index.html` and mock saves. No Squiz Matrix content is changed locally.

## Production

Build the static assets with:

```sh
npm run build
```

The build produces `dist/editor.js` and `dist/editor.css`. Commit these deployment assets and synchronise them through Squiz Matrix Git File Bridge, then include the generated JavaScript and CSS in the Matrix Asset Listing page. Matrix renders the listing rows and authorises API updates.

The web-path control deliberately blocks production saves until the exact `getWebPath()` and `setWebPath()` response and request contract has been confirmed in Matrix DEV. The implementation must preserve every returned alternate path and update only the approved primary path with `auto_remap` enabled.
