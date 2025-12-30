import type { PageLoad } from "./$types";
import type { Puzzle } from "$lib/types";

export const load: PageLoad = async ({ fetch }) => {
  const res = await fetch("/api/daily");
  const puzzle = (await res.json()) as Puzzle;

  return { puzzle };
};
