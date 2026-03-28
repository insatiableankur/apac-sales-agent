#!/usr/bin/env python3
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    src = f.read()

with open('src/App.jsx.backup_tiny', 'w', encoding='utf-8') as f:
    f.write(src)
print('Backup saved')

# ─── FIX 1: i → ⓘ in score methodology ──────────────────────────────────────
c1_old = """                            <span>i</span> HOW SCORES ARE CALCULATED"""
c1_new = """                            <span>ⓘ</span> HOW SCORES ARE CALCULATED"""

if c1_old in src:
    src = src.replace(c1_old, c1_new, 1)
    print('Fix 1 OK - i → ⓘ in score methodology')
else:
    print('FAIL: Fix 1 - string not found')

# ─── FIX 2: Close Plan button to next row ────────────────────────────────────
c2_old = """                    <div style={{ display:'flex', gap:10, marginBottom:14, alignItems:'flex-end' }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:9, fontWeight:700, color:'var(--text-dim)', letterSpacing:2, marginBottom:6, fontFamily:"'JetBrains Mono',monospace" }}>TARGET CLOSE DATE</div>
                        <input type="date" value={closeDate} onChange={e => setCloseDate(e.target.value)} className="input-field" style={{ width:'100%' }} />
                      </div>
                      <button onClick={async () => {"""

c2_new = """                    <div style={{ marginBottom:14 }}>
                      <div style={{ marginBottom:10 }}>
                        <div style={{ fontSize:9, fontWeight:700, color:'var(--text-dim)', letterSpacing:2, marginBottom:6, fontFamily:"'JetBrains Mono',monospace" }}>TARGET CLOSE DATE</div>
                        <input type="date" value={closeDate} onChange={e => setCloseDate(e.target.value)} className="input-field" style={{ width:'100%', maxWidth:280 }} />
                      </div>
                      <button onClick={async () => {"""

if c2_old in src:
    src = src.replace(c2_old, c2_new, 1)
    print('Fix 2 OK - Close Plan button moved to next row')
else:
    print('FAIL: Fix 2 - string not found')

# Fix closing div to match new structure
c3_old = """                      }} disabled={closePlanLoading||!closeDate} className="btn-amber" style={{ fontSize:12, padding:'10px 20px', whiteSpace:'nowrap' }}>
                        {closePlanLoading ? 'BUILDING...' : '🎯 BUILD CLOSE PLAN'}
                      </button>
                    </div>"""

c3_new = """                      }} disabled={closePlanLoading||!closeDate} className="btn-amber" style={{ fontSize:12, padding:'10px 24px' }}>
                        {closePlanLoading ? 'BUILDING...' : '🎯 BUILD CLOSE PLAN'}
                      </button>
                    </div>"""

if c3_old in src:
    src = src.replace(c3_old, c3_new, 1)
    print('Fix 3 OK - button styling cleaned up')
else:
    print('FAIL: Fix 3 - button string not found')

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(src)
print('Done. Run: npm run build 2>&1 | head -20')
