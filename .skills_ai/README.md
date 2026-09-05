# `.skills_ai` — Central Skill Catalog

This folder is the single project-facing entry point for local AI skills.
The actual skill implementations stay in their native vendor folders so the
corresponding tools keep working:

| Source | Scope | Count |
|---|---|---:|
| `.agents/skills` | Canonical project skill library | 108 |
| `.github/skills` | GitHub/Copilot adapters | 8 |
| `.opencode/skills` | OpenCode adapters | 15 |

Use `manifest.json` to discover available skills without scanning every hidden
tool folder. Do not duplicate or move vendor implementations: those folders
are runtime adapters, while this catalog is the stable maintenance seam.

The website itself does not load these skills at runtime.
