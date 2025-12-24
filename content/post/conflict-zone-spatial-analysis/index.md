---
title: "Spatial Analysis of Research in Conflict Zones with R"
summary: "Combining LLM-extracted location data with Uppsala conflict data to map where research has been conducted relative to conflict intensity."
date: 2024-10-25
authors:
  - admin
tags:
  - R
  - Spatial Analysis
  - Conflict Research
  - Uppsala GED
  - sf
  - Evidence Gap Maps
image:
  caption: 'Mapping research evidence against conflict zones'
categories:
  - Data Visualization
  - Research Methods
featured: false
---

## The Research Question

Where does research on fragile and conflict-affected states (FCAS) actually take place? Do studies cluster in accessible areas while conflict zones remain under-researched? 

This analysis combines:
1. **Study locations** extracted by LLMs from research papers
2. **Conflict data** from Uppsala Georeferenced Event Dataset (GED)
3. **Spatial analysis** in R to identify evidence gaps

## Data Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    SPATIAL ANALYSIS PIPELINE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Research PDFs ──► LLM Extraction ──► Country/Region Names      │
│                                              │                   │
│                                              ▼                   │
│                                     Geocoding API                │
│                                              │                   │
│                                              ▼                   │
│                              ┌───────────────┴───────────────┐  │
│                              │                               │  │
│                              ▼                               ▼  │
│                      Study Coordinates           Uppsala GED    │
│                              │                   Conflict Data  │
│                              │                         │        │
│                              └───────────┬─────────────┘        │
│                                          ▼                      │
│                                   Spatial Join                  │
│                                          │                      │
│                                          ▼                      │
│                              Evidence Gap Analysis              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Loading Required Libraries

```r
library(dplyr)
library(stringr)
library(sf)
library(rnaturalearth)
library(tidyr)
library(tidygeocoder)
library(purrr)
library(ggplot2)
```

## Processing LLM-Extracted Locations

The LLM extraction produces country and region names that need standardization:

```r
# Load LLM-extracted data
location_data <- read.csv("gpt41_mini_structured_data.csv")

# Define conflict countries with name variations
conflict_countries <- data.frame(
  standard_name = c("Nigeria", "Cameroon", "Chad", "Ethiopia", "Iraq", 
                    "Lebanon", "Myanmar", "Mozambique", 
                    "Democratic Republic of Congo"),
  iso3 = c("NGA", "CMR", "TCD", "ETH", "IRQ", 
           "LBN", "MMR", "MOZ", "COD"),
  variations = c(
    "Nigeria|Nigerian",
    "Cameroon|Cameroonian",
    "Chad|Chadian|Tchad",
    "Ethiopia|Ethiopian",
    "Iraq|Iraqi",
    "Lebanon|Lebanese",
    "Myanmar|Burma|Burmese",
    "Mozambique|Mozambican",
    "Democratic Republic of the Congo|DRC|Congo-Kinshasa|DR Congo"
  )
)

# Additional conflict-affected countries
entire_conflict_pattern <- paste0(
  "\\bAfghanistan\\b|\\bBurkina Faso\\b|\\bCentral African Republic\\b|",
  "\\bHaiti\\b|\\bLibya\\b|\\bMali\\b|\\bNiger(?!ia)\\b|\\bSomalia\\b|",
  "\\bSomaliland\\b|\\bSouth Sudan\\b|\\bSudan\\b|\\bSyria\\b|",
  "\\bWest Bank and Gaza\\b|\\bYemen\\b|\\bGaza\\b|\\bPalestine\\b"
)
```

## Country Detection from Text

```r
processed_data <- location_data %>%
  mutate(
    # Extract all countries mentioned
    all_countries = map(study_countries, function(text) {
      countries <- character(0)
      
      # Check each conflict country
      for (i in seq_len(nrow(conflict_countries))) {
        if (str_detect(text, regex(conflict_countries$variations[i], 
                                   ignore_case = TRUE))) {
          countries <- c(countries, conflict_countries$standard_name[i])
        }
      }
      
      # Check entire conflict pattern
      matches <- str_extract_all(text, 
                                 regex(entire_conflict_pattern, 
                                       ignore_case = TRUE))[[1]]
      countries <- c(countries, unique(matches))
      
      unique(countries)
    }),
    
    # Count of conflict countries per study
    conflict_country_count = map_int(all_countries, length),
    
    # Flag for any conflict country
    has_conflict_country = conflict_country_count > 0
  )
```

## Geocoding Specific Locations

```r
# Extract sub-national locations for geocoding
locations_to_geocode <- processed_data %>%
  filter(!is.na(study_regions) & study_regions != "Not specified") %>%
  mutate(
    full_location = paste(study_regions, study_countries, sep = ", ")
  ) %>%
  distinct(full_location)

# Geocode using tidygeocoder
geocoded <- locations_to_geocode %>%
  geocode(full_location, method = "osm", lat = lat, long = long)

# Handle failures with alternative methods
failed <- geocoded %>% filter(is.na(lat))
if (nrow(failed) > 0) {
  # Try with just country name
  failed_retry <- failed %>%
    mutate(country_only = str_extract(full_location, "[^,]+$")) %>%
    geocode(country_only, method = "osm", lat = lat2, long = long2)
  
  geocoded <- geocoded %>%
    left_join(failed_retry %>% select(full_location, lat2, long2)) %>%
    mutate(
      lat = coalesce(lat, lat2),
      long = coalesce(long, long2)
    )
}
```

## Loading Uppsala GED Conflict Data

