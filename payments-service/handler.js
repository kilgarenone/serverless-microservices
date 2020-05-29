module.exports.handler = async (event, context, callback) => {
  console.log("event:", event);
  callback(null, {
    statusCode: 200,
    body: JSON.stringify(event),
  });
};
