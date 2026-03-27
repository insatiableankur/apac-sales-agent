#!/usr/bin/env python3
with open('src/Landing.jsx', 'r', encoding='utf-8') as f:
    src = f.read()

with open('src/Landing.jsx.backup', 'w', encoding='utf-8') as f:
    f.write(src)
print('Backup saved to src/Landing.jsx.backup')

ok = True

# ─── CHANGE 1: Add mobile nav CSS + fix hero overflow ────────────────────────
c1_old = """        .nav-link:hover { color: rgba(245,158,11,0.9) !important; }"""

c1_new = """        .nav-link:hover { color: rgba(245,158,11,0.9) !important; }
        .nav-links-desktop { display: flex; align-items: center; gap: 1.5rem; }
        .nav-mobile-cta { display: none; }
        @media (max-width: 640px) {
          .nav-links-desktop { display: none !important; }
          .nav-mobile-cta { display: flex !important; }
          .nav-logo-text { display: none !important; }
        }"""

if c1_old in src:
    src = src.replace(c1_old, c1_new, 1)
    print('Change 1 OK - mobile nav CSS added')
else:
    print('FAIL: Change 1 - string not found')
    ok = False

# ─── CHANGE 2: Fix nav logo — hide full text on mobile, show SIA badge only ──
c2_old = """        <div style={{
          fontFamily: s.syne,
          fontWeight: 900,
          fontSize: "1.05rem",
          letterSpacing: "-0.02em",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}>
          <span style={{
            background: "linear-gradient(135deg, #F59E0B, #D97706)",
            borderRadius: "6px",
            padding: "2px 7px",
            color: "#000",
            fontSize: "0.75rem",
            fontWeight: 900,
            letterSpacing: "0.05em",
          }}>SIA</span>
          Sales Intelligence Agent
        </div>"""

c2_new = """        <div style={{
          fontFamily: s.syne,
          fontWeight: 900,
          fontSize: "1.05rem",
          letterSpacing: "-0.02em",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          flexShrink: 0,
        }}>
          <span style={{
            background: "linear-gradient(135deg, #F59E0B, #D97706)",
            borderRadius: "6px",
            padding: "2px 7px",
            color: "#000",
            fontSize: "0.75rem",
            fontWeight: 900,
            letterSpacing: "0.05em",
            flexShrink: 0,
          }}>SIA</span>
          <span className="nav-logo-text">Sales Intelligence Agent</span>
        </div>"""

if c2_old in src:
    src = src.replace(c2_old, c2_new, 1)
    print('Change 2 OK - nav logo mobile fix')
else:
    print('FAIL: Change 2 - string not found')
    ok = False

# ─── CHANGE 3: Wrap nav links in className div + add mobile CTA button ────────
c3_old = """        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <a href="#features" className="nav-link" style={{
            fontFamily: s.mono,
            fontSize: "0.72rem",
            color: "rgba(255,255,255,0.45)",
            textDecoration: "none",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            transition: "color 0.2s",
          }}>Features</a>
          <a href="#how-it-works" className="nav-link" style={{
            fontFamily: s.mono,
            fontSize: "0.72rem",
            color: "rgba(255,255,255,0.45)",
            textDecoration: "none",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            transition: "color 0.2s",
          }}>How it works</a>
          <a href="#pricing" className="nav-link" style={{
            fontFamily: s.mono,
            fontSize: "0.72rem",
            color: "rgba(255,255,255,0.45)",
            textDecoration: "none",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            transition: "color 0.2s",
          }}>Pricing</a>
          <button
            className="cta-btn"
            onClick={onStart}
            style={{
              ...ctaBtn,
              padding: "0.55rem 1.2rem",
              fontSize: "0.8rem",
            }}
          >
            Start Free →
          </button>
        </div>"""

c3_new = """        <div className="nav-links-desktop">
          <a href="#features" className="nav-link" style={{
            fontFamily: s.mono,
            fontSize: "0.72rem",
            color: "rgba(255,255,255,0.45)",
            textDecoration: "none",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            transition: "color 0.2s",
          }}>Features</a>
          <a href="#how-it-works" className="nav-link" style={{
            fontFamily: s.mono,
            fontSize: "0.72rem",
            color: "rgba(255,255,255,0.45)",
            textDecoration: "none",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            transition: "color 0.2s",
          }}>How it works</a>
          <a href="#pricing" className="nav-link" style={{
            fontFamily: s.mono,
            fontSize: "0.72rem",
            color: "rgba(255,255,255,0.45)",
            textDecoration: "none",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            transition: "color 0.2s",
          }}>Pricing</a>
          <button
            className="cta-btn"
            onClick={onStart}
            style={{
              ...ctaBtn,
              padding: "0.55rem 1.2rem",
              fontSize: "0.8rem",
            }}
          >
            Start Free →
          </button>
        </div>
        <button
          className="nav-mobile-cta cta-btn"
          onClick={onStart}
          style={{
            ...ctaBtn,
            padding: "0.5rem 1rem",
            fontSize: "0.75rem",
          }}
        >
          Start Free →
        </button>"""

if c3_old in src:
    src = src.replace(c3_old, c3_new, 1)
    print('Change 3 OK - nav links wrapped with mobile CTA added')
else:
    print('FAIL: Change 3 - string not found')
    ok = False

# ─── CHANGE 4: Fix hero badge overflow — add overflow hidden + text wrap ──────
c4_old = """              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.25)",
              borderRadius: "100px",
              padding: "0.3rem 0.9rem",
              marginBottom: "1.5rem",
              fontFamily: s.mono,
              fontSize: "0.68rem",
              color: "rgba(245,158,11,0.9)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}>"""

c4_new = """              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.25)",
              borderRadius: "100px",
              padding: "0.3rem 0.9rem",
              marginBottom: "1.5rem",
              fontFamily: s.mono,
              fontSize: "0.68rem",
              color: "rgba(245,158,11,0.9)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>"""

if c4_old in src:
    src = src.replace(c4_old, c4_new, 1)
    print('Change 4 OK - hero badge overflow fixed')
else:
    print('FAIL: Change 4 - string not found')
    ok = False

# ─── CHANGE 5: Fix nav padding on mobile ─────────────────────────────────────
c5_old = """        position: "sticky",
        top: 0,
        zIndex: 100,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        background: "rgba(5,12,24,0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        maxWidth: "100%","""

c5_new = """        position: "sticky",
        top: 0,
        zIndex: 100,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.75rem 1.25rem",
        background: "rgba(5,12,24,0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        maxWidth: "100%",
        overflow: "hidden","""

if c5_old in src:
    src = src.replace(c5_old, c5_new, 1)
    print('Change 5 OK - nav padding fixed')
else:
    print('FAIL: Change 5 - string not found')
    ok = False

# Write file
if ok:
    with open('src/Landing.jsx', 'w', encoding='utf-8') as f:
        f.write(src)
    print('\nAll changes written. Now run: npm run build 2>&1 | head -20')
else:
    print('\nSome changes FAILED. Check above.')
    with open('src/Landing.jsx', 'w', encoding='utf-8') as f:
        f.write(src)
    print('File written with successful changes only.')
