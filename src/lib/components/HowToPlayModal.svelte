<script lang="ts">
  import { fade, scale } from "svelte/transition";

  interface Props {
    isOpen: boolean;
    onClose: () => void;
  }

  let { isOpen, onClose }: Props = $props();
</script>

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
          class="cursor-pointer rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close"
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
            ><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"
            ></line></svg
          >
        </button>
      </div>

      <div
        class="max-h-[60vh] space-y-4 overflow-y-auto p-6 text-sm leading-relaxed text-slate-600"
      >
        <p>
          Welcome to <strong class="text-indigo-900">Hexymon</strong>, the daily etymology puzzle.
          Your goal is to connect the <span class="font-bold text-indigo-600">Start Word</span>
          (top) to the <span class="font-bold text-indigo-600">Target Word</span> (bottom) by finding
          their linguistic links.
        </p>

        <div class="space-y-3">
          <h3 class="font-bold text-slate-900">Valid Connections</h3>
          <ul class="ml-4 list-outside list-disc space-y-1">
            <li>
              <strong>Ancestry:</strong> Connect a word to its root (e.g., <em>Mother</em> →
              <em>*méh₂tēr</em>).
            </li>
            <li>
              <strong>Descent:</strong> Connect a root to its descendant (e.g., <em>*méh₂tēr</em> →
              <em>Mater</em>).
            </li>
            <li><strong>Borrowing:</strong> Loanwords between languages.</li>
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
              <strong>Follow the Hints:</strong> If multiple paths exist, the
              <strong>Language</strong> label on the empty tile tells you which one is correct!
            </li>
            <li>
              <strong>Detours:</strong> Valid words <em>not</em> on the target path appear as branches.
            </li>
            <li>
              <strong>Mistakes:</strong> You have
              <span class="font-bold text-rose-500">6 lives</span>. Incorrect guesses cost a life
              but reveal a <strong>Part of Speech</strong> hint for a hidden word!
            </li>
          </ul>
        </div>
      </div>

      <div class="flex items-start gap-3 bg-indigo-50 px-6 py-4">
        <div class="mt-0.5 text-indigo-500">
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
            ><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"
            ></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg
          >
        </div>
        <p class="text-xs text-indigo-800">
          <strong>Tip:</strong> Look at the language hints (e.g., "Latin", "Old English") on the empty
          tiles to guide your guesses.
        </p>
      </div>
    </div>
  </div>
{/if}
