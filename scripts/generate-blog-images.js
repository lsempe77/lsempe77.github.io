/**
 * Generate hand-drawn style header images for blog posts
 * Uses pure Canvas with sketchy line algorithms
 * 
 * Run: node scripts/generate-blog-images.js
 */

import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Blog post themes
const blogThemes = {
  'ai-screening-validation': {
    title: 'AI Screening & Validation',
    shape: 'magnifier',
    color: '#059669',
    bgColor: '#ecfdf5'
  },
  'ai-ethics-impact-evaluation': {
    title: 'AI Ethics in Evaluation',
    shape: 'scale',
    color: '#7c3aed',
    bgColor: '#f5f3ff'
  },
  'ai-governance-capacity': {
    title: 'AI Governance Capacity',
    shape: 'building',
    color: '#2563eb',
    bgColor: '#eff6ff'
  },
  'ai-persona-steering': {
    title: 'AI Persona Steering',
    shape: 'robot',
    color: '#dc2626',
    bgColor: '#fef2f2'
  },
  'rag-system-research-documents': {
    title: 'RAG Systems for Research',
    shape: 'database',
    color: '#0891b2',
    bgColor: '#ecfeff'
  },
  'building-ai-research-qa-system': {
    title: 'Building AI Research Q&A',
    shape: 'question',
    color: '#059669',
    bgColor: '#ecfdf5'
  },
  'llms-systematic-review-pipeline': {
    title: 'LLM Review Pipeline',
    shape: 'funnel',
    color: '#7c3aed',
    bgColor: '#f5f3ff'
  },
  'llm-structured-extraction-systematic-reviews': {
    title: 'Structured Data Extraction',
    shape: 'table',
    color: '#2563eb',
    bgColor: '#eff6ff'
  },
  'production-rag-devchat': {
    title: 'Production RAG Chat',
    shape: 'chat',
    color: '#ea580c',
    bgColor: '#fff7ed'
  },
  'automating-evidence-synthesis-newsletter': {
    title: 'Automating Evidence Synthesis',
    shape: 'papers',
    color: '#059669',
    bgColor: '#ecfdf5'
  },
  'conflict-zone-spatial-analysis': {
    title: 'Conflict Zone Analysis',
    shape: 'map',
    color: '#dc2626',
    bgColor: '#fef2f2'
  },
  'mapping-research-institutions-fcas': {
    title: 'Mapping Research Institutions',
    shape: 'globe',
    color: '#2563eb',
    bgColor: '#eff6ff'
  },
  'temperature-mortality-brazil': {
    title: 'Temperature & Mortality',
    shape: 'thermometer',
    color: '#ea580c',
    bgColor: '#fff7ed'
  },
  'maldives-energy-cba': {
    title: 'Energy Cost-Benefit Analysis',
    shape: 'solar',
    color: '#0891b2',
    bgColor: '#ecfeff'
  },
  'interactive-hypothesis-testing-react': {
    title: 'Interactive Hypothesis Testing',
    shape: 'chart',
    color: '#7c3aed',
    bgColor: '#f5f3ff'
  },
  'shiny-study-review-system': {
    title: 'Shiny Review System',
    shape: 'app',
    color: '#059669',
    bgColor: '#ecfdf5'
  },
  'polite-web-scraping-fcdo': {
    title: 'Polite Web Scraping',
    shape: 'spider',
    color: '#2563eb',
    bgColor: '#eff6ff'
  },
  'synthetic-data-pipeline-llms': {
    title: 'Synthetic Data Pipeline',
    shape: 'factory',
    color: '#7c3aed',
    bgColor: '#f5f3ff'
  },
  'small_sample': {
    title: 'Small Sample Methods',
    shape: 'dots',
    color: '#dc2626',
    bgColor: '#fef2f2'
  }
};

// Sketchy line drawing - adds wobble to lines
function sketchyLine(ctx, x1, y1, x2, y2, color, width = 2) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  
  // Draw multiple offset lines for sketchy effect
  for (let i = 0; i < 2; i++) {
    ctx.beginPath();
    const wobble = 2;
    const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * wobble * 2;
    const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * wobble * 2;
    
    ctx.moveTo(x1 + (Math.random() - 0.5) * wobble, y1 + (Math.random() - 0.5) * wobble);
    ctx.quadraticCurveTo(midX, midY, x2 + (Math.random() - 0.5) * wobble, y2 + (Math.random() - 0.5) * wobble);
    ctx.stroke();
  }
}

