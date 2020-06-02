const serverless = require("aws-serverless-micro");
const { json, send, sendError, createError } = require("micro");
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
  let orderItem = await dynamoDb.update(updateOrderParams).promise();

  // TODO: Figure out how to not hold anything back within this function for faster latency. Some kinda background worker? Queue??
  // if 'Confirmed', set 'Delivered' after 5 seconds
  // eslint-disable-next-line eqeqeq
  if (paymentStatus == 200) {
    const deliveredOrderParams = {
      TableName: ORDERS_TABLE,
      Key: {
        orderId: orderParams.Item.orderId,
      },
      ExpressionAttributeNames: {
        "#S": "status",
      },
      ExpressionAttributeValues: {
        ":s": 201,
      },
      ConditionExpression: "#S < :s", // TODO: find out better syntax...
      ReturnValues: "UPDATED_NEW",
      UpdateExpression: "SET #S = :s",
    };

    await new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          orderItem = await dynamoDb.update(deliveredOrderParams).promise();
          resolve();
        } catch (err) {
          reject();
        }
      }, 5000);
    });
  }
  return {
    ...orderItem,
    paymentStatus: JSON.parse(paymentResponse.Payload).statusCode,
  };
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
    throw createError(429, "Quantity's value has to be a number");
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
async function getHandler() {
  const params = {
    TableName: ORDERS_TABLE, // give it your table name
    Select: "ALL_ATTRIBUTES",
  };

  const { Items } = await dynamoDb.scan(params).promise();
  Items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return Items;
}
/**
 * handle PUT requests
 */
async function putHandler(request) {
  const { orderId } = await json(request);

  const updateOrderParams = {
    TableName: ORDERS_TABLE,
    Key: {
      orderId,
    },
    ExpressionAttributeNames: {
      "#S": "status",
    },
    ExpressionAttributeValues: {
      ":s": 400,
    },
    ReturnValues: "UPDATED_NEW",
    UpdateExpression: "SET #S = :s",
  };

  await dynamoDb.update(updateOrderParams).promise();
  return { statusCode: 200 };
}

/**
 * Check the request method and use postHandler or getHandler (or other method handlers)
 */
async function methodHandler(request, response) {
  switch (request.method) {
    case "POST":
      return postHandler(request);
    case "PUT":
      return putHandler(request);
    case "GET":
      return getHandler(request);
    default:
      return send(response, 405, "Invalid method");
  }
}

async function server(request, response) {
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

  await lambda.invoke(newOrderParams).promise();

  callback(null, null);
};
