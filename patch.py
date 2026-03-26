#!/usr/bin/env python3
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    src = f.read()

with open('src/App.jsx.backup', 'w', encoding='utf-8') as f:
    f.write(src)
print('Backup saved to src/App.jsx.backup')

ok = True

# CHANGE 1: new state variables
c1_old = '  const [newsLoading, setNewsLoading] = useState(false);'
c1_new = ('  const [newsLoading, setNewsLoading] = useState(false);\n'
           '  const [autoResearchLoading, setAutoResearchLoading] = useState(false);\n'
           '  const [autoResearchDone, setAutoResearchDone] = useState(false);')
if c1_old in src:
    src = src.replace(c1_old, c1_new, 1)
    print('Change 1 OK - state variables added')
else:
    print('FAIL: Change 1 - string not found')
    ok = False

# CHANGE 2: autoResearchCompany function
c2_old = '  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));'
c2_new = r"""  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const autoResearchCompany = useCallback(async (companyName) => {
    if (!companyName || companyName.length < 2) return;
    setAutoResearchLoading(true);
    setAutoResearchDone(false);
    try {
      const response = await fetch("/api/anthropic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 3000,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{
            role: "user",
            content: `Research the company "${companyName}". Search for "${companyName} overview", "${companyName} CEO leadership", "${companyName} news 2025". Return ONLY valid JSON: {"website":"url","market":"EXACTLY one of: Singapore, Malaysia, Philippines, India, Indonesia, Thailand, Hong Kong, Vietnam, Australia, South Korea, Japan, Taiwan, New Zealand, UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman, Egypt, South Africa, Nigeria, Kenya, United Kingdom, Germany, France, Netherlands, Sweden, Norway, Denmark, Finland, Spain, Italy, Switzerland, United States, Canada, Brazil, Mexico, Global / Multi-Country","industry":"EXACTLY one of: Financial Services / Banking, Insurance / Insurtech, Fintech / Payments, HCM / HR Technology, ERP / Finance Systems, Retail / CPG / Ecommerce, Logistics / Supply Chain, Healthcare / Pharma, Telco / Media / Tech, Real Estate / PropTech, Energy / Resources, Manufacturing, Professional Services, Government / Public Sector","recentNews":"2-3 sentences of key 2024-2025 news with dates and figures","knownContacts":"Top 3-4 C-suite names and titles comma separated","competitorsMentioned":"2-3 main competitors comma separated"}`
          }]
        })
      });
      const data = await response.json();
      const text = data.content?.filter(b => b.type === 'text').map(b => b.text).join('') || '{}';
      const s = text.indexOf('{'), e = text.lastIndexOf('}');
      if (s !== -1 && e !== -1) {
        const parsed = JSON.parse(text.slice(s, e + 1));
        setForm(prev => ({
          ...prev,
          website: parsed.website || prev.website,
          market: MARKETS.includes(parsed.market) ? parsed.market : prev.market,
          industry: INDUSTRIES.includes(parsed.industry) ? parsed.industry : prev.industry,
          recentNews: parsed.recentNews || prev.recentNews,
          knownContacts: parsed.knownContacts || prev.knownContacts,
          competitorsMentioned: parsed.competitorsMentioned || prev.competitorsMentioned,
        }));
        setAutoResearchDone(true);
      }
    } catch(err) {}
    setAutoResearchLoading(false);
  }, []);"""
if c2_old in src:
    src = src.replace(c2_old, c2_new, 1)
    print('Change 2 OK - autoResearchCompany function added')
else:
    print('FAIL: Change 2 - string not found')
    ok = False

# CHANGE 3: company name field with research button
c3_old = """                <div className="field">
                  <label className="field-label">COMPANY NAME <span>*</span></label>
                  <input type="text" value={form.company} onChange={e => set("company", e.target.value)}
                    placeholder="e.g. OCBC Bank, Petronas, Axiata Group, BDO Unibank..." />
                </div>"""
