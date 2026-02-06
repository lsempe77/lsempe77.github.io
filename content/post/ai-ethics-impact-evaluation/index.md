---
title: "When Algorithms Meet Warzones"
subtitle: "The ethics of AI in fragile state research"
summary: "A drone image classifier that can't distinguish combatants from farmers. A beneficiary targeting model trained on data from before the displacement. A chatbot collecting trauma narratives in a language it barely understands. These aren't hypotheticals—they're the edge cases where AI meets impact evaluation in fragile contexts."
authors:
  - admin
tags:
  - AI Ethics
  - Impact Evaluation
  - FCAS
  - Research Ethics
  - Humanitarian
  - Conflict
categories:
  - Research Methods
  - AI Ethics
date: 2026-02-06
lastmod: 2026-02-06
featured: true
draft: false

image:
  caption: "AI ethics in fragile contexts"
  focal_point: "Center"
  placement: 2
  preview_only: false

projects: []
---

In 2019, a humanitarian organization in South Sudan deployed a machine learning model to predict which households were most likely to experience acute food insecurity. The model worked beautifully on the training data—historical surveys from 2016-2018. But by the time it was deployed, conflict had displaced a third of the population. The households the model flagged as "low risk" included families who had fled to areas with no food distribution points. The model was technically accurate; it just described a country that no longer existed.

I think about this case often. It captures something essential about the collision between AI's hunger for stable patterns and the radical instability of fragile and conflict-affected states. The algorithm learned what hunger looked like in peacetime. It had no concept of what happens when the patterns break.

This is a story about that collision—about what happens when we bring the tools of computational social science into contexts where the assumptions underlying those tools may not hold.

---

The theoretical problem is what philosophers call the "reference class problem," but sharpened by violence. All prediction depends on the assumption that the future will resemble the past in relevant ways. In stable contexts, this assumption is reasonable enough that we rarely examine it. In FCAS contexts, it's often false in ways that matter.

Consider targeting. Most humanitarian AI applications involve some form of beneficiary selection—predicting who needs assistance most, who will benefit most from an intervention, who is at greatest risk. The models are trained on historical data: past surveys, past program records, past outcomes. But in fragile states, the population you're trying to help today may have almost nothing in common with the population that generated your training data.

The South Sudan case is extreme, but the dynamic is common. A targeting model trained on Syrian refugee data from 2015 camps in Jordan will miss the vulnerability patterns of 2024 arrivals in Lebanon. A food security predictor calibrated on pre-coup Myanmar will fail in post-coup Myanmar. The features that predicted poverty last year—distance to market, household size, land ownership—may be meaningless after displacement reshuffles everything.

This isn't a problem you can solve with more data or better algorithms. It's a structural mismatch between the epistemology of machine learning and the ontology of crisis.

---

The ethical stakes are correspondingly higher. In a stable-country RCT, an algorithm that wrongly excludes someone from treatment is unjust but probably not catastrophic. The excluded person likely has other options; the harm, while real, is bounded. In a humanitarian context, exclusion can mean the difference between eating and not eating, between safety and violence, between life and death.

This changes the ethical calculus. The standard research ethics framework—autonomy, beneficence, non-maleficence, justice—still applies, but the weights shift dramatically.

**On consent:** Meaningful consent requires understanding what you're agreeing to. In stable contexts, explaining "we'll use an algorithm to determine your eligibility" is complicated but feasible. In a displacement camp where participants may be illiterate, traumatized, and unfamiliar with computation, the same explanation becomes almost meaningless. Consent becomes performative—a box-checking exercise that protects the institution rather than the participant. I've watched consent processes in South Sudanese camps. The notion that a 20-minute explanation of algorithmic targeting produces genuine informed agreement is fiction.

