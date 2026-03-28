#!/usr/bin/env python3
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    src = f.read()

with open('src/App.jsx.backup_pdf3', 'w', encoding='utf-8') as f:
    f.write(src)
print('Backup saved')

# ─── CHANGE 1: Update exportToPDF signature to accept on-demand content ───────
c1_old = """const exportToPDF = async (result, form, meetingPrep, execBrief, meetingInputs) => {"""
c1_new = """const exportToPDF = async (result, form, meetingPrep, execBrief, meetingInputs, extras = {}) => {
  const { closePlan, championPlaybook, negotiationPlaybook, povDoc, mutualSuccessPlan, transcriptResult } = extras;"""

if c1_old in src:
    src = src.replace(c1_old, c1_new, 1)
    print('Change 1 OK - exportToPDF signature updated')
else:
    print('FAIL: Change 1 - exportToPDF signature not found')

# ─── CHANGE 2: Add on-demand content pages before the footer ──────────────────
c2_old = """  // ── FOOTER ON ALL PAGES ──────────────────────────────────────────────
  const total = doc.getNumberOfPages();"""

c2_new = """  // ── MODULE 10: CLOSE PLAN ───────────────────────────────────────────────
  if (closePlan && closePlan.phases) {
    addPage();
    setTxt('#08111E'); doc.setFontSize(16); doc.setFont('helvetica','bold');
    doc.text('10 — Close Plan', M, y); y += 6;
    setTxt('#6B7280'); doc.setFontSize(9);
    doc.text(`Target Close: ${closePlan.targetCloseDate || ''}  ·  ${closePlan.weeksToClose || ''} weeks`, M, y); y += 10;
    setTxt('#08111E'); doc.setFontSize(12); doc.setFont('helvetica','bold');
    const stratLines = doc.splitTextToSize(closePlan.overallStrategy || '', CW);
    stratLines.forEach(l => { checkY(7); doc.text(l, M, y); y += 6; }); y += 4;
    closePlan.phases?.forEach((phase, pi) => {
      checkY(20);
      setFill('#1A2540'); doc.roundedRect(M, y, CW, 8, 1, 1, 'F');
      setTxt('#F59E0B'); doc.setFontSize(8); doc.setFont('helvetica','bold');
      doc.text(phase.week + ' — ' + phase.theme, M + 3, y + 5.5); y += 11;
      setTxt('#374151'); doc.setFontSize(9); doc.setFont('helvetica','bold');
      doc.text('Milestone: ' + (phase.milestone || ''), M, y); y += 5;
      phase.actions?.forEach(a => {
        checkY(6);
        setTxt('#1A56DB'); doc.setFontSize(8);
        doc.text('[' + (a.owner || '') + ']', M, y);
        setTxt('#374151'); doc.setFont('helvetica','normal');
        const aLines = doc.splitTextToSize(a.action || '', CW - 20);
        aLines.forEach((l, li) => { if(li>0) checkY(5); doc.text(l, M + 18, y + li * 4.5); });
        y += aLines.length * 4.5 + 1;
      });
      if (phase.riskIfMissed) {
        setFill('#FEF2F2'); doc.roundedRect(M, y, CW, 7, 1, 1, 'F');
        setTxt('#DC2626'); doc.setFontSize(8); doc.setFont('helvetica','italic');
        const rLines = doc.splitTextToSize('Risk: ' + phase.riskIfMissed, CW - 4);
        doc.text(rLines[0], M + 2, y + 5); y += 9;
      }
      y += 3;
    });
    if (closePlan.criticalPathItems?.length) {
      sectionHeader('Critical Path', '#EF4444');
      closePlan.criticalPathItems.forEach(c => bulletItem(c, '#991B1B'));
    }
    if (closePlan.earlyWarningSignals?.length) {
      sectionHeader('Early Warning Signals', '#F59E0B');
      closePlan.earlyWarningSignals.forEach(s => bulletItem(s, '#92400E'));
    }
  }

  // ── MODULE 11: CHAMPION PLAYBOOK ─────────────────────────────────────────
  if (championPlaybook && championPlaybook.weeks) {
    addPage();
    setTxt('#08111E'); doc.setFontSize(16); doc.setFont('helvetica','bold');
    doc.text('11 — Champion Development Playbook', M, y); y += 10;
    sectionHeader('Champion Profile');
    bodyText(championPlaybook.championProfile?.currentStatus, 0, '#374151'); y += 4;
    championPlaybook.weeks?.forEach(week => {
      checkY(20);
      setFill('#1A2540'); doc.roundedRect(M, y, CW, 8, 1, 1, 'F');
      setTxt('#F59E0B'); doc.setFontSize(8); doc.setFont('helvetica','bold');
      doc.text('Week ' + week.week + ' — ' + week.theme, M + 3, y + 5.5); y += 11;
      setTxt('#374151'); doc.setFontSize(9);
      doc.text(week.objective || '', M, y); y += 6;
      week.actions?.forEach(a => {
        checkY(8);
        setTxt('#F59E0B'); doc.setFontSize(8); doc.setFont('helvetica','bold');
        doc.text(a.day || '', M, y);
        setTxt('#374151'); doc.setFont('helvetica','normal');
        const aLines = doc.splitTextToSize(a.action || '', CW - 14);
        aLines.forEach((l, li) => doc.text(l, M + 12, y + li * 4.5));
        y += aLines.length * 4.5 + 2;
      });
      y += 3;
    });
  }

  // ── MODULE 12: NEGOTIATION PLAYBOOK ──────────────────────────────────────
  if (negotiationPlaybook) {
    addPage();
    setTxt('#08111E'); doc.setFontSize(16); doc.setFont('helvetica','bold');
    doc.text('12 — Negotiation Playbook', M, y); y += 10;
    sectionHeader('Power Balance');
    bodyText(negotiationPlaybook.negotiationContext?.powerBalance, 0, '#374151'); y += 4;
    sectionHeader('Anchoring Strategy', '#1A56DB');
    bodyText(negotiationPlaybook.anchoringStrategy?.openingPosition, 0, '#111827'); y += 2;
    if (negotiationPlaybook.anchoringStrategy?.deliveryLine) {
      infoBox('"' + negotiationPlaybook.anchoringStrategy.deliveryLine + '"', '#EFF6FF', '#1E40AF');
    }
    sectionHeader('Concession Framework');
    negotiationPlaybook.concessionFramework?.forEach((cf, i) => {
      checkY(16);
      setFill('#F8FAFF'); doc.roundedRect(M, y, CW, 14, 1.5, 1.5, 'F');
      setTxt('#374151'); doc.setFontSize(8); doc.setFont('helvetica','bold');
      doc.text(cf.sequence + ' — Give: ' + (cf.concession || ''), M + 3, y + 5);
      setTxt('#10B981'); doc.setFont('helvetica','normal');
      doc.text('Demand: ' + (cf.whatToAskFor || ''), M + 3, y + 10);
      y += 17;
    });
    sectionHeader('Walk Away Point', '#EF4444');
    bodyText(negotiationPlaybook.absoluteLines?.walkAwayPoint, 0, '#991B1B');
  }

  // ── MODULE 13: POV DOCUMENT ───────────────────────────────────────────────
  if (povDoc && povDoc.title) {
    addPage();
    setTxt('#08111E'); doc.setFontSize(16); doc.setFont('helvetica','bold');
    doc.text('13 — Point of View Document', M, y); y += 6;
    setTxt('#1A56DB'); doc.setFontSize(13); doc.setFont('helvetica','bold');
    const povTitleLines = doc.splitTextToSize(povDoc.title || '', CW);
    povTitleLines.forEach(l => { checkY(7); doc.text(l, M, y); y += 7; }); y += 3;
    if (povDoc.executiveTheme) { infoBox(povDoc.executiveTheme, '#EFF6FF', '#1E40AF'); }
    sectionHeader('Industry Perspective');
    bodyText(povDoc.industryPerspective?.headline, 0, '#111827'); y += 2;
    povDoc.industryPerspective?.trends?.forEach(t => bulletItem(t)); y += 2;
    sectionHeader('Your Situation', '#EF4444');
    bodyText(povDoc.yourSituation?.headline, 0, '#111827'); y += 2;
    povDoc.yourSituation?.specificChallenges?.forEach(c => bulletItem(c, '#374151')); y += 2;
    sectionHeader('Recommended Path', '#10B981');
    bodyText(povDoc.recommendedPath?.headline, 0, '#111827'); y += 2;
    povDoc.recommendedPath?.principlesForSuccess?.forEach(p => bulletItem(p, '#374151')); y += 2;
    if (povDoc.closingPerspective) { infoBox(povDoc.closingPerspective, '#F0FDF4', '#065F46'); }
  }

  // ── MODULE 14: MUTUAL SUCCESS PLAN ───────────────────────────────────────
  if (mutualSuccessPlan && mutualSuccessPlan.phases) {
    addPage();
    setTxt('#08111E'); doc.setFontSize(16); doc.setFont('helvetica','bold');
    doc.text('14 — Mutual Success Plan', M, y); y += 6;
    setTxt('#065F46'); doc.setFontSize(13); doc.setFont('helvetica','bold');
    const mspTitleLines = doc.splitTextToSize(mutualSuccessPlan.title || '', CW);
    mspTitleLines.forEach(l => { checkY(7); doc.text(l, M, y); y += 7; }); y += 3;
    bodyText(mutualSuccessPlan.objective, 0, '#374151'); y += 6;
    mutualSuccessPlan.phases?.forEach(phase => {
      checkY(20);
      setFill('#1A2540'); doc.roundedRect(M, y, CW, 8, 1, 1, 'F');
      setTxt('#10B981'); doc.setFontSize(8); doc.setFont('helvetica','bold');
      doc.text('Phase ' + phase.phase + ' — ' + phase.name + '  ·  ' + (phase.duration || ''), M + 3, y + 5.5); y += 11;
      setTxt('#F59E0B'); doc.setFontSize(9); doc.setFont('helvetica','bold');
      doc.text(phase.jointMilestone || '', M, y); y += 6;
      const hw = (CW - 4) / 2;
      checkY(20);
      setTxt('#1A56DB'); doc.setFontSize(8); doc.setFont('helvetica','bold');
      doc.text('We Commit To:', M, y);
      doc.text('Buyer Commits To:', M + hw + 4, y); y += 5;
      const maxCommits = Math.max(phase.vendorCommitments?.length || 0, phase.buyerCommitments?.length || 0);
      for (let ci = 0; ci < maxCommits; ci++) {
        checkY(6);
        setTxt('#374151'); doc.setFontSize(8); doc.setFont('helvetica','normal');
        if (phase.vendorCommitments?.[ci]) {
          const vl = doc.splitTextToSize('→ ' + phase.vendorCommitments[ci], hw - 2);
          vl.slice(0,2).forEach((l, li) => doc.text(l, M, y + li * 4));
        }
        if (phase.buyerCommitments?.[ci]) {
          const bl = doc.splitTextToSize('→ ' + phase.buyerCommitments[ci], hw - 2);
          bl.slice(0,2).forEach((l, li) => doc.text(l, M + hw + 4, y + li * 4));
        }
        y += 9;
      }
      y += 3;
    });
    if (mutualSuccessPlan.nextStep) { infoBox('Next Step: ' + mutualSuccessPlan.nextStep, '#FFFBEB', '#92400E'); }
  }

  // ── MODULE 15: TRANSCRIPT ANALYSIS ───────────────────────────────────────
  if (transcriptResult && transcriptResult.summary) {
    addPage();
    setTxt('#08111E'); doc.setFontSize(16); doc.setFont('helvetica','bold');
    doc.text('15 — Call Transcript Analysis', M, y); y += 10;
    sectionHeader('Call Summary');
    bodyText(transcriptResult.summary, 0, '#111827'); y += 4;
    if (transcriptResult.positiveSignals?.length) {
      sectionHeader('Buying Signals', '#10B981');
      transcriptResult.positiveSignals.forEach(s => bulletItem(s, '#065F46'));
    }
    if (transcriptResult.redFlags?.length) {
      sectionHeader('Red Flags', '#EF4444');
      transcriptResult.redFlags.forEach(f => bulletItem(f, '#991B1B'));
    }
    if (transcriptResult.coachingNote) {
      sectionHeader('Coaching Note', '#F59E0B');
      infoBox(transcriptResult.coachingNote, '#FFFBEB', '#92400E');
    }
    if (transcriptResult.nextActions?.length) {
      sectionHeader('Next Actions');
      transcriptResult.nextActions.forEach((a, i) => {
        checkY(10);
        setTxt('#1A56DB'); doc.setFontSize(8); doc.setFont('helvetica','bold');
        doc.text('[' + (a.owner || '') + '] ' + (a.timeframe || ''), M, y);
        setTxt('#374151'); doc.setFont('helvetica','normal');
        const aLines = doc.splitTextToSize(a.action || '', CW - 4);
        aLines.forEach((l, li) => { checkY(5); doc.text(l, M, y + 4 + li * 4.5); });
        y += 4 + aLines.length * 4.5 + 2;
      });
    }
    if (transcriptResult.followUpEmail) {
      sectionHeader('Follow-Up Email', '#10B981');
      setTxt('#1E40AF'); doc.setFontSize(9); doc.setFont('helvetica','bold');
      doc.text('Subject: ' + (transcriptResult.followUpEmail.subject || ''), M, y); y += 6;
      bodyText(transcriptResult.followUpEmail.body, 0, '#374151');
    }
  }

  // ── FOOTER ON ALL PAGES ──────────────────────────────────────────────
  const total = doc.getNumberOfPages();"""

