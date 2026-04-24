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

When modifying the shape library, the XML content for each shape must be deflate-compressed (matching `official.xml` as the reference format). The icons in `icons/` are the source SVGs; they get base64-encoded into the library entries' style strings.
