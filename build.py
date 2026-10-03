#!/usr/bin/env python3
"""Build the Estonian FIRE Simulator site from markdown.

    python3 build.py               # rebuild the generated pages in place
    python3 build.py --site _site  # ...then copy only the published files to _site/

Generates index.html, one HTML page per guide topic, and the two calculator
pages (simulator.html and pension.html) from src/*.template.html with the JS
modules inlined. Never edit the generated HTML by hand.

Markdown in docs/guide/ is the source of truth for the guide pages.

Requires: python3 -m pip install -r requirements.txt (pins Markdown), and Node.js
to read src/rates.js.
"""

from __future__ import annotations

import argparse
import base64
import calendar
import hashlib
import json
import re
import shutil
import subprocess
import unicodedata
from pathlib import Path

import markdown

ROOT = Path(__file__).resolve().parent
DOCS = ROOT / "docs"
OUT = ROOT / "guide"
SRC = ROOT / "src"

# Dependency order. ES module imports are blocked on file:// URLs, so the
# modules are concatenated into one inline script - the page then works when
# opened directly from disk, not only when served over HTTP.
# Each standalone page and the modules it needs, in dependency order.
BUNDLES = {
    "simulator.html": ("simulator.template.html",
                       ["format.js", "explain.js", "rates.js", "investment-account-tax.js", "calc.js", "rules.js", "state.js", "ui.js", "nav.js"]),
    "pension.html":   ("pension.template.html",
                       ["format.js", "explain.js", "rates.js", "investment-account-tax.js", "calc.js", "pension-ui.js", "nav.js"]),
}

# Reading order: (source relative to docs/, url slug, nav label).
PAGES = [
    ("guide/fire-basics.md",           "fire-basics",        "FIRE basics"),
    ("guide/tax-overview.md",          "tax-overview",       "Estonian tax overview"),
    ("guide/investment-account.md",    "investment-account", "The investment account"),
    ("guide/pensions.md",              "pensions",           "Pension pillars"),
    ("guide/health-insurance.md",      "health-insurance",   "Health insurance"),
    ("guide/crypto.md",                "crypto",             "Crypto"),
    ("guide/real-estate.md",           "real-estate",        "Property & rental income"),
    ("guide/company.md",               "company",            "Using an OÜ"),
    ("guide/portfolio.md",             "portfolio",          "Building the portfolio"),
    ("guide/brokers.md",               "brokers",            "Brokers & parking cash"),
    ("guide/property-purchase.md",     "property",           "Buying a home"),
    ("guide/household.md",             "household",          "Household & children"),
    ("guide/fatfire.md",               "fatfire",            "FatFIRE"),
    ("guide/risks.md",                 "risks",              "Risks & blind spots"),
    ("guide/account-protection.md",    "protection",         "Account protection"),
    ("guide/strategy-levers.md",       "levers",             "Strategy levers"),
    ("guide/verification.md",          "sources",            "Sources & verification"),
]

# Everything a visitor needs, and nothing else. The deploy workflow and the
# browser-test server both publish exactly this list (via --site), so the tests
# check the same artifact that ships. Directories are copied whole.
SITE_FILES = [
    "index.html", "simulator.html", "pension.html",
    "tokens.css", "styles.css",
    "src/nav.js",
    "guide/",
]

SIDEBAR = """<button id="menu" class="menu" aria-label="Toggle navigation" aria-controls="sidebar" aria-expanded="false">
  <span></span><span></span><span></span>
</button>
<nav class="mobile-brand-nav" aria-label="Home">
  <a class="mobile-brand" href="{root}index.html" aria-label="Estonian FIRE home">
    <span class="brand-mark" aria-hidden="true">FI</span>
    <span>Estonian FIRE</span>
  </a>
</nav>

<nav id="sidebar" class="sidebar" aria-label="Contents">
  <a class="brand" href="{root}index.html" aria-label="Estonian FIRE home">
    <span class="brand-mark" aria-hidden="true">FI</span>
    <span class="brand-text">Estonian&nbsp;FIRE<small>Simulator &amp; guide</small></span>
  </a>
  <ul class="nav">
    <li class="nav-doc{home_active}"><a class="nav-top" href="{root}index.html">Start here</a></li>

    <li class="nav-group">Calculators</li>
    <li class="nav-doc{sim_active}"><a class="nav-top" href="{root}simulator.html">FIRE calculator</a></li>
    <li class="nav-doc{pen_active}"><a class="nav-top" href="{root}pension.html">Pension calculator</a></li>

    <li class="nav-group">Guides</li>
{nav}
  </ul>
  <div class="sidebar-foot">
    <div class="theme-control" role="group" aria-label="Colour theme">
      <button type="button" data-theme-choice="light" aria-pressed="false">Light</button>
      <button type="button" data-theme-choice="system" aria-pressed="true">System</button>
      <button type="button" data-theme-choice="dark" aria-pressed="false">Dark</button>
    </div>
    <p class="note">Not financial advice. Baseline review: {verified}.
      <a href="{root}guide/sources.html">Per-rule checks and limitations</a>.</p>
  </div>
</nav>

<div class="scrim" id="scrim"></div>"""

