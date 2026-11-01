# Brainstorm

A fast, minimal brainstorming board: an infinite canvas where you drop sticky-note idea cards, type into them, move them around and organise them visually. Version 1 is single-user and stores everything in the browser.

## Run it

You need Node.js 20 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

Other scripts:

| Command             | What it does                                  |
| ------------------- | --------------------------------------------- |
| `npm run build`     | Type-check and build for production (`dist/`) |
| `npm run preview`   | Serve the production build locally            |
| `npm run typecheck` | Type-check only                               |

## Using the board

| Action                     | How                                                        |
| -------------------------- | ---------------------------------------------------------- |
| New card                   | Double-click the canvas, click **Add card**, or press `N`  |
| Edit a card                | Double-click it (or select it and press `Enter`)           |
| Stop editing               | Click outside or press `Esc`                               |
| Move / resize              | Drag the card / drag its bottom-right corner               |
| Select several             | `Shift`+click, or `Shift`+drag a box on empty canvas       |
| Select all                 | `Ctrl/⌘ A`                                                 |
| Colour, duplicate, delete  | Floating toolbar above the selection                       |
| Duplicate / delete         | `Ctrl/⌘ D` / `Delete` or `Backspace`                       |
| Undo / redo                | `Ctrl/⌘ Z` / `Ctrl/⌘ Shift Z`                              |
| Pan                        | Drag empty canvas, hold `Space` and drag, or scroll        |
| Zoom                       | `Ctrl/⌘` + scroll, or pinch                                |
| Fit all cards              | `Shift 1`                                                  |
| All shortcuts              | `?`                                                        |

On touch devices: one finger pans, pinch zooms, tap selects, double-tap edits (or creates a card on empty canvas).

The board autosaves to `localStorage` half a second after each change. Reloading restores every card plus the camera position and zoom. Use the toolbar to export the board as JSON or import a previously exported file.

## Tech stack

React 19 · TypeScript · Vite · [React Flow](https://reactflow.dev) (`@xyflow/react`) for the canvas · Zustand for state · Tailwind CSS v4 · lucide-react icons.

## How the code is organised

```
src/
  model/            Pure data model — no React, no React Flow
    types.ts          Board, Card, Viewport
    colors.ts         Sticky-note palette (cards store a colour id)
    factory.ts        createCard / createBoard, size defaults and minimums
  store/
    boardStore.ts     THE store: every card/board action lives here
    history.ts        Undo/redo (snapshot based, gesture grouping)
    uiStore.ts        Dialog state
  storage/
    index.ts          `storage` — the one object the app loads/saves through
    types.ts          BoardStorage interface (async)
    localStorageAdapter.ts
    serialize.ts      Validation + JSON import/export (parseBoard)
    saveStatus.ts     Saved / Saving / error state for the indicator
  canvas/
    Canvas.tsx        React Flow setup and canvas-level gestures
    adapters.ts       Card ⇄ React Flow node conversion
    CardNode.tsx      The sticky note (text editing, resize grip)
    SelectionToolbar.tsx  Colours / duplicate / delete above the selection
    useCreateCard.ts  Placing new cards (cursor, centre, click point)
    useBoardCommands.ts   Fit view, export, import
    pointer.ts        Pointer tracking and touch double-tap detection
  hooks/
    useKeyboardShortcuts.ts
    useAutosave.ts
  ui/                 Toolbar, zoom controls, minimap toggle, dialogs, etc.
```

### Data flow

```
 user input ──▶ React Flow events / shortcuts / toolbar
                    │
                    ▼
            boardStore actions  ──▶  history (undo)
                    │          └──▶  autosave ──▶ storage adapter
                    ▼
            cards (source of truth)
                    │
                    ▼
       adapters.ts → React Flow nodes → render
```

- **The store is the source of truth.** React Flow only renders it. Its change events (drag, resize, select) are translated back into store actions in `canvas/adapters.ts`. Cards never live in React Flow's format outside that file.
- **One write path.** Every document change goes through a single internal `commitDoc` in `boardStore.ts`. Undo history hooks in there today. Live sync can hook in at the same place later.
- **Actions are callable outside React:** `useBoardStore.getState().createCard({ x, y, text: 'Idea' })`.

### Undo/redo

Snapshots hold references to the immutable `cards` map, so recording a step costs the same no matter how big the board is. Drags, resizes and text edits are wrapped in a *gesture* and become one undo step each. A gesture that changes nothing (a plain click) records nothing. Up to 100 steps are kept. The camera is not part of history.

### Performance

The board is built to stay smooth with hundreds of cards:

- **Cached nodes.** Cards are converted to React Flow nodes with a cache, so unchanged cards keep the same node object and React Flow skips them.
- **Position changes skip re-renders.** `CardNode` re-renders only when something it displays changes, not when it moves.
- **Resize grips only where needed.** A grip is mounted only on the hovered card or the single selected card.
- **Only visible cards render.** Off-screen cards aren't drawn, and dragged cards get their own compositor layer.

Measured with 300 cards all on screen, on the production build in headless Chromium with software rendering:
- panning and zooming hold 60 fps
- dragging one card runs at 45–60 fps
- dragging all 300 at once runs at about 43 fps
- select all takes about 150 ms

A real browser with GPU compositing does better.

## Extending it

The code leaves room for these without a rewrite:

| Future feature          | Where it plugs in |
| ----------------------- | ----------------- |
| Database / accounts     | Write a `BoardStorage` adapter (e.g. REST or Supabase) and swap it in `storage/index.ts`. The interface is already async and id-based. |
| Multiple boards         | `storage.load(id)` and per-board keys already exist; add a board list and route by id. |
| Live multiplayer        | Mirror `commitDoc` changes to a CRDT (e.g. Yjs) or a sync service, and apply remote changes through the same store actions. Keep `selectedIds`/`editingId` as local session state. |
| AI: generate ideas      | Call `createCard` for each idea. Undo and autosave come for free. |
| AI: cluster / score     | Read `selectCardList`, then `updateCards({ id: { x, y } })` in one call (one undo step), or add fields to `Card` (bump `version` and migrate in `parseBoard`). |
| Grouping, arrows, tags, votes | Add the data to `Board`/`Card`, render arrows as React Flow edges via an adapter like `adapters.ts`, and add store actions next to the existing ones. |

When changing the saved format, bump `Board.version` and add a migration in `storage/serialize.ts`. Imports and saved boards both pass through `parseBoard`.

## Known limitations (v1)

- Single user. If the same board is open in two tabs, the last tab to save wins.
- `localStorage` holds roughly 5 MB, which is several thousand cards. A "storage full" message appears if it runs out.
- Multi-select on touch devices is limited to *Select all* (there is no Shift key).
