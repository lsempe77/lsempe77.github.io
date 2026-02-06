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

A colleague came to me with a problem that made me wince.

They had piloted an intervention in a conflict-affected region—one of those settings where everything is harder. Getting there is hard. Recruiting is hard. Retaining participants is hard. The intervention itself had multiple components: different dosages, different delivery methods, different combinations. Good experimental thinking. They wanted to learn which version worked best before scaling up.

But by the time they'd crossed all the factors, they had 19 treatment arms with barely 5-10 participants in each.

"How do we analyze this?" they asked.

I paused. The honest answer is: carefully, and with modest expectations. The textbook answer—"collect more data"—wasn't available. Budget spent, pilot complete, analysis required. This is the hand they were dealt.

---

## This happens more than we admit

The situation is common, especially where I work. In fragile and conflict-affected settings, primary data collection is expensive, dangerous, or both. Ethics boards ask hard questions about exposing enumerators to risk. Security situations change. Funding cycles end. You can't always get the sample sizes you want.

But the pressure to publish doesn't disappear. Neither does the genuine need to learn something before scaling up. So researchers find themselves staring at datasets that statistics textbooks would call "underpowered" and wondering what, if anything, they can responsibly conclude.

I've been that researcher. More than once. And I've watched colleagues make two kinds of mistakes: either they throw up their hands and say "we can't learn anything" (false), or they torture the data until it confesses something publishable (dangerous). There's a middle path, but it requires changing how we think about what we're doing.

---

## The setup: A simulation that mirrors reality

Let me make this concrete with a simulation. I created a dataset that looks like what my colleague brought me: 19 treatment arms with unequal samples, where most treatments genuinely do nothing, but three of them—arms 17, 18, and 19—have real effects of 0.8, 1.0, and 1.2 standard deviations.

These are *large* effects. The kind you'd actually hope to detect. If we can't find them, we have no hope with subtle effects.

124 people spread across 19 arms. Some arms have only 5 observations. The signal-to-noise ratio is terrible.

Perfect. This is exactly the situation we need to learn how to handle.

---

## Watching the standard toolkit fail

I ran the usual analyses, the ones any reviewer would expect. ANOVA first—the omnibus test asking whether *any* arm differs from the others.

**Result: p = 0.395.** Nothing.

Okay, maybe the signal is hiding in pairwise comparisons. Let me compare each treatment to control, with Bonferroni correction for multiple testing.

**Smallest adjusted p-value: 0.21.** Complete silence.

The standard toolkit has spoken: no significant differences. Move along, nothing to see here.

But wait—I *built* this simulation. I *know* there are real effects hiding in arms 17, 18, and 19. I can see the code. The effects are 0.8, 1.0, and 1.2 standard deviations—not small. What gives?

This is small samples for you. **The noise is louder than the signal.** Three real effects, completely invisible to conventional methods.

If this were a real study—and the situation is based on real studies I've seen—we would have spent months collecting data, risked enumerators' safety, burned through limited funding, and concluded... nothing. Publication unlikely. Lessons unlearned. Intervention abandoned or scaled up based on hunches rather than evidence.

There has to be a better approach.

---

## The shift: From confirmation to screening

Here's the key insight, and it took me years to internalize it: **in underpowered studies, you're not confirming effects. You're screening.**

Confirmation means proving something is true with high confidence. That requires statistical power. Power requires sample size. We don't have it.

Screening means ranking your options. Identifying the most promising candidates. Deciding what's worth a second look and what you can quietly drop. This is a different goal entirely, and it's achievable even with terrible data.

The analogy I use: imagine you're panning for gold in a muddy river. A confirmation study is like having a sophisticated assay that tells you exactly how many grams of gold are in your pan. A screening study is like shaking the pan and seeing which heavy bits settle to the bottom. You can't be sure those bits are gold—they might be pyrite, or just dense rocks—but you've narrowed down where to look.

When I ran permutation-based pairwise comparisons (more robust than t-tests when samples are tiny and distributions are unknown), something interesting happened. The arms with real effects floated toward the top of the ranking:

| Rank | Arm | True Effect | Raw p-value |
|------|-----|-------------|-------------|
| 1 | 19 | 1.2 SD ✓ | 0.015 |
| 2 | 9 | 0 (noise) | 0.115 |
| 3 | 7 | 0 (noise) | 0.191 |
| 5 | 18 | 1.0 SD ✓ | 0.257 |
| 6 | 17 | 0.8 SD ✓ | 0.285 |

Look at where our true signal arms landed: #1, #5, and #6. They're in the top third. Yes, they're mixed in with imposters—arms 9 and 7 are pure noise that happened to look good by chance. But the real effects floated toward the top.

That's not confirmation. I can't publish a paper claiming arm 19 works. But if I had to bet on which arms to prioritize for a follow-up study, I'd bet on 19 first. And I'd be right.

