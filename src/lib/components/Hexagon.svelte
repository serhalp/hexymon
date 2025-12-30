<script lang="ts">
  import type { Node } from "$lib/types";
  import { fade } from "svelte/transition";

  interface Props {
    node?: Node | null;
    status?: "locked" | "filled" | "empty" | "branch";
    hint?: { lang?: string; definition?: string; pos?: string; showPos?: boolean } | null;
    isCurrent?: boolean;
    onClick?: () => void;
  }

  let {
    node = null,
    status = "empty",
    hint = null,
    isCurrent = false,
    onClick = () => {},
  }: Props = $props();

  // Color Mapping
  const colors = {
    locked: { fill: "#e0e7ff", stroke: "#4338ca", text: "#312e81", label: "#6366f1" },
    filled: { fill: "#ecfdf5", stroke: "#059669", text: "#064e3b", label: "#10b981" },
    empty: { fill: "#ffffff", stroke: "#cbd5e1", text: "#94a3b8", label: "#cbd5e1" },
    branch: { fill: "#fffbeb", stroke: "#d97706", text: "#78350f", label: "#f59e0b" },
  };

  let theme = $derived(colors[status]);

  // Dynamic font size for long words
  let wordLength = $derived(node?.word?.length || 0);
  let fontSizeClass = $derived(
    wordLength > 12 ? "text-[10px]" : wordLength > 8 ? "text-xs" : "text-sm", // Base size, actually visually scaled by transforms/SVG context usually
  );

  // Actually, the original was text-lg. Let's adjust relative to that.
  let dynamicTextClass = $derived(
    wordLength > 14
      ? "text-xs leading-none"
      : wordLength > 10
        ? "text-sm leading-tight"
        : "text-lg leading-tight",
  );

  // Tooltip state
  let showTooltip = $state(false);
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="group relative flex h-52 w-44 items-center justify-center transition-all duration-300 outline-none"
  class:cursor-pointer={!!node && !!onClick}
  class:cursor-help={!!node && !onClick}
  class:cursor-default={!node && !onClick}
  class:scale-110={isCurrent}
  onclick={node ? onClick : undefined}
  onmouseenter={() => (showTooltip = true)}
  onmouseleave={() => (showTooltip = false)}
  role="button"
  tabindex={node ? 0 : -1}
>
  <!-- Hexagon SVG -->
  <!-- Adjusted viewBox to prevent clipping of the stroke at the top (M50 0) -->
  <!-- Path coordinates: X [6.7, 93.3], Y [0, 100]. Width ~86.6, Height 100. -->
  <!-- We add padding: -2 -2 104 104 to accommodate ~3px stroke center -->
  <svg
    viewBox="-2 -2 104 104"
    class="absolute inset-0 h-full w-full drop-shadow-sm transition-all duration-300"
    class:drop-shadow-md={isCurrent}
    style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.1));"
  >
    <path
      d="M50 0 L93.3 25 L93.3 75 L50 100 L6.7 75 L6.7 25 Z"
      fill={theme.fill}
      stroke={theme.stroke}
      stroke-width={isCurrent ? 3 : 1.5}
      stroke-linejoin="round"
      class="transition-colors duration-300"
    />

    {#if status === "empty"}
      <!-- Dashed inner border for empty state -->
      <path
        d="M50 8 L86.3 29 L86.3 71 L50 92 L13.7 71 L13.7 29 Z"
        fill="none"
        stroke={theme.stroke}
        stroke-width="1"
        stroke-dasharray="4 2"
        class="opacity-50"
      />
    {/if}
  </svg>

  <!-- Content -->
  <div class="z-10 flex max-w-[85%] flex-col items-center justify-center p-2 text-center">
    {#if node}
      <span
        class="font-serif font-bold tracking-tight transition-colors duration-300 {dynamicTextClass} w-full break-words"
        style="color: {theme.text}"
      >
        {node.word}
      </span>
      <span
        class="mt-0.5 font-sans text-[10px] font-medium tracking-widest uppercase opacity-80"
        style="color: {theme.stroke}"
      >
        {node.lang}
      </span>
    {:else if hint}
      <div class="flex flex-col items-center gap-1">
        {#if hint.lang}
          <span
            class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase"
          >
            {hint.lang}
          </span>
        {/if}
        {#if hint.showPos && hint.pos}
          <div class="flex animate-pulse items-center gap-1 text-indigo-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="h-3 w-3"
            >
              <path
                d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"
              />
            </svg>
            <span class="text-[10px] font-bold tracking-widest uppercase">{hint.pos}</span>
          </div>
        {/if}
        <!-- Question Mark Icon (only if no specific hint active, or just always as bg?) -->
        {#if !hint.showPos}
          <span class="font-serif text-2xl text-slate-300 italic opacity-50">?</span>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Tooltip -->
  {#if node && showTooltip}
    <div
      class="pointer-events-none absolute bottom-full z-[100] mb-2 flex w-48 flex-col items-start gap-1 rounded-xl border border-slate-700/50 bg-slate-900/95 px-4 py-3 text-left text-xs text-white shadow-xl backdrop-blur-sm"
      in:fade={{ duration: 150 }}
      out:fade={{ duration: 100 }}
    >
      <div
        class="mb-1 flex w-full items-baseline justify-between border-b border-slate-700/50 pb-2 font-bold"
      >
        <span class="text-[10px] tracking-wider text-indigo-300 uppercase">{node.lang}</span>
        {#if node.pos}<span
            class="rounded border border-slate-700 px-1 text-[9px] font-normal text-slate-400 uppercase"
            >{node.pos}</span
          >{/if}
      </div>
      <p class="font-serif text-sm leading-relaxed italic opacity-90">{node.definition}</p>
      <!-- Triangle pointer -->
      <div
        class="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900/95"
      ></div>
    </div>
  {/if}
</div>
