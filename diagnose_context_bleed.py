#!/usr/bin/env python3
"""
diagnose_context_bleed.py
Finds where company context drops in secondary API calls (Close Plan, Champion, POV, MSP).
Run from project root: python3 diagnose_context_bleed.py
"""
import re, sys

PATH = 'src/App.jsx'
try:
    with open(PATH, 'r', encoding='utf-8') as f:
        src = f.read()
except FileNotFoundError:
    print(f'ERROR: {PATH} not found. Run from project root.')
    sys.exit(1)

lines = src.split('\n')
print(f'File loaded: {len(lines)} lines\n')

# ── 1. Find all fetch('/api/anthropic') calls ─────────────────────────────────
print('=' * 70)
print('1. ALL FETCH CALLS TO /api/anthropic')
print('=' * 70)
for i, line in enumerate(lines):
    if '/api/anthropic' in line:
        start = max(0, i - 15)
        end = min(len(lines), i + 5)
        print(f'\n--- Call at line {i+1} ---')
        for j in range(start, end):
            marker = '>>>' if j == i else '   '
            print(f'{marker} {j+1:4d}: {lines[j]}')

# ── 2. Find Close Plan generation ────────────────────────────────────────────
print('\n' + '=' * 70)
print('2. CLOSE PLAN GENERATION — where is company used in prompt?')
print('=' * 70)
kw_patterns = ['closePlan', 'close_plan', 'ClosePlan', 'Close Plan', 'closeplan']
for kw in kw_patterns:
    for i, line in enumerate(lines):
        if kw in line and ('prompt' in line.lower() or 'fetch' in line.lower() or 'generate' in line.lower() or 'async' in line.lower()):
            print(f'\nLine {i+1} [{kw}]: {line.strip()[:120]}')

# ── 3. Find POV / MSP / Champion secondary generation ────────────────────────
print('\n' + '=' * 70)
print('3. SECONDARY SECTION GENERATORS (POV, MSP, Champion Playbook)')
print('=' * 70)
secondary_kw = ['generatePov', 'generateMsp', 'generateChampion', 'povBuilder',
                'mutualSuccess', 'championPlaybook', 'generateClose', 'runClose',
                'buildClose', 'pov', 'POV', 'negotiationPlaybook']
seen_lines = set()
for kw in secondary_kw:
    for i, line in enumerate(lines):
        if kw in line and i not in seen_lines:
            ctx_start = max(0, i - 3)
            ctx_end = min(len(lines), i + 3)
            if any(x in ' '.join(lines[ctx_start:ctx_end]) for x in
                   ['fetch', 'prompt', 'async', 'await', 'generate', 'run', 'content']):
                seen_lines.add(i)
                print(f'\nLine {i+1} [{kw}]: {line.strip()[:120]}')

# ── 4. Find how company is referenced in prompts ─────────────────────────────
print('\n' + '=' * 70)
print('4. COMPANY VARIABLE USAGE IN PROMPT STRINGS')
print('=' * 70)
for i, line in enumerate(lines):
    stripped = line.strip()
    if ('company' in stripped.lower() and
        any(x in stripped for x in ['prompt', 'content', 'messages', '`', '${', '+']) and
        'useState' not in stripped and 'setCompany' not in stripped):
        print(f'  Line {i+1}: {stripped[:130]}')

# ── 5. Find state variable for company name ───────────────────────────────────
print('\n' + '=' * 70)
print('5. COMPANY STATE VARIABLE')
print('=' * 70)
for i, line in enumerate(lines):
    if re.search(r'const \[\w*[Cc]ompan\w*,', line) or \
       re.search(r'useState.*[Cc]ompan', line) or \
       ('company' in line and 'useState' in line):
        print(f'  Line {i+1}: {line.strip()[:130]}')

# ── 6. Check for any hardcoded company names or stale context ─────────────────
print('\n' + '=' * 70)
print('6. HARDCODED OR STALE COMPANY REFERENCES IN PROMPTS')
print('=' * 70)
suspicious = ['Maybank', 'maybank', 'MAYBANK']
for kw in suspicious:
    count = src.count(kw)
    if count:
        print(f'  WARNING: "{kw}" appears {count} times in source!')
        for i, line in enumerate(lines):
            if kw in line:
                print(f'    Line {i+1}: {line.strip()[:120]}')

# ── 7. Find parallel call structure ──────────────────────────────────────────
print('\n' + '=' * 70)
print('7. PARALLEL CALL STRUCTURE (Promise.all or similar)')
print('=' * 70)
for i, line in enumerate(lines):
    if any(x in line for x in ['Promise.all', 'Promise.allSettled', 'parallel', 'Promise.race']):
        start = max(0, i - 2)
        end = min(len(lines), i + 8)
        print(f'\n--- Line {i+1} ---')
        for j in range(start, end):
            print(f'  {j+1:4d}: {lines[j]}')

# ── 8. Find deal history / localStorage reads near generation ─────────────────
print('\n' + '=' * 70)
print('8. LOCALSTORAGE READS (potential stale data source)')
print('=' * 70)
for i, line in enumerate(lines):
    if 'localStorage' in line and ('getItem' in line or 'parse' in line):
        print(f'  Line {i+1}: {line.strip()[:130]}')

# ── 9. Summary of likely root cause ──────────────────────────────────────────
print('\n' + '=' * 70)
print('9. DIAGNOSIS SUMMARY')
print('=' * 70)

api_call_count = src.count('/api/anthropic')
print(f'  Total /api/anthropic calls: {api_call_count}')

company_in_prompt = sum(1 for l in lines if 'company' in l.lower() and
                        any(x in l for x in ['prompt', 'content', 'messages']))
print(f'  Lines with "company" in prompt context: {company_in_prompt}')

has_maybank = 'Maybank' in src or 'maybank' in src
print(f'  Maybank hardcoded in source: {has_maybank}')

promise_all = 'Promise.all' in src
print(f'  Uses Promise.all for parallel calls: {promise_all}')

print('\nCheck the output above to identify:')
print('  A) Which secondary calls omit company from the prompt')
print('  B) Whether stale localStorage data is being read')
print('  C) Whether any prompt uses a different variable than the current company state')
