# 2013 Honda Civic LX sedan (9th gen, US, R18Z1 1.8L, 5AT): engine bay layout and engine internals

Confidence tags: **[Honda]** = Honda press kit, spec sheet, owner's manual, Honda R&D paper or Honda parts catalog. **[multi]** = two or more independent non-Honda sources. **[single]** = one non-Honda source. **[uncertain]** = inferred, conflicting, or weak source. "Not found" = no source located.
Directions: "driver side" = the car's LEFT (US). "Front" = toward the radiator/bumper. Some DIY authors (Paul's Travel Pictures, iFixit) describe sides **as seen standing in front of the car**, so their "right" is the car's driver side. Those quotes are converted here.

Sources used most often (abbreviations):
- HN12-PT = Honda 2012 Civic powertrain press release: https://hondanews.com/en-US/releases/2012-honda-civic-powertrains
- HN06-PT = Honda 2006 Civic powertrain press release (same R18 engine family, 8th gen): https://hondanews.com/en-US/honda-automobiles/releases/release-56b0418fdb34027710fdde004c34c1ad-2006-honda-civic-powertrains
- HN12-SPEC = Honda 2012 Civic Sedan specs: https://hondanews.com/en-US/releases/release-7173188f2d454403afef996afa921a2d-2012-honda-civic-sedan-specifications-and-features
- HN13-SPEC = Honda 2013 Civic Sedan specs: https://hondanews.com/en-US/releases/release-152f07edcfbf4ebeadde2b4f7ab8c01e-2013-honda-civic-sedan-specifications
- HTR = Honda R&D Technical Review Vol.18 No.1 (2006), "Development of 1.8L i-VTEC Gasoline Engine for 2006 Civic" (R18A): https://global.honda/en/technical-review/PDF/018-1/18-1_8e.pdf
- OM12 = 2012 Civic Sedan US Owner's Manual (manualsdir mirror). Pattern: https://www.manualsdir.com/manuals/240795/honda-2012-civic-sedan-1982-civic-sedan-owners-manual-2012-civic-sedan-owners-manual.html?page=N
- HPN = Honda OEM parts catalog for the 2013 Civic 4DR LX KA 5AT on hondapartsnow.com. Base: https://www.hondapartsnow.com/parts-list/2013-honda-civic--4dr_lx-ka_5at/
- PTP = Paul's Travel Pictures 2012-2015 Civic DIY guides (cited per item)
- 1A = 1A Auto video transcripts for the 2012-2015 Civic 1.8L (cited per item)

---

## Summary table

| Item | Value | Conf. | Source |
|---|---|---|---|
| Engine | R18Z1, inline-4, SOHC 16-valve i-VTEC, aluminum-alloy block and head | Honda | HN13-SPEC; code R18Z1: https://www.motorreviewer.com/engine.php?engine_id=83 |
| Displacement | 1798 cc on the 2012/2013 US spec sheets; 1799 cc in the R18A paper and 2006 release (same 81 x 87.3 bore/stroke, rounding difference) | Honda | HN12-SPEC, HN13-SPEC, HTR |
| Bore x stroke | 81.0 x 87.3 mm | Honda | HN13-SPEC |
| Compression | 10.6:1 (the 2006 R18A was 10.5:1) | Honda | HN13-SPEC; HTR |
| Power / torque | 140 hp @ 6500 rpm / 128 lb-ft @ 4300 rpm (SAE net) | Honda | HN13-SPEC |
| Redline | **6700 rpm per Honda US spec sheets** (Wikipedia gives 6800 redline / 7100 fuel cut for the FB2) | Honda (conflict noted) | HN12-SPEC, HN13-SPEC; https://en.wikipedia.org/wiki/Honda_R_engine |
| Fuel/throttle | Multi-point injection; drive-by-wire throttle (DC motor moves the butterfly) | Honda | HN13-SPEC, HN12-PT |
| Ignition | Direct ignition, one coil per plug (4 x "Coil, Plug Hole" 30520-R1A-A01) | Honda | HN13-SPEC; HPN plug_hole_coil_plug_1_8l.html |
| Cam drive | Narrow "silent" timing **chain**, chain case with a built-in oil pump | Honda | HN12-PT, HTR |
| Exhaust manifold | **Integrated into the cylinder head**; catalytic converter bolts straight to the head | Honda | HN12-PT, HTR |
| Exhaust side | **Front of the engine (radiator side)** per Honda's 2006 R18 release; assumed unchanged for 2012-15 | Honda (8th gen) / inferred for 9th gen | HN06-PT |
| Transmission | 5-speed automatic available on LX; ratios 2.666/1.534/1.022/0.721/0.525, R 1.957, final drive 4.44 | Honda | HN12-SPEC |
| Steering | Electric power steering (EPS), so no power-steering pump, belt or fluid | Honda | HN12-SPEC, HN13-SPEC |
| Engine oil | 0W-20; 3.7 US qt on change, **3.9 US qt (3.7 L) with filter** | Honda | OM12 p.326 |
| Coolant | Honda Long-Life Antifreeze/Coolant Type 2 (blue, premixed 50/50); 1.48 US gal (5.59 L) on change incl. 0.125 gal in the reserve tank | Honda; color multi | OM12 p.326; color: https://www.hybrid-racing.com/collections/all/products/honda-type-2-anti-freeze-engine-coolant-ol999-09011 |
| ATF | Honda ATF DW-1; 2.5 US qt (2.4 L) on change | Honda | OM12 p.326 |
| Brake fluid | Honda Heavy Duty Brake Fluid DOT 3 | Honda | OM12 p.326 |
| Spark plugs | NGK DILZKR7B11GS or DENSO DXU22HCR-D11S | Honda | OM12 p.325; HPN lists NGK DILZKR7B11GS (12290-R41-L01) |
| Plug gap | 1.0-1.1 mm (0.039-0.043 in) per the Honda factory manual for the 2006 Civic 1.8. **The "0.044 in" figure was not found anywhere.** | Honda (2006 R18) | https://workshop-manuals.com/honda/civic/l4-1.8l/engine_cooling_and_exhaust/engine/tune-up_and_engine_performance_checks/spark_plug/component_information/specifications/gap/ |
| Battery | Group 51R; OEM 31500-TR0A-A01 | multi | PTP battery guide; Interstate MT-51R fitment page |
| Belt | One serpentine belt (Honda calls it "Belt, Alternator (BANDO)" 31110-R1A-A21) with an auto-tensioner | Honda | HPN alternator_bracket_tensioner_1_8l.html |
| Valve lash | Screw-and-locknut adjusters. Intake 0.18-0.22 mm, exhaust 0.23-0.27 mm cold (figures published for the R18A) | multi (not Honda-verified for R18Z1) | Haynes, motorreviewer (section B) |

