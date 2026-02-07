---
title: "A Review Interface for AI-Assisted Screening"
summary: "When you're building an AI pipeline to screen thousands of studies, you need humans in the loop—but Google Sheets doesn't cut it. A weekend R Shiny app gave us locking, audit trails, and a clean interface for validating what the model finds."
date: 2025-10-25
authors:
  - admin
tags:
  - R Shiny
  - Systematic Reviews
  - Google Drive API
  - Collaboration
  - Impact Evaluation
image:
  caption: 'Collaborative study review system'
  focal_point: ''
  placement: 2
  preview_only: false
categories:
  - Research Tools
  - R Development
featured: false
draft: false
projects: []
external_link: https://github.com/lsempe77/shiny-synthesis
---

We were building an AI pipeline to screen studies for systematic reviews—classifying thousands of abstracts by methodology, flagging relevant papers, prioritizing what needed human attention. The models worked. But the output was a spreadsheet, and the human review step was chaos.

Someone suggested Google Sheets for the validation layer. We tried it. Within two days, we had version conflicts, accidentally overwrote each other's decisions, and lost track of who had reviewed what. The Sheet would show "Reviewer A: Include" on row 847, but nobody could remember if that was from today or a restored backup from yesterday.

The problem isn't spreadsheets per se—it's that screening workflows have specific requirements that spreadsheets don't enforce. You need locking so two people don't review the same study simultaneously. You need role separation so reviewers can't accidentally modify the protocol. You need audit trails so you know who decided what and when. And if you're validating AI predictions, you need a clean interface that shows the model's recommendation alongside the study content.

Commercial tools like Covidence, EPPI-Reviewer, and Rayyan handle most of this. But they're designed for traditional screening, not AI-assisted pipelines. They don't integrate with model outputs. And they cost money we'd rather spend elsewhere.

---

## A Weekend Build

The Shiny app took a weekend to build. Not because Shiny is particularly easy, but because the problem is well-defined. You need authentication (who are you?), authorization (what can you do?), study display (show me something to review), decision capture (store what I decided), and conflict prevention (don't let two people review the same thing).

Google Drive became the backend because everyone already had access. Studies are stored as JSON files in shared folders—easy to generate from Python scripts. Review decisions are appended to a central Google Sheet. The app uses the `googledrive` and `googlesheets4` packages to read and write, which handles authentication through service accounts.

The key insight was making it work with our AI pipeline output. Each study JSON includes not just the abstract and metadata, but also the model's classification and confidence score. Reviewers see what the AI thinks, then confirm or override. This makes the human review step efficient—you're validating predictions, not starting from scratch.

---

## Preventing Chaos

The locking mechanism is simple: when a reviewer opens a study, the app writes a lock file with their email and a timestamp. If another reviewer tries to open the same study, they see a message: "This study is currently being reviewed by [name]. It will be available when they submit or after 30 minutes of inactivity." The 30-minute timeout handles abandoned sessions—someone opens a study, gets called into a meeting, never comes back.

```r
DOCUMENT_KEYWORDS = [
    'business case',
    ...
]

def identify_business_cases(self, programme):
    """Find business case documents for a programme."""
    # Lock check before showing study
    lock_file <- file.path(locks_dir, paste0(study_id, ".lock"))
    
    if (file.exists(lock_file)) {
        lock_info <- jsonlite::fromJSON(lock_file)
        lock_age <- difftime(Sys.time(), lock_info$timestamp, units = "mins")
        
        if (lock_age < 30 && lock_info$email != current_user) {
            return(list(locked = TRUE, by = lock_info$email))
        }
    }
    
    # Create new lock
    jsonlite::write_json(
        list(email = current_user, timestamp = Sys.time()),
        lock_file
    )
```

Authentication uses Google OAuth, restricted to our organizational domain. When you sign in, the app checks your email against an admin list. Admins can modify the review protocol, import new batches of studies, and export results. Regular reviewers can only do what they're supposed to do: read studies, make decisions, add notes.

This role separation solves a real problem. In our Google Sheets era, someone accidentally deleted the protocol column and we didn't notice for two days. With proper authorization, that becomes impossible—the protocol lives in admin-only space.

---

## The Interface

The review interface is deliberately minimal. Title, authors, abstract, a few key metadata fields. The AI's prediction and confidence score, highlighted so you can't miss it. Three buttons: Include, Exclude, Unclear. A notes field for explaining decisions, especially when you disagree with the model. Nothing else.

The goal is to make reviewing as frictionless as possible. Screening thousands of studies is tedious enough without fighting the interface. One click to confirm the AI's recommendation, two seconds to load the next study.

Real-time progress tracking turned out to be more motivating than expected. The dashboard shows how many studies each reviewer has completed, how many remain, how long the average review takes. It's gamification, essentially—seeing your completion percentage tick up provides psychological momentum.

The dashboard also tracks agreement with the model. What percentage of AI "include" predictions do humans confirm? What about "exclude"? This feedback helps calibrate the pipeline. If humans are overriding the model 40% of the time on a particular category, that category needs retraining.

---

## The Technical Debt

The technical debt is real. Error handling is minimal—if Google's API hiccups, the app shows an opaque error message. The UI is functional but not beautiful. Performance degrades with very large batches (the JSON parsing isn't optimized). Session management is basic.

But here's the thing: it works. We've run several thousand studies through it across multiple systematic review projects. Multiple reviewers, multiple time zones, zero data loss, zero conflict incidents.

Would I recommend building your own review platform? Probably not, if you have budget for commercial tools and don't need AI integration. They're better: more features, proper support, tested at scale. But if you're building a custom screening pipeline and need a human validation layer that integrates with your model outputs, Shiny is surprisingly capable.

---

## The Real Point

The broader lesson is about appropriate technology. Commercial review platforms are sophisticated: machine learning prioritization, duplicate detection, PDF annotation, PRISMA diagram generation. Most of that sophistication goes unused. For validating AI predictions, you need: show a study with the model's guess, capture a human decision, track who did what.

A weekend Shiny app can do that. It's not elegant, but it's free, it's ours, and it plugs directly into the pipeline.

The code lives on GitHub with documentation for deployment. It assumes R familiarity and a Google Cloud project with Drive API enabled. Fair warning: you'll spend more time on OAuth configuration than on the actual Shiny development.

*Built in R Shiny with googledrive and googlesheets4. About 500 lines of code for the core functionality.*
