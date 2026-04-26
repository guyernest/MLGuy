@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- **Next.js 16.2.4** (App Router) with **React 19.2** and **TypeScript 5** in strict mode.
- **Tailwind CSS v4** via the `@tailwindcss/postcss` plugin — theme tokens are declared in `src/app/globals.css` under `@theme { ... }`, **not** in a `tailwind.config.*` file. Add new design tokens (colors, fonts) there.
- **ESLint 9** flat config (`eslint.config.mjs`) extending `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.
- Path alias `@/*` → `./src/*` (defined in `tsconfig.json`).

`AGENTS.md` warns that this Next.js version has breaking changes vs. older training data — consult `node_modules/next/dist/docs/` before touching framework APIs.

## Commands

The `justfile` is the canonical task runner; npm scripts back it.

| Task | Command |
| --- | --- |
| Dev server | `just dev` (or `npm run dev`) |
| Production build | `just build` (or `npm run build`) |
| Lint | `just lint` (or `npm run lint`) |
| Deploy | `just deploy "commit message"` — stages everything, commits, and pushes to `main` (triggers AWS Amplify). Use deliberately. |

There is no test runner configured.

## Architecture

This is a marketing site for **MLGuy** (MCP / AI-integration product) plus an interactive **MCP Sandbox**.

### Routes (`src/app/`)
- `layout.tsx` — root layout, loads the Outfit Google font, wraps content in `<Header>` / `<Footer>`, applies the global dark theme.
- `page.tsx` — landing page composing `Hero`, `StackSection`, `AppsSection`, `TrustBanner`, `BlogSection` over a `StarfieldBackground`. All marketing sections live in `src/components/` as server components.
- `sandbox/page.tsx` — **client component** (`"use client"`); the only stateful page. It loads a Rust-compiled MCP client from WASM and lets users connect to live MCP servers, list tools/resources/prompts, execute them, and run a static-analysis pentest. This is where most app logic lives.

### WASM client (`src/lib/wasm/` + `public/wasm/`)
- `src/lib/wasm/mcp_management_wasm_client.{js,d.ts}` — the `wasm-bindgen` JS glue and types for `WasmClient`.
- `public/wasm/mcp_management_wasm_client_bg.wasm` — the binary, loaded at runtime via `init("/wasm/mcp_management_wasm_client_bg.wasm")` from `useEffect` in the sandbox.
- The client exposes `connect`, `list_tools`, `list_resources`, `list_prompts`, `call_tool`, `read_resource`, `get_prompt`, and `pentest_tools`.
- **Critical detail:** the build uses `serde-wasm-bindgen`, which serializes Rust maps as JS `Map` instances (not plain objects). `sandbox/page.tsx` defines `normalizeWasmValue` to recursively convert `Map`/`Set` into plain objects/arrays — wrap **every** value returned from the WASM client with it before reading properties or rendering.
- The active client is stashed on `window.__globalWasmClient` so it can be `.free()`'d on reconnect/HMR; preserve this when refactoring.
- Tool argument coercion (`isNumericSchemaType`, `isIntegerSchemaType`, `isBooleanSchemaType`) accepts both JSON Schema types and Rust-style aliases (`u32`, `i64`, `bool`, etc.) — keep those lists in sync if the WASM client surface changes.

### Styling conventions
- Theme uses an "LCARS"-inspired palette: `--color-lcars-orange`, `--color-lcars-blue`, `--color-lcars-purple`, `--color-lcars-red`, `--color-lcars-pale-orange`. Use the corresponding Tailwind utilities (e.g. `bg-lcars-blue`, `text-lcars-orange`) rather than raw hex.
- `.glass-card` (defined in `globals.css`) is the standard panel: translucent white with backdrop-blur and rounded corners. Reuse it for new surfaces.
- Background is near-black (`#030303`) with a radial blue glow applied to `body`; design new sections to sit on top of that, not against pure white.

### Icons & motion
- Icons come from `lucide-react` (preferred) and `react-icons` (legacy). Pick `lucide-react` for new code.
- Animations use `framer-motion` — already a dependency, no extra setup needed.

## Conventions

- Default to **server components**. Add `"use client"` only when you need state, effects, or browser APIs (the sandbox page is the canonical example).
- Import internal modules via the `@/` alias (e.g. `@/components/Hero`), not relative paths.
- Deployment is via `just deploy` → push to `main` → AWS Amplify. There is no staging branch; treat `main` as production.
