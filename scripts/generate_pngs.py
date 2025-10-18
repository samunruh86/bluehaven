import math, os, zlib, struct

OUTPUT_DIR = 'assets/media'

class Image:
    def __init__(self, width, height, bg=(0,0,0,0)):
        self.width = width
        self.height = height
        r,g,b,a = bg
        self.pixels = [[[r,g,b,a] for _ in range(width)] for _ in range(height)]

    def blend_pixel(self, x, y, color):
        if not (0 <= x < self.width and 0 <= y < self.height):
            return
        sr, sg, sb, sa = color
        dr, dg, db, da = self.pixels[y][x]
        sa /= 255.0
        da /= 255.0
        out_a = sa + da * (1 - sa)
        if out_a == 0:
            self.pixels[y][x] = [0,0,0,0]
            return
        out_r = (sr/255.0*sa + dr/255.0*da*(1-sa)) / out_a
        out_g = (sg/255.0*sa + dg/255.0*da*(1-sa)) / out_a
        out_b = (sb/255.0*sa + db/255.0*da*(1-sa)) / out_a
        self.pixels[y][x] = [int(out_r*255+0.5), int(out_g*255+0.5), int(out_b*255+0.5), int(out_a*255+0.5)]

    def fill_rect(self, x0, y0, x1, y1, color):
        for y in range(max(0,int(y0)), min(self.height,int(y1))):
            for x in range(max(0,int(x0)), min(self.width,int(x1))):
                self.pixels[y][x] = list(color)

    def blend_rect(self, x0, y0, x1, y1, color):
        for y in range(max(0,int(y0)), min(self.height,int(y1))):
            for x in range(max(0,int(x0)), min(self.width,int(x1))):
                self.blend_pixel(x, y, color)

    def draw_gradient(self, top_color, bottom_color):
        tr,tg,tb,ta = top_color
        br,bg,bb,ba = bottom_color
        for y in range(self.height):
            t = y/(self.height-1)
            r = int(tr + (br-tr)*t)
            g = int(tg + (bg-tg)*t)
            b = int(tb + (bb-tb)*t)
            a = int(ta + (ba-ta)*t)
            for x in range(self.width):
                self.pixels[y][x] = [r,g,b,a]

    def draw_ellipse(self, cx, cy, rx, ry, color, feather=0):
        rx = float(rx)
        ry = float(ry)
        for y in range(int(cy-ry-1), int(cy+ry+2)):
            if y < 0 or y >= self.height:
                continue
            for x in range(int(cx-rx-1), int(cx+rx+2)):
                if x < 0 or x >= self.width:
                    continue
                dx = (x+0.5 - cx) / rx
                dy = (y+0.5 - cy) / ry
                dist = dx*dx + dy*dy
                if dist <= 1:
                    self.blend_pixel(x, y, color)
                elif feather > 0 and dist <= 1 + feather:
                    alpha = max(0.0, 1 - (dist-1)/feather)
                    r,g,b,a = color
                    self.blend_pixel(x, y, (r,g,b,int(a*alpha)))

    def draw_polygon(self, points, color):
        if not points:
            return
        min_y = max(0, math.floor(min(p[1] for p in points)))
        max_y = min(self.height-1, math.ceil(max(p[1] for p in points)))
        for y in range(min_y, max_y+1):
            xs = []
            for i in range(len(points)):
                x1,y1 = points[i]
                x2,y2 = points[(i+1)%len(points)]
                if y1 == y2:
                    continue
                if (y >= min(y1,y2)) and (y < max(y1,y2)):
                    t = (y - y1) / (y2 - y1)
                    xs.append(x1 + t*(x2 - x1))
            xs.sort()
            for i in range(0, len(xs), 2):
                if i+1 >= len(xs):
                    break
                x_start = max(0, math.floor(xs[i]))
                x_end = min(self.width-1, math.ceil(xs[i+1]))
                for x in range(x_start, x_end+1):
                    self.pixels[y][x] = list(color)

    def draw_ring(self, cx, cy, radius, thickness, color):
        outer = radius
        inner = radius - thickness
        for y in range(int(cy-outer-1), int(cy+outer+2)):
            if y < 0 or y >= self.height:
                continue
            for x in range(int(cx-outer-1), int(cx+outer+2)):
                if x < 0 or x >= self.width:
                    continue
                d = math.hypot(x+0.5-cx, y+0.5-cy)
                if inner <= d <= outer:
                    self.blend_pixel(x, y, color)

    def save(self, path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'wb') as f:
            f.write(b'\x89PNG\r\n\x1a\n')
            def chunk(tag, data):
                return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)
            ihdr = struct.pack('>IIBBBBB', self.width, self.height, 8, 6, 0, 0, 0)
            f.write(chunk(b'IHDR', ihdr))
            raw = bytearray()
            for row in self.pixels:
                raw.append(0)
                for r,g,b,a in row:
                    raw.extend([r, g, b, a])
            comp = zlib.compress(bytes(raw), 9)
            f.write(chunk(b'IDAT', comp))
            f.write(chunk(b'IEND', b''))


