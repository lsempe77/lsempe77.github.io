/**
 * Generate professional, minimalist header images for blog posts
 * Clean geometric designs with gradients
 * 
 * Run: node scripts/generate-blog-images.js
 */

import pkg from 'canvas';
const { createCanvas } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Professional color palettes
const palettes = {
  emerald: { primary: '#059669', secondary: '#34d399', bg: '#ecfdf5', dark: '#064e3b' },
  blue: { primary: '#2563eb', secondary: '#60a5fa', bg: '#eff6ff', dark: '#1e3a8a' },
  violet: { primary: '#7c3aed', secondary: '#a78bfa', bg: '#f5f3ff', dark: '#4c1d95' },
  amber: { primary: '#d97706', secondary: '#fbbf24', bg: '#fffbeb', dark: '#78350f' },
  rose: { primary: '#e11d48', secondary: '#fb7185', bg: '#fff1f2', dark: '#881337' },
  cyan: { primary: '#0891b2', secondary: '#22d3ee', bg: '#ecfeff', dark: '#164e63' },
  slate: { primary: '#475569', secondary: '#94a3b8', bg: '#f8fafc', dark: '#1e293b' },
};

// Blog themes with visual concepts
const blogThemes = {
  'ai-screening-validation': {
    title: 'AI Screening & Validation',
    visual: 'filter',
    palette: 'emerald'
  },
  'ai-ethics-impact-evaluation': {
    title: 'AI Ethics in Evaluation',
    visual: 'balance',
    palette: 'violet'
  },
  'ai-governance-capacity': {
    title: 'AI Governance Capacity',
    visual: 'network',
    palette: 'blue'
  },
  'ai-persona-steering': {
    title: 'AI Persona Steering',
    visual: 'compass',
    palette: 'rose'
  },
  'rag-system-research-documents': {
    title: 'RAG Systems for Research',
    visual: 'layers',
    palette: 'cyan'
  },
  'building-ai-research-qa-system': {
    title: 'Building AI Research Q&A',
    visual: 'conversation',
    palette: 'emerald'
  },
  'llms-systematic-review-pipeline': {
    title: 'LLM Review Pipeline',
    visual: 'pipeline',
    palette: 'violet'
  },
  'llm-structured-extraction-systematic-reviews': {
    title: 'Structured Data Extraction',
    visual: 'grid',
    palette: 'blue'
  },
  'production-rag-devchat': {
    title: 'Production RAG Chat',
    visual: 'terminal',
    palette: 'slate'
  },
  'automating-evidence-synthesis-newsletter': {
    title: 'Automating Evidence Synthesis',
    visual: 'synthesis',
    palette: 'emerald'
  },
  'conflict-zone-spatial-analysis': {
    title: 'Conflict Zone Analysis',
    visual: 'heatmap',
    palette: 'rose'
  },
  'mapping-research-institutions-fcas': {
    title: 'Mapping Research Institutions',
    visual: 'connections',
    palette: 'blue'
  },
  'temperature-mortality-brazil': {
    title: 'Temperature & Mortality',
    visual: 'timeseries',
    palette: 'amber'
  },
  'maldives-energy-cba': {
    title: 'Energy Cost-Benefit Analysis',
    visual: 'comparison',
    palette: 'cyan'
  },
  'interactive-hypothesis-testing-react': {
    title: 'Interactive Hypothesis Testing',
    visual: 'distribution',
    palette: 'violet'
  },
  'shiny-study-review-system': {
    title: 'Shiny Review System',
    visual: 'dashboard',
    palette: 'emerald'
  },
  'polite-web-scraping-fcdo': {
    title: 'Polite Web Scraping',
    visual: 'crawl',
    palette: 'blue'
  },
  'synthetic-data-pipeline-llms': {
    title: 'Synthetic Data Pipeline',
    visual: 'generate',
    palette: 'violet'
  },
  'small_sample': {
    title: 'Small Sample Methods',
    visual: 'scatter',
    palette: 'rose'
  }
};

