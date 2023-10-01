// The handler name in the cloudformation template is composed of "filename.handlerFunctionName" e.g item-function.handler
export const handler = async (event, context) => {

  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);

  try {
    var method = event.httpMethod;

    const { id } = event.pathParameters;
    console.log(`item-function: id: ${id}`);

    if (method === "GET") {



      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(
            {id: `${id}`, action: 'GET method processed for item'},
        )
      };
    }

    if (method === "POST") {

      return {
        statusCode: 201,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(
          {id: `${id}`, action: 'POST method processed for item'},
        )
      };
    }

    if (method === "DELETE") {

      return {
        statusCode: 204,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(
            {id: `${id}`, action: 'DELETE method processed for item'},
        )
      };
    }

    // We got something besides a GET, POST, or DELETE
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json"
      },
      body: "We only accept GET, POST, and DELETE, not " + method
    };
  } catch(error) {
    var body = error.stack || JSON.stringify(error, null, 2);
    return {
      statusCode: 400,
      headers: {},
      body: body
    }
  }
};