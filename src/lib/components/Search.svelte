<script lang="ts">
  import type { SearchIndexItem } from "$lib/types";
  import { fade, slide } from "svelte/transition";

  interface Props {
    index: SearchIndexItem[];
    excludeIds?: string[];
    onSelect: (item: SearchIndexItem) => void;
    disabled?: boolean;
  }

  let { index, excludeIds = [], onSelect, disabled = false }: Props = $props();

  let query = $state("");
  let isOpen = $state(false);
  let inputElement: HTMLInputElement;

  function normalizeText(text: string): string {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  // Filter logic
  let results = $derived(
    query.length < 2
      ? []
      : index
          .filter((item) => !excludeIds.includes(item.id))
          .filter((item) => item.searchText.includes(normalizeText(query)))
          .slice(0, 8),
  );

  function handleSelect(item: SearchIndexItem) {
    onSelect(item);
    query = "";
    isOpen = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      isOpen = false;
      inputElement?.blur();
    }
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    // If exact match or top result exists, select it
    if (results.length > 0) {
      handleSelect(results[0]);
    }
  }
</script>

<div class="relative mx-auto w-full max-w-md" role="search">
  <!-- Results Dropdown -->
  {#if isOpen && results.length > 0}
    <ul
      class="absolute bottom-full mb-3 max-h-[60vh] w-full overflow-hidden overflow-y-auto rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
      transition:slide={{ duration: 200, axis: "y" }}
    >
      <li
        class="border-b border-slate-100 bg-slate-50 px-4 py-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase"
      >
        Suggestions
      </li>
      {#each results as item}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
        <li
          class="group cursor-pointer border-b border-slate-50 px-5 py-3 transition-colors last:border-0 hover:bg-indigo-50 hover:text-indigo-900"
          onclick={() => handleSelect(item)}
          role="button"
          tabindex="0"
        >
          <div class="flex items-baseline justify-between">
            <span class="font-serif text-lg font-medium text-slate-800 group-hover:text-indigo-900"
              >{item.label}</span
            >
            <span
              class="text-[10px] font-bold tracking-wider text-slate-400 uppercase group-hover:text-indigo-400"
              >{item.lang}</span
            >
          </div>
          {#if item.definition}
            <div class="mt-0.5 line-clamp-1 text-xs text-slate-500 italic">{item.definition}</div>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}

  <!-- Search Input -->
  <form class="group relative" onsubmit={handleSubmit}>
    <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
      <svg
        class="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-indigo-500"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
          clip-rule="evenodd"
        />
      </svg>
    </div>
    <input
      bind:this={inputElement}
      type="text"
      bind:value={query}
      onfocus={() => (isOpen = true)}
      onkeydown={handleKeydown}
      placeholder={disabled ? "Solved!" : "Search for a word..."}
      {disabled}
      class="block w-full rounded-full border-0 bg-white py-4 pr-12 pl-11 font-sans text-lg text-slate-900 shadow-xl ring-1 ring-slate-200 transition-all duration-300 placeholder:text-slate-400 focus:shadow-2xl focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400"
    />

    <div class="absolute inset-y-0 right-0 flex items-center pr-2">
      {#if query.length > 0}
        <button
          type="button"
          class="flex cursor-pointer items-center p-2 text-slate-400 hover:text-slate-600"
          onclick={() => {
            query = "";
            inputElement.focus();
          }}
          aria-label="Clear search"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="h-5 w-5"
          >
            <path
              d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
            />
          </svg>
        </button>
      {/if}

      <!-- Submit Button (Hidden on desktop if Enter works, but good for mobile) -->
      <button
        type="submit"
        class="flex cursor-pointer items-center rounded-full bg-indigo-600 p-2 text-white shadow-md transition-all hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled || query.length < 2}
        aria-label="Submit Guess"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          class="h-5 w-5"
        >
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>
  </form>
</div>
