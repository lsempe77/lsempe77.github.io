---
title: "Writing a Methods Book Nobody Asked For"
summary: "A comprehensive Spanish-language research methods textbook covering the complete research process—from formulating questions to writing results—built around the mistakes students actually make, not the theory professors think they need."
date: 2024-01-15
authors:
  - admin
tags:
  - Research Methods
  - Teaching
  - Spanish
  - Quarto
  - Academia
image:
  caption: 'Research methodology textbook'
  focal_point: ''
  placement: 2
  preview_only: false
categories:
  - Education
  - Writing
featured: false
draft: false
projects: []
external_link: https://github.com/lsempe77/metodos
---

I entered academia late. I'd studied many things, worked in various fields, accumulated knowledge in a disorganized way that left gaps where fundamentals should be. When I finally started doing research seriously, I realized how much time I'd wasted—not from lack of effort, but from lack of guidance.

The methodology textbooks didn't help. They were written by experts who'd forgotten what confusion feels like. They presented research as a clean, linear process: formulate hypothesis, design study, collect data, analyze, conclude. Real research isn't like that. Real research is messy, iterative, full of wrong turns and recovered mistakes.

So I started writing something different. Not for the student who knows everything, but for myself—to remember what I did wrong and what, occasionally, I got right.

---

## The Problem with Methods Textbooks

Standard methodology textbooks have a pedagogical structure that makes sense to professors: start with epistemology, move to research design, then data collection, then analysis. Each chapter assumes you've mastered the previous one.

But students don't learn that way. They're usually trying to write a thesis while taking the methods course. They need practical guidance now, not philosophical grounding for later. They want to know: how do I write a research question? What makes a good hypothesis? Why does my advisor keep rejecting my drafts?

The books don't answer those questions directly. They explain what a hypothesis *is* without explaining how to write one that won't embarrass you. They describe sampling strategies without mentioning that your actual sample will be whoever agrees to participate.

---

## A Different Approach

What started as scattered teaching notes has grown into a comprehensive book covering the complete research process—now 19 chapters built in Quarto that follow a student from initial curiosity to finished thesis.

The structure follows the research process, but each chapter starts with problems, not theory. What goes wrong? What mistakes do people make? Then we work backward to principles that prevent those mistakes.

### Part I: Foundations

The book opens with a frank discussion of why we research at all ("¿Para qué investigamos?")—distinguishing genuine inquiry from "opinar con bibliografía" (having opinions with citations). This isn't philosophy for its own sake. Understanding the difference between confirmation bias and research shapes everything that follows.

Then come the foundations: paradigms and perspectives (without the usual wars), key concepts, and the research process overview. These chapters establish vocabulary and orientation without pretending to resolve debates that working researchers don't actually spend time on.

### Part II: The Research Question Engine

The core engine of any thesis is the question-hypothesis-variables tripod. Three chapters address this systematically:

**"La pregunta de investigación: el corazón de todo"** includes "the 5 lethal questions" to test whether your research question actually works:
1. Can it be answered empirically?
2. Can it be answered with your resources?
3. Has it been answered before? (Check before you start)
4. Does anyone care about the answer?
5. What changes if you answer it?

**"El marco teórico: los lentes con los que miras"** distinguishes using theory from copying definitions. A working theoretical framework defines your problem, orients your variables, and anticipates measurement—not decorates your literature review.

**"Hipótesis, objetivos y variables: el trípode"** tackles operationalization head-on. I show thesis drafts where the research question asks one thing and the survey measures something else entirely. The gap is obvious once you see it.

### Part III: Design and Methods

**"Cuantitativo, cualitativo, mixto: elige tu aventura"** refuses the false wars. Numbers and words are tools. If you ask "how many?", you need numbers. If you ask "how do they experience it?", you need words. Pretending these are interchangeable isn't pluralism—it's confusion.

**"Diseños de investigación: el plano de tu casa"** covers experimental, quasi-experimental, and observational designs. It explains difference-in-differences, propensity score matching, and regression discontinuity—but honestly about when they're actually feasible.

**"Muestreo: ¿a quién le preguntas?"** is perhaps the most honest chapter. Most theses use convenience sampling. I acknowledge this while explaining what it costs and how to mitigate bias. The formula-driven section on sample size includes diminishing returns graphs showing why increasing from 400 to 1,000 barely moves your margin of error.

### Part IV: Doing the Work

**"Recolección de datos: salir al campo"** covers surveys, interviews, focus groups, observation, and secondary data. Survey design includes the "golden rules": clarity above all, one idea per question, no leading questions. The interview section's core lesson: shut up and listen.

**"Análisis de datos: donde la magia (no) ocurre"** demystifies both quantitative and qualitative analysis. For quantitative work: clean your data first, start descriptive, then move to regression. For qualitative work: the full coding process from transcription through saturation to interpretation.

**"Métodos comparados: más allá de la regresión"** introduces Qualitative Comparative Analysis (QCA) for small-N comparative designs—when you have 15-50 cases and regression won't work but you need systematic analysis.

**"Visualización de datos: mostrar para convencer"** teaches how a good graph beats a thousand tables, with R code for maps, scatter plots, and presentation-ready figures.

### Part V: Finishing Strong

**"Escribir la tesis: el arte de no morir en el intento"** is the chapter students actually read first. Practical advice on writing when you don't feel ready, structuring arguments, and surviving the revision process.

**"Resultados y discusión: conectar los puntos"** separates what you found from what it means. The chapter emphasizes that your discussion should "converse with the literature"—not just summarize your findings again.

**"Errores más comunes: el museo de los horrores"** catalogs 15+ mistakes I see repeatedly:
- The "ocean question" (too broad to research in one lifetime)
- The "Wikipedia theoretical framework" (definitions ≠ theory)
- Correlation-causation confusion
- Cherry-picking qualitative quotes
- The lying graph (truncated axes, manipulated scales)

The chapter ends with a pre-submission checklist that's saved more than a few students from embarrassment.

---

## Politically Incorrect

The subtitle mentions being "politically incorrect," which sounds provocative but really just means: I say things methods textbooks usually don't.

For instance: qualitative and quantitative research aren't equal for all purposes. If you want to know whether a drug works, you run a randomized trial, not an ethnography. If you want to understand why patients don't take their medication, qualitative methods might serve better. Pretending these approaches are interchangeable isn't pluralism—it's confusion.

I also discuss how academic incentives shape research practice in ways that aren't usually acknowledged. Why do papers hedge their conclusions? Why are null results rare in journals? Why do literature reviews cite the same twenty papers? These are practical realities students will encounter, and pretending they don't exist doesn't prepare anyone for actual academic work.

---

## What I've Learned

Writing the book has taught me how little I actually understood about things I thought I knew. Explaining something clearly requires understanding it deeply, and my explanations keep revealing gaps.

The students teach me too. Their questions identify where my explanations fail. Their mistakes show me which concepts need more emphasis. Their thesis drafts demonstrate what's actually confusing versus what I assumed would be confusing.

The book migrated from Bookdown to Quarto, reflecting the evolving R ecosystem. Chapters are polished through teaching—each semester's students find the weak spots I missed.

---

## A Note on Language

Writing in Spanish matters. Most methodology resources come from English-speaking academia, and translation isn't just about words. Research cultures differ. Thesis expectations differ. The path from student to researcher differs.

A Spanish-language methods book can address the Latin American academic context directly: the specific challenges of doing research with limited funding, the relationship between universities and government, the tension between local relevance and international publication. These aren't footnotes—they're central to how research actually happens in the region.

*The book is available at [GitHub](https://github.com/lsempe77/metodos) and continues to evolve.*
