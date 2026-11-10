# SmartToolHub

Professional free online tools. Dark/light themes. Netlify-ready. AdSense with one env key only.

## Environment (only this is required for ads)

```env
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-7504961737515196
```

Enable **Auto ads** in your AdSense dashboard after site approval. No slot IDs needed.

## Deploy on Netlify

1. Upload this folder or connect Git.
2. Build command: `npm run build` (handled by `netlify.toml`).
3. Set env var in Netlify (optional if already in netlify.toml):
   - `NEXT_PUBLIC_ADSENSE_CLIENT_ID` = `ca-pub-7504961737515196`
4. Deploy.

## Local

```bash
npm install
npm run dev
```

## Features

- No sidebar — clean top navigation + mobile menu
- Dark / light theme (saved in browser)
- About, Contact (email → surajsoftware01@gmail.com)
- Translator, QR, Focus Timer, image/PDF tools, calculators, developer tools
- AdSense script loaded site-wide from your publisher ID only
"# smarttoolhub-app" 
