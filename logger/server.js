import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4000;

// Log file path
const filePath = path.join(__dirname, "events.log");

app.use(express.json());

// Add CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Function to append events to file
function logEvent(event) {
  const line = JSON.stringify(event) + "\n";
  try {
    fs.appendFileSync(filePath, line, "utf8");
    console.log("Event logged:", event);
  } catch (error) {
    console.error("Failed to log event:", error);
  }
}

// // Serve tracker.js to frontend
// app.get("/tracker.js", (req, res) => {
//   res.sendFile(path.join(__dirname, "tracker.js"));
// });

// API endpoint to log events
app.post("/log-event", (req, res) => {
  logEvent({ ...req.body, time: new Date().toISOString() });
  res.json({ ok: true });
});

// // View logged events
// app.get("/events", (req, res) => {
//   try {
//     if (fs.existsSync(filePath)) {
//       const data = fs.readFileSync(filePath, "utf8");
//       const events = data.trim().split("\n").filter(line => line).map(line => JSON.parse(line));
//       res.json({ events, count: events.length });
//     } else {
//       res.json({ events: [], count: 0, message: "No events logged yet" });
//     }
//   } catch (error) {
//     res.status(500).json({ error: "Failed to read events" });
//   }
// });

app.listen(PORT, () => {
  console.log(`📘 Logger server running at http://localhost:${PORT}`);
});
