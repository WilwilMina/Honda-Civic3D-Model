# Research notes

The facts behind the app: dimensions, part locations, fluids, bulbs, warning lights and common problems for a
**US 2013 Honda Civic LX sedan** (9th generation, 1.8 L R18Z1 engine, 5-speed automatic). The learning text in
`src/areas/*/content.js` (and the `content/` folders beside them) and the shape of the 3D model are built from
these notes.

Every fact carries a source link and a confidence tag (Honda document, several independent sources, a single
source, or uncertain/estimated). Each file defines its tags at the top; the spelling differs between files
(for example `[Honda]`, `[HONDA]` or `[Honda manual]`), but the four levels are the same. Where sources disagree, the conflict is written down rather than hidden. The
notes were compiled in November 2026; check a link before relying on it, as web pages move.

| File                                   | Covers                                                                                                                                                                                        |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [engine.md](engine.md)                 | Engine bay layout, where each component sits, the accessory belt, R18Z1 internals and i-VTEC, fluids and capacities, the Maintenance Minder, common engine problems, CarCareKiosk video links |
| [chassis.md](chassis.md)               | Brakes, suspension, steering, wheels and tires, tire pressure, the spare and how to change a flat, jacking, the underbody (exhaust, fuel tank, covers), common problems                       |
| [cabin.md](cabin.md)                   | Dashboard layout, every warning and indicator light (meaning and what to do), cabin air filter, fuse boxes, release levers, seats and airbags, bulb chart, wipers, how-to links               |
| [exterior.md](exterior.md)             | Official dimensions, 2012 vs 2013 differences, panels and hinges, front and rear design, wheels and tires, paint colours, wipers, exterior lights                                             |
| [exterior-shape.md](exterior-shape.md) | Body-shape data for the 3D model: side-profile key points, plan-view widths, beltline, character lines, front and rear details                                                                |
| [tools/px2mm.py](tools/px2mm.py)       | Reproduces the photo-measured numbers in exterior-shape.md from the recorded pixel coordinates                                                                                                |

## Main sources

- **Honda:** hondanews.com and hondanews.ca specification sheets and press kits (2012, 2013, 2016 Civic
  sedan), the Honda R&D Technical Review, owner's manuals (2012 Civic Sedan, 2013 Civic Coupe, 2013 Civic
  Hybrid, 2014 Civic Sedan) and the genuine Honda parts catalog (part names and numbers).
- **NHTSA:** crash-test measurement reports, safety ratings and service-bulletin documents.
- **Repair guides:** CarCareKiosk, 1A Auto, Paul's Travel Pictures, iFixit, Instructables, Haynes.
- **Owner-reported problems:** CarComplaints and TrueDelta.
- **Retail and fitment listings** for bulb numbers, wheel fitment and paint codes, used only where Honda
  publishes nothing and always tagged as such.

## About the body-shape measurements

The exterior was matched against press and dealer photos of the car. Those photos belong to their
photographers and publishers and are **not included** in this repository; the notes keep only the numbers
measured from them, with the method and expected error. The photo sources are credited in the main
[SOURCES.md](../SOURCES.md#reference-photos).

## Coordinates in these notes

The notes use the measuring conventions of their sources, not the app's frame. `exterior-shape.md` (and the
superseded profile table in `exterior.md`) gives `x` in mm **rearward from the front bumper tip**, `z` up from
the ground and `y` from the centreline (positive to the driver side); the other files mostly give plain
dimensions in mm or inches. The app's authoring frame (metres, origin mid-wheelbase, `+y` forward) is described
in [ARCHITECTURE.md](../ARCHITECTURE.md#coordinate-frame).

## Caveats

- No full-text 2013 Civic **Sedan** owner's manual was available. The closest Honda manuals were used instead
  (2013 Coupe for the cabin and powertrain, 2013 Hybrid sedan and 2014 sedan for the body); each note says
  which one a fact comes from.
- Items marked uncertain, estimated or "not found" are not presented as fact in the app.
- This is an educational, unofficial project. For your own car, the owner's manual, the labels on the car and
  a qualified mechanic come first.
