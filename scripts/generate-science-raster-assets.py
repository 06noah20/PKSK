from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import random
import math

OUT = Path(__file__).resolve().parents[1] / "assets" / "science-realistic"
OUT.mkdir(parents=True, exist_ok=True)

W, H = 1600, 600


def canvas(top, bottom):
    img = Image.new("RGB", (W, H), top)
    px = img.load()
    for y in range(H):
        t = y / (H - 1)
        r = int(top[0] * (1 - t) + bottom[0] * t)
        g = int(top[1] * (1 - t) + bottom[1] * t)
        b = int(top[2] * (1 - t) + bottom[2] * t)
        for x in range(W):
            px[x, y] = (r, g, b)
    return img


def add_noise(img, strength=12):
    rng = random.Random(42)
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    opx = overlay.load()
    for y in range(0, H, 2):
        for x in range(0, W, 2):
            v = rng.randint(-strength, strength)
            a = abs(v)
            col = (255, 255, 255, a) if v > 0 else (0, 0, 0, a)
            opx[x, y] = col
    return Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")


def shadow_layer(img, shape_drawer, blur=24, alpha=70, offset=(0, 22)):
    sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(sh)
    shape_drawer(d, offset, (0, 0, 0, alpha))
    sh = sh.filter(ImageFilter.GaussianBlur(blur))
    return Image.alpha_composite(img.convert("RGBA"), sh)


def save(img, name):
    img = add_noise(img, 8)
    img.save(OUT / name, "PNG", optimize=True)


def ground_scene(sky=(219, 239, 255), land=(137, 166, 104)):
    img = canvas(sky, (248, 250, 252))
    d = ImageDraw.Draw(img, "RGBA")
    d.rectangle([0, 360, W, H], fill=land + (255,))
    for i in range(70):
        x = random.randint(0, W)
        h = random.randint(24, 110)
        d.line([x, 390, x + random.randint(-18, 18), 390 - h], fill=(57, 107, 63, 130), width=random.randint(2, 5))
    return img


def chicken():
    img = ground_scene((221, 238, 255), (152, 181, 103))
    img = shadow_layer(img, lambda d, o, c: d.ellipse([430 + o[0], 356 + o[1], 1190 + o[0], 478 + o[1]], fill=c))
    d = ImageDraw.Draw(img, "RGBA")
    d.ellipse([405, 185, 1020, 455], fill=(236, 209, 151, 255), outline=(122, 80, 40, 160), width=5)
    for i in range(30):
        x = 460 + i * 17
        d.arc([x, 210, x + 92, 385], 190, 320, fill=(148, 99, 55, 90), width=3)
    d.ellipse([930, 150, 1135, 310], fill=(218, 176, 112, 255), outline=(120, 82, 46, 150), width=5)
    d.polygon([(1118, 225), (1245, 260), (1120, 285)], fill=(232, 185, 53, 255), outline=(144, 91, 18, 200))
    d.polygon([(1010, 146), (1060, 74), (1108, 151)], fill=(196, 34, 48, 255))
    d.ellipse([1058, 203, 1074, 219], fill=(20, 25, 30, 255))
    d.line([715, 445, 690, 535], fill=(173, 106, 34, 255), width=10)
    d.line([845, 438, 875, 535], fill=(173, 106, 34, 255), width=10)
    d.line([668, 535, 716, 535], fill=(173, 106, 34, 255), width=7)
    d.line([852, 535, 902, 535], fill=(173, 106, 34, 255), width=7)
    d.polygon([(405, 245), (220, 175), (300, 388)], fill=(190, 95, 58, 255))
    save(img, "animal-chicken.png")


