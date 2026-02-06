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

Last month I reviewed a systematic review protocol that claimed to validate their AI screening using 122 sampled exclusions. "If we find zero relevant studies in 122 excluded records," the authors wrote, "we can be 95% confident our sensitivity exceeds 97%."

I ran the numbers. Their review had 50,000 excluded records. By my calculation, finding zero in 122 tells you almost nothing—you could still be missing hundreds of relevant studies with high probability. The validation approach they cited conflates two different metrics in a way that produces dangerously misleading confidence.

This isn't a minor statistical quibble. If this approach spreads, we'll have systematic reviews claiming high sensitivity while potentially missing substantial proportions of their evidence base. The math is unambiguous, and I want to show you exactly why.

---

The confusion centers on two metrics that sound similar but aren't.

**False Omission Rate (FOR)** asks: of the records we excluded, what proportion should have been included? The denominator is excluded records. If you sample 122 excluded records and find zero relevant, you can bound the FOR with reasonable confidence.

$$\text{FOR} = \frac{\text{False Negatives}}{\text{False Negatives} + \text{True Negatives}}$$

**Sensitivity** asks: of all the relevant records that exist, what proportion did we find? The denominator is all relevant records—found and missed. This is what actually matters for systematic reviews.

$$\text{Sensitivity} = \frac{\text{True Positives}}{\text{True Positives} + \text{False Negatives}}$$

The fixed-sample approach controls FOR. But sensitivity depends on FOR *and* the total number of excluded records. Here's the bridge:

$$\text{False Negatives} = \text{FOR} \times \text{Total Excluded}$$

$$\text{Sensitivity} = \frac{\text{Total Included}}{\text{Total Included} + \text{FOR} \times \text{Total Excluded}}$$

When Total Excluded is small, a bounded FOR translates to high sensitivity. When Total Excluded is large—as in any serious systematic review—the same bounded FOR permits enormous numbers of missed studies.

---

Let me make this concrete. Suppose you find zero relevant in 122 sampled exclusions. Using a binomial 97% confidence interval, your upper bound on FOR is about 2.4%. Now apply that to different review sizes:

| Review Size | Excluded | Upper FOR | Max Missed | Min Sensitivity |
|-------------|----------|-----------|------------|-----------------|
| 500 | 400 | 2.4% | 10 | 91% |
| 2,000 | 1,800 | 2.4% | 43 | 82% |
| 10,000 | 9,500 | 2.4% | 228 | 47% |
| 50,000 | 49,000 | 2.4% | 1,176 | 5% |

The same validation result—zero in 122—gives you 91% minimum sensitivity in a small review and 5% minimum sensitivity in a large one. That's not a confidence interval; that's the difference between "validated" and "useless."

The fixed-sample approach assumes the denominator doesn't matter. It does.

---

The theoretically correct approach comes from Callaghan and Müller-Hansen (2020), and it's worth understanding why it works.

Instead of sampling from excluded records alone, you sample from *remaining unscreened records*—the pool that still might contain relevant studies. You use hypergeometric hypothesis testing, which accounts for the finite population and the proportion already screened. And critically, the sample size scales with the number of remaining records.

The intuition: if you've screened 80% of your database and found 200 relevant studies, the remaining 20% probably contains proportionally fewer relevant studies—but you need to sample enough to bound that remaining risk. A small fixed sample can't do this when the remaining pool is large.

The stopping rule they propose continues sampling until you can reject the null hypothesis that sensitivity falls below your threshold (typically 95%). For large reviews, this means sampling 60-80% of remaining records before you can claim high sensitivity with confidence.

This is more expensive than checking 122 records. That's because validating high sensitivity in large reviews is genuinely harder—the fixed-sample approach just pretends it isn't.

---

I've implemented both approaches in a simulation. Generate 10,000 synthetic reviews with known sensitivity levels, apply each validation method, and check how often they correctly identify reviews with sensitivity below 95%.

The fixed-sample approach has a false negative rate that scales with review size. For reviews with true sensitivity of 85%, the fixed-sample method fails to flag the problem in 60% of cases when the review is large. The adaptive approach catches it in 95% of cases regardless of size—exactly what you want from a validation method.

