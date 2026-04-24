# Playbook & Execution Center — Developer Guide

## Architecture Overview

The Playbook module follows the same patterns as other domains in this codebase:

```
src/
  domains/playbook/
    playbook.types.ts       — All TypeScript types, interfaces, and constants
    playbook.runtime.ts     — CRUD functions + React hook (usePlaybookRuntime)
    index.ts                — Re-exports everything

  app/pages/playbook/
    playbook.ui.tsx         — Shared badge/status components and date formatters
    PlaybookDashboardPage.tsx
    PlaybooksListPage.tsx
    ProjectsListPage.tsx
    NotesListPage.tsx
    MeetingsListPage.tsx
    DecisionsListPage.tsx
    ActionItemsListPage.tsx
    TimelinePage.tsx
    FilesLibraryPage.tsx

  app/router/routes.ts     — Route definitions (group: 'playbook')
  app/AppShell.tsx         — Route component registry
  components/shell/AppSidebar.tsx — Nav entry ('Playbook', group: 'playbook')
  domains/roles/roles.ts   — NavGroup type + ROLE_NAV_GROUPS includes 'playbook'

migrations/
  0023_create_playbook_execution_center.sql  — Supabase schema
```

---

## Runtime Pattern

The `usePlaybookRuntime()` hook provides all CRUD operations. It tracks a `version` counter that increments when data changes, allowing `useMemo` calls to re-compute:

```tsx
const rt = usePlaybookRuntime()

// Read data (re-runs when rt.version changes)
const playbooks = useMemo(() => rt.listPlaybooks(), [rt.version])

// Write
rt.createPlaybook({ title: 'My Playbook', category: 'sales' })
rt.updatePlaybook(id, { status: 'archived' })
rt.deletePlaybook(id)
```

The runtime dispatches a `CustomEvent('outcome.playbook.updated')` after every write, and also listens for `storage` events so cross-tab updates work.

---

## Adding a New Entity Type

To add a new top-level entity (e.g., "Retrospectives"):

1. **Add types** to `playbook.types.ts`:
   ```ts
   export interface Retrospective { id: string; ... }
   export interface CreateRetrospectiveInput { ... }
   ```

2. **Add CRUD functions** to `playbook.runtime.ts`:
   ```ts
   const RETRO_KEY = 'outcome.playbook.retrospectives'
   export function listRetrospectives() { ... }
   export function createRetrospective(input, actor) { ... }
   // etc.
   ```

3. **Expose via hook** — add to the return value of `usePlaybookRuntime()`.

4. **Create the page** in `src/app/pages/playbook/RetrospectivesListPage.tsx`.

5. **Add route** in `routes.ts`:
   ```ts
   { path: '/app/playbook/retrospectives', label: 'Retrospectives', component: 'RetrospectivesListPage', group: 'playbook' },
   ```

6. **Register in AppShell.tsx**:
   ```ts
   '/app/playbook/retrospectives': RetrospectivesListPage,
   ```

7. **Add nav item** in `AppSidebar.tsx` with `group: 'playbook'`.

8. **Add SQL table** to the migration file or create a new migration.

---

## Adding Supabase Persistence

The current runtime uses localStorage only. To add Supabase persistence (matching the pattern in `operatingReview.runtime.ts`):

1. Import `getSupabaseBrowserClient` and `isSupabaseConfigured` from `@/lib/supabase/client`
2. In each CRUD function, check `isSupabaseConfigured()` before the localStorage fallback
3. Map to/from database column names (snake_case ↔ camelCase)

Example pattern:
```ts
export async function listPlaybooks(): Promise<Playbook[]> {
  const client = getSupabaseBrowserClient()
  if (client && isSupabaseConfigured()) {
    const { data, error } = await client.from('playbooks').select('*').order('updated_at', { ascending: false })
    if (!error && Array.isArray(data)) return data.map(mapSupabaseRow)
  }
  return readLocal<Playbook>(KEYS.playbooks)
}
```

---

## Adding AI Features

The module is designed to support AI features via the existing assistant infrastructure. To add AI summarization:

1. Use the AI/assistant service already in `src/domains/assistant/` if available
2. Add an "AI Summarize" button to any entry card
3. Call the assistant with the entry body as context
4. Display the response as a `summary` field update

Example integration point: `NotesListPage.tsx` entry card expanded view — add a button that posts to the assistant and updates `entry.summary`.

---

## Collaboration / Permissions

The current `collaborators` field on both `Playbook` and `Project` is a typed array:
```ts
interface PlaybookCollaborator {
  userId: string
  displayName: string
  role: 'owner' | 'editor' | 'contributor' | 'viewer'
}
```

This field is stored but not yet enforced in the UI. To enforce roles:

1. Get the current user from `useAuth()` 
2. Look up their `CollaboratorRole` on the playbook
3. Conditionally render edit/delete controls based on role
4. Add an "Invite" dialog to `PlaybooksListPage.tsx` that pushes to `collaborators[]`

---

## Timeline Events

Every write operation in `playbook.runtime.ts` calls `appendTimeline()` internally. The timeline is capped at 500 events in localStorage. In Supabase mode, the `playbook_timeline_events` table has no cap.

To add a new event type:

1. Add it to `TimelineEventType` in `playbook.types.ts`
2. Add an icon mapping in `TimelinePage.tsx`
3. Add a label template in the `eventLabel()` function
4. Call `appendTimeline({ eventType: 'your_new_type', ... })` in the runtime

---

## File Attachments

Attachments are stored as a JSON array in `entry.attachments`. The `EntryAttachment` type:
```ts
interface EntryAttachment {
  id: string
  name: string
  url: string          // Public URL after upload
  mimeType?: string
  sizeBytes?: number
  uploadedAt: string
}
```

To implement actual file upload:
1. Integrate Supabase Storage or another provider
2. Add an upload button to the expanded entry view in `NotesListPage.tsx`
3. On upload success, call `rt.updateEntry(id, { attachments: [...existing, newAtt] })`
4. The file will then appear in `FilesLibraryPage.tsx` automatically

---

## Database Schema

See `migrations/0023_create_playbook_execution_center.sql` for the full schema.

Tables created:
- `playbooks`
- `playbook_projects`
- `playbook_entries`
- `playbook_decisions`
- `playbook_action_items`
- `playbook_timeline_events`

All tables have:
- UUID primary keys
- `created_at` / `updated_at` with auto-trigger
- Row-Level Security enabled (authenticated users have full CRUD)
- Foreign key constraints with appropriate cascade behavior
- Check constraints on all enum fields

---

## Testing

No playbook-specific tests exist yet. To add tests:

1. Create `tests/playbook/` directory
2. Test `playbook.runtime.ts` functions directly — they use `window.localStorage` which can be mocked
3. Use the existing `vitest.config.ts` configuration

Example:
```ts
import { createPlaybook, listPlaybooks, deletePlaybook } from '@/domains/playbook'

describe('playbook runtime', () => {
  beforeEach(() => localStorage.clear())
  
  it('creates and retrieves a playbook', () => {
    createPlaybook({ title: 'Test Playbook' })
    const list = listPlaybooks()
    expect(list).toHaveLength(1)
    expect(list[0].title).toBe('Test Playbook')
  })
})
```
