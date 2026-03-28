import shutil, sys

src_path = 'src/App.jsx'
with open(src_path, 'r', encoding='utf-8') as f:
    src = f.read()

shutil.copy(src_path, src_path + '.backup_responsive')
print('Backup saved')

changes = []

# ── FIX 1: History drawer — fixed 420px overflows on mobile ──
old1 = "style={{ position:\"fixed\", top:0, right:0, width:420, height:\"100vh\", background:\"var(--card)\", borderLeft:\"1px solid var(--border)\", zIndex:1000, overflowY:\"auto\", padding:24 }}"
new1 = "style={{ position:\"fixed\", top:0, right:0, width:\"min(420px, 100vw)\", height:\"100vh\", background:\"var(--card)\", borderLeft:\"1px solid var(--border)\", zIndex:1000, overflowY:\"auto\", padding:\"24px 16px\" }}"
if old1 in src:
    src = src.replace(old1, new1, 1)
    changes.append('Fix 1 OK - history drawer width mobile safe')
else:
    changes.append('FAIL: Fix 1 - history drawer string not found')

# ── FIX 2: .stakeholder-body — add mobile override ──
old2 = "  .stakeholder-body { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }"
new2 = (
    "  .stakeholder-body { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }\n"
    "  @media (max-width: 768px) { .stakeholder-body { grid-template-columns: 1fr; gap: 10px; } }"
)
if old2 in src:
    src = src.replace(old2, new2, 1)
    changes.append('Fix 2 OK - stakeholder-body mobile stack added')
else:
    changes.append('FAIL: Fix 2 - stakeholder-body string not found')

# ── FIX 3: .compete-vs — stack on mobile ──
old3 = "  .compete-vs { display:flex; gap:4px; align-items:stretch; margin-bottom:16px; border-radius:12px; overflow:hidden; }"
new3 = (
    "  .compete-vs { display:flex; gap:4px; align-items:stretch; margin-bottom:16px; border-radius:12px; overflow:hidden; }\n"
    "  @media (max-width: 480px) { .compete-vs { flex-direction: column; } }"
)
if old3 in src:
    src = src.replace(old3, new3, 1)
    changes.append('Fix 3 OK - compete-vs mobile stack added')
else:
    changes.append('FAIL: Fix 3 - compete-vs string not found')

with open(src_path, 'w', encoding='utf-8') as f:
    f.write(src)

failed = [c for c in changes if c.startswith('FAIL')]
for c in changes:
    print(c)

if failed:
    print('\nSome fixes failed.')
    sys.exit(1)
else:
    print('\nAll fixes applied. Run: npm run build 2>&1 | head -20')
