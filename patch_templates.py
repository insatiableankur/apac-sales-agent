#!/usr/bin/env python3
"""
patch_templates.py — SIA 18-Template Library
Adds Deal Templates section to Playbook tab with AI pre-fill, PDF and DOCX export.

Run from: /Users/ankursehgal/apac-sales-agent
  python3 patch_templates.py && npm run build 2>&1 | head -30
"""
import sys, os, re

APP = 'src/App.jsx'

if not os.path.exists(APP):
    print(f'ERROR: {APP} not found. Run from project root.')
    sys.exit(1)

with open(APP, 'r', encoding='utf-8') as f:
    src = f.read()

print(f'Read {APP}: {len(src):,} chars')
original = src

# ══════════════════════════════════════════════════════════════════
# PRE-FLIGHT
# ══════════════════════════════════════════════════════════════════
errors = []

def require(label, pattern):
    if pattern not in src:
        errors.append(f'  MISSING [{label}]: {repr(pattern[:80])}')
    else:
        print(f'  OK  {label}')

print('\n── Pre-flight checks ──')
require('React import',   'import React')
require('useState import', 'useState')
require('formPreFilled',  'formPreFilled')
require('const CSS',      'const CSS = `')

# Playbook anchor — try multiple fallbacks
playbook_anchor = None
for candidate in ['Competitive Intelligence', 'Battle Card', 'Objection Simulator', 'Discovery Questions']:
    if candidate in src:
        playbook_anchor = candidate
        print(f'  OK  Playbook anchor: "{candidate}"')
        break
if not playbook_anchor:
    errors.append('  MISSING [Playbook anchor]: none of Competitive Intelligence / Battle Card / Objection Simulator found')

# CSS closing backtick
lines = src.split('\n')
css_close_idx = None
for i, line in enumerate(lines):
    if line.strip() == '`' and i > 80:
        css_close_idx = i
        break
if css_close_idx is None:
    errors.append('  MISSING [CSS close backtick]: standalone ` line not found after line 80')
else:
    print(f'  OK  CSS closing backtick at line {css_close_idx + 1}')

# Return statement anchor — 2-space indent = main component return
return_anchor = '\n  return ('
if return_anchor not in src:
    errors.append('  MISSING [return anchor]: "\\n  return (" not found')
else:
    print(f'  OK  Main return statement found')

if errors:
    print('\nPREFLIGHT FAILED:')
    for e in errors:
        print(e)
    print('\nRun the following to debug:')
    print('  grep -n "useState\\|const CSS\\|formPreFilled\\|return (" src/App.jsx | head -20')
    sys.exit(1)

print('\nAll pre-flight checks passed.\n')

# ══════════════════════════════════════════════════════════════════
# 1. CSS — insert before closing backtick of CSS block
# ══════════════════════════════════════════════════════════════════
CSS_ADDITION = r"""
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
"""

lines = src.split('\n')
lines.insert(css_close_idx, CSS_ADDITION)
src = '\n'.join(lines)
print('DONE  CSS added')

# ══════════════════════════════════════════════════════════════════
# 2. TEMPLATE_LIST constant — insert before App function
# ══════════════════════════════════════════════════════════════════
TEMPLATE_LIST_JS = r"""
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
"""

if 'const CSS = `' not in src:
    print('REPLACE FAIL: "const CSS = `" anchor not found for TEMPLATE_LIST insertion')
    sys.exit(1)

src = src.replace('const CSS = `', TEMPLATE_LIST_JS + 'const CSS = `', 1)
print('DONE  TEMPLATE_LIST + prompts added')

# ══════════════════════════════════════════════════════════════════
# 3. STATE VARIABLES — insert after formPreFilled line
# ══════════════════════════════════════════════════════════════════
STATE_ADDITION = r"""
  const [tmplStage,   setTmplStage]   = React.useState('all');
  const [tmplActive,  setTmplActive]  = React.useState(null);
  const [tmplContent, setTmplContent] = React.useState('');
  const [tmplLoading, setTmplLoading] = React.useState(false);
  const [tmplCtx,     setTmplCtx]     = React.useState('');"""

# Find the formPreFilled useState line and insert after it
fp_idx = src.find('formPreFilled')
if fp_idx == -1:
    print('REPLACE FAIL: formPreFilled not found for state insertion')
    sys.exit(1)

# Find end of that line
line_end = src.find('\n', fp_idx)
if line_end == -1:
    print('REPLACE FAIL: Could not find newline after formPreFilled')
    sys.exit(1)

# Check we are not double-inserting
if 'tmplStage' in src:
    print('SKIP  Template state already present')
else:
    src = src[:line_end] + STATE_ADDITION + src[line_end:]
    print('DONE  Template state variables added')

# ══════════════════════════════════════════════════════════════════
# 4. TEMPLATE FUNCTIONS — insert before the return( of App
# ══════════════════════════════════════════════════════════════════

FUNCTIONS_JS = r"""
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

"""

# Find the main component return — 2-space indent, first occurrence
return_anchor = '\n  return ('
if return_anchor not in src:
    print('REPLACE FAIL: Could not find main component return statement "\\n  return ("')
    sys.exit(1)

