import shutil, sys, os, re

src_path = 'src/App.jsx'
with open(src_path, 'r', encoding='utf-8') as f:
    src = f.read()

shutil.copy(src_path, src_path + '.backup_apollo')
print('Backup saved')

changes = []

# ── CHANGE 1: Create api/apollo.js ──────────────────────────────────────────
apollo_api = (
    "export const config = { maxDuration: 30 };\n"
    "\n"
    "export default async function handler(req, res) {\n"
    "  if (req.method !== 'POST') return res.status(405).end();\n"
    "  res.setHeader('Access-Control-Allow-Origin', '*');\n"
    "  const { action, apiKey, ...params } = req.body;\n"
    "  if (!apiKey) return res.status(400).json({ error: 'No API key provided' });\n"
    "  const endpoints = {\n"
    "    searchPeople: 'https://api.apollo.io/api/v1/mixed_people/search',\n"
    "    searchOrg:    'https://api.apollo.io/api/v1/organizations/search',\n"
    "  };\n"
    "  const url = endpoints[action];\n"
    "  if (!url) return res.status(400).json({ error: 'Invalid action' });\n"
    "  try {\n"
    "    const response = await fetch(url, {\n"
    "      method: 'POST',\n"
    "      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },\n"
    "      body: JSON.stringify({ ...params, api_key: apiKey }),\n"
    "    });\n"
    "    const data = await response.json();\n"
    "    res.status(response.status).json(data);\n"
    "  } catch (e) {\n"
    "    res.status(500).json({ error: e.message });\n"
    "  }\n"
    "}\n"
)
with open('api/apollo.js', 'w', encoding='utf-8') as f:
    f.write(apollo_api)
changes.append('Change 1 OK - api/apollo.js created')

# ── CHANGE 2: Apollo CSS ─────────────────────────────────────────────────────
apollo_css = (
    "  /* ─── APOLLO INTEGRATION ─────────────────────────────────────────── */\n"
    "  .apollo-connect-btn { display:flex; align-items:center; gap:6px; padding:5px 11px; border-radius:8px; border:1px solid rgba(124,58,237,0.35); background:rgba(124,58,237,0.07); color:#A78BFA; font-size:11px; font-weight:700; cursor:pointer; transition:all 0.2s; font-family:'JetBrains Mono',monospace; letter-spacing:0.5px; white-space:nowrap; }\n"
    "  .apollo-connect-btn:hover { border-color:rgba(124,58,237,0.6); background:rgba(124,58,237,0.14); }\n"
    "  .apollo-connect-btn.connected { border-color:rgba(16,185,129,0.4); background:rgba(16,185,129,0.08); color:var(--green); }\n"
    "  .apollo-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.72); backdrop-filter:blur(6px); z-index:2000; display:flex; align-items:center; justify-content:center; padding:16px; }\n"
    "  .apollo-modal { background:var(--card); border:1px solid rgba(124,58,237,0.28); border-radius:18px; padding:28px; width:100%; max-width:480px; position:relative; }\n"
    "  .apollo-modal-logo { width:38px; height:38px; border-radius:11px; background:linear-gradient(135deg,#7C3AED,#4F46E5); display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }\n"
    "  .apollo-contact-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:10px; }\n"
    "  @media (max-width:600px) { .apollo-contact-grid { grid-template-columns:1fr; } }\n"
    "  .apollo-contact-card { background:var(--bg); border:1px solid rgba(124,58,237,0.18); border-radius:10px; padding:12px 12px 10px; transition:all 0.2s; cursor:pointer; position:relative; overflow:hidden; }\n"
    "  .apollo-contact-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,#7C3AED,#4F46E5); }\n"
    "  .apollo-contact-card:hover { border-color:rgba(124,58,237,0.45); background:rgba(124,58,237,0.05); transform:translateY(-1px); }\n"
    "  .apollo-contact-card.added { border-color:rgba(16,185,129,0.35); background:rgba(16,185,129,0.05); }\n"
    "  .apollo-enriched-badge { display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:20px; background:rgba(124,58,237,0.1); border:1px solid rgba(124,58,237,0.22); color:#A78BFA; font-size:10px; font-weight:700; font-family:'JetBrains Mono',monospace; letter-spacing:0.5px; margin-left:8px; vertical-align:middle; }\n"
    "  .apollo-loading { display:flex; align-items:center; gap:8px; padding:10px 12px; background:rgba(124,58,237,0.06); border:1px solid rgba(124,58,237,0.14); border-radius:8px; margin-top:8px; }\n"
    "\n"
)
old_css_anchor = "  @media (min-width: 1024px) {"
new_css_anchor = apollo_css + "  @media (min-width: 1024px) {"
if old_css_anchor in src:
    src = src.replace(old_css_anchor, new_css_anchor, 1)
    changes.append('Change 2 OK - Apollo CSS added')