**On power asymmetry:** Research ethics has always grappled with power imbalances between researchers and participants. AI amplifies these imbalances. The researcher controls not just the study design but an opaque technical system that participants cannot scrutinize, cannot appeal, and often cannot even perceive. When a field worker decides you're ineligible for a program, you can argue. When an algorithm decides, there's no interlocutor. This asymmetry is especially acute in fragile contexts, where participants may already be dependent on the implementing organization for protection, services, or legal status.

**On dual use:** In FCAS contexts, data has security implications that don't exist elsewhere. A dataset of household locations and vulnerability scores is a beneficiary registry to a humanitarian organization. It's also a target list to an armed group. AI systems that process this data—even for benign purposes—create digital artifacts that can be repurposed. The transcripts from a trauma counseling chatbot, if accessed by the wrong party, become intelligence. This isn't paranoid speculation; it's documented. Humanitarian data has been seized, leaked, and weaponized.

---

There's a deeper theoretical issue that the ethics literature hasn't fully grappled with: the question of what counts as a "participant" when AI systems learn patterns that extend beyond the study sample.

Traditional research ethics assumes a bounded set of participants who consent to specific procedures. But machine learning models trained on population data learn generalizations that apply to people who never participated. If I train a vulnerability classifier on 10,000 surveyed households, that classifier will be applied to households that weren't surveyed. They never consented to anything—but decisions affecting their lives are being made based on patterns extracted from others.

This is especially fraught in conflict settings, where population categories themselves can be contested or dangerous. A classifier that learns to predict displacement risk based on ethnicity has learned something that shouldn't exist as a decision variable. The model doesn't "know" it's using ethnicity—it just found that a combination of location, language, and name features is predictive. But the effect is the same.

---

So what do we do? I've been developing a set of principles—not a complete framework, but a starting point for thinking about AI deployment in fragile contexts.

**Principle 1: Temporal humility.** Any model deployed in a FCAS context should be treated as having an expiration date. Build in automatic degradation checks. When the world changes faster than your training data, the model should flag itself as unreliable. This means continuous monitoring against ground truth, even when ground truth is expensive to collect.

**Principle 2: Explanation as non-negotiable.** In contexts where consent is already compromised by power asymmetry and desperation, the least we can do is make algorithmic decisions explicable. Not interpretable in the technical sense—I don't mean SHAP values—but explainable in human terms. "You were selected because your household has children under five and no reported income" is acceptable. "You were selected because of your score on a 47-dimensional embedding" is not.

**Principle 3: Recourse before deployment.** Before any AI system is used for targeting or resource allocation in a fragile context, there should be a functioning appeals process. Not a suggestion box—an actual mechanism by which someone can challenge an algorithmic decision and have it reviewed by a human with authority to override. If you can't build this, you shouldn't deploy.

**Principle 4: Data minimization with teeth.** Collect only what you need, retain only what you must, and delete on a schedule. This is standard data protection advice, but in FCAS contexts it's a security imperative. Every additional data point is a liability. Every additional day of retention is exposure. The cost-benefit calculation favors aggressive deletion in ways that researchers accustomed to "keep everything for reproducibility" need to internalize.

---

I'm presenting a version of this at a 3ie seminar next month, and I expect pushback. The humanitarian sector is under pressure to demonstrate efficiency, and AI promises efficiency gains that are hard to refuse. The response to "your targeting model might not work after displacement" is likely to be "what's the alternative—random selection?"

It's a fair question. I don't think the answer is to avoid AI entirely. But I do think we need a different posture—one that treats these tools as provisional, contextual, and fallible in ways that require ongoing human judgment. Not AI as oracle, but AI as one input among many, always subject to override, always accompanied by the question: what happens when this breaks?

The South Sudan model failed silently. Nobody knew it was wrong until a post-hoc analysis months later. That's the outcome we need to design against: not just algorithmic failure, but algorithmic failure that we don't notice until the damage is done.

{{< icon name="book" pack="fas" >}} In development | FCAS ethics | AI in humanitarian research

*Seminar draft. Comments welcome.*
