# Security Specification: Smart Campus Share

## 1. Data Invariants
- A `borrower` cannot request items until `isVerified` is true.
- Only users with role `admin` can create, update, or delete `items`.
- Only `admin` can update a `request` status.
- `borrower` can only read their own `requests`.
- `borrower` can read all `items`.
- `borrower` can create a `request` if they are verified.
- `borrower` can only update their own profile fields (except `isVerified` and `role`).
- `settings` collection can only be read/written by `admin`.

## 2. The Dirty Dozen Payloads

1. **Borrower Escalation**: Borrower tries to update their own role to 'admin'.
2. **Unauthorized Item Creation**: Borrower tries to create a new item.
3. **Ghost Verification**: Borrower tries to set `isVerified: true` on their own profile.
4. **ID Poisoning**: Creating an item with a 1MB string as ID.
5. **Request Hijacking**: Borrower tries to read requests belonging to another borrower.
6. **Self-Approval**: Borrower tries to update their own request status to 'accepted'.
7. **Negative Price**: Adding an item with a negative rental price.
8. **PII Leak**: Borrower tries to list all users' phone numbers.
9. **Spam Feedback**: User tries to leave feedback for an item they never rented.
10. **Admin Spoofing**: User tries to update `settings/admin_config` without being admin.
11. **Negative Duration**: Creating a request with a duration of -1 days.
12. **Orphaned Request**: Creating a request for an item that doesn't exist.

## 3. Test Runner (Draft)
A `firestore.rules.test.ts` will verify these boundaries.
