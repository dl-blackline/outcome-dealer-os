# Prompt 10 — Auth Activation and Real Role Source

Move Outcome Dealer OS from local demo role state to a real app-level auth and role source.

## Goals

- stop using page-local role state as the primary authority
- make role and current-user state come from the auth domain
- preserve the dev role switcher, but make it an intentional development override rather than the only source of truth

## Tasks

1. Review the current auth domain and topbar role switching behavior.
2. Refactor the shell so current role, user identity, and auth state come from a single auth source.
3. Keep a dev/demo role switcher if helpful, but make it clearly a development override.
4. Ensure shell, navigation, route guards, approvals, and workstation can all read from the same current-user context.
5. Add or update:
   - `/docs/architecture/auth_runtime_model.md`
   - `/docs/architecture/dev_role_override.md`

## Rules

- do not overbuild login UX in this pass
- do not break the current shell
- prefer a clean auth context/store boundary
- preserve the role model already implemented

## Deliverable

- single current-user and role source
- shell bound to auth state instead of local-only state
- dev override documented clearly
