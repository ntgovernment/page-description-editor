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

Git File Bridge serves the source assets directly, as it does for the EOI editor. Synchronise `src/editor.css`, `src/matrix-api.js`, and `src/editor.js`, then include them in the Matrix Asset Listing page. Matrix renders the listing rows and authorises API updates.

Load the approved Matrix JavaScript API before the editor's two JavaScript files.

```html
<script src="./?a=129303"></script>
<script src="%globals_asset_url_with_hash:993623:src/matrix-api.js%"></script>
<script src="%globals_asset_url_with_hash:993623:src/editor.js%"></script>
```

The editor creates one `Squiz_Matrix_API` client. Status updates send `cascade: false`; name updates use the `name` attribute; page-description updates use metadata field ID `266108`.

The web-path control deliberately blocks production saves until the exact `getWebPath()` and `setWebPath()` response and request contract has been confirmed in Matrix DEV. The implementation must preserve every returned alternate path and update only the approved primary path with `auto_remap` enabled.
