const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

const seed = {
  records: [
    { id: "rec-1", owner: "A. Lakshmi", survey: "142/B", village: "Velpur", extent: "2.4 acres", status: "Verified" },
    { id: "rec-2", owner: "M. Ravi Kumar", survey: "87/A", village: "Kothapalli", extent: "1.1 acres", status: "Needs survey" },
    { id: "rec-3", owner: "S. Fathima", survey: "211/C", village: "Ramanapeta", extent: "0.8 acres", status: "Verified" },
    { id: "rec-4", owner: "G. Prasad", survey: "19/D", village: "Velpur", extent: "3.0 acres", status: "Dispute review" },
    { id: "rec-5", owner: "B. Kavya", survey: "58/A", village: "Mallaram", extent: "1.7 acres", status: "Verified" }
  ],
  requests: [
    { id: "req-1", name: "A. Lakshmi", village: "Velpur", type: "Land mutation", details: "Mutation pending after inheritance update.", status: "Review" },
    { id: "req-2", name: "R. Narender", village: "Mallaram", type: "Water supply issue", details: "Borewell repair request near ward 4.", status: "Open" },
    { id: "req-3", name: "S. Fathima", village: "Ramanapeta", type: "Income certificate", details: "Certificate needed for scholarship application.", status: "Closed" }
  ]
};

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2));
}

function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function sendError(res, status, message) {
  sendJson(res, status, { error: message });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
  });
}

function id(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function mergeById(existing, incoming, prefix) {
  const map = new Map(existing.map((item) => [item.id, item]));
  incoming.forEach((item) => {
    const next = { ...item, id: item.id || id(prefix) };
    map.set(next.id, next);
  });
  return Array.from(map.values());
}

function validateFields(payload, fields) {
  return fields.every((field) => String(payload[field] || "").trim());
}

async function handleApi(req, res, url) {
  const db = readDb();
  const parts = url.pathname.split("/").filter(Boolean);
  const collection = parts[1];
  const itemId = parts[2];

  if (req.method === "GET" && url.pathname === "/api/data") {
    return sendJson(res, 200, db);
  }

  if (req.method === "GET" && url.pathname === "/api/records") {
    return sendJson(res, 200, db.records);
  }

  if (req.method === "GET" && url.pathname === "/api/requests") {
    return sendJson(res, 200, db.requests);
  }

  if (req.method === "POST" && url.pathname === "/api/import") {
    const payload = await readBody(req);
    if (Array.isArray(payload.records)) db.records = mergeById(db.records, payload.records, "rec");
    if (Array.isArray(payload.requests)) db.requests = mergeById(db.requests, payload.requests, "req");
    writeDb(db);
    return sendJson(res, 200, db);
  }

  if (!["records", "requests"].includes(collection)) {
    return sendError(res, 404, "API route not found");
  }

  const isRecord = collection === "records";
  const fields = isRecord ? ["owner", "survey", "village", "extent", "status"] : ["name", "village", "type", "details", "status"];
  const list = db[collection];

  if (req.method === "POST" && parts.length === 2) {
    const payload = await readBody(req);
    if (!validateFields(payload, fields)) return sendError(res, 400, "Missing required fields");
    const created = { id: id(isRecord ? "rec" : "req"), ...payload };
    list.unshift(created);
    writeDb(db);
    return sendJson(res, 201, created);
  }

  if (req.method === "PUT" && itemId) {
    const payload = await readBody(req);
    const index = list.findIndex((item) => item.id === itemId);
    if (index === -1) return sendError(res, 404, "Item not found");
    const updated = { ...list[index], ...payload, id: itemId };
    if (!validateFields(updated, fields)) return sendError(res, 400, "Missing required fields");
    list[index] = updated;
    writeDb(db);
    return sendJson(res, 200, updated);
  }

  if (req.method === "DELETE" && itemId) {
    const index = list.findIndex((item) => item.id === itemId);
    if (index === -1) return sendError(res, 404, "Item not found");
    const deleted = list.splice(index, 1)[0];
    writeDb(db);
    return sendJson(res, 200, deleted);
  }

  return sendError(res, 404, "API route not found");
}

function serveStatic(req, res, url) {
  const requestedPath = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const filePath = path.normalize(path.join(ROOT, requestedPath));

  if (!filePath.startsWith(ROOT)) return sendError(res, 403, "Forbidden");
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    return sendError(res, 404, "File not found");
  }

  const ext = path.extname(filePath);
  res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
    } else {
      serveStatic(req, res, url);
    }
  } catch (error) {
    sendError(res, 400, error.message);
  }
});

ensureDb();
server.listen(PORT, () => {
  console.log(`Janmabhoomi Civic Desk running at http://localhost:${PORT}`);
});