// Draw clean geometric visuals
function drawVisual(ctx, visual, cx, cy, size, palette) {
  const colors = palettes[palette];
  const s = size;
  
  // Add subtle gradient background shape
  const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, s * 0.8);
  grd.addColorStop(0, colors.secondary + '30');
  grd.addColorStop(1, colors.secondary + '05');
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(cx, cy, s * 0.7, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.strokeStyle = colors.primary;
  ctx.fillStyle = colors.primary;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch(visual) {
    case 'filter':
      // Funnel with data points flowing through
      ctx.beginPath();
      ctx.moveTo(cx - s*0.4, cy - s*0.35);
      ctx.lineTo(cx + s*0.4, cy - s*0.35);
      ctx.lineTo(cx + s*0.08, cy + s*0.15);
      ctx.lineTo(cx + s*0.08, cy + s*0.4);
      ctx.lineTo(cx - s*0.08, cy + s*0.4);
      ctx.lineTo(cx - s*0.08, cy + s*0.15);
      ctx.closePath();
      ctx.stroke();
      // Input dots
      [[-.25, -.5], [0, -.55], [.25, -.5], [-.1, -.45], [.15, -.48]].forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.arc(cx + dx*s, cy + dy*s, 6, 0, Math.PI * 2);
        ctx.fill();
      });
      // Output dots (fewer, filtered)
      ctx.fillStyle = colors.secondary;
      [[0, .5], [0, .58]].forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.arc(cx + dx*s, cy + dy*s, 5, 0, Math.PI * 2);
        ctx.fill();
      });
      break;

    case 'balance':
      // Scales representing ethics/balance
      ctx.beginPath();
      ctx.moveTo(cx, cy - s*0.4);
      ctx.lineTo(cx, cy + s*0.35);
      ctx.stroke();
      // Beam
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - s*0.4, cy - s*0.2);
      ctx.lineTo(cx + s*0.4, cy - s*0.15);
      ctx.stroke();
      // Pans
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx - s*0.35, cy + s*0.1, s*0.12, 0, Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + s*0.35, cy + s*0.15, s*0.12, 0, Math.PI);
      ctx.stroke();
      // Strings
      ctx.beginPath();
      ctx.moveTo(cx - s*0.4, cy - s*0.2);
      ctx.lineTo(cx - s*0.35, cy + s*0.1);
      ctx.moveTo(cx + s*0.4, cy - s*0.15);
      ctx.lineTo(cx + s*0.35, cy + s*0.15);
      ctx.stroke();
      break;

    case 'network':
      // Network/node graph
      const nodes = [
        [0, 0], [-.3, -.25], [.3, -.2], [-.25, .25], [.28, .28], [0, -.4], [-.4, 0], [.4, .05]
      ];
      const edges = [[0,1], [0,2], [0,3], [0,4], [1,5], [1,6], [2,5], [2,7], [3,6], [4,7]];
      // Draw edges
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 2;
      edges.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(cx + nodes[a][0]*s, cy + nodes[a][1]*s);
        ctx.lineTo(cx + nodes[b][0]*s, cy + nodes[b][1]*s);
        ctx.stroke();
      });
      // Draw nodes
      nodes.forEach(([x, y], i) => {
        ctx.fillStyle = i === 0 ? colors.primary : colors.secondary;
        ctx.beginPath();
        ctx.arc(cx + x*s, cy + y*s, i === 0 ? 12 : 8, 0, Math.PI * 2);
        ctx.fill();
      });
      break;

    case 'compass':
      // Compass for navigation/steering
      ctx.beginPath();
      ctx.arc(cx, cy, s*0.4, 0, Math.PI * 2);
      ctx.stroke();
      // Cardinal points
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI / 2) - Math.PI/2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * s*0.35, cy + Math.sin(angle) * s*0.35);
        ctx.lineTo(cx + Math.cos(angle) * s*0.45, cy + Math.sin(angle) * s*0.45);
        ctx.stroke();
      }
      // Arrow pointing north
      ctx.fillStyle = colors.primary;
      ctx.beginPath();
      ctx.moveTo(cx, cy - s*0.3);
      ctx.lineTo(cx - s*0.08, cy + s*0.1);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + s*0.08, cy + s*0.1);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = colors.secondary;
      ctx.beginPath();
      ctx.moveTo(cx, cy + s*0.3);
      ctx.lineTo(cx - s*0.08, cy - s*0.1);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx + s*0.08, cy - s*0.1);
      ctx.closePath();
      ctx.fill();
      break;

    case 'layers':
      // Stacked layers for RAG
      for (let i = 0; i < 4; i++) {
        const yOffset = i * s*0.12 - s*0.18;
        const alpha = 1 - i * 0.2;
        ctx.fillStyle = colors.primary + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.ellipse(cx, cy + yOffset, s*0.35 - i*0.02, s*0.1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = colors.dark;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      // Search icon on top
      ctx.strokeStyle = colors.dark;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx + s*0.05, cy - s*0.3, s*0.1, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + s*0.12, cy - s*0.23);
      ctx.lineTo(cx + s*0.2, cy - s*0.15);
      ctx.stroke();
      break;

    case 'conversation':
      // Chat bubbles
      // Left bubble
      ctx.fillStyle = colors.primary;
      roundRect(ctx, cx - s*0.4, cy - s*0.25, s*0.5, s*0.22, 8);
      ctx.fill();
      // Right bubble
      ctx.fillStyle = colors.secondary;
      roundRect(ctx, cx - s*0.1, cy + s*0.02, s*0.5, s*0.22, 8);
      ctx.fill();
      // Lines in bubbles
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - s*0.32, cy - s*0.17);
      ctx.lineTo(cx - s*0.05, cy - s*0.17);
      ctx.moveTo(cx - s*0.32, cy - s*0.1);
      ctx.lineTo(cx - s*0.12, cy - s*0.1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - s*0.02, cy + s*0.1);
      ctx.lineTo(cx + s*0.32, cy + s*0.1);
      ctx.moveTo(cx - s*0.02, cy + s*0.17);
      ctx.lineTo(cx + s*0.22, cy + s*0.17);
      ctx.stroke();
      break;

    case 'pipeline':
      // Data flowing through stages
      ctx.lineWidth = 3;
      const stages = [-0.35, -0.12, 0.12, 0.35];
      stages.forEach((x, i) => {
        ctx.fillStyle = i === stages.length - 1 ? colors.secondary : colors.primary;
        ctx.beginPath();
        ctx.arc(cx + x*s, cy, s*0.1, 0, Math.PI * 2);
        ctx.fill();
        if (i < stages.length - 1) {
          ctx.strokeStyle = colors.secondary;
          ctx.beginPath();
          ctx.moveTo(cx + x*s + s*0.12, cy);
          ctx.lineTo(cx + stages[i+1]*s - s*0.12, cy);
          ctx.stroke();
          // Arrow
          ctx.beginPath();
          ctx.moveTo(cx + stages[i+1]*s - s*0.15, cy - s*0.04);
          ctx.lineTo(cx + stages[i+1]*s - s*0.1, cy);
          ctx.lineTo(cx + stages[i+1]*s - s*0.15, cy + s*0.04);
          ctx.stroke();
        }
      });
      // Labels
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ['1', '2', '3', '4'].forEach((n, i) => {
        ctx.fillText(n, cx + stages[i]*s, cy + 5);
      });
      break;

    case 'grid':
      // Data grid/table
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2;
      const gridSize = s * 0.6;
      const cellSize = gridSize / 4;
      // Outer rectangle
      ctx.strokeRect(cx - gridSize/2, cy - gridSize/2, gridSize, gridSize);
      // Grid lines
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(cx - gridSize/2 + i*cellSize, cy - gridSize/2);
        ctx.lineTo(cx - gridSize/2 + i*cellSize, cy + gridSize/2);
        ctx.moveTo(cx - gridSize/2, cy - gridSize/2 + i*cellSize);
        ctx.lineTo(cx + gridSize/2, cy - gridSize/2 + i*cellSize);
        ctx.stroke();
      }
      // Header row
      ctx.fillStyle = colors.primary + '40';
      ctx.fillRect(cx - gridSize/2, cy - gridSize/2, gridSize, cellSize);
      // Some filled cells
      ctx.fillStyle = colors.secondary + '60';
      [[1, 1], [2, 2], [0, 3], [3, 1]].forEach(([col, row]) => {
        ctx.fillRect(cx - gridSize/2 + col*cellSize + 2, cy - gridSize/2 + row*cellSize + 2, cellSize - 4, cellSize - 4);
      });
      break;

    case 'terminal':
      // Terminal/code window
      ctx.fillStyle = colors.dark;
      roundRect(ctx, cx - s*0.4, cy - s*0.3, s*0.8, s*0.6, 8);
      ctx.fill();
      // Title bar
      ctx.fillStyle = colors.primary;
      ctx.fillRect(cx - s*0.4, cy - s*0.3, s*0.8, s*0.08);
      // Dots
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(cx - s*0.32, cy - s*0.26, 5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(cx - s*0.24, cy - s*0.26, 5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#22c55e';
      ctx.beginPath(); ctx.arc(cx - s*0.16, cy - s*0.26, 5, 0, Math.PI*2); ctx.fill();
      // Code lines
      ctx.fillStyle = colors.secondary;
      ctx.fillRect(cx - s*0.35, cy - s*0.15, s*0.45, s*0.04);
      ctx.fillRect(cx - s*0.35, cy - s*0.05, s*0.3, s*0.04);
      ctx.fillStyle = colors.primary;
      ctx.fillRect(cx - s*0.35, cy + s*0.05, s*0.55, s*0.04);
      ctx.fillStyle = colors.secondary;
      ctx.fillRect(cx - s*0.35, cy + s*0.15, s*0.25, s*0.04);
      break;

    case 'synthesis':
      // Converging arrows to single point
      const sources = [[-0.35, -0.3], [0, -0.4], [0.35, -0.3], [-0.4, 0], [0.4, 0]];
      sources.forEach(([x, y]) => {
        ctx.strokeStyle = colors.secondary;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx + x*s, cy + y*s);
        ctx.lineTo(cx, cy + s*0.1);
        ctx.stroke();
        // Source dot
        ctx.fillStyle = colors.secondary;
        ctx.beginPath();
        ctx.arc(cx + x*s, cy + y*s, 6, 0, Math.PI * 2);
        ctx.fill();
      });
      // Center node
      ctx.fillStyle = colors.primary;
      ctx.beginPath();
      ctx.arc(cx, cy + s*0.1, 15, 0, Math.PI * 2);
      ctx.fill();
      // Output arrow
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy + s*0.2);
      ctx.lineTo(cx, cy + s*0.4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - s*0.05, cy + s*0.35);
      ctx.lineTo(cx, cy + s*0.42);
      ctx.lineTo(cx + s*0.05, cy + s*0.35);
      ctx.stroke();
      break;

    case 'heatmap':
      // Grid with varying intensities
      const heatColors = ['#fef3c7', '#fcd34d', '#f59e0b', '#dc2626', '#991b1b'];
      const heatData = [
        [0, 1, 2, 1, 0],
        [1, 2, 3, 2, 1],
        [2, 3, 4, 3, 2],
        [1, 3, 4, 4, 2],
        [0, 2, 3, 3, 1]
      ];
      const heatCell = s * 0.12;
      heatData.forEach((row, i) => {
        row.forEach((val, j) => {
          ctx.fillStyle = heatColors[val];
          ctx.fillRect(
            cx - heatCell*2.5 + j*heatCell,
            cy - heatCell*2.5 + i*heatCell,
            heatCell - 1, heatCell - 1
          );
        });
      });
      break;

    case 'connections':
      // World map style dots with connections
      const points = [
        [-0.3, -0.2], [0.2, -0.25], [0.35, 0.1], [-0.25, 0.2], [0, 0.3], [-0.4, 0], [0.1, -0.05]
      ];
      const conns = [[0, 1], [1, 2], [0, 3], [3, 4], [2, 4], [5, 0], [6, 1], [6, 2], [6, 3]];
      ctx.strokeStyle = colors.secondary + '80';
      ctx.lineWidth = 1.5;
      conns.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(cx + points[a][0]*s, cy + points[a][1]*s);
        ctx.lineTo(cx + points[b][0]*s, cy + points[b][1]*s);
        ctx.stroke();
      });
      points.forEach(([x, y], i) => {
        ctx.fillStyle = i === 6 ? colors.primary : colors.secondary;
        ctx.beginPath();
        ctx.arc(cx + x*s, cy + y*s, i === 6 ? 10 : 7, 0, Math.PI * 2);
        ctx.fill();
      });
      break;

    case 'timeseries':
      // Line chart
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 2;
      // Axes
      ctx.beginPath();
      ctx.moveTo(cx - s*0.4, cy - s*0.35);
      ctx.lineTo(cx - s*0.4, cy + s*0.35);
      ctx.lineTo(cx + s*0.4, cy + s*0.35);
      ctx.stroke();
      // Line data
      const lineData = [0.2, 0.1, 0.25, 0.15, 0.3, 0.28, 0.35, 0.2, 0.4];
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 3;
      ctx.beginPath();
      lineData.forEach((v, i) => {
        const x = cx - s*0.35 + i * s*0.09;
        const y = cy + s*0.3 - v*s;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      // Data points
      ctx.fillStyle = colors.primary;
      lineData.forEach((v, i) => {
        const x = cx - s*0.35 + i * s*0.09;
        const y = cy + s*0.3 - v*s;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
      break;

    case 'comparison':
      // Two bars side by side
      ctx.fillStyle = colors.primary;
      ctx.fillRect(cx - s*0.25, cy + s*0.3, s*0.18, -s*0.5);
      ctx.fillStyle = colors.secondary;
      ctx.fillRect(cx + s*0.07, cy + s*0.3, s*0.18, -s*0.35);
      // Labels
      ctx.fillStyle = colors.dark;
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('A', cx - s*0.16, cy + s*0.42);
      ctx.fillText('B', cx + s*0.16, cy + s*0.42);
      // Axis
      ctx.strokeStyle = colors.dark;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - s*0.35, cy + s*0.3);
      ctx.lineTo(cx + s*0.35, cy + s*0.3);
      ctx.stroke();
      break;

    case 'distribution':
      // Bell curve / histogram
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 2;
      // Axis
      ctx.beginPath();
      ctx.moveTo(cx - s*0.4, cy + s*0.3);
      ctx.lineTo(cx + s*0.4, cy + s*0.3);
      ctx.stroke();
      // Curve
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = -40; i <= 40; i++) {
        const x = i / 40;
        const y = Math.exp(-x*x*3) * 0.5;
        const px = cx + x * s * 0.4;
        const py = cy + s*0.28 - y * s;
        if (i === -40) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      // Fill under curve
      ctx.fillStyle = colors.primary + '30';
      ctx.beginPath();
      ctx.moveTo(cx - s*0.4, cy + s*0.28);
      for (let i = -40; i <= 40; i++) {
        const x = i / 40;
        const y = Math.exp(-x*x*3) * 0.5;
        ctx.lineTo(cx + x * s * 0.4, cy + s*0.28 - y * s);
      }
      ctx.lineTo(cx + s*0.4, cy + s*0.28);
      ctx.closePath();
      ctx.fill();
      // Critical region
      ctx.fillStyle = colors.secondary + '60';
      ctx.beginPath();
      ctx.moveTo(cx + s*0.2, cy + s*0.28);
      for (let i = 20; i <= 40; i++) {
        const x = i / 40;
        const y = Math.exp(-x*x*3) * 0.5;
        ctx.lineTo(cx + x * s * 0.4, cy + s*0.28 - y * s);
      }
      ctx.lineTo(cx + s*0.4, cy + s*0.28);
      ctx.closePath();
      ctx.fill();
      break;

    case 'dashboard':
      // Mini dashboard layout
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2;
      // Main frame
      roundRect(ctx, cx - s*0.4, cy - s*0.35, s*0.8, s*0.7, 6);
      ctx.stroke();
      // Panels
      ctx.fillStyle = colors.secondary + '40';
      ctx.fillRect(cx - s*0.35, cy - s*0.28, s*0.35, s*0.25);
      ctx.fillRect(cx + s*0.02, cy - s*0.28, s*0.33, s*0.25);
      ctx.fillRect(cx - s*0.35, cy + s*0.02, s*0.7, s*0.25);
      // Mini chart in bottom panel
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - s*0.3, cy + s*0.2);
      ctx.lineTo(cx - s*0.15, cy + s*0.1);
      ctx.lineTo(cx, cy + s*0.18);
      ctx.lineTo(cx + s*0.15, cy + s*0.08);
      ctx.lineTo(cx + s*0.3, cy + s*0.12);
      ctx.stroke();
      break;

    case 'crawl':
      // Spider web pattern for scraping
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 1.5;
      // Radial lines
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * s*0.4, cy + Math.sin(angle) * s*0.4);
        ctx.stroke();
      }
      // Concentric rings
      [0.15, 0.25, 0.35].forEach(r => {
        ctx.beginPath();
        ctx.arc(cx, cy, s*r, 0, Math.PI * 2);
        ctx.stroke();
      });
      // Center node
      ctx.fillStyle = colors.primary;
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.fill();
      // Some nodes on web
      ctx.fillStyle = colors.secondary;
      [[0.25, 0], [0.18, 0.18], [-0.2, 0.12], [0.3, -0.2]].forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(cx + x*s, cy + y*s, 6, 0, Math.PI * 2);
        ctx.fill();
      });
      break;

    case 'generate':
      // Data generation / synthesis
      // Input
      ctx.fillStyle = colors.secondary;
      ctx.beginPath();
      ctx.arc(cx - s*0.3, cy, s*0.08, 0, Math.PI * 2);
      ctx.fill();
      // Arrow
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - s*0.2, cy);
      ctx.lineTo(cx - s*0.05, cy);
      ctx.stroke();
      // Central processor
      ctx.fillStyle = colors.primary;
      roundRect(ctx, cx - s*0.12, cy - s*0.12, s*0.24, s*0.24, 4);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('×', cx, cy + 7);
      // Output arrows and nodes
      ctx.strokeStyle = colors.secondary;
      const outputs = [[0.3, -0.2], [0.35, 0], [0.3, 0.2]];
      outputs.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.moveTo(cx + s*0.12, cy);
        ctx.lineTo(cx + x*s - s*0.08, cy + y*s);
        ctx.stroke();
        ctx.fillStyle = colors.secondary;
        ctx.beginPath();
        ctx.arc(cx + x*s, cy + y*s, 6, 0, Math.PI * 2);
        ctx.fill();
      });
      break;

    case 'scatter':
      // Scatter plot with regression
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 2;
      // Axes
      ctx.beginPath();
      ctx.moveTo(cx - s*0.4, cy - s*0.35);
      ctx.lineTo(cx - s*0.4, cy + s*0.35);
      ctx.lineTo(cx + s*0.4, cy + s*0.35);
      ctx.stroke();
      // Points
      const scatterPts = [
        [-0.3, 0.2], [-0.2, 0.1], [-0.15, 0.15], [-0.05, 0], [0, -0.05],
        [0.1, -0.1], [0.15, -0.05], [0.2, -0.15], [0.3, -0.2], [0.25, -0.1]
      ];
      ctx.fillStyle = colors.primary;
      scatterPts.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(cx + x*s, cy + y*s, 6, 0, Math.PI * 2);
        ctx.fill();
      });
      // Trend line
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(cx - s*0.35, cy + s*0.2);
      ctx.lineTo(cx + s*0.35, cy - s*0.25);
      ctx.stroke();
      ctx.setLineDash([]);
      break;

    default:
      // Default geometric pattern
      ctx.fillStyle = colors.primary;
      ctx.beginPath();
      ctx.arc(cx, cy, s*0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, s*0.35, 0, Math.PI * 2);
      ctx.stroke();
  }
}

