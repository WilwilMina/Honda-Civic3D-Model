// Lights & wipers symptoms: "what's wrong?" entries (urgency, what you notice, and the likely parts with why and
// how to check). Re-exported by ../content.js as SYMPTOMS. Facts from docs/research/exterior.md and
// docs/research/cabin.md.

export const SYMPTOMS = [
  {
    id: "headlight-out",
    label: "A headlight is out or dim",
    urgency: "soon",
    group: "Lights & visibility",
    detail: "One side of the car is dark or much dimmer than the other at night.",
    causes: [
      {
        part: "low_beam",
        why: "Halogen bulbs simply burn out with age. One side going dark is the classic sign.",
        check:
          "Switch to high beam: if that side lights up on high but not on low, the low-beam bulb is the likely culprit.",
      },
      {
        part: "high_beam",
        why: "If the problem only shows on high beam, the high-beam bulb on that side has failed.",
        check: "Compare both sides on high beam against a wall.",
      },
      {
        part: "headlight",
        why: "If both sides go out together, two bulbs failing at once is unlikely. Look at the fuses and the light switch instead.",
        check:
          "Check the low-beam fuses (10 A each) in the engine-bay fuse box, or have a shop test the switch.",
      },
    ],
    note: "Driving with a headlight out is unsafe and can get you a ticket. Bulbs are cheap and an easy home fix.",
  },
  {
    id: "fast-blink",
    label: "Turn signal blinks fast",
    urgency: "soon",
    group: "Lights & visibility",
    detail: "When you signal one way, the arrow on the dash blinks much faster than normal (or not at all).",
    causes: [
      {
        part: "front_turn",
        why: "Honda's manual says rapid or no blinking means a turn-signal bulb is out.",
        check: "Turn the hazards on and walk around: find the corner that isn't blinking.",
      },
      {
        part: "rear_turn",
        why: "The rear turn bulb on the same side can be the dead one.",
        check: "Look at the rear corner on the fast-blinking side while signalling.",
      },
    ],
  },
  {
    id: "brake-light-out",
    label: "A brake light doesn't come on",
    urgency: "soon",
    group: "Lights & visibility",
    detail: "A friend says one of your brake lights stays dark when you press the pedal.",
    causes: [
      {
        part: "brake_tail",
        why: "The bright filament (the brake-light part) of the 21/5 W bulb has burnt out.",
        check:
          "Press the brake and compare both rear corners. Swap the dark side's bulb from inside the trunk.",
      },
      {
        part: "third_brake",
        why: "The high-mount light at the rear window can fail on its own.",
        check: "Press the brake and look at the bottom of the rear window.",
      },
    ],
    note: "If every brake light is out at once, look for a shared cause such as a fuse instead of three bad bulbs.",
  },
  {
    id: "wipers-streak",
    label: "Wipers streak, smear or chatter",
    urgency: "watch",
    group: "Lights & visibility",
    detail: "The wipers leave lines or a haze on the glass, skip across it, or make noise.",
    causes: [
      {
        part: "wiper_blade",
        why: "The rubber has worn, cracked or hardened. Honda says to replace blades when they leave streaks.",
        check: "Lift each blade and look at the rubber edge for cracks, tears or a rounded edge.",
      },
      {
        part: "wiper_arm",
        why: "A bent arm or a weak spring doesn't press the blade evenly on the glass.",
        check: "With new blades fitted, see if one blade still lifts off the glass during a sweep.",
      },
    ],
  },
  {
    id: "washer-no-spray",
    label: "Washer fluid won't spray",
    urgency: "watch",
    group: "Lights & visibility",
    detail: "Pulling the wiper lever toward you doesn't put any fluid on the windshield.",
    causes: [
      {
        part: "washer_nozzle",
        why: "Most often the reservoir is simply empty. Otherwise, a nozzle may be blocked.",
        check:
          "Fill the washer reservoir under the hood (2.5 L / 2.6 US qt) and try again. If one side still won't spray, the nozzle may be blocked.",
      },
    ],
  },
  {
    id: "plate-light-out",
    label: "License plate light is out",
    urgency: "watch",
    group: "Lights & visibility",
    detail: "The rear plate isn't lit at night.",
    causes: [
      {
        part: "plate_light",
        why: "The small 5 W bulb has burnt out.",
        check: "With the headlights on, look at the plate. Swap the bulb from inside the trunk lid.",
      },
    ],
  },
];
