<script lang="ts">
  import { fade, scale } from "svelte/transition";
  import { MAX_MISTAKES } from "$lib/config";
  import Hexagon from "$lib/components/Hexagon.svelte";
  import type { Node } from "$lib/types";

  interface Props {
    isOpen: boolean;
    onClose: () => void;
  }

  let { isOpen, onClose }: Props = $props();

  // Static puzzle example for modal: Fish to Piscine (4 nodes, conceptual, not validated against graph)
  const examplePath: Node[] = [
    {
      id: "fish_E",
      word: "Fish",
      lang: "English",
      definition: "An aquatic vertebrate animal with gills.",
      pos: "Noun",
    },
    {
      id: "fisc_OE",
      word: "Fisc",
      lang: "Old English",
      definition: "An aquatic animal.",
      pos: "Noun",
    },
    {
      id: "piscis_L",
      word: "Piscis",
      lang: "Latin",
      definition: "A fish.",
      pos: "Noun",
    },
    {
      id: "piscine_E",
      word: "Piscine",
      lang: "English",
      definition: "Relating to fish; a fish-pond.",
      pos: "Adjective",
    },
  ];
</script>

<svelte:window
  on:keydown={(e) => {
    if (isOpen && e.key === "Escape") onClose();
  }}
/>

{#if isOpen}
  <div
    class="fixed inset-0 z-[100] flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
  >
    <!-- Backdrop -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
      in:fade={{ duration: 200 }}
      out:fade={{ duration: 150 }}
      onclick={onClose}
    ></div>

    <!-- Modal Content -->
    <div
      class="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
      in:scale={{ start: 0.95, duration: 200 }}
      out:scale={{ start: 0.95, duration: 150 }}
    >
      <div
        class="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4"
      >
        <h2 class="font-serif text-xl font-bold text-slate-900">How to Play</h2>
        <button
          onclick={onClose}
          class="cursor-pointer rounded-full px-2 py-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close"
        >
          <span class="text-xl leading-none font-semibold" aria-hidden="true">&times;</span>
        </button>
      </div>

      <div
        class="max-h-[60vh] space-y-4 overflow-y-auto p-6 text-sm leading-relaxed text-slate-600"
      >
        <p>
          Welcome to <strong class="text-indigo-900">Hexymon</strong>, the daily etymology puzzle.
          Your goal is to connect the <span class="font-bold text-indigo-600">Start Word</span>
          (top) to the <span class="font-bold text-indigo-600">Target Word</span> (bottom) by
          finding their linguistic links. For instance, connecting
          <span class="font-bold">"Fish"</span>
          to <span class="font-bold">"Piscine"</span>.
        </p>

        <div class="flex flex-col items-center rounded-lg border border-slate-100 bg-slate-50 py-4">
          <h4 class="mb-4 text-center font-bold text-slate-800">Example Puzzle: Fish to Piscine</h4>
          {#each examplePath as node, i}
            <div
              class="relative flex items-center justify-center transition-transform duration-300"
              class:-mt-[3.25rem]={i > 0}
              class:translate-x-[-25%]={i % 2 === 0}
              class:translate-x-[25%]={i % 2 !== 0}
              style="z-index: {examplePath.length - i};"
            >
              <Hexagon
                {node}
                status={i === 0 || i === examplePath.length - 1 ? "locked" : "filled"}
                isCurrent={false}
                onClick={() => {}}
              />
            </div>
          {/each}
        </div>

        <div class="space-y-3">
          <h3 class="font-bold text-slate-900">Valid Connections</h3>
          <ul class="ml-4 list-outside list-disc space-y-1">
            <li>
              <strong>Ancestry:</strong> Moving from a descendant to an ancestor (e.g., from
              <em>"Fish"</em> to <em>"Fisc"</em> (Old English)).
            </li>
            <li>
              <strong>Descent:</strong> Moving from an ancestor to a descendant (e.g., from
              <em>"Piscis"</em> (Latin) to <em>"Piscine"</em>).
            </li>
            <li><strong>Borrowing:</strong> Moving between languages via loanwords.</li>
            <li><strong>Cognates:</strong> Words sharing the same immediate parent.</li>
          </ul>
        </div>

        <div class="space-y-3">
          <h3 class="font-bold text-slate-900">The Rules</h3>
          <ul class="ml-4 list-outside list-disc space-y-1">
            <li>Type any word to guess. If it's valid, it will appear on the board.</li>
            <li>
              <strong>The Perfect Path:</strong> Words belonging to the specific daily puzzle path snap
              into the chain.
            </li>
            <li>
              <strong>Follow the Hints:</strong> The empty tiles between "Fish" and "Piscine" will show
              language hints like "Old English" or "Latin". These hints are crucial as they define the
              exact path to take if multiple linguistic connections exist.
            </li>
            <li>
              <strong>Detours:</strong> Valid words <em>not</em> on the target path appear as branches.
            </li>
            <li>
              <strong>Mistakes:</strong> You have
              <span class="font-bold text-rose-500">{MAX_MISTAKES} lives</span>. Incorrect guesses
              cost a life but reveal a <strong>Part of Speech</strong> hint for a hidden word!
            </li>
          </ul>
        </div>
      </div>

      <div class="flex items-start gap-3 bg-indigo-50 px-6 py-4">
        <div class="mt-0.5 text-indigo-500">
          <span
            class="inline-flex h-6 w-6 items-center justify-center rounded-full border border-current text-xs font-bold"
            aria-hidden="true">?</span
          >
        </div>
        <p class="text-xs text-indigo-800">
          <strong>Tip:</strong> Pay close attention to both the word and the language on the empty tiles.
        </p>
      </div>
    </div>
  </div>
{/if}
