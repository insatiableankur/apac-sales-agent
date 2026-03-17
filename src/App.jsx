import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const MARKETS = [
  // Asia Pacific
  "Singapore","Malaysia","Philippines","India","Indonesia","Thailand","Hong Kong","Vietnam","Australia","South Korea","Japan","Taiwan","New Zealand","Bangladesh","Sri Lanka","Myanmar","Cambodia","Pakistan",
  // Middle East & Africa
  "UAE","Saudi Arabia","Qatar","Kuwait","Bahrain","Oman","Egypt","South Africa","Nigeria","Kenya","Morocco",
  // Europe
  "United Kingdom","Germany","France","Netherlands","Sweden","Norway","Denmark","Finland","Spain","Italy","Switzerland","Belgium","Ireland","Poland","Portugal","Austria",
  // Americas
  "United States","Canada","Brazil","Mexico","Colombia","Argentina","Chile","Peru",
  // Global
  "Global / Multi-Country"
];
const INDUSTRIES = ["Financial Services / Banking","Insurance / Insurtech","Fintech / Payments","HCM / HR Technology","ERP / Finance Systems","Retail / CPG / Ecommerce","Logistics / Supply Chain","Healthcare / Pharma","Telco / Media / Tech","Real Estate / PropTech","Energy / Resources","Manufacturing","Professional Services","Government / Public Sector"];
const DEAL_STAGES = ["Prospecting — No Contact Yet","Discovery — First Meetings Done","Evaluation — Active POC / Demo","Proposal — Business Case Submitted","Negotiation — Commercial Terms","Closed Won","Closed Lost — Needs Autopsy"];
const DEAL_SIZES = ["< $50K ACV","$50K – $100K ACV","$100K – $250K ACV","$250K – $500K ACV","$500K – $1M ACV","$1M+ ACV"];
const PRODUCTS = ["Financial Reporting & ESG Platform","HCM / Workforce Management","CRM / Revenue Intelligence","Customer Engagement / Messaging","Data & Analytics Platform","ERP / Finance Automation","Cybersecurity / GRC","Supply Chain Management","Marketing Automation","Learning & Development","Other SaaS Platform"];

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
const buildSystemPrompt = () => `You are the Global Enterprise SaaS Sales Intelligence Engine trained on Ankur Sehgal's methodologies: 15 years enterprise SaaS across APAC, MEA, Europe & Americas, 7x President's Club, $25M ARR. Return ONLY valid JSON — no markdown, no preamble:

{"accountBrief":{"icpScore":87,"icpRating":"Strong Fit","tier":"Tier 1 — Strategic","dealPotential":"$200K–$400K ACV","companyProfile":"2-3 sentence snapshot.","whyNow":"Why engage now.","keyTriggers":["Trigger 1","Trigger 2","Trigger 3"],"painPoints":[{"pain":"Pain 1","businessImpact":"Impact","urgency":"high"},{"pain":"Pain 2","businessImpact":"Impact","urgency":"medium"},{"pain":"Pain 3","businessImpact":"Impact","urgency":"low"}],"buyingCulture":"How they buy.","marketContext":"Relevant local market, regulatory and competitive context for this country/region."},"meddpicc":{"overallHealth":"amber","forecastCategory":"Pipeline","elements":{"metrics":{"status":"red","label":"Metrics","description":"...","evidence":"...","nextAction":"...","questions":["Q1","Q2"]},"economicBuyer":{"status":"amber","label":"Economic Buyer","description":"...","evidence":"...","nextAction":"...","questions":["Q1","Q2"]},"decisionCriteria":{"status":"green","label":"Decision Criteria","description":"...","evidence":"...","nextAction":"...","questions":["Q1","Q2"]},"decisionProcess":{"status":"red","label":"Decision Process","description":"...","evidence":"...","nextAction":"...","questions":["Q1","Q2"]},"paperProcess":{"status":"red","label":"Paper Process","description":"...","evidence":"...","nextAction":"...","questions":["Q1","Q2"]},"identifiedPain":{"status":"green","label":"Identified Pain","description":"...","evidence":"...","nextAction":"...","questions":["Q1","Q2"]},"champion":{"status":"amber","label":"Champion","description":"...","evidence":"...","nextAction":"...","questions":["Q1","Q2"]},"competition":{"status":"amber","label":"Competition","description":"...","evidence":"...","nextAction":"...","questions":["Q1","Q2"]}},"dealRisks":["Risk 1","Risk 2","Risk 3"],"winConditions":["Condition 1","Condition 2","Condition 3"]},"stakeholders":{"buyingCommittee":[{"role":"Group CFO","archetype":"Economic Buyer","priority":1,"accessStatus":"not-engaged","motivations":"...","fears":"...","engagementStrategy":"...","talkTrack":"...","warningSign":"..."},{"role":"Head of Finance Transformation","archetype":"Champion","priority":2,"accessStatus":"engaged","motivations":"...","fears":"...","engagementStrategy":"...","talkTrack":"...","warningSign":"..."},{"role":"IT Director","archetype":"Technical Evaluator","priority":3,"accessStatus":"not-engaged","motivations":"...","fears":"...","engagementStrategy":"...","talkTrack":"...","warningSign":"..."},{"role":"Head of Procurement","archetype":"Gatekeeper","priority":4,"accessStatus":"unknown","motivations":"...","fears":"...","engagementStrategy":"...","talkTrack":"...","warningSign":"..."}],"championDevelopmentScore":45,"championGaps":["Gap 1","Gap 2","Gap 3"],"multithreadingStatus":"Status."},"outreach":{"coldEmail":{"subject":"Subject","preheader":"Preview","body":"Full email 150-200 words. Hook, Peer Frame, Insight, Soft Ask, Social Proof.","followUp1":{"dayToSend":5,"subject":"FU subject","body":"3-sentence follow-up."},"followUp2":{"dayToSend":12,"subject":"Final subject","body":"Break-up style."}},"linkedInMessage":"Under 300 chars.","executiveReferral":"Champion to EB intro template.","sendingTips":["Tip 1","Tip 2","Tip 3"]},"discoveryQuestions":{"openingFramer":"Agenda setter.","categories":[{"category":"Current State & Pain","questions":[{"question":"...","intent":"...","followUp":"..."},{"question":"...","intent":"...","followUp":"..."},{"question":"...","intent":"...","followUp":"..."}]},{"category":"Business Impact","questions":[{"question":"...","intent":"...","followUp":"..."},{"question":"...","intent":"...","followUp":"..."},{"question":"...","intent":"...","followUp":"..."}]},{"category":"Decision Process","questions":[{"question":"...","intent":"...","followUp":"..."},{"question":"...","intent":"...","followUp":"..."},{"question":"...","intent":"...","followUp":"..."}]},{"category":"Urgency","questions":[{"question":"...","intent":"...","followUp":"..."},{"question":"...","intent":"...","followUp":"..."}]},{"category":"Champion Development","questions":[{"question":"...","intent":"...","followUp":"..."},{"question":"...","intent":"...","followUp":"..."}]}],"redFlags":["Flag 1","Flag 2","Flag 3"],"idealCallOutcome":"Perfect discovery outcome."},"commandOfMessage":{"salesStage":"Evaluation","stageRationale":"Why at this stage.","beforeScenario":"Life without solution.","afterScenario":"Success after 12 months.","requiredCapabilities":[{"capability":"...","proofPoint":"..."},{"capability":"...","proofPoint":"..."},{"capability":"...","proofPoint":"..."}],"uniqueDifferentiators":["D1","D2","D3"],"valueDrivers":[{"driver":"Cost Reduction","specifics":"...","estimatedImpact":"$X"},{"driver":"Risk Mitigation","specifics":"...","estimatedImpact":"..."},{"driver":"Revenue Growth","specifics":"...","estimatedImpact":"$X"}],"objectionHandlers":[{"objection":"...","response":"..."},{"objection":"...","response":"..."},{"objection":"...","response":"..."}],"closingHypothesis":"Single compelling reason to buy."},"nextBestActions":[{"priority":1,"action":"Action 1","why":"Why","timeframe":"This week"},{"priority":2,"action":"Action 2","why":"Why","timeframe":"Next 2 weeks"},{"priority":3,"action":"Action 3","why":"Why","timeframe":"This month"}]}

Be deeply specific to the company, market, country, industry, product and deal stage. Reference relevant local regulations, market dynamics, buying culture and competitive landscape for the specific country/region provided.`;