# --------------------------------------------------------------- rate values

def load_rates() -> dict:
    """Read rates.js by executing it, so the prose and the calculator can never
    disagree about a figure. Flattened to dotted keys for use in markdown.

    Planning assumptions come through under `defaults.` - they are not law, but
    the prose quotes them just as often and drifts from them just as easily."""
    out = subprocess.run(
        ["node", "-e",
         "import('./src/rates.js').then(m=>console.log(JSON.stringify("
         "{...m.RATES, defaults: m.DEFAULTS})))"],
        cwd=ROOT, capture_output=True, text=True, check=True)
    flat: dict[str, object] = {}

    def walk(obj, prefix=""):
        for k, v in obj.items():
            key = f"{prefix}.{k}" if prefix else k
            if isinstance(v, dict):
                walk(v, key)
            else:
                flat[key] = v

    walk(json.loads(out.stdout))

    # Derived figures the prose quotes. Computed here so they follow the inputs.
    flat["derived.socialTaxMinimumMonthly"] = round(
        flat["socialTax"] * flat["socialTaxMinimumBaseMonthly"], 2)
    return flat


def month_label(year_month: str) -> str:
    """'2026-09' -> 'September 2026' for the sidebar's review date."""
    year, month = year_month.split("-")
    return f"{calendar.month_name[int(month)]} {year}"


def money(v) -> str:
    return "€" + f"{round(v):,}"


def percent(v) -> str:
    return (f"{v * 100:.2f}".rstrip("0").rstrip(".")) + "%"


def substitute_rates(text: str, rates: dict, source: str) -> str:
    """Replace {{key}} and {{key|filter}} with the live value.

    An unknown key is a build error rather than a silent passthrough - a typo
    in a figure is exactly the failure this is meant to prevent.
    """
    def repl(m):
        expr = m.group(1).strip()
        key, _, filt = expr.partition("|")
        key, filt = key.strip(), filt.strip()
        if key not in rates:
            raise SystemExit(f"{source}: unknown rate placeholder {{{{{expr}}}}}")
        v = rates[key]
        if filt == "money":
            return money(v)
        if filt == "money2":
            # Rounding hides the point when the cents are the point - a EUR 3.90
            # minimum commission shown as EUR 4 stops being lower than EUR 5.
            return "\u20ac" + f"{v:,.2f}"
        if filt == "money12":
            return money(v * 12)
        if filt == "pct":
            return percent(v)
        if filt == "pct3":
            # percent() rounds to 2 decimals, which turns a 0.008%/month custody
            # rate into 0.01% - the same number as the competitor it undercuts.
            return f"{v * 100:.3f}".rstrip("0").rstrip(".") + "%"
        if filt == "num":
            return f"{round(v):,}"
        return str(v)

    return re.sub(r"\{\{([^}]+)\}\}", repl, text)


_seen: set[str] = set()


def github_slugify(value: str, separator: str = "-") -> str:
    """Slugify the way GitHub does, so anchors written into the markdown resolve.

    GitHub deletes punctuation rather than collapsing it, so an em dash between
    spaces yields a double separator. Reproducing that quirk is the point.
    """
    value = unicodedata.normalize("NFC", value)
    value = re.sub(r"[^\w\s-]", "", value.lower(), flags=re.UNICODE)
    slug = re.sub(r"\s", separator, value.strip())
    unique, n = slug, 1
    while unique in _seen:
        unique, n = f"{slug}-{n}", n + 1
    _seen.add(unique)
    return unique


