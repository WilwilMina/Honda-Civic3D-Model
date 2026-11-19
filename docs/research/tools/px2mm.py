"""Convert pixel positions measured on the side-view reference image into car coordinates (mm).

The reference (a 600x478 studio render of a 2013+ Civic LX sedan, driver side) is not included in this
repository, but the pixel coordinates measured on it are listed below, so this script reproduces the
[PHOTO] values in ../exterior-shape.md without the image. Method: ../exterior-shape.md, section 1.

Pinhole camera model, fitted to Honda's wheelbase and overall length:
    s   scale at the near wheel plane (px per mm)      D   camera distance from that plane (mm)
    xa  image x of the camera axis (px)                Xc  car x seen on the camera axis (mm)
    hc  camera height (mm)                             yh  image y of the horizon (px)
Output: x in mm rearward from the front bumper tip, z in mm above the ground.

Run:  python3 px2mm.py
"""
s, D, xa, Xc, hc, yh = 0.13843, 8000.0, 299.5, 2278.0, 1165.0, 172.8


def conv(x, y, dz):
    """Pixel (x, y) on a surface dz mm farther from the camera than the near wheels -> car (X, Z) in mm."""
    k = D / (D + dz)
    return Xc + (x - xa) / (s * k), hc - (y - yh) / (s * k)


# name, x_px, y_px, depth offset from the near wheel plane (mm)
pts = [
 ("front tip (silhouette)", 6, 290, 600),
 ("front bumper lower lip front", 12, 299, 450),
 ("bumper bottom under nose", 25, 303, 300),
 ("headlight front-lower tip", 21.7, 246.7, 250),
 ("headlight rear-upper tip", 70, 228, 100),
 ("hood leading edge (silhouette)", 30, 229, 1200),
 ("hood x=66", 66, 212, 1500),
 ("hood x=100 (~front axle)", 108.7, 201, 1500),
 ("hood x=136", 136, 198, 1500),
 ("cowl / windshield base (silhouette)", 148, 195, 1300),
 ("windshield x=186", 186, 180, 950),
 ("windshield x=226", 226, 162, 850),
 ("windshield x=256", 256, 150, 850),
 ("windshield top / roof front (curvature change)", 286, 144, 850),
 ("roof x=306", 306, 141, 850),
 ("roof peak start", 336, 139, 850),
 ("roof peak end", 366, 139, 850),
 ("roof x=396", 396, 142, 850),
 ("roof rear / rear glass top (approx)", 420, 144, 850),
 ("rear glass x=446", 446, 150, 850),
 ("rear glass x=476", 476, 161, 850),
 ("rear glass x=506", 506, 174, 850),
 ("rear glass base / deck front (curvature change)", 526, 181, 850),
 ("deck x=546", 546, 183, 850),
 ("deck rear lip (ducktail)", 566, 185, 850),
 ("trunk rear face below lip", 576, 200, 700),
 ("rear tip (silhouette, bumper)", 593, 257, 600),
 ("rear bumper lower rear corner", 580, 293, 400),
 ("rear bumper bottom at arch", 530, 295, 0),
 ("front wheel centre", 108.7, 292.5, 0),
 ("rear wheel centre", 478.3, 292.5, 0),
 ("front arch top", 110, 241, 0),
 ("rear arch top", 477, 242.5, 0),
 ("front arch front edge @ hub ht", 65, 273, 0),
 ("front arch rear edge @ hub ht", 160, 277, 0),
 ("beltline at front door front (mirror)", 186.7, 208, 100),
 ("beltline x=300 (B-pillar fwd)", 300, 198, 120),
 ("beltline at B-pillar rear x=347", 347, 193.3, 120),
 ("beltline at DLO rear tip", 467, 191.7, 120),
 ("DLO top at B-pillar", 300, 163, 300),
 ("DLO top rear door front", 347, 161.7, 300),
 ("A-pillar base black trim front", 148, 197, 200),
 ("front door leading edge top", 176.7, 210, 50),
 ("B-pillar centre", 340, 175, 150),
 ("taillight top-front", 545, 195, 300),
 ("taillight rear-lower", 578, 223, 450),
 ("rear bumper top cut line rear", 566.7, 236.7, 200),
 ("rear bumper rearmost pt", 593, 256.7, 600),
]
for n, x, y, dz in pts:
    X, Z = conv(x, y, dz)
    print(f"{n:48s} x={X:7.0f}  z={Z:6.0f}")
