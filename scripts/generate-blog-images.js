/**
 * Generate hand-drawn style header images for blog posts
 * Uses Rough.js for sketchy graphics + node-canvas for PNG export
 * 
 * Run: node scripts/generate-blog-images.js
 */

import { createCanvas } from 'canvas';
import rough from 'roughjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Blog post themes with icons/concepts to draw
const blogThemes = {
  'ai-screening-validation': {
    title: 'AI Screening',
    icons: ['magnifier', 'document', 'checkmark'],
    color: '#059669'
  },
  'ai-ethics-impact-evaluation': {
    title: 'AI Ethics',
    icons: ['scale', 'brain', 'heart'],
    color: '#7c3aed'
  },
  'ai-governance-capacity': {
    title: 'AI Governance',
    icons: ['building', 'gear', 'people'],
    color: '#2563eb'
  },
  'ai-persona-steering': {
    title: 'AI Personas',
    icons: ['robot', 'arrows', 'target'],
    color: '#dc2626'
  },
  'rag-system-research-documents': {
    title: 'RAG Systems',
    icons: ['database', 'search', 'lightbulb'],
    color: '#0891b2'
  },
  'building-ai-research-qa-system': {
    title: 'Research Q&A',
    icons: ['question', 'books', 'answer'],
    color: '#059669'
  },
  'llms-systematic-review-pipeline': {
    title: 'LLM Pipeline',
    icons: ['funnel', 'papers', 'flow'],
    color: '#7c3aed'
  },
  'llm-structured-extraction-systematic-reviews': {
    title: 'Data Extraction',
    icons: ['table', 'arrow', 'structure'],
    color: '#2563eb'
  },
  'production-rag-devchat': {
    title: 'Production RAG',
    icons: ['server', 'chat', 'code'],
    color: '#ea580c'
  },
  'automating-evidence-synthesis-newsletter': {
    title: 'Evidence Synthesis',
    icons: ['papers', 'robot', 'summary'],
    color: '#059669'
  },
  'conflict-zone-spatial-analysis': {
    title: 'Conflict Mapping',
    icons: ['map', 'marker', 'data'],
    color: '#dc2626'
  },
  'mapping-research-institutions-fcas': {
    title: 'Institution Mapping',
    icons: ['globe', 'pins', 'network'],
    color: '#2563eb'
  },
  'temperature-mortality-brazil': {
    title: 'Climate & Health',
    icons: ['thermometer', 'heart', 'chart'],
    color: '#ea580c'
  },
  'maldives-energy-cba': {
    title: 'Energy CBA',
    icons: ['solar', 'calculator', 'island'],
    color: '#0891b2'
  },
  'interactive-hypothesis-testing-react': {
    title: 'Hypothesis Testing',
    icons: ['chart', 'slider', 'stats'],
    color: '#7c3aed'
  },
  'shiny-study-review-system': {
    title: 'Shiny Review',
    icons: ['app', 'papers', 'check'],
    color: '#059669'
  },
  'polite-web-scraping-fcdo': {
    title: 'Web Scraping',
    icons: ['spider', 'web', 'data'],
    color: '#2563eb'
  },
  'synthetic-data-pipeline-llms': {
    title: 'Synthetic Data',
    icons: ['factory', 'data', 'llm'],
    color: '#7c3aed'
  },
  'small_sample': {
    title: 'Small Samples',
    icons: ['chart', 'dots', 'stats'],
    color: '#dc2626'
  }
};

