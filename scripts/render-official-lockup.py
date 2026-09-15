#!/usr/bin/env python3
"""Rasterize the official Tenth Meridian lockup (chi globe + wordmark)."""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path("public/brand")
GOLD = (196, 162, 100, 255)
WHITE = (255, 255, 255, 255)
BLACK = (0, 0, 0, 255)
FONT = "/tmp/meridian-fonts/PlayfairDisplay-Regular.ttf"


def _rotated_ellipse_points(
    cx: float, cy: float, rx: float, ry: float, angle_deg: float, steps: int = 360
) -> list[tuple[float, float]]:
    a = math.radians(angle_deg)
    ca, sa = math.cos(a), math.sin(a)
    pts: list[tuple[float, float]] = []
    for i in range(steps + 1):
        t = 2 * math.pi * i / steps
        x = rx * math.cos(t)
        y = ry * math.sin(t)
        pts.append((cx + x * ca - y * sa, cy + x * sa + y * ca))
    return pts


def _clip_to_circle(
    pts: list[tuple[float, float]], cx: float, cy: float, r: float
) -> list[list[tuple[float, float]]]:
    r2 = (r + 0.6) ** 2
    segs: list[list[tuple[float, float]]] = []
    cur: list[tuple[float, float]] = []
    for x, y in pts:
        if (x - cx) ** 2 + (y - cy) ** 2 <= r2:
            cur.append((x, y))
        elif cur:
            segs.append(cur)
            cur = []
    if cur:
        segs.append(cur)
    return segs


def _stroke_segs(
    draw: ImageDraw.ImageDraw,
    segs: list[list[tuple[float, float]]],
    width: int,
    dotted: bool = False,
) -> None:
    for seg in segs:
        if len(seg) < 2:
            continue
        if dotted:
            for i, (x, y) in enumerate(seg):
                if i % 7 == 0:
                    draw.ellipse([x - 0.9, y - 0.9, x + 0.9, y + 0.9], fill=GOLD)
        else:
            draw.line(seg, fill=GOLD, width=width, joint="curve")


def draw_globe(draw: ImageDraw.ImageDraw, cx: float, cy: float, r: float) -> None:
    """Official mark: gold sphere, vertical axis, equator, chi / X meridians."""
    stroke = 3
    thin = 2
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=GOLD, width=stroke)

    # Supporting longitudes — beaded, stay behind the chi
    for deg in (24, 70):
        rx = max(2.0, r * abs(math.sin(math.radians(deg))))
        pts = _rotated_ellipse_points(cx, cy, rx, r, 0)
        _stroke_segs(draw, _clip_to_circle(pts, cx, cy, r), 1, dotted=True)

    # Equator, slight 3-D
    eq = _rotated_ellipse_points(cx, cy, r, r * 0.18, 0)
    _stroke_segs(draw, _clip_to_circle(eq, cx, cy, r), thin)

    # Chi — two meridians rotated so they cross at the visual center
    for angle in (-44, 44):
        pts = _rotated_ellipse_points(cx, cy, r * 0.26, r, angle)
        _stroke_segs(draw, _clip_to_circle(pts, cx, cy, r), stroke)

    # Polar axis
    draw.line([(cx, cy - r), (cx, cy + r)], fill=GOLD, width=stroke)


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
    draw_globe(draw, x0 + globe_r, cy, globe_r)
    tx = x0 + globe_r * 2 + gap
    draw.text((tx, cy - 124), word, font=title, fill=WHITE)
    rule_y = cy + 68
    draw.line([(tx, rule_y), (tx + tw, rule_y)], fill=GOLD, width=2)
    spaced = "  ".join(line)
    sw = draw.textlength(spaced, font=sub)
    draw.text((tx + (tw - sw) / 2, rule_y + 28), spaced, font=sub, fill=GOLD)

    if background is None:
        px = img.load()
        for y in range(h):
            for x in range(w):
                r, g, b, a = px[x, y]
                if a and r < 18 and g < 18 and b < 18:
                    px[x, y] = (0, 0, 0, 0)

    img.save(dest, "PNG")
    if webp:
        img.save(webp, "WEBP", quality=92, method=6)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    render(BLACK, OUT / "tenth-meridian-logo-full-lockup.png", OUT / "tenth-meridian-logo-full-lockup.webp")
    render(None, OUT / "tenth-meridian-logo-full-lockup-transparent.png", OUT / "tenth-meridian-logo-full-lockup-transparent.webp")
    print("wrote", sorted(p.name for p in OUT.iterdir()))


if __name__ == "__main__":
    main()
