// GitHub API configuration
const GITHUB_API_BASE = 'https://api.github.com';
const COMMITS_PER_PAGE = 100;
const MAX_COMMITS = 300; // Limit to prevent excessive API calls

// DOM elements
const repoInput = document.getElementById('repoInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const errorMessage = document.getElementById('errorMessage');
const loadingSection = document.getElementById('loadingSection');
const resultsSection = document.getElementById('resultsSection');
const toggleApiKey = document.getElementById('toggleApiKey');
const apiKeyContainer = document.getElementById('apiKeyContainer');
const apiKeyInput = document.getElementById('apiKeyInput');
const clearApiKey = document.getElementById('clearApiKey');
const apiKeyStatus = document.getElementById('apiKeyStatus');
const apiKeyIndicator = document.getElementById('apiKeyIndicator');

// Event listeners
analyzeBtn.addEventListener('click', handleAnalyze);
repoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleAnalyze();
    }
});

if (toggleApiKey) {
    toggleApiKey.addEventListener('click', () => {
        const isHidden = apiKeyContainer.classList.contains('hidden');
        apiKeyContainer.classList.toggle('hidden');
        toggleApiKey.textContent = isHidden 
            ? '❌ Hide API Key' 
            : '🔑 Add GitHub API Key (Optional)';
    });
}

if (clearApiKey) {
    clearApiKey.addEventListener('click', () => {
        if (apiKeyInput) {
            apiKeyInput.value = '';
        }
        localStorage.removeItem('github_api_key');
        updateApiKeyStatus(false);
    });
}

// Load API key from localStorage if available
window.addEventListener('DOMContentLoaded', () => {
    const savedKey = localStorage.getItem('github_api_key');
    if (savedKey) {
        if (apiKeyInput) {
            apiKeyInput.value = savedKey;
        }
        if (apiKeyContainer) {
            apiKeyContainer.classList.remove('hidden');
        }
        if (toggleApiKey) {
            toggleApiKey.textContent = '❌ Hide API Key';
        }
        updateApiKeyStatus(true);
    }
});

// Verify API key is accessible throughout the app
function getApiToken() {
    if (apiKeyInput && apiKeyInput.value.trim()) {
        return apiKeyInput.value.trim();
    }
    return localStorage.getItem('github_api_key') || '';
}

// Save API key to localStorage when changed
if (apiKeyInput) {
    apiKeyInput.addEventListener('input', () => {
        const key = apiKeyInput.value.trim();
        if (key) {
            localStorage.setItem('github_api_key', key);
            updateApiKeyStatus(true);
        } else {
            localStorage.removeItem('github_api_key');
            updateApiKeyStatus(false);
        }
    });
}

// Update API key status indicator
function updateApiKeyStatus(hasKey) {
    const token = getApiToken();
    const isActive = hasKey && token;
    
    // Update input field status
    if (apiKeyStatus) {
        if (isActive) {
            apiKeyStatus.textContent = '✓ API Key saved and active';
            apiKeyStatus.className = 'api-key-status saved';
        } else {
            apiKeyStatus.textContent = '';
            apiKeyStatus.className = 'api-key-status';
        }
    }
    
    // Update header indicator
    if (apiKeyIndicator) {
        if (isActive) {
            apiKeyIndicator.classList.remove('hidden');
        } else {
            apiKeyIndicator.classList.add('hidden');
        }
    }
}

// Main analyze function
async function handleAnalyze() {
    const repo = extractRepoFromInput(repoInput.value.trim());
    
    if (!repo) {
        showError('Please enter a valid GitHub repository (e.g., facebook/react)');
        return;
    }

    hideError();
    showLoading();
    hideResults();

    try {
        // Fetch repository info and commits
        const [repoInfo, commits] = await Promise.all([
            fetchRepositoryInfo(repo),
            fetchCommits(repo)
        ]);

        if (commits.length === 0) {
            showError('No commits found for this repository. It might be private or empty.');
            hideLoading();
            return;
        }

        // Analyze commits
        const analysis = analyzeCommits(commits);
        
        // Display results
        displayResults(repoInfo, commits, analysis);
        
        hideLoading();
        showResults();
    } catch (error) {
        console.error('Error:', error);
        hideLoading();
        
        if (error.message.includes('404')) {
            showError('Repository not found. Please check the repository name and try again.');
        } else if (error.message.includes('403')) {
            const token = localStorage.getItem('github_api_key') || (apiKeyInput ? apiKeyInput.value.trim() : '');
            if (token) {
                showError('API rate limit exceeded or token lacks permissions. Check your API key has "repo" scope and try again.');
            } else {
                showError('API rate limit exceeded or repository is private. Add a GitHub API key for higher limits and private repo access.');
            }
        } else if (error.message.includes('401')) {
            showError('Invalid API key. Please check your GitHub Personal Access Token and ensure it has the "repo" scope.');
        } else {
            showError('An error occurred. Please try again.');
        }
    }
}

