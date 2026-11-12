# Keepers photography

Local client assets wired through `src/data/images.ts`.

| Folder | Used for |
|---|---|
| `heroes/` | Splash, login, home/about hero frames |
| `trips/` | Trip covers + galleries |
| `events/` | Event cards |
| `gallery/` | In-app gallery |
| `vehicles/` | Profile / member vehicle |
| `placeholders/` | Demo user avatar |

## Curation rules (client feedback)

1. **Splash** (`heroes/splash.jpg`) — lasers night Jeep opening. Keep it. Splash hold is ~3.2s in `SplashScreen`.
2. Prefer **client-data** group / activity / Keepers brand shots across the app.
3. **Personal Jeep** is limited (splash + profile vehicle + one trip/gallery set) — not on every card.
4. Gaps only: clean stock via Unsplash (no rival club flags).

Refresh mapping:

```sh
python scripts/_curate_client_photos.py
```

Source pack: `assets/client-data/`.
