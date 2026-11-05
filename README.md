# Proverbial DABS store stock

Every morning a GitHub Action pulls Utah DABS store stock for:

- 931895 Two to Tango
- 931896 Slice of Heaven

It writes `stores.json`. The landing page at proverbialspirits.com/two-to-tango-slice-of-heaven reads that file. If the file can't be loaded, the page falls back to the store list built into its code.

- Refresh now: Actions tab > "Update DABS store stock" > Run workflow.
- Add a SKU: add it to `SKUS` in `scrape_dabs.py`. The page also needs a matching filter chip and pill.
- If a run finds no stores for a SKU (for example DABS is down), it exits without touching `stores.json`.