// Simple icon drawing functions using rough.js primitives
function drawIcon(rc, ctx, iconType, x, y, size, color) {
  const opts = { 
    stroke: color, 
    strokeWidth: 2, 
    roughness: 1.5,
    bowing: 2
  };
  const fillOpts = { 
    ...opts, 
    fill: color, 
    fillStyle: 'hachure',
    hachureGap: 4
  };

  switch(iconType) {
    case 'magnifier':
      rc.circle(x, y, size * 0.6, opts);
      rc.line(x + size * 0.2, y + size * 0.2, x + size * 0.4, y + size * 0.4, opts);
      break;
    case 'document':
      rc.rectangle(x - size * 0.25, y - size * 0.35, size * 0.5, size * 0.7, opts);
      rc.line(x - size * 0.15, y - size * 0.15, x + size * 0.15, y - size * 0.15, opts);
      rc.line(x - size * 0.15, y, x + size * 0.15, y, opts);
      rc.line(x - size * 0.15, y + size * 0.15, x + size * 0.1, y + size * 0.15, opts);
      break;
    case 'checkmark':
      rc.line(x - size * 0.2, y, x - size * 0.05, y + size * 0.2, { ...opts, strokeWidth: 3 });
      rc.line(x - size * 0.05, y + size * 0.2, x + size * 0.25, y - size * 0.2, { ...opts, strokeWidth: 3 });
      break;
    case 'brain':
      rc.ellipse(x, y, size * 0.5, size * 0.6, opts);
      rc.arc(x - size * 0.1, y - size * 0.1, size * 0.3, size * 0.3, 0, Math.PI, false, opts);
      rc.arc(x + size * 0.1, y + size * 0.05, size * 0.25, size * 0.25, Math.PI, 0, false, opts);
      break;
    case 'heart':
      rc.path(`M ${x} ${y + size * 0.15} 
               C ${x - size * 0.25} ${y - size * 0.1} ${x - size * 0.25} ${y - size * 0.25} ${x} ${y - size * 0.1}
               C ${x + size * 0.25} ${y - size * 0.25} ${x + size * 0.25} ${y - size * 0.1} ${x} ${y + size * 0.15}`, fillOpts);
      break;
    case 'scale':
      rc.line(x, y - size * 0.3, x, y + size * 0.3, opts);
      rc.line(x - size * 0.3, y - size * 0.2, x + size * 0.3, y - size * 0.2, opts);
      rc.arc(x - size * 0.25, y - size * 0.1, size * 0.2, size * 0.15, 0, Math.PI, false, opts);
      rc.arc(x + size * 0.25, y - size * 0.1, size * 0.2, size * 0.15, 0, Math.PI, false, opts);
      break;
    case 'database':
      rc.ellipse(x, y - size * 0.2, size * 0.5, size * 0.2, opts);
      rc.line(x - size * 0.25, y - size * 0.2, x - size * 0.25, y + size * 0.2, opts);
      rc.line(x + size * 0.25, y - size * 0.2, x + size * 0.25, y + size * 0.2, opts);
      rc.ellipse(x, y + size * 0.2, size * 0.5, size * 0.2, opts);
      break;
    case 'search':
      rc.circle(x, y - size * 0.1, size * 0.4, opts);
      rc.line(x + size * 0.12, y + size * 0.05, x + size * 0.3, y + size * 0.25, opts);
      break;
    case 'lightbulb':
      rc.circle(x, y - size * 0.1, size * 0.4, fillOpts);
      rc.rectangle(x - size * 0.1, y + size * 0.1, size * 0.2, size * 0.15, opts);
      break;
    case 'funnel':
      rc.line(x - size * 0.3, y - size * 0.25, x + size * 0.3, y - size * 0.25, opts);
      rc.line(x - size * 0.3, y - size * 0.25, x - size * 0.05, y + size * 0.1, opts);
      rc.line(x + size * 0.3, y - size * 0.25, x + size * 0.05, y + size * 0.1, opts);
      rc.line(x - size * 0.05, y + size * 0.1, x - size * 0.05, y + size * 0.3, opts);
      rc.line(x + size * 0.05, y + size * 0.1, x + size * 0.05, y + size * 0.3, opts);
      break;
    case 'papers':
      rc.rectangle(x - size * 0.2, y - size * 0.25, size * 0.4, size * 0.5, opts);
      rc.rectangle(x - size * 0.25, y - size * 0.2, size * 0.4, size * 0.5, { ...opts, stroke: color + '80' });
      break;
    case 'chart':
      rc.line(x - size * 0.25, y + size * 0.25, x - size * 0.25, y - size * 0.25, opts);
      rc.line(x - size * 0.25, y + size * 0.25, x + size * 0.25, y + size * 0.25, opts);
      rc.rectangle(x - size * 0.15, y, size * 0.1, size * 0.25, fillOpts);
      rc.rectangle(x - size * 0.02, y - size * 0.15, size * 0.1, size * 0.4, fillOpts);
      rc.rectangle(x + size * 0.1, y - size * 0.05, size * 0.1, size * 0.3, fillOpts);
      break;
    case 'robot':
      rc.rectangle(x - size * 0.2, y - size * 0.2, size * 0.4, size * 0.35, opts);
      rc.circle(x - size * 0.1, y - size * 0.1, size * 0.1, fillOpts);
      rc.circle(x + size * 0.1, y - size * 0.1, size * 0.1, fillOpts);
      rc.line(x, y - size * 0.35, x, y - size * 0.25, opts);
      rc.circle(x, y - size * 0.4, size * 0.08, fillOpts);
      break;
    case 'globe':
      rc.circle(x, y, size * 0.5, opts);
      rc.ellipse(x, y, size * 0.2, size * 0.5, opts);
      rc.line(x - size * 0.25, y, x + size * 0.25, y, opts);
      break;
    case 'thermometer':
      rc.circle(x, y + size * 0.2, size * 0.25, fillOpts);
      rc.rectangle(x - size * 0.08, y - size * 0.35, size * 0.16, size * 0.5, opts);
      break;
    case 'server':
      rc.rectangle(x - size * 0.25, y - size * 0.3, size * 0.5, size * 0.2, opts);
      rc.rectangle(x - size * 0.25, y - size * 0.05, size * 0.5, size * 0.2, opts);
      rc.rectangle(x - size * 0.25, y + size * 0.2, size * 0.5, size * 0.2, opts);
      rc.circle(x + size * 0.15, y - size * 0.2, size * 0.06, fillOpts);
      rc.circle(x + size * 0.15, y + size * 0.05, size * 0.06, fillOpts);
      break;
    case 'map':
      rc.rectangle(x - size * 0.3, y - size * 0.25, size * 0.6, size * 0.5, opts);
      rc.line(x - size * 0.1, y - size * 0.25, x - size * 0.15, y + size * 0.25, opts);
      rc.line(x + size * 0.1, y - size * 0.25, x + size * 0.15, y + size * 0.25, opts);
      break;
    default:
      // Generic circle for unknown icons
      rc.circle(x, y, size * 0.4, fillOpts);
  }
}

