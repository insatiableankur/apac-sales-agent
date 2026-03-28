import shutil, sys

src_path = 'src/App.jsx'
with open(src_path, 'r', encoding='utf-8') as f:
    src = f.read()

shutil.copy(src_path, src_path + '.backup_pdffmt')
print('Backup saved')

changes = []

# ── FIX 1: MSP commitments — dynamic row height, remove slice(0,2) truncation ──
old1 = (
    "      const hw = (CW - 4) / 2;\n"
    "      checkY(20);\n"
    "      setTxt('#1A56DB'); doc.setFontSize(8); doc.setFont('helvetica','bold');\n"
    "      doc.text('We Commit To:', M, y);\n"
    "      doc.text('Buyer Commits To:', M + hw + 4, y); y += 5;\n"
    "      const maxCommits = Math.max(phase.vendorCommitments?.length || 0, phase.buyerCommitments?.length || 0);\n"
    "      for (let ci = 0; ci < maxCommits; ci++) {\n"
    "        checkY(6);\n"
    "        setTxt('#374151'); doc.setFontSize(8); doc.setFont('helvetica','normal');\n"
    "        if (phase.vendorCommitments?.[ci]) {\n"
    "          const vl = doc.splitTextToSize('\u2192 ' + phase.vendorCommitments[ci], hw - 2);\n"
    "          vl.slice(0,2).forEach((l, li) => doc.text(l, M, y + li * 4));\n"
    "        }\n"
    "        if (phase.buyerCommitments?.[ci]) {\n"
    "          const bl = doc.splitTextToSize('\u2192 ' + phase.buyerCommitments[ci], hw - 2);\n"
    "          bl.slice(0,2).forEach((l, li) => doc.text(l, M + hw + 4, y + li * 4));\n"
    "        }\n"
    "        y += 9;\n"
    "      }"
)
new1 = (
    "      const hw = (CW - 4) / 2;\n"
    "      checkY(20);\n"
    "      setTxt('#1A56DB'); doc.setFontSize(8); doc.setFont('helvetica','bold');\n"
    "      doc.text('We Commit To:', M, y);\n"
    "      doc.text('Buyer Commits To:', M + hw + 4, y); y += 5;\n"
    "      const maxCommits = Math.max(phase.vendorCommitments?.length || 0, phase.buyerCommitments?.length || 0);\n"
    "      for (let ci = 0; ci < maxCommits; ci++) {\n"
    "        const vcl = phase.vendorCommitments?.[ci] ? doc.splitTextToSize('-> ' + phase.vendorCommitments[ci], hw - 4) : [];\n"
    "        const bcl = phase.buyerCommitments?.[ci] ? doc.splitTextToSize('-> ' + phase.buyerCommitments[ci], hw - 4) : [];\n"
    "        const rowH = Math.max(vcl.length, bcl.length) * 4.5 + 3;\n"
    "        checkY(rowH + 1);\n"
    "        setTxt('#374151'); doc.setFontSize(8); doc.setFont('helvetica','normal');\n"
    "        vcl.forEach((l, li) => doc.text(l, M, y + li * 4.5));\n"
    "        bcl.forEach((l, li) => doc.text(l, M + hw + 4, y + li * 4.5));\n"
    "        y += rowH;\n"
    "      }"
)
if old1 in src:
    src = src.replace(old1, new1, 1)
    changes.append('Fix 1 OK - MSP commitments dynamic height, no truncation')
else:
    changes.append('FAIL: Fix 1 - MSP commitments string not found')

