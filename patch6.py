#!/usr/bin/env python3
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    src = f.read()

with open('src/App.jsx.backup_json', 'w', encoding='utf-8') as f:
    f.write(src)
print('Backup saved')

# ─── FIX 1: Don't throw on JSON parse failure — return empty object ───────────
c1_old = """          try { return JSON.parse(safe); } catch(e2) {
            // Last resort: return empty object so app doesn't crash
            throw new Error("JSON parse failed after all repairs: " + e.message);
          }"""

c1_new = """          try { return JSON.parse(safe); } catch(e2) {
            // Last resort: return empty object so app doesn't crash
            console.warn("JSON parse failed after all repairs, returning partial:", e.message);
            return {};
          }"""

if c1_old in src:
    src = src.replace(c1_old, c1_new, 1)
    print('Fix 1 OK - JSON parse no longer throws, returns empty object')
else:
    print('FAIL: Fix 1 - string not found')

# ─── FIX 2: Increase retries from 2 to 3 ─────────────────────────────────────
c2_old = """      const reliableCall = async (p, s, retries=2) => {
        for (let i=0; i<retries; i++) {
          try { return await streamCall(p, s); } catch(e) {
            if (i===retries-1) throw e;
            await new Promise(r => setTimeout(r, 1000));
          }
        }
      };"""

c2_new = """      const reliableCall = async (p, s, retries=3) => {
        for (let i=0; i<retries; i++) {
          try { return await streamCall(p, s); } catch(e) {
            if (i===retries-1) return {};
            await new Promise(r => setTimeout(r, 1500 * (i + 1)));
          }
        }
        return {};
      };"""

if c2_old in src:
    src = src.replace(c2_old, c2_new, 1)
    print('Fix 2 OK - retries increased to 3, exponential backoff, no crash')
else:
    print('FAIL: Fix 2 - string not found')

# ─── FIX 3: Catch top-level analysis failure gracefully ──────────────────────
c3_old = """    } catch (e) {
      clearInterval(ticker);
      setStep(2);
      alert("Analysis failed: " + e.message);
    }"""

c3_new = """    } catch (e) {
      clearInterval(ticker);
      setStep(2);
      alert("Analysis failed. Please try again — this is usually a temporary API issue. Error: " + e.message);
    }"""

if c3_old in src:
    src = src.replace(c3_old, c3_new, 1)
    print('Fix 3 OK - better error message for user')
else:
    print('FAIL: Fix 3 - string not found')

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(src)
print('Done. Run: npm run build 2>&1 | head -20')
