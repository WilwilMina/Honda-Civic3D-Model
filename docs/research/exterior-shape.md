# 2013 Honda Civic LX Sedan (9th gen FB2, US): Exterior Body SHAPE Specification

This file gives a modeler the shape data needed to rebuild the body. Read it together with `exterior.md` (official dimensions, lights, paint, wheels).

**Coordinates used throughout:**
- **x**: mm rearward from the most forward point of the front bumper (x = 0 at the nose, 4556 at the rear bumper)
- **z**: mm above the ground (unladen car)
- **y**: mm from the car's centreline, positive to the left (driver side)

**Tags:**
- **[HONDA]**: Honda document
- **[NHTSA]**: measured by NHTSA crash-test labs
- **[PHOTO]**: measured from the side-view reference image (a studio render of a 2013+ LX, driver side) using the camera model in §1. The reference photos are press and dealer images and are **not included** in this repository. Expected error is about ±25 mm in z and about ±35 mm in x.
- **[EST]**: judgement, with the method given
- **[DERIVED]**: arithmetic from sourced values

---

## 0. Headline numbers (use these first)

| Item | Value | Tag |
|---|---|---|
| Length / width / height / wheelbase | 4556 / 1752 / 1435 / 2670 | HONDA ([hn13], [hnca13]) |
| Track, front / rear | 1499 / 1522 | HONDA |
| **Front overhang** | **≈ 900 mm** (0.337 × wheelbase) | PHOTO; cross-checked in §2 |
| **Rear overhang** | **≈ 986 mm** (0.369 × wheelbase) | PHOTO; constrained by HONDA total of 1886 |
| Front wheel centre | x ≈ 900, z ≈ 300 | PHOTO + tire calc |
| Rear wheel centre | x ≈ 3570, z ≈ 300 | DERIVED |
| Hood leading-edge height | ≈ 700 | PHOTO (698). NHTSA measured 680 on the 2013 coupe, which has the older and lower 2012-style hood ([nh-coupe-front]). Honda says the 2013 sedan hood is "taller" ([conceptcarz]) |
| Hood height at front axle | ≈ 920 | PHOTO |
| Cowl / windshield base (centreline) | x ≈ 1050, z ≈ 980 | PHOTO |
| Windshield rake | ≈ **23°** from horizontal (≈ 67° from vertical) | PHOTO |
| Roof peak | z = 1435 over x ≈ 2570–2810 (just ahead of the B-pillar through the front of the rear door) | HONDA height, PHOTO position |
| Rear-glass slope | ≈ **22–24°** from horizontal in its middle; about 19° averaged from roof to deck | PHOTO |
| Trunk deck | front x ≈ 4090, z ≈ 1100; ducktail lip x ≈ 4410, z ≈ 1070 | PHOTO |
| Rear bumper rearmost point | x = 4556, z ≈ 510 | HONDA x, PHOTO z |
| Beltline (glass sill) | z ≈ 910 at the mirror, ≈ 990 at the B-pillar, ≈ 1025 at the rear tip of the side glass | PHOTO |
| Side-glass top (DLO top) | z ≈ 1240–1250 around the B-pillar. The black frame above it reaches about z 1335 | PHOTO |
| Wheel-arch lip top | front z ≈ 670, rear z ≈ 660. Opening radius ≈ 360–380 | PHOTO |
| Ground clearance | 157 unladen | HONDA ([hnca13]) |

---

## 1. Method: how the side-view reference was measured

The side-view reference is a 600×478-pixel studio render of a 2013+ LX with wheel covers, driver side. It is close to a side elevation but has perspective. Taking its pixels at face value gives a length/wheelbase ratio of 1.587, against 1.706 for the real car. If the photo is scaled by its wheelbase, the bumpers come out about 300 mm too short in total. The bumper tips are about 0.6 m farther from the camera than the near-side wheels, so they appear compressed toward the image centre.

Pixel coordinates were read off the image by tracing the car's outline against the white studio background column by column, and by finding the runs of dark tire pixels row by row to locate the wheels.

