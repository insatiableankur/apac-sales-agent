#!/usr/bin/env python3
"""
Patch 1 — Strip HTML tags (e.g. <cite index="...">) from POV doc AI output.

What this does:
  1. Inserts a recursive stripCiteTags(val) helper at module scope
     (right after the DEAL_STAGES constant).
  2. Wraps the setPovDoc(JSON.parse(...)) call with the helper so every
     string in the POV object is sanitized before being stored in state.

Why source-level sanitize (not render-level):
  The POV doc is consumed by JSX, PDF export, and copy-to-clipboard.
  Fixing at the source means all three inherit clean text for free.

Safe to re-run: idempotent (aborts if helper already present).
"""
import sys
from pathlib import Path

FILE = Path("src/App.jsx")

if not FILE.exists():
    print("FAIL: src/App.jsx not found. Run from repo root (apac-sales-agent).")
    sys.exit(1)

text = FILE.read_text()
original_len = len(text)

# ───────────────────────── PRE-FLIGHT ─────────────────────────
anchors = {
    "DEAL_STAGES line": 'const DEAL_STAGES = ["Prospecting',
    "setPovDoc call":   "if(s!==-1&&e!==-1) setPovDoc(JSON.parse(text.slice(s,e+1)));",
}
for name, s in anchors.items():
    count = text.count(s)
    if count != 1:
        print(f"FAIL pre-flight: '{name}' found {count} times (want exactly 1).")
        sys.exit(1)
    print(f"OK pre-flight: {name}")

# Idempotency guard
if "const stripCiteTags" in text:
    print("SKIP: stripCiteTags already present. No changes made.")
    sys.exit(0)

# ─────────────────────── INSERTION 1: HELPER ───────────────────────
helper = (
    "\n"
    "const stripCiteTags = (val) => {\n"
    "  if (typeof val === 'string') return val.replace(new RegExp('<[^>]+>', 'g'), '');\n"
    "  if (Array.isArray(val)) return val.map(stripCiteTags);\n"
    "  if (val && typeof val === 'object') {\n"
    "    const out = {};\n"
    "    for (const k in val) out[k] = stripCiteTags(val[k]);\n"
    "    return out;\n"
    "  }\n"
    "  return val;\n"
    "};\n"
)

# Find the full DEAL_STAGES line (it's long, ends at its closing bracket + semicolon)
# Simpler: split on newlines, find the one that starts with 'const DEAL_STAGES =', insert after it
lines = text.split("\n")
ds_idx = None
for i, ln in enumerate(lines):
    if ln.startswith("const DEAL_STAGES ="):
        ds_idx = i
        break

if ds_idx is None:
    print("FAIL: could not locate DEAL_STAGES line in file.")
    sys.exit(1)

# Insert helper AFTER the DEAL_STAGES line
lines.insert(ds_idx + 1, helper.rstrip("\n"))
text = "\n".join(lines)

# ─────────────────────── INSERTION 2: WRAP CALL ───────────────────────
old_call = "if(s!==-1&&e!==-1) setPovDoc(JSON.parse(text.slice(s,e+1)));"
new_call = "if(s!==-1&&e!==-1) setPovDoc(stripCiteTags(JSON.parse(text.slice(s,e+1))));"
assert text.count(old_call) == 1, "setPovDoc anchor disappeared after helper insert"
text = text.replace(old_call, new_call, 1)

FILE.write_text(text)

# ───────────────────────── POST-AUDIT ─────────────────────────
text_after = FILE.read_text()
checks = [
    ("helper function present",       text_after.count("const stripCiteTags = (val) => {") == 1),
    ("helper called at setPovDoc",    text_after.count("setPovDoc(stripCiteTags(JSON.parse") == 1),
    ("no literal <cite in source",    "<cite" not in text_after),
    ("file grew (insertion worked)",  len(text_after) > original_len),
]
failed = [name for name, ok in checks if not ok]
if failed:
    print("FAIL post-audit:", failed)
    sys.exit(1)

for name, _ in checks:
    print(f"OK post-audit: {name}")

print("")
print("Patch 1 applied successfully.")
print("Next: npm run build 2>&1 | head -30")
