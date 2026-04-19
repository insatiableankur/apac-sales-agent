import Landing from "./Landing";
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

const stripCiteTags = (val) => {
  if (typeof val === 'string') return val.replace(new RegExp('<[^>]+>', 'g'), '');
  if (Array.isArray(val)) return val.map(stripCiteTags);
  if (val && typeof val === 'object') {
    const out = {};
    for (const k in val) out[k] = stripCiteTags(val[k]);
    return out;
  }
  return val;
};
const DEAL_SIZES = ["< $50K ACV","$50K – $100K ACV","$100K – $250K ACV","$250K – $500K ACV","$500K – $1M ACV","$1M+ ACV"];
const PRODUCTS = ["Financial Reporting & ESG Platform","HCM / Workforce Management","CRM / Revenue Intelligence","Customer Engagement / Messaging","Data & Analytics Platform","ERP / Finance Automation","Cybersecurity / GRC","Supply Chain Management","Marketing Automation","Learning & Development","Other SaaS Platform"];

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
const buildSystemPrompt = () => `You are the Global Enterprise SaaS Sales Intelligence Engine trained on Ankur Sehgal's methodologies: 15 years enterprise SaaS across APAC, MEA, Europe & Americas, 7x President's Club, $25M ARR. Return ONLY valid JSON — no markdown, no preamble:

{"accountBrief":{"icpScore":87,"icpRating":"Strong Fit","tier":"Tier 1 — Strategic","dealPotential":"$200K–$400K ACV","companyProfile":"2-3 sentence snapshot.","whyNow":"Why engage now.","keyTriggers":["Trigger 1","Trigger 2","Trigger 3"],"painPoints":[{"pain":"Pain 1","businessImpact":"Impact","urgency":"high"},{"pain":"Pain 2","businessImpact":"Impact","urgency":"medium"},{"pain":"Pain 3","businessImpact":"Impact","urgency":"low"}],"buyingCulture":"How they buy.","marketContext":"Relevant local market, regulatory and competitive context for this country/region."},"meddpicc":{"overallHealth":"amber","forecastCategory":"Pipeline","elements":{"metrics":{"status":"red","label":"Metrics","description":"...","evidence":"...","nextAction":"...","questions":["Q1","Q2"]},"economicBuyer":{"status":"amber","label":"Economic Buyer","description":"...","evidence":"...","nextAction":"...","questions":["Q1","Q2"]},"decisionCriteria":{"status":"green","label":"Decision Criteria","description":"...","evidence":"...","nextAction":"...","questions":["Q1","Q2"]},"decisionProcess":{"status":"red","label":"Decision Process","description":"...","evidence":"...","nextAction":"...","questions":["Q1","Q2"]},"paperProcess":{"status":"red","label":"Paper Process","description":"...","evidence":"...","nextAction":"...","questions":["Q1","Q2"]},"identifiedPain":{"status":"green","label":"Identified Pain","description":"...","evidence":"...","nextAction":"...","questions":["Q1","Q2"]},"champion":{"status":"amber","label":"Champion","description":"...","evidence":"...","nextAction":"...","questions":["Q1","Q2"]},"competition":{"status":"amber","label":"Competition","description":"...","evidence":"...","nextAction":"...","questions":["Q1","Q2"]}},"dealRisks":["Risk 1","Risk 2","Risk 3"],"winConditions":["Condition 1","Condition 2","Condition 3"]},"stakeholders":{"buyingCommittee":[{"role":"Group CFO","archetype":"Economic Buyer","priority":1,"accessStatus":"not-engaged","motivations":"...","fears":"...","engagementStrategy":"...","talkTrack":"...","warningSign":"..."},{"role":"Head of Finance Transformation","archetype":"Champion","priority":2,"accessStatus":"engaged","motivations":"...","fears":"...","engagementStrategy":"...","talkTrack":"...","warningSign":"..."},{"role":"IT Director","archetype":"Technical Evaluator","priority":3,"accessStatus":"not-engaged","motivations":"...","fears":"...","engagementStrategy":"...","talkTrack":"...","warningSign":"..."},{"role":"Head of Procurement","archetype":"Gatekeeper","priority":4,"accessStatus":"unknown","motivations":"...","fears":"...","engagementStrategy":"...","talkTrack":"...","warningSign":"..."}],"championDevelopmentScore":45,"championGaps":["Gap 1","Gap 2","Gap 3"],"multithreadingStatus":"Status."},"outreach":{"coldEmail":{"subject":"Subject","preheader":"Preview","body":"Full email 150-200 words. Hook, Peer Frame, Insight, Soft Ask, Social Proof.","followUp1":{"dayToSend":5,"subject":"FU subject","body":"3-sentence follow-up."},"followUp2":{"dayToSend":12,"subject":"Final subject","body":"Break-up style."}},"linkedInMessage":"Under 300 chars.","executiveReferral":"Champion to EB intro template.","sendingTips":["Tip 1","Tip 2","Tip 3"]},"discoveryQuestions":{"openingFramer":"Agenda setter.","categories":[{"category":"Current State & Pain","questions":[{"question":"...","intent":"...","followUp":"..."},{"question":"...","intent":"...","followUp":"..."},{"question":"...","intent":"...","followUp":"..."}]},{"category":"Business Impact","questions":[{"question":"...","intent":"...","followUp":"..."},{"question":"...","intent":"...","followUp":"..."},{"question":"...","intent":"...","followUp":"..."}]},{"category":"Decision Process","questions":[{"question":"...","intent":"...","followUp":"..."},{"question":"...","intent":"...","followUp":"..."},{"question":"...","intent":"...","followUp":"..."}]},{"category":"Urgency","questions":[{"question":"...","intent":"...","followUp":"..."},{"question":"...","intent":"...","followUp":"..."}]},{"category":"Champion Development","questions":[{"question":"...","intent":"...","followUp":"..."},{"question":"...","intent":"...","followUp":"..."}]}],"redFlags":["Flag 1","Flag 2","Flag 3"],"idealCallOutcome":"Perfect discovery outcome."},"commandOfMessage":{"salesStage":"Evaluation","stageRationale":"Why at this stage.","beforeScenario":"Life without solution.","afterScenario":"Success after 12 months.","requiredCapabilities":[{"capability":"...","proofPoint":"..."},{"capability":"...","proofPoint":"..."},{"capability":"...","proofPoint":"..."}],"uniqueDifferentiators":["D1","D2","D3"],"valueDrivers":[{"driver":"Cost Reduction","specifics":"...","estimatedImpact":"$X"},{"driver":"Risk Mitigation","specifics":"...","estimatedImpact":"..."},{"driver":"Revenue Growth","specifics":"...","estimatedImpact":"$X"}],"objectionHandlers":[{"objection":"...","response":"..."},{"objection":"...","response":"..."},{"objection":"...","response":"..."}],"closingHypothesis":"Single compelling reason to buy."},"nextBestActions":[{"priority":1,"action":"Action 1","why":"Why","timeframe":"This week"},{"priority":2,"action":"Action 2","why":"Why","timeframe":"Next 2 weeks"},{"priority":3,"action":"Action 3","why":"Why","timeframe":"This month"}]}

Be deeply specific to the company, market, country, industry, product and deal stage. Reference relevant local regulations, market dynamics, buying culture and competitive landscape for the specific country/region provided.`;


// ─── PDF EXPORT ───────────────────────────────────────────────────────────────
// ─── CSV/EXCEL IMPORT ────────────────────────────────────────────────────────

const detectSource = (headers) => {
  const h = headers.map(x => x.toLowerCase());
  if (h.some(x => x.includes('zi_') || x.includes('zoominfo'))) return 'zoominfo';
  if (h.some(x => x.includes('apollo') || x.includes('account_name'))) return 'apollo';
  if (h.some(x => x.includes('clay') || x.includes('enriched'))) return 'clay';
  if (h.some(x => x.includes('linkedin') || x.includes('sales navigator'))) return 'linkedin';
  return 'generic';
};

const COL_MAP = {
  zoominfo: { firstName:'First Name', lastName:'Last Name', title:'Job Title', email:'Email Address', company:'Company Name', department:'Department', seniority:'Management Level', linkedin:'LinkedIn URL', phone:'Mobile phone', city:'City', country:'Country' },
  apollo:   { firstName:'First Name', lastName:'Last Name', title:'Title', email:'Email', company:'Company', department:'Department', seniority:'Seniority', linkedin:'LinkedIn Url', phone:'Phone', city:'City', country:'Country' },
  clay:     { firstName:'First Name', lastName:'Last Name', title:'Job Title', email:'Email', company:'Company Name', department:'Department', seniority:'Seniority Level', linkedin:'LinkedIn URL', phone:'Phone Number', city:'City', country:'Country' },
  linkedin: { firstName:'First Name', lastName:'Last Name', title:'Title', email:'Email Address', company:'Company', department:'Function', seniority:'Seniority', linkedin:'Profile URL', phone:'', city:'Geography', country:'Country' },
  generic:  { firstName:'first_name', lastName:'last_name', title:'title', email:'email', company:'company', department:'department', seniority:'seniority', linkedin:'linkedin', phone:'phone', city:'city', country:'country' },
};

const TITLE_ARCHETYPES = [
  { patterns:['cfo','chief financial','vp finance','finance director','head of finance'], archetype:'Economic Buyer' },
  { patterns:['ceo','chief executive','president','managing director','coo'], archetype:'Economic Buyer' },
  { patterns:['cto','chief technology','vp engineering','head of technology','it director'], archetype:'Technical Evaluator' },
  { patterns:['ciso','security','compliance','risk'], archetype:'Technical Evaluator' },
  { patterns:['procurement','purchasing','vendor','sourcing','supply chain'], archetype:'Gatekeeper' },
  { patterns:['transformation','innovation','change','digital','strategy'], archetype:'Champion' },
  { patterns:['operations','ops','process','efficiency'], archetype:'Champion' },
  { patterns:['manager','analyst','specialist','coordinator','associate'], archetype:'End User' },
];

const inferArchetype = (title) => {
  if (!title) return 'Influencer';
  const t = title.toLowerCase();
  for (const { patterns, archetype } of TITLE_ARCHETYPES) {
    if (patterns.some(p => t.includes(p))) return archetype;
  }
  return 'Influencer';
};

const SENIORITY_ORDER = ['c-suite','vp','director','manager','senior','associate','entry'];
const inferSeniority = (seniority, title) => {
  const s = (seniority || title || '').toLowerCase();
  if (s.includes('c-suite') || s.includes('chief') || s.includes('ceo') || s.includes('cfo') || s.includes('cto')) return 0;
  if (s.includes('vp') || s.includes('vice president')) return 1;
  if (s.includes('director') || s.includes('head of')) return 2;
  if (s.includes('manager') || s.includes('lead')) return 3;
  if (s.includes('senior') || s.includes('sr.')) return 4;
  return 5;
};

const parseCSV = (text) => {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  // Detect delimiter
  const delimiters = [',', '	', ';', '|'];
  const counts = delimiters.map(d => (lines[0].match(new RegExp('\\' + d, 'g')) || []).length);
  const delimiter = delimiters[counts.indexOf(Math.max(...counts))];
  // Parse with quote handling
  const parseRow = (row) => {
    const result = [];
    let current = '';
    let inQuote = false;
    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      if (ch === '"') { inQuote = !inQuote; }
      else if (ch === delimiter && !inQuote) { result.push(current.trim()); current = ''; }
      else { current += ch; }
    }
    result.push(current.trim());
    return result;
  };
  const headers = parseRow(lines[0]);
  return lines.slice(1).map(line => {
    const vals = parseRow(line);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
    return obj;
  }).filter(row => Object.values(row).some(v => v));
};

const mapContacts = (rows, source) => {
  const map = COL_MAP[source] || COL_MAP.generic;
  // Try to find best matching column for each field
  const findCol = (target, rows) => {
    if (!rows.length) return null;
    const keys = Object.keys(rows[0]);
    // Exact match first
    const exact = keys.find(k => k.toLowerCase() === target.toLowerCase());
    if (exact) return exact;
    // Partial match
    return keys.find(k => k.toLowerCase().includes(target.toLowerCase()) || target.toLowerCase().includes(k.toLowerCase())) || null;
  };
  const colCache = {};
  Object.entries(map).forEach(([field, colName]) => {
    colCache[field] = findCol(colName, rows) || findCol(field, rows);
  });
  return rows.map((row, idx) => {
    const get = (field) => colCache[field] ? (row[colCache[field]] || '') : '';
    const firstName = get('firstName');
    const lastName = get('lastName');
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || get('name') || 'Unknown';
    const title = get('title');
    const email = get('email');
    const company = get('company');
    const dept = get('department');
    const seniority = get('seniority');
    const linkedin = get('linkedin');
    const phone = get('phone');
    const city = get('city');
    const country = get('country');
    return {
      id: idx,
      name: fullName,
      firstName, lastName,
      title: title || 'Unknown Title',
      email: email || '',
      company: company || '',
      department: dept || '',
      seniority: seniority || '',
      linkedin: linkedin || '',
      phone: phone || '',
      location: [city, country].filter(Boolean).join(', '),
      archetype: inferArchetype(title),
      seniorityRank: inferSeniority(seniority, title),
      confidence: email ? 'high' : 'medium',
    };
  }).sort((a, b) => a.seniorityRank - b.seniorityRank);
};

const buildOrgChartFromContacts = (contacts) => {
  if (!contacts.length) return null;
  // Group by department
  const byDept = {};
  contacts.forEach(c => {
    const dept = c.department || 'General';
    if (!byDept[dept]) byDept[dept] = [];
    byDept[dept].push(c);
  });
  // Find top person (lowest seniority rank)
  const sorted = [...contacts].sort((a, b) => a.seniorityRank - b.seniorityRank);
  const top = sorted[0];
  // Build tree
  const makeNode = (contact) => ({
    name: contact.name,
    title: contact.title,
    email: contact.email,
    department: contact.department,
    relevance: contact.archetype === 'Economic Buyer' ? 'high' : contact.archetype === 'Champion' ? 'high' : 'medium',
    children: contacts
      .filter(c => c.id !== contact.id && c.seniorityRank === contact.seniorityRank + 1 && (!c.department || c.department === contact.department || contact.seniorityRank < 2))
      .slice(0, 4)
      .map(c => ({ name:c.name, title:c.title, email:c.email, department:c.department, relevance:'medium', children:[] }))
  });
  const emailDomain = top.email ? top.email.split('@')[1] : null;
  return {
    ceo: makeNode(top),
    emailPattern: emailDomain ? `firstname.lastname@${emailDomain}` : null,
    reportingStructure: `${contacts.length} contacts imported from ${Object.keys(byDept).length} departments`,
    source: 'imported',
  };
};

const exportToPDF = async (result, form, meetingPrep, execBrief, meetingInputs, extras = {}) => {
  const { closePlan, championPlaybook, negotiationPlaybook, povDoc, mutualSuccessPlan, transcriptResult } = extras;
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
  const checkYLines = (lines, lineHeight = 4.5, padding = 2) => {
    const arr = Array.isArray(lines) ? lines : [lines];
    const needed = arr.length * lineHeight + padding;
    if (y + needed > 278) addPage();
  };

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
    bodyText(ab.marketContext, 0, '#374151');
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
      const tlLines = tl.slice(0, 3);
      const tlH = tlLines.length * 4.5;
      tlLines.forEach((l, li) => doc.text(l, M + 6, y + 29 + li * 4.5));

      y += Math.max(40, 32 + tlH);
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
    // Before/After — dynamic height based on content
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
    y += bah + 6;

    sectionHeader('Value Drivers');
    com.valueDrivers?.forEach(v => {
      checkY(14);
      const vdrvLines = doc.splitTextToSize(v.driver || '', CW - 65);
      const vspecLines = doc.splitTextToSize(v.specifics || '', CW - 8);
      const vdH = Math.max(14, vdrvLines.length * 5 + vspecLines.length * 4.5 + 6);
      checkY(vdH + 2);
      setFill('#FFFBEB'); doc.roundedRect(M, y, CW, vdH, 1.5, 1.5, 'F');
      setTxt('#92400E'); doc.setFontSize(9); doc.setFont('helvetica','bold');
      vdrvLines.forEach((l, li) => doc.text(l, M + 4, y + 5 + li * 5));
      setTxt('#10B981'); doc.setFontSize(9); doc.setFont('helvetica','bold');
      doc.text(v.estimatedImpact || '', W - M - 4, y + 5, { align: 'right' });
      setTxt('#374151'); doc.setFontSize(8); doc.setFont('helvetica','normal');
      vspecLines.forEach((l, li) => doc.text(l, M + 4, y + 5 + vdrvLines.length * 5 + li * 4.5));
      y += vdH + 3;
    });

    sectionHeader('Objection Handlers');
    com.objectionHandlers?.forEach(o => {
      const objQLines = doc.splitTextToSize('"' + (o.objection || '') + '"', CW - 8);
      const objRLines = doc.splitTextToSize(o.response || '', CW - 8);
      const objH = objQLines.length * 4.5 + objRLines.length * 4.5 + 10;
      checkY(objH + 2);
      setFill('#FEF2F2'); doc.roundedRect(M, y, CW, objH, 1.5, 1.5, 'F');
      setTxt('#991B1B'); doc.setFontSize(9); doc.setFont('helvetica','bold');
      objQLines.forEach((l, li) => doc.text(l, M + 4, y + 5 + li * 4.5));
      setTxt('#374151'); doc.setFontSize(8); doc.setFont('helvetica','normal');
      objRLines.forEach((l, li) => doc.text(l, M + 4, y + 5 + objQLines.length * 4.5 + 2 + li * 4.5));
      y += objH + 3;
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
    meetingPrep.landminesToAvoid?.forEach(l => bulletItem(l, '#EF4444')); y += 2;

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
      const cosqText = `Annual Cost of Status Quo: ${execBrief.currentStateAnalysis.costOfStatusQuo || 'See analysis'}`;
      const cosqLines = doc.splitTextToSize(cosqText, CW - 8);
      const cosqH = Math.max(12, cosqLines.length * 5 + 6);
      checkY(cosqH + 2);
      setFill('#FEF2F2'); doc.roundedRect(M, y, CW, cosqH, 2, 2, 'F');
      setTxt('#DC2626'); doc.setFontSize(9); doc.setFont('helvetica','bold');
      cosqLines.forEach((l, li) => doc.text(l, M+4, y + 6 + li*5));
      y += cosqH + 4;
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
        const vLines = doc.splitTextToSize(String(v), CW - 55);
        const rowH = Math.max(8, vLines.length * 5 + 2);
        checkY(rowH + 2);
        setFill('#F8FAFF'); doc.roundedRect(M, y - 2, CW, rowH, 1, 1, 'F');
        setTxt('#6B7280'); doc.setFontSize(8); doc.setFont('helvetica','normal');
        doc.text(k, M + 3, y + 3);
        setTxt('#111827'); doc.setFontSize(9); doc.setFont('helvetica','bold');
        vLines.forEach((vl, vi) => { doc.text(vl, M + 55, y + 3 + vi * 5); });
        y += rowH + 3;
      });
      y += 4;
    }

    sectionHeader('Risk of Inaction', '#EF4444');
    execBrief.riskAnalysis?.risksOfInaction?.forEach(r => { checkY(12); bulletItem(r, '#374151'); }); y += 2;

    sectionHeader('Recommendation');
    bodyText(execBrief.recommendation?.decision, 0, '#111827'); y += 4;
    execBrief.recommendation?.immediateNextSteps?.forEach((s, i) => {
      const sLines = doc.splitTextToSize(String(s || ''), CW - 12);
      const stepH = sLines.length * 5 + 6;
      checkY(stepH);
      setFill('#EFF6FF'); doc.roundedRect(M, y, CW, stepH, 1.5, 1.5, 'F');
      setTxt('#1A56DB'); doc.setFontSize(9); doc.setFont('helvetica','bold');
      doc.text(`${i+1}.`, M + 3, y + 5);
      setTxt('#374151'); doc.setFont('helvetica','normal');
      sLines.forEach((l, li) => { doc.text(l, M + 10, y + 5 + li * 5); });
      y += stepH + 3;
    });
  }

  // ── MODULE 10: CLOSE PLAN ───────────────────────────────────────────────
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
        checkYLines(aLines, 4.5);
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
      const cpNeeded = 16 + closePlan.criticalPathItems.length * 8 +
        (closePlan.earlyWarningSignals?.length ? 16 + closePlan.earlyWarningSignals.length * 8 : 0);
      checkY(Math.min(cpNeeded, 80));
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
        checkYLines(aLines, 4.5);
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
      const cfGLines = doc.splitTextToSize(cf.sequence + ' - Give: ' + (cf.concession || ''), CW - 8);
      const cfDLines = doc.splitTextToSize('Demand: ' + (cf.whatToAskFor || ''), CW - 8);
      const cfH = (cfGLines.length + cfDLines.length) * 4.5 + 8;
      checkY(cfH + 2);
      setFill('#F8FAFF'); doc.roundedRect(M, y, CW, cfH, 1.5, 1.5, 'F');
      setTxt('#374151'); doc.setFontSize(8); doc.setFont('helvetica','bold');
      cfGLines.forEach((l, li) => doc.text(l, M + 3, y + 5 + li * 4.5));
      setTxt('#10B981'); doc.setFont('helvetica','normal');
      cfDLines.forEach((l, li) => doc.text(l, M + 3, y + 5 + cfGLines.length * 4.5 + li * 4.5));
      y += cfH + 3;
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
        const vcl = phase.vendorCommitments?.[ci] ? doc.splitTextToSize('-> ' + phase.vendorCommitments[ci], hw - 4) : [];
        const bcl = phase.buyerCommitments?.[ci] ? doc.splitTextToSize('-> ' + phase.buyerCommitments[ci], hw - 4) : [];
        const rowH = Math.max(vcl.length, bcl.length) * 4.5 + 3;
        checkY(rowH + 1);
        setTxt('#374151'); doc.setFontSize(8); doc.setFont('helvetica','normal');
        vcl.forEach((l, li) => doc.text(l, M, y + li * 4.5));
        bcl.forEach((l, li) => doc.text(l, M + hw + 4, y + li * 4.5));
        y += rowH;
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
        stream: true,
        system: `You are a global enterprise SaaS sales expert. Generate battle cards. Return ONLY valid JSON array:
[{"competitor":"name","ourStrengths":["...","...","..."],"theirWeaknesses":["...","..."],"theirStrengths":["...","..."],"winMoves":["...","...","..."],"trapQuestions":["...","..."],"landmines":["...","..."],"weWinWhen":"...","theyAttackWith":["...","..."]}]`,
        messages: [{ role: "user", content: `Competitors: ${competitors}. Company: ${form.company}. Industry: ${form.industry}. Product: ${form.product}. Pain: ${result?.accountBrief?.painPoints?.map(p=>p.pain).join(', ')||''}` }]
      })
    });
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let raw = "";
    while(true) {
      const {done, value} = await reader.read();
      if(done) break;
      for(const line of decoder.decode(value, {stream:true}).split("\n")) {
        if(line.startsWith("data: ")) {
          try { const evt=JSON.parse(line.slice(6)); if(evt.type==="content_block_delta"&&evt.delta?.type==="text_delta") raw+=evt.delta.text; } catch(e){}
        }
      }
    }
    const s=raw.indexOf("["), e=raw.lastIndexOf("]");
    if(s!==-1&&e!==-1) setFn(JSON.parse(raw.slice(s,e+1)));
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

