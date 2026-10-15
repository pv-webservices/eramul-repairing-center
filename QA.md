# Local verification — 16 October 2026

The website is implemented and verified locally. Production deployment, recipient activation, inbox delivery and Google indexing have not been verified.

## Build and dependencies

- Astro 7.4.0 static build: **24 HTML pages** generated, including twelve service-detail pages, legal drafts, thank-you, video descriptions and custom 404.
- `npm run check`: **0 errors, 0 warnings, 0 hints**.
- Native `npm audit`: **0 vulnerabilities** after updating the initial Astro dependency.
- LocalBusiness JSON-LD parses on all 24 HTML pages; service-specific JSON-LD is included on the twelve service pages. No invented ratings, hours or coordinates.
- `.htaccess` is present in the production output. Its behavior must still be verified on the actual Apache host.

## Browser verification

Production preview: `http://localhost:4322/`. Evidence: `output/playwright/qa-results.json` and desktop/mobile screenshots in the same directory.

- **23 navigable pages** reviewed in Chrome for HTTP status, one H1, unique title and description, canonical origin, images, internal destinations and horizontal overflow.
- **Zero Axe WCAG A/AA violations** across those 23 pages using the WCAG 2.0, 2.1 and 2.2 rules available in the tool. This is an automated local result, not formal accessibility certification.
- **35 responsive checks**: Home, Services, Contact, Gallery and a representative service detail page at **320, 375, 480, 768, 1024, 1280 and 1440 px**. No horizontal page overflow.
- Zero captured browser script/console errors and zero failed asset requests in the final run.
- Unknown route returns the custom page with **HTTP 404**.
- Sitemap returns **19 public URLs**; robots resolves. Legal drafts, thank-you, video descriptions and 404 are excluded from the sitemap and use noindex.
- Service filters return the expected two electrical categories and restore all twelve entries.
- Gallery filters, dialog opening, left/right navigation, Escape and focus return pass.
- First supplied video decoded and played; all nine video files resolve and all nine players have caption tracks. Captions are automatic drafts and need review for wording and timing.
- FAQ accordions work with Enter. Desktop service dropdown and mobile navigation open and close with Escape.
- All twelve service enquiry links select the matching equipment category.
- Required fields, invalid email and invalid phone tests pass. A valid POST was **intercepted locally** and inspected without sending an email. This proves the browser submission path, not FormSubmit activation or inbox delivery.
- Reduced-motion preference disables section animations.

## Lighthouse measurements

Measured once per device preset against the local production preview, using Lighthouse 13.5.0 and headless Chrome. Reports are saved as JSON and HTML under `output/lighthouse/`.

| Preset | Performance | Accessibility | Best Practices | SEO |
|---|---:|---:|---:|---:|
| Mobile | 96 | 100 | 100 | 100 |
| Desktop | 97 | 100 | 100 | 100 |

Mobile lab metrics: FCP **1.2 s**, LCP **2.7 s**, TBT **0 ms**, CLS **0**. These measurements met the brief’s Lighthouse score targets. They are local lab observations and do not establish production or field Core Web Vitals. The mobile LCP remains above the 2.5-second good threshold in this run.

## Visual review

Reviewed desktop and mobile captures of the reference-led homepage and supporting layouts. The original logo, white header, navy/green technician hero, equipment composition, four-column service grid, navy benefits section, four-step process, split about section, pale-blue commitment section, enquiry layout and navy footer are implemented. The screenshot’s sample reviews were replaced with a factual customer commitment section.

Four built-in Imagegen assets are used: HVAC technician hero, washing-machine service image, geyser illustration and transparent appliance lineup. Exact prompts are in `IMAGE-PROMPTS.md`; provenance is in `ASSET-SOURCES.md`. Supplied media and all nine videos are retained. Generated technicians are not represented as actual employees.

## Launch gates

1. Review the draft Privacy Policy and Terms against the business’s actual practices.
2. Confirm the precise compressor, washing-motor and two-stand lift terminology and applicable equipment models.
3. Confirm publication rights for supplied graphics, photos and footage, and review automatic Hindi captions. Some supplied product graphics carry visible stock or manufacturer marks.
4. Verify that the Google Maps address search identifies the correct center. The location graphic is illustrative; no exact pin is asserted.
5. Deploy to the supplied domain with HTTPS, activate FormSubmit via the recipient email, then test actual inbox delivery and the thank-you redirect. [FormSubmit](https://formsubmit.co/) requires recipient confirmation.
6. Check production 404 status, HTTPS/domain behavior, canonicals, sitemap and asset delivery after upload. No indexing guarantee is made.

No commit, push, email delivery test or production deployment was performed.
