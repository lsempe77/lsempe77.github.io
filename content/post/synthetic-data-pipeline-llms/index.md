---
title: "Building a Multi-Model Synthetic Data Pipeline for ML Training"
summary: "How to create reproducible, auditable synthetic data using multiple LLM providers for training machine learning models in evidence synthesis."
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

## The Challenge: Training Data for Evidence Synthesis

Machine learning models for systematic reviews and evidence synthesis require substantial training data—examples of well-structured studies, various methodologies, and different quality levels. However, obtaining enough labeled examples from real research is time-consuming and expensive.

Synthetic data offers a solution: LLMs can generate realistic, structured examples that mirror the complexity of actual research papers. But doing this at scale, with reproducibility and quality control, requires careful engineering.

## Architecture Overview

Our synthetic data pipeline is an 8-step process that generates complete "study entities" with full provenance tracking:

```
┌─────────────────────────────────────────────────────────────────┐
│                    SYNTHETIC DATA PIPELINE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Step 1: Entity Generation                                       │
│     └── Generate study metadata (method, sector, country, year) │
│                                                                  │
│  Step 2: Ground Truth Paper Generation                           │
│     └── Create unbiased, methodologically sound papers          │
│                                                                  │
│  Step 3: Biased Paper Generation                                 │
│     └── Introduce controlled methodological flaws               │
│                                                                  │
│  Step 4: Critical Appraisal                                      │
│     └── Generate quality assessments                            │
│                                                                  │
│  Step 5: Validation                                              │
│     └── Cross-check outputs for consistency                     │
│                                                                  │
│  Step 6: Training Data Generation                                │
│     └── Format for ML training                                  │
│                                                                  │
│  Step 7: Summary Statistics                                      │
│     └── Generate reports and metrics                            │
│                                                                  │
│  Step 8: Save Outputs                                            │
│     └── Export to JSON/Excel with full provenance               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Multi-Provider Support

A key feature is support for multiple LLM providers, allowing comparison of output quality and cost-efficiency:

```python
from src.core.llm_clients import (
    OpenAIClient, 
    ClaudeClient, 
    GrokClient, 
    MistralClient, 
    GeminiClient
)

CLIENTS = {
    'openai': OpenAIClient,
    'claude': ClaudeClient,
    'grok': GrokClient,
    'mistral': MistralClient,
    'gemini': GeminiClient
}

FALLBACK_MODELS = {
    'openai': 'gpt-4o-mini',
    'claude': 'claude-3-5-haiku-20241022',
    'grok': 'grok-3-mini',
    'mistral': 'mistral-small-latest',
    'gemini': 'gemini-2.5-flash'
}

def create_provider_client(provider: str, step: int):
    """Create a client for the specified provider and step"""
    model = get_model_for_step(step, provider)
    return CLIENTS[provider](api_key=API_KEYS[provider], model=model)
```

## Proportional Method Distribution

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
