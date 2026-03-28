#!/usr/bin/env python3
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    src = f.read()

with open('src/App.jsx.backup_modal', 'w', encoding='utf-8') as f:
    f.write(src)
print('Backup saved')

# ─── CHANGE 1: Add showExportModal state ──────────────────────────────────────
c1_old = """  const [closePlan, setClosePlan] = useState(null);
  const [closePlanLoading, setClosePlanLoading] = useState(false);
  const [closeDate, setCloseDate] = useState('');"""

c1_new = """  const [closePlan, setClosePlan] = useState(null);
  const [closePlanLoading, setClosePlanLoading] = useState(false);
  const [closeDate, setCloseDate] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);"""

if c1_old in src:
    src = src.replace(c1_old, c1_new, 1)
    print('Change 1 OK - showExportModal state added')
else:
    print('FAIL: Change 1 - state block not found')

# ─── CHANGE 2: Add export modal CSS ───────────────────────────────────────────
c2_old = """  /* ─── COLOR THEMES ────────────────────────────────────────────── */"""

c2_new = """  /* ─── EXPORT MODAL ────────────────────────────────────────────── */
  .export-modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.7);
    z-index: 2000; display: flex; align-items: center; justify-content: center;
    padding: 20px; backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;
  }
  .export-modal {
    background: var(--navy2); border: 1px solid var(--border2);
    border-radius: 18px; padding: 28px; width: 100%; max-width: 520px;
    box-shadow: 0 24px 80px rgba(0,0,0,0.6);
    animation: scaleIn 0.2s cubic-bezier(0.16,1,0.3,1);
  }
  .export-section-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 0; border-bottom: 1px solid var(--border);
  }
  .export-section-row:last-child { border-bottom: none; }

  /* ─── COLOR THEMES ────────────────────────────────────────────── */"""

if c2_old in src:
    src = src.replace(c2_old, c2_new, 1)
    print('Change 2 OK - export modal CSS added')
else:
    print('FAIL: Change 2 - CSS anchor not found')

# ─── CHANGE 3: Replace Export PDF buttons to open modal instead ───────────────
c3_old = """                    <button className="btn-ghost" onClick={() => exportToPDF(result, form, meetingPrep, execBrief, meetingInputs, { closePlan, championPlaybook, negotiationPlaybook, povDoc, mutualSuccessPlan, transcriptResult })} style={{ display: "flex", alignItems: "center", gap: 6, borderColor: "var(--amber)", color: "var(--amber)" }}>
                      ⬇ Export PDF
                    </button>"""

c3_new = """                    <button className="btn-ghost" onClick={() => setShowExportModal(true)} style={{ display: "flex", alignItems: "center", gap: 6, borderColor: "var(--amber)", color: "var(--amber)" }}>
                      ⬇ Export PDF
                    </button>"""

if c3_old in src:
    src = src.replace(c3_old, c3_new, 1)
    print('Change 3 OK - header export button opens modal')
else:
    print('FAIL: Change 3 - header export button not found')

c4_old = """                  onClick={() => exportToPDF(result, form, meetingPrep, execBrief, meetingInputs, { closePlan, championPlaybook, negotiationPlaybook, povDoc, mutualSuccessPlan, transcriptResult })}"""
c4_new = """                  onClick={() => setShowExportModal(true)}"""

if c4_old in src:
    src = src.replace(c4_old, c4_new, 1)
    print('Change 4 OK - banner export button opens modal')
else:
    print('FAIL: Change 4 - banner export button not found')

# ─── CHANGE 4: Add modal JSX before closing results div ──────────────────────
c5_old = """            </div>
          )}
        </div>
      </div>
    </>
  );
}
// cache bust"""

