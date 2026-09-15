#!/usr/bin/env python3
"""Render the official Tenth Meridian lockup from the attached brand art."""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path("public/brand")
GOLD = (196, 162, 100, 255)
WHITE = (255, 255, 255, 255)
BLACK = (0, 0, 0, 255)
FONT = "/tmp/meridian-fonts/PlayfairDisplay-Regular.ttf"


def draw_globe(draw: ImageDraw.ImageDraw, cx: float, cy: float, r: float, width: float) -> None:
    stroke = max(2, int(width))
    thin = max(1, int(width * 0.7))
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=GOLD, width=stroke)
    # Official mark: meridians crossing as a chi / globe, not a busy grid.
    for deg in (18, 42, 90, 138, 162):
        rx = max(2.0, r * abs(math.sin(math.radians(deg))))
        draw.ellipse([cx - rx, cy - r, cx + rx, cy + r], outline=GOLD, width=thin)
    for scale in (0.28, 1.0):
        ry = r * scale * 0.38
        draw.ellipse([cx - r, cy - ry, cx + r, cy + ry], outline=GOLD, width=thin)
    draw.line([(cx, cy - r), (cx, cy + r)], fill=GOLD, width=stroke)
    draw.line([(cx - r, cy), (cx + r, cy)], fill=GOLD, width=thin)


def render(background: tuple[int, int, int, int] | None, dest: Path, webp: Path | None = None) -> None:
    w, h = 2400, 720
    img = Image.new("RGBA", (w, h), background if background else (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    title = ImageFont.truetype(FONT, 176)
    sub = ImageFont.truetype(FONT, 28)

    word = "TENTH MERIDIAN"
    line = "PRIVATE NETWORK  •  EST. MMXXVI"
    tw = draw.textlength(word, font=title)
    globe_r = 108
    gap = 64
    total = globe_r * 2 + gap + tw
    x0 = (w - total) / 2
    cy = 318
    draw_globe(draw, x0 + globe_r, cy, globe_r, 3.4)
    tx = x0 + globe_r * 2 + gap
    draw.text((tx, cy - 124), word, font=title, fill=WHITE)
    rule_y = cy + 68
    draw.line([(tx, rule_y), (tx + tw, rule_y)], fill=GOLD, width=2)
    spaced = "  ".join(line)
    sw = draw.textlength(spaced, font=sub)
    draw.text((tx + (tw - sw) / 2, rule_y + 28), spaced, font=sub, fill=GOLD)

    img.save(dest, "PNG")
    if webp:
        img.save(webp, "WEBP", quality=90, method=6)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    render(BLACK, OUT / "tenth-meridian-logo-full-lockup.png", OUT / "tenth-meridian-logo-full-lockup.webp")
    render(None, OUT / "tenth-meridian-logo-full-lockup-transparent.png", OUT / "tenth-meridian-logo-full-lockup-transparent.webp")
    print("wrote", list(OUT.iterdir()))


if __name__ == "__main__":
    main()
