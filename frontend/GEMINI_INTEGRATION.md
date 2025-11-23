# 🤖 Gemini AI Integration Guide

## Overview
This dashboard integrates Google's Gemini 2.0 Flash API to generate AI-powered insights from your customer feedback data.

## Configuration

### API Key Setup
The Gemini API key is already configured in `js/main.js`:

```javascript
const CONFIG = {
    API_BASE_URL: 'http://localhost:8000',
    GEMINI_API_KEY: 'AIzaSyBDkLxMoFkoJ4s1M2bPDehZylALkaALuEE',
    GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
};
```

⚠️ **Security Note**: For production, move the API key to environment variables or backend.

## How It Works

### 1. Data Collection
The system attempts to load data from your FastAPI backend:
- `/api/sentiment-over-time` → Sentiment data
- `/api/topics` → Topic analysis
- `/api/emerging-issues` → Issue tracking

If backend is unavailable, it falls back to mock data.

### 2. Prompt Generation
The system creates a structured prompt for Gemini:

```
You are an AI analyst for ÖBB (Austrian Federal Railways). 
Based on the following customer feedback data, generate ONE concise 
hot topic insight (max 2 sentences) highlighting the most important 
finding of the week...
```

### 3. AI Response
Gemini analyzes the data and returns a professional insight combining:
- Positive trends
- Concerning issues
- Actionable information

### 4. Display
The insight is displayed in the hot topic banner with:
- 🔥 Animated icon
- Timestamp
- Smooth loading animation

## API Response Format

### Request
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "Your prompt here..."
        }
      ]
    }
  ]
}
```

### Response
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "Generated insight text..."
          }
        ]
      }
    }
  ]
}
```

## Backend Integration

### Option 1: Direct Frontend Integration (Current)
The frontend directly calls Gemini API with your JSON data.

**Pros:**
- Simple setup
- Fast development
- No backend required

**Cons:**
- API key exposed in frontend
- Limited data processing
- CORS might be an issue

### Option 2: Backend Proxy (Recommended for Production)

Create a FastAPI endpoint:

```python
# backend/main.py
from fastapi import FastAPI
import requests

app = FastAPI()

@app.get("/api/hot-topic")
async def get_hot_topic():
    # 1. Load your JSON files
    sentiment_data = load_json("sentiment_over_time.json")
    topics_data = load_json("topics.json")
    issues_data = load_json("emerging_issues.json")
    
    # 2. Analyze and summarize
    summary = analyze_data(sentiment_data, topics_data, issues_data)
    
    # 3. Call Gemini API
    prompt = f"Generate insight based on: {summary}"
    
    response = requests.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        headers={
            "Content-Type": "application/json",
            "X-goog-api-key": "YOUR_API_KEY"
        },
        json={
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }
    )
    
    return response.json()
```

Then update frontend:

```javascript
// js/main.js
const response = await fetch(`${CONFIG.API_BASE_URL}/api/hot-topic`);
const data = await response.json();
hotTopicText.textContent = data.candidates[0].content.parts[0].text;
```

## Customization

### Adjust Prompt
Edit the prompt in `loadHotTopic()` function to change AI behavior:

```javascript
const prompt = `You are an AI analyst for ÖBB...
Generate insights focusing on:
1. Customer satisfaction trends
2. Service quality improvements
3. Technical issues
...`;
```

### Modify Refresh Rate
Change auto-refresh interval (default: 10 minutes):

```javascript
// In document.addEventListener('DOMContentLoaded')
setInterval(loadHotTopic, 15 * 60 * 1000); // 15 minutes
```

### Add More Context
Include additional data in the prompt:

```javascript
const prompt = `...
Data Summary:
- Total Feedback: ${data.totalFeedback}
- Sentiment Breakdown: ${data.sentimentBreakdown}
- Top Routes: ${data.topRoutes}
- Peak Hours: ${data.peakHours}
...`;
```

## Testing

### Test the Integration

1. Open browser console (F12)
2. Look for: `✅ Hot topic loaded successfully from Gemini AI`
3. Check the banner displays generated text
4. Verify timestamp updates

### Manual API Test

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent" \
  -H 'Content-Type: application/json' \
  -H 'X-goog-api-key: AIzaSyBDkLxMoFkoJ4s1M2bPDehZylALkaALuEE' \
  -X POST \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Summarize customer feedback: Punctuality improved 12%, app issues up 23%"
      }]
    }]
  }'
```

## Error Handling

The system includes multiple fallback layers:

1. **Primary**: Gemini API with real data
2. **Fallback 1**: Gemini API with mock data
3. **Fallback 2**: Static mock insight with warning icon

## Rate Limits

Gemini 2.0 Flash API limits:
- **Free tier**: 15 requests per minute
- **Response**: Usually 2-3 seconds

Current refresh: Every 10 minutes = ~144 requests/day (well within limits)

## Security Recommendations

For production deployment:

1. **Move API key to backend**
2. **Add rate limiting**
3. **Implement caching** (store insights for 10-15 min)
4. **Use environment variables**
5. **Add authentication** for API endpoints

## Troubleshooting

### Issue: "Failed to load hot topic"
- Check API key is valid
- Verify internet connection
- Check browser console for CORS errors

### Issue: Generic/repeated insights
- Update prompt with more specific data
- Include recent changes and trends
- Add time-series context

### Issue: Slow loading
- Check network speed
- Consider caching responses
- Reduce data sent to Gemini

## Next Steps

1. ✅ Connect to your FastAPI backend
2. ✅ Load real JSON data
3. ✅ Customize prompts for your use case
4. 🔄 Move API key to backend (recommended)
5. 🔄 Add more AI-generated insights in other sections

---

**Questions?** Check the browser console for detailed logs and error messages.
