# SmartToolHub — Feature Scope (v1.1)

## Included
- Responsive dashboard, professional header/footer, sidebar navigation, hero section and tool catalogue
- Dark/light theme preference (saved locally)
- Global command search (Ctrl/Cmd + K)
- Category filtering, favorites, recently used tools
- Copy and export result actions
- Local browser processing for supported utilities
- Privacy-first messaging
- **About** page (professional product story)
- **Contact** page — form delivers email to **surajsoftware01@gmail.com** (FormSubmit + mailto fallback)
- **Free multi-language translator** — select source & target language (MyMemory free API, optional LibreTranslate URL)
- **QR Code Generator** (working, uses `qrcode` package)
- **Focus Timer** with live countdown (Pomodoro)
- **Google AdSense** integration via `.env` keys, global placements (top, sidebar, in-tool, footer); responsive slots initialize only after a non-zero container width is available
- **Image tools:** compress to WebP, resize by width, convert PNG/JPEG/WebP
- **PDF tools:** merge PDF files, extract page ranges, create PDFs from images
- PWA manifest foundation

## Tool catalogue
### Writing and language
Word Counter, Case Converter, Text Compare, Writing Helper (local), **Language Translator (free multi-lang)**, Lorem Ipsum, Text Reverser.

### Calculators
Percentage, Age, BMI, Loan, GST, Discount, Tip, Unit Converter, Date Difference.

### Developer
JSON Formatter, Base64, URL Encoder, HTML Entity Encoder, JWT Decoder, Regex Tester, UUID Generator, Unix Timestamp, Markdown Preview.

### Security
Password Generator, Password Strength, SHA-256 Generator.

### Images
Image Compressor, Image Resizer, Image Format Converter.

### PDF
Merge PDF, Split PDF (page range extraction), Image to PDF.

### Productivity and design
**QR Code Generator**, Quick Notes, Task Checklist, **Focus Timer (live)**, Color Converter, CSS Gradient.

## Google AdSense setup
1. Get AdSense approval and create ad units.
2. Put your publisher ID and slot IDs in `.env`:
   - `NEXT_PUBLIC_ADSENSE_CLIENT_ID`
   - `NEXT_PUBLIC_ADSENSE_SLOT_TOP`
   - `NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR`
   - `NEXT_PUBLIC_ADSENSE_SLOT_INCONTENT`
   - `NEXT_PUBLIC_ADSENSE_SLOT_FOOTER`
3. Rebuild. Placeholders show until real IDs are set.

## Contact email
All contact form submissions are sent to **surajsoftware01@gmail.com**.

## File processing notes
- Image tools use the browser Canvas API.
- PDF merge, split and image-to-PDF use `pdf-lib`; run `npm install` before building.
- Files are processed locally in the browser and are not uploaded to a SmartToolHub backend.
