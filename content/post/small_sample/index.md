---
title: "Inference under scarcity: a practical guide to many-arm trials with tiny samples"
summary: "What do you do when you have 19 treatment arms and barely 5 people per group? This tutorial walks through permutation-based methods in R—with real code and real output."
date: 2026-01-05
authors:
  - admin
tags:
  - Statistics
  - Permutation Tests
  - Small Samples
  - Clinical Trials
  - R Tutorial
categories:
  - Statistics
  - Research Methods
featured: true
---

Recently, some colleagues share their intention to analyse data (evidence first!) to improve their intervention. They've decided to pilot an intervention with different components and dosages. In the end, they ended up with a large number of treatment arms and small number of participants on each. 

This tutorial shows you how to do that responsibly with some R code snippets for better learning.

## The data

Let's simulate a scenario: 19 arms, unequal sample sizes (5–10 per arm), and a needle-in-haystack situation where **most treatments do nothing** but three of them (arms 17, 18, 19) have real effects of 0.8, 1.0, and 1.2 standard deviations. You can see that the real effects are quite big (that's one important caveat)

```r
set.seed(42)

n_per_arm <- sample(5:10, 19, replace = TRUE)
arm <- factor(rep(1:19, times = n_per_arm))
n_total <- length(arm)

# Most arms are null; arms 17-19 have real effects
true_effects <- c(rep(0, 16), 0.8, 1.0, 1.2)
outcome <- rnorm(n_total, mean = true_effects[as.numeric(arm)], sd = 1)

dat <- data.frame(arm = arm, outcome = outcome)
```

Here's what we're working with:

```
Sample sizes per arm:
 1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19
 5  9  5  5  6  8  6  6  5  8  5  9 10  8  6  6  7  5  5

Total N: 124
```

124 people spread across 19 arms. Some arms have only 5 observations. The signal-to-noise ratio is terrible. Perfect—this is exactly the situation we need to learn how to handle.

---

## The question is: can we learn something relevant from this?  

The usual (frequentist) statistical analysis won't find anything. Let's see a classical ANOVA:

**What ANOVA does:** It partitions the total variance in outcomes into two pieces: (1) variance *between* groups (do group means differ?) and (2) variance *within* groups (how noisy are individual observations?). The F-statistic is the ratio of between-group variance to within-group variance. A large F means the group means are more spread out than you'd expect from random noise alone.

**The problem:** ANOVA assumes normally distributed residuals with equal variance across groups. With only 5–10 observations per arm, we can't verify these assumptions, and the test loses power. It also doesn't account for the multiple comparison problem—we're implicitly testing 18 treatment arms against a control.

```r
# Classic ANOVA
summary(aov(outcome ~ arm, data = dat))
```

```
             Df Sum Sq Mean Sq F value Pr(>F)
arm          18   20.8   1.156   1.068  0.395
Residuals   105  113.7   1.082
```

p = 0.395. Nothing there. What about pairwise t-tests with Bonferroni correction?

**What Bonferroni does:** When you run multiple comparisons, the chance of at least one false positive inflates rapidly. The `pairwise.t.test` function tests all pairs of arms against each other—that's $\binom{19}{2} = 171$ comparisons. With 171 tests at α = 0.05, you'd expect ~8 false positives by chance alone. Bonferroni fixes this by multiplying each p-value by the number of tests (or equivalently, dividing the significance threshold by 171). This controls the *familywise error rate*—the probability of making even one Type I error across all tests.

**The cost:** Bonferroni is extremely conservative. To declare significance at α = 0.05, you need a raw p-value below 0.05/171 ≈ 0.0003. With 5 observations per arm, you'd need enormous effect sizes to hit that threshold.

**Note:** Later in this tutorial, we'll use treatment-vs-control comparisons only (18 tests, not 171). That's a more focused question and less penalizing, but Bonferroni would still require raw p < 0.05/18 ≈ 0.003.

```r
pairwise.t.test(dat$outcome, dat$arm, p.adjust.method = "bonferroni")
```

Smallest adjusted p-value: 0.21. Complete silence.