def make_hero():
    img = Image(900, 700, (0,0,0,0))
    img.draw_gradient((233,240,254,255), (207,223,248,255))
    img.draw_ring(610, 180, 90, 12, (38,85,155,120))
    img.draw_ellipse(450, 520, 180, 40, (30,60,110,45))
    front = [(320,280),(530,230),(650,280),(650,500),(320,560)]
    side = [(530,230),(700,270),(700,520),(650,500),(650,280)]
    img.draw_polygon(front, (243,210,167,255))
    img.draw_polygon(side, (221,178,124,255))
    top = [(320,280),(530,230),(700,270),(490,320)]
    img.draw_polygon(top, (252,226,191,255))
    for t in range(0, 160):
        angle = math.pi * (t/160)
        x = 400 + math.cos(angle) * 100
        y = 420 + math.sin(angle) * 50
        img.draw_ellipse(x, y, 6, 6, (28,54,96,200))
    for dy in range(0, 80):
        img.draw_ellipse(480, 260-dy, 6, 10, (108,170,130,255))
    img.draw_ellipse(520, 200, 60, 36, (151,195,145,255))
    img.draw_ellipse(440, 220, 64, 38, (120,175,124,255))
    img.save(os.path.join(OUTPUT_DIR, 'hero-illustration.png'))


def make_panel_protect():
    img = Image(700, 480, (0,0,0,0))
    img.draw_gradient((241,247,255,255), (212,228,249,255))
    img.draw_ellipse(350, 400, 220, 38, (52,94,160,35))
    front = [(190,230),(360,190),(490,230),(490,380),(190,430)]
    side = [(360,190),(540,220),(540,400),(490,380),(490,230)]
    img.draw_polygon(front, (243,209,166,255))
    img.draw_polygon(side, (220,177,126,255))
    top = [(190,230),(360,190),(540,220),(360,260)]
    img.draw_polygon(top, (252,226,191,255))
    for r in range(0, 70):
        alpha = max(0, 220 - r*3)
        img.draw_ellipse(430, 240, 58-r/2, 74-r/2, (33,74,133,alpha))
    for t in range(60):
        img.draw_ellipse(408 + t*0.45, 245 + t*0.35, 5, 5, (255,255,255,255))
    for t in range(60):
        img.draw_ellipse(435 + t*0.55, 265 - t*0.45, 5, 5, (255,255,255,255))
    img.draw_ring(220, 155, 70, 10, (39,90,160,160))
    img.save(os.path.join(OUTPUT_DIR, 'panel-protect.png'))


