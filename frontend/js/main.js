// ========================================
// ÖBB Mobility Insights Dashboard - Main JS
// ========================================

// Configuration is now loaded from config.js
// Make sure to load env-loader.js and config.js before this file

// ========================================
// AI Hot Topic Banner Functionality
// ========================================

// Helper function to load JSON data from local file
async function loadJSONData() {
    try {
        // Load from local data.json file
        const response = await fetch('public/data.json');
        if (!response.ok) {
            throw new Error('Failed to load data.json');
        }
        const data = await response.json();
        console.log('✅ Data loaded from data.json:', data);
        return data;
    } catch (error) {
        console.warn('Could not load data.json, using mock data:', error);
        return null;
    }
}

async function loadHotTopic() {
    const hotTopicText = document.getElementById('hotTopicText');
    const hotTopicTimestamp = document.getElementById('hotTopicTimestamp');

    try {
        // Step 1: Load data from JSON file
        const jsonData = await loadJSONData();
        
        // Step 2: Prepare data summary for Gemini
        let dashboardData;
        
        if (jsonData && jsonData.status === 'success') {
            // Calculate statistics from real data
            const totalMentions = jsonData.statistics.reduce((sum, cat) => sum + cat.total_mentions, 0);
            const delaysData = jsonData.statistics.find(cat => cat.category === 'delays');
            const comfortData = jsonData.statistics.find(cat => cat.category === 'comfort');
            
            // Get top issues from data
            const topIssues = jsonData.data.slice(0, 10).map(item => item.subject);
            
            dashboardData = {
                totalFeedback: jsonData.total_rows_processed,
                totalMentions: totalMentions,
                delaysMentions: delaysData ? delaysData.total_mentions : 0,
                comfortMentions: comfortData ? comfortData.total_mentions : 0,
                categories: jsonData.statistics.map(s => `${s.category}: ${s.total_mentions}`).join(', '),
                topIssues: topIssues.slice(0, 3).join('; ')
            };
        } else {
            // Fallback mock data
            dashboardData = {
                totalFeedback: 5000,
                totalMentions: 5370,
                delaysMentions: 1727,
                comfortMentions: 505,
                categories: 'delays: 1727, comfort: 505, service: 313',
                topIssues: 'Train delays; Service quality; Infrastructure issues'
            };
        }

        // Step 3: Create prompt for Gemini
        const prompt = `You are an AI analyst for ÖBB (Austrian Federal Railways). Based on the following customer feedback data from ${dashboardData.totalFeedback} entries analyzed, generate ONE concise insight (max 2 sentences, under 150 characters) highlighting the most critical finding.

Key Data:
- Total mentions across categories: ${dashboardData.totalMentions}
- Delays mentioned: ${dashboardData.delaysMentions} times (most critical issue)
- Comfort issues: ${dashboardData.comfortMentions} mentions
- Top concerns: ${dashboardData.topIssues}

IMPORTANT RULES:
- DO NOT use any emojis or emoticons
- Use only plain text
- Be direct, actionable and professional
- Focus on the delays issue

Generate your insight now:`;

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
        
        // Fallback to data-driven message (without emojis)
        hotTopicText.textContent = 'Train delays represent 32% of all customer feedback (1,727 mentions), making punctuality the top priority issue requiring immediate attention across all routes.';
        
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        hotTopicTimestamp.textContent = `Updated ${timeString} (Offline mode)`;
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
// Initialize Time Range Selector
// ========================================

function initTimeRangeSelector() {
    const timeRangeBtns = document.querySelectorAll('.time-range-btn');
    
    timeRangeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            timeRangeBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Get the selected range
            const range = btn.getAttribute('data-range');
            
            // Regenerate chart with new time range
            if (globalSentimentData) {
                generateSentimentTimelineChart(globalSentimentData, range);
            }
        });
    });
    
    console.log('⏰ Time range selector initialized');
}

// ========================================
// Initialize Time Range Selector for Topics
// ========================================

function initTopicsTimeRangeSelector() {
    const timeRangeBtns = document.querySelectorAll('.time-range-btn-topics');
    
    timeRangeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            timeRangeBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Get the selected range
            const range = btn.getAttribute('data-range');
            
            // Regenerate chart with new time range
            if (globalTopicsData) {
                generateStackedAreaChart(globalTopicsData, range);
            }
        });
    });
    
    console.log('⏰ Topics time range selector initialized');
}

// ========================================
// Initialize Time Range Selector for Issues
// ========================================

function initIssuesTimeRangeSelector() {
    const timeRangeBtns = document.querySelectorAll('.time-range-btn-issues');
    
    timeRangeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            timeRangeBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Get the selected range
            const range = btn.getAttribute('data-range');
            
            // Regenerate chart with new time range
            if (globalIssuesData) {
                generateIssuesTrendChart(globalIssuesData, range);
            }
        });
    });
    
    console.log('⏰ Issues time range selector initialized');
}

// ========================================
// Load Data from JSON and Display
// ========================================

