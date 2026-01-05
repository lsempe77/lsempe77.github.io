---
title: "Why Fixed-Sample AI Screening Validation Fails"
subtitle: "A statistical analysis of validation approaches for AI-assisted systematic reviews"
summary: "A fixed-sample approach suggests sampling just 122-300 excluded records can validate 95% sensitivity. This is statistically invalid. Here's why, and what to do instead."
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
  - Tutorials
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

## Executive Summary

{{% callout warning %}}
**The Problem:** A fixed-sample approach suggests sampling just **122-300 excluded records** regardless of review size can validate 95% sensitivity. This is **statistically invalid** because it confuses **False Omission Rate** with **Sensitivity**.
{{% /callout %}}

{{% callout note %}}
**The Solution:** An **adaptive stopping criteria approach** (Callaghan & Müller-Hansen, 2020) correctly accounts for review size by:
- Sampling from **remaining unscreened** documents (not just excluded)
- Using **hypergeometric hypothesis testing** 
- Scaling sample size with documents remaining (60-80% of remaining)
- Providing transparent confidence levels
{{% /callout %}}

**Key Finding:** The same validation result (0/122) gives sensitivity guarantees ranging from **60% to 5%** depending on review size—a **12-fold difference**!

---

## Introduction

### The Context

Systematic reviews increasingly rely on artificial intelligence and machine learning to bear the load of screening thousands of documents. This automation promises efficiency, but it introduces a critical new risk: reliability. How do we statistically validatethat the AI hasn't discarded important, relevant studies? The field has seen two primary validation frameworks emerge to answer this question.

The first is a **fixed-sample approach**, which suggests checking a set number (often 122-300) of excluded records regardless of the total volume. The second is an **adaptive stopping criteria approach** (proposed by Callaghan & Müller-Hansen, 2020), which scales the sampling effort relative to the review size. This tutorial demonstrates mathematically why the first approach is fundamentally flawed and how the second provides a robust statistical guarantee.

---

## The Fundamental Confusion

### Two Different Metrics

The core issue with the fixed-sample approach is a statistical conflation: it confuses two distinct measures of performance. By focusing on the wrong metric, researchers can end up with a false sense of security about their screening quality.

**False Omission Rate (FOR)**

$$\text{FOR} = \frac{\text{FN}}{\text{FN} + \text{TN}}$$

- Proportion of **excluded** records that were wrongly excluded
- Denominator: All excluded records
- What the fixed-sample approach actually measures

**Sensitivity (Recall)**

$$\text{Sensitivity} = \frac{\text{TP}}{\text{TP} + \text{FN}}$$

- Proportion of **all relevant** records that were found
- Denominator: All relevant records (found + missed)
- What we actually need for systematic reviews

### The Critical Relationship

Here's the mathematical bridge between them:

$$\text{FN} = \text{FOR} \times \text{Total}_{\text{Excluded}}$$

$$\text{Sensitivity} = \frac{\text{Total}_{\text{Included}}}{\text{Total}_{\text{Included}} + \text{FOR} \times \text{Total}_{\text{Excluded}}}$$

{{% callout warning %}}
**Key Insight:** Sensitivity depends on **Total<sub>Excluded</sub>**, which varies dramatically by review size. The fixed-sample approach only controls FOR, not the absolute number of missed studies!
{{% /callout %}}

---

## Statistical Analysis

### The Problem Demonstrated

When we apply the fixed-sample validation (0 relevant found in 122 excluded) across different review sizes:

| Scenario | Total | Included | Excluded | Upper FOR (97% CI) | Max Missed | Min Sensitivity (%) |
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
