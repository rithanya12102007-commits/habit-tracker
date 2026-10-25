# Security Specification: Ritho AI Hardened Firestore Security

## 1. Data Invariants
1. **User Identity Boundary**: Every document under `/users/{userId}` and its subcollections (`/habits`, `/logs`, `/chats`) must strictly belong to the authenticated user matching `{userId}`.
2. **No Impersonation**: Users cannot create or update documents on behalf of other users. `userId == request.auth.uid`.
3. **No Blanket Reads**: `read` operations are isolated to the owner `request.auth.uid == userId`.
4. **Valid Schema Validation**: All incoming fields must conform to type, max string length, and required attributes.
5. **Denial of Wallet Protection**: ID lengths capped at 128 characters, string lengths capped strictly, and valid identifier patterns enforced.

## 2. The "Dirty Dozen" Threat Payloads
1. **Attacker writes to another user's profile**: Attempt write to `/users/victim_123` with `auth.uid = 'attacker_456'` -> `PERMISSION_DENIED`.
2. **Attacker reads another user's habit logs**: Attempt read from `/users/victim_123/logs/log_1` with non-matching UID -> `PERMISSION_DENIED`.
3. **Ghost / Shadow fields injection in Habit**: Attempt to add `{ isSuperAdmin: true }` or corrupted fields -> `PERMISSION_DENIED`.
4. **Malformed document ID injection**: Attempt to use 10KB string ID to exhaust memory/wallet -> `PERMISSION_DENIED`.
5. **Unauthenticated Read**: Attempt to read `/users` or `/users/{userId}` without logging in -> `PERMISSION_DENIED`.
6. **Altering userId on update**: Attempt to mutate `userId` on existing habit -> `PERMISSION_DENIED`.
7. **Negative XP injection**: Attempt to update user profile with non-number or malicious data -> `PERMISSION_DENIED`.
8. **Oversized chat message attack**: Attempt to send 500KB text payload into `/chats` -> `PERMISSION_DENIED`.
9. **Invalid Category enum**: Attempt to store habit with unrecognized category `exploit_cat` -> `PERMISSION_DENIED`.
10. **Forged log completion status**: Attacker attempts writing completion log for another user's habit -> `PERMISSION_DENIED`.
11. **List query without auth**: Anonymous query attempting to list `/users` collection root -> `PERMISSION_DENIED`.
12. **Catch-all unmapped path**: Attempting write to `/admin_secrets/passwords` -> `PERMISSION_DENIED` by global safety net.