// ─── PDF EXPORT ───────────────────────────────────────────────────────────────
const exportToPDF = async (result, form, meetingPrep, execBrief, meetingInputs) => {
  // Dynamically load jsPDF
  if (!window.jspdf) {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, M = 14, CW = W - M * 2;
  let y = 0;

  const addPage = () => { doc.addPage(); y = 16; };
  const checkY = (needed = 12) => { if (y + needed > 278) addPage(); };

  // Colour helpers
  const hex2rgb = h => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
  const setFill = h => doc.setFillColor(...hex2rgb(h));
  const setTxt = h => doc.setTextColor(...hex2rgb(h));

  // ── COVER PAGE ──────────────────────────────────────────────────────
  setFill('#08111E'); doc.rect(0, 0, W, 297, 'F');
  // Amber bar
  setFill('#F59E0B'); doc.rect(0, 0, W, 3, 'F');
  // Logo area
  setFill('#1A56DB'); doc.roundedRect(M, 20, 12, 12, 2, 2, 'F');
  setTxt('#FFFFFF'); doc.setFontSize(14); doc.setFont('helvetica','bold');
  doc.text('A', M + 3, 30);  // logo placeholder
  setTxt('#FFFFFF'); doc.setFontSize(18); doc.setFont('helvetica','bold');
  doc.text('Sales Intelligence', M + 16, 28);
  setTxt('#F59E0B'); doc.setFontSize(8); doc.setFont('helvetica','normal');
  doc.text("ANKUR SEHGAL · 7X PRESIDENTS CLUB", M + 16, 34);

  // Company name
  y = 70;
  setTxt('#94A3B8'); doc.setFontSize(10); doc.setFont('helvetica','normal');
  doc.text('INTELLIGENCE BRIEF', M, y); y += 10;
  setTxt('#FFFFFF'); doc.setFontSize(32); doc.setFont('helvetica','bold');
  doc.text(form.company, M, y); y += 12;

  // Meta chips
  const chips = [form.market, form.industry, result.accountBrief?.tier || ''].filter(Boolean);
  let cx = M;
  chips.forEach(chip => {
    setFill('#1E3A5F');
    const tw = doc.getTextWidth(chip) + 6;
    doc.roundedRect(cx, y - 4, tw, 7, 1.5, 1.5, 'F');
    setTxt('#94A3B8'); doc.setFontSize(8);
    doc.text(chip, cx + 3, y + 1);
    cx += tw + 4;
  });
  y += 14;

  // Score cards
  const stats = [
    ['ICP SCORE', `${result.accountBrief?.icpScore}/100`],
    ['DEAL POTENTIAL', result.accountBrief?.dealPotential || '—'],
    ['DEAL HEALTH', result.meddpicc?.overallHealth?.toUpperCase() || '—'],
    ['SALES STAGE', result.commandOfMessage?.salesStage || '—'],
  ];
  const sw = (CW - 9) / 4;
  stats.forEach(([k,v], i) => {
    setFill('#0D1B2E');
    doc.roundedRect(M + i*(sw+3), y, sw, 18, 2, 2, 'F');
    setTxt('#F59E0B'); doc.setFontSize(11); doc.setFont('helvetica','bold');
    doc.text(v, M + i*(sw+3) + sw/2, y + 8, { align:'center' });
    setTxt('#475569'); doc.setFontSize(7); doc.setFont('helvetica','normal');
    doc.text(k, M + i*(sw+3) + sw/2, y + 14, { align:'center' });
  });
  y += 26;

  // Divider
  setFill('#F59E0B'); doc.rect(M, y, CW, 0.5, 'F'); y += 8;
  setTxt('#475569'); doc.setFontSize(8);
  doc.text(`Generated ${new Date().toLocaleDateString('en-SG', {day:'numeric',month:'long',year:'numeric'})}  ·  Powered by Claude AI  ·  Confidential`, M, y);
  y += 16;

  // ── SECTION HELPER ──────────────────────────────────────────────────
  const sectionHeader = (title, color = '#1A56DB') => {
    checkY(14);
    setFill(color); doc.rect(M, y, CW, 0.5, 'F'); y += 4;
    setTxt(color); doc.setFontSize(9); doc.setFont('helvetica','bold');
    doc.text(title.toUpperCase(), M, y); y += 6;
  };

  const fieldLabel = (label) => {
    setTxt('#6B7280'); doc.setFontSize(7); doc.setFont('helvetica','normal');
    doc.text(label, M, y); y += 4;
  };

  const bodyText = (text, indent = 0, color = '#374151') => {
    if (!text) return;
    setTxt(color); doc.setFontSize(9); doc.setFont('helvetica','normal');
    const lines = doc.splitTextToSize(String(text), CW - indent);
    lines.forEach(line => {
      checkY(5);
      doc.text(line, M + indent, y); y += 4.5;
    });
  };

  const bulletItem = (text, color = '#374151') => {
    checkY(5);
    setTxt('#F59E0B'); doc.setFontSize(10); doc.text('->', M, y);
    setTxt(color); doc.setFontSize(9); doc.setFont('helvetica','normal');
    const lines = doc.splitTextToSize(String(text), CW - 6);
    lines.forEach((line, i) => {
      checkY(5);
      doc.text(line, M + 6, y); y += 4.5;
    });
  };

  const infoBox = (text, bgHex = '#EFF6FF', textHex = '#1E40AF') => {
    if (!text) return;
    const lines = doc.splitTextToSize(String(text), CW - 8);
    const bh = lines.length * 4.5 + 6;
    checkY(bh + 2);
    setFill(bgHex); doc.roundedRect(M, y, CW, bh, 2, 2, 'F');
    setTxt(textHex); doc.setFontSize(9); doc.setFont('helvetica','normal');
    lines.forEach((line, i) => { doc.text(line, M + 4, y + 5 + i * 4.5); });
    y += bh + 4;
  };

  // ── MODULE 1: ACCOUNT BRIEF ──────────────────────────────────────────
  addPage();
  setTxt('#08111E'); doc.setFontSize(16); doc.setFont('helvetica','bold');
  doc.text('01 — Account Brief', M, y); y += 10;

  const ab = result.accountBrief;
  if (ab) {
    sectionHeader('Company Profile');
    bodyText(ab.companyProfile); y += 3;

    sectionHeader('Why Now', '#F59E0B');
    infoBox(ab.whyNow, '#FFFBEB', '#92400E');

    sectionHeader('Trigger Events');
    ab.keyTriggers?.forEach(t => bulletItem(t)); y += 2;

    sectionHeader('Pain Points');
    ab.painPoints?.forEach(p => {
      checkY(12);
      const uc = p.urgency === 'high' ? '#EF4444' : p.urgency === 'medium' ? '#F59E0B' : '#6B7280';
      setTxt(uc); doc.setFontSize(8); doc.setFont('helvetica','bold');
      doc.text(`[${p.urgency?.toUpperCase()}]`, M, y);
      setTxt('#111827'); doc.setFontSize(9); doc.setFont('helvetica','bold');
      doc.text(p.pain, M + 14, y); y += 5;
      bodyText(p.businessImpact, 6, '#6B7280'); y += 1;
    });

    sectionHeader('Market Context');
    fieldLabel('BUYING CULTURE');
    bodyText(ab.buyingCulture, 0, '#374151'); y += 2;
    fieldLabel('APAC MARKET CONTEXT');
    bodyText(ab.apacMarketContext, 0, '#374151');
  }

  // ── MODULE 2: MEDDPICC ───────────────────────────────────────────────
  addPage();
  setTxt('#08111E'); doc.setFontSize(16); doc.setFont('helvetica','bold');
  doc.text('02 — MEDDPICC Diagnostic', M, y); y += 10;

  const me = result.meddpicc;
  if (me) {
    // Health badge
    const hc = me.overallHealth === 'green' ? '#10B981' : me.overallHealth === 'amber' ? '#F59E0B' : '#EF4444';
    setFill(hc); doc.roundedRect(M, y, 40, 10, 2, 2, 'F');
    setTxt('#FFFFFF'); doc.setFontSize(10); doc.setFont('helvetica','bold');
    doc.text(me.overallHealth?.toUpperCase() + ' — ' + (me.forecastCategory || ''), M + 4, y + 7);
    y += 16;

    // MEDDPICC grid — 2 per row
    const els = Object.entries(me.elements || {});
    sectionHeader('Element Scores');
    els.forEach(([key, el], i) => {
      if (i % 2 === 0) { checkY(22); }
      const col = i % 2;
      const ex = M + col * (CW/2 + 2);
      const ew = CW/2 - 2;
      const sc = el.status === 'green' ? '#10B981' : el.status === 'amber' ? '#F59E0B' : '#EF4444';
      setFill('#F8FAFF'); doc.roundedRect(ex, y, ew, 20, 1.5, 1.5, 'F');
      setFill(sc); doc.circle(ex + ew - 5, y + 5, 2.5, 'F');
      setTxt('#08111E'); doc.setFontSize(9); doc.setFont('helvetica','bold');
      doc.text(el.label || key, ex + 3, y + 6);
      setTxt('#6B7280'); doc.setFontSize(8); doc.setFont('helvetica','normal');
      const ev = doc.splitTextToSize(el.evidence || '', ew - 6);
      ev.slice(0,2).forEach((l, li) => doc.text(l, ex + 3, y + 11 + li * 4));
      if (col === 1) y += 23;
    });
    if (els.length % 2 !== 0) y += 23;
    y += 3;

    sectionHeader('Deal Risks', '#EF4444');
    me.dealRisks?.forEach(r => bulletItem(r, '#991B1B')); y += 2;
    sectionHeader('Win Conditions', '#10B981');
    me.winConditions?.forEach(w => bulletItem(w, '#065F46'));
  }

  // ── MODULE 3: STAKEHOLDERS ───────────────────────────────────────────
  addPage();
  setTxt('#08111E'); doc.setFontSize(16); doc.setFont('helvetica','bold');
  doc.text('03 — Stakeholder Map', M, y); y += 10;

  const st = result.stakeholders;
  if (st) {
    // Champion score
    const cs = st.championDevelopmentScore || 0;
    const cc = cs > 70 ? '#10B981' : cs > 40 ? '#F59E0B' : '#EF4444';
    infoBox(`Champion Development Score: ${cs}/100  ·  ${st.multithreadingStatus || ''}`, '#EFF6FF', '#1E40AF');

    st.buyingCommittee?.forEach((s, i) => {
      checkY(40);
      setFill(i % 2 === 0 ? '#F8FAFF' : '#FFFFFF');
      doc.roundedRect(M, y, CW, 36, 2, 2, 'F');
      setFill('#1A56DB'); doc.roundedRect(M, y, 3, 36, 1, 1, 'F');

      setTxt('#08111E'); doc.setFontSize(11); doc.setFont('helvetica','bold');
      doc.text(s.role, M + 6, y + 7);

      const ac = s.accessStatus === 'engaged' ? '#10B981' : s.accessStatus === 'not-engaged' ? '#EF4444' : '#F59E0B';
      setFill(ac);
      const al = s.accessStatus?.toUpperCase().replace('-', ' ') || '';
      const aw = doc.getTextWidth(al) + 6;
      doc.roundedRect(W - M - aw - 2, y + 2, aw, 6, 1, 1, 'F');
      setTxt('#FFFFFF'); doc.setFontSize(7); doc.text(al, W - M - aw + 1, y + 6.5);

      setTxt('#6B7280'); doc.setFontSize(8); doc.setFont('helvetica','bold');
      doc.text('MOTIVATIONS:', M + 6, y + 14);
      setTxt('#374151'); doc.setFont('helvetica','normal');
      const ml = doc.splitTextToSize(s.motivations || '', CW/2 - 10);
      ml.slice(0,2).forEach((l, li) => doc.text(l, M + 6, y + 18 + li * 4));

      setTxt('#6B7280'); doc.setFontSize(8); doc.setFont('helvetica','bold');
      doc.text('FEARS:', M + CW/2 + 2, y + 14);
      setTxt('#374151'); doc.setFont('helvetica','normal');
      const fl = doc.splitTextToSize(s.fears || '', CW/2 - 10);
      fl.slice(0,2).forEach((l, li) => doc.text(l, M + CW/2 + 2, y + 18 + li * 4));

      setTxt('#1A56DB'); doc.setFontSize(8); doc.setFont('helvetica','italic');
      const tl = doc.splitTextToSize(`"${s.talkTrack}"`, CW - 10);
      doc.text(tl[0] || '', M + 6, y + 31);

      y += 40;
    });
  }

  // ── MODULE 4: OUTREACH ───────────────────────────────────────────────
  addPage();
  setTxt('#08111E'); doc.setFontSize(16); doc.setFont('helvetica','bold');
  doc.text('04 — Outreach Sequences', M, y); y += 10;

  const ou = result.outreach;
  if (ou?.coldEmail) {
    sectionHeader('Cold Email — Day 1');
    fieldLabel('SUBJECT LINE');
    setFill('#EFF6FF'); doc.roundedRect(M, y, CW, 9, 1.5, 1.5, 'F');
    setTxt('#1E40AF'); doc.setFontSize(10); doc.setFont('helvetica','bold');
    doc.text(ou.coldEmail.subject || '', M + 4, y + 6); y += 13;
    fieldLabel('BODY');
    bodyText(ou.coldEmail.body, 0, '#374151'); y += 4;

    if (ou.coldEmail.followUp1) {
      sectionHeader(`Follow-Up — Day ${ou.coldEmail.followUp1.dayToSend}`);
      fieldLabel('SUBJECT'); bodyText(ou.coldEmail.followUp1.subject, 0, '#1E40AF');
      bodyText(ou.coldEmail.followUp1.body); y += 2;
    }
    if (ou.coldEmail.followUp2) {
      sectionHeader(`Break-Up — Day ${ou.coldEmail.followUp2.dayToSend}`);
      fieldLabel('SUBJECT'); bodyText(ou.coldEmail.followUp2.subject, 0, '#1E40AF');
      bodyText(ou.coldEmail.followUp2.body); y += 2;
    }

    sectionHeader('LinkedIn Message');
    infoBox(ou.linkedInMessage, '#F0F9FF', '#075985');

    sectionHeader('Sending Tips');
    ou.sendingTips?.forEach(t => bulletItem(t));
  }

  // ── MODULE 5: DISCOVERY ──────────────────────────────────────────────
  addPage();
  setTxt('#08111E'); doc.setFontSize(16); doc.setFont('helvetica','bold');
  doc.text('05 — Discovery Questions', M, y); y += 10;

  const dq = result.discoveryQuestions;
  if (dq) {
    sectionHeader('Opening Framer');
    infoBox(`"${dq.openingFramer}"`, '#FFFBEB', '#92400E');

    dq.categories?.forEach(cat => {
      sectionHeader(cat.category);
      cat.questions?.forEach(q => {
        checkY(16);
        setFill('#F8FAFF'); doc.roundedRect(M, y, CW, 14, 1.5, 1.5, 'F');
        setTxt('#1F2937'); doc.setFontSize(9); doc.setFont('helvetica','bolditalic');
        const ql = doc.splitTextToSize(`"${q.question}"`, CW - 8);
        ql.slice(0,2).forEach((l,li) => doc.text(l, M + 4, y + 5 + li*4));
        setTxt('#6B7280'); doc.setFontSize(8); doc.setFont('helvetica','normal');
        doc.text(`Intent: ${(q.intent || '').slice(0, 80)}`, M + 4, y + 11);
        y += 17;
      });
      y += 2;
    });
  }

  // ── MODULE 6: COMMAND OF MESSAGE ─────────────────────────────────────
  addPage();
  setTxt('#08111E'); doc.setFontSize(16); doc.setFont('helvetica','bold');
  doc.text('06 — Command of the Message', M, y); y += 10;

  const com = result.commandOfMessage;
  if (com) {
    // Before/After
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
    y += bah + 6;

    sectionHeader('Value Drivers');
    com.valueDrivers?.forEach(v => {
      checkY(14);
      setFill('#FFFBEB'); doc.roundedRect(M, y, CW, 12, 1.5, 1.5, 'F');
      setTxt('#92400E'); doc.setFontSize(9); doc.setFont('helvetica','bold');
      doc.text(v.driver, M + 4, y + 5);
      setTxt('#10B981'); doc.setFontSize(9); doc.setFont('helvetica','bold');
      doc.text(v.estimatedImpact || '', W - M - 4, y + 5, { align: 'right' });
      setTxt('#374151'); doc.setFontSize(8); doc.setFont('helvetica','normal');
      const vl = doc.splitTextToSize(v.specifics || '', CW - 8);
      doc.text(vl[0] || '', M + 4, y + 9.5);
      y += 15;
    });

    sectionHeader('Objection Handlers');
    com.objectionHandlers?.forEach(o => {
      checkY(18);
      setFill('#FEF2F2'); doc.roundedRect(M, y, CW, 16, 1.5, 1.5, 'F');
      setTxt('#991B1B'); doc.setFontSize(9); doc.setFont('helvetica','bold');
      const ql = doc.splitTextToSize(`"${o.objection}"`, CW - 8);
      doc.text(ql[0] || '', M + 4, y + 5);
      setTxt('#374151'); doc.setFontSize(8); doc.setFont('helvetica','normal');
      const rl = doc.splitTextToSize(o.response || '', CW - 8);
      rl.slice(0,2).forEach((l,li) => doc.text(l, M + 4, y + 10 + li*4));
      y += 19;
    });

    sectionHeader('Closing Hypothesis', '#10B981');
    infoBox(com.closingHypothesis, '#F0FDF4', '#065F46');
  }

  // ── MODULE 7: NEXT BEST ACTIONS ──────────────────────────────────────
  checkY(60);
  setTxt('#08111E'); doc.setFontSize(16); doc.setFont('helvetica','bold');
  doc.text('07 — Next Best Actions', M, y); y += 10;

  (Array.isArray(result.nextBestActions) ? result.nextBestActions : Object.values(result.nextBestActions||{})).forEach((a, i) => {
    checkY(22);
    const nc = i === 0 ? '#F59E0B' : i === 1 ? '#1A56DB' : '#475569';
    setFill(nc); doc.circle(M + 5, y + 5, 5, 'F');
    setTxt('#FFFFFF'); doc.setFontSize(10); doc.setFont('helvetica','bold');
    doc.text(String(a.priority), M + 5, y + 7, { align: 'center' });
    const aLines = doc.splitTextToSize(a.action || '', CW - 20);
    const wLines = doc.splitTextToSize(a.why || '', CW - 20);
    const bH = Math.max(24, (aLines.length + wLines.length) * 5 + 10);
    checkY(bH);
    setTxt('#08111E'); doc.setFontSize(10); doc.setFont('helvetica','bold');
    aLines.forEach((l,li) => doc.text(l, M + 14, y + 6 + li*5));
    setTxt('#6B7280'); doc.setFontSize(8); doc.setFont('helvetica','normal');
    wLines.slice(0,3).forEach((l,li) => doc.text(l, M + 14, y + 6 + aLines.length*5 + li*4));
    setFill('#E5E7EB'); doc.roundedRect(W - M - 30, y + 1, 30, 7, 1.5, 1.5, 'F');
    setTxt('#374151'); doc.setFontSize(7);
    doc.text(a.timeframe || '', W - M - 15, y + 6, { align: 'center' });
    y += bH;
  });

  // ── MODULE 8: MEETING PREP ──────────────────────────────────────────────
  if (meetingPrep && meetingPrep.meetingObjective) {
    addPage();
    setTxt('#08111E'); doc.setFontSize(16); doc.setFont('helvetica','bold');
    doc.text('08 — Meeting Prep Brief', M, y); y += 10;

    if (meetingInputs?.personName || meetingInputs?.personRole) {
      setTxt('#6B7280'); doc.setFontSize(10);
      const prepLine = `Prepared for: ${meetingInputs.personName || ''} — ${meetingInputs.personRole || ''} · ${meetingInputs.meetingType?.toUpperCase() || ''}`;
      const prepLines = doc.splitTextToSize(prepLine, CW);
      prepLines.forEach(l => { doc.text(l, M, y); y += 5; }); y += 2;
    }

    sectionHeader('Meeting Objective');
    bodyText(meetingPrep.meetingObjective, 0, '#111827'); y += 4;

    sectionHeader('Your Opening Line');
    infoBox(meetingPrep.openingLine, '#EFF6FF', '#1E40AF'); y += 2;

    sectionHeader('Power Questions');
    meetingPrep.powerQuestions?.forEach((q, i) => {
      doc.setFontSize(9);
      const qLines = doc.splitTextToSize(`Q${i+1}: ${q.question || ''}`, CW);
      const intentLines = doc.splitTextToSize(`Intent: ${q.intent || ''}`, CW - 6);
      const learnLines = doc.splitTextToSize(`Learn: ${q.expectedInsight || ''}`, CW - 6);
      const blockH = (qLines.length + intentLines.length + learnLines.length) * 4.5 + 8;
      checkY(blockH);
      setTxt('#111827'); doc.setFont('helvetica','bold');
      qLines.forEach(l => { doc.text(l, M, y); y += 4.5; });
      setTxt('#6B7280'); doc.setFont('helvetica','normal');
      intentLines.forEach(l => { doc.text(l, M + 6, y); y += 4; });
      setTxt('#1A56DB');
      learnLines.forEach(l => { doc.text(l, M + 6, y); y += 4; });
      y += 4;
    });

    sectionHeader('Landmines to Avoid');
    meetingPrep.landminesToAvoid?.forEach(l => bulletItem(`✗ ${l}`, '#EF4444')); y += 2;

    sectionHeader('Follow-Up Template');
    bodyText(meetingPrep.followUpTemplate, 0, '#374151');
  }

  // ── MODULE 9: EXECUTIVE BRIEFING ─────────────────────────────────────────
  if (execBrief && execBrief.documentTitle) {
    addPage();
    setTxt('#08111E'); doc.setFontSize(16); doc.setFont('helvetica','bold');
    doc.text('09 — Executive Briefing Document', M, y); y += 6;
    setTxt('#6B7280'); doc.setFontSize(9);
    doc.text('CONFIDENTIAL — Prepared for internal use', M, y); y += 10;

    setTxt('#1A56DB'); doc.setFontSize(13); doc.setFont('helvetica','bold');
    const dtLines = doc.splitTextToSize(execBrief.documentTitle || '', CW);
    dtLines.forEach(l => { checkY(7); doc.text(l, M, y); y += 7; }); y += 3;

    sectionHeader('Executive Summary');
    bodyText(execBrief.executiveSummary, 0, '#111827'); y += 4;

    sectionHeader('Current State Analysis', '#EF4444');
    if (execBrief.currentStateAnalysis) {
      setTxt('#111827'); doc.setFontSize(11); doc.setFont('helvetica','bold');
      const hlLines = doc.splitTextToSize(execBrief.currentStateAnalysis.headline || '', CW);
      hlLines.forEach(l => { checkY(6); doc.text(l, M, y); y += 6; });
      execBrief.currentStateAnalysis.painPoints?.forEach(p => { checkY(12); bulletItem(p, '#374151'); });
      checkY(14);
      setFill('#FEF2F2'); doc.roundedRect(M, y, CW, 12, 2, 2, 'F');
      setTxt('#DC2626'); doc.setFontSize(9); doc.setFont('helvetica','bold');
      doc.text(`Annual Cost of Status Quo: ${execBrief.currentStateAnalysis.costOfStatusQuo || 'See analysis'}`, M+4, y+8);
      y += 16;
    }

    sectionHeader('Financial Business Case', '#10B981');
    if (execBrief.businessCase) {
      const bc = execBrief.businessCase;
      const bRows = [
        ['Total Investment', bc.totalInvestment || '—'],
        ['Expected ROI', bc.roiPercentage || '—'],
        ['Payback Period', bc.paybackPeriod || '—'],
        ['Year 1 Benefit', bc.year1Benefits || '—'],
        ['3-Year NPV', bc.npv3Year || '—'],
      ];
      bRows.forEach(([k,v]) => {
        checkY(8);
        setTxt('#374151'); doc.setFontSize(9); doc.setFont('helvetica','normal');
        doc.text(k, M, y);
        setTxt('#111827'); doc.setFont('helvetica','bold');
        const vLines = doc.splitTextToSize(String(v), CW - 65);
        vLines.forEach((vl, vi) => { if(vi>0) checkY(5); doc.text(vl, M + 60, y + vi*5); });
        y += Math.max(6, vLines.length * 5);
      });
      y += 4;
    }

    sectionHeader('Risk of Inaction', '#EF4444');
    execBrief.riskAnalysis?.risksOfInaction?.forEach(r => { checkY(12); bulletItem(r, '#374151'); }); y += 2;

    sectionHeader('Recommendation');
    bodyText(execBrief.recommendation?.decision, 0, '#111827'); y += 4;
    execBrief.recommendation?.immediateNextSteps?.forEach((s, i) => {
      const sLines = doc.splitTextToSize(s, CW - 8);
      checkY(sLines.length * 5 + 4);
      setTxt('#1A56DB'); doc.setFontSize(9); doc.setFont('helvetica','bold');
      doc.text(`${i+1}.`, M, y);
      setTxt('#374151'); doc.setFont('helvetica','normal');
      sLines.forEach((l, li) => { doc.text(l, M+8, y + li*5); });
      y += sLines.length * 5 + 2;
    });
  }

  // ── FOOTER ON ALL PAGES ──────────────────────────────────────────────
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    setFill('#F59E0B'); doc.rect(0, 291, W, 1, 'F');
    setTxt('#9CA3AF'); doc.setFontSize(7); doc.setFont('helvetica','normal');
    doc.text(`Sales Intelligence  ·  ${form.company}  ·  Confidential`, M, 295);
    doc.text(`${p} / ${total}`, W - M, 295, { align: 'right' });
  }

  doc.save(`${form.company.replace(/ /g,'_')}_Intelligence_Brief.pdf`);
};

// ─── ON-DEMAND GENERATORS ────────────────────────────────────────────────────
const generateBattleCards = async (competitors, form, result, setFn, setLoading) => {
  setLoading(true);
  try {
    const res = await fetch("/api/anthropic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        system: `You are Ankur Sehgal — global enterprise SaaS sales expert. Generate battle cards for the given competitors. Return ONLY valid JSON array:
[{
  "competitor": "name",
  "ourStrengths": ["strength 1","strength 2","strength 3"],
  "theirWeaknesses": ["weakness 1","weakness 2","weakness 3"],
  "theirStrengths": ["their strength 1","their strength 2"],
  "winMoves": ["move 1","move 2","move 3"],
  "trapQuestions": ["question 1","question 2"],
  "landmines": ["landmine 1","landmine 2"],
  "whenWeWin": "conditions for winning",
  "whenWeLose": "honest assessment"
}]`,
        messages: [{ role: "user", content: `Competitors: ${competitors}
Company: ${form.company}
Industry: ${form.industry}
Product: ${form.product}
Our pain points addressed: ${result?.accountBrief?.painPoints?.map(p=>p.pain).join(', ')}` }]
      })
    });
    const data = await res.json();
    const raw = data.content?.map(b => b.text || "").join("") || "";
    const clean = raw.split("```").join("").split("\n").filter(l => l.trim() && l.trim() !== "json").join("\n").trim();
    setFn(JSON.parse(clean));
  } catch(e) { alert("Failed to generate battle cards. Try again."); }
  setLoading(false);
};

const generateLanguages = async (form, result, setFn, setLoading, selectedLang) => {
  setLoading(true);
  const langMap = {
    bahasa:"Bahasa Indonesia/Malaysia", mandarin:"Mandarin Chinese",
    japanese:"Japanese (formal keigo)", korean:"Korean",
    arabic:"Arabic", hindi:"Hindi", french:"French",
    german:"German", spanish:"Spanish", thai:"Thai", tagalog:"Filipino"
  };
  const langName = langMap[selectedLang] || selectedLang;
  try {
    const res = await fetch("/api/anthropic", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514", max_tokens: 2000, stream: true,
        system: `You are a global sales localisation expert. Return ONLY valid JSON: {"${selectedLang || "lang"}":{"language":"${langName}","emailSubject":"subject in target language","emailBody":"150-word email in target language","linkedIn":"under 300 chars in target language","culturalNote":"key cultural tip"}}`,
        messages: [{ role: "user", content: `Write in ${langName}. Company: ${form.company}, Market: ${form.market}, Industry: ${form.industry}, Product: ${form.product}. Pain: ${result?.accountBrief?.painPoints?.[0]?.pain}. English subject: ${result?.outreach?.coldEmail?.subject}` }]
      })
    });
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let raw = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const line of decoder.decode(value, { stream: true }).split("\n")) {
        if (line.startsWith("data: ")) {
          try {
            const evt = JSON.parse(line.slice(6));
            if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") raw += evt.delta.text;
          } catch(e) {}
        }
      }
    }
    const s = raw.indexOf("{"), e = raw.lastIndexOf("}");
    const parsed = JSON.parse(raw.slice(s, e+1));
    setFn(prev => ({ ...(prev||{}), ...parsed }));
  } catch(e) { alert("Failed to generate. Try again."); }
  setLoading(false);
};

const generateLiVariants = async (form, result, setFn, setLoading) => {
  setLoading(true);
  try {
    const res = await fetch("/api/anthropic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: `Generate 3 LinkedIn connection message variants under 300 chars each. Return ONLY valid JSON array:
[{"type":"Post Reference","message":"..."},{"type":"Company Milestone","message":"..."},{"type":"Cold Insight","message":"..."}]`,
        messages: [{ role: "user", content: `Target: ${form.company}, ${form.market}, ${form.industry}. Our product: ${form.product}. Their pain: ${result?.accountBrief?.painPoints?.[0]?.pain}` }]
      })
    });
    const data = await res.json();
    const raw = data.content?.map(b => b.text || "").join("") || "";
    const clean = raw.split("```").join("").split("\n").filter(l => l.trim() && l.trim() !== "json").join("\n").trim();
    setFn(JSON.parse(clean));
  } catch(e) { alert("Failed to generate variants. Try again."); }
  setLoading(false);
};

// ─── EMAIL FINDER ────────────────────────────────────────────────────────────
const findEmails = async (company, stakeholders, setFn, setLoading) => {
  setLoading(true);
  try {
    const res = await fetch("/api/anthropic", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514", max_tokens: 2000, stream: true,
        system: `You are an expert at B2B email intelligence. Based on your knowledge of companies and common enterprise email patterns, provide your best estimate of email addresses and patterns. Return ONLY valid JSON array:
[{"role":"CFO","name":"Likely name if known","email":"estimated.email@company.com","emailPattern":"firstname.lastname@company.com","confidence":"high/medium/low","notes":"How you determined this"}]`,
        messages: [{ role: "user", content: `Company: ${company}. Find or estimate email addresses for: ${stakeholders.map(s => s.role).join(', ')}. Use your knowledge of ${company}'s known executives, common email naming conventions for this company/industry, and any publicly known contact information. Provide your best estimates with confidence levels.` }]
      })
    });
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let raw = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const line of decoder.decode(value, { stream: true }).split("\n")) {
        if (line.startsWith("data: ")) {
          try {
            const evt = JSON.parse(line.slice(6));
            if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") raw += evt.delta.text;
          } catch(e) {}
        }
      }
    }
    const s = raw.indexOf("["), e = raw.lastIndexOf("]");
    if (s !== -1 && e !== -1) {
      try { setFn(JSON.parse(raw.slice(s, e+1))); }
      catch(e2) { setFn([]); }
    } else setFn([]);
  } catch(e) { setFn([]); }
  setLoading(false);
};

