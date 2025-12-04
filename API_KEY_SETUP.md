# GitHub API Key Setup

## Why Use an API Key?

Using a GitHub Personal Access Token provides:
- **Higher Rate Limits**: 5,000 requests/hour (vs 60/hour without token)
- **Access to Private Repositories**: Analyze your private repos
- **Better Reliability**: More stable API access

## How to Get Your API Key

1. Go to [GitHub Token Settings](https://github.com/settings/tokens/new)
2. Give your token a descriptive name (e.g., "Commit Analyzer")
3. Select the **`repo`** scope for full repository access
4. Click **"Generate token"**
5. **Copy the token immediately** (you won't see it again!)

## How to Use

1. Open the application in your browser
2. Click **"🔑 Add GitHub API Key (Optional)"**
3. Paste your token in the input field
4. The token will be saved in your browser's localStorage
5. Start analyzing repositories!

## Security Notes

- The API key is stored **locally in your browser** only
- It's never sent to any server except GitHub's API
- You can clear it anytime using the 🗑️ button
- Never share your token with anyone

## Troubleshooting

- **403 Error**: Your token may not have the correct permissions (need `repo` scope)
- **401 Error**: Your token might be invalid or expired
- **Rate Limit**: Even with a token, you can hit limits with very large repositories

## For Developers

If you want to pre-configure an API key for local development, you can:
1. Create a `.env` file (gitignored) with: `GITHUB_API_KEY=your_token_here`
2. Modify `script.js` to load from environment variables if running in a Node.js environment
3. For pure frontend, the localStorage approach (current implementation) is the standard way