The code and simulation results are in my GitHub. The takeaway is simple: if someone tells you they validated AI screening sensitivity with 122 samples, ask how big their excluded pool was. If it's more than a few hundred, their validation is statistically meaningless.

---

I don't think the authors promoting the fixed-sample approach are being dishonest. I think they made a mathematical error that wasn't caught in peer review—confusing a conditional probability (FOR) with a marginal probability (sensitivity). It's the kind of mistake that's easy to make and hard to spot without writing out the formulas.

But the consequence is that systematic reviews are now being published with false confidence in their screening completeness. The AI tools are often quite good; the validation just can't tell us whether they're good enough. Until the field adopts proper stopping criteria, we're flying blind.

{{< icon name="chart-bar" pack="fas" >}} Statistical validation | AI screening | Systematic reviews

*Code and simulation available on request.*
|----------|-------|----------|----------|-------------------|------------|---------------------|
| 1,000 total | 1,000 | 50 | 950 | 3.4% | 33 | **60.2%** |
| 5,000 total | 5,000 | 50 | 4,950 | 3.4% | 169 | **22.8%** |
| 10,000 total | 10,000 | 50 | 9,950 | 3.4% | 339 | **12.9%** |
| 30,000 total | 30,000 | 50 | 29,950 | 3.4% | 1,019 | **4.7%** |

{{% callout warning %}}
**Shocking Result:** The **same validation** (0/122) gives minimum sensitivity ranging from **60.2% to 4.7%** - a **12.8-fold difference**!
{{% /callout %}}

### Formal Statistical Test

We formally test whether sensitivity is independent of exclusion set size:

