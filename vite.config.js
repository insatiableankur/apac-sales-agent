import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
```

**Step 3 — Open `src/App.jsx`** and find this line near the top:
```
const response = await fetch("https://api.anthropic.com/v1/messages",
```

Change it to:
```
const response = await fetch("/api/v1/messages",
```

There are **two** fetch calls in the file (one in `runAnalysis` and one in `sendChat`) — change **both** of them.

**Step 4 — Push the changes to GitHub:**
```
git add .
git commit -m "Fix CORS with proxy"
git push