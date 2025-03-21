import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { WebSocketServer } from "ws";
import { PrismaClient } from "@prisma/client";

const app = new Hono();
const prisma = new PrismaClient();

// WebSocket server setup
const wss = new WebSocketServer({ port: 3004 });

wss.on("connection", (ws) => {
    ws.on("message", async (data) => {
        try {
            const message = JSON.parse(data.toString());

            // Save message to the database
            const savedMessage = await prisma.message.create({
                data: {
                    sender: message.sender,
                    content: message.content,
                },
            });

            // Broadcast message to all clients
            wss.clients.forEach((client) => {
                if (client.readyState === ws.OPEN) {
                    client.send(JSON.stringify(savedMessage));
                }
            });
        } catch (error) {
            console.error("Error processing message:", error);
        }
    });

    console.log("New client connected.");
});

console.log("🚀 WebSocket server running on ws://localhost:3000");
serve(app);
