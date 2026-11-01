const rules = [
 { id:'dynamic-eval',severity:'High',title:'Dynamic code execution',test:s=>/\beval\s*\(/.test(s),explanation:'eval can execute attacker-controlled JavaScript. Replace it with explicit parsing or a lookup of allowed operations.' },
 { id:'tls-disabled',severity:'High',title:'TLS certificate verification is disabled',test:s=>/\brejectUnauthorized\s*:\s*false\b/.test(s),explanation:'Disabling certificate verification allows a network attacker to impersonate the server. Keep verification enabled.' },
 { id:'unsafe-html',severity:'Medium',title:'Raw HTML assignment needs sanitization',test:s=>/\.\s*(?:innerHTML|outerHTML)\s*=(?!=)/.test(s),explanation:'If this value contains untrusted input, assigning it as HTML can cause cross-site scripting. Prefer textContent or a vetted sanitizer.' },
 { id:'literal-signing-key',severity:'High',title:'Token is signed with a literal key',test:s=>/\b(?:jwt\.)?sign\s*\([^,\n]+,\s*['"][^'"]{4,}['"]/.test(s),explanation:'A signing key embedded in source can let others forge tokens. Load a strong signing key from a server environment secret.' },
 { id:'sql-interpolation',severity:'High',title:'SQL query contains string interpolation',test:s=>/\b(?:query|execute)\s*\(\s*\x60[^\x60]*\b(?:SELECT|INSERT|UPDATE|DELETE)\b[^\x60]*\$\{/i.test(s),explanation:'Interpolated values can alter a SQL query when they originate from input. Use bound parameters instead of embedding values in SQL strings.' },
 { id:'shell-interpolation',severity:'High',title:'Shell command contains string interpolation',test:s=>/\b(?:exec|execSync)\s*\(\s*\x60[^\x60]*\$\{/.test(s),explanation:'Interpolated shell commands can allow command injection. Prefer execFile or spawn with an argument array and input validation.' },
 { id:'conflict-marker',severity:'High',title:'Unresolved merge conflict marker',test:s=>/^\s*(?:<{7}|>{7})(?:\s|$)/.test(s),explanation:'Resolve this merge conflict before merging. Conflict markers can prevent the file from parsing.' }
];
export function parsePRUrl(value) {
 const u=new URL(value);
 const m=u.pathname.match(/^\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)\/pull\/([1-9]\d*)\/?$/);
 if(u.protocol!=='https:'||u.hostname!=='github.com'||u.port||u.username||u.password||!m) throw new Error('Use a GitHub PR URL such as https://github.com/owner/repo/pull/12');
 return {owner:m[1],repo:m[2],number:Number(m[3])};
}
export function scanFiles(files) {
 const findings=[], skipped=[]; let scannedFiles=0, addedLines=0;
 for(const file of files) {
  if(file.status==='removed'||file.additions===0) continue;
  if(!/\.(?:[cm]?js|jsx|ts|tsx)$/i.test(file.filename)){skipped.push({file:file.filename,reason:'Unsupported file type'});continue;}
  if(typeof file.patch!=='string'){skipped.push({file:file.filename,reason:'Patch unavailable'});continue;}
  scannedFiles++; let line=0, additions=0, inComment=false;
  for(const raw of file.patch.split('\n')){
   const h=raw.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);if(h){line=Number(h[1]);inComment=false;continue;}
   if(raw.startsWith('-')||raw.startsWith('\\'))continue;
   if(!raw.startsWith('+')&&!raw.startsWith(' '))continue;
   const code=raw.slice(1), trimmed=code.trim(), added=raw.startsWith('+');
   if(added){additions++;addedLines++;}
   const comment=inComment||trimmed.startsWith('//')||trimmed.startsWith('/*');
   if(trimmed.startsWith('/*')&&!trimmed.includes('*/'))inComment=true;
   if(inComment&&trimmed.includes('*/'))inComment=false;
   if(added&&!comment) for(const rule of rules) if(rule.test(code)) findings.push({id:rule.id+':'+file.filename+':'+line,rule:rule.id,severity:rule.severity,title:rule.title,file:file.filename,line,explanation:rule.explanation});
   line++;
  }
  if(typeof file.additions==='number'&&additions!==file.additions)skipped.push({file:file.filename,reason:'Patch appears truncated'});
 }
 return {engine:'CodeLens rules v1',findings,scannedFiles,addedLines,skipped,incomplete:skipped.some(s=>s.reason!=='Unsupported file type')};
}
export function createReport(pr,files){
 const result=scanFiles(files);
 return {version:1,source:'github',url:pr.html_url,repository:pr.base.repo.full_name,number:pr.number,title:pr.title,sha:pr.head.sha,createdAt:new Date().toISOString(),...result};
}
export function reviewMarkdown(report) {
 const safe=s=>String(s).replace(/[<>&\x60|]/g,'').replace(/[\r\n]/g,' ').slice(0,500);
 return ['## CodeLens review', '', 'Commit: '+report.sha,
  report.findings.length ? '**'+report.findings.length+' potential issue(s) found.**' : '**No issues matched the configured rules.**',
  '', 'Engine: '+report.engine+'. This is rule-based analysis of added JavaScript/TypeScript lines, not a full audit or proof of correctness.',
  'Scanned '+report.scannedFiles+' file(s), '+report.addedLines+' added line(s). Skipped '+report.skipped.length+' file/patch entry(s).',
  report.incomplete?'**Incomplete coverage: some supported patches were unavailable or truncated.**':'',
  '', ...report.findings.map(f=>'- **'+f.severity+': '+safe(f.title)+'** — '+safe(f.file)+':'+f.line+'\n  '+safe(f.explanation)),
  ...report.skipped.map(s=>'- Coverage: '+safe(s.file)+' — '+safe(s.reason)),
  '', 'Fix the code and push another commit to run a fresh review.'].join('\n');
}