c5_new = """            </div>
          )}

          {/* ── PRE-EXPORT CHECKLIST MODAL ── */}
          {showExportModal && (
            <div className="export-modal-overlay" onClick={() => setShowExportModal(false)}>
              <div className="export-modal" onClick={e => e.stopPropagation()}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                  <div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:900, color:'var(--text)', marginBottom:3 }}>Export Intelligence Brief</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)' }}>Generate missing sections to maximise your PDF</div>
                  </div>
                  <button onClick={() => setShowExportModal(false)} style={{ background:'transparent', border:'none', color:'var(--text-dim)', fontSize:20, cursor:'pointer', padding:'4px 8px' }}>✕</button>
                </div>

                {/* Core sections — always included */}
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:9, fontWeight:700, color:'var(--green)', letterSpacing:2, marginBottom:10, fontFamily:"'JetBrains Mono',monospace" }}>✓ ALWAYS INCLUDED</div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {['Account Brief','MEDDPICC','Stakeholders','Outreach','Discovery','Command of Message','Next Actions'].map(s => (
                      <span key={s} className="tag tag-green" style={{ fontSize:9 }}>✓ {s}</span>
                    ))}
                  </div>
                </div>

                {/* On-demand sections */}
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontSize:9, fontWeight:700, color:'var(--text-dim)', letterSpacing:2, marginBottom:10, fontFamily:"'JetBrains Mono',monospace" }}>ON-DEMAND SECTIONS</div>
                  {[
                    { label:'Champion Playbook', state: championPlaybook, tab:'people', note:'4-week champion dev plan' },
                    { label:'Close Plan', state: closePlan, tab:'bizcase', note:'Backwards-mapped milestones' },
                    { label:'POV Document', state: povDoc, tab:'bizcase', note:'Strategic advisor document' },
                    { label:'Negotiation Playbook', state: negotiationPlaybook, tab:'bizcase', note:'Anchoring + concession framework' },
                    { label:'Mutual Success Plan', state: mutualSuccessPlan, tab:'bizcase', note:'Joint milestones + commitments' },
                    { label:'Meeting Prep', state: meetingPrep, tab:'bizcase', note:'Power questions + landmines' },
                    { label:'Executive Brief', state: execBrief, tab:'bizcase', note:'CFO-ready business case' },
                    { label:'Transcript Analysis', state: transcriptResult, tab:'coach', note:'Call signals + follow-up email' },
                  ].map(item => (
                    <div key={item.label} className="export-section-row">
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:18, height:18, borderRadius:'50%', background: item.state ? 'var(--green)' : 'var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'white', flexShrink:0 }}>
                          {item.state ? '✓' : ''}
                        </div>
                        <div>
                          <div style={{ fontSize:13, fontWeight:600, color: item.state ? 'var(--text)' : 'var(--text-dim)' }}>{item.label}</div>
                          <div style={{ fontSize:11, color:'var(--text-dim)' }}>{item.note}</div>
                        </div>
                      </div>
                      {!item.state && (
                        <button onClick={() => { setShowExportModal(false); setActiveTab(item.tab); }}
                          style={{ fontSize:10, padding:'4px 10px', borderRadius:6, border:'1px solid var(--border)', background:'transparent', color:'var(--blue-light)', cursor:'pointer', whiteSpace:'nowrap', fontFamily:"'JetBrains Mono',monospace", letterSpacing:0.5 }}>
                          → Go generate
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* PDF completeness */}
                {(() => {
                  const total = 8;
                  const done = [championPlaybook, closePlan, povDoc, negotiationPlaybook, mutualSuccessPlan, meetingPrep, execBrief, transcriptResult].filter(Boolean).length;
                  const pct = Math.round(((7 + done) / (7 + total)) * 100);
                  return (
                    <div style={{ marginBottom:20 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                        <span style={{ fontSize:11, color:'var(--text-muted)' }}>PDF completeness</span>
                        <span style={{ fontSize:11, fontWeight:700, color: pct===100?'var(--green)':pct>70?'var(--amber)':'var(--text-dim)' }}>{pct}% · {7+done} of {7+total} sections</span>
                      </div>
                      <div className="progress-track">
                        <div style={{ height:'100%', borderRadius:2, width:`${pct}%`, background: pct===100?'var(--green)':'var(--amber)', transition:'width 0.4s ease' }}></div>
                      </div>
                    </div>
                  );
                })()}

                {/* Action buttons */}
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={() => { setShowExportModal(false); exportToPDF(result, form, meetingPrep, execBrief, meetingInputs, { closePlan, championPlaybook, negotiationPlaybook, povDoc, mutualSuccessPlan, transcriptResult }); }}
                    className="btn-amber" style={{ flex:1, justifyContent:'center', fontSize:13 }}>
                    ⬇ Export PDF Now
                  </button>
                  <button onClick={() => setShowExportModal(false)} className="btn-ghost" style={{ fontSize:12 }}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
// cache bust"""

if c5_old in src:
    src = src.replace(c5_old, c5_new, 1)
    print('Change 5 OK - export modal JSX added')
else:
    print('FAIL: Change 5 - closing div pattern not found')

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(src)
print('Done. Run: npm run build 2>&1 | head -20')
