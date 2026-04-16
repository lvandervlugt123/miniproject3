# PokéTeam Builder

Small project that uses the PokeAPI to build a 4‑Pokémon team (Kanto starter + 3 others).

Features:
- Fetches Kanto Pokémon via `fetch()`
- Search/filter by name
- Choose a Kanto starter (Bulbasaur/Charmander/Squirtle)
- Add up to 3 other Pokémon to make a 4-member team
- Save/load team in `localStorage`
- Detail view modal for each Pokémon

How to run locally:

Open `index.html` in your browser (no build step necessary). Works well when served from GitHub Pages.

Deployment (GitHub Pages):

1. Push this repository to GitHub.
2. In your repo Settings → Pages, select the `main` branch and `/ (root)` as the source.
3. Save; the site will publish at `https://<your-user>.github.io/<repo>/` within a minute.

Notes:
- The app uses PokeAPI (no API key required).
- Saved teams are stored in `localStorage` under `poketeams`.