**Camera model** (pinhole; the script [`tools/px2mm.py`](tools/px2mm.py) holds the measured pixel coordinates and reproduces the tables below without the image):
- **Scale at the near wheel plane:** wheel centres at px (108.7, 292.5) and (478.3, 292.5) give 369.6 px for 2670 mm, so s = 0.1384 px/mm (7.22 mm/px). The tire outline is ≈ 90 px wide, which is ≈ 650 mm and matches the computed 634.5 mm.
- **Horizontal fit:** nose silhouette at x = 6 px, tail at x = 593 px. Assuming the camera is centred on the car's mid-length, the fitted image centre lands at **299.5 px**, which is the true image centre (300) and supports that assumption. The tips then project with a factor k = 0.931, so the camera is ≈ 8 m from the wheel plane. Result: **front overhang 900 mm, rear overhang 986 mm.**
- **Vertical fit:** ground at y ≈ 334 px; roof crown (1435 mm, about 850 mm farther from the camera than the wheel plane) at y = 139 px. This gives camera height ≈ 1165 mm and horizon at y ≈ 172.8 px.
- **Converting points:** each point is converted with a depth offset matched to the surface it lies on:
  - 0–120 mm for side-surface features (beltline, arches, door cuts)
  - about 850 mm for centreline silhouette features (roof, windshield, rear glass, deck)
  - about 1500 mm for the hood outline. The camera is above the hood, so the top edge of the hood in the image is the far-side fender crown.
- **Sensitivity:** changing the depth offsets by ±250 mm moves heights by about ±15 mm and x by about ±30 mm.

Checks against independent data:
- Hood leading edge 698 mm (NHTSA coupe: 680 mm with the lower 2012 hood).
- Wheel centre z = 300 (tire calculation: ≈ 305).
- Front overhang 900 mm (NHTSA coupe with the 2012 front end: 885–887 mm).
- Total overhang 1886 mm (Honda). All agree.

---

## 2. Overhang cross-checks (sourced)

