# Design System & Color Guide

## 🎨 Color Palette

### Primary Colors
- **Primary Gradient**: `#667eea` → `#764ba2` (Purple to Pink)
  - Used for main buttons, header, active states
  - Creates a modern, vibrant feel
  
### Semantic Colors
- **Success**: `#16a34a` (Green) - Completed tasks, success messages
- **Warning**: `#f59e0b` (Amber) - Pending tasks, caution states  
- **Danger**: `#dc2626` (Red) - Delete actions, error messages
- **Info**: `#0ea5e9` (Sky Blue) - In progress tasks, info messages

### Neutral Colors
- **Text**: `#102a43` (Dark Blue) - Primary text
- **Secondary Text**: `#475569` (Slate) - Muted text, metadata
- **Background**: `#ebf2ff` (Light Blue) - Page background
- **Surface**: `#ffffff` (White) - Card surfaces
- **Surface Soft**: `#f8fbff` (Very Light Blue) - Subtle backgrounds
- **Border**: `rgba(148, 163, 184, 0.33)` (Light Gray) - Borders

## 📐 Spacing Scale

All spacing follows an 8px base unit:

```
--spacing-xs:  4px   (half unit)
--spacing-sm:  8px   (1 unit)
--spacing-md:  16px  (2 units)
--spacing-lg:  24px  (3 units)
--spacing-xl:  32px  (4 units)
```

### Usage Examples
- Padding within cards: `--spacing-lg` (24px)
- Gap between elements: `--spacing-md` (16px)
- Margins top/bottom: `--spacing-xl` (32px)

## 🎯 Border Radius System

```
--radius-sm:    8px    (subtle curves)
--radius-md:    12px   (default buttons)
--radius-lg:    16px   (cards, forms)
--radius-xl:    24px   (large cards)
--radius-full:  999px  (pills, circles)
```

## 🌟 Shadow System

Three-tier shadow hierarchy for depth:

```
--shadow-sm:  0 2px 8px rgba(0, 0, 0, 0.05)
              (subtle hover, input focus)

--shadow-md:  0 8px 16px rgba(0, 0, 0, 0.08)
              (card hover, dropdowns)

--shadow-lg:  0 20px 40px rgba(0, 0, 0, 0.1)
              (page cards, modals)
```

## ⏱️ Transition System

Three timing functions for smooth interactions:

```
--transition-fast:  150ms ease  (hover states, quick feedback)
--transition-base:  200ms ease  (default transitions, buttons)
--transition-slow:  300ms ease  (page transitions, animations)
```

## 🎬 Animations

### Fade In Up (Page Load)
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Slide In Down (Alerts)
```css
@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Spin (Loading)
```css
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

## 🎨 Component Styles

### Buttons
- **Primary**: Gradient background (purple → pink), white text, shadow on hover
- **Secondary**: White background, primary text, border, no shadow
- **Danger**: Red gradient, white text
- **Disabled**: 60% opacity, no hover effects

### Form Elements
- **Inputs**: 16px padding, 1.5px border, focus shadow with primary color
- **Labels**: 0.85rem size, uppercase, letter-spacing
- **Textarea**: Min 100px height, vertical resize only

### Cards
- **Default**: White background, 1.5px border, soft shadow
- **On Hover**: Elevation with `-4px` transform, stronger shadow
- **Stats Card**: Gradient background, centered text, larger numbers

### Status Badges
- **Pending**: Orange gradient `#f59e0b` → `#d97706`
- **In Progress**: Blue gradient `#0ea5e9` → `#0284c7`
- **Completed**: Green gradient `#16a34a` → `#15803d`

## 📱 Responsive Breakpoints

```css
Desktop:  Full width, multi-column layouts
Tablet:   840px - Single column assignments, adjusted spacing
Mobile:   640px - Full-width, stacked layouts, touch-friendly buttons
```

## ♿ Accessibility Features

- **Color Contrast**: All text meets WCAG AA standards
- **Focus States**: Visible focus rings on all interactive elements
- **Semantic HTML**: Proper heading hierarchy (h1 > h2 > h3)
- **ARIA Labels**: Labels on form inputs and icon buttons
- **Keyboard Navigation**: Full keyboard support throughout
- **Touch Targets**: Minimum 48px x 48px for mobile buttons

## 🎯 Typography Scale

```
h1 (Page Title):     2rem - 3.4rem (responsive)
h2 (Section):        1.45rem
h3 (Card Title):     1.1rem
p (Body):            1rem (16px)
small (Meta):        0.85rem - 0.9rem
```

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
```

## 💡 Design Principles Used

1. **Consistency**: All components follow the same visual language
2. **Clarity**: Clear visual hierarchy with size, color, and contrast
3. **Feedback**: Every interaction provides visual feedback
4. **Accessibility**: Inclusive design that works for everyone
5. **Responsiveness**: Seamless experience across all devices
6. **Performance**: Optimized with native CSS and minimal animations
7. **Professionalism**: Modern, polished appearance

## 🚀 Quick Reference

### Common CSS Classes

```css
/* Layout */
.flex { display: flex; }
.flex-center { display: flex; align-items: center; justify-content: center; }

/* Spacing */
.mt-sm/md/lg { margin-top: var(--spacing-sm/md/lg); }
.mb-sm/md/lg { margin-bottom: var(--spacing-sm/md/lg); }
.gap-sm/md/lg { gap: var(--spacing-sm/md/lg); }

/* Text */
.text-center { text-align: center; }
.text-muted { color: var(--text-secondary); }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
```

---

## 📸 Visual Examples

### Status Badge Colors
- ⏳ Pending: Orange/Amber
- 🚀 In Progress: Sky Blue
- ✅ Completed: Green

### Button States
- **Normal**: Gradient, raised
- **Hover**: Lifted with shadow
- **Active**: Darker color
- **Disabled**: 60% opacity, no effects

### Card States
- **Default**: Subtle shadow
- **Hover**: Elevated, stronger shadow
- **Focus**: Border color change to primary

---

This design system ensures consistency, accessibility, and a professional appearance across your entire application!