else:
    changes.append('FAIL: Change 2 - CSS anchor not found')

# ── CHANGE 3: Apollo state variables ────────────────────────────────────────
old_state = (
    "  const [autoResearchLoading, setAutoResearchLoading] = useState(false);\n"
    "  const [autoResearchDone, setAutoResearchDone] = useState(false);"
)
new_state = (
    "  const [autoResearchLoading, setAutoResearchLoading] = useState(false);\n"
    "  const [autoResearchDone, setAutoResearchDone] = useState(false);\n"
    "  const [apolloApiKey, setApolloApiKey] = useState(() => { try { return localStorage.getItem('sia_apollo_key') || ''; } catch(e) { return ''; } });\n"
    "  const [showApolloModal, setShowApolloModal] = useState(false);\n"
    "  const [apolloContacts, setApolloContacts] = useState([]);\n"
    "  const [apolloEnrichLoading, setApolloEnrichLoading] = useState(false);\n"
    "  const [addedApolloContacts, setAddedApolloContacts] = useState([]);"
)
if old_state in src:
    src = src.replace(old_state, new_state, 1)
    changes.append('Change 3 OK - Apollo state added')
else:
    changes.append('FAIL: Change 3 - state anchor not found')

# ── CHANGE 4: enrichWithApollo function + useEffect trigger ─────────────────
old_fn_end = (
    "    setAutoResearchLoading(false);\n"
    "  }, []);\n"
    "\n"
    "  const downloadTemplate = React.useCallback(() => {"
)
new_fn_end = (
    "    setAutoResearchLoading(false);\n"
    "  }, []);\n"
    "\n"
    "  const enrichWithApollo = React.useCallback(async (companyName, key) => {\n"
    "    if (!key || !companyName) return;\n"
    "    setApolloEnrichLoading(true);\n"
    "    setApolloContacts([]);\n"
    "    setAddedApolloContacts([]);\n"
    "    try {\n"
    "      const res = await fetch('/api/apollo', {\n"
    "        method: 'POST',\n"
    "        headers: { 'Content-Type': 'application/json' },\n"
    "        body: JSON.stringify({\n"
    "          action: 'searchPeople',\n"
    "          apiKey: key,\n"
    "          q_organization_name: companyName,\n"
    "          person_titles: ['CEO','CFO','CTO','COO','CIO','President','Managing Director','SVP','VP','Director','Head of'],\n"
    "          per_page: 8,\n"
    "        }),\n"
    "      });\n"
    "      const data = await res.json();\n"
    "      if (data.people?.length) {\n"
    "        setApolloContacts(data.people.map(p => ({\n"
    "          name: ((p.first_name || '') + ' ' + (p.last_name || '')).trim(),\n"
    "          title: p.title || '',\n"
    "          email: p.email || '',\n"
    "          linkedin: p.linkedin_url || '',\n"
    "          department: p.departments?.[0] || '',\n"
    "          seniority: p.seniority || '',\n"
    "        })));\n"
    "      }\n"
    "    } catch(e) {}\n"
    "    setApolloEnrichLoading(false);\n"
    "  }, []);\n"
    "\n"
    "  React.useEffect(() => {\n"
    "    if (autoResearchDone && apolloApiKey && form.company) {\n"
    "      enrichWithApollo(form.company, apolloApiKey);\n"
    "    }\n"
    "  }, [autoResearchDone]);\n"
    "\n"
    "  const downloadTemplate = React.useCallback(() => {"
)
if old_fn_end in src:
    src = src.replace(old_fn_end, new_fn_end, 1)
    changes.append('Change 4 OK - enrichWithApollo + useEffect added')