// Sketchy circle
function sketchyCircle(ctx, x, y, radius, color, fill = false) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  
  if (fill) {
    ctx.fillStyle = color + '33'; // 20% opacity
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Draw wobbly circle with multiple passes
  for (let pass = 0; pass < 2; pass++) {
    ctx.beginPath();
    const segments = 40;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const wobble = (Math.random() - 0.5) * 4;
      const px = x + (radius + wobble) * Math.cos(angle);
      const py = y + (radius + wobble) * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
}

// Sketchy rectangle
function sketchyRect(ctx, x, y, w, h, color, fill = false) {
  if (fill) {
    ctx.fillStyle = color + '33';
    ctx.fillRect(x, y, w, h);
  }
  sketchyLine(ctx, x, y, x + w, y, color);
  sketchyLine(ctx, x + w, y, x + w, y + h, color);
  sketchyLine(ctx, x + w, y + h, x, y + h, color);
  sketchyLine(ctx, x, y + h, x, y, color);
}

// Draw different shapes based on theme
function drawShape(ctx, shape, cx, cy, size, color) {
  const s = size;
  
  switch(shape) {
    case 'magnifier':
      sketchyCircle(ctx, cx - s*0.1, cy - s*0.1, s*0.35, color, true);
      sketchyLine(ctx, cx + s*0.15, cy + s*0.15, cx + s*0.45, cy + s*0.45, color, 4);
      break;
      
    case 'scale':
      // Balance scale
      sketchyLine(ctx, cx, cy - s*0.4, cx, cy + s*0.4, color, 3);
      sketchyLine(ctx, cx - s*0.5, cy - s*0.3, cx + s*0.5, cy - s*0.3, color, 3);
      sketchyCircle(ctx, cx - s*0.4, cy, s*0.15, color, true);
      sketchyCircle(ctx, cx + s*0.4, cy, s*0.15, color, true);
      sketchyLine(ctx, cx - s*0.4, cy - s*0.3, cx - s*0.4, cy - s*0.15, color, 2);
      sketchyLine(ctx, cx + s*0.4, cy - s*0.3, cx + s*0.4, cy - s*0.15, color, 2);
      break;
      
    case 'building':
      sketchyRect(ctx, cx - s*0.3, cy - s*0.4, s*0.6, s*0.8, color, true);
      // Windows
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 2; col++) {
          sketchyRect(ctx, cx - s*0.2 + col*s*0.25, cy - s*0.3 + row*s*0.22, s*0.12, s*0.15, color);
        }
      }
      break;
      
    case 'robot':
      // Head
      sketchyRect(ctx, cx - s*0.25, cy - s*0.45, s*0.5, s*0.4, color, true);
      // Eyes
      sketchyCircle(ctx, cx - s*0.1, cy - s*0.3, s*0.06, color);
      sketchyCircle(ctx, cx + s*0.1, cy - s*0.3, s*0.06, color);
      // Antenna
      sketchyLine(ctx, cx, cy - s*0.45, cx, cy - s*0.55, color, 2);
      sketchyCircle(ctx, cx, cy - s*0.58, s*0.04, color, true);
      // Body
      sketchyRect(ctx, cx - s*0.3, cy, s*0.6, s*0.45, color, true);
      break;
      
    case 'database':
      // Cylinder shape
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.fillStyle = color + '33';
      
      // Top ellipse
      ctx.beginPath();
      ctx.ellipse(cx, cy - s*0.3, s*0.35, s*0.12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Body
      sketchyLine(ctx, cx - s*0.35, cy - s*0.3, cx - s*0.35, cy + s*0.3, color, 2.5);
      sketchyLine(ctx, cx + s*0.35, cy - s*0.3, cx + s*0.35, cy + s*0.3, color, 2.5);
      
      // Bottom ellipse
      ctx.beginPath();
      ctx.ellipse(cx, cy + s*0.3, s*0.35, s*0.12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Middle line
      ctx.beginPath();
      ctx.ellipse(cx, cy, s*0.35, s*0.12, 0, 0, Math.PI);
      ctx.stroke();
      break;
      
    case 'question':
      ctx.font = `bold ${s}px Georgia`;
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', cx, cy);
      break;
      
    case 'funnel':
      sketchyLine(ctx, cx - s*0.4, cy - s*0.4, cx + s*0.4, cy - s*0.4, color, 3);
      sketchyLine(ctx, cx - s*0.4, cy - s*0.4, cx - s*0.1, cy + s*0.2, color, 3);
      sketchyLine(ctx, cx + s*0.4, cy - s*0.4, cx + s*0.1, cy + s*0.2, color, 3);
      sketchyLine(ctx, cx - s*0.1, cy + s*0.2, cx - s*0.1, cy + s*0.4, color, 3);
      sketchyLine(ctx, cx + s*0.1, cy + s*0.2, cx + s*0.1, cy + s*0.4, color, 3);
      // Dots falling in
      sketchyCircle(ctx, cx - s*0.2, cy - s*0.25, s*0.04, color, true);
      sketchyCircle(ctx, cx + s*0.15, cy - s*0.2, s*0.04, color, true);
      sketchyCircle(ctx, cx, cy - s*0.15, s*0.04, color, true);
      break;
      
    case 'table':
      sketchyRect(ctx, cx - s*0.4, cy - s*0.3, s*0.8, s*0.6, color);
      // Rows
      sketchyLine(ctx, cx - s*0.4, cy - s*0.1, cx + s*0.4, cy - s*0.1, color);
      sketchyLine(ctx, cx - s*0.4, cy + s*0.1, cx + s*0.4, cy + s*0.1, color);
      // Columns
      sketchyLine(ctx, cx - s*0.1, cy - s*0.3, cx - s*0.1, cy + s*0.3, color);
      sketchyLine(ctx, cx + s*0.2, cy - s*0.3, cx + s*0.2, cy + s*0.3, color);
      break;
      
    case 'chat':
      sketchyRect(ctx, cx - s*0.35, cy - s*0.25, s*0.7, s*0.45, color, true);
      // Chat tail
      sketchyLine(ctx, cx - s*0.2, cy + s*0.2, cx - s*0.35, cy + s*0.4, color, 2);
      sketchyLine(ctx, cx - s*0.35, cy + s*0.4, cx - s*0.05, cy + s*0.2, color, 2);
      // Dots
      sketchyCircle(ctx, cx - s*0.15, cy, s*0.04, color, true);
      sketchyCircle(ctx, cx, cy, s*0.04, color, true);
      sketchyCircle(ctx, cx + s*0.15, cy, s*0.04, color, true);
      break;
      
    case 'papers':
      // Stack of papers
      sketchyRect(ctx, cx - s*0.25 + s*0.1, cy - s*0.35 - s*0.05, s*0.5, s*0.65, color);
      sketchyRect(ctx, cx - s*0.25 + s*0.05, cy - s*0.35 - s*0.025, s*0.5, s*0.65, color);
      sketchyRect(ctx, cx - s*0.25, cy - s*0.35, s*0.5, s*0.65, color, true);
      // Lines on top paper
      sketchyLine(ctx, cx - s*0.15, cy - s*0.15, cx + s*0.15, cy - s*0.15, color);
      sketchyLine(ctx, cx - s*0.15, cy, cx + s*0.15, cy, color);
      sketchyLine(ctx, cx - s*0.15, cy + s*0.15, cx + s*0.1, cy + s*0.15, color);
      break;
      
    case 'map':
      sketchyRect(ctx, cx - s*0.4, cy - s*0.3, s*0.8, s*0.6, color, true);
      // Map markers
      sketchyCircle(ctx, cx - s*0.15, cy - s*0.1, s*0.06, '#dc2626', true);
      sketchyCircle(ctx, cx + s*0.2, cy + s*0.05, s*0.06, '#dc2626', true);
      sketchyCircle(ctx, cx, cy + s*0.15, s*0.06, '#dc2626', true);
      // Connecting lines
      sketchyLine(ctx, cx - s*0.15, cy - s*0.1, cx + s*0.2, cy + s*0.05, '#94a3b8', 1);
      sketchyLine(ctx, cx + s*0.2, cy + s*0.05, cx, cy + s*0.15, '#94a3b8', 1);
      break;
      
    case 'globe':
      sketchyCircle(ctx, cx, cy, s*0.4, color, true);
      // Latitude lines
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy - s*0.15, s*0.38, s*0.1, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, cy + s*0.15, s*0.35, s*0.1, 0, 0, Math.PI * 2);
      ctx.stroke();
      // Longitude
      sketchyLine(ctx, cx, cy - s*0.4, cx, cy + s*0.4, color, 1.5);
      break;
      
    case 'thermometer':
      // Bulb
      sketchyCircle(ctx, cx, cy + s*0.25, s*0.15, color, true);
      // Tube
      sketchyRect(ctx, cx - s*0.08, cy - s*0.45, s*0.16, s*0.6, color);
      // Mercury level
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(cx - s*0.05, cy - s*0.2, s*0.1, s*0.5);
      // Tick marks
      for (let i = 0; i < 4; i++) {
        sketchyLine(ctx, cx + s*0.08, cy - s*0.35 + i*s*0.12, cx + s*0.15, cy - s*0.35 + i*s*0.12, color, 1);
      }
      break;
      
    case 'solar':
      // Sun
      sketchyCircle(ctx, cx, cy - s*0.1, s*0.2, '#f59e0b', true);
      // Rays
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const x1 = cx + Math.cos(angle) * s*0.25;
        const y1 = cy - s*0.1 + Math.sin(angle) * s*0.25;
        const x2 = cx + Math.cos(angle) * s*0.35;
        const y2 = cy - s*0.1 + Math.sin(angle) * s*0.35;
        sketchyLine(ctx, x1, y1, x2, y2, '#f59e0b', 2);
      }
      // Panel
      sketchyRect(ctx, cx - s*0.35, cy + s*0.15, s*0.7, s*0.25, color, true);
      sketchyLine(ctx, cx - s*0.1, cy + s*0.15, cx - s*0.1, cy + s*0.4, color);
      sketchyLine(ctx, cx + s*0.15, cy + s*0.15, cx + s*0.15, cy + s*0.4, color);
      break;
      
    case 'chart':
      // Axes
      sketchyLine(ctx, cx - s*0.35, cy - s*0.35, cx - s*0.35, cy + s*0.35, color, 2);
      sketchyLine(ctx, cx - s*0.35, cy + s*0.35, cx + s*0.4, cy + s*0.35, color, 2);
      // Bars
      const barW = s*0.12;
      const heights = [0.5, 0.3, 0.7, 0.45, 0.6];
      heights.forEach((h, i) => {
        const bx = cx - s*0.25 + i * s*0.15;
        const by = cy + s*0.35 - h*s*0.6;
        sketchyRect(ctx, bx, by, barW, h*s*0.6, color, true);
      });
      break;
      
    case 'app':
      // Phone/tablet frame
      sketchyRect(ctx, cx - s*0.25, cy - s*0.4, s*0.5, s*0.8, color, true);
      // Screen
      sketchyRect(ctx, cx - s*0.2, cy - s*0.3, s*0.4, s*0.55, '#fff');
      // App grid
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 2; c++) {
          sketchyRect(ctx, cx - s*0.15 + c*s*0.17, cy - s*0.22 + r*s*0.2, s*0.12, s*0.12, color);
        }
      }
      // Home button
      sketchyCircle(ctx, cx, cy + s*0.32, s*0.04, color);
      break;
      
    case 'spider':
      // Body
      sketchyCircle(ctx, cx, cy, s*0.15, color, true);
      sketchyCircle(ctx, cx, cy - s*0.2, s*0.1, color, true);
      // Legs
      const legAngles = [-0.7, -0.4, 0.4, 0.7];
      legAngles.forEach(a => {
        sketchyLine(ctx, cx, cy, cx + Math.cos(a + Math.PI/2) * s*0.4, cy + Math.sin(a + Math.PI/2) * s*0.3, color, 2);
        sketchyLine(ctx, cx, cy, cx + Math.cos(-a + Math.PI/2) * s*0.4, cy + Math.sin(-a + Math.PI/2) * s*0.3, color, 2);
      });
      // Eyes
      sketchyCircle(ctx, cx - s*0.04, cy - s*0.22, s*0.025, '#fff', true);
      sketchyCircle(ctx, cx + s*0.04, cy - s*0.22, s*0.025, '#fff', true);
      break;
      
    case 'factory':
      // Building
      sketchyRect(ctx, cx - s*0.35, cy - s*0.1, s*0.5, s*0.5, color, true);
      // Chimney
      sketchyRect(ctx, cx - s*0.25, cy - s*0.35, s*0.12, s*0.25, color, true);
      sketchyRect(ctx, cx, cy - s*0.3, s*0.12, s*0.2, color, true);
      // Smoke puffs
      sketchyCircle(ctx, cx - s*0.2, cy - s*0.45, s*0.06, '#9ca3af', true);
      sketchyCircle(ctx, cx - s*0.15, cy - s*0.55, s*0.08, '#9ca3af', true);
      sketchyCircle(ctx, cx + s*0.05, cy - s*0.4, s*0.05, '#9ca3af', true);
      // Conveyor
      sketchyLine(ctx, cx + s*0.15, cy + s*0.4, cx + s*0.45, cy + s*0.4, color, 3);
      // Boxes on conveyor
      sketchyRect(ctx, cx + s*0.25, cy + s*0.25, s*0.1, s*0.15, color, true);
      sketchyRect(ctx, cx + s*0.38, cy + s*0.28, s*0.08, s*0.12, color, true);
      break;
      
    case 'dots':
      // Scatter plot dots
      const positions = [
        [-0.3, -0.2], [-0.15, 0.1], [0, -0.15], [0.1, 0.2], 
        [0.25, -0.05], [-0.2, 0.25], [0.3, 0.15], [-0.05, -0.3],
        [0.2, -0.25], [-0.25, -0.05]
      ];
      positions.forEach(([px, py]) => {
        const dotSize = s * 0.04 + Math.random() * s * 0.03;
        sketchyCircle(ctx, cx + px*s, cy + py*s, dotSize, color, true);
      });
      // Trend line
      sketchyLine(ctx, cx - s*0.35, cy + s*0.2, cx + s*0.35, cy - s*0.15, color, 2);
      break;
      
    default:
      // Default: abstract shapes
      sketchyCircle(ctx, cx, cy, s*0.3, color, true);
      sketchyRect(ctx, cx - s*0.15, cy - s*0.15, s*0.3, s*0.3, color);
  }
}

