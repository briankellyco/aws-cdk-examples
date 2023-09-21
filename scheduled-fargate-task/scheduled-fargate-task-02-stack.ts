import { Stack, StackProps } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecspatterns from 'aws-cdk-lib/aws-ecs-patterns';
import { Construct } from 'constructs';
import {IpAddresses} from "aws-cdk-lib/aws-ec2";
import {LogGroup} from "aws-cdk-lib/aws-logs";
import * as cdk from "aws-cdk-lib";
import * as events from 'aws-cdk-lib/aws-events';


export class ScheduledFargateTask02Stack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const serviceName = "scheduledFargateTask";

    // Create a simple VPC
    const vpc = new ec2.Vpc(this, 'SimpleVpc', {
      ipAddresses: IpAddresses.cidr("10.0.0.0/16"),
      natGateways: 1,
      maxAzs: 2,
    });

    // Create an ECS cluster
    const cluster = new ecs.Cluster(this, 'scheduled-task-cluster', {
      clusterName: 'scheduled-task-cluster',
      containerInsights: true,
      vpc: vpc,
    });

    // Create a container image
    const image = ecs.ContainerImage.fromRegistry('amazonlinux:2');

    const logGroup = new LogGroup(this,
      `${serviceName}-LogGroup`, {
          logGroupName: "/ecs/scheduled-fargate-task",
          removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const logDriver = new ecs.AwsLogDriver({
          logGroup: logGroup,
          streamPrefix: `${serviceName}Service`
    });

    // Create a scheduled Fargate task using an L3 construct. See https://docs.aws.amazon.com/cdk/v2/guide/constructs.html
    new ecspatterns.ScheduledFargateTask(this, 'scheduled-fargate-task', {
      schedule: events.Schedule.cron({
        minute: '0/5',
        hour: '*',
        day: '*',
        month: '*',
      }),
      cluster: cluster,
      platformVersion: ecs.FargatePlatformVersion.LATEST,
      scheduledFargateTaskImageOptions: {
        logDriver: logDriver,
        image: image,
          command: ['sh', '-c', 'echo "Hello world!!" && sleep 5'],
        environment: {
          APP_NAME: id,
        },
        memoryLimitMiB: 512,
        cpu: 256,
      },
    });
  }
}

const scheduledFargateTask = new cdk.App();

new ScheduledFargateTask02Stack(scheduledFargateTask, 'ScheduledFargateTaskStack', {
  stackName: "scheduled-fargate-task-02",
});
