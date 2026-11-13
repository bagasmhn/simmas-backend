UPDATE "users"
SET "email" = 'admin@simmas.sch.id'
WHERE "email" = 'admin@gmail.com'
  AND NOT EXISTS (
    SELECT 1
    FROM "users" AS existing_admin
    WHERE existing_admin."email" = 'admin@simmas.sch.id'
  );
