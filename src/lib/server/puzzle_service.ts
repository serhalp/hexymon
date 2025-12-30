import { getNode } from "$lib/server/db";
import type { Puzzle } from "$lib/types";
import { PUZZLE_DEFINITIONS, type PuzzleDefinition } from "$lib/data/puzzles";

function buildPuzzle(definition: PuzzleDefinition): Puzzle | null {
  // We re-verify validity here at runtime, just in case,
  // but the build script should have caught errors.
  const missingIds = definition.pathIds.filter((id) => !getNode(id));
  if (missingIds.length > 0) {
    return null;
  }

  const startNode = getNode(definition.pathIds[0]);
  const targetNode = getNode(definition.pathIds[definition.pathIds.length - 1]);
  if (!startNode || !targetNode) {
    return null;
  }

  const scaffold = definition.pathIds.slice(1, -1).map((id, index) => {
    const node = getNode(id);
    return {
      index: index + 1,
      lang: node?.lang,
      hint: {
        lang: node?.lang,
        definition: node?.definition,
        pos: node?.pos,
      },
    };
  });

  return {
    puzzleId: definition.id,
    pathIds: definition.pathIds,
    startNode,
    targetNode,
    scaffold,
    totalPathLength: definition.pathIds.length,
  };
}

export function getPuzzleById(puzzleId: string): Puzzle | null {
  const def = PUZZLE_DEFINITIONS.find((p) => p.id === puzzleId);
  if (!def) return null;
  return buildPuzzle(def);
}

export function getDefaultPuzzle(): Puzzle | null {
  // Pick the first valid one
  for (const def of PUZZLE_DEFINITIONS) {
    const puzzle = buildPuzzle(def);
    if (puzzle) return puzzle;
  }
  return null;
}