def make_panel_ops():
    img = Image(700, 480, (0,0,0,0))
    img.draw_gradient((242,248,255,255), (215,230,249,255))
    img.draw_ellipse(350, 400, 220, 38, (52,94,160,35))
    front = [(210,230),(380,190),(510,230),(510,380),(210,430)]
    side = [(380,190),(560,220),(560,400),(510,380),(510,230)]
    img.draw_polygon(front, (243,209,166,255))
    img.draw_polygon(side, (220,177,126,255))
    top = [(210,230),(380,190),(560,220),(380,260)]
    img.draw_polygon(top, (252,226,191,255))
    colors = [(66,119,196,255),(56,105,174,255),(41,86,148,255)]
    heights = [90, 140, 190]
    for i, h in enumerate(heights):
        x0 = 100 + i*70
        img.fill_rect(x0, 360-h, x0+44, 360, colors[i])
        img.blend_rect(x0, 360-h, x0+44, 360-h+6, (255,255,255,45))
    for t in range(140):
        x = 360 + t
        y = int(340 - 0.2*t + 12*math.sin(t/25))
        img.draw_ellipse(x, y, 4, 4, (39,90,160,255))
    for t in range(40):
        img.draw_ellipse(500 + t, 312 - t*0.6, 4, 4, (39,90,160,255))
    for t in range(20):
        img.draw_ellipse(540 + t, 288 + t, 4, 4, (39,90,160,255))
    img.save(os.path.join(OUTPUT_DIR, 'panel-ops.png'))


def make_icon(name, draw_fn):
    img = Image(160, 160, (0,0,0,0))
    img.draw_gradient((233,241,255,255), (207,223,248,255))
    draw_fn(img)
    img.save(os.path.join(OUTPUT_DIR, f'{name}.png'))


def icon_collaboration(img: Image):
    img.draw_ring(80, 80, 68, 10, (36,83,150,40))
    for t in range(0, 140):
        angle = math.pi * (0.2 + 0.6 * t/140)
        x = 80 + math.cos(angle)*45
        y = 86 + math.sin(angle)*35
        img.draw_ellipse(x, y, 5, 5, (36,83,150,240))
    for t in range(0, 120):
        angle = math.pi * (1.0 + 0.6 * t/120)
        x = 82 + math.cos(angle)*44
        y = 88 + math.sin(angle)*32
        img.draw_ellipse(x, y, 5, 5, (36,83,150,200))


def icon_shield(img: Image):
    for r in range(0, 60):
        alpha = max(0, 230 - r*4)
        img.draw_ellipse(80, 70, 50-r/2, 62-r/2, (36,83,150,alpha))
    for t in range(60):
        img.draw_ellipse(68 + t*0.5, 78 + t*0.4, 4.5, 4.5, (255,255,255,255))
    for t in range(55):
        img.draw_ellipse(92 + t*0.5, 97 - t*0.45, 4.5, 4.5, (255,255,255,255))


def icon_payments(img: Image):
    img.fill_rect(46, 70, 114, 120, (255,255,255,255))
    img.blend_rect(46, 70, 114, 120, (36,83,150,25))
    img.fill_rect(46, 78, 114, 92, (213,228,249,255))
    img.fill_rect(52, 96, 84, 106, (36,83,150,220))
    img.fill_rect(88, 96, 110, 106, (36,83,150,150))
    img.fill_rect(62, 110, 104, 118, (36,83,150,190))
    for r in range(0, 28):
        img.draw_ellipse(120, 64, 26-r*0.6, 26-r*0.6, (247,209,104, max(0, 230 - r*6)))
    img.draw_ring(120, 64, 24, 6, (148,104,30,160))


def icon_replenish(img: Image):
    img.fill_rect(54, 110, 72, 140, (41,86,148,255))
    img.fill_rect(80, 92, 98, 140, (56,105,174,255))
    img.fill_rect(106, 74, 124, 140, (66,119,196,255))
    for t in range(110):
        x = 60 + t
        y = int(110 - 0.33*t)
        img.draw_ellipse(x, y, 3.5, 3.5, (39,90,160,255))
    for t in range(20):
        img.draw_ellipse(146 + t, 74 - t, 3.5, 3.5, (39,90,160,255))
    for t in range(20):
        img.draw_ellipse(160 + t, 58 + t, 3.5, 3.5, (39,90,160,255))


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    make_hero()
    make_panel_protect()
    make_panel_ops()
    make_icon('icon-collaboration', icon_collaboration)
    make_icon('icon-shield', icon_shield)
    make_icon('icon-payments', icon_payments)
    make_icon('icon-replenish', icon_replenish)

if __name__ == '__main__':
    main()
