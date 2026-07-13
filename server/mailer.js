"use strict";

const nodemailer = require("nodemailer");

const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 160;
const MAX_MESSAGE_LENGTH = 4000;

function cleanLine(value, maxLength) {
  return String(value || "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function cleanMessage(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim()
    .slice(0, MAX_MESSAGE_LENGTH);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validationError(errors) {
  const error = new Error("Invalid feedback payload");
  error.code = "VALIDATION_ERROR";
  error.errors = errors;
  return error;
}

function configError(message) {
  const error = new Error(message);
  error.code = "CONFIG_ERROR";
  return error;
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw configError(`${name} is not configured`);
  }
  return value.trim();
}

function validateFeedback(payload) {
  const data = {
    name: cleanLine(payload?.name, MAX_NAME_LENGTH),
    email: cleanLine(payload?.email, MAX_EMAIL_LENGTH).toLowerCase(),
    message: cleanMessage(payload?.message)
  };
  const errors = [];

  if (!data.name) errors.push("Nama diperlukan.");
  if (!data.email || !isValidEmail(data.email)) errors.push("Emel tidak sah.");
  if (!data.message) errors.push("Pertanyaan/Cadangan diperlukan.");

  return { data, errors, valid: errors.length === 0 };
}

function createTransporter() {
  const host = requireEnv("SMTP_HOST");
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true" || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined
  });
}

async function sendFeedbackEmail(payload) {
  const result = validateFeedback(payload);
  if (!result.valid) throw validationError(result.errors);

  const to = requireEnv("FEEDBACK_TO_EMAIL");
  const from = (process.env.MAIL_FROM || process.env.SMTP_USER || "").trim();
  if (!from) throw configError("MAIL_FROM or SMTP_USER is not configured");

  const fromHeader = from.includes("<") ? from : `"Portal PKSK" <${from}>`;
  const { name, email, message } = result.data;
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

  await createTransporter().sendMail({
    from: fromHeader,
    to,
    replyTo: email,
    subject: `Maklum balas Portal PKSK - ${name}`,
    text: [
      "Maklum balas baharu daripada Portal PKSK",
      "",
      `Nama: ${name}`,
      `Emel: ${email}`,
      "",
      "Pertanyaan/Cadangan:",
      message
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
        <h2 style="color:#6b0f1a;margin:0 0 16px">Maklum balas baharu daripada Portal PKSK</h2>
        <p><strong>Nama:</strong> ${safeName}</p>
        <p><strong>Emel:</strong> ${safeEmail}</p>
        <p><strong>Pertanyaan/Cadangan:</strong></p>
        <div style="padding:14px 16px;border-left:4px solid #9b1c31;background:#f8fafc">${safeMessage}</div>
      </div>`
  });

  return { ok: true };
}

module.exports = {
  validateFeedback,
  sendFeedbackEmail
};