The standard toolkit has spoken: no significant differences. Move along, nothing to see here. 

The textbook answer is "collect more data." But under certain circumstances, that's not possible. I've been looking at research in fragile and conflict affected countries, for example, where primary data collection is extremely challenging. That's just one example. 

The *practical* answer is: you can still learn something, but you need to be honest about what that something is. You're not confirming effects. You're **screening**—figuring out what's worth a second look and what you can quietly drop.

---

## First question: Is there *anything* here?

Before we start comparing individual arms, let's ask a simpler question: is there any evidence that the arms differ at all? This calls for an **omnibus test**—a single test of the global null hypothesis that all arm means are equal.

**The permutation approach:** Classic ANOVA relies on distributional assumptions (normality, equal variances) that we can't verify with small samples. Permutation tests sidestep this entirely. The logic:

1. **Calculate the observed test statistic** (here, the F-ratio from ANOVA).
2. **Simulate the null hypothesis** by randomly shuffling treatment labels. If treatments truly have no effect, the label attached to each outcome is arbitrary—shuffling shouldn't change the F-statistic systematically.
3. **Build a null distribution** by repeating step 2 thousands of times. This tells us what F-values we'd expect under pure chance.
4. **Compute a p-value** as the proportion of permuted F-values that are ≥ the observed F. If the observed F is unusually large compared to the null distribution, that's evidence against the null.

This approach makes no assumptions about the shape of the data—only that observations are exchangeable under the null.

```r
perm_omnibus <- function(data, nperm = 5000) {
  obs_F <- summary(aov(outcome ~ arm, data = data))[[1]]["arm", "F value"]
  
  perm_F <- replicate(nperm, {
    data$arm_perm <- factor(sample(as.character(data$arm)), levels = levels(data$arm))
    summary(aov(outcome ~ arm_perm, data = data))[[1]]["arm_perm", "F value"]
  })
  
  p_value <- mean(c(obs_F, perm_F) >= obs_F)
  list(observed_F = obs_F, p_value = p_value)
}

omni <- perm_omnibus(dat, nperm = 5000)
```

**Result:**
```
Observed F: 1.068
Permutation p-value: 0.3927
```

The omnibus test sees nothing. But hold on—we *know* there are real effects hiding in arms 17–19. What gives?

This is small samples for you: **the noise is louder than the signal**. An F of 1.07 is indistinguishable from random shuffling. Three real effects, completely invisible.

Do we give up? Of course not. We just stop pretending we'll find certainty here.

---

## Okay, but *which* arms should I follow up on?

For screening, we need a ranked list of candidates. The raw permutation p-values give us that ranking directly—smallest p-value = most promising arm.

But what if we want to draw a line and say "these arms are worth following up"? That's where **false discovery rate (FDR)** comes in.

**How the pairwise permutation test works:**

For each treatment arm vs. control, we:
1. Calculate the observed mean difference (treatment − control).
2. Pool all observations from both groups and randomly split them into "treatment" and "control" piles of the original sizes.
3. Repeat 3,000+ times to build a null distribution of mean differences.
4. The p-value is the proportion of permuted differences as extreme (in absolute value) as what we observed. This is a two-sided test.

**FDR vs. Bonferroni—the key difference:**

- **Bonferroni** controls the probability of *any* false positive across all tests. If you test 18 arms and nothing is real, there's ≤5% chance of flagging even one.
- **FDR** controls the *proportion* of false positives among your discoveries. If you flag 10 arms, at most 5% of them (≈0.5 arms) are expected to be false positives.

The Benjamini-Hochberg FDR procedure ranks p-values from smallest to largest, then adjusts each p-value based on its rank. Smaller (more significant) p-values get smaller adjustments. This is less conservative than Bonferroni, making it better for screening where you'll follow up on hits anyway.

**Important:** The raw p-values determine the ranking (which arms look most promising). The FDR-adjusted p-values help you set a threshold for follow-up. If you'd be happy following up on 10 arms even if 1 is a false lead, set your FDR threshold at 0.10.