// ─── ORG CHART GENERATOR ──────────────────────────────────────────────────────
const generateOrgChart = async (company, market, industry, result, setFn, setLoading) => {
  setLoading(true);
  try {
    const res = await fetch("/api/anthropic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        system: `You are an expert at mapping enterprise org structures. Return ONLY valid JSON:
{"ceo":{"name":"Name if known","title":"CEO/MD","children":[{"name":"Name","title":"CFO","department":"Finance","relevance":"high/medium/low","children":[]},{"name":"Name","title":"CTO","department":"Technology","relevance":"medium","children":[]}]},"emailPattern":"firstname.lastname@company.com","totalEmployees":"approx number","reportingStructure":"Description of how decisions are made"}`,
        messages: [{ role: "user", content: `Map the org chart for ${company} in ${market} (${industry}). Focus on the C-suite and key decision makers relevant to a ${result?.outreach?.coldEmail?.subject || 'enterprise SaaS'} sale. Search for "${company} leadership team", "${company} executives", "${company} annual report".` }]
      })
    });
    const data = await res.json();
    const text = data.content?.filter(b => b.type === 'text').map(b => b.text).join('') || '{}';
    const s = text.indexOf('{'), e = text.lastIndexOf('}');
    if (s !== -1 && e !== -1) setFn(JSON.parse(text.slice(s, e+1)));
  } catch(e) { }
  setLoading(false);
};

// ─── ROI CALCULATOR ──────────────────────────────────────────────────────────
const calcROI = (inputs, result) => {
  const emp = parseFloat(inputs.employees) || 0;
  const salary = parseFloat(inputs.avgSalary) || 80000;
  const hrs = parseFloat(inputs.hoursPerWeek) || 10;
  const dealSize = parseFloat(inputs.dealSize) || 200000;
  const errorCost = parseFloat(inputs.currentErrors) || 0;
  const revenueUpside = parseFloat(inputs.revenueUpside) || 0;
  const hourlyRate = salary / 2080;
  const annualHours = emp * hrs * 52;
  const laborSavings = annualHours * hourlyRate * 0.7;
  const totalBenefit = laborSavings + errorCost + revenueUpside;
  const roi = dealSize > 0 ? ((totalBenefit - dealSize) / dealSize * 100).toFixed(0) : 0;
  const payback = totalBenefit > 0 ? (dealSize / (totalBenefit / 12)).toFixed(1) : 0;
  return {
    laborSavings: Math.round(laborSavings),
    errorCost: Math.round(errorCost),
    revenueUpside: Math.round(revenueUpside),
    totalBenefit: Math.round(totalBenefit),
    roi: parseInt(roi),
    payback: parseFloat(payback),
    costOfInaction: Math.round(totalBenefit / 12),
  };
};

// ─── TRANSCRIPT ANALYSER ─────────────────────────────────────────────────────
const analyseTranscript = async (text, form, result) => {
  const res = await fetch("/api/anthropic", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system: `You are Ankur Sehgal — global enterprise sales expert. Analyse this call transcript and return ONLY valid JSON:
{
  "summary": "2-3 sentence call summary",
  "meddpiccSignals": {
    "metrics": "what was revealed or is still unknown",
    "economicBuyer": "what was revealed or is still unknown",
    "decisionCriteria": "what was revealed or is still unknown",
    "decisionProcess": "what was revealed or is still unknown",
    "champion": "what was revealed or is still unknown",
    "competition": "what was revealed or is still unknown"
  },
  "positiveSignals": ["Buying signal 1", "Signal 2", "Signal 3"],
  "redFlags": ["Concern 1", "Concern 2"],
  "missedOpportunities": ["Question you should have asked 1", "Missed opp 2"],
  "nextActions": [
    {"action": "Specific next action", "owner": "You/Prospect", "timeframe": "24hrs/This week"},
    {"action": "Action 2", "owner": "You", "timeframe": "This week"},
    {"action": "Action 3", "owner": "You", "timeframe": "Next 2 weeks"}
  ],
  "followUpEmail": {
    "subject": "Follow up email subject line",
    "body": "Complete follow-up email based on the call — recap decisions, confirm next steps, add value"
  },
  "dealHealthChange": "improved/unchanged/deteriorated",
  "coachingNote": "One specific thing you could have done better on this call"
}`,
      messages: [{ role: "user", content: `Company: ${form?.company || "Unknown"}
Deal Stage: ${form?.dealStage || "Unknown"}

TRANSCRIPT:
${text}` }]
    })
  });
  const data = await res.json();
  const raw = data.content?.map(b => b.text || "").join("") || "";
  const clean = raw.split("```").join("").split("\n").filter(l => l.trim() && l.trim() !== "json").join("\n").trim();
  return JSON.parse(clean);
};

// ─── WEB SEARCH ───────────────────────────────────────────────────────────────
const searchCompanyIntel = async (company, market, industry) => {
  try {
    const response = await fetch("/api/anthropic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8000,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{
          role: "user",
          content: `Search for the latest news, financial results, leadership changes, strategic initiatives, regulatory issues, and business developments for ${company} in ${market} (${industry} sector). Search for: "${company} news 2025", "${company} annual report", "${company} CEO strategy", "${company} digital transformation". Return a structured summary of: 1) Recent major news/events 2) Financial performance signals 3) Strategic priorities 4) Leadership/org changes 5) Regulatory/compliance developments. Be specific and cite recent dates where possible.`
        }],
      }),
    });
    const data = await response.json();
    const text = data.content?.map(b => b.text || "").filter(Boolean).join("\n") || "";
    return text;
  } catch (e) {
    return "";
  }
};


