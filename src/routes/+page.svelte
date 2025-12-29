<script lang="ts">
  import { onMount } from "svelte";
  import confetti from "canvas-confetti";
  import { fade, fly, scale, slide } from "svelte/transition";
  import Hexagon from "$lib/components/Hexagon.svelte";
  import Search from "$lib/components/Search.svelte";
  import HowToPlayModal from "$lib/components/HowToPlayModal.svelte";
  import searchIndexRaw from "$lib/data/search_index.json";
  import type { Node, SearchIndexItem } from "$lib/types";

  const searchIndex = searchIndexRaw as SearchIndexItem[];

  let loading = $state(true);
  let puzzle = $state<any>(null);
  let pathNodes = $state<(Node | null)[]>([]);
  let currentNodeId = $state("");
  let message = $state("");
  let branches = $state<{ parentId: string; node: Node }[]>([]);

  let totalGuesses = $state(0);
  let incorrectGuesses = $state(0);
  const maxMistakes = 6;
  let hintsRevealed = $state(0); // Track how many hints have been revealed

  let copied = $state(false);
  let showHelp = $state(false); // Modal state
  let hoveredIndex = $state<number | null>(null); // For z-index management

  // Derived state to check if won (ensure loaded first)
  let isWon = $derived(
    puzzle !== null && pathNodes.length > 0 && pathNodes.every((n) => n !== null),
  );
  let minimumMoves = $derived(puzzle ? puzzle.totalPathLength - 2 : 0);
  let mistakesRemaining = $derived(maxMistakes - incorrectGuesses);

  onMount(async () => {
    try {
      const res = await fetch("/api/daily");
      const data = await res.json();
      puzzle = data;

      pathNodes = new Array(data.totalPathLength).fill(null);
      pathNodes[0] = data.startNode;
      pathNodes[data.totalPathLength - 1] = data.targetNode;

      currentNodeId = data.startNode.id;
    } catch (e) {
      message = "Failed to load puzzle.";
    } finally {
      loading = false;
    }
  });

  $effect(() => {
    if (isWon) {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#4c1d95", "#d97706", "#10b981"],
      });
    }
  });

  function pluralize(count: number, singular: string, plural: string) {
    return count === 1 ? singular : plural;
  }

  let shareString = $derived(
    `I solved today's Hexymon (#${puzzle?.puzzleId || "?"}) in ${totalGuesses}
${pluralize(totalGuesses, "guess", "guesses")}, with ${incorrectGuesses}
${pluralize(incorrectGuesses, "mistake", "mistakes")}.\n\nNerd out yourself here: ${
      typeof window !== "undefined" ? window.location.href : ""
    }`,
  );

  function shareResult() {
    navigator.clipboard.writeText(shareString);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }

  function revealHint() {
    // Find indices of unrevealed empty slots
    // pathNodes[0] is start, [length-1] is target.
    // scaffold corresponds to pathNodes 1 to length-2.

    // We need to map global path index to scaffold index
    // Hints are revealed sequentially or random? Let's do random unrevealed.

    if (!puzzle || !puzzle.scaffold) return;

    // Available hints are indices where pathNodes[i] is null (empty)
    // AND that hint hasn't been revealed yet.
    // But wait, how do we track which specific hint is revealed?
    // We can just increment hintsRevealed and show hints for the first N empty slots?
    // Or better: Use a bitmask or array of revealed indices.
  }

  // Actually, let's just use `hintsRevealed` count.
  // We need to decide WHICH hints to show.
  // Simple strategy: Show hints for the first `hintsRevealed` empty slots found in order?
  // Or random? Random is more fun.
  // We need state to track WHICH hints are unlocked.
  let revealedHintIndices = $state<number[]>([]);

  async function handleSelect(item: SearchIndexItem) {
    message = "Checking...";
    totalGuesses++;

    try {
      const res = await fetch("/api/validate", {
        method: "POST",
        body: JSON.stringify({
          currentWordId: currentNodeId,
          guessedWordId: item.id,
        }),
      });

      const result = await res.json();

      if (result.error) {
        message = result.error;
        handleMistake();
        return;
      }

      if (result.pathIndex !== -1) {
        pathNodes[result.pathIndex] = result.node;
        currentNodeId = result.node.id;
        message = "Correct! Snapped to path.";
      } else if (result.isValidNeighbor) {
        branches = [...branches, { parentId: currentNodeId, node: result.node }];
        currentNodeId = result.node.id;
        message = `Related! (${result.relation})`;
      } else {
        message = "No connection found.";
        handleMistake();
      }
    } catch (e) {
      message = "Error validating move.";
    }
  }

  function handleMistake() {
    incorrectGuesses++;

    // Unlock a new hint if possible
    if (puzzle && puzzle.scaffold) {
      // Find all indices (in scaffold array) that correspond to empty path nodes
      // AND are not yet in revealedHintIndices
      const availableIndices: number[] = [];

      puzzle.scaffold.forEach((_: any, i: number) => {
        // scaffold[i] corresponds to pathNodes[i+1]
        if (pathNodes[i + 1] === null && !revealedHintIndices.includes(i)) {
          availableIndices.push(i);
        }
      });

      if (availableIndices.length > 0) {
        // Pick random
        const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        revealedHintIndices = [...revealedHintIndices, randomIndex];
        message = `Mistake! Hint revealed for a remaining word.`;
      }
    }
  }

  let usedWordIds = $derived([
    ...pathNodes.filter((n) => n !== null).map((n) => n!.id),
    ...branches.map((b) => b.node.id),
  ]);

  let isCurrentNodeVisible = $derived(pathNodes.some((n) => n?.id === currentNodeId));
  let currentNodeData = $derived(
    pathNodes.find((n) => n?.id === currentNodeId) ||
      branches.find((b) => b.node.id === currentNodeId)?.node ||
      null,
  );
