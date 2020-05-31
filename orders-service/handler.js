"use strict";

const serverless = require("aws-serverless-micro");
const { json, send, sendError } = require("micro");
const AWS = require("aws-sdk");

const {
  ORDERS_TABLE,
  PAYMENTS_SERVICE_FUNCTION,
  WEBSOCKET_SERVICE_FUNCTION,
} = process.env;
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const lambda = new AWS.Lambda();
/**
 * Credit: https://github.com/vercel/micro/issues/16#issuecomment-193518395
 */

async function orderAndPaymentWorkFlow(orderParams) {
  const paymentParams = {
    FunctionName: PAYMENTS_SERVICE_FUNCTION,
    Payload: JSON.stringify({}),
    LogType: "Tail",
  };

  try {
    // create a new order record
    await dynamoDb.put(orderParams).promise();

    // execute payment flow for this order
    const paymentResponse = await lambda.invoke(paymentParams).promise();

    const paymentStatus = JSON.parse(paymentResponse.Payload).statusCode;

    const updateOrderParams = {
      TableName: ORDERS_TABLE,
      Key: {
        orderId: orderParams.Item.orderId,
      },
      ExpressionAttributeNames: {
        "#S": "status",
      },
      ExpressionAttributeValues: {
        ":s": paymentStatus,
      },
      ReturnValues: "UPDATED_NEW",
      UpdateExpression: "SET #S = :s",
    };

    // update the 'status' of this particular order based on the result of payment
    const orderItem = await dynamoDb.update(updateOrderParams).promise();

    return {
      ...orderItem,
      paymentStatus: JSON.parse(paymentResponse.Payload).statusCode,
    };
  } catch (err) {
    // TODO
  }
}
/**
 * handle POST requests
 */
async function postHandler(request) {
  const { orderId, itemName, skuId, qty, createdAt, status } = await json(
    request
  );
  // TODO
  if (typeof qty !== "number") {
    // res.status(400).json({ error: '"qty" must be a string' });
  }

  const orderParams = {
    TableName: ORDERS_TABLE,
    Item: {
      orderId,
      itemName,
      skuId,
      qty,
      createdAt,
      status,
    },
  };

  await orderAndPaymentWorkFlow(orderParams);

  return { order: orderParams.Item };
}
/**
 * handle GET requests
 */
async function getHandler(request) {
  const params = {
    TableName: ORDERS_TABLE, // give it your table name
    Select: "ALL_ATTRIBUTES",
  };

  try {
    const { Items } = await dynamoDb.scan(params).promise();
    Items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return Items;
  } catch (err) {
    throw err;
  }
}

/**
 * Check the request method and use postHandler or getHandler (or other method handlers)
 */
async function methodHandler(request, response) {
  try {
    switch (request.method) {
      case "POST":
        return await postHandler(request);
      case "GET":
        return await getHandler(request);
      default:
        send(response, 405, "Invalid method");
        break;
    }
  } catch (error) {
    throw error;
  }
}

async function server(request, response) {
  // DO THIS TOO TO ENABLE CORS! besides setting 'cors: true' in serverless.yml
  response.setHeader("Access-Control-Allow-Origin", "*");
  try {
    send(response, 200, await methodHandler(request));
  } catch (error) {
    sendError(request, response, error);
  }
}

module.exports.handler = serverless(server);

module.exports.triggerStream = async (event, context, callback) => {
  const eventData = event.Records[0];

  const newOrderParams = {
    FunctionName: WEBSOCKET_SERVICE_FUNCTION,
    Payload: JSON.stringify({
      requestContext: { routeKey: "orderStream" },
      body: eventData.dynamodb.NewImage,
    }),
    LogType: "Tail",
  };

  const paymentResponse = await lambda.invoke(newOrderParams).promise();

  callback(null, null);
};
