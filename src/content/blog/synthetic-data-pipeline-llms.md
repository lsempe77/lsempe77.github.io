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
categories:
  - AI Tools
  - Machine Learning
featured: false
---

I wanted to train a classifier to identify study methodologies from abstracts. Randomized trials, quasi-experiments, qualitative studies—the categories that matter for evidence synthesis. The problem was obvious: I had 200 labeled examples. Nowhere near enough for a neural classifier, barely enough for a traditional model.

Manual labeling would take weeks. I tried to budget for annotators, but the numbers didn't work. Then the thought occurred: LLMs can write abstracts. What if I got them to generate realistic fake studies across all my categories?

The first attempt was embarrassing. I prompted GPT-4 to "generate an abstract for a randomized controlled trial studying education interventions in sub-Saharan Africa." It produced something plausible. Then I ran it 100 times and got essentially the same abstract with minor variations—same structure, same sample size range, same results pattern. The model had learned a template, and it was stuck in that template.

Synthetic data generation requires diversity, realism, and labels you can trust. Achieving all three took substantially more engineering than I expected.

---

The core insight came from thinking about what makes studies different. It's not just methodology—it's sector (education, health, agriculture), country context (high-income versus low-income, stable versus fragile), sample size (50 participants versus 50,000), outcome type (behavioral, economic, attitudinal), and a dozen other dimensions.

Instead of prompting for abstracts directly, I built a generator that first creates study metadata: methodology, sector, country, sample size, time period, outcome variables. Each dimension has a distribution calibrated from real evidence maps. RCTs are about 15% of the corpus. Education is 25%. Kenya appears more often than Timor-Leste because there's genuinely more research there.

Then a separate step generates the abstract conditioned on the metadata. This decomposition helps because the model isn't trying to make all creative decisions at once. The methodology is fixed. The sector is fixed. The model just needs to write a realistic abstract consistent with those constraints.

---

Diversity required explicit intervention. Temperature adjustments helped, but not enough. I added constraint variations: some studies have positive findings, some negative, some null. Some have large samples, some tiny. Some report confidence intervals, some just p-values. Some are written in formal academic prose, some in the telegraphic style of certain journals.

The key was tracking what had already been generated and adjusting sampling to fill gaps. If the first 100 generated studies are disproportionately from Kenya, the sampler reduces Kenya's probability. If quasi-experiments are underrepresented, the sampler boosts them. This produces a corpus that matches target distributions rather than whatever the model's priors prefer.

I also rotated across multiple LLM providers. OpenAI, Claude, Gemini, Mistral—each has slightly different writing styles and biases. Mixing them produces more natural variation than any single model at high temperature.

---

The controversial part of this pipeline is biased generation. Real studies have methodological flaws. Selection bias, attrition, spillover, weak instruments. A classifier trained only on methodologically pristine synthetic studies won't recognize flawed real ones.

So I added a step that deliberately introduces problems. Take a "ground truth" RCT abstract and generate a version with randomization failures described. Take a clean difference-in-differences study and create a version with obvious parallel trends violations. The prompt explicitly describes what flaw to introduce, and the model rewrites the abstract accordingly.

This felt uncomfortable at first—deliberately generating bad science. But the purpose is training a detector, not producing deceptive papers. Labeled flaws in synthetic data help classifiers recognize unlabeled flaws in real data.

---

Validation was non-negotiable. Synthetic data is useless if it doesn't actually resemble real data. I ran multiple checks.

First, embedding similarity: synthetic abstracts should occupy the same region of embedding space as real abstracts from similar categories. An RCT about education should be close to real education RCTs, not randomly positioned.

Second, discriminator training: I trained a model to distinguish synthetic from real. If it achieves high accuracy, the synthetic data is obviously fake. Good synthetic data should be hard to distinguish, achieving near-random discriminator performance.

Third, human spot-checks: I mixed synthetic and real abstracts and asked colleagues to identify which was which. Experts could often tell, but not always. The synthetic examples that fooled experts had the right structure, terminology, and detail level.

Fourth, downstream task performance: the whole point was training a methodology classifier. Does training on synthetic data actually help? I trained models on different mixtures of real and synthetic data and evaluated on held-out real examples. Synthetic data improved performance when real data was scarce, but the improvement had limits. Beyond a certain ratio, more synthetic examples didn't help.

---

Provenance tracking turned out to be essential. Every generated study carries metadata: which model generated it, with what prompt version, at what temperature, targeting what category. When something goes wrong downstream—the classifier behaves strangely, an evaluation metric is off—you need to trace back to generation parameters.

The output structure includes the complete generation history. For the biased examples, it includes what flaw was introduced. For everything, it includes checksums so you can verify that the training data hasn't been modified after generation.