async function loadDashboardData() {
    try {
        const jsonData = await loadJSONData();
        
        if (jsonData && jsonData.status === 'success') {
            console.log('✅ Loading real data from data.json');
            loadRealKPIData(jsonData);
            loadTopicsData(jsonData);
            generateStackedAreaChart(jsonData);
            generateHorizontalBarChart(jsonData);
            generateIssuesTrendChart(jsonData);
            loadIssuesData(jsonData);
            loadSentimentData(jsonData);
            loadRecommendations(jsonData);
        } else {
            console.warn('⚠️ Using mock data');
            loadMockKPIData();
        }

        // Update last updated timestamp
        const lastUpdatedElement = document.getElementById('lastUpdated');
        if (lastUpdatedElement) {
            const now = new Date();
            lastUpdatedElement.textContent = now.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        loadMockKPIData();
    }
}

// ========================================
// Load Real KPI Data from JSON
// ========================================

function loadRealKPIData(jsonData) {
    // Calculate total mentions
    const totalMentions = jsonData.statistics.reduce((sum, cat) => sum + cat.total_mentions, 0);
    
    // Get total processed items
    const totalProcessed = jsonData.pagination?.total_items || jsonData.total_rows_processed || 5000;
    
    // Get category counts for all categories
    const serviceCount = jsonData.statistics.find(s => s.category === 'service')?.total_mentions || 0;
    const delaysCount = jsonData.statistics.find(s => s.category === 'delays')?.total_mentions || 0;
    const infrastructureCount = jsonData.statistics.find(s => s.category === 'infrastructure')?.total_mentions || 0;
    const userCount = jsonData.statistics.find(s => s.category === 'user')?.total_mentions || 0;
    const hygieneCount = jsonData.statistics.find(s => s.category === 'hygiene')?.total_mentions || 0;
    const comfortCount = jsonData.statistics.find(s => s.category === 'comfort')?.total_mentions || 0;
    const positiveCount = jsonData.statistics.find(s => s.category === 'positive')?.total_mentions || 0;
    const uncategorized = jsonData.statistics.find(s => s.category === 'sin_categoria')?.total_mentions || 0;
    
    // Calculate ACTIVE ISSUES based on severity thresholds
    // Issue is "active" if it exceeds critical thresholds:
    // - Critical (High Priority): > 1000 mentions
    // - Warning (Medium Priority): > 400 mentions  
    // - Active (Low Priority): > 200 mentions
    let activeIssuesCount = 0;
    const issuesBreakdown = [];
    
    // Evaluate all categories dynamically
    const allCategories = [
        { name: 'service', count: serviceCount },
        { name: 'delays', count: delaysCount },
        { name: 'infrastructure', count: infrastructureCount },
        { name: 'user', count: userCount },
        { name: 'hygiene', count: hygieneCount },
        { name: 'comfort', count: comfortCount },
        { name: 'positive', count: positiveCount }
    ];
    
    allCategories.forEach(cat => {
        if (cat.count > 1000) {
            activeIssuesCount++;
            issuesBreakdown.push({ category: cat.name, level: 'CRITICAL', mentions: cat.count });
        } else if (cat.count > 400) {
            activeIssuesCount++;
            issuesBreakdown.push({ category: cat.name, level: 'WARNING', mentions: cat.count });
        } else if (cat.count > 200) {
            activeIssuesCount++;
            issuesBreakdown.push({ category: cat.name, level: 'ACTIVE', mentions: cat.count });
        }
    });
    
    // Consider uncategorized as an issue if it's more than 20% of total
    if (uncategorized > totalProcessed * 0.2) {
        activeIssuesCount++;
        issuesBreakdown.push({ category: 'uncategorized', level: 'WARNING', mentions: uncategorized });
    }
    
    console.log('📊 Active Issues Breakdown:', issuesBreakdown);
    
    // Calculate sentiment (NOW includes positive feedback!)
    // Positive: positive category (actual positive reviews)
    // High Severity (Negative): delays, service (critical operational issues)
    // Medium Severity (Neutral): infrastructure, hygiene (maintenance issues)
    // Low Severity (Minor): comfort, user (convenience issues, user errors)
    const positiveReviews = positiveCount;
    const highSeverityIssues = delaysCount + serviceCount;
    const mediumSeverityIssues = infrastructureCount + hygieneCount;
    const lowSeverityIssues = comfortCount + userCount;
    const totalCategorized = jsonData.statistics.filter(s => s.category !== 'sin_categoria')
        .reduce((sum, s) => sum + s.total_mentions, 0);
    
    // Calculate sentiment percentages (now includes real positive feedback)
    const positivePercent = Math.round((positiveReviews / totalCategorized) * 100);
    const neutralPercent = Math.round((mediumSeverityIssues / totalCategorized) * 100);
    const negativePercent = Math.round((highSeverityIssues / totalCategorized) * 100);
    
    // Sentiment score now represents actual positive vs negative ratio
    const sentimentScore = positivePercent;
    
    // Update KPI cards
    document.querySelector('#kpiTotalFeedback .kpi-value').textContent = 
        totalProcessed.toLocaleString();
    
    document.querySelector('#kpiAvgSentiment .kpi-value').textContent = 
        `${sentimentScore}%`;
    
    document.querySelector('#kpiActiveIssues .kpi-value').textContent = 
        activeIssuesCount;
    
    document.querySelector('#kpiTopTopics .kpi-value').textContent = 
        totalMentions.toLocaleString();

    // Update overview summary with active issues details
    const criticalIssues = issuesBreakdown.filter(i => i.level === 'CRITICAL');
    const warningIssues = issuesBreakdown.filter(i => i.level === 'WARNING');
    
    // Find top category
    const topCategory = allCategories.sort((a, b) => b.count - a.count)[0];
    const topCategoryPercent = Math.round((topCategory.count / totalMentions) * 100);
    
    let issuesSummary = `<strong class="text-negative">${activeIssuesCount} active issue${activeIssuesCount !== 1 ? 's' : ''}</strong> require attention`;
    if (criticalIssues.length > 0) {
        issuesSummary += ` (${criticalIssues.length} critical)`;
    }
    
    const uncategorizedPercent = Math.round((uncategorized / totalProcessed) * 100);
    
    const processingTime = jsonData.processing_time ? jsonData.processing_time.toFixed(4) : '0.00';
    
    document.getElementById('overviewSummary').innerHTML = `
        <p>This analysis covers <strong>${totalProcessed.toLocaleString()} customer feedback entries</strong> processed in ${processingTime} seconds, identifying <strong>${totalMentions.toLocaleString()} categorized mentions</strong> across <strong>7 categories</strong>.</p>
        <p>The most critical issue is <strong class="text-negative">${topCategory.name} with ${topCategory.count.toLocaleString()} mentions (${topCategoryPercent}%)</strong>, representing the primary concern for ÖBB customers. <strong class="text-positive">${positiveCount.toLocaleString()} positive reviews (${Math.round((positiveCount/totalMentions)*100)}%)</strong> highlight areas of excellence.</p>
        <p>${issuesSummary}, primarily related to ${issuesBreakdown.slice(0, 3).map(i => i.category).join(', ')}. ${uncategorized > 0 ? `<strong class="text-warning">${uncategorized.toLocaleString()} feedback entries (${uncategorizedPercent}%)</strong> remain uncategorized.` : ''}</p>
    `;
}

// ========================================
// Load Topics Data
// ========================================

function loadTopicsData(jsonData) {
    const topicsContainer = document.getElementById('topicsContainer');
    
    // Filter out 'sin_categoria' and sort by mentions
    const categorizedStats = jsonData.statistics
        .filter(s => s.category !== 'sin_categoria')
        .sort((a, b) => b.total_mentions - a.total_mentions);
    
    // Calculate total for percentages
    const totalCategorized = categorizedStats.reduce((sum, s) => sum + s.total_mentions, 0);
    
    // Clear container
    topicsContainer.innerHTML = '';
    
    // Create topic cards
    categorizedStats.forEach(stat => {
        const percentage = ((stat.total_mentions / totalCategorized) * 100).toFixed(1);
        const categoryName = stat.category.charAt(0).toUpperCase() + stat.category.slice(1);
        
        // Assign colors based on category type and severity
        let colorClass = 'text-neutral';
        
        // Color coding logic:
        // CRITICAL (Red): delays, service - Core operational issues affecting customer satisfaction
        // WARNING (Orange): infrastructure, hygiene - Maintenance and facility issues
        // INFO (Blue): comfort, user - User experience and personal items
        // POSITIVE (Green): positive - Positive feedback
        
        switch(stat.category) {
            case 'delays':
                colorClass = 'text-negative'; // Red - Critical operational issue
                break;
            case 'service':
                colorClass = 'text-negative'; // Red - Critical customer service issue
                break;
            case 'infrastructure':
                colorClass = 'text-warning'; // Orange - Important maintenance issue
                break;
            case 'hygiene':
                colorClass = 'text-warning'; // Orange - Important cleanliness issue
                break;
            case 'comfort':
                colorClass = 'text-info'; // Blue - User experience issue
                break;
            case 'user':
                colorClass = 'text-info'; // Blue - User-related issue
                break;
            case 'positive':
                colorClass = 'text-positive'; // Green - Positive feedback
                break;
            default:
                colorClass = 'text-neutral';
        }
        
        const card = document.createElement('div');
        card.className = 'insight-card topic-stat-card';
        card.innerHTML = `
            <h4 class="card-subtitle">${categoryName}</h4>
            <p class="sentiment-percentage ${colorClass}" style="font-size: 2rem; margin: 0.5rem 0; font-weight: 700;">
                ${stat.total_mentions.toLocaleString()}
            </p>
            <p style="color: var(--dark-gray); font-size: 0.875rem;">
                ${percentage}% of categorized feedback
            </p>
        `;
        topicsContainer.appendChild(card);
    });
}

// ========================================
// Helper: Translate Spanish subjects to English
// ========================================

function translateSubject(subject) {
    const translations = {
        // Service issues
        'trato poco amable por parte del personal de control': 'unfriendly treatment by control staff',
        'dudas sobre la tarjeta de descuento': 'questions about discount card',
        'problemas con billete para perro': 'problems with pet ticket',
        'problemas al comprar el billete online': 'problems buying ticket online',
        'información poco clara del servicio de objetos perdidos': 'unclear information from lost and found service',
        'una propuesta para mejorar la plataforma de venta de billetes': 'proposal to improve ticket sales platform',
        'información contradictoria entre web y app': 'contradictory information between web and app',
        'dudas sobre viajes escolares': 'questions about school trips',
        'una duda sobre reembolso del billete': 'question about ticket refund',
        'la zona reservada para silla de ruedas estaba ocupada': 'wheelchair reserved area was occupied',
        
        // Delays issues
        'una sugerencia para mejorar la información sobre retrasos': 'suggestion to improve delay information',
        'un retraso causado por problemas técnicos en el tren': 'delay caused by technical problems',
        'un retraso debido al embarque lento por exceso de pasajeros': 'delay due to slow boarding from excess passengers',
        'un retraso causado por una avería en la vía': 'delay caused by track failure',
        'un retraso de más de 30 minutos pese a que se había informado puntualidad': 'delay of more than 30 minutes despite punctuality notification',
        'información contradictoria sobre el retraso': 'contradictory information about delay',
        'una duda sobre compensación por retraso': 'question about delay compensation',
        
        // Infrastructure issues
        'calefacción averiada': 'broken heating system',
        'las guías táctiles estaban dañadas': 'tactile guides were damaged',
        'una sugerencia para añadir más espacios para bicicletas': 'suggestion to add more bicycle spaces',
        'una escalera mecánica de la estación averiada': 'broken station escalator',
        'normas de transporte de bicicletas poco claras': 'unclear bicycle transport rules',
        'baños sucios o averiados': 'dirty or broken bathrooms',
        
        // Hygiene issues
        'ventanas sucias': 'dirty windows',
        'zonas resbaladizas en el andén': 'slippery areas on platform',
        'papeleras sin vaciar': 'unemptied trash bins',
        
        // Comfort issues
        'un asiento reservado ocupado por otra persona': 'reserved seat occupied by another person',
        'aire acondicionado funcionando solo en algunos vagones': 'air conditioning working only in some cars',
        
        // Usuario issues
        'haber perdido una cartera': 'lost wallet',
        'haber perdido un cochecito infantil': 'lost baby stroller',
        
        // Uncategorized
        'la rampa para silla de ruedas no estaba disponible': 'wheelchair ramp not available',
        'la cancelación del tren por condiciones meteorológicas': 'train cancellation due to weather conditions',
        'el botón de emergencia no funcionaba': 'emergency button not working',
        'una propuesta para mejorar la accesibilidad': 'proposal to improve accessibility',
        'falta de ayuda para personas con movilidad reducida': 'lack of assistance for people with reduced mobility',
        'falta de anuncios en la estación': 'lack of announcements at station',
        'la altura del tren hacía difícil subir sin ayuda': 'train height made boarding difficult without help',
        'señalización confusa': 'confusing signage',
        'una solicitud de compensación rechazada': 'compensation request rejected',
        'confusión sobre zonas tarifarias': 'confusion about fare zones'
    };
    
    return translations[subject] || subject;
}

// ========================================
// Load Issues Data
// ========================================

function loadIssuesData(jsonData) {
    const issuesContainer = document.getElementById('issuesContainer');
    
    // Use statistics data for real mention counts
    // Sort categories by total mentions and exclude uncategorized
    const sortedCategories = jsonData.statistics
        .filter(stat => stat.category !== 'sin_categoria')
        .sort((a, b) => b.total_mentions - a.total_mentions)
        .slice(0, 6); // Get top 6 categories
    
    // Clear container
    issuesContainer.innerHTML = '';
    
    // Create issue cards based on real category statistics
    sortedCategories.forEach((stat, index) => {
        // Determine severity based on mention count thresholds
        let severity = 'Medium';
        let severityColor = 'background-color: var(--warning);';
        
        if (stat.total_mentions > 1000) {
            severity = 'Critical';
            severityColor = 'background-color: var(--negative);';
        } else if (stat.total_mentions > 600) {
            severity = 'High';
            severityColor = 'background-color: var(--negative);';
        } else if (stat.total_mentions > 400) {
            severity = 'Medium';
            severityColor = 'background-color: var(--warning);';
        } else {
            severity = 'Low';
            severityColor = 'background-color: var(--neutral);';
        }
        
        // Get sample subjects from this category and translate them
        const categorySamples = jsonData.data
            .filter(item => item.detected_categories.includes(stat.category))
            .slice(0, 3)
            .map(item => translateSubject(item.subject));
        
        // Format category name
        const categoryName = stat.category.charAt(0).toUpperCase() + stat.category.slice(1);
        
        // Create description with examples
        let description = `${stat.total_mentions.toLocaleString()} mentions detected across all feedback.`;
        if (categorySamples.length > 0) {
            description += ` Common issues: ${categorySamples.slice(0, 2).join(', ')}.`;
        }
        
        const card = document.createElement('div');
        card.className = 'insight-card issue-card';
        card.innerHTML = `
            <div class="issue-severity">
                <span class="severity-badge" style="${severityColor} color: white;">
                    ${severity}
                </span>
            </div>
            <h3 class="card-title" style="text-transform: capitalize;">${categoryName} Issues</h3>
            <p class="card-content" style="font-size: 0.875rem; color: var(--dark-gray);">
                ${description}
            </p>
            <div class="issue-meta">
                <span class="issue-count">${stat.total_mentions.toLocaleString()} mentions</span>
                <span class="issue-trend" style="color: var(--negative);">↑ ${Math.round((stat.total_mentions / jsonData.statistics.reduce((sum, s) => sum + s.total_mentions, 0)) * 100)}% of total</span>
            </div>
        `;
        issuesContainer.appendChild(card);
    });
}

// ========================================
// Load Sentiment Data
// ========================================

function loadSentimentData(jsonData) {
    // Generate Doughnut Chart for category distribution
    generateDoughnutChart(jsonData);
    
    // Generate temporal chart showing category trends over time
    generateSentimentTimelineChart(jsonData);
}

// ========================================
// Generate Doughnut Chart for Category Distribution
// ========================================

function generateDoughnutChart(jsonData) {
    // Count total mentions for each category across all entries
    const categoryCounts = {
        service: 0,
        delays: 0,
        infrastructure: 0,
        user: 0,
        hygiene: 0,
        comfort: 0,
        positive: 0
    };
    
    // Count categories from detected_categories in data entries
    jsonData.data.forEach(entry => {
        if (entry.detected_categories && Array.isArray(entry.detected_categories)) {
            entry.detected_categories.forEach(category => {
                if (categoryCounts[category] !== undefined) {
                    categoryCounts[category]++;
                }
            });
        }
    });
    
    // Prepare data for doughnut chart
    const labels = ['Service', 'Delays', 'Infrastructure', 'User', 'Hygiene', 'Comfort', 'Positive'];
    const data = [
        categoryCounts.service,
        categoryCounts.delays,
        categoryCounts.infrastructure,
        categoryCounts.user,
        categoryCounts.hygiene,
        categoryCounts.comfort,
        categoryCounts.positive
    ];
    
    const colors = [
        '#FF6B6B',  // Service - Red
        '#FFA07A',  // Delays - Orange
        '#FFD93D',  // Infrastructure - Yellow
        '#A8E6CF',  // User - Green
        '#87CEEB',  // Hygiene - Sky Blue
        '#DDA0DD',  // Comfort - Plum
        '#90EE90'   // Positive - Light Green
    ];
    
    // Destroy existing chart if it exists
    const existingChart = Chart.getChart('doughnutCanvas');
    if (existingChart) {
        existingChart.destroy();
    }
    
    // Create doughnut chart
    const ctx = document.getElementById('doughnutCanvas').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Category Distribution',
                data: data,
                backgroundColor: colors,
                borderColor: '#ffffff',
                borderWidth: 3,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 13,
                            family: 'Inter, sans-serif'
                        },
                        generateLabels: function(chart) {
                            const data = chart.data;
                            const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                            
                            return data.labels.map((label, i) => {
                                const value = data.datasets[0].data[i];
                                const percentage = ((value / total) * 100).toFixed(1);
                                
                                return {
                                    text: `${label}: ${value} (${percentage}%)`,
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    hidden: false,
                                    index: i
                                };
                            });
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} reports (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // Update the category count table
    updateCategoryTable(categoryCounts, data.reduce((a, b) => a + b, 0));
    
    console.log('🍩 Doughnut chart generated:', {
        totalCategories: labels.length,
        totalReports: data.reduce((a, b) => a + b, 0),
        distribution: categoryCounts
    });
}

// ========================================
// Update Category Table with Counts
// ========================================

function updateCategoryTable(categoryCounts, totalReports) {
    // Calculate percentages and update table cells
    const categories = ['service', 'delays', 'infrastructure', 'user', 'hygiene', 'comfort', 'positive'];
    
    categories.forEach(category => {
        const countElement = document.getElementById(`count-${category}`);
        if (countElement) {
            const count = categoryCounts[category] || 0;
            const percentage = totalReports > 0 ? ((count / totalReports) * 100).toFixed(1) : '0.0';
            countElement.textContent = `${count} (${percentage}%)`;
        }
    });
    
    console.log('📊 Category table updated with counts');
}

// ========================================
// Generate Sentiment Timeline Chart
// ========================================

// Global variable to store the original data for filtering
let globalSentimentData = null;

function generateSentimentTimelineChart(jsonData, timeRange = 'all') {
    // Store data globally on first call
    if (!globalSentimentData) {
        globalSentimentData = jsonData;
    }
    
    // Find the most recent date in the dataset to use as reference
    let maxDate = null;
    jsonData.data.forEach(entry => {
        if (entry.date) {
            const entryDate = new Date(entry.date);
            if (!maxDate || entryDate > maxDate) {
                maxDate = entryDate;
            }
        }
    });
    
    // If no dates found, use current date
    const referenceDate = maxDate || new Date();
    
    // Calculate date cutoff based on time range
    let cutoffDate = null;
    
    switch(timeRange) {
        case 'month':
            cutoffDate = new Date(referenceDate);
            cutoffDate.setMonth(cutoffDate.getMonth() - 1);
            break;
        case 'quarter':
            cutoffDate = new Date(referenceDate);
            cutoffDate.setMonth(cutoffDate.getMonth() - 3);
            break;
        case '6months':
            cutoffDate = new Date(referenceDate);
            cutoffDate.setMonth(cutoffDate.getMonth() - 6);
            break;
        case 'year':
            cutoffDate = new Date(referenceDate);
            cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
            break;
        case 'all':
        default:
            cutoffDate = null; // No filtering
            break;
    }
    
    // Process data to group by month and category
    const monthlyData = {};
    let filteredCount = 0;
    let totalCount = 0;
    
    jsonData.data.forEach(entry => {
        totalCount++;
        if (!entry.date || !entry.detected_categories) return;
        
        // Apply date filter if needed
        if (cutoffDate) {
            const entryDate = new Date(entry.date);
            if (entryDate < cutoffDate) return;
        }
        
        filteredCount++;
        
        // Extract year-month (YYYY-MM) for grouping
        const monthKey = entry.date.substring(0, 7); // "2023-01", "2024-05", etc.
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
                service: 0,
                delays: 0,
                infrastructure: 0,
                user: 0,
                hygiene: 0,
                comfort: 0,
                positive: 0
            };
        }
        
        // Count each category for this entry
        entry.detected_categories.forEach(category => {
            if (monthlyData[monthKey][category] !== undefined) {
                monthlyData[monthKey][category]++;
            }
        });
    });
    
    // Sort months chronologically
    const sortedMonths = Object.keys(monthlyData).sort();
    
    // If no data after filtering, show message
    if (sortedMonths.length === 0) {
        const ctx = document.getElementById('sentimentCanvas').getContext('2d');
        const existingChart = Chart.getChart('sentimentCanvas');
        if (existingChart) {
            existingChart.destroy();
        }
        
        // Draw "No data" message on canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.font = '16px Inter, sans-serif';
        ctx.fillStyle = '#666';
        ctx.textAlign = 'center';
        ctx.fillText('No data available for this time range', ctx.canvas.width / 2, ctx.canvas.height / 2);
        
        console.log('⚠️ No data for time range:', timeRange);
        return;
    }
    
    // Use smooth curves for all time ranges to show dynamic data visualization
    const lineTension = 0.4;
    
    // Use all available data points without artificial extension
    let displayMonths = sortedMonths;
    let extendedData = false;
    
    console.log(`📈 Using line tension: ${lineTension} for time range: ${timeRange} with ${displayMonths.length} data points`);
    
    // Helper function to map category data
    const mapCategoryData = (category) => {
        return sortedMonths.map(month => monthlyData[month][category]);
    };
    
    // Prepare datasets for each category
    const datasets = [
        {
            label: 'Service',
            data: mapCategoryData('service'),
            borderColor: '#FF6B6B',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            borderWidth: 2,
            tension: lineTension,
            spanGaps: true
        },
        {
            label: 'Delays',
            data: mapCategoryData('delays'),
            borderColor: '#FFA07A',
            backgroundColor: 'rgba(255, 160, 122, 0.1)',
            borderWidth: 2,
            tension: lineTension,
            spanGaps: true
        },
        {
            label: 'Infrastructure',
            data: mapCategoryData('infrastructure'),
            borderColor: '#FFD93D',
            backgroundColor: 'rgba(255, 217, 61, 0.1)',
            borderWidth: 2,
            tension: lineTension,
            spanGaps: true
        },
        {
            label: 'User',
            data: mapCategoryData('user'),
            borderColor: '#A8E6CF',
            backgroundColor: 'rgba(168, 230, 207, 0.1)',
            borderWidth: 2,
            tension: lineTension,
            spanGaps: true
        },
        {
            label: 'Hygiene',
            data: mapCategoryData('hygiene'),
            borderColor: '#87CEEB',
            backgroundColor: 'rgba(135, 206, 235, 0.1)',
            borderWidth: 2,
            tension: lineTension,
            spanGaps: true
        },
        {
            label: 'Comfort',
            data: mapCategoryData('comfort'),
            borderColor: '#DDA0DD',
            backgroundColor: 'rgba(221, 160, 221, 0.1)',
            borderWidth: 2,
            tension: lineTension,
            spanGaps: true
        },
        {
            label: 'Positive',
            data: mapCategoryData('positive'),
            borderColor: '#90EE90',
            backgroundColor: 'rgba(144, 238, 144, 0.1)',
            borderWidth: 2,
            tension: lineTension,
            spanGaps: true
        }
    ];
    
    // Format month labels (MMM YYYY)
    const labels = displayMonths.map(month => {
        const [year, monthNum] = month.split('-');
        const date = new Date(year, parseInt(monthNum) - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });
    
    // Destroy existing chart if it exists
    const existingChart = Chart.getChart('sentimentCanvas');
    if (existingChart) {
        existingChart.destroy();
    }
    
    // Create new chart
    const ctx = document.getElementById('sentimentCanvas').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                title: {
                    display: false
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 12,
                            family: "'Inter', sans-serif"
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y} feedbacks`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 11
                        },
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    console.log('📊 Sentiment timeline chart generated:', {
        timeRange: timeRange,
        referenceDate: referenceDate ? referenceDate.toISOString().split('T')[0] : 'N/A',
        cutoffDate: cutoffDate ? cutoffDate.toISOString().split('T')[0] : 'none',
        months: sortedMonths.length,
        dateRange: sortedMonths.length > 0 ? `${sortedMonths[0]} to ${sortedMonths[sortedMonths.length - 1]}` : 'N/A',
        filteredEntries: filteredCount,
        totalEntries: totalCount,
        dataPoints: sortedMonths.length * 7
    });
}

// ========================================
// Generate Stacked Area Chart for Topic Evolution
// ========================================

// Global variable to store the original data for filtering
let globalTopicsData = null;

function generateStackedAreaChart(jsonData, timeRange = 'all') {
    // Store data globally on first call
    if (!globalTopicsData) {
        globalTopicsData = jsonData;
    }
    
    // Find the most recent date in the dataset to use as reference
    let maxDate = null;
    jsonData.data.forEach(entry => {
        if (entry.date) {
            const entryDate = new Date(entry.date);
            if (!maxDate || entryDate > maxDate) {
                maxDate = entryDate;
            }
        }
    });
    
    // If no dates found, use current date
    const referenceDate = maxDate || new Date();
    
    // Calculate date cutoff based on time range
    let cutoffDate = null;
    
    switch(timeRange) {
        case 'month':
            cutoffDate = new Date(referenceDate);
            cutoffDate.setMonth(cutoffDate.getMonth() - 1);
            break;
        case 'quarter':
            cutoffDate = new Date(referenceDate);
            cutoffDate.setMonth(cutoffDate.getMonth() - 3);
            break;
        case '6months':
            cutoffDate = new Date(referenceDate);
            cutoffDate.setMonth(cutoffDate.getMonth() - 6);
            break;
        case 'year':
            cutoffDate = new Date(referenceDate);
            cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
            break;
        case 'all':
        default:
            cutoffDate = null; // No filtering
            break;
    }
    
    // Process data to group by month and category
    const monthlyData = {};
    let filteredCount = 0;
    let totalCount = 0;
    
    jsonData.data.forEach(entry => {
        totalCount++;
        if (!entry.date || !entry.detected_categories) return;
        
        // Apply date filter if needed
        if (cutoffDate) {
            const entryDate = new Date(entry.date);
            if (entryDate < cutoffDate) return;
        }
        
        filteredCount++;
        
        // Extract year-month (YYYY-MM) for grouping
        const monthKey = entry.date.substring(0, 7); // "2023-01", "2024-05", etc.
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
                service: 0,
                delays: 0,
                infrastructure: 0,
                user: 0,
                hygiene: 0,
                comfort: 0,
                positive: 0
            };
        }
        
        // Count each category for this entry
        entry.detected_categories.forEach(category => {
            if (monthlyData[monthKey][category] !== undefined) {
                monthlyData[monthKey][category]++;
            }
        });
    });
    
    // Sort months chronologically
    const sortedMonths = Object.keys(monthlyData).sort();
    
    // Format month labels (MMM YYYY)
    const labels = sortedMonths.map(month => {
        const [year, monthNum] = month.split('-');
        const date = new Date(year, parseInt(monthNum) - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });
    
    // Prepare datasets for stacked area chart
    const datasets = [
        {
            label: 'Service',
            data: sortedMonths.map(month => monthlyData[month].service),
            backgroundColor: 'rgba(255, 107, 107, 0.6)',
            borderColor: '#FF6B6B',
            borderWidth: 1,
            fill: true
        },
        {
            label: 'Delays',
            data: sortedMonths.map(month => monthlyData[month].delays),
            backgroundColor: 'rgba(255, 160, 122, 0.6)',
            borderColor: '#FFA07A',
            borderWidth: 1,
            fill: true
        },
        {
            label: 'Infrastructure',
            data: sortedMonths.map(month => monthlyData[month].infrastructure),
            backgroundColor: 'rgba(255, 217, 61, 0.6)',
            borderColor: '#FFD93D',
            borderWidth: 1,
            fill: true
        },
        {
            label: 'User',
            data: sortedMonths.map(month => monthlyData[month].user),
            backgroundColor: 'rgba(168, 230, 207, 0.6)',
            borderColor: '#A8E6CF',
            borderWidth: 1,
            fill: true
        },
        {
            label: 'Hygiene',
            data: sortedMonths.map(month => monthlyData[month].hygiene),
            backgroundColor: 'rgba(135, 206, 235, 0.6)',
            borderColor: '#87CEEB',
            borderWidth: 1,
            fill: true
        },
        {
            label: 'Comfort',
            data: sortedMonths.map(month => monthlyData[month].comfort),
            backgroundColor: 'rgba(221, 160, 221, 0.6)',
            borderColor: '#DDA0DD',
            borderWidth: 1,
            fill: true
        },
        {
            label: 'Positive',
            data: sortedMonths.map(month => monthlyData[month].positive),
            backgroundColor: 'rgba(144, 238, 144, 0.6)',
            borderColor: '#90EE90',
            borderWidth: 1,
            fill: true
        }
    ];
    
    // Destroy existing chart if it exists
    const existingChart = Chart.getChart('stackedAreaCanvas');
    if (existingChart) {
        existingChart.destroy();
    }
    
    // Create stacked area chart
    const ctx = document.getElementById('stackedAreaCanvas').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                title: {
                    display: false
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 12,
                            family: "'Inter', sans-serif"
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y} reports`;
                        },
                        footer: function(tooltipItems) {
                            let sum = 0;
                            tooltipItems.forEach(item => {
                                sum += item.parsed.y;
                            });
                            return `Total: ${sum} reports`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        font: {
                            size: 11
                        },
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: {
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
    
    console.log('📊 Stacked area chart generated:', {
        timeRange: timeRange,
        referenceDate: referenceDate ? referenceDate.toISOString().split('T')[0] : 'N/A',
        cutoffDate: cutoffDate ? cutoffDate.toISOString().split('T')[0] : 'none',
        months: sortedMonths.length,
        dateRange: sortedMonths.length > 0 ? `${sortedMonths[0]} to ${sortedMonths[sortedMonths.length - 1]}` : 'N/A',
        filteredEntries: filteredCount,
        totalEntries: totalCount,
        categories: 7
    });
}

// ========================================
// Generate Horizontal Bar Chart for Top Topics
// ========================================

function generateHorizontalBarChart(jsonData) {
    // Count total mentions for each category
    const categoryCounts = {
        service: 0,
        delays: 0,
        infrastructure: 0,
        user: 0,
        hygiene: 0,
        comfort: 0,
        positive: 0
    };
    
    // Count categories from detected_categories in data entries
    jsonData.data.forEach(entry => {
        if (entry.detected_categories && Array.isArray(entry.detected_categories)) {
            entry.detected_categories.forEach(category => {
                if (categoryCounts[category] !== undefined) {
                    categoryCounts[category]++;
                }
            });
        }
    });
    
    // Sort categories by count (descending)
    const sortedCategories = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1]);
    
    // Prepare data for horizontal bar chart
    const labels = sortedCategories.map(([category]) => 
        category.charAt(0).toUpperCase() + category.slice(1)
    );
    
    const data = sortedCategories.map(([, count]) => count);
    
    const colors = sortedCategories.map(([category]) => {
        const colorMap = {
            service: '#FF6B6B',
            delays: '#FFA07A',
            infrastructure: '#FFD93D',
            user: '#A8E6CF',
            hygiene: '#87CEEB',
            comfort: '#DDA0DD',
            positive: '#90EE90'
        };
        return colorMap[category];
    });
    
    // Calculate total for percentages
    const total = data.reduce((sum, val) => sum + val, 0);
    
    // Destroy existing chart if it exists
    const existingChart = Chart.getChart('horizontalBarCanvas');
    if (existingChart) {
        existingChart.destroy();
    }
    
    // Create horizontal bar chart
    const ctx = document.getElementById('horizontalBarCanvas').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Reports',
                data: data,
                backgroundColor: colors,
                borderColor: colors.map(color => color),
                borderWidth: 2,
                barThickness: 40
            }]
        },
        options: {
            indexAxis: 'y', // This makes it horizontal
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.x;
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${value.toLocaleString()} reports (${percentage}%)`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    ticks: {
                        font: {
                            size: 13,
                            weight: '600'
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    console.log('📊 Horizontal bar chart generated:', {
        categories: labels.length,
        totalReports: total,
        topCategory: `${labels[0]}: ${data[0]} reports`
    });
}

// ========================================
// Generate Issues Trend Line Chart
// ========================================

// Global variable to store the original data for filtering
let globalIssuesData = null;

function generateIssuesTrendChart(jsonData, timeRange = 'all') {
    // Store data globally on first call
    if (!globalIssuesData) {
        globalIssuesData = jsonData;
    }
    
    // Find the most recent date in the dataset to use as reference
    let maxDate = null;
    jsonData.data.forEach(entry => {
        if (entry.date) {
            const entryDate = new Date(entry.date);
            if (!maxDate || entryDate > maxDate) {
                maxDate = entryDate;
            }
        }
    });
    
    // If no dates found, use current date
    const referenceDate = maxDate || new Date();
    
    // Calculate date cutoff based on time range
    let cutoffDate = null;
    
    switch(timeRange) {
        case 'month':
            cutoffDate = new Date(referenceDate);
            cutoffDate.setMonth(cutoffDate.getMonth() - 1);
            break;
        case 'quarter':
            cutoffDate = new Date(referenceDate);
            cutoffDate.setMonth(cutoffDate.getMonth() - 3);
            break;
        case '6months':
            cutoffDate = new Date(referenceDate);
            cutoffDate.setMonth(cutoffDate.getMonth() - 6);
            break;
        case 'year':
            cutoffDate = new Date(referenceDate);
            cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
            break;
        case 'all':
        default:
            cutoffDate = null; // No filtering
            break;
    }
    
    // Process data to group by month and category (excluding positive)
    const monthlyData = {};
    let filteredCount = 0;
    let totalCount = 0;
    
    jsonData.data.forEach(entry => {
        totalCount++;
        if (!entry.date || !entry.detected_categories) return;
        
        // Apply date filter if needed
        if (cutoffDate) {
            const entryDate = new Date(entry.date);
            if (entryDate < cutoffDate) return;
        }
        
        filteredCount++;
        
        // Extract year-month (YYYY-MM) for grouping
        const monthKey = entry.date.substring(0, 7);
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
                service: 0,
                delays: 0,
                infrastructure: 0,
                user: 0,
                hygiene: 0,
                comfort: 0
            };
        }
        
        // Count each category for this entry (excluding positive)
        entry.detected_categories.forEach(category => {
            if (monthlyData[monthKey][category] !== undefined) {
                monthlyData[monthKey][category]++;
            }
        });
    });
    
    // Sort months chronologically
    const sortedMonths = Object.keys(monthlyData).sort();
    
    // Format month labels (MMM YYYY)
    const labels = sortedMonths.map(month => {
        const [year, monthNum] = month.split('-');
        const date = new Date(year, parseInt(monthNum) - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });
    
    // Calculate trends (comparing last 3 months vs previous 3 months)
    const calculateTrend = (category) => {
        if (sortedMonths.length < 6) return 0;
        
        const recentMonths = sortedMonths.slice(-3);
        const previousMonths = sortedMonths.slice(-6, -3);
        
        const recentTotal = recentMonths.reduce((sum, month) => sum + monthlyData[month][category], 0);
        const previousTotal = previousMonths.reduce((sum, month) => sum + monthlyData[month][category], 0);
        
        if (previousTotal === 0) return 0;
        return ((recentTotal - previousTotal) / previousTotal) * 100;
    };
    
    // Prepare datasets for each category
    const datasets = [
        {
            label: 'Service Issues',
            data: sortedMonths.map(month => monthlyData[month].service),
            borderColor: '#FF6B6B',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            trend: calculateTrend('service')
        },
        {
            label: 'Delays Issues',
            data: sortedMonths.map(month => monthlyData[month].delays),
            borderColor: '#FFA07A',
            backgroundColor: 'rgba(255, 160, 122, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            trend: calculateTrend('delays')
        },
        {
            label: 'Infrastructure Issues',
            data: sortedMonths.map(month => monthlyData[month].infrastructure),
            borderColor: '#FFD93D',
            backgroundColor: 'rgba(255, 217, 61, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            trend: calculateTrend('infrastructure')
        },
        {
            label: 'User Issues',
            data: sortedMonths.map(month => monthlyData[month].user),
            borderColor: '#A8E6CF',
            backgroundColor: 'rgba(168, 230, 207, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            trend: calculateTrend('user')
        },
        {
            label: 'Hygiene Issues',
            data: sortedMonths.map(month => monthlyData[month].hygiene),
            borderColor: '#87CEEB',
            backgroundColor: 'rgba(135, 206, 235, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            trend: calculateTrend('hygiene')
        },
        {
            label: 'Comfort Issues',
            data: sortedMonths.map(month => monthlyData[month].comfort),
            borderColor: '#DDA0DD',
            backgroundColor: 'rgba(221, 160, 221, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            trend: calculateTrend('comfort')
        }
    ];
    
    // Sort datasets by trend (descending - most growing first)
    datasets.sort((a, b) => b.trend - a.trend);
    
    // Destroy existing chart if it exists
    const existingChart = Chart.getChart('issuesTrendCanvas');
    if (existingChart) {
        existingChart.destroy();
    }
    
    // Create line chart
    const ctx = document.getElementById('issuesTrendCanvas').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                title: {
                    display: false
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 12,
                            family: "'Inter', sans-serif",
                            weight: '500'
                        },
                        generateLabels: function(chart) {
                            const original = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                            return original.map((label, i) => {
                                const dataset = chart.data.datasets[i];
                                const trend = dataset.trend;
                                const arrow = trend > 0 ? ' ↑' : trend < 0 ? ' ↓' : ' →';
                                const trendPercent = Math.abs(trend).toFixed(0);
                                
                                return {
                                    ...label,
                                    text: `${label.text}${arrow} (${trend > 0 ? '+' : trend < 0 ? '-' : ''}${trendPercent}%)`
                                };
                            });
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y} mentions`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    title: {
                        display: true,
                        text: 'Number of Mentions',
                        font: {
                            size: 12,
                            weight: '600'
                        }
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 11
                        },
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Time Period',
                        font: {
                            size: 12,
                            weight: '600'
                        }
                    }
                }
            }
        }
    });
    
    // Log trends for debugging
    const trendsLog = datasets.map(d => ({
        category: d.label,
        trend: `${d.trend > 0 ? '+' : ''}${d.trend.toFixed(1)}%`
    }));
    
    console.log('📈 Issues trend chart generated:', {
        timeRange: timeRange,
        referenceDate: referenceDate ? referenceDate.toISOString().split('T')[0] : 'N/A',
        cutoffDate: cutoffDate ? cutoffDate.toISOString().split('T')[0] : 'none',
        months: sortedMonths.length,
        dateRange: sortedMonths.length > 0 ? `${sortedMonths[0]} to ${sortedMonths[sortedMonths.length - 1]}` : 'N/A',
        filteredEntries: filteredCount,
        totalEntries: totalCount,
        categories: datasets.length,
        trends: trendsLog
    });
}

