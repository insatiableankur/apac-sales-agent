#!/usr/bin/env python3
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    src = f.read()

with open('src/App.jsx.backup2', 'w', encoding='utf-8') as f:
    f.write(src)
print('Backup saved to src/App.jsx.backup2')

# ─── CHANGE 1: NEWS AUTO-RUNS IN MAIN ANALYSIS ───────────────────────────────
c1_old = """      const [part1, part2, part3, part4] = await Promise.all([
        reliableCall(prompt, sys1),
        reliableCall(prompt, sys2),
        reliableCall(prompt, sys3),
        reliableCall(prompt, sys4),
      ]);"""

c1_new = """      // 5th parallel call: auto-fetch news triggers
      const newsCall = async () => {
        try {
          const r = await fetch("/api/anthropic", { method:"POST", headers:{"Content-Type":"application/json"},
            body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:2000,
              tools:[{type:"web_search_20250305",name:"web_search"}],
              system:`Search for the latest news about this company. Return ONLY valid JSON: {"lastUpdated":"today","triggers":[{"type":"Leadership Change|M&A|Regulatory|Earnings|Strategy|Technology|Risk","headline":"...","detail":"...","salesAngle":"How to use this in a sales conversation","urgency":"high|medium|low"}],"buyingSignals":["Signal 1","Signal 2"],"risks":["Risk 1","Risk 2"],"conversationStarter":"Exact opening line referencing recent news"}`,
              messages:[{role:"user",content:`Find the latest news, announcements, financial results, leadership changes, regulatory issues and strategic initiatives for ${form.company} in ${form.market}. Search for "${form.company} news 2025", "${form.company} results", "${form.company} strategy". What has happened in the last 3 months that a sales rep should know about?`}]
            })
          });
          const d = await r.json();
          const t = d.content?.filter(b=>b.type==='text').map(b=>b.text).join('')||'{}';
          const s=t.indexOf('{'),e=t.lastIndexOf('}');
          if(s!==-1&&e!==-1) return JSON.parse(t.slice(s,e+1));
        } catch(err) {}
        return null;
      };

      const [part1, part2, part3, part4, newsData] = await Promise.all([
        reliableCall(prompt, sys1),
        reliableCall(prompt, sys2),
        reliableCall(prompt, sys3),
        reliableCall(prompt, sys4),
        newsCall(),
      ]);
      if (newsData) setNewsTriggers(newsData);"""

if c1_old in src:
    src = src.replace(c1_old, c1_new, 1)
    print('Change 1 OK - news auto-runs in main analysis')
else:
    print('FAIL: Change 1 - string not found')

# ─── CHANGE 2a: suggestedCompetitors state ───────────────────────────────────
c2a_old = """  const [autoResearchLoading, setAutoResearchLoading] = useState(false);
  const [autoResearchDone, setAutoResearchDone] = useState(false);"""

c2a_new = """  const [autoResearchLoading, setAutoResearchLoading] = useState(false);
  const [autoResearchDone, setAutoResearchDone] = useState(false);
  const [suggestedCompetitors, setSuggestedCompetitors] = useState([]);"""

if c2a_old in src:
    src = src.replace(c2a_old, c2a_new, 1)
    print('Change 2a OK - suggestedCompetitors state added')
else:
    print('FAIL: Change 2a - string not found')

# ─── CHANGE 2b: set suggested competitors in autoResearchCompany ──────────────
c2b_old = """        setForm(prev => ({
          ...prev,
          website: parsed.website || prev.website,
          market: MARKETS.includes(parsed.market) ? parsed.market : prev.market,
          industry: INDUSTRIES.includes(parsed.industry) ? parsed.industry : prev.industry,
          recentNews: parsed.recentNews || prev.recentNews,
          knownContacts: parsed.knownContacts || prev.knownContacts,
          competitorsMentioned: parsed.competitorsMentioned || prev.competitorsMentioned,
        }));
        setAutoResearchDone(true);"""

c2b_new = """        setForm(prev => ({
          ...prev,
          website: parsed.website || prev.website,
          market: MARKETS.includes(parsed.market) ? parsed.market : prev.market,
          industry: INDUSTRIES.includes(parsed.industry) ? parsed.industry : prev.industry,
          recentNews: parsed.recentNews || prev.recentNews,
          knownContacts: parsed.knownContacts || prev.knownContacts,
          competitorsMentioned: parsed.competitorsMentioned || prev.competitorsMentioned,
        }));
        if (parsed.competitorsMentioned) {
          const chips = parsed.competitorsMentioned.split(',').map(c => c.trim()).filter(Boolean);
          setSuggestedCompetitors(chips);
        }
        setAutoResearchDone(true);"""

