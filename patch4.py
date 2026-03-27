#!/usr/bin/env python3
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    src = f.read()

with open('src/App.jsx.backup_pdf', 'w', encoding='utf-8') as f:
    f.write(src)
print('Backup saved to src/App.jsx.backup_pdf')

ok = True

# ─── FIX 1: Page 4 — Talk track cut off (only tl[0] used) ───────────────────
c1_old = """      setTxt('#1A56DB'); doc.setFontSize(8); doc.setFont('helvetica','italic');
      const tl = doc.splitTextToSize(`"${s.talkTrack}"`, CW - 10);
      doc.text(tl[0] || '', M + 6, y + 31);

      y += 40;"""

c1_new = """      setTxt('#1A56DB'); doc.setFontSize(8); doc.setFont('helvetica','italic');
      const tl = doc.splitTextToSize(`"${s.talkTrack}"`, CW - 10);
      const tlLines = tl.slice(0, 3);
      const tlH = tlLines.length * 4.5;
      tlLines.forEach((l, li) => doc.text(l, M + 6, y + 29 + li * 4.5));

      y += Math.max(40, 32 + tlH);"""

if c1_old in src:
    src = src.replace(c1_old, c1_new, 1)
    print('Fix 1 OK - talk track no longer truncated')
else:
    print('FAIL: Fix 1 - string not found')
    ok = False

# ─── FIX 2: Page 8 — Before/After fixed height too small ─────────────────────
c2_old = """    // Before/After
    const bah = 28;
    checkY(bah + 4);
    setFill('#FEF2F2'); doc.roundedRect(M, y, CW/2 - 2, bah, 2, 2, 'F');
    setTxt('#DC2626'); doc.setFontSize(8); doc.setFont('helvetica','bold');
    doc.text('BEFORE — TODAY', M + 3, y + 6);
    setTxt('#374151'); doc.setFontSize(8); doc.setFont('helvetica','normal');
    const bl = doc.splitTextToSize(com.beforeScenario || '', CW/2 - 10);
    bl.slice(0,4).forEach((l,li) => doc.text(l, M + 3, y + 11 + li*4));

    setFill('#F0FDF4'); doc.roundedRect(M + CW/2 + 2, y, CW/2 - 2, bah, 2, 2, 'F');
    setTxt('#065F46'); doc.setFontSize(8); doc.setFont('helvetica','bold');
    doc.text('AFTER — 12 MONTHS IN', M + CW/2 + 5, y + 6);
    setTxt('#374151'); doc.setFontSize(8); doc.setFont('helvetica','normal');
    const al = doc.splitTextToSize(com.afterScenario || '', CW/2 - 10);
    al.slice(0,4).forEach((l,li) => doc.text(l, M + CW/2 + 5, y + 11 + li*4));
    y += bah + 6;"""

c2_new = """    // Before/After — dynamic height based on content
    const bl = doc.splitTextToSize(com.beforeScenario || '', CW/2 - 10);
    const al = doc.splitTextToSize(com.afterScenario || '', CW/2 - 10);
    const maxLines = Math.max(bl.length, al.length);
    const bah = Math.max(32, 14 + maxLines * 4.5);
    checkY(bah + 4);
    setFill('#FEF2F2'); doc.roundedRect(M, y, CW/2 - 2, bah, 2, 2, 'F');
    setTxt('#DC2626'); doc.setFontSize(8); doc.setFont('helvetica','bold');
    doc.text('BEFORE — TODAY', M + 3, y + 6);
    setTxt('#374151'); doc.setFontSize(8); doc.setFont('helvetica','normal');
    bl.forEach((l,li) => { checkY(5); doc.text(l, M + 3, y + 11 + li*4.5); });

    setFill('#F0FDF4'); doc.roundedRect(M + CW/2 + 2, y, CW/2 - 2, bah, 2, 2, 'F');
    setTxt('#065F46'); doc.setFontSize(8); doc.setFont('helvetica','bold');
    doc.text('AFTER — 12 MONTHS IN', M + CW/2 + 5, y + 6);
    setTxt('#374151'); doc.setFontSize(8); doc.setFont('helvetica','normal');
    al.forEach((l,li) => { checkY(5); doc.text(l, M + CW/2 + 5, y + 11 + li*4.5); });
    y += bah + 6;"""

if c2_old in src:
    src = src.replace(c2_old, c2_new, 1)
    print('Fix 2 OK - Before/After dynamic height fixed')
else:
    print('FAIL: Fix 2 - string not found')
    ok = False

# ─── FIX 3: Page 10 — costOfStatusQuo line cut off ───────────────────────────
c3_old = """      setFill('#FEF2F2'); doc.roundedRect(M, y, CW, 12, 2, 2, 'F');
      setTxt('#DC2626'); doc.setFontSize(9); doc.setFont('helvetica','bold');
      doc.text(`Annual Cost of Status Quo: ${execBrief.currentStateAnalysis.costOfStatusQuo || 'See analysis'}`, M+4, y+8);
      y += 16;"""

c3_new = """      const cosqText = `Annual Cost of Status Quo: ${execBrief.currentStateAnalysis.costOfStatusQuo || 'See analysis'}`;
      const cosqLines = doc.splitTextToSize(cosqText, CW - 8);
      const cosqH = Math.max(12, cosqLines.length * 5 + 6);
      checkY(cosqH + 2);
      setFill('#FEF2F2'); doc.roundedRect(M, y, CW, cosqH, 2, 2, 'F');
      setTxt('#DC2626'); doc.setFontSize(9); doc.setFont('helvetica','bold');
      cosqLines.forEach((l, li) => doc.text(l, M+4, y + 6 + li*5));
      y += cosqH + 4;"""

if c3_old in src:
    src = src.replace(c3_old, c3_new, 1)
    print('Fix 3 OK - costOfStatusQuo text no longer cut off')
else:
    print('FAIL: Fix 3 - string not found')
    ok = False

# ─── FIX 4: Page 10 — recommendation steps overflow ─────────────────────────
c4_old = """    execBrief.recommendation?.immediateNextSteps?.forEach((s, i) => {
      const sLines = doc.splitTextToSize(s, CW - 8);
      checkY(sLines.length * 5 + 4);
      setTxt('#1A56DB'); doc.setFontSize(9); doc.setFont('helvetica','bold');
      doc.text(`${i+1}.`, M, y);
      setTxt('#374151'); doc.setFont('helvetica','normal');
      sLines.forEach((l, li) => { doc.text(l, M+8, y + li*5); });
      y += sLines.length * 5 + 2;
    });"""

c4_new = """    execBrief.recommendation?.immediateNextSteps?.forEach((s, i) => {
      const sLines = doc.splitTextToSize(String(s || ''), CW - 12);
      const stepH = sLines.length * 5 + 6;
      checkY(stepH);
      setFill('#EFF6FF'); doc.roundedRect(M, y, CW, stepH, 1.5, 1.5, 'F');
      setTxt('#1A56DB'); doc.setFontSize(9); doc.setFont('helvetica','bold');
      doc.text(`${i+1}.`, M + 3, y + 5);
      setTxt('#374151'); doc.setFont('helvetica','normal');
      sLines.forEach((l, li) => { doc.text(l, M + 10, y + 5 + li * 5); });
      y += stepH + 3;
    });"""

if c4_old in src:
    src = src.replace(c4_old, c4_new, 1)
    print('Fix 4 OK - recommendation steps overflow fixed')
else:
    print('FAIL: Fix 4 - string not found')
    ok = False

# Write file
with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(src)
print('\nAll fixes written. Now run: npm run build 2>&1 | head -20')
