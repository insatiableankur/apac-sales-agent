#!/usr/bin/env python3
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    src = f.read()

with open('src/App.jsx.backup_themes', 'w', encoding='utf-8') as f:
    f.write(src)
print('Backup saved')

ok = True

# ─── CHANGE 1: Add theme state ───────────────────────────────────────────────
c1_old = """  const [darkMode, setDarkMode] = useState(true);"""

c1_new = """  const [darkMode, setDarkMode] = useState(true);
  const [colorTheme, setColorTheme] = useState(() => {
    try { return localStorage.getItem('sia_theme') || 'navy'; } catch { return 'navy'; }
  });
  const applyTheme = (t) => {
    setColorTheme(t);
    try { localStorage.setItem('sia_theme', t); } catch {}
  };"""

if c1_old in src:
    src = src.replace(c1_old, c1_new, 1)
    print('Change 1 OK - theme state added')
else:
    print('FAIL: Change 1 - string not found')
    ok = False

# ─── CHANGE 2: Add theme CSS variables ───────────────────────────────────────
c2_old = """  /* ─── LIGHT MODE ──────────────────────────────────────────────────── */
  .light-mode {"""

c2_new = """  /* ─── COLOR THEMES ────────────────────────────────────────────────── */
  .theme-midnight {
    --navy:   #08080F;
    --navy2:  #0D0D1A;
    --navy3:  #12122A;
    --slate:  #16163A;
    --slate2: #1E1E4A;
    --blue:       #6366F1;
    --blue-light: #818CF8;
    --blue-glow:  rgba(99,102,241,0.12);
    --amber:      #F59E0B;
    --amber2:     #FBBF24;
    --amber-glow: rgba(245,158,11,0.12);
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
    --amber:      #F59E0B;
    --amber2:     #FBBF24;
    --amber-glow: rgba(245,158,11,0.12);
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
    --amber:      #F59E0B;
    --amber2:     #FBBF24;
    --amber-glow: rgba(245,158,11,0.12);
    --border:  rgba(255,255,255,0.07);
    --border2: rgba(255,255,255,0.12);
    --card:    rgba(255,255,255,0.04);
    --card2:   rgba(255,255,255,0.07);
  }

  /* ─── LIGHT MODE ──────────────────────────────────────────────────── */
  .light-mode {"""

if c2_old in src:
    src = src.replace(c2_old, c2_new, 1)
    print('Change 2 OK - theme CSS variables added')
else:
    print('FAIL: Change 2 - string not found')
    ok = False

# ─── CHANGE 3: Apply theme class to app div ───────────────────────────────────
c3_old = """        <div className={darkMode ? "app" : "app light-mode"}>"""

c3_new = """        <div className={`app${!darkMode ? ' light-mode' : ''} theme-${colorTheme}`}>"""

if c3_old in src:
    src = src.replace(c3_old, c3_new, 1)
    print('Change 3 OK - theme class applied to app div')
else:
    print('FAIL: Change 3 - string not found')
    ok = False

# ─── CHANGE 4: Add theme swatches to header ──────────────────────────────────
c4_old = """              <button onClick={() => setDarkMode(!darkMode)} title={darkMode ? "Light Mode" : "Dark Mode"} style={{ background:"transparent", border:"1px solid var(--border)", borderRadius:8, padding:"6px 12px", color:"var(--text-muted)", fontSize:14, cursor:"pointer" }}>
                {darkMode ? "☀️" : "🌙"}
              </button>"""

c4_new = """              <div style={{ display:'flex', gap:5, alignItems:'center', padding:'4px 8px', background:'var(--card)', border:'1px solid var(--border)', borderRadius:10 }}>
                {[
                  { id:'navy',     color:'#050C18', accent:'#F59E0B', label:'Navy' },
                  { id:'midnight', color:'#08080F', accent:'#818CF8', label:'Midnight' },
                  { id:'slate',    color:'#0F0F1A', accent:'#A78BFA', label:'Slate' },
                  { id:'forest',   color:'#080F0A', accent:'#34D399', label:'Forest' },
                ].map(t => (
                  <button key={t.id} onClick={() => applyTheme(t.id)} title={t.label}
                    style={{ width:18, height:18, borderRadius:'50%', border: colorTheme===t.id ? '2px solid var(--amber)' : '2px solid transparent',
                      background: `linear-gradient(135deg, ${t.color} 50%, ${t.accent} 50%)`,
                      cursor:'pointer', padding:0, transition:'transform 0.15s',
                      transform: colorTheme===t.id ? 'scale(1.25)' : 'scale(1)' }} />
                ))}
              </div>
              <button onClick={() => setDarkMode(!darkMode)} title={darkMode ? "Light Mode" : "Dark Mode"} style={{ background:"transparent", border:"1px solid var(--border)", borderRadius:8, padding:"6px 12px", color:"var(--text-muted)", fontSize:14, cursor:"pointer" }}>
                {darkMode ? "☀️" : "🌙"}
              </button>"""

if c4_old in src:
    src = src.replace(c4_old, c4_new, 1)
    print('Change 4 OK - theme swatches added to header')
else:
    print('FAIL: Change 4 - string not found')
    ok = False

# Write file
with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(src)

if ok:
    print('\nAll changes written. Run: npm run build 2>&1 | head -20')
else:
    print('\nSome changes failed. File written with successful changes.')
