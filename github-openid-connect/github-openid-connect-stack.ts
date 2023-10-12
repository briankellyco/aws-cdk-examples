import * as cdk from "aws-cdk-lib";
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface GitHubStackProps extends cdk.StackProps {
    readonly repositoryConfig: { owner: string; repoName: string; filter?: string }[];
}

export class GithubOpenidConnectStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: GitHubStackProps) {
        super(scope, id, props);

        const githubOidcProvider = new iam.OpenIdConnectProvider(this, 'githubOidcProvider', {
            url: 'https://token.actions.githubusercontent.com',
            clientIds: ['sts.amazonaws.com'],
        });

        const deployableBranchesTagsOrPullRequestEvents = props.repositoryConfig.map(r =>
            `repo:${r.owner}/${r.repoName}:${r.filter ?? '*'}`);

        const conditions: iam.Conditions = {
            StringLike: {
                ['token.actions.githubusercontent.com:sub']: deployableBranchesTagsOrPullRequestEvents,
            },
        };

        // Attach either an inlinePolicy or a managedPolicy to the role
        new iam.Role(this, 'GithubRoleToDeployApplications', {
            assumedBy: new iam.WebIdentityPrincipal(githubOidcProvider.openIdConnectProviderArn, conditions),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'),
            ],
            roleName: 'github-role-to-deploy-applications',
            description: 'Github Actions uses this role to deploy applications in this AWS account',
            maxSessionDuration: cdk.Duration.hours(1),
        });
    }
}


const app = new cdk.App();
new GithubOpenidConnectStack(app, 'GithubOpenidConnectStack', {
    stackName: "github-openid-connect",
    repositoryConfig: [
        { owner: 'briankellyco', repoName: 'restapi-java', filter: 'main'},
        { owner: 'briankellyco', repoName: 'aws-cdk-examples' },
    ],
});
app.synth();