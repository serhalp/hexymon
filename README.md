# Hexymon

Six degrees of etymological separation.

Hexymon is a daily linguistic puzzle game where players connect a start word to a target word by traversing an etymological graph. The gameplay mechanic resembles a word ladder, but operates on valid linguistic relationships (ancestry, descent, borrowing) rather than spelling changes.

![Hexymon Gameplay Screenshot](https://placehold.co/800x450/e0e7ff/312e81?text=Hexymon+Gameplay)

## Data and Attribution

- Core etymology data comes from **EtymoLink: A Structured English Etymology Dataset** (Gao & Sun, 2024), ACL 2024. DOI: 10.18653/v1/2024.lchange-1.12.
- Dataset repository: https://github.com/yuan-w-gao/etymolink
- If you use this data, please cite the paper (see above DOI).

## Gameplay

The objective is to connect the Start Word (top) to the Target Word (bottom).

- **Input**: Players use a search input to find and select words.
- **Pathing**:
  - **The Perfect Path**: Words belonging to the specific daily puzzle path snap into the main hexagonal chain.
  - **Constraints**: The **Language** label on empty slots acts as a constraint. If multiple valid paths exist, these hints define which one is the "correct" solution.
  - **Branching**: Valid words that are related but not on the target path appear as branches (detours).
- **Hints**: Empty nodes display the language of the target word.
- **Constraints**: Players have 6 "lives". An incorrect guess consumes a life but reveals a Part of Speech hint for one of the unrevealed nodes on the optimal path.

## Contributing

This project uses [SvelteKit](https://svelte.dev/docs/kit/introduction) and is deployed to [Netlify](https://www.netlify.com/).

For documentation on the architecture, local development setup, and code standards, please refer to [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT

## Funding

I made this for fun. If you like it, please consider donating to a local food bank.