# ── FIX 2: Objection handlers — dynamic box height ──
old2 = (
    "    com.objectionHandlers?.forEach(o => {\n"
    "      checkY(18);\n"
    "      setFill('#FEF2F2'); doc.roundedRect(M, y, CW, 16, 1.5, 1.5, 'F');\n"
    "      setTxt('#991B1B'); doc.setFontSize(9); doc.setFont('helvetica','bold');\n"
    "      const ql = doc.splitTextToSize(`\"${o.objection}\"`, CW - 8);\n"
    "      doc.text(ql[0] || '', M + 4, y + 5);\n"
    "      setTxt('#374151'); doc.setFontSize(8); doc.setFont('helvetica','normal');\n"
    "      const rl = doc.splitTextToSize(o.response || '', CW - 8);\n"
    "      rl.slice(0,2).forEach((l,li) => doc.text(l, M + 4, y + 10 + li*4));\n"
    "      y += 19;\n"
    "    });"
)
new2 = (
    "    com.objectionHandlers?.forEach(o => {\n"
    "      const objQLines = doc.splitTextToSize('\"' + (o.objection || '') + '\"', CW - 8);\n"
    "      const objRLines = doc.splitTextToSize(o.response || '', CW - 8);\n"
    "      const objH = objQLines.length * 4.5 + objRLines.length * 4.5 + 10;\n"
    "      checkY(objH + 2);\n"
    "      setFill('#FEF2F2'); doc.roundedRect(M, y, CW, objH, 1.5, 1.5, 'F');\n"
    "      setTxt('#991B1B'); doc.setFontSize(9); doc.setFont('helvetica','bold');\n"
    "      objQLines.forEach((l, li) => doc.text(l, M + 4, y + 5 + li * 4.5));\n"
    "      setTxt('#374151'); doc.setFontSize(8); doc.setFont('helvetica','normal');\n"
    "      objRLines.forEach((l, li) => doc.text(l, M + 4, y + 5 + objQLines.length * 4.5 + 2 + li * 4.5));\n"
    "      y += objH + 3;\n"
    "    });"
)
if old2 in src:
    src = src.replace(old2, new2, 1)
    changes.append('Fix 2 OK - objection handlers dynamic height')
else:
    changes.append('FAIL: Fix 2 - objection handlers string not found')

# ── FIX 3: Value driver boxes — dynamic height ──
old3 = (
    "      setFill('#FFFBEB'); doc.roundedRect(M, y, CW, 12, 1.5, 1.5, 'F');\n"
    "      setTxt('#92400E'); doc.setFontSize(9); doc.setFont('helvetica','bold');\n"
    "      doc.text(v.driver, M + 4, y + 5);\n"
    "      setTxt('#10B981'); doc.setFontSize(9); doc.setFont('helvetica','bold');\n"
    "      doc.text(v.estimatedImpact || '', W - M - 4, y + 5, { align: 'right' });\n"
    "      setTxt('#374151'); doc.setFontSize(8); doc.setFont('helvetica','normal');\n"
    "      const vl = doc.splitTextToSize(v.specifics || '', CW - 8);\n"
    "      doc.text(vl[0] || '', M + 4, y + 9.5);\n"
    "      y += 15;"
)
new3 = (
    "      const vdrvLines = doc.splitTextToSize(v.driver || '', CW - 65);\n"
    "      const vspecLines = doc.splitTextToSize(v.specifics || '', CW - 8);\n"
    "      const vdH = Math.max(14, vdrvLines.length * 5 + vspecLines.length * 4.5 + 6);\n"
    "      checkY(vdH + 2);\n"
    "      setFill('#FFFBEB'); doc.roundedRect(M, y, CW, vdH, 1.5, 1.5, 'F');\n"
    "      setTxt('#92400E'); doc.setFontSize(9); doc.setFont('helvetica','bold');\n"
    "      vdrvLines.forEach((l, li) => doc.text(l, M + 4, y + 5 + li * 5));\n"
    "      setTxt('#10B981'); doc.setFontSize(9); doc.setFont('helvetica','bold');\n"
    "      doc.text(v.estimatedImpact || '', W - M - 4, y + 5, { align: 'right' });\n"
    "      setTxt('#374151'); doc.setFontSize(8); doc.setFont('helvetica','normal');\n"
    "      vspecLines.forEach((l, li) => doc.text(l, M + 4, y + 5 + vdrvLines.length * 5 + li * 4.5));\n"
    "      y += vdH + 3;"
)
if old3 in src:
    src = src.replace(old3, new3, 1)
    changes.append('Fix 3 OK - value driver boxes dynamic height')
else:
    changes.append('FAIL: Fix 3 - value driver string not found')