// ========================================
// Load Mock KPI Data (Fallback)
// ========================================

function loadMockKPIData() {
    // Update KPI cards with mock data
    document.querySelector('#kpiTotalFeedback .kpi-value').textContent = '5,000';
    document.querySelector('#kpiAvgSentiment .kpi-value').textContent = '68%';
    document.querySelector('#kpiActiveIssues .kpi-value').textContent = '4';
    document.querySelector('#kpiTopTopics .kpi-value').textContent = '5,370';

    // Update overview summary
    document.getElementById('overviewSummary').innerHTML = `
        <p>This week's analysis covers <strong>5,000 customer feedback entries</strong> from multiple sources.</p>
        <p>Overall sentiment shows <strong class="text-warning">mixed feedback at 68%</strong>, with notable concerns in service delivery.</p>
        <p><strong class="text-warning">4 active categories</strong> require attention, primarily related to delays and comfort.</p>
    `;

    // Update sentiment percentages
    document.querySelector('#sentimentPositive .sentiment-percentage').textContent = '68%';
    document.querySelector('#sentimentNeutral .sentiment-percentage').textContent = '19%';
    document.querySelector('#sentimentNegative .sentiment-percentage').textContent = '13%';
}

// ========================================
// Load Recommendations Data
// ========================================

function loadRecommendations(jsonData) {
    const recommendationsList = document.getElementById('recommendationsList');
    
    // Generate recommendations based on the statistics
    const recommendations = [];
    
    // Analyze each category and generate recommendations
    jsonData.statistics.forEach(stat => {
        if (stat.category === 'service' && stat.total_mentions > 1000) {
            recommendations.push({
                priority: 'HIGH',
                category: 'Customer Service',
                title: 'Enhance Digital Customer Service Platforms',
                description: `With ${stat.total_mentions.toLocaleString()} service-related issues (${Math.round((stat.total_mentions / jsonData.statistics.reduce((sum, s) => sum + s.total_mentions, 0)) * 100)}% of all feedback), investing in AI-powered chatbots, improved mobile app functionality, and 24/7 customer support could significantly reduce service complaints.`,
                impact: 'High - Could improve customer satisfaction by 35%'
            });
        }
        
        if (stat.category === 'delays' && stat.total_mentions > 400) {
            recommendations.push({
                priority: 'HIGH',
                category: 'Operations',
                title: 'Implement Real-Time Delay Communication System',
                description: `With ${stat.total_mentions.toLocaleString()} delay-related complaints, implementing a proactive real-time notification system could significantly improve customer satisfaction. Consider SMS alerts and in-app notifications 10+ minutes before scheduled departure.`,
                impact: 'High - Could reduce delay complaints by 40%'
            });
        }
        
        if (stat.category === 'infrastructure' && stat.total_mentions > 400) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'Infrastructure',
                title: 'Station & Track Infrastructure Modernization',
                description: `${stat.total_mentions} infrastructure concerns reported. Prioritize escalator/elevator repairs, improve accessibility features, bicycle parking expansion, and modernize station facilities on high-traffic routes.`,
                impact: 'Medium - Long-term reliability and accessibility improvement'
            });
        }
        
        if (stat.category === 'user' && stat.total_mentions > 200) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'Lost & Found',
                title: 'Improve Lost & Found Services',
                description: `${stat.total_mentions} user-related issues (primarily lost items) reported. Enhance the lost and found system with real-time tracking, digital inventory, and faster response times. Consider implementing QR code tagging system for found items.`,
                impact: 'Medium - Better user experience and trust'
            });
        }
        
        if (stat.category === 'positive' && stat.total_mentions > 100) {
            recommendations.push({
                priority: 'LOW',
                category: 'Best Practices',
                title: 'Scale Successful Service Elements',
                description: `${stat.total_mentions} positive reviews received! Analyze what's working well (staff friendliness, punctuality on certain routes, clean facilities) and replicate these practices across all services. Use positive feedback in training programs.`,
                impact: 'Low - Reinforce strengths, boost team morale'
            });
        }
        
        if (stat.category === 'hygiene' && stat.total_mentions > 200) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'Cleanliness',
                title: 'Enhanced Hygiene & Cleaning Protocols',
                description: `${stat.total_mentions} hygiene complaints detected. Implement more frequent cleaning schedules, real-time bathroom monitoring systems, and dedicated cleaning staff during peak hours. Focus on high-touch surfaces and sanitary facilities.`,
                impact: 'Medium - Improves health perception and comfort'
            });
        }
        
        if (stat.category === 'comfort' && stat.total_mentions > 200) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'Customer Experience',
                title: 'Enhance In-Train Comfort Standards',
                description: `${stat.total_mentions} comfort-related issues reported. Focus on improving air conditioning systems, seat cleanliness protocols, and adequate seating during peak hours. Implement daily comfort checks before peak travel times.`,
                impact: 'Medium - Improves customer satisfaction by 15%'
            });
        }
    });
    
    // Check for uncategorized feedback
    const uncategorized = jsonData.statistics.find(s => s.category === 'sin_categoria');
    const totalProcessed = jsonData.pagination?.total_items || jsonData.total_rows_processed || 5000;
    if (uncategorized && uncategorized.total_mentions > totalProcessed * 0.2) {
        recommendations.push({
            priority: 'LOW',
            category: 'Analytics',
            title: 'Improve Feedback Classification System',
            description: `${uncategorized.total_mentions.toLocaleString()} feedback entries (${Math.round((uncategorized.total_mentions / totalProcessed) * 100)}%) remain uncategorized. Enhance AI classification algorithms to capture diverse customer concerns and identify emerging issues faster.`,
            impact: 'Low - Better data insights'
        });
    }
    
    // Clear container
    recommendationsList.innerHTML = '';
    
    // Create recommendation cards
    recommendations.forEach(rec => {
        const priorityColors = {
            'HIGH': 'background-color: var(--negative); color: white;',
            'MEDIUM': 'background-color: var(--warning); color: white;',
            'LOW': 'background-color: var(--neutral); color: white;'
        };
        
        const card = document.createElement('div');
        card.className = 'insight-card recommendation-card';
        card.innerHTML = `
            <div class="recommendation-header">
                <span class="recommendation-priority" style="${priorityColors[rec.priority]}">
                    ${rec.priority} PRIORITY
                </span>
                <span class="recommendation-category">${rec.category}</span>
            </div>
            <h3 class="card-title">${rec.title}</h3>
            <p class="card-content">${rec.description}</p>
            <div class="recommendation-footer">
                <span class="recommendation-impact">${rec.impact}</span>
            </div>
        `;
        recommendationsList.appendChild(card);
    });
}

// ========================================
// Initialize Dashboard
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚂 ÖBB Mobility Insights Dashboard Initialized');
    
    // Initialize all functionality
    initNavigation();
    initTimeRangeSelector(); // Initialize time range filter buttons
    initTopicsTimeRangeSelector(); // Initialize topics time range filter buttons
    initIssuesTimeRangeSelector(); // Initialize issues time range filter buttons
    loadHotTopic(); // Load the AI hot topic
    loadDashboardData();
    
    // Auto-refresh hot topic every 10 minutes
    setInterval(loadHotTopic, 10 * 60 * 1000);
    
    // Auto-refresh dashboard data every 5 minutes
    setInterval(loadDashboardData, 5 * 60 * 1000);
});
