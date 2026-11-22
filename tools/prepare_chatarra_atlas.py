"""Export approved Chatarra de Lujo portraits with the shared mechanical pipeline.

Usage: python tools/prepare_chatarra_atlas.py SOURCE_PNG OUTPUT_WEBP
"""
import sys
from prepare_banda_atlas import export_atlas

CROPS = [(30, 20, 360), (450, 20, 350), (850, 25, 360), (25, 435, 360),
         (445, 435, 360), (850, 435, 370), (25, 860, 365)]
NAMES = ["Apagado", "Farol", "Pinza", "Triciclo", "Remache", "Dínamo", "Caldero"]

if __name__ == "__main__":
    export_atlas(*sys.argv[1:], crops=CROPS, names=NAMES)
