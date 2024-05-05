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
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
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

module.exports = {
  httpServer,
  port,
  app,
  io,
};
