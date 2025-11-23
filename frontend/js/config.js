// ========================================
// ÖBB Mobility Insights Dashboard - Configuration
// ========================================

/**
 * Configuration handler that loads from environment variables
 * For production, these should be loaded from a backend endpoint
 * or build-time environment variables
 */

// Check if running in Node.js environment (for build tools)
const isNode = typeof process !== 'undefined' && process.env;

// Configuration object
const CONFIG = {
    // Backend API Configuration
    API_BASE_URL: isNode 
        ? process.env.API_BASE_URL 
        : window.ENV?.API_BASE_URL || 'http://localhost:8000',
    
    // Google Gemini API Configuration
    GEMINI_API_KEY: isNode 
        ? process.env.GEMINI_API_KEY 
        : window.ENV?.GEMINI_API_KEY || '',
    
    GEMINI_API_URL: isNode 
        ? process.env.GEMINI_API_URL 
        : window.ENV?.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    
    // Development mode
    IS_DEV: isNode 
        ? process.env.NODE_ENV === 'development' 
        : window.ENV?.NODE_ENV === 'development' || false
};

// Validate configuration
if (!CONFIG.GEMINI_API_KEY && CONFIG.IS_DEV) {
    console.warn('⚠️ GEMINI_API_KEY not configured. AI features will not work.');
    console.warn('📝 Please set up environment variables or configure window.ENV');
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

// Log configuration status (only in dev mode)
if (CONFIG.IS_DEV) {
    console.log('🔧 Configuration loaded:');
    console.log('- API Base URL:', CONFIG.API_BASE_URL);
    console.log('- Gemini API:', CONFIG.GEMINI_API_KEY ? '✅ Configured' : '❌ Missing');
    console.log('- Environment:', CONFIG.IS_DEV ? 'Development' : 'Production');
}
