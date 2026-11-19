// Cabin area intro: the "start here" card shown when the area first opens. Re-exported by ../content.js as
// START. Facts: docs/research/cabin.md (2013 Civic Coupe owner's manual, Honda spec sheet).

export const START = {
  lead: "This is the driver's seat of your Civic. Here you'll find the dashboard, every warning light, and the controls and hidden service spots an owner should know.",
  how: 'Click any light, gauge or control. Turn on "Key on (bulb check)" to see what the dash does when you start the car. "Open glove box" shows the cabin air filter, and "Fuse box" takes you to the fuses.',
  sections: [
    {
      title: "Warning light colours",
      html: "<p><b>Red</b> = a serious problem. Stop safely soon (oil, charging, brakes, high temperature, airbags).</p><p><b>Amber</b> (orange-yellow) = get it checked soon (check engine, ABS, VSA skid control, power steering, tire pressure, low fuel).</p><p><b>Green / blue</b> = information only (lights on, high beams, cruise, cold engine).</p>",
    },
    {
      title: "The bulb check is normal",
      html: '<p>When you turn the key to ON ("key-ON"), almost every warning light comes on for a few seconds. That shows the bulbs work. Most go out when the engine starts, and a few (like ABS and the airbag light) go out a moment later. A light that <b>stays on</b>, or <b>comes on while driving</b>, is the one to pay attention to.</p>',
    },
    {
      title: "Easy jobs in here",
      html: "<p>Replacing the <b>cabin air filter</b> behind the glove box takes no tools. Checking a <b>fuse</b> and resetting the <b>Maintenance Minder</b> are easy too. Each part's DIY tab has the steps.</p>",
    },
  ],
  foot: "Facts come from the 2013 Civic owner's manual (Coupe edition: same year, engine and dash), the 2014 Civic Sedan manual (same body) and Honda's 2013 spec sheet. Light colours come from Honda's general guides, so check your own car.",
};
