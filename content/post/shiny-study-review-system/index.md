---
title: "When Covidence Got Too Expensive"
summary: "Our subscription lapsed mid-project with 2,000 studies left to screen. A weekend of R Shiny development later, we had a free alternative that syncs to Google Drive and doesn't let reviewers clobber each other's work."
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
categories:
  - Research Tools
  - R Development
featured: false
---

The email arrived on a Thursday: "Your Covidence subscription has expired. Studies and data will be accessible for 30 days in read-only mode." We had 2,000 studies left to screen and three reviewers across three time zones.

Someone suggested Google Sheets. We tried it. Within two days, we had version conflicts, accidentally overwrote each other's decisions, and lost track of who had screened what. The Sheet would show "Reviewer A: Include" on row 847, but nobody could remember if that was from today or a restored backup from yesterday.

The problem isn't spreadsheets per se—it's that screening workflows have specific requirements that spreadsheets don't enforce. You need locking so two people don't review the same study simultaneously. You need role separation so reviewers can't accidentally modify the protocol. You need audit trails so you know who decided what and when.

Covidence handles all of this. So does EPPI-Reviewer, DistillerSR, and Rayyan. But they cost money, and our budget was gone.

---

The Shiny app took a weekend to build. Not because Shiny is particularly easy, but because the problem is well-defined. You need authentication (who are you?), authorization (what can you do?), study display (show me something to review), decision capture (store what I decided), and conflict prevention (don't let two people review the same thing).

Google Drive became the backend because everyone already had access. Studies are stored as JSON files in shared folders. Review decisions are appended to a central Google Sheet. The app uses the googledrive and googlesheets4 packages to read and write, which handles authentication through service accounts.

The locking mechanism is simple: when a reviewer opens a study, the app writes a lock file with their email and a timestamp. If another reviewer tries to open the same study, they see a message: "This study is currently being reviewed by [name]. It will be available when they submit or after 30 minutes of inactivity." The 30-minute timeout handles abandoned sessions—someone opens a study, gets called into a meeting, never comes back.

---

Authentication uses Google OAuth, restricted to our organizational domain. When you sign in, the app checks your email against an admin list. Admins can modify the review protocol, import new batches of studies, and export results. Regular reviewers can only do what they're supposed to do: read studies, make decisions, add notes.

This role separation solves a real problem. In our Google Sheets era, someone accidentally deleted the protocol column and we didn't notice for two days. With proper authorization, that becomes impossible—the protocol lives in admin-only space.

The review interface is deliberately minimal. Title, authors, abstract, a few key metadata fields. Three buttons: Include, Exclude, Unclear. A notes field for explaining decisions. Nothing else. The goal is to make reviewing as frictionless as possible because screening 2,000 studies is already tedious enough without fighting the interface.

---

Real-time progress tracking turned out to be more motivating than expected. The dashboard shows how many studies each reviewer has completed, how many remain, how long the average review takes. It's gamification, essentially—seeing your completion percentage tick up provides psychological momentum.

The dashboard also shows agreement rates. If two reviewers both see a study (which happens for a configurable percentage of the corpus, to assess inter-rater reliability), the app tracks whether they agreed. This catches calibration issues early. If disagreement rates are high, it usually means the inclusion criteria need clarification.

Export produces a clean spreadsheet: study ID, final decision, reviewer(s), timestamps, notes. The format is designed for direct import into PRISMA flow diagrams and the final systematic review write-up. Nothing fancy, but structured consistently.

---

The technical debt is real. Error handling is minimal—if Google's API hiccups, the app shows an opaque error message. The UI is functional but not beautiful. Performance degrades with very large batches (the JSON parsing isn't optimized). Session management is basic.

But here's the thing: it works. We finished screening those 2,000 studies. Three reviewers, three time zones, zero data loss, zero conflict incidents. The app is still running, now on its third systematic review project.

Would I recommend building your own review platform? Probably not, if you have budget for commercial tools. They're better: more features, proper support, tested at scale. But if you don't have budget—or if you need something custom that commercial tools don't offer—Shiny is surprisingly capable.

---

The broader lesson is about appropriate technology. Commercial review platforms are sophisticated: machine learning prioritization, duplicate detection, PDF annotation, PRISMA diagram generation. Most of that sophistication goes unused. For a straightforward screening task, you need: show a study, capture a decision, track who did what.

A weekend Shiny app can do that. It's not elegant, but it's free and it's ours.

The code lives on GitHub with documentation for deployment. It assumes R familiarity and a Google Cloud project with Drive API enabled. Fair warning: you'll spend more time on OAuth configuration than on the actual Shiny development.

*Built in R Shiny with googledrive and googlesheets4. About 500 lines of code for the core functionality.*
    role = ifelse(is_admin, "admin", "reviewer")
  ))
}

