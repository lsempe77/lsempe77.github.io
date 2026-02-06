---
title: "The 122-Sample Illusion"
subtitle: "Why fixed-sample AI screening validation is statistically invalid"
summary: "A popular validation approach suggests sampling just 122 excluded records to validate 95% sensitivity. This is wrong. The same result gives sensitivity guarantees ranging from 60% to 5% depending on review size—a 12-fold difference nobody talks about."
authors:
  - admin
tags:
  - AI
  - Machine Learning
  - Systematic Reviews
  - Statistics
  - Evidence Synthesis
categories:
  - Research Methods
date: 2025-12-24
lastmod: 2025-12-24
featured: true
draft: false

image:
  caption: "AI Screening Validation"
  focal_point: "Center"
  placement: 2
  preview_only: false

projects: []
---

A colleague sent me a link last month, excited about a new AI screening tool. The company selling it claimed their validation was solid: "122 sampled exclusions, zero missed—95% confident sensitivity exceeds 97%."

I ran the numbers. A typical large review has 50,000 excluded records. Finding zero in 122 tells almost nothing—I could still be missing hundreds of relevant studies.

**The core problem in plain language:** When AI screens studies for a systematic review, it decides which studies to exclude. The danger is *false negatives*—relevant studies the AI wrongly threw out. If we miss important evidence, our review's conclusions could be wrong.

To validate the AI, we sample from what it excluded and check: did it miss anything relevant? If we sample 122 and find zero missed, can we trust the AI caught everything?

The answer depends on how big the excluded pile is. And that's where the "122 sample" claim falls apart. Let me walk through the numbers.

---

The confusion centers on two metrics that sound similar but aren't.

**False Omission Rate (FOR)** asks: of the records we excluded, what proportion should have been included? The denominator is excluded records. If I sample 122 excluded records and find zero relevant, I can bound the FOR with reasonable confidence.

$$\text{FOR} = \frac{\text{False Negatives}}{\text{False Negatives} + \text{True Negatives}}$$

**Sensitivity** asks: of all the relevant records that exist, what proportion did we find? The denominator is all relevant records—found and missed. This is what actually matters for systematic reviews.

$$\text{Sensitivity} = \frac{\text{True Positives}}{\text{True Positives} + \text{False Negatives}}$$

The claimed fixed-sample approach controls FOR. But sensitivity depends on FOR *and* the total number of excluded records. Here's the bridge:

$$\text{False Negatives} = \text{FOR} \times \text{Total Excluded}$$

$$\text{Sensitivity} = \frac{\text{Total Included}}{\text{Total Included} + \text{FOR} \times \text{Total Excluded}}$$

When Total Excluded is small, a bounded FOR translates to high sensitivity. When Total Excluded is large—as in any serious systematic review—the same bounded FOR permits enormous numbers of missed studies.

---

Let me make this concrete. Suppose I find zero relevant in 122 sampled exclusions. Using a binomial 97% confidence interval, my upper bound on FOR is about 2.4%. Now apply that to different review sizes:

| Review Size | Excluded | Upper FOR | Max Missed | Min Sensitivity |
|-------------|----------|-----------|------------|-----------------|
| 500 | 400 | 2.4% | 10 | 91% |
| 2,000 | 1,800 | 2.4% | 43 | 82% |
| 10,000 | 9,500 | 2.4% | 228 | 47% |
| 50,000 | 49,000 | 2.4% | 1,176 | 5% |

The same validation result—zero in 122—gives I 91% minimum sensitivity in a small review and 5% minimum sensitivity in a large one. That's not a confidence interval; that's the difference between "validated" and "useless."

The fixed-sample approach assumes the denominator doesn't matter. It does.

---

The theoretically correct approach comes from [Callaghan and Müller-Hansen (2020)](https://doi.org/10.1186/s13643-020-01521-4), and it's worth understanding why it works.

Instead of sampling from excluded records alone, the method samples from *remaining unscreened records*—the pool that still might contain relevant studies. It uses hypergeometric hypothesis testing (yes, that's a real thing and not an old spell), which accounts for the finite population and the proportion already screened. And critically, the sample size scales with the number of remaining records.

The intuition: if I've screened 80% of my database and found 200 relevant studies, the remaining 20% probably contains proportionally fewer relevant studies—but I need to sample enough to bound that remaining risk. A small fixed sample can't do this when the remaining pool is large.

The stopping rule they propose continues sampling until one can reject the null hypothesis that sensitivity falls below the target threshold (typically 95%). For large reviews, this means sampling 60-80% of remaining records before claiming high sensitivity with confidence.

This is more expensive than checking 122 records. That's because validating high sensitivity in large reviews is genuinely harder—the fixed-sample approach just pretends it isn't.

---

I've implemented both approaches in a simulation. Generate 10,000 synthetic reviews with known sensitivity levels, apply each validation method, and check how often they correctly identify reviews with sensitivity below 95%.

The fixed-sample approach has a false negative rate that scales with review size. For reviews with true sensitivity of 85%, the fixed-sample method fails to flag the problem in 60% of cases when the review is large. The adaptive approach catches it in 95% of cases regardless of size—exactly what we want from a validation method.

The code and simulation results are in my GitHub. The takeaway is simple: if someone claims they validated AI screening sensitivity with 122 samples, ask how big their excluded pool was. If it's more than a few hundred, their validation is statistically meaningless.

---

I don't think the vendors promoting the fixed-sample approach are being dishonest. I think they made a mathematical error—confusing a conditional probability (FOR) with a marginal probability (sensitivity). It's the kind of mistake that's easy to make and hard to spot without writing out the formulas.

But the consequence is that systematic reviews are now being published with false confidence in their screening completeness. The AI tools are often quite good; the validation just can't tell us whether they're good enough. Until the field adopts proper stopping criteria, we're flying blind.

---

## The Bottom Line

**If someone says they validated AI screening with 122 samples:**

1. Ask how big their excluded pool was
2. If it's more than a few hundred records, their validation is statistically meaningless
3. Point them to [Callaghan & Müller-Hansen (2020)](https://doi.org/10.1186/s13643-020-01521-4) for proper methods

For those who want to implement proper validation, there's an R package ([buscarR](https://github.com/mcallaghan/buscarR)) that does the adaptive stopping correctly. The math is handled for you.

*Code and simulation for this post available on request.*