if c2b_old in src:
    src = src.replace(c2b_old, c2b_new, 1)
    print('Change 2b OK - competitors chips logic added')
else:
    print('FAIL: Change 2b - string not found')

# ─── CHANGE 2c: competitor chips UI ──────────────────────────────────────────
c2c_old = """                  <input type="text" value={form.competitorsMentioned} onChange={e => set("competitorsMentioned", e.target.value)}
                    placeholder="e.g. SAP BPC, Oracle Hyperion, Workiva, Vena Solutions, or 'not known yet'" />"""

c2c_new = """                  <input type="text" value={form.competitorsMentioned} onChange={e => set("competitorsMentioned", e.target.value)}
                    placeholder="e.g. SAP BPC, Oracle Hyperion, Workiva, Vena Solutions, or 'not known yet'" />
                  {suggestedCompetitors.length > 0 && !form.competitorsMentioned && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1, marginBottom: 6 }}>AI SUGGESTED — click to add:</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {suggestedCompetitors.map((comp, i) => (
                          <button key={i} onClick={() => set('competitorsMentioned', comp)}
                            style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(245,158,11,0.3)', background: 'var(--amber-glow)', color: 'var(--amber)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace" }}>
                            + {comp}
                          </button>
                        ))}
                        <button onClick={() => set('competitorsMentioned', suggestedCompetitors.join(', '))}
                          style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(96,165,250,0.3)', background: 'rgba(96,165,250,0.08)', color: 'var(--blue-light)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                          Add all
                        </button>
                      </div>
                    </div>
                  )}"""

if c2c_old in src:
    src = src.replace(c2c_old, c2c_new, 1)
    print('Change 2c OK - competitor chips UI added')
else:
    print('FAIL: Change 2c - string not found')

# ─── CHANGE 3: MEDDPICC FREE-TEXT ────────────────────────────────────────────
c3_old = """              <div className="card fade-up-4" style={{ background:"rgba(26,86,219,0.06)", border:"1px solid rgba(26,86,219,0.2)", marginBottom:24 }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:800, color:"var(--blue-light)", marginBottom:4, letterSpacing:1 }}>MEDDPICC CALIBRATION</div>
                <div style={{ fontSize:11, color:"var(--text-muted)", marginBottom:16 }}>Answer to get more accurate MEDDPICC scoring. Skip any you don't know yet.</div>
                {[
                  ["budgetConfirmed", "Budget confirmed or allocated?", "e.g. Yes - $500K approved / No / Under discussion"],
                  ["ebIdentified", "Economic Buyer identified?", "e.g. Yes - CFO John Smith / No / Suspected"],
                  ["timelineDefined", "Compelling event or deadline?", "e.g. Go-live by Q3 / Board approval by June / No deadline"],
                  ["competitorsKnown", "Competitors actively involved?", "e.g. SAP shortlisted / Oracle evaluated / None known"],
                  ["painQuantified", "Pain quantified in $ terms?", "e.g. $2M/year in manual costs / Not yet quantified"],
                ].map(([key, label, ph]) => (
                  <div key={key} style={{ marginBottom:10 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"var(--text-muted)", letterSpacing:1, marginBottom:4 }}>{label.toUpperCase()}</div>
                    <input type="text" placeholder={ph} value={meddQual[key]} onChange={e => setMeddQual(p => ({...p, [key]: e.target.value}))}
                      style={{ width:"100%", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 12px", color:"var(--text)", fontSize:12, boxSizing:"border-box" }} />
                  </div>
                ))}
              </div>"""