function generateBlogImage(slug, theme, outputDir) {
  const width = 1200;
  const height = 630; // OG image standard
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const rc = rough.canvas(canvas);
  
  // Background - slightly off-white with texture
  ctx.fillStyle = '#fafaf9';
  ctx.fillRect(0, 0, width, height);
  
  // Add some random dots for paper texture
  ctx.fillStyle = '#e7e5e4';
  for (let i = 0; i < 100; i++) {
    ctx.beginPath();
    ctx.arc(
      Math.random() * width,
      Math.random() * height,
      Math.random() * 2,
      0, Math.PI * 2
    );
    ctx.fill();
  }
  
  // Draw sketchy border
  rc.rectangle(20, 20, width - 40, height - 40, {
    stroke: '#d6d3d1',
    strokeWidth: 1,
    roughness: 2,
    bowing: 3
  });
  
  // Draw icons
  const iconSize = 120;
  const startX = 200;
  const spacing = 350;
  const y = height / 2 - 30;
  
  theme.icons.forEach((icon, i) => {
    drawIcon(rc, ctx, icon, startX + i * spacing, y, iconSize, theme.color);
  });
  
  // Draw connecting arrows between icons
  const arrowOpts = { stroke: '#a8a29e', strokeWidth: 1.5, roughness: 1.5 };
  for (let i = 0; i < theme.icons.length - 1; i++) {
    const fromX = startX + i * spacing + iconSize * 0.4;
    const toX = startX + (i + 1) * spacing - iconSize * 0.4;
    rc.line(fromX, y, toX, y, arrowOpts);
    // Arrow head
    rc.line(toX - 15, y - 10, toX, y, arrowOpts);
    rc.line(toX - 15, y + 10, toX, y, arrowOpts);
  }
  
  // Title at bottom
  ctx.font = 'bold 32px Georgia, serif';
  ctx.fillStyle = '#44403c';
  ctx.textAlign = 'center';
  ctx.fillText(theme.title, width / 2, height - 60);
  
  // Author signature
  ctx.font = 'italic 18px Georgia, serif';
  ctx.fillStyle = '#78716c';
  ctx.fillText('Lucas Sempé', width / 2, height - 30);
  
  // Save PNG
  const buffer = canvas.toBuffer('image/png');
  const outputPath = path.join(outputDir, `${slug}.png`);
  fs.writeFileSync(outputPath, buffer);
  console.log(`✓ Generated: ${outputPath}`);
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
