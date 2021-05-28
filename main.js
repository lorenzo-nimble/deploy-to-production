let core = require("@actions/core");
let github = require("@actions/github");

async function run(){
    let repoToken = core.getInput("repo-token", { required: true });
    let octokit = github.getOctokit(repoToken);

    const { context } = github;

    let lastBuildYear = 2021;
    let lastBuildMonth = 5;
    let lastBuildDay = 1;
    let lastBuildHour = 0;
    let lastBuildMinutes = 0;
    let lastBuildSeconds = 0;

    let lastBuildDate = new Date(lastBuildYear, lastBuildMonth, lastBuildDay, lastBuildHour, lastBuildMinutes, lastBuildSeconds);

    let requestObject = { 
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        labels: ['PROD'],
        since: lastBuildDate.toISOString()
    }

    let issuesSinceLastBuild = await octokit.rest.issues.listForRepo(requestObject);

    console.log(issuesSinceLastBuild.data);
}

run();