```r
pairwise_perm_vs_control <- function(data, control = "1", nperm = 5000) {
  arms <- setdiff(levels(data$arm), control)
  ctrl <- data$outcome[data$arm == control]
  
  res <- lapply(arms, function(a) {
    trt <- data$outcome[data$arm == a]
    obs_diff <- mean(trt) - mean(ctrl)
    
    pooled <- c(trt, ctrl)
    ntrt <- length(trt)
    
    perm_diffs <- replicate(nperm, {
      sh <- sample(pooled)
      mean(sh[1:ntrt]) - mean(sh[(ntrt + 1):length(pooled)])
    })
    
    p_raw <- mean(abs(c(obs_diff, perm_diffs)) >= abs(obs_diff))
    c(arm = a, diff = obs_diff, raw_p = p_raw)
  })
  
  out <- as.data.frame(do.call(rbind, res))
  out$raw_p <- as.numeric(out$raw_p)
  out$diff <- as.numeric(out$diff)
  out$FDR_p <- p.adjust(out$raw_p, method = "fdr")
  out[order(out$raw_p), ]
}

pairwise_results <- pairwise_perm_vs_control(dat, control = "1", nperm = 3000)
```

**Here's what bubbles up:**

| Arm | Difference vs Control | Raw p-value | FDR-adjusted p |
|-----|----------------------|-------------|----------------|
| 19  | +1.68                | 0.015       | 0.28           |
| 9   | +0.87                | 0.115       | 0.75           |
| 7   | +0.64                | 0.191       | 0.75           |
| 14  | +0.63                | 0.253       | 0.75           |
| 18  | +0.67                | 0.257       | 0.75           |
| 17  | +0.50                | 0.285       | 0.75           |

Arm 19 stands out—biggest effect (+1.68), lowest p-value (0.015). But even after FDR adjustment, it's at 0.28. Not "significant" by any conventional threshold.

Look at where our true signal arms landed: 19 is #1, 18 is #5, 17 is #6. They're in the top third, but they're swimming with imposters (arms 9, 7, 14 are all noise).

This is what honest screening looks like. No declarations of victory. Just a prioritized list.

---

## What if someone demands a "real" result?

Sometimes we need confirmatory evidence—a result you can stake your reputation on. For that, you'd need **familywise error rate (FWER)** control, which guarantees less than 5% chance of *any* false positive across all comparisons.

**The Max-T approach (Westfall-Young permutation):**

This is tighter than Bonferroni because it accounts for the correlation structure among tests. The algorithm:

1. **Compute observed t-statistics** for each arm vs. control (using a two-sample t-test formula).
2. **Under permutation:** Shuffle all outcomes across all arms. Recompute t-statistics for every comparison. Record only the *maximum* absolute t-value across all comparisons.
3. **Repeat** thousands of times to get a null distribution of "maximum t-statistics."
4. **For each arm's observed t:** The adjusted p-value is the proportion of permuted max-T values that exceed the observed t for that arm.

**Why this works:** Under the null, the largest t-statistic you'd see across 18 comparisons is what matters for controlling false positives. By calibrating each arm's p-value against this "worst-case" distribution, we get valid FWER control. Unlike Bonferroni, this method automatically accounts for correlations (e.g., if two treatment arms have similar subjects, their comparisons to control are not independent).

**The trade-off:** Max-T is less conservative than Bonferroni but still very strict. It's the gold standard for confirmatory claims in multiple comparison settings.

