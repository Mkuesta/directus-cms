# Product Card Image - Full Bleed Fix

## Problem
We needed to display file format icons (Excel, Word, PowerPoint, etc.) on product cards. The image needed to fill the entire image area edge-to-edge, with only the top corners rounded (clipped by the card's border-radius).

## What We Tried (Failed Attempts)

### Attempt 1: Basic `<img>` tag with object-cover
```tsx
<Link className="relative block h-[125px] bg-[rgb(250,239,228)]">
  <img
    src="/icons/excel2.jpg"
    className="w-full h-full object-cover"
  />
</Link>
```
**Result:** Image didn't fill to edges properly, visible gaps at corners.

### Attempt 2: Added `overflow-hidden rounded-t-2xl` to Link
```tsx
<Link className="relative block h-[125px] overflow-hidden rounded-t-2xl bg-[rgb(250,239,228)]">
  <img className="w-full h-full object-cover" />
</Link>
```
**Result:** Made it worse - image became "pill-shaped" (rounded on bottom too).

### Attempt 3: Removed `rounded-t-2xl`, kept only `overflow-hidden`
```tsx
<Link className="relative block h-[125px] overflow-hidden bg-[rgb(250,239,228)]">
  <img className="w-full h-full object-cover" />
</Link>
```
**Result:** Still had gaps at the corners. The `<img>` element wasn't filling edge-to-edge.

## The Solution: CSS `background-image`

```tsx
<Link
  href={`/produkt/${slug}`}
  className="relative block h-[125px] bg-[rgb(250,239,228)] bg-cover bg-center"
  style={fileFormat ? { backgroundImage: `url(/icons/${iconName}2.jpg)` } : undefined}
>
  {/* Badge and other content */}
</Link>
```

**Result:** Works perfectly! Image fills edge-to-edge, card clips top corners.

## Why `background-image` Works and `<img>` Didn't

### The `<img>` Problem
The `<img>` element is a **replaced element** in CSS with its own box model:
- Creates a separate box inside the parent
- Even with `w-full h-full object-cover`, subtle gaps can occur
- Browser rendering can cause positioning issues
- Parent's `overflow-hidden` + `border-radius` may not clip replaced elements correctly

### Why `background-image` Works
The background image is **part of the element itself**, not a child:
- No separate box model - the image IS the Link's background
- `background-size: cover` fills 100% of the element, edge-to-edge guaranteed
- `background-position: center` centers the image
- Parent Card's `overflow-hidden rounded-2xl` clips cleanly

## Visual Comparison

```
<img> approach:                    background-image approach:
┌─────────────────────┐            ┌─────────────────────┐
│ Card (rounded)      │            │ Card (rounded)      │
│  ┌─────────────────┐│            │█████████████████████│
│  │ Link            ││            │█████████████████████│
│  │  ┌─────────────┐││            │███ Link with bg ████│
│  │  │ img (gaps!) │││  →         │█████████████████████│
│  │  └─────────────┘││            │█████████████████████│
│  └─────────────────┘│            └─────────────────────┘
└─────────────────────┘
```

## Key Takeaway

**For full-bleed images inside containers with rounded corners, use CSS `background-image` instead of `<img>` tags.**

The background is guaranteed to fill the entire element without any box model quirks that come with replaced elements like `<img>`.

## Final Code

```tsx
// ProductCard.tsx
<Card className="product-card group h-full flex flex-col bg-white overflow-hidden !p-0 !gap-0 border border-gray-200 rounded-2xl shadow-sm">
  <Link
    href={`/produkt/${slug}`}
    className="relative block h-[125px] bg-[rgb(250,239,228)] bg-cover bg-center"
    style={fileFormat ? { backgroundImage: `url(/icons/${getIconFilename(fileFormat)}2.jpg)` } : undefined}
  >
    {!fileFormat && (
      <div className="flex h-full items-center justify-center">
        <Download className="h-16 w-16 text-[rgb(22,62,54)]" />
      </div>
    )}

    {fileFormat && (
      <div className="absolute top-3 left-3 z-10">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-white">
          {getFileFormatLabel(fileFormat)}
        </span>
      </div>
    )}
  </Link>

  <CardContent>
    {/* Price, title, button, etc. */}
  </CardContent>
</Card>
```

## Icon Files Location
Place icon images in `/public/icons/`:
- `excel2.jpg` - Excel icon
- `word2.jpg` - Word icon
- `powerpoint2.jpg` - PowerPoint icon
- `pdf2.jpg` - PDF icon
- `zip2.jpg` - ZIP/Package icon

---
*Created: December 2024*
*Issue: Product card images not filling rounded corners properly*
