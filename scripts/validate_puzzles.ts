import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PUZZLE_DEFINITIONS } from "../src/lib/data/puzzles.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../src/lib/data");
const GRAPH_PATH = path.join(DATA_DIR, "graph.json");

async function validatePuzzles() {
  console.log("🔍 Validating puzzle definitions against graph data...");

  if (!fs.existsSync(GRAPH_PATH)) {
    console.error(`❌ Graph data not found at ${GRAPH_PATH}`);
    process.exit(1);
  }

  const graph = JSON.parse(fs.readFileSync(GRAPH_PATH, "utf-8"));
  let hasErrors = false;

  for (const puzzle of PUZZLE_DEFINITIONS) {
    const missingIds = [];

    // 1. Check Node Existence
    for (const id of puzzle.pathIds) {
      if (!graph[id]) {
        missingIds.push(id);
      }
    }

    if (missingIds.length > 0) {
      console.error(`
❌ Puzzle "${puzzle.name}" (ID: ${puzzle.id}) is invalid.`);
      console.error(`   Missing Node IDs: ${missingIds.join(", ")}`);
      hasErrors = true;
      continue;
    }

    // 2. Check Edges (Connectivity)
    // We verify that path[i] connects to path[i+1]
    for (let i = 0; i < puzzle.pathIds.length - 1; i++) {
      const sourceId = puzzle.pathIds[i];
      const targetId = puzzle.pathIds[i + 1];
      const sourceNode = graph[sourceId];

      // Check if target is in source's neighbors
      // Note: graph.json neighbors might be directed?
      // The game engine allows movement if a connection exists.
      // We should check if they are neighbors in either direction or if the edge exists.
      // Based on generate_mock_data.ts, neighbors array contains { id, relation, direction }.

      const isConnected = sourceNode.neighbors.some((n: any) => n.id === targetId);

      if (!isConnected) {
        console.error(`
❌ Puzzle "${puzzle.name}" (ID: ${puzzle.id}) has a broken link.`);
        console.error(`   No connection found between "${sourceId}" and "${targetId}".`);
        hasErrors = true;
      }
    }
  }

  if (hasErrors) {
    console.error("\n💥 Validation failed. Please fix the puzzle definitions or the graph data.");
    process.exit(1);
  } else {
    console.log("✅ All puzzles are valid!");
  }
}

validatePuzzles();
