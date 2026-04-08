#!/usr/bin/env python3
"""diagnose_playbook.py — shows exact structure around Objection Simulator and playbook tab"""
PATH = 'src/App.jsx'
with open(PATH, 'r') as f:
    lines = f.readlines()

# Find Objection Simulator and show 25 lines before it
for i, line in enumerate(lines):
    if 'Objection Simulator' in line:
        print(f'=== Objection Simulator at line {i+1} ===')
        for j in range(max(0, i-25), min(len(lines), i+5)):
            print(f'{j+1:4d}: {lines[j]}', end='')
        print()
        break

# Find activeTab === playbook and show 30 lines after
for i, line in enumerate(lines):
    if 'activeTab === "playbook"' in line or "activeTab === 'playbook'" in line:
        print(f'\n=== Playbook tab condition at line {i+1} ===')
        for j in range(i, min(len(lines), i+30)):
            print(f'{j+1:4d}: {lines[j]}', end='')
        break

# Find all className values used in the playbook section
import re
src = open(PATH).read()
pb_pos = src.find('activeTab === "playbook"')
if pb_pos == -1:
    pb_pos = src.find("activeTab === 'playbook'")
ob_pos = src.find('Objection Simulator')
if pb_pos != -1 and ob_pos != -1:
    chunk = src[pb_pos:ob_pos]
    classes = re.findall(r'className=["\']([^"\']+)["\']', chunk)
    print(f'\n=== className values between playbook condition and Objection Simulator ===')
    for c in dict.fromkeys(classes):  # unique, order preserved
        print(f'  {c}')
