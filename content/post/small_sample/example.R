# ==============================================================================
# Inference under scarcity:
# A minimal, principled R workflow for many-arm, small-N trials
#
# This script illustrates:
#  - permutation omnibus testing
#  - pairwise permutation tests with FDR control
#  - Dunnett-style max-T (FWER control)
#  - blocked / stratified permutations
#  - permutation confidence intervals
#  - simple shrinkage + permutation (screening heterogeneity)
#
# Philosophy:
#  - screening, not confirmation
#  - explicit uncertainty
#  - minimal assumptions
#
# Dependencies:
#  - base R
#  - coin (optional, for convenience)
#
# ==============================================================================

set.seed(42)

# ------------------------------------------------------------------------------
# 0) Simulate a many-arm small-N dataset
# ------------------------------------------------------------------------------

n_per_arm <- sample(5:10, 19, replace = TRUE)
arm <- factor(rep(1:19, times = n_per_arm))
n_total <- length(arm)

# True effects: mostly null, few signals
true_effects <- c(rep(0, 16), 0.8, 1.0, 1.2)
outcome <- rnorm(n_total, mean = true_effects[as.numeric(arm)], sd = 1)

dat <- data.frame(arm = arm, outcome = outcome)

cat("Sample sizes per arm:\n")
print(table(dat$arm))
cat("Total N:", n_total, "\n\n")

# ------------------------------------------------------------------------------
# 1) Permutation omnibus test (ANOVA analogue)
# ------------------------------------------------------------------------------

perm_omnibus <- function(data, nperm = 5000) {

  obs_F <- summary(aov(outcome ~ arm, data = data))[[1]]["arm", "F value"]

  perm_F <- replicate(nperm, {
    data$arm_perm <- factor(sample(as.character(data$arm)),
                            levels = levels(data$arm))
    summary(aov(outcome ~ arm_perm, data = data))[[1]]["arm_perm", "F value"]
  })

  p_value <- mean(c(obs_F, perm_F) >= obs_F)

  list(
    observed_F = obs_F,
    p_value = p_value,
    perm_F = perm_F
  )
}

cat("=== Omnibus permutation test ===\n")
omni <- perm_omnibus(dat, nperm = 5000)
cat("Observed F:", round(omni$observed_F, 3), "\n")
cat("Permutation p-value:", round(omni$p_value, 4), "\n\n")

# ------------------------------------------------------------------------------
# 2) Pairwise permutation tests vs control + FDR
# ------------------------------------------------------------------------------

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

cat("=== Pairwise permutation tests vs control (FDR) ===\n")
pairwise_results <- pairwise_perm_vs_control(dat, control = "1", nperm = 3000)
print(pairwise_results)
cat("\n")

# ------------------------------------------------------------------------------
# 3) Dunnett-style max-T permutation (FWER control)
# ------------------------------------------------------------------------------

dunnett_maxT <- function(data, control = "1", nperm = 5000) {

  arms <- setdiff(levels(data$arm), control)
  ctrl <- data$outcome[data$arm == control]

  # Observed studentized statistics
  obs_t <- sapply(arms, function(a) {
    trt <- data$outcome[data$arm == a]
    nx <- length(trt); ny <- length(ctrl)
    sp <- sqrt(((nx - 1) * var(trt) + (ny - 1) * var(ctrl)) / (nx + ny - 2))
    (mean(trt) - mean(ctrl)) / (sp * sqrt(1/nx + 1/ny))
  })

  # Permutation distribution of max |t|
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

  data.frame(
    arm = arms,
    t_stat = obs_t,
    maxT_p = adj_p,
    row.names = NULL
  )[order(adj_p), ]
}

cat("=== Dunnett-style max-T (FWER control) ===\n")
maxT_results <- dunnett_maxT(dat, control = "1", nperm = 3000)
print(maxT_results)
cat("\n")

# ------------------------------------------------------------------------------
# 4) Blocked / stratified permutation test
# ------------------------------------------------------------------------------

# Simulate blocks (e.g., sites)
dat$block <- factor(rep(1:5, length.out = nrow(dat)))

