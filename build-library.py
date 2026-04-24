#!/usr/bin/env python3
"""
Rebuild the StageEquipment draw.io library from SVG icons.
Uses the 'Simple' format (data field) which is the most robust for icon libraries.
"""

import json, base64, os

ICONS_DIR = "icons"
OUTPUT_XML = "StageEquipment.xml"

# (svg_filename, title, default_width, default_height)
SHAPES = [
    ("mic.svg",             "Microphone",      40, 40),
    ("drum-kit.svg",        "Drum Kit",        60, 60),
    ("guitar-amp.svg",      "Guitar Amp",      50, 50),
    ("amplifier.svg",       "Bass Amp",        50, 50),
    ("keyboard.svg",        "Keyboard",        80, 30),
    ("synth.svg",           "Piano Keys",      80, 30),
    ("pedal.svg",           "Guitar Pedal",    30, 30),
    ("acoustic-guitar.svg", "Acoustic Guitar", 40, 60),
    ("bass-guitar.svg",     "Bass Guitar",     40, 60),
    ("bongos.svg",          "Bongos",          50, 50),
    ("music-stand.svg",     "Music Stand",     40, 60),
]

def svg_to_base64_data_uri(svg_path):
    """Read SVG and return a full base64 data URI."""
    with open(svg_path, "rb") as f:
        svg_bytes = f.read()
    b64 = base64.b64encode(svg_bytes).decode("utf-8")
    return f"data:image/svg+xml;base64,{b64}"

def build():
    entries = []
    for svg_file, title, w, h in SHAPES:
        svg_path = os.path.join(ICONS_DIR, svg_file)
        if not os.path.exists(svg_path):
            print(f"  SKIP {svg_file} (not found)")
            continue
        
        data_uri = svg_to_base64_data_uri(svg_path)
        
        # This format uses the 'data' field directly, bypassing internal XML/Deflate
        # It is highly robust and officially supported for image libraries.
        entries.append({
            "data": data_uri,
            "w": w,
            "h": h,
            "title": title,
            "aspect": "fixed"
        })
        print(f"  + {title}")
    
    # Write as a JSON array inside <mxlibrary> tags
    json_str = json.dumps(entries, separators=(',', ':'))
    with open(OUTPUT_XML, "w") as f:
        f.write(f"<mxlibrary>{json_str}</mxlibrary>")
    
    print(f"\nSuccessfully built library: {OUTPUT_XML}")

if __name__ == "__main__":
    build()
