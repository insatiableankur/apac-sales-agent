import { useState, useRef, useEffect } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const MARKETS = ["Singapore","Malaysia","Philippines","India","Indonesia","Thailand","Hong Kong","Vietnam","Australia","South Korea","Japan","Taiwan","Multi-Country APAC"];
const INDUSTRIES = ["Financial Services / Banking","Insurance / Insurtech","Fintech / Payments","HCM / HR Technology","ERP / Finance Systems","Retail / CPG / Ecommerce","Logistics / Supply Chain","Healthcare / Pharma","Telco / Media / Tech","Real Estate / PropTech","Energy / Resources","Manufacturing","Professional Services","Government / Public Sector"];
const DEAL_STAGES = ["Prospecting — No Contact Yet","Discovery — First Meetings Done","Evaluation — Active POC / Demo","Proposal — Business Case Submitted","Negotiation — Commercial Terms","Closed Won","Closed Lost — Needs Autopsy"];
const DEAL_SIZES = ["< $50K ACV","$50K – $100K ACV","$100K – $250K ACV","$250K – $500K ACV","$500K – $1M ACV","$1M+ ACV"];
const PRODUCTS = ["Financial Reporting & ESG Platform","HCM / Workforce Management","CRM / Revenue Intelligence","Customer Engagement / Messaging","Data & Analytics Platform","ERP / Finance Automation","Cybersecurity / GRC","Supply Chain Management","Marketing Automation","Learning & Development","Other SaaS Platform"];

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
const buildSystemPrompt = () => `You are the APAC Enterprise SaaS Sales Intelligence Engine trained on Ankur Sehgal's methodologies: 15 years APAC enterprise SaaS, 7x President's Club, $25M ARR. Return ONLY valid JSON — no markdown, no preamble:

{"accountBrief":{"icpScore":87,"icpRating":"Strong Fit","tier":"Tier 1 — Strategic","dealPotential":"$200K–$400K ACV","companyProfile":"2-3 sentence snapshot.","whyNow":"Why engage now.","keyTriggers":["Trigger 1","Trigger 2","Trigger 3"],"painPoints":[{"pain":"Pain 1","businessImpact":"Impact","urgency":"high"},{"pain":"Pain 2","businessImpact":"Impact","urgency":"medium"},{"pain":"Pain 3","businessImpact":"Impact","urgency":"low"}],"buyingCulture":"How they buy.","apacMarketContext":"Market context."},"meddpicc":{"overallHealth":"amber","forecastCategory":"Pipeline","elements":{"metrics":{"status":"red","label":"Metrics","description":"...","evidence":"...","nextAction":"...","questions":["Q1","Q2"]},"economicBuyer":{"status":"amber","label":"Economic Buyer","description":"...","evidence":"...","nextAction":"...","questions":["Q1","Q2"]},"decisionCriteria":{"status":"green","label":"Decision Criteria","description":"...","evidence":"...","nextAction":"...","questions":["Q1","Q2"]},"decisionProcess":{"status":"red","label":"Decision Process","description":"...","evidence":"...","nextAction":"...","questions":["Q1","Q2"]},"paperProcess":{"status":"red","label":"Paper Process","description":"...","evidence":"...","nextAction":"...","questions":["Q1","Q2"]},"identifiedPain":{"status":"green","label":"Identified Pain","description":"...","evidence":"...","nextAction":"...","questions":["Q1","Q2"]},"champion":{"status":"amber","label":"Champion","description":"...","evidence":"...","nextAction":"...","questions":["Q1","Q2"]},"competition":{"status":"amber","label":"Competition","description":"...","evidence":"...","nextAction":"...","questions":["Q1","Q2"]}},"dealRisks":["Risk 1","Risk 2","Risk 3"],"winConditions":["Condition 1","Condition 2","Condition 3"]},"stakeholders":{"buyingCommittee":[{"role":"Group CFO","archetype":"Economic Buyer","priority":1,"accessStatus":"not-engaged","motivations":"...","fears":"...","engagementStrategy":"...","talkTrack":"...","warningSign":"..."},{"role":"Head of Finance Transformation","archetype":"Champion","priority":2,"accessStatus":"engaged","motivations":"...","fears":"...","engagementStrategy":"...","talkTrack":"...","warningSign":"..."},{"role":"IT Director","archetype":"Technical Evaluator","priority":3,"accessStatus":"not-engaged","motivations":"...","fears":"...","engagementStrategy":"...","talkTrack":"...","warningSign":"..."},{"role":"Head of Procurement","archetype":"Gatekeeper","priority":4,"accessStatus":"unknown","motivations":"...","fears":"...","engagementStrategy":"...","talkTrack":"...","warningSign":"..."}],"championDevelopmentScore":45,"championGaps":["Gap 1","Gap 2","Gap 3"],"multithreadingStatus":"Status."},"outreach":{"coldEmail":{"subject":"Subject","preheader":"Preview","body":"Full email 150-200 words. Hook, Peer Frame, Insight, Soft Ask, Social Proof.","followUp1":{"dayToSend":5,"subject":"FU subject","body":"3-sentence follow-up."},"followUp2":{"dayToSend":12,"subject":"Final subject","body":"Break-up style."}},"linkedInMessage":"Under 300 chars.","executiveReferral":"Champion to EB intro template.","sendingTips":["Tip 1","Tip 2","Tip 3"]},"discoveryQuestions":{"openingFramer":"Agenda setter.","categories":[{"category":"Current State & Pain","questions":[{"question":"...","intent":"...","followUp":"..."},{"question":"...","intent":"...","followUp":"..."},{"question":"...","intent":"...","followUp":"..."}]},{"category":"Business Impact","questions":[{"question":"...","intent":"...","followUp":"..."},{"question":"...","intent":"...","followUp":"..."},{"question":"...","intent":"...","followUp":"..."}]},{"category":"Decision Process","questions":[{"question":"...","intent":"...","followUp":"..."},{"question":"...","intent":"...","followUp":"..."},{"question":"...","intent":"...","followUp":"..."}]},{"category":"Urgency","questions":[{"question":"...","intent":"...","followUp":"..."},{"question":"...","intent":"...","followUp":"..."}]},{"category":"Champion Development","questions":[{"question":"...","intent":"...","followUp":"..."},{"question":"...","intent":"...","followUp":"..."}]}],"redFlags":["Flag 1","Flag 2","Flag 3"],"idealCallOutcome":"Perfect discovery outcome."},"commandOfMessage":{"salesStage":"Evaluation","stageRationale":"Why at this stage.","beforeScenario":"Life without solution.","afterScenario":"Success after 12 months.","requiredCapabilities":[{"capability":"...","proofPoint":"..."},{"capability":"...","proofPoint":"..."},{"capability":"...","proofPoint":"..."}],"uniqueDifferentiators":["D1","D2","D3"],"valueDrivers":[{"driver":"Cost Reduction","specifics":"...","estimatedImpact":"$X"},{"driver":"Risk Mitigation","specifics":"...","estimatedImpact":"..."},{"driver":"Revenue Growth","specifics":"...","estimatedImpact":"$X"}],"objectionHandlers":[{"objection":"...","response":"..."},{"objection":"...","response":"..."},{"objection":"...","response":"..."}],"closingHypothesis":"Single compelling reason to buy."},"nextBestActions":[{"priority":1,"action":"Action 1","why":"Why","timeframe":"This week"},{"priority":2,"action":"Action 2","why":"Why","timeframe":"Next 2 weeks"},{"priority":3,"action":"Action 3","why":"Why","timeframe":"This month"}]}

Be specific to the company, market, industry, product and deal stage. Use real APAC context.`;


