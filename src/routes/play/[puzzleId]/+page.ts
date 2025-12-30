import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch, params }) => {
  const res = await fetch(`/puzzle/${params.puzzleId}`);
  const puzzle = await res.json();

  return { puzzle };
};