---

## A. Engine bay layout

### A1. Orientation, intake and exhaust

- **Transverse inline-4.** The accessory belt, crank pulley, alternator, tensioner and side engine mount are all on the **passenger side**. 1A Auto places the alternator on the passenger side of the engine, and the belt tensioner on the passenger side of the engine compartment, directly under the engine mount. [multi: two 1A transcripts] https://www.1aauto.com/how-to-replace-alternator-2012-2015-honda-civic-18l-i4/video/68755 , https://www.1aauto.com/how-to-replace-serpentine-belt-tensioner-2012-2015-honda-civic-18l-i4/video/68754
- **Timing chain end = passenger side (belt end).** In Honda's cam chain removal procedure the crankshaft pulley comes off before the chain case, so both are at the same end of the engine (2006 R18). [Honda 2006 manual; inferred for 2013] https://workshop-manuals.com/honda/civic/l4-1.8l/engine_cooling_and_exhaust/engine/timing_components/timing_chain/component_information/service_and_repair/cam_chain_removal/
- **Transmission = driver side.** Honda's mount names are "Mounting, Engine Side (AT)" and "Mounting, Transmission (AT)". With the engine-side mount on the passenger side (1A), the transmission mount is on the driver side. [Honda parts + 1A, inferred] HPN body_air_conditioning/engine_mounts.html
- **Exhaust faces the FRONT (radiator).** Honda's 2006 Civic release (1.8L section) says the exhaust manifold sits on the front of the engine, which shortens the path to the catalytic converter. [Honda, 8th-gen R18] HN06-PT. Honda's 2012 release says the 2012 Civic **Si** (K24) puts its manifold on the *rear*, which marks the K24 as the odd one out. The 2012 1.8 description of the integrated head-manifold and head-bolted cat is unchanged. [Honda] HN12-PT. A turbo-kit FAQ needing slim radiator fans to clear the turbo is consistent with a front-mounted exhaust. [single] https://www.full-race.com/articles/civic-r18-turbo-kit-faq/ . **For the model, treat exhaust/cat at the front and the intake at the rear (firewall side).** The intake-at-rear part is inferred: no source states it directly. [uncertain/inferred]
- **Exhaust manifold integrated into the head:** yes. Honda says the manifold is built into the cylinder head, so no separate exhaust manifold is needed. [Honda] HN12-PT; HTR also says the head is integrated with the exhaust manifold.
- **Catalytic converter:** close-coupled, two-bed, three-way, "fitted to the cylinder head". A UEGO (A/F) sensor sits upstream and a HEGO sensor downstream of the front bed (R18A). [Honda] HTR. 2012 release: "the catalytic converter bolts directly to the cylinder head." [Honda] HN12-PT. Honda parts list a "Converter (1.8L)" diagram and a "Cover, Converter" heat shield 18181-R1A-A00. [Honda parts] HPN engine/converter_1_8l.html
- **Intake manifold:** composite plastic, dual-stage, two runners per cylinder. Below about 5,000 rpm only the long runner feeds; above that a shutter valve opens the short runner. [Honda] HN12-PT. Position (rear) inferred as above.
- **Throttle body:** drive-by-wire, DC motor. [Honda] HN12-PT. Location: the AEM intake guide runs the new intake tube from the driver-side air box area to the throttle body and moves a coolant hose between the thermostat housing and the throttle body. That suggests a TB at the **driver-side end** of the intake. [single, inferred] https://images.carid.com/aem/air-intakes/pdf/aem-21-714-installation-instructions.pdf

