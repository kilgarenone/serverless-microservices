module.exports.handler = async (event, context, callback) => {
  callback(null, {
    statusCode: Math.random() < 0.5 ? 400 : 200,
  });
};
