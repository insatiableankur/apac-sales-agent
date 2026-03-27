#!/usr/bin/env python3
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    src = f.read()

with open('src/App.jsx.backup_width', 'w', encoding='utf-8') as f:
    f.write(src)
print('Backup saved')

# ─── FIX 1: Main content max-width and centering ─────────────────────────────
c1_old = """  .main { max-width: 1440px; margin: 0 auto; padding: 48px 32px 100px; }"""

c1_new = """  .main { max-width: 960px; margin: 0 auto; padding: 48px 32px 100px; }"""

if c1_old in src:
    src = src.replace(c1_old, c1_new, 1)
    print('Fix 1 OK - main content centered at 960px')
else:
    print('FAIL: Fix 1 - string not found')

# ─── FIX 2: Desktop override — slightly wider padding ────────────────────────
c2_old = """  @media (min-width: 1024px) {
    .main { padding: 48px 48px 100px; }
    .stat-grid { grid-template-columns: repeat(4, 1fr); }
    .medd-grid { grid-template-columns: 1fr 1fr; }
    .r-grid-2 { grid-template-columns: 1fr 1fr; }
    .r-grid-3 { grid-template-columns: repeat(3, 1fr); }
    .r-grid-4 { grid-template-columns: repeat(4, 1fr); }
  }"""

c2_new = """  @media (min-width: 1024px) {
    .main { padding: 48px 40px 100px; max-width: 1000px; }
    .stat-grid { grid-template-columns: repeat(4, 1fr); }
    .medd-grid { grid-template-columns: 1fr 1fr; }
    .r-grid-2 { grid-template-columns: 1fr 1fr; }
    .r-grid-3 { grid-template-columns: repeat(3, 1fr); }
    .r-grid-4 { grid-template-columns: repeat(4, 1fr); }
  }"""

if c2_old in src:
    src = src.replace(c2_old, c2_new, 1)
    print('Fix 2 OK - desktop main slightly wider at 1000px')
else:
    print('FAIL: Fix 2 - string not found')

# ─── FIX 3: App background fills full screen ─────────────────────────────────
c3_old = """  .app {
    min-height: 100vh;
    background: var(--navy);
    position: relative;
  }"""

c3_new = """  .app {
    min-height: 100vh;
    width: 100%;
    background: var(--navy);
    position: relative;
  }"""

if c3_old in src:
    src = src.replace(c3_old, c3_new, 1)
    print('Fix 3 OK - app background fills full screen')
else:
    print('FAIL: Fix 3 - string not found')

# ─── FIX 4: Mobile main padding back to normal ───────────────────────────────
c4_old = """    .main { padding: 24px 16px 80px; max-width: 100%; }"""
c4_new = """    .main { padding: 24px 16px 80px; max-width: 100%; width: 100%; }"""

if c4_old in src:
    src = src.replace(c4_old, c4_new, 1)
    print('Fix 4 OK - mobile main full width')
else:
    print('FAIL: Fix 4 - string not found')

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(src)
print('Done. Run: npm run build 2>&1 | head -20')
