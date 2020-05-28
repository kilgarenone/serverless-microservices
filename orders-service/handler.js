"use strict";

const serverless = require("aws-serverless-micro");
const { send } = require("micro");

module.exports.hello = serverless(async (req, res) => {
  const statusCode = 200;
  const data = { data: "sdsds" };

  send(res, statusCode, data);
});
