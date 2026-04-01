# Vorlagen.de Website Scraper & Analyzer

This project contains Playwright scripts to analyze and document the vorlagen.de website for recreation in Next.js with Payload CMS and Supabase.

## Features

- 📸 Full-page screenshots of all pages
- 🎨 CSS extraction and analysis
- 🎨 Color palette extraction
- 📝 Typography analysis
- 🏗️ Page structure documentation
- 📦 Component identification
- 🗂️ Payload CMS collection suggestions

## Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run install:playwright
```

Or manually:
```bash
npx playwright install chromium
```

## Usage

### Option 1: Full Site Crawl (Comprehensive)

Crawls the entire site, takes screenshots, extracts CSS, and analyzes all pages:

```bash
npm run crawl
```

This will:
- Crawl up to 50 pages (configurable)
- Skip blog pages automatically
- Take full-page screenshots
- Extract all CSS rules
- Analyze colors, fonts, and structure
- Save everything to `./site-analysis/`

### Option 2: Structure Analysis (Focused)

Analyzes specific pages in detail for recreation:

```bash
npm run structure
```

This will:
- Analyze homepage, category, and product pages
- Take targeted screenshots
- Create detailed structure documentation
- Generate a recreation guide in Markdown
- Run with visible browser (headless: false) so you can see what it's doing

## Output

All results are saved to `./site-analysis/` directory:

```
site-analysis/
├── screenshots/          # Full-page and viewport screenshots
│   ├── homepage-full.png
│   ├── homepage-viewport.png
│   ├── category-page.png
│   ├── product-page.png
│   └── page-X.png
├── css/                  # Extracted CSS files
│   └── page-X.css
├── pages/               # Individual page analysis
│   └── page-X.json
├── site-summary.json    # Overall site summary
├── structure-analysis.json  # Detailed structure for recreation
└── RECREATION-GUIDE.md  # Human-readable guide
```

## Key Files

- **site-summary.json**: Complete overview with all colors, fonts, and pages
- **structure-analysis.json**: Detailed structure for Next.js recreation
- **RECREATION-GUIDE.md**: Step-by-step recreation guide with recommendations

## Next Steps

After running the scripts:

1. Review `RECREATION-GUIDE.md` for the recreation strategy
2. Check `structure-analysis.json` for component details
3. Use screenshots as visual reference
4. Implement Payload CMS collections based on suggestions
5. Build Next.js pages following the structure recommendations

## Configuration

Edit the scripts to customize:

- `maxPages`: Maximum number of pages to crawl (default: 50)
- `BASE_URL`: Target website URL
- `shouldSkipUrl()`: Add patterns to skip (blog pages already skipped)
- `viewport`: Browser viewport size (default: 1920x1080)

## Technology Stack for Recreation

- **Next.js 14+**: App Router
- **Payload CMS**: Content management
- **Supabase**: Database and authentication
- **TypeScript**: Type safety
- **shadcn/ui**: UI components
- **Tailwind CSS**: Styling

## Notes

- The scraper respects the site structure and skips blog pages
- CSS from external sources may have CORS restrictions
- Screenshots are full-page by default
- All extracted data is saved in JSON format for easy processing
