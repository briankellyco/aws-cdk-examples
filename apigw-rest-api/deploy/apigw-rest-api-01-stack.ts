import * as cdk from "aws-cdk-lib";
import {
    aws_apigateway,
    aws_lambda,
    aws_lambda_nodejs,
    Duration
} from "aws-cdk-lib";
import {RetentionDays} from "aws-cdk-lib/aws-logs";
import * as path from 'path';

class ApigwRestApi01Stack extends cdk.Stack {

    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const api = new aws_apigateway.RestApi(this, "book-api", {
            restApiName: `book-api`,
            defaultCorsPreflightOptions: {
                // CORS setup
                allowOrigins: aws_apigateway.Cors.ALL_ORIGINS,
                allowMethods: aws_apigateway.Cors.ALL_METHODS,
                allowHeaders: ["*"],
                allowCredentials: true
            }
        });

        const listFunction = new aws_lambda_nodejs.NodejsFunction(this, 'ListFunction', {
            runtime: aws_lambda.Runtime.NODEJS_18_X,
            memorySize: 1024,
            timeout: Duration.seconds(5),
            handler: 'handler',
            logRetention: RetentionDays.ONE_WEEK,
            entry: path.join(
                __dirname,
                '../app/01/list-function.ts'
            ),
            bundling: {
                minify: false,
                sourceMap: false
            },
        });

        const itemFunction = new aws_lambda_nodejs.NodejsFunction(this, 'ItemFunction', {
            runtime: aws_lambda.Runtime.NODEJS_18_X,
            memorySize: 1024,
            timeout: Duration.seconds(5),
            handler: 'handler',
            logRetention: RetentionDays.ONE_WEEK, // Adds a lambda to manage the logs
            entry: path.join(
                __dirname,
                '../app/01/item-function.ts'
            ),
            bundling: {
                minify: false,
                sourceMap: false
            },
        });

        const listIntegration = new aws_apigateway.LambdaIntegration(listFunction, {
            requestTemplates: {"application/json": '{ "statusCode": "200" }'},
        });

        // Create a resource for "/books"
        const booksApi = api.root.addResource('books');
        booksApi.addMethod("GET", listIntegration);

        // Create a resource for "/books/{id}"
        const bookItemsApi = booksApi.addResource("{id}");


        const itemIntegration = new aws_apigateway.LambdaIntegration(itemFunction, {
            proxy: true // Default is true
        });

        bookItemsApi.addMethod("POST", itemIntegration);    // POST     /books/{id}
        bookItemsApi.addMethod("GET", itemIntegration);     // GET      /books/{id}
        bookItemsApi.addMethod("DELETE", itemIntegration);  // DELETE   /books/{id}

        // API base URL includes stage by default e.g https://4rboqkd0rb.execute-api.eu-west-1.amazonaws.com/prod/
        new cdk.CfnOutput(this, "apiUrl", {
            value: api.url!,
        });
    }

}

const app = new cdk.App();
new ApigwRestApi01Stack(app, 'ApigwRestApiStack',{
    stackName: "apigw-rest-api",
});
app.synth();