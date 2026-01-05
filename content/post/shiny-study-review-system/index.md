---
title: "Building a Collaborative Study Review System with R Shiny"
summary: "How to create a multi-user impact evaluation review platform with Google Drive integration, role-based access, and real-time collaboration."
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

## The Review Challenge

Our Covidence subscription ran out mid-project. We had 2,000 studies left to screen and three reviewers spread across different time zones.

"Let's just use a shared Google Sheet," someone suggested. Within two days, we had version conflicts, accidentally overwrote each other's work, and lost track of who had screened what.

I spent a weekend building this Shiny app instead. It's not as polished as Covidence, but it's free, it syncs to Google Drive, and—critically—it doesn't let two people review the same study simultaneously. Here's how it works.

## Application Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     R SHINY APPLICATION                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ app.R       │  │ ui.R        │  │ server.R                │  │
│  │ Entry point │  │ UI layout   │  │ Server logic            │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
│         │                │                     │                 │
│         └────────────────┼─────────────────────┘                 │
│                          │                                       │
│  ┌───────────────────────┼───────────────────────┐              │
│  │                       │                       │              │
│  ▼                       ▼                       ▼              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ auth.R      │  │ config.R    │  │ gdrive_functions.R      │  │
│  │ Login/roles │  │ Settings    │  │ Google Drive API        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Server Modules:                                            │  │
│  │ • server_dashboard.R    - Analytics & charts              │  │
│  │ • server_data_import.R  - JSON file loading               │  │
│  │ • server_data_export.R  - Results download                │  │
│  │ • server_folder_navigation.R - Drive browser              │  │
│  │ • server_study_review.R - Review interface                │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     GOOGLE DRIVE                                 │
│  • JSON study files                                             │
│  • Review results (Google Sheets)                               │
│  • Shared folders for team access                               │
└─────────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. Authentication System

We implemented a robust authentication system to ensure data security and proper workflow management. By strictly defining user roles, we control access privileges: administrators manage the overall project settings, while reviewers are restricted to their assigned tasks, preventing unauthorized changes to the core protocol.

```r
# auth.R - Authentication and role management

# Define authorized users
ADMIN_EMAILS <- c("lsempe@3ieimpact.org")
ALLOWED_DOMAIN <- "@3ieimpact.org"

validate_user <- function(email, name) {
  # Check if email is in allowed domain
  if (!grepl(ALLOWED_DOMAIN, email, fixed = TRUE)) {
    return(list(
      valid = FALSE,
      message = "Please use your @3ieimpact.org email"
    ))
  }
  
  # Determine role
  is_admin <- email %in% ADMIN_EMAILS
  
  return(list(
    valid = TRUE,
    email = email,
    name = name,
    is_admin = is_admin,
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
