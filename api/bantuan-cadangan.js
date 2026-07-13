"use strict";

const { sendFeedbackEmail, validateFeedback } = require("../server/mailer");

const MAX_BODY_BYTES = 16 * 1024;

function sendJson(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(JSON.stringify(body));
}

function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return Promise.resolve(req.body);
  if (typeof req.body === "string") return Promise.resolve(JSON.parse(req.body || "{}"));

  return new Promise((resolve, reject) => {
    let size = 0;
    let raw = "";
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error("Payload too large"), { code: "PAYLOAD_TOO_LARGE" }));
        req.destroy();
        return;
      }
      raw += chunk;
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(Object.assign(error, { code: "INVALID_JSON" }));
      }
    });
    req.on("error", reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, OPTIONS");
    return sendJson(res, 204, {});
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return sendJson(res, 405, { ok: false, message: "Method not allowed" });
  }

  try {
    const payload = await readJsonBody(req);
    const result = validateFeedback(payload);

    if (!result.valid) {
      return sendJson(res, 400, { ok: false, message: "Invalid form data", errors: result.errors });
    }

    await sendFeedbackEmail(result.data);
    return sendJson(res, 200, { ok: true });
  } catch (error) {
    console.error("Feedback API error:", error);
    const statusCode = error.code === "INVALID_JSON" || error.code === "PAYLOAD_TOO_LARGE" ? 400 : 500;
    return sendJson(res, statusCode, { ok: false, message: "Unable to send feedback" });
  }
};