// ─── STYLES ───────────────────────────────────────────────────────────────────
const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy:       #050C18;
    --navy2:      #080F1E;
    --navy3:      #0D1525;
    --slate:      #141E30;
    --slate2:     #1A2540;
    --blue:       #1D4ED8;
    --blue-light: #60A5FA;
    --blue-glow:  rgba(96,165,250,0.12);
    --amber:      #F59E0B;
    --amber2:     #FBBF24;
    --amber-glow: rgba(245,158,11,0.12);
    --orange:     #EA580C;
    --green:      #10B981;
    --green-dim:  rgba(16,185,129,0.12);
    --red:        #EF4444;
    --red-dim:    rgba(239,68,68,0.12);
    --text:       #F1F5F9;
    --text-muted: #94A3B8;
    --text-dim:   #64748B;
    --border:     rgba(255,255,255,0.06);
    --border2:    rgba(255,255,255,0.1);
    --card:       rgba(255,255,255,0.03);
    --card2:      rgba(255,255,255,0.055);
    --card-hover: rgba(255,255,255,0.07);
    --glass:      rgba(13,21,37,0.8);
    --radius:     14px;
    --radius-sm:  8px;
    --shadow:     0 4px 24px rgba(0,0,0,0.4);
    --shadow-lg:  0 8px 48px rgba(0,0,0,0.6);
  }

  body {
    background: var(--navy);
    color: var(--text);
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  /* ─── ANIMATED BACKGROUND ─────────────────────────────────────── */
  .app {
    min-height: 100vh;
    background: var(--navy);
    position: relative;
  }
  .app::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 50% at 20% 0%, rgba(29,78,216,0.08) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 100%, rgba(245,158,11,0.05) 0%, transparent 50%),
      radial-gradient(ellipse 40% 30% at 50% 50%, rgba(96,165,250,0.04) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
  .app > * { position: relative; z-index: 1; }

  /* ─── HEADER ──────────────────────────────────────────────────── */
  .header {
    background: rgba(5,12,24,0.9);
    border-bottom: 1px solid var(--border);
    padding: 0 32px;
    position: sticky; top: 0; z-index: 100;
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
  }
  .header-inner {
    max-width: 1100px; margin: 0 auto;
    display: flex; align-items: center; justify-content: space-between;
    height: 60px;
  }
  .logo { display: flex; align-items: center; gap: 10px; }
  .logo-icon {
    width: 32px; height: 32px;
    background: linear-gradient(135deg, var(--amber), var(--orange));
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    box-shadow: 0 2px 12px rgba(245,158,11,0.3);
  }
  .logo-text { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 15px; color: white; letter-spacing: -0.5px; }
  .logo-sub { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--amber); letter-spacing: 2.5px; margin-top: -1px; opacity: 0.8; }
  .header-badge {
    font-family: 'JetBrains Mono', monospace; font-size: 9px;
    color: var(--text-dim); background: var(--card);
    border: 1px solid var(--border); border-radius: 20px;
    padding: 3px 10px; letter-spacing: 1.5px;
  }

  /* ─── PROGRESS ────────────────────────────────────────────────── */
  .progress-bar { height: 1px; background: var(--border); }
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--blue), var(--amber));
    transition: width 0.5s cubic-bezier(0.4,0,0.2,1);
    box-shadow: 0 0 8px rgba(245,158,11,0.4);
  }

  /* ─── MAIN LAYOUT ─────────────────────────────────────────────── */
  .main { max-width: 900px; margin: 0 auto; padding: 48px 24px 100px; }

  /* ─── STEPS ───────────────────────────────────────────────────── */
  .steps { display: flex; align-items: center; gap: 0; margin-bottom: 48px; }
  .step-item { display: flex; align-items: center; gap: 8px; }
  .step-dot {
    width: 26px; height: 26px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 500;
    flex-shrink: 0; transition: all 0.3s ease;
  }
  .step-dot.done { background: var(--green); color: white; box-shadow: 0 0 12px rgba(16,185,129,0.3); }
  .step-dot.active {
    background: var(--amber); color: var(--navy); font-weight: 700;
    box-shadow: 0 0 20px rgba(245,158,11,0.4);
    animation: stepPulse 2s ease-in-out infinite;
  }
  @keyframes stepPulse { 0%,100%{box-shadow:0 0 12px rgba(245,158,11,0.4)} 50%{box-shadow:0 0 24px rgba(245,158,11,0.7)} }
  .step-dot.pending { background: var(--card); border: 1px solid var(--border); color: var(--text-dim); }
  .step-label { font-size: 11px; color: var(--text-dim); white-space: nowrap; font-weight: 500; }
  .step-label.active { color: var(--amber); font-weight: 600; }
  .step-connector { height: 1px; background: var(--border); flex: 1; min-width: 20px; margin: 0 8px; }

  /* ─── CARDS ───────────────────────────────────────────────────── */
  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 28px;
    margin-bottom: 16px;
    transition: border-color 0.2s, box-shadow 0.2s;
    position: relative;
    overflow: hidden;
  }
  .card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
  }
  .card:hover { border-color: var(--border2); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }

  .card-title {
    font-family: 'JetBrains Mono', monospace; font-size: 9px;
    color: var(--amber); letter-spacing: 3px; text-transform: uppercase;
    margin-bottom: 22px; display: flex; align-items: center; gap: 10px;
  }
  .card-title::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  /* ─── FORM ELEMENTS ───────────────────────────────────────────── */
  .field { margin-bottom: 18px; }
  .field-label {
    font-family: 'JetBrains Mono', monospace; font-size: 9px;
    color: var(--text-dim); letter-spacing: 2.5px;
    display: block; margin-bottom: 8px; text-transform: uppercase;
  }
  .field-label span { color: var(--amber); margin-left: 3px; }

  input[type=text], input[type=number], textarea, select {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 11px 14px;
    font-family: 'Inter', sans-serif;
    font-size: 13.5px;
    color: var(--text);
    outline: none;
    transition: all 0.2s ease;
    appearance: none; -webkit-appearance: none;
  }
  input[type=text]:focus, input[type=number]:focus, textarea:focus, select:focus {
    border-color: rgba(96,165,250,0.4);
    box-shadow: 0 0 0 3px rgba(96,165,250,0.08);
    background: rgba(255,255,255,0.06);
  }
  input::placeholder, textarea::placeholder { color: var(--text-dim); font-size: 13px; }
  textarea { resize: vertical; min-height: 80px; line-height: 1.7; }
  select option { background: #0D1525; color: var(--text); }

  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }

  /* ─── BUTTONS ─────────────────────────────────────────────────── */
  .btn-primary {
    background: linear-gradient(135deg, #1D4ED8, #2563EB);
    color: white; border: none; border-radius: 10px;
    padding: 13px 26px;
    font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700;
    cursor: pointer; transition: all 0.2s ease; letter-spacing: 0.3px;
    display: inline-flex; align-items: center; gap: 8px;
    box-shadow: 0 2px 12px rgba(29,78,216,0.25);
  }
  .btn-primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(29,78,216,0.4);
  }
  .btn-primary:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

  .btn-amber {
    background: linear-gradient(135deg, var(--amber), var(--orange));
    color: #050C18; border: none; border-radius: 10px;
    padding: 14px 32px;
    font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 800;
    cursor: pointer; transition: all 0.25s ease; letter-spacing: 0.5px;
    display: inline-flex; align-items: center; gap: 10px;
    box-shadow: 0 4px 20px rgba(245,158,11,0.25);
    position: relative; overflow: hidden;
  }
  .btn-amber::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
    opacity: 0; transition: opacity 0.2s;
  }
  .btn-amber:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(245,158,11,0.4);
  }
  .btn-amber:hover::after { opacity: 1; }
  .btn-amber:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

  .btn-ghost {
    background: transparent; border: 1px solid var(--border);
    color: var(--text-dim); border-radius: 10px;
    padding: 11px 20px;
    font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500;
    cursor: pointer; transition: all 0.2s;
  }
  .btn-ghost:hover { border-color: var(--border2); color: var(--text); background: var(--card); }

  /* ─── ANALYSIS SCREEN ─────────────────────────────────────────── */
  .analyzing {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; min-height: 65vh; gap: 36px;
  }
  .pulse-ring {
    width: 76px; height: 76px;
    border: 1.5px solid var(--amber);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    position: relative;
  }
  .pulse-ring::before, .pulse-ring::after {
    content: '';
    position: absolute;
    border: 1px solid var(--amber);
    border-radius: 50%;
    animation: ripple 2.5s ease-out infinite;
  }
  .pulse-ring::after { animation-delay: 1.25s; }
  @keyframes ripple {
    0% { width: 76px; height: 76px; opacity: 0.6; }
    100% { width: 140px; height: 140px; opacity: 0; }
  }
  .analyze-steps { display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 480px; }
  .analyze-step {
    display: flex; align-items: center; gap: 14px;
    padding: 13px 16px; border-radius: 10px;
    border: 1px solid var(--border);
    transition: all 0.4s ease;
  }
  .analyze-step.done { background: var(--green-dim); border-color: rgba(16,185,129,0.2); }
  .analyze-step.active { background: var(--amber-glow); border-color: rgba(245,158,11,0.25); }
  .analyze-step.pending { opacity: 0.3; }
  .analyze-step-icon {
    width: 26px; height: 26px; border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; flex-shrink: 0;
    background: var(--card2);
  }
  .analyze-step-text { font-size: 12.5px; color: var(--text-muted); font-weight: 500; }
  .analyze-step.active .analyze-step-text { color: var(--amber); font-weight: 600; }
  .analyze-step.done .analyze-step-text { color: var(--green); }

  /* ─── RESULTS HEADER ──────────────────────────────────────────── */
  .results-header { margin-bottom: 32px; }
  .company-title {
    font-family: 'Syne', sans-serif; font-size: 30px; font-weight: 900;
    color: white; margin-bottom: 4px; letter-spacing: -0.5px;
  }
  .company-meta { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
  .meta-chip {
    font-family: 'JetBrains Mono', monospace; font-size: 9px;
    padding: 4px 10px; border-radius: 6px; border: 1px solid;
    letter-spacing: 1px; text-transform: uppercase;
  }

  /* ─── TABS ────────────────────────────────────────────────────── */
  .tabs {
    display: flex; gap: 2px; margin-bottom: 24px;
    background: rgba(255,255,255,0.02);
    border: 1px solid var(--border);
    border-radius: 12px; padding: 4px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .tabs::-webkit-scrollbar { display: none; }
  .tab {
    padding: 8px 13px; border-radius: 9px; border: none;
    background: transparent; cursor: pointer;
    font-family: 'JetBrains Mono', monospace; font-size: 9px;
    letter-spacing: 1.5px; color: var(--text-dim);
    white-space: nowrap; transition: all 0.2s;
    display: flex; align-items: center; gap: 5px;
    font-weight: 500;
  }
  .tab:hover { color: var(--text); background: var(--card2); }
  .tab.active {
    background: var(--slate2);
    color: var(--amber);
    border: 1px solid rgba(245,158,11,0.15);
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }

  /* ─── SCORE RING ──────────────────────────────────────────────── */
  .score-display { display: flex; align-items: center; gap: 24px; }
  .score-ring {
    width: 88px; height: 88px; border-radius: 50%;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    flex-shrink: 0; position: relative;
  }
  .score-number { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 900; line-height: 1; }
  .score-label { font-family: 'JetBrains Mono', monospace; font-size: 7px; letter-spacing: 1.5px; margin-top: 3px; opacity: 0.7; }

  /* ─── STAT GRID ───────────────────────────────────────────────── */
  .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
  .stat-card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 12px; padding: 16px;
    transition: all 0.2s;
  }
  .stat-card:hover { border-color: var(--border2); background: var(--card2); }
  .stat-value { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 800; color: var(--amber); margin-bottom: 4px; }
  .stat-key { font-family: 'JetBrains Mono', monospace; font-size: 8px; color: var(--text-dim); letter-spacing: 1.5px; text-transform: uppercase; }

  /* ─── TAGS ────────────────────────────────────────────────────── */
  .tag { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 5px; font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.5px; font-weight: 500; }
  .tag-amber { background: var(--amber-glow); border: 1px solid rgba(245,158,11,0.2); color: var(--amber); }
  .tag-green { background: var(--green-dim); border: 1px solid rgba(16,185,129,0.2); color: var(--green); }
  .tag-red { background: var(--red-dim); border: 1px solid rgba(239,68,68,0.2); color: var(--red); }
  .tag-blue { background: var(--blue-glow); border: 1px solid rgba(96,165,250,0.2); color: var(--blue-light); }
  .tag-dim { background: var(--card); border: 1px solid var(--border); color: var(--text-dim); }

  /* ─── MEDDPICC ────────────────────────────────────────────────── */
  .medd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .medd-item {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 12px; padding: 16px; cursor: pointer; transition: all 0.2s;
  }
  .medd-item:hover { border-color: var(--border2); background: var(--card2); }
  .medd-item.expanded { border-color: rgba(245,158,11,0.25); background: var(--amber-glow); }
  .medd-header { display: flex; align-items: center; justify-content: space-between; }
  .medd-name { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700; color: var(--text); }
  .medd-status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .medd-status-dot.green { background: var(--green); box-shadow: 0 0 6px rgba(16,185,129,0.6); }
  .medd-status-dot.amber { background: var(--amber); box-shadow: 0 0 6px rgba(245,158,11,0.6); }
  .medd-status-dot.red { background: var(--red); box-shadow: 0 0 6px rgba(239,68,68,0.6); }
  .medd-evidence { font-size: 11.5px; color: var(--text-dim); margin-top: 8px; line-height: 1.6; }
  .medd-expanded { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); }
  .medd-next-action { font-size: 11.5px; color: var(--amber); background: var(--amber-glow); border-radius: 6px; padding: 8px 10px; margin-bottom: 10px; line-height: 1.5; }

  /* ─── STAKEHOLDERS ────────────────────────────────────────────── */
  .stakeholder-grid { display: flex; flex-direction: column; gap: 10px; }
  .stakeholder-card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 20px; transition: all 0.2s;
  }
  .stakeholder-card:hover { border-color: var(--border2); }
  .stakeholder-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
  .stakeholder-role { font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; color: white; }
  .stakeholder-body { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .sf-label { font-family: 'JetBrains Mono', monospace; font-size: 8px; color: var(--text-dim); letter-spacing: 2px; margin-bottom: 5px; text-transform: uppercase; }
  .sf-value { font-size: 12px; color: var(--text-muted); line-height: 1.6; }
  .talk-track {
    margin-top: 14px; padding: 13px 15px;
    background: rgba(29,78,216,0.08); border: 1px solid rgba(96,165,250,0.15);
    border-radius: 8px; font-size: 12px; color: var(--blue-light);
    line-height: 1.7; font-style: italic;
    border-left: 3px solid var(--blue);
  }

  /* ─── OUTREACH EMAILS ─────────────────────────────────────────── */
  .email-box {
    background: rgba(255,255,255,0.02);
    border: 1px solid var(--border);
    border-radius: var(--radius); overflow: hidden;
    transition: border-color 0.2s;
  }
  .email-box:hover { border-color: var(--border2); }
  .email-header {
    background: var(--slate);
    padding: 14px 18px; border-bottom: 1px solid var(--border);
    display: flex; justify-content: space-between; align-items: center;
  }
  .email-subject { font-size: 13px; font-weight: 600; color: white; }
  .email-body { padding: 18px; font-size: 13px; color: var(--text-muted); line-height: 1.85; white-space: pre-line; }
  .copy-btn {
    font-family: 'JetBrains Mono', monospace; font-size: 8px; letter-spacing: 1.5px;
    padding: 5px 11px; border-radius: 5px; border: 1px solid var(--border);
    background: transparent; color: var(--text-dim); cursor: pointer; transition: all 0.2s;
  }
  .copy-btn:hover { border-color: var(--amber); color: var(--amber); }
  .copy-btn.copied { border-color: var(--green); color: var(--green); }

  /* ─── DISCOVERY QUESTIONS ─────────────────────────────────────── */
  .q-category { margin-bottom: 28px; }
  .q-cat-title { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--amber); letter-spacing: 2.5px; margin-bottom: 14px; text-transform: uppercase; }
  .q-item {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 10px; padding: 16px; margin-bottom: 8px;
    transition: all 0.2s;
  }
  .q-item:hover { border-color: var(--border2); background: var(--card2); }
  .q-text { font-size: 13px; color: var(--text); line-height: 1.65; margin-bottom: 10px; font-style: italic; }
  .q-text::before { content: '"'; color: var(--amber); font-size: 18px; line-height: 0; vertical-align: -4px; margin-right: 2px; }
  .q-text::after { content: '"'; color: var(--amber); font-size: 18px; line-height: 0; vertical-align: -4px; margin-left: 2px; }
  .q-meta { display: flex; gap: 8px; flex-wrap: wrap; }
  .q-intent { font-size: 11px; color: var(--text-dim); }
  .q-followup { font-size: 11px; color: var(--blue-light); }

  /* ─── COMMAND OF MESSAGE ──────────────────────────────────────── */
  .com-before-after { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
  .com-before { background: var(--red-dim); border: 1px solid rgba(239,68,68,0.15); border-radius: 12px; padding: 18px; }
  .com-after { background: var(--green-dim); border: 1px solid rgba(16,185,129,0.15); border-radius: 12px; padding: 18px; }
  .com-box-label { font-family: 'JetBrains Mono', monospace; font-size: 8px; letter-spacing: 2px; margin-bottom: 10px; text-transform: uppercase; }
  .com-box-text { font-size: 13px; line-height: 1.7; color: var(--text-muted); }
  .value-driver {
    background: var(--card); border: 1px solid var(--border); border-radius: 10px;
    padding: 14px; margin-bottom: 8px; display: flex; align-items: flex-start; gap: 12px;
    transition: all 0.2s;
  }
  .value-driver:hover { border-color: var(--border2); }
  .vd-icon { width: 30px; height: 30px; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; background: var(--amber-glow); }
  .objection-item {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 10px; padding: 15px; margin-bottom: 8px;
    border-left: 2px solid var(--red);
  }
  .obj-q { font-size: 12px; color: var(--red); font-weight: 600; margin-bottom: 7px; }
  .obj-a { font-size: 12px; color: var(--text-muted); line-height: 1.65; }

  /* ─── DEAL COACH CHAT ─────────────────────────────────────────── */
  .chat-window {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 16px; overflow: hidden;
    display: flex; flex-direction: column; height: 520px;
  }
  .chat-messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 14px; scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
  .chat-msg { display: flex; gap: 10px; align-items: flex-start; }
  .chat-msg.user { flex-direction: row-reverse; }
  .chat-avatar { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
  .chat-avatar.coach { background: linear-gradient(135deg, var(--amber), var(--orange)); color: var(--navy); font-family: 'Syne', sans-serif; }
  .chat-avatar.user { background: var(--slate2); color: var(--text-muted); border: 1px solid var(--border); }
  .chat-bubble { max-width: 78%; padding: 11px 15px; border-radius: 12px; font-size: 13px; line-height: 1.7; }
  .chat-msg.coach .chat-bubble { background: var(--card2); border: 1px solid var(--border); color: var(--text); border-radius: 2px 12px 12px 12px; }
  .chat-msg.user .chat-bubble { background: var(--slate2); color: var(--text); border-radius: 12px 2px 12px 12px; }
  .chat-input-area { padding: 16px; border-top: 1px solid var(--border); display: flex; gap: 10px; background: var(--slate); }
  .chat-input { flex: 1; background: var(--card2); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; font-family: 'Inter', sans-serif; font-size: 13px; color: var(--text); outline: none; transition: border-color 0.2s; }
  .chat-input:focus { border-color: rgba(96,165,250,0.3); }
  .chat-input::placeholder { color: var(--text-dim); }
  .chat-send { background: var(--amber); border: none; border-radius: 8px; padding: 10px 16px; color: var(--navy); font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: 'Syne', sans-serif; font-size: 12px; }
  .chat-send:hover { background: var(--amber2); transform: translateY(-1px); }
  .chat-send:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  /* ─── ANIMATIONS ──────────────────────────────────────────────── */
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .fade-up-1 { animation: fadeUp 0.35s ease both; }
  .fade-up-2 { animation: fadeUp 0.35s 0.05s ease both; }
  .fade-up-3 { animation: fadeUp 0.35s 0.1s ease both; }

  /* ─── SELECT FIELD ────────────────────────────────────────────── */
  .select-field {
    width: 100%; background: rgba(255,255,255,0.04);
    border: 1px solid var(--border); border-radius: var(--radius-sm);
    padding: 11px 14px; font-family: 'Inter', sans-serif;
    font-size: 13.5px; color: var(--text); outline: none; transition: all 0.2s;
    appearance: none; -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748B' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 36px;
  }
  .select-field:focus {
    border-color: rgba(96,165,250,0.4);
    box-shadow: 0 0 0 3px rgba(96,165,250,0.08);
  }

  /* ─── INPUT FIELD ─────────────────────────────────────────────── */
  .input-field {
    width: 100%; background: rgba(255,255,255,0.04);
    border: 1px solid var(--border); border-radius: var(--radius-sm);
    padding: 11px 14px; font-family: 'Inter', sans-serif;
    font-size: 13.5px; color: var(--text); outline: none; transition: all 0.2s;
  }
  .input-field:focus {
    border-color: rgba(96,165,250,0.4);
    box-shadow: 0 0 0 3px rgba(96,165,250,0.08);
  }

  /* ─── TONE SELECTOR ───────────────────────────────────────────── */
  .tone-btn {
    flex: 1; padding: 10px; border-radius: 8px;
    border: 1px solid var(--border); background: transparent;
    cursor: pointer; transition: all 0.2s; text-align: center;
  }
  .tone-btn:hover { border-color: var(--border2); background: var(--card2); }
  .tone-btn.active { border-color: rgba(245,158,11,0.3); background: var(--amber-glow); }

  /* ─── SECTION DIVIDER ─────────────────────────────────────────── */
  .section-divider {
    display: flex; align-items: center; gap: 12px;
    margin: 24px 0 18px;
  }
  .section-divider-line { flex: 1; height: 1px; background: var(--border); }
  .section-divider-label { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--text-dim); letter-spacing: 2px; text-transform: uppercase; }

  /* ─── LIGHT MODE ──────────────────────────────────────────────── */
  .light-mode {
    --navy:   #F8FAFC;
    --navy2:  #F1F5F9;
    --navy3:  #E8F0FE;
    --slate:  #EFF6FF;
    --slate2: #E2E8F0;
    --text:   #0F172A;
    --text-muted: #475569;
    --text-dim:   #94A3B8;
    --border:  rgba(0,0,0,0.08);
    --border2: rgba(0,0,0,0.14);
    --card:    rgba(255,255,255,0.8);
    --card2:   rgba(255,255,255,0.95);
    --card-hover: rgba(255,255,255,1);
    --glass:   rgba(248,250,252,0.9);
    background: #F8FAFC;
    color: #0F172A;
  }
  .light-mode .app::before {
    background:
      radial-gradient(ellipse 80% 50% at 20% 0%, rgba(29,78,216,0.04) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 100%, rgba(245,158,11,0.03) 0%, transparent 50%);
  }
  .light-mode .header {
    background: rgba(255,255,255,0.92);
    border-bottom-color: rgba(0,0,0,0.08);
  }
  .light-mode input[type=text],
  .light-mode input[type=number],
  .light-mode textarea,
  .light-mode select,
  .light-mode .select-field,
  .light-mode .input-field {
    background: rgba(255,255,255,0.9);
    border-color: rgba(0,0,0,0.12);
    color: #0F172A;
  }
  .light-mode input::placeholder, .light-mode textarea::placeholder { color: #94A3B8; }
  .light-mode select option { background: white; color: #0F172A; }
  .light-mode .chat-window { background: white; }
  .light-mode .chat-msg.coach .chat-bubble { background: #F8FAFC; border-color: rgba(0,0,0,0.08); }
  .light-mode .chat-msg.user .chat-bubble { background: #EFF6FF; }
  .light-mode .chat-input-area { background: #F1F5F9; }
  .light-mode .chat-input { background: white; border-color: rgba(0,0,0,0.1); color: #0F172A; }

  /* ─── RESPONSIVE BREAKPOINTS ─────────────────────────────────────── */
  @media (max-width: 768px) {
    .main { padding: 24px 16px 80px; }
    .header { padding: 0 16px; }
    .header-inner { height: 56px; }
    .logo-text { font-size: 13px; }
    .logo-sub { display: none; }
    .header-badge { display: none; }
    .tabs { padding: 3px; gap: 1px; }
    .tab { padding: 8px 10px; font-size: 8px; letter-spacing: 0.5px; }
    .stat-grid { grid-template-columns: 1fr 1fr; }
    .medd-grid { grid-template-columns: 1fr; }
    .grid-2 { grid-template-columns: 1fr; }
    .grid-3 { grid-template-columns: 1fr; }
    .com-before-after { grid-template-columns: 1fr; }
    .steps { display: none; }
    .company-title { font-size: 22px; }
  }
  @media (max-width: 480px) {
    .tab { padding: 7px 8px; font-size: 7.5px; }
    .btn-amber { padding: 12px 20px; font-size: 13px; }
    .card { padding: 18px; }
    .chat-window { height: 420px; }
  }
  /* ─── RESPONSIVE GRID HELPERS ─────────────────────────────────────── */
  .r-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .r-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
  .r-grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; }
  @media (max-width: 768px) {
    .r-grid-2 { grid-template-columns: 1fr; gap: 12px; }
    .r-grid-3 { grid-template-columns: 1fr 1fr; gap: 10px; }
    .r-grid-4 { grid-template-columns: 1fr 1fr; gap: 10px; }
  }
  @media (max-width: 480px) {
    .r-grid-3 { grid-template-columns: 1fr; }
  }
  /* ─── MICRO-ANIMATIONS ────────────────────────────────────────────── */
  @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes scaleIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
  @keyframes shimmer { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
  @keyframes barGrow { from { width:0; } to { width:100%; } }
  .anim-slide-up { animation: slideUp 0.35s cubic-bezier(0.16,1,0.3,1) both; }
  .anim-slide-up-2 { animation: slideUp 0.35s 0.05s cubic-bezier(0.16,1,0.3,1) both; }
  .anim-slide-up-3 { animation: slideUp 0.35s 0.1s cubic-bezier(0.16,1,0.3,1) both; }
  .anim-slide-up-4 { animation: slideUp 0.35s 0.15s cubic-bezier(0.16,1,0.3,1) both; }
  .anim-scale-in { animation: scaleIn 0.25s cubic-bezier(0.16,1,0.3,1) both; }
  .anim-count { animation: slideUp 0.4s 0.1s cubic-bezier(0.16,1,0.3,1) both; }
  /* ─── SKELETON LOADERS ────────────────────────────────────────────── */
  .skeleton { background: linear-gradient(90deg, var(--card) 25%, var(--card2) 50%, var(--card) 75%); background-size:200% 100%; animation: shimmer 1.5s infinite; border-radius:6px; }
  .skeleton-text { height:12px; border-radius:4px; }
  .skeleton-title { height:20px; border-radius:6px; }
  .skeleton-card { border-radius:var(--radius); padding:24px; background:var(--card); border:1px solid var(--border); margin-bottom:12px; }
  /* ─── INTERACTIVE STATES ──────────────────────────────────────────── */
  .card-interactive:hover { border-color:var(--border2); background:var(--card2); transform:translateY(-1px); box-shadow:0 8px 24px rgba(0,0,0,0.2); }
  button:active { transform:scale(0.97); }
  /* ─── SCORE COMPONENTS ────────────────────────────────────────────── */
  .score-card { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:20px; text-align:center; transition:all 0.2s ease; position:relative; overflow:hidden; }
  .score-card::after { content:''; position:absolute; bottom:0; left:0; right:0; height:3px; background:var(--score-color, var(--amber)); border-radius:0 0 14px 14px; }
  .score-card:hover { border-color:var(--border2); transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,0.25); }
  .score-value { font-family:'Syne',sans-serif; font-size:38px; font-weight:900; line-height:1; }
  .score-label { font-family:'JetBrains Mono',monospace; font-size:8px; letter-spacing:2.5px; color:var(--text-dim); margin:5px 0 3px; text-transform:uppercase; }
  .score-sub { font-size:11px; font-weight:600; color:var(--text-muted); }
  /* ─── SECTION HEADERS ─────────────────────────────────────────────── */
  .section-header { display:flex; align-items:center; gap:10px; font-family:'JetBrains Mono',monospace; font-size:9px; letter-spacing:2.5px; color:var(--amber); text-transform:uppercase; margin-bottom:14px; }
  .section-header::after { content:''; flex:1; height:1px; background:var(--border); }
  /* ─── GAP CARDS ───────────────────────────────────────────────────── */
  .gap-card { background:var(--card); border:1px solid var(--border); border-left:3px solid var(--gap-color,var(--red)); border-radius:0 10px 10px 0; padding:14px; transition:all 0.2s; }
  .gap-card:hover { background:var(--card2); }
  .gap-label { font-family:'JetBrains Mono',monospace; font-size:8px; letter-spacing:2px; text-transform:uppercase; margin-bottom:5px; }
  .gap-action { font-size:12px; color:var(--text-muted); line-height:1.5; }
  /* ─── PAIN ROWS ───────────────────────────────────────────────────── */
  .pain-row { display:flex; gap:12px; align-items:flex-start; padding:12px 0; border-bottom:1px solid var(--border); transition:all 0.15s; border-radius:8px; }
  .pain-row:last-child { border-bottom:none; }
  .pain-row:hover { background:var(--card2); padding-left:8px; }
  .pain-title { font-size:13px; font-weight:600; color:var(--text); margin-bottom:3px; }
  .pain-impact { font-size:12px; color:var(--text-muted); }
  /* ─── ACTION ITEMS ────────────────────────────────────────────────── */
  .action-item { display:flex; gap:16px; align-items:flex-start; padding:16px 0; border-bottom:1px solid var(--border); transition:all 0.2s; border-radius:8px; }
  .action-item:last-child { border-bottom:none; }
  .action-item:hover { background:var(--card2); padding-left:8px; }
  .action-number { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif; font-size:14px; font-weight:900; flex-shrink:0; transition:transform 0.2s; }
  .action-item:hover .action-number { transform:scale(1.1); }
  .action-title { font-size:13px; font-weight:700; color:var(--text); margin-bottom:4px; }
  .action-why { font-size:12px; color:var(--text-muted); margin-bottom:5px; }
  /* ─── EMPTY STATES ────────────────────────────────────────────────── */
  .empty-state { text-align:center; padding:48px 24px; }
  .empty-state-icon { font-size:44px; margin-bottom:16px; opacity:0.6; }
  .empty-state-title { font-family:'Syne',sans-serif; font-size:18px; font-weight:800; color:var(--amber); margin-bottom:8px; }
  .empty-state-desc { font-size:13px; color:var(--text-muted); max-width:380px; margin:0 auto 24px; line-height:1.7; }
  /* ─── INLINE SECTION ──────────────────────────────────────────────── */
  .inline-section { border-top:1px solid var(--border); padding-top:24px; margin-top:8px; margin-bottom:24px; }
  .inline-section:last-child { margin-bottom:0; }
  /* ─── MEDDPICC COMPACT ────────────────────────────────────────────── */
  .medd-compact-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
  @media (max-width:768px) { .medd-compact-grid { grid-template-columns:repeat(2,1fr); } }
  /* ─── PERSON CARD ─────────────────────────────────────────────────── */
  .person-card { display:flex; gap:14px; align-items:flex-start; padding:16px; background:var(--card); border:1px solid var(--border); border-radius:12px; transition:all 0.2s; margin-bottom:8px; }
  .person-card:hover { border-color:var(--border2); background:var(--card2); }
  /* ─── COMPETE ─────────────────────────────────────────────────────── */
  .compete-vs { display:flex; gap:4px; align-items:stretch; margin-bottom:16px; border-radius:12px; overflow:hidden; }
  .compete-win { flex:1; background:var(--green-dim); border:1px solid rgba(16,185,129,0.2); padding:16px; }
  .compete-lose { flex:1; background:var(--red-dim); border:1px solid rgba(239,68,68,0.2); padding:16px; }
  .compete-label { font-family:'JetBrains Mono',monospace; font-size:8px; letter-spacing:2px; text-transform:uppercase; margin-bottom:10px; font-weight:700; }
  /* ─── INPUT GROUPS ────────────────────────────────────────────────── */
  .input-group { margin-bottom:14px; }
  .input-label { font-family:'JetBrains Mono',monospace; font-size:9px; color:var(--text-dim); letter-spacing:2px; display:block; margin-bottom:7px; text-transform:uppercase; }
  /* ─── MEETING TYPES ───────────────────────────────────────────────── */
  .meeting-types { display:flex; gap:6px; flex-wrap:wrap; }
  .meeting-type-btn { padding:7px 12px; border-radius:8px; border:1px solid var(--border); font-size:11px; font-weight:600; cursor:pointer; transition:all 0.15s; background:transparent; color:var(--text-muted); }
  .meeting-type-btn:hover { border-color:var(--border2); color:var(--text); }
  .meeting-type-btn.active { border-color:rgba(245,158,11,0.4); background:var(--amber-glow); color:var(--amber); }
  /* ─── LANG PILLS ──────────────────────────────────────────────────── */
  .lang-pills { display:flex; gap:5px; flex-wrap:wrap; }
  .lang-pill { padding:5px 11px; border-radius:20px; border:1px solid var(--border); font-size:11px; font-weight:600; cursor:pointer; transition:all 0.15s; background:transparent; color:var(--text-muted); white-space:nowrap; }
  .lang-pill:hover { border-color:var(--border2); color:var(--text); }
  .lang-pill.active { border-color:rgba(245,158,11,0.4); background:var(--amber-glow); color:var(--amber); }
  .lang-pill.done { border-color:rgba(16,185,129,0.3); color:var(--green); }
  /* ─── ROI METRICS ─────────────────────────────────────────────────── */
  .roi-metric { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:18px; text-align:center; transition:all 0.2s; }
  .roi-metric:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,0.2); }
  .roi-value { font-family:'Syne',sans-serif; font-size:26px; font-weight:900; line-height:1; margin-bottom:5px; }
  .roi-label { font-family:'JetBrains Mono',monospace; font-size:8px; letter-spacing:2px; color:var(--text-dim); text-transform:uppercase; }
  /* ─── GEN BUTTONS ─────────────────────────────────────────────────── */
  .gen-btn { background:var(--card); border:1px solid var(--border); border-radius:10px; padding:11px 20px; color:var(--text-muted); font-size:13px; font-weight:600; cursor:pointer; transition:all 0.2s; display:inline-flex; align-items:center; gap:8px; }
  .gen-btn:hover { border-color:var(--border2); color:var(--text); background:var(--card2); transform:translateY(-1px); }
  .gen-btn:disabled { opacity:0.45; cursor:not-allowed; transform:none; }
  /* ─── PROGRESS TRACK ──────────────────────────────────────────────── */
  .progress-track { height:4px; background:var(--border); border-radius:2px; overflow:hidden; margin-top:8px; }
  .progress-fill-anim { height:100%; border-radius:2px; animation:barGrow 1.2s cubic-bezier(0.16,1,0.3,1) forwards; }
  /* ─── TOUCH TARGETS ───────────────────────────────────────────────── */
  @media (max-width:768px) { button, .tab, .lang-pill, .meeting-type-btn { min-height:44px; } }
  /* ─── SCROLLBARS ──────────────────────────────────────────────────── */
  ::-webkit-scrollbar { width:4px; height:4px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:var(--border2); border-radius:2px; }
  /* ─── FOCUS ───────────────────────────────────────────────────────── */
  *:focus-visible { outline:2px solid var(--amber); outline-offset:2px; border-radius:4px; }

  .light-mode .tab.active { background: white; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
  .light-mode .email-box { background: white; }
  .light-mode .email-header { background: #F8FAFC; }
  .light-mode .com-before { background: rgba(239,68,68,0.05); }
  .light-mode .com-after { background: rgba(16,185,129,0.05); }
`

// ─── SMALL HELPERS ────────────────────────────────────────────────────────────
const statusClass = s => s === "green" ? "green" : s === "amber" ? "amber" : "red";
const statusLabel = s => s === "green" ? "CONFIRMED" : s === "amber" ? "PARTIAL" : "UNKNOWN";
const urgencyColor = u => u === "high" ? "tag-red" : u === "medium" ? "tag-amber" : "tag-dim";
const accessLabel = s => s === "engaged" ? "ENGAGED" : s === "not-engaged" ? "NOT ENGAGED" : "UNKNOWN";
const accessClass = s => s === "engaged" ? "tag-green" : s === "not-engaged" ? "tag-red" : "tag-dim";
const archetypeColors = { "Economic Buyer": "tag-amber", "Champion": "tag-green", "Technical Evaluator": "tag-blue", "Procurement / Gatekeeper": "tag-dim", "End User": "tag-dim" };

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return <button className={`copy-btn ${copied ? "copied" : ""}`} onClick={copy}>{copied ? "✓ COPIED" : "COPY"}</button>;
}

function formatChatText(text) {
  if (!text) return null;
  return text.split("\n").map((line, i) => {
    if (!line.trim()) return <br key={i} />;
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return <div key={i} style={{ marginBottom: 2 }}>{parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color: "#FDE68A" }}>{p}</strong> : p)}</div>;
  });
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function SalesIntelligenceAgent() {
  const [step, setStep] = useState(1); // 1=company, 2=context, 3=analyzing, 4=results
  const [analyzeStep, setAnalyzeStep] = useState(0);
  const [form, setForm] = useState({
    company: "", website: "", market: "", industry: "",
    product: "", productDesc: "", dealStage: "", dealSize: "",
    knownContacts: "", recentNews: "", competitorsMentioned: "",
  });
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("brief");
  const [dealHistory, setDealHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("apac_deal_history") || "[]"); } catch { return []; }
  });
  const [showHistory, setShowHistory] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("bahasa");
  const [emailTone, setEmailTone] = useState("formal");
  const [transcript, setTranscript] = useState("");
  const [transcriptResult, setTranscriptResult] = useState(null);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [roiInputs, setRoiInputs] = useState({ employees: "", avgSalary: "", hoursPerWeek: "", currentErrors: "", dealSize: "" });
  const [emailData, setEmailData] = useState(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [orgChart, setOrgChart] = useState(null);
  const [orgLoading, setOrgLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [roiResult, setRoiResult] = useState(null);
  const [roiResearch, setRoiResearch] = useState(null);
  const [roiResearchLoading, setRoiResearchLoading] = useState(false);
  // Meeting Prep
  const [meetingInputs, setMeetingInputs] = useState({ personName: "", personRole: "", meetingType: "discovery", additionalContext: "" });
  const [meetingPrep, setMeetingPrep] = useState(null);
  const [meetingPrepLoading, setMeetingPrepLoading] = useState(false);
  // Executive Brief
  const [execBrief, setExecBrief] = useState(null);
  const [execBriefLoading, setExecBriefLoading] = useState(false);
  const [linkedInVariant, setLinkedInVariant] = useState(0);
  const [battleCards, setBattleCards] = useState(null);
  const [battleLoading, setBattleLoading] = useState(false);
  const [langData, setLangData] = useState(null);
  const [langLoading, setLangLoading] = useState(false);
  const [liVariants, setLiVariants] = useState(null);
  const [liVariantsLoading, setLiVariantsLoading] = useState(false);
  const [expandedMedd, setExpandedMedd] = useState(null);
  const [meddQual, setMeddQual] = useState({
    budgetConfirmed: "",
    ebIdentified: "",
    timelineDefined: "",
    competitorsKnown: "",
    painQuantified: "",
  });
  const [customIndustry, setCustomIndustry] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const progress = step === 1 ? 25 : step === 2 ? 50 : step === 3 ? 75 : 100;
  const canProceed1 = form.company && form.market && form.industry;
  const canProceed2 = form.product && form.dealStage;

  useEffect(() => { chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages, chatLoading]);

  // ── Analysis ───────────────────────────────────────────────────────────────
  const ANALYZE_STEPS = [
    { icon: "🔍", text: "Researching account profile & market context" },
    { icon: "📊", text: "Scoring ICP fit & identifying trigger events" },
    { icon: "🎯", text: "Running MEDDPICC diagnostic" },
    { icon: "👥", text: "Mapping buying committee & stakeholders" },
    { icon: "✍️", text: "Generating personalised outreach sequences" },
    { icon: "💬", text: "Building discovery question bank" },
    { icon: "🏆", text: "Applying Command of the Message framework" },
  ];

  const runAnalysis = useCallback(async () => {
    setStep(3);
    setAnalyzeStep(0);
    const ticker = setInterval(() => setAnalyzeStep(s => Math.min(s + 1, ANALYZE_STEPS.length - 1)), 900);
    try {
      // Live web search for company intel
      let liveIntel = "";
      try {
        setAnalyzeStep(0);
        const rawIntel = await Promise.race([
          searchCompanyIntel(form.company, form.market, form.industry),
          new Promise(r => setTimeout(() => r(""), 20000))
        ]); liveIntel = rawIntel.replace(/`/g, "'").replace(/\\/g, " ");
      } catch(e) {}

      const prompt = `Analyse this account and deal situation:

COMPANY: ${form.company}
WEBSITE: ${form.website || "Not provided"}
MARKET: ${form.market}
INDUSTRY: ${form.industry}
PRODUCT BEING SOLD: ${form.product}
PRODUCT DESCRIPTION: ${form.productDesc || "Not provided"}
DEAL STAGE: ${form.dealStage}
DEAL SIZE TARGET: ${form.dealSize || "Not specified"}
KNOWN CONTACTS: ${form.knownContacts || "None provided"}
RECENT NEWS / CONTEXT: ${form.recentNews || "None provided"}
COMPETITORS MENTIONED: ${form.competitorsMentioned || "None known"}
EMAIL TONE PREFERENCE: ${emailTone.toUpperCase()} — ${emailTone === "formal" ? "Professional, structured, compliance-aware. Appropriate for banking, government, large enterprises." : emailTone === "warm" ? "Conversational, human, relationship-first. Appropriate for tech companies, startups, innovation teams." : "Blunt, direct, ROI-focused. Appropriate for C-suite, economic buyers, time-poor executives."}
INDUSTRY CONTEXT: ${form.industry === "Other" ? customIndustry : form.industry}

MEDDPICC PRE-QUALIFICATION (use these to calibrate MEDDPICC scores):
- Budget confirmed: ${meddQual.budgetConfirmed || "Unknown"}
- Economic Buyer identified: ${meddQual.ebIdentified || "Unknown"}
- Timeline/compelling event: ${meddQual.timelineDefined || "Unknown"}
- Competitors known: ${meddQual.competitorsKnown || "Unknown"}
- Pain quantified in dollars: ${meddQual.painQuantified || "Unknown"}
${liveIntel ? `
LIVE MARKET INTELLIGENCE (from real-time web search — use this to enrich the brief):
${liveIntel}
` : ""}
Generate the complete 7-module intelligence brief as specified. Where live intelligence is provided above, incorporate specific recent facts, dates, and events into the brief — especially in keyTriggers, whyNow, and painPoints.`;

      // CALL 1: Brief + MEDDPICC + Stakeholders
      const streamCall = async (userPrompt, systemPrompt, model = "claude-sonnet-4-20250514") => {
        const r = await fetch("/api/anthropic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: model,
            max_tokens: 8000,
            stream: true,
            system: systemPrompt,
            messages: [{ role: "user", content: userPrompt }],
          }),
        });
        if (!r.ok) throw new Error(`API error: ${r.status}`);
        const reader = r.body.getReader();
        const decoder = new TextDecoder();
        let text = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split("\n")) {
            if (line.startsWith("data: ")) {
              try {
                const evt = JSON.parse(line.slice(6).trim());
                if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") text += evt.delta.text;
              } catch(e) {}
            }
          }
        }
        // Strip markdown code fences
        let clean = text.trim();
        if (clean.startsWith("```")) {
          clean = clean.replace(/^```[a-z]*\s*/i, "").replace(/\s*```\s*$/,"");
        }
        // Sanitize common JSON breaking chars
        clean = clean.replace(/[\u0000-\u001F]/g, " ");
        const s1 = clean.indexOf("{");
        // Find the end of the FIRST complete JSON object
        let depth = 0, e1 = -1;
        for (let ci = s1; ci < clean.length; ci++) {
          if (clean[ci] === "{") depth++;
          else if (clean[ci] === "}") { depth--; if (depth === 0) { e1 = ci; break; } }
        }
        if (s1 !== -1 && e1 !== -1) clean = clean.slice(s1, e1 + 1);
        try {
          try {
            return JSON.parse(clean);
          } catch(e) {
            // Repair truncated JSON
            let fixed = clean;
            const opens = (fixed.match(/{/g)||[]).length - (fixed.match(/}/g)||[]).length;
            const openArr = (fixed.match(/\[/g)||[]).length - (fixed.match(/\]/g)||[]).length;
            // Remove trailing incomplete property
            fixed = fixed.replace(/,\s*"[^"]*"\s*:\s*[^,}\]]*$/, '');
            fixed = fixed.replace(/,\s*"[^"]*"\s*$/, '');
            for(let j=0;j<openArr;j++) fixed += "]";
            for(let j=0;j<opens;j++) fixed += "}";
            return JSON.parse(fixed);
          }
        } catch(e) {
          // Retry with aggressive sanitization + bad property removal
          let safe = clean.replace(/[\u0000-\u001F]/g, " ");
          // Remove malformed properties: "key": value where value is broken
          safe = safe.replace(/,\s*"[^"\n]{0,50}"\s*:\s*(?=[,}\]])/g, '');
          // Remove trailing comma before closing brace/bracket
          safe = safe.replace(/,\s*([}\]])/g, '$1');
          try { return JSON.parse(safe); } catch(e2) {
            // Last resort: return empty object so app doesn't crash
            throw new Error("JSON parse failed after all repairs: " + e.message);
          }
        }
      };

      const sys1 = `You are the Global Enterprise SaaS Sales Intelligence Engine trained on Ankur Sehgal's methodologies: 15 years enterprise SaaS globally, 7x President's Club. Return ONLY valid JSON with exactly these 4 keys:
{"accountBrief":{"icpScore":87,"icpRating":"Strong Fit","tier":"Tier 1","dealPotential":"$200K ACV","companyProfile":"...","whyNow":"...","keyTriggers":["..."],"painPoints":[{"pain":"...","businessImpact":"...","urgency":"high"}],"buyingCulture":"...","marketContext":"..."},"meddpicc":{"overallHealth":"amber","forecastCategory":"Pipeline","elements":{"metrics":{"status":"red","label":"Metrics","description":"...","evidence":"...","nextAction":"...","questions":["..."]},"economicBuyer":{"status":"amber","label":"Economic Buyer","description":"...","evidence":"...","nextAction":"...","questions":["..."]},"decisionCriteria":{"status":"green","label":"Decision Criteria","description":"...","evidence":"...","nextAction":"...","questions":["..."]},"decisionProcess":{"status":"red","label":"Decision Process","description":"...","evidence":"...","nextAction":"...","questions":["..."]},"paperProcess":{"status":"red","label":"Paper Process","description":"...","evidence":"...","nextAction":"...","questions":["..."]},"identifiedPain":{"status":"green","label":"Identified Pain","description":"...","evidence":"...","nextAction":"...","questions":["..."]},"champion":{"status":"amber","label":"Champion","description":"...","evidence":"...","nextAction":"...","questions":["..."]},"competition":{"status":"amber","label":"Competition","description":"...","evidence":"...","nextAction":"...","questions":["..."]}},"dealRisks":["..."],"winConditions":["..."]},"stakeholders":{"buyingCommittee":[{"role":"CFO","archetype":"Economic Buyer","priority":1,"accessStatus":"not-engaged","motivations":"...","fears":"...","engagementStrategy":"...","talkTrack":"...","warningSign":"..."}],"championDevelopmentScore":45,"championGaps":["..."],"multithreadingStatus":"..."}}`;
      const sys2 = `You are the Global Enterprise SaaS Sales Intelligence Engine trained on Ankur Sehgal's methodologies: 15 years enterprise SaaS globally, 7x President's Club. Return ONLY valid JSON with exactly these 3 keys:
{"outreach":{"coldEmail":{"subject":"...","preheader":"...","body":"150-200 word email","followUp1":{"dayToSend":5,"subject":"...","body":"..."},"followUp2":{"dayToSend":12,"subject":"...","body":"..."}},"linkedInMessage":"under 300 chars","executiveReferral":"...","sendingTips":["..."]},"discoveryQuestions":{"openingFramer":"...","categories":[{"category":"Current State","questions":[{"question":"...","intent":"...","followUp":"..."}]}],"redFlags":["..."],"idealCallOutcome":"..."},"commandOfMessage":{"salesStage":"Evaluation","stageRationale":"...","beforeScenario":"...","afterScenario":"...","requiredCapabilities":[{"capability":"...","proofPoint":"..."}],"uniqueDifferentiators":["..."],"valueDrivers":[{"driver":"Cost Reduction","specifics":"...","estimatedImpact":"$X"}],"objectionHandlers":[{"objection":"...","response":"..."}],"closingHypothesis":"..."},"nextBestActions":[{"priority":1,"action":"...","why":"...","timeframe":"This week"},{"priority":2,"action":"...","why":"...","timeframe":"Next 2 weeks"},{"priority":3,"action":"...","why":"...","timeframe":"This month"}]}`;

      setAnalyzeStep(4);
      const sys3 = `You are the Global Enterprise SaaS Sales Intelligence Engine. Return ONLY valid JSON with exactly this 1 key: {"commandOfMessage":{"salesStage":"Evaluation","stageRationale":"...","beforeScenario":"...","afterScenario":"...","requiredCapabilities":[{"capability":"...","proofPoint":"..."}],"uniqueDifferentiators":["..."],"valueDrivers":[{"driver":"Cost Reduction","specifics":"...","estimatedImpact":"$X"}],"objectionHandlers":[{"objection":"...","response":"..."}],"closingHypothesis":"..."}}`;
      const sys4 = `You are the Global Enterprise SaaS Sales Intelligence Engine. Return ONLY valid JSON with exactly this 1 key: {"nextBestActions":[{"priority":1,"action":"Most critical action","why":"Why this is #1","timeframe":"This week"},{"priority":2,"action":"Action 2","why":"Why","timeframe":"Next 2 weeks"},{"priority":3,"action":"Action 3","why":"Why","timeframe":"This month"}]} Be specific to the deal.`;
      // Retry wrapper for reliability
      const reliableCall = async (p, s, retries=2) => {
        for (let i=0; i<retries; i++) {
          try { return await streamCall(p, s); } catch(e) {
            if (i===retries-1) throw e;
            await new Promise(r => setTimeout(r, 1000));
          }
        }
      };
      const [part1, part2, part3, part4] = await Promise.all([
        reliableCall(prompt, sys1),
        reliableCall(prompt, sys2),
        reliableCall(prompt, sys3),
        reliableCall(prompt, sys4),
      ]);
      const dq = part2.discoveryQuestions || {};
      if (part2.redFlags) dq.redFlags = part2.redFlags;
      if (part2.idealCallOutcome) dq.idealCallOutcome = part2.idealCallOutcome;
      part2.discoveryQuestions = dq;
      const parsed = { ...part1, ...part2, ...part3, ...part4 };
      clearInterval(ticker);
      setResult(parsed);
      // Save to deal history
      const historyEntry = {
        id: Date.now(),
        company: form.company,
        market: form.market,
        industry: form.industry,
        dealStage: form.dealStage,
        dealSize: form.dealSize,
        icpScore: parsed.accountBrief?.icpScore,
        dealHealth: parsed.meddpicc?.overallHealth,
        dealPotential: parsed.accountBrief?.dealPotential,
        date: new Date().toLocaleDateString("en-SG", {day:"numeric",month:"short",year:"numeric"}),
        result: parsed,
        form: {...form}
      };
      const updated = [historyEntry, ...dealHistory].slice(0, 20);
      setDealHistory(updated);
      try { localStorage.setItem("apac_deal_history", JSON.stringify(updated)); } catch(e) {}
      setStep(4);
      setActiveTab("brief");
      // Prime deal coach
      setChatMessages([{
        role: "assistant",
        content: `I've completed the full intelligence brief for **${form.company}** in ${form.market}.\n\nICP Score: **${parsed.accountBrief?.icpScore}/100** · Deal Health: **${parsed.meddpicc?.overallHealth?.toUpperCase()}** · Stage: **${parsed.commandOfMessage?.salesStage}**\n\nWhat would you like to work through? I can help you:\n• Diagnose the biggest deal risk right now\n• Build a plan to access the economic buyer\n• Develop your champion\n• Prepare for your next call\n• Role-play a specific conversation\n\nWhat's most pressing?`
      }]);
    } catch (e) {
      clearInterval(ticker);
      setStep(2);
      alert("Analysis failed: " + e.message);
    }
  }, [form, emailTone, meddQual, customIndustry]); // useCallback

  // ── Chat ───────────────────────────────────────────────────────────────────
  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    setChatInput("");
    const updated = [...chatMessages, { role: "user", content: msg }];
    setChatMessages(updated);
    setChatLoading(true);

    const context = result ? `
Account: ${form.company} | Market: ${form.market} | Industry: ${form.industry}
Product: ${form.product} | Stage: ${form.dealStage}
ICP Score: ${result.accountBrief?.icpScore}/100
Deal Health: ${result.meddpicc?.overallHealth}
Sales Stage: ${result.commandOfMessage?.salesStage}
Key Pains: ${result.accountBrief?.painPoints?.map(p => p.pain).join("; ")}
MEDDPICC gaps: ${Object.entries(result.meddpicc?.elements || {}).filter(([, v]) => v.status !== "green").map(([k]) => k).join(", ")}
` : "";

    const sysPrompt = `You are Ankur Sehgal — 15-year APAC enterprise SaaS veteran, 7x President's Club, $25M ARR. You're coaching this rep on their live deal. Be direct, specific, commercially sharp. Reference the deal context. Generate scripts, talk tracks, emails on demand. Deal context: ${context}`;

    try {
      const res = await fetch("/api/anthropic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 8000,
          system: sysPrompt,
          messages: updated.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.map(b => b.text || "").join("") || "";
      setChatMessages([...updated, { role: "assistant", content: reply }]);
    } catch {
      setChatMessages([...updated, { role: "assistant", content: "Something went wrong. Try again." }]);
    }
    setChatLoading(false);
  };

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{CSS}</style>
      <div className={darkMode ? "app" : "app light-mode"}>
        {/* Header */}
        <header className="header">
          <div className="header-inner">
            <div className="logo">
              <div className="logo-icon">🎯</div>
              <div>
                <div className="logo-text">Sales Intelligence</div>
                <div className="logo-sub">ANKUR SEHGAL · 7X PRESIDENT'S CLUB</div>
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <button onClick={() => setDarkMode(!darkMode)} style={{ background:"transparent", border:"1px solid var(--border)", borderRadius:8, padding:"6px 12px", color:"var(--text-muted)", fontSize:14, cursor:"pointer" }}>
                {darkMode ? "☀️" : "🌙"}
              </button>
              {dealHistory.length > 0 && (
                <button onClick={() => setShowHistory(!showHistory)} style={{ background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.3)", borderRadius:8, padding:"6px 14px", color:"var(--amber)", fontSize:12, fontWeight:700, cursor:"pointer", letterSpacing:1 }}>
                  📋 HISTORY ({dealHistory.length})
                </button>
              )}
            </div>
            <div style={{ display:"none" }}>
              </div>
            </div>
            <div className="header-badge">POWERED BY CLAUDE AI</div>
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
        </header>

        <div className="main">
          {/* Step indicator */}
          {step < 4 && (
            <div className="steps fade-up">
              {[["01", "Company"], ["02", "Context"], ["03", "Analyse"], ["04", "Brief"]].map(([num, label], i) => {
                const s = i + 1;
                const cls = step > s ? "done" : step === s ? "active" : "pending";
                return (
                  <div className="step-item" key={num}>
                    <div className={`step-dot ${cls}`}>{step > s ? "✓" : num}</div>
                    <div className={`step-label ${step === s ? "active" : ""}`}>{label}</div>
                    {i < 3 && <div className="step-connector" />}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── STEP 1: COMPANY ── */}
          {/* ── DEAL HISTORY PANEL ── */}
      {showHistory && (
        <div style={{ position:"fixed", top:0, right:0, width:420, height:"100vh", background:"var(--card)", borderLeft:"1px solid var(--border)", zIndex:1000, overflowY:"auto", padding:24 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:900, color:"var(--amber)" }}>Deal History</div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => { setDealHistory([]); try { localStorage.removeItem("apac_deal_history"); } catch(e) {} }} style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:6, padding:"4px 10px", color:"#EF4444", fontSize:11, fontWeight:700, cursor:"pointer" }}>CLEAR ALL</button>
              <button onClick={() => setShowHistory(false)} style={{ background:"transparent", border:"1px solid var(--border)", borderRadius:6, padding:"4px 10px", color:"var(--text-muted)", fontSize:11, cursor:"pointer" }}>CLOSE</button>
            </div>
          </div>
          {dealHistory.map((h, i) => {
            const hc = h.dealHealth === "green" ? "#10B981" : h.dealHealth === "amber" ? "#F59E0B" : "#EF4444";
            return (
              <div key={h.id} style={{ background:"var(--bg)", border:"1px solid var(--border)", borderRadius:10, padding:16, marginBottom:12, cursor:"pointer" }}
                onClick={() => { setResult(h.result); setForm(h.form); setStep(4); setShowHistory(false); setActiveTab("brief"); }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:800, color:"var(--text)" }}>{h.company}</div>
                  <div style={{ width:10, height:10, borderRadius:"50%", background:hc, marginTop:3 }}></div>
                </div>
                <div style={{ fontSize:11, color:"var(--text-muted)", marginBottom:6 }}>{h.market} · {h.industry}</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  <span style={{ fontSize:11, background:"rgba(245,158,11,0.1)", color:"var(--amber)", borderRadius:4, padding:"2px 8px", fontWeight:700 }}>ICP {h.icpScore}/100</span>
                  <span style={{ fontSize:11, background:"rgba(26,86,219,0.1)", color:"var(--blue-light)", borderRadius:4, padding:"2px 8px" }}>{h.dealPotential}</span>
                  <span style={{ fontSize:11, color:"var(--text-muted)", borderRadius:4, padding:"2px 8px", border:"1px solid var(--border)" }}>{h.dealStage?.split(" — ")[0]}</span>
                </div>
                <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:8 }}>{h.date}</div>
              </div>
            );
          })}
        </div>
      )}

      {step === 1 && (
            <div>
              <div style={{ marginBottom: 32 }} className="fade-up-1">
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 30, fontWeight: 800, color: "white", marginBottom: 8 }}>Who are you targeting?</h1>
                <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6 }}>Start with the company. The more you give, the sharper the intelligence.</p>
              </div>

              <div className="card fade-up-2">
                <div className="card-title">TARGET ACCOUNT</div>
                <div className="field">
                  <label className="field-label">COMPANY NAME <span>*</span></label>
                  <input type="text" value={form.company} onChange={e => set("company", e.target.value)}
                    placeholder="e.g. OCBC Bank, Petronas, Axiata Group, BDO Unibank..." />
                </div>
                <div className="grid-2">
                  <div className="field">
                    <label className="field-label">WEBSITE / LINKEDIN</label>
                    <input type="text" value={form.website} onChange={e => set("website", e.target.value)} placeholder="ocbc.com or linkedin.com/company/ocbc" />
                  </div>
                  <div className="field">
                    <label className="field-label">PRIMARY MARKET <span>*</span></label>
                    <select value={form.market} onChange={e => set("market", e.target.value)}>
                      <option value="">Select market...</option>
                      {MARKETS.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label className="field-label">INDUSTRY <span>*</span></label>
                  <select value={form.industry} onChange={e => set("industry", e.target.value)}>
                    <option value="">Select industry...</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                  {form.industry === "Other" && (
                    <input type="text" placeholder="Describe your industry (e.g. PropTech, EdTech, AgriTech...)" value={customIndustry} onChange={e => setCustomIndustry(e.target.value)} style={{ width:"100%", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 12px", color:"var(--text)", fontSize:13, marginTop:8, boxSizing:"border-box" }} />
                  )}
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label className="field-label">RECENT NEWS OR CONTEXT <span style={{ color: "var(--text-faint)", fontWeight: 400 }}>(optional — improves accuracy)</span></label>
                  <textarea value={form.recentNews} onChange={e => set("recentNews", e.target.value)}
                    placeholder="e.g. New CFO appointed Jan 2025. Announced $2B digital transformation initiative. MAS issued new sustainability reporting guidelines. Recently acquired fintech subsidiary..." />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="btn-primary" onClick={() => setStep(2)} disabled={!canProceed1}>
                  Continue → Deal Context
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: CONTEXT ── */}
          {step === 2 && (
            <div>
              <div style={{ marginBottom: 32 }} className="fade-up-1">
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 30, fontWeight: 800, color: "white", marginBottom: 8 }}>What are you selling — and where does it stand?</h1>
                <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6 }}>Your product and deal stage shapes every recommendation. Be specific.</p>
              </div>

              <div className="card fade-up-2">
                <div className="card-title">YOUR PRODUCT</div>
                <div className="grid-2">
                  <div className="field">
                    <label className="field-label">PRODUCT CATEGORY <span>*</span></label>
                    <select value={form.product} onChange={e => set("product", e.target.value)}>
                      <option value="">Select product type...</option>
                      {PRODUCTS.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label className="field-label">TARGET DEAL SIZE</label>
                    <select value={form.dealSize} onChange={e => set("dealSize", e.target.value)}>
                      <option value="">Select range...</option>
                      {DEAL_SIZES.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label className="field-label">YOUR VALUE PROPOSITION <span style={{ color: "var(--text-faint)", fontWeight: 400 }}>(1-2 sentences)</span></label>
                  <textarea value={form.productDesc} onChange={e => set("productDesc", e.target.value)} style={{ minHeight: 60 }}
                    placeholder="What does your product do and what's the core outcome you deliver? e.g. We help Group Finance teams replace manual spreadsheet consolidation with a single connected platform for financial + ESG reporting..." />
                </div>
              </div>

              <div className="card fade-up-3">
                <div className="card-title">DEAL INTELLIGENCE</div>
                <div className="field">
                  <label className="field-label">CURRENT DEAL STAGE <span>*</span></label>
                  <select value={form.dealStage} onChange={e => set("dealStage", e.target.value)}>
                    <option value="">Where is this deal right now?</option>
                    {DEAL_STAGES.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">KNOWN CONTACTS AT THIS COMPANY</label>
                  <textarea value={form.knownContacts} onChange={e => set("knownContacts", e.target.value)} style={{ minHeight: 60 }}
                    placeholder="Who do you know there already? e.g. 'Sarah Chen — Head of Finance Transformation, met at a CFO summit. Seems interested but not sure she has budget authority.'" />
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <div style={{ marginBottom:20 }}>
                    <label className="field-label">EMAIL TONE</label>
                    <div style={{ display:"flex", gap:8, marginTop:6 }}>
                      {[["formal","Formal","Banking / Govt"],["warm","Warm","Tech / Startup"],["direct","Direct","C-Suite / EB"]].map(([t,label,sub]) => (
                        <button key={t} onClick={() => setEmailTone(t)} style={{ flex:1, padding:"10px 8px", borderRadius:8, border:"1px solid", cursor:"pointer", textAlign:"center",
                          borderColor: emailTone===t ? "var(--amber)" : "var(--border)",
                          background: emailTone===t ? "rgba(245,158,11,0.1)" : "transparent" }}>
                          <div style={{ fontSize:13, fontWeight:700, color: emailTone===t ? "var(--amber)" : "var(--text)" }}>{label}</div>
                          <div style={{ fontSize:10, color:"var(--text-muted)", marginTop:2 }}>{sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="field-label">COMPETITORS MENTIONED OR IN THE DEAL</label>
                  <input type="text" value={form.competitorsMentioned} onChange={e => set("competitorsMentioned", e.target.value)}
                    placeholder="e.g. SAP BPC, Oracle Hyperion, Workiva, Vena Solutions, or 'not known yet'" />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button className="btn-ghost" onClick={() => setStep(1)}>← Back</button>
                {/* MEDDPICC Pre-Qualifying Questions */}
                <div style={{ background:"rgba(26,86,219,0.06)", border:"1px solid rgba(26,86,219,0.2)", borderRadius:12, padding:20, marginBottom:20 }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:800, color:"var(--blue-light)", marginBottom:4, letterSpacing:1 }}>MEDDPICC CALIBRATION</div>
                  <div style={{ fontSize:11, color:"var(--text-muted)", marginBottom:16 }}>Answer to get more accurate MEDDPICC scoring. Skip any you don't know yet.</div>
                  {[
                    ["budgetConfirmed", "Budget confirmed or allocated?", "e.g. Yes - $500K approved / No / Under discussion"],
                    ["ebIdentified", "Economic Buyer identified?", "e.g. Yes - CFO John Smith / No / Suspected"],
                    ["timelineDefined", "Compelling event or deadline?", "e.g. Go-live by Q3 / Board approval by June / No deadline"],
                    ["competitorsKnown", "Competitors actively involved?", "e.g. SAP shortlisted / Oracle evaluated / None known"],
                    ["painQuantified", "Pain quantified in $ terms?", "e.g. $2M/year in manual costs / Not yet quantified"],
                  ].map(([key, label, ph]) => (
                    <div key={key} style={{ marginBottom:10 }}>
                      <div style={{ fontSize:10, fontWeight:700, color:"var(--text-muted)", letterSpacing:1, marginBottom:4 }}>{label.toUpperCase()}</div>
                      <input type="text" placeholder={ph} value={meddQual[key]} onChange={e => setMeddQual(p => ({...p, [key]: e.target.value}))}
                        style={{ width:"100%", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 12px", color:"var(--text)", fontSize:12, boxSizing:"border-box" }} />
                    </div>
                  ))}
                </div>
                <button className="btn-amber" onClick={runAnalysis} disabled={!canProceed2}>
                  🚀 Run Intelligence Analysis
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: ANALYZING ── */}
          {step === 3 && (
            <div className="analyzing">
              <div style={{ textAlign: "center" }}>
                <div className="pulse-ring" style={{ margin: "0 auto 8px" }}>
                  <span style={{ fontSize: 28 }}>🎯</span>
                </div>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: "white", marginBottom: 6 }}>
                  Analysing {form.company}
                </h2>
                <p style={{ fontSize: 13, color: "var(--text-dim)" }}>Applying 15 years of APAC enterprise SaaS expertise...</p>
              </div>
              <div className="analyze-steps">
                {ANALYZE_STEPS.map((s, i) => {
                  const state = i < analyzeStep ? "done" : i === analyzeStep ? "active" : "pending";
                  return (
                    <div key={i} className={`analyze-step ${state}`}>
                      <div className="analyze-step-icon">{state === "done" ? "✓" : s.icon}</div>
                      <div className="analyze-step-text">{s.text}</div>
                      {state === "active" && <div className="typing-dots"><div className="typing-dot"/><div className="typing-dot"/><div className="typing-dot"/></div>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── STEP 4: RESULTS ── */}
          {step === 4 && result && (
            <div className="fade-up">
              {/* Results header */}
              <div className="results-header">
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--amber)", letterSpacing: 3, marginBottom: 6 }}>INTELLIGENCE BRIEF READY</div>
                    <div className="company-title">{form.company}</div>
                    <div className="company-meta">
                      <span className="meta-chip tag-dim">{form.market}</span>
                      <span className="meta-chip tag-dim">{form.industry}</span>
                      {result.accountBrief?.tier && <span className="meta-chip tag-amber">{result.accountBrief.tier}</span>}
                      {result.meddpicc?.forecastCategory && <span className={`meta-chip tag-${statusClass(result.meddpicc.overallHealth)}`}>{result.meddpicc.forecastCategory}</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn-ghost" onClick={() => exportToPDF(result, form, meetingPrep, execBrief, meetingInputs)} style={{ display: "flex", alignItems: "center", gap: 6, borderColor: "var(--amber)", color: "var(--amber)" }}>
                      ⬇ Export PDF
                    </button>
                    <button className="btn-ghost" onClick={() => { setStep(1); setResult(null); setForm({ company:"",website:"",market:"",industry:"",product:"",productDesc:"",dealStage:"",dealSize:"",knownContacts:"",recentNews:"",competitorsMentioned:"" }); setChatMessages([]);
      setBattleCards(null); setLangData(null); setLiVariants(null); setEmailData(null); setOrgChart(null); setMeetingPrep(null); setExecBrief(null); }}>
                      + New Account
                    </button>
                  </div>
                </div>
              </div>

              {/* Stat strip */}
              {/* PDF Export Bar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, background: "var(--amber-glow)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12, padding: "12px 18px" }}>
                <div style={{ fontSize: 13, color: "var(--amber)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }}>📄 INTELLIGENCE BRIEF READY</div>
                <button
                  onClick={() => exportToPDF(result, form, meetingPrep, execBrief, meetingInputs)}
                  style={{ background: "linear-gradient(135deg, #F59E0B, #EA580C)", border: "none", borderRadius: 8, padding: "10px 20px", color: "#08111E", fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 16px rgba(245,158,11,0.4)" }}
                >
                  ⬇ Export PDF
                </button>
              </div>

              <div className="stat-grid fade-up-1">
                {[
                  { k: "ICP SCORE", v: `${result.accountBrief?.icpScore}/100` },
                  { k: "DEAL POTENTIAL", v: result.accountBrief?.dealPotential || result.accountBrief?.tier },
                  { k: "DEAL HEALTH", v: result.meddpicc?.overallHealth?.toUpperCase() },
                  { k: "SALES STAGE", v: result.commandOfMessage?.salesStage },
                ].map(({ k, v }) => (
                  <div className="stat-card" key={k}>
                    <div className="stat-value">{v}</div>
                    <div className="stat-key">{k}</div>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div className="tabs fade-up-2">
                {[
                  { id: "intel", label: "🎯 Deal Intel" },
                  { id: "people", label: "👥 People" },
                  { id: "outreach", label: "📣 Outreach" },
                  { id: "playbook", label: "🔍 Playbook" },
                  { id: "bizcase", label: "💼 Biz Case" },
                  { id: "coach", label: "🤖 Coach" },
                ].map(t => (
                  <button key={t.id} className={`tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* ── TAB: BRIEF ── */}
              {/* ═══ TAB: DEAL INTELLIGENCE ═══════════════════════════════ */}
              {activeTab === "intel" && (
                <div className="anim-slide-up">
                  {result.accountBrief ? (() => {
                    const ab = result.accountBrief;
                    const ds = calcDealScore(result, meddQual);
                    return (
                      <>
                        {/* Score Row */}
                        <div className="r-grid-4" style={{ marginBottom:20 }}>
                          {/* Deal Score */}
                          {ds && (
                            <div className="score-card anim-count" style={{ '--score-color': ds.color, '--score-pct': `${ds.score}%` }}>
                              <div className="score-value anim-count" style={{ color: ds.color }}>{ds.score}</div>
                              <div className="score-label">Deal Score</div>
                              <div className="score-sub" style={{ color: ds.color }}>{ds.rating}</div>
                              <div className="progress-track" style={{ marginTop:8 }}>
                                <div className="progress-fill-anim" style={{ width:`${ds.score}%`, background:ds.color, '--bar-width': `${ds.score}%` }}></div>
                              </div>
                            </div>
                          )}
                          {/* ICP */}
                          <div className="score-card anim-count" style={{ '--score-color':'var(--amber)', '--score-pct':`${ab.icpScore}%`, animationDelay:'0.05s' }}>
                            <div className="score-value" style={{ color:'var(--amber)' }}>{ab.icpScore}</div>
                            <div className="score-label">ICP Score</div>
                            <div className="score-sub">{ab.icpRating}</div>
                            <div className="progress-track">
                              <div className="progress-fill-anim" style={{ width:`${ab.icpScore}%`, background:'var(--amber)', '--bar-width':`${ab.icpScore}%`, animationDelay:'0.3s' }}></div>
                            </div>
                          </div>
                          {/* Tier */}
                          <div className="score-card anim-count" style={{ '--score-color':'var(--blue-light)', animationDelay:'0.1s' }}>
                            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:800, color:'var(--blue-light)', lineHeight:1.2 }}>{ab.tier}</div>
                            <div className="score-label">Account Tier</div>
                            <div className="score-sub">{ab.dealPotential}</div>
                          </div>
                          {/* Health */}
                          <div className="score-card anim-count" style={{ '--score-color': result.meddpicc?.overallHealth==='green'?'var(--green)':result.meddpicc?.overallHealth==='amber'?'var(--amber)':'var(--red)', animationDelay:'0.15s' }}>
                            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:800, color: result.meddpicc?.overallHealth==='green'?'var(--green)':result.meddpicc?.overallHealth==='amber'?'var(--amber)':'var(--red)', lineHeight:1.2 }}>{result.meddpicc?.overallHealth?.toUpperCase()}</div>
                            <div className="score-label">Deal Health</div>
                            <div className="score-sub">{result.meddpicc?.forecastCategory}</div>
                          </div>
                        </div>

                        {/* Top Gaps */}
                        {ds?.gaps?.length > 0 && (
                          <div className="card anim-slide-up-2" style={{ marginBottom:16, borderColor:'rgba(239,68,68,0.2)', background:'rgba(239,68,68,0.04)' }}>
                            <div className="section-header" style={{ color:'var(--red)' }}>⚠ Top Deal Risks — Fix These First</div>
                            <div className="r-grid-3">
                              {ds.gaps.map((g,i) => (
                                <div key={i} className="gap-card" style={{ '--gap-color': g.status==='red'?'var(--red)':'var(--amber)' }}>
                                  <div className="gap-label" style={{ color: g.status==='red'?'var(--red)':'var(--amber)' }}>{g.element}</div>
                                  <div className="gap-action">{g.nextAction}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Account Brief */}
                        <div className="card anim-slide-up-2">
                          <div className="card-title">Account Intelligence</div>
                          <p style={{ fontSize:14, color:'var(--text)', lineHeight:1.8, marginBottom:18 }}>{ab.companyProfile}</p>
                          <div className="r-grid-2" style={{ marginBottom:18 }}>
                            <div>
                              <div className="input-label">Why Now</div>
                              <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.7 }}>{ab.whyNow}</p>
                            </div>
                            <div>
                              <div className="input-label">Buying Culture</div>
                              <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.7 }}>{ab.buyingCulture}</p>
                            </div>
                          </div>
                          <div className="input-label" style={{ marginBottom:8 }}>Key Triggers</div>
                          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:18 }}>
                            {ab.keyTriggers?.map((t,i) => <span key={i} className="tag tag-amber">{t}</span>)}
                          </div>
                          <div className="input-label" style={{ marginBottom:4 }}>Pain Points</div>
                          {ab.painPoints?.map((p,i) => (
                            <div key={i} className="pain-row">
                              <span className={`tag ${p.urgency==='high'?'tag-red':p.urgency==='medium'?'tag-amber':'tag-dim'}`} style={{ minWidth:52, justifyContent:'center', marginTop:2, flexShrink:0 }}>{p.urgency?.toUpperCase()}</span>
                              <div>
                                <div className="pain-title">{p.pain}</div>
                                <div className="pain-impact">{p.businessImpact}</div>
                              </div>
                            </div>
                          ))}
                          {ab.marketContext && (
                            <div style={{ marginTop:16, padding:14, background:'rgba(96,165,250,0.06)', border:'1px solid rgba(96,165,250,0.15)', borderRadius:8 }}>
                              <div className="input-label" style={{ color:'var(--blue-light)', marginBottom:6 }}>Market Context</div>
                              <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.7 }}>{ab.marketContext}</p>
                            </div>
                          )}
                        </div>

                        {/* MEDDPICC Compact */}
                        {result.meddpicc && (
                          <div className="card anim-slide-up-3">
                            <div className="card-title">MEDDPICC Diagnostic</div>
                            <div className="medd-compact-grid" style={{ marginBottom:16 }}>
                              {Object.entries(result.meddpicc.elements || {}).map(([key, el]) => (
                                <div key={key} className={`medd-item ${expandedMedd===key?'expanded':''}`} onClick={() => setExpandedMedd(expandedMedd===key?null:key)}>
                                  <div className="medd-header">
                                    <span className="medd-name" style={{ fontSize:11 }}>{el.label}</span>
                                    <div className={`medd-status-dot ${el.status}`}></div>
                                  </div>
                                  <div className="medd-evidence" style={{ fontSize:11 }}>{el.description}</div>
                                  {expandedMedd===key && (
                                    <div className="medd-expanded">
                                      <div className="medd-next-action">→ {el.nextAction}</div>
                                      {el.questions?.map((q,i) => <div key={i} style={{ fontSize:11, color:'var(--blue-light)', marginBottom:3 }}>• {q}</div>)}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                            <div className="r-grid-2">
                              <div>
                                <div className="input-label" style={{ color:'var(--red)' }}>Deal Risks</div>
                                {result.meddpicc.dealRisks?.map((r,i) => <div key={i} style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>✗ {r}</div>)}
                              </div>
                              <div>
                                <div className="input-label" style={{ color:'var(--green)' }}>Win Conditions</div>
                                {result.meddpicc.winConditions?.map((w,i) => <div key={i} style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>✓ {w}</div>)}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Next Best Actions */}
                        {result.nextBestActions && (
                          <div className="card anim-slide-up-4">
                            <div className="card-title">Next Best Actions</div>
                            {(Array.isArray(result.nextBestActions)?result.nextBestActions:Object.values(result.nextBestActions||{})).map((a,i) => (
                              <div key={i} className="action-item">
                                <div className="action-number" style={{ background:i===0?'var(--amber)':i===1?'var(--blue)':'var(--slate2)', color:i===0?'var(--navy)':'white' }}>{a.priority}</div>
                                <div style={{ flex:1 }}>
                                  <div className="action-title">{a.action}</div>
                                  <div className="action-why">{a.why}</div>
                                  <span className="tag tag-amber" style={{ fontSize:9 }}>{a.timeframe}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })() : (
                    <div className="skeleton-card">
                      <div className="skeleton skeleton-title" style={{ width:'40%', marginBottom:16 }}></div>
                      <div className="skeleton skeleton-text" style={{ width:'100%', marginBottom:8 }}></div>
                      <div className="skeleton skeleton-text" style={{ width:'80%' }}></div>
                    </div>
                  )}
                </div>
              )}

              {/* ═══ TAB: PEOPLE & POWER ═══════════════════════════════════ */}
              {activeTab === "people" && (
                <div className="anim-slide-up">
                  {result.stakeholders ? (() => {
                    const st = result.stakeholders;
                    return (
                      <>
                        {/* Champion Score */}
                        <div className="r-grid-2" style={{ marginBottom:20 }}>
                          <div className="card">
                            <div className="card-title">Champion Score</div>
                            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:40, fontWeight:900, color:(st.championDevelopmentScore||0)>=70?'var(--green)':(st.championDevelopmentScore||0)>=40?'var(--amber)':'var(--red)' }} className="anim-count">{st.championDevelopmentScore||0}</div>
                              <div style={{ flex:1 }}>
                                <div className="progress-track"><div className="progress-fill-anim" style={{ width:`${st.championDevelopmentScore||0}%`, background:(st.championDevelopmentScore||0)>=70?'var(--green)':'var(--amber)' }}></div></div>
                                <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:8, lineHeight:1.5 }}>{st.multithreadingStatus}</p>
                              </div>
                            </div>
                          </div>
                          <div className="card">
                            <div className="card-title" style={{ color:'var(--red)' }}>Champion Gaps</div>
                            {st.championGaps?.map((g,i) => <div key={i} style={{ fontSize:12, color:'var(--text-muted)', marginBottom:6, paddingBottom:6, borderBottom:'1px solid var(--border)' }}>→ {g}</div>)}
                          </div>
                        </div>

                        {/* Buying Committee */}
                        <div className="stakeholder-grid" style={{ marginBottom:24 }}>
                          {st.buyingCommittee?.map((s,i) => (
                            <div key={i} className="stakeholder-card anim-slide-up" style={{ animationDelay:`${i*0.05}s` }}>
                              <div className="stakeholder-header">
                                <div>
                                  <div className="stakeholder-role">{s.role}</div>
                                  <div style={{ display:'flex', gap:6, marginTop:6, flexWrap:'wrap' }}>
                                    <span className="tag tag-blue">{s.archetype}</span>
                                    <span className={`tag ${s.accessStatus==='engaged'?'tag-green':s.accessStatus==='not-engaged'?'tag-red':'tag-dim'}`}>{s.accessStatus}</span>
                                  </div>
                                </div>
                                <span className="tag tag-dim">P{s.priority}</span>
                              </div>
                              <div className="stakeholder-body">
                                <div><div className="sf-label">Motivations</div><div className="sf-value">{s.motivations}</div></div>
                                <div><div className="sf-label">Fears</div><div className="sf-value">{s.fears}</div></div>
                                <div><div className="sf-label">Engagement</div><div className="sf-value">{s.engagementStrategy}</div></div>
                                <div><div className="sf-label">Warning Sign</div><div className="sf-value">{s.warningSign}</div></div>
                              </div>
                              {s.talkTrack && <div className="talk-track">"{s.talkTrack}"</div>}
                            </div>
                          ))}
                        </div>

                        {/* Org Chart */}
                        <div className="inline-section">
                          <div className="section-header">🏢 Org Chart</div>
                          {!orgChart ? (
                            <button className="gen-btn" onClick={() => generateOrgChart(form.company, form.market, form.industry, result, setOrgChart, setOrgLoading)} disabled={orgLoading}>
                              {orgLoading ? '⏳ Researching...' : '🏢 Generate Org Chart'}
                            </button>
                          ) : (
                            <div className="card anim-scale-in">
                              {orgChart.emailPattern && <div style={{ fontSize:12, color:'var(--blue-light)', fontFamily:'monospace', marginBottom:12, padding:'8px 12px', background:'rgba(96,165,250,0.08)', borderRadius:6 }}>Email pattern: {orgChart.emailPattern}</div>}
                              {orgChart.reportingStructure && <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:14, lineHeight:1.6 }}>{orgChart.reportingStructure}</p>}
                              {(() => {
                                const renderNode = (node, level=0) => node ? (
                                  <div key={node.title} style={{ marginLeft:level*18, marginBottom:5 }}>
                                    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', background:level===0?'var(--amber)':'var(--card2)', border:'1px solid var(--border)', borderRadius:7, transition:'all 0.15s' }}>
                                      <div style={{ width:5, height:5, borderRadius:'50%', background:node.relevance==='high'?'var(--green)':node.relevance==='medium'?'var(--amber)':'var(--text-dim)', flexShrink:0 }}></div>
                                      <span style={{ fontSize:12, fontWeight:700, color:level===0?'var(--navy)':'var(--text)' }}>{node.name||'TBC'}</span>
                                      <span style={{ fontSize:11, color:level===0?'var(--navy)':'var(--text-muted)' }}>· {node.title}</span>
                                    </div>
                                    {node.children?.map(child => renderNode(child, level+1))}
                                  </div>
                                ) : null;
                                return orgChart.ceo ? renderNode(orgChart.ceo) : null;
                              })()}
                            </div>
                          )}
                        </div>

                        {/* Email Finder */}
                        <div className="inline-section">
                          <div className="section-header">📧 Email Intelligence</div>
                          {!emailData ? (
                            <button className="gen-btn" onClick={() => findEmails(form.company, result?.stakeholders?.buyingCommittee||[], setEmailData, setEmailLoading)} disabled={emailLoading}>
                              {emailLoading ? '⏳ Searching...' : '📧 Find Emails'}
                            </button>
                          ) : emailData.length===0 ? (
                            <div style={{ fontSize:13, color:'var(--text-muted)', padding:'16px 0' }}>No emails found publicly. Check Org Chart for the email pattern and construct them manually.</div>
                          ) : (
                            <div className="anim-slide-up">
                              {emailData.map((e,i) => (
                                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', background:'var(--card)', border:'1px solid var(--border)', borderRadius:10, marginBottom:8, transition:'all 0.2s' }}>
                                  <div>
                                    <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:3 }}>{e.role}{e.name?` — ${e.name}`:''}</div>
                                    {e.email && <div style={{ fontSize:13, fontFamily:'monospace', color:'var(--blue-light)' }}>{e.email}</div>}
                                    {e.emailPattern && <div style={{ fontSize:11, color:'var(--text-dim)', marginTop:2 }}>Pattern: {e.emailPattern}</div>}
                                  </div>
                                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                                    <span className={`tag ${e.confidence==='high'?'tag-green':e.confidence==='medium'?'tag-amber':'tag-dim'}`}>{e.confidence}</span>
                                    {e.email && <button className="copy-btn" onClick={() => navigator.clipboard.writeText(e.email)}>COPY</button>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })() : (
                    <div className="empty-state">
                      <div className="empty-state-icon">👥</div>
                      <div className="empty-state-title">No Stakeholder Data</div>
                      <div className="empty-state-desc">Run the analysis to see your buying committee, talk tracks and champion development score.</div>
                    </div>
                  )}
                </div>
              )}

              {/* ═══ TAB: OUTREACH ENGINE ══════════════════════════════════ */}
              {activeTab === "outreach" && result.outreach ? (() => {
                const ou = result.outreach;
                return (
                  <div className="anim-slide-up">
                    {/* Tone Selector */}
                    <div style={{ display:'flex', gap:8, marginBottom:20 }}>
                      {[['formal','🏛 Formal','Banking, Gov, Enterprise'],['warm','🤝 Warm','Tech, Startups'],['direct','⚡ Direct','C-Suite, Buyers']].map(([t,label,desc]) => (
                        <button key={t} onClick={() => setEmailTone(t)} className={`tone-btn ${emailTone===t?'active':''}`} style={{ flex:1, minHeight:60 }}>
                          <div style={{ fontSize:13, fontWeight:700, color:emailTone===t?'var(--amber)':'var(--text-muted)' }}>{label}</div>
                          <div style={{ fontSize:10, color:'var(--text-dim)', marginTop:2 }}>{desc}</div>
                        </button>
                      ))}
                    </div>

                    {/* Email Sequence */}
                    <div style={{ marginBottom:24 }}>
                      <div className="section-header">Cold Outreach Sequence</div>
                      {[
                        { label:'Day 1 — Cold', subject:ou.coldEmail?.subject, preheader:ou.coldEmail?.preheader, body:ou.coldEmail?.body },
                        { label:`Day ${ou.coldEmail?.followUp1?.dayToSend||5} — Follow Up`, subject:ou.coldEmail?.followUp1?.subject, body:ou.coldEmail?.followUp1?.body },
                        { label:`Day ${ou.coldEmail?.followUp2?.dayToSend||12} — Break Up`, subject:ou.coldEmail?.followUp2?.subject, body:ou.coldEmail?.followUp2?.body },
                      ].map((email,i) => email.subject && (
                        <div key={i} className="email-box anim-slide-up" style={{ marginBottom:10, animationDelay:`${i*0.06}s` }}>
                          <div className="email-header">
                            <div>
                              <span className="tag tag-dim" style={{ marginRight:8 }}>{email.label}</span>
                              <span className="email-subject">{email.subject}</span>
                              {email.preheader && <div style={{ fontSize:11, color:'var(--text-dim)', marginTop:3 }}>{email.preheader}</div>}
                            </div>
                            <CopyButton text={`Subject: ${email.subject}\n\n${email.body}`} />
                          </div>
                          <div className="email-body">{email.body}</div>
                        </div>
                      ))}
                    </div>

                    {/* LinkedIn + Referral */}
                    <div className="r-grid-2" style={{ marginBottom:24 }}>
                      {ou.linkedInMessage && (
                        <div className="card">
                          <div className="section-header" style={{ color:'var(--blue-light)' }}>LinkedIn Message</div>
                          <p style={{ fontSize:13, color:'var(--text)', lineHeight:1.7, marginBottom:10 }}>{ou.linkedInMessage}</p>
                          <CopyButton text={ou.linkedInMessage} />
                        </div>
                      )}
                      {ou.executiveReferral && (
                        <div className="card">
                          <div className="section-header">Executive Referral</div>
                          <p style={{ fontSize:13, color:'var(--text)', lineHeight:1.7, marginBottom:10 }}>{ou.executiveReferral}</p>
                          <CopyButton text={ou.executiveReferral} />
                        </div>
                      )}
                    </div>

                    {/* LinkedIn Variants */}
                    <div className="inline-section">
                      <div className="section-header" style={{ color:'var(--blue-light)' }}>🔗 LinkedIn Variants</div>
                      {!liVariants ? (
                        <button className="gen-btn" onClick={() => generateLiVariants(form, result, setLiVariants, setLiLoading)} disabled={liLoading}>
                          {liLoading ? '⏳ Generating...' : '🔗 Generate LinkedIn Variants'}
                        </button>
                      ) : (
                        <div className="r-grid-3 anim-scale-in">
                          {Object.entries(liVariants).map(([key,v]) => v && (
                            <div key={key} className="card">
                              <div style={{ fontSize:9, fontWeight:700, color:'var(--blue-light)', letterSpacing:1.5, marginBottom:8, textTransform:'uppercase', fontFamily:"'JetBrains Mono',monospace" }}>{key}</div>
                              <p style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.6, marginBottom:10 }}>{v.message||v}</p>
                              <CopyButton text={v.message||v} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Languages */}
                    <div className="inline-section">
                      <div className="section-header">🌏 Multi-Language</div>
                      <div className="lang-pills" style={{ marginBottom:12 }}>
                        {[['bahasa','🇮🇩 Bahasa'],['mandarin','🇨🇳 Mandarin'],['thai','🇹🇭 Thai'],['tagalog','🇵🇭 Filipino'],['japanese','🇯🇵 Japanese'],['korean','🇰🇷 Korean'],['arabic','🇸🇦 Arabic'],['hindi','🇮🇳 Hindi'],['french','🇫🇷 French'],['german','🇩🇪 German'],['spanish','🇪🇸 Spanish']].map(([key,label]) => (
                          <button key={key} onClick={() => setSelectedLanguage(key)} className={`lang-pill ${selectedLanguage===key?'active':''} ${langData?.[key]?'done':''}`}>
                            {label}{langData?.[key]?' ✓':''}
                          </button>
                        ))}
                      </div>
                      <button onClick={() => generateLanguages(form, result, setLangData, setLangLoading, selectedLanguage)} disabled={langLoading}
                        className={`btn-amber`} style={{ fontSize:12, padding:'10px 22px', marginBottom:16 }}>
                        {langLoading ? 'GENERATING...' : `🌏 GENERATE ${selectedLanguage.toUpperCase()}`}
                      </button>
                      {langData?.[selectedLanguage] && (() => {
                        const lang = langData[selectedLanguage];
                        return (
                          <div className="card anim-scale-in">
                            {lang.culturalNote && <div style={{ background:'var(--amber-glow)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:8, padding:12, marginBottom:12, fontSize:13, color:'var(--text)' }}>{lang.culturalNote}</div>}
                            <div style={{ fontSize:9, fontWeight:700, color:'var(--text-dim)', letterSpacing:2, marginBottom:6, fontFamily:"'JetBrains Mono',monospace", textTransform:'uppercase' }}>Subject</div>
                            <div style={{ fontSize:14, fontWeight:600, color:'var(--blue-light)', marginBottom:14 }}>{lang.emailSubject}</div>
                            <div style={{ fontSize:9, fontWeight:700, color:'var(--text-dim)', letterSpacing:2, marginBottom:6, fontFamily:"'JetBrains Mono',monospace", textTransform:'uppercase' }}>Body</div>
                            <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.8, marginBottom:12, whiteSpace:'pre-line' }}>{lang.emailBody}</p>
                            <CopyButton text={`Subject: ${lang.emailSubject}\n\n${lang.emailBody}`} />
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })() : activeTab === "outreach" ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📣</div>
                  <div className="empty-state-title">No Outreach Data</div>
                  <div className="empty-state-desc">Run the analysis to generate your personalised email sequences, LinkedIn messages and multi-language outreach.</div>
                </div>
              ) : null}

              {/* ═══ TAB: PLAYBOOK ═════════════════════════════════════════ */}
              {activeTab === "playbook" && (
                <div className="anim-slide-up">
                  {/* Discovery Questions */}
                  {result.discoveryQuestions && (() => {
                    const dq = result.discoveryQuestions;
                    return (
                      <div style={{ marginBottom:28 }}>
                        <div className="section-header">💬 Discovery Questions</div>
                        {dq.openingFramer && (
                          <div style={{ background:'rgba(29,78,216,0.07)', border:'1px solid rgba(96,165,250,0.15)', borderRadius:10, padding:16, marginBottom:20, borderLeft:'3px solid var(--blue)' }}>
                            <div style={{ fontSize:9, fontWeight:700, color:'var(--blue-light)', letterSpacing:2, marginBottom:6, fontFamily:"'JetBrains Mono',monospace", textTransform:'uppercase' }}>Opening Framer</div>
                            <p style={{ fontSize:13, color:'var(--text)', lineHeight:1.7, fontStyle:'italic' }}>"{dq.openingFramer}"</p>
                          </div>
                        )}
                        {dq.categories?.map((cat,ci) => (
                          <div key={ci} className="q-category">
                            <div className="q-cat-title">{cat.category}</div>
                            {cat.questions?.map((q,qi) => (
                              <div key={qi} className="q-item">
                                <div className="q-text">{q.question}</div>
                                <div className="q-meta">
                                  {q.intent && <span className="q-intent">Intent: {q.intent}</span>}
                                  {q.followUp && <span className="q-followup">↳ {q.followUp}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                        <div className="r-grid-2">
                          {dq.redFlags?.length > 0 && (
                            <div style={{ background:'var(--red-dim)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:10, padding:16 }}>
                              <div style={{ fontSize:9, fontWeight:700, color:'var(--red)', letterSpacing:2, marginBottom:8, fontFamily:"'JetBrains Mono',monospace" }}>RED FLAGS</div>
                              {dq.redFlags.map((f,i) => <div key={i} style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>⚠ {f}</div>)}
                            </div>
                          )}
                          {dq.idealCallOutcome && (
                            <div style={{ background:'var(--green-dim)', border:'1px solid rgba(16,185,129,0.15)', borderRadius:10, padding:16 }}>
                              <div style={{ fontSize:9, fontWeight:700, color:'var(--green)', letterSpacing:2, marginBottom:8, fontFamily:"'JetBrains Mono',monospace" }}>IDEAL OUTCOME</div>
                              <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.6 }}>{dq.idealCallOutcome}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Command of Message */}
                  {result.commandOfMessage && (() => {
                    const com = result.commandOfMessage;
                    return (
                      <div className="inline-section">
                        <div className="section-header">🏆 Command of the Message</div>
                        <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
                          <span className="tag tag-blue">{com.salesStage}</span>
                          <span style={{ fontSize:12, color:'var(--text-muted)' }}>{com.stageRationale}</span>
                        </div>
                        <div className="com-before-after" style={{ marginBottom:16 }}>
                          <div className="com-before"><div className="com-box-label" style={{ color:'var(--red)' }}>BEFORE</div><p className="com-box-text">{com.beforeScenario}</p></div>
                          <div className="com-after"><div className="com-box-label" style={{ color:'var(--green)' }}>AFTER — 12 months</div><p className="com-box-text">{com.afterScenario}</p></div>
                        </div>
                        {com.objectionHandlers?.map((o,i) => (
                          <div key={i} className="objection-item">
                            <div className="obj-q">"{o.objection}"</div>
                            <div className="obj-a">{o.response}</div>
                          </div>
                        ))}
                        {com.closingHypothesis && (
                          <div style={{ background:'var(--amber-glow)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:10, padding:16, marginTop:12 }}>
                            <div style={{ fontSize:9, fontWeight:700, color:'var(--amber)', letterSpacing:2, marginBottom:6, fontFamily:"'JetBrains Mono',monospace" }}>CLOSING HYPOTHESIS</div>
                            <p style={{ fontSize:14, fontWeight:700, color:'var(--text)', lineHeight:1.7, fontStyle:'italic' }}>"{com.closingHypothesis}"</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Battle Cards */}
                  <div className="inline-section">
                    <div className="section-header">⚔️ Battle Cards</div>
                    {!battleCards ? (
                      <button className="gen-btn" onClick={() => generateBattleCards(form, result, setBattleCards, setBattleLoading)} disabled={battleLoading||!form.competitorsMentioned}>
                        {battleLoading ? '⏳ Generating...' : form.competitorsMentioned ? '⚔️ Generate Battle Cards' : 'Add competitors in the form first'}
                      </button>
                    ) : (
                      <div className="anim-scale-in">
                        {battleCards.map((bc,i) => (
                          <div key={i} className="card" style={{ marginBottom:10 }}>
                            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:800, color:'var(--amber)', marginBottom:12 }}>vs. {bc.competitor}</div>
                            <div className="compete-vs">
                              <div className="compete-win"><div className="compete-label" style={{ color:'var(--green)' }}>✓ We Win When</div>{bc.weWinWhen?.map((w,j) => <div key={j} style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>{w}</div>)}</div>
                              <div className="compete-lose"><div className="compete-label" style={{ color:'var(--red)' }}>✗ They Attack With</div>{bc.theyAttackWith?.map((w,j) => <div key={j} style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>{w}</div>)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Competitive Intelligence */}
                  <div className="inline-section">
                    <div className="section-header">🗺️ Competitive Intel</div>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:10 }}>
                      {form.competitorsMentioned?.split(/[,;\/]/).map(comp => comp.trim()).filter(Boolean).map(comp => (
                        <button key={comp} onClick={() => setSelectedCompetitor(comp)} className={`lang-pill ${selectedCompetitor===comp?'active':''}`}>{comp}</button>
                      ))}
                    </div>
                    <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                      <input type="text" placeholder="Enter competitor..." value={selectedCompetitor} onChange={e => setSelectedCompetitor(e.target.value)} className="input-field" style={{ flex:1 }} />
                      <button onClick={async () => {
                        if(!selectedCompetitor.trim()) return;
                        setCompeteLoading(true);
                        try {
                          const res = await fetch("/api/anthropic", { method:"POST", headers:{"Content-Type":"application/json"},
                            body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:4000, stream:true,
                              system:`Competitive intelligence expert. Return ONLY valid JSON: {"competitor":"Name","overallThreatLevel":"high/medium/low","whereWeWin":[{"scenario":"...","reason":"...","proofPoint":"..."}],"whereWeLose":[{"scenario":"...","reason":"...","mitigation":"..."}],"objectionHandlers":[{"objection":"...","response":"...","trap":"..."}],"displacementPlaybook":{"trigger":"...","approach":"...","landmines":["...","..."]},"competitorWeaknesses":["...","...","..."]}`,
                              messages:[{role:"user",content:`Our product: ${form.product}. Competitor: ${selectedCompetitor}. Prospect: ${form.company} (${form.industry}, ${form.market}). Stage: ${form.dealStage}. Our edge: ${result?.commandOfMessage?.uniqueDifferentiators?.join(', ')||''}. Pain: ${result?.accountBrief?.painPoints?.map(p=>p.pain).join(', ')||''}.`}]
                            })
                          });
                          const reader = res.body.getReader(); const decoder = new TextDecoder(); let raw = "";
                          while(true) { const {done,value} = await reader.read(); if(done) break;
                            for(const line of decoder.decode(value,{stream:true}).split("\n")) { if(line.startsWith("data: ")) { try { const evt=JSON.parse(line.slice(6)); if(evt.type==="content_block_delta"&&evt.delta?.type==="text_delta") raw+=evt.delta.text; } catch(e){} } } }
                          const s=raw.indexOf("{"),e=raw.lastIndexOf("}"); setCompeteData(JSON.parse(raw.slice(s,e+1)));
                        } catch(e) { alert("Failed. Try again."); }
                        setCompeteLoading(false);
                      }} disabled={competeLoading||!selectedCompetitor.trim()} className="btn-amber" style={{ fontSize:12, padding:'10px 20px', whiteSpace:'nowrap' }}>
                        {competeLoading ? '⏳' : '🗺️ Analyse'}
                      </button>
                    </div>
                    {competeData && (
                      <div className="anim-scale-in">
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:800, color:'var(--text)' }}>vs. {competeData.competitor}</div>
                          <span className={`tag ${competeData.overallThreatLevel==='high'?'tag-red':competeData.overallThreatLevel==='medium'?'tag-amber':'tag-green'}`}>{competeData.overallThreatLevel?.toUpperCase()} THREAT</span>
                        </div>
                        <div className="compete-vs" style={{ marginBottom:12 }}>
                          <div className="compete-win"><div className="compete-label" style={{ color:'var(--green)' }}>WHERE WE WIN</div>{competeData.whereWeWin?.map((w,i) => <div key={i} style={{ fontSize:12, color:'var(--text-muted)', marginBottom:6 }}><strong style={{color:'var(--text)'}}>{w.scenario}</strong> — {w.reason}</div>)}</div>
                          <div className="compete-lose"><div className="compete-label" style={{ color:'var(--red)' }}>WHERE WE LOSE</div>{competeData.whereWeLose?.map((w,i) => <div key={i} style={{ fontSize:12, color:'var(--text-muted)', marginBottom:6 }}><strong style={{color:'var(--text)'}}>{w.scenario}</strong><br/><span style={{color:'var(--amber)',fontSize:11}}>Counter: {w.mitigation}</span></div>)}</div>
                        </div>
                        {competeData.objectionHandlers?.map((o,i) => (
                          <div key={i} className="objection-item">
                            <div className="obj-q">"{o.objection}"</div>
                            <div className="obj-a">{o.response}</div>
                            {o.trap && <div style={{ fontSize:11, color:'var(--amber)', background:'var(--amber-glow)', borderRadius:5, padding:'5px 10px', marginTop:6 }}>🪤 {o.trap}</div>}
                          </div>
                        ))}
                        {competeData.displacementPlaybook && (
                          <div style={{ background:'rgba(96,165,250,0.06)', border:'1px solid rgba(96,165,250,0.15)', borderRadius:10, padding:16, marginTop:10 }}>
                            <div style={{ fontSize:9, fontWeight:700, color:'var(--blue-light)', letterSpacing:2, marginBottom:8, fontFamily:"'JetBrains Mono',monospace" }}>DISPLACEMENT PLAYBOOK</div>
                            <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:8, lineHeight:1.6 }}>{competeData.displacementPlaybook.approach}</p>
                            {competeData.displacementPlaybook.landmines?.map((l,i) => <div key={i} style={{ fontSize:12, color:'var(--amber)', marginBottom:4 }}>🪤 "{l}"</div>)}
                          </div>
                        )}
                        <button onClick={() => setCompeteData(null)} className="btn-ghost" style={{ marginTop:12, fontSize:11 }}>Analyse Different Competitor</button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ═══ TAB: BUSINESS CASE ════════════════════════════════════ */}
              {activeTab === "bizcase" && (
                <div className="anim-slide-up">
                  {/* ROI Calculator */}
                  <div className="card" style={{ marginBottom:20 }}>
                    <div className="card-title">💰 ROI Calculator</div>
                    <div className="r-grid-2" style={{ marginBottom:20 }}>
                      {[['employees','Team Size Affected','e.g. 25'],['avgSalary','Avg Annual Salary (USD)','e.g. 85000'],['hoursPerWeek','Hrs/Week Manual Work','e.g. 12'],['currentErrors','Annual Error/Risk Cost (USD)','e.g. 250000'],['revenueUpside','Revenue Upside (USD)','e.g. 500000'],['dealSize','Solution ACV (USD)','e.g. 200000']].map(([key,label,ph]) => (
                        <div key={key} className="input-group">
                          <label className="input-label">{label}</label>
                          <input type="number" placeholder={ph} value={roiInputs[key]} onChange={e => setRoiInputs(p => ({...p,[key]:e.target.value}))} className="input-field" />
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setRoiResult(calcROI(roiInputs, result))} className="btn-amber">CALCULATE ROI</button>
                  </div>

                  {roiResult && (
                    <div className="anim-scale-in" style={{ marginBottom:20 }}>
                      <div className="r-grid-3" style={{ marginBottom:16 }}>
                        {[['ROI',`${roiResult.roi}%`,'#10B981'],['Payback',`${roiResult.payback} mo`,'#F59E0B'],['Monthly CoI',`$${roiResult.costOfInaction?.toLocaleString()}`,'#EF4444']].map(([label,val,color]) => (
                          <div key={label} className="roi-metric" style={{ borderColor:`${color}33` }}>
                            <div className="roi-value" style={{ color }}>{val}</div>
                            <div className="roi-label">{label}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ background:'var(--amber-glow)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:12, padding:18, marginBottom:14 }}>
                        <div style={{ fontSize:9, fontWeight:700, color:'var(--amber)', letterSpacing:2, marginBottom:8, fontFamily:"'JetBrains Mono',monospace" }}>CFO TALK TRACK</div>
                        <p style={{ fontSize:13, color:'var(--text)', lineHeight:1.75, fontStyle:'italic', marginBottom:10 }}>
                          "The cost of inaction is ${roiResult.costOfInaction?.toLocaleString()} per month — ${roiResult.totalBenefit?.toLocaleString()} annually. Our solution delivers {roiResult.roi}% ROI with a {roiResult.payback}-month payback. Every month you delay costs more than the solution itself."
                        </p>
                        <button className="copy-btn" onClick={() => navigator.clipboard.writeText(`The cost of inaction is $${roiResult.costOfInaction?.toLocaleString()} per month. Our solution delivers ${roiResult.roi}% ROI with a ${roiResult.payback}-month payback period.`)}>COPY</button>
                      </div>
                      {!roiResearch ? (
                        <button onClick={async () => {
                          setRoiResearchLoading(true);
                          try {
                            const res = await fetch("/api/anthropic", { method:"POST", headers:{"Content-Type":"application/json"},
                              body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:2000, tools:[{type:"web_search_20250305",name:"web_search"}],
                                system:`Find ROI studies. Return ONLY valid JSON: {"studies":[{"source":"Forrester TEI","title":"...","keyFinding":"...","year":"2024"}],"industryBenchmarks":["..."]}`,
                                messages:[{role:"user",content:`ROI research for ${form.product} in ${form.industry}.`}]
                              })
                            });
                            const data = await res.json();
                            const text = data.content?.filter(b=>b.type==='text').map(b=>b.text).join('')||'{}';
                            const s=text.indexOf('{'),e=text.lastIndexOf('}'); if(s!==-1&&e!==-1) setRoiResearch(JSON.parse(text.slice(s,e+1)));
                          } catch(err) {} setRoiResearchLoading(false);
                        }} disabled={roiResearchLoading} className="gen-btn" style={{ width:'100%', justifyContent:'center' }}>
                          {roiResearchLoading ? '⏳ Searching...' : '🔍 Find Forrester/Gartner Research'}
                        </button>
                      ) : (
                        <div className="card anim-scale-in">
                          <div style={{ fontSize:9, fontWeight:700, color:'var(--blue-light)', letterSpacing:2, marginBottom:12, fontFamily:"'JetBrains Mono',monospace" }}>ANALYST RESEARCH</div>
                          {roiResearch.studies?.map((s,i) => (
                            <div key={i} style={{ paddingBottom:12, marginBottom:12, borderBottom:'1px solid var(--border)' }}>
                              <div style={{ fontSize:9, color:'var(--blue-light)', fontFamily:"'JetBrains Mono',monospace", marginBottom:4 }}>{s.source} {s.year&&`· ${s.year}`}</div>
                              <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:4 }}>{s.title}</div>
                              <div style={{ fontSize:12, color:'var(--text-muted)' }}>{s.keyFinding}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Meeting Prep */}
                  <div className="inline-section">
                    <div className="section-header">⚡ Meeting Prep</div>
                    <div className="r-grid-2" style={{ marginBottom:10 }}>
                      <div className="input-group">
                        <label className="input-label">Name</label>
                        <input type="text" placeholder="e.g. Sarah Chen" value={meetingInputs.personName} onChange={e => setMeetingInputs(p => ({...p,personName:e.target.value}))} className="input-field" />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Role</label>
                        <input type="text" placeholder="e.g. CFO" value={meetingInputs.personRole} onChange={e => setMeetingInputs(p => ({...p,personRole:e.target.value}))} className="input-field" />
                      </div>
                    </div>
                    <div className="meeting-types" style={{ marginBottom:10 }}>
                      {[['discovery','🔍 Discovery'],['demo','🎯 Demo'],['negotiation','🤝 Negotiation'],['qbr','📊 QBR'],['checkin','☎️ Check-in'],['execsponsor','👔 Exec Sponsor']].map(([val,label]) => (
                        <button key={val} onClick={() => setMeetingInputs(p => ({...p,meetingType:val}))} className={`meeting-type-btn ${meetingInputs.meetingType===val?'active':''}`}>{label}</button>
                      ))}
                    </div>
                    <textarea placeholder="Additional context..." value={meetingInputs.additionalContext} onChange={e => setMeetingInputs(p => ({...p,additionalContext:e.target.value}))} style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)', borderRadius:8, padding:'9px 12px', color:'var(--text)', fontSize:13, outline:'none', minHeight:56, resize:'vertical', lineHeight:1.6, marginBottom:10, boxSizing:'border-box' }} />
                    <button onClick={async () => {
                      setMeetingPrepLoading(true);
                      try {
                        const res = await fetch("/api/anthropic", { method:"POST", headers:{"Content-Type":"application/json"},
                          body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:3000, stream:true,
                            system:`Generate meeting prep. Return ONLY valid JSON: {"meetingObjective":"...","personIntel":{"archetype":"...","likelyMotivations":["..."],"whatTheyWillJudgeYouOn":"..."},"openingLine":"...","powerQuestions":[{"question":"...","intent":"...","expectedInsight":"..."},{"question":"...","intent":"...","expectedInsight":"..."},{"question":"...","intent":"...","expectedInsight":"..."}],"landminesToAvoid":["...","...","..."],"successCriteria":"...","followUpTemplate":"..."}`,
                            messages:[{role:"user",content:`Meeting: ${meetingInputs.personName||'Unknown'} — ${meetingInputs.personRole}. Type: ${meetingInputs.meetingType}. Company: ${form.company}. Product: ${form.product}. Stage: ${form.dealStage}. Context: ${meetingInputs.additionalContext||'None'}.`}]
                          })
                        });
                        const reader = res.body.getReader(); const decoder = new TextDecoder(); let raw = "";
                        while(true) { const {done,value} = await reader.read(); if(done) break;
                          for(const line of decoder.decode(value,{stream:true}).split("\n")) { if(line.startsWith("data: ")) { try { const evt=JSON.parse(line.slice(6)); if(evt.type==="content_block_delta"&&evt.delta?.type==="text_delta") raw+=evt.delta.text; } catch(e){} } } }
                        const s=raw.indexOf("{"),e=raw.lastIndexOf("}"); setMeetingPrep(JSON.parse(raw.slice(s,e+1)));
                      } catch(e) { alert("Failed. Try again."); }
                      setMeetingPrepLoading(false);
                    }} disabled={meetingPrepLoading||!meetingInputs.personRole} className="btn-amber" style={{ fontSize:12, padding:'10px 24px', marginBottom: meetingPrep ? 16 : 0 }}>
                      {meetingPrepLoading ? 'GENERATING...' : '⚡ GENERATE PREP'}
                    </button>

                    {meetingPrep && (
                      <div className="anim-scale-in">
                        <div style={{ background:'linear-gradient(135deg,rgba(245,158,11,0.1),rgba(234,88,12,0.07))', border:'1px solid rgba(245,158,11,0.2)', borderRadius:12, padding:16, marginBottom:12 }}>
                          <div style={{ fontSize:9, fontWeight:700, color:'var(--amber)', letterSpacing:2, marginBottom:6, fontFamily:"'JetBrains Mono',monospace" }}>OBJECTIVE</div>
                          <p style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{meetingPrep.meetingObjective}</p>
                        </div>
                        <div style={{ background:'rgba(29,78,216,0.07)', border:'1px solid rgba(96,165,250,0.15)', borderLeft:'3px solid var(--blue)', borderRadius:'0 10px 10px 0', padding:16, marginBottom:12 }}>
                          <div style={{ fontSize:9, fontWeight:700, color:'var(--blue-light)', letterSpacing:2, marginBottom:6, fontFamily:"'JetBrains Mono',monospace" }}>OPENING LINE</div>
                          <p style={{ fontSize:13, color:'var(--text)', lineHeight:1.7, fontStyle:'italic', marginBottom:8 }}>"{meetingPrep.openingLine}"</p>
                          <button className="copy-btn" onClick={() => navigator.clipboard.writeText(meetingPrep.openingLine)}>COPY</button>
                        </div>
                        <div className="card" style={{ marginBottom:12 }}>
                          <div style={{ fontSize:9, fontWeight:700, color:'var(--amber)', letterSpacing:2, marginBottom:12, fontFamily:"'JetBrains Mono',monospace" }}>POWER QUESTIONS</div>
                          {meetingPrep.powerQuestions?.map((q,i) => (
                            <div key={i} style={{ paddingBottom:12, marginBottom:12, borderBottom:i<2?'1px solid var(--border)':'none' }}>
                              <p style={{ fontSize:13, color:'var(--text)', fontStyle:'italic', marginBottom:6 }}>"{q.question}"</p>
                              <div className="r-grid-2">
                                <div style={{ fontSize:11, color:'var(--text-dim)' }}>Intent: {q.intent}</div>
                                <div style={{ fontSize:11, color:'var(--blue-light)' }}>Learn: {q.expectedInsight}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="r-grid-2">
                          <div style={{ background:'var(--red-dim)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:10, padding:14 }}>
                            <div style={{ fontSize:9, fontWeight:700, color:'var(--red)', letterSpacing:2, marginBottom:8, fontFamily:"'JetBrains Mono',monospace" }}>LANDMINES</div>
                            {meetingPrep.landminesToAvoid?.map((l,i) => <div key={i} style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>✗ {l}</div>)}
                          </div>
                          <div className="card">
                            <div style={{ fontSize:9, fontWeight:700, color:'var(--amber)', letterSpacing:2, marginBottom:8, fontFamily:"'JetBrains Mono',monospace" }}>FOLLOW-UP</div>
                            <p style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.6 }}>{meetingPrep.followUpTemplate}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Exec Brief */}
                  <div className="inline-section">
                    <div className="section-header">📋 Executive Brief</div>
                    {!roiResult && <div style={{ fontSize:11, color:'var(--amber)', marginBottom:12, padding:'8px 12px', background:'var(--amber-glow)', borderRadius:6 }}>💡 Calculate ROI first for more accurate financial figures</div>}
                    {!execBrief ? (
                      <div className="empty-state" style={{ padding:'32px 16px' }}>
                        <div className="empty-state-icon">📋</div>
                        <div className="empty-state-title">Executive Briefing Document</div>
                        <div className="empty-state-desc">A board-ready business case written for your buyer — CFO/CEO language, outcome-focused, data-driven.</div>
                        <button onClick={async () => {
                          setExecBriefLoading(true);
                          try {
                            const res = await fetch("/api/anthropic", { method:"POST", headers:{"Content-Type":"application/json"},
                              body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:5000, stream:true,
                                system:`Write executive briefing for CFO/CEO. Use actual ROI figures. Return ONLY valid JSON: {"documentTitle":"...","executiveSummary":"...","currentStateAnalysis":{"headline":"...","painPoints":["...","...","..."],"costOfStatusQuo":"...","urgencyDrivers":["...","..."]},"businessCase":{"totalInvestment":"...","year1Benefits":"...","roiPercentage":"...","paybackPeriod":"...","npv3Year":"..."},"riskAnalysis":{"risksOfInaction":["...","...","..."]},"peerValidation":{"industryBenchmark":"...","analystPerspective":"..."},"recommendation":{"decision":"...","immediateNextSteps":["...","...","..."],"executiveSponsorAsk":"..."}}`,
                                messages:[{role:"user",content:`Company: ${form.company} | ${form.market} | ${form.industry}. Solution: ${form.product}. Pain: ${result?.accountBrief?.painPoints?.map(p=>p.pain).join(', ')||''}. ROI: ${roiResult?`${roiResult.roi}% ROI, ${roiResult.payback}mo payback, $${roiResult.totalBenefit?.toLocaleString()} annual benefit`:'not calculated'}.`}]
                              })
                            });
                            const reader = res.body.getReader(); const decoder = new TextDecoder(); let raw = "";
                            while(true) { const {done,value} = await reader.read(); if(done) break;
                              for(const line of decoder.decode(value,{stream:true}).split("\n")) { if(line.startsWith("data: ")) { try { const evt=JSON.parse(line.slice(6)); if(evt.type==="content_block_delta"&&evt.delta?.type==="text_delta") raw+=evt.delta.text; } catch(e){} } } }
                            const s=raw.indexOf("{"),e=raw.lastIndexOf("}"); setExecBrief(JSON.parse(raw.slice(s,e+1)));
                          } catch(e) { alert("Failed. Try again."); }
                          setExecBriefLoading(false);
                        }} disabled={execBriefLoading} className="btn-amber">
                          {execBriefLoading ? 'GENERATING...' : '📋 GENERATE EXEC BRIEF'}
                        </button>
                      </div>
                    ) : (
                      <div className="anim-scale-in">
                        <div style={{ background:'linear-gradient(135deg,rgba(29,78,216,0.1),rgba(8,17,30,0.6))', border:'1px solid rgba(96,165,250,0.2)', borderRadius:14, padding:22, marginBottom:14 }}>
                          <div style={{ fontSize:9, color:'var(--blue-light)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:2, marginBottom:6 }}>EXECUTIVE BRIEFING · CONFIDENTIAL</div>
                          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:900, color:'white', lineHeight:1.3 }}>{execBrief.documentTitle}</div>
                        </div>
                        <div className="card" style={{ marginBottom:12 }}>
                          <div className="section-header">Executive Summary</div>
                          <p style={{ fontSize:13, color:'var(--text)', lineHeight:1.8 }}>{execBrief.executiveSummary}</p>
                        </div>
                        <div className="r-grid-3" style={{ marginBottom:12 }}>
                          {[['ROI',execBrief.businessCase?.roiPercentage,'var(--green)'],['Payback',execBrief.businessCase?.paybackPeriod,'var(--amber)'],['3yr NPV',execBrief.businessCase?.npv3Year,'var(--blue-light)']].map(([l,v,col]) => (
                            <div key={l} className="roi-metric" style={{ borderColor:`${col}22` }}>
                              <div className="roi-value" style={{ color:col, fontSize:18 }}>{v}</div>
                              <div className="roi-label">{l}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ background:'var(--red-dim)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:12, padding:18, marginBottom:12 }}>
                          <div className="section-header" style={{ color:'var(--red)' }}>Risk of Inaction</div>
                          {execBrief.riskAnalysis?.risksOfInaction?.map((r,i) => <div key={i} style={{ fontSize:13, color:'var(--text-muted)', marginBottom:6 }}>⚠ {r}</div>)}
                        </div>
                        <div style={{ background:'var(--amber-glow)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:12, padding:18 }}>
                          <div className="section-header">Recommendation</div>
                          <p style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:10 }}>{execBrief.recommendation?.decision}</p>
                          {execBrief.recommendation?.immediateNextSteps?.map((s,i) => <div key={i} style={{ fontSize:12, color:'var(--text-muted)', marginBottom:5 }}>{i+1}. {s}</div>)}
                        </div>
                        <button onClick={() => setExecBrief(null)} className="btn-ghost" style={{ marginTop:12, fontSize:11 }}>Regenerate</button>
                      </div>
                    )}
                  </div>
                </div>
              )}

{activeTab === "coach" && (
                <div className="fade-up">
                  <div className="chat-window">
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10, background: "var(--navy2)" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 8px rgba(16,185,129,0.5)" }} />
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--amber)", letterSpacing: 1 }}>DEAL COACH · ANKUR SEHGAL · ACTIVE SESSION</div>
                    </div>
                    <div className="chat-messages">
                      {chatMessages.map((m, i) => (
                        <div key={i} className={`chat-msg ${m.role}`}>
                          <div className={`chat-avatar ${m.role === "assistant" ? "coach" : "user"}`}>
                            {m.role === "assistant" ? "AS" : "Y"}
                          </div>
                          <div className={`chat-bubble ${m.role === "assistant" ? "coach" : "user"}`}>
                            {m.role === "assistant" ? formatChatText(m.content) : m.content}
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="chat-msg">
                          <div className="chat-avatar coach">AS</div>
                          <div className="chat-bubble coach"><div className="typing-dots"><div className="typing-dot"/><div className="typing-dot"/><div className="typing-dot"/></div></div>
                        </div>
                      )}
                      <div ref={chatBottomRef} />
                    </div>
                    <div className="chat-input-row">
                      <input className="chat-input" value={chatInput} onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendChat()}
                        placeholder="Ask about this deal, request a script, or start a role-play..." />
                      <button className="chat-send" onClick={sendChat} disabled={!chatInput.trim() || chatLoading}>Send</button>
                    </div>
                  </div>
                  <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[
                      "What's the biggest risk in this deal right now?",
                      "Write me a champion activation script",
                      "How do I get access to the economic buyer?",
                      "Role-play as the CFO — challenge my pitch",
                      "What should I do before my next call?",
                    ].map((q, i) => (
                      <button key={i} onClick={() => { setChatInput(q); }} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 20, padding: "6px 14px", fontSize: 11, color: "var(--text-dim)", cursor: "pointer", fontFamily: "'Inter', sans-serif", transition: "all 0.15s" }}
                        onMouseEnter={e => { e.target.style.borderColor = "var(--amber)"; e.target.style.color = "var(--amber)"; }}
                        onMouseLeave={e => { e.target.style.borderColor = "var(--border)"; e.target.style.color = "var(--text-dim)"; }}>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
// cache bust Sat Mar  7 20:39:18 +08 2026
// bust 1772953923
