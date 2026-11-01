import { readFile, writeFile, appendFile } from 'node:fs/promises';
import { loadPullRequest } from '../src/review/github.mjs';
import { reviewMarkdown } from '../src/review/scanner.mjs';
const event=JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH,'utf8')),pr=event.pull_request;
if(!pr)throw new Error('A pull request event is required.');
const repo=pr.base.repo.full_name,sha=pr.head.sha,root='https://api.github.com/repos/'+repo;
const headers={Authorization:'Bearer '+process.env.GITHUB_TOKEN,Accept:'application/vnd.github+json','Content-Type':'application/json','X-GitHub-Api-Version':'2022-11-28'};
async function api(path,data){const r=await fetch(root+path,{method:data?'POST':'GET',headers,signal:AbortSignal.timeout(20000),...(data?{body:JSON.stringify(data)}:{})});if(!r.ok)throw new Error('GitHub review operation failed ('+r.status+').');return r.json();}
async function status(state,description){return api('/statuses/'+sha,{state,context:'CodeLens / static review',description,target_url:'https://github.com/'+repo+'/actions/runs/'+process.env.GITHUB_RUN_ID});}
await status('pending','Reviewing added JavaScript/TypeScript lines');
try{
 const report=await loadPullRequest(pr.html_url,fetch,process.env.GITHUB_TOKEN);
 if(report.sha!==sha)throw new Error('This PR event is outdated. A newer commit must be reviewed.');
 await writeFile('codelens-report.json',JSON.stringify(report,null,2));
 await appendFile(process.env.GITHUB_STEP_SUMMARY,reviewMarkdown(report));
 const current=await api('/pulls/'+report.number);
 if(current.head.sha!==sha)throw new Error('PR changed. No outdated review was posted.');
 await api('/pulls/'+report.number+'/reviews',{commit_id:sha,event:'COMMENT',body:reviewMarkdown(report)});
 const failed=report.findings.length>0||report.incomplete;
 await status(failed?'failure':'success',report.incomplete?'Incomplete review coverage':report.findings.length+' potential issues in '+report.scannedFiles+' supported files');
 if(failed)process.exitCode=1;
}catch(error){await status('error','Review could not finish; inspect Actions').catch(()=>{});throw error;}
