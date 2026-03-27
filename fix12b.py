#!/usr/bin/env python3
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# The broken string has a literal newline between the quotes
# Replace it with proper \n\n escape
broken = "navigator.clipboard.writeText('Subject: ' + transcriptResult.followUpEmail.subject + '\n\n' + transcriptResult.followUpEmail.body)"
fixed  = "navigator.clipboard.writeText('Subject: ' + transcriptResult.followUpEmail.subject + '\\n\\n' + transcriptResult.followUpEmail.body)"

if broken in content:
    content = content.replace(broken, fixed, 1)
    print('Fixed literal newline in copy button')
else:
    print('String not found - checking raw bytes...')
    # Try with \r\n
    broken2 = "navigator.clipboard.writeText('Subject: ' + transcriptResult.followUpEmail.subject + '\r\n\r\n' + transcriptResult.followUpEmail.body)"
    if broken2 in content:
        content = content.replace(broken2, fixed, 1)
        print('Fixed CRLF newline in copy button')
    else:
        print('FAIL - manual fix needed at line 4606')

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done.')
