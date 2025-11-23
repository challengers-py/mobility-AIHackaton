// ========================================
// ÖBB Mobility Insights Dashboard - Main JS
// ========================================

// Configuration
const CONFIG = {
    API_BASE_URL: 'http://localhost:8000', // Update with your FastAPI backend URL
    GEMINI_API_KEY: 'AIzaSyBDkLxMoFkoJ4s1M2bPDehZylALkaALuEE',
    GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
};

// ========================================
// AI Hot Topic Banner Functionality
// ========================================

// Helper function to load JSON data from backend
async function loadJSONData() {
    try {
        // TODO: Update these URLs to match your FastAPI backend endpoints
        const [sentimentData, topicsData, issuesData] = await Promise.all([
            fetch(`${CONFIG.API_BASE_URL}/api/sentiment-over-time`).then(r => r.json()).catch(() => null),
            fetch(`${CONFIG.API_BASE_URL}/api/topics`).then(r => r.json()).catch(() => null),
            fetch(`${CONFIG.API_BASE_URL}/api/emerging-issues`).then(r => r.json()).catch(() => null)
        ]);

        return {
            sentiment: sentimentData,
            topics: topicsData,
            issues: issuesData
        };
    } catch (error) {
        console.warn('Could not load JSON data from backend, using mock data');
        return null;
    }
}

async function loadHotTopic() {
    const hotTopicText = document.getElementById('hotTopicText');
    const hotTopicTimestamp = document.getElementById('hotTopicTimestamp');

    // Add loading class
    hotTopicText.classList.add('loading');
    hotTopicText.textContent = 'Loading AI-generated insights...';

    try {
        // Step 1: Try to load data from your backend JSON files
        const jsonData = await loadJSONData();
        
        // Step 2: Prepare data summary for Gemini
        let dashboardData;
        
        if (jsonData && jsonData.sentiment) {
            // Use real data from backend
            dashboardData = {
                totalFeedback: 2547, // Extract from your actual data
                avgSentiment: 72,
                activeIssues: jsonData.issues ? jsonData.issues.length : 8,
                topTopics: jsonData.topics ? jsonData.topics.slice(0, 4).map(t => t.name) : ['Punctuality', 'Mobile App'],
                recentTrends: 'Punctuality improved 12% on Vienna-Salzburg routes. Mobile app complaints increased 23% during peak hours.'
            };
        } else {
            // Use mock data if backend is not available
            dashboardData = {
                totalFeedback: 2547,
                avgSentiment: 72,
                activeIssues: 8,
                topTopics: ['Punctuality', 'Mobile App', 'WiFi Service', 'Station Facilities'],
                recentTrends: 'Punctuality improved 12% on Vienna-Salzburg routes. Mobile app complaints increased 23% during peak hours.'
            };
        }

        // Step 3: Create prompt for Gemini
        const prompt = `You are an AI analyst for ÖBB (Austrian Federal Railways). Based on the following customer feedback data, generate ONE concise hot topic insight (max 2 sentences) highlighting the most important finding of the week:

Data Summary:
- Total Feedback: ${dashboardData.totalFeedback} entries
- Average Sentiment: ${dashboardData.avgSentiment}% positive
- Active Issues: ${dashboardData.activeIssues}
- Top Topics: ${dashboardData.topTopics.join(', ')}
- Recent Trends: ${dashboardData.recentTrends}

Generate a professional, actionable insight that combines positive and concerning trends. Start directly with the insight, no introduction needed.`;

        // Step 4: Call Gemini API
        const response = await fetch(CONFIG.GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': CONFIG.GEMINI_API_KEY
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Step 5: Extract the generated text
        const generatedText = data.candidates[0].content.parts[0].text;

        // Update the banner
        hotTopicText.textContent = generatedText;
        hotTopicText.classList.remove('loading');

        // Update timestamp
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        hotTopicTimestamp.textContent = `Updated ${timeString}`;

        console.log('✅ Hot topic loaded successfully from Gemini AI');

    } catch (error) {
        console.error('Error loading hot topic:', error);
        
        // Fallback to mock data if API fails
        hotTopicText.textContent = '⚠️ Customer satisfaction with punctuality improved by 12% this week on Vienna-Salzburg routes, while mobile app connectivity issues during peak hours show a 23% increase in complaints requiring immediate attention.';
        hotTopicText.classList.remove('loading');
        
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        hotTopicTimestamp.textContent = `Updated ${timeString} (Fallback mode)`;
    }
}

// ========================================
// Navigation Functionality
// ========================================

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');
    const navToggle = document.getElementById('navToggle');
    const sidebar = document.getElementById('sidebar');

    // Handle navigation clicks
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.getAttribute('data-section');

            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Show target section
            sections.forEach(section => {
                if (section.id === targetSection) {
                    section.classList.add('active');
                } else {
                    section.classList.remove('active');
                }
            });

            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('active');
            }
        });
    });

    // Handle mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(e.target) && !navToggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        }
    });
}

// ========================================
// Load Data from Backend
// ========================================

async function loadDashboardData() {
    try {
        // TODO: Implement actual API calls to your FastAPI backend
        // Example endpoints:
        // - /api/sentiment-over-time
        // - /api/topics
        // - /api/emerging-issues
        // - /api/recommendations

        // Update last updated timestamp
        const lastUpdatedElement = document.getElementById('lastUpdated');
        if (lastUpdatedElement) {
            const now = new Date();
            lastUpdatedElement.textContent = now.toLocaleString();
        }

        // Load mock data for demonstration
        loadMockKPIData();

    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// ========================================
// Load Mock KPI Data (Replace with Real Data)
// ========================================

function loadMockKPIData() {
    // Update KPI cards with mock data
    document.querySelector('#kpiTotalFeedback .kpi-value').textContent = '2,547';
    document.querySelector('#kpiAvgSentiment .kpi-value').textContent = '72%';
    document.querySelector('#kpiActiveIssues .kpi-value').textContent = '8';
    document.querySelector('#kpiTopTopics .kpi-value').textContent = '15';

    // Update overview summary
    document.getElementById('overviewSummary').innerHTML = `
        <p>This week's analysis covers <strong>2,547 customer feedback entries</strong> from multiple sources including emails, social media, and Google Reviews.</p>
        <p>Overall sentiment remains <strong class="text-positive">positive at 72%</strong>, with notable improvements in service quality perception.</p>
        <p><strong class="text-warning">8 emerging issues</strong> require attention, primarily related to digital services and station facilities.</p>
    `;

    // Update sentiment percentages
    document.querySelector('#sentimentPositive .sentiment-percentage').textContent = '72%';
    document.querySelector('#sentimentNeutral .sentiment-percentage').textContent = '18%';
    document.querySelector('#sentimentNegative .sentiment-percentage').textContent = '10%';
}

// ========================================
// Initialize Dashboard
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚂 ÖBB Mobility Insights Dashboard Initialized');
    
    // Initialize all functionality
    initNavigation();
    loadHotTopic(); // Load the AI hot topic
    loadDashboardData();
    
    // Auto-refresh hot topic every 10 minutes
    setInterval(loadHotTopic, 10 * 60 * 1000);
    
    // Auto-refresh dashboard data every 5 minutes
    setInterval(loadDashboardData, 5 * 60 * 1000);
});
