const { Router } = require("express");
const mongoose = require("mongoose");

const router = Router();

// Unauthenticated, unlimited on purpose — container/orchestrator liveness
// probes must not depend on auth or be subject to the auth rate limiter.
router.get("/healthz", (req, res) => {
	const dbState = mongoose.connection.readyState; // 1 = connected
	const healthy = dbState === 1;
	res.status(healthy ? 200 : 503).json({ status: healthy ? 200 : 503, db: dbState });
});

module.exports = router;