### A2. Component locations

| Component | Location / facts | Conf. | Source |
|---|---|---|---|
| Battery | **Front corner, driver side.** PTP: "located at the front right (driver) side of the engine bay", i.e. viewer's right. Clamp bar with two 10 mm nuts and J-hooks. Black plastic battery cover. PTP: "+" post toward the engine side, "-" post toward the driver fender. Group **51R**, OEM 31500-TR0A-A01. OM12 lists 36AH(5)/45AH(20), 36AH(5)/47AH(20), 38AH(5)/47AH(20). | single (location); multi (51R); Honda (Ah) | https://www.paulstravelpictures.com/2012-2015-Honda-Civic-12V-Automotive-Battery-Replacement-Guide/ ; https://www.interstatebatteries.com/products/mt-51r/2013-honda-civic-l418l-us-primary-battery ; OM12 p.325 |
| Under-hood fuse/relay box | **Driver side**, "next to the air box and 12V automotive battery" (PTP). Honda QRG (2013 Civic coupe): "Located near the brake fluid reservoir." | single + Honda | https://www.PaulsTravelPictures.com/2012-2015-Honda-Civic-Electrical-Fuse-Replacement-Guide/index.html ; https://www.manualowl.com/am/Honda/2013-Civic/Manual/7155?page=312 |
| Air filter box | **Driver side, toward the rear of the bay, next to the fuse box** (PTP: "right rear area of the engine bay next to the fuse box"; iFixit: "to the right of the valve cover" facing the car). Metal clips, no tools. PTP counts 3 clips, iFixit counts 4 (conflict). Filter 17220-R1A-A01. | multi (side); uncertain (clip count) | https://www.paulstravelpictures.com/2012-2015-Honda-Civic-Engine-Air-Filter-Replacement-Guide/ ; https://www.ifixit.com/Guide/2012+2013+2014+2015+Honda+Civic+Air+Filter+Replacement/40403 |
| Intake snorkel / resonator | An air duct connects to the **front of the air box**. A separate resonator is held by upper and lower 10 mm bolts. The MAF sensor sits in or on the air box assembly. | single | AEM 21-714 guide (above); K&N 69-1020: https://sdda.semadata.org/Standard/KN%20Engineering%20Inc/69-1020_Inst.pdf |
| ECM/PCM | **In the engine compartment, not behind the dash.** Honda's diagram is named "Control Unit (Engine Room)" and lists the ECU (37820-R1A-…), ECM brackets/cover, and the horn and horn bracket. AEM: "Move the ECU to gain access to the remaining 10mm bracket bolt" when removing the air box. Exact spot (driver side near the air box, toward the front) is inferred. | Honda (engine room) + single; exact spot uncertain | HPN electrical_exhaust_heater_fuel/control_unit_engine_room.html ; AEM guide |
| Oil filler cap | On the cylinder head cover. Honda lists "Cap Assy., Oil Filler" 15610-REZ-A00 in the head-cover diagram. Which end of the cover: not found. | Honda | HPN engine/cylinder_head_cover_1_8l.html |
| Oil dipstick | **Orange handle.** Part 15650-RNA-A00 is in the head-cover diagram. Exact position: not found in text. | Honda | OM12 p.252 (under-hood diagram labels); HPN |
| Oil filter | **Front of the oil pan**, vertical, reached from below after removing the metal under-engine cover (4 screws). OEM 15400-PLM-A02. CarCareKiosk: drain plug and filter are "behind a large panel underneath the vehicle." | multi | PTP oil guide: https://www.paulstravelpictures.com/2012-2015-Honda-Civic-R18A1-I4-Engine-Oil-Change-Guide ; https://www.carcarekiosk.com/review/2012_Honda_Civic_EX-L_1.8L_4_Cyl._Sedan ; 9thcivic DIY: https://9thcivic.com/forum/goto/post?id=355721 |
| Oil drain plug | **Rear edge of the aluminum oil pan**, 17 mm head (PTP). Use a new washer (Honda 94109-14000, 14 mm). Torque **29 lbf-ft (39 N-m)**. The manual prints 29 and 30 lbf-ft for the two engines; PTP gives about 29 for the 1.8. | Honda + single | OM12 p.261; HPN cylinder_block_oil_pan_1_8l.html; PTP |
| Coolant reservoir | Translucent "Tank, Reserve" 19101-R1A-A00. 1A says it is bolted (10 mm) to the **radiator fan assembly behind the radiator**, with its cap near the driver-side fan connector. **Side not confirmed.** One unsourced article says passenger side, behind the headlight. | uncertain | https://www.1aauto.com/how-to-replace-radiator-2012-2015-honda-civic-18l-i4/video/68760 ; HPN radiator_hose_reserve_tank_1_8l.html ; https://carmechan.com/troubleshooting/2012-honda-civic-coolant-reservoir-location-maintenance/ |
| Radiator cap | **On top of the radiator** (Honda "Cap, Radiator" 19045-RAA-003). OM12: check the reserve tank first, and the radiator only if the tank is empty. | Honda + single | HPN radiator_denso.html; OM12 p.262; 1A radiator video |
| Radiator drain | Driver side of the radiator, bottom ("Bolt, Drain") | single + Honda part | 1A radiator video; HPN |
| Upper/lower radiator hoses | Both exist ("Hose, Water (UPPER)" 19501-R1A-A01, "(LOWER)" 19504-R1B-A01). Routing sides not found. | Honda | HPN radiator_hose_reserve_tank_1_8l.html |
| Thermostat | Honda parts: "Case, Thermostat", "Cover, Thermostat", "Thermostat Assy." (Fuji Seiko). Location: the AEM guide reaches the thermostat-housing hose with the air box removed, which suggests the **driver-side (transmission) end**. | Honda (parts); location uncertain | HPN water_pump_1_8l.html; AEM guide |
| Cooling fans | **Two**: radiator fan plus A/C condenser fan (two "Fan, Cooling" and two "Motor, Cooling Fan"; relays "MAIN FAN" and "SUB-FAN"). 1A part listings put the condenser fan on the passenger side and the radiator fan on the driver side. | Honda (count); single (sides) | HPN radiator_denso.html, control_unit_engine_room.html; https://www.1aauto.com/how-to-replace-ac-condenser-cooling-fan-2012-2015-honda-civic-18l-l4/video/68656 |
| A/C compressor | Sanden, belt-driven, **at the bottom of the belt run** on the passenger end ("Start down at the bottom at that AC compressor"). Refrigerant R-134a, 13.2-15.0 oz; oil SP-10. | Honda (parts, refrigerant) + single (position) | HPN a_c_air_conditioner_compressor_1_8l.html; OM12 p.325; 1A tensioner video |
| Alternator | **Passenger end, upper pulley** of the belt (Mitsubishi). Front-vs-rear of the block: not found. | multi | 1A alternator + tensioner videos; HPN alternator_mitsubishi_1_8l.html |
| Starter | Mitsuba starter (Honda parts). It must engage the flexplate, which is at the transmission (driver) end. Front/rear position: not found. | Honda (part); location not found | HPN starter_motor_mitsuba_1_8l.html |
| Power steering | **None (EPS)**: no pump, reservoir or PS belt. The OM12 under-hood labels have no PS fluid item. | Honda | HN12-SPEC; OM12 p.252 |
| Brake master cylinder / reservoir / booster | Reservoir has a **black cap**. Honda diagram "Brake Master Cylinder - Master Power". The fuse box is "near the brake fluid reservoir" and the fuse box is driver side, so the reservoir is **driver side, rear (at the firewall)**. | Honda + inferred | OM12 p.252; Honda QRG p.312; HPN chassis/brake_master_cylinder_master_power.html |
| ABS / VSA modulator | Honda lists a "VSA Modulator" for the 2013 LX. **Location not found.** | Honda (exists) | HPN chassis/vsa_modulator.html |
| Washer fluid filler | **Blue cap.** Tank 2.6 US qt (US). **Filler location not found in text.** | Honda | OM12 p.252, p.325 |
| Clutch fluid | Light-gray cap, **manual-transmission cars only**. Not present on an AT LX. | Honda | OM12 p.252 |
| ATF dipstick | **Yellow loop**, in the transmission (driver side). Check with the engine warm: start it, turn it off when the radiator fan runs, pull the stick after about 60 s (less than 90 s), read the HOT range. | Honda | OM12 p.252, p.264 |
| Engine mounts | **3 mounts plus a torque rod**: side engine mount (passenger side, the tensioner sits under it), transmission mount (driver side), and a **lower torque rod** with its bracket. No upper torque rod or front mount is listed. | Honda (parts) + single (side) | HPN engine_mounts.html; 1A tensioner video |
| Ignition coils | 4 coil-on-plug units bolted on top of the head (10 mm bolt each). A plastic engine cover (2 screws) sits over them. | Honda + single | HPN plug_hole_coil_plug_1_8l.html, engine_cover_1_8l.html; https://ifixit.com/Guide/2012+2013+2014+2015+Honda+Civic+Spark+Plugs+Replacement/167791 |
| Under-engine shield | Metal splash or skid plate, 4 Phillips screws | multi | PTP oil guide; 9thcivic DIY |

