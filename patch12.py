#!/usr/bin/env python3
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    src = f.read()

with open('src/App.jsx.backup_ai3', 'w', encoding='utf-8') as f:
    f.write(src)
print('Backup saved')

ok = True

# ─── CHANGE 1: Email tone auto-set from market + industry in autoResearchCompany
c1_old = """        if (parsed.competitorsMentioned) {
          const chips = parsed.competitorsMentioned.split(',').map(c => c.trim()).filter(Boolean);
          setSuggestedCompetitors(chips);
        }
        setAutoResearchDone(true);"""

c1_new = """        if (parsed.competitorsMentioned) {
          const chips = parsed.competitorsMentioned.split(',').map(c => c.trim()).filter(Boolean);
          setSuggestedCompetitors(chips);
        }
        // Auto-set email tone from market + industry
        const mkt = (parsed.market || '').toLowerCase();
        const ind = (parsed.industry || '').toLowerCase();
        const formalMarkets = ['singapore','hong kong','japan','south korea','taiwan','germany','switzerland','uae','saudi arabia','qatar'];
        const formalIndustries = ['financial services','banking','insurance','government','public sector','healthcare','pharma'];
        const directIndustries = ['erp','hcm','cybersecurity','data'];
        const warmIndustries = ['telco','media','tech','retail','ecommerce','fintech','payments'];
        if (formalMarkets.some(m => mkt.includes(m)) || formalIndustries.some(i => ind.includes(i))) {
          setEmailTone('formal');
        } else if (warmIndustries.some(i => ind.includes(i))) {
          setEmailTone('warm');
        } else if (directIndustries.some(i => ind.includes(i))) {
          setEmailTone('direct');
        }
        setAutoResearchDone(true);"""

if c1_old in src:
    src = src.replace(c1_old, c1_new, 1)
    print('Change 1 OK - email tone auto-set from market + industry')
else:
    print('FAIL: Change 1 - string not found')
    ok = False

# ─── CHANGE 2: ROI pre-fill state ────────────────────────────────────────────
c2_old = """  const [roiInputs, setRoiInputs] = useState({ employees: "", avgSalary: "", hoursPerWeek: "", currentErrors: "", dealSize: "" });"""

c2_new = """  const [roiInputs, setRoiInputs] = useState({ employees: "", avgSalary: "", hoursPerWeek: "", currentErrors: "", dealSize: "" });
  const [roiPreFillLoading, setRoiPreFillLoading] = useState(false);
  const [roiPreFilled, setRoiPreFilled] = useState(false);"""

if c2_old in src:
    src = src.replace(c2_old, c2_new, 1)
    print('Change 2 OK - ROI pre-fill state added')
else:
    print('FAIL: Change 2 - string not found')
    ok = False

# ─── CHANGE 3: ROI pre-fill button above calculator ──────────────────────────
c3_old = """                  <div className="card" style={{ marginBottom:20 }}>
                    <div className="card-title">💰 ROI Calculator</div>
                    <div className="r-grid-2" style={{ marginBottom:20 }}>
                      {[['employees','Team Size Affected','e.g. 25'],['avgSalary','Avg Annual Salary (USD)','e.g. 85000'],['hoursPerWeek','Hrs/Week Manual Work','e.g. 12'],['currentErrors','Annual Error/Risk Cost (USD)','e.g. 250000'],['revenueUpside','Revenue Upside (USD)','e.g. 500000'],['dealSize','Solution ACV (USD)','e.g. 200000']].map(([key,label,ph]) => ("""

