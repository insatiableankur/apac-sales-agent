#!/usr/bin/env python3
with open('src/Landing.jsx', 'r', encoding='utf-8') as f:
    src = f.read()

with open('src/Landing.jsx.backup2', 'w', encoding='utf-8') as f:
    f.write(src)
print('Backup saved')

ok = True

# ─── FIX 1: Hide duplicate mobile CTA on desktop ─────────────────────────────
c1_old = """        .nav-links-desktop { display: flex; align-items: center; gap: 1.5rem; }
        .nav-mobile-cta { display: none; }
        @media (max-width: 640px) {
          .nav-links-desktop { display: none !important; }
          .nav-mobile-cta { display: flex !important; }
          .nav-logo-text { display: none !important; }
        }"""

c1_new = """        .nav-links-desktop { display: flex; align-items: center; gap: 1.5rem; }
        .nav-mobile-cta { display: none !important; }
        @media (max-width: 640px) {
          .nav-links-desktop { display: none !important; }
          .nav-mobile-cta { display: flex !important; }
          .nav-logo-text { display: none !important; }
        }"""

if c1_old in src:
    src = src.replace(c1_old, c1_new, 1)
    print('Fix 1 OK - duplicate nav button hidden on desktop')
else:
    print('FAIL: Fix 1 - string not found')
    ok = False

# ─── FIX 2: Hero headline smaller on mobile ───────────────────────────────────
c2_old = """              fontSize: "clamp(2.2rem, 5vw, 3.6rem)","""

c2_new = """              fontSize: "clamp(1.8rem, 5vw, 3.6rem)","""

if c2_old in src:
    src = src.replace(c2_old, c2_new, 1)
    print('Fix 2 OK - hero headline smaller on mobile')
else:
    print('FAIL: Fix 2 - string not found')
    ok = False

# ─── FIX 3: Add mobile responsive CSS for hero buttons ───────────────────────
c3_old = """        @media (max-width: 768px) {
          .hero-grid { flex-direction: column !important; align-items: center !important; }
          .hero-text { text-align: center !important; max-width: 100% !important; }"""

c3_new = """        @media (max-width: 768px) {
          .hero-grid { flex-direction: column !important; align-items: center !important; }
          .hero-text { text-align: center !important; max-width: 100% !important; }
          .hero-cta-row { flex-direction: column !important; width: 100% !important; }
          .hero-cta-row > * { width: 100% !important; justify-content: center !important; }
          .hero-cta-secondary { width: 100% !important; text-align: center !important; }"""

if c3_old in src:
    src = src.replace(c3_old, c3_new, 1)
    print('Fix 3 OK - hero CTA buttons full width on mobile')
else:
    print('FAIL: Fix 3 - string not found')
    ok = False

# ─── FIX 4: Add className to hero CTA row ────────────────────────────────────
c4_old = """            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center", marginBottom: "2rem" }}>"""

c4_new = """            <div className="hero-cta-row" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center", marginBottom: "2rem" }}>"""

if c4_old in src:
    src = src.replace(c4_old, c4_new, 1)
    print('Fix 4 OK - hero CTA row className added')
else:
    print('FAIL: Fix 4 - string not found')
    ok = False

# ─── FIX 5: CTA section headline smaller on mobile ───────────────────────────
c5_old = """            fontSize: "clamp(2rem, 5vw, 3.5rem)","""

c5_new = """            fontSize: "clamp(1.6rem, 5vw, 3.5rem)","""

if c5_old in src:
    src = src.replace(c5_old, c5_new, 1)
    print('Fix 5 OK - CTA section headline smaller on mobile')
else:
    print('FAIL: Fix 5 - string not found')
    ok = False

# ─── FIX 6: Add tablet breakpoint for hero section padding ───────────────────
c6_old = """          .hero-score-card { display: none !important; }"""

c6_new = """          .hero-score-card { display: none !important; }
          .hero-section { padding: "3rem 1.25rem 2rem" !important; }"""

if c6_old in src:
    src = src.replace(c6_old, c6_new, 1)
    print('Fix 6 OK - hero section padding reduced on mobile')
else:
    print('FAIL: Fix 6 - string not found')
    ok = False

# Write file
with open('src/Landing.jsx', 'w', encoding='utf-8') as f:
    f.write(src)

if ok:
    print('\nAll fixes written. Run: npm run build 2>&1 | head -20')
else:
    print('\nSome fixes failed but file written with successful changes.')
