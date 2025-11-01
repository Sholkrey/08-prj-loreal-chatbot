# Cloudflare Worker Deployment Guide

## Step 1: Get Your OpenAI API Key

1. Go to [OpenAI Dashboard](https://platform.openai.com/api-keys)
2. Create a new secret key (starts with `sk-`)
3. Copy it - you'll need it for the Cloudflare Worker

## Step 2: Deploy Cloudflare Worker

### Option A: Using Cloudflare Dashboard (Recommended for beginners)

1. Go to [Cloudflare Workers Dashboard](https://dash.cloudflare.com/workers)
2. Click "Create a Service"
3. Name it something like `loreal-chatbot-worker`
4. Click "Create Service"
5. Click "Quick Edit"
6. Delete the default code and paste the contents from `RESOURCE_cloudflare-worker.js`
7. Click "Save and Deploy"
8. Note your Worker URL (e.g., `https://loreal-chatbot-worker.YOUR_ACCOUNT.workers.dev`)

### Option B: Using Wrangler CLI

```bash
# Install Wrangler globally
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create wrangler.toml (optional - for easier deployment)
echo 'name = "loreal-chatbot-worker"
main = "RESOURCE_cloudflare-worker.js"
compatibility_date = "2024-10-31"' > wrangler.toml

# Deploy
wrangler deploy RESOURCE_cloudflare-worker.js
```

## Step 3: Add Your OpenAI API Key as a Secret

1. In your Worker dashboard, go to Settings > Variables
2. Under "Environment Variables", click "Add variable"
3. Name: `OPENAI_API_KEY`
4. Value: Your OpenAI API key (the `sk-...` key)
5. Click "Encrypt" to make it a secret
6. Click "Save"

## Step 4: Update Your Local Configuration

1. Open `secrets.js` in your project
2. Replace `REPLACE_ME_WITH_WORKER_URL` with your actual Worker URL
3. Example:
   ```javascript
   const WORKER_URL = "https://loreal-chatbot-worker.YOUR_ACCOUNT.workers.dev";
   ```

## Step 5: Test Your Chatbot

1. Open `index.html` in your browser or use Live Server
2. Ask a L'Oréal-related question like: "What's the best L'Oréal moisturizer for dry skin?"
3. The chatbot should respond with product recommendations

## Troubleshooting

- **"Worker endpoint not configured"**: Make sure `WORKER_URL` in `secrets.js` is set to your actual Worker URL
- **Worker errors**: Check the Worker logs in Cloudflare dashboard
- **CORS errors**: The Worker includes CORS headers, but make sure you're testing from the same domain
- **API key issues**: Verify the secret is named exactly `OPENAI_API_KEY` in Worker settings

## Security Notes

- Never commit your real API key to git
- The `secrets.js` file should only contain your Worker URL after deployment
- Your actual API key is safely stored in Cloudflare's encrypted secrets