if 'generateTemplate' in src:
    print('SKIP  Template functions already present')
else:
    src = src.replace(return_anchor, '\n' + FUNCTIONS_JS + '\n  return (', 1)
    print('DONE  Template functions added')

# ══════════════════════════════════════════════════════════════════
# 5. TEMPLATES UI JSX — insert in Playbook tab after last section
# ══════════════════════════════════════════════════════════════════

TEMPLATES_JSX = r"""
              {/* ── Deal Templates ─────────────────────────────── */}
              <div className="tmpl-section">
                <div className="section-header" style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.25rem'}}>
                  <div>
                    <div style={{fontSize:'11px',fontWeight:'600',letterSpacing:'.08em',textTransform:'uppercase',color:'rgba(255,255,255,0.3)',fontFamily:'var(--font-mono)',marginBottom:'4px'}}>Deal Templates</div>
                    <div style={{fontSize:'12px',color:'rgba(255,255,255,0.4)'}}>AI pre-fills every template from your active deal. Download blank or generate in one click.</div>
                  </div>
                  <span style={{fontSize:'11px',background:'rgba(245,158,11,0.1)',color:'#F59E0B',padding:'4px 12px',borderRadius:'20px',fontFamily:'var(--font-mono)',flexShrink:0}}>18 templates</span>
                </div>
                <div className="tmpl-stage-tabs">
                  {STAGE_TABS.map(s => (
                    <button key={s.id} className={'tmpl-stage-tab' + (tmplStage===s.id?' tmpl-active':'')} onClick={() => {setTmplStage(s.id); setTmplActive(null); setTmplContent('');}}>{s.label}</button>
                  ))}
                </div>
                <div className="tmpl-grid">
                  {TEMPLATE_LIST.filter(t => tmplStage==='all' || t.stage===tmplStage).map(t => (
                    <div key={t.id} className={'tmpl-card' + (tmplActive && tmplActive.id===t.id?' tmpl-card-active':'')} onClick={() => {setTmplActive(t); setTmplContent(''); setTmplLoading(false);}}>
                      <div className="tmpl-card-top">
                        <div className="tmpl-icon">{t.icon}</div>
                        <span className="tmpl-badge">{t.badge}</span>
                      </div>
                      <div className="tmpl-name">{t.name}{t.docx && <span className="tmpl-docx-pill">DOCX</span>}</div>
                      <div className="tmpl-sub">{t.desc}</div>
                      <div className="tmpl-fw">{t.framework}</div>
                      <div className="tmpl-card-actions">
                        <button className="tmpl-btn tmpl-btn-primary" onClick={e => {e.stopPropagation(); setTmplActive(t); generateTemplate(t);}}>AI pre-fill</button>
                        <button className="tmpl-btn" onClick={e => {e.stopPropagation(); exportTemplatePDF(t, '');}}>Blank PDF</button>
                        {t.docx && <button className="tmpl-btn" onClick={e => {e.stopPropagation(); exportTemplateDOCX(t, tmplActive && tmplActive.id===t.id ? tmplContent : '');}}>DOCX</button>}
                      </div>
                    </div>
                  ))}
                </div>
                {TEMPLATE_LIST.filter(t => tmplStage==='all' || t.stage===tmplStage).length === 0 && (
                  <div className="tmpl-empty">No templates for this stage</div>
                )}
                {tmplActive && (
                  <div className="tmpl-preview">
                    <div className="tmpl-preview-hdr">
                      <div style={{flex:1,minWidth:0}}>
                        <div className="tmpl-preview-title">{tmplActive.name}{typeof company !== 'undefined' && company ? ' \u2014 ' + company : ''}</div>
                        <div className="tmpl-preview-meta">{tmplActive.framework}</div>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:'8px',flexShrink:0}}>
                        {tmplContent && !tmplLoading && <span className="tmpl-preview-status">AI pre-filled</span>}
                        {tmplLoading && <span style={{fontSize:'11px',color:'#F59E0B',fontFamily:'var(--font-mono)'}}>Generating...</span>}
                        <button className="tmpl-btn" style={{padding:'3px 9px'}} onClick={() => {setTmplActive(null); setTmplContent(''); setTmplLoading(false);}}>Close</button>
                      </div>
                    </div>
                    <div style={{marginBottom:'1rem'}}>
                      <div className="tmpl-ctx-label">Additional context (optional)</div>
                      <textarea className="tmpl-ctx-area" value={tmplCtx} onChange={e => setTmplCtx(e.target.value)} placeholder="Add deal specifics not captured above — objections raised, political dynamics, timeline pressure, stakeholder nuances..." rows={3} />
                    </div>
                    {!tmplContent && !tmplLoading && (
                      <div className="tmpl-gen-cta">
                        <button className="tmpl-btn tmpl-btn-primary" style={{padding:'9px 28px',fontSize:'13px'}} onClick={() => generateTemplate(tmplActive)}>Generate with AI</button>
                        <div style={{fontSize:'11px',color:'rgba(255,255,255,0.28)',marginTop:'8px'}}>Pre-fills from your deal context &mdash; takes about 15 seconds</div>
                      </div>
                    )}
                    {tmplLoading && (
                      <div className="tmpl-loading-row">
                        <div className="tmpl-spinner"></div>
                        Generating {tmplActive.name}...
                      </div>
                    )}
                    {tmplContent && !tmplLoading && (
                      <div>
                        <div dangerouslySetInnerHTML={{__html: tmplContent}} />
                        <div className="tmpl-export-row">
                          <button className="tmpl-btn tmpl-btn-primary" onClick={() => exportTemplatePDF(tmplActive, tmplContent)}>Export PDF</button>
                          {tmplActive.docx && <button className="tmpl-btn" onClick={() => exportTemplateDOCX(tmplActive, tmplContent)}>Export DOCX</button>}
                          <button className="tmpl-btn" onClick={() => { const p = tmplContent.replace(/<[^>]+>/g,''); navigator.clipboard.writeText(p).catch(()=>{}); }}>Copy text</button>
                          <button className="tmpl-btn" style={{marginLeft:'auto'}} onClick={() => generateTemplate(tmplActive)}>Regenerate</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>"""

