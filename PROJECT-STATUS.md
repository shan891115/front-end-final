# Travel Comparison Project

A full-stack web application that uses AI to compare travel destinations by scraping website content and providing intelligent analysis.

## 🎯 Current Status

✅ **WORKING WITH MOCK DATA** - The system is fully functional using mock data instead of real APIs due to network connectivity issues with external services.

## 🚀 Quick Start

### Option 1: Use the Launcher Scripts

#### Windows PowerShell:
```powershell
.\launch-project.ps1
```

#### Windows Command Prompt:
```batch
launch-project.bat
```

### Option 2: Manual Start

#### Start Backend (API Server):
```bash
cd travel-comparison-api
node server.js
```

#### Start Frontend (Development Server):
```bash
npm run dev
```

## 🔗 Project URLs

- **Frontend Application**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Test Page**: `test-frontend-integration.html` (open in browser)

## 🧪 Testing

### 1. API Test Page
Open `test-frontend-integration.html` in your browser to test all API endpoints interactively.

### 2. Manual API Testing
```bash
# Test backend connection
curl http://localhost:3000/api

# Test comparison endpoint
curl -X POST http://localhost:3000/api/comparison/compare \
  -H "Content-Type: application/json" \
  -d '{"urls":[{"url":"https://taiwan-travel.com","title":"Taiwan"},{"url":"https://japan-travel.com","title":"Japan"}]}'
```

## 🛠️ Features

### ✅ Implemented
- **Backend API**: Express.js server with mock data generation
- **Frontend**: Vue.js application with comparison interface
- **Mock Data**: Realistic travel data for Taiwan, Japan, Korea
- **AI Analysis**: Mock AI responses with structured JSON comparison
- **Comparison Table**: Dynamic table showing destination comparisons
- **AI Chat**: Interactive chat functionality with context awareness
- **Error Handling**: Comprehensive error handling and logging

### 🔄 Current Mode: Mock Data
The application currently runs in mock mode (`USE_MOCK_DATA=true`) to demonstrate functionality:

- **Firecrawl Service**: Generates realistic travel content for different destinations
- **AI Service**: Creates structured comparison analysis in JSON format
- **All APIs**: Return mock responses immediately without external dependencies

## 📂 Project Structure

```
final_project/
├── src/                          # Frontend Vue.js application
│   ├── views/ComparePage.vue     # Main comparison interface
│   ├── services/aiService.js     # Frontend API communication
│   └── ...
├── travel-comparison-api/        # Backend API server
│   ├── src/
│   │   ├── services/
│   │   │   ├── firecrawlService.js    # Web scraping (mock mode)
│   │   │   └── aiService.js           # AI analysis (mock mode)
│   │   ├── controllers/
│   │   │   └── comparisonController.js # API endpoints
│   │   └── routes/               # API routes
│   ├── server.js                 # Main server file
│   └── .env                      # Environment configuration
├── test-frontend-integration.html # API testing interface
├── launch-project.ps1           # PowerShell launcher
└── launch-project.bat           # Batch launcher
```

## 🔧 Configuration

Environment variables in `travel-comparison-api/.env`:

```properties
# Development Mode
USE_MOCK_DATA=true        # Enable mock mode

# Server
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173

# API Keys (not used in mock mode)
FIRECRAWL_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
```

## 🎨 User Interface

The frontend provides:

1. **URL Input**: Add multiple travel destination URLs
2. **Comparison Analysis**: AI-generated comparison table
3. **Interactive Chat**: Ask questions about the comparison results
4. **Responsive Design**: Works on desktop and mobile devices

## 🔮 Next Steps

To use real APIs instead of mock data:

1. Set `USE_MOCK_DATA=false` in `.env`
2. Ensure network connectivity to Firecrawl and Gemini APIs
3. Verify API keys are valid
4. Test with real travel websites

## 🐛 Troubleshooting

### Backend won't start:
- Check if port 3000 is available
- Verify you're in the correct directory
- Check Node.js is installed

### Frontend won't start:
- Check if port 5173 is available
- Run `npm install` if dependencies are missing
- Verify Node.js and npm are installed

### API test page shows connection errors:
- Ensure backend server is running
- Check if there are CORS issues
- Verify the API endpoints are accessible

## 📝 API Documentation

### POST /api/comparison/compare
Compare multiple travel destinations.

**Request:**
```json
{
  "urls": [
    {"url": "https://example.com/destination1", "title": "Destination 1"},
    {"url": "https://example.com/destination2", "title": "Destination 2"}
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": "{\"destinations\":[...],\"summary\":\"...\",\"recommendations\":{...}}",
    "totalUrls": 2,
    "successfulScrapes": 2
  }
}
```

### POST /api/ai/chat
Chat with AI about comparison results.

**Request:**
```json
{
  "message": "Which destination is best for families?",
  "chatHistory": [],
  "context": { /* comparison result */ }
}
```

**Response:**
```json
{
  "message": "Based on the analysis, destination X is best for families because..."
}
```
