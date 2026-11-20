# Phone Target Security Specification

## 1. Data Invariants
1. Public visitors can read (`get`, `list`) `/products/{productId}` and `/settings/{settingId}` without authentication so the storefront loads immediately.
2. Write access (`create`, `update`, `delete`) across Firestore and Firebase Storage is strictly limited to `request.auth != null && request.auth.token.email == "admin@phonetarget.app"`.
3. Every product document ID and setting document ID must match `^[a-zA-Z0-9_\-]+$` and be at most 128 characters.
4. Every product must validate required fields (`name`, `brand`, `price`, `inStock`, `isNew`, `isSale`), valid brand enum, non-negative price, bounded string lengths, and bounded array sizes (`storageOptions <= 10`, `colors <= 12`, `images <= 10`).
5. Unrecognized top-level fields ("shadow fields") are rejected via `keys().hasOnly(...)`.

## 2. Adversarial Payloads Checked
- Unauthenticated `create`/`update`/`delete` on `/products/test` -> `PERMISSION_DENIED`.
- Authenticated non-admin email `user@example.com` write on `/products/test` -> `PERMISSION_DENIED`.
- Admin write with oversized `name` (> 120 chars) -> `PERMISSION_DENIED`.
- Admin write with negative `price: -5` -> `PERMISSION_DENIED`.
- Admin write with invalid `brand: "UnknownBrand"` -> `PERMISSION_DENIED`.
- Admin write with shadow field `extraAdminBypass: true` -> `PERMISSION_DENIED`.
- Admin write on unknown collection `/secrets/doc1` -> `PERMISSION_DENIED` (default deny catch-all).
