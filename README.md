# SmartToolHub

Professional Next.js toolkit with free online utilities, privacy-first design, multi-language translator, QR generator, live focus timer, About & Contact pages, and global Google AdSense support.

## Highlights (v1.1)

- Next.js 14 App Router + React + TypeScript
- Professional header with nav (Home, Tools, About, Contact) + polished multi-column footer
- Dark / light themes
- Command search (⌘K), categories, favorites, recent tools
- 40+ tools — most run fully in the browser
- **Free Language Translator** — pick source & target language (MyMemory free API; optional LibreTranslate via env)
- **QR Code Generator** (working)
- **Image utilities** — image compressor, width resizer and PNG/JPEG/WebP converter (browser Canvas API)
- **PDF utilities** — merge PDFs, extract selected pages and convert multiple images to PDF (PDF-Lib, browser-side)
- **Focus Timer** with live countdown
- **Contact form** emails to **surajsoftware01@gmail.com**
- **Google AdSense** wired globally via `.env` keys
- About page with professional product story

## Requirements

- Node.js 18.17+ (Node 20 LTS recommended)
- npm

## Setup

```bash
npm install
# Copy .env.example to .env if you need a fresh local environment
# Keep your existing .env values when updating an existing deployment
# Set your AdSense IDs when ready:
# NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-...
# NEXT_PUBLIC_ADSENSE_SLOT_TOP=...
# etc.
npm run dev
```

Open http://localhost:3000.

## Production

```bash
npm run build
npm start
```

## Environment variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_TRANSLATE_URL` | Optional LibreTranslate-compatible base URL. Empty = free MyMemory API |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | AdSense publisher ID (`ca-pub-...`) |
| `NEXT_PUBLIC_ADSENSE_SLOT_TOP` | Top banner slot |
| `NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR` | Sidebar slot |
| `NEXT_PUBLIC_ADSENSE_SLOT_INCONTENT` | In-tool content slot |
| `NEXT_PUBLIC_ADSENSE_SLOT_FOOTER` | Footer slot |

## Contact

Messages from the Contact page are delivered to **surajsoftware01@gmail.com**.

## Notes

- Translator uses a free public API with rate limits; quality varies. Do not send confidential text.
- BMI is informational only, not medical advice.
- JWT decoder does not verify signatures.
- AdSense requires approval and real slot IDs before live ads appear. The ad component waits until its container has a measurable width before calling `adsbygoogle.push()`, which prevents the common zero-width slot initialization error.
- PDF tools require the `pdf-lib` dependency listed in `package.json`; run `npm install` after extracting the updated project.

## License

Use and modify for your own product. Review third-party package licenses before commercial distribution.
"# SmartToolHub" 
