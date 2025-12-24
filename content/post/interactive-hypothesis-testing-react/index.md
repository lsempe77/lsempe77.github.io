---
title: "Interactive Hypothesis Testing Visualization with React"
summary: "Building an educational React component to teach statistical hypothesis testing, Type I/II errors, and statistical power through progressive disclosure."
date: 2024-10-15
authors:
  - admin
tags:
  - React
  - Statistics Education
  - Data Visualization
  - Impact Evaluation
  - Interactive Learning
image:
  caption: 'Interactive hypothesis testing education'
categories:
  - Education Tools
  - Web Development
featured: false
---

## Teaching Statistics Visually

Hypothesis testing is foundational to impact evaluation, yet many practitioners struggle with concepts like Type I errors, Type II errors, and statistical power. Traditional explanations with formulas often fail to build intuition.

This post describes building an interactive React component that teaches these concepts through progressive disclosure—revealing the decision matrix one quadrant at a time with clear explanations.

## The Pedagogical Approach

Rather than presenting the full 2×2 decision matrix at once (which can overwhelm), we:

1. Start with the **null hypothesis** explanation
2. Progressively reveal each quadrant with context
3. Build understanding of error types and power
4. Summarize key takeaways

```
┌─────────────────────────────────────────────────────────────────┐
│                    LEARNING PROGRESSION                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Stage 1: Introduce H₀ (null hypothesis)                        │
│     └── "We assume no difference until proven otherwise"        │
│                                                                  │
│  Stage 2: Show correct decisions first                          │
│     └── True Negative (keep H₀ when groups ARE equal)           │
│     └── True Positive (reject H₀ when groups ARE different)     │
│                                                                  │
│  Stage 3: Introduce errors                                       │
│     └── Type I Error (α) - false positive                       │
│     └── Type II Error (β) - false negative                      │
│                                                                  │
│  Stage 4: Key takeaways                                          │
│     └── Burden of proof                                         │
│     └── Trade-offs in error rates                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

```jsx
// App.jsx - Main application
import NullHypothesisMatrix from './components/NullHypothesisMatrix'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto">
        <NullHypothesisMatrix />
      </div>
    </div>
  )
}