c3_new = """                  <div className="card" style={{ marginBottom:20 }}>
                    <div className="card-title">💰 ROI Calculator</div>
                    {!roiPreFilled && (
                      <div style={{ marginBottom:16, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background:'rgba(96,165,250,0.06)', border:'1px solid rgba(96,165,250,0.15)', borderRadius:8 }}>
                        <div>
                          <div style={{ fontSize:12, fontWeight:700, color:'var(--blue-light)' }}>AI can estimate baseline figures</div>
                          <div style={{ fontSize:11, color:'var(--text-muted)' }}>Based on {form.company}'s industry and size — edit after</div>
                        </div>
                        <button className="gen-btn" style={{ fontSize:11, padding:'6px 14px', flexShrink:0, marginLeft:12 }}
                          onClick={async () => {
                            setRoiPreFillLoading(true);
                            try {
                              const res = await fetch("/api/anthropic", { method:"POST", headers:{"Content-Type":"application/json"},
                                body: JSON.stringify({ model:"claude-haiku-4-5-20251001", max_tokens:400,
                                  system:`Estimate ROI calculator inputs for a B2B SaaS sale. Return ONLY valid JSON: {"employees":"number of finance/ops staff affected","avgSalary":"average annual salary USD as number","hoursPerWeek":"hours per week spent on manual work as number","currentErrors":"annual cost of errors and compliance risk USD as number","dealSize":"estimated ACV USD as number based on company size"}`,
                                  messages:[{role:"user",content:`Company: ${form.company}. Industry: ${form.industry}. Market: ${form.market}. Deal size target: ${form.dealSize || 'unknown'}. Product: ${form.product}. Estimate realistic ROI inputs.`}]
                                })
                              });
                              const data = await res.json();
                              const raw = data.content?.map(b=>b.text||'').join('')||'{}';
                              const s=raw.indexOf('{'),e=raw.lastIndexOf('}');
                              if(s!==-1&&e!==-1) {
                                const parsed = JSON.parse(raw.slice(s,e+1));
                                setRoiInputs(prev => ({
                                  ...prev,
                                  employees: parsed.employees || prev.employees,
                                  avgSalary: parsed.avgSalary || prev.avgSalary,
                                  hoursPerWeek: parsed.hoursPerWeek || prev.hoursPerWeek,
                                  currentErrors: parsed.currentErrors || prev.currentErrors,
                                  dealSize: parsed.dealSize || prev.dealSize,
                                }));
                                setRoiPreFilled(true);
                              }
                            } catch(err) {}
                            setRoiPreFillLoading(false);
                          }}
                          disabled={roiPreFillLoading}
                        >
                          {roiPreFillLoading ? '⏳ Estimating...' : '✨ AI Estimate'}
                        </button>
                      </div>
                    )}
                    {roiPreFilled && (
                      <div style={{ marginBottom:12, display:'flex', gap:6, alignItems:'center' }}>
                        <span style={{ fontSize:10, color:'var(--green)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:1 }}>✓ AI ESTIMATED —</span>
                        <span style={{ fontSize:11, color:'var(--text-muted)' }}>review and adjust before calculating</span>
                        <button onClick={() => setRoiPreFilled(false)} style={{ fontSize:10, color:'var(--text-dim)', background:'none', border:'none', cursor:'pointer', marginLeft:'auto' }}>Re-estimate</button>
                      </div>
                    )}
                    <div className="r-grid-2" style={{ marginBottom:20 }}>
                      {[['employees','Team Size Affected','e.g. 25'],['avgSalary','Avg Annual Salary (USD)','e.g. 85000'],['hoursPerWeek','Hrs/Week Manual Work','e.g. 12'],['currentErrors','Annual Error/Risk Cost (USD)','e.g. 250000'],['revenueUpside','Revenue Upside (USD)','e.g. 500000'],['dealSize','Solution ACV (USD)','e.g. 200000']].map(([key,label,ph]) => ("""

if c3_old in src:
    src = src.replace(c3_old, c3_new, 1)
    print('Change 3 OK - ROI AI estimate button added')
else:
    print('FAIL: Change 3 - string not found')
    ok = False

# ─── CHANGE 4: Transcript Analyser UI in Coach tab ───────────────────────────
c4_old = """                <div className="fade-up">
                  <div className="chat-window">"""