c3_new = r"""                <div className="field">
                  <label className="field-label">COMPANY NAME <span>*</span></label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      value={form.company}
                      onChange={e => { set("company", e.target.value); setAutoResearchDone(false); }}
                      onKeyDown={e => { if (e.key === 'Enter' && form.company.length >= 2) autoResearchCompany(form.company); }}
                      placeholder="e.g. OCBC Bank, DBS Bank, Petronas, Axiata..."
                      style={{ flex: 1 }}
                    />
                    <button
                      onClick={() => autoResearchCompany(form.company)}
                      disabled={autoResearchLoading || form.company.length < 2}
                      style={{
                        padding: '11px 18px', borderRadius: 8, border: '1px solid',
                        borderColor: autoResearchDone ? 'var(--green)' : form.company.length >= 2 ? 'rgba(245,158,11,0.5)' : 'var(--border)',
                        background: autoResearchDone ? 'var(--green-dim)' : form.company.length >= 2 ? 'var(--amber-glow)' : 'transparent',
                        color: autoResearchDone ? 'var(--green)' : form.company.length >= 2 ? 'var(--amber)' : 'var(--text-dim)',
                        fontSize: 12, fontWeight: 700,
                        cursor: form.company.length >= 2 && !autoResearchLoading ? 'pointer' : 'not-allowed',
                        whiteSpace: 'nowrap', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', gap: 6,
                        fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1,
                        opacity: form.company.length < 2 ? 0.4 : 1,
                      }}
                    >
                      {autoResearchLoading ? (
                        <><span style={{ display: 'inline-block', width: 10, height: 10, border: '2px solid var(--amber)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />RESEARCHING...</>
                      ) : autoResearchDone ? '✓ RESEARCHED' : '🔍 RESEARCH'}
                    </button>
                  </div>
                  {form.company.length >= 2 && !autoResearchDone && !autoResearchLoading && (
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 5 }}>
                      Press Enter or click Research — AI auto-fills market, industry, news and contacts
                    </div>
                  )}
                  {autoResearchLoading && (
                    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {['Searching company profile...', 'Finding leadership team...', 'Pulling latest news...'].map((label, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--amber)', animation: 'stepPulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.3}s` }} />
                          <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: "'JetBrains Mono', monospace" }}>{label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {autoResearchDone && (
                    <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: 'var(--green)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }}>✓ AUTO-FILLED —</span>
                      {[form.market, form.industry].filter(Boolean).map((v, i) => (
                        <span key={i} className="tag tag-green" style={{ fontSize: 9 }}>{v}</span>
                      ))}
                      {form.recentNews && <span className="tag tag-green" style={{ fontSize: 9 }}>News</span>}
                      {form.knownContacts && <span className="tag tag-green" style={{ fontSize: 9 }}>Contacts</span>}
                      <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: "'JetBrains Mono', monospace" }}>— review and edit below</span>
                    </div>
                  )}
                </div>"""
if c3_old in src:
    src = src.replace(c3_old, c3_new, 1)
    print('Change 3 OK - company name field with Research button added')
else:
    print('FAIL: Change 3 - string not found')
    ok = False

# CHANGE 4: spin keyframe
c4_old = '  @keyframes stepPulse { 0%,100%{box-shadow:0 0 12px rgba(245,158,11,0.4)} 50%{box-shadow:0 0 24px rgba(245,158,11,0.7)} }'
c4_new = ('  @keyframes stepPulse { 0%,100%{box-shadow:0 0 12px rgba(245,158,11,0.4)} 50%{box-shadow:0 0 24px rgba(245,158,11,0.7)} }\n'
           '  @keyframes spin { to { transform: rotate(360deg); } }')
if c4_old in src:
    src = src.replace(c4_old, c4_new, 1)
    print('Change 4 OK - spin keyframe added')
else:
    print('FAIL: Change 4 - string not found')
    ok = False

# Write result
if ok:
    with open('src/App.jsx', 'w', encoding='utf-8') as f:
        f.write(src)
    print('\nAll 4 changes applied. Now run: npm run build')
else:
    print('\nSome changes failed. App.jsx was NOT modified. Check output above.')
