// The handler name in the cloudformation template is composed of "filename.handlerFunctionName" e.g hello.handler
import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {

    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    console.log(`Context: ${JSON.stringify(context, null, 2)}`);

    const lambdaMessage = "Hello world from application-load-balanced-lambda!!";

    console.log(lambdaMessage);

    const { queryStringParameters, body, headers } = event;

    return {
        statusCode: 200,
        isBase64Encoded: false,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: lambdaMessage,
            queryStringParameters: queryStringParameters,
            body: body,
            myIpAddress: headers['x-forwarded-for']
        }),
    };
};