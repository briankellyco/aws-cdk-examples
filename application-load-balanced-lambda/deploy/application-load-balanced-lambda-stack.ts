import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as cdk from "aws-cdk-lib";
import {IpAddresses} from "aws-cdk-lib/aws-ec2";
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as targets from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import {aws_lambda, aws_lambda_nodejs, Duration} from "aws-cdk-lib";
import * as path from 'path';

class ApplicationLoadBalancedLambdaStack extends cdk.Stack {

    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Create a simple VPC
        const vpc = new ec2.Vpc(this, 'SimpleVpcForElb', {
            ipAddresses: IpAddresses.cidr("10.0.0.0/16"),
            natGateways: 0,
            maxAzs: 2,
            subnetConfiguration: [
                {
                    cidrMask: 24,
                    name: 'subnetForElb',
                    subnetType: ec2.SubnetType.PUBLIC,
                }
            ],
        });

        const alb = new elbv2.ApplicationLoadBalancer(this, 'alb', {
            vpc,
            internetFacing: true,
        });

        new cdk.CfnOutput(this, "AlbDnsName", {value: alb.loadBalancerDnsName})

        const lambdaFunction = new aws_lambda_nodejs.NodejsFunction(this, 'SampleFunction', {
            runtime: aws_lambda.Runtime.NODEJS_18_X,
            memorySize: 1024,
            timeout: Duration.seconds(45),
            handler: 'handler',
            entry: path.join(
                __dirname,
                '../app/hello.ts'
            ),
            bundling: {
                minify: false,
                sourceMap: false
            },
        })

        const lambdaTarget = new targets.LambdaTarget(lambdaFunction);

        const listener = alb.addListener('Listener', {
            port: 80,
            open: true,
        });

        listener.addTargets('LambdaTarget', {
            targets: [lambdaTarget],
        });
    }

}

const app = new cdk.App();
new ApplicationLoadBalancedLambdaStack(app, 'ApplicationLoadBalancedLambdaStack',{
    stackName: "application-load-balanced-lambda",
});
app.synth();