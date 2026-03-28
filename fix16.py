#!/usr/bin/env python3
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    src = f.read()

with open('src/App.jsx.backup_fix16', 'w', encoding='utf-8') as f:
    f.write(src)
print('Backup saved')

# ─── FIX: Restore clean research prompt, separate tech stack call ─────────────
c1_old = """            content: `Research the company "${companyName}". Search for "${companyName} overview", "${companyName} CEO leadership", "${companyName} news 2025", "${companyName} technology stack", "${companyName} software jobs". Return ONLY valid JSON: {"website":"url","market":"EXACTLY one of: Singapore, Malaysia, Philippines, India, Indonesia, Thailand, Hong Kong, Vietnam, Australia, South Korea, Japan, Taiwan, New Zealand, UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman, Egypt, South Africa, Nigeria, Kenya, United Kingdom, Germany, France, Netherlands, Sweden, Norway, Denmark, Finland, Spain, Italy, Switzerland, United States, Canada, Brazil, Mexico, Global / Multi-Country","industry":"EXACTLY one of: Financial Services / Banking, Insurance / Insurtech, Fintech / Payments, HCM / HR Technology, ERP / Finance Systems, Retail / CPG / Ecommerce, Logistics / Supply Chain, Healthcare / Pharma, Telco / Media / Tech, Real Estate / PropTech, Energy / Resources, Manufacturing, Professional Services, Government / Public Sector","recentNews":"2-3 sentences of key 2024-2025 news with dates and figures","knownContacts":"Top 3-4 C-suite names and titles comma separated","competitorsMentioned":"2-3 main competitors comma separated","techStack":"Known or inferred tools: ERP, CRM, Finance, HR, Analytics platforms in use — e.g. SAP, Salesforce, Workday, Oracle. Infer from job postings and public signals. 4-6 tools comma separated","likelyReplacing":"What legacy system or process they are most likely looking to replace or modernise based on their industry and size"}`"""

c1_new = """            content: `Research the company "${companyName}". Search for "${companyName} overview", "${companyName} CEO leadership", "${companyName} news 2025". Return ONLY valid JSON with these exact keys: {"website":"official url","market":"EXACTLY one of: Singapore, Malaysia, Philippines, India, Indonesia, Thailand, Hong Kong, Vietnam, Australia, South Korea, Japan, Taiwan, New Zealand, UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman, Egypt, South Africa, Nigeria, Kenya, United Kingdom, Germany, France, Netherlands, Sweden, Norway, Denmark, Finland, Spain, Italy, Switzerland, United States, Canada, Brazil, Mexico, Global / Multi-Country","industry":"EXACTLY one of: Financial Services / Banking, Insurance / Insurtech, Fintech / Payments, HCM / HR Technology, ERP / Finance Systems, Retail / CPG / Ecommerce, Logistics / Supply Chain, Healthcare / Pharma, Telco / Media / Tech, Real Estate / PropTech, Energy / Resources, Manufacturing, Professional Services, Government / Public Sector","recentNews":"2-3 sentences of key 2024-2025 news","knownContacts":"Top 3-4 C-suite names and titles comma separated","competitorsMentioned":"2-3 main competitors comma separated"}`"""

if c1_old in src:
    src = src.replace(c1_old, c1_new, 1)
    print('Fix 1 OK - research prompt simplified')
else:
    print('FAIL: Fix 1 - research prompt not found')

# ─── FIX 2: Add separate tech stack call after main research succeeds ─────────
c2_old = """        if (parsed.competitorsMentioned) {
          const chips = parsed.competitorsMentioned.split(',').map(c => c.trim()).filter(Boolean);
          setSuggestedCompetitors(chips);
        }"""

c2_new = """        if (parsed.competitorsMentioned) {
          const chips = parsed.competitorsMentioned.split(',').map(c => c.trim()).filter(Boolean);
          setSuggestedCompetitors(chips);
        }
        // Separate lightweight tech stack call
        try {
          const tsRes = await fetch("/api/anthropic", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "claude-haiku-4-5-20251001", max_tokens: 400,
              tools: [{ type: "web_search_20250305", name: "web_search" }],
              messages: [{ role: "user", content: `What software and technology platforms does ${companyName} use? Search for "${companyName} technology stack", "${companyName} software". Return ONLY valid JSON: {"tools":"4-6 known platforms comma separated e.g. SAP, Salesforce, Oracle","likelyReplacing":"What they are most likely modernising or replacing"}` }]
            })
          });
          const tsData = await tsRes.json();
          const tsText = tsData.content?.filter(b => b.type === 'text').map(b => b.text).join('') || '{}';
          const ts = tsText.indexOf('{'), te = tsText.lastIndexOf('}');
          if (ts !== -1 && te !== -1) {
            const tsParsed = JSON.parse(tsText.slice(ts, te + 1));
            if (tsParsed.tools) setTechStack({ tools: tsParsed.tools, likelyReplacing: tsParsed.likelyReplacing || '' });
          }
        } catch(tsErr) { /* silent fail */ }"""

if c2_old in src:
    src = src.replace(c2_old, c2_new, 1)
    print('Fix 2 OK - separate tech stack call added')
else:
    print('FAIL: Fix 2 - competitors block not found')

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(src)
print('Done. Run: npm run build 2>&1 | head -20')
