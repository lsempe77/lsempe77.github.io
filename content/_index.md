---
# Leave the homepage title empty to use the site title
title: ""
date: 2022-10-24
type: landing

design:
  # Default section spacing
  spacing: "6rem"

sections:
  - block: about.biography
    id: about
    content:
      # Choose a user profile to display (a folder name within `content/authors/`)
      username: admin
      text: ""
    design:
      background:
        color: '#f8fafc'
  - block: collection
    id: blog
    content:
      title: 'Latest Writing'
      subtitle: 'Research methods, AI tools, and lessons from the field'
      text: ''
      # Page type to display. E.g. post, talk, publication...
      page_type: post
      # Choose how many pages you would like to display (0 = all pages)
      count: 6
      # Filter on criteria
      filters:
        author: ""
        category: ""
        tag: ""
        exclude_featured: false
        exclude_future: false
        exclude_past: false
        publication_type: ""
      # Choose how many pages you would like to offset by
      offset: 0
      # Page order: descending (desc) or ascending (asc) date.
      order: desc
    design:
      # Choose a layout view - card view is more prominent
      view: article-grid
      columns: 3
      background:
        color: '#f8fafc'
  - block: markdown
    content:
      title: 'About Me'
      subtitle: ''
      text: |-
        I work at the intersection of research methods and practical policy questions. Currently a Senior Evaluation Specialist at 3ie, I spend most of my time on impact evaluations and evidence synthesis—figuring out what works, for whom, and under what conditions.
        
        Lately I've been exploring how AI tools can make evidence synthesis faster without sacrificing rigor. I also hold research positions at Queen Margaret University, Oxford (Psychiatry), and UEA (Social Work).
        
        I write here about methods, tools I'm building, and things I learn along the way. Feel free to reach out if you want to collaborate or just chat about research.
    design:
      columns: '1'
  - block: collection
    id: papers
    content:
      title: Featured Publications
      filters:
        folders:
          - publication
        featured_only: true
    design:
      view: article-grid
      columns: 2
  - block: collection
    content:
      title: Recent Publications
      text: ""
      filters:
        folders:
          - publication
        exclude_featured: false
    design:
      view: citation
---
