from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parents[1] / "assets" / "science-set1-realistic"
OUT.mkdir(parents=True, exist_ok=True)

W, H = 1600, 600


def font(size, bold=False):
    candidates = [
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            pass
    return ImageFont.load_default()


def rounded_box(draw, box, fill, outline, width=4):
    draw.rounded_rectangle(box, radius=28, fill=fill, outline=outline, width=width)


def center_text(draw, xy, text, fnt, fill):
    box = draw.textbbox((0, 0), text, font=fnt)
    draw.text((xy[0] - (box[2] - box[0]) / 2, xy[1] - (box[3] - box[1]) / 2), text, font=fnt, fill=fill)


def arrow(draw, start, end, fill=(50, 65, 85), width=8):
    draw.line([start, end], fill=fill, width=width)
    sx, sy = start
    ex, ey = end
    dx, dy = ex - sx, ey - sy
    length = max((dx * dx + dy * dy) ** 0.5, 1)
    ux, uy = dx / length, dy / length
    px, py = -uy, ux
    size = 24
    tip = (ex, ey)
    left = (ex - ux * size + px * size * 0.55, ey - uy * size + py * size * 0.55)
    right = (ex - ux * size - px * size * 0.55, ey - uy * size - py * size * 0.55)
    draw.polygon([tip, left, right], fill=fill)


def food_web_q21():
    img = Image.new("RGB", (W, H), (248, 250, 252))
    d = ImageDraw.Draw(img, "RGBA")

    # Background
    d.rectangle([0, 0, W, H], fill=(248, 250, 252, 255))
    d.ellipse([1180, -160, 1720, 330], fill=(219, 234, 254, 120))
    d.ellipse([-180, 360, 420, 760], fill=(220, 252, 231, 150))

    title_font = font(36, True)
    small_font = font(21)
    label_font = font(27, True)
    note_font = font(22, True)

    d.text((54, 38), "Rajah Siratan Makanan", font=title_font, fill=(15, 23, 42, 255))
    d.text((54, 86), "Anak panah menunjukkan arah pemindahan makanan/tenaga.", font=small_font, fill=(71, 85, 105, 255))

    nodes = {
        "Padi": ((110, 240, 340, 380), (220, 252, 231, 255), (22, 101, 52, 255)),
        "Belalang": ((450, 135, 720, 275), (254, 249, 195, 255), (133, 77, 14, 255)),
        "Tikus": ((450, 350, 720, 490), (226, 232, 240, 255), (51, 65, 85, 255)),
        "Burung kecil": ((835, 105, 1165, 245), (224, 242, 254, 255), (7, 89, 133, 255)),
        "Ular": ((850, 360, 1120, 500), (250, 232, 255, 255), (134, 25, 143, 255)),
        "Helang": ((1270, 230, 1510, 370), (254, 226, 226, 255), (153, 27, 27, 255)),
    }

    # Arrows first, behind nodes
    arrow(d, (340, 310), (450, 205))      # Padi -> Belalang
    arrow(d, (340, 320), (450, 420))      # Padi -> Tikus
    arrow(d, (720, 200), (835, 175))      # Belalang -> Burung
    arrow(d, (720, 230), (870, 390))      # Belalang -> Ular
    arrow(d, (720, 420), (850, 435))      # Tikus -> Ular
    arrow(d, (1165, 175), (1270, 285))    # Burung -> Helang
    arrow(d, (1120, 430), (1270, 330))    # Ular -> Helang

    for name, (box, fill, outline) in nodes.items():
        rounded_box(d, box, fill, outline, 5)
        center_text(d, ((box[0] + box[2]) / 2, (box[1] + box[3]) / 2), name, label_font, (15, 23, 42, 255))

    img.save(OUT / "q21-food-web.png", "PNG", optimize=True)


if __name__ == "__main__":
    food_web_q21()
    print(OUT / "q21-food-web.png")