else:
    changes.append('FAIL: Change 4 - function end anchor not found')

# ── CHANGE 5: Apollo connect button in header ────────────────────────────────
old_header = (
    '            <div style={{ display:"flex", gap:8, alignItems:"center" }}>\n'
    '              {dealHistory.length > 0 && ('
)
new_header = (
    '            <div style={{ display:"flex", gap:8, alignItems:"center" }}>\n'
    '              <button onClick={() => setShowApolloModal(true)} className={`apollo-connect-btn${apolloApiKey ? \' connected\' : \'\'}`}>\n'
    '                {apolloApiKey ? \'🔗 APOLLO\' : \'🔗 Apollo\'}\n'
    '              </button>\n'
    '              {dealHistory.length > 0 && ('
)
if old_header in src:
    src = src.replace(old_header, new_header, 1)
    changes.append('Change 5 OK - Apollo connect button added to header')
else:
    changes.append('FAIL: Change 5 - header anchor not found')

# ── CHANGE 6: Apollo contact cards below knownContacts textarea ──────────────
old_textarea = (
    '                  <textarea value={form.knownContacts} onChange={e => set("knownContacts", e.target.value)} style={{ minHeight: 60 }}\n'
    '                    placeholder="Who do you know there already? e.g. \'Sarah Chen — Head of Finance Transformation, met at a CFO summit. Seems interested but not sure she has budget authority.\'" />\n'
    '                </div>'
)
new_textarea = (
    '                  <textarea value={form.knownContacts} onChange={e => set("knownContacts", e.target.value)} style={{ minHeight: 60 }}\n'
    '                    placeholder="Who do you know there already? e.g. \'Sarah Chen — Head of Finance Transformation, met at a CFO summit. Seems interested but not sure she has budget authority.\'" />\n'
    '                  {apolloEnrichLoading && (\n'
    '                    <div className="apollo-loading">\n'
    '                      <span style={{ display:\'inline-block\', width:10, height:10, border:\'2px solid #A78BFA\', borderTopColor:\'transparent\', borderRadius:\'50%\', animation:\'spin 0.7s linear infinite\' }} />\n'
    '                      <span style={{ fontSize:11, color:\'#A78BFA\', fontFamily:"\'JetBrains Mono\',monospace", letterSpacing:1 }}>ENRICHING WITH APOLLO...</span>\n'
    '                    </div>\n'
    '                  )}\n'
    '                  {apolloContacts.length > 0 && !apolloEnrichLoading && (\n'
    '                    <div style={{ marginTop:12 }}>\n'
    '                      <div style={{ display:\'flex\', alignItems:\'center\', marginBottom:8 }}>\n'
    '                        <span style={{ fontSize:10, fontFamily:"\'JetBrains Mono\',monospace", letterSpacing:1.5, color:\'var(--text-dim)\', textTransform:\'uppercase\' }}>Contacts from Apollo</span>\n'
    '                        <span className="apollo-enriched-badge">🔗 LIVE</span>\n'
    '                      </div>\n'
    '                      <div className="apollo-contact-grid">\n'
    '                        {apolloContacts.map((c, i) => (\n'
    '                          <div key={i} className={`apollo-contact-card${addedApolloContacts.includes(i) ? \' added\' : \'\'}`}\n'
    '                            onClick={() => {\n'
    '                              if (!addedApolloContacts.includes(i)) {\n'
    '                                const entry = c.name + (c.title ? \' — \' + c.title : \'\') + (c.email ? \' (\' + c.email + \')\' : \'\');\n'
    '                                set(\'knownContacts\', (form.knownContacts ? form.knownContacts + \', \' : \'\') + entry);\n'
    '                                setAddedApolloContacts(prev => [...prev, i]);\n'
    '                              }\n'
    '                            }}>\n'
    '                            <div style={{ fontSize:12, fontWeight:700, color:\'var(--text)\', marginBottom:2, paddingRight:40 }}>{c.name}</div>\n'
    '                            <div style={{ fontSize:11, color:\'#A78BFA\', marginBottom:c.email ? 3 : 0, lineHeight:1.3 }}>{c.title}</div>\n'
    '                            {c.email && <div style={{ fontSize:10, color:\'var(--text-muted)\' }}>✉ {c.email}</div>}\n'
    '                            {c.department && <div style={{ fontSize:10, color:\'var(--text-dim)\', fontFamily:"\'JetBrains Mono\',monospace", marginTop:3 }}>{c.department.toUpperCase()}</div>}\n'
    '                            <div style={{ position:\'absolute\', top:10, right:10, fontSize:10, fontWeight:700, fontFamily:"\'JetBrains Mono\',monospace", color: addedApolloContacts.includes(i) ? \'var(--green)\' : \'var(--text-dim)\' }}>\n'
    '                              {addedApolloContacts.includes(i) ? \'✓\' : \'+\'}\n'
    '                            </div>\n'
    '                          </div>\n'
    '                        ))}\n'
    '                      </div>\n'
    '                      <div style={{ fontSize:11, color:\'var(--text-dim)\', marginTop:8 }}>Click any card to add to your brief</div>\n'
    '                    </div>\n'
    '                  )}\n'
    '                </div>'
)
if old_textarea in src:
    src = src.replace(old_textarea, new_textarea, 1)
    changes.append('Change 6 OK - Apollo contact cards added')
