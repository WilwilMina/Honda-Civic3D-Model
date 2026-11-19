// Colours and finishes for the meshes built from shapes.json (see base-model.js): one [colour, finish] entry per
// item or route name, with a few name patterns (nuts, coils, air box latches) handled in code. Anything not listed
// falls back to plain steel. Every material is tagged with its "bay:<part>" key so the app can highlight that part.

// Returns materialFor(part, name), the callback fromDump() uses to pick each mesh's material.
// mat(colour, finish, partKey) and C (the palette) come from the area ctx.
export function kitMaterialFor(mat, C) {
  const P = (part) => "bay:" + part;
  const BY_NAME = {
    // body
    "rail.driver": [C.paintDark, "paint"],
    "rail.passenger": [C.paintDark, "paint"],
    "apron.driver": [C.paint, "paint"],
    "apron.passenger": [C.paint, "paint"],
    firewall: [C.paint, "paint"],
    cowl: [C.black, "plastic"],
    "support.lower": [C.paintDark, "paint"],
    "support.post.d": [C.paint, "paint"],
    "support.post.p": [C.paint, "paint"],
    "support.upper": [C.paint, "paint"],
    "hood.latch": [C.darksteel, "metal"],
    "hood.latch.lever": [C.yellow, "plastic"],
    // engine
    block: [0x9a9ea3, "metal"],
    head: [0xb3b6ba, "metal"],
    valvecover: [0xcfd2d5, "metal"],
    oilpan: [0x55595e, "metal"],
    timingcover: [0x8d9196, "metal"],
    "oilcap.neck": [C.black, "plastic"],
    oilcap: [0x1f2023, "plastic"],
    oilfilter: [0x2d5fb5, "metal"],
    "dipstick.handle": [C.orange, "plastic"],
    "atf.handle": [C.yellow, "plastic"],
    "atf.boss": [C.steel, "metal"],
    "mount.bracket": [C.cast, "metal"],
    "mount.body": [0x2b2d31, "rubber"],
    "mount.base": [C.darksteel, "metal"],
    "exhaust.shield": [0xd5d8dc, "chrome"],
    "cat.body": [0x8a8580, "metal"],
    "o2.boss": [C.steel, "metal"],
    "o2.body": [0xa8acb0, "metal"],
    "intake.plenum": [0x2c2e33, "plastic"],
    "intake.map": [0x45484d, "plastic"],
    throttle: [C.aluminum, "metal"],
    "airbox.lower": [0x2a2c30, "plastic"],
    "airbox.lid": [0x34363b, "plastic"],
    "air.inlet": [0x2a2c30, "plastic"],
    "trans.case": [0xaeb2b6, "metal"],
    "starter.motor": [0x3c3f44, "metal"],
    "starter.solenoid": [0xb9bcc0, "metal"],
    "alt.body": [0xc0c3c6, "metal"],
    "ac.body": [0xb5b9bd, "metal"],
    "ac.boss": [C.steel, "metal"],
    "tens.arm": [C.cast, "metal"],
    "water.outlet": [C.aluminum, "metal"],
    "thermostat.housing": [C.aluminum, "metal"],
    "radiator.tank.p": [0x232427, "plastic"],
    "radiator.tank.d": [0x232427, "plastic"],
    "radiator.neck": [C.aluminum, "metal"],
    "radiator.cap": [0xd4d7da, "chrome"],
    "reservoir.cap": [0x2a2c30, "plastic"],
    "reservoir.nipple": [0xe8e6dc, "plastic"],
    "radiator.nipple": [C.aluminum, "metal"],
    battery: [0x1e1f22, "plastic"],
    "battery.tray": [0x2a2c30, "plastic"],
    "battery.bracket": [0x2a2c30, "plastic"],
    "battery.holddown": [C.darksteel, "metal"],
    fusebox: [0x26282c, "plastic"],
    "fusebox.lid": [0x303237, "plastic"],
    "fusebox.terminal": [C.red, "plastic"],
    "fusebox.tab": [0x303237, "plastic"],
    ecm: [0xb4b8bc, "metal"],
    "brake.booster": [0x2b2d31, "paint"],
    "brake.mc": [C.aluminum, "metal"],
    "brake.cap": [0x1c1d1f, "plastic"],
    "abs.unit": [C.aluminum, "metal"],
    "abs.motor": [0x2a2c30, "metal"],
    "washer.cap": [C.blue, "plastic"],
    "ac.port": [C.steel, "metal"],
    "ac.port.cap": [0x1c1d1f, "plastic"],
    "strut.driver.tower": [C.paint, "paint"],
    "strut.driver.cap": [0x2a2c30, "rubber"],
    // routes
    "coil.harness": [0x1e1f22, "plastic"],
    "dipstick.tube": [C.steel, "metal"],
    "atf.tube": [C.steel, "metal"],
    "cat.inlet": [0x8a8580, "metal"],
    "cat.outlet": [0x7d7975, "metal"],
    "o2.wire": [0x1e1f22, "rubber"],
    "intake.runner0": [0x2c2e33, "plastic"],
    "intake.runner1": [0x2c2e33, "plastic"],
    "intake.runner2": [0x2c2e33, "plastic"],
    "intake.runner3": [0x2c2e33, "plastic"],
    "air.snorkel": [0x2a2c30, "plastic"],
    "intake.tube": [0x232427, "rubber"],
    "hose.upper": [0x1f2022, "rubber"],
    "hose.lower": [0x1f2022, "rubber"],
    "reservoir.hose": [0x1f2022, "rubber"],
    "cable.pos": [0x1d1e20, "rubber"],
    "cable.starter": [0x1d1e20, "rubber"],
    "cable.ground": [0x1d1e20, "rubber"],
    "cable.alt": [0x1d1e20, "rubber"],
    "harness.ecm": [0x1b1c1e, "plastic"],
    "ac.high": [C.aluminum, "metal"],
    "ac.low": [C.aluminum, "metal"],
    "brake.line1": [0x9a8f84, "metal"],
    "brake.line2": [0x9a8f84, "metal"],
    "washer.neck": [0xe9e7de, "plastic"],
  };
  return (part, name) => {
    // the passenger strut tower is a mirrored copy of the driver one, so it shares its colours; nuts share one entry
    const base = name.replace(/^strut\.passenger/, "strut.driver").replace(/\.nut\d$/, ".nut");
    if (base.endsWith(".nut")) return mat(C.chrome, "chrome", P(part));
    if (/^coil\d$/.test(name)) return mat(0x1d1e21, "plastic", P(part));
    if (/^coil\d\.plug$/.test(name)) return mat(0x4a4d52, "plastic", P(part));
    if (/^airbox\.latch/.test(name)) return mat(0x4a4d52, "plastic", P(part));
    const e = BY_NAME[base];
    return e ? mat(e[0], e[1], P(part)) : mat(C.steel, "metal", P(part));
  };
}