```r
dunnett_maxT <- function(data, control = "1", nperm = 5000) {
  arms <- setdiff(levels(data$arm), control)
  ctrl <- data$outcome[data$arm == control]
  
  obs_t <- sapply(arms, function(a) {
    trt <- data$outcome[data$arm == a]
    nx <- length(trt); ny <- length(ctrl)
    sp <- sqrt(((nx - 1) * var(trt) + (ny - 1) * var(ctrl)) / (nx + ny - 2))
    (mean(trt) - mean(ctrl)) / (sp * sqrt(1/nx + 1/ny))
  })
  
  maxT_perm <- replicate(nperm, {
    perm_y <- sample(data$outcome)
    ctrl_p <- perm_y[data$arm == control]
    tvals <- sapply(arms, function(a) {
      trt_p <- perm_y[data$arm == a]
      nx <- length(trt_p); ny <- length(ctrl_p)
      sp <- sqrt(((nx - 1) * var(trt_p) + (ny - 1) * var(ctrl_p)) / (nx + ny - 2))
      (mean(trt_p) - mean(ctrl_p)) / (sp * sqrt(1/nx + 1/ny))
    })
    max(abs(tvals))
  })
  
  adj_p <- sapply(abs(obs_t), function(t) mean(maxT_perm >= t))
  data.frame(arm = arms, t_stat = obs_t, maxT_p = adj_p)[order(adj_p), ]
}

maxT_results <- dunnett_maxT(dat, control = "1", nperm = 3000)
```

**Result:**

| Arm | t-statistic | Max-T adjusted p |
|-----|-------------|------------------|
| 19  | 2.91        | 0.15             |
| 9   | 1.73        | 0.64             |
| 7   | 1.42        | 0.82             |

Nothing clears the bar. Arm 19—the one with a *true* effect of 1.2 standard deviations—lands at p = 0.15.

The method isn't broken. It's doing exactly what it should: telling you that with 18 comparisons and 5 people per arm, you cannot make confirmatory claims. This is the statistical system working as designed.

---

## Dealing with blocks

If your experiment has structure—different sites, batches, or time periods—your permutations should respect it.

**Why blocking matters:**

Suppose outcomes at Site A are systematically 0.5 points higher than Site B (due to local conditions, different populations, etc.). If we ignore this and shuffle labels freely, we might attribute site-level variation to treatment effects—or vice versa.

**The fix—restricted permutation:**

We only shuffle treatment labels *within* each block. A participant in Block 3 can only swap labels with other Block 3 participants. This preserves the block structure under permutation, ensuring that any block effects cancel out when we compare treatments.

**When to use this:**
- Multi-site trials (sites = blocks)
- Stratified randomization (strata = blocks)
- Repeated measures or time periods (time = blocks)
- Batch effects in lab experiments (batches = blocks)

The model becomes `outcome ~ arm + block`, and we test the arm effect after adjusting for block. The permutation null distribution now reflects what we'd expect if treatment labels were randomly assigned *within* each site/stratum.

```r
dat$block <- factor(rep(1:5, length.out = nrow(dat)))

blocked_omnibus <- function(data, nperm = 3000) {
  obs_F <- summary(aov(outcome ~ arm + block, data = data))[[1]]["arm", "F value"]
  
  perm_F <- replicate(nperm, {
    data$arm_perm <- with(data,
      unlist(tapply(as.character(arm), block, function(x) sample(x))))
    data$arm_perm <- factor(data$arm_perm, levels = levels(data$arm))
    summary(aov(outcome ~ arm_perm + block, data = data))[[1]]["arm_perm", "F value"]
  })
  
  mean(c(obs_F, perm_F) >= obs_F)
}
```

**Result:**
```
P-value (within-block permutation): 0.3788
```

Still nothing—but at least we're not accidentally calling a site effect a treatment effect.

---

## Is there *any* variation worth caring about?

Different question: forget individual arms. Is there evidence of *any* systematic heterogeneity across the 19 arms?

**The problem with raw arm means:**

With n=5 per arm, individual arm means are extremely noisy. An arm might look "high" just because it happened to get 5 people who scored above average. The variance of group means is huge.

**Shrinkage (empirical Bayes) intuition:**

The idea: pull each arm's estimate toward the grand mean. Arms with extreme estimates get pulled more; arms with large samples get pulled less. This "borrows strength" across arms and produces more stable estimates.

Mathematically, the shrunk estimate is:
$$\hat{\mu}_j^{\text{shrunk}} = \lambda \cdot \bar{y}_{\text{grand}} + (1 - \lambda) \cdot \bar{y}_j$$

where $\lambda$ is the shrinkage factor and $\bar{y}_j$ is the raw arm mean. When $\lambda = 0.3$, each arm's estimate is 30% grand mean + 70% arm-specific mean. Higher $\lambda$ means more shrinkage (more "borrowing" from the overall average).

