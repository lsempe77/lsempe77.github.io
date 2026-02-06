---
title: "Inference Under Scarcity"
summary: "Nineteen treatment arms. Five to ten participants each. Most effects are null, but three are real. Can standard methods find them? No. Can we still learn something useful? Yes—but only if we're honest about what 'learning' means here."
date: 2026-01-05
authors:
  - admin
tags:
  - Statistics
  - Small Samples
  - Research Methods
categories:
  - Statistics
featured: true
---

A colleague came to me with a problem that made me wince. They had piloted an intervention with different components and dosages—various combinations, various intensities. Reasonable experimental design. But by the time they'd crossed all the factors, they had 19 treatment arms with barely 5-10 participants in each.

"How do we analyze this?" they asked.

The honest answer is: carefully, and with modest expectations. The textbook answer—"collect more data"—wasn't available. Budget spent, pilot complete, analysis required. This is the hand they were dealt.

---

## The situation is common

Especially in fragile and conflict-affected settings where primary data collection is expensive, dangerous, or both. You can't always get the sample sizes you want. The question becomes: what can you responsibly learn from the sample you have?

Let me set up the problem concretely. Imagine 19 arms with unequal samples, where most treatments genuinely do nothing, but three of them—arms 17, 18, and 19—have real effects of 0.8, 1.0, and 1.2 standard deviations. These are large effects, and that matters: detecting small effects with this sample size is essentially impossible.

124 people spread across 19 arms. Some arms have only 5 observations. The signal-to-noise ratio is terrible. Perfect—this is exactly the situation we need to learn how to handle.

---

## The standard toolkit fails

I ran the usual analyses. ANOVA: p = 0.395. Pairwise t-tests with Bonferroni correction: smallest adjusted p-value 0.21. Complete silence.

The standard toolkit has spoken: no significant differences. Move along, nothing to see here.

But wait—I *know* there are real effects hiding in arms 17, 18, and 19. What gives?

This is small samples for you: **the noise is louder than the signal**. Three real effects, completely invisible to conventional methods.

---

## The screening mindset

Here's the key insight: in underpowered studies, you're not confirming effects. You're **screening**—figuring out what's worth a second look and what you can quietly drop.

When I ran permutation-based pairwise comparisons (more robust than t-tests for small samples), the arms with real effects floated toward the top of the ranking:

| Rank | Arm | True Effect | Raw p-value |
|------|-----|-------------|-------------|
| 1 | 19 | 1.2 SD ✓ | 0.015 |
| 2 | 9 | 0 | 0.115 |
| 3 | 7 | 0 | 0.191 |
| 5 | 18 | 1.0 SD ✓ | 0.257 |
| 6 | 17 | 0.8 SD ✓ | 0.285 |

The true signal arms landed at #1, #5, and #6. Mixed in with noise, yes. But they floated toward the top.

That's what you can expect from a screening exercise: imperfect signal, honest about its imperfection.

---

## What actually works

After testing multiple approaches, here's what I learned:

**1. Permutation tests give valid p-values even when n is tiny.** They don't assume normality or equal variances. When your sample is 5 people, that matters.

**2. FDR (false discovery rate) is your friend for screening.** Unlike Bonferroni, which controls the chance of *any* false positive, FDR controls the *proportion* of false positives among your discoveries. More lenient, better for exploratory work.

**3. Pooling by design unlocks power.** If you knew before the study that arms 17-19 were "high intensity" interventions, you can combine them. Instead of comparing 5 participants to control, you're comparing 17. My p-value went from 0.39 (all arms separate) to 0.013 (signal group vs. others).

**4. Confidence intervals tell the real story.** Even arm 19—with a true effect of 1.2 SD—had a 95% interval spanning from 0.15 to 3.21. That's a 3-unit range. Massive uncertainty.

---

## The uncomfortable bottom line

If you came here hoping for a trick that would turn your underpowered study into a discovery machine, I don't have one. Nobody does.

What you *can* do:

1. **Screen honestly.** Use permutation tests. Report the ranking, not just the "significant" results.

2. **Show the uncertainty.** Those ugly wide confidence intervals? Display them. Let people see how little you actually know.

3. **Pool strategically.** If you have theoretical reasons to group arms, do it *before* looking at the data. You'll gain power without cheating.

4. **Resist temptation.** When nothing reaches significance, the urge to peek at the data and "refine" your analysis is overwhelming. Don't.

5. **Frame it correctly.** You're not here to declare winners. You're here to decide what's worth a second look.

This isn't satisfying. It doesn't produce the clean, quotable result that makes it into the abstract. But it's real—and in a field full of overconfident claims from underpowered studies, real is valuable.

---

## Want the technical details?

I've written a [companion tutorial](../small-sample-tutorial) with all the R code: permutation tests, FDR adjustment, Max-T for confirmatory claims, blocked designs, shrinkage estimators, and the pooling strategies that work (and don't). If you're facing this problem in practice, that's where to go.

*The uncomfortable truth about small samples is that there's no magic. Just honesty about uncertainty—and a clear distinction between screening and confirmation.*
