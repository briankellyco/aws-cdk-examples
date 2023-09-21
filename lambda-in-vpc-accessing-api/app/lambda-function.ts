// The handler name in the cloudformation template is composed of "filename.handlerFunctionName" e.g hello.handler
import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {

    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    console.log(`Context: ${JSON.stringify(context, null, 2)}`);

    const lambdaMessage = "Hello world from lambda-in-vpc-accessing-api!!";

    console.log(lambdaMessage);

    try {
        const res = await fetch('https://dummyjson.com/users/4');
        const resJson = await res.json();

        console.log('API response 🔥', JSON.stringify(resJson, null, 4));

        return {
            statusCode: 200,
            isBase64Encoded: false,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: lambdaMessage,
                body: JSON.stringify(resJson),
            }),
        };
    } catch (error) {
        return {body: JSON.stringify({error})};
    }


};