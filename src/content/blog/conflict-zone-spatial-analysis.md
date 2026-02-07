---
title: "Where the Evidence Isn't"
summary: "We kept claiming to have 'research on conflict-affected areas.' But when I overlaid our study locations onto Uppsala's conflict event data, the map told a different story: most research happens in capitals, not combat zones."
date: 2025-10-25
authors:
  - admin
tags:
  - R
  - Spatial Analysis
  - Conflict Research
  - Uppsala GED
  - sf
  - Evidence Gap Maps
  - FCDO
image:
  caption: 'Mapping research evidence against conflict zones'
  focal_point: ''
  placement: 2
  preview_only: false
categories:
  - Data Visualization
  - Research Methods
featured: false
draft: false
projects: []
---

*This analysis was conducted for FCDO's Humanitarian Research and Development programme. The full evidence mapping is published at [FCDO's Global Research Translation and Development portal](https://www.grtd.fcdo.gov.uk/research/evidence-mapping-ofsocial-sciences-methodsused-in-fragile-andconflict-affectedsettings-fcas2015-2025/).*

---

## The Suspicion

I had a suspicion about our evidence map. We had 400 studies tagged as "conflict-affected settings"—research on DRC, South Sudan, Syria, Yemen, all the fragile places. But something felt off. When I read the methods sections, the study sites were almost always Kampala, Nairobi, Beirut, Amman. The capital. The stable city. The place where researchers could fly in, collect data safely, and fly out.

So I tested it. I geocoded every study location in our database, pulled the Uppsala Conflict Data Program's georeferenced event data, and overlaid them. The visual was sobering: clusters of research dots in green zones, and vast empty spaces where the conflict actually happened.

This isn't a methodological critique—there are excellent reasons researchers avoid active combat zones. It's a descriptive finding: the "conflict-affected settings" literature isn't really about conflict. It's about the periphery of conflict, the refugee camps, the stable neighbors, the post-conflict recovery. The places where violence is ongoing remain unstudied.

---

## The Technical Challenge

The technical challenge was getting the geographic data to talk to each other.

Our evidence map had study locations as text strings: "Juba, South Sudan" or "Borno State, Nigeria" or sometimes just "Ethiopia" with no further detail. Uppsala's GED has point data—latitude/longitude for each conflict event. Merging them required geocoding the text strings and spatial joining to conflict polygons.

The geocoding was its own project. I used the tidygeocoder package, which wraps multiple geocoding services. About 70% of locations geocoded correctly on the first pass. The remaining 30% had issues: ambiguous place names (how many cities are called "Victoria"?), transliteration variations (Khartoum vs الخرطوم), administrative unit changes (South Sudan's county names have shifted twice since independence).

For the ambiguous cases, I added country context to the geocoding query and validated manually against Google Maps. This took two days for 400 studies. For a larger corpus, you'd need automated validation or just accept the noise.

---

## The Spatial Join

The spatial join used the sf package in R, which handles geometries elegantly. I buffered each conflict event by 50km to create conflict zones, then counted study locations falling within those zones versus outside them.

The results: **23% of studies were conducted within 50km of a recorded conflict event. 77% were in areas with no recorded violence during the study period.** The "conflict-affected" label, it turns out, usually means "country that has experienced conflict somewhere" rather than "location that has experienced conflict."

Breaking it down by country showed even starker patterns. In DRC, research clusters around Kinshasa and Goma—both relatively stable during the study periods, while the Kasai and Ituri conflicts went almost entirely unstudied. In Nigeria, the Borno State insurgency produced hundreds of conflict events but only a handful of studies, while Lagos (never a conflict zone) produced dozens.

---

## What This Means for External Validity

There's a deeper methodological question here about external validity. Most of what we know about "how interventions work in fragile settings" comes from implementing in stable pockets of fragile countries. Does cash-for-work function the same in Kabul as in a contested village in Helmand? Does community-driven development in Kampala tell us anything about community-driven development in an LRA-affected area of northern Uganda?

The honest answer is: we don't know, because the actually fragile places rarely have studies. The literature offers evidence about post-conflict reconstruction and refugee hosting, not about delivering services under active violence.

This isn't a gap that researchers can easily fill. The barriers are real—security, ethics, access, cost. But we should at least be honest about what the evidence covers. When a policymaker asks "does X work in conflict settings?", the accurate response is often "we have no idea, because the studies were done somewhere else."

---

## The Practical Value

The map is now part of how I present our evidence map to stakeholders. It's useful for managing expectations. It's also useful for identifying genuine gaps: places where violence has subsided enough for research but where the evidence base is still empty. Those are tractable opportunities. The truly active conflict zones may never have rigorous impact evaluations, and perhaps shouldn't—the risk to participants and researchers is too high.

The code is straightforward if you want to replicate for your own evidence base. The hard part isn't the spatial join; it's the geocoding cleanup. Budget more time than you think.

*This work is part of the [FCDO evidence mapping on social science methods in FCAS](https://www.grtd.fcdo.gov.uk/research/evidence-mapping-ofsocial-sciences-methodsused-in-fragile-andconflict-affectedsettings-fcas2015-2025/).*
