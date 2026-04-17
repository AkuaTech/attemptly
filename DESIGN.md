# Design System Specification: Editorial Precision for High-Stakes Learning

## 1. Overview & Creative North Star
**The Creative North Star: "The Obsidian Laboratory"**

This design system is built to transform the high-pressure environment of JEE/NEET preparation into a focused, premium, and calm digital sanctuary. We are moving away from the "educational dashboard" trope-which is often cluttered and anxiety-inducing-and toward a "Digital Laboratory" aesthetic. 

The system leverages **Organic Brutalism**: the raw, dark power of monotone grays contrasted against the surgical precision of Neon Lime accents. We break the "template" look by utilizing intentional asymmetry in data visualization and high-contrast typography scales that prioritize "the problem at hand" above all else. Every pixel must feel intentional, expensive, and laser-focused on the student’s success.

---

## 2. Colors & Surface Architecture
The palette is a study in tonal depth. We use deep grays to reduce eye strain during long study sessions, punctuated by a singular, high-energy neon to denote progress and action.

### The "No-Line" Rule
Traditional 1px solid borders are strictly prohibited for sectioning. They create visual noise and "box in" the student's focus. Boundaries must be defined through:
*   **Background Shifts:** Using `surface-container-low` against a `surface` background.
*   **Tonal Transitions:** Defining edges through subtle variations in the gray scale rather than a stroke.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of frosted glass. 
*   **Base:** `background` (#0e0e0e)
*   **Sections:** `surface-container-low` (#131313)
*   **Cards/Modals:** `surface-container-high` (#201f1f)
*   **Active/Nodal Elements:** `surface-bright` (#2c2c2c)

### The "Glass & Gradient" Rule
For floating elements (modals, floating action buttons, navigation bars), use **High-Blur Glassmorphism**:
*   **Background:** `surface` at 70% opacity.
*   **Blur:** `backdrop-filter: blur(20px)`.
*   **Signature Texture:** Main CTAs should utilize a subtle linear gradient from `primary` (#e7f95c) to `primary-container` (#9dac05) at 135 degrees. This adds "soul" and prevents the neon from feeling flat or "cheap."

---

## 3. Typography
Our typography pairing balances tech-forward urgency with academic readability.

*   **Display & Headlines (Space Grotesk):** This is our "Techy/Precision" layer. Space Grotesk’s tabular qualities and geometric quirks make data points and question numbers feel like mission-critical information.
    *   *Usage:* Use `display-lg` for performance scores and `headline-md` for exam categories.
*   **Body & Labels (Inter):** The "Readability" layer. Inter is used for long-form question text and explanations to ensure zero cognitive friction.
    *   *Usage:* `body-lg` is the standard for exam questions. `label-sm` is reserved for metadata (e.g., "Previous Year Question").

The hierarchy is intentionally dramatic. We use a massive jump from `body-lg` to `display-sm` to create an editorial, high-end feel that highlights successes (scores) while keeping the work (questions) grounded.

---

## 4. Elevation & Depth
We reject traditional drop shadows in favor of **Tonal Layering**.

*   **The Layering Principle:** Depth is achieved by "stacking." A `surface-container-highest` card sits atop a `surface-container-low` section. This creates a soft, natural lift.
*   **Ambient Shadows:** For floating elements, shadows must be ultra-diffused. 
    *   *Spec:* `box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);`
*   **The "Ghost Border" Fallback:** If containment is required for accessibility, use a **Ghost Border**:
    *   *Spec:* `outline-variant` (#484847) at **15% opacity**. It should be felt, not seen.
*   **Glassmorphism Depth:** When using glass containers, ensure the `outline` token is used as a very thin, semi-transparent top-light (0.5px) to mimic light hitting the edge of a glass pane.

---

## 5. Components

### Buttons
*   **Primary:** Background: `primary` (#e7f95c) | Text: `on_primary` (#555d00). **Radius: 12px (md)**.
*   **Secondary:** Glassmorphic background | Ghost Border | Text: `primary`.
*   **Tertiary:** No background | Text: `on_surface_variant`. Underline on hover only.

### Cards & Question Interfaces
*   **Forbid Divider Lines.** Separate the question stem from the options using `1.5rem (md)` or `2rem (lg)` vertical white space.
*   **Nesting:** Place the option chips on a `surface-container-highest` card to make them feel interactable.

### Chips (Option Selection)
*   **Idle:** `surface-container-highest` with a 12px radius.
*   **Selected:** `primary` background with `on_primary` text. Use a subtle glow (`primary_dim`) to indicate the "active" choice.

### Data Visualization (JEE/NEET Progress)
*   **Charts:** Use `primary` for the "Success" line and `error` (#ff7351) for "Weak Areas." 
*   **Gradients:** Use `primary` to `transparent` vertical gradients for area charts to maintain the "glassy" aesthetic.

### Input Fields
*   **Default:** `surface-container-lowest` background, 12px radius. 
*   **Focus State:** Border transitions to `primary` at 40% opacity; background remains dark. No "glow" except for a 1px `primary` Ghost Border.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical layouts for dashboards (e.g., a wide performance graph next to a narrow "Daily Goal" card).
*   **Do** use `primary_fixed` for high-importance data points that must remain legible regardless of background shifts.
*   **Do** prioritize whitespace. In a high-stakes exam context, "breathing room" is a functional requirement, not just a style choice.

### Don’t:
*   **Don’t** use pure white (#FFFFFF) for text unless it is a high-contrast headline. Use `on_surface_variant` (#adaaaa) for secondary info to maintain the moody, sophisticated atmosphere.
*   **Don’t** use standard "Material Design" blue or green for success states. The `primary` Neon Lime is our singular source of "Success" energy.
*   **Don’t** use sharp 90-degree corners. Everything must feel approachable and modern, adhering to the `24px (lg)` and `12px (md)` rounding rules.
*   **Don’t** use 100% opaque borders. If a border looks like a "line," it is too heavy. It should look like a "hint."