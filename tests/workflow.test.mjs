import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp,writeFile,readFile,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join,resolve } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const run=promisify(execFile);
async function fakeFetch(url,options={}){
 fs.appendFileSync(process.env.TEST_CALLS,JSON.stringify({url,method:options.method||'GET',body:options.body?JSON.parse(options.body):null})+'\n');
 const pr=JSON.parse(process.env.TEST_PR);
 if(url.includes('/files?'))return {ok:true,json:async()=>[{filename:'app.js',additions:1,patch:'@@ -0,0 +1 @@\n+'+(process.env.TEST_MODE==='safe'?'JSON.parse(input);':'eval(input);')}]};
 if((options.method||'GET')==='GET'){
  globalThis.prReads=(globalThis.prReads||0)+1;
  if(process.env.TEST_MODE==='outdated'&&globalThis.prReads>=3)pr.head.sha='new-head';
  return {ok:true,json:async()=>pr};
 }
 return {ok:true,json:async()=>({id:1})};
}
for(const mode of ['safe','unsafe','outdated'])test('automation HTTP contract: '+mode,async t=>{
 const dir=await mkdtemp(join(tmpdir(),'codelens-test-'));t.after(()=>rm(dir,{recursive:true,force:true}));
 const pr={html_url:'https://github.com/acme/app/pull/7',number:7,changed_files:1,head:{sha:'test-head'},base:{repo:{full_name:'acme/app'}}};
 const event=join(dir,'event.json'),calls=join(dir,'calls.jsonl'),preload=join(dir,'mock.mjs');
 await writeFile(event,JSON.stringify({pull_request:pr}));
 await writeFile(preload,"import fs from 'node:fs';\nglobalThis.fetch="+fakeFetch.toString()+";\n");
 let code=0;try{await run(process.execPath,['--import',preload,resolve('scripts/review-pr.mjs')],{cwd:dir,env:{...process.env,GITHUB_TOKEN:'fake-test-token',GITHUB_EVENT_PATH:event,GITHUB_STEP_SUMMARY:join(dir,'summary.md'),GITHUB_RUN_ID:'1',TEST_CALLS:calls,TEST_PR:JSON.stringify(pr),TEST_MODE:mode}});}catch(e){code=e.code;}
 const records=(await readFile(calls,'utf8')).trim().split('\n').map(JSON.parse);
 const statuses=records.filter(r=>r.url.includes('/statuses/')).map(r=>r.body.state);
 const reviews=records.filter(r=>r.url.endsWith('/reviews'));
 assert.equal(code,mode==='safe'?0:1);
 assert.deepEqual(statuses,['pending',mode==='safe'?'success':mode==='unsafe'?'failure':'error']);
 assert.equal(reviews.length,mode==='outdated'?0:1);
 if(reviews.length){assert.equal(reviews[0].body.commit_id,'test-head');assert.equal(reviews[0].body.event,'COMMENT');}
 assert.equal(JSON.parse(await readFile(join(dir,'codelens-report.json'),'utf8')).findings.length,mode==='safe'?0:1);
});
