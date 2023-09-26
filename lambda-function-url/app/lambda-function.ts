// The handler name in the cloudformation template is composed of "filename.handlerFunctionName" e.g hello.handler
import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {

    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    console.log(`Context: ${JSON.stringify(context, null, 2)}`);

    const lambdaMessage = "Hello world from lambda-function-url!!";

    console.log(lambdaMessage);

    const { body, headers } = event;

    const requestBody = JSON.parse(body || '{}');

    let dataResponse = {
        message: "No payload received"
    };

    // Response if 'key' exists in the request body
    if ('key' in requestBody) {
        const value = requestBody.key;
        dataResponse = {
            key: value,
            message: `Echo extracted key value: ${value}`
        };
    }
    return {
        statusCode: 200,
        isBase64Encoded: false,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            lambdaMessage: lambdaMessage,
            body: JSON.stringify(dataResponse),
        }),
    };
};