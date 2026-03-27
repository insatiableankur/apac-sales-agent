#!/usr/bin/env python3
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    src = f.read()

with open('src/App.jsx.backup_ws', 'w', encoding='utf-8') as f:
    f.write(src)
print('Backup saved')

# ─── FIX 1: Tab content min-height so short tabs don't leave white space ──────
c1_old = """  /* ─── RESPONSIVE BREAKPOINTS ─────────────────────────────────────── */"""

c1_new = """  /* ─── TAB CONTENT MIN HEIGHT ─────────────────────────────────────── */
  .tab-content-area { min-height: 60vh; }

  /* ─── DESKTOP OPTIMISATION ────────────────────────────────────────── */
  @media (min-width: 1024px) {
    .main { padding: 48px 48px 100px; }
    .stat-grid { grid-template-columns: repeat(4, 1fr); }
    .medd-grid { grid-template-columns: 1fr 1fr; }
    .r-grid-2 { grid-template-columns: 1fr 1fr; }
    .r-grid-3 { grid-template-columns: repeat(3, 1fr); }
    .r-grid-4 { grid-template-columns: repeat(4, 1fr); }
  }

  /* ─── IPAD OPTIMISATION (768px - 1024px) ─────────────────────────── */
  @media (min-width: 768px) and (max-width: 1024px) {
    .main { padding: 32px 28px 80px; }
    .stat-grid { grid-template-columns: 1fr 1fr; }
    .r-grid-4 { grid-template-columns: 1fr 1fr; }
    .tabs { gap: 2px; }
    .tab { padding: 8px 11px; font-size: 9px; }
  }

  /* ─── RESPONSIVE BREAKPOINTS ─────────────────────────────────────── */"""

if c1_old in src:
    src = src.replace(c1_old, c1_new, 1)
    print('Fix 1 OK - desktop + iPad breakpoints added')
else:
    print('FAIL: Fix 1 - string not found')

# ─── FIX 2: Add tab-content-area class to results container ──────────────────
c2_old = """              {/* ═══ TAB: DEAL INTELLIGENCE ═══════════════════════════════ */}
              {activeTab === "intel" && (
                <div className="anim-slide-up">"""

c2_new = """              {/* ═══ TAB: DEAL INTELLIGENCE ═══════════════════════════════ */}
              {activeTab === "intel" && (
                <div className="anim-slide-up tab-content-area">"""

if c2_old in src:
    src = src.replace(c2_old, c2_new, 1)
    print('Fix 2 OK - Deal Intel tab min-height applied')
else:
    print('FAIL: Fix 2 - string not found')

# ─── FIX 3: People tab ───────────────────────────────────────────────────────
c3_old = """              {activeTab === "people" && (
                <div className="anim-slide-up">"""

c3_new = """              {activeTab === "people" && (
                <div className="anim-slide-up tab-content-area">"""

if c3_old in src:
    src = src.replace(c3_old, c3_new, 1)
    print('Fix 3 OK - People tab min-height applied')
else:
    print('FAIL: Fix 3 - string not found')

# ─── FIX 4: Playbook tab ─────────────────────────────────────────────────────
c4_old = """              {activeTab === "playbook" && (
                <div className="anim-slide-up">"""

c4_new = """              {activeTab === "playbook" && (
                <div className="anim-slide-up tab-content-area">"""

if c4_old in src:
    src = src.replace(c4_old, c4_new, 1)
    print('Fix 4 OK - Playbook tab min-height applied')
else:
    print('FAIL: Fix 4 - string not found')

# ─── FIX 5: Biz Case tab ─────────────────────────────────────────────────────
c5_old = """              {activeTab === "bizcase" && (
                <div className="anim-slide-up">"""

c5_new = """              {activeTab === "bizcase" && (
                <div className="anim-slide-up tab-content-area">"""

if c5_old in src:
    src = src.replace(c5_old, c5_new, 1)
    print('Fix 5 OK - Biz Case tab min-height applied')
else:
    print('FAIL: Fix 5 - string not found')

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(src)
print('Done. Run: npm run build 2>&1 | head -20')
