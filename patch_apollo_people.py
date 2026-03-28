import shutil, sys

src_path = 'src/App.jsx'
with open(src_path, 'r', encoding='utf-8') as f:
    src = f.read()

shutil.copy(src_path, src_path + '.backup_apollo_people')
print('Backup saved')

old = (
    "                        {/* Email Finder */}\n"
    "                        <div className=\"inline-section\">\n"
    "                          <div className=\"section-header\">📧 Email Intelligence</div>"
)

new = (
    "                        {/* Apollo Contact Intelligence */}\n"
    "                        <div className=\"inline-section\">\n"
    "                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14, flexWrap:'wrap', gap:8 }}>\n"
    "                            <div className=\"section-header\" style={{ marginBottom:0 }}>🔗 Apollo Contact Intelligence</div>\n"
    "                            {apolloApiKey && (\n"
    "                              <button onClick={() => enrichWithApollo(form.company, apolloApiKey)} disabled={apolloEnrichLoading}\n"
    "                                className=\"apollo-connect-btn connected\" style={{ fontSize:11 }}>\n"
    "                                {apolloEnrichLoading ? '⏳ ENRICHING...' : '↻ REFRESH'}\n"
    "                              </button>\n"
    "                            )}\n"
    "                          </div>\n"
    "                          {!apolloApiKey ? (\n"
    "                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', background:'rgba(124,58,237,0.06)', border:'1px solid rgba(124,58,237,0.18)', borderRadius:10 }}>\n"
    "                              <div>\n"
    "                                <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:3 }}>Connect Apollo for live contacts</div>\n"
    "                                <div style={{ fontSize:12, color:'var(--text-muted)' }}>Pull real C-suite contacts, emails and org data directly from Apollo</div>\n"
    "                              </div>\n"
    "                              <button onClick={() => setShowApolloModal(true)} className=\"apollo-connect-btn\" style={{ flexShrink:0 }}>🔗 Connect Apollo</button>\n"
    "                            </div>\n"
    "                          ) : apolloEnrichLoading ? (\n"
    "                            <div className=\"apollo-loading\">\n"
    "                              <span style={{ display:'inline-block', width:10, height:10, border:'2px solid #A78BFA', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />\n"
    "                              <span style={{ fontSize:11, color:'#A78BFA', fontFamily:\"'JetBrains Mono',monospace\", letterSpacing:1 }}>PULLING CONTACTS FROM APOLLO...</span>\n"
    "                            </div>\n"
    "                          ) : apolloContacts.length === 0 ? (\n"
    "                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', background:'rgba(124,58,237,0.06)', border:'1px solid rgba(124,58,237,0.18)', borderRadius:10 }}>\n"
    "                              <div style={{ fontSize:12, color:'var(--text-muted)' }}>No contacts loaded yet for {form.company}</div>\n"
    "                              <button onClick={() => enrichWithApollo(form.company, apolloApiKey)} className=\"apollo-connect-btn connected\" style={{ fontSize:11 }}>Search Apollo</button>\n"
    "                            </div>\n"
    "                          ) : (\n"
    "                            <div className=\"anim-slide-up\">\n"
    "                              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>\n"
    "                                <span className=\"apollo-enriched-badge\">🔗 APOLLO LIVE</span>\n"
    "                                <span style={{ fontSize:11, color:'var(--text-dim)' }}>{apolloContacts.length} contacts found · click any card to add to brief</span>\n"
    "                              </div>\n"
    "                              <div className=\"apollo-contact-grid\">\n"
    "                                {apolloContacts.map((c, i) => (\n"
    "                                  <div key={i} className={`apollo-contact-card${addedApolloContacts.includes(i) ? ' added' : ''}`}\n"
    "                                    onClick={() => {\n"
    "                                      if (!addedApolloContacts.includes(i)) {\n"
    "                                        const entry = c.name + (c.title ? ' — ' + c.title : '') + (c.email ? ' (' + c.email + ')' : '');\n"
    "                                        setForm(prev => ({ ...prev, knownContacts: (prev.knownContacts ? prev.knownContacts + ', ' : '') + entry }));\n"
    "                                        setAddedApolloContacts(prev => [...prev, i]);\n"
    "                                      }\n"
    "                                    }}>\n"
    "                                    <div style={{ fontSize:12, fontWeight:700, color:'var(--text)', marginBottom:2, paddingRight:24 }}>{c.name}</div>\n"
    "                                    <div style={{ fontSize:11, color:'#A78BFA', lineHeight:1.3, marginBottom: c.email ? 4 : 0 }}>{c.title}</div>\n"
    "                                    {c.email && (\n"
    "                                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>\n"
    "                                        <div style={{ fontSize:10, color:'var(--text-muted)', fontFamily:'monospace' }}>{c.email}</div>\n"
    "                                        <button className=\"copy-btn\" style={{ fontSize:9, padding:'2px 6px' }}\n"
    "                                          onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(c.email); }}>COPY</button>\n"
    "                                      </div>\n"
    "                                    )}\n"
    "                                    {c.department && <div style={{ fontSize:10, color:'var(--text-dim)', fontFamily:\"'JetBrains Mono',monospace\", marginTop:4, letterSpacing:0.5 }}>{c.department.toUpperCase()}</div>}\n"
    "                                    <div style={{ position:'absolute', top:10, right:10, fontSize:11, fontWeight:700, color: addedApolloContacts.includes(i) ? 'var(--green)' : 'rgba(124,58,237,0.5)' }}>\n"
    "                                      {addedApolloContacts.includes(i) ? '✓' : '+'}\n"
    "                                    </div>\n"
    "                                  </div>\n"
    "                                ))}\n"
    "                              </div>\n"
    "                            </div>\n"
    "                          )}\n"
    "                        </div>\n"
    "\n"
    "                        {/* Email Finder */}\n"
    "                        <div className=\"inline-section\">\n"
    "                          <div className=\"section-header\">📧 Email Intelligence</div>"
)

if old in src:
    src = src.replace(old, new, 1)
    print('Change OK - Apollo section added to People tab')
else:
    print('FAIL - anchor string not found')
    import sys; sys.exit(1)

with open(src_path, 'w', encoding='utf-8') as f:
    f.write(src)

print('Done. Run: npm run build 2>&1 | head -20')