c4_new = """                <div className="fade-up">
                  {/* ── TRANSCRIPT ANALYSER ── */}
                  <div className="card" style={{ marginBottom:20 }}>
                    <div className="card-title" style={{ color:'var(--blue-light)' }}>📝 Transcript Analyser</div>
                    <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:14, lineHeight:1.6 }}>Paste a call transcript and get MEDDPICC signals, coaching notes, follow-up email and next actions — plus your deal score updates automatically.</p>
                    {!transcriptResult ? (
                      <>
                        <textarea
                          placeholder="Paste your call transcript here — Gong, Zoom, Teams, or manual notes..."
                          value={transcript}
                          onChange={e => setTranscript(e.target.value)}
                          style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 12px', color:'var(--text)', fontSize:13, outline:'none', minHeight:120, resize:'vertical', lineHeight:1.6, marginBottom:10, boxSizing:'border-box' }}
                        />
                        <button
                          onClick={async () => {
                            if (!transcript.trim()) return;
                            setTranscriptLoading(true);
                            setMeddpiccUpdated(false);
                            try {
                              const r = await analyseTranscript(transcript, form, result);
                              setTranscriptResult(r);
                              if (r && result) {
                                updateMeddpiccFromTranscript(r, result, setResult);
                                setMeddpiccUpdated(true);
                              }
                            } catch(e) { alert('Analysis failed. Try again.'); }
                            setTranscriptLoading(false);
                          }}
                          disabled={transcriptLoading || !transcript.trim()}
                          className="btn-amber"
                          style={{ fontSize:12, padding:'10px 24px' }}
                        >
                          {transcriptLoading ? '⏳ ANALYSING...' : '📝 ANALYSE TRANSCRIPT'}
                        </button>
                      </>
                    ) : (
                      <div className="anim-scale-in">
                        {meddpiccUpdated && (
                          <div style={{ marginBottom:12, padding:'10px 14px', background:'var(--green-dim)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:8, display:'flex', gap:8, alignItems:'center' }}>
                            <span>✓</span>
                            <div>
                              <div style={{ fontSize:12, fontWeight:700, color:'var(--green)' }}>MEDDPICC Updated</div>
                              <div style={{ fontSize:11, color:'var(--text-muted)' }}>Deal Intel tab refreshed with new signals from this call.</div>
                            </div>
                          </div>
                        )}
                        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:10, padding:14, marginBottom:12 }}>
                          <div style={{ fontSize:8, fontWeight:700, color:'var(--amber)', letterSpacing:2, marginBottom:6, fontFamily:"'JetBrains Mono',monospace" }}>CALL SUMMARY</div>
                          <p style={{ fontSize:13, color:'var(--text)', lineHeight:1.7 }}>{transcriptResult.summary}</p>
                        </div>
                        <div className="r-grid-2" style={{ marginBottom:12 }}>
                          {transcriptResult.positiveSignals?.length > 0 && (
                            <div style={{ background:'var(--green-dim)', border:'1px solid rgba(16,185,129,0.15)', borderRadius:10, padding:14 }}>
                              <div style={{ fontSize:8, fontWeight:700, color:'var(--green)', letterSpacing:2, marginBottom:8, fontFamily:"'JetBrains Mono',monospace" }}>BUYING SIGNALS</div>
                              {transcriptResult.positiveSignals.map((s,i) => <div key={i} style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>✓ {s}</div>)}
                            </div>
                          )}
                          {transcriptResult.redFlags?.length > 0 && (
                            <div style={{ background:'var(--red-dim)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:10, padding:14 }}>
                              <div style={{ fontSize:8, fontWeight:700, color:'var(--red)', letterSpacing:2, marginBottom:8, fontFamily:"'JetBrains Mono',monospace" }}>RED FLAGS</div>
                              {transcriptResult.redFlags.map((f,i) => <div key={i} style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>⚠ {f}</div>)}
                            </div>
                          )}
                        </div>
                        {transcriptResult.coachingNote && (
                          <div style={{ background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:10, padding:14, marginBottom:12 }}>
                            <div style={{ fontSize:8, fontWeight:700, color:'var(--amber)', letterSpacing:2, marginBottom:6, fontFamily:"'JetBrains Mono',monospace" }}>COACHING NOTE</div>
                            <p style={{ fontSize:13, color:'var(--text)', lineHeight:1.6 }}>{transcriptResult.coachingNote}</p>
                          </div>
                        )}
                        {transcriptResult.nextActions?.length > 0 && (
                          <div style={{ marginBottom:12 }}>
                            <div style={{ fontSize:8, fontWeight:700, color:'var(--blue-light)', letterSpacing:2, marginBottom:8, fontFamily:"'JetBrains Mono',monospace" }}>NEXT ACTIONS</div>
                            {transcriptResult.nextActions.map((a,i) => (
                              <div key={i} style={{ display:'flex', gap:10, marginBottom:6, alignItems:'flex-start' }}>
                                <span className={`tag ${a.owner==='You'?'tag-amber':'tag-blue'}`} style={{ fontSize:9, flexShrink:0 }}>{a.owner}</span>
                                <div>
                                  <div style={{ fontSize:12, color:'var(--text)' }}>{a.action}</div>
                                  <div style={{ fontSize:11, color:'var(--text-dim)' }}>{a.timeframe}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {transcriptResult.followUpEmail && (
                          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:10, padding:14, marginBottom:12 }}>
                            <div style={{ fontSize:8, fontWeight:700, color:'var(--green)', letterSpacing:2, marginBottom:8, fontFamily:"'JetBrains Mono',monospace" }}>FOLLOW-UP EMAIL</div>
                            <div style={{ fontSize:11, color:'var(--text-dim)', marginBottom:4 }}>Subject: {transcriptResult.followUpEmail.subject}</div>
                            <p style={{ fontSize:13, color:'var(--text)', lineHeight:1.75, whiteSpace:'pre-line', marginBottom:10 }}>{transcriptResult.followUpEmail.body}</p>
                            <button className="copy-btn" onClick={() => navigator.clipboard.writeText('Subject: ' + transcriptResult.followUpEmail.subject + '\n\n' + transcriptResult.followUpEmail.body)}>COPY EMAIL</button>
                          </div>
                        )}
                        <button onClick={() => { setTranscriptResult(null); setTranscript(''); setMeddpiccUpdated(false); }} className="btn-ghost" style={{ fontSize:11 }}>Analyse Another</button>
                      </div>
                    )}
                  </div>

                  {/* ── DEAL COACH CHAT ── */}
                  <div className="chat-window">"""

if c4_old in src:
    src = src.replace(c4_old, c4_new, 1)
    print('Change 4 OK - Transcript Analyser UI added to Coach tab')
else:
    print('FAIL: Change 4 - string not found')
    ok = False

# Write file
with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(src)

if ok:
    print('\nAll changes written. Run: npm run build 2>&1 | head -20')
else:
    print('\nSome changes failed. File written with successful changes.')