blocked_omnibus <- function(data, nperm = 3000) {

  obs_F <- summary(aov(outcome ~ arm + block, data = data))[[1]]["arm", "F value"]

  perm_F <- replicate(nperm, {
    data$arm_perm <- with(data,
      unlist(tapply(as.character(arm), block, function(x) sample(x)))
    )
    data$arm_perm <- factor(data$arm_perm, levels = levels(data$arm))
    summary(aov(outcome ~ arm_perm + block, data = data))[[1]]["arm_perm", "F value"]
  })

  mean(c(obs_F, perm_F) >= obs_F)
}

cat("=== Blocked permutation omnibus test ===\n")
cat("P-value (within-block permutation):",
    round(blocked_omnibus(dat, nperm = 2000), 4), "\n\n")

# ------------------------------------------------------------------------------
# 5) Simple shrinkage + permutation (heterogeneity screening)
# ------------------------------------------------------------------------------

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

  list(
    observed_variance = obs_var,
    p_value = mean(c(obs_var, perm_var) >= obs_var)
  )
}

cat("=== Shrinkage + permutation heterogeneity test ===\n")
shrink_res <- shrinkage_permtest(dat, shrinkage = 0.3, nperm = 3000)
cat("P-value:", round(shrink_res$p_value, 4), "\n\n")

# ------------------------------------------------------------------------------
# 6) Permutation confidence intervals (arm vs control)
# ------------------------------------------------------------------------------

perm_ci <- function(data, arm_id, control = "1",
                    conf = 0.95, nperm = 3000) {

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
  ci <- quantile(perm_diffs, c(alpha/2, 1 - alpha/2))

  c(estimate = obs, lower = ci[1], upper = ci[2])
}

treatments <- setdiff(levels(dat$arm), "1")
ci_mat <- t(sapply(treatments, function(a) perm_ci(dat, a)))
ci_df <- as.data.frame(ci_mat)
ci_df$arm <- treatments
ci_df <- ci_df[order(ci_df$estimate), ]

cat("=== Permutation CIs (arm vs control) ===\n")
print(ci_df)
cat("\n")

# Forest plot
par(mar = c(4, 8, 2, 2))
plot(ci_df$estimate, seq_len(nrow(ci_df)),
     xlim = range(ci_df$lower, ci_df$upper),
     pch = 19, xlab = "Effect vs control", ylab = "",
     yaxt = "n", main = "Permutation confidence intervals")
segments(ci_df$lower, seq_len(nrow(ci_df)),
         ci_df$upper, seq_len(nrow(ci_df)))
abline(v = 0, lty = 2, col = "red")
axis(2, at = seq_len(nrow(ci_df)), labels = ci_df$arm, las = 1)

# ------------------------------------------------------------------------------
# 7) Pooling strategies: trading complexity for power
# ------------------------------------------------------------------------------

cat("\n=== POOLING STRATEGIES ===\n\n")

# Strategy 1: Drop arms, keep top 5 + control
cat("--- Strategy 1: Keep only top 5 arms + control ---\n")
arm_means <- tapply(dat$outcome, dat$arm, mean)
top5 <- names(sort(arm_means, decreasing = TRUE))[1:5]
dat_reduced <- dat[dat$arm %in% c("1", top5), ]
dat_reduced$arm <- factor(dat_reduced$arm)

cat("Arms kept:", c("1", top5), "\n")
cat("New N:", nrow(dat_reduced), "\n")

obs_F <- summary(aov(outcome ~ arm, data = dat_reduced))[[1]]["arm", "F value"]
perm_F <- replicate(3000, {
  dat_reduced$arm_perm <- factor(sample(as.character(dat_reduced$arm)),
                                  levels = levels(dat_reduced$arm))
  summary(aov(outcome ~ arm_perm, data = dat_reduced))[[1]]["arm_perm", "F value"]
})
cat("Omnibus p-value:", round(mean(c(obs_F, perm_F) >= obs_F), 4), "\n\n")


# Strategy 2: Theory-based pooling (3 groups)
cat("--- Strategy 2: Pool by theory (control / null / signal) ---\n")
dat$pooled_arm <- ifelse(dat$arm == "1", "control",
                         ifelse(as.numeric(as.character(dat$arm)) >= 17,
                                "signal", "null"))
dat$pooled_arm <- factor(dat$pooled_arm, levels = c("control", "null", "signal"))

cat("Sample sizes:\n")
print(table(dat$pooled_arm))

