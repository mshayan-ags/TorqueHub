require("dotenv").config();

// Must start before any other significant require() below — Application
// Insights auto-instruments modules (express, mongoose, http, etc.) by
// patching Node's module loader, which only works for modules required
// after .start() runs. No-ops entirely when the connection string isn't set.
if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
	require("applicationinsights").setup().start();
}

const { httpServer, port, app } = require("./Middlewares/Server");
const Routes = require("./Middlewares/Routes");

Routes;

httpServer.listen(port, () => {
	console.log(`Server on http://localhost:${port}`);
});
