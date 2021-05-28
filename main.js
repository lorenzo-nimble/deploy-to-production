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

    let requestObject = { 
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        state: all
        //labels: ['PROD'],
        //since: `${lastBuildYear}-${lastBuildMonth}-${lastBuildDay}T${lastBuildHour}:${lastBuildMinutes}:${lastBuildSeconds}Z`
    }

    let issuesSinceLastBuild = await octokit.rest.issues.listForRepo(requestObject);

    console.log(issuesSinceLastBuild.data);
}

run();