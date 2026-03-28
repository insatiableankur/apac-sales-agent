#!/usr/bin/env python3
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    src = f.read()

with open('src/App.jsx.backup_p14', 'w', encoding='utf-8') as f:
    f.write(src)
print('Backup saved')

ok = True

# ─── CHANGE 1: Tech stack detection in autoResearchCompany ───────────────────
c1_old = """            content: `Research the company "${companyName}". Search for "${companyName} overview", "${companyName} CEO leadership", "${companyName} news 2025". Return ONLY valid JSON: {"website":"url","market":"EXACTLY one of: Singapore, Malaysia, Philippines, India, Indonesia, Thailand, Hong Kong, Vietnam, Australia, South Korea, Japan, Taiwan, New Zealand, UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman, Egypt, South Africa, Nigeria, Kenya, United Kingdom, Germany, France, Netherlands, Sweden, Norway, Denmark, Finland, Spain, Italy, Switzerland, United States, Canada, Brazil, Mexico, Global / Multi-Country","industry":"EXACTLY one of: Financial Services / Banking, Insurance / Insurtech, Fintech / Payments, HCM / HR Technology, ERP / Finance Systems, Retail / CPG / Ecommerce, Logistics / Supply Chain, Healthcare / Pharma, Telco / Media / Tech, Real Estate / PropTech, Energy / Resources, Manufacturing, Professional Services, Government / Public Sector","recentNews":"2-3 sentences of key 2024-2025 news with dates and figures","knownContacts":"Top 3-4 C-suite names and titles comma separated","competitorsMentioned":"2-3 main competitors comma separated"}`"""

c1_new = """            content: `Research the company "${companyName}". Search for "${companyName} overview", "${companyName} CEO leadership", "${companyName} news 2025", "${companyName} technology stack", "${companyName} software jobs". Return ONLY valid JSON: {"website":"url","market":"EXACTLY one of: Singapore, Malaysia, Philippines, India, Indonesia, Thailand, Hong Kong, Vietnam, Australia, South Korea, Japan, Taiwan, New Zealand, UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman, Egypt, South Africa, Nigeria, Kenya, United Kingdom, Germany, France, Netherlands, Sweden, Norway, Denmark, Finland, Spain, Italy, Switzerland, United States, Canada, Brazil, Mexico, Global / Multi-Country","industry":"EXACTLY one of: Financial Services / Banking, Insurance / Insurtech, Fintech / Payments, HCM / HR Technology, ERP / Finance Systems, Retail / CPG / Ecommerce, Logistics / Supply Chain, Healthcare / Pharma, Telco / Media / Tech, Real Estate / PropTech, Energy / Resources, Manufacturing, Professional Services, Government / Public Sector","recentNews":"2-3 sentences of key 2024-2025 news with dates and figures","knownContacts":"Top 3-4 C-suite names and titles comma separated","competitorsMentioned":"2-3 main competitors comma separated","techStack":"Known or inferred tools: ERP, CRM, Finance, HR, Analytics platforms in use — e.g. SAP, Salesforce, Workday, Oracle. Infer from job postings and public signals. 4-6 tools comma separated","likelyReplacing":"What legacy system or process they are most likely looking to replace or modernise based on their industry and size"}`"""

if c1_old in src:
    src = src.replace(c1_old, c1_new, 1)
    print('Change 1a OK - tech stack added to research prompt')
else:
    print('FAIL: Change 1a - research prompt not found')
    ok = False

# Store tech stack in form state
c1b_old = """        setForm(prev => ({
          ...prev,
          website: parsed.website || prev.website,
          market: MARKETS.includes(parsed.market) ? parsed.market : prev.market,
          industry: INDUSTRIES.includes(parsed.industry) ? parsed.industry : prev.industry,
          recentNews: parsed.recentNews || prev.recentNews,
          knownContacts: parsed.knownContacts || prev.knownContacts,
          competitorsMentioned: parsed.competitorsMentioned || prev.competitorsMentioned,
        }));"""

