"use strict";

const express = require("express");
const bodyParser = require("body-parser");

const crypto = require("crypto");

const app = express();

const KEY = "123";

function verifySignature(req, res, buf, encoding) {
  const authHeader = req.headers.authorization;
  const [, requestedSignature] = authHeader.split(" ");
  const signatureString = req.method + req.url + buf.toString("utf-8");

  const hmac = crypto.createHmac("sha256", KEY);
  const expectedSignature = hmac.update(signatureString).digest("hex");

  if (requestedSignature !== expectedSignature) {
    throw new Error("Signature does not match");
  }
}

app.post(
  "/test",
  bodyParser.urlencoded({ extended: false, verify: verifySignature }),
  (req, res) => {
    //console.log(req.body);
    console.log(req.body);

    res.set("location", "http://github.com");

    res.status(301).send("OK");
  }
);

app.listen(80);