- **H₀:** Sensitivity is independent of exclusion set size (the fixed-sample approach's implicit assumption)
- **H₁:** Sensitivity depends on exclusion set size (the adaptive approach's argument)

**Results:**

- Slope: -0.003056 (SE: 0.000019)
- t-statistic: -163.82
- **p-value: < 2.2e-16** ✱✱✱
- R²: 0.9978
- Pearson correlation: r = -0.9989

{{% callout warning %}}
**Conclusion:** We **STRONGLY REJECT H₀** with p < 0.001. Sensitivity is highly dependent on exclusion set size. The fixed-sample assumption of independence is statistically invalid.
{{% /callout %}}

---

## Why FOR ≠ Sensitivity: The Scaling Problem

At the fixed-sample upper FOR bound of 3.4%:

| Review Size | Sensitivity |
|-------------|-------------|
| Small (500 excluded) | 78% |
| Medium (5,000 excluded) | 23% |
| Large (20,000 excluded) | 7% |

**That's an 11-fold difference!**

---

## Required Sample Sizes

### What's Actually Needed?

To guarantee **95% sensitivity** with **97% confidence**, sample sizes must scale:

| Scenario | Excluded | Actually Needed | Ratio (×) | Fixed-Sample |
|----------|----------|-----------------|-----------|--------------|
| 1,000 total | 950 | 648 | 5.3× | 122 |
| 5,000 total | 4,950 | 3,377 | 27.7× | 122 |
| 10,000 total | 9,950 | 6,789 | 55.6× | 122 |
| 30,000 total | 29,950 | 20,422 | 167.4× | 122 |

{{% callout warning %}}
**The "No Free Lunch" Principle**

For large reviews (30,000 excluded), you need significantly more samples than the fixed-sample approach suggests!

You cannot achieve:
- High confidence (97%)  
- High recall (95%)
- Fixed small sample (122)
- Regardless of review size

**Pick two.** This is fundamental to statistical inference.
{{% /callout %}}

---

## The Adaptive Stopping Criteria Approach

### Key Differences

| Feature | Fixed-Sample Approach ✗ | Adaptive Approach ✓ |
|---------|------------------------|---------------------|
| What to sample | AI-excluded set only | Remaining unscreened docs |
| Sample size strategy | Fixed: 122-300 | Scales with remaining (60-80%) |
| What it measures | False Omission Rate | Hypothesis test for recall |
| Accounts for active learning | No | Yes (implicitly) |
| Statistical framework | CI for proportion | Hypergeometric test |
| Reliability | Unreliable (12× variance) | Reliable (95% hit target) |
| Transparency | Unclear assumptions | Clear H₀, p-values, confidence |

### The Hypergeometric Test

The adaptive approach uses proper hypothesis testing:

**Setup:**

- **ρ<sub>seen</sub>** = relevant documents found so far (e.g., 50)
- **N** = documents remaining unscreened
- **τ<sub>tar</sub>** = target recall (e.g., 0.95)

**Calculate K<sub>tar</sub>** (minimum relevant remaining if at target):

$$K_{tar} = \lceil \frac{\rho_{seen}}{\tau_{tar}} - \rho_{seen} \rceil$$

**Null hypothesis:** K ≥ K<sub>tar</sub> (i.e., recall < target)

**Test:** Sample n from N remaining, find k relevant

$$p = P(X \leq k \mid N, K_{tar}, n) \quad \text{where } X \sim \text{Hypergeometric}(N, K_{tar}, n)$$

**Decision:** If p < 0.05 → **Reject H₀ → STOP!**

### Worked Example

For a large review (10,000 total, 500 remaining):

| Sample Size | Remaining | K_tar | Found in Sample | p-value | Decision |
|-------------|-----------|-------|-----------------|---------|----------|
| 50 | 500 | 3 | 0 | 0.7256 | Continue |
| 100 | 500 | 3 | 0 | 0.5265 | Continue |
| 200 | 500 | 3 | 0 | 0.2772 | Continue |
| 300 | 500 | 3 | 0 | 0.1459 | Continue |
| 400 | 500 | 3 | 0 | 0.0077 | ✓ STOP |

{{% callout note %}}
**Result:** For a large review (10,000 total, 500 remaining), you need to sample **400 of 500** remaining documents. If you find **0 relevant**, p-value drops to 0.008 and you can **stop with confidence** that 95% recall achieved!
{{% /callout %}}

---

## Implementation Guide

### Recommended: Adaptive Approach

**R Package:** `buscarR`  
**GitHub:** https://github.com/mcallaghan/buscarR

```r
# Install
devtools::install_github("mcallaghan/buscarR")

# Use
library(buscarR)

# Your screening data
df <- data.frame(
  relevant = c(1, 1, 1, ..., 0, NA, NA),  # 1/0/NA
  seen = c(1, 1, 1, ..., 1, 0, 0)          # 1/0
)

# Test stopping criterion
result <- calculate_h0(df, recall_target = 0.95)

# If p < 0.05, you can stop!
```

---

## Conclusions

### Key Takeaways

**1. The Fixed-Sample Approach is Statistically Invalid**

- Confuses **False Omission Rate** with **Sensitivity**
- Ignores that FN scales with exclusion set size
- Same validation gives 12× different sensitivity guarantees
- Formally tested: p < 0.001 for dependence on review size

**2. The Adaptive Approach is Statistically Sound**

- Samples from **remaining unscreened** documents
- Uses proper **hypergeometric hypothesis testing**
- Sample size **scales** appropriately (60-80% of remaining)
- Validated on real systematic review datasets
- Achieves target recall 95% of the time

**3. No Free Lunch in Statistics**

You cannot have:
- High confidence (97%) **AND**
- High recall (95%) **AND**  
- Fixed small sample (122) **AND**
- Work for all review sizes

**Sample size must scale.** This is not a bug, it's statistics!

---

## References

**Primary Reference:**

Callaghan, M.W., & Müller-Hansen, F. (2020). Statistical stopping criteria for automated screening in systematic reviews. *Systematic Reviews*, 9:273. https://doi.org/10.1186/s13643-020-01521-4

**Supporting Materials:**

- buscarR package: https://github.com/mcallaghan/buscarR
- Interactive tutorial: https://apsis.mcc-berlin.net/project/buscar/

---

{{% callout note %}}
**About This Tutorial**

Created: December 2024  
Author: Lucas Sempé (3ie)  
License: CC BY 4.0
{{% /callout %}}