c1b_new = """        setForm(prev => ({
          ...prev,
          website: parsed.website || prev.website,
          market: MARKETS.includes(parsed.market) ? parsed.market : prev.market,
          industry: INDUSTRIES.includes(parsed.industry) ? parsed.industry : prev.industry,
          recentNews: parsed.recentNews || prev.recentNews,
          knownContacts: parsed.knownContacts || prev.knownContacts,
          competitorsMentioned: parsed.competitorsMentioned || prev.competitorsMentioned,
        }));
        if (parsed.techStack) setTechStack({ tools: parsed.techStack, likelyReplacing: parsed.likelyReplacing || '' });"""

if c1b_old in src:
    src = src.replace(c1b_old, c1b_new, 1)
    print('Change 1b OK - tech stack stored in state')
else:
    print('FAIL: Change 1b - setForm block not found')
    ok = False

# Add techStack state
c1c_old = """  const [autoResearchLoading, setAutoResearchLoading] = useState(false);
  const [autoResearchDone, setAutoResearchDone] = useState(false);
  const [suggestedCompetitors, setSuggestedCompetitors] = useState([]);"""

c1c_new = """  const [autoResearchLoading, setAutoResearchLoading] = useState(false);
  const [autoResearchDone, setAutoResearchDone] = useState(false);
  const [suggestedCompetitors, setSuggestedCompetitors] = useState([]);
  const [techStack, setTechStack] = useState(null);"""

if c1c_old in src:
    src = src.replace(c1c_old, c1c_new, 1)
    print('Change 1c OK - techStack state added')
else:
    print('FAIL: Change 1c - state block not found')
    ok = False

# Show tech stack in auto-fill confirmation chips
c1d_old = """                  {autoResearchDone && (
                    <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: 'var(--green)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }}>✓ AUTO-FILLED —</span>
                      {[form.market, form.industry].filter(Boolean).map((v, i) => (
                        <span key={i} className="tag tag-green" style={{ fontSize: 9 }}>{v}</span>
                      ))}
                      {form.recentNews && <span className="tag tag-green" style={{ fontSize: 9 }}>News</span>}
                      {form.knownContacts && <span className="tag tag-green" style={{ fontSize: 9 }}>Contacts</span>}
                      <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: "'JetBrains Mono', monospace" }}>— review and edit below</span>
                    </div>
                  )}"""

c1d_new = """                  {autoResearchDone && (
                    <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: 'var(--green)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }}>✓ AUTO-FILLED —</span>
                      {[form.market, form.industry].filter(Boolean).map((v, i) => (
                        <span key={i} className="tag tag-green" style={{ fontSize: 9 }}>{v}</span>
                      ))}
                      {form.recentNews && <span className="tag tag-green" style={{ fontSize: 9 }}>News</span>}
                      {form.knownContacts && <span className="tag tag-green" style={{ fontSize: 9 }}>Contacts</span>}
                      {techStack && <span className="tag tag-green" style={{ fontSize: 9 }}>Tech Stack</span>}
                      <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: "'JetBrains Mono', monospace" }}>— review and edit below</span>
                    </div>
                  )}
                  {techStack && (
                    <div style={{ marginTop: 8, padding: '10px 14px', background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)', borderRadius: 8 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--blue-light)', letterSpacing: 2, marginBottom: 5, fontFamily: "'JetBrains Mono', monospace" }}>TECH STACK DETECTED</div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{techStack.tools}</p>
                      {techStack.likelyReplacing && <p style={{ fontSize: 11, color: 'var(--amber)' }}>→ Likely replacing: {techStack.likelyReplacing}</p>}
                    </div>
                  )}"""

if c1d_old in src:
    src = src.replace(c1d_old, c1d_new, 1)
    print('Change 1d OK - tech stack shown in UI')
else:
    print('FAIL: Change 1d - autoResearchDone chips not found')
    ok = False