**The test:**

We ask: is the variance of the shrunk arm means larger than we'd expect by chance? Under the null (no real treatment differences), even after shrinkage, random noise would produce *some* variation in shrunk means. We compare the observed variance to a permutation null distribution.

If the shrunk means vary *more* than chance would predict, that's evidence of real heterogeneity somewhere in the 19 arms—even if we can't pinpoint which ones.

```r
shrinkage_permtest <- function(data, shrinkage = 0.3, nperm = 5000) {
  arm_means <- tapply(data$outcome, data$arm, mean)
  grand_mean <- mean(data$outcome)
  
  shrunk <- shrinkage * grand_mean + (1 - shrinkage) * arm_means
  obs_var <- var(shrunk)
  
  perm_var <- replicate(nperm, {
    perm_arm <- factor(sample(as.character(data$arm)), levels = levels(data$arm))
    pm <- tapply(data$outcome, perm_arm, mean)
    shr <- shrinkage * mean(data$outcome) + (1 - shrinkage) * pm
    var(shr)
  })
  
  list(observed_variance = obs_var, 
       p_value = mean(c(obs_var, perm_var) >= obs_var))
}
```

**Result:**
```
P-value: 0.2696
```

Nope. The shrunk means don't vary more than chance would predict. 

(You're probably noticing a pattern. That's the point.)

---

## Forget p-values—what do the estimates actually look like?

Maybe the most honest thing we can do is stop chasing significance and just look at the uncertainty.

**Permutation-based confidence intervals:**

Classic confidence intervals (like those from t-tests) assume normality and can misbehave with small samples. We can construct permutation-based intervals that are more robust.

**How they work (simplified approach):**

The method below uses the permutation distribution to approximate the sampling variability of the mean difference. We:

1. Pool the treatment and control observations.
2. Randomly split them into "treatment" and "control" groups (same sizes as original).
3. Compute the mean difference for this permuted split.
4. Repeat thousands of times to get a distribution of differences under exchangeability.
5. Take the 2.5th and 97.5th percentiles as interval bounds.

**Important caveat:** This is a *rough approximation*. Strictly speaking, this produces a null distribution centered near zero, not a proper confidence interval for the true effect. A more rigorous approach would use bootstrap resampling (resample *with replacement* from each group separately) or construct the CI by inverting a family of permutation tests. For screening purposes, this approximation is often adequate, but for formal inference, consider `boot::boot.ci()` or similar.

**Interpretation:**

These intervals give a sense of the plausible range of effects compatible with sampling variability. If an interval excludes zero, the effect would likely be "significant" in a permutation test. The width tells you how uncertain your estimate is.

**Key insight:** The width of a CI scales with $1/\sqrt{n}$. With n=5, intervals are roughly $\sqrt{45/5} = 3\times$ wider than with n=45. This is why small samples produce such uninformative results.

```r
perm_ci <- function(data, arm_id, control = "1", conf = 0.95, nperm = 3000) {
  trt <- data$outcome[data$arm == arm_id]
  ctrl <- data$outcome[data$arm == control]
  obs <- mean(trt) - mean(ctrl)
  
  pooled <- c(trt, ctrl)
  ntrt <- length(trt)
  
  perm_diffs <- replicate(nperm, {
    sh <- sample(pooled)
    mean(sh[1:ntrt]) - mean(sh[(ntrt + 1):length(pooled)])
  })
  
  alpha <- 1 - conf
  ci <- quantile(perm_diffs, c(alpha/2, 1 - alpha/2)) + obs
  c(estimate = obs, lower = ci[1], upper = ci[2])
}

treatments <- setdiff(levels(dat$arm), "1")
ci_mat <- t(sapply(treatments, function(a) perm_ci(dat, a)))
ci_df <- as.data.frame(ci_mat)
ci_df$arm <- treatments
ci_df <- ci_df[order(ci_df$estimate), ]
```

**A few highlights:**

