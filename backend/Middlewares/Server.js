const Express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const { connect } = require("./Db");
const { validateEnv } = require("../utils/validateEnv");

validateEnv();

const app = Express();

const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// This API serves images (via /GetImage redirects) and JSON to two separate
// frontend origins (storefront + admin panel), so the default same-origin
// Cross-Origin-Resource-Policy would block legitimate <img> loads from those
// origins even though CORS otherwise allows them. Relax it to cross-origin.
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  // This is a JSON API plus an image-serving route — lock the default CSP
  // down to just what that actually needs instead of Helmet's generic
  // browser-page defaults (which assume the server also serves HTML/JS).
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
}));
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : false, credentials: true }));

// Stripe webhook needs the raw request body for signature verification, so it
// must be mounted before the global JSON body-parser below.
app.use("/Stripe-Webhook", require("../routes/StripeWebhook"));

app.use(Express.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(mongoSanitize());

const port = process.env.PORT || 5000;

// Under tests, tests/setup.js owns the Mongo connection (an in-memory
// server) so the app's own boot-time connect/fail-fast doesn't race it.
if (process.env.NODE_ENV !== "test") {
  connect().catch((err) => {
    console.error("Fatal: failed to connect to the database at boot.", err);
    process.exit(1);
  });
}

const httpServer = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(httpServer, {
  cors: { origin: allowedOrigins.length ? allowedOrigins : false, credentials: true },
});
require("./Socket")(io);

// Lets Socket.IO fan out events (new-sale, order-update) across multiple
// backend instances instead of only to sockets connected to the same
// process. Attaches asynchronously and is a pure enhancement — Socket.IO
// works fine single-instance before this resolves, so nothing here blocks
// boot or `io`'s usability. No-ops entirely when Redis isn't configured.
if (process.env.NODE_ENV !== "test") {
  const { getRedisClient } = require("../utils/redisClient");
  getRedisClient()
    .then((redisClient) => {
      if (!redisClient) return;
      const { createAdapter } = require("@socket.io/redis-adapter");
      io.adapter(createAdapter(redisClient, redisClient.duplicate()));
      console.log("Socket.IO Redis adapter attached.");
    })
    .catch((err) => {
      console.error("Failed to attach Socket.IO Redis adapter, continuing single-instance:", err?.message);
    });
}

module.exports = {
  httpServer,
  port,
  app,
  io,
};
