#!/usr/bin/env python3
"""
patch_reset_secondary.py
Fix: Secondary sections (Close Plan, MSP, POV, Champion Playbook, Negotiation,
Exec Brief) carry over from previous deal into new PDF export.
Root cause: these state vars are never cleared when a new analysis starts.
Fix: reset them all at the top of runAnalysis (at setAnalyzeStep(0)).
Run from project root: python3 patch_reset_secondary.py
"""
import sys, re

PATH = 'src/App.jsx'
try:
    with open(PATH, 'r', encoding='utf-8') as f:
        src = f.read()
except FileNotFoundError:
    print(f'ERROR: {PATH} not found. Run from project root.')
    sys.exit(1)

print('=== PRE-FLIGHT ===')

# Verify anchor exists and is unique
ANCHOR = 'setAnalyzeStep(0);'
count = src.count(ANCHOR)
if count == 0:
    print(f'FAIL: "{ANCHOR}" not found in file')
    sys.exit(1)
if count > 1:
    print(f'WARN: "{ANCHOR}" found {count} times — will replace first occurrence')
print(f'  OK  anchor found ({count} occurrence(s))')

# Verify the secondary state setters we're about to call actually exist
SETTERS_TO_CHECK = [
    'setClosePlan',
    'setMutualSuccessPlan',
    'setChampionPlaybook',
    'setPovDoc',
    'setNegotiationPlaybook',
    'setExecBrief',
    'setCloseDate',
]
missing = []
for setter in SETTERS_TO_CHECK:
    if setter in src:
        print(f'  OK  {setter} exists in file')
    else:
        print(f'  SKIP {setter} not found — will omit from reset block')
        missing.append(setter)

confirmed = [s for s in SETTERS_TO_CHECK if s not in missing]

# Build reset block from confirmed setters only
reset_lines = ['', '        // Reset secondary sections from previous deal — prevents stale data in PDF']
for setter in confirmed:
    if setter == 'setCloseDate':
        reset_lines.append(f"        {setter}('');")
    else:
        reset_lines.append(f"        {setter}(null);")

RESET_BLOCK = '\n'.join(reset_lines) + '\n'

print(f'\n  Resetting {len(confirmed)} secondary sections on new analysis start')

# ── APPLY PATCH ───────────────────────────────────────────────────────────────
print('\n=== APPLYING PATCH ===')
src = src.replace(ANCHOR, ANCHOR + RESET_BLOCK, 1)
print('  Reset block injected after setAnalyzeStep(0)')

# ── POST-WRITE AUDIT ──────────────────────────────────────────────────────────
print('\n=== POST-WRITE AUDIT ===')
for setter in confirmed:
    reset_call = f"{setter}(null)" if setter != 'setCloseDate' else f"{setter}('')"
    if reset_call in src:
        print(f'  OK  {reset_call} present in reset block')
    else:
        print(f'  FAIL {reset_call} NOT found — patch may have failed')

# Danger checks
for bad in ['&amp;', 'setAnalyzeStep(0);\n        // Reset secondary sections from previous deal']:
    pass  # not a danger pattern check

# Verify no duplicate reset blocks (idempotency check)
reset_marker = '// Reset secondary sections from previous deal'
occurrences = src.count(reset_marker)
if occurrences == 1:
    print(f'  OK  reset block present exactly once')
elif occurrences > 1:
    print(f'  WARN reset block present {occurrences} times — possible duplicate patch')
else:
    print(f'  FAIL reset marker not found in output')

# ── WRITE FILE ────────────────────────────────────────────────────────────────
with open(PATH, 'w', encoding='utf-8') as f:
    f.write(src)

print(f'\nFile written: {PATH}')
print(f'New char count: {len(src)} (was {len(src) - len(RESET_BLOCK)})')
print('\nNEXT STEPS:')
print('  npm run build 2>&1 | head -20')
print('  (if clean) git add -A && git commit -m "fix: reset secondary sections on new analysis — prevents stale deal data in PDF" && git push')
