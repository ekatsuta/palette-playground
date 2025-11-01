# Palette Playground

An AI-powered color palette discovery tool that generates harmonious color combinations based on mood descriptions, drawing from the legendary **Sanzo Wada Dictionary of Color Combinations** (1933).

## About

This application uses Claude AI to interpret artistic inspirations and moods, then intelligently selects a perfect palette from Sanzo Wada's 348 carefully curated color combinations. Each palette is displayed through multiple composition styles (Golden Section, Rule of Thirds, Golden Spiral) with reasoning explaining why it was chosen.

### The Sanzo Wada Dictionary

The Sanzo Wada Dictionary of Color Combinations is a legendary reference work created by Japanese artist Sanzo Wada in 1933. It contains 348 meticulously crafted color palettes that reflect Japanese aesthetic principles and the psychology of color.

## Features

- **AI-powered selection** using Claude 3.5 Haiku
- **Interactive composition views** to explore each palette
- **Reasoning explanations** for every palette selection
- **Keyboard navigation** between composition styles
- **Mock/Production toggle** for testing without API calls

## Getting Started

### Prerequisites

- Node.js 18+
- Anthropic API key (for production)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Add your API key to .env
```

### Development

#### With Mock API (no LLM calls)

```bash
# In .env
VITE_USE_MOCK_API=true

# Run dev server
npm run dev
```

Visit `http://localhost:5173`

#### With Production API (real LLM calls)

```bash
# In .env
VITE_USE_MOCK_API=false
ANTHROPIC_API_KEY=your_key_here

# Run with API support
npm run dev:api
```

Visit `http://localhost:3000`

## Environment Variables

```bash
# Toggle between mock and production API
VITE_USE_MOCK_API=true

# Your Anthropic API key
ANTHROPIC_API_KEY=your_api_key_here
```

## API Usage

**Endpoint:** `POST /api/generate-palette`

**Request:**

```json
{
  "mood": "The quiet melancholy of rain on autumn leaves"
}
```

**Response:**

```json
{
  "mood": "The quiet melancholy of rain on autumn leaves",
  "palette": {
    "id": 1,
    "colors": [
      { "name": "English Red", "hex": "#de4500" },
      { "name": "Cerulian Blue", "hex": "#29bdad" }
    ],
    "reasoning": "This palette captures the essence..."
  },
  "timestamp": "2025-10-29T..."
}
```

## Tech Stack

- React + TypeScript + Vite
- Claude 3.5 Haiku (Anthropic)
- Vercel Serverless Functions

## Scripts

```bash
npm run dev          # Development (mock API)
npm run dev:api      # Development (with API)
npm run build        # Build for production
npm run format       # Format code with Prettier
```
