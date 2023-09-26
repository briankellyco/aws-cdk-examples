import * as cdk from "aws-cdk-lib";
import {aws_lambda, aws_lambda_nodejs, CfnOutput, Duration} from "aws-cdk-lib";
import { FunctionUrlAuthType } from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import {LogGroup} from "aws-cdk-lib/aws-logs";

class LambdaFunctionUrlStack extends cdk.Stack {

    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const serviceName = "lamba-function-url";

        const lambdaFunction = new aws_lambda_nodejs.NodejsFunction(this, 'SampleFunction', {
            runtime: aws_lambda.Runtime.NODEJS_18_X,
            memorySize: 1024,
            timeout: Duration.seconds(5),
            handler: 'handler',
            entry: path.join(
                __dirname,
                '../app/lambda-function.ts'
            ),
            bundling: {
                minify: false,
                sourceMap: false
            },
        });

        // NONE will make your URL publicly accessible from anywhere on the internet
        const functionUrl = lambdaFunction.addFunctionUrl({
            authType: FunctionUrlAuthType.NONE,
        });

        // Logging manually initialised as CDK does not currently delete the log groups for the lambda
        const logGroup = new LogGroup(this,
            `${serviceName}-LogGroup`, {
                logGroupName: `/aws/lambda/${serviceName}`,
                removalPolicy: cdk.RemovalPolicy.DESTROY,
            });

        new CfnOutput(this, 'functionUrl', {
            value: functionUrl.url
        });

    }

}

const app = new cdk.App();
new LambdaFunctionUrlStack(app, 'LambdaFunctionUrlStack',{
    stackName: "lambda-function-url",
});
app.synth();