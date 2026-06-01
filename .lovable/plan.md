## Goal

Fix two layout issues in `SelectedCreatorList.tsx` card header:

1. Name `Chloe Simmo...` and handle `@chloe.makeupbook · 124...` get truncated too aggressively.
2. The three-dot button (详情) overlaps the X / ChevronDown toggle in the top-right corner.

## Changes

**File:** `src/components/modules/skills/SelectedCreatorList.tsx`

### 1. De-crowd the top-right corner

Today: `MoreHorizontal` is `absolute right-1.5 top-1.5`, sitting on top of the inline `ChevronDown` / `X` toggle that lives inside the expand button.

Fix: keep only **one** affordance per zone.

- Remove the `ChevronDown` / `X` icon from the right side of the header row entirely. Expand/collapse stays triggered by clicking the avatar/name area (already the case).
- Keep the three-dot `MoreHorizontal` as the single top-right icon, always reserving its slot (no overlap with text). It opens `CreatorDetailDialog` as today.
- Add a small collapse affordance only when expanded: a thin "收起" text button at the bottom of the expanded block, or a chevron flipped inline next to the footer — not in the top-right.

This frees the top-right for just the three-dot and removes the visual collision.

### 2. Stop truncating name + handle so early

Root causes:
- Card is fixed `w-[220px]`.
- Header row reserves space for: avatar (36px) + name + `海外·女` chip + toggle icon, leaving very little for the name.
- Handle row also includes `· {followers} 粉丝`, forcing the handle to truncate.

Fixes:
- Widen the card to `w-[244px]` (still fits 2-up in the surrounding flex-wrap container).
- Move the `海外·女` chip out of the name row — render it on a second meta line together with `{followers} 粉丝`, so the name has the full row width minus avatar + three-dot slot.
- Drop `· {followers} 粉丝` from the handle line so the handle gets the full width.
- Result: line 1 = full name, line 2 = `@handle`, line 3 (muted, smaller) = `海外·女 · 124.8K 粉丝`.
- Keep `truncate` on name and handle as a safety net for extreme cases, but typical names like `Chloe Simmons` will now fit.

### 3. Minor polish

- Bump three-dot from `h-5 w-5` to `h-6 w-6` so it's an easier target and visually balanced with the new header.
- Make three-dot always visible at low opacity (e.g. `opacity-60`) instead of `opacity-0` + hover-only, so users discover it without hovering. Keeps hover behavior to brighten on hover.

## Out of scope

- No changes to `CreatorDetailDialog` itself.
- No changes to `CreatorSelectionDialog` cards (already handled in prior turn).
- No changes to data shape or `structuredDetails` rendering inside the expanded block.
