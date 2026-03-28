#!/usr/bin/env python3
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    src = f.read()

with open('src/App.jsx.backup_fix15', 'w', encoding='utf-8') as f:
    f.write(src)
print('Backup saved')

# ─── FIX 1: Add close plan state at top level (with other useState calls) ─────
c1_old = """  const [roiPreFillLoading, setRoiPreFillLoading] = useState(false);
  const [roiPreFilled, setRoiPreFilled] = useState(false);"""

c1_new = """  const [roiPreFillLoading, setRoiPreFillLoading] = useState(false);
  const [roiPreFilled, setRoiPreFilled] = useState(false);
  const [closePlan, setClosePlan] = useState(null);
  const [closePlanLoading, setClosePlanLoading] = useState(false);
  const [closeDate, setCloseDate] = useState('');"""

if c1_old in src:
    src = src.replace(c1_old, c1_new, 1)
    print('Fix 1 OK - close plan state moved to top level')
else:
    print('FAIL: Fix 1 - roiPreFill state not found')

# ─── FIX 2: Replace the IIFE pattern with direct JSX using top-level state ───
c2_old = """                  {/* Close Plan Builder */}
                  <div className="inline-section">
                    <div className="section-header" style={{ color:'var(--amber)' }}>🎯 Close Plan Builder</div>
                    <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:14, lineHeight:1.6 }}>Enter your target close date and AI builds a backwards-mapped plan — milestones, stakeholders, and actions needed to close on time.</p>
                    {(() => {
                      const [closePlan, setClosePlan] = React.useState(null);
                      const [closePlanLoading, setClosePlanLoading] = React.useState(false);
                      const [closeDate, setCloseDate] = React.useState('');
                      return (
                        <>
                          <div style={{ display:'flex', gap:10, marginBottom:14, alignItems:'center' }}>
                            <div style={{ flex:1 }}>
                              <div style={{ fontSize:9, fontWeight:700, color:'var(--text-dim)', letterSpacing:2, marginBottom:6, fontFamily:"'JetBrains Mono',monospace" }}>TARGET CLOSE DATE</div>
                              <input type="date" value={closeDate} onChange={e => setCloseDate(e.target.value)} className="input-field" style={{ width:'100%' }} />
                            </div>
                            <button onClick={async () => {
                              if (!closeDate) return;
                              setClosePlanLoading(true);
                              try {
                                const res = await fetch("/api/anthropic", { method:"POST", headers:{"Content-Type":"application/json"},
                                  body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:3000, stream:true,
                                    system:`You are a world-class enterprise sales strategist. Build a backwards-mapped close plan. Return ONLY valid JSON: {"targetCloseDate":"...","weeksToClose":8,"overallStrategy":"One sentence on the close approach","phases":[{"week":"Week 1-2","theme":"Discovery & Validation","milestone":"What must be achieved","actions":[{"action":"Specific action","owner":"Rep|Champion|EB|Procurement","priority":"critical|high|medium"}],"riskIfMissed":"What happens if this phase slips"},{"week":"Week 3-4","theme":"Technical Validation","milestone":"...","actions":[{"action":"...","owner":"...","priority":"..."}],"riskIfMissed":"..."},{"week":"Week 5-6","theme":"Business Case & EB Access","milestone":"...","actions":[{"action":"...","owner":"...","priority":"..."}],"riskIfMissed":"..."},{"week":"Week 7-8","theme":"Procurement & Close","milestone":"...","actions":[{"action":"...","owner":"...","priority":"..."}],"riskIfMissed":"..."}],"criticalPathItems":["The single most important thing that could derail this deal","Second biggest risk"],"earlyWarningSignals":["Signal that deal is slipping 1","Signal 2"]}`,
                                    messages:[{role:"user",content:`Target close date: ${closeDate}. Company: ${form.company}. Industry: ${form.industry}. Deal stage: ${form.dealStage}. Deal size: ${form.dealSize || 'TBD'}. MEDDPICC health: ${result?.meddpicc?.overallHealth || 'unknown'}. Champion score: ${result?.stakeholders?.championDevelopmentScore || 'unknown'}. Key gaps: ${result?.meddpicc?.dealRisks?.join(', ') || 'unknown'}.`}]
                                  })
                                });
                                const reader = res.body.getReader(); const decoder = new TextDecoder(); let raw = "";
                                while(true) { const {done,value} = await reader.read(); if(done) break;
                                  for(const line of decoder.decode(value,{stream:true}).split(new RegExp("\\n"))) { if(line.startsWith("data: ")) { try { const evt=JSON.parse(line.slice(6)); if(evt.type==="content_block_delta"&&evt.delta?.type==="text_delta") raw+=evt.delta.text; } catch(e){} } } }
                                const s=raw.indexOf("{"),e=raw.lastIndexOf("}"); setClosePlan(JSON.parse(raw.slice(s,e+1)));
                              } catch(e) { alert("Failed. Try again."); }
                              setClosePlanLoading(false);
                            }} disabled={closePlanLoading||!closeDate} className="btn-amber" style={{ fontSize:12, padding:'10px 20px', whiteSpace:'nowrap', marginTop:22 }}>
                              {closePlanLoading ? 'BUILDING...' : '🎯 BUILD CLOSE PLAN'}
                            </button>
                          </div>
                          {closePlan && (
                            <div className="anim-scale-in">
                              <div style={{ background:'linear-gradient(135deg,rgba(245,158,11,0.1),rgba(234,88,12,0.07))', border:'1px solid rgba(245,158,11,0.2)', borderRadius:12, padding:16, marginBottom:14 }}>
                                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:800, color:'var(--amber)' }}>Close by {closePlan.targetCloseDate}</div>
                                  <span className="tag tag-amber" style={{ fontSize:9 }}>{closePlan.weeksToClose} weeks</span>
                                </div>
                                <p style={{ fontSize:13, color:'var(--text)', lineHeight:1.6 }}>{closePlan.overallStrategy}</p>
                              </div>
                              {closePlan.phases?.map((phase, pi) => (
                                <div key={pi} style={{ border:'1px solid var(--border)', borderRadius:12, overflow:'hidden', marginBottom:10 }}>
                                  <div style={{ background:'var(--slate2)', padding:'10px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                                    <div>
                                      <span style={{ fontSize:9, fontWeight:700, color:'var(--amber)', letterSpacing:2, fontFamily:"'JetBrains Mono',monospace" }}>{phase.week} — </span>
                                      <span style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{phase.theme}</span>
                                    </div>
                                    <span className="tag tag-dim" style={{ fontSize:9 }}>✓ {phase.milestone}</span>
                                  </div>
                                  <div style={{ padding:'12px 16px' }}>
                                    {phase.actions?.map((a, ai) => (
                                      <div key={ai} style={{ display:'flex', gap:8, marginBottom:6, alignItems:'flex-start' }}>
                                        <span className={`tag ${a.priority==='critical'?'tag-red':a.priority==='high'?'tag-amber':'tag-dim'}`} style={{ fontSize:8, flexShrink:0 }}>{a.owner}</span>
                                        <span style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.5 }}>{a.action}</span>
                                      </div>
                                    ))}
                                    {phase.riskIfMissed && (
                                      <div style={{ marginTop:8, fontSize:11, color:'var(--red)', background:'var(--red-dim)', borderRadius:5, padding:'4px 8px' }}>⚠ If missed: {phase.riskIfMissed}</div>
                                    )}
                                  </div>
                                </div>
                              ))}
                              <div className="r-grid-2" style={{ marginTop:8 }}>
                                <div style={{ background:'var(--red-dim)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:8, padding:12 }}>
                                  <div style={{ fontSize:8, fontWeight:700, color:'var(--red)', letterSpacing:2, marginBottom:6, fontFamily:"'JetBrains Mono',monospace" }}>CRITICAL PATH</div>
                                  {closePlan.criticalPathItems?.map((c,i) => <div key={i} style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>→ {c}</div>)}
                                </div>
                                <div style={{ background:'var(--amber-glow)', border:'1px solid rgba(245,158,11,0.15)', borderRadius:8, padding:12 }}>
                                  <div style={{ fontSize:8, fontWeight:700, color:'var(--amber)', letterSpacing:2, marginBottom:6, fontFamily:"'JetBrains Mono',monospace" }}>EARLY WARNING SIGNALS</div>
                                  {closePlan.earlyWarningSignals?.map((s,i) => <div key={i} style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>⚠ {s}</div>)}
                                </div>
                              </div>
                              <button onClick={() => setClosePlan(null)} className="btn-ghost" style={{ marginTop:10, fontSize:11 }}>Rebuild</button>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>"""

