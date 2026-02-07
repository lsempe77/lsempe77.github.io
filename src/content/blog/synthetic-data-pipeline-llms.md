---
title: "Manufacturing Evidence (Responsibly)"
summary: "When you need training data for an evidence synthesis classifier but only have 200 labeled examples, synthetic generation becomes attractive. Making it work without producing garbage took real engineering."
date: 2025-11-28
authors:
  - admin
tags:
  - Synthetic Data
  - Machine Learning
  - LLMs
  - Python
  - Training Data
image:
  caption: 'Synthetic data generation pipeline'
  focal_point: ''
  placement: 2
  preview_only: false
categories:
  - AI Tools
  - Machine Learning
featured: false
draft: false
projects: []
---

*Code for the synthetic data pipeline is at [github.com/lsempe77/Synthetic-data](https://github.com/lsempe77/Synthetic-data).*

---

## The Problem

I wanted to train a classifier to identify study methodologies from abstracts. Randomized trials, quasi-experiments, qualitative studies—the categories that matter for evidence synthesis. The problem was obvious: I had 200 labeled examples. Nowhere near enough for a neural classifier, barely enough for a traditional model.

Manual labeling would take weeks. I tried to budget for annotators, but the numbers didn't work. Then the thought occurred: LLMs can write abstracts. What if I got them to generate realistic fake studies across all my categories?

The first attempt was embarrassing. I prompted GPT-4 to "generate an abstract for a randomized controlled trial studying education interventions in sub-Saharan Africa." It produced something plausible. Then I ran it 100 times and got essentially the same abstract with minor variations—same structure, same sample size range, same results pattern. The model had learned a template, and it was stuck in that template.

Synthetic data generation requires diversity, realism, and labels you can trust. Achieving all three took substantially more engineering than I expected.

---

## Breaking the Template Problem

The core insight came from thinking about what makes studies different. It's not just methodology—it's sector (education, health, agriculture), country context (high-income versus low-income, stable versus fragile), sample size (50 participants versus 50,000), outcome type (behavioral, economic, attitudinal), and a dozen other dimensions.

Instead of prompting for abstracts directly, I built a generator that first creates study metadata: methodology, sector, country, sample size, time period, outcome variables. Each dimension has a distribution calibrated from real evidence maps. RCTs are about 15% of the corpus. Education is 25%. Kenya appears more often than Timor-Leste because there's genuinely more research there.

Here's how those proportions look in practice—these numbers come from analyzing thousands of real studies:

```python
DEFAULT_PROMPT_PROPORTIONS = {
    'propensity_score_matching': 0.14,
    'difference_in_differences': 0.14,
    'instrumental_variables': 0.10,
    'regression_discontinuity': 0.10,
    'randomized_controlled_trial': 0.10,
    'synthetic_control_method': 0.05,
    'cluster_randomized_trial': 0.05,
    'staggered_difference_in_differences': 0.05,
    'did_plus_matching': 0.08,
    'matching_plus_iv_combination': 0.05,
    'synthetic_control_plus_did': 0.04,
    'psm_plus_did': 0.04,
    'its_plus_synthetic_control': 0.03,
    'rd_plus_iv': 0.02,
    'staggered_did_plus_matching': 0.01
}
```

Then a separate step generates the abstract conditioned on the metadata. This decomposition helps because the model isn't trying to make all creative decisions at once. The methodology is fixed. The sector is fixed. The model just needs to write a realistic abstract consistent with those constraints.

---

## Engineering Diversity

Diversity required explicit intervention. Temperature adjustments helped, but not enough. I added constraint variations: some studies have positive findings, some negative, some null. Some have large samples, some tiny. Some report confidence intervals, some just p-values. Some are written in formal academic prose, some in the telegraphic style of certain journals.

The key was tracking what had already been generated and adjusting sampling to fill gaps. The generation plan samples from target distributions while shuffling to avoid clustering:

```python
def build_plan_with_proportions(n_entities, proportions, sectors, countries, years):
    """Build a generation plan based on method proportions."""
    plan = []
    
    for method, proportion in proportions.items():
        count = int(round(n_entities * proportion))
        for _ in range(count):
            sector = random.choice(sectors)
            country = random.choice(countries)
            year = random.choice(years)
            plan.append((method, sector, country, year))
    
    random.shuffle(plan)
    return plan[:n_entities]
```

If the first 100 generated studies are disproportionately from Kenya, the sampler reduces Kenya's probability. If quasi-experiments are underrepresented, the sampler boosts them. This produces a corpus that matches target distributions rather than whatever the model's priors prefer.

I also rotated across multiple LLM providers. OpenAI, Claude, Gemini, Mistral—each has slightly different writing styles and biases. Mixing them produces more natural variation than any single model at high temperature.

---

## The Uncomfortable Part: Generating Flawed Studies

The controversial part of this pipeline is biased generation. Real studies have methodological flaws. Selection bias, attrition, spillover, weak instruments. A classifier trained only on methodologically pristine synthetic studies won't recognize flawed real ones.

So I added a step that deliberately introduces problems. Take a "ground truth" RCT abstract and generate a version with randomization failures described. Take a clean difference-in-differences study and create a version with obvious parallel trends violations. The prompt explicitly describes what flaw to introduce, and the model rewrites the abstract accordingly.

This felt uncomfortable at first—deliberately generating bad science. But the purpose is training a detector, not producing deceptive papers. Labeled flaws in synthetic data help classifiers recognize unlabeled flaws in real data.

---

## Validation: Catching the Lies

Validation was non-negotiable. Synthetic data is useless if it doesn't actually resemble real data. I ran multiple checks.

**Embedding similarity**: synthetic abstracts should occupy the same region of embedding space as real abstracts from similar categories. An RCT about education should be close to real education RCTs, not randomly positioned.

**Discriminator training**: I trained a model to distinguish synthetic from real. If it achieves high accuracy, the synthetic data is obviously fake. Good synthetic data should be hard to distinguish, achieving near-random discriminator performance.

**Human spot-checks**: I mixed synthetic and real abstracts and asked colleagues to identify which was which. Experts could often tell, but not always. The synthetic examples that fooled experts had the right structure, terminology, and detail level.

**Downstream task performance**: the whole point was training a methodology classifier. Does training on synthetic data actually help? I trained models on different mixtures of real and synthetic data and evaluated on held-out real examples. Synthetic data improved performance when real data was scarce, but the improvement had limits. Beyond a certain ratio, more synthetic examples didn't help.

But automated validation can only catch so much. The real danger with LLM-generated training data is hallucination—plausible-sounding nonsense that slips through. I built layered defenses:

```python
# Schema validation: required fields must exist
required = ['title', 'method', 'sample_size', 'outcomes']
for field in required:
    if field not in entity:
        raise ValidationError(f"Missing required field: {field}")

# Plausibility checks: numeric ranges must be realistic
if entity['sample_size'] < 10 or entity['sample_size'] > 1000000:
    flag_for_review(entity, "Implausible sample size")

# Temporal consistency
if entity['publication_year'] < entity['study_end_year']:
    flag_for_review(entity, "Temporal inconsistency")
```

For high-stakes cases, I added second-opinion validation—using a different model to verify the first model's output. It's expensive, but it catches the worst failures.

---

## Making It Reproducible

Provenance tracking turned out to be essential. Every generated study carries metadata: which model generated it, with what prompt version, at what temperature, targeting what category. When something goes wrong downstream—the classifier behaves strangely, an evaluation metric is off—you need to trace back to generation parameters.

Every entity gets a unique, traceable seed:

```python
for i, (method, sector, country, year) in enumerate(batch_plan):
    entity_seed = seed + start_idx + i
    random.seed(entity_seed)
    entity = gen.generate_single_entity(method, sector, country, year)
    entity['entity_seed'] = entity_seed
```

The output structure includes the complete generation history. For the biased examples, it includes what flaw was introduced. For everything, it includes checksums so you can verify that the training data hasn't been modified after generation.

---

## Making It Survive Failures

Generating 10,000 abstracts across multiple providers means things will break. API timeouts, rate limits, random errors. The pipeline uses SQLite-based checkpointing so I don't lose work:

```python
from src.core.checkpoints_db import CheckpointDB
from src.utils.batch_runner import BatchRunner

db_path = 'pipeline_outputs/checkpoints.db'
ckdb = CheckpointDB(db_path)
br = BatchRunner(ckdb, output_dir='pipeline_outputs')

# Ensure batches are scheduled
br.ensure_batches(provider, total, batch_size, seed=provider_seed)

# Run with automatic resume on failure
all_items = br.run_all_batches(provider, worker_fn, max_workers=workers)
```

I learned this the hard way. The first version had no checkpointing. An API outage at 3 AM killed a run that had been going for six hours. I stared at the error message, did the math on re-running, and immediately added persistence.

---

## Cost Engineering

Cost matters at scale. Generating 10,000 abstracts isn't cheap across multiple providers. I stratified by step complexity: metadata generation uses cheap, fast models (GPT-4o-mini, Haiku); abstract generation uses capable models (GPT-4o, Sonnet); validation uses cheap models again. This reduced per-example cost by about 60% compared to using expensive models throughout.

The CLI makes running the pipeline straightforward:

```powershell
# Bulk generation across all providers
python main.py bulk --providers openai,claude,grok,mistral,gemini `
    --n 100 --batch_size 5 --workers 2 --seed 42

# Merge outputs from all providers
python main.py merge
```

---

## What I'd Tell Someone Starting This

The classifier trained on synthetic data now runs in production, pre-screening studies for evidence maps. It's not perfect—nothing is—but it handles categories I couldn't have covered with 200 real examples. The synthetic pipeline runs on demand when we need training data for new classification tasks.

Would I recommend this approach generally? With caveats.

**Seed everything.** Complete reproducibility requires seeding at every random operation. You will need to debug generation six months from now, and you'll thank yourself.

**Provider diversity is a feature.** Different LLMs produce distinctly different outputs. For training data, this variation is exactly what you want.

**Checkpointing is not optional.** API calls fail. Runs get interrupted. Build resume capability from day one.

**Validate early and often.** Catch hallucinations before they propagate into your training set.

**Human-in-the-loop, always.** No automated validation replaces human review for training data. I sample 10% of every batch for manual inspection.

Synthetic data is a multiplier, not a replacement. You still need some real examples to calibrate distributions and validate quality. The generation pipeline is non-trivial to build correctly. And for some domains, synthetic examples may embed the model's biases rather than reflecting real-world variation.

But for evidence synthesis, where real data is expensive and domain structure is well-defined, synthetic generation has become a standard part of my toolkit. It's manufacturing evidence in a specific, controlled sense—producing labeled examples for training, not producing fake research for publication.

The uncomfortable truth is that I'm using AI to generate fake studies so I can train AI to recognize real ones. It sounds circular, maybe even wrong. But the classifier works. It catches things I would have missed. And it does it at a scale I couldn't achieve any other way.

*Pipeline code available with documentation. Requires API keys for multiple LLM providers.*
