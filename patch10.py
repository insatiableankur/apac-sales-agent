#!/usr/bin/env python3
with open('src/Landing.jsx', 'r', encoding='utf-8') as f:
    src = f.read()

with open('src/Landing.jsx.backup3', 'w', encoding='utf-8') as f:
    f.write(src)
print('Backup saved')

# ─── FIX 1: Widen hero section maxWidth ──────────────────────────────────────
c1_old = """        maxWidth: "1200px","""
c1_new = """        maxWidth: "1400px","""

if c1_old in src:
    src = src.replace(c1_old, c1_new, 1)
    print('Fix 1 OK - hero maxWidth widened to 1400px')
else:
    print('FAIL: Fix 1 - string not found')

# ─── FIX 2: Widen how-it-works section ───────────────────────────────────────
c2_old = """      <section id="how-it-works" style={{ padding: "5rem 2rem", maxWidth: "1100px", margin: "0 auto" }}>"""
c2_new = """      <section id="how-it-works" style={{ padding: "5rem 2rem", maxWidth: "1400px", margin: "0 auto", width: "100%" }}>"""

if c2_old in src:
    src = src.replace(c2_old, c2_new, 1)
    print('Fix 2 OK - how-it-works maxWidth widened')
else:
    print('FAIL: Fix 2 - string not found')

# ─── FIX 3: Widen features inner div ─────────────────────────────────────────
c3_old = """        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>"""
c3_new = """        <div style={{ maxWidth: "1400px", margin: "0 auto", width: "100%" }}>"""

if c3_old in src:
    src = src.replace(c3_old, c3_new, 1)
    print('Fix 3 OK - features inner div widened')
else:
    print('FAIL: Fix 3 - string not found')

# ─── FIX 4: Widen testimonials section ───────────────────────────────────────
c4_old = """      <section style={{ padding: "5rem 2rem", maxWidth: "1100px", margin: "0 auto" }}>"""
c4_new = """      <section style={{ padding: "5rem 2rem", maxWidth: "1400px", margin: "0 auto", width: "100%" }}>"""

if c4_old in src:
    src = src.replace(c4_old, c4_new, 1)
    print('Fix 4 OK - testimonials section widened')
else:
    print('FAIL: Fix 4 - string not found')

# ─── FIX 5: Widen footer inner container ─────────────────────────────────────
c5_old = """          maxWidth: "1100px","""
c5_new = """          maxWidth: "1400px","""

if c5_old in src:
    src = src.replace(c5_old, c5_new, 1)
    print('Fix 5 OK - footer container widened')
else:
    print('FAIL: Fix 5 - string not found')

# ─── FIX 6: Make the outer wrapper fill full width ────────────────────────────
c6_old = """      overflowX: "hidden","""
c6_new = """      overflowX: "hidden",
      width: "100%",
      minWidth: "100vw","""

if c6_old in src:
    src = src.replace(c6_old, c6_new, 1)
    print('Fix 6 OK - outer wrapper fills full viewport width')
else:
    print('FAIL: Fix 6 - string not found')

with open('src/Landing.jsx', 'w', encoding='utf-8') as f:
    f.write(src)
print('Done. Run: npm run build 2>&1 | head -20')
