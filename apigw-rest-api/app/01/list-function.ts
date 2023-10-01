// The handler name in the cloudformation template is composed of "filename.handlerFunctionName" e.g list-function.handler
export const handler = async (event, context) => {

    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    console.log(`Context: ${JSON.stringify(context, null, 2)}`);

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify([
            {id: 1, title: 'Implementing Domain Driven Design'},
            {id: 2, title: 'Serverless Architectures on AWS'},
        ])
    };
};