### A3. Accessory belt

- **One serpentine (ribbed) belt** with an automatic tensioner ("Tensioner Assy., Auto" 31170-R0A-025) and an **idler pulley** ("Pulley, Idler" 31190-R0A-005). [Honda parts] HPN alternator_bracket_tensioner_1_8l.html. The compressor is listed as 6PK (6-rib). [single] https://www.fridayparts.com/12v-trse09-6pk-a-c-compressor-16003527-101-for-honda-civic-1-8l-2012-2015-acura-ilx-2-0l-2013-2015
- **Water pump is belt-driven.** Honda lists "Pulley, Water Pump" 19224-R1A-A01, and 1A's routing includes the water pump. [Honda + single]
- **Routing (1A Auto):** A/C compressor (bottom) → water pump → crankshaft pulley (bottom) → tensioner pulley → idler pulley (toward the rear) → alternator (top), back to the A/C compressor. The water pump pulley is "the next pulley below [the alternator], heading a little bit rearward". The tensioner is released with a 19 mm socket, turned counterclockwise ("towards the rear"), and sits under the side engine mount. [single, consistent across two 1A transcripts] https://www.1aauto.com/how-to-replace-alternator-2012-2015-honda-civic-18l-i4/video/68755 ; https://www.1aauto.com/how-to-replace-serpentine-belt-tensioner-2012-2015-honda-civic-18l-i4/video/68754
- Reaching the crank pulley may require removing the passenger front wheel. [single] 1A.