// Helper for rounded rectangles
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function generateBlogImage(slug, theme, outputDir) {
  const width = 1200;
  const height = 630;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const colors = palettes[theme.palette];
  
  // Clean background with subtle gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, colors.bg);
  bgGrad.addColorStop(1, '#fff');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);
  
  // Subtle grid pattern
  ctx.strokeStyle = colors.secondary + '15';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  
  // Accent bar at top
  ctx.fillStyle = colors.primary;
  ctx.fillRect(0, 0, width, 4);
  
  // Draw the visual
  drawVisual(ctx, theme.visual, width / 2, height / 2 - 50, 280, theme.palette);
  
  // Title
  ctx.font = 'bold 38px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = colors.dark;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(theme.title, width / 2, height - 75);
  
  // Subtle author line
  ctx.font = '18px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = colors.secondary;
  ctx.fillText('Lucas Sempé', width / 2, height - 40);
  
  // Save
  const buffer = canvas.toBuffer('image/png');
  const outputPath = path.join(outputDir, `${slug}.png`);
  fs.writeFileSync(outputPath, buffer);
  console.log(`✓ ${slug}.png`);
}

// Main
const outputDir = path.join(__dirname, '..', 'public', 'images', 'blog');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('🎨 Generating professional blog images...\n');

for (const [slug, theme] of Object.entries(blogThemes)) {
  try {
    generateBlogImage(slug, theme, outputDir);
  } catch (err) {
    console.error(`✗ ${slug}: ${err.message}`);
  }
}

console.log('\n✅ Done!');