</script>

<div class="flex min-h-screen flex-col bg-[#fdfbf7] pb-32 font-sans text-slate-900">
  <!-- Header -->
  <header
    class="sticky top-0 z-40 border-b border-indigo-100 bg-white/80 shadow-sm backdrop-blur-md"
  >
    <div class="container mx-auto flex max-w-lg items-center justify-between px-4 py-3">
      <div class="flex items-center gap-2">
        <div class="h-8 w-8 text-indigo-900">
          <!-- Small Logo Icon -->
          <svg viewBox="0 0 100 115.47" class="h-full w-full fill-current">
            <path d="M50 0 L93.3 25 L93.3 75 L50 100 L6.7 75 L6.7 25 Z" />
          </svg>
        </div>
        <div>
          <h1 class="font-serif text-xl leading-none font-black tracking-tight text-indigo-900">
            HEXYMON
          </h1>
          <p class="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
            Etymology Puzzle
          </p>
        </div>
      </div>

      <div class="flex flex-col items-end">
        <div class="flex items-center gap-3">
          <div class="flex flex-col items-end">
            <span class="text-[10px] font-bold tracking-wider text-slate-400 uppercase"
              >Mistakes Remaining</span
            >
            <span
              class="font-mono text-lg leading-none font-bold transition-colors"
              class:text-rose-500={mistakesRemaining <= 2}
              class:text-amber-500={mistakesRemaining > 2 && mistakesRemaining <= 4}
              class:text-emerald-500={mistakesRemaining > 4}
            >
              {Math.max(0, mistakesRemaining)}
            </span>
          </div>

          <button
            class="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-indigo-600"
            onclick={() => (showHelp = true)}
            aria-label="How to play"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              ><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"
              ></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg
            >
          </button>
        </div>
      </div>
    </div>
  </header>

  <HowToPlayModal isOpen={showHelp} onClose={() => (showHelp = false)} />

  <main class="relative container mx-auto mt-8 flex max-w-lg flex-col items-center p-4">
    {#if loading}
      <div class="flex animate-pulse flex-col items-center gap-4">
        {#each { length: 5 } as _}
          <div class="h-24 w-24 rounded-full bg-slate-200/50"></div>
        {/each}
      </div>
    {:else if puzzle}
      <!-- The Chain -->
      <!-- Mobile: Vertical Column. Desktop: Horizontal Row (centered) -->
      <div
        class="relative flex flex-col items-center justify-center pt-4 pb-24 md:flex-row md:px-12 md:pt-20 md:pb-32"
      >
        {#each { length: puzzle.totalPathLength } as _, i}
          {@const node = pathNodes[i]}
          {@const isStart = i === 0}
          {@const isTarget = i === puzzle.totalPathLength - 1}

          <!-- Determine Hint Visibility -->
          {@const scaffoldIndex = i - 1}
          {@const scaffoldData =
            !isStart && !isTarget && puzzle.scaffold ? puzzle.scaffold[scaffoldIndex] : null}
          {@const isHintRevealed = revealedHintIndices.includes(scaffoldIndex)}
          {@const hint = scaffoldData ? { ...scaffoldData.hint, showPos: isHintRevealed } : null}

          {@const status = node ? (isStart || isTarget ? "locked" : "filled") : "empty"}
          {@const branch = branches.find((b) => b.parentId === pathNodes[i]?.id)}
          {@const isEven = i % 2 === 0}

          <!-- Desktop Layout Logic -->
          <!-- Pattern: 0 -> 1 (Down-Right), 1 -> 2 (Right), 2 -> 3 (Down-Right)... -->
          <!-- Y-Level: 0, 1, 1, 2, 2, 3, 3 -->
          {@const yLevel = (i + (i % 2)) / 2}
          {@const yOffsetPct = yLevel * 37.5}

          <!-- Z-Index: If hovered, bring to front (100). Otherwise, standard stack order. -->
          {@const zIndex = hoveredIndex === i ? 100 : puzzle.totalPathLength - i}

          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="relative flex items-center justify-center transition-transform duration-300"
            class:-mt-[3.25rem]={i > 0}
            class:md:mt-0={i > 0}
            class:md:-ml-[5.5rem]={i > 0 && !isEven}
            class:md:-ml-[1rem]={i > 0 && isEven}
            class:translate-x-[-25%]={isEven}
            class:translate-x-[25%]={!isEven}
            class:md:translate-x-0={true}
            style="z-index: {zIndex}; --tw-translate-y: {yOffsetPct}%;"
          >
            <!-- Note: using inline style for desktop Y-translate because it's dynamic. 
                 We need to override the mobile classes on desktop. 
                 Tailwind doesn't support dynamic values easily in classes without SafeList.
                 We use a media query strategy or just apply the transform logic in style with a CSS variable or direct transform.
            -->
            <!-- Wait, 'style' overrides classes. But we need mobile to use classes.
                 Let's use a wrapper or apply style conditionally?
                 Better: Use a CSS variable for the desktop offset and use it in a `md:translate-y-[var(--y)]` class?
                 Tailwind arbitrary values allow this: `md:translate-y-[--y-off]`.
            -->
            <div class="contents" style="--y-desk: {yOffsetPct}%;">
              <div
                class="contents transition-transform duration-300 md:block md:translate-y-[var(--y-desk)]"
              >
                <Hexagon
                  {node}
                  {status}
                  {hint}
                  isCurrent={node?.id === currentNodeId}
                  onClick={() => {
                    if (node) currentNodeId = node.id;
                  }}
                />
              </div>
            </div>

            <!-- Branch Visualization -->
            {#if branch}
              <!-- 
                 Mobile: Left/Right 
                 Desktop: Top/Bottom
              -->
              <div
                class="absolute top-1/2 z-20 -translate-y-1/2 transition-all duration-300 md:top-auto md:right-auto md:left-1/2 md:-translate-x-1/2 md:translate-y-0"
                class:right-full={isEven}
                class:pr-2={isEven}
                class:left-full={!isEven}
                class:pl-2={!isEven}
                class:md:bottom-full={isEven}
                class:md:pb-2={isEven}
                class:md:top-full={!isEven}
                class:md:pt-2={!isEven}
                class:md:pl-0={true}
                class:md:pr-0={true}
                in:fly={{ x: isEven ? 20 : -20, duration: 400 }}
              >
                <div class="group relative">
                  <!-- Connector -->
                  <svg
                    class="absolute top-1/2 h-2 w-6 -translate-y-1/2 overflow-visible text-amber-300 md:top-auto md:left-1/2 md:h-6 md:w-2 md:-translate-x-1/2 md:translate-y-0"
                    class:left-full={isEven}
                    class:right-full={!isEven}
                    class:md:top-full={!isEven}
                    class:md:bottom-full={isEven}
                    viewBox="0 0 24 4"
                  >
                    <!-- Mobile Line (Horizontal) -->
                    <line
                      class="md:hidden"
                      x1="0"
                      y1="2"
                      x2="24"
                      y2="2"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-dasharray="4 2"
                    />
                    <circle class="md:hidden" cx="24" cy="2" r="3" fill="currentColor" />

                    <!-- Desktop Line (Vertical) -->
                    <!-- We need to flip the vertical line for Top vs Bottom branch? -->
                    <!-- If Branch is Top (Even), line goes Down to hex. -->
                    <!-- If Branch is Bottom (Odd), line goes Up to hex. -->
                  </svg>

                  <!-- Separate Vertical Connector for Desktop -->
                  <svg
                    class="absolute left-1/2 hidden h-6 w-2 -translate-x-1/2 overflow-visible text-amber-300 md:block"
                    class:top-full={isEven}
                    class:bottom-full={!isEven}
                    viewBox="0 0 4 24"
                  >
                    <line
                      x1="2"
                      y1="0"
                      x2="2"
                      y2="24"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-dasharray="4 2"
                    />
                    <circle cx="2" cy="0" r="3" fill="currentColor" />
                  </svg>

                  <div class="origin-center scale-75 transition-transform hover:scale-90">
                    <Hexagon
                      node={branch.node}
                      status="branch"
                      isCurrent={branch.node.id === currentNodeId}
                      onClick={() => (currentNodeId = branch.node.id)}
                    />
                  </div>
                </div>
              </div>
            {/if}
          </div>
        {/each}
      </div>

      <!-- Detour Floating Indicator -->
      {#if !isCurrentNodeVisible && currentNodeData}
        <div
          class="fixed top-24 right-4 z-50 flex flex-col items-center"
          in:fly={{ x: 20, duration: 300 }}
          out:fade
        >
          <div
            class="flex flex-col items-center gap-2 rounded-2xl border border-amber-100 bg-white p-3 shadow-xl"
          >
            <span class="text-[9px] font-bold tracking-widest text-amber-500 uppercase"
              >Current</span
            >
            <div class="scale-75">
              <Hexagon node={currentNodeData} status="branch" isCurrent={true} />
            </div>
          </div>
        </div>
      {/if}
    {/if}

    <!-- Search & Messages -->
    <div class="relative z-10 mt-8 flex w-full max-w-md flex-col items-center gap-2 pb-8">
      {#if message}
        <div class="mb-4 text-center" in:slide={{ axis: "y" }}>
          <span
            class="inline-block rounded-full bg-slate-800/80 px-3 py-1 text-xs font-medium text-white shadow-lg backdrop-blur-md"
          >
            {message}
          </span>
        </div>
      {/if}

      <Search
        index={searchIndex}
        excludeIds={usedWordIds}
        onSelect={handleSelect}
        disabled={loading || isWon}
      />
    </div>
  </main>

  <footer class="mt-auto border-t border-slate-100 bg-slate-50 py-6 text-sm text-slate-400">
    <div class="container mx-auto max-w-lg px-4 text-center">
      <div class="flex items-center justify-center gap-3">
        <span>
          Made for fun by
          <a
            href="https://bsky.app/profile/philippeserhal.com"
            class="font-medium text-indigo-600 hover:underline">Philippe Serhal</a
          >
        </span>
        <a
          href="https://github.com/serhalp/hexymon"
          class="text-slate-400 transition-colors hover:text-indigo-600"
          aria-label="GitHub"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            ><path
              d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
            ></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg
          >
        </a>
      </div>
      <div class="mt-2 text-xs text-slate-500">
        Data courtesy of
        <a
          href="https://github.com/yuan-w-gao/etymolink"
          class="font-medium text-indigo-600 hover:underline">EtymoLink</a
        >
        (Gao &amp; Sun 2024,
        <a
          href="https://aclanthology.org/2024.lchange-1.12.pdf"
          class="font-medium text-indigo-600 hover:underline">DOI: 10.18653/v1/2024.lchange-1.12</a
        >)
      </div>
    </div>
  </footer>
</div>

<!-- Win Modal -->
{#if isWon}
  <div
    class="fixed inset-0 z-[60] flex items-center justify-center p-4"
    in:fade={{ duration: 200 }}
  >
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-indigo-900/40 backdrop-blur-sm"></div>

    <div
      class="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white p-8 text-center shadow-2xl"
      in:scale={{ start: 0.9, duration: 300, delay: 100 }}
    >
      <!-- Decor -->
      <div
        class="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-indigo-500 via-emerald-400 to-amber-400"
      ></div>

      <div class="mb-6 animate-bounce text-5xl">🏆</div>
      <h2 class="mb-1 font-serif text-3xl font-bold text-slate-900">Puzzle Solved!</h2>
      <p class="mb-8 text-sm text-slate-500">You connected the etymological dots.</p>

      <div class="mt-6 mb-4 flex flex-col gap-3">
        <div class="flex items-center justify-between rounded-xl bg-slate-50 p-3">
          <span class="text-sm font-medium text-slate-500">Total Guesses</span>
          <span class="font-mono text-lg font-bold text-slate-900">{totalGuesses}</span>
        </div>
        <div class="flex items-center justify-between rounded-xl bg-slate-50 p-3">
          <span class="text-sm font-medium text-slate-500">Mistakes</span>
          <span
            class="font-mono text-lg font-bold"
            class:text-rose-500={incorrectGuesses > 0}
            class:text-emerald-500={incorrectGuesses === 0}>{incorrectGuesses}</span
          >
        </div>
        <div
          class="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 p-3"
        >
          <span class="text-sm font-medium text-emerald-800">Optimal Path</span>
          <span class="font-mono text-lg font-bold text-emerald-600"
            >{minimumMoves}
            <span class="font-sans text-xs font-normal opacity-70">STEPS</span></span
          >
        </div>
      </div>

      <div class="flex gap-2">
        <button
          class="flex-1 rounded-xl bg-indigo-600 py-4 font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl active:translate-y-0 active:scale-95"
          onclick={shareResult}
        >
          {copied ? "Copied!" : "Share Result"}
        </button>
        <button
          class="flex-1 rounded-xl border-2 border-indigo-100 bg-white py-4 font-bold text-indigo-600 transition-colors hover:bg-indigo-50"
          onclick={() => window.location.reload()}
        >
          Play Again
        </button>
      </div>
      <div class="mt-3 rounded-xl border border-slate-100 bg-white/70 p-3 text-left">
        <div class="flex items-center justify-between text-[11px] font-semibold text-slate-500">
          <span>Share text</span>
          <span class="text-emerald-600">{copied ? "Copied" : "Preview"}</span>
        </div>
        <pre
          class="mt-1 max-h-24 overflow-auto font-mono text-[11px] break-words whitespace-pre-wrap text-slate-600">
{shareString}
        </pre>
      </div>
      <p class="mt-4 text-[10px] tracking-widest text-slate-400 uppercase">Hexymon Alpha</p>
    </div>
  </div>
{/if}

<style>
  :global(body) {
    font-family: "Work Sans", sans-serif;
  }
</style>
