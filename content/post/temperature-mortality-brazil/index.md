---
title: "The Mortality Equation Brazil Doesn't Know It Needs"
subtitle: "Counting deaths across 35 degrees of latitude"
summary: "Every year, temperature kills tens of thousands of Brazilians—more from cold than heat. But the country doesn't have the epidemiological infrastructure to know exactly where or how many. This is my attempt to build it."
authors:
  - admin
tags:
  - Climate
  - Epidemiology
  - Public Health
  - DLNM
  - Brazil
  - R
  - Python
categories:
  - Research Methods
  - Climate Health
date: 2026-02-06
lastmod: 2026-02-06
featured: true
draft: false

image:
  caption: "Temperature-mortality relationship in Brazil"
  focal_point: "Center"
  placement: 2
  preview_only: false

projects: []
---

In the winter of 2021, a cold snap swept through southern Brazil. Temperatures in Paraná dropped below freezing for consecutive nights—unusual for a region that thinks of itself as subtropical. Homeless encampments reported deaths. Rural workers in unheated homes fell ill. But when I looked for mortality data that year, the deaths didn't register as cold-related. They appeared as heart attacks, strokes, respiratory failure. The cold was invisible in the statistics.

This is the paradox at the heart of climate epidemiology: temperature kills people without leaving a clear signature. There's no cause-of-death code for "it was too hot" or "they couldn't afford heating." The mortality is real but statistically distributed across cardiovascular disease, pneumonia, and renal failure—deaths that would have happened eventually but happened sooner because of thermal stress. To see temperature's fingerprint, you have to look at patterns, not individual cases. You need the entire time series.

That's what brought me to this project: an attempt to quantify temperature-attributable mortality across all of Brazil, not just São Paulo (which has been studied to death, literally), but the full 8.5 million square kilometers—from the equatorial Amazon where it never drops below 20°C to the pampas where frost kills crops every winter.

---

The theoretical challenge is what economists call the "intensive margin problem" applied to mortality. Temperature doesn't create a new type of death; it accelerates deaths that were going to happen. A 78-year-old with congestive heart failure dies a week earlier because the heat stressed his system. A diabetic woman's renal function tips from barely-adequate to fatal because a cold night caused vasoconstriction. These deaths are real—they represent real years of life lost—but they're hidden inside other diagnoses.

The method that solves this is something called a Distributed Lag Non-Linear Model, and understanding why it works requires understanding what makes temperature mortality different from most exposure-outcome relationships.

First, the effect is non-linear. Both heat and cold increase mortality, creating a U-shaped curve with a comfortable optimum in the middle. But the shapes differ: heat effects are steep and concentrated (a 3°C increase above the optimum might double mortality), while cold effects are gradual and extended (the same 3°C below optimum might increase mortality by only 20%, but the effect accumulates over weeks).

Second, the effect is lagged. Heat kills fast—most of the excess deaths show up within 48 hours. Cold kills slowly—the mortality accumulation stretches over two to three weeks. If you only look at same-day associations, you'll see heat clearly but miss most of cold's burden.

The DLNM captures both features simultaneously. You model the joint relationship between temperature and lag as a smooth surface:

$$\log(\mu_t) = \alpha + s(T_t, \text{lag}; \theta) + \text{ns}(\text{time}, 7/\text{year}) + \text{dow}_t + \text{holiday}_t$$

where $s(T_t, \text{lag}; \theta)$ is a tensor product of splines—flexibility in both dimensions. The natural spline for time, with 7 degrees of freedom per year, controls for long-term trends and seasonality without absorbing the temperature signal you're trying to measure. Antonio Gasparrini, who developed much of this framework, deserves enormous credit for making the mathematics tractable and the R implementation usable.

---

Implementing this across Brazil required data infrastructure that didn't exist. Death records from the Sistema de Informação sobre Mortalidade going back to 2010—18 million deaths over 15 years. Daily temperature readings from 300+ INMET weather stations. Satellite-derived air pollution from Copernicus, because heat waves and PM2.5 travel together and you can't attribute deaths to temperature without controlling for what else might be killing people.

The merging was an exercise in geographic humility. Weather stations don't align with municipal boundaries. Some stations have gaps. The mortality data uses health region coding that changed in 2017. Remote Amazon regions have one station covering an area the size of Portugal. I spent two weeks on crosswalks alone, and I'm still not confident about coverage in Amazonas and Roraima.

Eventually I had a panel: 160 health regions, 15 years of daily data. And then the models started failing.

Some regions wouldn't converge—the optimizer would spiral off to infinity or return standard errors ten times the point estimate. I eventually traced this to sparse data: small-population regions with days of zero deaths, which quasi-Poisson estimation handles poorly. The fix was aggregation—combining small regions upward until the daily counts were stable enough for reliable estimation. Geographic resolution traded for statistical stability.

