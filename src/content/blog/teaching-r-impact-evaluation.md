---
title: "Teaching Impact Evaluation Methods with R"
summary: "A comprehensive course that combines R programming fundamentals with rigorous causal inference methods. From randomized experiments to difference-in-differences, participants learn to implement and interpret impact evaluations."
date: 2026-01-15
authors:
  - admin
tags:
  - R
  - Teaching
  - Impact Evaluation
  - Econometrics
  - Causal Inference
  - Capacity Building
image:
  caption: 'Econometrics with R for impact evaluation'
  focal_point: ''
  placement: 2
  preview_only: false
categories:
  - Education
  - Data Science
featured: false
draft: false
projects: []
external_link: https://github.com/lsempe77/R-course
---

Most impact evaluation courses teach theory without implementation. Most R courses teach programming without application. This course does both: participants learn causal inference methods by implementing them in R, using real evaluation data throughout.

I developed this course running training programs in Latin America, the Middle East, and Africa. The participants were development professionals who needed to both understand and conduct impact evaluations. They had economics backgrounds but varied programming experience. The challenge was teaching rigorous econometrics while simultaneously building R skills.

The solution was integration: every method is introduced through its implementation, and every R concept is motivated by an evaluation problem.

---

## One Program, Six Ways to Measure It

Here's the hook that makes the course work: we analyze the same program with every method. By session ten, participants have estimated the impact of one intervention six different ways—and the estimates don't always agree.

This isn't a bug. It's the point.

A waste management program in a municipality. Households receive subsidized collection services. Health outcomes improve. But *why* do they improve? Is it the program, or would these households have gotten healthier anyway? Each method makes different assumptions about what we can rule out, and each answers a subtly different question.

The first four sessions build R fluency—enough to stop fighting the syntax and start thinking about the analysis. By session four, participants can load data, wrangle it, visualize it, and produce a formatted regression table. They're ready.

Then the real course begins.

---

## The Methods as Detective Tools

**Session 5** starts with failure. We run the naive analyses: compare participants to non-participants, compare before to after. The estimates look plausible. Then we interrogate them. What would have to be true for these numbers to be causal? The assumptions are heroic. Selection bias is everywhere. Participants leave the session appropriately suspicious of simple comparisons—including many they've seen in published reports.

**Session 6** offers redemption: randomization. We analyze a pilot where villages were randomly assigned to receive the program. The math is simple. The interpretation is clean. But the discussion reveals limitations. What if people in treatment villages don't actually sign up? What if the pilot villages aren't representative of where the program will scale? The RCT answers one question precisely while leaving others open.

**Session 7** confronts imperfect take-up. The government promoted the program through community meetings, but attendance was voluntary. Some invited households enrolled; others didn't. We can't just compare enrollees to non-enrollees—that reintroduces selection. Instrumental variables let us use the randomized *invitation* to estimate the effect for those who *complied*. The estimate is local, not universal. Participants learn that "the causal effect" is always "the causal effect for whom?"

**Session 8** exploits a rule. Eligibility for the subsidy depended on a poverty score: below 50, you qualify; above 50, you don't. Households clustered around the cutoff are nearly identical—except some got the program and others didn't. Regression discontinuity recovers the effect right at the threshold. Beautiful graphs make the identification visceral. But the estimate only applies to households near the cutoff. Rich households and deeply poor households remain outside our inference.

**Session 9** leverages timing. The program rolled out to different municipalities in different years. Difference-in-differences compares the change in outcomes for early adopters versus late adopters, before and after implementation. The key assumption—parallel trends—is testable, sort of. We plot pre-treatment trajectories and argue about whether the lines look parallel enough. Participants discover that reasonable people can disagree.

**Session 10** constructs counterfactuals. Matching finds untreated households that look like treated households on observables, then compares outcomes. The estimates depend entirely on which variables we match on. We run the analysis with different specifications and watch the estimates shift. If selection happens on unobservables, we're cooked—but sensitivity analysis tells us how much hidden bias would be needed to overturn our conclusions.

---

## What the Comparison Reveals

By the end, participants have a table with six estimates of "the same" effect. Some are similar. Some aren't. The variation isn't error—it reflects different identifying assumptions, different target populations, and different sources of variation.

The RCT estimate is the cleanest but answers the narrowest question. The matching estimate uses the most data but makes the strongest assumptions. The RDD estimate is the most credible for a specific subgroup but says nothing about anyone else. 

This is what applied causal inference actually looks like: not a single magic number, but a body of evidence from multiple approaches, each with known limitations. The job isn't to find the right method. It's to understand what each method can and cannot tell you, then triangulate.

---

## The Technical Backbone

All of this runs on R. Each session produces publication-ready output: coefficient tables formatted with `modelsummary`, visualizations of treatment effects, diagnostic plots for assumptions. The slides are built in Quarto—participants see the code that generated every figure.

The package ecosystem maps to the methods: `fixest` for difference-in-differences with clustered standard errors, `rdrobust` for regression discontinuity with optimal bandwidth selection, `MatchIt` for propensity score matching with `cobalt` for balance diagnostics, `AER` for instrumental variables. Participants leave with working code they can adapt to their own evaluations.

---

## Ongoing Development

The course continues to evolve. The Abu Dhabi sessions required adapting examples to the Gulf context. Different cohorts surface different questions about methods and implementation. The modular structure makes it easy to emphasize different topics based on participant needs.

All code and slides are publicly available for adaptation.

*The course materials are on [GitHub](https://github.com/lsempe77/R-course).*
