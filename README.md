# Ekramul All Repairing Service Center

Static Astro business website built from the supplied homepage reference and master brief. Includes all twelve equipment categories, supporting pages, gallery with nine videos, contact form and local SEO metadata.

## Local use

Node.js 24 is recommended. Run `npm ci`, then `npm run dev`. Use `npm run check` for Astro/TypeScript diagnostics, `npm run build` to produce `dist`, and `npm run preview` for a production preview.

## Content and files

- `src/data/business.ts`: verified contact details and production origin.
- `src/data/services.ts`: all twelve service categories and equipment-specific copy.
- `src/components`: shared navigation layout, cards, process, enquiry and CTA.
- `src/styles/global.css`: reference-based navy/green tokens, responsive rules and reduced-motion support.
- `public/images`: generated images, optimized equipment illustrations, field photos and video posters.
- `ASSET-SOURCES.md`: asset provenance and generation prompt summaries.
- `SPEC.md`: implementation contract.
- `QA.md`: actual local verification results and remaining launch gates.

## FormSubmit

Forms use native POST to `https://formsubmit.co/ekramulhaqnoida@gmail.com`, a honeypot, default CAPTCHA, required fields and the production `/thank-you/` redirect. No SMTP, credentials or database are used. Browser validation is a usability measure; FormSubmit is responsible for server-side processing and spam handling.

After deployment, submit a clearly marked test enquiry, let the recipient activate the FormSubmit verification email, and submit another test to verify actual inbox delivery and the redirect. Rendering or an intercepted local test does not verify delivery. CAPTCHA and service errors appear on FormSubmit's hosted page. The static form cannot independently verify receipt. Documentation: [FormSubmit](https://formsubmit.co/) and [advanced setup](https://formsubmit.co/documentation).

## Deployment

Upload the **contents** of `dist/` to the hosting document root for `ekramulallrepairingservicecenter.com`, including `.htaccess` when using Apache/Hostinger. This is static output: no Node process is required on the host. Directory URLs need to resolve to their `index.html`; missing paths must return HTTP 404 using `404.html`. The supplied `.htaccess` sets that fallback for Apache. Other hosts need their equivalent configuration. Do not rewrite every missing URL to the homepage.

Confirm domain ownership, HTTPS and the chosen apex domain before deployment. Canonical URLs, Open Graph URLs, sitemap and FormSubmit redirect use the supplied domain. `robots.txt` and `sitemap.xml` are generated. Draft legal pages, thank-you, video descriptions and 404 pages are noindex and omitted from the sitemap. No production deployment or indexing submission has been performed.

## Business review before launch

- Approve the draft Privacy Policy and Terms, and confirm actual information handling practices.
- Confirm precise equipment terminology for coil-free compressors, high compressor washing motors and two-stand lifts.
- Confirm publication rights for supplied equipment graphics and footage, and review automated Hindi caption drafts.
- Verify the map search resolves to the correct center. The location graphic is an illustration; no exact coordinates were invented.
- Activate FormSubmit and verify inbox delivery on the deployed domain.
- Run live HTTPS, canonical, 404, sitemap and asset checks after deployment. Local QA does not establish field Core Web Vitals or Google indexing.

Framework reference: [Astro routing](https://docs.astro.build/en/guides/routing/). The original brief requested Scroll World, Scroll Craft and Design DNA skills; these were unavailable. Tokens, native CSS transitions and IntersectionObserver provide restrained motion instead.

## Redesign (October 2026) — image pipeline

- `scripts/image-gen.config.mjs` centrally holds the model names (`gpt-image-2.5-flare` default, `gpt-image-2.5-sunburst` premium), quality levels, sizes, output widths and every asset's prompt and placement. Models and qualities can also be overridden with `IMAGE_MODEL_FLARE`, `IMAGE_MODEL_SUNBURST`, `IMAGE_QUALITY_DEFAULT`, `IMAGE_QUALITY_PREMIUM`.
- `npm run images [assetId…] [--force] [--premium]` runs `scripts/generate-images.mjs` locally in Node. It reads `OPENAI_API_KEY` from `.env` (gitignored) and never ships to the browser. Output goes to `public/images/gen/` as WebP at two widths; source PNGs go to `output/gen-sources/` (not deployed).
- Routing: hero assets, or assets with two or more premium traits (photoreal, machinery, interior, complex lighting…), use Sunburst; everything else uses Flare. Hero/key assets use high quality, others medium.
- Six generated assets are used: rooftop VRV hero (Sunburst/high), industrial chiller (Sunburst/high), home appliance, commercial refrigeration, electrical panel and workbench tools (Flare/medium). All are labelled as illustrative where shown.
- `npm run service-thumbs` rebuilds the service-card thumbnails from the client's original equipment images (trimmed, white background, 800×600 WebP).
- WhatsApp buttons use the primary number (`business.whatsapp` in `src/data/business.ts`). Confirm that number is on WhatsApp before launch.