---

The results have already taught me something I didn't expect: cold kills more than heat.

This finding is consistent with European and North American literature but counterintuitive for a tropical country. Brazil's image is beaches and Carnaval, not hypothermia. But when you integrate over the full lag structure—the 21 days during which cold exposure accumulates into mortality—cold dominates in almost every region, including some northern ones.

The mechanism is physiological. Cold causes vasoconstriction, which raises blood pressure, which stresses cardiac systems. It also impairs immune function, which invites respiratory infections that progress to pneumonia. These effects take time to kill. Heat, by contrast, overwhelms thermoregulatory systems quickly—dehydration, electrolyte imbalance, direct hyperthermia. Most heat deaths happen within 72 hours. Most cold deaths take weeks.

This lag structure has implications for policy. A heat wave is a visible emergency: temperatures spike, hospitals fill, newspapers report deaths, governments respond. A cold snap is invisible: the deaths accumulate slowly, spread across weeks, distributed across diagnosis codes. There's no moment when "cold is killing us" becomes obvious. By the time you'd notice in aggregate mortality data, the cold snap is over.

The most theoretically interesting pattern is geographic: the minimum mortality temperature follows latitude almost perfectly. In Manaus, people die least around 26°C. In Porto Alegre, it's closer to 18°C. This gradient suggests acclimatization works—populations adapt their physiology, behavior, and infrastructure to local climate, shifting vulnerability thresholds accordingly.

But here's what's strange: the *shape* of the cold curve varies far more than the heat curve. Heat effects look similar everywhere—steep mortality increase above the MMT, concentrated at short lags. Cold effects are heterogeneous. Some regions show gradual increases with decreasing temperature. Others show threshold effects: nothing happens until 15°C, then mortality jumps. Santa Catarina and Rio Grande do Sul, which have similar climates and latitudes, have quite different cold-mortality functions.

Why? I have hypotheses but not answers. Housing quality—concrete versus wood construction, presence of heating—varies dramatically. Behavioral responses differ: whether people stay indoors, whether they can afford blankets, whether they're sleeping rough. Health system capacity to handle cold-related complications (which present as cardiac events, not as "cold exposure") might matter. This heterogeneity is actually the most policy-relevant finding: cold doesn't kill uniformly, which means interventions shouldn't be uniform either.

---

The burden calculation is where things get philosophically messy.

Going from relative risks to death counts requires choosing a counterfactual. Deaths attributable to temperature compared to *what*? You have options: the minimum mortality temperature (what if every day were optimal?), the mean temperature (what if variance went to zero?), some arbitrary threshold (20°C for cold, 30°C for heat?). Different choices produce estimates that vary by a factor of two.

There's also the harvesting problem. Some fraction of heat-wave deaths represent mortality displacement—people who would have died within days anyway, whose deaths were accelerated by thermal stress. In the week following a heat wave, you sometimes see mortality deficits that partially offset the initial spike. How much harvesting adjustment should reduce your burden estimate is genuinely contested.

My current estimate—provisional, sensitivity analyses ongoing—is 30,000 to 50,000 temperature-attributable deaths per year nationally, with cold contributing roughly 60% of the burden. These numbers would make temperature a top-ten mortality risk factor in Brazil, comparable to traffic accidents, ahead of homicide outside the most violent states. But "comparable to traffic accidents" comes with wide confidence intervals that I'm not yet willing to narrow.

---

The project has one more methodological wrinkle I'm testing: using El Niño/La Niña cycles as an instrumental variable.

The logic: ENSO phases provide exogenous temperature variation uncorrelated with the usual confounders. When El Niño shifts Pacific sea surface temperatures, Brazil's weather responds—droughts in the north, unusual cold in the south—in ways that aren't driven by local pollution, economic activity, or health system changes. If IV estimates from ENSO-induced temperature variation match the time-series estimates, that's validation. If they diverge, something interesting is happening.

Early results suggest the estimates converge, which is reassuring but not definitive. I'm presenting this at the Lancet Planetary Health conference in May, hoping for critical feedback before the paper is finalized. The submission is probably six months out—there's stratification by age, sex, and cause of death still to complete.

What I keep coming back to is that 2021 cold snap in Paraná. Somewhere in my data, those deaths exist—not as cold deaths, but as cardiac arrests and respiratory failures and strokes in unheated homes. The epidemiology captures them only because it treats the whole population as a time series rather than looking for a smoking gun in individual cases. This is the peculiar power of environmental epidemiology: making visible what would otherwise remain a coincidence of timing.

{{< icon name="python" pack="fab" >}} Python 3.12 | {{< icon name="r-project" pack="fab" >}} R 4.4 | 160 health regions | 15 years | DLNM/mvmeta

*Results forthcoming. Lancet Planetary Health submission targeted for late 2026.*