| Arm | Estimate | Approx. 95% interval |
|-----|----------|----------------------|
| 5   | -0.40    | [-1.32, 0.55] |
| 17  | +0.50    | [-0.34, 1.33] |
| 18  | +0.67    | [-0.43, 1.73] |
| 19  | +1.68    | [0.15, 3.21]  |

Arm 19's point estimate (+1.68) is close to the true effect (1.2). The interval just barely excludes zero, consistent with its low raw p-value, but it spans roughly 3 units—massive uncertainty.

**Note:** We center these intervals on the observed estimate to approximate a valid confidence interval. The width is derived from the permutation null variability. While a proper bootstrap CI would be more rigorous, this approximation is adequate for screening to visualize the scale of uncertainty.

---

## See it all at once: forest plot

**Why forest plots matter:**

A forest plot displays point estimates and confidence intervals for multiple comparisons on a single axis. Each horizontal line represents one arm's effect estimate, with the dot showing the point estimate and the whiskers showing the 95% CI.

**Reading the plot:**
- Arms to the right of zero (the dashed red line) show positive effects relative to control.
- Arms whose intervals *cross* zero cannot be distinguished from null effects at the 95% confidence level.
- Wider intervals = more uncertainty = smaller sample sizes or noisier data.
- The vertical position is just for display; here we order by point estimate to make patterns visible.

**What this reveals:** Even with a true effect of 1.2 SD in arm 19, the uncertainty is huge. This is why we call it "screening"—we're looking for patterns, not making definitive claims.

```r
par(mar = c(4, 8, 2, 2))
plot(ci_df$estimate, seq_len(nrow(ci_df)),
     xlim = range(ci_df$lower, ci_df$upper),
     pch = 19, xlab = "Effect vs control", ylab = "",
     yaxt = "n", main = "Permutation confidence intervals")
segments(ci_df$lower, seq_len(nrow(ci_df)),
         ci_df$upper, seq_len(nrow(ci_df)))
abline(v = 0, lty = 2, col = "red")
axis(2, at = seq_len(nrow(ci_df)), labels = ci_df$arm, las = 1)
```

Arm 19 shows promise, clearly separated from the pack, but most valid arms (like 17 and 18) are indistinguishable from noise in the forest plot. That's reality.

---

## Can we do better? (Pooling and dropping arms)

So far we've treated all 19 arms as separate entities. But maybe that's part of the problem. What if we **collapse some arms together** or **drop the obvious losers**?

**The statistical intuition:**

Power depends on sample size per group. With n=5 per arm, we're fighting an uphill battle. But if we can combine arms that share a common mechanism (e.g., "high dose" vs "low dose"), we effectively increase the sample size for each comparison.

**The danger:**

Pooling decisions must be made *before* seeing the data (pre-registered) or clearly labeled as exploratory. If you pool arms *because they look similar in your data*, you're injecting selection bias. The resulting p-values are optimistic and uninterpretable.

Let's try a few strategies and see what happens.

### Strategy 1: Focus on the winners

What if we just keep the top performers and ignore the rest?

**The logic:** By dropping arms that look unpromising, we reduce the multiple comparison burden (5 comparisons instead of 18) and focus resources on the most likely candidates.

**The problem:** We're selecting arms *based on the outcome variable*. Even if all arms were truly null, the top 5 observed means would still look "better" than the others by random chance. Our p-values no longer control Type I error.

```r
# Identify top 5 arms by observed mean
arm_means <- tapply(dat$outcome, dat$arm, mean)
top5 <- names(sort(arm_means, decreasing = TRUE))[1:5]

# Keep only control + top 5
dat_reduced <- dat[dat$arm %in% c("1", top5), ]
dat_reduced$arm <- factor(dat_reduced$arm)
```

**Arms kept:** 1 (control), 19, 9, 18, 7, 14  
**New N:** 34

Omnibus test: p = 0.154. Better than 0.39, but still nothing to write home about.

Pairwise:

| Arm | Difference | Raw p | n |
|-----|------------|-------|---|
| 19  | +1.68      | 0.019 | 5 |
| 9   | +0.87      | 0.123 | 5 |
| 7   | +0.64      | 0.201 | 6 |
| 14  | +0.63      | 0.239 | 8 |
| 18  | +0.67      | 0.255 | 5 |

