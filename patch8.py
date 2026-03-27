#!/usr/bin/env python3
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    src = f.read()

with open('src/App.jsx.backup_resp', 'w', encoding='utf-8') as f:
    f.write(src)
print('Backup saved')

# ─── FIX 1: Step 1 heading too large on mobile ───────────────────────────────
c1_old = """                <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 30, fontWeight: 800, color: "white", marginBottom: 8 }}>Who are you targeting?</h1>"""

c1_new = """                <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(22px, 5vw, 30px)", fontWeight: 800, color: "white", marginBottom: 8 }}>Who are you targeting?</h1>"""

if c1_old in src:
    src = src.replace(c1_old, c1_new, 1)
    print('Fix 1 OK - Step 1 heading responsive size')
else:
    print('FAIL: Fix 1 - string not found')

# ─── FIX 2: Step 2 heading too large on mobile ───────────────────────────────
c2_old = """                <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 30, fontWeight: 800, color: "white", marginBottom: 8 }}>What are you selling — and where does it stand?</h1>"""

c2_new = """                <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(20px, 5vw, 30px)", fontWeight: 800, color: "white", marginBottom: 8 }}>What are you selling — and where does it stand?</h1>"""

if c2_old in src:
    src = src.replace(c2_old, c2_new, 1)
    print('Fix 2 OK - Step 2 heading responsive size')
else:
    print('FAIL: Fix 2 - string not found')

# ─── FIX 3: Hide duplicate PDF export bar on mobile ──────────────────────────
c3_old = """              {/* PDF Export Bar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, background: "var(--amber-glow)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12, padding: "12px 18px" }}>"""

c3_new = """              {/* PDF Export Bar — hidden on mobile, shown on desktop only */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, background: "var(--amber-glow)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12, padding: "12px 18px" }} className="pdf-export-bar">"""

if c3_old in src:
    src = src.replace(c3_old, c3_new, 1)
    print('Fix 3 OK - PDF export bar className added')
else:
    print('FAIL: Fix 3 - string not found')

# ─── FIX 4: Add CSS to hide PDF bar on mobile ────────────────────────────────
c4_old = """  @media (max-width: 768px) {
    .main { padding: 24px 16px 80px; max-width: 100%; }
    .header { padding: 0 16px; }
    .header-inner { height: 56px; }
    .logo-text { font-size: 13px; }
    .logo-sub { display: none; }
    .header-badge { display: none; }
    .tabs { padding: 3px; gap: 1px; }
    .tab { padding: 8px 10px; font-size: 8px; letter-spacing: 0.5px; }
    .stat-grid { grid-template-columns: 1fr 1fr; }
    .medd-grid { grid-template-columns: 1fr; }
    .grid-2 { grid-template-columns: 1fr; }
    .grid-3 { grid-template-columns: 1fr; }
    .com-before-after { grid-template-columns: 1fr; }
    .steps { display: none; }
    .company-title { font-size: 22px; }
  }"""

c4_new = """  @media (max-width: 768px) {
    .main { padding: 24px 16px 80px; max-width: 100%; }
    .header { padding: 0 16px; }
    .header-inner { height: 56px; }
    .logo-text { font-size: 13px; }
    .logo-sub { display: none; }
    .header-badge { display: none; }
    .tabs { padding: 3px; gap: 1px; }
    .tab { padding: 8px 10px; font-size: 8px; letter-spacing: 0.5px; }
    .stat-grid { grid-template-columns: 1fr 1fr; }
    .medd-grid { grid-template-columns: 1fr; }
    .grid-2 { grid-template-columns: 1fr; }
    .grid-3 { grid-template-columns: 1fr; }
    .com-before-after { grid-template-columns: 1fr; }
    .steps { display: none; }
    .company-title { font-size: 22px; }
    .pdf-export-bar { display: none !important; }
  }"""

if c4_old in src:
    src = src.replace(c4_old, c4_new, 1)
    print('Fix 4 OK - PDF export bar hidden on mobile via CSS')
else:
    print('FAIL: Fix 4 - media query string not found')

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(src)
print('Done. Run: npm run build 2>&1 | head -20')
