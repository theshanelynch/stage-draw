# Stage Plot Renderer

A standalone web application to visualize musical stage plots defined in `mxGraphModel` XML format.

## Features
- **Editable Source**: `StagePlot.drawio` can be opened directly in [draw.io](https://app.diagrams.net).
- **Dynamic Rendering**: `index.html` parses the XML and converts it into scalable SVG graphics for quick viewing.
- **Premium Design**: Dark mode interface with subtle glows and modern typography.

## How to Use
1. **To Edit**: Open `StagePlot.drawio` in [draw.io](https://app.diagrams.net) or any compatible editor.
2. **To View**: Open `index.html` in any modern web browser.

## Implementation Details
- **Rendering Engine**: Custom SVG renderer built with Vanilla JavaScript.
- **Styling**: Modern CSS with HSL-based color tokens and cubic-bezier animations.
- **Compatibility**: Supports standard mxGraph shapes (Pentagon, Ellipse, Parallelogram, Rounded Rects).

## Modifying the Plot
To update the stage plot, replace the `xmlData` string in the `<script>` tag of `index.html` with your own `mxGraphModel` XML.