# UI shows different options based on role
create_auth_ui <- function() {
  fluidPage(
    div(class = "auth-container",
      h2("Impact Evaluation Reviewer"),
      textInput("email", "Email Address:", 
                placeholder = "yourname@3ieimpact.org"),
      textInput("name", "Your Name:"),
      actionButton("login", "Access Review System")
    )
  )
}
```

### 2. Google Drive Integration

Seamless file browsing and data persistence:

```r
# gdrive_functions.R - Google Drive API wrapper

library(googledrive)
library(googlesheets4)

# Initialize authentication
setup_drive_auth <- function() {
  # Use service account or OAuth
  drive_auth(path = "client_secret.json")
  gs4_auth(path = "client_secret.json")
}

# List folders in current directory
list_drive_folders <- function(parent_id = NULL) {
  if (is.null(parent_id)) {
    # Root folder
    query <- "mimeType = 'application/vnd.google-apps.folder'"
  } else {
    query <- sprintf(
      "'%s' in parents and mimeType = 'application/vnd.google-apps.folder'",
      parent_id
    )
  }
  
  drive_find(q = query, n_max = 100)
}

# Import JSON files from folder
import_json_from_folder <- function(folder_id) {
  # Find JSON files
  files <- drive_find(
    q = sprintf("'%s' in parents and name contains '.json'", folder_id),
    n_max = 500
  )
  
  # Download and parse each file
  studies <- list()
  for (i in seq_len(nrow(files))) {
    temp_file <- tempfile(fileext = ".json")
    drive_download(files$id[i], path = temp_file, overwrite = TRUE)
    study <- jsonlite::fromJSON(temp_file)
    study$file_id <- files$id[i]
    study$file_name <- files$name[i]
    studies[[i]] <- study
  }
  
  bind_rows(studies)
}

# Save results to Google Sheets
save_results_to_sheets <- function(results_df, sheet_name) {
  # Create or update sheet
  sheet <- gs4_create(
    sheet_name,
    sheets = list(results = results_df)
  )
  
  # Share with team
  drive_share(sheet, role = "writer", type = "domain", 
              domain = "3ieimpact.org")
  
  sheet$id
}
```

### 3. Study Review Interface

The core review workflow:

```r
# server_study_review.R - Review interface logic

create_review_interface <- function(input, output, session, rv) {
  
  # Navigation between studies
  observeEvent(input$next_study, {
    if (rv$current_study < nrow(rv$studies)) {
      rv$current_study <- rv$current_study + 1
    }
  })
  
  observeEvent(input$prev_study, {
    if (rv$current_study > 1) {
      rv$current_study <- rv$current_study - 1
    }
  })
  
  # Display current study
  output$study_fields <- renderUI({
    study <- rv$studies[rv$current_study, ]
    
    tagList(
      h3(study$title),
      
      # Authors and year
      div(class = "study-meta",
        span(paste(study$authors, collapse = ", ")),
        span(class = "year", study$year)
      ),
      
      # Abstract
      h4("Abstract"),
      p(study$abstract),
      
      # Key fields in collapsible sections
      bsCollapse(
        bsCollapsePanel("Methods", study$methods),
        bsCollapsePanel("Intervention", study$intervention),
        bsCollapsePanel("Outcomes", study$outcomes),
        bsCollapsePanel("Country/Context", study$country)
      )
    )
  })
  
  # Review actions
  observeEvent(input$approve, {
    rv$studies$status[rv$current_study] <- "approved"
    rv$studies$reviewer[rv$current_study] <- rv$user$email
    rv$studies$review_date[rv$current_study] <- Sys.time()
    
    showNotification("Study approved!", type = "success")
  })
  
  observeEvent(input$disapprove, {
    rv$studies$status[rv$current_study] <- "disapproved"
    rv$studies$reviewer[rv$current_study] <- rv$user$email
    rv$studies$review_date[rv$current_study] <- Sys.time()
    
    showNotification("Study disapproved", type = "warning")
  })
  
  # Status display
  output$current_status <- renderText({
    status <- rv$studies$status[rv$current_study]
    ifelse(is.na(status) || status == "", "Pending", status)
  })
}
```

### 4. Dashboard Analytics

Real-time progress tracking:

```r
# server_dashboard.R - Analytics and visualizations

