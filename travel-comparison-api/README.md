# Travel Comparison API

## Overview
The Travel Comparison API is a backend service designed to scrape user-inputted travel URLs using Firecrawl, process the scraped data, and send it to an AI API for further analysis. This API facilitates users in comparing various travel destinations based on multiple criteria.

## Features
- Scrapes travel-related data from user-provided URLs.
- Processes the scraped data for meaningful insights.
- Interacts with an AI API to enhance user experience and provide tailored recommendations.
- Implements middleware for authentication, error handling, and rate limiting.

## Project Structure
```
travel-comparison-api
├── src
│   ├── app.js                     # Main entry point of the application
│   ├── controllers
│   │   ├── comparisonController.js # Handles travel comparison requests
│   │   └── aiController.js        # Manages interactions with the AI API
│   ├── services
│   │   ├── firecrawlService.js    # Functions for scraping URLs using Firecrawl
│   │   ├── aiService.js           # Functions for sending data to the AI API
│   │   └── dataProcessor.js       # Functions for processing scraped data
│   ├── routes
│   │   ├── index.js               # Sets up main routes
│   │   ├── comparison.js           # Defines routes for travel comparison
│   │   └── ai.js                  # Defines routes for AI interactions
│   ├── middleware
│   │   ├── auth.js                # Authentication middleware
│   │   ├── errorHandler.js        # Error handling middleware
│   │   └── rateLimiter.js         # Rate limiting middleware
│   ├── config
│   │   ├── database.js            # Database configuration
│   │   └── api.js                 # API configuration settings
│   └── utils
│       ├── logger.js              # Logging utility functions
│       └── validator.js           # Input validation functions
├── tests
│   ├── controllers
│   │   └── comparisonController.test.js # Unit tests for ComparisonController
│   └── services
│       └── firecrawlService.test.js    # Unit tests for FirecrawlService
├── .env.example                   # Template for environment variables
├── .gitignore                     # Files and directories to ignore in version control
├── package.json                   # npm configuration file
├── server.js                      # Entry point for starting the server
└── README.md                      # Documentation for the project
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd travel-comparison-api
   ```
3. Install the dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on the `.env.example` template and fill in the required environment variables.

## Usage
1. Start the server:
   ```
   node server.js
   ```
2. Use the API endpoints to scrape URLs and interact with the AI service.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.