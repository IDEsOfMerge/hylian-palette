Every one of the 36 themes passes a multi-stage perceptual colorimetry pipeline before it ships:

- **OKLCH perceptual architecture** — surfaces, elevation steps, and low-chroma atmospheres (like *Twilight Princess Dark*) are sculpted in Björn Ottosson's OKLCH space so chroma never crushes luminance hierarchy.
- **100% WCAG 2.1 AA + APCA contrast** — all 20 foreground, syntax, comment, and diagnostic roles in every theme clear **4.5:1** on the editor canvas (`720 / 720` tokens passing), plus full 16-color ANSI terminal validation.
- **CIEDE2000 & dichromacy resilience** — all 21 critical adjacent syntax-role pairs clear `≥ 10 ΔE*ab` under simulated protanopia, deuteranopia, and tritanopia across every polychromatic theme.

Click **Open Interactive Explorer** on the left to test all 36 themes with live OKLCH/WCAG/APCA readouts and vision simulations right inside the editor, or <a href="https://idesofmerge.github.io/hylian-palette/">open the web explorer on GitHub Pages</a>.