else:
    changes.append('FAIL: Change 6 - textarea anchor not found')

# ── CHANGE 7: Apollo modal JSX — insert before showExportModal block ─────────
apollo_modal_jsx = (
    '              {showApolloModal && (\n'
    '                <div className="apollo-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowApolloModal(false); }}>\n'
    '                  <div className="apollo-modal">\n'
    '                    <div style={{ display:\'flex\', alignItems:\'center\', gap:12, marginBottom:20 }}>\n'
    '                      <div className="apollo-modal-logo">🔗</div>\n'
    '                      <div style={{ flex:1 }}>\n'
    '                        <div style={{ fontSize:17, fontWeight:800, color:\'var(--text)\', fontFamily:"\'Syne\',sans-serif" }}>Connect Apollo.io</div>\n'
    '                        <div style={{ fontSize:12, color:\'var(--text-muted)\', marginTop:2 }}>Auto-enrich contacts and company data on every analysis</div>\n'
    '                      </div>\n'
    '                      <button onClick={() => setShowApolloModal(false)} style={{ background:\'transparent\', border:\'1px solid var(--border)\', borderRadius:6, padding:\'4px 10px\', color:\'var(--text-muted)\', cursor:\'pointer\', fontSize:12 }}>CLOSE</button>\n'
    '                    </div>\n'
    '                    <div style={{ background:\'rgba(124,58,237,0.06)\', border:\'1px solid rgba(124,58,237,0.14)\', borderRadius:10, padding:14, marginBottom:18 }}>\n'
    '                      <div style={{ fontSize:10, color:\'#A78BFA\', fontWeight:700, marginBottom:8, fontFamily:"\'JetBrains Mono\',monospace", letterSpacing:1.5 }}>WHAT APOLLO ADDS TO YOUR BRIEF</div>\n'
    '                      {[\'C-suite and VP-level contacts auto-populated from Apollo\',\'Work email addresses pulled directly — no manual searching\',\'Department and seniority data for sharper targeting\',\'One click to add any contact into your analysis\'].map((b,i) => (\n'
    '                        <div key={i} style={{ fontSize:12, color:\'var(--text-muted)\', marginBottom:5, display:\'flex\', gap:8, alignItems:\'flex-start\' }}>\n'
    '                          <span style={{ color:\'#A78BFA\', fontWeight:700, flexShrink:0 }}>+</span>{b}\n'
    '                        </div>\n'
    '                      ))}\n'
    '                    </div>\n'
    '                    <div style={{ marginBottom:16 }}>\n'
    '                      <label style={{ fontSize:10, fontFamily:"\'JetBrains Mono\',monospace", letterSpacing:1.5, color:\'var(--text-dim)\', display:\'block\', marginBottom:7, textTransform:\'uppercase\' }}>Your Apollo API Key</label>\n'
    '                      <input type="password" value={apolloApiKey} onChange={e => setApolloApiKey(e.target.value)}\n'
    '                        placeholder="Paste your Apollo API key here..."\n'
    '                        style={{ width:\'100%\', fontFamily:\'monospace\', fontSize:12 }} />\n'
    '                      <div style={{ fontSize:11, color:\'var(--text-dim)\', marginTop:6, lineHeight:1.6 }}>Find it in Apollo: <strong style={{ color:\'var(--text-muted)\' }}>Settings → Integrations → API → API Key</strong>. Your key is stored in your browser only — never sent to our servers.</div>\n'
    '                    </div>\n'
    '                    <div style={{ display:\'flex\', gap:8 }}>\n'
    '                      <button onClick={() => {\n'
    '                        try { localStorage.setItem(\'sia_apollo_key\', apolloApiKey); } catch(e) {}\n'
    '                        setShowApolloModal(false);\n'
    '                        if (apolloApiKey && form.company) enrichWithApollo(form.company, apolloApiKey);\n'
    '                      }} style={{ flex:1, background:\'linear-gradient(135deg,#7C3AED,#4F46E5)\', border:\'none\', borderRadius:9, padding:\'12px 20px\', color:\'white\', fontFamily:"\'Syne\',sans-serif", fontWeight:800, fontSize:13, cursor:\'pointer\', letterSpacing:0.5 }}>\n'
    '                        {apolloApiKey ? \'Save and Enrich Now\' : \'Connect Apollo\'}\n'
    '                      </button>\n'
    '                      {apolloApiKey && (\n'
    '                        <button onClick={() => { setApolloApiKey(\'\'); setApolloContacts([]); try { localStorage.removeItem(\'sia_apollo_key\'); } catch(e) {} }} style={{ background:\'rgba(239,68,68,0.08)\', border:\'1px solid rgba(239,68,68,0.25)\', borderRadius:9, padding:\'12px 16px\', color:\'#EF4444\', fontSize:12, fontWeight:700, cursor:\'pointer\' }}>DISCONNECT</button>\n'
    '                      )}\n'
    '                    </div>\n'
    '                  </div>\n'
    '                </div>\n'
    '              )}\n'
)

match = re.search(r'\{showExportModal &&', src)
if match:
    insert_pos = match.start()
    src = src[:insert_pos] + apollo_modal_jsx + src[insert_pos:]
    changes.append('Change 7 OK - Apollo modal JSX added')
else:
    changes.append('FAIL: Change 7 - showExportModal anchor not found')

with open(src_path, 'w', encoding='utf-8') as f:
    f.write(src)

failed = [c for c in changes if c.startswith('FAIL')]
for c in changes:
    print(c)

if failed:
    print('\nSome changes failed.')
    sys.exit(1)
else:
    print('\nAll changes applied. Run: npm run build 2>&1 | head -20')
