// ========================================
// Charts Module - All Chart.js visualizations
// ========================================

// Global variables to store data for filtering (exported for access from main.js)
export let globalSentimentData = null;
export let globalTopicsData = null;
export let globalIssuesData = null;

// Setters to update global data from external modules
export function setGlobalSentimentData(data) {
    globalSentimentData = data;
}

export function setGlobalTopicsData(data) {
    globalTopicsData = data;
}

export function setGlobalIssuesData(data) {
    globalIssuesData = data;
}

// ========================================
// Doughnut Chart - Category Distribution
// ========================================

export function generateDoughnutChart(jsonData) {
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

export function updateCategoryTable(categoryCounts, totalReports) {
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
// Positive Feedback Doughnut Chart
// ========================================

export function generatePositiveDoughnutChart(jsonData) {
    // Filter only positive entries
    const positiveEntries = jsonData.data.filter(entry => 
        entry.detected_categories && entry.detected_categories.includes('positive')
    );
    
    console.log('🌟 Positive entries found:', positiveEntries.length);
    
    // Count categories in positive entries (excluding 'positive' itself)
    const positiveCategoryCounts = {};
    
    positiveEntries.forEach(entry => {
        if (entry.detected_categories && Array.isArray(entry.detected_categories)) {
            entry.detected_categories.forEach(category => {
                if (category !== 'positive') {
                    if (!positiveCategoryCounts[category]) {
                        positiveCategoryCounts[category] = 0;
                    }
                    positiveCategoryCounts[category]++;
                }
            });
        }
    });
    
    // Sort categories by count
    const sortedCategories = Object.entries(positiveCategoryCounts)
        .sort((a, b) => b[1] - a[1]);
    
    console.log('🎯 Positive category breakdown:', positiveCategoryCounts);
    
    // If no data, show message
    if (sortedCategories.length === 0) {
        const canvas = document.getElementById('positiveDoughnutCanvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.font = '16px Inter, sans-serif';
            ctx.fillStyle = '#666';
            ctx.textAlign = 'center';
            ctx.fillText('No positive feedback data available', canvas.width / 2, canvas.height / 2);
        }
        return;
    }
    
    // Prepare chart data
    const labels = sortedCategories.map(([category]) => 
        category.charAt(0).toUpperCase() + category.slice(1)
    );
    const data = sortedCategories.map(([, count]) => count);
    
    // Color palette for positive categories
    const positiveColors = [
        '#4CAF50',  // Green
        '#8BC34A',  // Light Green
        '#CDDC39',  // Lime
        '#FFC107',  // Amber
        '#FF9800',  // Orange
        '#03A9F4',  // Light Blue
        '#00BCD4',  // Cyan
        '#9C27B0',  // Purple
        '#E91E63',  // Pink
        '#607D8B'   // Blue Grey
    ];
    
    const colors = sortedCategories.map((_, index) => 
        positiveColors[index % positiveColors.length]
    );
    
    // Destroy existing chart
    const existingChart = Chart.getChart('positiveDoughnutCanvas');
    if (existingChart) {
        existingChart.destroy();
    }
    
    // Create chart
    const ctx = document.getElementById('positiveDoughnutCanvas').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Positive Feedback Distribution',
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
                            const chartData = chart.data;
                            const total = chartData.datasets[0].data.reduce((a, b) => a + b, 0);
                            
                            return chartData.labels.map((label, i) => {
                                const value = chartData.datasets[0].data[i];
                                const percentage = ((value / total) * 100).toFixed(1);
                                
                                return {
                                    text: `${label}: ${value} (${percentage}%)`,
                                    fillStyle: chartData.datasets[0].backgroundColor[i],
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
                            return `${label}: ${value} praise mentions (${percentage}%)`;
                        }
                    }
                },
                title: {
                    display: true,
                    text: `Total Positive Reviews: ${positiveEntries.length}`,
                    font: {
                        size: 14,
                        family: 'Inter, sans-serif',
                        weight: 'normal'
                    },
                    color: '#4CAF50'
                }
            }
        }
    });
    
    // Update table
    updatePositiveCategoryTable(positiveCategoryCounts, colors, sortedCategories);
    
    console.log('🍩 Positive doughnut chart generated');
}

// Helper function for positive category table
function updatePositiveCategoryTable(categoryCounts, colors, sortedCategories) {
    const tableBody = document.getElementById('positiveCategoryTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    const total = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
    
    sortedCategories.forEach(([category, count], index) => {
        const percentage = ((count / total) * 100).toFixed(1);
        const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
        const color = colors[index];
        
        const row = document.createElement('tr');
        row.className = 'category-row';
        row.innerHTML = `
            <td class="color-indicator" style="background-color: ${color};"></td>
            <td class="category-name">${categoryName}</td>
            <td class="category-count">${count} (${percentage}%)</td>
        `;
        tableBody.appendChild(row);
    });
    
    console.log('📊 Positive category table updated');
}

// ========================================
// Sentiment Timeline Chart
// ========================================

export function generateSentimentTimelineChart(jsonData, timeRange = 'all') {
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
// Stacked Area Chart - Topic Evolution
// ========================================

export function generateStackedAreaChart(jsonData, timeRange = 'all') {
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
// Horizontal Bar Chart - Top Topics
// ========================================

export function generateHorizontalBarChart(jsonData) {
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
// Issues Trend Line Chart
// ========================================

export function generateIssuesTrendChart(jsonData, timeRange = 'all') {
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
    
    console.log('📊 Issues trend chart generated:', {
        timeRange: timeRange,
        referenceDate: referenceDate ? referenceDate.toISOString().split('T')[0] : 'N/A',
        cutoffDate: cutoffDate ? cutoffDate.toISOString().split('T')[0] : 'none',
        months: sortedMonths.length,
        dateRange: sortedMonths.length > 0 ? `${sortedMonths[0]} to ${sortedMonths[sortedMonths.length - 1]}` : 'N/A',
        filteredEntries: filteredCount,
        totalEntries: totalCount,
        categories: 6
    });
}
