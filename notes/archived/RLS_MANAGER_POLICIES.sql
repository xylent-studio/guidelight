-- RLS Policy Updates for Manager INSERT/DELETE on budtenders table
-- To be applied before Step 7 (Budtender Management)

begin;

-- Allow managers to INSERT new budtenders (for invite flow)
create policy "budtenders_managers_insert"
  on public.budtenders
  for insert
  with check (exists (
    select 1 from public.budtenders b_mgr
    where b_mgr.auth_user_id = auth.uid()
      and b_mgr.role = 'manager'
  ));

-- Allow managers to DELETE budtenders (for hard delete)
-- Defense in depth: Prevent self-deletion at RLS level
create policy "budtenders_managers_delete"
  on public.budtenders
  for delete
  using (
    exists (
      select 1 from public.budtenders b_mgr
      where b_mgr.auth_user_id = auth.uid()
        and b_mgr.role = 'manager'
    )
    AND id != (
      select id from public.budtenders 
      where auth_user_id = auth.uid()
    )  -- ✅ Cannot delete self (defense in depth)
  );

commit;

-- Notes:
-- - These policies allow ANY manager to insert/delete ANY budtender row (except self)
-- - Self-deletion prevention is enforced at both UI AND RLS level (defense in depth)
-- - Cascade deletes to picks table are handled by FK constraint (on delete cascade)
-- - RLS on picks table already allows managers to modify/delete any picks

