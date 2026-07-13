"use strict";

const fs = require("fs");
const http = require("http");
const path = require("path");
const { sendFeedbackEmail, validateFeedback } = require("./server/mailer");

const ROOT = __dirname;
const MAX_BODY_BYTES = 16 * 1024;

loadLocalEnv();

const PORT = Number(process.env.PORT || 8791);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml; charset=utf-8",
  ".ico": "image/x-icon"
};

function loadLocalEnv() {
  const envPath = path.join(ROOT, ".env");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;

    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

function setSecurityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
}

function sendJson(res, statusCode, body) {
  setSecurityHeaders(res);
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function readJsonBody(req) {
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

async function handleFeedback(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
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
}

function getStaticPath(requestUrl) {
  const url = new URL(requestUrl, "http://localhost");
  const pathname = decodeURIComponent(url.pathname);
  const normalizedPath = pathname === "/" ? "/index.html" : pathname;
  const resolved = path.resolve(ROOT, "." + normalizedPath);
  const relative = path.relative(ROOT, resolved);

  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;

  const topFolder = relative.split(path.sep)[0].toLowerCase();
  const baseName = path.basename(relative).toLowerCase();
  const blockedTopFolders = new Set([".git", "api", "server", "node_modules"]);
  const blockedFiles = new Set([".env", ".env.example", ".gitignore", "package.json", "package-lock.json", "server.js"]);

  if (blockedTopFolders.has(topFolder) || blockedFiles.has(baseName)) return null;
  return resolved;
}

function serveStatic(req, res) {
  const filePath = getStaticPath(req.url);
  if (!filePath) {
    setSecurityHeaders(res);
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Not found");
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      setSecurityHeaders(res);
      res.writeHead(error.code === "ENOENT" ? 404 : 500, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end(error.code === "ENOENT" ? "Not found" : "Server error");
    }

    setSecurityHeaders(res);
    res.writeHead(200, { "Content-Type": MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream" });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  if (req.url.split("?")[0] === "/api/bantuan-cadangan") {
    return handleFeedback(req, res);
  }
  return serveStatic(req, res);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Portal PKSK running at http://127.0.0.1:${PORT}/`);
});