Arm 19 hits p = 0.019 with only 5 comparisons to adjust for. Not bad!

**The catch:** We picked these arms because they looked good. That's selection bias. The p-values are optimistic. Fine for generating hypotheses, useless for confirming them.

### Strategy 2: Pool by design

Here's a legitimate move. Suppose we knew *before* the study that arms 17–19 were "high intensity" interventions and arms 2–16 were "low intensity." We can pool them.

**Why this is valid:** The pooling decision is based on *design features* (dosage, intensity, mechanism), not on observed outcomes. We're testing a pre-specified hypothesis: "Do high-intensity interventions outperform low-intensity ones?" This is fundamentally different from "Let me combine whichever arms look good."

**The power gain:** Instead of comparing 5 participants in arm 17 to 5 in control, we're comparing 17 participants (pooled signal group) to 5 in control—or better yet, comparing signal to everything else. The standard error of a mean difference scales as $\sqrt{\sigma^2/n_1 + \sigma^2/n_2}$. Increasing either sample size reduces SE and increases power.

```r
dat$pooled_arm <- ifelse(dat$arm == "1", "control",
                         ifelse(as.numeric(as.character(dat$arm)) >= 17, 
                                "signal", "null"))
dat$pooled_arm <- factor(dat$pooled_arm, levels = c("control", "null", "signal"))
```

**Sample sizes:**

| Group   | N   |
|---------|-----|
| control | 5   |
| null    | 102 |
| signal  | 17  |

**Group means:**

| Group   | Mean  |
|---------|-------|
| control | -0.29 |
| null    | -0.04 |
| signal  | +0.61 |

Now the omnibus test:

```
Omnibus F: 3.168
Omnibus p-value: 0.0503
```

We're right at the edge! Pairwise comparisons:

| Comparison       | Difference | p-value |
|------------------|-----------|---------|
| null vs control  | +0.25     | 0.58    |
| signal vs control| +0.90     | 0.077   |

The signal group is now trending (p = 0.077). Not quite significant, but we're getting somewhere.

### Strategy 3: Binary comparison

What if we go all-in and pool *everything* that isn't signal?

**The logic:** This is the most aggressive pre-specified pooling. We're asking a single question: "Does the high-intensity group differ from everyone else?" By collapsing 16 null arms + control into one comparison group, we maximize the sample size for the comparison.

**Statistically:** We've gone from 18 comparisons to 1. No multiple testing adjustment needed. The trade-off: we lose granularity. We can't say anything about individual arms 17, 18, or 19—only about the pooled group.

```r
dat$binary <- ifelse(as.numeric(as.character(dat$arm)) >= 17, "signal", "other")
dat$binary <- factor(dat$binary, levels = c("other", "signal"))
```

**Sample sizes:** signal = 17, other = 107

**Group means:**

| Group  | Mean  |
|--------|-------|
| other  | -0.05 |
| signal | +0.61 |

**Result:**
```
Signal vs Other: diff = +0.660, p = 0.0130
```

**Now we're talking.** By collapsing 16 "null" arms into one comparison group, we've gained enough power to detect the signal at p = 0.013.

This is a perfectly valid analysis *if* the pooling decision was made before seeing the data. If you decided to pool arms 17–19 because they're the "high dose" group based on study design—great. If you decided to pool them because they happened to look different—you've biased your results.

### Strategy 4: Extreme group comparison (danger zone)

Let's see what happens if we're *really* aggressive. Pool the top 3 arms and compare to the bottom 3.

**Why this is invalid:** We're selecting groups *because* they have extreme observed means. Under the null (no real effects), random variation alone guarantees that some arms will have high means and others low. Comparing these extremes will *always* yield a significant difference—it's built into the selection process.

**Technically:** This inflates Type I error catastrophically. The "p = 0.004" below is meaningless because our null distribution should account for the selection, but it doesn't.

