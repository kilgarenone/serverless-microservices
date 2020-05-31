const AWS = require("aws-sdk");
const apig = new AWS.ApiGatewayManagementApi({
  endpoint: process.env.APIG_ENDPOINT,
});
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const { CONNECTIONS_TABLE } = process.env;

module.exports.handler = async function (event, context) {
  const { body, requestContext: { connectionId, routeKey } = {} } = event;

  switch (routeKey) {
    case "$connect":
      await dynamoDb
        .put({
          TableName: CONNECTIONS_TABLE,
          Item: {
            connectionId,
            // Expire the connection an hour later. This is optional, but recommended.
            // You will have to decide how often to time out and/or refresh the ttl.
            ttl: parseInt(Date.now() / 1000 + 3600),
          },
        })
        .promise();
      break;
    case "$disconnect":
      await dynamoDb
        .delete({
          TableName: CONNECTIONS_TABLE,
          Key: { connectionId },
        })
        .promise();
      break;
    case "orderStream":
      const params = {
        TableName: CONNECTIONS_TABLE,
        Select: "ALL_ATTRIBUTES",
      };

      // TODO: For websocket demo purposes
      const connectionIds = await dynamoDb.scan(params).promise();

      await Promise.all(
        connectionIds.Items.map(({ connectionId }) =>
          apig
            .postToConnection({
              ConnectionId: connectionId,
              Data: JSON.stringify(body),
            })
            .promise()
        )
      );
      break;
    case "$default":
    default:
    // console.log("hellow stream from websocket:", body);
  }

  // Return a 200 status to tell API Gateway the message was processed
  // successfully.
  // Otherwise, API Gateway will return a 500 to the client.
  return { statusCode: 200 };
};
