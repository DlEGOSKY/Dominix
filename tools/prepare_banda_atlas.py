"""Mechanically export seven approved face crops; no redraw or retouch.

Requires Pillow only for asset preparation, not for running the game.
Usage: python tools/prepare_banda_atlas.py SOURCE_PNG OUTPUT_WEBP
"""
import hashlib
import json
import sys
from pathlib import Path
from PIL import Image

CROPS = [(90, 25, 240), (500, 100, 260), (870, 75, 300), (95, 470, 250),
         (520, 480, 245), (900, 440, 260), (70, 850, 260)]
NAMES = ["El Ausente", "Monóculo", "Los Picos", "Trébol", "Cuatro Ojos", "Estrella Invitada", "El Portero"]
FRAME = 96


def export_atlas(source, output, crops=CROPS, names=NAMES, expected_size=(1254, 1254)):
    source, output = Path(source), Path(output)
    if len(crops) != 7 or len(names) != 7:
        raise ValueError("A portrait pack needs seven named values")
    with Image.open(source) as original:
        if original.size != expected_size:
            raise ValueError(f"Expected the approved {expected_size} concept sheet")
        atlas = Image.new("RGB", (FRAME * len(crops), FRAME))
        for value, (x, y, side) in enumerate(crops):
            face = original.crop((x, y, x + side, y + side)).convert("RGB")
            atlas.paste(face.resize((FRAME, FRAME), Image.Resampling.NEAREST), (value * FRAME, 0))
        atlas = atlas.quantize(colors=128, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB")
        output.parent.mkdir(parents=True, exist_ok=True)
        atlas.save(output, "WEBP", lossless=True, method=6)
    hashes = [hashlib.sha256(atlas.crop((n * FRAME, 0, (n + 1) * FRAME, FRAME)).tobytes()).hexdigest() for n in range(7)]
    if len(set(hashes)) != 7:
        raise ValueError("Portrait frames must be distinct")
    metadata = {"source_sha256": hashlib.sha256(source.read_bytes()).hexdigest(), "size": list(atlas.size),
                "frame": FRAME, "palette_colors": 128, "resampling": "nearest", "bytes": output.stat().st_size,
                "portraits": [{"value": n, "name": names[n], "source_crop": list(crop), "sha256": hashes[n]} for n, crop in enumerate(crops)]}
    output.with_suffix(".json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"size": atlas.size, "frames": len(set(hashes)), "bytes": output.stat().st_size}))


if __name__ == "__main__":
    export_atlas(*sys.argv[1:])