// ─── DEAL SCORE ENGINE ───────────────────────────────────────────────────────
const calcDealScore = (result, meddQual) => {
  if (!result?.meddpicc) return null;
  const els = result.meddpicc.elements || {};
  const statusScore = { green: 100, amber: 50, red: 10 };
  const meddKeys = ['metrics','economicBuyer','decisionCriteria','decisionProcess','paperProcess','identifiedPain','champion','competition'];
  const meddTotal = meddKeys.reduce((sum, k) => sum + (statusScore[els[k]?.status] || 10), 0);
  const meddScore = (meddTotal / (meddKeys.length * 100)) * 60;
  let qualScore = 0;
  if (meddQual?.budgetConfirmed?.toLowerCase().includes('yes')) qualScore += 5;
  if (meddQual?.ebIdentified?.toLowerCase().includes('yes')) qualScore += 5;
  if (meddQual?.timelineDefined?.length > 5) qualScore += 5;
  if (meddQual?.competitorsKnown?.length > 3) qualScore += 5;
  if (meddQual?.painQuantified?.length > 5) qualScore += 5;
  const icpBonus = ((result.accountBrief?.icpScore || 50) / 100) * 15;
  const total = Math.round(meddScore + qualScore + icpBonus);
  const capped = Math.min(98, Math.max(5, total));
  const gaps = meddKeys
    .filter(k => els[k]?.status !== 'green')
    .sort((a, b) => (statusScore[els[a]?.status] || 0) - (statusScore[els[b]?.status] || 0))
    .slice(0, 3)
    .map(k => ({ element: els[k]?.label || k, status: els[k]?.status, nextAction: els[k]?.nextAction }));
  return {
    score: capped,
    rating: capped >= 75 ? 'Strong' : capped >= 50 ? 'Developing' : capped >= 30 ? 'Early' : 'At Risk',
    color: capped >= 75 ? '#10B981' : capped >= 50 ? '#F59E0B' : capped >= 30 ? '#F97316' : '#EF4444',
    gaps,
    forecast: result.meddpicc.forecastCategory || 'Pipeline',
  };
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
  // Base scenario
  const laborSavings = annualHours * hourlyRate * 0.7;
  const totalBenefit = laborSavings + errorCost + revenueUpside;
  const roi = dealSize > 0 ? ((totalBenefit - dealSize) / dealSize * 100).toFixed(0) : 0;
  const payback = totalBenefit > 0 ? (dealSize / (totalBenefit / 12)).toFixed(1) : 0;
  // Conservative scenario (50% of base benefits)
  const conservativeBenefit = totalBenefit * 0.5;
  const conservativeRoi = dealSize > 0 ? ((conservativeBenefit - dealSize) / dealSize * 100).toFixed(0) : 0;
  const conservativePayback = conservativeBenefit > 0 ? (dealSize / (conservativeBenefit / 12)).toFixed(1) : 0;
  // Aggressive scenario (150% of base benefits)
  const aggressiveBenefit = totalBenefit * 1.5;
  const aggressiveRoi = dealSize > 0 ? ((aggressiveBenefit - dealSize) / dealSize * 100).toFixed(0) : 0;
  const aggressivePayback = aggressiveBenefit > 0 ? (dealSize / (aggressiveBenefit / 12)).toFixed(1) : 0;
  return {
    laborSavings: Math.round(laborSavings),
    errorCost: Math.round(errorCost),
    revenueUpside: Math.round(revenueUpside),
    totalBenefit: Math.round(totalBenefit),
    roi: parseInt(roi),
    payback: parseFloat(payback),
    costOfInaction: Math.round(totalBenefit / 12),
    scenarios: {
      conservative: { benefit: Math.round(conservativeBenefit), roi: parseInt(conservativeRoi), payback: parseFloat(conservativePayback), label: 'Conservative', assumption: '50% of projected benefits realised' },
      base:         { benefit: Math.round(totalBenefit),        roi: parseInt(roi),              payback: parseFloat(payback),              label: 'Base',         assumption: 'Full projected benefits realised' },
      aggressive:   { benefit: Math.round(aggressiveBenefit),   roi: parseInt(aggressiveRoi),    payback: parseFloat(aggressivePayback),    label: 'Aggressive',   assumption: '150% upside with process optimisation' },
    }
  };
};

// ─── TRANSCRIPT ANALYSER ─────────────────────────────────────────────────────
const updateMeddpiccFromTranscript = (transcriptResult, currentResult, setResult) => {
  if (!transcriptResult?.meddpiccSignals || !currentResult?.meddpicc?.elements) return;
  const signals = transcriptResult.meddpiccSignals;
  const keyMap = { metrics:'metrics', economicBuyer:'economicBuyer', decisionCriteria:'decisionCriteria', decisionProcess:'decisionProcess', champion:'champion', competition:'competition' };
  const updated = JSON.parse(JSON.stringify(currentResult));
  Object.entries(keyMap).forEach(([sigKey, elKey]) => {
    if (signals[sigKey] && updated.meddpicc.elements[elKey]) {
      const signal = signals[sigKey].toLowerCase();
      updated.meddpicc.elements[elKey].evidence = signals[sigKey];
      if (signal.includes('confirmed') || signal.includes('identified') || signal.includes('agreed') || signal.includes('clear')) {
        updated.meddpicc.elements[elKey].status = 'green';
      } else if (!signal.includes('unknown') && !signal.includes('not ') && !signal.includes('missing')) {
        if (updated.meddpicc.elements[elKey].status === 'red') updated.meddpicc.elements[elKey].status = 'amber';
      }
    }
  });
  if (transcriptResult.dealHealthChange === 'improved') {
    updated.meddpicc.overallHealth = updated.meddpicc.overallHealth === 'red' ? 'amber' : 'green';
  } else if (transcriptResult.dealHealthChange === 'deteriorated') {
    updated.meddpicc.overallHealth = updated.meddpicc.overallHealth === 'green' ? 'amber' : 'red';
  }
  setResult(updated);
};

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

/* ── Deal Template Library ─────────────────────────────────── */
const TEMPLATE_LIST = [
  {id:'discovery',  name:'Discovery Call Planner',       stage:'qualify',  badge:'Qualify',     icon:'🔍', desc:'CoM Before/After framing, trap-setting questions, Metrics capture.',                 framework:'Command of the Message',                docx:false},
  {id:'powermap',   name:'Account Power Map',             stage:'qualify',  badge:'Qualify',     icon:'🗺', desc:'2x2 influence vs power grid — formal authority vs opinion shapers.',               framework:'Krysten Conner / Multi-threading',       docx:false},
  {id:'valuecanvas',name:'Value Framework Canvas',        stage:'qualify',  badge:'Qualify',     icon:'📐', desc:'Before State / Negative Consequences / After State / Required Capabilities / Proof.', framework:'Force Management / CoM',                docx:false},
  {id:'whychange',  name:'Why Change / Why Now / Why Us', stage:'qualify',  badge:'Qualify',     icon:'💡', desc:'Forces the argument in the right sequence before any presentation.',                framework:'Challenger Sale / Force Management',     docx:false},
  {id:'champpack',  name:'Champion Enablement Pack',      stage:'align',    badge:'Champion',    icon:'🤝', desc:'Internal business case your champion forwards when you are not in the room.',        framework:'Nate Nasralla / Champion-led selling',   docx:true},
  {id:'champdeck',  name:'Champion Internal Deck',        stage:'align',    badge:'Champion',    icon:'📊', desc:'5-slide structure: problem, cost of inaction, solution, proof, ask.',               framework:'Nate Nasralla',                          docx:true},
  {id:'execprep',   name:'Executive Meeting Prep Sheet',  stage:'align',    badge:'Executive',   icon:'👔', desc:'Before/After with Metrics, required capabilities, proof points, objections.',        framework:'Force Management',                       docx:false},
  {id:'poc',        name:'POC Success Criteria',          stage:'validate', badge:'POC',         icon:'✅', desc:'Agreed metrics, milestones, owners on both sides, what good looks like.',           framework:'MEDDPICC',                              docx:false},
  {id:'pocreview',  name:'POC Review Meeting Agenda',     stage:'validate', badge:'POC',         icon:'📋', desc:'The document you run presenting POC results to the economic buyer.',                framework:'Force Management',                       docx:false},
  {id:'compete',    name:'Competitive Displacement',       stage:'validate', badge:'Compete',     icon:'⚔', desc:'Current vendor pain evidence, trap-setting questions, displacement proof.',         framework:'Battle Cards',                          docx:false},
  {id:'dealclinic', name:'Deal Clinic / Win Room Brief',  stage:'biz',      badge:'Deal review', icon:'🏥', desc:'Situation, stakeholder map, specific ask from the room, action items.',              framework:'Force Management',                       docx:false},
  {id:'meddpicc',   name:'MEDDPICC Deal Review',          stage:'biz',      badge:'Deal review', icon:'📈', desc:'Full scorecard per element, gap analysis, confidence score, next action.',          framework:'Force Management / MEDDPICC',            docx:false},
  {id:'msp',        name:'Mutual Success Plan',           stage:'close',    badge:'Close',       icon:'🗓', desc:'Milestones with dates, dual ownership, dependencies, success metrics.',              framework:'Krysten Conner / Multi-threading',       docx:true},
  {id:'negotiation',name:'Negotiation Prep Sheet',        stage:'close',    badge:'Close',       icon:'🤜', desc:'Walk-away position, give/get concession ladder, stakeholder alignment.',             framework:'Chris Voss / Force Management',          docx:false},
  {id:'saveplay',   name:'Save Play',                     stage:'close',    badge:'Save',        icon:'🚨', desc:'Structured save motion for cold deals, quiet champions, or competitor selection.',   framework:'MEDDPICC',                              docx:false},
  {id:'qbr',        name:'QBR / Business Review',         stage:'expand',   badge:'Post-sale',   icon:'📊', desc:'Goals vs actuals in their Metrics, value delivered proof, expansion framing.',      framework:'Command of the Message',                docx:false},
  {id:'expansion',  name:'Expansion Opportunity Brief',   stage:'expand',   badge:'Post-sale',   icon:'📈', desc:'Whitespace map, new pain identified, bridge from current success to next purchase.', framework:'Winning by Design',                     docx:false},
  {id:'winloss',    name:'Win / Loss Debrief',            stage:'expand',   badge:'Post-sale',   icon:'🔍', desc:'MEDDPICC post-mortem — what we knew, what we missed, what we change next time.',    framework:'MEDDPICC',                              docx:false},
];

const STAGE_TABS = [
  {id:'all',      label:'All templates'},
  {id:'qualify',  label:'Qualify & discover'},
  {id:'align',    label:'Solution alignment'},
  {id:'validate', label:'Validate & prove'},
  {id:'biz',      label:'Business case'},
  {id:'close',    label:'Negotiate & close'},
  {id:'expand',   label:'Post-sale'},
];

const TEMPLATE_PROMPTS = {
  discovery:   'Generate a Discovery Call Planner using Command of the Message framework with these sections: ## Before State (3-5 pain statements specific to this company), ## Negative Consequences (financial/risk implications of staying in current state), ## After State (measurable outcomes after implementing), ## Trap-Setting Questions (3-5 questions that expose gaps the competition cannot address), ## Metrics to Capture (specific numbers to gather in the call), ## Call Objectives (2-3 specific outcomes to achieve). Be highly specific to this deal.',
  powermap:    'Generate an Account Power Map with these sections: ## Formal Decision Makers (name, title, power level High/Med/Low, current sentiment, last contact, next action), ## Influence Network (who shapes the decision makers opinions), ## Gaps in Coverage (stakeholders not yet engaged), ## Political Dynamics (alliances, tensions, hidden agendas based on context), ## Multi-thread Plan (specific actions to expand coverage this week). Format stakeholder entries as Role: [Title] | Power: [H/M/L] | Sentiment: [For/Neutral/Against] | Gap: [what we need from them]',
  valuecanvas: 'Generate a Value Framework Canvas with these sections: ## Before State (current painful reality — specific to this company), ## Negative Consequences (what happens if they do nothing — financial, risk, competitive), ## Required Capabilities (what the solution must do to solve the problem — 4-6 capabilities), ## After State (measurable future state with specific metrics), ## Proof Points (specific references, data, analyst research that validates the after state). Use Key: Value format throughout.',
  whychange:   'Generate a Why Change / Why Now / Why Us framework with these sections: ## Why Change (the business case for changing at all — status quo risk, cost of inaction, external forcing function), ## Why Now (the specific urgency — regulatory deadline, competitive threat, financial event, leadership change), ## Why Us (differentiated capabilities mapped directly to their identified pain — NOT feature list). For each section include: The Argument, Evidence, and Anticipated Objection + Response.',
  champpack:   'Generate a Champion Enablement Pack — this is the document the champion FORWARDS INTERNALLY. Sections: ## The Business Problem (1-2 sentences the champion pastes into their internal message), ## What We Are Evaluating (plain English, no jargon), ## Why This Is Urgent (the compelling event in their words), ## What Success Looks Like (the metric they care about), ## What I Need From You (specific ask — meeting, sign-off, budget conversation). Then: ## Objections You Will Face Internally (3 objections + champion response scripts), ## Proof Points You Can Reference (references, analyst data, ROI). Write as if the champion is sending it.',
  champdeck:   'Generate a 5-slide Champion Internal Deck structure: ## Slide 1 — The Problem (the before state in business terms, no vendor language), ## Slide 2 — Cost of Inaction (financial, risk, and opportunity cost of staying where they are), ## Slide 3 — The Solution (what we evaluated and what it does — 3 bullet capability statements), ## Slide 4 — Proof It Works (reference customer outcome + Forrester/analyst validation), ## Slide 5 — The Ask (decision needed, timeline, next step). For each slide: Speaker Notes, Key Data Point to include, and Anticipated Question.',
  execprep:    'Generate an Executive Meeting Prep Sheet with: ## Meeting Objective (the one specific outcome needed from this executive), ## Their Business Priority (what this executive is measured on this quarter), ## Before State (the pain in their language — not product language), ## After State with Metrics (measurable outcomes mapped to their KPIs), ## Required Capabilities (3-4 must-haves linked to their priorities), ## Proof Points (1 reference customer in their industry + 1 analyst stat), ## Anticipated Executive Objections (3 objections + responses), ## The So What Test (for each capability: so what does this mean for YOUR business specifically — answer this). ## Opening Question and Closing Ask.',
  poc:         'Generate a POC Success Criteria document with: ## POC Objective (one sentence), ## Success Metrics (specific measurable criteria — each formatted as: Metric | Target | How Measured | Owner), ## POC Scope (what is in scope, what is explicitly out of scope), ## Timeline (week-by-week milestones with owners on both sides), ## Evaluation Criteria Weighting (if applicable), ## Decision Process Post-POC (who reviews results, by when, what happens next), ## Risks and Dependencies. Format milestone rows as: Week N | Milestone | Meridian Owner | Vendor Owner | Completion Criteria',
  pocreview:   'Generate a POC Review Meeting Agenda with: ## Meeting Goal (the decision we are driving to), ## Pre-Read Required (what both sides prepare), ## Agenda (timed — 60 min total: Opening 5m, POC Results vs Criteria 20m, Business Case 15m, Objection Q&A 10m, Next Steps 10m), ## Results Presentation Structure (how to walk through each success criterion), ## Anticipated Objections in the Room (3 likely pushbacks + response), ## Desired Outcomes from This Meeting (specific commitments to close for), ## Follow-up Actions Template.',
  compete:     'Generate a Competitive Displacement template with: ## Current Vendor Pain Evidence (questions to surface dissatisfaction with incumbent), ## Trap-Setting Questions (questions our competition CANNOT answer well — specific to this deal), ## Before State with Current Vendor (what they are experiencing right now with incumbent), ## Differentiation Proof Points (3-5 specific capability advantages with evidence), ## Displacement Proof (reference customers who switched from this competitor), ## Objection Handling (top 3 — "we are already using X", "switching costs are too high", "we have a relationship"), ## Win Criteria (what needs to be true for us to win this displacement).',
  dealclinic:  'Generate a Deal Clinic / Win Room Brief with: ## Deal Snapshot (company, ARR, stage, close date, compelling event), ## What Is Working (evidence — not opinions), ## What Is Not Working (gaps with evidence), ## Stakeholder Status (for each: name/title | sentiment | last contact | engagement needed), ## MEDDPICC Health (one line per element: complete/partial/missing + evidence), ## The Ask from This Room (ONE specific decision or action needed from manager/team), ## Proposed Action Plan (3-5 actions with owner and date), ## Risk If We Do Nothing (what happens to this deal if we take no action this week).',
  meddpicc:    'Generate a complete MEDDPICC Deal Review with each letter as a section: ## M — Metrics (quantified business value, how calculated, validated by whom), ## E — Economic Buyer (name/title, engaged Y/N, sentiment, last interaction, gaps), ## D — Decision Process (steps, who is involved, timeline, unknowns), ## D — Decision Criteria (formal criteria known, weighting, how we score vs competition), ## I — Identify Pain (pains discovered, by stakeholder, severity, linkage to business impact), ## C — Champion (name, title, champion tests passed, champion risks), ## C — Competition (who, current status, our differentiation, loss risk). For each: Score 1-10, Evidence, Gaps, Next Action.',
  msp:         'Generate a Mutual Success Plan with: ## Agreed Definition of Success (the measurable outcome both sides are signing up to), ## Success Metrics (3-5 specific KPIs with baseline and target), ## Milestone Plan (format each as: Milestone | Target Date | Meridian Owner | Vendor Owner | Dependencies | Done When), ## Decision Gates (the specific approvals needed and by whom), ## Risks and Mitigation (top 3 risks with owner and mitigation action), ## Executive Sponsors (both sides), ## Communication Cadence (how we stay aligned through the process), ## What Happens If We Miss a Milestone (agreed escalation path). Write as a co-owned document both parties sign.',
  negotiation: 'Generate a Negotiation Prep Sheet with: ## Walk-Away Position (the absolute minimum we accept — be specific), ## Opening Position (what we ask for first), ## Concession Ladder (format each as: Give: [what we offer] | Get: [what we require in return] | Priority: [1-5] — list 5 give/get pairs in priority order), ## Stakeholder Alignment Status (is every stakeholder aligned before we negotiate?), ## BATNA — Best Alternative to Negotiated Agreement (what we do if this fails), ## Their Likely Asks (3 common asks + our scripted response using Voss techniques), ## Red Lines (what we never concede), ## Closing Language (exact phrasing to use at signature moment).',
  saveplay:    'Generate a Save Play for a deal at risk with: ## Situation Assessment (what has changed — champion went quiet / competitor selected / budget frozen / deal stalled), ## Root Cause Hypothesis (the real reason based on available evidence), ## Evidence Gathering Plan (3 questions to ask to confirm diagnosis), ## Save Motion Options (Option A: re-engage champion | Option B: go above the champion | Option C: create external urgency) — for each: approach, script, risk), ## Compelling Event Reassessment (is the deadline still real?), ## Escalation Path (internal — what manager/exec support is needed), ## Decision Point (by [date] if [condition] is not met, we [action] — be specific on the walk-away trigger).',
  qbr:         'Generate a QBR / Business Review template with: ## Executive Summary (one paragraph — value delivered since last review), ## Goals vs Actuals (format: Goal | Target Metric | Actual | Status Green/Amber/Red), ## Value Delivered (specific ROI evidence — time saved, cost reduced, risk mitigated with numbers), ## Challenges and What We Did About Them, ## Usage and Adoption (if applicable), ## Roadmap Alignment (upcoming capabilities mapped to their next initiative), ## Expansion Opportunity (new pain identified, whitespace, next logical purchase), ## Mutual Commitments (what each side commits to for next quarter), ## Net Promoter Score Ask.',
  expansion:   'Generate an Expansion Opportunity Brief using Winning by Design bowtie model with: ## Current Success Evidence (the proof point that earns the right to expand), ## New Pain Identified (separate pain from current deployment — not an upsell), ## Expansion Opportunity (specific product / use case / business unit), ## Why Now (compelling event for the expansion), ## Value Hypothesis (Before State / After State for the expansion — using their language), ## Stakeholder Map for Expansion (new buyers, influencers — not just existing champions), ## Expansion Business Case (ROI estimate, time to value), ## Proposed Next Step (the specific meeting or action to open the expansion conversation).',
  winloss:     'Generate a Win / Loss Debrief with: ## Deal Summary (company, ARR, outcome, close date), ## MEDDPICC Post-Mortem (for each element: what we knew, what we did not know, what we should have done differently), ## Decision Drivers (the real reasons we won or lost — not the official reason), ## Competitive Analysis (what the competition did that we did not match), ## What We Did Well (specific actions that advanced the deal), ## What We Would Do Differently (specific and actionable — not generic), ## Early Warning Signs We Missed, ## Process Improvements (changes to qualification, discovery, or closing motion for next time), ## Coaching Recommendations (for rep development).',
};
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
    width: 100%;
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
    max-width: 1440px; margin: 0 auto; padding: 0 8px;
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
  .main { max-width: 960px; margin: 0 auto; padding: 48px 32px 100px; }

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
  @keyframes spin { to { transform: rotate(360deg); } }
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
  @media (max-width: 768px) { .stakeholder-body { grid-template-columns: 1fr; gap: 10px; } }
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

  /* ─── EXPORT MODAL ────────────────────────────────────────────── */
  .export-modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.7);
    z-index: 2000; display: flex; align-items: center; justify-content: center;
    padding: 20px; backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;
  }
  .export-modal {
    background: var(--navy2); border: 1px solid var(--border2);
    border-radius: 18px; padding: 28px; width: 100%; max-width: 520px;
    box-shadow: 0 24px 80px rgba(0,0,0,0.6);
    animation: scaleIn 0.2s cubic-bezier(0.16,1,0.3,1);
  }
  .export-section-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 0; border-bottom: 1px solid var(--border);
  }
  .export-section-row:last-child { border-bottom: none; }

  /* ─── COLOR THEMES ────────────────────────────────────────────── */
  .theme-midnight {
    --navy:   #08080F;
    --navy2:  #0D0D1A;
    --navy3:  #12122A;
    --slate:  #16163A;
    --slate2: #1E1E4A;
    --blue:       #6366F1;
    --blue-light: #818CF8;
    --blue-glow:  rgba(99,102,241,0.12);
    --border:  rgba(255,255,255,0.07);
    --border2: rgba(255,255,255,0.12);
    --card:    rgba(255,255,255,0.04);
    --card2:   rgba(255,255,255,0.07);
  }
  .theme-slate {
    --navy:   #0F0F1A;
    --navy2:  #141428;
    --navy3:  #1A1A35;
    --slate:  #1E1E40;
    --slate2: #252550;
    --blue:       #7C3AED;
    --blue-light: #A78BFA;
    --blue-glow:  rgba(124,58,237,0.12);
    --border:  rgba(255,255,255,0.07);
    --border2: rgba(255,255,255,0.12);
    --card:    rgba(255,255,255,0.04);
    --card2:   rgba(255,255,255,0.07);
  }
  .theme-forest {
    --navy:   #080F0A;
    --navy2:  #0D160F;
    --navy3:  #121E14;
    --slate:  #162419;
    --slate2: #1C2E1F;
    --blue:       #059669;
    --blue-light: #34D399;
    --blue-glow:  rgba(5,150,105,0.12);
    --border:  rgba(255,255,255,0.07);
    --border2: rgba(255,255,255,0.12);
    --card:    rgba(255,255,255,0.04);
    --card2:   rgba(255,255,255,0.07);
  }

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

  /* ─── TAB CONTENT MIN HEIGHT ─────────────────────────────────────── */
  .tab-content-area { min-height: 60vh; }

  /* ─── DESKTOP OPTIMISATION ────────────────────────────────────────── */
  /* ─── APOLLO INTEGRATION ─────────────────────────────────────────── */
  .apollo-connect-btn { display:flex; align-items:center; gap:6px; padding:5px 11px; border-radius:8px; border:1px solid rgba(124,58,237,0.35); background:rgba(124,58,237,0.07); color:#A78BFA; font-size:11px; font-weight:700; cursor:pointer; transition:all 0.2s; font-family:'JetBrains Mono',monospace; letter-spacing:0.5px; white-space:nowrap; }
  .apollo-connect-btn:hover { border-color:rgba(124,58,237,0.6); background:rgba(124,58,237,0.14); }
  .apollo-connect-btn.connected { border-color:rgba(16,185,129,0.4); background:rgba(16,185,129,0.08); color:var(--green); }
  .apollo-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.72); backdrop-filter:blur(6px); z-index:2000; display:flex; align-items:center; justify-content:center; padding:16px; }
  .apollo-modal { background:var(--card); border:1px solid rgba(124,58,237,0.28); border-radius:18px; padding:28px; width:100%; max-width:480px; position:relative; }
  .apollo-modal-logo { width:38px; height:38px; border-radius:11px; background:linear-gradient(135deg,#7C3AED,#4F46E5); display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
  .apollo-contact-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:10px; }
  @media (max-width:600px) { .apollo-contact-grid { grid-template-columns:1fr; } }
  .apollo-contact-card { background:var(--bg); border:1px solid rgba(124,58,237,0.18); border-radius:10px; padding:12px 12px 10px; transition:all 0.2s; cursor:pointer; position:relative; overflow:hidden; }
  .apollo-contact-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,#7C3AED,#4F46E5); }
  .apollo-contact-card:hover { border-color:rgba(124,58,237,0.45); background:rgba(124,58,237,0.05); transform:translateY(-1px); }
  .apollo-contact-card.added { border-color:rgba(16,185,129,0.35); background:rgba(16,185,129,0.05); }
  .apollo-enriched-badge { display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:20px; background:rgba(124,58,237,0.1); border:1px solid rgba(124,58,237,0.22); color:#A78BFA; font-size:10px; font-weight:700; font-family:'JetBrains Mono',monospace; letter-spacing:0.5px; margin-left:8px; vertical-align:middle; }
  .apollo-loading { display:flex; align-items:center; gap:8px; padding:10px 12px; background:rgba(124,58,237,0.06); border:1px solid rgba(124,58,237,0.14); border-radius:8px; margin-top:8px; }

  @media (min-width: 1024px) {
    .main { padding: 48px 40px 100px; max-width: 1000px; }
    .stat-grid { grid-template-columns: repeat(4, 1fr); }
    .medd-grid { grid-template-columns: 1fr 1fr; }
    .r-grid-2 { grid-template-columns: 1fr 1fr; }
    .r-grid-3 { grid-template-columns: repeat(3, 1fr); }
    .r-grid-4 { grid-template-columns: repeat(4, 1fr); }
  }

  /* ─── IPAD OPTIMISATION (768px - 1024px) ─────────────────────────── */
  @media (min-width: 768px) and (max-width: 1024px) {
    .main { padding: 32px 28px 80px; }
    .stat-grid { grid-template-columns: 1fr 1fr; }
    .r-grid-4 { grid-template-columns: 1fr 1fr; }
    .tabs { gap: 2px; }
    .tab { padding: 8px 11px; font-size: 9px; }
  }

  /* ─── RESPONSIVE BREAKPOINTS ─────────────────────────────────────── */
  @media (max-width: 768px) {
    .main { padding: 24px 16px 80px; max-width: 100%; width: 100%; }
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
    .pdf-export-bar { display: none !important; }
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
  @media (max-width: 480px) { .compete-vs { flex-direction: column; } }
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
.import-source-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin: 12px 0 4px;
}
.import-source-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid;
  font-size: 11px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.04em;
  background: rgba(255,255,255,0.04);
  cursor: default;
  transition: background 0.15s;
}
.import-source-badge:hover {
  background: rgba(255,255,255,0.09);
}

/* ── IMPORT ZONE ─────────────────────────────────── */
.import-zone {
  border: 1.5px dashed rgba(245,158,11,0.25);
  border-radius: 16px;
  background: rgba(245,158,11,0.03);
  padding: 32px 28px 24px;
  margin: 24px 0 0;
  text-align: center;
  transition: border-color 0.2s, background 0.2s;
  cursor: default;
}
.import-zone-drag {
  border-color: rgba(245,158,11,0.6);
  background: rgba(245,158,11,0.06);
}
.import-zone-icon {
  font-size: 32px;
  margin-bottom: 10px;
  display: block;
}
.import-zone-title {
  font-family: 'Syne', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 6px;
}
.import-zone-desc {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.6;
  max-width: 480px;
  margin: 0 auto 20px;
}
.import-actions-row {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 4px;
}
.import-zone-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 20px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.import-zone-btn:hover {
  background: rgba(255,255,255,0.1);
  border-color: rgba(255,255,255,0.2);
}
.import-template-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 20px;
  background: rgba(245,158,11,0.1);
  border: 1px solid rgba(245,158,11,0.3);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--amber);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.import-template-btn:hover {
  background: rgba(245,158,11,0.18);
  border-color: rgba(245,158,11,0.5);
}
.import-col-guide {
  margin-top: 16px;
  text-align: left;
  width: 100%;
}
.import-col-guide summary {
  font-size: 12px;
  color: var(--text-dim);
  cursor: pointer;
  text-align: center;
  padding: 4px 0;
  list-style: none;
}
.import-col-guide summary::-webkit-details-marker { display: none; }
.import-col-guide summary::before { content: "▶ "; font-size: 10px; }
.import-col-guide[open] summary::before { content: "▼ "; }
.import-col-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 16px;
  margin-top: 12px;
  padding: 14px 16px;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border);
  border-radius: 10px;
}
.import-col-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.import-col-name {
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text);
}
.req-required { font-size: 10px; font-weight: 700; color: var(--amber); }
.req-recommended { font-size: 10px; font-weight: 600; color: var(--blue-light); }
.req-optional { font-size: 10px; color: var(--text-dim); }

