---
title: "The Last Diesel Dollar"
subtitle: "A comprehensive cost-benefit analysis of seven energy futures for the Maldives"
summary: "Every energy transition pathway saves the Maldives billions compared to continued diesel dependence. After a year of modelling, the numbers are in: $2.1–4.4 billion in present-value savings across all alternatives, with 70% renewable energy achievable—but time-limited."
authors:
  - admin
tags:
  - Energy
  - Cost-Benefit Analysis
  - Climate
  - Maldives
  - Python
  - Policy
  - Quarto
categories:
  - Policy Analysis
  - Energy Economics
date: 2025-06-24
lastmod: 2025-06-24
featured: true
draft: false

image:
  caption: "Maldives energy transition scenarios"
  focal_point: "Center"
  placement: 2
  preview_only: false

projects: []
---

*Full report and model code at [github.com/lsempe77/CBA_Maldives](https://github.com/lsempe77/CBA_Maldives). The analysis aligns with the Government of Maldives' Road Map for the Energy Sector 2024–2033.*

---

## The Diesel Economy

There's a cargo ship that arrives at Malé every three weeks carrying diesel fuel. It offloads into storage tanks on Thilafushi—the artificial island built from garbage, now the logistical heart of the capital atoll. From there, smaller vessels fan out across the archipelago, delivering fuel to 187 inhabited islands scattered across 90,000 square kilometers of Indian Ocean. On some outer islands, a single rusted generator powers everything: the health post, the school, the water desalination plant, the phone tower. When the diesel shipment is late, life stops.

This is the energy system of the Maldives. It is expensive, fragile, carbon-intensive, and paradoxical: a country that will disappear if sea levels rise continues to burn fossil fuels because it lacks alternatives. The irony is not lost on Maldivians. Neither is the economic reality. Ninety-three per cent of electricity comes from imported diesel. Electricity costs are among the highest in Asia. The fuel import bill consumes foreign reserves that could build hospitals.

The question this analysis answers is whether there's a way out. Not whether clean energy is desirable—everyone agrees it is—but whether the economics actually work. What would it cost to rewire the archipelago? And which pathway makes sense?

The answer: **every alternative beats diesel.** Savings range from $2.1 billion to $4.4 billion in present value over 30 years. The margin is so wide that even the worst-performing alternative delivers substantial net benefits. Solar-plus-battery undercuts diesel on levelised cost. The India submarine cable doesn't pay for itself on the margin. And 70% renewable energy is achievable—but the window is time-limited.

---

## Seven Scenarios

The analysis compares seven scenarios over 30 years (2026–2056) at a 6% social discount rate:

| Scenario | Technology | Key Feature |
|----------|------------|-------------|
| **S1: BAU** | Diesel generators only | No new RE; continued diesel expansion |
| **S2: Full Integration** | India HVDC cable + solar + battery | 700 km submarine cable to India |
| **S3: National Grid** | Solar + battery + inter-island cables | Domestic RE only; limited interconnection |
| **S4: Islanded Green** | Solar + battery (island-by-island) | Modular deployment; no grid extension |
| **S5: Near-Shore Solar** | Solar farms on uninhabited islands | 60 MW on islands near Malé |
| **S6: Maximum RE** | Floating solar + near-shore + wind | Floating solar + 15 MW wind |
| **S7: LNG Transition** | LNG terminal + solar + battery | 50 MW Gulhifalhu LNG from 2030 |

These seven scenarios capture the principal strategic choices available to the Maldives. They differ along four dimensions: technology mix (diesel, solar, wind, battery, LNG, submarine cable), geographic scope (island-by-island versus interconnected), international dependence (domestic-only versus reliance on India), and implementation timeline.

Only S2 involves an international submarine cable. S3–S5 rely entirely on domestic renewables. S6 adds floating solar and wind—the most ambitious domestic pathway. S7 introduces LNG as a bridge fuel for Greater Malé—a pragmatic option that trades maximum decarbonisation for faster payback.

---

## The Results: All Alternatives Beat Diesel

Every alternative pathway generates net economic benefits compared to continued diesel dependence:

| Scenario | NPV Savings | BCR | IRR | Final RE | Emissions |
|----------|------------|-----|-----|----------|-----------|
| S1: BAU | — | — | — | 0% | ~32 Mt |
| S2: Full Integration | ~$2.5B | 1.5× | 10% | 28% | ~10 Mt |
| S3: National Grid | ~$3.2B | 2.2× | 15% | 64% | ~8 Mt |
| S4: Islanded Green | ~$2.8B | 2.0× | 14% | 60% | ~9 Mt |
| S5: Near-Shore Solar | ~$3.5B | 2.4× | 17% | 66% | ~7 Mt |
| S6: Maximum RE | ~$4.4B | 3.0× | 20% | 68% | ~6 Mt |
| S7: LNG Transition | ~$2.1B | 2.8× | 24% | 45% | ~14 Mt |

The magnitude of savings reflects cumulative diesel costs over three decades, which outweigh transition capital. Under BAU, the electricity sector would emit approximately 32 million tonnes of CO₂ and cost billions in fuel imports alone. The cleanest scenario (S6 Maximum RE) cuts cumulative emissions by nearly 80%.

The cost composition differs sharply between diesel and renewable pathways. Under BAU, fuel dominates—roughly 80% of total lifetime costs. Renewable scenarios invert this: capital expenditure becomes the largest component, while fuel costs shrink. Total lifetime system cost falls because avoided fuel outweighs additional capital.

---

## Why 70% Renewable Energy—But Not More

A question of significant policy interest is whether the Maldives can push to 70%, 80%, or higher renewable energy shares by mid-century. The Maximum RE scenario provides the analytical framework, and the results reveal both encouraging progress and sobering structural limits.

**The answer: 70% is achievable but time-limited.** Under Maximum RE, renewable energy reaches approximately 65% by 2035 and peaks around 75% by 2040, temporarily exceeding the 70% threshold, before falling back to around 65% by 2056.

This occurs because renewable capacity is bounded by physical constraints, while electricity demand continues growing at approximately 5% per year. The RE share does not rise monotonically—it peaks and then declines as demand outgrows the fixed supply ceiling.

### The Binding Constraints

**Land scarcity.** The Maldives has only 298 km² of total inhabited island area across nearly 200 islands. Solar PV requires approximately 10 m² per installed kW, and the model caps usable island area at 15% to preserve land for housing, agriculture, and vegetation. On the smallest and most densely populated islands, solar demand exceeds this limit, forcing diesel-hybrid configurations regardless of economics.

**The Malé bottleneck.** Greater Malé—comprising Malé, Hulhumalé, and Villimalé—consumes more than half of national electricity but is among the most densely built urban areas in the world. Rooftop and commercial installations are capped at approximately 34 MWp, supplying only about 15% of Malé's demand. The Near-Shore Solar (S5) and Maximum RE (S6) scenarios exist specifically to break this bottleneck.

**Deployment speed.** Even where economics and land permit, construction logistics impose a practical ceiling of ~85 MW of new solar capacity per year. This reflects the realities of importing equipment to remote atolls, limited port capacity, and the sequential nature of island-by-island installation.

**Storage duration.** The model assumes 4 hours of battery storage per site. Diesel backup therefore remains essential for overnight generation. Doubling storage duration could push RE penetration toward 70–75% on favourable sites, but at current battery prices, the additional storage cost exceeds the fuel savings.

Sustaining RE penetration above 70% beyond the 2040 window would require demand moderation (energy efficiency programmes), floating solar expansion beyond current plans, or accepting that domestic RE share will plateau in the 60–65% range by 2050.

---

## The India Cable: Doesn't Pay for Itself on the Margin

The Full Integration scenario (S2) involves a 700-kilometre HVDC submarine cable connecting the Maldives to India's national grid. Imported electricity would reach Greater Malé at approximately $0.08/kWh. Outer islands would still receive solar-plus-battery systems.

**The cable beats diesel—but it doesn't beat domestic alternatives.**

The incremental analysis reveals that the India cable requires approximately $1 billion in additional capital expenditure beyond what the National Grid domestic scenario (S3) would cost. This additional investment yields:

- **Incremental BCR: <1.0** — marginal costs exceed marginal benefits
- **Incremental IRR: ~4%** — below the 6% hurdle rate
- **Incremental payback: 25+ years**

While S2 saves money versus *diesel* (BCR 1.5×), it does *not* save money versus *domestic solar+battery* (S3). The same capital yields more benefit if invested in solar, battery, and near-shore capacity.

The risks are also substantial. Outage rates for comparable submarine cables (NorNed, Basslink) average 0.3 faults per year, with repair times of one to six months. The Maldives would need to maintain backup diesel capacity, partially undermining fuel savings. And dependence on a single foreign electricity supplier for over half of supply carries diplomatic leverage implications that are difficult to price.

The cable's marginal economics would improve under 50% cost-sharing with India, lower export prices, or domestic solar cost escalation. These conditions are plausible but speculative, which reinforces the argument for deferring the cable decision until domestic options are exhausted.

---

## LNG: The Fast-Payback Trade-Off

The LNG Transition scenario (S7) stands out as the pragmatic bridge. A 50 MW LNG terminal at Gulhifalhu (operational 2030) replaces diesel in Greater Malé. LNG's emission factor is approximately 40% lower than diesel—cleaner and cheaper, but not the deep decarbonisation of renewable pathways.

S7 achieves the **fastest payback** and **highest IRR** (24%)—modest capital plus rapid fuel savings. But it introduces lock-in risk: 25-year gas contracts, maintenance obligations, and institutional inertia. The Maldives would replace diesel dependence with LNG dependence.

This scenario is economically viable, but only if paired with binding RE ramp commitments that prevent LNG from displacing renewables rather than bridging to them.

---

## Key Findings for Decision-Makers

1. **The margin is wide.** Every transition pathway saves billions compared to diesel. Even the worst-performing alternative delivers substantial net benefits. The choice is not whether to transition, but how.

2. **Solar-plus-battery undercuts diesel on levelised cost.** Renewable scenarios approach SIDS averages and, in some cases, near global utility-scale solar costs—remarkable for a small island nation.

3. **The India cable introduces single-point-of-failure risk** and doesn't pay for itself on the margin compared to domestic alternatives. The geopolitical considerations may override economic analysis, but cost-effectiveness evidence points toward domestic options.

4. **70% renewable energy is achievable** in the late 2030s window, but sustaining this level requires either moderating demand growth or expanding floating solar beyond current plans.

5. **Uncertainty doesn't change the answer.** Sensitivity analysis on discount rates, fuel prices, and technology costs confirms that all alternatives dominate diesel across the plausible parameter space. The breakeven diesel price for transition is far below current market prices.

6. **Implementation feasibility matters.** Islanded Green (S4) scores highest on implementation feasibility—proven technology, no regulatory prerequisites, maximal geographic equity. The trade-off is forgone scale economies.

---

## Methodology

The analysis uses a least-cost optimisation engine that assigns technology to each island based on solar resources, land availability, demand, and cable economics. The model runs 30 annual periods with:

- **6% social discount rate** (sensitivity: 4–10%)
- **5% annual demand growth** (based on STELCO historical data)
- **Diesel price escalation** at 2% real per year
- **Battery costs** declining at 5% per year
- **Social cost of carbon** at $50/tonne (sensitivity: $25–$100)

All scenarios include climate adaptation costs for raised foundations and flood-proof substations—mandatory for ADB/World Bank financing. Tourism demand is modelled separately (resort islands have distinct cost structures).

The Quarto-based report includes full sensitivity analysis, Monte Carlo simulation, multi-criteria analysis, distributional impact assessment, fiscal space analysis, and an implementation roadmap.

---

## Conclusion

The Maldives faces an energy transition that is economically compelling, technically feasible, and time-constrained. Every alternative pathway delivers billions in savings compared to continued diesel dependence. The question is not whether to transition, but which pathway balances cost-effectiveness, implementation feasibility, and energy security.

The analysis suggests domestic renewable options—particularly Near-Shore Solar (S5) and Maximum RE (S6)—offer the best combination of economic returns and avoided geopolitical risk. The India cable remains an option but should be deferred until domestic potential is exhausted. LNG provides a fast-payback bridge if deployed with binding RE commitments.

The 70% renewable energy window is open now, but it will not stay open indefinitely. Demand growth is the inexorable denominator. The time for transition is not eventually—it's now.

*Full report, model code, and parameter documentation available at [github.com/lsempe77/CBA_Maldives](https://github.com/lsempe77/CBA_Maldives).*