// Extract repository owner and name from input
function extractRepoFromInput(input) {
    if (!input) return null;
    
    // Handle full GitHub URL
    const urlMatch = input.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (urlMatch) {
        return { owner: urlMatch[1], repo: urlMatch[2].replace(/\.git$/, '') };
    }
    
    // Handle owner/repo format
    const parts = input.split('/');
    if (parts.length === 2) {
        return { owner: parts[0], repo: parts[1] };
    }
    
    return null;
}

// Get API headers with optional authentication
function getApiHeaders() {
    const token = getApiToken();
    
    const headers = {
        'Accept': 'application/vnd.github.v3+json'
    };
    
    if (token) {
        // GitHub API accepts 'token' format for authentication
        headers['Authorization'] = `token ${token}`;
    }
    
    return headers;
}

// Fetch repository information
async function fetchRepositoryInfo({ owner, repo }) {
    const headers = getApiHeaders();
    const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}`,
        {
            headers: headers
        }
    );
    
    if (!response.ok) {
        // Check rate limit headers
        const remaining = response.headers.get('X-RateLimit-Remaining');
        const limit = response.headers.get('X-RateLimit-Limit');
        
        if (response.status === 403 && remaining === '0') {
            const resetTime = new Date(parseInt(response.headers.get('X-RateLimit-Reset')) * 1000);
            throw new Error(`Rate limit exceeded. Limit: ${limit}/hour. Resets at: ${resetTime.toLocaleTimeString()}`);
        }
        
        throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
}

// Fetch commits from repository
async function fetchCommits({ owner, repo }) {
    const commits = [];
    let page = 1;
    let hasMore = true;

    while (hasMore && commits.length < MAX_COMMITS) {
        const headers = getApiHeaders();
        const response = await fetch(
            `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?per_page=${COMMITS_PER_PAGE}&page=${page}`,
            {
                headers: headers
            }
        );

        if (!response.ok) {
            if (response.status === 409) {
                // Empty repository
                return [];
            }
            
            // Check rate limit headers
            const remaining = response.headers.get('X-RateLimit-Remaining');
            const limit = response.headers.get('X-RateLimit-Limit');
            
            if (response.status === 403 && remaining === '0') {
                const resetTime = new Date(parseInt(response.headers.get('X-RateLimit-Reset')) * 1000);
                throw new Error(`Rate limit exceeded. Limit: ${limit}/hour. Resets at: ${resetTime.toLocaleTimeString()}`);
            }
            
            throw new Error(`HTTP ${response.status}`);
        }

        const pageCommits = await response.json();
        
        if (pageCommits.length === 0) {
            hasMore = false;
        } else {
            commits.push(...pageCommits);
            page++;
            
            // Check if we got fewer than requested (last page)
            if (pageCommits.length < COMMITS_PER_PAGE) {
                hasMore = false;
            }
        }
    }

    return commits.slice(0, MAX_COMMITS);
}

// Analyze commit messages
function analyzeCommits(commits) {
    const messages = commits.map(c => c.commit.message);
    
    // Quality metrics
    const conventionalFormat = messages.filter(msg => 
        /^(feat|fix|docs|style|refactor|perf|test|chore|build|ci|revert)(\(.+\))?:/.test(msg)
    ).length;
    
    const descriptiveMessages = messages.filter(msg => {
        const firstLine = msg.split('\n')[0];
        return firstLine.length >= 10 && firstLine.length <= 72;
    }).length;
    
    const mergeCommits = messages.filter(msg => 
        msg.startsWith('Merge') || msg.startsWith('merge')
    ).length;
    
    const noMergeCommits = commits.length - mergeCommits;
    
    // Commit types
    const commitTypes = {};
    messages.forEach(msg => {
        const match = msg.match(/^(\w+)(\(.+\))?:/);
        if (match) {
            const type = match[1].toLowerCase();
            commitTypes[type] = (commitTypes[type] || 0) + 1;
        }
    });
    
    // Common words
    const wordFreq = {};
    messages.forEach(msg => {
        const words = msg
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 3 && !['that', 'this', 'with', 'from', 'have', 'will'].includes(w));
        
        words.forEach(word => {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        });
    });
    
    const commonWords = Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20);
    
    // Average message length
    const totalLength = messages.reduce((sum, msg) => sum + msg.length, 0);
    const avgLength = Math.round(totalLength / messages.length);
    
    // Quality score calculation
    const qualityScore = Math.round(
        (conventionalFormat / messages.length * 0.3 +
         descriptiveMessages / messages.length * 0.4 +
         (noMergeCommits / commits.length) * 0.3) * 100
    );
    
    // Date range
    const dates = commits.map(c => new Date(c.commit.author.date));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    const timeRange = formatDateRange(minDate, maxDate);
    
    return {
        totalCommits: commits.length,
        avgLength,
        qualityScore,
        timeRange,
        conventionalFormat,
        descriptiveMessages,
        mergeCommits,
        noMergeCommits,
        commitTypes,
        commonWords,
        messages
    };
}

// Format date range
function formatDateRange(start, end) {
    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };
    
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 1) {
        return 'Same day';
    } else if (daysDiff < 30) {
        return `${daysDiff} days`;
    } else if (daysDiff < 365) {
        const months = Math.floor(daysDiff / 30);
        return `${months} month${months > 1 ? 's' : ''}`;
    } else {
        const years = (daysDiff / 365).toFixed(1);
        return `${years} year${years !== '1.0' ? 's' : ''}`;
    }
}

// Display results
function displayResults(repoInfo, commits, analysis) {
    // Repository info
    document.getElementById('repoName').textContent = repoInfo.full_name;
    document.getElementById('repoDescription').textContent = 
        repoInfo.description || 'No description available';
    
    // Statistics
    document.getElementById('totalCommits').textContent = analysis.totalCommits.toLocaleString();
    document.getElementById('avgLength').textContent = `${analysis.avgLength} chars`;
    document.getElementById('qualityScore').textContent = `${analysis.qualityScore}%`;
    document.getElementById('timeRange').textContent = analysis.timeRange;
    
    // Quality breakdown
    const conventionalPercent = Math.round((analysis.conventionalFormat / analysis.totalCommits) * 100);
    const descriptivePercent = Math.round((analysis.descriptiveMessages / analysis.totalCommits) * 100);
    const noMergePercent = Math.round((analysis.noMergeCommits / analysis.totalCommits) * 100);
    
    document.getElementById('conventionalProgress').style.width = `${conventionalPercent}%`;
    document.getElementById('conventionalPercent').textContent = `${conventionalPercent}%`;
    
    document.getElementById('descriptiveProgress').style.width = `${descriptivePercent}%`;
    document.getElementById('descriptivePercent').textContent = `${descriptivePercent}%`;
    
    document.getElementById('noMergeProgress').style.width = `${noMergePercent}%`;
    document.getElementById('noMergePercent').textContent = `${noMergePercent}%`;
    
    // Commit types
    const commitTypesContainer = document.getElementById('commitTypes');
    commitTypesContainer.innerHTML = '';
    
    const sortedTypes = Object.entries(analysis.commitTypes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    sortedTypes.forEach(([type, count]) => {
        const typeElement = document.createElement('div');
        typeElement.className = 'commit-type';
        typeElement.innerHTML = `
            <span>${type}</span>
            <span class="commit-type-count">${count}</span>
        `;
        commitTypesContainer.appendChild(typeElement);
    });
    
    if (sortedTypes.length === 0) {
        commitTypesContainer.innerHTML = '<p style="color: var(--text-secondary);">No conventional commit types detected</p>';
    }
    
    // Common words
    const commonWordsContainer = document.getElementById('commonWords');
    commonWordsContainer.innerHTML = '';
    
    analysis.commonWords.forEach(([word, freq]) => {
        const wordElement = document.createElement('div');
        wordElement.className = 'word-tag';
        wordElement.innerHTML = `
            <span>${word}</span>
            <span class="word-frequency">${freq}</span>
        `;
        commonWordsContainer.appendChild(wordElement);
    });
    
    // Recent commits
    const recentCommitsContainer = document.getElementById('recentCommits');
    recentCommitsContainer.innerHTML = '';
    
    const recentMessages = commits.slice(0, 20).map(c => ({
        message: c.commit.message.split('\n')[0],
        author: c.commit.author.name,
        date: new Date(c.commit.author.date)
    }));
    
    recentMessages.forEach(({ message, author, date }) => {
        const commitElement = document.createElement('div');
        commitElement.className = 'commit-item';
        commitElement.innerHTML = `
            <div class="commit-message">${escapeHtml(message)}</div>
            <div class="commit-meta">
                <div class="commit-author">👤 ${escapeHtml(author)}</div>
                <div class="commit-date">📅 ${formatDate(date)}</div>
            </div>
        `;
        recentCommitsContainer.appendChild(commitElement);
    });
}

// Format date for display
function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// UI helper functions
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

function hideError() {
    errorMessage.classList.remove('show');
}

function showLoading() {
    loadingSection.classList.remove('hidden');
    analyzeBtn.disabled = true;
}

function hideLoading() {
    loadingSection.classList.add('hidden');
    analyzeBtn.disabled = false;
}

function showResults() {
    resultsSection.classList.remove('hidden');
}

function hideResults() {
    resultsSection.classList.add('hidden');
}