export default App
```

## The Matrix Box Component

Each cell in the decision matrix is a reusable component:

```jsx
const MatrixBox = ({ title, description, probability, backgroundColor, isVisible }) => {
  return (
    <div className={`${backgroundColor} p-6 rounded-lg transition-opacity duration-500 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      <h3 
        className="text-lg font-semibold text-gray-800 mb-3" 
        dangerouslySetInnerHTML={{ __html: title }}
      />
      <p className="text-gray-700 mb-3">{description}</p>
      <p 
        className="text-gray-600" 
        dangerouslySetInnerHTML={{ __html: probability }}
      />
    </div>
  );
};
```

## Progressive Disclosure Logic

The main component manages which boxes are visible:

```jsx
const NullHypothesisMatrix = () => {
  const [visibleBox, setVisibleBox] = useState(0);
  const [showDecisionMatrix, setShowDecisionMatrix] = useState(false);
  const [showKeyPoints, setShowKeyPoints] = useState(false);

  // Define the four quadrants
  const matrixBoxes = [
    {
      title: 'Correct: Keep H<sub>0</sub>',
      description: 'TRUE NEGATIVE: We correctly maintain that groups are equal',
      probability: 'Probability = 1 - α',
      backgroundColor: 'bg-green-100',
    },
    {
      title: 'Error: Reject H<sub>0</sub>',
      description: "FALSE POSITIVE: We claim a difference that isn't there",
      probability: 'Probability = α (Type I Error)',
      backgroundColor: 'bg-red-100',
    },
    {
      title: 'Error: Keep H<sub>0</sub>',
      description: 'FALSE NEGATIVE: We miss a real difference between groups',
      probability: 'Probability = β (Type II Error)',
      backgroundColor: 'bg-red-100',
    },
    {
      title: 'Correct: Reject H<sub>0</sub>',
      description: 'TRUE POSITIVE: We correctly detect a real difference',
      probability: 'Probability = 1 - β (Power)',
      backgroundColor: 'bg-green-100',
    }
  ];

  const handleNext = () => {
    if (visibleBox < 4) {
      setVisibleBox(prev => prev + 1);
    }
    if (visibleBox === 3) {
      setTimeout(() => setShowKeyPoints(true), 500);
    }
  };

  const handlePrevious = () => {
    setVisibleBox(prev => (prev > 0 ? prev - 1 : prev));
    if (visibleBox === 1) {
      setShowKeyPoints(false);
    }
  };

  // ... render logic
};
```

## Starting Point: The Null Hypothesis

The first card explains the starting assumption:

```jsx
{/* First Card: Null Hypothesis Explanation */}
<Card>
  <CardContent>
    <h2 className="text-xl font-bold mb-4">
      Starting Point: Null Hypothesis (H<sub>0</sub>)
    </h2>
    
    <div className="bg-blue-50 p-4 rounded mb-6">
      <p className="text-lg mb-2">
        H<sub>0</sub>: Treatment Group ≈ Control Group
      </p>
      <p className="text-sm">
        <i>(We assume no difference between groups until proven otherwise)</i>
      </p>
    </div>

    {/* Example data */}
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="font-bold mb-2">Control Group</h3>
        <div className="text-sm">Mean = 99.8</div>
        <div className="text-sm">SD = 15.1</div>
      </div>
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="font-bold mb-2">Treatment Group</h3>
        <div className="text-sm">Mean = 100.1</div>
        <div className="text-sm">SD = 15.2</div>
      </div>
    </div>

    <button
      onClick={() => setShowDecisionMatrix(true)}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Continue
    </button>
  </CardContent>
</Card>
```

## The Decision Matrix

The matrix reveals progressively with navigation:

```jsx
{/* Second Card: Decision Matrix */}
{showDecisionMatrix && (
  <Card>
    <CardContent>
      <h2 className="text-xl font-bold mb-4">Our Decision Process</h2>

      <div className="flex">
        {/* Vertical Axis Labels */}
        <div className="mr-8 pt-20">
          <div className="mt-20 space-y-20">
            <div className="text-right pr-4 text-lg font-semibold">
              Decision: Keep H<sub>0</sub>
            </div>
            <div className="text-right pr-4 text-lg font-semibold">
              Decision: Reject H<sub>0</sub>
            </div>
          </div>
        </div>

        {/* Matrix Content */}
        <div className="flex-1">
          {/* Column Headers */}
          <div className="grid grid-cols-2 gap-8 mb-6">
            <div className="text-center text-lg font-semibold">
              Reality: Groups ARE Equal
            </div>
            <div className="text-center text-lg font-semibold">
              Reality: Groups ARE Different
            </div>
          </div>

          {/* Matrix Grid - Order matters for pedagogy! */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-8">
              <MatrixBox {...matrixBoxes[0]} isVisible={visibleBox >= 1} />
              <MatrixBox {...matrixBoxes[1]} isVisible={visibleBox >= 4} />
            </div>
            <div className="space-y-8">
              <MatrixBox {...matrixBoxes[2]} isVisible={visibleBox >= 3} />
              <MatrixBox {...matrixBoxes[3]} isVisible={visibleBox >= 2} />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-center gap-6">
        <button
          onClick={handlePrevious}
          className="px-6 py-2 bg-gray-600 text-white rounded"
          disabled={visibleBox === 0}
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2 bg-blue-400 text-white rounded"
          disabled={visibleBox >= 4}
        >
          Next
        </button>
      </div>

      <div className="mt-4 text-center text-sm text-gray-600">
        Box {visibleBox} of 4
      </div>
    </CardContent>
  </Card>
)}
```

## Key Takeaways Card

After all quadrants are revealed:

```jsx
{/* Third Card: Key Points */}
{showKeyPoints && (
  <Card>
    <CardContent>
      <h2 className="text-xl font-bold mb-4">
        Key Points About H<sub>0</sub>
      </h2>
      
      <div className="space-y-4">
        <div className="flex items-start gap-2">
          <div className="bg-blue-100 p-2 rounded-full">1</div>
          <p>We start by assuming groups are the same (H<sub>0</sub>)</p>
        </div>
        
        <div className="flex items-start gap-2">
          <div className="bg-blue-100 p-2 rounded-full">2</div>
          <p>We need strong evidence to reject this assumption</p>
        </div>
        
        <div className="flex items-start gap-2">
          <div className="bg-blue-100 p-2 rounded-full">3</div>
          <p>The burden of proof is on showing a difference exists</p>
        </div>
        
        <div className="flex items-start gap-2">
          <div className="bg-blue-100 p-2 rounded-full">4</div>
          <p>This approach helps control false positive claims</p>
        </div>
      </div>
    </CardContent>
  </Card>
)}
```

## The Card Component

Using a simple UI component library pattern:

```jsx
// components/ui/card.jsx
export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
}
```

## Styling with Tailwind

The component uses Tailwind CSS for consistent styling:

```js
// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## Pedagogical Design Decisions

### 1. Progressive Disclosure
Revealing one concept at a time reduces cognitive load and helps learners build mental models incrementally.

### 2. Color Coding
- **Green** for correct decisions (true positive, true negative)
- **Red** for errors (Type I, Type II)

This creates immediate visual feedback about what we want (green) vs. what we want to avoid (red).

### 3. Order of Revelation
We show:
1. True Negative first (the "boring" correct case)
2. True Positive second (the exciting discovery)
3. Type II Error third (missing a real effect—often under-discussed)
4. Type I Error last (false positive—most discussed)

This order emphasizes that there are TWO types of correct decisions and TWO types of errors.

### 4. Mathematical Notation
Using HTML subscripts (`H<sub>0</sub>`, `α`, `β`) maintains proper statistical notation while remaining readable.

## Enhancements for the Future

### Interactive Parameters
Allow users to adjust α and see how it affects power:

```jsx
const [alpha, setAlpha] = useState(0.05);
const power = calculatePower(alpha, sampleSize, effectSize);

<input 
  type="range" 
  min="0.01" 
  max="0.10" 
  step="0.01"
  value={alpha}
  onChange={(e) => setAlpha(parseFloat(e.target.value))}
/>
```

### Sample Size Calculator
Extend to show the relationship between sample size, effect size, and power.

### Animated Distributions
Add visualizations of overlapping distributions to show where errors come from.

## Technical Stack

- **React** + Vite for fast development
- **Tailwind CSS** for styling
- **shadcn/ui** patterns for components

## Deployment

```bash
# Build for production
npm run build

# Preview locally
npm run preview

# Deploy to GitHub Pages, Netlify, or Vercel
```

---

Interactive educational tools can make abstract statistical concepts tangible. By controlling the pace of information and using visual cues, we can build intuition that formulas alone cannot provide.