c3_new = """              <div className="card fade-up-4" style={{ background:"rgba(26,86,219,0.06)", border:"1px solid rgba(26,86,219,0.2)", marginBottom:24 }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:800, color:"var(--blue-light)", marginBottom:4, letterSpacing:1 }}>MEDDPICC CALIBRATION</div>
                <div style={{ fontSize:11, color:"var(--text-muted)", marginBottom:12 }}>Tell AI what you know about this deal — it will extract the key signals automatically.</div>
                <textarea
                  placeholder={"e.g. Budget of $300K approved by CFO John Smith who I met last week. Competing against SAP and Oracle. Need to go live by Q3 for a regulatory deadline. Pain is $2M/year in manual reporting costs."}
                  value={meddQual._freeText || ''}
                  onChange={e => setMeddQual(p => ({...p, _freeText: e.target.value}))}
                  onBlur={async e => {
                    const text = e.target.value;
                    if (!text || text.length < 20) return;
                    try {
                      const res = await fetch("/api/anthropic", { method:"POST", headers:{"Content-Type":"application/json"},
                        body: JSON.stringify({ model:"claude-haiku-4-5-20251001", max_tokens:500,
                          system:`Extract MEDDPICC signals from this deal description. Return ONLY valid JSON: {"budgetConfirmed":"...","ebIdentified":"...","timelineDefined":"...","competitorsKnown":"...","painQuantified":"..."}`,
                          messages:[{role:"user",content:text}]
                        })
                      });
                      const data = await res.json();
                      const raw = data.content?.map(b=>b.text||'').join('')||'{}';
                      const s=raw.indexOf('{'),e2=raw.lastIndexOf('}');
                      if(s!==-1&&e2!==-1) {
                        const parsed = JSON.parse(raw.slice(s,e2+1));
                        setMeddQual(prev => ({...prev, ...parsed, _freeText: text}));
                      }
                    } catch(err) {}
                  }}
                  style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid var(--border)", borderRadius:8, padding:"10px 12px", color:"var(--text)", fontSize:13, minHeight:90, resize:"vertical", lineHeight:1.7, boxSizing:"border-box", outline:"none" }}
                />
                {(meddQual.budgetConfirmed || meddQual.ebIdentified || meddQual.timelineDefined) && (
                  <div style={{ marginTop:10, display:'flex', gap:6, flexWrap:'wrap' }}>
                    <span style={{ fontSize:9, color:'var(--green)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:1 }}>✓ AI EXTRACTED —</span>
                    {meddQual.budgetConfirmed && <span className="tag tag-green" style={{ fontSize:9 }}>Budget</span>}
                    {meddQual.ebIdentified && <span className="tag tag-green" style={{ fontSize:9 }}>Econ Buyer</span>}
                    {meddQual.timelineDefined && <span className="tag tag-green" style={{ fontSize:9 }}>Timeline</span>}
                    {meddQual.competitorsKnown && <span className="tag tag-green" style={{ fontSize:9 }}>Competitors</span>}
                    {meddQual.painQuantified && <span className="tag tag-green" style={{ fontSize:9 }}>Pain $</span>}
                  </div>
                )}
              </div>"""

if c3_old in src:
    src = src.replace(c3_old, c3_new, 1)
    print('Change 3 OK - MEDDPICC free-text conversational input')
else:
    print('FAIL: Change 3 - string not found')

# ─── CHANGE 4: updateMeddpiccFromTranscript function ─────────────────────────
c4_old = """const analyseTranscript = async (text, form, result) => {"""

c4_new = """const updateMeddpiccFromTranscript = (transcriptResult, currentResult, setResult) => {
  if (!transcriptResult?.meddpiccSignals || !currentResult?.meddpicc?.elements) return;
  const signals = transcriptResult.meddpiccSignals;
  const keyMap = { metrics:'metrics', economicBuyer:'economicBuyer', decisionCriteria:'decisionCriteria', decisionProcess:'decisionProcess', champion:'champion', competition:'competition' };
  const updated = JSON.parse(JSON.stringify(currentResult));
  Object.entries(keyMap).forEach(([sigKey, elKey]) => {
    if (signals[sigKey] && updated.meddpicc.elements[elKey]) {
      const signal = signals[sigKey].toLowerCase();
      updated.meddpicc.elements[elKey].evidence = signals[sigKey];
      if (signal.includes('confirmed') || signal.includes('identified') || signal.includes('agreed') || signal.includes('clear')) {
        updated.meddpicc.elements[elKey].status = 'green';
      } else if (!signal.includes('unknown') && !signal.includes('not ') && !signal.includes('missing')) {
        if (updated.meddpicc.elements[elKey].status === 'red') updated.meddpicc.elements[elKey].status = 'amber';
      }
    }
  });
  if (transcriptResult.dealHealthChange === 'improved') {
    updated.meddpicc.overallHealth = updated.meddpicc.overallHealth === 'red' ? 'amber' : 'green';
  } else if (transcriptResult.dealHealthChange === 'deteriorated') {
    updated.meddpicc.overallHealth = updated.meddpicc.overallHealth === 'green' ? 'amber' : 'red';
  }
  setResult(updated);
};

const analyseTranscript = async (text, form, result) => {"""

if c4_old in src:
    src = src.replace(c4_old, c4_new, 1)
    print('Change 4 OK - updateMeddpiccFromTranscript function added')
else:
    print('FAIL: Change 4 - string not found')

# Write file
with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(src)
print('\nAll changes written. Now run: npm run build 2>&1 | head -20')
