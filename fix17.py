#!/usr/bin/env python3
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    src = f.read()

old = """          const tsRes = await fetch("/api/anthropic", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "claude-haiku-4-5-20251001", max_tokens: 400,
              tools: [{ type: "web_search_20250305", name: "web_search" }],
              messages: [{ role: "user", content: `What software and technology platforms does ${companyName} use? Search for "${companyName} technology stack", "${companyName} software". Return ONLY valid JSON: {"tools":"4-6 known platforms comma separated e.g. SAP, Salesforce, Oracle","likelyReplacing":"What they are most likely modernising or replacing"}` }]
            })
          });"""

new = """          const tsRes = await fetch("/api/anthropic", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "claude-haiku-4-5-20251001", max_tokens: 400,
              messages: [{ role: "user", content: `Based on your knowledge, what software and technology platforms does ${companyName} likely use? Consider their industry, size and region. Return ONLY valid JSON: {"tools":"4-6 known or likely platforms comma separated e.g. SAP, Salesforce, Oracle, Workday","likelyReplacing":"What legacy system or process they are most likely modernising or replacing"}` }]
            })
          });"""

if old in src:
    src = src.replace(old, new, 1)
    print('Fix OK - removed web search tool from tech stack call')
else:
    print('FAIL - string not found')

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(src)
print('Done. Run: npm run build 2>&1 | head -20')
