import { json } from "@sveltejs/kit";
import { getDefaultPuzzle } from "$lib/server/puzzles";

export const GET = async () => {
  const puzzle = getDefaultPuzzle();

  if (!puzzle) {
    return json({ error: "Puzzle configuration error" }, { status: 500 });
  }

  return json(puzzle);
};