# ─── CHANGE 2: 3-scenario ROI ─────────────────────────────────────────────────
c2_old = """const calcROI = (inputs, result) => {
  const emp = parseFloat(inputs.employees) || 0;
  const salary = parseFloat(inputs.avgSalary) || 80000;
  const hrs = parseFloat(inputs.hoursPerWeek) || 10;
  const dealSize = parseFloat(inputs.dealSize) || 200000;
  const errorCost = parseFloat(inputs.currentErrors) || 0;
  const revenueUpside = parseFloat(inputs.revenueUpside) || 0;
  const hourlyRate = salary / 2080;
  const annualHours = emp * hrs * 52;
  const laborSavings = annualHours * hourlyRate * 0.7;
  const totalBenefit = laborSavings + errorCost + revenueUpside;
  const roi = dealSize > 0 ? ((totalBenefit - dealSize) / dealSize * 100).toFixed(0) : 0;
  const payback = totalBenefit > 0 ? (dealSize / (totalBenefit / 12)).toFixed(1) : 0;
  return {
    laborSavings: Math.round(laborSavings),
    errorCost: Math.round(errorCost),
    revenueUpside: Math.round(revenueUpside),
    totalBenefit: Math.round(totalBenefit),
    roi: parseInt(roi),
    payback: parseFloat(payback),
    costOfInaction: Math.round(totalBenefit / 12),
  };
};"""

c2_new = """const calcROI = (inputs, result) => {
  const emp = parseFloat(inputs.employees) || 0;
  const salary = parseFloat(inputs.avgSalary) || 80000;
  const hrs = parseFloat(inputs.hoursPerWeek) || 10;
  const dealSize = parseFloat(inputs.dealSize) || 200000;
  const errorCost = parseFloat(inputs.currentErrors) || 0;
  const revenueUpside = parseFloat(inputs.revenueUpside) || 0;
  const hourlyRate = salary / 2080;
  const annualHours = emp * hrs * 52;
  // Base scenario
  const laborSavings = annualHours * hourlyRate * 0.7;
  const totalBenefit = laborSavings + errorCost + revenueUpside;
  const roi = dealSize > 0 ? ((totalBenefit - dealSize) / dealSize * 100).toFixed(0) : 0;
  const payback = totalBenefit > 0 ? (dealSize / (totalBenefit / 12)).toFixed(1) : 0;
  // Conservative scenario (50% of base benefits)
  const conservativeBenefit = totalBenefit * 0.5;
  const conservativeRoi = dealSize > 0 ? ((conservativeBenefit - dealSize) / dealSize * 100).toFixed(0) : 0;
  const conservativePayback = conservativeBenefit > 0 ? (dealSize / (conservativeBenefit / 12)).toFixed(1) : 0;
  // Aggressive scenario (150% of base benefits)
  const aggressiveBenefit = totalBenefit * 1.5;
  const aggressiveRoi = dealSize > 0 ? ((aggressiveBenefit - dealSize) / dealSize * 100).toFixed(0) : 0;
  const aggressivePayback = aggressiveBenefit > 0 ? (dealSize / (aggressiveBenefit / 12)).toFixed(1) : 0;
  return {
    laborSavings: Math.round(laborSavings),
    errorCost: Math.round(errorCost),
    revenueUpside: Math.round(revenueUpside),
    totalBenefit: Math.round(totalBenefit),
    roi: parseInt(roi),
    payback: parseFloat(payback),
    costOfInaction: Math.round(totalBenefit / 12),
    scenarios: {
      conservative: { benefit: Math.round(conservativeBenefit), roi: parseInt(conservativeRoi), payback: parseFloat(conservativePayback), label: 'Conservative', assumption: '50% of projected benefits realised' },
      base:         { benefit: Math.round(totalBenefit),        roi: parseInt(roi),              payback: parseFloat(payback),              label: 'Base',         assumption: 'Full projected benefits realised' },
      aggressive:   { benefit: Math.round(aggressiveBenefit),   roi: parseInt(aggressiveRoi),    payback: parseFloat(aggressivePayback),    label: 'Aggressive',   assumption: '150% upside with process optimisation' },
    }
  };
};"""

if c2_old in src:
    src = src.replace(c2_old, c2_new, 1)
    print('Change 2a OK - 3-scenario ROI engine added')
else:
    print('FAIL: Change 2a - calcROI not found')
    ok = False

# Add scenario display after ROI result metrics
c2b_old = """                      {!roiResearch ? ("""

