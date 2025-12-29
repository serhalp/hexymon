import { getNode } from "$lib/server/db";
import type { Node } from "$lib/types";

type PuzzleDefinition = {
  id: string;
  pathIds: string[];
  name?: string;
};

type Puzzle = {
  puzzleId: string;
  pathIds: string[];
  startNode: Node;
  targetNode: Node;
  scaffold: Array<{
    index: number;
    lang?: string;
    hint: {
      lang?: string;
      definition?: string;
      pos?: string;
    };
  }>;
  totalPathLength: number;
};

// Candidate puzzles. They are filtered at runtime if nodes are missing
// so the app never serves an invalid path even if the dataset changes.
const PUZZLE_DEFINITIONS: PuzzleDefinition[] = [
  {
    id: "1",
    name: "Approbate chain",
    pathIds: ["approbate_E", "approbatus_L", "approbare_L"],
  },
  {
    id: "2",
    name: "Manitou (Unami) link",
    pathIds: ["manitou_E", "manet:u_Unami"],
  },
  {
    id: "3",
    name: "Hexagon to six (mock fallback)",
    pathIds: [
      "en_hexagon",
      "gr_hexagon",
      "gr_hex",
      "pie_sueks",
      "proto_germ_sehs",
      "old_en_siex",
      "en_six",
    ],
  },
];

function buildPuzzle(definition: PuzzleDefinition): Puzzle | null {
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
  for (const def of PUZZLE_DEFINITIONS) {
    const puzzle = buildPuzzle(def);
    if (puzzle) return puzzle;
  }
  return null;
}

export function getAllPuzzleIds(): string[] {
  return PUZZLE_DEFINITIONS.filter((def) => buildPuzzle(def)).map((p) => p.id);
}
