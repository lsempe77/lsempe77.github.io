---
title: "When Regression Isn't Enough"
summary: "Performance-based financing works sometimes. Understanding why requires moving beyond 'what's the average effect' to 'what combinations of conditions produce success.' Qualitative Comparative Analysis offers a different logic."
date: 2020-10-20
authors:
  - admin
tags:
  - QCA
  - Health Systems
  - Complexity
  - Evaluation Methods
  - R
image:
  caption: 'Qualitative Comparative Analysis'
  focal_point: ''
  placement: 2
  preview_only: false
categories:
  - Research Methods
  - Health
featured: false
draft: false
projects: []
external_link: https://github.com/lsempe77/qca-health-systems
---

Performance-based financing (PBF) in health systems has a spotty track record. Some programs improve service delivery dramatically. Others show no effect. A few might even cause harm. Meta-analyses report modest average effects with high heterogeneity—the polite way of saying "it depends."

But depends on what?

Standard evaluation methods struggle with this question. Regression tells you whether an average effect exists after controlling for covariates. Subgroup analysis asks whether effects differ by one dimension at a time. Neither approach handles the reality that success might require specific *combinations* of conditions—combinations that don't reduce to additive effects.

That's where Qualitative Comparative Analysis comes in.

---

## The Logic of Configuration

QCA starts from a different premise than regression. Instead of asking "what's the marginal effect of X holding other things constant?", QCA asks "what combinations of conditions are sufficient for the outcome?"

The distinction matters. Imagine PBF works when you have strong financial management *and* community engagement *and* reliable supply chains—but fails if any one of these is absent. Regression would show weak main effects because each condition alone doesn't predict success. QCA would identify the configuration directly.

This configurational thinking is natural for practitioners. Program managers don't say "increase financial management by one standard deviation." They say "we need good bookkeeping, engaged communities, and supplies that arrive on time—all three, or we're wasting money."

---

## Fuzzy Sets

Classical QCA uses binary conditions: present or absent. But real-world concepts are rarely binary. Is financial management "strong" or "weak"? The answer is usually "somewhat strong" or "fairly weak"—a matter of degree.

Fuzzy-set QCA handles this through calibration. Each case gets a membership score between 0 and 1 for each condition. A score of 0.8 means "mostly in" the set of cases with strong financial management. A score of 0.3 means "mostly out." The crossover point at 0.5 represents maximum ambiguity.

Calibration requires substantive knowledge. You need to decide: what level of financial management counts as fully in? What counts as fully out? These are judgment calls, grounded in expertise about the domain. The method doesn't hide these judgments—it makes them explicit and debatable.

---

## Applying QCA to PBF

For our study, we examined performance-based financing programs across multiple countries, looking at maternal and child health outcomes. Each case was a program implementation in a specific context.

The conditions we examined included:

- **Financial management capacity**: Could facilities actually track and manage performance payments?
- **Community accountability**: Were there functioning mechanisms for communities to hold providers accountable?
- **Supply chain reliability**: Did facilities have the drugs and supplies needed to deliver services?
- **Provider motivation baseline**: Were health workers already reasonably motivated, or deeply demoralized?
- **Contextual stability**: Was the program operating in a stable environment or amid conflict/crisis?

The outcome was improvement in maternal and neonatal care indicators—composite measures of antenatal care coverage, institutional delivery, and postnatal follow-up.

---

## What We Found

The analysis revealed multiple paths to success—and that was itself a finding. There wasn't one configuration that produced improvement; there were several.

One path combined strong financial management with reliable supply chains, even when community accountability was weak. The mechanism appeared to be: payments worked when providers could actually respond to incentives (supplies available) and when the payment system functioned (good bookkeeping).

Another path combined community accountability with provider motivation, even when supply chains were unreliable. The mechanism here was different: engaged communities put social pressure on providers, who were motivated enough to find workarounds for supply problems.

Programs failed when they had neither path available—weak management combined with demoralized providers and absent communities. No amount of financial incentive overcomes a system where no one can track payments, no one cares, and no one is watching.

---

## Necessity and Sufficiency

QCA distinguishes between necessary and sufficient conditions—a distinction regression obscures.

A necessary condition must be present for the outcome to occur, though its presence alone doesn't guarantee the outcome. In our analysis, basic facility functionality was necessary: programs couldn't succeed in facilities that lacked electricity and running water, regardless of other conditions.

Sufficient configurations, by contrast, reliably produce the outcome when present. Our two paths above were approximately sufficient: programs with those configurations usually succeeded.

This distinction matters for policy. If a condition is necessary, you must ensure it before anything else. If multiple configurations are sufficient, you have options—choose the path that's feasible in your context.

---

## Limitations and Complements

QCA isn't a replacement for other methods; it's a complement. It works best with medium-N samples (10-50 cases) where you have deep knowledge of each case. It requires substantial judgment in calibration. It assumes you've identified the right conditions—omitting an important one undermines the analysis.

For large-N samples with standardized measurements, regression remains appropriate. For single-case understanding, qualitative process tracing goes deeper. QCA occupies a middle ground: systematically comparative, but attentive to configurational complexity.

The scripts and data calibration approach are documented in the repository, allowing replication and extension.

*The analysis code is on [GitHub](https://github.com/lsempe77/qca-health-systems).*