/* light mode overrides */
.light-mode .import-zone { border-color: rgba(245,158,11,0.2); background: rgba(245,158,11,0.02); }
.light-mode .import-zone-btn { background: rgba(0,0,0,0.04); border-color: rgba(0,0,0,0.1); }
.light-mode .import-col-grid { background: rgba(0,0,0,0.02); }

/* ── Deal Templates ────────────────────────────────────────── */
.tmpl-section{margin-top:2.5rem}
.tmpl-stage-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:1.25rem}
.tmpl-stage-tab{font-size:12px;padding:5px 14px;border-radius:20px;border:0.5px solid rgba(255,255,255,0.15);background:transparent;cursor:pointer;color:rgba(255,255,255,0.45);transition:all .15s;font-family:var(--font-mono)}
.tmpl-stage-tab:hover{border-color:rgba(255,255,255,0.3);color:rgba(255,255,255,0.8)}
.tmpl-stage-tab.tmpl-active{background:rgba(245,158,11,0.12);border-color:#F59E0B;color:#F59E0B}
.tmpl-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-bottom:1.5rem}
.tmpl-card{background:rgba(255,255,255,0.03);border:0.5px solid rgba(255,255,255,0.09);border-radius:12px;padding:1rem 1.125rem;cursor:pointer;transition:border-color .15s}
.tmpl-card:hover{border-color:rgba(245,158,11,0.35)}
.tmpl-card.tmpl-card-active{border:1.5px solid #F59E0B;background:rgba(245,158,11,0.05)}
.tmpl-card-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:.75rem}
.tmpl-icon{width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;background:rgba(255,255,255,0.06)}
.tmpl-badge{font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;background:rgba(245,158,11,0.12);color:#F59E0B;white-space:nowrap;font-family:var(--font-mono);letter-spacing:.04em}
.tmpl-name{font-size:13px;font-weight:600;margin-bottom:4px;color:rgba(255,255,255,0.88);line-height:1.35}
.tmpl-sub{font-size:11px;color:rgba(255,255,255,0.4);line-height:1.5}
.tmpl-fw{font-size:10px;color:rgba(255,255,255,0.25);margin-top:.5rem;font-style:italic}
.tmpl-docx-pill{font-size:9px;font-weight:700;padding:2px 6px;border-radius:4px;background:rgba(96,165,250,0.12);color:#60A5FA;margin-left:5px;font-family:var(--font-mono);vertical-align:middle}
.tmpl-card-actions{display:flex;gap:6px;margin-top:.875rem;flex-wrap:wrap}
.tmpl-btn{font-size:11px;padding:5px 11px;border-radius:6px;border:0.5px solid rgba(255,255,255,0.15);background:transparent;cursor:pointer;color:rgba(255,255,255,0.5);transition:all .15s;font-family:var(--font-mono)}
.tmpl-btn:hover{background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.9)}
.tmpl-btn.tmpl-btn-primary{background:linear-gradient(135deg,#F59E0B,#EF9F27);border-color:#F59E0B;color:#050C18;font-weight:700}
.tmpl-btn.tmpl-btn-primary:hover{opacity:.88}
.tmpl-btn:disabled{opacity:.35;cursor:not-allowed}
.tmpl-preview{background:rgba(255,255,255,0.025);border:0.5px solid rgba(245,158,11,0.25);border-radius:12px;padding:1.25rem;margin-bottom:1.5rem}
.tmpl-preview-hdr{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1rem;padding-bottom:1rem;border-bottom:0.5px solid rgba(255,255,255,0.07)}
.tmpl-preview-title{font-size:14px;font-weight:600;color:rgba(255,255,255,0.9)}
.tmpl-preview-meta{font-size:11px;color:rgba(255,255,255,0.3);margin-top:3px}
.tmpl-preview-status{font-size:11px;padding:3px 10px;border-radius:20px;background:rgba(16,185,129,0.12);color:#10B981;font-weight:600;font-family:var(--font-mono);flex-shrink:0}
.tmpl-ctx-label{font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:5px;font-family:var(--font-mono)}
.tmpl-ctx-area{width:100%;background:rgba(255,255,255,0.04);border:0.5px solid rgba(255,255,255,0.1);border-radius:8px;color:rgba(255,255,255,0.8);font-size:12px;padding:8px 12px;resize:vertical;min-height:70px;font-family:var(--font-sans);line-height:1.5;box-sizing:border-box}
.tmpl-ctx-area:focus{outline:none;border-color:rgba(245,158,11,0.45)}
.tmpl-gen-cta{text-align:center;padding:1.5rem 0}
.tmpl-loading-row{display:flex;align-items:center;gap:10px;padding:1.5rem;color:rgba(255,255,255,0.4);font-size:13px}
.tmpl-spinner{width:18px;height:18px;border:2px solid rgba(245,158,11,0.2);border-top-color:#F59E0B;border-radius:50%;animation:tmplSpin .8s linear infinite;flex-shrink:0}
@keyframes tmplSpin{to{transform:rotate(360deg)}}
.tmpl-output{font-size:12px;color:rgba(255,255,255,0.72);line-height:1.75;white-space:pre-wrap}
.tmpl-export-row{display:flex;gap:8px;margin-top:1rem;padding-top:1rem;border-top:0.5px solid rgba(255,255,255,0.07);flex-wrap:wrap}
.tmpl-sg-section-head{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(245,158,11,0.7);margin:1rem 0 .4rem;font-family:var(--font-mono)}
.tmpl-sg-row{display:flex;gap:12px;padding:6px 0;border-bottom:0.5px solid rgba(255,255,255,0.05)}
.tmpl-sg-row:last-child{border-bottom:none}
.tmpl-sg-key{font-size:11px;color:rgba(255,255,255,0.32);min-width:130px;flex-shrink:0;padding-top:1px}
.tmpl-sg-val{font-size:12px;color:rgba(255,255,255,0.78);line-height:1.55;flex:1}
.tmpl-empty{text-align:center;padding:2rem;color:rgba(255,255,255,0.25);font-size:13px}
@media(max-width:768px){.tmpl-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:480px){.tmpl-grid{grid-template-columns:1fr}.tmpl-sg-key{min-width:90px}}

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
  const [formPreFilled, setFormPreFilled] = useState(false);
  const [tmplStage,   setTmplStage]   = React.useState('all');
  const [tmplActive,  setTmplActive]  = React.useState(null);
  const [tmplContent, setTmplContent] = React.useState('');
  const [tmplLoading, setTmplLoading] = React.useState(false);
  const [tmplCtx,     setTmplCtx]     = React.useState('');
  const [importedContacts, setImportedContacts] = useState([]);
  const [importSource, setImportSource] = useState(null); // 'zoominfo'|'apollo'|'clay'|'generic'
  const [importPreview, setImportPreview] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importDragging, setImportDragging] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("bahasa");
  const [emailTone, setEmailTone] = useState("formal");
  const [transcript, setTranscript] = useState("");
  const [transcriptResult, setTranscriptResult] = useState(null);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [roiInputs, setRoiInputs] = useState({ employees: "", avgSalary: "", hoursPerWeek: "", currentErrors: "", dealSize: "" });
  const [roiPreFillLoading, setRoiPreFillLoading] = useState(false);
  const [roiPreFilled, setRoiPreFilled] = useState(false);
  const [closePlan, setClosePlan] = useState(null);
  const [closePlanLoading, setClosePlanLoading] = useState(false);
  const [closeDate, setCloseDate] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [emailData, setEmailData] = useState(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [orgChart, setOrgChart] = useState(null);
  const [orgLoading, setOrgLoading] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [colorTheme, setColorTheme] = useState(() => {
    try { return localStorage.getItem('sia_theme') || 'navy'; } catch { return 'navy'; }
  });
  const applyTheme = (t) => {
    setColorTheme(t);
    try { localStorage.setItem('sia_theme', t); } catch {}
  };
  const [roiResult, setRoiResult] = useState(null);
  const [roiResearch, setRoiResearch] = useState(null);
  const [roiResearchLoading, setRoiResearchLoading] = useState(false);
  const [competeData, setCompeteData] = useState(null);
  const [competeLoading, setCompeteLoading] = useState(false);
  const [selectedCompetitor, setSelectedCompetitor] = useState("");
  // Champion Playbook
  const [championPlaybook, setChampionPlaybook] = useState(null);
  const [championPlaybookLoading, setChampionPlaybookLoading] = useState(false);
  // Persona Intelligence
  const [personaData, setPersonaData] = useState({});
  const [personaLoading, setPersonaLoading] = useState(null);
  // Mutual Success Plan
  const [mutualSuccessPlan, setMutualSuccessPlan] = useState(null);
  const [mutualSuccessLoading, setMutualSuccessLoading] = useState(false);
  // POV Builder
  const [povDoc, setPovDoc] = useState(null);
  const [povLoading, setPovLoading] = useState(false);
  // Objection Simulator
  const [objectionInput, setObjectionInput] = useState("");
  const [objectionResponse, setObjectionResponse] = useState(null);
  const [objectionLoading, setObjectionLoading] = useState(false);
  // Email Reply Analyser
  const [emailReplyInput, setEmailReplyInput] = useState("");
  const [emailReplyAnalysis, setEmailReplyAnalysis] = useState(null);
  const [emailReplyLoading, setEmailReplyLoading] = useState(false);
  // Negotiation Playbook
  const [negotiationPlaybook, setNegotiationPlaybook] = useState(null);
  const [negotiationLoading, setNegotiationLoading] = useState(false);
  // News Triggers
  const [newsTriggers, setNewsTriggers] = useState(null);
  const [newsLoading, setNewsLoading] = useState(false);
  const [autoResearchLoading, setAutoResearchLoading] = useState(false);
  const [autoResearchDone, setAutoResearchDone] = useState(false);
  const [apolloApiKey, setApolloApiKey] = useState(() => { try { return localStorage.getItem('sia_apollo_key') || ''; } catch(e) { return ''; } });
  const [showApolloModal, setShowApolloModal] = useState(false);
  const [apolloContacts, setApolloContacts] = useState([]);
  const [apolloEnrichLoading, setApolloEnrichLoading] = useState(false);
  const [addedApolloContacts, setAddedApolloContacts] = useState([]);
  const [suggestedCompetitors, setSuggestedCompetitors] = useState([]);
  const [techStack, setTechStack] = useState(null);
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

  const autoResearchCompany = useCallback(async (companyName) => {
    if (!companyName || companyName.length < 2) return;
    setAutoResearchLoading(true);
    setAutoResearchDone(false);
    try {
      const response = await fetch("/api/anthropic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 3000,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{
            role: "user",
            content: `Research the company "${companyName}". Search for "${companyName} overview", "${companyName} CEO leadership", "${companyName} news 2025". Return ONLY valid JSON with these exact keys: {"website":"official url","market":"EXACTLY one of: Singapore, Malaysia, Philippines, India, Indonesia, Thailand, Hong Kong, Vietnam, Australia, South Korea, Japan, Taiwan, New Zealand, UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman, Egypt, South Africa, Nigeria, Kenya, United Kingdom, Germany, France, Netherlands, Sweden, Norway, Denmark, Finland, Spain, Italy, Switzerland, United States, Canada, Brazil, Mexico, Global / Multi-Country","industry":"EXACTLY one of: Financial Services / Banking, Insurance / Insurtech, Fintech / Payments, HCM / HR Technology, ERP / Finance Systems, Retail / CPG / Ecommerce, Logistics / Supply Chain, Healthcare / Pharma, Telco / Media / Tech, Real Estate / PropTech, Energy / Resources, Manufacturing, Professional Services, Government / Public Sector","recentNews":"2-3 sentences of key 2024-2025 news","knownContacts":"Top 3-4 C-suite names and titles comma separated","competitorsMentioned":"2-3 main competitors comma separated"}`
          }]
        })
      });
      const data = await response.json();
      const text = data.content?.filter(b => b.type === 'text').map(b => b.text).join('') || '{}';
      const s = text.indexOf('{'), e = text.lastIndexOf('}');
      if (s !== -1 && e !== -1) {
        const parsed = JSON.parse(text.slice(s, e + 1));
        setForm(prev => ({
          ...prev,
          website: parsed.website || prev.website,
          market: MARKETS.includes(parsed.market) ? parsed.market : prev.market,
          industry: INDUSTRIES.includes(parsed.industry) ? parsed.industry : prev.industry,
          recentNews: parsed.recentNews || prev.recentNews,
          knownContacts: parsed.knownContacts || prev.knownContacts,
          competitorsMentioned: parsed.competitorsMentioned || prev.competitorsMentioned,
        }));
        if (parsed.techStack) setTechStack({ tools: parsed.techStack, likelyReplacing: parsed.likelyReplacing || '' });
        if (parsed.competitorsMentioned) {
          const chips = parsed.competitorsMentioned.split(',').map(c => c.trim()).filter(Boolean);
          setSuggestedCompetitors(chips);
        }
        // Separate lightweight tech stack call
        try {
          const tsRes = await fetch("/api/anthropic", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "claude-haiku-4-5-20251001", max_tokens: 400,
              messages: [{ role: "user", content: `Based on your knowledge, what software and technology platforms does ${companyName} likely use? Consider their industry, size and region. Return ONLY valid JSON: {"tools":"4-6 known or likely platforms comma separated e.g. SAP, Salesforce, Oracle, Workday","likelyReplacing":"What legacy system or process they are most likely modernising or replacing"}` }]
            })
          });
          const tsData = await tsRes.json();
          const tsText = tsData.content?.filter(b => b.type === 'text').map(b => b.text).join('') || '{}';
          const ts = tsText.indexOf('{'), te = tsText.lastIndexOf('}');
          if (ts !== -1 && te !== -1) {
            const tsParsed = JSON.parse(tsText.slice(ts, te + 1));
            if (tsParsed.tools) setTechStack({ tools: tsParsed.tools, likelyReplacing: tsParsed.likelyReplacing || '' });
          }
        } catch(tsErr) { /* silent fail */ }
        // Auto-set email tone from market + industry
        const mkt = (parsed.market || '').toLowerCase();
        const ind = (parsed.industry || '').toLowerCase();
        const formalMarkets = ['singapore','hong kong','japan','south korea','taiwan','germany','switzerland','uae','saudi arabia','qatar'];
        const formalIndustries = ['financial services','banking','insurance','government','public sector','healthcare','pharma'];
        const directIndustries = ['erp','hcm','cybersecurity','data'];
        const warmIndustries = ['telco','media','tech','retail','ecommerce','fintech','payments'];
        if (formalMarkets.some(m => mkt.includes(m)) || formalIndustries.some(i => ind.includes(i))) {
          setEmailTone('formal');
        } else if (warmIndustries.some(i => ind.includes(i))) {
          setEmailTone('warm');
        } else if (directIndustries.some(i => ind.includes(i))) {
          setEmailTone('direct');
        }
        setAutoResearchDone(true);
      }
    } catch(err) {}
    setAutoResearchLoading(false);
  }, []);

  const enrichWithApollo = React.useCallback(async (companyName, key) => {
    if (!key || !companyName) return;
    setApolloEnrichLoading(true);
    setApolloContacts([]);
    setAddedApolloContacts([]);
    try {
      const res = await fetch('/api/apollo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'searchPeople',
          apiKey: key,
          q_organization_name: companyName,
          person_titles: ['CEO','CFO','CTO','COO','CIO','President','Managing Director','SVP','VP','Director','Head of'],
          per_page: 8,
        }),
      });
      const data = await res.json();
      if (data.people?.length) {
        setApolloContacts(data.people.map(p => ({
          name: ((p.first_name || '') + ' ' + (p.last_name || '')).trim(),
          title: p.title || '',
          email: p.email || '',
          linkedin: p.linkedin_url || '',
          department: p.departments?.[0] || '',
          seniority: p.seniority || '',
        })));
      }
    } catch(e) {}
    setApolloEnrichLoading(false);
  }, []);

  React.useEffect(() => {
    if (autoResearchDone && apolloApiKey && form.company) {
      enrichWithApollo(form.company, apolloApiKey);
    }
  }, [autoResearchDone]);

  const downloadTemplate = React.useCallback(() => {
    const headers = ['First Name','Last Name','Job Title','Email Address','Company Name','Department','Management Level','LinkedIn URL','Mobile phone','City','Country'];
    const rows = [
      ['Sarah','Chen','CFO','sarah.chen@company.com','Acme Corp','Finance','C-Suite','https://linkedin.com/in/sarahchen','+65 9123 4567','Singapore','Singapore'],
      ['James','Wong','IT Director','james.wong@company.com','Acme Corp','Technology','Director','https://linkedin.com/in/jameswong','+65 9234 5678','Singapore','Singapore'],
      ['Priya','Sharma','Head of Procurement','priya.sharma@company.com','Acme Corp','Procurement','Director','https://linkedin.com/in/priyasharma','+65 9345 6789','Singapore','Singapore'],
      ['','','','','','','','','','',''],
      ['NOTE: This template works with ZoomInfo CSV column names.','','','','','','','','','',''],
      ['Also supported: Apollo Clay LinkedIn SN or any CSV with these columns.','','','','','','','','','',''],
    ];
    const csvContent = [headers, ...rows].map(row => row.map(cell => '"' + String(cell).replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sales-intelligence-contacts-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const processImportFile = React.useCallback((file) => {
    const reader = new FileReader();
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    reader.onload = async (e) => {
      try {
        let rows = [];
        if (isExcel) {
          // Use SheetJS via CDN-style dynamic import
          const XLSX = window.XLSX;
          if (!XLSX) {
            // Load SheetJS dynamically
            await new Promise((resolve, reject) => {
              const script = document.createElement('script');
              script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
              script.onload = resolve;
              script.onerror = reject;
              document.head.appendChild(script);
            });
          }
          const wb = window.XLSX.read(e.target.result, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const json = window.XLSX.utils.sheet_to_json(ws, { header:1 });
          if (json.length < 2) return;
          const headers = json[0];
          rows = json.slice(1).map(row => {
            const obj = {};
            headers.forEach((h, i) => { obj[h] = row[i] !== undefined ? String(row[i]) : ''; });
            return obj;
          }).filter(row => Object.values(row).some(v => v));
        } else {
          // CSV
          const text = new TextDecoder().decode(new Uint8Array(e.target.result));
          rows = parseCSV(text);
        }
        if (!rows.length) { alert('No data found in file. Please check the file format.'); return; }
        const headers = Object.keys(rows[0]);
        const source = detectSource(headers);
        const contacts = mapContacts(rows, source);
        if (!contacts.length) { alert('Could not parse contacts. Please check column headers.'); return; }
        setImportedContacts(contacts);
        setImportSource(source);
        setImportPreview(true);
        // Auto-fill form from first contact data
        const topContact = contacts[0];
        const company = topContact.company || '';
        const country = contacts[0].location?.split(',').pop()?.trim() || '';
        const contactNames = contacts.slice(0, 5).map(c => `${c.name} (${c.title})`).join(', ');
        setForm(prev => ({
          ...prev,
          company: company || prev.company,
          knownContacts: contactNames,
        }));
        setFormPreFilled(true);
      } catch(err) {
        console.error(err);
        alert('Failed to parse file. Please ensure it is a valid CSV or Excel file.');
      }
    };
    if (isExcel) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  }, []);

  React.useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem("apac_deal_history") || "[]");
      if (history.length > 0 && history[0].form) {
        setForm(prev => {
          if (!prev.company && !prev.product) {
            setFormPreFilled(true);
            return history[0].form;
          }
          return prev;
        });
      }
    } catch(e) {}
  }, []);
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
        // Reset secondary sections from previous deal — prevents stale data in PDF
        setClosePlan(null);
        setMutualSuccessPlan(null);
        setChampionPlaybook(null);
        setPovDoc(null);
        setNegotiationPlaybook(null);
        setExecBrief(null);
        setCloseDate('');

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
      const streamCall = async (userPrompt, systemPrompt, model = "claude-sonnet-4-20250514", retryCount = 0) => {
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
        if (r.status === 529) {
          // Rate limited - wait and retry
          if (retryCount < 3) {
            await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000));
            return streamCall(userPrompt, systemPrompt, model, retryCount + 1);
          }
          throw new Error('Rate limit exceeded. Please try again in a moment.');
        }
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
            console.warn("JSON parse failed after all repairs, returning partial:", e.message);
            return {};
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
      const reliableCall = async (p, s, retries=3) => {
        for (let i=0; i<retries; i++) {
          try { return await streamCall(p, s); } catch(e) {
            if (i===retries-1) return {};
            await new Promise(r => setTimeout(r, 1500 * (i + 1)));
          }
        }
        return {};
      };
      // 5th parallel call: auto-fetch news triggers
      const newsCall = async () => {
        try {
          const r = await fetch("/api/anthropic", { method:"POST", headers:{"Content-Type":"application/json"},
            body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:2000,
              tools:[{type:"web_search_20250305",name:"web_search"}],
              system:`Search for the latest news about this company. Return ONLY valid JSON: {"lastUpdated":"today","urgencyScore":"high|medium|low","urgencyRationale":"One sentence why this window is high/medium/low urgency","windowOfOpportunity":"How long this signal stays relevant — e.g. 30 days, 90 days, ongoing","triggers":[{"type":"Leadership Change|M&A|Regulatory|Earnings|Strategy|Technology|Risk","headline":"...","detail":"...","salesAngle":"How to use this in a sales conversation","urgency":"high|medium|low"}],"buyingSignals":["Signal 1","Signal 2"],"risks":["Risk 1","Risk 2"],"conversationStarter":"Exact opening line referencing recent news","recommendedFirstAction":"The single most important outreach action to take within 24 hours"}`,
              messages:[{role:"user",content:`Find the latest news, announcements, financial results, leadership changes, regulatory issues and strategic initiatives for ${form.company} in ${form.market}. Search for "${form.company} news 2025", "${form.company} results", "${form.company} strategy". What has happened in the last 3 months that a sales rep should know about?`}]
            })
          });
          const d = await r.json();
          const t = d.content?.filter(b=>b.type==='text').map(b=>b.text).join('')||'{}';
          const s=t.indexOf('{'),e=t.lastIndexOf('}');
          if(s!==-1&&e!==-1) return JSON.parse(t.slice(s,e+1));
        } catch(err) {}
        return null;
      };

      const [part1, part2, part3, part4, newsData] = await Promise.all([
        reliableCall(prompt, sys1),
        reliableCall(prompt, sys2),
        reliableCall(prompt, sys3),
        reliableCall(prompt, sys4),
        newsCall(),
      ]);
      if (newsData) setNewsTriggers(newsData);
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
      alert("Analysis failed. Please try again — this is usually a temporary API issue. Error: " + e.message);
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
  if (showLanding) {
    return <Landing onStart={() => setShowLanding(false)} darkMode={darkMode} />;
  }

  // ── Template helpers ────────────────────────────────────────
  const buildTmplContext = () => {
    const fields = [
      typeof company !== 'undefined' && company ? 'Company: ' + company : '',
      typeof industry !== 'undefined' && industry ? 'Industry: ' + industry : '',
      typeof dealValue !== 'undefined' && dealValue ? 'Deal value: ' + dealValue : '',
      typeof champion !== 'undefined' && champion ? 'Champion: ' + champion : '',
      typeof economicBuyer !== 'undefined' && economicBuyer ? 'Economic buyer: ' + economicBuyer : '',
      typeof metrics !== 'undefined' && metrics ? 'Metrics / business value: ' + metrics : '',
      typeof decisionProcess !== 'undefined' && decisionProcess ? 'Decision process: ' + decisionProcess : '',
      typeof decisionCriteria !== 'undefined' && decisionCriteria ? 'Decision criteria: ' + decisionCriteria : '',
      typeof identifiedPain !== 'undefined' && identifiedPain ? 'Identified pain: ' + identifiedPain : '',
      typeof competition !== 'undefined' && competition ? 'Competition: ' + competition : '',
      typeof compellingEvent !== 'undefined' && compellingEvent ? 'Compelling event: ' + compellingEvent : '',
    ].filter(Boolean);
    return fields.length ? fields.join('\n') : 'Deal context not yet populated — please fill in the form above and run intelligence first.';
  };

  const formatTmplOutput = (text) => {
    return text
      .split('\n')
      .map(line => {
        if (!line.trim()) return '<div style="height:6px"></div>';
        if (line.startsWith('## ')) return '<div class="tmpl-sg-section-head">' + line.slice(3) + '</div>';
        const colonIdx = line.indexOf(': ');
        if (colonIdx > 0 && colonIdx < 40 && !line.startsWith('-') && !line.startsWith('*')) {
          const key = line.slice(0, colonIdx);
          const val = line.slice(colonIdx + 2);
          return '<div class="tmpl-sg-row"><div class="tmpl-sg-key">' + key + '</div><div class="tmpl-sg-val">' + val + '</div></div>';
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return '<div style="font-size:12px;color:rgba(255,255,255,0.65);padding:3px 0 3px 12px;line-height:1.55">- ' + line.slice(2) + '</div>';
        }
        return '<div style="font-size:12px;color:rgba(255,255,255,0.6);padding:2px 0;line-height:1.6">' + line + '</div>';
      })
      .join('');
  };

  const generateTemplate = async (tmpl) => {
    setTmplActive(tmpl);
    setTmplLoading(true);
    setTmplContent('');
    const dealCtx = buildTmplContext();
    const addl = tmplCtx ? '\n\nAdditional context:\n' + tmplCtx : '';
    const prompt = 'Deal context:\n' + dealCtx + addl + '\n\n' + (TEMPLATE_PROMPTS[tmpl.id] || 'Generate a ' + tmpl.name + ' pre-filled with the deal context. Use ## for section headers and Key: Value format for data fields. Be specific to this deal.');
    try {
      const res = await fetch('/api/anthropic', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          system: 'You are an expert B2B enterprise sales coach trained in Force Management, MEDDPICC, Command of the Message, and Challenger Sale. Generate highly specific, deal-ready templates. No generic placeholders. Use ## for section headers. Use Key: Value format for structured fields.',
          messages: [{role:'user', content: prompt}],
          stream: true
        })
      });
      if (!res.ok) throw new Error('API error ' + res.status);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';
      while (true) {
        const {done, value} = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const delta = (parsed.delta && parsed.delta.text) ||
                          (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) || '';
            if (delta) { full += delta; setTmplContent(formatTmplOutput(full)); }
          } catch(e) {}
        }
      }
    } catch(e) {
      setTmplContent('<div style="color:#EF4444;font-size:13px;padding:1rem 0">Error generating template: ' + e.message + '. Check your API key and try again.</div>');
    }
    setTmplLoading(false);
  };

  const exportTemplatePDF = (tmpl, content) => {
    try {
      const { jsPDF } = window.jspdf || {};
      if (!jsPDF) { alert('PDF library not loaded'); return; }
      const doc = new jsPDF({unit:'mm', format:'a4'});
      const plain = content.replace(/<[^>]+>/g, '').replace(/\n{3,}/g, '\n\n').trim();
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxW = pageW - margin * 2;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(5, 12, 24);
      doc.text(tmpl.name, margin, 20);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Sales Intelligence Agent | ' + tmpl.framework, margin, 28);
      doc.setDrawColor(245, 158, 11);
      doc.setLineWidth(0.5);
      doc.line(margin, 31, pageW - margin, 31);
      let y = 40;
      doc.setTextColor(30, 30, 30);
      const allLines = plain.split('\n');
      for (const line of allLines) {
        if (!line.trim()) { y += 3; continue; }
        if (line.startsWith('## ')) {
          if (y > 250) { doc.addPage(); y = 20; }
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(180, 117, 23);
          doc.text(line.slice(3), margin, y);
          y += 7;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(30, 30, 30);
          continue;
        }
        const wrapped = doc.splitTextToSize(line, maxW);
        for (const wl of wrapped) {
          if (y > 270) { doc.addPage(); y = 20; }
          doc.text(wl, margin, y);
          y += 5.5;
        }
      }
      doc.save(tmpl.id + '-' + Date.now() + '.pdf');
    } catch(e) { alert('PDF export error: ' + e.message); }
  };

  const loadDocxLib = () => new Promise((resolve, reject) => {
    if (window.docx) { resolve(window.docx); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.js';
    s.onload = () => resolve(window.docx);
    s.onerror = () => reject(new Error('Could not load DOCX library'));
    document.head.appendChild(s);
  });

  const exportTemplateDOCX = async (tmpl, content) => {
    try {
      const docxLib = await loadDocxLib();
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = docxLib;
      const plain = (content || '').replace(/<[^>]+>/g, '').trim();
      const allLines = plain.split('\n');
      const children = [
        new Paragraph({
          children: [new TextRun({ text: tmpl.name, bold: true, size: 36, color: '050C18' })],
          heading: HeadingLevel.HEADING_1
        }),
        new Paragraph({
          children: [new TextRun({ text: 'Sales Intelligence Agent | ' + tmpl.framework, size: 20, color: '888888' })]
        }),
        new Paragraph({ children: [new TextRun({ text: '' })] }),
      ];
      for (const line of allLines) {
        if (!line.trim()) {
          children.push(new Paragraph({ children: [new TextRun({ text: '' })] }));
          continue;
        }
        if (line.startsWith('## ')) {
          children.push(new Paragraph({
            children: [new TextRun({ text: line.slice(3), bold: true, size: 24, color: 'B47517' })],
            spacing: { before: 240, after: 80 }
          }));
          continue;
        }
        children.push(new Paragraph({
          children: [new TextRun({ text: line, size: 22 })],
          spacing: { after: 40 }
        }));
      }
      const doc = new Document({ sections: [{ children }] });
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = tmpl.id + '-' + Date.now() + '.docx';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch(e) { alert('DOCX export error: ' + e.message); }
  };


  return (
    <>
      <style>{CSS}</style>
      <div className={`app${!darkMode ? ' light-mode' : ''} theme-${colorTheme}`}>
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
              <button onClick={() => setShowApolloModal(true)} className={`apollo-connect-btn${apolloApiKey ? ' connected' : ''}`}>
                {apolloApiKey ? '🔗 APOLLO' : '🔗 Apollo'}
              </button>
              {dealHistory.length > 0 && (
                <button onClick={() => setShowHistory(!showHistory)} style={{ background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.3)", borderRadius:8, padding:"6px 14px", color:"var(--amber)", fontSize:12, fontWeight:700, cursor:"pointer", letterSpacing:1 }}>
                  📋 HISTORY ({dealHistory.length})
                </button>
              )}
              <div style={{ display:'flex', gap:5, alignItems:'center', padding:'4px 8px', background:'var(--card)', border:'1px solid var(--border)', borderRadius:10 }}>
                {[
                  { id:'navy',     color:'#050C18', accent:'#F59E0B', label:'Navy' },
                  { id:'midnight', color:'#08080F', accent:'#818CF8', label:'Midnight' },
                  { id:'slate',    color:'#0F0F1A', accent:'#A78BFA', label:'Slate' },
                  { id:'forest',   color:'#080F0A', accent:'#34D399', label:'Forest' },
                ].map(t => (
                  <button key={t.id} onClick={() => applyTheme(t.id)} title={t.label}
                    style={{ width:18, height:18, borderRadius:'50%', border: colorTheme===t.id ? '2px solid var(--amber)' : '2px solid transparent',
                      background: `linear-gradient(135deg, ${t.color} 50%, ${t.accent} 50%)`,
                      cursor:'pointer', padding:0, transition:'transform 0.15s',
                      transform: colorTheme===t.id ? 'scale(1.25)' : 'scale(1)' }} />
                ))}
              </div>
              <button onClick={() => setDarkMode(!darkMode)} title={darkMode ? "Light Mode" : "Dark Mode"} style={{ background:"transparent", border:"1px solid var(--border)", borderRadius:8, padding:"6px 12px", color:"var(--text-muted)", fontSize:14, cursor:"pointer" }}>
                {darkMode ? "☀️" : "🌙"}
              </button>
            </div>
            </div>
            <div className="header-badge">POWERED BY CLAUDE AI</div>
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
        </header>

        <div className="main">
          {/* Step indicator */}
          {formPreFilled && form.company && (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 18px", background:"rgba(96,165,250,0.07)", border:"1px solid rgba(96,165,250,0.18)", borderRadius:10, marginBottom:16, gap:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span>🔄</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:"var(--text)" }}>Continuing with {form.company}</div>
                  <div style={{ fontSize:11, color:"var(--text-muted)" }}>Pre-filled from last analysis — edit anything or run as-is</div>
                </div>
              </div>
              <button onClick={() => { setForm({ company:"", website:"", market:"", industry:"", product:"", productDesc:"", dealStage:"", dealSize:"", knownContacts:"", recentNews:"", competitorsMentioned:"" }); setFormPreFilled(false); }} style={{ background:"transparent", border:"1px solid var(--border)", borderRadius:7, padding:"6px 14px", color:"var(--text-muted)", fontSize:11, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 }}>Clear and Start Fresh</button>
            </div>
          )}
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
        <div style={{ position:"fixed", top:0, right:0, width:"min(420px, 100vw)", height:"100vh", background:"var(--card)", borderLeft:"1px solid var(--border)", zIndex:1000, overflowY:"auto", padding:"24px 16px" }}>
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
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8 }}>
                  <div style={{ fontSize:11, color:"var(--text-muted)" }}>{h.date}</div>
                  <div style={{ display:"flex", gap:6 }}>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setForm(h.form);
                        setShowHistory(false);
                        setStep(1);
                        setFormPreFilled(true);
                        setPreFilledCompany(h.company);
                      }}
                      style={{ background:"rgba(96,165,250,0.08)", border:"1px solid rgba(96,165,250,0.2)", borderRadius:5, padding:"3px 8px", color:"var(--blue-light)", fontSize:10, cursor:"pointer", fontWeight:700 }}
                    >✎ Edit</button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        if(window.confirm('Remove ' + h.company + ' from history?')) {
                          const updated = dealHistory.filter(x => x.id !== h.id);
                          setDealHistory(updated);
                          try { localStorage.setItem("apac_deal_history", JSON.stringify(updated)); } catch(err) {}
                        }
                      }}
                      style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:5, padding:"3px 8px", color:"#EF4444", fontSize:10, cursor:"pointer", fontWeight:700 }}
                    >✕ Remove</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {step === 1 && (
            <div>
              <div style={{ marginBottom: 32 }} className="fade-up-1">
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(22px, 5vw, 30px)", fontWeight: 800, color: "white", marginBottom: 8 }}>Who are you targeting?</h1>
                <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6 }}>Start with the company. The more you give, the sharper the intelligence.</p>

                {/* ── IMPORT ZONE ── */}
                {!importPreview ? (
                  <div
                    className={`import-zone ${importDragging ? 'import-zone-drag' : ''}`}
                    onDragOver={e => { e.preventDefault(); setImportDragging(true); }}
                    onDragLeave={() => setImportDragging(false)}
                    onDrop={e => {
                      e.preventDefault();
                      setImportDragging(false);
                      const file = e.dataTransfer.files[0];
                      if (file) processImportFile(file);
                    }}
                  >
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:0 }}>
                      <div className="import-zone-icon">📥</div>
                      <div className="import-zone-title">Import your contact list</div>
                      <div className="import-zone-desc">
                        Drop or upload a contact export — we auto-detect the format and build your org chart, stakeholder map and email list instantly.
                      </div>

                      <div className="import-actions-row">
                        <label className="import-zone-btn">
                          <input type="file" accept=".csv,.xlsx,.xls" style={{ display:'none' }} onChange={e => { if(e.target.files[0]) processImportFile(e.target.files[0]); }} />
                          <span>📁</span> Upload CSV or Excel
                        </label>
                        <button className="import-template-btn" onClick={e => { e.stopPropagation(); downloadTemplate(); }}>
                          <span>⬇</span> Download Template
                        </button>
                      </div>

                      <div style={{ fontSize:11, color:"var(--text-dim)", textTransform:"uppercase", letterSpacing:"0.08em", marginTop:14, marginBottom:2, textAlign:"center" }}>Works with</div>
                      <div className="import-source-row">
                        {[
                          { label:'ZoomInfo', color:'#0077B5' },
                          { label:'Apollo', color:'#7C3AED' },
                          { label:'Clay', color:'#EA580C' },
                          { label:'LinkedIn SN', color:'#0A66C2' },
                          { label:'HubSpot', color:'#FF7A59' },
                          { label:'Any CSV', color:'#6B7280' },
                        ].map(s => (
                          <span key={s.label} className="import-source-badge" style={{ borderColor: s.color + '44', color: s.color }}>
                            {s.label}
                          </span>
                        ))}
                      </div>

                      <details className="import-col-guide">
                        <summary>View expected column names</summary>
                        <div className="import-col-grid">
                          {[
                            ['First Name', 'Required'],
                            ['Last Name', 'Required'],
                            ['Job Title', 'Required'],
                            ['Email Address', 'Recommended'],
                            ['Company Name', 'Required'],
                            ['Department', 'Recommended'],
                            ['Management Level', 'Optional'],
                            ['LinkedIn URL', 'Optional'],
                            ['Mobile phone', 'Optional'],
                            ['City', 'Optional'],
                            ['Country', 'Optional'],
                          ].map(([col, req]) => (
                            <div key={col} className="import-col-row">
                              <span className="import-col-name">{col}</span>
                              <span className={`import-col-req ${req === 'Required' ? 'req-required' : req === 'Recommended' ? 'req-recommended' : 'req-optional'}`}>{req}</span>
                            </div>
                          ))}
                        </div>
                        <p style={{ fontSize:10, color:'var(--text-dim)', marginTop:8, lineHeight:1.5 }}>
                          Column names are flexible — we auto-detect ZoomInfo, Apollo, Clay and LinkedIn SN formats. Download the template above for a guaranteed match.
                        </p>
                      </details>
                    </div>
                  </div>
                ) : (
                  <div className="import-preview anim-scale-in">
                    <div className="import-preview-header">
                      <div>
                        <div className="import-preview-source">{importSource?.toUpperCase()} DETECTED</div>
                        <div className="import-preview-title">Found {importedContacts.length} contacts at <strong>{importedContacts[0]?.company || form.company}</strong></div>
                      </div>
                      <button className="import-preview-clear" onClick={() => { setImportPreview(null); setImportedContacts([]); setImportSource(null); }}>✕ Clear</button>
                    </div>
                    <div className="import-contact-grid">
                      {importedContacts.slice(0, 6).map((c, i) => (
                        <div key={i} className="import-contact-chip">
                          <div className="import-contact-avatar">{c.name?.[0] || '?'}</div>
                          <div className="import-contact-info">
                            <div className="import-contact-name">{c.name}</div>
                            <div className="import-contact-title">{c.title}</div>
                          </div>
                          <span className={`tag ${c.archetype === 'Economic Buyer' ? 'tag-amber' : c.archetype === 'Champion' ? 'tag-green' : c.archetype === 'Technical Evaluator' ? 'tag-blue' : 'tag-dim'}`} style={{ fontSize:8, flexShrink:0 }}>{c.archetype.split(' ')[0]}</span>
                        </div>
                      ))}
                      {importedContacts.length > 6 && (
                        <div className="import-contact-chip" style={{ justifyContent:'center', color:'var(--text-dim)', fontSize:12 }}>+{importedContacts.length - 6} more</div>
                      )}
                    </div>
                    <div className="import-preview-footer">
                      <span className="tag tag-green" style={{ fontSize:9 }}>✓ Form pre-filled</span>
                      <span className="tag tag-green" style={{ fontSize:9 }}>✓ Org chart ready</span>
                      <span className="tag tag-green" style={{ fontSize:9 }}>✓ {importedContacts.filter(c=>c.email).length} emails found</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="card fade-up-2">
                <div className="card-title">TARGET ACCOUNT</div>
                <div className="field">
                  <label className="field-label">COMPANY NAME <span>*</span></label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      value={form.company}
                      onChange={e => { set("company", e.target.value); setAutoResearchDone(false); }}
                      onKeyDown={e => { if (e.key === 'Enter' && form.company.length >= 2) autoResearchCompany(form.company); }}
                      placeholder="e.g. OCBC Bank, DBS Bank, Petronas, Axiata..."
                      style={{ flex: 1 }}
                    />
                    <button
                      onClick={() => autoResearchCompany(form.company)}
                      disabled={autoResearchLoading || form.company.length < 2}
                      style={{
                        padding: '11px 18px', borderRadius: 8, border: '1px solid',
                        borderColor: autoResearchDone ? 'var(--green)' : form.company.length >= 2 ? 'rgba(245,158,11,0.5)' : 'var(--border)',
                        background: autoResearchDone ? 'var(--green-dim)' : form.company.length >= 2 ? 'var(--amber-glow)' : 'transparent',
                        color: autoResearchDone ? 'var(--green)' : form.company.length >= 2 ? 'var(--amber)' : 'var(--text-dim)',
                        fontSize: 12, fontWeight: 700,
                        cursor: form.company.length >= 2 && !autoResearchLoading ? 'pointer' : 'not-allowed',
                        whiteSpace: 'nowrap', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', gap: 6,
                        fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1,
                        opacity: form.company.length < 2 ? 0.4 : 1,
                      }}
                    >
                      {autoResearchLoading ? (
                        <><span style={{ display: 'inline-block', width: 10, height: 10, border: '2px solid var(--amber)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />RESEARCHING...</>
                      ) : autoResearchDone ? '✓ RESEARCHED' : '🔍 RESEARCH'}
                    </button>
                  </div>
                  {form.company.length >= 2 && !autoResearchDone && !autoResearchLoading && (
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 5 }}>
                      Press Enter or click Research — AI auto-fills market, industry, news and contacts
                    </div>
                  )}
                  {autoResearchLoading && (
                    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {['Searching company profile...', 'Finding leadership team...', 'Pulling latest news...'].map((label, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--amber)', animation: 'stepPulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.3}s` }} />
                          <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: "'JetBrains Mono', monospace" }}>{label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {autoResearchDone && (
                    <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: 'var(--green)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }}>✓ AUTO-FILLED —</span>
                      {[form.market, form.industry].filter(Boolean).map((v, i) => (
                        <span key={i} className="tag tag-green" style={{ fontSize: 9 }}>{v}</span>
                      ))}
                      {form.recentNews && <span className="tag tag-green" style={{ fontSize: 9 }}>News</span>}
                      {form.knownContacts && <span className="tag tag-green" style={{ fontSize: 9 }}>Contacts</span>}
                      {techStack && <span className="tag tag-green" style={{ fontSize: 9 }}>Tech Stack</span>}
                      <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: "'JetBrains Mono', monospace" }}>— review and edit below</span>
                    </div>
                  )}
                  {techStack && (
                    <div style={{ marginTop: 8, padding: '10px 14px', background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)', borderRadius: 8 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--blue-light)', letterSpacing: 2, marginBottom: 5, fontFamily: "'JetBrains Mono', monospace" }}>TECH STACK DETECTED</div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{techStack.tools}</p>
                      {techStack.likelyReplacing && <p style={{ fontSize: 11, color: 'var(--amber)' }}>→ Likely replacing: {techStack.likelyReplacing}</p>}
                    </div>
                  )}
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
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(20px, 5vw, 30px)", fontWeight: 800, color: "white", marginBottom: 8 }}>What are you selling — and where does it stand?</h1>
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
                  {apolloEnrichLoading && (
                    <div className="apollo-loading">
                      <span style={{ display:'inline-block', width:10, height:10, border:'2px solid #A78BFA', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
                      <span style={{ fontSize:11, color:'#A78BFA', fontFamily:"'JetBrains Mono',monospace", letterSpacing:1 }}>ENRICHING WITH APOLLO...</span>
                    </div>
                  )}
                  {apolloContacts.length > 0 && !apolloEnrichLoading && (
                    <div style={{ marginTop:12 }}>
                      <div style={{ display:'flex', alignItems:'center', marginBottom:8 }}>
                        <span style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace", letterSpacing:1.5, color:'var(--text-dim)', textTransform:'uppercase' }}>Contacts from Apollo</span>
                        <span className="apollo-enriched-badge">🔗 LIVE</span>
                      </div>
                      <div className="apollo-contact-grid">
                        {apolloContacts.map((c, i) => (
                          <div key={i} className={`apollo-contact-card${addedApolloContacts.includes(i) ? ' added' : ''}`}
                            onClick={() => {
                              if (!addedApolloContacts.includes(i)) {
                                const entry = c.name + (c.title ? ' — ' + c.title : '') + (c.email ? ' (' + c.email + ')' : '');
                                set('knownContacts', (form.knownContacts ? form.knownContacts + ', ' : '') + entry);
                                setAddedApolloContacts(prev => [...prev, i]);
                              }
                            }}>
                            <div style={{ fontSize:12, fontWeight:700, color:'var(--text)', marginBottom:2, paddingRight:40 }}>{c.name}</div>
                            <div style={{ fontSize:11, color:'#A78BFA', marginBottom:c.email ? 3 : 0, lineHeight:1.3 }}>{c.title}</div>
                            {c.email && <div style={{ fontSize:10, color:'var(--text-muted)' }}>✉ {c.email}</div>}
                            {c.department && <div style={{ fontSize:10, color:'var(--text-dim)', fontFamily:"'JetBrains Mono',monospace", marginTop:3 }}>{c.department.toUpperCase()}</div>}
                            <div style={{ position:'absolute', top:10, right:10, fontSize:10, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", color: addedApolloContacts.includes(i) ? 'var(--green)' : 'var(--text-dim)' }}>
                              {addedApolloContacts.includes(i) ? '✓' : '+'}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ fontSize:11, color:'var(--text-dim)', marginTop:8 }}>Click any card to add to your brief</div>
                    </div>
                  )}
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
                  {suggestedCompetitors.length > 0 && !form.competitorsMentioned && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1, marginBottom: 6 }}>AI SUGGESTED — click to add:</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {suggestedCompetitors.map((comp, i) => (
                          <button key={i} onClick={() => set('competitorsMentioned', comp)}
                            style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(245,158,11,0.3)', background: 'var(--amber-glow)', color: 'var(--amber)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace" }}>
                            + {comp}
                          </button>
                        ))}
                        <button onClick={() => set('competitorsMentioned', suggestedCompetitors.join(', '))}
                          style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(96,165,250,0.3)', background: 'rgba(96,165,250,0.08)', color: 'var(--blue-light)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                          Add all
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button className="btn-ghost" style={{ marginBottom:20 }} onClick={() => setStep(1)}>← Back</button>

              {/* MEDDPICC Pre-Qualifying Questions */}
              <div className="card fade-up-4" style={{ background:"rgba(26,86,219,0.06)", border:"1px solid rgba(26,86,219,0.2)", marginBottom:24 }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:800, color:"var(--blue-light)", marginBottom:4, letterSpacing:1 }}>MEDDPICC CALIBRATION</div>
                <div style={{ fontSize:11, color:"var(--text-muted)", marginBottom:12 }}>Tell AI what you know about this deal — it will extract the key signals automatically.</div>
                <textarea
                  placeholder={"e.g. Budget of $300K approved by CFO John Smith who I met last week. Competing against SAP and Oracle. Need to go live by Q3 for a regulatory deadline. Pain is $2M/year in manual reporting costs."}
                  value={meddQual._freeText || ''}
                  onChange={e => setMeddQual(p => ({...p, _freeText: e.target.value}))}
                  onBlur={async e => {
                    const text = e.target.value;
                    if (!text || text.length < 20) return;
                    try {
                      const res = await fetch("/api/anthropic", { method:"POST", headers:{"Content-Type":"application/json"},
                        body: JSON.stringify({ model:"claude-haiku-4-5-20251001", max_tokens:500,
                          system:`Extract MEDDPICC signals from this deal description. Return ONLY valid JSON: {"budgetConfirmed":"...","ebIdentified":"...","timelineDefined":"...","competitorsKnown":"...","painQuantified":"..."}`,
                          messages:[{role:"user",content:text}]
                        })
                      });
                      const data = await res.json();
                      const raw = data.content?.map(b=>b.text||'').join('')||'{}';
                      const s=raw.indexOf('{'),e2=raw.lastIndexOf('}');
                      if(s!==-1&&e2!==-1) {
                        const parsed = JSON.parse(raw.slice(s,e2+1));
                        setMeddQual(prev => ({...prev, ...parsed, _freeText: text}));
                      }
                    } catch(err) {}
                  }}
                  style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid var(--border)", borderRadius:8, padding:"10px 12px", color:"var(--text)", fontSize:13, minHeight:90, resize:"vertical", lineHeight:1.7, boxSizing:"border-box", outline:"none" }}
                />
                {(meddQual.budgetConfirmed || meddQual.ebIdentified || meddQual.timelineDefined) && (
                  <div style={{ marginTop:10, display:'flex', gap:6, flexWrap:'wrap' }}>
                    <span style={{ fontSize:9, color:'var(--green)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:1 }}>✓ AI EXTRACTED —</span>
                    {meddQual.budgetConfirmed && <span className="tag tag-green" style={{ fontSize:9 }}>Budget</span>}
                    {meddQual.ebIdentified && <span className="tag tag-green" style={{ fontSize:9 }}>Econ Buyer</span>}
                    {meddQual.timelineDefined && <span className="tag tag-green" style={{ fontSize:9 }}>Timeline</span>}
                    {meddQual.competitorsKnown && <span className="tag tag-green" style={{ fontSize:9 }}>Competitors</span>}
                    {meddQual.painQuantified && <span className="tag tag-green" style={{ fontSize:9 }}>Pain $</span>}
                  </div>
                )}
              </div>

              <div style={{ borderTop:"1px solid var(--border)", paddingTop:24 }}>
                <button onClick={runAnalysis} disabled={!canProceed2} className="btn-amber" style={{ width:"100%", padding:"18px 32px", fontSize:16, letterSpacing:1.5, borderRadius:14, opacity:canProceed2?1:0.4, cursor:canProceed2?"pointer":"not-allowed", boxShadow:canProceed2?"0 8px 32px rgba(245,158,11,0.25)":"none", display:"flex", alignItems:"center", justifyContent:"center", gap:12 }}>
                  <span style={{ fontSize:20 }}>🚀</span>
                  <span>RUN INTELLIGENCE ANALYSIS</span>
                </button>
                <p style={{ textAlign:"center", fontSize:11, color:"var(--text-dim)", marginTop:8 }}>{canProceed2 ? "Generates full deal intelligence in ~20 seconds" : "Fill in required fields to continue"}</p>
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
                    <button className="btn-ghost" onClick={() => setShowExportModal(true)} style={{ display: "flex", alignItems: "center", gap: 6, borderColor: "var(--amber)", color: "var(--amber)" }}>
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
              {/* PDF Export Bar — hidden on mobile, shown on desktop only */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, background: "var(--amber-glow)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 12, padding: "12px 18px" }} className="pdf-export-bar">
                <div style={{ fontSize: 13, color: "var(--amber)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }}>📄 INTELLIGENCE BRIEF READY</div>
                <button
                  onClick={() => setShowExportModal(true)}
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
                <div className="anim-slide-up tab-content-area">
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

                        <details style={{ marginBottom:14 }}>
                          <summary style={{ fontSize:10, color:"var(--text-dim)", fontFamily:"'JetBrains Mono',monospace", letterSpacing:1, listStyle:"none", display:"flex", alignItems:"center", gap:6, userSelect:"none", padding:"6px 0", cursor:"pointer" }}>
                            <span>ⓘ</span> HOW SCORES ARE CALCULATED
                          </summary>
                          <div style={{ marginTop:10, padding:16, background:"var(--card)", border:"1px solid var(--border)", borderRadius:10 }}>
                            <div className="r-grid-2" style={{ gap:20 }}>
                              <div>
                                <div style={{ fontSize:9, fontWeight:700, color:"var(--amber)", letterSpacing:2, marginBottom:10, fontFamily:"'JetBrains Mono',monospace" }}>DEAL SCORE (0-100)</div>
                                <div style={{ fontSize:11, color:"var(--text-muted)", lineHeight:1.8 }}>
                                  <div style={{ marginBottom:6 }}><strong style={{ color:"var(--text)" }}>MEDDPICC Health - 60%</strong> — 8 elements scored Green=100, Amber=50, Red=10.</div>
                                  <div style={{ marginBottom:6 }}><strong style={{ color:"var(--text)" }}>Qualifying Questions - 25%</strong> — 5pts each for Budget, EB, Timeline, Competitors, Pain.</div>
                                  <div><strong style={{ color:"var(--text)" }}>ICP Fit Bonus - 15%</strong> — ICP Score divided by 100 multiplied by 15.</div>
                                </div>
                              </div>
                              <div>
                                <div style={{ fontSize:9, fontWeight:700, color:"var(--amber)", letterSpacing:2, marginBottom:10, fontFamily:"'JetBrains Mono',monospace" }}>ICP SCORE (0-100)</div>
                                <div style={{ fontSize:11, color:"var(--text-muted)", lineHeight:1.8 }}>AI-assessed fit across industry, company size, geography, tech maturity, pain alignment and buying trigger strength.</div>
                              </div>
                            </div>
                          </div>
                        </details>

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

                        {/* News Triggers */}
                        <div className="card anim-slide-up-2" style={{ marginBottom:16 }}>
                          <div className="card-title" style={{ color:'var(--blue-light)' }}>📡 Real-Time News Triggers</div>
                          {!newsTriggers ? (
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                              <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.6 }}>Surface buying signals, org changes and competitive threats from live news.</p>
                              <button className="gen-btn" onClick={async () => {
                                setNewsLoading(true);
                                try {
                                  const res = await fetch("/api/anthropic", { method:"POST", headers:{"Content-Type":"application/json"},
                                    body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:2000,
                                      tools:[{type:"web_search_20250305",name:"web_search"}],
                                      system:`Search for the latest news about this company. Return ONLY valid JSON: {"lastUpdated":"today","urgencyScore":"high|medium|low","urgencyRationale":"One sentence why","windowOfOpportunity":"How long signal stays relevant","triggers":[{"type":"Leadership Change|M&A|Regulatory|Earnings|Strategy|Technology|Risk","headline":"...","detail":"...","salesAngle":"How to use this in a sales conversation","urgency":"high|medium|low"}],"buyingSignals":["Signal 1","Signal 2"],"risks":["Risk 1","Risk 2"],"conversationStarter":"Exact opening line referencing recent news","recommendedFirstAction":"Most important action within 24 hours"}`,
                                      messages:[{role:"user",content:`Find the latest news, announcements, financial results, leadership changes, regulatory issues and strategic initiatives for ${form.company} in ${form.market}. Search for "${form.company} news 2025", "${form.company} results", "${form.company} strategy". What's happened in the last 3 months that a sales rep should know about?`}]
                                    })
                                  });
                                  const data = await res.json();
                                  const text = data.content?.filter(b=>b.type==='text').map(b=>b.text).join('')||'{}';
                                  const s=text.indexOf('{'),e=text.lastIndexOf('}');
                                  if(s!==-1&&e!==-1) setNewsTriggers(JSON.parse(text.slice(s,e+1)));
                                } catch(err) { alert("Failed to fetch news. Try again."); }
                                setNewsLoading(false);
                              }} disabled={newsLoading} style={{ flexShrink:0, marginLeft:16 }}>
                                {newsLoading ? '⏳ Searching...' : '📡 Get Latest News'}
                              </button>
                            </div>
                          ) : (
                            <div className="anim-scale-in">
                              {newsTriggers.urgencyScore && (
                                <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:12, padding:'10px 14px', background: newsTriggers.urgencyScore==='high'?'var(--red-dim)':newsTriggers.urgencyScore==='medium'?'var(--amber-glow)':'var(--card)', border:`1px solid ${newsTriggers.urgencyScore==='high'?'rgba(239,68,68,0.2)':newsTriggers.urgencyScore==='medium'?'rgba(245,158,11,0.2)':'var(--border)'}`, borderRadius:8 }}>
                                  <div>
                                    <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:3 }}>
                                      <span className={`tag ${newsTriggers.urgencyScore==='high'?'tag-red':newsTriggers.urgencyScore==='medium'?'tag-amber':'tag-dim'}`} style={{ fontSize:9 }}>{newsTriggers.urgencyScore?.toUpperCase()} URGENCY</span>
                                      {newsTriggers.windowOfOpportunity && <span style={{ fontSize:11, color:'var(--text-dim)' }}>Window: {newsTriggers.windowOfOpportunity}</span>}
                                    </div>
                                    <p style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.5 }}>{newsTriggers.urgencyRationale}</p>
                                  </div>
                                </div>
                              )}
                              {newsTriggers.recommendedFirstAction && (
                                <div style={{ marginBottom:12, padding:'10px 14px', background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.15)', borderRadius:8 }}>
                                  <div style={{ fontSize:9, fontWeight:700, color:'var(--green)', letterSpacing:2, marginBottom:4, fontFamily:"'JetBrains Mono',monospace" }}>RECOMMENDED ACTION — 24 HRS</div>
                                  <p style={{ fontSize:12, color:'var(--text)', lineHeight:1.5 }}>{newsTriggers.recommendedFirstAction}</p>
                                </div>
                              )}
                              {newsTriggers.conversationStarter && (
                                <div style={{ background:'rgba(29,78,216,0.08)', border:'1px solid rgba(96,165,250,0.2)', borderLeft:'3px solid var(--blue)', borderRadius:'0 8px 8px 0', padding:'12px 14px', marginBottom:14 }}>
                                  <div style={{ fontSize:8, fontWeight:700, color:'var(--blue-light)', letterSpacing:2, marginBottom:5, fontFamily:"'JetBrains Mono',monospace" }}>CONVERSATION STARTER</div>
                                  <p style={{ fontSize:13, color:'var(--text)', lineHeight:1.7, fontStyle:'italic', marginBottom:8 }}>"{newsTriggers.conversationStarter}"</p>
                                  <button className="copy-btn" onClick={() => navigator.clipboard.writeText(newsTriggers.conversationStarter)}>COPY</button>
                                </div>
                              )}
                              {newsTriggers.triggers?.map((t,i) => (
                                <div key={i} style={{ padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
                                  <div style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:4 }}>
                                    <span className={`tag ${t.urgency==='high'?'tag-red':t.urgency==='medium'?'tag-amber':'tag-dim'}`} style={{ flexShrink:0, fontSize:8 }}>{t.type}</span>
                                    <div style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{t.headline}</div>
                                  </div>
                                  <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:5, lineHeight:1.5 }}>{t.detail}</p>
                                  <div style={{ fontSize:11, color:'var(--amber)', background:'var(--amber-glow)', borderRadius:5, padding:'4px 8px', display:'inline-block' }}>💡 {t.salesAngle}</div>
                                </div>
                              ))}
                              {newsTriggers.buyingSignals?.length > 0 && (
                                <div style={{ marginTop:12, padding:12, background:'var(--green-dim)', border:'1px solid rgba(16,185,129,0.15)', borderRadius:8 }}>
                                  <div style={{ fontSize:8, fontWeight:700, color:'var(--green)', letterSpacing:2, marginBottom:6, fontFamily:"'JetBrains Mono',monospace" }}>BUYING SIGNALS</div>
                                  {newsTriggers.buyingSignals.map((s,i) => <div key={i} style={{ fontSize:12, color:'var(--text-muted)', marginBottom:3 }}>✓ {s}</div>)}
                                </div>
                              )}
                              <button onClick={() => setNewsTriggers(null)} className="btn-ghost" style={{ marginTop:10, fontSize:11 }}>Refresh</button>
                            </div>
                          )}
                        </div>

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
                <div className="anim-slide-up tab-content-area">
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
                          {importedContacts.length > 0 && !orgChart && (
                            <div style={{ marginBottom:12, padding:'10px 14px', background:'var(--green-dim)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:8, display:'flex', gap:10, alignItems:'center', justifyContent:'space-between' }}>
                              <div>
                                <div style={{ fontSize:12, fontWeight:700, color:'var(--green)' }}>✓ Org chart from your {importedContacts.length} imported contacts</div>
                                <div style={{ fontSize:11, color:'var(--text-muted)' }}>Built from real data — not AI guesswork</div>
                              </div>
                              <button className="gen-btn" style={{ fontSize:11, padding:'6px 14px' }} onClick={() => {
                                setOrgChart(buildOrgChartFromContacts(importedContacts));
                              }}>Build from Import</button>
                            </div>
                          )}
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

                        {/* Champion Development Playbook */}
                        <div className="inline-section">
                          <div className="section-header">🏆 Champion Development Playbook</div>
                          {!championPlaybook ? (
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                              <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.6 }}>Week-by-week action plan to develop your champion from interested to internal advocate.</p>
                              <button className="gen-btn" onClick={async () => {
                                setChampionPlaybookLoading(true);
                                try {
                                  const champion = result?.stakeholders?.buyingCommittee?.find(s => s.archetype === 'Champion') || result?.stakeholders?.buyingCommittee?.[0];
                                  const res = await fetch("/api/anthropic", { method:"POST", headers:{"Content-Type":"application/json"},
                                    body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:3000, stream:true,
                                      system:`You are a champion development expert. Create a 4-week playbook. Return ONLY valid JSON: {"championProfile":{"role":"...","currentStatus":"...","strengthScore":${result?.stakeholders?.championDevelopmentScore||30}},"weeks":[{"week":1,"theme":"Build Trust","objective":"...","actions":[{"day":"Mon","action":"...","script":"exact words to say/write","outcome":"..."},{"day":"Wed","action":"...","script":"...","outcome":"..."},{"day":"Fri","action":"...","script":"...","outcome":"..."}],"weeklyMilestone":"..."},{"week":2,"theme":"Establish Value","objective":"...","actions":[{"day":"Mon","action":"...","script":"...","outcome":"..."},{"day":"Wed","action":"...","script":"...","outcome":"..."},{"day":"Fri","action":"...","script":"...","outcome":"..."}],"weeklyMilestone":"..."},{"week":3,"theme":"Build Coalition","objective":"...","actions":[{"day":"Mon","action":"...","script":"...","outcome":"..."},{"day":"Wed","action":"...","script":"...","outcome":"..."},{"day":"Fri","action":"...","script":"...","outcome":"..."}],"weeklyMilestone":"..."},{"week":4,"theme":"Activate Advocacy","objective":"...","actions":[{"day":"Mon","action":"...","script":"...","outcome":"..."},{"day":"Wed","action":"...","script":"...","outcome":"..."},{"day":"Fri","action":"...","script":"...","outcome":"..."}],"weeklyMilestone":"..."}],"successIndicators":["...","...","..."],"warningSignsToWatch":["...","...","..."]}`,
                                      messages:[{role:"user",content:`Company: ${form.company}. Product: ${form.product}. Champion: ${champion?.role||'Unknown'} (${champion?.archetype||'Champion'}, access: ${champion?.accessStatus||'unknown'}). Champion score: ${result?.stakeholders?.championDevelopmentScore||30}/100. Gaps: ${result?.stakeholders?.championGaps?.join(', ')||'Unknown'}. Deal stage: ${form.dealStage}. MEDDPICC champion status: ${result?.meddpicc?.elements?.champion?.description||'Unknown'}.`}]
                                    })
                                  });
                                  const reader = res.body.getReader(); const decoder = new TextDecoder(); let raw = "";
                                  while(true) { const {done,value} = await reader.read(); if(done) break;
                                    for(const line of decoder.decode(value,{stream:true}).split("\n")) { if(line.startsWith("data: ")) { try { const evt=JSON.parse(line.slice(6)); if(evt.type==="content_block_delta"&&evt.delta?.type==="text_delta") raw+=evt.delta.text; } catch(e){} } } }
                                  const s=raw.indexOf("{"),e=raw.lastIndexOf("}"); setChampionPlaybook(JSON.parse(raw.slice(s,e+1)));
                                } catch(e) { alert("Failed. Try again."); }
                                setChampionPlaybookLoading(false);
                              }} disabled={championPlaybookLoading} style={{ flexShrink:0, marginLeft:16 }}>
                                {championPlaybookLoading ? '⏳ Building...' : '🏆 Build Playbook'}
                              </button>
                            </div>
                          ) : (
                            <div className="anim-scale-in">
                              <div style={{ display:'flex', gap:12, marginBottom:16 }}>
                                <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:10, padding:'12px 16px', flex:1 }}>
                                  <div style={{ fontSize:8, fontWeight:700, color:'var(--amber)', letterSpacing:2, marginBottom:4, fontFamily:"'JetBrains Mono',monospace" }}>CHAMPION</div>
                                  <div style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{championPlaybook.championProfile?.role}</div>
                                  <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{championPlaybook.championProfile?.currentStatus}</div>
                                </div>
                                <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:10, padding:'12px 16px', textAlign:'center' }}>
                                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:900, color:'var(--amber)' }}>{championPlaybook.championProfile?.strengthScore}</div>
                                  <div style={{ fontSize:8, color:'var(--text-dim)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:1 }}>SCORE</div>
                                </div>
                              </div>
                              {championPlaybook.weeks?.map((week,wi) => (
                                <div key={wi} style={{ marginBottom:16, border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
                                  <div style={{ background:'var(--slate2)', padding:'10px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                                    <div>
                                      <span style={{ fontSize:9, fontWeight:700, color:'var(--amber)', letterSpacing:2, fontFamily:"'JetBrains Mono',monospace" }}>WEEK {week.week} — </span>
                                      <span style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{week.theme}</span>
                                    </div>
                                    <span className="tag tag-dim" style={{ fontSize:9 }}>{week.weeklyMilestone}</span>
                                  </div>
                                  <div style={{ padding:'12px 16px' }}>
                                    <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:10, fontStyle:'italic' }}>{week.objective}</p>
                                    {week.actions?.map((action,ai) => (
                                      <div key={ai} style={{ display:'flex', gap:10, marginBottom:10, alignItems:'flex-start' }}>
                                        <span style={{ fontSize:9, fontWeight:700, color:'var(--amber)', fontFamily:"'JetBrains Mono',monospace", minWidth:28, marginTop:2 }}>{action.day}</span>
                                        <div style={{ flex:1 }}>
                                          <div style={{ fontSize:12, fontWeight:600, color:'var(--text)', marginBottom:3 }}>{action.action}</div>
                                          {action.script && (
                                            <div style={{ fontSize:11, color:'var(--blue-light)', background:'rgba(29,78,216,0.06)', borderRadius:5, padding:'5px 8px', marginBottom:3, fontStyle:'italic' }}>"{action.script}"</div>
                                          )}
                                          <div style={{ fontSize:11, color:'var(--green)' }}>→ {action.outcome}</div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                              <div className="r-grid-2" style={{ marginTop:8 }}>
                                <div style={{ background:'var(--green-dim)', border:'1px solid rgba(16,185,129,0.15)', borderRadius:8, padding:12 }}>
                                  <div style={{ fontSize:8, fontWeight:700, color:'var(--green)', letterSpacing:2, marginBottom:6, fontFamily:"'JetBrains Mono',monospace" }}>SUCCESS INDICATORS</div>
                                  {championPlaybook.successIndicators?.map((s,i) => <div key={i} style={{ fontSize:11, color:'var(--text-muted)', marginBottom:3 }}>✓ {s}</div>)}
                                </div>
                                <div style={{ background:'var(--red-dim)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:8, padding:12 }}>
                                  <div style={{ fontSize:8, fontWeight:700, color:'var(--red)', letterSpacing:2, marginBottom:6, fontFamily:"'JetBrains Mono',monospace" }}>WARNING SIGNS</div>
                                  {championPlaybook.warningSignsToWatch?.map((w,i) => <div key={i} style={{ fontSize:11, color:'var(--text-muted)', marginBottom:3 }}>⚠ {w}</div>)}
                                </div>
                              </div>
                              <button onClick={() => setChampionPlaybook(null)} className="btn-ghost" style={{ marginTop:10, fontSize:11 }}>Regenerate</button>
                            </div>
                          )}
                        </div>

                        {/* Persona Intelligence */}
                        <div className="inline-section">
                          <div className="section-header">🔎 Persona Intelligence</div>
                          <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:14, lineHeight:1.6 }}>AI searches public sources for what each stakeholder is saying and thinking right now.</p>
                          {result?.stakeholders?.buyingCommittee?.map((person, pi) => (
                            <div key={pi} style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:16, marginBottom:10 }}>
                              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                                <div>
                                  <div style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{person.role}</div>
                                  <span className="tag tag-blue" style={{ fontSize:8, marginTop:4 }}>{person.archetype}</span>
                                </div>
                                {!personaData[pi] && (
                                  <button className="gen-btn" style={{ fontSize:11, padding:'6px 14px' }}
                                    onClick={async () => {
                                      setPersonaLoading(pi);
                                      try {
                                        const res = await fetch("/api/anthropic", { method:"POST", headers:{"Content-Type":"application/json"},
                                          body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1500,
                                            tools:[{type:"web_search_20250305",name:"web_search"}],
                                            system:`Research this executive and return ONLY valid JSON: {"publicStance":"What this person is publicly saying about industry trends","recentActivity":["Recent activity 1","Recent activity 2"],"likelyPriorities":["Priority based on role and company context 1","Priority 2"],"conversationHooks":["Specific thing to reference in outreach 1","Hook 2"],"thoughtLeadershipTopics":["Topic they care about 1","Topic 2"],"bestApproach":"How to engage this specific person right now"}`,
                                            messages:[{role:"user",content:`Research ${person.role} at ${form.company} in ${form.market}. Search for "${form.company} ${person.role}", "${form.company} leadership", recent interviews or articles. What are they focused on? What have they said publicly?`}]
                                          })
                                        });
                                        const data = await res.json();
                                        const text = data.content?.filter(b=>b.type==='text').map(b=>b.text).join('')||'{}';
                                        const s=text.indexOf('{'),e=text.lastIndexOf('}');
                                        if(s!==-1&&e!==-1) setPersonaData(prev => ({...prev, [pi]: JSON.parse(text.slice(s,e+1))}));
                                      } catch(err) {}
                                      setPersonaLoading(null);
                                    }} disabled={personaLoading===pi}>
                                    {personaLoading===pi ? '⏳' : '🔎 Research'}
                                  </button>
                                )}
                              </div>
                              {personaData[pi] && (
                                <div className="anim-slide-up" style={{ marginTop:8 }}>
                                  {personaData[pi].publicStance && (
                                    <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:8, padding:'8px 10px', background:'rgba(96,165,250,0.06)', borderRadius:6, lineHeight:1.6 }}>
                                      💭 {personaData[pi].publicStance}
                                    </div>
                                  )}
                                  {personaData[pi].conversationHooks?.length > 0 && (
                                    <div style={{ marginBottom:6 }}>
                                      <div style={{ fontSize:8, fontWeight:700, color:'var(--amber)', letterSpacing:2, marginBottom:4, fontFamily:"'JetBrains Mono',monospace" }}>CONVERSATION HOOKS</div>
                                      {personaData[pi].conversationHooks.map((h,i) => <div key={i} style={{ fontSize:11, color:'var(--text-muted)', marginBottom:3 }}>→ {h}</div>)}
                                    </div>
                                  )}
                                  {personaData[pi].bestApproach && (
                                    <div style={{ fontSize:11, color:'var(--green)', background:'var(--green-dim)', borderRadius:5, padding:'5px 8px' }}>
                                      ✓ {personaData[pi].bestApproach}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Apollo Contact Intelligence */}
                        <div className="inline-section">
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14, flexWrap:'wrap', gap:8 }}>
                            <div className="section-header" style={{ marginBottom:0 }}>🔗 Apollo Contact Intelligence</div>
                            {apolloApiKey && (
                              <button onClick={() => enrichWithApollo(form.company, apolloApiKey)} disabled={apolloEnrichLoading}
                                className="apollo-connect-btn connected" style={{ fontSize:11 }}>
                                {apolloEnrichLoading ? '⏳ ENRICHING...' : '↻ REFRESH'}
                              </button>
                            )}
                          </div>
                          {!apolloApiKey ? (
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', background:'rgba(124,58,237,0.06)', border:'1px solid rgba(124,58,237,0.18)', borderRadius:10 }}>
                              <div>
                                <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:3 }}>Connect Apollo for live contacts</div>
                                <div style={{ fontSize:12, color:'var(--text-muted)' }}>Pull real C-suite contacts, emails and org data directly from Apollo</div>
                              </div>
                              <button onClick={() => setShowApolloModal(true)} className="apollo-connect-btn" style={{ flexShrink:0 }}>🔗 Connect Apollo</button>
                            </div>
                          ) : apolloEnrichLoading ? (
                            <div className="apollo-loading">
                              <span style={{ display:'inline-block', width:10, height:10, border:'2px solid #A78BFA', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
                              <span style={{ fontSize:11, color:'#A78BFA', fontFamily:"'JetBrains Mono',monospace", letterSpacing:1 }}>PULLING CONTACTS FROM APOLLO...</span>
                            </div>
                          ) : apolloContacts.length === 0 ? (
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', background:'rgba(124,58,237,0.06)', border:'1px solid rgba(124,58,237,0.18)', borderRadius:10 }}>
                              <div style={{ fontSize:12, color:'var(--text-muted)' }}>No contacts loaded yet for {form.company}</div>
                              <button onClick={() => enrichWithApollo(form.company, apolloApiKey)} className="apollo-connect-btn connected" style={{ fontSize:11 }}>Search Apollo</button>
                            </div>
                          ) : (
                            <div className="anim-slide-up">
                              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                                <span className="apollo-enriched-badge">🔗 APOLLO LIVE</span>
                                <span style={{ fontSize:11, color:'var(--text-dim)' }}>{apolloContacts.length} contacts found · click any card to add to brief</span>
                              </div>
                              <div className="apollo-contact-grid">
                                {apolloContacts.map((c, i) => (
                                  <div key={i} className={`apollo-contact-card${addedApolloContacts.includes(i) ? ' added' : ''}`}
                                    onClick={() => {
                                      if (!addedApolloContacts.includes(i)) {
                                        const entry = c.name + (c.title ? ' — ' + c.title : '') + (c.email ? ' (' + c.email + ')' : '');
                                        setForm(prev => ({ ...prev, knownContacts: (prev.knownContacts ? prev.knownContacts + ', ' : '') + entry }));
                                        setAddedApolloContacts(prev => [...prev, i]);
                                      }
                                    }}>
                                    <div style={{ fontSize:12, fontWeight:700, color:'var(--text)', marginBottom:2, paddingRight:24 }}>{c.name}</div>
                                    <div style={{ fontSize:11, color:'#A78BFA', lineHeight:1.3, marginBottom: c.email ? 4 : 0 }}>{c.title}</div>
                                    {c.email && (
                                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                                        <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:'monospace' }}>{c.email}</div>
                                        <button className="copy-btn" style={{ fontSize:9, padding:'2px 6px' }}
                                          onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(c.email); }}>COPY</button>
                                      </div>
                                    )}
                                    {c.department && <div style={{ fontSize:10, color:'var(--text-dim)', fontFamily:"'JetBrains Mono',monospace", marginTop:4, letterSpacing:0.5 }}>{c.department.toUpperCase()}</div>}
                                    <div style={{ position:'absolute', top:10, right:10, fontSize:11, fontWeight:700, color: addedApolloContacts.includes(i) ? 'var(--green)' : 'rgba(124,58,237,0.5)' }}>
                                      {addedApolloContacts.includes(i) ? '✓' : '+'}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Email Finder */}
                        <div className="inline-section">
                          <div className="section-header">📧 Email Intelligence</div>
                          {importedContacts.length > 0 && !emailData && (
                            <div style={{ marginBottom:12, padding:'10px 14px', background:'var(--green-dim)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:8, display:'flex', gap:10, alignItems:'center', justifyContent:'space-between' }}>
                              <div>
                                <div style={{ fontSize:12, fontWeight:700, color:'var(--green)' }}>✓ {importedContacts.filter(c=>c.email).length} emails from your import</div>
                                <div style={{ fontSize:11, color:'var(--text-muted)' }}>Real verified emails — no guesswork needed</div>
                              </div>
                              <button className="gen-btn" style={{ fontSize:11, padding:'6px 14px' }} onClick={() => {
                                const emailList = importedContacts.filter(c=>c.email).map(c => ({
                                  role: c.title,
                                  name: c.name,
                                  email: c.email,
                                  emailPattern: null,
                                  confidence: 'high',
                                  source: 'imported',
                                }));
                                setEmailData(emailList.length ? emailList : null);
                              }}>Use Imported Emails</button>
                            </div>
                          )}
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
                        <button className="gen-btn" onClick={() => generateLiVariants(form, result, setLiVariants, setLiVariantsLoading)} disabled={liVariantsLoading}>
                          {liVariantsLoading ? '⏳ Generating...' : '🔗 Generate LinkedIn Variants'}
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

              

              {activeTab === "outreach" && (
                  <div className="inline-section">
                    <div className="section-header" style={{ color:'var(--blue-light)' }}>📨 Email Reply Analyser</div>
                    <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:14, lineHeight:1.6 }}>Paste a prospect's reply and instantly decode what they really mean, their hidden objections and the perfect response to send.</p>
                    <textarea
                      placeholder="Paste the prospect email reply here"
                      value={emailReplyInput}
                      onChange={e => setEmailReplyInput(e.target.value)}
                      style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 12px', color:'var(--text)', fontSize:13, outline:'none', minHeight:100, resize:'vertical', lineHeight:1.6, marginBottom:10, boxSizing:'border-box' }}
                    />
                    <button
                      onClick={async () => {
                        if(!emailReplyInput.trim()) return;
                        setEmailReplyLoading(true); setEmailReplyAnalysis(null);
                        try {
                          const res = await fetch("/api/anthropic", { method:"POST", headers:{"Content-Type":"application/json"},
                            body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:2500, stream:true,
                              system:`You are an expert at reading between the lines of prospect emails. Return ONLY valid JSON: {"overallSentiment":"positive|neutral|negative|stalling|ghosting","buyingSignals":["Signal 1"],"hiddenObjections":["Hidden concern 1","Hidden concern 2"],"whatTheyWant":"What they are really asking for or signalling","urgencyLevel":"high|medium|low|none","riskLevel":"low|medium|high","recommendedAction":"Exactly what to do next","perfectReply":{"subject":"Reply subject line","body":"Complete reply email under 100 words — natural, moves deal forward"},"thingsToAvoid":["Do not say this in your reply"]}`,
                              messages:[{role:"user",content:`Prospect email: "${emailReplyInput}". Context: Selling ${form.product} to ${form.company} (${form.industry}). Deal stage: ${form.dealStage}.`}]
                            })
                          });
                          const reader = res.body.getReader(); const decoder = new TextDecoder(); let raw = "";
                          while(true) { const {done,value} = await reader.read(); if(done) break;
                            for(const line of decoder.decode(value,{stream:true}).split("\n")) { if(line.startsWith("data: ")) { try { const evt=JSON.parse(line.slice(6)); if(evt.type==="content_block_delta"&&evt.delta?.type==="text_delta") raw+=evt.delta.text; } catch(e){} } } }
                          const s=raw.indexOf("{"),e=raw.lastIndexOf("}"); setEmailReplyAnalysis(JSON.parse(raw.slice(s,e+1)));
                        } catch(e) { alert("Failed. Try again."); }
                        setEmailReplyLoading(false);
                      }}
                      disabled={emailReplyLoading||!emailReplyInput.trim()}
                      className="btn-amber"
                      style={{ fontSize:12, padding:'10px 22px', marginBottom: emailReplyAnalysis ? 16 : 0 }}
                    >
                      {emailReplyLoading ? 'ANALYSING...' : '📨 ANALYSE REPLY'}
                    </button>
                    {emailReplyAnalysis && (
                      <div className="anim-scale-in">
                        <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
                          <span className={`tag ${emailReplyAnalysis.overallSentiment==='positive'?'tag-green':emailReplyAnalysis.overallSentiment==='negative'||emailReplyAnalysis.overallSentiment==='ghosting'?'tag-red':'tag-amber'}`}>{emailReplyAnalysis.overallSentiment?.toUpperCase()}</span>
                          <span className={`tag ${emailReplyAnalysis.riskLevel==='high'?'tag-red':emailReplyAnalysis.riskLevel==='medium'?'tag-amber':'tag-green'}`}>{emailReplyAnalysis.riskLevel?.toUpperCase()} RISK</span>
                          <span className={`tag ${emailReplyAnalysis.urgencyLevel==='high'?'tag-green':'tag-dim'}`}>{emailReplyAnalysis.urgencyLevel?.toUpperCase()} URGENCY</span>
                        </div>
                        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:10, padding:14, marginBottom:12 }}>
                          <div style={{ fontSize:8, fontWeight:700, color:'var(--amber)', letterSpacing:2, marginBottom:6, fontFamily:"'JetBrains Mono',monospace" }}>WHAT THEY REALLY WANT</div>
                          <p style={{ fontSize:13, color:'var(--text)', lineHeight:1.6 }}>{emailReplyAnalysis.whatTheyWant}</p>
                        </div>
                        {emailReplyAnalysis.hiddenObjections?.length > 0 && (
                          <div style={{ background:'var(--red-dim)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:10, padding:14, marginBottom:12 }}>
                            <div style={{ fontSize:8, fontWeight:700, color:'var(--red)', letterSpacing:2, marginBottom:6, fontFamily:"'JetBrains Mono',monospace" }}>HIDDEN OBJECTIONS</div>
                            {emailReplyAnalysis.hiddenObjections.map((o,i) => <div key={i} style={{ fontSize:12, color:'var(--text-muted)', marginBottom:3 }}>⚠ {o}</div>)}
                          </div>
                        )}
                        <div style={{ background:'rgba(29,78,216,0.08)', border:'1px solid rgba(96,165,250,0.2)', borderRadius:10, padding:14, marginBottom:12 }}>
                          <div style={{ fontSize:8, fontWeight:700, color:'var(--blue-light)', letterSpacing:2, marginBottom:6, fontFamily:"'JetBrains Mono',monospace" }}>RECOMMENDED ACTION</div>
                          <p style={{ fontSize:13, color:'var(--text)', lineHeight:1.6 }}>{emailReplyAnalysis.recommendedAction}</p>
                        </div>
                        {emailReplyAnalysis.perfectReply && (
                          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:10, padding:16, marginBottom:10 }}>
                            <div style={{ fontSize:8, fontWeight:700, color:'var(--green)', letterSpacing:2, marginBottom:10, fontFamily:"'JetBrains Mono',monospace" }}>PERFECT REPLY</div>
                            <div style={{ fontSize:11, fontWeight:700, color:'var(--text-dim)', marginBottom:4 }}>Subject: {emailReplyAnalysis.perfectReply.subject}</div>
                            <p style={{ fontSize:13, color:'var(--text)', lineHeight:1.75, marginBottom:10, whiteSpace:'pre-line' }}>{emailReplyAnalysis.perfectReply.body}</p>
                            <button className="copy-btn" onClick={() => navigator.clipboard.writeText('Subject: ' + emailReplyAnalysis.perfectReply.subject + '\n\n' + emailReplyAnalysis.perfectReply.body)}>COPY REPLY</button>
                          </div>
                        )}
                        <button onClick={() => { setEmailReplyAnalysis(null); setEmailReplyInput(""); }} className="btn-ghost" style={{ marginTop:8, fontSize:11 }}>Analyse Another</button>
                      </div>
                    )}
                  </div>
              )}
{/* ═══ TAB: PLAYBOOK ═════════════════════════════════════════ */}
              {activeTab === "playbook" && (
                <div className="anim-slide-up tab-content-area">
                  <div style={{marginBottom:'2rem'}}>
                    <div className="section-header" style={{marginBottom:'0.5rem'}}>
                      <div><span style={{marginRight:6}}>&#x1F4DA;</span>Templates Library</div>
                      <span style={{fontSize:'12px',color:'var(--text-muted)'}}>
                        {form.company ? 'AI pre-fill ready — ' + form.company : 'Run intelligence to enable AI pre-fill'}
                      </span>
                    </div>
                    <p style={{fontSize:'13px',color:'var(--text-muted)',marginBottom:'1.25rem',lineHeight:'1.6'}}>
                      18 MEDDPICC and Command of the Message templates. AI pre-filled from your deal. Download as PDF or DOCX.
                    </p>
                    <div className="tmpl-stage-pills">
                      {['all','qualify','align','validate','biz','close','expand'].map(function(s) { return (
                        <button key={s}
                          className={'tmpl-pill' + (tmplStage === s ? ' active' : '')}
                          onClick={function() { setTmplStage(s); setTmplActive(null); setTmplContent(''); }}>
                          {s === 'all' ? 'All 18' : s === 'qualify' ? 'Qualify & discover' : s === 'align' ? 'Solution alignment' : s === 'validate' ? 'Validate & prove' : s === 'biz' ? 'Business case' : s === 'close' ? 'Negotiate & close' : 'Post-sale'}
                        </button>
                      ); })}
                    </div>
                    <div className="tmpl-grid">
                      {TEMPLATE_LIST.filter(function(t) { return tmplStage === 'all' || t.stage === tmplStage; }).map(function(t) { return (
                        <div key={t.id}
                          className={'tmpl-card' + (tmplActive && tmplActive.id === t.id ? ' tmpl-sel' : '')}
                          onClick={function() { setTmplActive(tmplActive && tmplActive.id === t.id ? null : t); setTmplContent(''); }}>
                          <div className="tmpl-icon">{t.icon}</div>
                          <div className="tmpl-name">{t.name}</div>
                          <div className="tmpl-desc">{t.desc}</div>
                          <div className="tmpl-meta">
                            <span className="tmpl-badge">{t.badge}</span>
                            {t.docx && <span className="tmpl-docx-tag">DOCX</span>}
                            <span className="tmpl-fw">{t.framework}</span>
                          </div>
                        </div>
                      ); })}
                    </div>
                    {tmplActive && (
                      <div className="tmpl-preview-panel">
                        <div className="tmpl-preview-top">
                          <div className="tmpl-pname">{tmplActive.name}</div>
                          <div className="tmpl-pmeta">{tmplActive.framework} &middot; {tmplActive.stageLabel}</div>
                          <div className="tmpl-act-row">
                            <button className="tmpl-btn tmpl-btn-ai" disabled={tmplLoading}
                              onClick={function() { generateTemplate(tmplActive); }}>
                              {tmplLoading ? 'Generating...' : (form.company ? 'AI Pre-fill — ' + form.company : 'AI Pre-fill')}
                            </button>
                            <button className="tmpl-btn"
                              onClick={function() { exportTemplatePDF(tmplActive, tmplContent); }}>
                              Blank PDF
                            </button>
                            {tmplActive.docx && (
                              <button className="tmpl-btn"
                                onClick={function() { exportTemplateDOCX(tmplActive, tmplContent); }}>
                                Download DOCX
                              </button>
                            )}
                            {tmplContent && (
                              <button className="tmpl-btn"
                                onClick={function() { navigator.clipboard.writeText(tmplContent); }}>
                                Copy
                              </button>
                            )}
                          </div>
                        </div>
                        {tmplLoading && (
                          <div className="tmpl-gen-loading">
                            <div className="spinner" style={{width:'16px',height:'16px'}} />
                            Generating from deal context...
                          </div>
                        )}
                        {!tmplLoading && !tmplContent && (
                          <div className="tmpl-empty-hint">
                            {form.company
                              ? 'Click AI Pre-fill to generate this template with ' + form.company + ' deal data. Or download the blank PDF.'
                              : 'Run intelligence first for AI pre-fill. Download the blank PDF to use immediately.'}
                          </div>
                        )}
                        {tmplContent && (
                          <div className="tmpl-output"
                            dangerouslySetInnerHTML={{__html: formatTmplOutput(tmplContent)}} />
                        )}
                      </div>
                    )}
                    <div className="tmpl-divider">Playbook tools</div>
                  </div>

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

                  {/* Objection Simulator */}
                  <div className="inline-section">
                    <div className="section-header" style={{ color:'var(--red)' }}>⚡ Objection Simulator</div>
                    <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:14, lineHeight:1.6 }}>Heard an objection in a live meeting? Get the perfect response instantly.</p>
                    <textarea placeholder='Type the objection exactly as they said it... e.g. "We already have a solution for this" or "The price is too high" or "We need to involve procurement first"'
                      value={objectionInput} onChange={e => setObjectionInput(e.target.value)}
                      style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 12px', color:'var(--text)', fontSize:13, outline:'none', minHeight:72, resize:'vertical', lineHeight:1.6, marginBottom:10, boxSizing:'border-box' }} />
                    <button onClick={async () => {
                      if(!objectionInput.trim()) return;
                      setObjectionLoading(true);
                      setObjectionResponse(null);
                      try {
                        const res = await fetch("/api/anthropic", { method:"POST", headers:{"Content-Type":"application/json"},
                          body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:2000, stream:true,
                            system:`You are a world-class enterprise sales coach. Handle this objection brilliantly. Return ONLY valid JSON: {"objectionType":"Price|Timeline|Status Quo|Authority|Need|Trust|Competition","sentiment":"hostile|skeptical|curious|genuine","whatTheyReallyMean":"What's behind this objection — the real concern","immediateResponse":"Your exact response — word for word. Natural, confident, not defensive. Under 60 words.","followUpQuestion":"The single best question to ask after your response","trapToSet":"A question that reveals their weakness or creates urgency","reframingStatement":"How to completely reframe this objection as a buying signal","neverSay":["Do not say this","Do not say this either"],"closingMove":"How to turn this objection into a next step"}`,
                            messages:[{role:"user",content:`Objection: "${objectionInput}". Context: Selling ${form.product} to ${form.company} (${form.industry}). Deal stage: ${form.dealStage}. Their key pain: ${result?.accountBrief?.painPoints?.[0]?.pain||'Unknown'}. MEDDPICC health: ${result?.meddpicc?.overallHealth||'unknown'}.`}]
                          })
                        });
                        const reader = res.body.getReader(); const decoder = new TextDecoder(); let raw = "";
                        while(true) { const {done,value} = await reader.read(); if(done) break;
                          for(const line of decoder.decode(value,{stream:true}).split("\n")) { if(line.startsWith("data: ")) { try { const evt=JSON.parse(line.slice(6)); if(evt.type==="content_block_delta"&&evt.delta?.type==="text_delta") raw+=evt.delta.text; } catch(e){} } } }
                        const s=raw.indexOf("{"),e=raw.lastIndexOf("}"); setObjectionResponse(JSON.parse(raw.slice(s,e+1)));
                      } catch(e) { alert("Failed. Try again."); }
                      setObjectionLoading(false);
                    }} disabled={objectionLoading||!objectionInput.trim()} className="btn-amber" style={{ fontSize:12, padding:'10px 22px', marginBottom: objectionResponse ? 16 : 0 }}>
                      {objectionLoading ? 'ANALYSING...' : '⚡ HANDLE THIS OBJECTION'}
                    </button>
                    {objectionResponse && (
                      <div className="anim-scale-in">
                        <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
                          <span className={`tag ${objectionResponse.sentiment==='hostile'?'tag-red':objectionResponse.sentiment==='skeptical'?'tag-amber':'tag-dim'}`}>{objectionResponse.sentiment?.toUpperCase()}</span>
                          <span className="tag tag-blue">{objectionResponse.objectionType}</span>
                        </div>
                        <div style={{ background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.12)', borderRadius:8, padding:12, marginBottom:12 }}>
                          <div style={{ fontSize:8, fontWeight:700, color:'var(--red)', letterSpacing:2, marginBottom:5, fontFamily:"'JetBrains Mono',monospace" }}>WHAT THEY REALLY MEAN</div>
                          <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.6 }}>{objectionResponse.whatTheyReallyMean}</p>
                        </div>
                        <div style={{ background:'rgba(29,78,216,0.08)', border:'1px solid rgba(96,165,250,0.2)', borderLeft:'3px solid var(--blue)', borderRadius:'0 10px 10px 0', padding:'14px 16px', marginBottom:10 }}>
                          <div style={{ fontSize:8, fontWeight:700, color:'var(--blue-light)', letterSpacing:2, marginBottom:6, fontFamily:"'JetBrains Mono',monospace" }}>SAY THIS — VERBATIM</div>
                          <p style={{ fontSize:14, color:'var(--text)', lineHeight:1.75, marginBottom:10 }}>"{objectionResponse.immediateResponse}"</p>
                          <button className="copy-btn" onClick={() => navigator.clipboard.writeText(objectionResponse.immediateResponse)}>COPY</button>
                        </div>
                        <div className="r-grid-2" style={{ marginBottom:10 }}>
                          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:10, padding:14 }}>
                            <div style={{ fontSize:8, fontWeight:700, color:'var(--green)', letterSpacing:2, marginBottom:6, fontFamily:"'JetBrains Mono',monospace" }}>FOLLOW-UP QUESTION</div>
                            <p style={{ fontSize:12, color:'var(--text)', fontStyle:'italic', lineHeight:1.6 }}>"{objectionResponse.followUpQuestion}"</p>
                          </div>
                          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:10, padding:14 }}>
                            <div style={{ fontSize:8, fontWeight:700, color:'var(--amber)', letterSpacing:2, marginBottom:6, fontFamily:"'JetBrains Mono',monospace" }}>🪤 TRAP TO SET</div>
                            <p style={{ fontSize:12, color:'var(--text)', fontStyle:'italic', lineHeight:1.6 }}>"{objectionResponse.trapToSet}"</p>
                          </div>
                        </div>
                        {objectionResponse.closingMove && (
                          <div style={{ background:'var(--amber-glow)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:8, padding:12 }}>
                            <div style={{ fontSize:8, fontWeight:700, color:'var(--amber)', letterSpacing:2, marginBottom:5, fontFamily:"'JetBrains Mono',monospace" }}>CLOSING MOVE</div>
                            <p style={{ fontSize:12, color:'var(--text)', lineHeight:1.6 }}>{objectionResponse.closingMove}</p>
                          </div>
                        )}
                        <button onClick={() => { setObjectionResponse(null); setObjectionInput(""); }} className="btn-ghost" style={{ marginTop:10, fontSize:11 }}>Try Another Objection</button>
                      </div>
                    )}
                  </div>

                  {/* Battle Cards */}
                  <div className="inline-section">
                    <div className="section-header">⚔️ Battle Cards</div>
                    {!battleCards ? (
                      <button className="gen-btn" onClick={() => generateBattleCards(form.competitorsMentioned, form, result, setBattleCards, setBattleLoading)} disabled={battleLoading||!form.competitorsMentioned}>
                        {battleLoading ? '⏳ Generating...' : form.competitorsMentioned ? '⚔️ Generate Battle Cards' : 'Add competitors in the form first'}
                      </button>
                    ) : (
                      <div className="anim-scale-in">
                        {battleCards.map((bc,i) => (
                          <div key={i} className="card" style={{ marginBottom:10 }}>
                            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:800, color:'var(--amber)', marginBottom:12 }}>vs. {bc.competitor}</div>
                            <div className="compete-vs">
                              <div className="compete-win"><div className="compete-label" style={{ color:'var(--green)' }}>✓ We Win When</div>{(Array.isArray(bc.weWinWhen)?bc.weWinWhen:[bc.weWinWhen]).filter(Boolean).map((w,j) => <div key={j} style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>{w}</div>)}</div>
                              <div className="compete-lose"><div className="compete-label" style={{ color:'var(--red)' }}>✗ They Attack</div>{(Array.isArray(bc.theyAttackWith)?bc.theyAttackWith:[bc.theyAttackWith]).filter(Boolean).map((w,j) => <div key={j} style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>{w}</div>)}</div>
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
                <div className="anim-slide-up tab-content-area">
                  {/* POV Builder */}
                  <div className="card" style={{ marginBottom:20 }}>
                    <div className="card-title" style={{ color:'var(--blue-light)' }}>📐 Point of View Document</div>
                    <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:16, lineHeight:1.6 }}>A strategic advisor document — not a pitch. Written from your perspective on their industry, their situation and the path forward. Champions use this to build internal consensus.</p>
                    {!povDoc ? (
                      <button onClick={async () => {
                        setPovLoading(true);
                        try {
                          const res = await fetch("/api/anthropic", { method:"POST", headers:{"Content-Type":"application/json"},
                            body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:5000,
                              tools:[{type:"web_search_20250305",name:"web_search"}],
                              system:`You are a McKinsey-trained strategic advisor writing a Point of View document for an enterprise sales engagement. This is NOT a sales pitch. It is a thought leadership document that demonstrates deep industry expertise. Return ONLY valid JSON:
{"title":"Point of View: [Topic relevant to their industry]","executiveTheme":"The single strategic insight that ties everything together","industryPerspective":{"headline":"What is happening in this industry right now","trends":["Trend 1 with data point","Trend 2 with data point","Trend 3 with data point"],"regulatoryContext":"Key regulatory or compliance forces at play","competitiveDynamics":"How the competitive landscape is shifting","analystPerspective":"What Gartner/Forrester/IDC are saying about this space"},"yourSituation":{"headline":"What this means for [Company]","specificChallenges":["Challenge specific to their situation 1","Challenge 2","Challenge 3"],"costOfInaction":"The strategic risk of not acting","opportunityWindow":"Why now is the right time","peersAreMoving":"What leading peers in their space are doing"},"recommendedPath":{"headline":"A recommended path forward","principlesForSuccess":["Principle 1","Principle 2","Principle 3"],"phaseApproach":"High-level phased approach","quickWins":["Quick win 1 achievable in 30 days","Quick win 2"],"longerTermVision":"Where this leads in 18-24 months"},"closingPerspective":"2-3 sentence closing that positions you as a trusted advisor, not a vendor"}`,
                              messages:[{role:"user",content:`Write a Point of View for ${form.company} in the ${form.industry} industry, ${form.market} market. Their key pain points: ${result?.accountBrief?.painPoints?.map(p=>p.pain).join(', ')||''}. We sell: ${form.product} — ${form.productDesc||''}. Market context: ${result?.accountBrief?.marketContext||''}. Search for the latest trends, analyst reports and news in the ${form.industry} industry in ${form.market} to make this data-driven and credible.`}]
                            })
                          });
                          const data = await res.json();
                          const text = data.content?.filter(b=>b.type==='text').map(b=>b.text).join('')||'{}';
                          const s=text.indexOf('{'),e=text.lastIndexOf('}');
                          if(s!==-1&&e!==-1) setPovDoc(stripCiteTags(JSON.parse(text.slice(s,e+1))));
                        } catch(err) { alert("Failed to generate POV. Try again."); }
                        setPovLoading(false);
                      }} disabled={povLoading} className="btn-amber" style={{ fontSize:12, padding:'11px 28px' }}>
                        {povLoading ? 'RESEARCHING & WRITING...' : '📐 GENERATE POINT OF VIEW'}
                      </button>
                    ) : (
                      <div className="anim-scale-in">
                        {/* POV Header */}
                        <div style={{ background:'linear-gradient(135deg,rgba(29,78,216,0.15),rgba(8,17,30,0.8))', border:'1px solid rgba(96,165,250,0.2)', borderRadius:14, padding:22, marginBottom:16 }}>
                          <div style={{ fontSize:9, color:'var(--blue-light)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:2, marginBottom:6 }}>POINT OF VIEW DOCUMENT · {form.company?.toUpperCase()}</div>
                          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:900, color:'white', lineHeight:1.3, marginBottom:8 }}>{povDoc.title}</div>
                          <p style={{ fontSize:13, color:'var(--blue-light)', lineHeight:1.7, fontStyle:'italic' }}>{povDoc.executiveTheme}</p>
                          <div style={{ display:'flex', gap:8, marginTop:14 }}>
                            <button className="copy-btn" onClick={() => {
                              const full = `POINT OF VIEW: ${povDoc.title}

${povDoc.executiveTheme}

INDUSTRY PERSPECTIVE
${povDoc.industryPerspective?.headline}
${povDoc.industryPerspective?.trends?.join(', ')}

YOUR SITUATION
${povDoc.yourSituation?.headline}
${povDoc.yourSituation?.specificChallenges?.join(', ')}

RECOMMENDED PATH
${povDoc.recommendedPath?.headline}
${povDoc.recommendedPath?.principlesForSuccess?.join(', ')}

${povDoc.closingPerspective}`;
                              navigator.clipboard.writeText(full);
                            }}>COPY FULL DOCUMENT</button>
                            <button onClick={() => setPovDoc(null)} className="btn-ghost" style={{ fontSize:11, padding:'4px 12px' }}>Regenerate</button>
                          </div>
                        </div>

                        {/* Section 1: Industry Perspective */}
                        <div className="card" style={{ marginBottom:12 }}>
                          <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:12 }}>
                            <div style={{ width:24, height:24, borderRadius:6, background:'var(--blue)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:900, color:'white', flexShrink:0 }}>1</div>
                            <div className="section-header" style={{ margin:0, flex:1 }}>Industry Perspective</div>
                          </div>
                          <p style={{ fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:14, lineHeight:1.5 }}>{povDoc.industryPerspective?.headline}</p>
                          {povDoc.industryPerspective?.trends?.map((t,i) => (
                            <div key={i} style={{ display:'flex', gap:10, marginBottom:8, alignItems:'flex-start' }}>
                              <span style={{ color:'var(--blue-light)', fontWeight:700, fontSize:12, marginTop:1, flexShrink:0 }}>→</span>
                              <span style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.6 }}>{t}</span>
                            </div>
                          ))}
                          {povDoc.industryPerspective?.regulatoryContext && (
                            <div style={{ marginTop:12, padding:'10px 12px', background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.12)', borderRadius:8 }}>
                              <div style={{ fontSize:8, fontWeight:700, color:'var(--red)', letterSpacing:2, marginBottom:4, fontFamily:"'JetBrains Mono',monospace" }}>REGULATORY CONTEXT</div>
                              <p style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.6 }}>{povDoc.industryPerspective.regulatoryContext}</p>
                            </div>
                          )}
                          {povDoc.industryPerspective?.analystPerspective && (
                            <div style={{ marginTop:8, padding:'10px 12px', background:'rgba(96,165,250,0.06)', border:'1px solid rgba(96,165,250,0.12)', borderRadius:8 }}>
                              <div style={{ fontSize:8, fontWeight:700, color:'var(--blue-light)', letterSpacing:2, marginBottom:4, fontFamily:"'JetBrains Mono',monospace" }}>ANALYST PERSPECTIVE</div>
                              <p style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.6 }}>{povDoc.industryPerspective.analystPerspective}</p>
                            </div>
                          )}
                        </div>

                        {/* Section 2: Your Situation */}
                        <div className="card" style={{ marginBottom:12 }}>
                          <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:12 }}>
                            <div style={{ width:24, height:24, borderRadius:6, background:'var(--red)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:900, color:'white', flexShrink:0 }}>2</div>
                            <div className="section-header" style={{ margin:0, flex:1 }}>Your Situation</div>
                          </div>
                          <p style={{ fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:14, lineHeight:1.5 }}>{povDoc.yourSituation?.headline}</p>
                          {povDoc.yourSituation?.specificChallenges?.map((ch,i) => (
                            <div key={i} style={{ display:'flex', gap:10, marginBottom:8 }}>
                              <span style={{ color:'var(--red)', fontWeight:700, fontSize:12, flexShrink:0 }}>✗</span>
                              <span style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.6 }}>{ch}</span>
                            </div>
                          ))}
                          {povDoc.yourSituation?.costOfInaction && (
                            <div style={{ marginTop:12, padding:'10px 12px', background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.12)', borderRadius:8 }}>
                              <div style={{ fontSize:8, fontWeight:700, color:'var(--red)', letterSpacing:2, marginBottom:4, fontFamily:"'JetBrains Mono',monospace" }}>COST OF INACTION</div>
                              <p style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.6 }}>{povDoc.yourSituation.costOfInaction}</p>
                            </div>
                          )}
                          {povDoc.yourSituation?.peersAreMoving && (
                            <div style={{ marginTop:8, padding:'10px 12px', background:'var(--amber-glow)', border:'1px solid rgba(245,158,11,0.15)', borderRadius:8 }}>
                              <div style={{ fontSize:8, fontWeight:700, color:'var(--amber)', letterSpacing:2, marginBottom:4, fontFamily:"'JetBrains Mono',monospace" }}>PEERS ARE MOVING</div>
                              <p style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.6 }}>{povDoc.yourSituation.peersAreMoving}</p>
                            </div>
                          )}
                        </div>

                        {/* Section 3: Recommended Path */}
                        <div className="card" style={{ marginBottom:12 }}>
                          <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:12 }}>
                            <div style={{ width:24, height:24, borderRadius:6, background:'var(--green)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:900, color:'white', flexShrink:0 }}>3</div>
                            <div className="section-header" style={{ margin:0, flex:1 }}>Recommended Path</div>
                          </div>
                          <p style={{ fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:14, lineHeight:1.5 }}>{povDoc.recommendedPath?.headline}</p>
                          {povDoc.recommendedPath?.principlesForSuccess?.map((p,i) => (
                            <div key={i} style={{ display:'flex', gap:10, marginBottom:8 }}>
                              <span style={{ color:'var(--green)', fontWeight:700, fontSize:12, flexShrink:0 }}>✓</span>
                              <span style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.6 }}>{p}</span>
                            </div>
                          ))}
                          {povDoc.recommendedPath?.quickWins?.length > 0 && (
                            <div style={{ marginTop:12, padding:'10px 12px', background:'var(--green-dim)', border:'1px solid rgba(16,185,129,0.15)', borderRadius:8 }}>
                              <div style={{ fontSize:8, fontWeight:700, color:'var(--green)', letterSpacing:2, marginBottom:6, fontFamily:"'JetBrains Mono',monospace" }}>QUICK WINS (30 DAYS)</div>
                              {povDoc.recommendedPath.quickWins.map((w,i) => <div key={i} style={{ fontSize:12, color:'var(--text-muted)', marginBottom:3 }}>→ {w}</div>)}
                            </div>
                          )}
                        </div>

                        {/* Closing */}
                        {povDoc.closingPerspective && (
                          <div style={{ background:'rgba(29,78,216,0.07)', border:'1px solid rgba(96,165,250,0.15)', borderLeft:'3px solid var(--blue)', borderRadius:'0 10px 10px 0', padding:'14px 16px' }}>
                            <p style={{ fontSize:13, color:'var(--text)', lineHeight:1.8, fontStyle:'italic' }}>{povDoc.closingPerspective}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ROI Calculator */}
                  <div className="card" style={{ marginBottom:20 }}>
                    <div className="card-title">💰 ROI Calculator</div>
                    {!roiPreFilled && (
                      <div style={{ marginBottom:16, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background:'rgba(96,165,250,0.06)', border:'1px solid rgba(96,165,250,0.15)', borderRadius:8 }}>
                        <div>
                          <div style={{ fontSize:12, fontWeight:700, color:'var(--blue-light)' }}>AI can estimate baseline figures</div>
                          <div style={{ fontSize:11, color:'var(--text-muted)' }}>Based on {form.company}'s industry and size — edit after</div>
                        </div>
                        <button className="gen-btn" style={{ fontSize:11, padding:'6px 14px', flexShrink:0, marginLeft:12 }}
                          onClick={async () => {
                            setRoiPreFillLoading(true);
                            try {
                              const res = await fetch("/api/anthropic", { method:"POST", headers:{"Content-Type":"application/json"},
                                body: JSON.stringify({ model:"claude-haiku-4-5-20251001", max_tokens:400,
                                  system:`Estimate ROI calculator inputs for a B2B SaaS sale. Return ONLY valid JSON: {"employees":"number of finance/ops staff affected","avgSalary":"average annual salary USD as number","hoursPerWeek":"hours per week spent on manual work as number","currentErrors":"annual cost of errors and compliance risk USD as number","dealSize":"estimated ACV USD as number based on company size"}`,
                                  messages:[{role:"user",content:`Company: ${form.company}. Industry: ${form.industry}. Market: ${form.market}. Deal size target: ${form.dealSize || 'unknown'}. Product: ${form.product}. Estimate realistic ROI inputs.`}]
                                })
                              });
                              const data = await res.json();
                              const raw = data.content?.map(b=>b.text||'').join('')||'{}';
                              const s=raw.indexOf('{'),e=raw.lastIndexOf('}');
                              if(s!==-1&&e!==-1) {
                                const parsed = JSON.parse(raw.slice(s,e+1));
                                setRoiInputs(prev => ({
                                  ...prev,
                                  employees: parsed.employees || prev.employees,
                                  avgSalary: parsed.avgSalary || prev.avgSalary,
                                  hoursPerWeek: parsed.hoursPerWeek || prev.hoursPerWeek,
                                  currentErrors: parsed.currentErrors || prev.currentErrors,
                                  dealSize: parsed.dealSize || prev.dealSize,
                                }));
                                setRoiPreFilled(true);
                              }
                            } catch(err) {}
                            setRoiPreFillLoading(false);
                          }}
                          disabled={roiPreFillLoading}
                        >
                          {roiPreFillLoading ? '⏳ Estimating...' : '✨ AI Estimate'}
                        </button>
                      </div>
                    )}
                    {roiPreFilled && (
                      <div style={{ marginBottom:12, display:'flex', gap:6, alignItems:'center' }}>
                        <span style={{ fontSize:10, color:'var(--green)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:1 }}>✓ AI ESTIMATED —</span>
                        <span style={{ fontSize:11, color:'var(--text-muted)' }}>review and adjust before calculating</span>
                        <button onClick={() => setRoiPreFilled(false)} style={{ fontSize:10, color:'var(--text-dim)', background:'none', border:'none', cursor:'pointer', marginLeft:'auto' }}>Re-estimate</button>
                      </div>
                    )}
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
                      {roiResult?.scenarios && (
                        <div style={{ marginBottom:16 }}>
                          <div style={{ fontSize:9, fontWeight:700, color:'var(--amber)', letterSpacing:2, marginBottom:10, fontFamily:"'JetBrains Mono',monospace" }}>3-SCENARIO ANALYSIS</div>
                          <div className="r-grid-3">
                            {Object.values(roiResult.scenarios).map((sc,i) => (
                              <div key={i} style={{ background: i===1?'var(--amber-glow)':'var(--card)', border:`1px solid ${i===1?'rgba(245,158,11,0.3)':'var(--border)'}`, borderRadius:10, padding:14, textAlign:'center' }}>
                                <div style={{ fontSize:8, fontWeight:700, color: i===0?'var(--text-dim)':i===1?'var(--amber)':'var(--green)', letterSpacing:2, marginBottom:6, fontFamily:"'JetBrains Mono',monospace" }}>{sc.label.toUpperCase()}</div>
                                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:900, color: i===0?'var(--text-dim)':i===1?'var(--amber)':'var(--green)' }}>{sc.roi}%</div>
                                <div style={{ fontSize:10, color:'var(--text-dim)', marginTop:2 }}>ROI · {sc.payback}mo payback</div>
                                <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:6, lineHeight:1.4 }}>${sc.benefit?.toLocaleString()} benefit</div>
                                <div style={{ fontSize:9, color:'var(--text-dim)', marginTop:4, fontStyle:'italic' }}>{sc.assumption}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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

                  {/* Close Plan Builder */}
                  <div className="inline-section">
                    <div className="section-header" style={{ color:'var(--amber)' }}>🎯 Close Plan Builder</div>
                    <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:14, lineHeight:1.6 }}>Enter your target close date and AI builds a backwards-mapped plan — milestones, stakeholders, and actions needed to close on time.</p>
                    <div style={{ marginBottom:14 }}>
                      <div style={{ marginBottom:10 }}>
                        <div style={{ fontSize:9, fontWeight:700, color:'var(--text-dim)', letterSpacing:2, marginBottom:6, fontFamily:"'JetBrains Mono',monospace" }}>TARGET CLOSE DATE</div>
                        <input type="date" value={closeDate} onChange={e => setCloseDate(e.target.value)} className="input-field" style={{ width:'100%', maxWidth:280 }} />
                      </div>
                      <button onClick={async () => {
                        if (!closeDate) return;
                        setClosePlanLoading(true);
                        try {
                          const res = await fetch("/api/anthropic", { method:"POST", headers:{"Content-Type":"application/json"},
                            body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:3000, stream:true,
                              system:`You are a world-class enterprise sales strategist. Build a backwards-mapped close plan. Return ONLY valid JSON: {"targetCloseDate":"...","weeksToClose":8,"overallStrategy":"One sentence on the close approach","phases":[{"week":"Week 1-2","theme":"Discovery & Validation","milestone":"What must be achieved","actions":[{"action":"Specific action","owner":"Rep|Champion|EB|Procurement","priority":"critical|high|medium"}],"riskIfMissed":"What happens if this phase slips"},{"week":"Week 3-4","theme":"Technical Validation","milestone":"...","actions":[{"action":"...","owner":"...","priority":"..."}],"riskIfMissed":"..."},{"week":"Week 5-6","theme":"Business Case & EB Access","milestone":"...","actions":[{"action":"...","owner":"...","priority":"..."}],"riskIfMissed":"..."},{"week":"Week 7-8","theme":"Procurement & Close","milestone":"...","actions":[{"action":"...","owner":"...","priority":"..."}],"riskIfMissed":"..."}],"criticalPathItems":["The single most important thing that could derail this deal","Second biggest risk"],"earlyWarningSignals":["Signal that deal is slipping 1","Signal 2"]}`,
                              messages:[{role:"user",content:`Target close date: ${closeDate}. Company: ${form.company}. Industry: ${form.industry}. Deal stage: ${form.dealStage}. Deal size: ${form.dealSize || 'TBD'}. MEDDPICC health: ${result?.meddpicc?.overallHealth || 'unknown'}. Champion score: ${result?.stakeholders?.championDevelopmentScore || 'unknown'}. Key gaps: ${result?.meddpicc?.dealRisks?.join(', ') || 'unknown'}.`}]
                            })
                          });
                          const reader = res.body.getReader(); const decoder = new TextDecoder(); let raw = "";
                          while(true) { const {done,value} = await reader.read(); if(done) break;
                            for(const line of decoder.decode(value,{stream:true}).split(new RegExp("\n"))) { if(line.startsWith("data: ")) { try { const evt=JSON.parse(line.slice(6)); if(evt.type==="content_block_delta"&&evt.delta?.type==="text_delta") raw+=evt.delta.text; } catch(e){} } } }
                          const s=raw.indexOf("{"),e=raw.lastIndexOf("}"); setClosePlan(JSON.parse(raw.slice(s,e+1)));
                        } catch(e) { alert("Failed. Try again."); }
                        setClosePlanLoading(false);
                      }} disabled={closePlanLoading||!closeDate} className="btn-amber" style={{ fontSize:12, padding:'10px 24px' }}>
                        {closePlanLoading ? 'BUILDING...' : '🎯 BUILD CLOSE PLAN'}
                      </button>
                    </div>
                    {closePlan && (
                      <div className="anim-scale-in">
                        <div style={{ background:'linear-gradient(135deg,rgba(245,158,11,0.1),rgba(234,88,12,0.07))', border:'1px solid rgba(245,158,11,0.2)', borderRadius:12, padding:16, marginBottom:14 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:800, color:'var(--amber)' }}>Close by {closePlan.targetCloseDate}</div>
                            <span className="tag tag-amber" style={{ fontSize:9 }}>{closePlan.weeksToClose} weeks</span>
                          </div>
                          <p style={{ fontSize:13, color:'var(--text)', lineHeight:1.6 }}>{closePlan.overallStrategy}</p>
                        </div>
                        {closePlan.phases?.map((phase, pi) => (
                          <div key={pi} style={{ border:'1px solid var(--border)', borderRadius:12, overflow:'hidden', marginBottom:10 }}>
                            <div style={{ background:'var(--slate2)', padding:'10px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                              <div>
                                <span style={{ fontSize:9, fontWeight:700, color:'var(--amber)', letterSpacing:2, fontFamily:"'JetBrains Mono',monospace" }}>{phase.week} — </span>
                                <span style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{phase.theme}</span>
                              </div>
                              <span className="tag tag-dim" style={{ fontSize:9 }}>✓ {phase.milestone}</span>
                            </div>
                            <div style={{ padding:'12px 16px' }}>
                              {phase.actions?.map((a, ai) => (
                                <div key={ai} style={{ display:'flex', gap:8, marginBottom:6, alignItems:'flex-start' }}>
                                  <span className={`tag ${a.priority==='critical'?'tag-red':a.priority==='high'?'tag-amber':'tag-dim'}`} style={{ fontSize:8, flexShrink:0 }}>{a.owner}</span>
                                  <span style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.5 }}>{a.action}</span>
                                </div>
                              ))}
                              {phase.riskIfMissed && (
                                <div style={{ marginTop:8, fontSize:11, color:'var(--red)', background:'var(--red-dim)', borderRadius:5, padding:'4px 8px' }}>⚠ If missed: {phase.riskIfMissed}</div>
                              )}
                            </div>
                          </div>
                        ))}
                        <div className="r-grid-2" style={{ marginTop:8 }}>
                          <div style={{ background:'var(--red-dim)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:8, padding:12 }}>
                            <div style={{ fontSize:8, fontWeight:700, color:'var(--red)', letterSpacing:2, marginBottom:6, fontFamily:"'JetBrains Mono',monospace" }}>CRITICAL PATH</div>
                            {closePlan.criticalPathItems?.map((c,i) => <div key={i} style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>→ {c}</div>)}
                          </div>
                          <div style={{ background:'var(--amber-glow)', border:'1px solid rgba(245,158,11,0.15)', borderRadius:8, padding:12 }}>
                            <div style={{ fontSize:8, fontWeight:700, color:'var(--amber)', letterSpacing:2, marginBottom:6, fontFamily:"'JetBrains Mono',monospace" }}>EARLY WARNING SIGNALS</div>
                            {closePlan.earlyWarningSignals?.map((s,i) => <div key={i} style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>⚠ {s}</div>)}
                          </div>
                        </div>
                        <button onClick={() => setClosePlan(null)} className="btn-ghost" style={{ marginTop:10, fontSize:11 }}>Rebuild</button>
                      </div>
                    )}
                  </div>

                  {/* Mutual Success Plan */}
                  <div className="inline-section">
                    <div className="section-header">🤝 Mutual Success Plan</div>
                    <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:16, lineHeight:1.6 }}>A co-created plan to share with your prospect. Joint milestones, mutual commitments and success metrics — aligns both sides and accelerates close.</p>
                    {!mutualSuccessPlan ? (
                      <button onClick={async () => {
                        setMutualSuccessLoading(true);
                        try {
                          const res = await fetch("/api/anthropic", { method:"POST", headers:{"Content-Type":"application/json"},
                            body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:4000, stream:true,
                              system:`Create a Mutual Success Plan. Return ONLY valid JSON: {"title":"Mutual Success Plan — [Company] x [Vendor]","objective":"One sentence joint objective","phases":[{"phase":1,"name":"Discovery & Alignment","duration":"Weeks 1-2","vendorCommitments":["...","..."],"buyerCommitments":["...","..."],"jointMilestone":"...","successCriteria":"..."},{"phase":2,"name":"Evaluation","duration":"Weeks 3-4","vendorCommitments":["...","..."],"buyerCommitments":["...","..."],"jointMilestone":"...","successCriteria":"..."},{"phase":3,"name":"Decision & Contracting","duration":"Week 5-6","vendorCommitments":["...","..."],"buyerCommitments":["...","..."],"jointMilestone":"...","successCriteria":"..."},{"phase":4,"name":"Implementation","duration":"Weeks 7-12","vendorCommitments":["...","..."],"buyerCommitments":["...","..."],"jointMilestone":"...","successCriteria":"..."}],"successMetrics":[{"metric":"...","baseline":"...","target":"...","timeframe":"..."}],"nextStep":"The single most important next action"}`,
                              messages:[{role:"user",content:`Vendor selling ${form.product}. Buyer: ${form.company} (${form.industry}, ${form.market}). Stage: ${form.dealStage}. Deal size: ${form.dealSize||'TBD'}. Pain: ${result?.accountBrief?.painPoints?.map(p=>p.pain).join(', ')||''}.`}]
                            })
                          });
                          const reader = res.body.getReader(); const decoder = new TextDecoder(); let raw = "";
                          while(true) { const {done,value} = await reader.read(); if(done) break;
                            for(const line of decoder.decode(value,{stream:true}).split("\n")) { if(line.startsWith("data: ")) { try { const evt=JSON.parse(line.slice(6)); if(evt.type==="content_block_delta"&&evt.delta?.type==="text_delta") raw+=evt.delta.text; } catch(e){} } } }
                          const s=raw.indexOf("{"),e=raw.lastIndexOf("}"); setMutualSuccessPlan(JSON.parse(raw.slice(s,e+1)));
                        } catch(e) { alert("Failed. Try again."); }
                        setMutualSuccessLoading(false);
                      }} disabled={mutualSuccessLoading} className="btn-amber" style={{ fontSize:12, padding:'11px 24px' }}>
                        {mutualSuccessLoading ? 'GENERATING...' : '🤝 GENERATE MUTUAL SUCCESS PLAN'}
                      </button>
                    ) : (
                      <div className="anim-scale-in">
                        <div style={{ background:'linear-gradient(135deg,rgba(16,185,129,0.1),rgba(6,95,70,0.15))', border:'1px solid rgba(16,185,129,0.2)', borderRadius:14, padding:20, marginBottom:16 }}>
                          <div style={{ fontSize:9, color:'var(--green)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:2, marginBottom:6 }}>MUTUAL SUCCESS PLAN · CONFIDENTIAL</div>
                          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:900, color:'white' }}>{mutualSuccessPlan.title}</div>
                          <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:8, lineHeight:1.6 }}>{mutualSuccessPlan.objective}</p>
                        </div>
                        {mutualSuccessPlan.phases?.map((phase,pi) => (
                          <div key={pi} style={{ border:'1px solid var(--border)', borderRadius:12, overflow:'hidden', marginBottom:10 }}>
                            <div style={{ background:'var(--slate2)', padding:'10px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                              <span style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>Phase {phase.phase} — {phase.name}</span>
                              <span className="tag tag-dim" style={{ fontSize:9 }}>{phase.duration}</span>
                            </div>
                            <div style={{ padding:'14px 16px' }}>
                              <p style={{ fontSize:13, fontWeight:600, color:'var(--amber)', marginBottom:10 }}>{phase.jointMilestone}</p>
                              <div className="r-grid-2">
                                <div>
                                  <div style={{ fontSize:8, fontWeight:700, color:'var(--blue-light)', letterSpacing:2, marginBottom:6, fontFamily:"'JetBrains Mono',monospace" }}>WE COMMIT TO</div>
                                  {phase.vendorCommitments?.map((v,i) => <div key={i} style={{ fontSize:11, color:'var(--text-muted)', marginBottom:3 }}>→ {v}</div>)}
                                </div>
                                <div>
                                  <div style={{ fontSize:8, fontWeight:700, color:'var(--green)', letterSpacing:2, marginBottom:6, fontFamily:"'JetBrains Mono',monospace" }}>BUYER COMMITS TO</div>
                                  {phase.buyerCommitments?.map((b,i) => <div key={i} style={{ fontSize:11, color:'var(--text-muted)', marginBottom:3 }}>→ {b}</div>)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {mutualSuccessPlan.nextStep && (
                          <div style={{ background:'var(--amber-glow)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:10, padding:16 }}>
                            <div style={{ fontSize:8, fontWeight:700, color:'var(--amber)', letterSpacing:2, marginBottom:6, fontFamily:"'JetBrains Mono',monospace" }}>NEXT STEP</div>
                            <p style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{mutualSuccessPlan.nextStep}</p>
                          </div>
                        )}
                        <button onClick={() => setMutualSuccessPlan(null)} className="btn-ghost" style={{ marginTop:10, fontSize:11 }}>Regenerate</button>

                  {/* Negotiation Playbook */}
                  <div className="inline-section">
                    <div className="section-header" style={{ color:'var(--red)' }}>🤝 Negotiation Playbook</div>
                    <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:12, lineHeight:1.6 }}>Anchoring strategy, concession framework and walk-away lines — built from your actual deal data.</p>
                    {!roiResult && <div style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:14, padding:'10px 14px', background:'rgba(245,158,11,0.07)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:8 }}><span>💡</span><p style={{ fontSize:12, color:'var(--amber)', lineHeight:1.5, margin:0 }}>Complete the ROI Calculator above first for precise anchoring numbers.</p></div>}
                    {roiResult && <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}><span className='tag tag-green' style={{ fontSize:9 }}>ROI {roiResult.roi}%</span><span className='tag tag-green' style={{ fontSize:9 }}>Payback {roiResult.payback}mo</span><span className='tag tag-dim' style={{ fontSize:9 }}>Using confirmed data</span></div>}
                    {!negotiationPlaybook ? (
                      <button
                        onClick={async () => {
                          setNegotiationLoading(true);
                          try {
                            const res = await fetch("/api/anthropic", { method:"POST", headers:{"Content-Type":"application/json"},
                              body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:3000, stream:true,
                                system:`You are a master negotiation strategist. Create a negotiation playbook. Return ONLY valid JSON: {"negotiationContext":{"powerBalance":"Who has leverage and why","theirBATNA":"Their likely alternative","ourBATNA":"Our alternative","keyLeveragePoints":["Leverage 1","Leverage 2"]},"anchoringStrategy":{"openingPosition":"Where to anchor — be specific with numbers","rationale":"Why this anchor works","deliveryLine":"Exact words to open the negotiation"},"concessionFramework":[{"sequence":"1st","concession":"What to give","value":"Its value to them","whatToAskFor":"What to demand in return"},{"sequence":"2nd","concession":"What to give","value":"Its value to them","whatToAskFor":"What to demand in return"},{"sequence":"3rd","concession":"What to give","value":"Its value to them","whatToAskFor":"What to demand in return"}],"absoluteLines":{"walkAwayPoint":"The line you will not cross — be specific","nonNegotiables":["Non-negotiable 1","Non-negotiable 2"]},"theirTactics":[{"tactic":"Tactic they will use","counter":"How to counter it"}],"closingMoves":["Closing move 1","Closing move 2"],"redFlags":["Walk away signal 1","Red flag 2"]}`,
                                messages:[{role:"user",content:`Selling ${form.product} to ${form.company}. Deal size: ${form.dealSize||'TBD'}. Stage: ${form.dealStage}. ROI data: ${roiResult ? roiResult.roi + '% ROI, $' + (roiResult.totalBenefit||0).toLocaleString() + ' total benefit' : 'not calculated'}. Competitors: ${form.competitorsMentioned||'None'}. Champion score: ${result?.stakeholders?.championDevelopmentScore||'Unknown'}. MEDDPICC health: ${result?.meddpicc?.overallHealth||'Unknown'}.`}]
                              })
                            });
                            const reader = res.body.getReader(); const decoder = new TextDecoder(); let raw = "";
                            while(true) { const {done,value} = await reader.read(); if(done) break;
                              for(const line of decoder.decode(value,{stream:true}).split("\n")) { if(line.startsWith("data: ")) { try { const evt=JSON.parse(line.slice(6)); if(evt.type==="content_block_delta"&&evt.delta?.type==="text_delta") raw+=evt.delta.text; } catch(e){} } } }
                            const s=raw.indexOf("{"),e=raw.lastIndexOf("}"); setNegotiationPlaybook(JSON.parse(raw.slice(s,e+1)));
                          } catch(e) { alert("Failed. Try again."); }
                          setNegotiationLoading(false);
                        }}
                        disabled={negotiationLoading}
                        className="btn-amber"
                        style={{ fontSize:12, padding:'11px 24px' }}
                      >
                        {negotiationLoading ? 'BUILDING PLAYBOOK...' : '🤝 BUILD NEGOTIATION PLAYBOOK'}
                      </button>
                    ) : (
                      <div className="anim-scale-in">
                        {/* Power Balance */}
                        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:16, marginBottom:12 }}>
                          <div style={{ fontSize:8, fontWeight:700, color:'var(--amber)', letterSpacing:2, marginBottom:10, fontFamily:"'JetBrains Mono',monospace" }}>NEGOTIATION CONTEXT</div>
                          <div className="r-grid-2">
                            <div>
                              <div style={{ fontSize:8, fontWeight:700, color:'var(--text-dim)', letterSpacing:1, marginBottom:4, fontFamily:"'JetBrains Mono',monospace" }}>POWER BALANCE</div>
                              <p style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.5 }}>{negotiationPlaybook.negotiationContext?.powerBalance}</p>
                            </div>
                            <div>
                              <div style={{ fontSize:8, fontWeight:700, color:'var(--green)', letterSpacing:1, marginBottom:4, fontFamily:"'JetBrains Mono',monospace" }}>OUR LEVERAGE</div>
                              {negotiationPlaybook.negotiationContext?.keyLeveragePoints?.map((l,i) => <div key={i} style={{ fontSize:12, color:'var(--text-muted)', marginBottom:3 }}>✓ {l}</div>)}
                            </div>
                          </div>
                        </div>
                        {/* Anchoring */}
                        <div style={{ background:'rgba(29,78,216,0.08)', border:'1px solid rgba(96,165,250,0.2)', borderLeft:'3px solid var(--blue)', borderRadius:'0 12px 12px 0', padding:16, marginBottom:12 }}>
                          <div style={{ fontSize:8, fontWeight:700, color:'var(--blue-light)', letterSpacing:2, marginBottom:8, fontFamily:"'JetBrains Mono',monospace" }}>ANCHORING STRATEGY</div>
                          <div style={{ fontSize:15, fontWeight:800, color:'var(--text)', marginBottom:6 }}>{negotiationPlaybook.anchoringStrategy?.openingPosition}</div>
                          <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:10, lineHeight:1.5 }}>{negotiationPlaybook.anchoringStrategy?.rationale}</p>
                          {negotiationPlaybook.anchoringStrategy?.deliveryLine && (
                            <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:6, padding:'8px 12px', marginBottom:8 }}>
                              <div style={{ fontSize:8, fontWeight:700, color:'var(--blue-light)', letterSpacing:1, marginBottom:4, fontFamily:"'JetBrains Mono',monospace" }}>SAY THIS VERBATIM</div>
                              <p style={{ fontSize:13, color:'var(--blue-light)', fontStyle:'italic', lineHeight:1.6 }}>"{negotiationPlaybook.anchoringStrategy.deliveryLine}"</p>
                            </div>
                          )}
                          <button className="copy-btn" onClick={() => navigator.clipboard.writeText(negotiationPlaybook.anchoringStrategy?.deliveryLine||'')}>COPY</button>
                        </div>
                        {/* Concession Framework */}
                        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:16, marginBottom:12 }}>
                          <div style={{ fontSize:8, fontWeight:700, color:'var(--amber)', letterSpacing:2, marginBottom:12, fontFamily:"'JetBrains Mono',monospace" }}>CONCESSION FRAMEWORK — NEVER GIVE WITHOUT GETTING</div>
                          {negotiationPlaybook.concessionFramework?.map((cf,i) => (
                            <div key={i} style={{ display:'grid', gridTemplateColumns:'60px 1fr 1fr 1fr', gap:10, padding:'10px 0', borderBottom:'1px solid var(--border)', alignItems:'start' }}>
                              <span className="tag tag-dim" style={{ fontSize:8, justifyContent:'center' }}>{cf.sequence}</span>
                              <div>
                                <div style={{ fontSize:8, color:'var(--text-dim)', letterSpacing:1, marginBottom:3, fontFamily:"'JetBrains Mono',monospace" }}>GIVE</div>
                                <div style={{ fontSize:12, color:'var(--text)', lineHeight:1.4 }}>{cf.concession}</div>
                              </div>
                              <div>
                                <div style={{ fontSize:8, color:'var(--green)', letterSpacing:1, marginBottom:3, fontFamily:"'JetBrains Mono',monospace" }}>THEIR VALUE</div>
                                <div style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.4 }}>{cf.value}</div>
                              </div>
                              <div>
                                <div style={{ fontSize:8, color:'var(--red)', letterSpacing:1, marginBottom:3, fontFamily:"'JetBrains Mono',monospace" }}>DEMAND IN RETURN</div>
                                <div style={{ fontSize:12, color:'var(--amber)', lineHeight:1.4 }}>{cf.whatToAskFor}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* Walk Away Lines */}
                        <div style={{ background:'var(--red-dim)', border:'2px solid rgba(239,68,68,0.25)', borderRadius:12, padding:16, marginBottom:12 }}>
                          <div style={{ fontSize:8, fontWeight:700, color:'var(--red)', letterSpacing:2, marginBottom:8, fontFamily:"'JetBrains Mono',monospace" }}>⚠ ABSOLUTE LINES — DO NOT CROSS</div>
                          <div style={{ fontSize:15, fontWeight:800, color:'var(--red)', marginBottom:10 }}>{negotiationPlaybook.absoluteLines?.walkAwayPoint}</div>
                          {negotiationPlaybook.absoluteLines?.nonNegotiables?.map((n,i) => <div key={i} style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>✗ {n}</div>)}
                        </div>
                        {/* Their Tactics */}
                        {negotiationPlaybook.theirTactics?.length > 0 && (
                          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:16, marginBottom:12 }}>
                            <div style={{ fontSize:8, fontWeight:700, color:'var(--text-dim)', letterSpacing:2, marginBottom:10, fontFamily:"'JetBrains Mono',monospace" }}>THEIR TACTICS + YOUR COUNTERS</div>
                            {negotiationPlaybook.theirTactics.map((t,i) => (
                              <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                                <div>
                                  <div style={{ fontSize:8, color:'var(--red)', letterSpacing:1, marginBottom:3, fontFamily:"'JetBrains Mono',monospace" }}>THEY WILL</div>
                                  <div style={{ fontSize:12, color:'var(--text-muted)' }}>{t.tactic}</div>
                                </div>
                                <div>
                                  <div style={{ fontSize:8, color:'var(--green)', letterSpacing:1, marginBottom:3, fontFamily:"'JetBrains Mono',monospace" }}>YOU COUNTER</div>
                                  <div style={{ fontSize:12, color:'var(--text-muted)' }}>{t.counter}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <button onClick={() => setNegotiationPlaybook(null)} className="btn-ghost" style={{ fontSize:11 }}>Regenerate</button>
                      </div>
                    )}
                  </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

{activeTab === "coach" && (
                <div className="fade-up">
                  {/* ── TRANSCRIPT ANALYSER ── */}
                  <div className="card" style={{ marginBottom:20 }}>
                    <div className="card-title" style={{ color:'var(--blue-light)' }}>📝 Transcript Analyser</div>
                    <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:14, lineHeight:1.6 }}>Paste a call transcript and get MEDDPICC signals, coaching notes, follow-up email and next actions — plus your deal score updates automatically.</p>
                    {!transcriptResult ? (
                      <>
                        <textarea
                          placeholder="Paste your call transcript here — Gong, Zoom, Teams, or manual notes..."
                          value={transcript}
                          onChange={e => setTranscript(e.target.value)}
                          style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 12px', color:'var(--text)', fontSize:13, outline:'none', minHeight:120, resize:'vertical', lineHeight:1.6, marginBottom:10, boxSizing:'border-box' }}
                        />
                        <button
                          onClick={async () => {
                            if (!transcript.trim()) return;
                            setTranscriptLoading(true);
                            setMeddpiccUpdated(false);
                            try {
                              const r = await analyseTranscript(transcript, form, result);
                              setTranscriptResult(r);
                              if (r && result) {
                                updateMeddpiccFromTranscript(r, result, setResult);
                                setMeddpiccUpdated(true);
                              }
                            } catch(e) { alert('Analysis failed. Try again.'); }
                            setTranscriptLoading(false);
                          }}
                          disabled={transcriptLoading || !transcript.trim()}
                          className="btn-amber"
                          style={{ fontSize:12, padding:'10px 24px' }}
                        >
                          {transcriptLoading ? '⏳ ANALYSING...' : '📝 ANALYSE TRANSCRIPT'}
                        </button>
                      </>
                    ) : (
                      <div className="anim-scale-in">
                        {meddpiccUpdated && (
                          <div style={{ marginBottom:12, padding:'10px 14px', background:'var(--green-dim)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:8, display:'flex', gap:8, alignItems:'center' }}>
                            <span>✓</span>
                            <div>
                              <div style={{ fontSize:12, fontWeight:700, color:'var(--green)' }}>MEDDPICC Updated</div>
                              <div style={{ fontSize:11, color:'var(--text-muted)' }}>Deal Intel tab refreshed with new signals from this call.</div>
                            </div>
                          </div>
                        )}
                        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:10, padding:14, marginBottom:12 }}>
                          <div style={{ fontSize:8, fontWeight:700, color:'var(--amber)', letterSpacing:2, marginBottom:6, fontFamily:"'JetBrains Mono',monospace" }}>CALL SUMMARY</div>
                          <p style={{ fontSize:13, color:'var(--text)', lineHeight:1.7 }}>{transcriptResult.summary}</p>
                        </div>
                        <div className="r-grid-2" style={{ marginBottom:12 }}>
                          {transcriptResult.positiveSignals?.length > 0 && (
                            <div style={{ background:'var(--green-dim)', border:'1px solid rgba(16,185,129,0.15)', borderRadius:10, padding:14 }}>
                              <div style={{ fontSize:8, fontWeight:700, color:'var(--green)', letterSpacing:2, marginBottom:8, fontFamily:"'JetBrains Mono',monospace" }}>BUYING SIGNALS</div>
                              {transcriptResult.positiveSignals.map((s,i) => <div key={i} style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>✓ {s}</div>)}
                            </div>
                          )}
                          {transcriptResult.redFlags?.length > 0 && (
                            <div style={{ background:'var(--red-dim)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:10, padding:14 }}>
                              <div style={{ fontSize:8, fontWeight:700, color:'var(--red)', letterSpacing:2, marginBottom:8, fontFamily:"'JetBrains Mono',monospace" }}>RED FLAGS</div>
                              {transcriptResult.redFlags.map((f,i) => <div key={i} style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>⚠ {f}</div>)}
                            </div>
                          )}
                        </div>
                        {transcriptResult.coachingNote && (
                          <div style={{ background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:10, padding:14, marginBottom:12 }}>
                            <div style={{ fontSize:8, fontWeight:700, color:'var(--amber)', letterSpacing:2, marginBottom:6, fontFamily:"'JetBrains Mono',monospace" }}>COACHING NOTE</div>
                            <p style={{ fontSize:13, color:'var(--text)', lineHeight:1.6 }}>{transcriptResult.coachingNote}</p>
                          </div>
                        )}
                        {transcriptResult.nextActions?.length > 0 && (
                          <div style={{ marginBottom:12 }}>
                            <div style={{ fontSize:8, fontWeight:700, color:'var(--blue-light)', letterSpacing:2, marginBottom:8, fontFamily:"'JetBrains Mono',monospace" }}>NEXT ACTIONS</div>
                            {transcriptResult.nextActions.map((a,i) => (
                              <div key={i} style={{ display:'flex', gap:10, marginBottom:6, alignItems:'flex-start' }}>
                                <span className={`tag ${a.owner==='You'?'tag-amber':'tag-blue'}`} style={{ fontSize:9, flexShrink:0 }}>{a.owner}</span>
                                <div>
                                  <div style={{ fontSize:12, color:'var(--text)' }}>{a.action}</div>
                                  <div style={{ fontSize:11, color:'var(--text-dim)' }}>{a.timeframe}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {transcriptResult.followUpEmail && (
                          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:10, padding:14, marginBottom:12 }}>
                            <div style={{ fontSize:8, fontWeight:700, color:'var(--green)', letterSpacing:2, marginBottom:8, fontFamily:"'JetBrains Mono',monospace" }}>FOLLOW-UP EMAIL</div>
                            <div style={{ fontSize:11, color:'var(--text-dim)', marginBottom:4 }}>Subject: {transcriptResult.followUpEmail.subject}</div>
                            <p style={{ fontSize:13, color:'var(--text)', lineHeight:1.75, whiteSpace:'pre-line', marginBottom:10 }}>{transcriptResult.followUpEmail.body}</p>
                            <button className="copy-btn" onClick={() => navigator.clipboard.writeText('Subject: ' + transcriptResult.followUpEmail.subject + '\n\n' + transcriptResult.followUpEmail.body)}>COPY EMAIL</button>
                          </div>
                        )}
                        <button onClick={() => { setTranscriptResult(null); setTranscript(''); setMeddpiccUpdated(false); }} className="btn-ghost" style={{ fontSize:11 }}>Analyse Another</button>
                      </div>
                    )}
                  </div>

                  {/* ── DEAL COACH CHAT ── */}
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

          {/* ── PRE-EXPORT CHECKLIST MODAL ── */}
                        {showApolloModal && (
                <div className="apollo-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowApolloModal(false); }}>
                  <div className="apollo-modal">
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
                      <div className="apollo-modal-logo">🔗</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:17, fontWeight:800, color:'var(--text)', fontFamily:"'Syne',sans-serif" }}>Connect Apollo.io</div>
                        <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>Auto-enrich contacts and company data on every analysis</div>
                      </div>
                      <button onClick={() => setShowApolloModal(false)} style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:6, padding:'4px 10px', color:'var(--text-muted)', cursor:'pointer', fontSize:12 }}>CLOSE</button>
                    </div>
                    <div style={{ background:'rgba(124,58,237,0.06)', border:'1px solid rgba(124,58,237,0.14)', borderRadius:10, padding:14, marginBottom:18 }}>
                      <div style={{ fontSize:10, color:'#A78BFA', fontWeight:700, marginBottom:8, fontFamily:"'JetBrains Mono',monospace", letterSpacing:1.5 }}>WHAT APOLLO ADDS TO YOUR BRIEF</div>
                      {['C-suite and VP-level contacts auto-populated from Apollo','Work email addresses pulled directly — no manual searching','Department and seniority data for sharper targeting','One click to add any contact into your analysis'].map((b,i) => (
                        <div key={i} style={{ fontSize:12, color:'var(--text-muted)', marginBottom:5, display:'flex', gap:8, alignItems:'flex-start' }}>
                          <span style={{ color:'#A78BFA', fontWeight:700, flexShrink:0 }}>+</span>{b}
                        </div>
                      ))}
                    </div>
                    <div style={{ marginBottom:16 }}>
                      <label style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace", letterSpacing:1.5, color:'var(--text-dim)', display:'block', marginBottom:7, textTransform:'uppercase' }}>Your Apollo API Key</label>
                      <input type="password" value={apolloApiKey} onChange={e => setApolloApiKey(e.target.value)}
                        placeholder="Paste your Apollo API key here..."
                        style={{ width:'100%', fontFamily:'monospace', fontSize:12 }} />
                      <div style={{ fontSize:11, color:'var(--text-dim)', marginTop:6, lineHeight:1.6 }}>Find it in Apollo: <strong style={{ color:'var(--text-muted)' }}>Settings → Integrations → API → API Key</strong>. Your key is stored in your browser only — never sent to our servers.</div>
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={() => {
                        try { localStorage.setItem('sia_apollo_key', apolloApiKey); } catch(e) {}
                        setShowApolloModal(false);
                        if (apolloApiKey && form.company) enrichWithApollo(form.company, apolloApiKey);
                      }} style={{ flex:1, background:'linear-gradient(135deg,#7C3AED,#4F46E5)', border:'none', borderRadius:9, padding:'12px 20px', color:'white', fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:13, cursor:'pointer', letterSpacing:0.5 }}>
                        {apolloApiKey ? 'Save and Enrich Now' : 'Connect Apollo'}
                      </button>
                      {apolloApiKey && (
                        <button onClick={() => { setApolloApiKey(''); setApolloContacts([]); try { localStorage.removeItem('sia_apollo_key'); } catch(e) {} }} style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:9, padding:'12px 16px', color:'#EF4444', fontSize:12, fontWeight:700, cursor:'pointer' }}>DISCONNECT</button>
                      )}
                    </div>
                  </div>
                </div>
              )}
{showExportModal && (
            <div className="export-modal-overlay" onClick={() => setShowExportModal(false)}>
              <div className="export-modal" onClick={e => e.stopPropagation()}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                  <div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:900, color:'var(--text)', marginBottom:3 }}>Export Intelligence Brief</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)' }}>Generate missing sections to maximise your PDF</div>
                  </div>
                  <button onClick={() => setShowExportModal(false)} style={{ background:'transparent', border:'none', color:'var(--text-dim)', fontSize:20, cursor:'pointer', padding:'4px 8px' }}>✕</button>
                </div>

                {/* Core sections — always included */}
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:9, fontWeight:700, color:'var(--green)', letterSpacing:2, marginBottom:10, fontFamily:"'JetBrains Mono',monospace" }}>✓ ALWAYS INCLUDED</div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {['Account Brief','MEDDPICC','Stakeholders','Outreach','Discovery','Command of Message','Next Actions'].map(s => (
                      <span key={s} className="tag tag-green" style={{ fontSize:9 }}>✓ {s}</span>
                    ))}
                  </div>
                </div>

                {/* On-demand sections */}
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontSize:9, fontWeight:700, color:'var(--text-dim)', letterSpacing:2, marginBottom:10, fontFamily:"'JetBrains Mono',monospace" }}>ON-DEMAND SECTIONS</div>
                  {[
                    { label:'Champion Playbook', state: championPlaybook, tab:'people', note:'4-week champion dev plan' },
                    { label:'Close Plan', state: closePlan, tab:'bizcase', note:'Backwards-mapped milestones' },
                    { label:'POV Document', state: povDoc, tab:'bizcase', note:'Strategic advisor document' },
                    { label:'Negotiation Playbook', state: negotiationPlaybook, tab:'bizcase', note:'Anchoring + concession framework' },
                    { label:'Mutual Success Plan', state: mutualSuccessPlan, tab:'bizcase', note:'Joint milestones + commitments' },
                    { label:'Meeting Prep', state: meetingPrep, tab:'bizcase', note:'Power questions + landmines' },
                    { label:'Executive Brief', state: execBrief, tab:'bizcase', note:'CFO-ready business case' },
                    { label:'Transcript Analysis', state: transcriptResult, tab:'coach', note:'Call signals + follow-up email' },
                  ].map(item => (
                    <div key={item.label} className="export-section-row">
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:18, height:18, borderRadius:'50%', background: item.state ? 'var(--green)' : 'var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'white', flexShrink:0 }}>
                          {item.state ? '✓' : ''}
                        </div>
                        <div>
                          <div style={{ fontSize:13, fontWeight:600, color: item.state ? 'var(--text)' : 'var(--text-dim)' }}>{item.label}</div>
                          <div style={{ fontSize:11, color:'var(--text-dim)' }}>{item.note}</div>
                        </div>
                      </div>
                      {!item.state && (
                        <button onClick={() => { setShowExportModal(false); setActiveTab(item.tab); }}
                          style={{ fontSize:10, padding:'4px 10px', borderRadius:6, border:'1px solid var(--border)', background:'transparent', color:'var(--blue-light)', cursor:'pointer', whiteSpace:'nowrap', fontFamily:"'JetBrains Mono',monospace", letterSpacing:0.5 }}>
                          → Go generate
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* PDF completeness */}
                {(() => {
                  const total = 8;
                  const done = [championPlaybook, closePlan, povDoc, negotiationPlaybook, mutualSuccessPlan, meetingPrep, execBrief, transcriptResult].filter(Boolean).length;
                  const pct = Math.round(((7 + done) / (7 + total)) * 100);
                  return (
                    <div style={{ marginBottom:20 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                        <span style={{ fontSize:11, color:'var(--text-muted)' }}>PDF completeness</span>
                        <span style={{ fontSize:11, fontWeight:700, color: pct===100?'var(--green)':pct>70?'var(--amber)':'var(--text-dim)' }}>{pct}% · {7+done} of {7+total} sections</span>
                      </div>
                      <div className="progress-track">
                        <div style={{ height:'100%', borderRadius:2, width:`${pct}%`, background: pct===100?'var(--green)':'var(--amber)', transition:'width 0.4s ease' }}></div>
                      </div>
                    </div>
                  );
                })()}

                {/* Action buttons */}
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={() => { setShowExportModal(false); exportToPDF(result, form, meetingPrep, execBrief, meetingInputs, { closePlan, championPlaybook, negotiationPlaybook, povDoc, mutualSuccessPlan, transcriptResult }); }}
                    className="btn-amber" style={{ flex:1, justifyContent:'center', fontSize:13 }}>
                    ⬇ Export PDF Now
                  </button>
                  <button onClick={() => setShowExportModal(false)} className="btn-ghost" style={{ fontSize:12 }}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
// cache bust Sat Mar  7 20:39:18 +08 2026
// bust 1772953923