def cat():
    img = ground_scene((239, 244, 250), (205, 195, 177))
    img = shadow_layer(img, lambda d, o, c: d.ellipse([360 + o[0], 380 + o[1], 1200 + o[0], 505 + o[1]], fill=c))
    d = ImageDraw.Draw(img, "RGBA")
    d.ellipse([350, 215, 980, 455], fill=(204, 149, 91, 255), outline=(108, 76, 46, 170), width=5)
    d.ellipse([880, 155, 1130, 360], fill=(210, 158, 99, 255), outline=(108, 76, 46, 170), width=5)
    d.polygon([(910, 176), (950, 70), (995, 180)], fill=(190, 120, 75, 255))
    d.polygon([(1040, 175), (1105, 82), (1090, 205)], fill=(190, 120, 75, 255))
    d.ellipse([960, 232, 978, 250], fill=(24, 28, 34, 255))
    d.ellipse([1040, 232, 1058, 250], fill=(24, 28, 34, 255))
    d.arc([990, 262, 1040, 305], 10, 170, fill=(70, 45, 34, 255), width=4)
    d.arc([210, 170, 445, 430], 115, 265, fill=(204, 149, 91, 255), width=28)
    for x in [430, 600, 780, 920]:
        d.line([x, 425, x - 30, 535], fill=(135, 83, 47, 255), width=18)
    save(img, "animal-cat.png")


def crocodile():
    img = canvas((199, 230, 235), (96, 145, 128))
    d = ImageDraw.Draw(img, "RGBA")
    d.rectangle([0, 385, W, H], fill=(116, 91, 57, 255))
    d.rectangle([0, 255, W, 415], fill=(69, 125, 132, 230))
    for y in range(270, 405, 22):
        d.arc([0, y, W, y + 70], 0, 180, fill=(191, 219, 219, 60), width=2)
    img = shadow_layer(img, lambda dr, o, c: dr.ellipse([210 + o[0], 360 + o[1], 1260 + o[0], 485 + o[1]], fill=c))
    d = ImageDraw.Draw(img, "RGBA")
    d.ellipse([250, 245, 1050, 430], fill=(92, 105, 54, 255), outline=(45, 64, 33, 180), width=6)
    d.polygon([(980, 275), (1320, 235), (1450, 302), (1310, 360), (980, 350)], fill=(102, 118, 61, 255), outline=(45, 64, 33, 180))
    d.polygon([(260, 330), (70, 375), (260, 390)], fill=(82, 98, 51, 255))
    for x in range(330, 1000, 45):
        d.polygon([(x, 250), (x + 20, 205), (x + 42, 252)], fill=(118, 130, 70, 255))
    d.ellipse([1250, 275, 1270, 293], fill=(8, 12, 10, 255))
    d.line([1240, 328, 1420, 318], fill=(245, 245, 230, 230), width=6)
    for x in range(1270, 1410, 28):
        d.polygon([(x, 322), (x + 8, 345), (x + 17, 321)], fill=(250, 250, 235, 255))
    save(img, "animal-crocodile.png")


def turtle():
    img = ground_scene((220, 238, 241), (130, 166, 109))
    d = ImageDraw.Draw(img, "RGBA")
    d.rectangle([0, 420, W, H], fill=(119, 93, 62, 255))
    img = shadow_layer(img, lambda dr, o, c: dr.ellipse([370 + o[0], 365 + o[1], 1180 + o[0], 500 + o[1]], fill=c))
    d = ImageDraw.Draw(img, "RGBA")
    d.ellipse([380, 190, 1035, 470], fill=(89, 126, 60, 255), outline=(36, 74, 40, 180), width=7)
    d.ellipse([700, 210, 1000, 438], fill=(125, 155, 75, 255), outline=(50, 82, 42, 180), width=5)
    for x in range(475, 930, 95):
        d.arc([x - 70, 215, x + 120, 445], 190, 350, fill=(42, 83, 45, 100), width=5)
    d.ellipse([1040, 290, 1160, 380], fill=(111, 150, 75, 255))
    d.ellipse([1110, 320, 1122, 332], fill=(12, 18, 15, 255))
    for x, y in [(460, 445), (600, 462), (900, 452), (1010, 425)]:
        d.ellipse([x - 35, y - 20, x + 40, y + 32], fill=(83, 119, 65, 255))
    save(img, "animal-turtle.png")