function generateBlogImage(slug, theme, outputDir) {
  const width = 1200;
  const height = 630;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = theme.bgColor;
  ctx.fillRect(0, 0, width, height);
  
  // Add subtle texture/pattern
  ctx.globalAlpha = 0.03;
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  
  // Draw decorative corner flourishes
  ctx.strokeStyle = theme.color + '40';
  ctx.lineWidth = 1;
  // Top left
  sketchyLine(ctx, 30, 50, 30, 30, theme.color + '60', 1.5);
  sketchyLine(ctx, 30, 30, 80, 30, theme.color + '60', 1.5);
  // Top right
  sketchyLine(ctx, width - 30, 50, width - 30, 30, theme.color + '60', 1.5);
  sketchyLine(ctx, width - 30, 30, width - 80, 30, theme.color + '60', 1.5);
  // Bottom left
  sketchyLine(ctx, 30, height - 50, 30, height - 30, theme.color + '60', 1.5);
  sketchyLine(ctx, 30, height - 30, 80, height - 30, theme.color + '60', 1.5);
  // Bottom right
  sketchyLine(ctx, width - 30, height - 50, width - 30, height - 30, theme.color + '60', 1.5);
  sketchyLine(ctx, width - 30, height - 30, width - 80, height - 30, theme.color + '60', 1.5);
  
  // Draw main shape - large and centered
  drawShape(ctx, theme.shape, width / 2, height / 2 - 40, 250, theme.color);
  
  // Title at bottom
  ctx.font = 'bold 36px Georgia, serif';
  ctx.fillStyle = '#374151';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(theme.title, width / 2, height - 80);
  
  // Author signature
  ctx.font = 'italic 20px Georgia, serif';
  ctx.fillStyle = '#6b7280';
  ctx.fillText('Lucas Sempé', width / 2, height - 45);
  
  // Save PNG
  const buffer = canvas.toBuffer('image/png');
  const outputPath = path.join(outputDir, `${slug}.png`);
  fs.writeFileSync(outputPath, buffer);
  console.log(`✓ Generated: ${slug}.png`);
}

// Main
const outputDir = path.join(__dirname, '..', 'public', 'images', 'blog');

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('🎨 Generating hand-drawn blog images...\n');

for (const [slug, theme] of Object.entries(blogThemes)) {
  try {
    generateBlogImage(slug, theme, outputDir);
  } catch (err) {
    console.error(`✗ Failed: ${slug}`, err.message);
  }
}

console.log('\n✅ Done! Images saved to public/images/blog/');
