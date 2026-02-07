---
title: "The Last Diesel Dollar"
subtitle: "Running the numbers on four energy futures for a sinking nation"
summary: "The Maldives burns diesel on 188 inhabited islands, paying some of the highest electricity costs in Asia. I'm building a 30-year model comparing alternatives—but the preliminary results already show that almost anything beats doing nothing."
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
featured: false
draft: true

image:
  caption: "Maldives energy transition scenarios"
  focal_point: "Center"
  placement: 2
  preview_only: false

projects: []
---

*Code and model are at [github.com/lsempe77/CBA_Maldives](https://github.com/lsempe77/CBA_Maldives). This is work in progress—the model has known gaps that will significantly affect the numbers.*

---

## The Diesel Economy

There's a cargo ship that arrives at Malé every three weeks carrying diesel fuel. It offloads into storage tanks on Thilafushi—the artificial island built from garbage, now the logistical heart of the capital atoll. From there, smaller vessels fan out across the archipelago, delivering fuel to 188 inhabited islands scattered across 90,000 square kilometers of Indian Ocean. On some outer islands, a single rusted generator powers everything: the health post, the school, the water desalination plant, the phone tower. When the diesel shipment is late, life stops.

This is the energy system of the Maldives. It is expensive, fragile, carbon-intensive, and paradoxical: a country that will disappear if sea levels rise continues to burn fossil fuels because it lacks alternatives. The irony is not lost on Maldivians. Neither is the economic reality. Electricity costs are among the highest in Asia. The fuel import bill consumes foreign reserves that could build hospitals. And every year, the system requires maintenance investment in generators that should have been retired a decade ago.

The question I'm trying to answer is whether there's a way out. Not whether clean energy is desirable—everyone agrees it is—but whether the economics actually work. What would it cost to rewire the archipelago? And which pathway makes sense?

---

## Four Scenarios

The analytical challenge is that "rewire the archipelago" could mean several very different things.

**Centralization:** Build a high-voltage cable to India, 700 kilometers across the deep water between Sri Lanka and the northernmost atolls, and import electricity from a grid that's already greening. You solve the generation problem by buying it from someone else.

**Distribution:** Keep the islands separate but replace each diesel generator with solar panels and battery storage. Every island becomes its own microgrid. You sacrifice economies of scale for resilience and political independence.

Between these extremes sit hybrid approaches: connect some islands with submarine cables, import some power from India, but maintain domestic generation capacity. Partial integration.

The model I'm building has four scenarios:

1. **Business as usual.** Keep burning diesel. Maintain existing infrastructure. This is the counterfactual.
2. **Full integration.** Build the HVDC cable to India. Connect major atolls with inter-island cables. Add domestic solar.
3. **National grid without India.** Same inter-island connections, same solar buildout, but no cable to India. Energy independence, but more storage needed.
4. **Islanded green.** No cables at all. Each island gets its own solar-plus-battery microgrid.

For each scenario, I'm projecting annual costs across five categories: capital expenditure (amortized), operations and maintenance, fuel (for scenarios that still burn some), carbon (valued at the social cost of carbon), and transmission losses.

---

## Preliminary Results

Even with the model's current limitations, one finding is robust: doing nothing is expensive.

| Scenario | Total Cost (NPV) | LCOE | CO₂ (Mt) |
|----------|------------------|------|----------|
| Business as usual | $10.5 billion | $0.38/kWh | 47.2 |
| Full integration | $4.9 billion | $0.11/kWh | 8.1 |
| National grid | $5.5 billion | $0.14/kWh | 6.3 |
| Islanded green | $5.7 billion | $0.15/kWh | 5.8 |

The diesel scenario loses because fuel costs compound. You're paying for fuel in year one, year two, year three... year thirty. The upfront capital in the green scenarios is larger, but once you've built the infrastructure, operations are cheap.

But these numbers should be treated with caution.

---

## What the Model Doesn't Yet Capture

The most significant gap is **infrastructure costs beyond the cable itself**. HVDC converter stations typically add 30-50% to submarine cable project costs—and the current model doesn't include them. Landing infrastructure, substations, and grid upgrades are also missing. This means the full integration scenario's cost advantage is probably overstated.

The model is also **entirely aggregate**. I have GIS data for 40 inhabited islands with population and solar resource data, but they're only used for visualization. The "islanded green" scenario doesn't model islands individually—it just applies a cost premium to the national aggregate. This makes it impossible to properly evaluate which islands benefit most from interconnection, or to compare atoll-cluster architectures against a national grid.

**Supply security and geopolitical risk** are unpriced. The full integration scenario makes the Maldives structurally dependent on India for up to 70% of its electricity. The plan discusses cable costs and cost-share, but never prices the sovereignty risk. A 700 km HVDC cable has non-trivial failure probabilities—NorNed has had 3 outages in 15 years, Basslink was down for 6 months in 2015-2016. What happens when the cable goes down?

**Climate adaptation costs** are missing. For a country averaging 1.5 metres above sea level, this isn't a footnote—it's a scenario-defining variable. Solar panels, battery storage, and cable landing stations all sit at sea level. No scenario accounts for raised foundations, seawalls, or flood-proof substations. These are mandatory for any project seeking ADB or World Bank financing.

**Tourism demand** is absent. Resort islands (not in my dataset) may account for 25-40% of national electricity demand, with their own diesel generators and cost structures. This is a major blind spot.

And the benefit side is incomplete. I'm only counting fuel savings and emission reductions. Health co-benefits of reduced diesel pollution, price stability from avoiding oil market volatility, balance of payments improvements—none of these are in the model yet.

---

## The India Cable Question

The cheapest single option—full integration with India—is also the most geopolitically fraught. The base case assumes India pays 70% of the cable cost. This single assumption reduces the Maldives' bill from ~$2.1B to ~$630M, and it's the main reason full integration dominates the results.

Whether this cost-share is realistic, I don't know. There's no precedent cited in my current analysis. The cable crosses deep oceanic trenches that complicate construction. And "cheap imports from India" assumes India will keep exporting power at current rates as they electrify their own billion-plus population.

I need to run sensitivity analysis on this assumption specifically, and probably add scenarios that don't depend on it.

---

## What's Next

The improvement plan has three phases:

**Phase 0** is structural: island-level demand disaggregation, expanded scenarios (including a "realistic BAU" that isn't a straw-man), complete CAPEX/OPEX breakdown with converter stations and ancillary infrastructure, supply security modelling, climate adaptation overlay, and simplified dispatch validation.

**Phase 1** is critical fixes: flag the India cost-share assumption prominently, address demand growth asymmetry across scenarios, add fiscal space analysis, expand benefit valuation.

**Phase 2** is polish: residual values for long-lived assets, dynamic report content, honest labelling of illustrative charts.

The full model upgrade is probably 8-10 weeks of work. The current results are directionally useful—diesel is expensive, transition pathways exist—but not ready for decision-maker circulation.

I'm sharing this because the analytical framework matters even when the numbers are preliminary. The question of how to value supply security risk, how to handle climate adaptation costs in infrastructure CBA, how to model island-level optimization with interconnection options—these are methodological challenges that apply beyond the Maldives.

*Model code and improvement plan available. Comments on methodology especially welcome.*