# Find the playbook anchor and then find a good insertion point
# Strategy: find the anchor, then find the next {activeTab after it
ci_pos = src.find(playbook_anchor)
if ci_pos == -1:
    print(f'REPLACE FAIL: Playbook anchor "{playbook_anchor}" not found after CSS/state insertion')
    sys.exit(1)

if 'tmpl-section' in src:
    print('SKIP  Templates UI already present')
else:
    # Find the next occurrence of `activeTab` after the playbook anchor
    # This marks where the next tab starts — playbook tab content ends just before it
    search_from = ci_pos + len(playbook_anchor)
    next_tab_pos = src.find('{activeTab', search_from)

    if next_tab_pos == -1:
        # Fallback: look for tab boundary with different syntax
        next_tab_pos = src.find('activeTab ===', search_from)
    
    if next_tab_pos == -1:
        print('REPLACE FAIL: Cannot find next tab boundary after playbook anchor')
        print(f'Run: grep -n "activeTab" src/App.jsx | head -30')
        sys.exit(1)
    
    # Find a clean insertion point: the last closing before next_tab_pos
    # We look for the playbook tab's closing wrapper
    # Walk backward from next_tab_pos to find a sensible JSX boundary
    segment = src[ci_pos:next_tab_pos]
    
    # Print context so Ankur can verify if needed
    print(f'\n── Insertion context (last 200 chars before next tab) ──')
    print(repr(src[next_tab_pos-200:next_tab_pos]))
    print('──────────────────────────────────────────────────────\n')
    
    # Insert the templates section right before the next tab's block
    # Find the last newline before next_tab_pos to keep formatting clean
    insert_at = src.rfind('\n', 0, next_tab_pos)
    if insert_at == -1:
        insert_at = next_tab_pos
    
    src = src[:insert_at] + '\n' + TEMPLATES_JSX + '\n' + src[insert_at:]
    print('DONE  Templates UI JSX inserted in Playbook tab')

# ══════════════════════════════════════════════════════════════════
# POST-WRITE AUDIT
# ══════════════════════════════════════════════════════════════════
print('\n── Post-write audit ──')
audit_checks = [
    ('TEMPLATE_LIST',           'TEMPLATE_LIST'),
    ('18 templates in list',    "id:'winloss'"),
    ('Template state vars',     'tmplStage'),
    ('generateTemplate fn',     'generateTemplate'),
    ('exportTemplatePDF fn',    'exportTemplatePDF'),
    ('exportTemplateDOCX fn',   'exportTemplateDOCX'),
    ('formatTmplOutput fn',     'formatTmplOutput'),
    ('buildTmplContext fn',     'buildTmplContext'),
    ('TEMPLATE_PROMPTS obj',    'TEMPLATE_PROMPTS'),
    ('Templates UI JSX',        'tmpl-section'),
    ('Stage tab filter',        'STAGE_TABS'),
    ('DOCX pill in cards',      'tmpl-docx-pill'),
    ('CSS added',               'tmpl-stage-tabs{'),
    ('No &amp; in JSX',         True if '&amp;' not in src else False),
    ('No bare regex literals',  True if '/\\\\r?\\\\n/' not in src else False),
]

audit_pass = True
for label, check in audit_checks:
    if isinstance(check, bool):
        status = 'OK ' if check else 'FAIL'
        if not check: audit_pass = False
    else:
        found = check in src
        status = 'OK ' if found else 'FAIL'
        if not found: audit_pass = False
    print(f'  {status}  {label}')

if not audit_pass:
    print('\nAUDIT FAILED — not writing file')
    sys.exit(1)

# ══════════════════════════════════════════════════════════════════
# WRITE
# ══════════════════════════════════════════════════════════════════
with open(APP, 'w', encoding='utf-8') as f:
    f.write(src)

print(f'\nWritten: {len(src):,} chars (was {len(original):,}, delta +{len(src)-len(original):,})')
print('\nNext: npm run build 2>&1 | head -30')
