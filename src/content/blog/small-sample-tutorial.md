---
title: "Small Sample Inference: A Practical R Tutorial"
summary: "Permutation tests, FDR adjustment, Max-T correction, blocked designs, and pooling strategies for analyzing experiments with tiny samples. Complete R code included."
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
featured: false
---

This is the technical companion to [Inference Under Scarcity](../inference-under-scarcity). If you want the conceptual overview, start there. If you want working R code for small-sample inference, you're in the right place.

---

## Setup: The simulation

We'll work with a simulated dataset: 19 treatment arms, 5-10 participants each, where arms 17-19 have real effects (0.8, 1.0, and 1.2 SD) and the rest are null.

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

**Sample sizes per arm:**
```
 1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19
 5  9  5  5  6  8  6  6  5  8  5  9 10  8  6  6  7  5  5
```

Total N: 124. Some arms have only 5 observations.

---

## Part 1: Omnibus test—Is there anything here?

Before comparing individual arms, test whether *any* arm differs from the others.

**Why permutation?** Classic ANOVA assumes normally distributed residuals with equal variance. With 5 observations per arm, we can't verify these assumptions. Permutation tests sidestep this by simulating the null hypothesis directly.

**How it works:**
1. Calculate the observed F-statistic
2. Shuffle treatment labels randomly (if there's no effect, labels are arbitrary)
3. Recalculate F for each shuffle
4. The p-value is the proportion of permuted F-values ≥ the observed F

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
Permutation p-value: 0.393
```

Nothing detected. The noise overwhelms the signal.

---

## Part 2: Pairwise screening with FDR

For screening, we want a ranked list of promising arms. We'll compare each treatment arm to control (arm 1) using permutation tests.

**FDR vs. Bonferroni:**
- **Bonferroni** controls the probability of *any* false positive. Very conservative—with 18 tests, you need raw p < 0.003.
- **FDR** controls the *proportion* of false positives among discoveries. Less conservative, better for screening where you'll follow up anyway.

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

**Top results:**

| Arm | Difference vs Control | Raw p-value | FDR-adjusted p |
|-----|----------------------|-------------|----------------|
| 19  | +1.68                | 0.015       | 0.28           |
| 9   | +0.87                | 0.115       | 0.75           |
| 7   | +0.64                | 0.191       | 0.75           |
| 14  | +0.63                | 0.253       | 0.75           |
| 18  | +0.67                | 0.257       | 0.75           |
| 17  | +0.50                | 0.285       | 0.75           |

Arms 19, 18, 17 (the real effects) landed at #1, #5, #6. Mixed with noise, but they floated toward the top.

---

## Part 3: Confirmatory claims with Max-T

If you need to stake your reputation on a result, use **Max-T (Westfall-Young permutation)**. This controls familywise error rate—the probability of *any* false positive.

**How it works:**
1. Compute t-statistics for each arm vs. control
2. Under permutation: shuffle outcomes, recompute all t-statistics, record the *maximum* absolute t
3. For each arm's observed t, the adjusted p-value is the proportion of permuted max-T values that exceed it

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

Nothing clears the bar. Arm 19—with a *true* effect of 1.2 SD—lands at p = 0.15. The method is working correctly: with 18 comparisons and 5 people per arm, you cannot make confirmatory claims.

---

## Part 4: Blocked designs

If your experiment has structure (sites, batches, time periods), permutations should respect it. Only shuffle treatment labels *within* each block.

**Why it matters:** If Site A has systematically higher outcomes than Site B, free shuffling might attribute site effects to treatment—or vice versa.

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

blocked_p <- blocked_omnibus(dat, nperm = 3000)
# Result: 0.379
```

Still nothing—but at least we're not confusing site effects with treatment effects.

---

## Part 5: Shrinkage test for heterogeneity

Different question: is there *any* systematic variation across arms, even if we can't pinpoint which ones?

**The idea:** Pull each arm's estimate toward the grand mean (shrinkage). Then test if the variance of shrunk means is larger than chance would predict.

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

# Result: p = 0.270
```

The shrunk means don't vary more than chance would predict.

---

## Part 6: Confidence intervals

Permutation-based confidence intervals for effect sizes. These show the uncertainty honestly.

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
```

**Sample results:**

| Arm | Estimate | 95% Interval |
|-----|----------|--------------|
| 5   | -0.40    | [-1.32, 0.55] |
| 17  | +0.50    | [-0.34, 1.33] |
| 18  | +0.67    | [-0.43, 1.73] |
| 19  | +1.68    | [0.15, 3.21]  |

Even arm 19 (true effect 1.2 SD) has an interval spanning 3 units. That's massive uncertainty.

**Note:** This is an approximation. For rigorous CIs, use `boot::boot.ci()`.

---

## Part 7: Forest plot

Visualize all arms at once:

```r
ci_df <- ci_df[order(ci_df$estimate), ]

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

Arms to the right of zero show positive effects. Arms crossing zero can't be distinguished from null.

---

## Part 8: Pooling strategies

The key to gaining power is combining arms—but only if the decision is pre-specified.

### Valid: Pool by design

If you knew *before* the study that arms 17-19 were "high intensity," you can pool them:

```r
dat$pooled_arm <- ifelse(dat$arm == "1", "control",
                         ifelse(as.numeric(as.character(dat$arm)) >= 17, 
                                "signal", "null"))
dat$pooled_arm <- factor(dat$pooled_arm, levels = c("control", "null", "signal"))

# Sample sizes: control=5, null=102, signal=17
# Omnibus p-value: 0.050
```

### Valid: Binary comparison

Pool everything that isn't signal:

```r
dat$binary <- ifelse(as.numeric(as.character(dat$arm)) >= 17, "signal", "other")

# Sample sizes: signal=17, other=107
# Signal vs Other: p = 0.013
```

This works—*if* the pooling was pre-specified.

### Invalid: Top vs. bottom (cherry-picking)

```r
arm_means <- tapply(dat$outcome, dat$arm, mean)
top3 <- names(sort(arm_means, decreasing = TRUE))[1:3]
bot3 <- names(sort(arm_means, decreasing = FALSE))[1:3]

# Top vs Bottom: p = 0.004  <- GARBAGE
```

This p-value is meaningless. We selected groups *because* they had extreme means. Even under the null, extremes differ. This is p-hacking.

---

## Summary: What to use when

| Goal | Method | Controls | Use case |
|------|--------|----------|----------|
| Is anything different? | Omnibus permutation | Type I error | First step before pairwise |
| What to follow up on? | Pairwise + FDR | Proportion of false discoveries | Screening/exploratory |
| Confirmatory claim? | Max-T | Familywise error rate | Need ironclad evidence |
| Show uncertainty? | Bootstrap/permutation CI | Coverage | Always—display the intervals |
| Stratified design? | Blocked permutation | Type I within strata | Multi-site or stratified randomization |
| Gain power? | Pre-specified pooling | Type I (if pre-specified) | Arms share mechanisms by design |

---

## The bottom line

- **Permutation tests** work when parametric assumptions fail
- **FDR** is for screening; **Max-T** is for confirmation
- **Wide confidence intervals** are the truth—show them
- **Pooling by design** is valid; **pooling by results** is p-hacking
- **There is no magic**—just honest reporting of uncertainty
