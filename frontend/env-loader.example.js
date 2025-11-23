// ========================================
// Environment Variables Loader for Browser
// ========================================

/**
 * This script loads environment variables for the browser
 * IMPORTANT: For production, load these from a secure backend endpoint
 * Never expose API keys in production frontend code!
 * 
 * SETUP INSTRUCTIONS:
 * 1. Copy this file to 'env-loader.js' in the same directory
 * 2. Replace 'YOUR_GEMINI_API_KEY_HERE' with your actual Gemini API key
 * 3. Get your API key from: https://makersuite.google.com/app/apikey
 * 4. NEVER commit env-loader.js with real API keys!
 */

// Load .env file in development (simulated for browser)
// In production, these should come from your backend API
window.ENV = {
    // Backend API
    API_BASE_URL: 'http://localhost:8000',
    
    // Google Gemini API (REPLACE WITH YOUR KEY)
    GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY_HERE',
    GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    
    // Environment
    NODE_ENV: 'development'
};

// For production, fetch from backend:
// async function loadEnvFromBackend() {
//     try {
//         const response = await fetch('/api/config');
//         const config = await response.json();
//         window.ENV = config;
//     } catch (error) {
//         console.error('Failed to load configuration:', error);
//     }
// }

console.log('🔐 Environment variables loaded for browser');
