require("dotenv").config();

const { httpServer, port, app } = require("./Middlewares/Server");
const Routes = require("./Middlewares/Routes");

Routes;

httpServer.listen(port, () => {
	console.log(`Server on http://localhost:${port}`);
});