# ── FIX 4: Negotiation concessions — dynamic height ──
old4 = (
    "      setFill('#F8FAFF'); doc.roundedRect(M, y, CW, 14, 1.5, 1.5, 'F');\n"
    "      setTxt('#374151'); doc.setFontSize(8); doc.setFont('helvetica','bold');\n"
    "      doc.text(cf.sequence + ' \u2014 Give: ' + (cf.concession || ''), M + 3, y + 5);\n"
    "      setTxt('#10B981'); doc.setFont('helvetica','normal');\n"
    "      doc.text('Demand: ' + (cf.whatToAskFor || ''), M + 3, y + 10);\n"
    "      y += 17;"
)
new4 = (
    "      const cfGLines = doc.splitTextToSize(cf.sequence + ' - Give: ' + (cf.concession || ''), CW - 8);\n"
    "      const cfDLines = doc.splitTextToSize('Demand: ' + (cf.whatToAskFor || ''), CW - 8);\n"
    "      const cfH = (cfGLines.length + cfDLines.length) * 4.5 + 8;\n"
    "      checkY(cfH + 2);\n"
    "      setFill('#F8FAFF'); doc.roundedRect(M, y, CW, cfH, 1.5, 1.5, 'F');\n"
    "      setTxt('#374151'); doc.setFontSize(8); doc.setFont('helvetica','bold');\n"
    "      cfGLines.forEach((l, li) => doc.text(l, M + 3, y + 5 + li * 4.5));\n"
    "      setTxt('#10B981'); doc.setFont('helvetica','normal');\n"
    "      cfDLines.forEach((l, li) => doc.text(l, M + 3, y + 5 + cfGLines.length * 4.5 + li * 4.5));\n"
    "      y += cfH + 3;"
)
if old4 in src:
    src = src.replace(old4, new4, 1)
    changes.append('Fix 4 OK - negotiation concessions dynamic height')
else:
    changes.append('FAIL: Fix 4 - negotiation concession string not found')

# ── FIX 5: Landmine ✗ symbol — jsPDF helvetica can't render it ──
old5 = "    meetingPrep.landminesToAvoid?.forEach(l => bulletItem(`\u2717 ${l}`, '#EF4444')); y += 2;"
new5 = "    meetingPrep.landminesToAvoid?.forEach(l => bulletItem(l, '#EF4444')); y += 2;"
if old5 in src:
    src = src.replace(old5, new5, 1)
    changes.append('Fix 5 OK - landmine symbol removed for jsPDF compatibility')
else:
    changes.append('FAIL: Fix 5 - landmine symbol string not found')

# ── FIX 6: Critical Path + Early Warning Signals — keep together, prevent orphan ──
old6 = (
    "    if (closePlan.criticalPathItems?.length) {\n"
    "      sectionHeader('Critical Path', '#EF4444');\n"
    "      closePlan.criticalPathItems.forEach(c => bulletItem(c, '#991B1B'));\n"
    "    }\n"
    "    if (closePlan.earlyWarningSignals?.length) {\n"
    "      sectionHeader('Early Warning Signals', '#F59E0B');\n"
    "      closePlan.earlyWarningSignals.forEach(s => bulletItem(s, '#92400E'));\n"
    "    }"
)
new6 = (
    "    if (closePlan.criticalPathItems?.length) {\n"
    "      const cpNeeded = 16 + closePlan.criticalPathItems.length * 8 +\n"
    "        (closePlan.earlyWarningSignals?.length ? 16 + closePlan.earlyWarningSignals.length * 8 : 0);\n"
    "      checkY(Math.min(cpNeeded, 80));\n"
    "      sectionHeader('Critical Path', '#EF4444');\n"
    "      closePlan.criticalPathItems.forEach(c => bulletItem(c, '#991B1B'));\n"
    "    }\n"
    "    if (closePlan.earlyWarningSignals?.length) {\n"
    "      sectionHeader('Early Warning Signals', '#F59E0B');\n"
    "      closePlan.earlyWarningSignals.forEach(s => bulletItem(s, '#92400E'));\n"
    "    }"
)
if old6 in src:
    src = src.replace(old6, new6, 1)
    changes.append('Fix 6 OK - critical path + early warning grouped, orphan prevented')
else:
    changes.append('FAIL: Fix 6 - critical path string not found')

with open(src_path, 'w', encoding='utf-8') as f:
    f.write(src)

failed = [c for c in changes if c.startswith('FAIL')]
for c in changes:
    print(c)

if failed:
    print('\nSome fixes failed. Check output above.')
    sys.exit(1)
else:
    print('\nAll fixes applied. Run: npm run build 2>&1 | head -20')
