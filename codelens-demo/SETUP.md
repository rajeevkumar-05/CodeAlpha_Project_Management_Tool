# CodeLens GitHub review integration

This installs the same rule-based scanner used by the CodeLens website.

After merging the setup PR into main, opening/updating a pull request runs CodeLens automatically. It posts file/line findings as a GitHub review and publishes **CodeLens / static review** on the PR head commit.

The workflow uses GitHub's automatic GITHUB_TOKEN with contents:read, pull-requests:write, and statuses:write. No .env, API key, npm install, or app change is required. It checks out only trusted base code; PR head contents are read as data and never executed.

"Potential issue" is a static-rule finding, not necessarily a compiler error. No matching rules does not guarantee bug-free code. Seven JS/TS checks are supported, including eval and raw HTML assignment. See the source rules for scope. Source code snippets are not included in exported reports.

Existing client/ and server/ files and application dependencies are unchanged. The intentional unsafe test fixture in the separate demo PR must remain unmerged and must not be executed.

A failing CodeLens status only blocks merges if you separately require **CodeLens / static review** in a branch protection rule/ruleset supported by your GitHub plan. This setup does not change repository protection settings.

To test after installation: push a small comment-only update to the existing demonstration PR. Its two unsafe expressions should produce a failing CodeLens status. Replace eval with JSON.parse for the intended JSON input and innerHTML with textContent, then push again to see a passing status.