c2b_new = """                      {roiResult?.scenarios && (
                        <div style={{ marginBottom:16 }}>
                          <div style={{ fontSize:9, fontWeight:700, color:'var(--amber)', letterSpacing:2, marginBottom:10, fontFamily:"'JetBrains Mono',monospace" }}>3-SCENARIO ANALYSIS</div>
                          <div className="r-grid-3">
                            {Object.values(roiResult.scenarios).map((sc,i) => (
                              <div key={i} style={{ background: i===1?'var(--amber-glow)':'var(--card)', border:`1px solid ${i===1?'rgba(245,158,11,0.3)':'var(--border)'}`, borderRadius:10, padding:14, textAlign:'center' }}>
                                <div style={{ fontSize:8, fontWeight:700, color: i===0?'var(--text-dim)':i===1?'var(--amber)':'var(--green)', letterSpacing:2, marginBottom:6, fontFamily:"'JetBrains Mono',monospace" }}>{sc.label.toUpperCase()}</div>
                                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:900, color: i===0?'var(--text-dim)':i===1?'var(--amber)':'var(--green)' }}>{sc.roi}%</div>
                                <div style={{ fontSize:10, color:'var(--text-dim)', marginTop:2 }}>ROI · {sc.payback}mo payback</div>
                                <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:6, lineHeight:1.4 }}>${sc.benefit?.toLocaleString()} benefit</div>
                                <div style={{ fontSize:9, color:'var(--text-dim)', marginTop:4, fontStyle:'italic' }}>{sc.assumption}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {!roiResearch ? ("""

if c2b_old in src:
    src = src.replace(c2b_old, c2b_new, 1)
    print('Change 2b OK - 3-scenario display added')
else:
    print('FAIL: Change 2b - roiResearch block not found')
    ok = False

# ─── CHANGE 3: Urgency score on news triggers ─────────────────────────────────
c3_old = """              system:`Search for the latest news about this company. Return ONLY valid JSON: {"lastUpdated":"today","triggers":[{"type":"Leadership Change|M&A|Regulatory|Earnings|Strategy|Technology|Risk","headline":"...","detail":"...","salesAngle":"How to use this in a sales conversation","urgency":"high|medium|low"}],"buyingSignals":["Signal 1","Signal 2"],"risks":["Risk 1","Risk 2"],"conversationStarter":"Exact opening line referencing recent news"}`,"""

c3_new = """              system:`Search for the latest news about this company. Return ONLY valid JSON: {"lastUpdated":"today","urgencyScore":"high|medium|low","urgencyRationale":"One sentence why this window is high/medium/low urgency","windowOfOpportunity":"How long this signal stays relevant — e.g. 30 days, 90 days, ongoing","triggers":[{"type":"Leadership Change|M&A|Regulatory|Earnings|Strategy|Technology|Risk","headline":"...","detail":"...","salesAngle":"How to use this in a sales conversation","urgency":"high|medium|low"}],"buyingSignals":["Signal 1","Signal 2"],"risks":["Risk 1","Risk 2"],"conversationStarter":"Exact opening line referencing recent news","recommendedFirstAction":"The single most important outreach action to take within 24 hours"}`,"""

if c3_old in src:
    src = src.replace(c3_old, c3_new, 1)
    print('Change 3a OK - urgency score added to news prompt')
else:
    print('FAIL: Change 3a - news system prompt not found')
    ok = False

# Show urgency score in news UI — add after conversationStarter block
c3b_old = """                              {newsTriggers.conversationStarter && ("""