def generic_animal():
    img = ground_scene((226, 240, 250), (154, 188, 118))
    d = ImageDraw.Draw(img, "RGBA")
    d.ellipse([485, 180, 1020, 425], fill=(216, 152, 82, 255), outline=(110, 68, 38, 160), width=6)
    d.ellipse([905, 135, 1120, 330], fill=(225, 168, 100, 255), outline=(110, 68, 38, 160), width=6)
    d.polygon([(930, 145), (970, 58), (1005, 150)], fill=(199, 127, 70, 255))
    d.polygon([(1050, 150), (1115, 70), (1090, 175)], fill=(199, 127, 70, 255))
    d.ellipse([970, 215, 985, 230], fill=(20, 20, 20, 255))
    d.ellipse([1045, 215, 1060, 230], fill=(20, 20, 20, 255))
    d.arc([1000, 246, 1045, 290], 15, 170, fill=(50, 35, 25, 255), width=4)
    d.arc([320, 165, 555, 420], 110, 265, fill=(216, 152, 82, 255), width=32)
    for x in [560, 720, 880, 1000]:
        d.line([x, 400, x - 15, 530], fill=(135, 83, 47, 255), width=18)
    save(img, "animal-general.png")


def plant():
    img = canvas((228, 244, 255), (247, 250, 252))
    d = ImageDraw.Draw(img, "RGBA")
    d.rectangle([0, 430, W, H], fill=(112, 82, 52, 255))
    d.ellipse([1240, 70, 1390, 220], fill=(250, 211, 91, 255), outline=(226, 151, 35, 120), width=5)
    for off in [0, 35, 70]:
        d.line([1220, 180 + off, 790, 275 + off // 2], fill=(246, 190, 54, 100), width=7)
    d.line([665, 430, 690, 210], fill=(37, 104, 55, 255), width=22)
    for box, ang in [([470, 270, 680, 395], -20), ([675, 230, 930, 365], 18), ([575, 150, 810, 290], -10)]:
        d.ellipse(box, fill=(74, 172, 91, 255), outline=(24, 100, 50, 180), width=5)
    d.ellipse([600, 445, 760, 520], fill=(72, 51, 32, 255))
    save(img, "plant-light.png")


def human():
    img = canvas((232, 242, 255), (248, 250, 252))
    d = ImageDraw.Draw(img, "RGBA")
    d.rectangle([0, 410, W, H], fill=(220, 226, 233, 255))
    d.ellipse([675, 92, 825, 242], fill=(222, 164, 124, 255), outline=(126, 81, 58, 120), width=4)
    d.rectangle([600, 245, 900, 470], fill=(143, 25, 58, 255), outline=(83, 15, 35, 180), width=5)
    d.line([620, 280, 460, 360], fill=(222, 164, 124, 255), width=35)
    d.line([880, 280, 1045, 360], fill=(222, 164, 124, 255), width=35)
    d.rounded_rectangle([410, 325, 545, 405], radius=18, fill=(245, 220, 177, 255), outline=(180, 95, 55, 180), width=4)
    d.ellipse([715, 155, 730, 170], fill=(25, 25, 28, 255))
    d.ellipse([775, 155, 790, 170], fill=(25, 25, 28, 255))
    d.arc([720, 178, 795, 220], 15, 165, fill=(70, 35, 34, 255), width=4)
    d.line([650, 470, 620, 560], fill=(39, 57, 90, 255), width=45)
    d.line([845, 470, 875, 560], fill=(39, 57, 90, 255), width=45)
    save(img, "human-response.png")


def circuit():
    img = canvas((240, 247, 255), (250, 250, 250))
    d = ImageDraw.Draw(img, "RGBA")
    d.rounded_rectangle([160, 205, 420, 335], radius=24, fill=(248, 217, 112, 255), outline=(126, 73, 18, 200), width=7)
    d.ellipse([1130, 205, 1295, 370], fill=(253, 229, 116, 255), outline=(180, 108, 20, 220), width=8)
    d.ellipse([1175, 250, 1250, 325], fill=(255, 249, 196, 255))
    d.line([420, 270, 650, 270, 650, 180, 850, 180], fill=(50, 65, 82, 255), width=12)
    d.line([935, 180, 1130, 270], fill=(50, 65, 82, 255), width=12)
    d.line([1215, 370, 1215, 500, 280, 500, 280, 335], fill=(50, 65, 82, 255), width=12)
    d.rounded_rectangle([850, 154, 940, 206], radius=12, fill=(230, 236, 244, 255), outline=(51, 65, 85, 200), width=5)
    d.line([865, 180, 925, 180], fill=(31, 151, 78, 255), width=8)
    save(img, "circuit-electric.png")


def magnet():
    img = canvas((235, 243, 255), (250, 250, 252))
    d = ImageDraw.Draw(img, "RGBA")
    d.rounded_rectangle([390, 130, 565, 440], radius=45, fill=(220, 38, 38, 255), outline=(127, 29, 29, 180), width=7)
    d.rounded_rectangle([565, 130, 740, 440], radius=45, fill=(37, 99, 235, 255), outline=(29, 78, 216, 180), width=7)
    d.rectangle([480, 210, 650, 450], fill=(245, 247, 250, 255))
    for x, y in [(870, 225), (980, 310), (820, 390), (1040, 430)]:
        d.rounded_rectangle([x, y, x + 90, y + 36], radius=8, fill=(139, 151, 166, 255), outline=(51, 65, 85, 180), width=3)
        d.line([740, 285, x, y + 18], fill=(138, 21, 56, 120), width=3)
    save(img, "magnet-force.png")


def solar():
    img = canvas((15, 25, 50), (47, 65, 96))
    d = ImageDraw.Draw(img, "RGBA")
    for _ in range(160):
        x, y = random.randint(0, W), random.randint(0, H)
        d.ellipse([x, y, x + 2, y + 2], fill=(255, 255, 255, random.randint(80, 180)))
    d.ellipse([120, 180, 310, 370], fill=(252, 211, 77, 255))
    d.ellipse([660, 205, 850, 395], fill=(59, 130, 246, 255), outline=(147, 197, 253, 180), width=6)
    d.pieslice([690, 235, 820, 365], 210, 40, fill=(34, 197, 94, 210))
    d.ellipse([1165, 255, 1265, 355], fill=(203, 213, 225, 255))
    d.line([330, 260, 640, 285], fill=(250, 204, 21, 150), width=7)
    d.line([850, 300, 1165, 305], fill=(148, 163, 184, 140), width=4)
    save(img, "earth-moon-sun.png")


def water():
    img = canvas((221, 242, 253), (248, 250, 252))
    d = ImageDraw.Draw(img, "RGBA")
    d.rounded_rectangle([250, 180, 620, 480], radius=48, fill=(191, 219, 254, 255), outline=(37, 99, 235, 180), width=7)
    d.pieslice([285, 260, 585, 555], 180, 360, fill=(56, 189, 248, 220))
    for x in [820, 880, 940]:
        d.arc([x, 120, x + 120, 280], 120, 240, fill=(100, 116, 139, 150), width=8)
    d.rounded_rectangle([1050, 130, 1130, 430], radius=38, fill=(254, 226, 226, 255), outline=(190, 18, 60, 180), width=7)
    d.rectangle([1080, 245, 1100, 390], fill=(239, 68, 68, 255))
    d.ellipse([1060, 370, 1120, 430], fill=(239, 68, 68, 255))
    save(img, "water-temperature.png")


def materials():
    img = canvas((242, 246, 250), (255, 255, 255))
    d = ImageDraw.Draw(img, "RGBA")
    d.rounded_rectangle([260, 225, 470, 420], radius=24, fill=(154, 93, 45, 255), outline=(92, 53, 26, 180), width=6)
    d.rounded_rectangle([600, 180, 835, 430], radius=34, fill=(96, 165, 250, 255), outline=(37, 99, 235, 180), width=6)
    d.ellipse([995, 205, 1245, 455], fill=(203, 213, 225, 255), outline=(71, 85, 105, 180), width=6)
    for x in range(285, 455, 32):
        d.line([x, 230, x + 20, 415], fill=(111, 68, 38, 90), width=4)
    d.arc([1015, 220, 1235, 445], 0, 360, fill=(255, 255, 255, 120), width=4)
    save(img, "materials.png")


def main():
    random.seed(12)
    chicken()
    cat()
    crocodile()
    turtle()
    generic_animal()
    plant()
    human()
    circuit()
    magnet()
    solar()
    water()
    materials()
    print(f"Generated {len(list(OUT.glob('*.png')))} science raster assets in {OUT}")


if __name__ == "__main__":
    main()
