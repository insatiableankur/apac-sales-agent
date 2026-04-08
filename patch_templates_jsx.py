#!/usr/bin/env python3
"""
patch_templates_jsx.py v4
Inserts Templates Library before the Discovery Questions JSX comment,
which is the first child inside the Playbook tab wrapper div.
This is safe: multiple children inside a div, no return() issues.
Run from project root: python3 patch_templates_jsx.py
"""
import sys

PATH = 'src/App.jsx'
try:
    with open(PATH, 'r', encoding='utf-8') as f:
        src = f.read()
except FileNotFoundError:
    print(f'ERROR: {PATH} not found. Run from project root.')
    sys.exit(1)

print('=== PRE-FLIGHT ===')
REQUIRED = [
    ('TEMPLATE_LIST',      'template data array'),
    ('generateTemplate',   'generateTemplate function'),
    ('exportTemplatePDF',  'exportTemplatePDF function'),
    ('exportTemplateDOCX', 'exportTemplateDOCX function'),
    ('formatTmplOutput',   'formatTmplOutput function'),
    ('tmplStage',          'tmplStage state'),
    ('tmplActive',         'tmplActive state'),
    ('tmplContent',        'tmplContent state'),
    ('tmplLoading',        'tmplLoading state'),
]
fail = False
for s, label in REQUIRED:
    if s in src:
        print(f'  OK   {label}')
    else:
        print(f'  FAIL {label}')
        fail = True
if fail:
    sys.exit(1)

if 'TEMPLATE_LIST.filter' in src:
    print('  Templates UI already rendered — nothing to do.')
    sys.exit(0)

# ── FIND ANCHOR ───────────────────────────────────────────────────────────────
# Structure confirmed from diagnostic:
#   {activeTab === "playbook" && (
#     <div className="anim-slide-up tab-content-area">
#       {/* Discovery Questions */}    <-- insert templates BEFORE this line
#       {result.discoveryQuestions && (() => {   <-- IIFE (would break if inserted inside)
#
# We find the playbook tab condition first, then find the Discovery Questions
# JSX comment within the following chunk. We insert our block before it.

pb_pos = src.find('activeTab === "playbook"')
if pb_pos == -1:
    pb_pos = src.find("activeTab === 'playbook'")
if pb_pos == -1:
    print('FAIL: playbook condition not found')
    sys.exit(1)
print(f'  Playbook condition at char {pb_pos}')

# Find the Discovery Questions JSX comment after the playbook condition
ANCHOR = '{/* Discovery Questions */}'
anchor_pos = src.find(ANCHOR, pb_pos)
if anchor_pos == -1:
    print(f'FAIL: "{ANCHOR}" not found after playbook condition')
    sys.exit(1)
print(f'  Anchor at char {anchor_pos}')

# Verify it's inside the tab-content-area wrapper (not a return statement)
pre = src[pb_pos:anchor_pos]
if 'anim-slide-up tab-content-area' not in pre:
    print('FAIL: tab-content-area wrapper not found between playbook and anchor')
    sys.exit(1)
print('  Safety: inside tab-content-area wrapper confirmed')

# Check no bare return( between the wrapper div and anchor
wrapper_pos = pre.find('anim-slide-up tab-content-area')
post_wrapper = pre[wrapper_pos:]
if 'return (' in post_wrapper:
    print('FAIL: "return (" found between wrapper and anchor — unsafe')
    sys.exit(1)
print('  Safety: no return() between wrapper and anchor')

# Find line start of the anchor
line_start = src.rfind('\n', 0, anchor_pos) + 1
indent = ''
for ch in src[line_start:]:
    if ch in (' ', '\t'):
        indent += ch
    else:
        break
print(f'  Line start: {line_start}, indent: {len(indent)} spaces\n')

# ── JSX ───────────────────────────────────────────────────────────────────────
i = indent

