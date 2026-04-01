# Design Extraction Tables

## From Figma (via MCP)

### Color Extraction

| Figma Color Name | Hex | HSL (shadcn format) | shadcn Variable |
|------------------|-----|---------------------|-----------------|
| Primary / Brand | | | `--primary` |
| Primary Dark | | | `--primary` (dark mode) |
| Secondary | | | `--secondary` |
| Background | | | `--background` |
| Surface / Card | | | `--card` |
| Text Primary | | | `--foreground` |
| Text Secondary | | | `--muted-foreground` |
| Border / Divider | | | `--border` |
| Error / Danger | | | `--destructive` |
| Success | | | `--success` (custom) |
| Warning | | | `--warning` (custom) |

### Typography Extraction

| Figma Style | Font | Size | Weight | Line Height | Tailwind |
|-------------|------|------|--------|-------------|----------|
| H1 | | | | | `text-4xl font-bold` |
| H2 | | | | | `text-3xl font-semibold` |
| H3 | | | | | `text-2xl font-semibold` |
| H4 | | | | | `text-xl font-semibold` |
| Body | | | | | `text-base` |
| Body Small | | | | | `text-sm` |
| Caption | | | | | `text-xs` |

### Spacing Extraction

| Usage | Figma Value | Tailwind |
|-------|-------------|----------|
| Component padding (sm) | | `p-2` |
| Component padding (md) | | `p-4` |
| Component padding (lg) | | `p-6` |
| Section padding | | `py-16 md:py-24` |
| Card padding | | `p-6` |
| Grid gap | | `gap-6` |
| Stack gap | | `space-y-4` |

### Border Radius Extraction

| Usage | Figma Value | shadcn |
|-------|-------------|--------|
| Default (buttons, inputs) | | `--radius` |
| Cards | | `rounded-lg` |
| Badges | | `rounded-full` |
| Avatars | | `rounded-full` |

### Shadow Extraction

| Figma Effect | CSS Value | Usage |
|--------------|-----------|-------|
| Card shadow | | `shadow-sm` |
| Dropdown shadow | | `shadow-md` |
| Modal shadow | | `shadow-lg` |

---

## From Screenshot (via Vision)

| Element | Observed | Estimated Value | Confidence |
|---------|----------|-----------------|------------|
| Primary color | | #______ | High/Med/Low |
| Secondary color | | #______ | |
| Background | | #______ | |
| Text color | | #______ | |
| Muted text | | #______ | |
| Border color | | #______ | |
| Heading font | | _______ | |
| Body font | | _______ | |
| Border radius | | ___px | |
| Base spacing | | ___px | |
| Card shadow | | _______ | |

---

## HSL Conversion Reference

### Common Colors to HSL

| Color | Hex | HSL (shadcn format) |
|-------|-----|---------------------|
| Blue 500 | #3b82f6 | `217 91% 60%` |
| Blue 600 | #2563eb | `221 83% 53%` |
| Gray 50 | #f9fafb | `210 20% 98%` |
| Gray 100 | #f3f4f6 | `220 14% 96%` |
| Gray 500 | #6b7280 | `220 9% 46%` |
| Gray 900 | #111827 | `221 39% 11%` |
| Red 500 | #ef4444 | `0 84% 60%` |
| Green 500 | #22c55e | `142 71% 45%` |
| Yellow 500 | #eab308 | `48 96% 47%` |
| White | #ffffff | `0 0% 100%` |
| Black | #000000 | `0 0% 0%` |

### Conversion Formula

```
Hex #RRGGBB -> RGB (R, G, B) -> HSL (H S% L%)

For shadcn: Remove "hsl()" wrapper and commas
hsl(217, 91%, 60%) -> 217 91% 60%
```
