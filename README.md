# 🔍 GitHub Commit Message Analyzer

A beautiful, modern web application to analyze commit messages from any GitHub repository. Get insights into commit quality, patterns, and statistics with an intuitive, dark-themed UI.

![GitHub Commit Message Analyzer](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

- **📊 Comprehensive Analysis**
  - Total commits analyzed
  - Average commit message length
  - Quality score calculation
  - Time range visualization

- **📈 Quality Metrics**
  - Conventional commit format detection
  - Descriptive message analysis
  - Merge commit filtering
  - Visual progress indicators

- **🏷️ Commit Type Breakdown**
  - Automatic detection of commit types (feat, fix, docs, etc.)
  - Frequency visualization
  - Conventional commits support

- **🔥 Word Analysis**
  - Most common words extraction
  - Word frequency statistics
  - Visual word cloud tags

- **📋 Recent Commits Display**
  - Latest commit messages
  - Author information
  - Timestamp formatting

- **🔑 API Key Support**
  - Optional GitHub Personal Access Token
  - Higher rate limits (5,000/hour)
  - Access to private repositories
  - Secure localStorage storage

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for GitHub API access
- (Optional) GitHub Personal Access Token for enhanced features

### Installation

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd githubojt
   ```

2. **Open the application**
   - Simply open `index.html` in your web browser
   - No build process or dependencies required!

3. **Start analyzing**
   - Enter a GitHub repository (e.g., `facebook/react`)
   - Click "Analyze" and view the results

## 📖 Usage

### Basic Usage

1. Enter a repository in the input field:
   - Format: `owner/repo` (e.g., `facebook/react`)
   - Or full URL: `https://github.com/facebook/react`

2. Click the **"Analyze"** button

3. View comprehensive analysis results

### Using GitHub API Key (Optional)

For better performance and access to private repos:

1. Get a GitHub Personal Access Token:
   - Visit: https://github.com/settings/tokens/new
   - Select the `repo` scope
   - Generate and copy your token

2. In the app:
   - Click **"🔑 Add GitHub API Key (Optional)"**
   - Paste your token
   - It will be saved automatically in your browser

3. Benefits:
   - ✅ 5,000 requests/hour (vs 60/hour)
   - ✅ Access private repositories
   - ✅ More reliable API access

📝 **See [API_KEY_SETUP.md](API_KEY_SETUP.md) for detailed instructions**

## 🎨 Features in Detail

### Quality Score
The quality score is calculated based on:
- 30% - Conventional commit format adherence
- 40% - Message descriptiveness (10-72 characters)
- 30% - Non-merge commit ratio

### Commit Types Detected
- `feat` - New features
- `fix` - Bug fixes
- `docs` - Documentation changes
- `style` - Code style changes
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Test additions/changes
- `chore` - Maintenance tasks
- `build` - Build system changes
- `ci` - CI/CD changes
- `revert` - Reverted commits

### Analysis Limits
- Analyzes up to **300 commits** per repository
- Fetches 100 commits per API request
- Provides comprehensive statistics on the sample

## 🛠️ Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Variables
- **Vanilla JavaScript** - No frameworks required
- **GitHub API v3** - REST API integration

## 📁 Project Structure

```
githubojt/
├── index.html          # Main HTML file
├── styles.css          # Styling and layout
├── script.js           # Application logic
├── .gitignore         # Git ignore rules
├── API_KEY_SETUP.md   # API key setup guide
└── README.md          # This file
```

## 🔒 Privacy & Security

- **No server**: All processing happens in your browser
- **Local storage**: API keys stored only in browser localStorage
- **No tracking**: No analytics or tracking scripts
- **Direct API calls**: All requests go directly to GitHub API
- **Open source**: Full code transparency

## ⚠️ Rate Limits

### Without API Key
- **60 requests/hour** per IP address
- May limit analysis of large repositories

### With API Key
- **5,000 requests/hour**
- Much more reliable for extensive analysis

## 🐛 Troubleshooting

### Common Issues

**"Repository not found"**
- Check the repository name format
- Ensure the repository exists and is public (or you have access)

**"API rate limit exceeded"**
- Add a GitHub API key to increase limits
- Wait for the rate limit to reset (1 hour)
- Try analyzing a different repository

**"No commits found"**
- Repository might be empty
- Repository might be private (add API key)
- Check if the repository exists

**API Key not working**
- Verify the token has `repo` scope
- Check if token has expired
- Try generating a new token

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- GitHub API for providing the data
- All contributors and users of this tool

## 📧 Support

If you encounter any issues or have questions:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review [API_KEY_SETUP.md](API_KEY_SETUP.md) for API key help
3. Open an issue on GitHub

## 🎯 Future Enhancements

Potential features for future versions:
- [ ] Export analysis results (JSON/CSV)
- [ ] Commit message recommendations
- [ ] Historical trend analysis
- [ ] Comparison between repositories
- [ ] Visual charts and graphs
- [ ] Custom quality metrics

---

**Made with ❤️ for developers who care about clean commit messages**

