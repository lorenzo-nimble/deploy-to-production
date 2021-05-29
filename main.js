let core = require("@actions/core");
let github = require("@actions/github");
let fetch = require("node-fetch");

async function run(){
    let repoToken = core.getInput("repo-token", { required: true });
    let herokuToken = core.getInput("heroku-token", { required: true });
    let herokuApp = core.getInput("heroku-app", { required: true });

    let octokit = github.getOctokit(repoToken);

    const { context } = github;

    let herokuBuilds = await fetch(`https://api.heroku.com/apps/${herokuApp}/releases`, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Accept': 'application/vnd.heroku+json; version=3',
            'Authorization': `Bearer ${herokuToken}`,
            'Range': 'version ..; max=1; order=desc',
        }
    });

    console.log(herokuBuilds);

    const herokuLastBuild = herokuBuilds.json()[0];

    let herokuLastBuildDescription = herokuLastBuild.description;
    let herokuLastBuildVersion = herokuLastBuild.version;
    let herokuLastBuildDate = herokuLastBuild.created_at;

    let issuesSinceLastBuild = await octokit.rest.issues.listForRepo({ 
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        state: 'closed',
        labels: ['PROD'],
        since: herokuLastBuildDate
    });

    let unfilteredIssues = issuesSinceLastBuild.data;
    let filteredIssues = [];

    for (issue of unfilteredIssues){
        if (!issue.pull_request){
            continue;
        }

        // If merge is not found, continue with the next issue (the PR is not merged)
        try {
            await octokit.rest.pulls.checkIfMerged({ 
                owner: context.payload.repository.owner.login,
                repo: context.payload.repository.name,
                pull_number: issue.number
            });
        } catch(err){
            continue;
        }

        let pullRequestObject = {
            title: issue.title,
            url: issue.html_url,
            closed_at: issue.closed_at
        }

        filteredIssues.push(pullRequestObject);
    }

    console.log(herokuLastBuildDate, herokuLastBuildDescription, herokuLastBuildVersion)
    console.log(filteredIssues);
}

run();