# Proverbial DABS store stock

Every morning a GitHub Action pulls Utah DABS store stock for:

- 931895 Two to Tango
- 931896 Slice of Heaven

It writes `stores.json`. The landing page at proverbialspirits.com/two-to-tango-slice-of-heaven reads that file. If the file can't be loaded, the page falls back to the store list built into its code.

- Refresh now: Actions tab > "Update DABS store stock" > Run workflow.
- Add a SKU: add it to `SKUS` in `scrape_dabs.py`. The page also needs a matching filter chip and pill.
- If a run finds no stores for a SKU (for example DABS is down), it exits without touching `stores.json`.

## Landing page (`landing/`)

The page itself lives here, so changes ship with a git push instead of the Squarespace editor.

- `landing.html` markup, `landing.css` styles, `landing.js` store finder and Google Analytics events, `img/` can images.
- `embed.js` loads all of it. The Squarespace Code block only contains:
  ```html
  <div id="psrtd-mount"></div>
  <script src="https://cdn.jsdelivr.net/gh/rdrivel/dabs-stock@main/landing/embed.js"></script>
  ```
- Pushing anything in `landing/` runs "Refresh landing page on the CDN", which purges jsDelivr so the change is live in about a minute.
- Moving off Squarespace: serve the `landing/` folder from your own server and open `index.html`. Add your Adobe Fonts kit there for the brand fonts.

Analytics events: `get_directions`, `call_store`, `use_location`, `zip_lookup`, `choose_city`, `can_filter`, `find_a_can_click`.
