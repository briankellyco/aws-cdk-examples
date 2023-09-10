import { Stack, StackProps } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from "aws-cdk-lib/aws-ecs";
import { Construct } from 'constructs';
import {IpAddresses} from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import {LogGroup} from "aws-cdk-lib/aws-logs";
import * as cdk from "aws-cdk-lib";
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';


export class ScheduledFargateTask01Stack extends Stack {
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

    // Create an IAM role for your Fargate task e.g task execution role that grants the ECS agent permission to call AWS APIs on your behalf.
    const fargateTaskRole = new iam.Role(this,
        `${serviceName}-TaskExecutionRole`, {
      roleName: "ecs-task-execution-role",
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com')
    });

    const taskDefinition = new ecs.FargateTaskDefinition(this,
        `${serviceName}-TaskDefinition`, {
      memoryLimitMiB: 512,
      cpu: 256,
      executionRole: fargateTaskRole,
    });

    const logGroup = new LogGroup(this,
        `${serviceName}-LogGroup`, {
      logGroupName: "/ecs/scheduled-fargate-task",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    const logging = new ecs.AwsLogDriver({
      logGroup: logGroup,
      streamPrefix: `${serviceName}Service`
    });

    // Create container and issue command to the container
    const container = taskDefinition.addContainer("Container", {
      logging: logging,
      image : image,
      command: ['sh', '-c', 'echo "Hello world!!" && sleep 5'],  // this command ends so the task ends
    });

    // Define an EventBridge rule that uses a schedule as the event source and an ESC task (AWS Service) as the target.
    const eventRule = new events.Rule(this, 'ScheduledRule', {
      schedule: events.Schedule.cron({
        minute: '0/5',
        weekDay: 'MON-SUN',
      }),
    });

    // Create an ECS task target for the rule.
    const ecsTarget = new targets.EcsTask({
      cluster: cluster,
      taskDefinition: taskDefinition,
      taskCount: 1,
    });

    // Add the ECS task target to the EventBridge rule
    eventRule.addTarget(ecsTarget);
  }
}

const scheduledFargateTask = new cdk.App();

new ScheduledFargateTask01Stack(scheduledFargateTask, 'ScheduledFargateTaskStack', {
  stackName: "scheduled-fargate-task-01",
});