def render(md_text: str):
    # Heading IDs must be unique within a page, not across unrelated pages.
    _seen.clear()
    md = markdown.Markdown(
        extensions=["tables", "fenced_code", "attr_list", "sane_lists", "toc"],
        extension_configs={"toc": {"slugify": github_slugify, "toc_depth": "2-2"}},
    )
    return md.convert(md_text), md.toc_tokens


# Markdown source names and retired aliases -> published pages.
DOC_TO_SLUG = {src.split("/")[-1][:-3]: slug for src, slug, _ in PAGES}
DOC_TO_SLUG.update({
    "02-estonia-playbook": "tax-overview",
})


def rewrite_links(html_text: str, here: str) -> str:
    def repl(m):
        target, anchor = m.group(1), m.group(2) or ""
        slug = DOC_TO_SLUG.get(target)
        if slug is None:
            return m.group(0)
        if slug == here:
            return f'href="{anchor or "#"}"'
        return f'href="{slug}.html{anchor}"'

    html_text = re.sub(
        r'href="(?:\.\./)*(?:docs/|guide/)?([\w\-]+)\.md(#[^"]*)?"', repl, html_text)
    # Anything still pointing at a .md file did not resolve to a page in this
    # site - almost always a link to a sibling project that is not published.
    # Unwrap it to plain text rather than shipping a dead or leaking link. A
    # general rule beats naming the projects, which would leak them here.
    html_text = re.sub(r'<a href="[^"]*\.md[^"]*">(.*?)</a>', r"\1", html_text, flags=re.S)
    return html_text


TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#f6f8fb">
<script>
(function () {{
  var root = document.documentElement, choice = "system";
  try {{ choice = localStorage.getItem("fa-theme") || "system"; }} catch (e) {{}}
  if (choice !== "light" && choice !== "dark") choice = "system";
  if (choice !== "system") root.setAttribute("data-theme", choice);
  var dark = choice === "dark" || (choice === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.querySelector('meta[name="theme-color"]').content = dark ? "#0f1320" : "#f6f8fb";
}})();
</script>
<link rel="stylesheet" href="{root}tokens.css">
<link rel="stylesheet" href="{root}styles.css">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>&#128200;</text></svg>">
</head>
<body class="guide">
<a class="skip" href="#main">Skip to content</a>

{sidebar}

<main id="main" class="main">
  <div class="wrap">
    <section class="doc">
      <h1 class="doc-title">{h1}</h1>
{content}
      <nav class="pager">{pager}</nav>
    </section>
  </div>
</main>

<script src="{root}src/nav.js"></script>
</body>
</html>
"""


# ------------------------------------------------------------ page hardening

_INLINE_SCRIPT = re.compile(r"<script(?![^>]*\bsrc\s*=)[^>]*>(.*?)</script>", re.S | re.I)
# A style attribute in markup, or one set from JS via markup or setAttribute.
# CSSOM writes (el.style.x = ...) are not restricted by CSP and do not count.
_INLINE_STYLE = re.compile(r"""[\s"'`]style\s*=|setAttribute\(\s*['"]style['"]""")


def harden(html: str, page: str) -> str:
    """Add a Content-Security-Policy and a no-referrer policy to a page.

    Inline scripts are allowed by their SHA-256 hash, computed from the final
    page, so editing a template's inline script needs no manual update here.
    The referrer policy matters because a shared plan travels in the URL.
    """
    hashes = []
    for m in _INLINE_SCRIPT.finditer(html):
        digest = base64.b64encode(hashlib.sha256(m.group(1).encode("utf-8")).digest()).decode()
        if f"'sha256-{digest}'" not in hashes:
            hashes.append(f"'sha256-{digest}'")
    style_src = "'self' 'unsafe-inline'" if _INLINE_STYLE.search(html) else "'self'"
    policy = "; ".join([
        "default-src 'self'",
        "script-src " + " ".join(["'self'", *hashes]),
        "style-src " + style_src,
        "img-src 'self' data:",
        "object-src 'none'",
        "base-uri 'none'",
        "form-action 'none'",
    ])
    anchor = '<meta charset="utf-8">\n'
    if anchor not in html:
        raise SystemExit(f"{page}: no '<meta charset=\"utf-8\">' line to anchor the CSP meta tag after")
    # Must precede every script, or the policy does not apply to it.
    return html.replace(anchor, anchor +
                        f'<meta http-equiv="Content-Security-Policy" content="{policy}">\n'
                        '<meta name="referrer" content="no-referrer">\n', 1)


# Strips real ES import statements only, anchored at the start of a line:
# `import {a, b} from './x.js';`, `import x from '...';`, `import * as x from
# '...';` and `import '...';`, including braces that span several lines. The
# surrounding \s* keeps the historical whitespace handling of the bundles.
_IMPORT = re.compile(
    r"""^\s*import\s+(?:"""
    r"""(?:(?:[\w$]+\s*,\s*)?(?:\{[\w$\s,]*\}|\*\s+as\s+[\w$]+)|[\w$]+)\s+from\s+"""
    r""")?(['"])[^'"\n]+\1\s*;\s*$""", re.M)


def bundle_pages(sidebar_for) -> None:
    """Inline each page's JS modules and sidebar so they need no server."""
    for out_name, (template_name, modules) in BUNDLES.items():
        template = SRC / template_name
        if not template.exists():
            raise SystemExit(f"{out_name}: template {template.relative_to(ROOT)} is missing")

        parts, declared = [], {}
        for name in modules:
            code = (SRC / name).read_text(encoding="utf-8")
            code = _IMPORT.sub("", code)
            if re.search(r"^\s*import[\s{*'\"]", code, flags=re.M):
                raise SystemExit(
                    f"{out_name}: {name} has an import statement the bundler does not "
                    f"recognise. Use a plain `import {{ ... }} from './x.js';`.")
            code = re.sub(r"^export\s+", "", code, flags=re.M)

            # Concatenating modules collapses their separate scopes into one, so
            # two files declaring the same top-level name is a SyntaxError that
            # kills the whole page - and the page still *builds*, so only opening
            # it in a browser reveals it. This has happened twice (eur/pct, then
            # clamp), so the build now refuses instead.
            for m in re.finditer(
                    r"^(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)", code, flags=re.M):
                dup = declared.get(m.group(1))
                if dup:
                    raise SystemExit(
                        f"{out_name}: '{m.group(1)}' is declared in both {dup} and {name}. "
                        f"Bundled modules share one scope - rename one of them.")
                declared[m.group(1)] = name

            parts.append(f"/* ---- {name} ---- */\n{code}")

        script = '<script type="module">\n' + "\n".join(parts) + "\n</script>"
        html = (template.read_text(encoding="utf-8")
                .replace("<!--BUNDLE-->", script)
                .replace("<!--SIDEBAR-->", sidebar_for(out_name)))
        html = harden(html, out_name)
        (ROOT / out_name).write_text(html, encoding="utf-8")
        print(f"wrote {out_name} ({len(html):,} bytes, JS inlined)")


def build() -> None:
    OUT.mkdir(exist_ok=True)
    missing = [src for src, _, _ in PAGES if not (DOCS / src).exists()]
    if missing:
        raise SystemExit("missing guide source(s) listed in PAGES: " +
                         ", ".join(f"docs/{src}" for src in missing))
    pages = [(DOCS / src, slug, label) for src, slug, label in PAGES]

    rates = load_rates()
    verified = month_label(rates["lastVerified"])

    def nav_for(active: str, root: str) -> str:
        return "\n".join(
            f'    <li class="nav-doc{" active" if slug == active else ""}">'
            f'<a class="nav-top" href="{root}guide/{slug}.html">{label}</a></li>'
            for _, slug, label in pages
        )

    def sidebar_for(page: str, root: str = "", active: str = "") -> str:
        return SIDEBAR.format(
            root=root, verified=verified, nav=nav_for(active, root),
            home_active=" active" if page == "index.html" else "",
            sim_active=" active" if page == "simulator.html" else "",
            pen_active=" active" if page == "pension.html" else "")

    bundle_pages(lambda page: sidebar_for(page))

    for i, (path, slug, label) in enumerate(pages):
        text = substitute_rates(path.read_text(encoding="utf-8"), rates, str(path))
        m = re.match(r"^#\s+(.*)", text)
        h1 = re.sub(r"^\d+\s*[-–—]\s*", "", m.group(1)) if m else label
        text = re.sub(r"^# .*\n", "", text, count=1)

        body, _ = render(text)
        body = rewrite_links(body, slug)
        body = re.sub(
            r"(<table>.*?</table>)",
            r'<div class="table-scroll" tabindex="0" role="region" '
            r'aria-label="Scrollable data table">\1</div>',
            body,
            flags=re.S,
        )

        prev_l = (f'<a class="prev" href="{pages[i-1][1]}.html">← {pages[i-1][2]}</a>'
                  if i else '<a class="prev" href="../index.html">← Start here</a>')
        next_l = (f'<a class="next" href="{pages[i+1][1]}.html">{pages[i+1][2]} →</a>'
                  if i + 1 < len(pages) else '<a class="next" href="../simulator.html">Calculator →</a>')

        first = re.search(r"<p>(.*?)</p>", body, re.S)
        desc = (re.sub(r"<[^>]+>", "", first.group(1))[:155] if first else label)

        (OUT / f"{slug}.html").write_text(harden(TEMPLATE.format(
            title=f"{h1} — Estonian FIRE Simulator", h1=h1,
            desc=desc.replace('"', "'").replace("\n", " "),
            root="../", sidebar=sidebar_for("", "../", slug),
            content=body, pager=prev_l + next_l,
        ), f"guide/{slug}.html"), encoding="utf-8")

    # A page whose source was removed or renamed would otherwise linger in
    # guide/ and still be published.
    produced = {f"{slug}.html" for _, slug, _ in pages}
    for stale in sorted(OUT.glob("*.html")):
        if stale.name not in produced:
            stale.unlink()
            print(f"removed orphaned guide/{stale.name}")

    cards = "\n".join(
        f'        <a class="card" href="guide/{slug}.html">{label}</a>'
        for _, slug, label in pages
    )
    landing_body = f"""      <p class="lede">Financial independence maths for Estonian tax residents. Most FIRE
        material is written for the United States — 401(k)s, Roth IRAs, ACA subsidies — and
        almost none of it transfers. Estonia has its own set of levers, and its own trap.</p>

      <p><a class="cta" href="simulator.html">Open the calculator →</a></p>
      <p class="hint">It runs entirely in your browser. Nothing is uploaded to anyone, and you
        can export your figures to a file.</p>

      <h2>What makes Estonia different</h2>
      <ul>
        <li><strong>No separate capital gains tax</strong> — gains are income, taxed at a flat 22%.</li>
        <li><strong>The investment account</strong> defers tax indefinitely, and lets you withdraw
            everything you put in before any tax is due.</li>
        <li><strong>0% corporate tax on retained earnings</strong> — a company is a legal
            tax-deferred wrapper.</li>
        <li><strong>No wealth tax and no inheritance tax.</strong></li>
        <li><strong>But health insurance follows social tax, not residency</strong> — stop working
            and you lose cover. That one fact reshapes an Estonian FIRE plan.</li>
      </ul>

      <h2>The guide</h2>
      <div class="cards">
{cards}
      </div>
"""
    (ROOT / "index.html").write_text(harden(TEMPLATE.format(
        title="Estonian FIRE Simulator", h1="Estonian FIRE Simulator",
        desc="Financial independence planning for Estonian tax residents: the investment "
             "account, the pension pillars, and the health insurance gap.",
        root="", sidebar=sidebar_for("index.html"),
        content=landing_body, pager="",
    ), "index.html"), encoding="utf-8")

    print(f"wrote index.html + {len(pages)} guide pages")


def assemble_site(dest: Path) -> None:
    """Copy exactly SITE_FILES into dest, replacing whatever was there."""
    dest = dest.resolve()
    if dest == ROOT or ROOT.is_relative_to(dest) or not dest.is_relative_to(ROOT):
        raise SystemExit(f"--site must be a new directory inside the repository, not {dest}")
    # The directory is deleted first, so refuse anything that could be source.
    if not dest.name.startswith("_"):
        raise SystemExit(f"--site directory name must start with '_' (e.g. _site), not {dest.name}")
    if dest.exists():
        shutil.rmtree(dest)
    for entry in SITE_FILES:
        src = ROOT / entry
        if not src.exists():
            raise SystemExit(f"site file {entry} is missing")
        target = dest / entry
        target.parent.mkdir(parents=True, exist_ok=True)
        if src.is_dir():
            shutil.copytree(src, target)
        else:
            shutil.copy2(src, target)
    print(f"assembled site in {dest.relative_to(ROOT)}/")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("--site", metavar="DIR", type=Path,
                        help="after building, copy the published files into DIR")
    args = parser.parse_args()
    build()
    if args.site:
        assemble_site(ROOT / args.site if not args.site.is_absolute() else args.site)