- **NHTSA 2013 Civic LX *coupe*, frontal NCAP test** ([nh-coupe-front]). The coupe shares the hood, front fenders and headlights with the 2012 sedan per Honda ([hn12ov]). Pre-test measurements:
  - Front bumper to front axle **885 mm**; front axle to A-pillar **475**; A-pillar to B-pillar 1238 (coupe's long door)
  - Bumper top **555**, bumper bottom **279**; bonnet leading edge **680**
  - Roof sill top 1355 (coupe height 1398); floor sill bottom / top **188 / 330**; total width 1740 [NHTSA]
- **NHTSA 2013 Civic LX coupe, side NCAP test** ([nh-coupe-side]):
  - Front axle to front of vehicle **887**; rear axle to rear of vehicle 939
  - Front bumper bottom to ground 276; rear bumper bottom to ground **323**
  - Sill height at front wheel well 199, at B-pillar 199
  - Window sill **867** and window top 1319 above ground (at the impact zone)
  - Width at B-pillar **1754** [NHTSA]
- **Sedan 2012 → 2013:** length grew 177.3 → 179.4 in (4503 → 4556, **+53 mm**) with the same wheelbase. All of the growth is in the new fascias, hood and trunk lid ([hn12], [hn13], [conceptcarz]).
  - If the 2012 sedan's front overhang matched the coupe (≈ 885 mm, shared fenders and hood), its rear overhang was ≈ 948.
  - The photo result (900 / 986) means 2013 added ≈ +15 mm at the front and ≈ +38 mm at the rear. That fits the visibly bulkier 2013 rear bumper. [DERIVED]
- **10th-gen comparison:** Honda says the 2016 sedan has a "1.4-inch shorter front overhang" and a "2.9-inch longer rear overhang" than the 2015 car ([hn16body]). With the 2016 length of 4631 and wheelbase of 2700 ([hc16spec]), its total overhang is 1931. Applying Honda's deltas to the 900 / 986 measured here gives 864 / 1060, which sums to 1924. That is within 7 mm of 1931, so the split is consistent. [DERIVED]
- **No NHTSA report for the 2012–15 *sedan*** could be located. Its vehdb report number could not be found. The 2013 sedan's NCAP frontal rating changed from 2012 (5 → 4 stars, [nhtsa-api-7525] vs [nhtsa-api-6089]), so a 2013 sedan report probably exists in NHTSA's database (search "Civic" at the NHTSA Vehicle Crash Test Database).

---

## 3. SIDE-PROFILE KEY POINTS (top silhouette, centreline unless noted)

| # | Point | x (mm) | z (mm) | Tag / note |
|---|---|---|---|---|
| P1 | Front bumper, most forward point | 0 | ≈ 255–290 | PHOTO. The nose is low and rounded. The forward-most point sits low, in the lower fascia/intake area, below the headlight line |
| P2 | Front bumper lower lip, front | ≈ 85 | ≈ 200 | PHOTO |
| P3 | Front underside (air dam) | ≈ 220 | ≈ 190 | PHOTO. Ground clearance is 157 elsewhere |
| P4 | Bumper top / headlight front-lower tip | ≈ 210 | ≈ 615 | PHOTO |
| P5 | Hood leading edge (top of grille, centre) | ≈ 40–60 | ≈ 700 | PHOTO. NHTSA coupe: 680 |
| P6 | Hood, x = 275 | 275 | ≈ 830 | PHOTO. The nose rounds over strongly in the first 300 mm |
| P7 | Hood at front axle | 900 | ≈ 925 | PHOTO |
| P8 | Hood rear / cowl / windshield base | ≈ 1050 | ≈ 980 | PHOTO. Very short dash-to-axle (≈ 150 mm). Honda moved the A-pillars forward ([hn12ov]) |
| P9 | Windshield, x = 1360 | 1360 | ≈ 1105 | PHOTO |
| P10 | Windshield, x = 1690 | 1690 | ≈ 1250 | PHOTO |
| P11 | Windshield, x = 1930 | 1930 | ≈ 1345 | PHOTO |
| P12 | Windshield top / roof header | ≈ 2150 | ≈ 1395 | PHOTO. The windshield curves into the roof with no visible break (one arc) |
| P13 | Roof, x = 2330 | 2330 | ≈ 1420 | PHOTO |
| P14 | **Roof peak** (flat to ±3 mm) | 2570 → 2810 | **1435** | HONDA z / PHOTO x. B-pillar centre is at x ≈ 2580, so the peak is at the B-pillar and the front of the rear door |
| P15 | Roof, x = 3050 | 3050 | ≈ 1410 | PHOTO |
| P16 | Roof rear / rear-glass top (approx.) | ≈ 3200–3250 | ≈ 1395 | PHOTO; EST where the glass starts |
| P17 | Rear glass, x = 3450 | 3450 | ≈ 1345 | PHOTO |
| P18 | Rear glass, x = 3690 | 3690 | ≈ 1260 | PHOTO |
| P19 | Rear glass, x = 3930 | 3930 | ≈ 1155 | PHOTO |
| P20 | Rear-glass base / deck front | ≈ 4090 | ≈ 1100 | PHOTO |
| P21 | Deck, x = 4250 | 4250 | ≈ 1085 | PHOTO. The deck is short and nearly flat, sloping down slightly toward the rear |
| P22 | **Trunk-lid ducktail lip** (rear edge of deck) | ≈ 4410 | ≈ 1070 | PHOTO. Slight kick-up lip, integrated in the lid |
| P23 | Trunk rear face, below the lip | ≈ 4450 | ≈ 950 | PHOTO. The face drops nearly vertically, leaning back about 10–15° |
| P24 | Taillight top-front corner (on the quarter panel) | ≈ 4120 | ≈ 1000 | PHOTO |
| P25 | Taillight rear-lower corner | ≈ 4400 | ≈ 780 | PHOTO |
| P26 | Rear bumper top cut line, at the rear | ≈ 4255 | ≈ 690 | PHOTO |
| P27 | **Rear bumper, most rearward point** | 4556 | ≈ 510 | HONDA x / PHOTO z |
| P28 | Rear bumper lower rear corner | ≈ 4405 | ≈ 255 | PHOTO. NHTSA coupe rear bumper bottom: 323 (different bumper) |
| P29 | Rear bumper bottom, just behind the rear arch | ≈ 3945 | ≈ 280 | PHOTO |

Derived shape facts:
- **Windshield length** (cowl to header): ≈ 1180 mm along the slope [DERIVED].
- **Hood length** (leading edge to cowl, centreline): ≈ 1000 mm.
- **Trunk deck length**, glass base to lip: ≈ 320 mm horizontal. Plus a ≈ 150 mm rear bumper projection behind the lip.
- **Roof flat zone:** only ≈ 240 mm is within 3 mm of the peak. The roof is one continuous arc. Falling 40 mm from the peak takes ≈ 650 mm forward and ≈ 450 mm rearward.

### Side features (on the body side surface, about y = ±840 to 876)

| Feature | x | z | Tag |
|---|---|---|---|
| Front wheel centre | 900 | 300 | PHOTO (tire calc: 305 static) |
| Rear wheel centre | 3570 | 300 | DERIVED |
| Front arch lip, top | ≈ 910 | ≈ 670 | PHOTO |
| Front arch, front edge at hub height | ≈ 585 | ≈ 440 | PHOTO. Measured radius ≈ 315 to the front and ≈ 370 to the rear. The arch is slightly egg-shaped, opening wider to the rear; use radius ≈ 360–370 centred ≈ 10–20 mm above the hub |
| Front arch, rear edge at hub height | ≈ 1270 | ≈ 410 | PHOTO |
| Rear arch lip, top | ≈ 3560 | ≈ 660 | PHOTO. Radius ≈ 360 |
| Rocker / sill bottom | — | ≈ 190–200 | NHTSA coupe sill 188–199 (same floor). The sill top is ≈ 330 |
| Front door leading edge (top of cut line) | ≈ 1385 | ≈ 895 | PHOTO |
| Black A-pillar-base trim triangle | x ≈ 1160 → 1385, below the beltline | z ≈ 985 → 1100 | PHOTO + HONDA text ([hn12ov]) |
| Mirror (door-mounted, at the front corner of the front glass) | ≈ 1450–1760 | ≈ 990–1230 | PHOTO (px 205–248, 185–218) |
| B-pillar (black appliqué) centre | ≈ 2580 | — | PHOTO |
| Rear door rear cut line | top ≈ 3470 at z ≈ 1025, curving down and forward around the arch to ≈ 3330 at z ≈ 700 | PHOTO, approx. |
| Fuel door (round, ≈ 130 mm diameter) | centre ≈ 3640 | ≈ 895 | PHOTO. **Driver (left) rear quarter.** Seen on the driver side both in the side-view render and in a real dealer photo that is not mirrored. This agrees with the Hybrid sedan manual cited in exterior.md |
| Door handles (horizontal pull type, near the rear edge of each door) | front ≈ 2350, rear ≈ 3270 | front ≈ 840, rear ≈ 895. The handles follow the rising shoulder line | PHOTO |

### Beltline (bottom edge of the side glass, the "DLO sill")

| Location | x | z |
|---|---|---|
| Front of front door (at the mirror) | ≈ 1450 | ≈ 910 |
| Mid front door | ≈ 1850 | ≈ 950 |
| Front of B-pillar | ≈ 2280 | ≈ 985–995 |
| Rear of B-pillar | ≈ 2630 | ≈ 1010 |
| Rear tip of the side glass (end of the quarter glass) | ≈ 3500 | ≈ 1025 |

All values are [PHOTO]. The beltline **rises ≈ 80 mm across the front door, then is almost flat** (+30 mm) along the rear door. Honda: "the front part of the beltline has been lowered to increase forward visibility" ([hn12ov]).

The side-glass outline (DLO) is a long, low teardrop: its top is z ≈ 1240–1250 at the B-pillar, and it closes to a sharp point at the rear, x ≈ 3500, z ≈ 1025.

The rear door glass is split. A movable pane is followed by a fixed triangular quarter glass at x ≈ 3150–3500, which appears dark because of interior shadow. Above the glass, a black frame/drip band about 90 mm tall runs up to the painted roof side at z ≈ 1335. Honda says the "sharp cutoff" of the rear side glass "pulls the entire upper window line further back" ([hn12ov]).

### Character lines ([hn12ov], [hrd-tr], side-view reference)

- **Shoulder line:** a crisp line runs from the top rear of the headlight (x ≈ 600, z ≈ 760) back along the fender. Under the windows it sits at about z ≈ 900 at the front door and rises to about z ≈ 1000 at the top of the taillight (x ≈ 4120). Above the rear wheel it "broadens into a deep shoulder line with clearly delineated, sharp edges" ([hn12ov]).
- **Lower character line:** Honda describes one character line running the full length of the side, with a slight kink near the rear ([hn12ov]). In the side view it starts low on the front door (z ≈ 400 at x ≈ 1400). It rises gently to z ≈ 480 by the rear door's rear edge, then kicks up toward the top of the rear arch. Below it, the rocker surface turns under.
- **Fenders:** both front and rear fenders "bulge out" ([hn12ov]). The side surface twists and projects outward from the shoulder line to the rear fender ([hrd-tr]).

---

## 4. PLAN VIEW (half-widths |y| are given as full widths; mm)

| Station | x | Width | Tag / method |
|---|---|---|---|
| Front bumper face | 0–100 | ≈ 1200 at x = 50, widening quickly | EST from front reference photos. The nose is a rounded "soft teardrop" in plan; the bumper corners "project outward for a wider look" ([hrd-tr]) |
| Front bumper corners / headlight outer | ≈ 350 | ≈ 1700 | EST (front three-quarter reference: outer headlight span ≈ 0.97 of body width) |
| Front axle (fender over the wheel) | 900 | **1752** (max) | HONDA width. Tires at ±749.5 tread centre; outer sidewall ≈ ±847 |
| A-pillar base / cowl | ≈ 1250 | ≈ 1740 body; ≈ 1440 glass at windshield base | PHOTO, front three-quarter reference, ratio 390/498 × 1752, perspective +5% |
| Windshield header | ≈ 2150 | ≈ 1100 (glass top width) | PHOTO, front three-quarter reference, ratio 290/498 × 1752, +8% perspective — EST |
| B-pillar | ≈ 2600 | **1754** at the body | NHTSA coupe side test (same platform width) |
| Roof crown at the B-pillar | ≈ 2600 | painted roof ≈ 1180–1250 wide between drip rails; crown flat zone ≈ 800 | EST from front and rear reference photos |
| Rear axle (rear fender) | 3570 | ≈ 1750 | EST. The rear fenders bulge as much as the front |
| Rear glass base | ≈ 4090 | ≈ 1300 | PHOTO, rear reference, ratio 280/414 × 1752, +10% perspective — EST |
| Rear glass top / roof rear | ≈ 3220 | ≈ 880–900 | PHOTO, rear reference, ratio 190/414 — EST |
| Taillights (outer, on the quarter) | ≈ 4200–4400 | ≈ 1752 → 1700 | PHOTO, rear reference (the lamps run to the body edge) |
| Rear bumper face | 4500–4556 | ≈ 1650 at x = 4450, rounding to ≈ 1300 at the very rear | EST. The rear bumper corners also project outward ([hrd-tr]) |
| Mirrors (unfolded) | ≈ 1600 | ≈ 2000 total | EST. Not published for the 9th gen; 10th gen is 2076 ([hc16spec]) |

**Tumblehome (front/rear section):**
- Body side at maximum is 1752 at about z 650–700, the shoulder/arch-top height.
- At the beltline (z ≈ 990) the body has tucked in to ≈ 1640–1660.
- The side glass then leans in ≈ **25° (±4°) from vertical**, to a roof-rail width of ≈ 1260 at z ≈ 1335.
- The roof crown rises a further ≈ 100 mm to 1435.

The section narrows strongly from shoulder to roof: the body is clearly wider than the cabin. Honda says the interior width was gained by thinning the door linings, not by a wider roof ([hrd-tr]).

---

## 5. FRONT VIEW / FRONT DETAILS (2013 refresh, LX)

Heights are [PHOTO] from the side-view reference. Widths are ratios from a front three-quarter reference photo; that car is an EX with a moonroof and the camera is elevated, so its heights are not used.

- **Hood:** "new taller, more deeply faceted hood" ([conceptcarz], [netcar]). Two shallow creases run from the inner headlight corners back toward the windshield, forming a slight raised centre panel. The leading edge is ≈ 700 high and wraps down into the grille.
- **Headlights:**
  - Swept-back multi-reflector units. In side view the lower front tip is at x ≈ 210, z ≈ 615; the upper rear tip is at x ≈ 600, z ≈ 760.
  - The lamps run back and up along the top of the fender toward the hood/fender seam.
  - Each lamp's front tip sits outboard, next to the grille ends. Viewed from the front they form a horizontal band with the grille ([hrd-tr]: "a horizontal line joins the grille and headlights").
  - Clear-lens corner sections hold the amber-bulb turn/park lamp ([conceptcarz]).
  - Headlamp housing is shared across 2012–15 sedans ([auxito-hl], in exterior.md).
- **Upper grille:**
  - Black honeycomb mesh, trapezoid-like and wider at the top (front reference ≈ 0.46 × body width ≈ **810 mm** across).
  - A thin **chrome bar arcs across the top** from headlight to headlight and turns down at the ends ("smile"/U shape) ([wiki9]).
  - H badge in the centre of the mesh. The grille is ≈ 120 mm tall.
- **Lower bumper:**
  - "Open-mouth lower bumper with a horizontal chrome accent" ([conceptcarz]). A wide black intake spans ≈ 0.85–0.9 × body width, with a thin chrome strip running across it.
  - Black corner bezels sit in the outer ends: fog-lamp blanks on the LX, since fogs are EX-L only ([hn13]).
  - Bumper bottom ≈ 200 at the front, rising slightly at the corners.
- **2012 front, for contrast:** a three-bar grille, a lower hood and a closed lower bumper. Do not model these.

## 6. REAR VIEW / REAR DETAILS (2013 refresh)

- **Taillights:**
  - Two-piece "jewel-like" wedge clusters ([conceptcarz]).
  - The outer part sits in the quarter panel, wrapping round the corner: in side view from x ≈ 4120, z ≈ 1000 down/back to x ≈ 4400, z ≈ 780.
  - The inner part sits on the trunk lid. "The all-new design of the taillights now carries into the trunk face" ([conceptcarz]).
  - In rear view the inner tips reach to ≈ 0.27 × width from each side (rear reference).
  - The outer lens corner has an aero edge ([hrd-tr]).
- **Trunk lid:**
  - All-new for 2013. A **horizontal chrome bar spans the lid**, linking the inner lamp sections, at about the lamp mid-height, ≈ 1180 mm long (rear reference ratio).
  - The H badge sits above the bar at the centre; the CIVIC script is at the left above the bar.
  - The license-plate recess is below the bar, **in the trunk lid** (plate lights are serviced from the lid, see exterior.md).
  - Integrated ducktail lip at the top rear edge.
  - **No spoiler on the LX** (the Hybrid has one).
- **Rear bumper:**
  - Large, rounded and bulky; its top line runs under the lamps.
  - "Integrated reflector treatments": small red reflectors low at the outer corners.
  - "Lower diffuser panel with a honeycomb mesh vent": a black lower valance strip across the bottom ([newswire-ca]).
  - Bumper bottom ≈ 255–280.
- **Exhaust:** single, plain, tucked under the bumper. **No chrome finisher** on the LX ([hnca13]). Side not confirmed.
- **Rear glass:** wide and strongly raked (≈ 22–24°). The integrated antenna is printed on the glass, so there is no roof mast (a mast seen in some photos belongs to a 2012 Hybrid).

## 7. Most important shape characteristics (summary for the modeler)

1. **Cab-forward:** the windshield base is only ≈ 150 mm behind the front axle (x ≈ 1050). The hood is short (≈ 1 m) and the cabin is long.
2. **One-arc roof:** the windshield (≈ 23°) flows into a single continuous roof arc. Its peak (1435) is at the B-pillar, x ≈ 2570–2810, which is ahead of mid-wheelbase.
3. **Near-fastback rear:** the rear glass falls at ≈ 22–24° to a **short, high deck** (z ≈ 1100 → 1070, only ≈ 320 mm long) with a small ducktail lip.
4. **Overhangs:** front ≈ 900 and rear ≈ 986. The rear is longer than the front, but the high deck makes the tail look short.
5. **Low, rounded nose:** the hood edge is at ≈ 700. The hood rises ≈ 225 mm over the first 900 mm to ≈ 925 at the axle, then ≈ 55 mm more to the cowl.
6. **Beltline:** low at the front door (≈ 910). It rises to ≈ 990 at the B-pillar and stays ≈ 1010–1025 to the pointed rear tip of the side glass.
7. **Strong tumblehome:** body 1752 → ≈ 1650 at the belt → ≈ 1260 at the roof rails. The glass leans in ≈ 25°.
8. **Wheel arches:** lip tops at z ≈ 665, radius ≈ 360–370, with a small tire gap (≈ 45–60 mm above the tire). The 195/65R15 tire is tall (634.5 mm diameter).
9. **Character lines:** a crisp shoulder line from headlight to taillight, and a lower line that rises toward the rear arch. The fenders bulge outward.

---

## Sources

[hn13]: https://hondanews.com/en-US/releases/release-152f07edcfbf4ebeadde2b4f7ab8c01e-2013-honda-civic-sedan-specifications
[hn12]: https://hondanews.com/en-US/releases/release-7173188f2d454403afef996afa921a2d-2012-honda-civic-sedan-specifications-and-features
[hn12ov]: https://hondanews.com/en-US/releases/release-6d8989c9457f44b4aa13e154399dd31b-2012-honda-civic-overview
[hnca13]: https://hondanews.ca/en-CA/hci-automobiles/releases/release-4fade6c61d0220ec4eba0c871603c297-2013-civic-sedan-press-kit
[hn16body]: https://hondanews.com/en-US/releases/2016-honda-civic-sedan-press-kit-body
[hc16spec]: https://www.honda.ca/Content/honda.ca/294dd36a-a860-41d7-9d52-f9f116a6dced/ModelPage_Downloads/Civic_Sedan_specs_EN.pdf
[hrd-tr]: https://global.honda/en/technical-review/PDF/024-1/024-1_1e.pdf
[conceptcarz]: https://www.conceptcarz.com/vehicle/z22272/concepts.aspx
[netcar]: https://www.netcarshow.com/honda/2013-civic_sedan
[newswire-ca]: https://newswire.ca/news-releases/2013-honda-civic-to-debut-at-los-angeles-auto-show-with-more-youthful-and-premium-styling-511135961.html
[autoblog13]: https://www.autoblog.com/news/honda-debuts-honed-2013-civic
[wiki9]: https://en.wikipedia.org/wiki/Honda_Civic_(ninth_generation)
[nh-coupe-front]: https://nrd-static.nhtsa.dot.gov/reports/vehdb/v00000/v08100/v08156R001.pdf (2013 Civic LX coupe, NCAP frontal, Feb 2013)
[nh-coupe-side]: https://nrd-static.nhtsa.dot.gov/reports/vehdb/v00000/v08100/v08157R001.pdf (2013 Civic LX coupe, NCAP side MDB)
[nhtsa-api-7525]: https://api.nhtsa.gov/SafetyRatings/VehicleId/7525
[nhtsa-api-6089]: https://api.nhtsa.gov/SafetyRatings/VehicleId/6089
[auxito-hl]: https://auxito.com/products/2012-2015-honda-civic-chrome-projector-headlights

Looked for and not found:
- Approach and departure angles, cowl height, roof length, and trunk opening dimensions for the 9th-gen sedan. They are not published by Honda, and carsized.com failed to load.
- A free or open SVG line drawing. Wikimedia has none; the-blueprints.com and getoutlines.com are paywalled.
