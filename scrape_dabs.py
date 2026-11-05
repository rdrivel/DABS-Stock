#!/usr/bin/env python3
"""Pull Utah DABS store stock for every Proverbial SKU and write stores.json.

The DABS product locator keeps the selected SKU in a server session:
  1. GET  /ProdApps/ProductLocatorCore                      (session cookie)
  2. GET  /ProdApps/ProductLocatorCore/Products/GetDetailUrl?sku=NNNNNN
  3. GET  /ProdApps/ProductLocatorCore/ProductDetail/Index  (HTML store table)
"""
import html
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

import requests

BASE = "https://webapps2.abc.utah.gov/ProdApps/ProductLocatorCore"
# Key -> DABS item number. Keys are what the site's store finder filters on; order = chip order.
SKUS = {
    "gin": "924335",     # No Rest for the Wicked gin 750ml
    "rum": "924334",     # Loose Lips Sink Ships rum 750ml
    "vodka": "037783",   # Never Say Never vodka 750ml
    "barrel": "927870",  # Knock on Wood barrel rum 750ml
    "tango": "931895",   # Two to Tango 355ml
    "slice": "931896",   # Slice of Heaven 355ml
    "bees": "928594",    # More Bees with Honey 355ml
    "mule": "931894",    # Lead a Mule to Water 355ml
}
OUT = Path(__file__).with_name("stores.json")

ROW_RE = re.compile(r"<tr[^>]*>(.*?)</tr>", re.S | re.I)
CELL_RE = re.compile(r"<td[^>]*>(.*?)</td>", re.S | re.I)
PIN_RE = re.compile(r"maps\.google\.com/\?q=(-?[\d.]+),(-?[\d.]+)")
TAG_RE = re.compile(r"<[^>]+>")
SPAN_RE = re.compile(r"<span[^>]*>(.*?)</span>", re.S | re.I)


def text(s):
    return html.unescape(TAG_RE.sub("", s)).strip()


def tidy(s):
    """DABS mixes ALL CAPS and Title Case. Normalise to Title Case."""
    s = " ".join(s.split()).title()
    s = re.sub(r"(\d)(St|Nd|Rd|Th)\b", lambda m: m.group(1) + m.group(2).lower(), s)
    s = re.sub(r"\bSaint George\b", "St. George", s)
    return s


def parse_detail(page):
    """Return (product_info, [store rows]) from a ProductDetail page."""
    main = page[page.find("<main"):] if "<main" in page else page
    spans = [text(x) for x in SPAN_RE.findall(main[:4000])]
    info = {}
    for i, sp in enumerate(spans):
        if sp.startswith("PROVERBIAL") and "name" not in info:
            info["name"] = sp
        if sp.startswith("$") and "price" not in info:
            info["price"] = float(re.sub(r"[^\d.]", "", sp) or 0)
        if sp == "At Warehouse" and i > 0:
            info["warehouse"] = int(re.sub(r"\D", "", spans[i - 1]) or 0)
    stores = []
    tbody = main[main.find("<tbody"):] if "<tbody" in main else ""
    for row in ROW_RE.findall(tbody):
        cells = CELL_RE.findall(row)
        if len(cells) < 6:
            continue
        pin = PIN_RE.search(row)
        if not pin:
            continue
        sid = text(cells[0])
        stores.append({
            "id": sid,
            "name": "State Liquor Store #%d" % int(sid) if sid.isdigit() else tidy(text(cells[1])),
            "addr": tidy(text(cells[2])),
            "city": tidy(text(cells[3])),
            "phone": text(cells[4]),
            "qty": int(re.sub(r"\D", "", text(cells[5])) or 0),
            "lat": round(float(pin.group(1)), 6),
            "lng": round(float(pin.group(2)), 6),
        })
    return info, stores


def fetch(sku, s):
    r = s.get(f"{BASE}/Products/GetDetailUrl", params={"sku": sku}, timeout=30)
    r.raise_for_status()
    url = r.text.strip().strip('"') or f"{BASE}/ProductDetail/Index"
    r = s.get(url, timeout=30)
    r.raise_for_status()
    return parse_detail(r.text)


def main():
    s = requests.Session()
    s.headers["User-Agent"] = "Mozilla/5.0 (ProverbialSpirits store finder; daily stock refresh)"
    s.get(BASE, timeout=30).raise_for_status()

    products, merged, empty = {}, {}, []
    for key, sku in SKUS.items():
        try:
            info, rows = fetch(sku, s)
        except requests.RequestException as e:
            print(f"SKU {sku} ({key}) failed: {e}")
            info, rows = {}, []
        if not rows:
            empty.append(key)  # sold out everywhere, delisted or a hiccup: keep going
        products[key] = {"sku": sku, **info, "stores": len(rows)}
        for row in rows:
            st = merged.setdefault(row["id"], {k: v for k, v in row.items() if k != "qty"})
            st[key] = row["qty"]

    if len(empty) == len(SKUS):
        sys.exit("No store rows for any SKU; leaving stores.json unchanged.")
    if empty:
        print("No stores for:", ", ".join(empty))

    stores = sorted(merged.values(), key=lambda x: x["id"])
    for st in stores:
        for key in SKUS:
            st.setdefault(key, None)  # null = store doesn't list this SKU

    data = {
        "updated": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "source": BASE,
        "products": products,
        "stores": stores,
    }
    OUT.write_text(json.dumps(data, indent=1) + "\n")
    print(f"Wrote {len(stores)} stores to {OUT.name}")


if __name__ == "__main__":
    main()
