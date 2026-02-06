---
title: "The Last Diesel Dollar"
subtitle: "Running the numbers on four energy futures for a sinking nation"
summary: "The Maldives burns diesel on 188 inhabited islands, paying some of the highest electricity costs in Asia for the privilege of contributing nothing to climate change. I built a 30-year model comparing alternatives. The answer is unambiguous: almost anything beats doing nothing."
authors:
  - admin
tags:
  - Energy
  - Cost-Benefit Analysis
  - Climate
  - Maldives
  - Python
  - Policy
categories:
  - Policy Analysis
  - Energy Economics
date: 2026-02-06
lastmod: 2026-02-06
featured: true
draft: false

image:
  caption: "Maldives energy transition scenarios"
  focal_point: "Center"
  placement: 2
  preview_only: false

projects: []
---

There's a cargo ship that arrives at Malé every three weeks carrying diesel fuel. It offloads into storage tanks on Thilafushi—the artificial island built from garbage, now the logistical heart of the capital atoll. From there, smaller vessels fan out across the archipelago, delivering fuel to 188 inhabited islands scattered across 90,000 square kilometers of Indian Ocean. On some outer islands, a single rusted generator powers everything: the health post, the school, the water desalination plant, the phone tower. When the diesel shipment is late, life stops.

This is the energy system of the Maldives. It is expensive, fragile, carbon-intensive, and paradoxical: a country that will disappear if sea levels rise continues to burn fossil fuels because it lacks alternatives. The irony is not lost on Maldivians. Neither is the economic reality. Electricity costs are among the highest in Asia. The fuel import bill consumes foreign reserves that could build hospitals. And every year, the system requires maintenance investment in generators that should have been retired a decade ago.

The question I was asked to answer is whether there's a way out. Not whether clean energy is desirable—everyone agrees it is—but whether the economics actually work. What would it cost to rewire the archipelago? And which pathway makes sense?

---

The analytical challenge is that "rewire the archipelago" could mean several very different things.

One option is centralization: build a high-voltage cable to India, 700 kilometers across the deep water between Sri Lanka and the northernmost atolls, and import electricity from a grid that's already greening. You solve the generation problem by buying it from someone else.

Another option is distribution: keep the islands separate but replace each diesel generator with solar panels and battery storage. Every island becomes its own microgrid. You sacrifice economies of scale for resilience and political independence.

Between these extremes sit hybrid approaches: connect some islands with submarine cables, import some power from India, but maintain domestic generation capacity. Partial integration.

Each option has different capital requirements, different operating costs, different risk profiles, and different political implications. To compare them properly, you need a model that runs forward 30 years and accounts for technology cost evolution, fuel price uncertainty, and the social cost of carbon emissions.

---

The model I built has four scenarios:

**Business as usual.** Keep burning diesel. Maintain existing infrastructure. Maybe modest efficiency gains. This is the counterfactual—what happens if nothing changes.

**Full integration.** Build the HVDC cable to India. Connect the major atolls with inter-island submarine cables. Add domestic solar for daytime demand. Maximize the scale advantages of centralized generation.

**National grid without India.** Same inter-island connections, same solar buildout, but no cable to India. Energy independence, but you need more storage to handle intermittency.

**Islanded green.** No cables at all. Each island gets its own solar-plus-battery microgrid. Maximum resilience, minimum interconnection.

For each scenario, I'm projecting annual costs across five categories: capital expenditure (amortized), operations and maintenance, fuel (for scenarios that still burn some), carbon (valued at $190/tCO₂, the US EPA's social cost estimate), and transmission losses. Everything is discounted back to present value at 6%—the rate the World Bank recommends for Small Island Developing States.

The data work was its own project. Solar irradiance extracted from Global Solar Atlas GeoTIFFs for each island. Battery cost curves from BloombergNEF's latest survey. Diesel prices from Platts Singapore, plus a hefty ocean shipping premium that makes mid-ocean delivery 40% more expensive than mainland. Demand projections from STELCO and UNDP assuming 5% annual growth—plausible given tourism expansion.

Submarine cable costs were the hardest parameter to pin down. Industry estimates range from $2 million to $4 million per kilometer depending on depth, seabed conditions, and whether you're running AC or DC. I'm using $3 million/km as central, with Monte Carlo variation of ±40%. The India-Maldives cable alone, at that rate, runs $2.1 billion—a large number for a country with $6 billion GDP.