That's what you can expect from a screening exercise: imperfect signal, honest about its imperfection.

---

## What I learned actually works

After running dozens of analyses on this simulation (and similar real datasets), here's what holds up:

**1. Permutation tests give valid p-values even when n is tiny.**

Classical t-tests assume your data come from a normal distribution with known variance properties. With 5 observations, you can't verify that assumption, and violations can make your p-values untrustworthy.

Permutation tests sidestep this entirely. They ask a simpler question: "If treatment labels were meaningless, how often would I see a difference this large just by chance?" The answer comes from actually shuffling the labels thousands of times and counting. No distributional assumptions needed.

**2. FDR (false discovery rate) is your friend for screening.**

Bonferroni correction is the sledgehammer of multiple testing. It controls the probability of *any* false positive—great for confirmatory work, brutal for exploratory work. With 18 comparisons, you need p < 0.003 to declare significance. With n = 5 per arm, that's essentially impossible.

FDR is gentler. It controls the *proportion* of false positives among your discoveries. If you flag 10 arms and accept 10% FDR, at most 1 of those 10 is expected to be a false lead. That's reasonable for screening—you're going to follow up anyway.

**3. Pooling by design unlocks power.**

This is the closest thing to magic I found. If you knew *before* the study that arms 17-19 were "high intensity" interventions sharing a common mechanism, you can combine them in your analysis.

Instead of comparing 5 participants (arm 17 alone) to 5 (control), you're comparing 17 participants (pooled high-intensity group) to everyone else. Standard error shrinks. Power increases. My p-value went from 0.39 (all arms separate) to 0.013 (signal group vs. others).

The catch: this only works if the pooling decision was made *before* looking at the data. Pool arms because they looked promising and you're just p-hacking with extra steps.

**4. Confidence intervals tell the real story.**

Even arm 19—the one with a true effect of 1.2 standard deviations, clearly visible in the ranking—had a 95% confidence interval spanning from 0.15 to 3.21.

That's a 3-unit range. My point estimate is +1.68; the truth is 1.2; but the interval is consistent with effects anywhere from barely-there to enormous. That's not a confidence interval; that's a confession of ignorance.

Show these intervals. Let people see how little you actually know. It's more honest than pretending a p-value of 0.015 means anything definitive.

---

## The temptations I've learned to resist

When you stare at disappointing results from months of hard work, the urge to "find something" is overwhelming. I know because I've felt it. Here are the moves I've learned to avoid:

**The "let me try a different test" spiral.** Running ten different tests until one gives p < 0.05, then reporting only that one. The math doesn't work. If you try enough things, you'll find something by chance.

**The "unexpected subgroup" discovery.** "The effect wasn't significant overall, but look—it works for women over 40 in the northern district!" Maybe. Or maybe you just searched until you found a corner of the data that fluctuated your way.

**The "let me drop those outliers" adjustment.** Sometimes outliers are errors and should be removed. But if you're removing data points because they're making your effect weaker, that's not science.

**The "theory says this should work" rationalization.** I've seen researchers write discussion sections explaining why their null result actually supports their hypothesis. If your theory is unfalsifiable, it's not a theory.

The honest thing—the hard thing—is to say: "We screened 19 arms. The ranking suggests arms 19, 18, and 17 are most promising. But uncertainty is high, and a follow-up study with adequate power is needed before any firm conclusions."

That's not satisfying. It doesn't make Nature. But it's true.

---

## The uncomfortable bottom line

If you came here hoping for a trick that would turn your underpowered study into a discovery machine, I don't have one. Nobody does. The information simply isn't in the data.

What you *can* do:

1. **Screen honestly.** Use permutation tests. Report the ranking, not just the "significant" results. Let the screening logic be explicit.

2. **Show the uncertainty.** Those ugly wide confidence intervals? Display them. Let readers and policymakers see how little you actually know.

3. **Pool strategically.** If you have theoretical reasons to group arms—based on mechanism, dosage level, delivery method—do it *before* looking at the data. You'll gain power without cheating.

4. **Resist temptation.** When nothing reaches significance, the urge to peek at the data and "refine" your analysis is overwhelming. Resist.

5. **Frame it correctly.** You're not here to declare winners. You're here to decide what's worth a second look with proper resources.

This isn't the paper that gets you tenure. It's not the result that convinces funders to scale up. But in a field full of overconfident claims from underpowered studies—claims that later fail to replicate, wasting millions and damaging trust in evidence—honest uncertainty is valuable.

Maybe more valuable than we admit.

---

## The technical details

I've written a [companion tutorial](../small-sample-tutorial) with all the R code: permutation tests, FDR adjustment, Max-T for confirmatory claims, blocked designs, and the pooling strategies that work (and don't). If you're facing this problem in practice, that's where to go.

The code is free. The uncertainty is real. And the distinction between screening and confirmation? That's the whole game.

*Sometimes the most important thing a study can tell us is what we still don't know.*
