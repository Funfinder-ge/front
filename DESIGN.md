# FunFinder DESIGN.md

> Design system for AI agents and developers. Based on [awesome-design-md](https://github.com/VoltAgent/awesome-design-md) format.

---

## 1. Visual Theme & Atmosphere

FunFinder is a **warm, photography-forward activity marketplace** -- a digital tourism magazine where adventure meets booking. The foundation uses pure white (`#ffffff`) with Georgian Burgundy (`#87003A`) -- the singular brand accent evoking warmth, passion, and Georgian hospitality.

The typography employs **nino-herv** (Inter Variable), a clean geometric variable font applied globally. Headings use weight 700 (bold) for authority, body text uses 400-500 for comfortable reading. The interface balances rich photography with clean whitespace.

**Key Characteristics:**
- Pure white canvas with Burgundy (`#87003A`) as singular brand accent
- nino-herv (Inter Variable) -- geometric, clean, multilingual (Georgian/English/Russian)
- Photography-first activity cards -- images are the hero content
- Three-layer card shadows inspired by Airbnb's warmth
- Generous border-radius: 8px buttons, 12px cards, 16px featured elements
- Near-black text (`#222`) -- warm, not cold
- Sidebar-centric navigation on desktop, drawer on mobile
- Built-in accessibility: dark mode, dyslexia mode, high contrast
- Seasonal theme system (spring sakura, summer sea, autumn wine, winter snow)

---

## 2. Color Palette & Roles

### Primary Brand
| Token | Hex | Role |
|-------|-----|------|
| `--color-primary` | `#87003A` | Primary CTA, navigation, brand accent, active states |
| `--color-primary-dark` | `#3d000f` | Hover/pressed states, scrollbar, deep emphasis |
| `--color-primary-semi` | `rgba(135, 0, 58, 0.52)` | Semi-transparent buttons, slider overlays |
| `--color-primary-light` | `rgba(135, 0, 58, 0.08)` | Subtle backgrounds, hover tints |

### Gradient Accents (SVG/Decorative)
| Token | Hex | Role |
|-------|-----|------|
| `--gradient-start` | `#A8248B` | Purple-magenta gradient start |
| `--gradient-end` | `#D599C4` | Light mauve gradient end |

### Text Scale
| Token | Hex | Role |
|-------|-----|------|
| `--text-primary` | `#222` | Primary text -- warm near-black |
| `--text-secondary` | `#555` | Descriptions, secondary info |
| `--text-tertiary` | `#666` | Captions, timestamps |
| `--text-muted` | `#999` | Disabled, placeholder text |
| `--text-inverse` | `#ffffff` | Text on dark/primary backgrounds |

### Surface & Background
| Token | Hex | Role |
|-------|-----|------|
| `--bg-primary` | `#ffffff` | Page background, card surfaces |
| `--bg-secondary` | `#f8f9fa` | Section backgrounds, page canvas |
| `--bg-tertiary` | `#f5f5f5` | Subtle backgrounds, input fills |
| `--bg-card` | `#f1f1f1` | Legacy card backgrounds |

### Borders & Dividers
| Token | Hex | Role |
|-------|-----|------|
| `--border-light` | `#eee` | Sidebar borders, subtle dividers |
| `--border-default` | `#ddd` | Input borders, card outlines |
| `--border-medium` | `#ccc` | Stronger dividers |

### Status & Feedback
| Token | Hex | Role |
|-------|-----|------|
| `--color-success` | `#4caf50` | Success, confirmation, paid |
| `--color-info` | `#2196f3` | Informational, refunded |
| `--color-warning` | `#ff9800` | Warning, pending |
| `--color-error` | `#f44336` | Error, cancelled |
| `--color-favorite` | `#e91e63` | Favorites, likes |

### Dark Theme
| Token | Hex | Role |
|-------|-----|------|
| `--dark-bg` | `#121212` | Dark mode background |
| `--dark-surface` | `#1e1e1e` | Dark mode cards/paper |
| `--dark-input` | `#2d2d2d` | Dark mode input fields |
| `--dark-border` | `rgba(255, 255, 255, 0.23)` | Dark mode borders |
| `--dark-text` | `#ffffff` | Dark mode text |

### Shadows
| Token | Value | Role |
|-------|-------|------|
| `--shadow-card` | `rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px, rgba(0,0,0,0.08) 0 4px 8px` | Card resting state |
| `--shadow-hover` | `rgba(0,0,0,0.04) 0 0 0 1px, rgba(0,0,0,0.06) 0 4px 12px, rgba(0,0,0,0.12) 0 8px 16px` | Card hover state |
| `--shadow-elevated` | `rgba(0,0,0,0.08) 0 8px 24px, rgba(0,0,0,0.04) 0 2px 8px` | Modals, dropdowns |
| `--shadow-subtle` | `rgba(0,0,0,0.06) 0 2px 4px` | Subtle lift |

---

## 3. Typography Rules

**Font Family:** nino-herv (Inter Variable), fallbacks: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica Neue, Arial, sans-serif

| Role | Size | Weight | Line Height | Letter Spacing |
|------|------|--------|-------------|----------------|
| Display Hero | 2.5rem (40px) | 700 | 1.2 | -0.5px |
| Section Heading (h2) | 1.75rem (28px) | 700 | 1.3 | -0.3px |
| Card Heading (h3) | 1.25rem (20px) | 700 | 1.4 | -0.2px |
| Sub-heading (h4) | 1.1rem (18px) | 700 | 1.4 | normal |
| Body Large | 1rem (16px) | 500 | 1.6 | normal |
| Body | 0.875rem (14px) | 400 | 1.5 | normal |
| Button | 1rem (16px) | 700 | 1.25 | normal |
| Small / Caption | 0.8rem (13px) | 400 | 1.4 | normal |
| Tag / Badge | 0.625rem (10px) | 700 | 1.4 | 0.5px |
| Price Display | 1.5rem (24px) | 700 | 1.2 | normal |

**Principles:**
- Weight 700 for all headings and CTAs -- bold, confident
- Negative letter-spacing on display sizes for intimate reading
- All text uses nino-herv globally (`* { font-family: nino-herv }`)
- Georgian/English/Russian multilingual support
- `text-transform: uppercase` for tags and badges only
- `text-overflow: ellipsis` for card titles to prevent overflow
- Dyslexia mode override: Comic Sans MS, letter-spacing 0.1em, line-height 1.8

---

## 4. Component Stylings

### Buttons

**Primary (CTA):**
```css
background-color: #87003A;
color: #ffffff;
border-radius: 8px;
padding: 10px 24px;
font-weight: 700;
font-size: 16px;
border: none;
transition: background-color 0.2s ease, transform 0.2s ease;
/* Hover: */
background-color: #3d000f;
transform: translateY(-1px);
/* Active: */
box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
```

**Secondary / Ghost:**
```css
background-color: transparent;
color: #87003A;
border: 1px solid #87003A;
border-radius: 8px;
padding: 10px 24px;
font-weight: 700;
/* Hover: */
background-color: rgba(135, 0, 58, 0.08);
```

**Tertiary / Login:**
```css
background-color: #ffffff;
color: #333;
border: 1px solid #ddd;
border-radius: 8px;
padding: 6px 16px;
/* Hover: */
background-color: rgba(195, 195, 195, 0.2);
```

### Activity Cards

```css
/* Card Container */
background: #ffffff;
border-radius: 12px;
overflow: hidden;
box-shadow: rgba(0,0,0,0.02) 0 0 0 1px,
            rgba(0,0,0,0.04) 0 2px 6px,
            rgba(0,0,0,0.08) 0 4px 8px;
transition: transform 0.3s ease, box-shadow 0.3s ease;

/* Hover */
transform: translateY(-4px);
box-shadow: rgba(0,0,0,0.04) 0 0 0 1px,
            rgba(0,0,0,0.06) 0 4px 12px,
            rgba(0,0,0,0.12) 0 8px 16px;

/* Image */
width: 100%;
height: 227px;
object-fit: cover;
border-radius: 12px 12px 0 0;

/* Title */
font-weight: 700;
font-size: 16px;
color: #222;
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;

/* Type Badge */
background-color: #87003A;
color: #ffffff;
border-radius: 4px;
font-size: 10px;
font-weight: 700;
text-transform: uppercase;
padding: 2px 8px;

/* Hover Overlay */
background-color: rgba(0, 0, 0, 0.75);
backdrop-filter: blur(2px);
```

### Partner Cards

```css
background: #ffffff;
padding: 2rem;
border-radius: 12px;
box-shadow: rgba(0,0,0,0.02) 0 0 0 1px,
            rgba(0,0,0,0.04) 0 2px 6px,
            rgba(0,0,0,0.08) 0 4px 8px;
transition: transform 0.3s ease, box-shadow 0.3s ease;

/* Hover */
transform: translateY(-4px);
box-shadow: rgba(0,0,0,0.04) 0 0 0 1px,
            rgba(0,0,0,0.06) 0 4px 12px,
            rgba(0,0,0,0.12) 0 8px 16px;
```

### Navigation (Sidebar)

```css
/* Desktop Sidebar */
width: 260px;
background: #ffffff;
border-right: 1px solid #eee;
position: fixed;
height: 100vh;

/* Category Header */
background-color: #87003A;
color: #ffffff;
padding: 8px 16px;

/* Active Item */
background-color: rgba(135, 0, 58, 0.08);
color: #87003A;

/* Custom Scrollbar */
scrollbar-width: thin;
scrollbar-color: #3d000f #87003A;
```

### Hero Slider

```css
/* Container */
width: 100%;
border-radius: 12px; /* mobile */
border-radius: 0; /* desktop */
overflow: hidden;

/* Overlay Gradient */
background: linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.1));

/* CTA Button */
background-color: rgba(135, 0, 58, 0.52);
color: #ffffff;
border-radius: 8px;
padding: 12px 24px;
font-weight: 600;
backdrop-filter: blur(4px);

/* Pagination */
.bullet-inactive: background #ffffff;
.bullet-active: background #87003A;
```

### Form Inputs

```css
border: 1px solid #ddd;
border-radius: 8px;
padding: 12px 16px;
font-size: 14px;
transition: border-color 0.2s ease, box-shadow 0.2s ease;

/* Focus */
border-color: #87003A;
box-shadow: 0 0 0 3px rgba(135, 0, 58, 0.1);
outline: none;

/* Dark Mode */
background-color: #2d2d2d;
color: #ffffff;
border-color: rgba(255, 255, 255, 0.23);
```

### Status Chips

```css
/* Paid/Success */
background: rgba(76, 175, 80, 0.15);
color: #2e7d32;
border-radius: 16px;

/* Pending/Warning */
background: rgba(255, 152, 0, 0.15);
color: #e65100;

/* Cancelled/Error */
background: rgba(244, 67, 54, 0.15);
color: #c62828;

/* Refunded/Info */
background: rgba(33, 150, 243, 0.15);
color: #1565c0;
```

---

## 5. Layout Principles

**Spacing Scale:** Base unit 8px

| Token | Value | Use |
|-------|-------|-----|
| `--space-xs` | 4px | Icon gaps, tight elements |
| `--space-sm` | 8px | Inline spacing, badge padding |
| `--space-md` | 16px | Card padding, section gaps |
| `--space-lg` | 24px | Section inner padding |
| `--space-xl` | 32px | Section vertical spacing |
| `--space-2xl` | 48px | Major section breaks |
| `--space-3xl` | 64px | Page-level vertical rhythm |

**Grid System:**
- MUI Grid, 12-column responsive
- Container max-width: 1200px with 15px horizontal padding
- Sidebar: 260px fixed on desktop (>900px)
- Main content: `margin-left: 260px` on desktop, full-width on mobile

**Card Grid:**
- Desktop (>900px): 3-4 columns
- Tablet (600-900px): 2 columns
- Mobile (<600px): 1 column, full-width

**Whitespace Philosophy:**
- Tourism-magazine spacing with generous vertical padding
- Photography density balanced with clean whitespace
- Hero slider gets maximum viewport presence (600px desktop, 220px mobile)
- Section breaks use spacing (48-64px) rather than heavy dividers

**Border Radius Scale:**
| Size | Value | Use |
|------|-------|-----|
| xs | 4px | Badges, tags, small elements |
| sm | 8px | Buttons, inputs, small cards |
| md | 12px | Activity cards, partner cards, slider |
| lg | 16px | Featured elements, modal corners |
| xl | 20px | Large promotional cards |
| full | 50% | Avatars, circular buttons |
| pill | 9999px | Status chips, pill badges |

---

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| **Flat (0)** | No shadow | Page background, flat surfaces |
| **Subtle (1)** | `rgba(0,0,0,0.06) 0 2px 4px` | Subtle lift, toolbar items |
| **Card (2)** | `rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px, rgba(0,0,0,0.08) 0 4px 8px` | Activity cards, partner cards, inputs |
| **Hover (3)** | `rgba(0,0,0,0.04) 0 0 0 1px, rgba(0,0,0,0.06) 0 4px 12px, rgba(0,0,0,0.12) 0 8px 16px` | Card hover, button hover |
| **Elevated (4)** | `rgba(0,0,0,0.08) 0 8px 24px, rgba(0,0,0,0.04) 0 2px 8px` | Dropdowns, popovers |
| **Modal (5)** | `rgba(0,0,0,0.5)` backdrop + `rgba(0,0,0,0.15) 0 16px 48px` | Modals, drawers, overlays |

**Shadow Philosophy:**
- Three-layer card shadow (border ring + soft blur + deeper blur) for warm, Airbnb-like depth
- Blue-free shadows -- neutral rgba(0,0,0) throughout for warmth
- Hover elevation via shadow enhancement + subtle translateY(-4px)
- Dark mode: reduce shadow opacity, rely on surface color stepping

---

## 7. Do's and Don'ts

### Do
- Use `#222` (warm near-black) for all primary text -- never cold pure black
- Use `#87003A` exclusively for primary CTAs, navigation accents, and brand moments
- Make photography the hero of activity cards -- images fill the top, no cropping
- Apply three-layer card shadows for consistent warm depth
- Use generous border-radius (8-12px) on cards and interactive elements
- Maintain 8px spacing rhythm throughout the application
- Support all accessibility modes (dark, dyslexia, high contrast)
- Use `text-overflow: ellipsis` for card titles
- Keep touch targets minimum 44px on mobile
- Use Georgian language as primary with English fallback

### Don't
- Use pure black (`#000000`) for text -- always use `#222` or `#333`
- Apply `#87003A` on large background surfaces (exception: navigation bar and footer)
- Use sharp corners (0 radius) on cards or buttons
- Create heavy shadows with opacity above 0.15 on the primary layer
- Mix multiple brand colors -- burgundy is the ONE accent
- Skip the semi-transparent primary variant for overlay buttons
- Use thin font weights (300) for headings -- always 700
- Add decorative elements that compete with activity photography
- Break the sidebar layout convention (260px desktop, drawer mobile)

---

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| **Mobile** | <600px | Single column, drawer nav, 220px slider, compact cards |
| **Tablet** | 600-900px | 2-column grid, 600px slider, expanded cards |
| **Desktop** | >900px | 3-4 column grid, 260px sidebar, full features |

### Component Adaptations

**Navigation:**
- Desktop: Fixed 260px sidebar with full category tree
- Mobile: Hidden sidebar, AppBar with hamburger menu, 280px swipeable drawer
- AppBar z-index: 1300 (above sidebar 1200)

**Hero Slider:**
- Desktop: 600px height, full-width, centered overlay text (2.5rem), visible description
- Mobile: 220px height, 12px border-radius, 1.1rem title, hidden description

**Activity Cards:**
- Desktop: 380px max-width, 227px image, full hover overlay
- Mobile: Full-width, maintained image ratio, simplified hover

**Typography Scaling:**
- Display: 2.5rem desktop -> 1.5rem mobile
- Section headings: 1.75rem -> 1.25rem
- Body: maintained at 14-16px across all sizes

**Touch Targets:**
- Minimum 44px height for all interactive elements on mobile
- Increased padding on mobile navigation items
- Larger hit areas for drawer toggle and close buttons

---

## 9. Agent Prompt Guide

### Quick Color Reference
```
Primary CTA:      #87003A (burgundy)
Primary Hover:    #3d000f (dark burgundy)
Primary Light:    rgba(135, 0, 58, 0.08)
Background:       #ffffff
Page Canvas:      #f8f9fa
Text Primary:     #222222
Text Secondary:   #555555
Text Muted:       #999999
Border:           #dddddd
Success:          #4caf50
Error:            #f44336
Warning:          #ff9800
Info:             #2196f3
Favorite:         #e91e63
Dark BG:          #121212
Dark Surface:     #1e1e1e
```

### Ready-to-Use Prompts

**Activity Card:**
> Build a card with: white background, 12px border-radius, three-layer shadow (`rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px, rgba(0,0,0,0.08) 0 4px 8px`). Full-width image on top (227px height, object-fit cover). Below image: bold 16px title with ellipsis overflow, small uppercase burgundy (`#87003A`) badges. On hover: translateY(-4px) with enhanced shadow.

**CTA Button:**
> Create a button with: `#87003A` background, white text, 8px border-radius, 700 weight, 16px font, 10px 24px padding. On hover: darken to `#3d000f` with translateY(-1px). Active: inset shadow.

**Hero Slider:**
> Full-width slider, 600px height desktop / 220px mobile. Each slide: cover image, gradient overlay (bottom black to top transparent), centered white text (2.5rem bold title, 1.2rem description), semi-transparent CTA button (`rgba(135,0,58,0.52)`). Pagination: white inactive dots, `#87003A` active dot.

**Sidebar Navigation:**
> Fixed 260px sidebar on desktop, white background, `1px solid #eee` right border. Sections with `#87003A` background headers, white text. Items with hover tint `rgba(135,0,58,0.08)`. Custom thin scrollbar: `#3d000f` thumb on `#87003A` track.

**Form Section:**
> Input fields with `1px solid #ddd`, 8px radius, 12px 16px padding. Focus: border `#87003A` + `0 0 0 3px rgba(135,0,58,0.1)` glow. Labels in `#555` at 14px. Error text in `#f44336`. Success feedback in `#4caf50`.

**Status Badge:**
> Pill-shaped badge (16px radius): success = green bg 15% opacity + dark green text, warning = orange bg 15% + dark orange text, error = red bg 15% + dark red text, info = blue bg 15% + dark blue text.
