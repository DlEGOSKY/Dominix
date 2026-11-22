"""Mechanical 3x2 swatch export; no redraw, text or material enhancement.

Usage: python tools/prepare_material_surfaces.py SOURCE_PNG OUTPUT_DIRECTORY
"""
import hashlib
import json
import sys
from pathlib import Path
from PIL import Image

NAMES = ["ivory", "emerald", "ruby", "diamond", "obsidian", "roman"]

def main():
    source, target = map(Path, sys.argv[1:])
    target.mkdir(parents=True, exist_ok=True)
    entries = []
    with Image.open(source) as image:
        width, height = image.size
        for index, name in enumerate(NAMES):
            col, row = index % 3, index // 3
            crop = (round(col*width/3), round(row*height/2), round((col+1)*width/3), round((row+1)*height/2))
            path = target / f"{name}-v1.webp"
            image.crop(crop).convert("RGB").resize((96, 192), Image.Resampling.LANCZOS).save(path, "WEBP", quality=82, method=6)
            entries.append({"material":name,"crop":crop,"file":path.name,"bytes":path.stat().st_size,"sha256":hashlib.sha256(path.read_bytes()).hexdigest()})
    metadata = {"source_sha256":hashlib.sha256(source.read_bytes()).hexdigest(),"source_size":[width,height],"surface_size":[96,192],"quality":82,"resampling":"lanczos","surfaces":entries}
    (target / "surfaces-v1.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    print(json.dumps({"source_size":[width,height],"surfaces":len(entries),"total_bytes":sum(entry["bytes"] for entry in entries)}))

if __name__ == "__main__":
    main()