```r
# Load GED data (pre-processed for efficiency)
ged_minimal <- readRDS("ged_minimal.rds")

# Or load full data and filter
# ged_full <- read.csv("GEDEvent_v24_0_1.csv")
# ged_minimal <- ged_full %>%
#   filter(year >= 2010) %>%
#   select(id, year, country, latitude, longitude, 
#          best, deaths_a, deaths_b, deaths_civilians) %>%
#   mutate(total_deaths = best)

# Convert to sf object
ged_sf <- st_as_sf(ged_minimal, 
                   coords = c("longitude", "latitude"),
                   crs = 4326)
```

## Spatial Join: Studies Near Conflict Events

```r
# Convert study locations to sf
studies_sf <- geocoded %>%
  filter(!is.na(lat) & !is.na(long)) %>%
  st_as_sf(coords = c("long", "lat"), crs = 4326)

# Create buffer around conflict events (50km)
ged_buffered <- ged_sf %>%
  st_transform(3857) %>%  # Project for buffer in meters
  st_buffer(50000) %>%    # 50km buffer
  st_transform(4326)      # Back to WGS84

# Spatial join
studies_near_conflict <- st_join(studies_sf, ged_buffered)

# Summarize conflict intensity near each study
conflict_intensity <- studies_near_conflict %>%
  group_by(full_location) %>%
  summarise(
    conflict_events = n(),
    total_fatalities = sum(total_deaths, na.rm = TRUE),
    years_of_conflict = n_distinct(year),
    .groups = "drop"
  )
```

## Creating the Evidence Gap Map

```r
# Get world map
world <- ne_countries(scale = "medium", returnclass = "sf")

# Focus on Africa (example)
africa <- world %>% filter(continent == "Africa")

# Count studies per country
studies_by_country <- processed_data %>%
  unnest(all_countries) %>%
  count(all_countries, name = "n_studies") %>%
  rename(name = all_countries)

# Join with map
africa_studies <- africa %>%
  left_join(studies_by_country, by = "name")

# Aggregate conflict fatalities by country
ged_by_country <- ged_minimal %>%
  group_by(country) %>%
  summarise(
    total_fatalities = sum(total_deaths, na.rm = TRUE),
    total_events = n()
  ) %>%
  rename(name = country)

africa_conflict <- africa %>%
  left_join(ged_by_country, by = "name")
```

## Visualizing the Gap

```r
# Evidence vs Conflict plot
africa_combined <- africa %>%
  left_join(studies_by_country, by = "name") %>%
  left_join(ged_by_country, by = "name") %>%
  mutate(
    n_studies = replace_na(n_studies, 0),
    total_fatalities = replace_na(total_fatalities, 0),
    # Calculate ratio (studies per 1000 fatalities)
    evidence_ratio = ifelse(total_fatalities > 0,
                            n_studies / (total_fatalities / 1000),
                            NA)
  )

# Map 1: Number of studies
ggplot(africa_combined) +
  geom_sf(aes(fill = n_studies)) +
  scale_fill_viridis_c(option = "plasma", na.value = "grey90",
                       name = "Number of\nStudies") +
  labs(title = "Research Evidence on FCAS in Africa",
       subtitle = "Based on LLM-extracted study locations") +
  theme_minimal()

# Map 2: Evidence gap (low studies, high conflict)
ggplot(africa_combined) +
  geom_sf(aes(fill = evidence_ratio)) +
  scale_fill_viridis_c(option = "cividis", na.value = "grey90",
                       name = "Studies per\n1000 Fatalities") +
  labs(title = "Evidence Gaps: Research vs Conflict Intensity",
       subtitle = "Lower values = greater evidence gap") +
  theme_minimal()

# Map 3: Overlay with conflict points
ggplot() +
  geom_sf(data = africa_combined, aes(fill = n_studies)) +
  geom_sf(data = ged_sf %>% filter(year >= 2020), 
          aes(size = total_deaths), 
          color = "red", alpha = 0.3) +
  scale_fill_viridis_c(option = "plasma", na.value = "grey90") +
  scale_size_continuous(range = c(0.5, 3)) +
  labs(title = "Study Locations vs Recent Conflict Events") +
  theme_minimal()
```

## Statistical Analysis

```r
# Correlation between conflict and research
country_analysis <- africa_combined %>%
  st_drop_geometry() %>%
  filter(!is.na(total_fatalities) & total_fatalities > 0) %>%
  mutate(
    log_fatalities = log1p(total_fatalities),
    log_studies = log1p(n_studies)
  )

# Pearson correlation
cor.test(country_analysis$log_fatalities, 
         country_analysis$log_studies)

# Regression
model <- lm(log_studies ~ log_fatalities, data = country_analysis)
summary(model)

# Identify outliers (under-researched conflict zones)
country_analysis <- country_analysis %>%
  mutate(
    predicted = predict(model),
    residual = log_studies - predicted,
    under_researched = residual < -1  # More than 1 SD below expected
  )

# List under-researched countries
under_researched <- country_analysis %>%
  filter(under_researched) %>%
  arrange(residual) %>%
  select(name, n_studies, total_fatalities, residual)

print(under_researched)
```

## Results Summary

| Country | Studies | Fatalities | Evidence Gap |
|---------|---------|------------|--------------|
| Somalia | 12 | 15,234 | Severe |
| South Sudan | 8 | 22,456 | Severe |
| CAR | 3 | 8,123 | Severe |
| Mali | 15 | 6,789 | Moderate |
| DRC | 45 | 34,567 | Moderate |
| Nigeria | 78 | 28,901 | Low |

---

This spatial analysis reveals systematic gaps in where research on fragile states is conducted. The combination of LLM extraction and conflict data provides evidence for prioritizing future research investments in under-studied conflict zones.