c3b_new = """                              {newsTriggers.urgencyScore && (
                                <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:12, padding:'10px 14px', background: newsTriggers.urgencyScore==='high'?'var(--red-dim)':newsTriggers.urgencyScore==='medium'?'var(--amber-glow)':'var(--card)', border:`1px solid ${newsTriggers.urgencyScore==='high'?'rgba(239,68,68,0.2)':newsTriggers.urgencyScore==='medium'?'rgba(245,158,11,0.2)':'var(--border)'}`, borderRadius:8 }}>
                                  <div>
                                    <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:3 }}>
                                      <span className={`tag ${newsTriggers.urgencyScore==='high'?'tag-red':newsTriggers.urgencyScore==='medium'?'tag-amber':'tag-dim'}`} style={{ fontSize:9 }}>{newsTriggers.urgencyScore?.toUpperCase()} URGENCY</span>
                                      {newsTriggers.windowOfOpportunity && <span style={{ fontSize:11, color:'var(--text-dim)' }}>Window: {newsTriggers.windowOfOpportunity}</span>}
                                    </div>
                                    <p style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.5 }}>{newsTriggers.urgencyRationale}</p>
                                  </div>
                                </div>
                              )}
                              {newsTriggers.recommendedFirstAction && (
                                <div style={{ marginBottom:12, padding:'10px 14px', background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.15)', borderRadius:8 }}>
                                  <div style={{ fontSize:9, fontWeight:700, color:'var(--green)', letterSpacing:2, marginBottom:4, fontFamily:"'JetBrains Mono',monospace" }}>RECOMMENDED ACTION — 24 HRS</div>
                                  <p style={{ fontSize:12, color:'var(--text)', lineHeight:1.5 }}>{newsTriggers.recommendedFirstAction}</p>
                                </div>
                              )}
                              {newsTriggers.conversationStarter && ("""

if c3b_old in src:
    src = src.replace(c3b_old, c3b_new, 1)
    print('Change 3b OK - urgency score displayed in news UI')
else:
    print('FAIL: Change 3b - conversationStarter block not found')
    ok = False

# Also add urgency to the auto-run news call prompt
c3c_old = """              system:`Search for the latest news about this company. Return ONLY valid JSON: {"lastUpdated":"today","triggers":[{"type":"Leadership Change|M&A|Regulatory|Earnings|Strategy|Technology|Risk","headline":"...","detail":"...","salesAngle":"How to use this in a sales conversation","urgency":"high|medium|low"}],"buyingSignals":["Signal 1","Signal 2"],"risks":["Risk 1","Risk 2"],"conversationStarter":"Exact opening line referencing recent news"}`,"""

c3c_new = """              system:`Search for the latest news about this company. Return ONLY valid JSON: {"lastUpdated":"today","urgencyScore":"high|medium|low","urgencyRationale":"One sentence why","windowOfOpportunity":"How long signal stays relevant","triggers":[{"type":"Leadership Change|M&A|Regulatory|Earnings|Strategy|Technology|Risk","headline":"...","detail":"...","salesAngle":"How to use this in a sales conversation","urgency":"high|medium|low"}],"buyingSignals":["Signal 1","Signal 2"],"risks":["Risk 1","Risk 2"],"conversationStarter":"Exact opening line referencing recent news","recommendedFirstAction":"Most important action within 24 hours"}`,"""

if c3c_old in src:
    src = src.replace(c3c_old, c3c_new, 1)
    print('Change 3c OK - urgency added to auto-run news prompt')
else:
    print('Change 3c skipped - already updated (expected)')

# ─── CHANGE 4: Close Plan Builder in Biz Case tab ────────────────────────────
c4_old = """                  {/* Mutual Success Plan */}
                  <div className="inline-section">
                    <div className="section-header">🤝 Mutual Success Plan</div>"""

c4_new = """                  {/* Close Plan Builder */}
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
                                  for(const line of decoder.decode(value,{stream:true}).split("\n")) { if(line.startsWith("data: ")) { try { const evt=JSON.parse(line.slice(6)); if(evt.type==="content_block_delta"&&evt.delta?.type==="text_delta") raw+=evt.delta.text; } catch(e){} } } }
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
                  </div>

                  {/* Mutual Success Plan */}
                  <div className="inline-section">
                    <div className="section-header">🤝 Mutual Success Plan</div>"""

if c4_old in src:
    src = src.replace(c4_old, c4_new, 1)
    print('Change 4 OK - Close Plan Builder added to Biz Case tab')
else:
    print('FAIL: Change 4 - Mutual Success Plan section not found')
    ok = False

# Write file
with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(src)

if ok:
    print('\nAll changes written. Run: npm run build 2>&1 | head -20')
else:
    print('\nSome changes failed. File written with successful changes.')