c2_new = """                  {/* Close Plan Builder */}
                  <div className="inline-section">
                    <div className="section-header" style={{ color:'var(--amber)' }}>🎯 Close Plan Builder</div>
                    <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:14, lineHeight:1.6 }}>Enter your target close date and AI builds a backwards-mapped plan — milestones, stakeholders, and actions needed to close on time.</p>
                    <div style={{ display:'flex', gap:10, marginBottom:14, alignItems:'flex-end' }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:9, fontWeight:700, color:'var(--text-dim)', letterSpacing:2, marginBottom:6, fontFamily:"'JetBrains Mono',monospace" }}>TARGET CLOSE DATE</div>
                        <input type="date" value={closeDate} onChange={e => setCloseDate(e.target.value)} className="input-field" style={{ width:'100%' }} />
                      </div>
                      <button onClick={async () => {
                        if (!closeDate) return;
                        setClosePlanLoading(true);
                        try {
                          const res = await fetch("/api/anthropic", { method:"POST", headers:{"Content-Type":"application/json"},
                            body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:3000, stream:true,
                              system:`You are a world-class enterprise sales strategist. Build a backwards-mapped close plan. Return ONLY valid JSON: {"targetCloseDate":"...","weeksToClose":8,"overallStrategy":"One sentence on the close approach","phases":[{"week":"Week 1-2","theme":"Discovery & Validation","milestone":"What must be achieved","actions":[{"action":"Specific action","owner":"Rep|Champion|EB|Procurement","priority":"critical|high|medium"}],"riskIfMissed":"What happens if this phase slips"},{"week":"Week 3-4","theme":"Technical Validation","milestone":"...","actions":[{"action":"...","owner":"...","priority":"..."}],"riskIfMissed":"..."},{"week":"Week 5-6","theme":"Business Case & EB Access","milestone":"...","actions":[{"action":"...","owner":"...","priority":"..."}],"riskIfMissed":"..."},{"week":"Week 7-8","theme":"Procurement & Close","milestone":"...","actions":[{"action":"...","owner":"...","priority":"..."}],"riskIfMissed":"..."}],"criticalPathItems":["The single most important thing that could derail this deal","Second biggest risk"],"earlyWarningSignals":["Signal that deal is slipping 1","Signal 2"]}`,
                              messages:[{role:"user",content:`Target close date: ${closeDate}. Company: ${form.company}. Industry: ${form.industry}. Deal stage: ${form.dealStage}. Deal size: ${form.dealSize || 'TBD'}. MEDDPICC health: ${result?.meddpicc?.overallHealth || 'unknown'}. Champion score: ${result?.stakeholders?.championDevelopmentScore || 'unknown'}. Key gaps: ${result?.meddpicc?.dealRisks?.join(', ') || 'unknown'}.`}]
                            })
                          });
                          const reader = res.body.getReader(); const decoder = new TextDecoder(); let raw = "";
                          while(true) { const {done,value} = await reader.read(); if(done) break;
                            for(const line of decoder.decode(value,{stream:true}).split(new RegExp("\\n"))) { if(line.startsWith("data: ")) { try { const evt=JSON.parse(line.slice(6)); if(evt.type==="content_block_delta"&&evt.delta?.type==="text_delta") raw+=evt.delta.text; } catch(e){} } } }
                          const s=raw.indexOf("{"),e=raw.lastIndexOf("}"); setClosePlan(JSON.parse(raw.slice(s,e+1)));
                        } catch(e) { alert("Failed. Try again."); }
                        setClosePlanLoading(false);
                      }} disabled={closePlanLoading||!closeDate} className="btn-amber" style={{ fontSize:12, padding:'10px 20px', whiteSpace:'nowrap' }}>
                        {closePlanLoading ? 'BUILDING...' : '🎯 BUILD CLOSE PLAN'}
                      </button>
                    </div>
                    {closePlan && (
                      <div className="anim-scale-in">
                        <div style={{ background:'linear-gradient(135deg,rgba(245,158,11,0.1),rgba(234,88,12,0.07))', border:'1px solid rgba(245,158,11,0.2)', borderRadius:12, padding:16, marginBottom:14 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:800, color:'var(--amber)' }}>Close by {closePlan.targetCloseDate}</div>
                            <span className="tag tag-amber" style={{ fontSize:9 }}>{closePlan.weeksToClose} weeks</span>
                          </div>
                          <p style={{ fontSize:13, color:'var(--text)', lineHeight:1.6 }}>{closePlan.overallStrategy}</p>
                        </div>
                        {closePlan.phases?.map((phase, pi) => (
                          <div key={pi} style={{ border:'1px solid var(--border)', borderRadius:12, overflow:'hidden', marginBottom:10 }}>
                            <div style={{ background:'var(--slate2)', padding:'10px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                              <div>
                                <span style={{ fontSize:9, fontWeight:700, color:'var(--amber)', letterSpacing:2, fontFamily:"'JetBrains Mono',monospace" }}>{phase.week} — </span>
                                <span style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{phase.theme}</span>
                              </div>
                              <span className="tag tag-dim" style={{ fontSize:9 }}>✓ {phase.milestone}</span>
                            </div>
                            <div style={{ padding:'12px 16px' }}>
                              {phase.actions?.map((a, ai) => (
                                <div key={ai} style={{ display:'flex', gap:8, marginBottom:6, alignItems:'flex-start' }}>
                                  <span className={`tag ${a.priority==='critical'?'tag-red':a.priority==='high'?'tag-amber':'tag-dim'}`} style={{ fontSize:8, flexShrink:0 }}>{a.owner}</span>
                                  <span style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.5 }}>{a.action}</span>
                                </div>
                              ))}
                              {phase.riskIfMissed && (
                                <div style={{ marginTop:8, fontSize:11, color:'var(--red)', background:'var(--red-dim)', borderRadius:5, padding:'4px 8px' }}>⚠ If missed: {phase.riskIfMissed}</div>
                              )}
                            </div>
                          </div>
                        ))}
                        <div className="r-grid-2" style={{ marginTop:8 }}>
                          <div style={{ background:'var(--red-dim)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:8, padding:12 }}>
                            <div style={{ fontSize:8, fontWeight:700, color:'var(--red)', letterSpacing:2, marginBottom:6, fontFamily:"'JetBrains Mono',monospace" }}>CRITICAL PATH</div>
                            {closePlan.criticalPathItems?.map((c,i) => <div key={i} style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>→ {c}</div>)}
                          </div>
                          <div style={{ background:'var(--amber-glow)', border:'1px solid rgba(245,158,11,0.15)', borderRadius:8, padding:12 }}>
                            <div style={{ fontSize:8, fontWeight:700, color:'var(--amber)', letterSpacing:2, marginBottom:6, fontFamily:"'JetBrains Mono',monospace" }}>EARLY WARNING SIGNALS</div>
                            {closePlan.earlyWarningSignals?.map((s,i) => <div key={i} style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>⚠ {s}</div>)}
                          </div>
                        </div>
                        <button onClick={() => setClosePlan(null)} className="btn-ghost" style={{ marginTop:10, fontSize:11 }}>Rebuild</button>
                      </div>
                    )}
                  </div>"""

if c2_old in src:
    src = src.replace(c2_old, c2_new, 1)
    print('Fix 2 OK - Close Plan Builder rewritten without IIFE hooks')
else:
    print('FAIL: Fix 2 - Close Plan Builder IIFE not found')

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(src)
print('Done. Run: npm run build 2>&1 | head -20')
