#!/usr/bin/env python3
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix literal newline in split("\n") inside close plan streaming
broken = 'for(const line of decoder.decode(value,{stream:true}).split("\n")) { if(line.startsWith("data: ")) { try { const evt=JSON.parse(line.slice(6)); if(evt.type==="content_block_delta"&&evt.delta?.type==="text_delta") raw+=evt.delta.text; } catch(e){} } }'
fixed  = 'for(const line of decoder.decode(value,{stream:true}).split(new RegExp("\\\\n"))) { if(line.startsWith("data: ")) { try { const evt=JSON.parse(line.slice(6)); if(evt.type==="content_block_delta"&&evt.delta?.type==="text_delta") raw+=evt.delta.text; } catch(e){} } }'

# The actual broken version has a literal newline between the quotes
import re
pattern = r'for\(const line of decoder\.decode\(value,\{stream:true\}\)\.split\("\n"\)\)'
replacement = 'for(const line of decoder.decode(value,{stream:true}).split(new RegExp("\\\\n")))'

result = re.sub(pattern, replacement, content)

if result != content:
    content = result
    print('Fixed literal newline in split call')
else:
    # Try with actual newline character
    content = content.replace(
        'decoder.decode(value,{stream:true}).split("\n")',
        'decoder.decode(value,{stream:true}).split(new RegExp("\\n"))'
    )
    print('Fixed via string replace')

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done.')