---

The results are unambiguous: doing nothing is the most expensive option.

| Scenario | Total Cost (NPV) | LCOE | CO₂ (Mt) |
|----------|------------------|------|----------|
| Business as usual | $10.5 billion | $0.38/kWh | 47.2 |
| Full integration | $4.9 billion | $0.11/kWh | 8.1 |
| National grid | $5.5 billion | $0.14/kWh | 6.3 |
| Islanded green | $5.7 billion | $0.15/kWh | 5.8 |

The diesel scenario loses because fuel costs compound. You're paying for fuel in year one, year two, year three... year thirty. That adds up. The upfront capital in the green scenarios is larger, but once you've built the infrastructure, operations are cheap. Solar panels don't require weekly fuel deliveries.

The cheapest single option—full integration with India—is also the most geopolitically fraught. You're making your electricity supply dependent on a neighbor with a complicated regional posture. The cable crosses deep oceanic trenches that complicate construction. And "cheap imports from India" assumes India will keep exporting power at current rates as they electrify their own billion-plus population.

The national grid option costs more per kWh but offers energy independence. The islanded option costs the most but offers maximum resilience—if a cable fails, only one island goes dark, not the whole system.

---

There's a theoretical issue that haunted the analysis: discount rates.

At 6%, you're weighting near-term costs heavily. This favors diesel, which has low upfront capital and high ongoing fuel costs. At 3%, long-term fuel savings dominate, and the green options look even more attractive. At 8%, you're barely counting what happens in 2050.

Climate economists have fought about discount rates for decades. The Stern Review argued for near-zero rates, valuing future generations equally with the present. Nordhaus argued for market rates, treating climate like any other investment. The debate remains unresolved.

I don't have a principled answer. What I have is sensitivity analysis: results at 4%, 6%, and 8%. The ranking is stable across rates—BAU loses everywhere—but the magnitude of the advantage changes. At 4%, full integration beats diesel by $7 billion. At 8%, the gap shrinks to $4 billion.

There's also the question of how to value carbon. The $190/tCO₂ social cost is a US EPA estimate meant to capture global climate damages. But the Maldives experiences those damages directly—rising seas, coral bleaching, intensified storms—in ways that a dollar figure inadequately represents. If you're building infrastructure that locks in carbon emissions for 30 years, and your country might not exist in 100 years, maybe the social cost is infinite.

---

One mistake I made early on: treating battery storage as a one-time capital cost.

Lithium-ion batteries don't last 30 years. They degrade. A battery installed in 2030 will need replacement around 2042-2045. I initially missed this, which made the islanded scenario look cheaper than it should have. Adding a replacement cycle—roughly every 12-15 years—increased the islanded scenario's NPV by $600 million.

It's still cheaper than diesel. But the margin narrowed, and the lesson is general: energy economics requires thinking about asset lifetimes carefully. A solar panel and a battery are not the same kind of infrastructure, even if they're installed together.

---

The Monte Carlo analysis tells you how robust the conclusions are to uncertainty.

I ran 1,000 iterations varying diesel prices (±30%), solar CAPEX (±20%), cable costs (±40%), and discount rate (4-8%). In every single iteration, business as usual was the most expensive option. The ranking among green alternatives was less stable—there were scenarios where islanded beat national grid, and vice versa—but diesel never won.

This is the key finding for policymakers: you can argue about which green pathway, but you cannot argue that doing nothing is cheaper. The analysis is robust to a wide range of assumptions.

---

Whether any of this translates to policy is a different question.

The Maldives has been talking about green transitions for years. International climate finance is theoretically available. But turning a feasibility study into 700 kilometers of submarine cable requires political will, execution capacity, and financing that small island states often lack. The institutional machinery to procure, contract, and oversee a project of this scale doesn't currently exist in Malé.

My job was to make the economic case as clearly as possible. The case is strong. What happens next is above my pay grade.

{{< icon name="python" pack="fab" >}} Python 3.12 | Quarto | Monte Carlo | GIS | 4 scenarios, 30 years

*Full report forthcoming. Comments welcome.*
