let core = require("@actions/core");
let github = require("@actions/github");
let fetch = require("node-fetch");

async function run(){
    let repoToken = core.getInput("repo-token", { required: true });
    let herokuToken = core.getInput("heroku-token", { required: true });
    let herokuApp = core.getInput("heroku-app", { required: true });

    let octokit = github.getOctokit(repoToken);

    const { context } = github;

    var myHeaders = new fetch.Headers();
    myHeaders.append("Accept", "application/vnd.heroku+json; version=3");
    myHeaders.append("Authorization", `Bearer ${herokuToken}`);
    myHeaders.append("Range", "version ..; max=1, order=desc");

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    let herokuBuilds = await fetch(`https://api.heroku.com/apps/${herokuApp}/releases`, requestOptions);

    let herokuBuildsParsed = await herokuBuilds.json();

    let herokuLastBuild = herokuBuildsParsed[0];

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
        // If issue is not a pull request, continue with the next issue
        if (!issue.pull_request){
            continue;
        }

        // If issue was closed before the last build date, continue with the next issue
        if (Date.parse(herokuLastBuildDate) > Date.parse(issue.closed_at)){
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
            created_at: issue.created_at,
            closed_at: issue.closed_at
        }

        filteredIssues.push(pullRequestObject);
    }

    console.log(filteredIssues);
}

run();