JSX = (
    i + "<div style={{marginBottom:'2rem'}}>\n"

    + i + "  <div className=\"section-header\" style={{marginBottom:'0.5rem'}}>\n"
    + i + "    <div><span style={{marginRight:6}}>&#x1F4DA;</span>Templates Library</div>\n"
    + i + "    <span style={{fontSize:'12px',color:'var(--text-muted)'}}>\n"
    + i + "      {form.company ? 'AI pre-fill ready \u2014 ' + form.company : 'Run intelligence to enable AI pre-fill'}\n"
    + i + "    </span>\n"
    + i + "  </div>\n"
    + i + "  <p style={{fontSize:'13px',color:'var(--text-muted)',marginBottom:'1.25rem',lineHeight:'1.6'}}>\n"
    + i + "    18 MEDDPICC and Command of the Message templates. AI pre-filled from your deal. Download as PDF or DOCX.\n"
    + i + "  </p>\n"

    + i + "  <div className=\"tmpl-stage-pills\">\n"
    + i + "    {['all','qualify','align','validate','biz','close','expand'].map(function(s) { return (\n"
    + i + "      <button key={s}\n"
    + i + "        className={'tmpl-pill' + (tmplStage === s ? ' active' : '')}\n"
    + i + "        onClick={function() { setTmplStage(s); setTmplActive(null); setTmplContent(''); }}>\n"
    + i + "        {s === 'all' ? 'All 18' : s === 'qualify' ? 'Qualify & discover' : s === 'align' ? 'Solution alignment' : s === 'validate' ? 'Validate & prove' : s === 'biz' ? 'Business case' : s === 'close' ? 'Negotiate & close' : 'Post-sale'}\n"
    + i + "      </button>\n"
    + i + "    ); })}\n"
    + i + "  </div>\n"

    + i + "  <div className=\"tmpl-grid\">\n"
    + i + "    {TEMPLATE_LIST.filter(function(t) { return tmplStage === 'all' || t.stage === tmplStage; }).map(function(t) { return (\n"
    + i + "      <div key={t.id}\n"
    + i + "        className={'tmpl-card' + (tmplActive && tmplActive.id === t.id ? ' tmpl-sel' : '')}\n"
    + i + "        onClick={function() { setTmplActive(tmplActive && tmplActive.id === t.id ? null : t); setTmplContent(''); }}>\n"
    + i + "        <div className=\"tmpl-icon\">{t.icon}</div>\n"
    + i + "        <div className=\"tmpl-name\">{t.name}</div>\n"
    + i + "        <div className=\"tmpl-desc\">{t.desc}</div>\n"
    + i + "        <div className=\"tmpl-meta\">\n"
    + i + "          <span className=\"tmpl-badge\">{t.badge}</span>\n"
    + i + "          {t.docx && <span className=\"tmpl-docx-tag\">DOCX</span>}\n"
    + i + "          <span className=\"tmpl-fw\">{t.framework}</span>\n"
    + i + "        </div>\n"
    + i + "      </div>\n"
    + i + "    ); })}\n"
    + i + "  </div>\n"

    + i + "  {tmplActive && (\n"
    + i + "    <div className=\"tmpl-preview-panel\">\n"
    + i + "      <div className=\"tmpl-preview-top\">\n"
    + i + "        <div className=\"tmpl-pname\">{tmplActive.name}</div>\n"
    + i + "        <div className=\"tmpl-pmeta\">{tmplActive.framework} &middot; {tmplActive.stageLabel}</div>\n"
    + i + "        <div className=\"tmpl-act-row\">\n"
    + i + "          <button className=\"tmpl-btn tmpl-btn-ai\" disabled={tmplLoading}\n"
    + i + "            onClick={function() { generateTemplate(tmplActive); }}>\n"
    + i + "            {tmplLoading ? 'Generating...' : (form.company ? 'AI Pre-fill \u2014 ' + form.company : 'AI Pre-fill')}\n"
    + i + "          </button>\n"
    + i + "          <button className=\"tmpl-btn\"\n"
    + i + "            onClick={function() { exportTemplatePDF(tmplActive, tmplContent); }}>\n"
    + i + "            Blank PDF\n"
    + i + "          </button>\n"
    + i + "          {tmplActive.docx && (\n"
    + i + "            <button className=\"tmpl-btn\"\n"
    + i + "              onClick={function() { exportTemplateDOCX(tmplActive, tmplContent); }}>\n"
    + i + "              Download DOCX\n"
    + i + "            </button>\n"
    + i + "          )}\n"
    + i + "          {tmplContent && (\n"
    + i + "            <button className=\"tmpl-btn\"\n"
    + i + "              onClick={function() { navigator.clipboard.writeText(tmplContent); }}>\n"
    + i + "              Copy\n"
    + i + "            </button>\n"
    + i + "          )}\n"
    + i + "        </div>\n"
    + i + "      </div>\n"
    + i + "      {tmplLoading && (\n"
    + i + "        <div className=\"tmpl-gen-loading\">\n"
    + i + "          <div className=\"spinner\" style={{width:'16px',height:'16px'}} />\n"
    + i + "          Generating from deal context...\n"
    + i + "        </div>\n"
    + i + "      )}\n"
    + i + "      {!tmplLoading && !tmplContent && (\n"
    + i + "        <div className=\"tmpl-empty-hint\">\n"
    + i + "          {form.company\n"
    + i + "            ? 'Click AI Pre-fill to generate this template with ' + form.company + ' deal data. Or download the blank PDF.'\n"
    + i + "            : 'Run intelligence first for AI pre-fill. Download the blank PDF to use immediately.'}\n"
    + i + "        </div>\n"
    + i + "      )}\n"
    + i + "      {tmplContent && (\n"
    + i + "        <div className=\"tmpl-output\"\n"
    + i + "          dangerouslySetInnerHTML={{__html: formatTmplOutput(tmplContent)}} />\n"
    + i + "      )}\n"
    + i + "    </div>\n"
    + i + "  )}\n"
    + i + "  <div className=\"tmpl-divider\">Playbook tools</div>\n"
    + i + "</div>\n\n"
)

src = src[:line_start] + JSX + src[line_start:]

# ── AUDIT ─────────────────────────────────────────────────────────────────────
print('=== POST-WRITE AUDIT ===')
AUDIT = [
    ('TEMPLATE_LIST.filter',          'grid render loop'),
    ('tmpl-stage-pills',              'stage pills'),
    ('tmpl-grid',                     'card grid'),
    ('tmpl-preview-panel',            'preview panel'),
    ('generateTemplate(tmplActive)',   'AI pre-fill handler'),
    ('exportTemplatePDF(tmplActive',  'PDF export'),
    ('exportTemplateDOCX(tmplActive', 'DOCX export'),
    ('formatTmplOutput(tmplContent)', 'output formatter'),
    ('tmpl-divider',                  'playbook divider'),
    ('Templates Library',             'section heading'),
]
ok = True
for s, label in AUDIT:
    if s in src:
        print(f'  OK   {label}')
    else:
        print(f'  MISS {label}')
        ok = False
if not ok:
    print('\nAudit FAILED. Aborting write.')
    sys.exit(1)

with open(PATH, 'w', encoding='utf-8') as f:
    f.write(src)

print(f'\nWritten: {len(src)} chars')
print('\nNEXT:')
print('  npm run build 2>&1 | head -20')
print('  git add -A && git commit -m "fix: render Templates Library in Playbook tab" && git push')
