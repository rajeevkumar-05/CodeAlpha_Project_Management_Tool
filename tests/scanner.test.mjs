import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scanFiles,parsePRUrl,reviewMarkdown,createReport } from '../src/review/scanner.mjs';
import { loadPullRequest } from '../src/review/github.mjs';
function file(code,extras={}){return {filename:'src/auth.js',additions:code.split('\n').length,patch:'@@ -0,0 +1,'+code.split('\n').length+' @@\n'+code.split('\n').map(l=>'+'+l).join('\n'),...extras};}
test('finds unsafe patterns at actual added line numbers',()=>{
 const cases=[['eval(userInput);','dynamic-eval'],['https.request({rejectUnauthorized: false});','tls-disabled'],['element.innerHTML = input;','unsafe-html'],["jwt.sign(payload, 'hardcoded-key');",'literal-signing-key'],['db.query(\x60SELECT * FROM users WHERE id = \${input}\x60);','sql-interpolation'],['exec(\x60cat \${input}\x60);','shell-interpolation'],['<<<<<<< HEAD','conflict-marker']];
 for(const [code,id] of cases){const r=scanFiles([file(code)]);assert.equal(r.findings[0]?.rule,id);assert.equal(r.findings[0].line,1);}
});
test('safe replacements clear findings',()=>{
 for(const code of ["JSON.parse(input);","https.request({rejectUnauthorized: true});","element.textContent = input;","jwt.sign(payload, process.env.JWT_SECRET);","db.query('SELECT * FROM users WHERE id = $1', [input]);","execFile('cat', [input]);"])assert.equal(scanFiles([file(code)]).findings.length,0);
});
test('only added lines are flagged across multiple hunks',()=>{
 const patch='@@ -10,2 +10,2 @@\n-eval(old);\n context();\n+eval(input);\n@@ -30,1 +31,1 @@\n-safe();\n+node.innerHTML = input;';
 const r=scanFiles([file('',{additions:2,patch})]);assert.deepEqual(r.findings.map(f=>f.line),[11,31]);assert.equal(r.incomplete,false);
});
test('missing or truncated patches are incomplete',()=>{const r=scanFiles([file('eval(x)',{patch:undefined}),file('eval(x)',{filename:'app.py'}),file('eval(x)',{additions:3})]);assert.equal(r.incomplete,true);assert.equal(r.skipped.length,3);});
test('ignores removed files and full-line comments',()=>{assert.equal(scanFiles([file('// eval(input)')]).findings.length,0);assert.equal(scanFiles([file('eval(input)',{status:'removed'})]).scannedFiles,0);});
test('validates GitHub PR URLs',()=>{for(const u of ['https://evil.test/x/y/pull/1','http://github.com/a/b/pull/1','https://user@github.com/a/b/pull/1','https://github.com/a/b/issues/1'])assert.throws(()=>parsePRUrl(u));assert.equal(parsePRUrl('https://github.com/a/b/pull/12').number,12);});
const pr={html_url:'https://github.com/acme/app/pull/12',number:12,title:'Actual change',base:{repo:{full_name:'acme/app'}},head:{sha:'abc123'},changed_files:1};
test('adapter fetches metadata, patches, and verifies current head',async()=>{const calls=[];const fake=async u=>{calls.push(u);return {ok:true,json:async()=>u.includes('/files?')?[file('eval(input)')]:pr};};const r=await loadPullRequest(pr.html_url,fake);assert.equal(calls.length,3);assert.equal(r.findings.length,1);assert.equal(r.sha,'abc123');});
test('rejects stale heads and missing files',async()=>{let count=0;await assert.rejects(loadPullRequest(pr.html_url,async u=>({ok:true,json:async()=>u.includes('/files?')?[file('safe()')]:++count===1?pr:{...pr,head:{sha:'changed'}}})),/changed during review/);await assert.rejects(loadPullRequest(pr.html_url,async u=>({ok:true,json:async()=>u.includes('/files?')?[]:pr})),/all changed files/);});
test('reports rate limits clearly',async()=>{await assert.rejects(loadPullRequest(pr.html_url,async()=>({ok:false,status:403})),/rate limit or permissions/);});
test('reports never contain source secrets',()=>{const r=createReport(pr,[file("jwt.sign(payload, 'private-literal-key');")]);assert.ok(!JSON.stringify(r).includes('private-literal-key'));assert.match(reviewMarkdown(r),/potential issue/);});
