Database:
PostgreSQL

Pagination:
Cursor-based pagination using (created_at, id).

Consistency:
Snapshot-based pagination to guarantee that users never see duplicates or miss products while browsing.

Indexes:
(category, created_at DESC, id DESC)

Why:
Offset pagination becomes slower as offsets grow and can produce duplicate/missing rows when new products are inserted. Cursor pagination provides stable and efficient pagination.