---

## B. R18Z1 internals

| Item | Finding | Conf. | Source |
|---|---|---|---|
| Displacement / bore / stroke | 1798 cc (US spec sheet) or 1799 cc (Honda R&D); 81 x 87.3 mm | Honda | HN13-SPEC; HTR |
| Compression | 10.6:1 | Honda | HN13-SPEC |
| Valvetrain | SOHC, 4 valves per cylinder (16). Intake and exhaust rockers share one rocker shaft. Valve included angle 34°. | Honda | HTR; HN13-SPEC |
| i-VTEC: what it does | **Two intake cam profiles.** The *high-output* cam is the default (start, idle, high load or high rpm). The *delayed-closure* cam holds an intake valve open longer at **low rpm and low load** (cruising), so the throttle can open wider and **pumping losses drop (up to 16%)**. The switch is on **only one of the two intake rocker arms per cylinder**, uses hydraulic synchro pistons, and is controlled by a 3-way solenoid spool valve. Inputs: engine speed, throttle opening, vehicle speed, coolant temp. | Honda | HTR; https://hondanews.com/en-US/honda-automobiles/releases/release-cb3cd9e509499c17d5db68004c34c1d1-honda-develops-new-1-8-liter-i-vtec-engine-that-provides-enhanced-fuel-economy-and-powerful-performance |
| i-VTEC: rpm window | 2012 release: switchover "set between 1,200 rpm and 3,500 rpm" depending on load. Wikipedia (FB2/FG3): economy profile "from 1000 rpm to 3500 rpm, under light engine load." | Honda + Wiki | HN12-PT; Wikipedia R engine |
| Separate high-rpm VTEC mode? | **No.** Honda describes only the two profiles above; there is no third "high-rpm power cam" like older DOHC VTEC. Note: the 2012 US release also says only one intake valve opens at low speed and both at high speed (PZEV cold-start emissions). That wording differs from the R&D paper. | Honda (wording conflict noted) | HTR; HN12-PT |
| VTC (cam phasing) | **None mentioned** in any Honda R18 source reviewed (HTR, HN06-PT, HN12-PT). The parts catalog shows a "Spool Valve" (VTEC solenoid) but no VTC actuator diagram. | uncertain (absence of evidence) | HPN engine list; HTR |
| Throttle | Drive-by-wire; also coordinates with AT shifts to reduce shift shock | Honda | HN12-PT |
| Cam drive | Timing chain (narrow, 1.9 mm narrower than the previous engine), plastic guide, auto tensioner; "long-life" | Honda | HTR; HN12-PT |
| Rocker arms / adjusters | Rocker arms with **screw adjusters** ("Screw, Tappet Adjusting" 14744-PM3-000, "Nut, Tappet Adjusting" 90206-R1B-A01) and a "Motion, Lost" spring 14820-R1A-A01 for the VTEC rocker. 2006 release: aluminum rocker arms. | Honda | HPN valve_rocker_arm_1_8l.html; Honda 2006 1.8 i-VTEC release |
| Valve clearance (cold) | **Intake 0.18-0.22 mm, exhaust 0.23-0.27 mm.** Published for the R18 (Haynes, European 2006-12 Civic 1.8; motorreviewer). Honda's own figure is only in an image on the 2006 factory-manual page, which could not be read. **Not verified for R18Z1 from a Honda text source.** | multi (R18A) / uncertain for R18Z1 | https://haynes.com/en-gb/tips-tutorials/honda-civic-routine-maintenance-guide-2006-2012-petrol-and-diesel-engines ; https://www.motorreviewer.com/engine.php?engine_id=83 ; image-only: https://workshop-manuals.com/honda/civic/l4-1.8l/engine_cooling_and_exhaust/engine/tune-up_and_engine_performance_checks/valve_clearance/system_information/specifications/ |
| Connecting rods | Hot-forged, **crack-separated (fracture-split)**: 13% lighter, 20% smaller cross-section, no locating dowel pins | Honda | HN12-PT; HTR |
| Rod length | **Not found** from Honda. The aftermarket Brian Crower R18 rod is 6.200 in (157.5 mm) center-to-center, **not confirmed as stock length**. | uncertain | https://www.speedscience.co.nz/collections/connecting-rods/products/brian-crower-honda-r18-jdm-euro-civic-06-up-proh2k-connecting-rods-w-arp2000-fasteners |
| Piston oil jets | Yes (knock control). Honda parts list "Body, Oil Jet" 15280-RZP-000. | Honda | HTR; Honda 2006 1.8 release; HPN cylinder_block_oil_pan_1_8l.html |
| Pistons / rings / bores | Moly dot-pattern skirt coating, ion-plated rings, plateau-honed bores | Honda | HN12-PT |
| Block | **Aluminum block with ferrous spin-cast cylinder sleeves (cast-iron liners)**. Aluminum lower block with ladder frame (integrated main bearings). Steel crankshaft. Aluminum oil pan. | Honda | HN12-PT; HTR; HN06-PT |
| Head | Aluminum alloy, integrated exhaust manifold | Honda | HN13-SPEC; HTR |
| Firing order | **1-3-4-2** | single (Honda page is image-only) | motorreviewer; image-only: https://workshop-manuals.com/honda/civic/l4-1.8l/engine_cooling_and_exhaust/engine/tune-up_and_engine_performance_checks/firing_order/component_information/specifications/ |
| Cylinder 1 location | **Not verified.** The Honda "Number One Cylinder: Locations" page is image-only. Many Honda transversals put #1 at the timing/pulley end, but no source confirmed it for the R18. | uncertain | https://workshop-manuals.com/honda/civic/l4-1.8l/engine_cooling_and_exhaust/engine/tune-up_and_engine_performance_checks/ignition_timing/number_one_cylinder/component_information/locations/ |
| Crank rotation direction | **Not found** in an R18-specific source | not found | — |
| Redline | 6700 rpm (Honda US spec sheets 2012 and 2013); Wikipedia 6800 / fuel cut 7100 | Honda (conflict) | HN12-SPEC, HN13-SPEC; Wikipedia |
| Power / torque | 140 hp @ 6500; 128 lb-ft @ 4300 | Honda | HN13-SPEC |
| Spark plugs | NGK DILZKR7B11GS / DENSO DXU22HCR-D11S (iridium). Gap 1.0-1.1 mm (0.039-0.043 in; Honda manual, 2006 1.8). Torque: **27 N-m (about 20 lbf-ft) per Haynes (R18, Euro)**; no Honda US figure found. 5/8 in plug socket. | Honda (type, gap); single (torque) | OM12 p.325; workshop-manuals gap page; Haynes; iFixit |
| Oil | 0W-20; 3.9 US qt (3.7 L) with filter; 3.7 qt without | Honda | OM12 p.326 |
| Coolant | Honda Type 2 (blue, 50/50); 1.48 US gal (5.59 L) incl. reserve | Honda + single (color) | OM12 p.326; hybrid-racing |
| ATF | DW-1; 2.5 US qt (2.4 L) on change | Honda | OM12 p.326 |
| Compression test spec | Image-only on the Honda manual page. Not found. | not found | workshop-manuals compression page |

