# Estonia FIRE Planner

An open-source financial-independence and early-retirement simulator for Estonian tax residents. It models household cash flow, investment accounts, pension pillars, housing, healthcare and retirement bridges in euros.

👉 **Live:** [https://th0masl.github.io/estonia-fire-planner/](https://th0masl.github.io/estonia-fire-planner/)

The project is Estonia-specific because most FIRE material assumes US accounts and healthcare. Estonia instead has the `investeerimiskonto`, three pension pillars, tax on distributed company profits and health coverage that often depends on social-tax payments.

## What is included

- A household FIRE simulator with import, export and share-link support
- A separate pension projection calculator
- Estonia-specific tax, pension, health-insurance and investment-account rules
- Property, broker, portfolio and household-planning guides
- Local Nordic Utility design tokens in `tokens.css`, with no network dependency
- Centralised rates in `src/rates.js`, reused by both calculators and the prose build
- Regression, invariant, round-trip, monotonicity and rendered-output tests

Start with [simulator.html](simulator.html), or open [index.html](index.html) for the complete guide.

## Documentation

All Markdown source lives in [`docs/guide/`](docs/guide/). The numbered working-document names have been replaced with descriptive filenames; published HTML URLs remain stable.

Useful starting points:

- [FIRE fundamentals](docs/guide/fire-basics.md)
- [Estonian tax overview](docs/guide/tax-overview.md)
- [Investment account](docs/guide/investment-account.md)
- [Pension pillars](docs/guide/pensions.md)
- [Health insurance](docs/guide/health-insurance.md)
- [Building a portfolio](docs/guide/portfolio.md)
- [Buying a home](docs/guide/property-purchase.md)
- [Sources and verification](docs/guide/verification.md)

## Build and test

Requirements: Python 3.12+, Node.js 20+ and the Python `Markdown` package.

```sh
python3 -m pip install Markdown==3.5.2
python3 build.py
bash test/run.sh
```

`build.py` generates `index.html`, the calculator bundles and `guide/*.html`. Edit Markdown or files under `src/`, then rebuild rather than editing generated HTML directly. Interface styles consume the local semantic tokens in `tokens.css`.

Browser security and sharing tests use Playwright as a development dependency;
the website itself still runs without JavaScript packages or network access:

```sh
npm ci
npx playwright install chromium
npm run test:browser
```

To use an existing Chrome installation, set `CHROME_PATH` to its executable
when running the browser tests. Tests use isolated browser contexts and synthetic
plans, including HTML-like names, and cover desktop/mobile in light/dark themes.
Pushes to `main` and pull requests run both suites without deploying. Releases
also run both suites before deployment.

## GitHub Pages

The workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds, tests and deploys only browser-facing files. It runs when a GitHub release is published and can also be started manually from the Actions tab.

In the repository settings, configure Pages to use **GitHub Actions**. A failed build or test prevents deployment.

## Privacy

The calculators run entirely in the browser. No financial inputs are uploaded by this project. Saved plans remain in browser storage, URL fragments or files explicitly exported by the user.

The `private/` directory is ignored by Git and excluded from the Pages artifact. Public examples and test fixtures are synthetic and must not contain real household data.

## Accuracy and limitations

Rules and rates can change. The guide records its verification date and marks uncertain or proposed rules. Before making a material financial, tax, pension, insurance or legal decision, confirm the current rule with the relevant Estonian authority or a qualified adviser.

This project is educational software and research, not personalised financial, tax or legal advice.

## License

[MIT](LICENSE)
