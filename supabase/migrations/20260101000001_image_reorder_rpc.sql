-- Atomic image reorder. The (product_id, position) unique constraint means
-- naively updating rows one at a time can collide mid-sequence on a partial
-- failure (1,2,2,4). This function first shifts every row to a negative,
-- guaranteed-unique offset, then assigns final positions — all inside one
-- transaction, so a caller either sees the full new order or the original.
create function reorder_product_images(
  p_product_id uuid,
  p_ordered_image_ids uuid[]
) returns void as $$
declare
  v_id uuid;
  v_index int;
begin
  if not is_admin() then
    raise exception 'not authorized';
  end if;

  if (select count(*) from product_images where product_id = p_product_id)
     <> array_length(p_ordered_image_ids, 1) then
    raise exception 'ordered_image_ids must include every image belonging to the product';
  end if;

  v_index := 0;
  foreach v_id in array p_ordered_image_ids loop
    update product_images
      set position = -(v_index + 1)
      where id = v_id and product_id = p_product_id;
    v_index := v_index + 1;
  end loop;

  v_index := 0;
  foreach v_id in array p_ordered_image_ids loop
    update product_images
      set position = v_index
      where id = v_id and product_id = p_product_id;
    v_index := v_index + 1;
  end loop;
end;
$$ language plpgsql security definer set search_path = public;

revoke all on function reorder_product_images(uuid, uuid[]) from public;
grant execute on function reorder_product_images(uuid, uuid[]) to authenticated;