obs_F <- summary(aov(outcome ~ pooled_arm, data = dat))[[1]]["pooled_arm", "F value"]
perm_F <- replicate(3000, {
  dat$perm <- factor(sample(as.character(dat$pooled_arm)),
                     levels = levels(dat$pooled_arm))
  summary(aov(outcome ~ perm, data = dat))[[1]]["perm", "F value"]
})
cat("Omnibus F:", round(obs_F, 3), "\n")
cat("Omnibus p-value:", round(mean(c(obs_F, perm_F) >= obs_F), 4), "\n")

# Pairwise for pooled groups
ctrl <- dat$outcome[dat$pooled_arm == "control"]
for (g in c("null", "signal")) {
  trt <- dat$outcome[dat$pooled_arm == g]
  obs_diff <- mean(trt) - mean(ctrl)
  pooled <- c(trt, ctrl)
  ntrt <- length(trt)
  perm_diffs <- replicate(3000, {
    sh <- sample(pooled)
    mean(sh[1:ntrt]) - mean(sh[(ntrt + 1):length(pooled)])
  })
  p_raw <- mean(abs(c(obs_diff, perm_diffs)) >= abs(obs_diff))
  cat(sprintf("%s vs control: diff = %+.2f, p = %.4f\n", g, obs_diff, p_raw))
}
cat("\n")


# Strategy 3: Binary comparison (signal vs all others)
cat("--- Strategy 3: Binary (signal arms vs all others) ---\n")
dat$binary <- ifelse(as.numeric(as.character(dat$arm)) >= 17, "signal", "other")
dat$binary <- factor(dat$binary, levels = c("other", "signal"))

cat("Sample sizes:\n")
print(table(dat$binary))

trt <- dat$outcome[dat$binary == "signal"]
ctrl <- dat$outcome[dat$binary == "other"]
obs_diff <- mean(trt) - mean(ctrl)

pooled <- c(trt, ctrl)
ntrt <- length(trt)
perm_diffs <- replicate(5000, {
  sh <- sample(pooled)
  mean(sh[1:ntrt]) - mean(sh[(ntrt + 1):length(pooled)])
})
p_raw <- mean(abs(c(obs_diff, perm_diffs)) >= abs(obs_diff))
cat(sprintf("Signal vs Other: diff = %+.3f, p = %.4f\n\n", obs_diff, p_raw))


# Strategy 4: Extreme groups (WARNING: data-driven selection = biased!)
cat("--- Strategy 4: Top 3 vs Bottom 3 (BIASED - for illustration only) ---\n")
top3 <- names(sort(arm_means, decreasing = TRUE))[1:3]
bot3 <- names(sort(arm_means, decreasing = FALSE))[1:3]
cat("Top 3 arms:", paste(top3, collapse = ", "), "\n")
cat("Bottom 3 arms:", paste(bot3, collapse = ", "), "\n")

dat_extreme <- dat[dat$arm %in% c(top3, bot3), ]
dat_extreme$group <- ifelse(dat_extreme$arm %in% top3, "top", "bottom")

trt <- dat_extreme$outcome[dat_extreme$group == "top"]
ctrl <- dat_extreme$outcome[dat_extreme$group == "bottom"]
obs_diff <- mean(trt) - mean(ctrl)

pooled <- c(trt, ctrl)
ntrt <- length(trt)
perm_diffs <- replicate(5000, {
  sh <- sample(pooled)
  mean(sh[1:ntrt]) - mean(sh[(ntrt + 1):length(pooled)])
})
p_raw <- mean(abs(c(obs_diff, perm_diffs)) >= abs(obs_diff))
cat(sprintf("Top vs Bottom: diff = %+.3f, p = %.4f\n", obs_diff, p_raw))
cat("WARNING: This p-value is meaningless - groups were selected on outcomes!\n")

# ------------------------------------------------------------------------------
# Final note
# ------------------------------------------------------------------------------
# This script supports screening and prioritization, not definitive inference.
# With many arms and small N, uncertainty dominates. Use results to guide
# follow-up studies, redesigns, or adaptive experimentation — not to declare winners.
#
# Key insight on pooling: Collapsing arms based on DESIGN (pre-specified theory)
# is valid and increases power. Collapsing based on OBSERVED RESULTS is p-hacking.
# ------------------------------------------------------------------------------
