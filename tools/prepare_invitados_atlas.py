"""Export the Higgsfield sheet into seven unchanged face crops.

Usage: python tools/prepare_invitados_atlas.py SOURCE_PNG OUTPUT_WEBP
"""
import sys
from prepare_banda_atlas import export_atlas

CROPS = [(12, 10, 315), (350, 0, 325), (690, 0, 330), (0, 350, 330),
         (350, 350, 330), (690, 350, 330), (0, 690, 330)]
NAMES = ["La Náufraga", "El Ronin", "La Sabueso", "La Vidente", "El Piloto", "La Carmesí", "El Errante"]

if __name__ == "__main__":
    export_atlas(*sys.argv[1:], crops=CROPS, names=NAMES, expected_size=(1024, 1024))
