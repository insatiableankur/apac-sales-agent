#!/usr/bin/env python3
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    src = f.read()

# ─── CHANGE 2: Add theme CSS variables before light-mode ─────────────────────
c2_old = """  /* ─── LIGHT MODE ──────────────────────────────────────────────── */
  .light-mode {"""

c2_new = """  /* ─── COLOR THEMES ────────────────────────────────────────────── */
  .theme-midnight {
    --navy:   #08080F;
    --navy2:  #0D0D1A;
    --navy3:  #12122A;
    --slate:  #16163A;
    --slate2: #1E1E4A;
    --blue:       #6366F1;
    --blue-light: #818CF8;
    --blue-glow:  rgba(99,102,241,0.12);
    --border:  rgba(255,255,255,0.07);
    --border2: rgba(255,255,255,0.12);
    --card:    rgba(255,255,255,0.04);
    --card2:   rgba(255,255,255,0.07);
  }
  .theme-slate {
    --navy:   #0F0F1A;
    --navy2:  #141428;
    --navy3:  #1A1A35;
    --slate:  #1E1E40;
    --slate2: #252550;
    --blue:       #7C3AED;
    --blue-light: #A78BFA;
    --blue-glow:  rgba(124,58,237,0.12);
    --border:  rgba(255,255,255,0.07);
    --border2: rgba(255,255,255,0.12);
    --card:    rgba(255,255,255,0.04);
    --card2:   rgba(255,255,255,0.07);
  }
  .theme-forest {
    --navy:   #080F0A;
    --navy2:  #0D160F;
    --navy3:  #121E14;
    --slate:  #162419;
    --slate2: #1C2E1F;
    --blue:       #059669;
    --blue-light: #34D399;
    --blue-glow:  rgba(5,150,105,0.12);
    --border:  rgba(255,255,255,0.07);
    --border2: rgba(255,255,255,0.12);
    --card:    rgba(255,255,255,0.04);
    --card2:   rgba(255,255,255,0.07);
  }

  /* ─── LIGHT MODE ──────────────────────────────────────────────── */
  .light-mode {"""

if c2_old in src:
    src = src.replace(c2_old, c2_new, 1)
    print('Change 2 OK - theme CSS variables added')
else:
    print('FAIL: Change 2 - string not found')

# ─── CHANGE 3: Apply theme class to app div ──────────────────────────────────
c3_old = """      <div className={darkMode ? "app" : "app light-mode"}>"""
c3_new = """      <div className={`app${!darkMode ? ' light-mode' : ''} theme-${colorTheme}`}>"""

if c3_old in src:
    src = src.replace(c3_old, c3_new, 1)
    print('Change 3 OK - theme class applied to app div')
else:
    print('FAIL: Change 3 - string not found')

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(src)
print('Done. Run: npm run build 2>&1 | head -20')
