# DeepSeek Proxy

Do not put a DeepSeek API key in `app.js`, `index.html`, or any GitHub Pages file.

Use `deepseek-proxy.js` as a Cloudflare Worker or equivalent server-side function.

Required secret:

```bash
wrangler secret put DEEPSEEK_API_KEY
```

After deploying the Worker, expose its URL to the front end with a small config file or script before `app.js`:

```html
<script>
  window.FORGEPLAN_AI_ENDPOINT = "https://your-worker.your-subdomain.workers.dev";
</script>
```

The front end will only call `window.FORGEPLAN_AI_ENDPOINT`. It never stores the API key.
