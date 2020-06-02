/* eslint-disable import/no-extraneous-dependencies */
const micro = require("micro");
const test = require("ava");
const listen = require("test-listen");
const fetch = require("node-fetch");
const { methodHandler, postHandler } = require("./handler");

test("Handle invalid method", async (t) => {
  try {
    await methodHandler({ method: "DELETE" });
  } catch (err) {
    t.is(err.statusCode, 405, "Wrong status code for invalid method");
  }
});

test("Validate POST order's inputs", async (t) => {
  const service = micro(async (req) => {
    try {
      return await postHandler(req);
    } catch (err) {
      t.assert(
        err.statusCode === 429,
        "Failed enforcement of Qty value as a number type"
      );
      return {};
    }
  });

  const url = await listen(service);

  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify({ qty: "4" }),
  });

  await response.json();

  service.close();
});
