# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Stage Draw is a tool for creating and visualizing musical stage plots using draw.io's mxGraphModel XML format. It has two main workflows:

1. **Edit** stage plots in [draw.io](https://app.diagrams.net) using custom equipment shape libraries
2. **View** stage plots in a browser via a standalone SVG renderer

There is no build system, no package manager, and no test framework. This is a static web project.

## Key Files

- `StagePlot.drawio` - The primary stage plot file, opened/edited directly in draw.io
- `index.html` - Standalone web renderer: parses embedded mxGraphModel XML into interactive SVG (vanilla JS, CSS custom properties, no dependencies)
- `StageEquipment.xml` - draw.io custom shape library (XML format with deflate-compressed entries)
- `StageEquipment.drawiolib` - Same library in `.drawiolib` format for broader draw.io compatibility
- `official.xml` / `TestLib.xml` - Reference files used to match the exact compression format of official draw.io libraries
- `icons/` - SVG source icons for stage equipment (mic, drum-kit, guitar-amp, synth, keyboard, etc.)

## How to Run

Open `index.html` in any browser. No server required.

## Architecture Notes

**Renderer (`index.html`)**: The `<script>` tag contains an inline `xmlData` string with the full mxGraphModel XML. The `render()` function parses this XML, iterates over `<mxCell>` elements, reads their `style` attributes, and generates corresponding SVG elements (ellipse, rect, polygon, line, image). Supports shapes: pentagon, ellipse, parallelogram, rounded rect, image, and edge/line. Hover tooltips are driven by each cell's `value` attribute.

**Shape Libraries**: draw.io libraries use a JSON array where each entry's XML content is deflate-compressed and base64-encoded. The `.xml` and `.drawiolib` formats must match the compression scheme used by official draw.io templates (raw deflate, not gzip). SVG icons are embedded as base64 `data:image/svg+xml` URIs inside shape styles.

## Working with Libraries

### The Semicolon Corruption Bug (Critical)
Draw.io uses semicolons (`;`) to separate properties in its `style` attribute. Standard base64 data URIs (e.g., `data:image/svg+xml;base64,...`) also contain semicolons. 

**The Bug**: If you embed a base64 URI directly inside a style string, the draw.io parser sees the semicolon, thinks the style property has ended early, and truncates the image data. This results in "blank" icons and `net::ERR_INVALID_URL` errors in the browser console.

### The Robust Fix: "Simple Data" Format
To avoid this, we use the **Simple Data Format** for the `StageEquipment.xml` library. Instead of placing the image URI inside a complex XML-compressed `xml` field, we provide it in a direct `data` field in the library JSON.
*   **Format**: `[{"title": "Name", "data": "data:image/svg+xml;base64,...", "w": 40, "h": 40}]`
*   **Benefits**: Immune to the semicolon bug, no complex XML nesting, and significantly more reliable across different draw.io versions.

### Updating the Library
Use the `build-library.py` script to regenerate the library. It is configured to use the "Simple Data" format. 
*   **Command**: `python3 build-library.py`
*   **Output**: Updates `StageEquipment.xml` and `StageEquipment.drawiolib`.

## Stage Plot Encoding
If you must embed images directly inside a `.drawio` stage plot file (outside of a library):
1.  **Strict URL-Encoding**: You MUST URL-encode the entire data URI (converting `;` to `%3B` and `+` to `%2B`) before inserting it into the `image=...` style.
2.  **HTML Format**: Alternatively, use the `html=1` style and place an `<img>` tag inside the cell's `value` attribute. This is the most robust method for complex plots.
