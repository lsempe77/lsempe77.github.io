---
title: "Teaching R to People Who Don't Want to Learn R"
summary: "When your audience is evaluation professionals who need results, not programmers who love syntax, you have to teach differently. A four-session course that starts with why, not how."
date: 2026-01-15
authors:
  - admin
tags:
  - R
  - Teaching
  - Impact Evaluation
  - Data Analysis
  - Capacity Building
image:
  caption: 'R programming for impact evaluation'
  focal_point: ''
  placement: 2
  preview_only: false
categories:
  - Education
  - Data Science
featured: false
draft: false
projects: []
external_link: https://github.com/lsempe77/R-course
---

Nobody signs up for an R course because they love programming. They sign up because they have data they need to analyze, a report deadline approaching, and a vague sense that Excel won't cut it anymore. If you teach R like a computer science course—starting with data types and working toward useful output—you'll lose them by session two.

I learned this running training programs across the Middle East and Africa. The participants were smart, motivated professionals working in development evaluation. They had economics degrees. They'd run surveys. But the moment I showed them a function definition, eyes glazed over.

So I rebuilt the course around a different principle: start with the output they want, then reveal how we got there.

---

## The Problem with Standard Programming Pedagogy

Most programming courses follow a logical sequence: variables, then data types, then control flow, then functions, then libraries, then applications. This makes sense to programmers. Each concept builds on the previous one.

But it's terrible pedagogy for non-programmers. You're asking people to learn a hundred abstract concepts before they see anything useful. By the time they could theoretically build something meaningful, they've already concluded that programming isn't for them.

The alternative is showing useful output first. In session one, before explaining what a function is, I show them a complete analysis: loading data, calculating means by group, running a regression, producing a formatted table. We run the code together. It works. They see results.

Then we unpack how we got there.

---

## Four Sessions, Four Outputs

Each session produces something tangible that they could use in their actual work.

**Session 1** ends with descriptive statistics and a publication-ready table. We load a real dataset—evaluation data from a program they recognize—and produce summary statistics by treatment group. The table looks professional. They could put it in a report tomorrow.

**Session 2** ends with data visualization. We build bar charts, scatter plots, and maps. The emphasis is on aesthetics: how do you make a chart that a donor would actually want to see? We talk about color, labels, and the difference between exploratory graphs (for you) and presentation graphs (for them).

**Session 3** ends with regression output. We run difference-in-differences, extract coefficients, format them properly, and interpret them in development context. The deliverable is a regression table they could include in an impact evaluation report.

**Session 4** ends with reproducibility. We take everything from the previous sessions and package it into a Quarto document that generates a complete analytical report from raw data. Change the data, re-render, new report.

---

## Teaching Philosophy

Every concept is introduced because we need it, not because it's next in the syllabus. We learn about vectors because we need to calculate means. We learn about functions because we keep repeating the same code. We learn about packages because base R doesn't make nice tables.

I also try to be honest about the learning curve. R is harder than Excel. The first week is frustrating. But the payoff is real: analyses that are reproducible, scalable, and auditable. When a donor asks "what happens if we exclude attritors?", you don't redo the spreadsheet—you change one line and regenerate.

The course materials are built in Quarto, which means the slides themselves are examples of what R can produce. Students see the code that generated the presentation they're watching.

---

## What Actually Matters

After running this course several times, I've learned what sticks and what doesn't.

**What sticks:** The tidyverse grammar. Once people understand `data %>% filter() %>% group_by() %>% summarize()`, they can read almost any data manipulation code. It's readable English.

**What doesn't stick:** Base R syntax. Nobody remembers bracket notation six months later if they learned it in isolation. I teach it when necessary but don't emphasize it.

**What matters most:** The mental model. Programming is telling a very literal assistant what to do, step by step. Once people internalize that the computer does exactly what you say—no more, no less—debugging becomes less mystifying.

---

## Ongoing Work

The course continues to evolve. Each cohort surfaces new questions, new datasets, new use cases. The Abu Dhabi sessions forced me to find examples from the Gulf region. The sessions in other contexts require different datasets, different policy questions.

The code and slides are available for anyone to adapt.

*The course materials are on [GitHub](https://github.com/lsempe77/R-course).*
