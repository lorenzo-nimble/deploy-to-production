let core = require("@actions/core");
let github = require("@actions/github");

let pullRequest = github.context.payload.pull_request;

if (!pullRequest) {
    throw new Error("No pull request information found");
}

let baseBranch = pullRequest.base.ref;

let repoToken = core.getInput("repo-token", { required: true });
let octokit = github.getOctokit(repoToken);

const { context } = github;

switch(baseBranch){
    case "master": {
        octokit.rest.issues.addLabels({ issue_number: pullRequest.number, owner: context.payload.repository.owner.login, repo: context.payload.repository.name, labels: ['PROD'] });
        break;
    }
    case "staging": {
        octokit.rest.issues.addLabels({ issue_number: pullRequest.number, owner: context.payload.repository.owner.login, repo: context.payload.repository.name, labels: ['STG'] });
        break;
    }
}