import { json } from "@sveltejs/kit";
import { getPuzzleById } from "$lib/server/puzzle_service";

export const GET = async ({ params }) => {
  const puzzle = getPuzzleById(params.puzzleId);

  if (!puzzle) {
    return json({ error: "Puzzle not found" }, { status: 404 });
  }

  return json(puzzle);
};
