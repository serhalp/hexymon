import { json } from "@sveltejs/kit";
import { checkConnection, getNode } from "$lib/server/db";
import { getDefaultPuzzle, getPuzzleById } from "$lib/server/puzzle_service";

export const POST = async ({ request }) => {
  try {
    const { currentWordId, guessedWordId, puzzleId } = await request.json();

    if (!guessedWordId) {
      return json({ error: "guessedWordId is required" }, { status: 400 });
    }

    const puzzle = getPuzzleById(puzzleId) || getDefaultPuzzle();
    if (!puzzle) {
      return json({ error: "Puzzle configuration error" }, { status: 500 });
    }

    const guessedNode = getNode(guessedWordId);
    if (!guessedNode) {
      return json({ error: "Invalid word ID" }, { status: 404 });
    }

    let connection = null;
    if (currentWordId) {
      connection = checkConnection(currentWordId, guessedWordId);
    }

    // Check if it's on the optimal path
    const pathIndex = puzzle.pathIds.indexOf(guessedWordId);

    return json({
      isValidNeighbor: !!connection,
      relation: connection?.relation,
      node: guessedNode,
      pathIndex: pathIndex, // -1 if not on path
    });
  } catch (err) {
    return json({ error: "Invalid request" }, { status: 400 });
  }
};
