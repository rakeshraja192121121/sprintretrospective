import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "logs.txt");

export function logEvent(event) {
  const line = JSON.stringify(event) + "\n";
  fs.appendFileSync(filePath, line, "utf8");
}
