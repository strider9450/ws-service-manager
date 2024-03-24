# WS-Service-Manager

This utility provides a WebSocket server that allows clients to execute predefined commands on the server's system. It is designed to facilitate remote command execution securely over a WebSocket connection.

## Purpose

The purpose of this utility is to provide a simple and secure way to execute commands on the server remotely. It can be useful for system administrators or developers who need to perform tasks on the server without direct access to the command line interface.

## Adding More Services

To add more services (commands) that can be executed through this utility, follow these steps:

1. Open the `server.js` file in your preferred code editor.
2. Locate the `serviceConfigurations` object.
3. Add a new service configuration following the existing pattern. Each service configuration should have:
   - A unique identifier (key) for the service.
   - An array of allowed commands for the service.
   - A corresponding handler function to execute the commands.
4. Implement the handler function for the new service. The handler function should execute the command on the server and send back the output to the client.
5. Save your changes and restart the WebSocket server for the new service configuration to take effect.

## Running the Node.js Server

To run the WebSocket server:

1. Make sure you have Node.js installed on your system. You can download it from [nodejs.org](https://nodejs.org/).
2. Navigate to the project directory in your terminal.
3. Install dependencies by running:
   ```bash
   npm install
   node server.js
