// Import required modules
const WebSocket = require("ws");
const childProcess = require("child_process");
const validator = require("validator");
const winston = require("winston");
const path = require("path");

// Constants
const PORT = 8080;
const MAX_PAYLOAD_LENGTH = 1024;
const AUTHENTICATION_USERNAME = "root";
const AUTHENTICATION_PASSWORD = "toor";

// Set up logging with Winston
const logDirectory = path.join(__dirname, "logs");
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "websocket-server" },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(logDirectory, "server.log"),
    }),
  ],
});

// Service Configurations
const serviceConfigurations = {
  systemctl: {
    allowedCommands: ["status", "restart", "stop", "start"],
    handler: handleSystemctlCommand,
  },
  docker: {
    allowedCommands: ["ps", "images", "logs"],
    handler: handleDockerCommand,
  },
  diskutil: {
    allowedCommands: ["list"],
    handler: handleDiskUtilCommand,
  },
  // Add more service configurations here
};

// WebSocket Server Configuration
const wss = new WebSocket.Server({
  port: PORT,
  maxPayloadLength: MAX_PAYLOAD_LENGTH,
});

// Allowed Commands and their respective handlers
const allowedCommands = Object.fromEntries(
  Object.entries(serviceConfigurations).map(([service, config]) => [
    service,
    config.handler,
  ])
);

// Event Handlers
wss.on("connection", handleConnection);

// Start the WebSocket server
logger.info(`WebSocket server started on port ${PORT}`);

// Connection Handler
function handleConnection(ws, req) {
  const clientUsername = req.headers["x-user"];
  const clientPassword = req.headers["x-pass"];

  // Authenticate the client
  // if (clientUsername !== AUTHENTICATION_USERNAME || clientPassword !== AUTHENTICATION_PASSWORD) {
  //   logger.error('Authentication failed');
  //   ws.close(1008, 'Authentication failed');
  //   return;
  // }

  logger.info("Client authenticated");

  // Message Handler
  ws.on("message", (message) => handleMessage(message, ws));

  // Disconnect Handler
  ws.on("close", () => logger.info("Client disconnected"));
}

// Message Handler
function handleMessage(message, ws) {
  logger.info(`Received message: ${message}`);

  const messageString = message.toString("utf-8");
  const [command, ...args] = messageString.trim().split(" ");
  const sanitizedCommand = validator.escape(command);
  const sanitizedArgs = args.map((arg) => validator.escape(arg));

  // Check if the command is allowed
  if (!allowedCommands.hasOwnProperty(sanitizedCommand)) {
    const errorMessage = `Unsupported command: ${sanitizedCommand}`;
    ws.send(errorMessage);
    logger.error(errorMessage);
    return;
  }

  // Check if the command arguments are allowed
  const serviceConfig = serviceConfigurations[sanitizedCommand];
  const isAllowed =
    sanitizedArgs.length > 0 &&
    serviceConfig.allowedCommands.includes(sanitizedArgs[0]);

  if (!isAllowed) {
    const errorMessage = `Invalid command arguments: ${sanitizedArgs.join(
      " "
    )}`;
    ws.send(errorMessage);
    logger.error(errorMessage);
    return;
  }

  // Execute the allowed command
  allowedCommands[sanitizedCommand](sanitizedArgs.join(" "), ws, logger);
}

// systemctl Command Handler
function handleSystemctlCommand(command, ws, logger) {
  childProcess.exec(`systemctl ${command}`, (error, stdout, stderr) => {
    if (error) {
      logger.error(`systemctl command failed: ${error}`);
      ws.send(`systemctl command failed: ${error}`);
      return;
    }
    logger.info(`systemctl command output: ${stdout}`);
    ws.send(`systemctl command output: ${stdout}`);
  });
}

// docker Command Handler
function handleDockerCommand(command, ws, logger) {
  childProcess.exec(`docker ${command}`, (error, stdout, stderr) => {
    if (error) {
      logger.error(`docker command failed: ${error}`);
      ws.send(`docker command failed: ${error}`);
      return;
    }
    logger.info(`docker command output: ${stdout}`);
    ws.send(`docker command output: ${stdout}`);
  });
}

// diskutil Command Handler
function handleDiskUtilCommand(command, ws, logger) {
  childProcess.exec(`diskutil ${command}`, (error, stdout, stderr) => {
    if (error) {
      logger.error(`diskutil command failed: ${error}`);
      ws.send(`diskutil command failed: ${error}`);
      return;
    }
    logger.info(`diskutil command output: ${stdout}`);
    ws.send(`diskutil command output: ${stdout}`);
  });
}
