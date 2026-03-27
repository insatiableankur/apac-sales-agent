#!/usr/bin/env python3
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    src = f.read()

with open('src/App.jsx.backup_pdf2', 'w', encoding='utf-8') as f:
    f.write(src)
print('Backup saved')

# ─── FIX: Business case table — long values overflow ─────────────────────────
c1_old = """      bRows.forEach(([k,v]) => {
        checkY(8);
        setTxt('#374151'); doc.setFontSize(9); doc.setFont('helvetica','normal');
        doc.text(k, M, y);
        setTxt('#111827'); doc.setFont('helvetica','bold');
        const vLines = doc.splitTextToSize(String(v), CW - 65);
        vLines.forEach((vl, vi) => { if(vi>0) checkY(5); doc.text(vl, M + 60, y + vi*5); });
        y += Math.max(6, vLines.length * 5);
      });
      y += 4;"""

c1_new = """      bRows.forEach(([k,v]) => {
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
      y += 4;"""

if c1_old in src:
    src = src.replace(c1_old, c1_new, 1)
    print('Fix OK - business case table rows now wrap long values')
else:
    print('FAIL - string not found')

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(src)
print('Done. Run: npm run build 2>&1 | head -20')