// ─── PDF EXPORT ───────────────────────────────────────────────────────────────
const exportToPDF = async (result, form) => {
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
  doc.text('APAC Sales Intelligence', M + 16, 28);
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

  result.nextBestActions?.forEach((a, i) => {
    checkY(22);
    const nc = i === 0 ? '#F59E0B' : i === 1 ? '#1A56DB' : '#475569';
    setFill(nc); doc.circle(M + 5, y + 5, 5, 'F');
    setTxt('#FFFFFF'); doc.setFontSize(10); doc.setFont('helvetica','bold');
    doc.text(String(a.priority), M + 5, y + 7, { align: 'center' });
    setTxt('#08111E'); doc.setFontSize(10); doc.setFont('helvetica','bold');
    doc.text(a.action || '', M + 14, y + 6);
    setTxt('#6B7280'); doc.setFontSize(8); doc.setFont('helvetica','normal');
    const wl = doc.splitTextToSize(a.why || '', CW - 20);
    wl.slice(0,2).forEach((l,li) => doc.text(l, M + 14, y + 11 + li*4));
    setFill('#E5E7EB'); doc.roundedRect(W - M - 30, y + 1, 30, 7, 1.5, 1.5, 'F');
    setTxt('#374151'); doc.setFontSize(7);
    doc.text(a.timeframe || '', W - M - 15, y + 6, { align: 'center' });
    y += 24;
  });

  // ── FOOTER ON ALL PAGES ──────────────────────────────────────────────
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    setFill('#F59E0B'); doc.rect(0, 291, W, 1, 'F');
    setTxt('#9CA3AF'); doc.setFontSize(7); doc.setFont('helvetica','normal');
    doc.text(`APAC Sales Intelligence  ·  ${form.company}  ·  Confidential`, M, 295);
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
        system: `You are Ankur Sehgal — APAC enterprise SaaS sales expert. Generate battle cards for the given competitors. Return ONLY valid JSON array:
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

const generateLanguages = async (form, result, setFn, setLoading) => {
  setLoading(true);
  try {
    const res = await fetch("/api/anthropic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        system: `You are an APAC sales localisation expert. Generate outreach emails in 4 APAC languages. Return ONLY valid JSON:
{"bahasa":{"language":"Bahasa Indonesia/Malaysia","emailSubject":"subject","emailBody":"full email","linkedIn":"under 300 chars","culturalNote":"tip"},
"mandarin":{"language":"Mandarin","emailSubject":"subject","emailBody":"full email","linkedIn":"under 300 chars","culturalNote":"tip"},
"thai":{"language":"Thai","emailSubject":"subject","emailBody":"full email","linkedIn":"under 300 chars","culturalNote":"tip"},
"tagalog":{"language":"Filipino","emailSubject":"subject","emailBody":"full email","linkedIn":"under 300 chars","culturalNote":"tip"}}`,
        messages: [{ role: "user", content: `Company: ${form.company}, Market: ${form.market}, Industry: ${form.industry}, Product: ${form.product}
Core value prop: ${form.productDesc}
Email subject from English: ${result?.outreach?.coldEmail?.subject}
Key pain: ${result?.accountBrief?.painPoints?.[0]?.pain}` }]
      })
    });
    const data = await res.json();
    const raw = data.content?.map(b => b.text || "").join("") || "";
    const clean = raw.split("```").join("").split("\n").filter(l => l.trim() && l.trim() !== "json").join("\n").trim();
    setFn(JSON.parse(clean));
  } catch(e) { alert("Failed to generate languages. Try again."); }
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

