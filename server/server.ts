import { createServer } from "http";
import { Server, Socket } from "socket.io";
const hre = require("hardhat");
import { loadAllDeployments } from "hardhat-deploy/dist/src/utils";
//let x = require("../frontend/src/hardhat/deployments/localhost/AccessRightMarket.json");

let x = loadAllDeployments(hre, hre.config.paths.deployments);
console.log(x['31337'].localhost.contracts.AccessRightMarket.address);
const httpServer = createServer();
const io = new Server(httpServer, {
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST"],
	}
});

io.on("connection", (socket: Socket) => {
	
	console.log(socket.id);
});

httpServer.listen(5000);