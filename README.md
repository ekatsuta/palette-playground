# Palette

An AI-powered serverless API that generates color palette suggestions based on mood descriptions, drawing from the legendary **Sanzo Wada Dictionary of Color Combinations** (1933).

This application uses Claude AI to interpret artistic inspirations and moods, then intelligently selects color palettes from Sanzo Wada's 348 carefully curated combinations that capture Japanese perceptions of color harmony and emotion.

## Features

- **Serverless API**: Built with Vercel serverless functions for automatic scaling and cost-efficiency
- **AI-Driven Selection**: Uses Claude 3.5 Haiku to analyze mood descriptions and match them with appropriate color combinations
- **Sanzo Wada Dictionary**: Access to all 348 authentic color combinations from the 1933 reference work
- **Conversational Support**: Iterative refinement through conversation history
- **RESTful Design**: Simple HTTP API for easy integration

## About the Sanzo Wada Dictionary

The Sanzo Wada Dictionary of Color Combinations is a legendary reference work created by Japanese artist Sanzo Wada in 1933. It contains 348 meticulously crafted color palettes that reflect Japanese aesthetic principles and the psychology of color.

## Deployment

This project is configured for automatic deployment to Vercel.

### Automatic Deployments

- **Production**: Pushes to the `main` branch automatically deploy to production
- **Preview**: Pull requests automatically generate preview deployments for testing

### Manual Deployment

To deploy manually using the Vercel CLI:

```bash
# Install Vercel CLI globally
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Build Configuration

Vercel automatically detects Vite and uses the following settings:

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Environment Variables

If your application requires environment variables, add them in the Vercel dashboard:

1. Go to your project settings
2. Navigate to Environment Variables
3. Add variables prefixed with `VITE_` to make them accessible in your app

## API Documentation

### Generate Color Palettes

Generate color palette suggestions from the Sanzo Wada Dictionary based on mood descriptions.

**Endpoint:** `POST /api/generate-palette`

**Request Headers:**

```
Content-Type: application/json
```

**Request Body:**

```typescript
{
  "mood": string,                      // Required: Description of mood/inspiration (max 500 chars)
  "conversationHistory"?: Array<{      // Optional: Previous conversation context
    "role": "user" | "assistant",
    "content": string | Array,
    "timestamp"?: number
  }>,
  "currentPalettes"?: Array<{          // Optional: Currently displayed palettes
    "id": number,
    "colors": Array<{
      "name": string,
      "hex": string
    }>,
    "reasoning": string
  }>
}
```

**Response (200 OK):**

```typescript
{
  "mood": string,                      // The mood/inspiration that was analyzed
  "palettes": Array<{                  // 3 selected color palettes
    "id": number,                      // Palette ID from Sanzo Wada Dictionary
    "colors": Array<{                  // Colors in the palette
      "name": string,                  // Color name (e.g., "Crimson")
      "hex": string                    // Hex color code (e.g., "#DC143C")
    }>,
    "reasoning": string                // Why this palette was selected
  }>,
  "count": number,                     // Number of palettes returned (always 3, for now)
  "timestamp": string                  // ISO 8601 timestamp
}
```

**Error Responses:**

- `400 Bad Request`: Invalid mood description

  ```json
  { "error": "Mood description is required" }
  ```

- `429 Too Many Requests`: Rate limit exceeded

  ```json
  { "error": "Rate limit exceeded. Please try again in a moment." }
  ```

- `500 Internal Server Error`: Server or AI service error
  ```json
  {
    "error": "Internal server error",
    "message": "Error details (in development mode)"
  }
  ```

**Example Requests:**

Basic request:

```bash
curl -X POST http://localhost:3000/api/generate-palette \
  -H "Content-Type: application/json" \
  -d '{"mood": "serene morning by the ocean"}'
```

With conversation history:

```bash
curl -X POST http://localhost:3000/api/generate-palette \
  -H "Content-Type: application/json" \
  -d '{
    "mood": "make it more vibrant",
    "conversationHistory": [
      {
        "role": "user",
        "content": "serene morning by the ocean"
      }
    ]
  }'
```

**Local Development:**

To test the API locally, you need to use Vercel CLI (Vite dev server doesn't support API routes):

```bash
# Install Vercel CLI
npm i -g vercel

# Start dev server with API support
vercel dev

# The server will start on port 3000 (or another available port)
```

**Environment Variables Required (in .env file):**

- `ANTHROPIC_API_KEY`: Your Anthropic API key for Claude

**Model Information:**

- Uses Claude 3.5 Haiku for fast, cost-effective responses
- Max response time: ~2-5 seconds
- Always returns exactly 3 palette suggestions
