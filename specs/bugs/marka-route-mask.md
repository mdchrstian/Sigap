# Bug: MarkaRoute yellow dashes never render

## Repro
Render `<MarkaRoute steps=[...]/>` (any mode, incl. prefers-reduced-motion). The yellow dashed
vertical line is invisible; only the grey base line shows. Ticket 23 eval checks 8 and 9 fail.

## Root cause
`<mask>` defaults to `maskUnits="objectBoundingBox"`. The masked content is a vertical line
(x1 == x2), whose bounding box has zero width, so the mask region is empty and hides everything.

## Fix
`maskUnits="userSpaceOnUse"` on the mask in frontend/src/components/ui/MarkaRoute.tsx (1 line).