create_dashboard <- function(input, output, session, rv) {
  
  # Summary statistics
  output$total_studies <- renderValueBox({
    valueBox(
      nrow(rv$studies),
      "Total Studies",
      icon = icon("book"),
      color = "blue"
    )
  })
  
  output$approved_studies <- renderValueBox({
    n_approved <- sum(rv$studies$status == "approved", na.rm = TRUE)
    valueBox(
      n_approved,
      "Approved",
      icon = icon("check"),
      color = "green"
    )
  })
  
  output$pending_studies <- renderValueBox({
    n_pending <- sum(is.na(rv$studies$status) | rv$studies$status == "")
    valueBox(
      n_pending,
      "Pending Review",
      icon = icon("clock"),
      color = "orange"
    )
  })
  
  # Status distribution chart
  output$status_plot <- renderPlotly({
    status_counts <- rv$studies %>%
      mutate(status = ifelse(is.na(status) | status == "", 
                             "Pending", status)) %>%
      count(status)
    
    plot_ly(status_counts, 
            labels = ~status, 
            values = ~n, 
            type = "pie",
            marker = list(colors = c("#28a745", "#ffc107", "#dc3545")))
  })
  
  # Studies by sector
  output$sector_plot <- renderPlotly({
    sector_counts <- rv$studies %>%
      count(sector) %>%
      arrange(desc(n))
    
    plot_ly(sector_counts,
            x = ~reorder(sector, n),
            y = ~n,
            type = "bar",
            orientation = "h")
  })
  
  # Studies table
  output$studies_table <- DT::renderDataTable({
    rv$studies %>%
      select(title, authors, year, sector, status, reviewer) %>%
      datatable(
        options = list(pageLength = 10),
        filter = "top"
      )
  })
}
```

### 5. Export Functionality

Multiple export formats for different needs:

```r
# server_data_export.R - Export handlers

setup_exports <- function(input, output, session, rv) {
  
  # Full JSON export
  output$download_json <- downloadHandler(
    filename = function() {
      paste0("review_results_", Sys.Date(), ".json")
    },
    content = function(file) {
      jsonlite::write_json(rv$studies, file, pretty = TRUE)
    }
  )
  
  # CSV export
  output$download_csv <- downloadHandler(
    filename = function() {
      paste0("review_results_", Sys.Date(), ".csv")
    },
    content = function(file) {
      write.csv(rv$studies, file, row.names = FALSE)
    }
  )
  
  # Approved only
  output$download_approved <- downloadHandler(
    filename = function() {
      paste0("approved_studies_", Sys.Date(), ".json")
    },
    content = function(file) {
      approved <- rv$studies %>% filter(status == "approved")
      jsonlite::write_json(approved, file, pretty = TRUE)
    }
  )
}
```

## UI Layout

The interface uses shinydashboard for a clean, professional look:

```r
# ui.R - Main UI structure

main_ui <- dashboardPage(
  dashboardHeader(
    title = "Impact Evaluation Study Reviewer",
    tags$li(class = "dropdown",
      actionLink("logout", "Logout", icon = icon("sign-out-alt"))
    )
  ),
  
  dashboardSidebar(
    div(style = "padding: 15px;",
      h5(textOutput("welcome_user"))
    ),
    sidebarMenu(
      menuItem("Review Studies", tabName = "review", 
               icon = icon("clipboard-check")),
      menuItem("Dashboard", tabName = "dashboard", 
               icon = icon("chart-line")),
      conditionalPanel(
        condition = "output.is_admin",
        menuItem("Export Results", tabName = "export", 
                 icon = icon("download"))
      )
    )
  ),
  
  dashboardBody(
    useShinyjs(),
    tabItems(
      create_review_tab(),
      create_dashboard_tab(),
      create_export_tab()
    )
  )
)
```

## Deployment Options

### 1. shinyapps.io (Simple)
```r
library(rsconnect)
rsconnect::deployApp()
```

### 2. Shiny Server (Self-hosted)
```bash
# Install on Ubuntu
sudo apt-get install shiny-server
sudo cp -r myapp /srv/shiny-server/
```

### 3. Docker
```dockerfile
FROM rocker/shiny
COPY . /srv/shiny-server/
RUN R -e "install.packages(c('shinydashboard', 'googledrive', 'DT'))"
EXPOSE 3838
```

## Lessons Learned

1. **Google Drive API Quotas**: Batch operations to avoid rate limits
2. **Concurrent Editing**: Use locking or Google Sheets for real-time sync
3. **Session State**: Store user progress in reactive values
4. **Error Handling**: Wrap API calls in tryCatch with user-friendly messages
5. **Mobile Responsive**: Test on tablets—reviewers use them!

## Future Enhancements

- **Dual-reviewer mode**: Require agreement for inclusion
- **Conflict resolution**: Flag disagreements for discussion
- **Quality checks**: Detect suspicious patterns (too fast, all same decision)
- **Integration**: Connect with Zotero/Mendeley for citation management

---

Custom review tools, while requiring development effort, provide flexibility that commercial solutions can't match—especially for specialized workflows like impact evaluation screening.