```r
top3 <- names(sort(arm_means, decreasing = TRUE))[1:3]  # Arms 19, 9, 18
bot3 <- names(sort(arm_means, decreasing = FALSE))[1:3]  # Arms 5, 2, 8
```

**Sample sizes:** top = 15, bottom = 21

**Group means:** top = +0.78, bottom = -0.46

**Result:**
```
Top vs Bottom: diff = +1.243, p = 0.0042
```

Wow, p = 0.004! That's highly significant!

**But this is garbage.** We selected the extreme groups *after* looking at the data. Even if there were no real effects, we'd find a difference between the highest and lowest observed means. This p-value is meaningless.

I'm showing you this because it's exactly what you should *not* do—but it's exactly what desperate researchers are tempted to do.

---

## The pooling lesson

**The fundamental principle:** Valid inference requires that your analysis choices are independent of your outcome data. Pre-specification (deciding your analysis before seeing results) is what separates science from data-dredging.

| Strategy | p-value | Valid? |
|----------|---------|--------|
| 19 arms, all separate | 0.39 | ✓ Yes, but no power |
| Top 5 arms (selected on data) | 0.15 | ⚠ Exploratory only |
| Theory-based pooling (3 groups) | 0.05 | ✓ If pre-specified |
| Binary: signal vs all others | 0.013 | ✓ If pre-specified |
| Top 3 vs bottom 3 (selected on data) | 0.004 | ✗ No—cherry-picked |

The key distinction: **pooling based on design is science. Pooling based on observed results is p-hacking.**

If you know *before the experiment* that arms 17–19 share a common mechanism, pooling them is not only valid—it's the right thing to do. You're testing a more focused hypothesis with more statistical power.

But if you're pooling arms because "they looked similar" or "to increase power," you're fooling yourself.

---

## What actually happened here?

Let's recap:

- **Omnibus test:** nothing (p = 0.39)
- **FDR screening:** arm 19 looks promising (raw p = 0.015) but doesn't survive correction
- **Max-T:** no confirmatory signals (best p = 0.15)
- **Confidence intervals:** massive—every arm is compatible with zero
- **Pooling by design:** finally gets us to p = 0.013

And yet—the ranking worked. Arms 19, 18, 17 (the real effects) landed at #1, #5, and #6 in our pairwise screen. Mixed in with noise, yes. But the true signals floated toward the top.

That's what you can expect from a screening exercise: imperfect signal, honest about its imperfection.

---

## The uncomfortable bottom line

If you came here hoping for a trick that would turn your underpowered study into a discovery machine, I don't have one. Nobody does.

What you *can* do:

1. **Screen honestly.** Permutation tests give you valid p-values even when n is tiny and distributions are weird. Use them.

2. **Report uncertainty.** Those ugly wide confidence intervals? Show them. Let people see how little you actually know.

3. **Pool strategically.** If you have theoretical reasons to group arms, do it *before* looking at the data. You'll gain power without cheating.

4. **Resist temptation.** When nothing reaches significance, the urge to peek at the data and "refine" your analysis is overwhelming. Don't.

5. **Frame it as screening.** You're not here to declare winners. You're here to decide what's worth a second look.

This isn't satisfying. It doesn't produce the clean, quotable result that makes it into the abstract. But it's real—and in a field full of overconfident claims from underpowered studies, real is valuable.

---

## Quick reference

| What you want | What to use | What it controls | When to use |
|---------------|-------------|------------------|-------------|
| Is anything different? | Omnibus permutation | Type I error (α) | First step—test global null before pairwise comparisons |
| What should I follow up on? | Pairwise + FDR | Expected proportion of false discoveries | Screening/exploratory phase—tolerate some false leads |
| Can I stake my reputation on this? | Max-T | Familywise error rate (FWER) | Confirmatory claims—need ironclad evidence |
| How uncertain am I? | Bootstrap CIs (or permutation approx.) | Coverage (95%) | Always—show readers the uncertainty |
| Did blocking help? | Blocked permutation | Type I (within strata) | When randomization was stratified or multi-site |
| Can I simplify? | Pre-specified pooling | Type I (if pre-specified) | When arms share mechanisms by design |