### Maintenance Minder (2012 Civic Sedan, US) [Honda] OM12 p.246
- **A**: Replace engine oil.
- **B**: Replace engine oil and filter. Also inspect front/rear brakes, parking brake adjustment, tie-rod ends/steering gearbox/boots, suspension, driveshaft boots, brake hoses and lines (incl. ABS/VSA), all fluid levels, exhaust system, fuel lines.
- **1**: Rotate tires.
- **2**: Replace air cleaner element (every 15k mi if dusty); replace dust/pollen (cabin) filter; inspect drive belt.
- **3**: Replace transmission fluid.
- **4**: Replace spark plugs; **inspect valve clearance**.
- **5**: Replace engine coolant.
- Brake fluid every 3 years regardless of the Minder. Change oil at least yearly if the Minder hasn't called for it. Adjust valves at A/B/1/2/3 services if they are noisy.
- **Fixed mileage intervals** for plugs, valves and coolant are **not printed** in the US manual: the Minder decides. Honda press release: "100K +/- miles, no scheduled tune-ups." [Honda] HN13-SPEC; HN12-PT

---

## C. Common problems (2012-2015 Civic 1.8): only items with sources

1. **EPS warning light, with or without loss of assist (DTC 33-01)**: Honda engineering request AER15070B and dealer messages (2015), covering 2012-2015 Civic. CarComplaints lists "Power Steering Warning Light On" as a top 2013 Civic problem (avg ~86k mi, ~$3,000). [multi] https://www.carcomplaints.com/Honda/Civic/2012/tsbs/ ; https://www.truedelta.com/Honda-Civic-tsbs-109,2013 ; https://www.carcomplaints.com/Honda/Civic/2013/
2. **Side engine mount chirp**: internal parts rub on rough roads in hot weather (service bulletin, NHTSA #10115164). [single: TSB listing] carcomplaints 2012 TSB list.
3. **Rocker-arm (VTEC) oil pressure switch**: DTCs P2646/P2651 or P2647/P2652 may need a switch replacement (TSB A13-021). [multi] carcomplaints 2012 TSBs; truedelta 2013.
4. **Thermostat jiggle valve sticks open → DTC P0128** (TSB A13-044). [single] carcomplaints 2012 TSBs.
5. **Timing chain case cover oil leak**: Honda dealer messages / engineering request AER140 (2017-18) investigating "certain 2013 Civics." [single] https://www.truedelta.com/Honda-Civic-tsbs-109,2013
6. **PCM air-fuel ratio / emissions recalibrations** (TSBs A17-023, A19-106) and a MAF P0101 PCM-misread bulletin (2014). [single] carcomplaints 2012 TSBs.
7. **Recalls (2012)**: 12V256000, left (driver) driveshaft may fracture (loss of drive power / rollaway risk, 50,190 vehicles); 12V548000, steering column (157 vehicles); 11V288000, fuel feed line (1,156). Check by VIN. [single] https://www.carcomplaints.com/Honda/Civic/2012/recalls/
8. **Excessive oil consumption** (6 owner complaints) and **stalling** (7) on the 2012: low counts. [single] https://www.carcomplaints.com/Honda/Civic/2012/engine/
- **A/C compressor/condenser failures: not a notable pattern.** The 2012 AC page has 1 complaint for a condenser damaged by road debris and no AC TSBs. [single] https://m.carcomplaints.com/Honda/Civic/2012/AC_heater/
- **Valve tick:** no TSB found. Honda's own guidance is to adjust valves if noisy (Minder note above).
- **Cold-start rattle / VTC:** not found. No VTC on this engine per the sources above.
- RepairPal could not be loaded (site error).

---

## D. CarCareKiosk video pages (links checked Nov 2026)

There is no 2013 1.8L page (2013 has only the Si 2.4L). The closest matches use the same R18 engine:
- **2012 EX-L 1.8L Sedan** (canonical). Each page below loaded with a vehicle-specific title.
- **2014 LX 1.8L Sedan** (filmed on a 2014 LX; same list of topics). Index: https://www.carcarekiosk.com/videos/Honda/Civic/2014
- 2012 "LX 1.8L Sedan" URLs also load, but they reuse the EX-L content. Example: https://www.carcarekiosk.com/video/2012_Honda_Civic_LX_1.8L_4_Cyl._Sedan/coolant_antifreeze/check_coolant_level
- Page text is generic. Locations are shown only in the videos.

| Task | 2012 EX-L 1.8L Sedan URL (loaded ✓) | 2014 LX equivalent |
|---|---|---|
| Change oil & filter | https://www.carcarekiosk.com/video/2012_Honda_Civic_EX-L_1.8L_4_Cyl._Sedan/oil/change_oil_and_oil_filter ✓ | …/2014_Honda_Civic_LX_1.8L_4_Cyl._Sedan/oil/change_oil_and_oil_filter |
| Check oil level | https://www.carcarekiosk.com/video/2012_Honda_Civic_EX-L_1.8L_4_Cyl._Sedan/oil/check_oil_level ✓ | https://www.carcarekiosk.com/video/2014_Honda_Civic_LX_1.8L_4_Cyl._Sedan/oil/check_oil_level ✓ |
| Add oil | https://www.carcarekiosk.com/video/2012_Honda_Civic_EX-L_1.8L_4_Cyl._Sedan/oil/add_oil ✓ | …/oil/add_oil |
| Replace engine air filter | https://www.carcarekiosk.com/video/2012_Honda_Civic_EX-L_1.8L_4_Cyl._Sedan/air_filter_engine/replace ✓ | …/air_filter_engine/replace |
| Replace cabin air filter | https://www.carcarekiosk.com/video/2012_Honda_Civic_EX-L_1.8L_4_Cyl._Sedan/air_filter_cabin/replace ✓ | …/air_filter_cabin/replace |
| Check coolant | https://www.carcarekiosk.com/video/2012_Honda_Civic_EX-L_1.8L_4_Cyl._Sedan/coolant_antifreeze/check_coolant_level ✓ | …/coolant_antifreeze/check_coolant_level |
| Add coolant | https://www.carcarekiosk.com/video/2012_Honda_Civic_EX-L_1.8L_4_Cyl._Sedan/coolant_antifreeze/add_coolant ✓ | …/coolant_antifreeze/add_coolant |
| Check brake fluid | https://www.carcarekiosk.com/video/2012_Honda_Civic_EX-L_1.8L_4_Cyl._Sedan/brake_fluid/check_fluid_level ✓ | …/brake_fluid/check_fluid_level |
| Add brake fluid | https://www.carcarekiosk.com/video/2012_Honda_Civic_EX-L_1.8L_4_Cyl._Sedan/brake_fluid/add_fluid ✓ | …/brake_fluid/add_fluid |
| Replace battery | https://www.carcarekiosk.com/video/2012_Honda_Civic_EX-L_1.8L_4_Cyl._Sedan/battery/replace_battery ✓ | …/battery/replace_battery |
| Jump start | https://www.carcarekiosk.com/video/2012_Honda_Civic_EX-L_1.8L_4_Cyl._Sedan/battery/jump_start ✓ | …/battery/jump_start |
| Check engine fuses | https://www.carcarekiosk.com/video/2012_Honda_Civic_EX-L_1.8L_4_Cyl._Sedan/fuse_engine/check ✓ | …/fuse_engine/check |
| Replace engine fuse | https://www.carcarekiosk.com/video/2012_Honda_Civic_EX-L_1.8L_4_Cyl._Sedan/fuse_engine/replace ✓ | …/fuse_engine/replace |
| Interior fuses (check/replace) | https://www.carcarekiosk.com/video/2012_Honda_Civic_EX-L_1.8L_4_Cyl._Sedan/fuse_interior/check , …/fuse_interior/replace (linked from the index; not individually fetched) | …/fuse_interior/check |
| Headlight bulb | https://www.carcarekiosk.com/video/2012_Honda_Civic_EX-L_1.8L_4_Cyl._Sedan/lights/headlight ✓ | …/lights/headlight |
| Wiper blades | https://www.carcarekiosk.com/video/2012_Honda_Civic_EX-L_1.8L_4_Cyl._Sedan/windshield_wiper_blade_front/replace_wiper_blades ✓ | …/windshield_wiper_blade_front/replace_wiper_blades |
| Check transmission fluid | https://www.carcarekiosk.com/video/2012_Honda_Civic_EX-L_1.8L_4_Cyl._Sedan/transmission_fluid/check_fluid_level ✓ (page text says "engine running", which is generic. **Honda's procedure: warm engine, then off, read within 90 s.**) | …/transmission_fluid/check_fluid_level |
| Add transmission fluid | https://www.carcarekiosk.com/video/2012_Honda_Civic_EX-L_1.8L_4_Cyl._Sedan/transmission_fluid/add_level ✓ | …/transmission_fluid/add_level |
| Washer fluid | https://www.carcarekiosk.com/video/2012_Honda_Civic_EX-L_1.8L_4_Cyl._Sedan/windshield_washer_fluid/add_fluid ✓ | …/windshield_washer_fluid/add_fluid |
| Open hood | https://www.carcarekiosk.com/video/2012_Honda_Civic_EX-L_1.8L_4_Cyl._Sedan/hood/open_the_hood (from index) | …/hood/open_the_hood |
| Spark plugs | **No CarCareKiosk page for this car.** Alternatives: iFixit https://ifixit.com/Guide/2012+2013+2014+2015+Honda+Civic+Spark+Plugs+Replacement/167791 (Bosch plugs, angle-tighten, no torque given) | — |

Full 2012 index: https://www.carcarekiosk.com/videos/Honda/Civic/2012 . Other useful DIY pages: PTP oil change (above); 1A Auto alternator, belt tensioner and radiator videos (above).

---

## Gaps / not resolved
- Coolant reservoir side, washer filler position, VSA modulator position, starter front/rear, alternator front/rear, oil filler and dipstick exact positions: not found in text sources. Honda diagrams exist but are image-only and could not be read for these notes.
- Intake manifold at the rear is inferred from Honda's "exhaust on the front" (2006 R18 text). No 2012-15 text states it directly.
- Cylinder-1 end, crank rotation, connecting-rod length, compression spec, Honda-text valve clearance for R18Z1: not verified.
