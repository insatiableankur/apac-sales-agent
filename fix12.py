#!/usr/bin/env python3
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    src = f.read()

# Fix the unterminated string — replace literal newline with \n escape
old = """                            <button className="copy-btn" onClick={() => navigator.clipboard.writeText('Subject: ' + transcriptResult.followUpEmail.subject + '
"""
new = """                            <button className="copy-btn" onClick={() => navigator.clipboard.writeText('Subject: ' + transcriptResult.followUpEmail.subject + '\\n\\n'"""

# More targeted fix
import re
src = re.sub(
    r"navigator\.clipboard\.writeText\('Subject: ' \+ transcriptResult\.followUpEmail\.subject \+ '\n\n' \+ transcriptResult\.followUpEmail\.body\)",
    "navigator.clipboard.writeText('Subject: ' + transcriptResult.followUpEmail.subject + '\\n\\n' + transcriptResult.followUpEmail.body)",
    src
)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(src)
print('Fixed. Run: npm run build 2>&1 | head -20')
