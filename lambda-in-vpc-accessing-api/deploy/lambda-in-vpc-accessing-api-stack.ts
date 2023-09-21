import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as cdk from "aws-cdk-lib";
import {IpAddresses} from "aws-cdk-lib/aws-ec2";
import {aws_lambda, aws_lambda_nodejs, Duration} from "aws-cdk-lib";
import * as path from 'path';

class LambdaInVpcAccessingApiStack extends cdk.Stack {

    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Create a simple VPC
        const vpc = new ec2.Vpc(this, 'SimpleVpcForLambda', {
            ipAddresses: IpAddresses.cidr("10.0.0.0/16"),
            natGateways: 1,
            maxAzs: 2,
            subnetConfiguration: [
                {
                    cidrMask: 24,
                    name: 'public-subnet-1',
                    subnetType: ec2.SubnetType.PUBLIC,
                },
                {
                    cidrMask: 24,
                    name: 'private-subnet-1',
                    subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS
                }
            ],
        });

        const lambdaFunction = new aws_lambda_nodejs.NodejsFunction(this, 'SampleFunction', {
            runtime: aws_lambda.Runtime.NODEJS_18_X,
            vpc,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
            },
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
        })
    }

}

const app = new cdk.App();
new LambdaInVpcAccessingApiStack(app, 'LambdaInVpcAccessingApiStack',{
    stackName: "lambda-in-vpc-accessing-api",
});
app.synth();