# shadcn/ui Components

## Installation

```bash
# Add single component
npx shadcn@latest add button

# Add multiple
npx shadcn@latest add button card input dialog

# See all available (interactive)
npx shadcn@latest add
```

## Available Components by Category

### Layout
| Component | Command | Description |
|-----------|---------|-------------|
| `card` | `npx shadcn@latest add card` | Container with header, content, footer |
| `separator` | `npx shadcn@latest add separator` | Horizontal or vertical divider |
| `scroll-area` | `npx shadcn@latest add scroll-area` | Custom scrollbar container |
| `resizable` | `npx shadcn@latest add resizable` | Resizable panels |
| `aspect-ratio` | `npx shadcn@latest add aspect-ratio` | Maintain aspect ratio |

### Forms
| Component | Command | Description |
|-----------|---------|-------------|
| `button` | `npx shadcn@latest add button` | All button variants |
| `input` | `npx shadcn@latest add input` | Text input |
| `textarea` | `npx shadcn@latest add textarea` | Multi-line input |
| `select` | `npx shadcn@latest add select` | Dropdown select |
| `checkbox` | `npx shadcn@latest add checkbox` | Checkbox input |
| `radio-group` | `npx shadcn@latest add radio-group` | Radio buttons |
| `switch` | `npx shadcn@latest add switch` | Toggle switch |
| `slider` | `npx shadcn@latest add slider` | Range slider |
| `form` | `npx shadcn@latest add form` | Form with validation (react-hook-form) |
| `label` | `npx shadcn@latest add label` | Form labels |
| `input-otp` | `npx shadcn@latest add input-otp` | One-time password input |

### Feedback
| Component | Command | Description |
|-----------|---------|-------------|
| `alert` | `npx shadcn@latest add alert` | Alert messages |
| `alert-dialog` | `npx shadcn@latest add alert-dialog` | Confirmation dialogs |
| `toast` | `npx shadcn@latest add toast` | Toast notifications |
| `sonner` | `npx shadcn@latest add sonner` | Toast notifications (alternative) |
| `progress` | `npx shadcn@latest add progress` | Progress bar |
| `skeleton` | `npx shadcn@latest add skeleton` | Loading placeholder |

### Overlay
| Component | Command | Description |
|-----------|---------|-------------|
| `dialog` | `npx shadcn@latest add dialog` | Modal dialogs |
| `drawer` | `npx shadcn@latest add drawer` | Slide-out drawer |
| `sheet` | `npx shadcn@latest add sheet` | Side sheet |
| `popover` | `npx shadcn@latest add popover` | Popover content |
| `tooltip` | `npx shadcn@latest add tooltip` | Hover tooltips |
| `hover-card` | `npx shadcn@latest add hover-card` | Rich hover content |

### Navigation
| Component | Command | Description |
|-----------|---------|-------------|
| `navigation-menu` | `npx shadcn@latest add navigation-menu` | Site navigation |
| `menubar` | `npx shadcn@latest add menubar` | Application menubar |
| `dropdown-menu` | `npx shadcn@latest add dropdown-menu` | Dropdown menus |
| `context-menu` | `npx shadcn@latest add context-menu` | Right-click menu |
| `command` | `npx shadcn@latest add command` | Command palette (Cmd+K) |
| `tabs` | `npx shadcn@latest add tabs` | Tab navigation |
| `breadcrumb` | `npx shadcn@latest add breadcrumb` | Breadcrumb navigation |
| `pagination` | `npx shadcn@latest add pagination` | Page navigation |

### Data Display
| Component | Command | Description |
|-----------|---------|-------------|
| `table` | `npx shadcn@latest add table` | Data tables |
| `avatar` | `npx shadcn@latest add avatar` | User avatars |
| `badge` | `npx shadcn@latest add badge` | Status badges |
| `calendar` | `npx shadcn@latest add calendar` | Date picker calendar |
| `carousel` | `npx shadcn@latest add carousel` | Image/content carousel |
| `accordion` | `npx shadcn@latest add accordion` | Collapsible sections |
| `collapsible` | `npx shadcn@latest add collapsible` | Single collapsible |
| `chart` | `npx shadcn@latest add chart` | Charts (Recharts wrapper) |

### Utilities
| Component | Command | Description |
|-----------|---------|-------------|
| `toggle` | `npx shadcn@latest add toggle` | Toggle button |
| `toggle-group` | `npx shadcn@latest add toggle-group` | Group of toggles |

---

## What shadcn DOESN'T Have (Build Custom)

These common UI elements need to be built as custom components:

| Element | Suggestion |
|---------|------------|
| Testimonial cards | Compose from `Card` + `Avatar` |
| Pricing tables | Compose from `Card` + `Badge` + `Button` |
| Feature cards | Compose from `Card` + icons |
| Stat cards | Simple div or `Card` |
| Timeline | Custom component |
| Team member cards | `Card` + `Avatar` |
| Logo clouds | Grid of images |
| Hero sections | Compose from primitives |
| FAQ sections | Use `Accordion` |
| Footer | Compose from links + `Separator` |

See [../workflows/custom-component.md](../workflows/custom-component.md) for building custom components.

---

## Quick Add for Common Projects

### Landing Page
```bash
npx shadcn@latest add button card badge avatar accordion separator
```

### Dashboard
```bash
npx shadcn@latest add button card table tabs dropdown-menu dialog sheet avatar badge progress
```

### Forms
```bash
npx shadcn@latest add button input textarea select checkbox radio-group switch form label toast
```

### Full Suite
```bash
npx shadcn@latest add button card input textarea select checkbox radio-group switch form label dialog sheet dropdown-menu tabs accordion table avatar badge progress skeleton toast sonner separator scroll-area tooltip popover command breadcrumb pagination calendar
```
