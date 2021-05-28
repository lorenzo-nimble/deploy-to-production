let core = require("@actions/core");
let github = require("@actions/github");

async function run(){
    let repoToken = core.getInput("repo-token", { required: true });
    let octokit = github.getOctokit(repoToken);

    const { context } = github;

    let lastBuildYear = '2021';
    let lastBuildMonth = '05';
    let lastBuildDay = '01';
    let lastBuildHour = '00';
    let lastBuildMinutes = '00';
    let lastBuildSeconds = '00';

    let issuesSinceLastBuild = await octokit.rest.issues.listForRepo({ 
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        state: 'closed',
        labels: ['PROD'],
        // since: `${lastBuildYear}-${lastBuildMonth}-${lastBuildDay}T${lastBuildHour}:${lastBuildMinutes}:${lastBuildSeconds}Z`
    });

    /*

    let unfilteredIssues = issuesSinceLastBuild.data;
    let filteredIssues = [];

    for (issue of unfilteredIssues){
        if (!issue.pull_request){
            continue;
        }

        let mergedIssue = await octokit.rest.pulls.checkIfMerged({ 
            owner: context.payload.repository.owner.login,
            repo: context.payload.repository.name,
            pull_number: issue.number
        });

        let pullRequestObject = {
            title: issue.title,
            url: issue.html_url,
            merged: mergedIssue,
            closed_at: issue.closed_at
        }

        filteredIssues.push(pullRequestObject);
    } */

    console.log(issuesSinceLastBuild.data);
}

run();