// ─── ROI CALCULATOR ──────────────────────────────────────────────────────────
const calcROI = (inputs, result) => {
  const emp = parseFloat(inputs.employees) || 0;
  const salary = parseFloat(inputs.avgSalary) || 80000;
  const hrs = parseFloat(inputs.hoursPerWeek) || 10;
  const dealSize = parseFloat(inputs.dealSize) || 200000;
  const hourlyRate = salary / 2080;
  const annualHours = emp * hrs * 52;
  const laborSavings = annualHours * hourlyRate * 0.7;
  const errorCost = (parseFloat(inputs.currentErrors) || 5) * 50000;
  const totalBenefit = laborSavings + errorCost;
  const roi = ((totalBenefit - dealSize) / dealSize * 100).toFixed(0);
  const payback = (dealSize / (totalBenefit / 12)).toFixed(1);
  return {
    laborSavings: Math.round(laborSavings),
    errorCost: Math.round(errorCost),
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
      system: `You are Ankur Sehgal — APAC enterprise sales expert. Analyse this call transcript and return ONLY valid JSON:
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
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');
  
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  
  :root {
    --navy: #08111E;
    --navy2: #0D1B2E;
    --navy3: #112240;
    --slate: #1E3A5F;
    --blue: #1A56DB;
    --blue-light: #3B82F6;
    --amber: #F59E0B;
    --amber-dim: #B45309;
    --orange: #EA580C;
    --green: #10B981;
    --green-dim: #065F46;
    --red: #EF4444;
    --red-dim: #7F1D1D;
    --text: #E2E8F0;
    --text-dim: #94A3B8;
    --text-faint: #475569;
    --border: rgba(255,255,255,0.08);
    --border-bright: rgba(255,255,255,0.15);
    --card: rgba(255,255,255,0.04);
    --card-hover: rgba(255,255,255,0.07);
    --amber-glow: rgba(245,158,11,0.15);
    --blue-glow: rgba(26,86,219,0.2);
  }

  body { background: var(--navy); color: var(--text); font-family: 'DM Sans', sans-serif; }

  .app { min-height: 100vh; background: var(--navy); }

  /* Header */
  .header {
    background: linear-gradient(180deg, rgba(13,27,46,0.98) 0%, rgba(8,17,30,0.95) 100%);
    border-bottom: 1px solid var(--border);
    padding: 0 32px;
    position: sticky; top: 0; z-index: 100;
    backdrop-filter: blur(12px);
  }
  .header-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; height: 64px; }
  .logo { display: flex; align-items: center; gap: 12px; }
  .logo-icon { width: 36px; height: 36px; background: linear-gradient(135deg, var(--amber), var(--orange)); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
  .logo-text { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 16px; color: white; letter-spacing: -0.3px; }
  .logo-sub { font-family: 'DM Mono', monospace; font-size: 10px; color: var(--amber); letter-spacing: 2px; margin-top: -2px; }
  .header-badge { font-family: 'DM Mono', monospace; font-size: 10px; color: var(--text-dim); background: var(--card); border: 1px solid var(--border); border-radius: 20px; padding: 4px 12px; letter-spacing: 1px; }

  /* Progress bar */
  .progress-bar { height: 2px; background: var(--border); position: relative; }
  .progress-fill { height: 100%; background: linear-gradient(90deg, var(--blue), var(--amber)); transition: width 0.4s ease; }

  /* Main layout */
  .main { max-width: 900px; margin: 0 auto; padding: 40px 24px 80px; }

  /* Step indicator */
  .steps { display: flex; align-items: center; gap: 0; margin-bottom: 40px; }
  .step-item { display: flex; align-items: center; gap: 8px; }
  .step-dot { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 500; flex-shrink: 0; transition: all 0.3s; }
  .step-dot.done { background: var(--green); color: white; }
  .step-dot.active { background: var(--amber); color: var(--navy); font-weight: 700; box-shadow: 0 0 16px var(--amber-glow); }
  .step-dot.pending { background: var(--card); border: 1px solid var(--border); color: var(--text-faint); }
  .step-label { font-size: 12px; color: var(--text-dim); white-space: nowrap; }
  .step-label.active { color: var(--amber); font-weight: 600; }
  .step-connector { height: 1px; background: var(--border); flex: 1; min-width: 20px; margin: 0 8px; }

  /* Cards */
  .card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 28px; margin-bottom: 20px; transition: border-color 0.2s; }
  .card:hover { border-color: var(--border-bright); }
  .card-title { font-family: 'DM Mono', monospace; font-size: 10px; color: var(--amber); letter-spacing: 2.5px; text-transform: uppercase; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
  .card-title::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  /* Form elements */
  .field { margin-bottom: 20px; }
  .field-label { font-family: 'DM Mono', monospace; font-size: 10px; color: var(--text-dim); letter-spacing: 2px; display: block; margin-bottom: 8px; }
  .field-label span { color: var(--amber); margin-left: 4px; }
  
  input[type=text], textarea, select {
    width: 100%; background: rgba(255,255,255,0.05); border: 1px solid var(--border);
    border-radius: 10px; padding: 12px 14px; font-family: 'DM Sans', sans-serif;
    font-size: 14px; color: var(--text); outline: none; transition: all 0.2s;
    appearance: none; -webkit-appearance: none;
  }
  input[type=text]:focus, textarea:focus, select:focus {
    border-color: var(--blue-light); box-shadow: 0 0 0 3px var(--blue-glow);
    background: rgba(255,255,255,0.07);
  }
  input[type=text]::placeholder, textarea::placeholder { color: var(--text-faint); }
  textarea { resize: vertical; min-height: 80px; line-height: 1.6; }
  select option { background: #1E3A5F; color: var(--text); }

  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }

  /* Buttons */
  .btn-primary {
    background: linear-gradient(135deg, var(--blue), #2563EB);
    color: white; border: none; border-radius: 10px; padding: 14px 28px;
    font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700;
    cursor: pointer; transition: all 0.2s; letter-spacing: 0.3px;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px var(--blue-glow); }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  
  .btn-amber {
    background: linear-gradient(135deg, var(--amber), var(--orange));
    color: var(--navy); border: none; border-radius: 10px; padding: 14px 32px;
    font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 800;
    cursor: pointer; transition: all 0.2s; letter-spacing: 0.3px;
    display: inline-flex; align-items: center; gap: 10px;
    box-shadow: 0 4px 20px rgba(245,158,11,0.3);
  }
  .btn-amber:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(245,158,11,0.4); }
  .btn-amber:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  .btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--text-dim); border-radius: 10px; padding: 12px 20px; font-family: 'DM Sans', sans-serif; font-size: 13px; cursor: pointer; transition: all 0.2s; }
  .btn-ghost:hover { border-color: var(--border-bright); color: var(--text); background: var(--card); }

  /* Analysis screen */
  .analyzing { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 32px; }
  .pulse-ring { width: 80px; height: 80px; border: 2px solid var(--amber); border-radius: 50%; position: relative; display: flex; align-items: center; justify-content: center; animation: pulseRing 2s ease-in-out infinite; }
  @keyframes pulseRing { 0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,0.4)} 50%{box-shadow:0 0 0 20px rgba(245,158,11,0)} }
  .analyze-steps { display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 500px; }
  .analyze-step { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 10px; border: 1px solid var(--border); transition: all 0.5s; }
  .analyze-step.done { background: rgba(16,185,129,0.08); border-color: rgba(16,185,129,0.3); }
  .analyze-step.active { background: var(--amber-glow); border-color: rgba(245,158,11,0.4); }
  .analyze-step.pending { opacity: 0.4; }
  .analyze-step-icon { width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
  .analyze-step.done .analyze-step-icon { background: rgba(16,185,129,0.2); }
  .analyze-step.active .analyze-step-icon { background: var(--amber-glow); }
  .analyze-step.pending .analyze-step-icon { background: var(--card); }
  .analyze-step-text { font-size: 13px; color: var(--text); }
  .analyze-step.active .analyze-step-text { color: var(--amber); font-weight: 600; }

  /* Results tabs */
  .results-header { margin-bottom: 28px; }
  .company-title { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: white; margin-bottom: 4px; }
  .company-meta { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 10px; }
  .meta-chip { font-family: 'DM Mono', monospace; font-size: 10px; padding: 4px 10px; border-radius: 6px; border: 1px solid; letter-spacing: 1px; }

  .tabs { display: flex; gap: 2px; margin-bottom: 24px; background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 4px; overflow-x: auto; }
  .tab { padding: 9px 14px; border-radius: 9px; border: none; background: transparent; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 1px; color: var(--text-dim); white-space: nowrap; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
  .tab:hover { color: var(--text); background: var(--card-hover); }
  .tab.active { background: var(--navy3); color: var(--amber); border: 1px solid var(--border); }

  /* Score ring */
  .score-display { display: flex; align-items: center; gap: 24px; }
  .score-ring { width: 90px; height: 90px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; }
  .score-number { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; line-height: 1; }
  .score-label { font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 1px; margin-top: 2px; }

  /* Stat grid */
  .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
  .stat-card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 16px; }
  .stat-value { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: var(--amber); margin-bottom: 4px; }
  .stat-key { font-family: 'DM Mono', monospace; font-size: 9px; color: var(--text-faint); letter-spacing: 1.5px; }

  /* Tags */
  .tag { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 20px; font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.5px; }
  .tag-amber { background: var(--amber-glow); border: 1px solid rgba(245,158,11,0.3); color: var(--amber); }
  .tag-green { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); color: var(--green); }
  .tag-red { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: var(--red); }
  .tag-blue { background: var(--blue-glow); border: 1px solid rgba(59,130,246,0.3); color: var(--blue-light); }
  .tag-dim { background: var(--card); border: 1px solid var(--border); color: var(--text-dim); }

  /* MEDDPICC grid */
  .medd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .medd-item { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 16px; cursor: pointer; transition: all 0.2s; }
  .medd-item:hover { border-color: var(--border-bright); }
  .medd-item.expanded { border-color: rgba(245,158,11,0.4); background: var(--amber-glow); }
  .medd-header { display: flex; align-items: center; justify-content: space-between; }
  .medd-name { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; color: var(--text); }
  .medd-status-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .medd-status-dot.green { background: var(--green); box-shadow: 0 0 8px rgba(16,185,129,0.5); }
  .medd-status-dot.amber { background: var(--amber); box-shadow: 0 0 8px rgba(245,158,11,0.5); }
  .medd-status-dot.red { background: var(--red); box-shadow: 0 0 8px rgba(239,68,68,0.5); }
  .medd-evidence { font-size: 12px; color: var(--text-dim); margin-top: 8px; line-height: 1.5; }
  .medd-expanded { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); }
  .medd-next-action { font-size: 12px; color: var(--amber); background: var(--amber-glow); border-radius: 6px; padding: 8px 10px; margin-bottom: 10px; }

  /* Stakeholder cards */
  .stakeholder-grid { display: flex; flex-direction: column; gap: 12px; }
  .stakeholder-card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 18px; }
  .stakeholder-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
  .stakeholder-role { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: white; }
  .stakeholder-body { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .stakeholder-field { }
  .sf-label { font-family: 'DM Mono', monospace; font-size: 9px; color: var(--text-faint); letter-spacing: 2px; margin-bottom: 4px; }
  .sf-value { font-size: 12px; color: var(--text-dim); line-height: 1.5; }
  .talk-track { margin-top: 12px; padding: 12px 14px; background: rgba(26,86,219,0.1); border: 1px solid rgba(59,130,246,0.2); border-radius: 8px; font-size: 12px; color: var(--blue-light); line-height: 1.6; font-style: italic; }

  /* Outreach */
  .email-box { background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
  .email-header { background: var(--navy3); padding: 14px 18px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
  .email-subject { font-size: 13px; font-weight: 600; color: white; }
  .email-body { padding: 18px; font-size: 13px; color: var(--text-dim); line-height: 1.8; white-space: pre-line; font-family: 'DM Sans', sans-serif; }
  .copy-btn { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 1px; padding: 5px 12px; border-radius: 6px; border: 1px solid var(--border); background: transparent; color: var(--text-dim); cursor: pointer; transition: all 0.2s; }
  .copy-btn:hover { border-color: var(--amber); color: var(--amber); }
  .copy-btn.copied { border-color: var(--green); color: var(--green); }

  /* Discovery questions */
  .q-category { margin-bottom: 24px; }
  .q-cat-title { font-family: 'DM Mono', monospace; font-size: 10px; color: var(--amber); letter-spacing: 2px; margin-bottom: 12px; }
  .q-item { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 14px; margin-bottom: 8px; }
  .q-text { font-size: 13px; color: var(--text); line-height: 1.6; margin-bottom: 8px; font-style: italic; }
  .q-text::before { content: '"'; color: var(--amber); font-size: 16px; }
  .q-text::after { content: '"'; color: var(--amber); font-size: 16px; }
  .q-meta { display: flex; gap: 8px; flex-wrap: wrap; }
  .q-intent { font-size: 11px; color: var(--text-faint); }
  .q-followup { font-size: 11px; color: var(--blue-light); }

  /* Command of message */
  .com-before-after { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
  .com-before { background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.2); border-radius: 12px; padding: 18px; }
  .com-after { background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.2); border-radius: 12px; padding: 18px; }
  .com-box-label { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 2px; margin-bottom: 8px; }
  .com-box-text { font-size: 13px; line-height: 1.7; }
  .value-driver { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 14px; margin-bottom: 8px; display: flex; align-items: flex-start; gap: 12px; }
  .vd-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; background: var(--amber-glow); }
  .objection-item { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 14px; margin-bottom: 8px; }
  .obj-q { font-size: 12px; color: var(--red); font-weight: 600; margin-bottom: 6px; }
  .obj-a { font-size: 12px; color: var(--text-dim); line-height: 1.6; }

  /* Deal Coach chat */
  .chat-window { background: var(--card); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; height: 520px; }
  .chat-messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 14px; }
  .chat-msg { display: flex; gap: 10px; align-items: flex-start; }
  .chat-msg.user { flex-direction: row-reverse; }
  .chat-avatar { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
  .chat-avatar.coach { background: linear-gradient(135deg, var(--amber), var(--orange)); color: var(--navy); font-family: 'Syne', sans-serif; }
  .chat-avatar.user { background: var(--blue); color: white; font-family: 'Syne', sans-serif; }
  .chat-bubble { max-width: 78%; padding: 12px 14px; border-radius: 12px; font-size: 13px; line-height: 1.65; }
  .chat-bubble.coach { background: var(--navy3); border: 1px solid var(--border); color: var(--text); border-top-left-radius: 4px; }
  .chat-bubble.user { background: var(--blue); color: white; border-top-right-radius: 4px; }
  .chat-input-row { padding: 14px; border-top: 1px solid var(--border); display: flex; gap: 10px; background: var(--navy2); }
  .chat-input { flex: 1; background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 10px; padding: 10px 14px; color: var(--text); font-size: 13px; outline: none; font-family: 'DM Sans', sans-serif; transition: border-color 0.2s; }
  .chat-input:focus { border-color: var(--blue-light); }
  .chat-send { background: var(--blue); border: none; border-radius: 10px; padding: 10px 18px; color: white; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
  .chat-send:hover:not(:disabled) { background: var(--blue-light); }
  .chat-send:disabled { opacity: 0.4; cursor: not-allowed; }
  .typing-dots { display: flex; gap: 4px; padding: 4px 2px; }
  .typing-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--text-faint); animation: typingBounce 1.2s ease-in-out infinite; }
  .typing-dot:nth-child(2) { animation-delay: 0.2s; }
  .typing-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes typingBounce { 0%,100%{transform:translateY(0);opacity:0.5} 50%{transform:translateY(-5px);opacity:1} }

  /* Next actions */
  .action-item { display: flex; gap: 14px; align-items: flex-start; padding: 16px; background: var(--card); border: 1px solid var(--border); border-radius: 12px; margin-bottom: 10px; }
  .action-num { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 800; flex-shrink: 0; }
  .action-content { flex: 1; }
  .action-title { font-size: 14px; font-weight: 600; color: white; margin-bottom: 4px; }
  .action-why { font-size: 12px; color: var(--text-dim); line-height: 1.5; margin-bottom: 6px; }

  /* Section headers */
  .section-head { font-family: 'DM Mono', monospace; font-size: 10px; color: var(--text-faint); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
  .section-body { font-size: 13px; color: var(--text-dim); line-height: 1.7; }

  /* Info panels */
  .info-panel { padding: 14px 16px; border-radius: 10px; font-size: 13px; line-height: 1.6; }
  .info-panel.amber { background: var(--amber-glow); border: 1px solid rgba(245,158,11,0.25); color: #FDE68A; }
  .info-panel.blue { background: var(--blue-glow); border: 1px solid rgba(59,130,246,0.25); color: #BFDBFE; }
  .info-panel.green { background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.25); color: #6EE7B7; }
  .info-panel.red { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25); color: #FCA5A5; }

  /* Animations */
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  .fade-up { animation: fadeUp 0.4s ease forwards; }
  .fade-up-1 { animation: fadeUp 0.4s 0.05s ease both; }
  .fade-up-2 { animation: fadeUp 0.4s 0.1s ease both; }
  .fade-up-3 { animation: fadeUp 0.4s 0.15s ease both; }
  .fade-up-4 { animation: fadeUp 0.4s 0.2s ease both; }

  /* Misc */
  .divider { height: 1px; background: var(--border); margin: 20px 0; }
  .inline-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
  .bullet-list { list-style: none; }
  .bullet-list li { padding: 6px 0; font-size: 13px; color: var(--text-dim); line-height: 1.5; display: flex; gap: 8px; }
  .bullet-list li::before { content: '▸'; color: var(--amber); flex-shrink: 0; }
  .highlight-text { font-size: 15px; font-weight: 600; color: white; line-height: 1.6; padding: 16px; background: var(--blue-glow); border: 1px solid rgba(59,130,246,0.25); border-radius: 10px; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--text-faint); border-radius: 2px; }
`;

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
export default function APACSalesAgent() {
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
  const [roiResult, setRoiResult] = useState(null);
  const [linkedInVariant, setLinkedInVariant] = useState(0);
  const [battleCards, setBattleCards] = useState(null);
  const [battleLoading, setBattleLoading] = useState(false);
  const [langData, setLangData] = useState(null);
  const [langLoading, setLangLoading] = useState(false);
  const [liVariants, setLiVariants] = useState(null);
  const [liVariantsLoading, setLiVariantsLoading] = useState(false);
  const [expandedMedd, setExpandedMedd] = useState(null);
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

  const runAnalysis = async () => {
    setStep(3);
    setAnalyzeStep(0);
    const ticker = setInterval(() => setAnalyzeStep(s => Math.min(s + 1, ANALYZE_STEPS.length - 1)), 900);
    try {
      // Live web search for company intel
      let liveIntel = "";
      try {
        setAnalyzeStep(0);
        // web search moved to on-demand
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
${liveIntel ? `
LIVE MARKET INTELLIGENCE (from real-time web search — use this to enrich the brief):
${liveIntel}
` : ""}
Generate the complete 7-module intelligence brief as specified. Where live intelligence is provided above, incorporate specific recent facts, dates, and events into the brief — especially in keyTriggers, whyNow, and painPoints.`;

      const res = await fetch("/api/anthropic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 6000,
          system: buildSystemPrompt(),
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      const clean = text.replace(/```json[\s\S]*?```/g, t => t.slice(7, -3)).replace(/```/g, "").trim();
      const parsed = JSON.parse(clean);
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
      alert("Analysis failed. Please check your connection and try again.");
    }
  };

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
          max_tokens: 6000,
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
      <div className="app">
        {/* Header */}
        <header className="header">
          <div className="header-inner">
            <div className="logo">
              <div className="logo-icon">🎯</div>
              <div>
                <div className="logo-text">APAC Sales Intelligence</div>
                <div className="logo-sub">ANKUR SEHGAL · 7X PRESIDENT'S CLUB</div>
            </div>
            {dealHistory.length > 0 && (
              <button onClick={() => setShowHistory(!showHistory)} style={{ background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.3)", borderRadius:8, padding:"6px 14px", color:"var(--amber)", fontSize:12, fontWeight:700, cursor:"pointer", letterSpacing:1 }}>
                📋 HISTORY ({dealHistory.length})
              </button>
            )}
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
                      <option value="">Select APAC market...</option>
                      {MARKETS.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label className="field-label">INDUSTRY <span>*</span></label>
                  <select value={form.industry} onChange={e => set("industry", e.target.value)}>
                    <option value="">Select industry...</option>
                    {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                  </select>
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
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--amber)", letterSpacing: 3, marginBottom: 6 }}>INTELLIGENCE BRIEF READY</div>
                    <div className="company-title">{form.company}</div>
                    <div className="company-meta">
                      <span className="meta-chip tag-dim">{form.market}</span>
                      <span className="meta-chip tag-dim">{form.industry}</span>
                      {result.accountBrief?.tier && <span className="meta-chip tag-amber">{result.accountBrief.tier}</span>}
                      {result.meddpicc?.forecastCategory && <span className={`meta-chip tag-${statusClass(result.meddpicc.overallHealth)}`}>{result.meddpicc.forecastCategory}</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn-ghost" onClick={() => exportToPDF(result, form)} style={{ display: "flex", alignItems: "center", gap: 6, borderColor: "var(--amber)", color: "var(--amber)" }}>
                      ⬇ Export PDF
                    </button>
                    <button className="btn-ghost" onClick={() => { setStep(1); setResult(null); setForm({ company:"",website:"",market:"",industry:"",product:"",productDesc:"",dealStage:"",dealSize:"",knownContacts:"",recentNews:"",competitorsMentioned:"" }); setChatMessages([]);
      setBattleCards(null); setLangData(null); setLiVariants(null); }}>
                      + New Account
                    </button>
                  </div>
                </div>
              </div>

              {/* Stat strip */}
              {/* PDF Export Bar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, background: "var(--amber-glow)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12, padding: "12px 18px" }}>
                <div style={{ fontSize: 13, color: "var(--amber)", fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>📄 INTELLIGENCE BRIEF READY</div>
                <button
                  onClick={() => exportToPDF(result, form)}
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
                  { id: "brief", label: "📋 BRIEF" },
                  { id: "meddpicc", label: "⚡ MEDDPICC" },
                  { id: "stakeholders", label: "👥 STAKEHOLDERS" },
                  { id: "outreach", label: "✉️ OUTREACH" },
                  { id: "discovery", label: "💬 DISCOVERY" },
                  { id: "com", label: "🏆 COMMAND" },
                  { id: "coach", label: "🎯 COACH" },
                  { id: "battle", label: "⚔️ BATTLE" },
                  { id: "roi", label: "💰 ROI" },
                  { id: "transcript", label: "📞 TRANSCRIPT" },
                  { id: "languages", label: "🌏 LANGUAGES" },
                ].map(t => (
                  <button key={t.id} className={`tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* ── TAB: BRIEF ── */}
              {activeTab === "brief" && result.accountBrief && (
                <div className="fade-up">
                  <div className="card">
                    <div className="card-title">ACCOUNT PROFILE</div>
                    <div className="section-body" style={{ marginBottom: 20 }}>{result.accountBrief.companyProfile}</div>
                    <div className="section-head">WHY NOW</div>
                    <div className="info-panel amber" style={{ marginBottom: 20 }}>{result.accountBrief.whyNow}</div>
                    <div className="section-head">TRIGGER EVENTS</div>
                    <ul className="bullet-list" style={{ marginBottom: 20 }}>
                      {result.accountBrief.keyTriggers?.map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                    <div className="section-head">PAIN POINTS</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {result.accountBrief.painPoints?.map((p, i) => (
                        <div key={i} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6, gap: 10 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "white" }}>{p.pain}</div>
                            <span className={`tag ${urgencyColor(p.urgency)}`}>{p.urgency?.toUpperCase()}</span>
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{p.businessImpact}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-title">MARKET CONTEXT</div>
                    <div className="grid-2">
                      <div>
                        <div className="section-head">BUYING CULTURE</div>
                        <div className="section-body">{result.accountBrief.buyingCulture}</div>
                      </div>
                      <div>
                        <div className="section-head">APAC MARKET CONTEXT</div>
                        <div className="section-body">{result.accountBrief.apacMarketContext}</div>
                      </div>
                    </div>
                    <div className="divider" />
                    <div className="section-head">NEXT BEST ACTIONS</div>
                    {result.nextBestActions?.map((a, i) => (
                      <div className="action-item" key={i}>
                        <div className="action-num" style={{ background: i === 0 ? "var(--amber)" : i === 1 ? "var(--blue)" : "var(--slate)", color: i === 0 ? "var(--navy)" : "white" }}>{a.priority}</div>
                        <div className="action-content">
                          <div className="action-title">{a.action}</div>
                          <div className="action-why">{a.why}</div>
                          <span className="tag tag-dim" style={{ fontSize: 9 }}>{a.timeframe?.toUpperCase()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── TAB: MEDDPICC ── */}
              {activeTab === "meddpicc" && result.meddpicc && (
                <div className="fade-up">
                  <div className="card">
                    <div className="card-title">DEAL HEALTH SCORECARD</div>
                    <div style={{ display: "flex", gap: 20, marginBottom: 20, alignItems: "center" }}>
                      <div style={{ textAlign: "center" }}>
                        {[["green","COMMIT","var(--green)"],["amber","PIPELINE","var(--amber)"],["red","AT RISK","var(--red)"]].find(([s]) => s === result.meddpicc.overallHealth)?.map(([s, label, color], i, arr) => (
                          i === 0 ? null : i === 1 ? <div key={i} style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: arr[2] }}>{label}</div> : null
                        ))}
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--text-faint)", letterSpacing: 1 }}>{result.meddpicc.forecastCategory}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                          {["green","amber","red"].map(s => {
                            const count = Object.values(result.meddpicc.elements).filter(e => e.status === s).length;
                            return <div key={s}><span style={{ fontSize: 20, fontWeight: 800, color: s === "green" ? "var(--green)" : s === "amber" ? "var(--amber)" : "var(--red)", fontFamily: "'Syne', sans-serif" }}>{count}</span><span style={{ fontSize: 11, color: "var(--text-faint)", marginLeft: 4 }}>{statusLabel(s).toLowerCase()}</span></div>;
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="medd-grid">
                      {Object.entries(result.meddpicc.elements).map(([key, el]) => (
                        <div key={key} className={`medd-item ${expandedMedd === key ? "expanded" : ""}`} onClick={() => setExpandedMedd(expandedMedd === key ? null : key)}>
                          <div className="medd-header">
                            <div className="medd-name">{el.label}</div>
                            <div className="medd-status-dot" style={{ background: el.status === "green" ? "var(--green)" : el.status === "amber" ? "var(--amber)" : "var(--red)", boxShadow: `0 0 8px ${el.status === "green" ? "rgba(16,185,129,0.5)" : el.status === "amber" ? "rgba(245,158,11,0.5)" : "rgba(239,68,68,0.5)"}` }} />
                          </div>
                          <div className="medd-evidence">{el.evidence}</div>
                          {expandedMedd === key && (
                            <div className="medd-expanded">
                              <div className="medd-next-action">▸ {el.nextAction}</div>
                              <div style={{ fontSize: 10, color: "var(--text-faint)", letterSpacing: 1, marginBottom: 6, fontFamily: "var(--font-mono)" }}>QUESTIONS TO ASK →</div>
                              {el.questions?.map((q, i) => <div key={i} style={{ fontSize: 12, color: "var(--text-dim)", padding: "4px 0", borderTop: i > 0 ? "1px solid var(--border)" : "none" }}>"{q}"</div>)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-title">DEAL RISKS & WIN CONDITIONS</div>
                    <div className="grid-2">
                      <div>
                        <div className="section-head">TOP DEAL RISKS</div>
                        <ul className="bullet-list">{result.meddpicc.dealRisks?.map((r, i) => <li key={i} style={{ color: "var(--red)" }}>{r}</li>)}</ul>
                      </div>
                      <div>
                        <div className="section-head">WIN CONDITIONS</div>
                        <ul className="bullet-list">{result.meddpicc.winConditions?.map((w, i) => <li key={i} style={{ color: "var(--green)" }}>{w}</li>)}</ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB: STAKEHOLDERS ── */}
              {activeTab === "stakeholders" && result.stakeholders && (
                <div className="fade-up">
                  <div className="card">
                    <div className="card-title">BUYING COMMITTEE MAP</div>
                    <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                      <div className="info-panel blue" style={{ flex: 1, minWidth: 200 }}>
                        <strong>Multithreading Status:</strong> {result.stakeholders.multithreadingStatus}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                        <div style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "'DM Mono', monospace" }}>CHAMPION SCORE</div>
                        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: result.stakeholders.championDevelopmentScore > 70 ? "var(--green)" : result.stakeholders.championDevelopmentScore > 40 ? "var(--amber)" : "var(--red)" }}>
                          {result.stakeholders.championDevelopmentScore}/100
                        </div>
                      </div>
                    </div>
                    <div className="stakeholder-grid">
                      {result.stakeholders.buyingCommittee?.map((s, i) => (
                        <div className="stakeholder-card" key={i}>
                          <div className="stakeholder-header">
                            <div>
                              <div className="stakeholder-role">{s.role}</div>
                              <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
                                <span className={`tag ${archetypeColors[s.archetype] || "tag-dim"}`}>{s.archetype}</span>
                                <span className={`tag ${accessClass(s.accessStatus)}`}>{accessLabel(s.accessStatus)}</span>
                                <span className="tag tag-dim">PRIORITY {s.priority}</span>
                              </div>
                            </div>
                          </div>
                          <div className="stakeholder-body">
                            <div className="stakeholder-field">
                              <div className="sf-label">MOTIVATIONS</div>
                              <div className="sf-value">{s.motivations}</div>
                            </div>
                            <div className="stakeholder-field">
                              <div className="sf-label">FEARS / BLOCKERS</div>
                              <div className="sf-value">{s.fears}</div>
                            </div>
                            <div className="stakeholder-field">
                              <div className="sf-label">ENGAGEMENT STRATEGY</div>
                              <div className="sf-value">{s.engagementStrategy}</div>
                            </div>
                            <div className="stakeholder-field">
                              <div className="sf-label">WARNING SIGN</div>
                              <div className="sf-value" style={{ color: "var(--red)" }}>{s.warningSign}</div>
                            </div>
                          </div>
                          <div className="talk-track">"{s.talkTrack}"</div>
                        </div>
                      ))}
                    </div>
                    {result.stakeholders.championGaps?.length > 0 && (
                      <div style={{ marginTop: 20 }}>
                        <div className="section-head">CHAMPION DEVELOPMENT GAPS</div>
                        <ul className="bullet-list">{result.stakeholders.championGaps.map((g, i) => <li key={i}>{g}</li>)}</ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── TAB: OUTREACH ── */}
              {activeTab === "outreach" && result.outreach && (
                <div className="fade-up">
                  <div className="card">
                    <div className="card-title">COLD EMAIL SEQUENCE</div>
                    {/* Email 1 */}
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ fontSize: 11, color: "var(--amber)", fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>EMAIL 1 — INITIAL OUTREACH</div>
                        <span className="tag tag-amber">DAY 1</span>
                      </div>
                      <div className="email-box">
                        <div className="email-header">
                          <div>
                            <div style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "'DM Mono', monospace", letterSpacing: 1, marginBottom: 3 }}>SUBJECT</div>
                            <div className="email-subject">{result.outreach.coldEmail?.subject}</div>
                            {result.outreach.coldEmail?.preheader && <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>{result.outreach.coldEmail.preheader}</div>}
                          </div>
                          <CopyButton text={`Subject: ${result.outreach.coldEmail?.subject}\n\n${result.outreach.coldEmail?.body}`} />
                        </div>
                        <div className="email-body">{result.outreach.coldEmail?.body}</div>
                      </div>
                    </div>
                    {/* Follow-ups */}
                    {[result.outreach.coldEmail?.followUp1, result.outreach.coldEmail?.followUp2].map((fu, i) => fu && (
                      <div key={i} style={{ marginBottom: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <div style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>EMAIL {i + 2} — {i === 0 ? "FOLLOW-UP" : "BREAK-UP"}</div>
                          <span className="tag tag-dim">DAY {fu.dayToSend}</span>
                        </div>
                        <div className="email-box">
                          <div className="email-header">
                            <div className="email-subject">{fu.subject}</div>
                            <CopyButton text={`Subject: ${fu.subject}\n\n${fu.body}`} />
                          </div>
                          <div className="email-body">{fu.body}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="card">
                    <div className="card-title">OTHER CHANNELS</div>
                    <div className="grid-2">
                      <div>
                        <div className="section-head">LINKEDIN CONNECTION MESSAGE</div>
                        {!liVariants ? (
                          <div style={{ marginBottom:10 }}>
                            <button onClick={() => generateLiVariants(form, result, setLiVariants, setLiVariantsLoading)}
                              disabled={liVariantsLoading}
                              style={{ background:"rgba(26,86,219,0.1)", border:"1px solid rgba(26,86,219,0.3)", borderRadius:8, padding:"7px 16px", color:"var(--blue-light)", fontSize:12, fontWeight:700, cursor:"pointer", opacity:liVariantsLoading?0.6:1 }}>
                              {liVariantsLoading ? "Generating..." : "+ Generate 3 Variants"}
                            </button>
                          </div>
                        ) : (
                          <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                            {liVariants.map((v,i) => (
                              <button key={i} onClick={() => setLinkedInVariant(i)} style={{ flex:1, padding:"7px 6px", borderRadius:8, border:"1px solid", cursor:"pointer", fontSize:11, fontWeight:700,
                                borderColor: linkedInVariant===i ? "var(--amber)" : "var(--border)",
                                background: linkedInVariant===i ? "rgba(245,158,11,0.1)" : "transparent",
                                color: linkedInVariant===i ? "var(--amber)" : "var(--text-muted)" }}>
                                {v.type}
                              </button>
                            ))}
                          </div>
                        )}
                        <div style={{ background: "var(--card)", borderRadius: 10, padding: 14, fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 8, fontStyle:"italic" }}>
                          {liVariants?.[linkedInVariant]?.message || result.outreach.linkedInMessage}
                        </div>
                        <CopyButton text={liVariants?.[linkedInVariant]?.message || result.outreach.linkedInMessage} />
                      </div>
                      <div>
                        <div className="section-head">CHAMPION → EXEC REFERRAL</div>
                        <div style={{ background: "var(--card)", borderRadius: 10, padding: 14, fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 8 }}>
                          {result.outreach.executiveReferral}
                        </div>
                        <CopyButton text={result.outreach.executiveReferral} />
                      </div>
                    </div>
                    <div className="divider" />
                    <div className="section-head">SENDING TIPS FOR THIS PROSPECT</div>
                    <ul className="bullet-list">{result.outreach.sendingTips?.map((t, i) => <li key={i}>{t}</li>)}</ul>
                  </div>
                </div>
              )}

              {/* ── TAB: DISCOVERY ── */}
              {activeTab === "discovery" && result.discoveryQuestions && (
                <div className="fade-up">
                  <div className="card">
                    <div className="card-title">DISCOVERY CALL PREP</div>
                    <div className="section-head">OPENING FRAMER</div>
                    <div className="highlight-text" style={{ marginBottom: 24 }}>"{result.discoveryQuestions.openingFramer}"</div>
                    {result.discoveryQuestions.categories?.map((cat, ci) => (
                      <div className="q-category" key={ci}>
                        <div className="q-cat-title">{cat.category}</div>
                        {cat.questions?.map((q, qi) => (
                          <div className="q-item" key={qi}>
                            <div className="q-text">{q.question}</div>
                            <div className="q-meta">
                              {q.intent && <span className="q-intent">Intent: {q.intent}</span>}
                              {q.followUp && <span className="q-followup"> · If vague: {q.followUp}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                    <div className="divider" />
                    <div className="grid-2">
                      <div>
                        <div className="section-head">RED FLAG ANSWERS</div>
                        <ul className="bullet-list">{result.discoveryQuestions.redFlags?.map((r, i) => <li key={i} style={{ color: "var(--red)" }}>{r}</li>)}</ul>
                      </div>
                      <div>
                        <div className="section-head">IDEAL CALL OUTCOME</div>
                        <div className="info-panel green">{result.discoveryQuestions.idealCallOutcome}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB: COMMAND OF MESSAGE ── */}
              {activeTab === "com" && result.commandOfMessage && (
                <div className="fade-up">
                  <div className="card">
                    <div className="card-title">COMMAND OF THE MESSAGE</div>
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
                        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: "var(--amber)" }}>{result.commandOfMessage.salesStage}</div>
                        <span className="tag tag-amber">RECOMMENDED STAGE</span>
                      </div>
                      <div className="section-body">{result.commandOfMessage.stageRationale}</div>
                    </div>
                    <div className="com-before-after">
                      <div className="com-before">
                        <div className="com-box-label" style={{ color: "var(--red)" }}>BEFORE SCENARIO — TODAY</div>
                        <div className="com-box-text" style={{ color: "#FCA5A5" }}>{result.commandOfMessage.beforeScenario}</div>
                      </div>
                      <div className="com-after">
                        <div className="com-box-label" style={{ color: "var(--green)" }}>AFTER SCENARIO — 12 MONTHS IN</div>
                        <div className="com-box-text" style={{ color: "#6EE7B7" }}>{result.commandOfMessage.afterScenario}</div>
                      </div>
                    </div>
                    <div className="section-head">VALUE DRIVERS</div>
                    {result.commandOfMessage.valueDrivers?.map((v, i) => (
                      <div className="value-driver" key={i}>
                        <div className="vd-icon">{i === 0 ? "💰" : i === 1 ? "🛡️" : "📈"}</div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--amber)", marginBottom: 4 }}>{v.driver}</div>
                          <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 4 }}>{v.specifics}</div>
                          <span className="tag tag-green" style={{ fontSize: 10 }}>{v.estimatedImpact}</span>
                        </div>
                      </div>
                    ))}
                    <div className="divider" />
                    <div className="section-head">REQUIRED CAPABILITIES</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
                      {result.commandOfMessage.requiredCapabilities?.map((rc, i) => (
                        <div key={i} style={{ background: "var(--card)", borderRadius: 10, padding: 12, border: "1px solid var(--border)" }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "white", marginBottom: 6 }}>{rc.capability}</div>
                          <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.5 }}>{rc.proofPoint}</div>
                        </div>
                      ))}
                    </div>
                    <div className="section-head">UNIQUE DIFFERENTIATORS</div>
                    <ul className="bullet-list" style={{ marginBottom: 20 }}>
                      {result.commandOfMessage.uniqueDifferentiators?.map((d, i) => <li key={i} style={{ color: "var(--blue-light)" }}>{d}</li>)}
                    </ul>
                    <div className="section-head">OBJECTION HANDLERS</div>
                    {result.commandOfMessage.objectionHandlers?.map((o, i) => (
                      <div className="objection-item" key={i}>
                        <div className="obj-q">"{o.objection}"</div>
                        <div className="obj-a">{o.response}</div>
                      </div>
                    ))}
                    <div className="divider" />
                    <div className="section-head">CLOSING HYPOTHESIS</div>
                    <div className="highlight-text">{result.commandOfMessage.closingHypothesis}</div>
                  </div>
                </div>
              )}

              {/* ── TAB: BATTLE CARDS ── */}
              {activeTab === "battle" && (
                <div className="fade-up-1">
                  {!battleCards ? (
                    <div style={{ textAlign:"center", padding:"60px 20px" }}>
                      <div style={{ fontSize:48, marginBottom:16 }}>⚔️</div>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:"var(--amber)", marginBottom:8 }}>Battle Cards</div>
                      <div style={{ color:"var(--text-muted)", fontSize:14, marginBottom:24 }}>
                        {form.competitorsMentioned ? `Generate battle cards for: ${form.competitorsMentioned}` : "Add competitor names in the deal context form first."}
                      </div>
                      {form.competitorsMentioned && (
                        <button onClick={() => generateBattleCards(form.competitorsMentioned, form, result, setBattleCards, setBattleLoading)}
                          disabled={battleLoading}
                          style={{ background:"linear-gradient(135deg,var(--amber),var(--orange))", border:"none", borderRadius:10, padding:"14px 32px", color:"var(--navy)", fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:900, cursor:"pointer", letterSpacing:1, opacity:battleLoading?0.6:1 }}>
                          {battleLoading ? "GENERATING..." : "⚔️ GENERATE BATTLE CARDS"}
                        </button>
                      )}
                    </div>
                  ) : (
                    battleCards?.map((card, i) => (
                      <div key={i} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:24, marginBottom:20 }}>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
                          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:900, color:"var(--text)" }}>{card.competitor}</div>
                          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:"var(--amber)", border:"1px solid var(--amber)", borderRadius:6, padding:"4px 10px" }}>BATTLE CARD</div>
                        </div>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
                          <div style={{ background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.2)", borderRadius:8, padding:16 }}>
                            <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:"#10B981", marginBottom:10 }}>OUR STRENGTHS VS THEM</div>
                            {card.ourStrengths?.map((s,j) => <div key={j} style={{ fontSize:13, color:"var(--text)", marginBottom:6, paddingLeft:12, borderLeft:"2px solid #10B981" }}>{s}</div>)}
                          </div>
                          <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:8, padding:16 }}>
                            <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:"#EF4444", marginBottom:10 }}>THEIR WEAKNESSES</div>
                            {card.theirWeaknesses?.map((w,j) => <div key={j} style={{ fontSize:13, color:"var(--text)", marginBottom:6, paddingLeft:12, borderLeft:"2px solid #EF4444" }}>{w}</div>)}
                          </div>
                        </div>
                        <div style={{ background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:8, padding:16, marginBottom:16 }}>
                          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:"var(--amber)", marginBottom:10 }}>WIN MOVES — HOW TO BEAT THEM</div>
                          {card.winMoves?.map((m,j) => (
                            <div key={j} style={{ display:"flex", gap:10, marginBottom:8, alignItems:"flex-start" }}>
                              <span style={{ color:"var(--amber)", fontWeight:700, minWidth:20 }}>{j+1}.</span>
                              <span style={{ fontSize:13, color:"var(--text)" }}>{m}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                          <div>
                            <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:"var(--blue-light)", marginBottom:8 }}>TRAP QUESTIONS</div>
                            {card.trapQuestions?.map((q,j) => <div key={j} style={{ fontSize:12, color:"var(--text-muted)", marginBottom:6, fontStyle:"italic" }}>&quot;{q}&quot;</div>)}
                          </div>
                          <div>
                            <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:"#A78BFA", marginBottom:8 }}>LANDMINES TO PLANT</div>
                            {card.landmines?.map((l,j) => <div key={j} style={{ fontSize:12, color:"var(--text-muted)", marginBottom:6 }}>{l}</div>)}
                          </div>
                        </div>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginTop:16 }}>
                          <div style={{ background:"rgba(16,185,129,0.05)", borderRadius:8, padding:12 }}>
                            <div style={{ fontSize:11, fontWeight:700, color:"#10B981", marginBottom:6 }}>WHEN WE WIN</div>
                            <div style={{ fontSize:13, color:"var(--text-muted)" }}>{card.whenWeWin}</div>
                          </div>
                          <div style={{ background:"rgba(239,68,68,0.05)", borderRadius:8, padding:12 }}>
                            <div style={{ fontSize:11, fontWeight:700, color:"#EF4444", marginBottom:6 }}>WHEN WE LOSE</div>
                            <div style={{ fontSize:13, color:"var(--text-muted)" }}>{card.whenWeLose}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {battleCards && (
                    <button onClick={() => setBattleCards(null)} style={{ marginTop:16, background:"transparent", border:"1px solid var(--border)", borderRadius:8, padding:"8px 20px", color:"var(--text-muted)", fontSize:12, cursor:"pointer" }}>
                      Regenerate
                    </button>
                  )}
                </div>
              )}

              {/* ── TAB: MULTI-LANGUAGE OUTREACH ── */}
              {activeTab === "languages" && (
                <div className="fade-up-1">
                  <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:20, marginBottom:20 }}>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:800, color:"var(--amber)", marginBottom:6 }}>Multi-Language Outreach</div>
                    <div style={{ color:"var(--text-muted)", fontSize:13, marginBottom:16 }}>Same message, localised for every APAC market. Select language to view.</div>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                      {[["bahasa","Bahasa"],["mandarin","Mandarin"],["thai","Thai"],["tagalog","Filipino"]].map(([key,label]) => (
                        <button key={key} onClick={() => setSelectedLanguage(key)}
                          style={{ padding:"8px 16px", borderRadius:8, border:"1px solid", fontSize:13, fontWeight:600, cursor:"pointer",
                            borderColor: selectedLanguage === key ? "var(--amber)" : "var(--border)",
                            background: selectedLanguage === key ? "rgba(245,158,11,0.1)" : "transparent",
                            color: selectedLanguage === key ? "var(--amber)" : "var(--text-muted)" }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {!langData && (
                    <div style={{ textAlign:"center", padding:"40px 20px" }}>
                      <button onClick={() => generateLanguages(form, result, setLangData, setLangLoading)}
                        disabled={langLoading}
                        style={{ background:"linear-gradient(135deg,var(--amber),var(--orange))", border:"none", borderRadius:10, padding:"14px 32px", color:"var(--navy)", fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:900, cursor:"pointer", letterSpacing:1, opacity:langLoading?0.6:1 }}>
                        {langLoading ? "GENERATING..." : "🌏 GENERATE LANGUAGES"}
                      </button>
                    </div>
                  )}
                  {langData?.[selectedLanguage] && (() => {
                    const lang = langData[selectedLanguage];
                    return (
                      <div>
                        <div style={{ background:"rgba(245,158,11,0.06)", border:"1px solid rgba(245,158,11,0.15)", borderRadius:8, padding:14, marginBottom:16 }}>
                          <div style={{ fontSize:11, fontWeight:700, color:"var(--amber)", marginBottom:6 }}>CULTURAL NOTE</div>
                          <div style={{ fontSize:13, color:"var(--text)" }}>{lang.culturalNote}</div>
                        </div>
                        <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:20, marginBottom:16 }}>
                          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:"var(--text-muted)", marginBottom:8 }}>EMAIL SUBJECT</div>
                          <div style={{ background:"rgba(26,86,219,0.1)", border:"1px solid rgba(26,86,219,0.2)", borderRadius:8, padding:12, fontSize:14, fontWeight:600, color:"var(--blue-light)", marginBottom:16 }}>{lang.emailSubject}</div>
                          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:"var(--text-muted)", marginBottom:8 }}>EMAIL BODY</div>
                          <div style={{ background:"var(--bg)", borderRadius:8, padding:16, fontSize:13, color:"var(--text)", lineHeight:1.7, whiteSpace:"pre-wrap" }}>{lang.emailBody}</div>
                        </div>
                        <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:20 }}>
                          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:"var(--text-muted)", marginBottom:8 }}>LINKEDIN MESSAGE</div>
                          <div style={{ background:"var(--bg)", borderRadius:8, padding:16, fontSize:13, color:"var(--text)", fontStyle:"italic" }}>&quot;{lang.linkedIn}&quot;</div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ── TAB: ROI BUILDER ── */}
              {activeTab === "roi" && (
                <div className="fade-up-1">
                  <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:24, marginBottom:20 }}>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:900, color:"var(--amber)", marginBottom:4 }}>ROI & Business Case Builder</div>
                    <div style={{ color:"var(--text-muted)", fontSize:13, marginBottom:20 }}>Build a CFO-ready business case in 60 seconds. Enter their numbers to quantify the cost of inaction.</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
                      {[
                        ["employees","Finance / Reporting Team Size","e.g. 25"],
                        ["avgSalary","Average Annual Salary (USD)","e.g. 85000"],
                        ["hoursPerWeek","Hours/Week on Manual Reporting","e.g. 12"],
                        ["currentErrors","Reporting Errors Per Year","e.g. 8"],
                        ["dealSize","Your Solution ACV (USD)","e.g. 200000"],
                      ].map(([key,label,ph]) => (
                        <div key={key}>
                          <div style={{ fontSize:11, fontWeight:700, letterSpacing:1, color:"var(--text-muted)", marginBottom:6 }}>{label.toUpperCase()}</div>
                          <input type="number" placeholder={ph} value={roiInputs[key]}
                            onChange={e => setRoiInputs(p => ({...p, [key]: e.target.value}))}
                            style={{ width:"100%", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:8, padding:"10px 14px", color:"var(--text)", fontSize:14 }} />
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setRoiResult(calcROI(roiInputs, result))}
                      style={{ background:"linear-gradient(135deg,var(--amber),var(--orange))", border:"none", borderRadius:10, padding:"14px 32px", color:"var(--navy)", fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:900, cursor:"pointer", letterSpacing:1 }}>
                      CALCULATE ROI
                    </button>
                  </div>
                  {roiResult && (
                    <div>
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:20 }}>
                        {[
                          ["ROI", `${roiResult.roi}%`, "#10B981"],
                          ["Payback Period", `${roiResult.payback} months`, "#F59E0B"],
                          ["Monthly Cost of Inaction", `$${roiResult.costOfInaction.toLocaleString()}`, "#EF4444"],
                        ].map(([label,val,color]) => (
                          <div key={label} style={{ background:"var(--card)", border:`1px solid ${color}33`, borderRadius:12, padding:20, textAlign:"center" }}>
                            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:900, color }}>{val}</div>
                            <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:4, letterSpacing:1 }}>{label.toUpperCase()}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:24, marginBottom:16 }}>
                        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:800, color:"var(--amber)", marginBottom:16, letterSpacing:1 }}>COST BREAKDOWN</div>
                        {[
                          ["Labor Savings (70% efficiency gain)", roiResult.laborSavings, "#10B981"],
                          ["Error & Rework Cost Elimination", roiResult.errorCost, "#10B981"],
                          ["Total Annual Benefit", roiResult.totalBenefit, "#F59E0B"],
                        ].map(([label,val,color]) => (
                          <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:"1px solid var(--border)" }}>
                            <span style={{ fontSize:13, color:"var(--text)" }}>{label}</span>
                            <span style={{ fontSize:15, fontWeight:700, color }}>${val.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:12, padding:20 }}>
                        <div style={{ fontSize:11, fontWeight:700, color:"var(--amber)", marginBottom:10, letterSpacing:1 }}>CFO TALK TRACK</div>
                        <div style={{ fontSize:14, color:"var(--text)", lineHeight:1.7, fontStyle:"italic" }}>
                          "Based on your team size and current processes, the cost of inaction is approximately ${roiResult.costOfInaction.toLocaleString()} per month — or ${roiResult.totalBenefit.toLocaleString()} annually. Our solution delivers a {roiResult.roi}% ROI with a {roiResult.payback}-month payback period. Every month you delay costs more than the solution itself."
                        </div>
                        <button onClick={() => navigator.clipboard.writeText(`Based on your team size and current processes, the cost of inaction is approximately $${roiResult.costOfInaction.toLocaleString()} per month — or $${roiResult.totalBenefit.toLocaleString()} annually. Our solution delivers a ${roiResult.roi}% ROI with a ${roiResult.payback}-month payback period. Every month you delay costs more than the solution itself.`)}
                          style={{ marginTop:12, background:"transparent", border:"1px solid var(--amber)", borderRadius:6, padding:"6px 16px", color:"var(--amber)", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                          COPY TALK TRACK
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB: TRANSCRIPT ANALYSER ── */}
              {activeTab === "transcript" && (
                <div className="fade-up-1">
                  <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:24, marginBottom:20 }}>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:900, color:"var(--amber)", marginBottom:4 }}>Call Transcript Analyser</div>
                    <div style={{ color:"var(--text-muted)", fontSize:13, marginBottom:16 }}>Paste your call transcript below. AI extracts MEDDPICC signals, buying signals, red flags, missed opportunities, and generates your follow-up email.</div>
                    <textarea value={transcript} onChange={e => setTranscript(e.target.value)}
                      placeholder="Paste full call transcript here... (Zoom auto-transcript, Gong export, manual notes — any format works)"
                      style={{ width:"100%", minHeight:200, background:"var(--bg)", border:"1px solid var(--border)", borderRadius:8, padding:16, color:"var(--text)", fontSize:13, lineHeight:1.6, resize:"vertical", marginBottom:16, boxSizing:"border-box" }} />
                    <button onClick={async () => {
                      if (!transcript.trim()) return;
                      setTranscriptLoading(true); setTranscriptResult(null);
                      try { setTranscriptResult(await analyseTranscript(transcript, form, result)); }
                      catch(e) { alert("Analysis failed. Try again."); }
                      setTranscriptLoading(false);
                    }} disabled={transcriptLoading || !transcript.trim()}
                      style={{ background:"linear-gradient(135deg,var(--amber),var(--orange))", border:"none", borderRadius:10, padding:"14px 32px", color:"var(--navy)", fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:900, cursor:"pointer", letterSpacing:1, opacity: transcriptLoading || !transcript.trim() ? 0.6 : 1 }}>
                      {transcriptLoading ? "ANALYSING..." : "ANALYSE CALL"}
                    </button>
                  </div>
                  {transcriptResult && (
                    <div>
                      <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:20, marginBottom:16 }}>
                        <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:"var(--amber)", marginBottom:10 }}>CALL SUMMARY</div>
                        <div style={{ fontSize:14, color:"var(--text)", lineHeight:1.7 }}>{transcriptResult.summary}</div>
                        <div style={{ display:"flex", gap:10, marginTop:12 }}>
                          {[["improved","#10B981"],["unchanged","#F59E0B"],["deteriorated","#EF4444"]].map(([s,c]) => (
                            <div key={s} style={{ padding:"4px 12px", borderRadius:6, background: transcriptResult.dealHealthChange===s ? c+"33" : "transparent", border:`1px solid ${transcriptResult.dealHealthChange===s ? c : "var(--border)"}`, fontSize:11, fontWeight:700, color: transcriptResult.dealHealthChange===s ? c : "var(--text-muted)", textTransform:"uppercase" }}>{s}</div>
                          ))}
                        </div>
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:16 }}>
                        <div style={{ background:"rgba(16,185,129,0.06)", border:"1px solid rgba(16,185,129,0.2)", borderRadius:12, padding:16 }}>
                          <div style={{ fontSize:11, fontWeight:700, color:"#10B981", marginBottom:10, letterSpacing:1 }}>BUYING SIGNALS</div>
                          {transcriptResult.positiveSignals?.map((s,i) => <div key={i} style={{ fontSize:12, color:"var(--text)", marginBottom:6, paddingLeft:10, borderLeft:"2px solid #10B981" }}>{s}</div>)}
                        </div>
                        <div style={{ background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:12, padding:16 }}>
                          <div style={{ fontSize:11, fontWeight:700, color:"#EF4444", marginBottom:10, letterSpacing:1 }}>RED FLAGS</div>
                          {transcriptResult.redFlags?.map((r,i) => <div key={i} style={{ fontSize:12, color:"var(--text)", marginBottom:6, paddingLeft:10, borderLeft:"2px solid #EF4444" }}>{r}</div>)}
                        </div>
                        <div style={{ background:"rgba(167,139,250,0.06)", border:"1px solid rgba(167,139,250,0.2)", borderRadius:12, padding:16 }}>
                          <div style={{ fontSize:11, fontWeight:700, color:"#A78BFA", marginBottom:10, letterSpacing:1 }}>MISSED OPPORTUNITIES</div>
                          {transcriptResult.missedOpportunities?.map((m,i) => <div key={i} style={{ fontSize:12, color:"var(--text)", marginBottom:6, paddingLeft:10, borderLeft:"2px solid #A78BFA" }}>{m}</div>)}
                        </div>
                      </div>
                      <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:20, marginBottom:16 }}>
                        <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:"var(--amber)", marginBottom:12 }}>NEXT ACTIONS</div>
                        {transcriptResult.nextActions?.map((a,i) => (
                          <div key={i} style={{ display:"flex", gap:12, padding:"10px 0", borderBottom:"1px solid var(--border)", alignItems:"flex-start" }}>
                            <div style={{ minWidth:24, height:24, borderRadius:"50%", background: i===0?"var(--amber)":i===1?"var(--blue)":"var(--border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color: i<2?"var(--navy)":"var(--text)" }}>{i+1}</div>
                            <div style={{ flex:1 }}>
                              <div style={{ fontSize:13, color:"var(--text)", fontWeight:600 }}>{a.action}</div>
                              <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:2 }}>{a.owner} · {a.timeframe}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ background:"rgba(245,158,11,0.06)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:12, padding:20, marginBottom:16 }}>
                        <div style={{ fontSize:11, fontWeight:700, color:"var(--amber)", marginBottom:8, letterSpacing:1 }}>COACHING NOTE</div>
                        <div style={{ fontSize:13, color:"var(--text)", fontStyle:"italic" }}>{transcriptResult.coachingNote}</div>
                      </div>
                      <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:20 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:"var(--text-muted)" }}>FOLLOW-UP EMAIL</div>
                          <button onClick={() => navigator.clipboard.writeText(transcriptResult.followUpEmail?.body || "")} style={{ background:"transparent", border:"1px solid var(--border)", borderRadius:6, padding:"4px 12px", color:"var(--text-muted)", fontSize:11, cursor:"pointer" }}>Copy</button>
                        </div>
                        <div style={{ background:"rgba(26,86,219,0.1)", border:"1px solid rgba(26,86,219,0.2)", borderRadius:8, padding:10, fontSize:13, fontWeight:600, color:"var(--blue-light)", marginBottom:12 }}>{transcriptResult.followUpEmail?.subject}</div>
                        <div style={{ background:"var(--bg)", borderRadius:8, padding:16, fontSize:13, color:"var(--text)", lineHeight:1.7, whiteSpace:"pre-wrap" }}>{transcriptResult.followUpEmail?.body}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB: DEAL COACH ── */}
              {activeTab === "coach" && (
                <div className="fade-up">
                  <div className="chat-window">
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10, background: "var(--navy2)" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 8px rgba(16,185,129,0.5)" }} />
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--amber)", letterSpacing: 1 }}>DEAL COACH · ANKUR SEHGAL · ACTIVE SESSION</div>
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
                      <button key={i} onClick={() => { setChatInput(q); }} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 20, padding: "6px 14px", fontSize: 11, color: "var(--text-dim)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s" }}
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