if c2_old in src:
    src = src.replace(c2_old, c2_new, 1)
    print('Change 2 OK - all on-demand content modules added to PDF')
else:
    print('FAIL: Change 2 - footer comment not found')

# ─── CHANGE 3: Update both exportToPDF call sites to pass extras ──────────────
c3_old = """                    <button className="btn-ghost" onClick={() => exportToPDF(result, form, meetingPrep, execBrief, meetingInputs)} style={{ display: "flex", alignItems: "center", gap: 6, borderColor: "var(--amber)", color: "var(--amber)" }}>
                      ⬇ Export PDF
                    </button>"""

c3_new = """                    <button className="btn-ghost" onClick={() => exportToPDF(result, form, meetingPrep, execBrief, meetingInputs, { closePlan, championPlaybook, negotiationPlaybook, povDoc, mutualSuccessPlan, transcriptResult })} style={{ display: "flex", alignItems: "center", gap: 6, borderColor: "var(--amber)", color: "var(--amber)" }}>
                      ⬇ Export PDF
                    </button>"""

if c3_old in src:
    src = src.replace(c3_old, c3_new, 1)
    print('Change 3 OK - header export button updated')
else:
    print('FAIL: Change 3 - header export button not found')

c4_old = """                  onClick={() => exportToPDF(result, form, meetingPrep, execBrief, meetingInputs)}"""
c4_new = """                  onClick={() => exportToPDF(result, form, meetingPrep, execBrief, meetingInputs, { closePlan, championPlaybook, negotiationPlaybook, povDoc, mutualSuccessPlan, transcriptResult })}"""

if c4_old in src:
    src = src.replace(c4_old, c4_new, 1)
    print('Change 4 OK - banner export button updated')
else:
    print('FAIL: Change 4 - banner export button not found')

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(src)
print('Done. Run: npm run build 2>&1 | head -20')
