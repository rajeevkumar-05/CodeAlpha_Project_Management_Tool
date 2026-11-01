import { createReport, parsePRUrl } from './scanner.mjs';
export async function loadPullRequest(url, request=fetch, token) {
 const target=parsePRUrl(url);
 const base='https://api.github.com/repos/'+target.owner+'/'+target.repo+'/pulls/'+target.number;
 const headers={Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',...(token?{Authorization:'Bearer '+token}:{})};
 async function get(u){
  const response=await request(u,{headers,signal:AbortSignal.timeout(20000)});
  if(!response.ok) throw new Error(response.status===404?'PR not found or private. For private PRs, use the installed GitHub workflow and import its report.':response.status===403||response.status===429?'GitHub API rate limit or permissions prevented this request. Try again later.':'GitHub request failed ('+response.status+').');
  return response.json();
 }
 const pr=await get(base);const files=[];
 for(let page=1;page<=30;page++){
  const batch=await get(base+'/files?per_page=100&page='+page);files.push(...batch);
  if(batch.length<100)break;
 }
 if(files.length!==pr.changed_files)throw new Error('GitHub did not return all changed files. Split this PR into smaller changes.');
 const latest=await get(base);
 if(latest.head.sha!==pr.head.sha)throw new Error('The PR changed during review. Run it again to review the current commit.');
 return createReport(pr,files);
}