Cost matters at scale. Generating 10,000 abstracts isn't cheap across multiple providers. I stratified by step complexity: metadata generation uses cheap, fast models (GPT-4o-mini, Haiku); abstract generation uses capable models (GPT-4o, Sonnet); validation uses cheap models again. This reduced per-example cost by about 60% compared to using expensive models throughout.

---

The classifier trained on synthetic data now runs in production, pre-screening studies for evidence maps. It's not perfect—nothing is—but it handles categories I couldn't have covered with 200 real examples. The synthetic pipeline runs on demand when we need training data for new classification tasks.

Would I recommend this approach generally? With caveats. Synthetic data is a multiplier, not a replacement. You still need some real examples to calibrate distributions and validate quality. The generation pipeline is non-trivial to build correctly. And for some domains, synthetic examples may embed the model's biases rather than reflecting real-world variation.

But for evidence synthesis, where real data is expensive and domain structure is well-defined, synthetic generation has become a standard part of my toolkit. It's manufacturing evidence in a specific, controlled sense—producing labeled examples for training, not producing fake research for publication.

*Pipeline code available with documentation. Requires API keys for multiple LLM providers.*

To ensure realistic training data, we generate studies with methodology proportions matching real-world distributions:

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

## Reproducibility Through Seeds

Every generated entity includes seed tracking for complete reproducibility:

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

# Each entity gets a unique, traceable seed
for i, (method, sector, country, year) in enumerate(batch_plan):
    entity_seed = seed + start_idx + i
    random.seed(entity_seed)
    entity = gen.generate_single_entity(method, sector, country, year)
    entity['entity_seed'] = entity_seed
```

## Batch Processing with Checkpointing

For large-scale generation, the pipeline uses SQLite-based checkpointing:

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

## Addressing Hallucination Risk

Synthetic data carries inherent hallucination risks. Our mitigations include:

### Schema Validation
```python
# Required fields must exist
required = ['title', 'method', 'sample_size', 'outcomes']
for field in required:
    if field not in entity:
        raise ValidationError(f"Missing required field: {field}")
```

### Plausibility Checks
```python
# Numeric ranges must be realistic
if entity['sample_size'] < 10 or entity['sample_size'] > 1000000:
    flag_for_review(entity, "Implausible sample size")

# Dates must be consistent
if entity['publication_year'] < entity['study_end_year']:
    flag_for_review(entity, "Temporal inconsistency")
```

### Second-Opinion Validation
```python
# Cross-validate with another model
validation_prompt = f"""
Verify the following synthetic study for factual plausibility:
{json.dumps(entity, indent=2)}

Check for:
1. Methodological consistency
2. Realistic effect sizes
3. Appropriate sample sizes for the method
4. Geographic/temporal plausibility
"""
```

## CLI Interface

The pipeline provides a clean command-line interface:

```powershell
# Run single step for one provider
python main.py pipeline --step 1 --llm_provider openai --n_entities 5 --seed 42

# Bulk generation across all providers
python main.py bulk --providers openai,claude,grok,mistral,gemini `
    --n 100 --batch_size 5 --workers 2 --seed 42

# Merge outputs from all providers
python main.py merge

# Check status
python main.py status --providers openai,claude
```

## Output Structure

Generated data is organized for easy consumption:

```
pipeline_outputs/
├── checkpoints.db                    # SQLite checkpoint database
├── openai_batch_001.json             # Provider-specific batches
├── openai_batch_002.json
├── claude_batch_001.json
├── ...
├── all_providers_entities.json       # Merged JSON output
└── all_providers_entities.xlsx       # Excel format for analysis
```

## Quality Assurance Workflow

Our recommended workflow for production use:

1. **Smoke Test**: Run with `--smoke` flag to verify pipeline connectivity
2. **Sample Generation**: Generate small batches and review manually
3. **Full Generation**: Run complete pipeline with checkpointing
4. **Automated Validation**: Apply schema and plausibility checks
5. **Human Review**: Sample 10% for manual quality assurance
6. **Training Data Export**: Format validated outputs for ML training

## Lessons Learned

1. **Seed Everything**: Complete reproducibility requires seeding at every random operation
2. **Provider Diversity**: Different LLMs produce distinctly different outputs—this is a feature for training data
3. **Checkpointing is Essential**: API calls fail; resume capability is not optional
4. **Validate Early and Often**: Catch hallucinations before they propagate
5. **Human-in-the-Loop**: No automated validation replaces human review for training data

## Future Directions

- **Automated factuality scoring** using citation verification
- **Adversarial examples** for model robustness testing
- **Domain adaptation** for specific research fields
- **Cost optimization** through intelligent model routing

---

This pipeline demonstrates how LLMs can be harnessed for systematic, reproducible synthetic data generation—essential infrastructure for training the next generation of evidence synthesis tools.
