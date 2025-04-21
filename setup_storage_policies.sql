-- Create the bucket if it doesn't exist (with all required fields)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'writing-frames',
    'writing-frames',
    true,
    52428800,  -- 50MB in bytes
    array['image/png', 'image/jpeg', 'image/gif', 'image/webp']::text[]
)
on conflict (id) do update set 
    public = true,
    file_size_limit = 52428800,
    allowed_mime_types = array['image/png', 'image/jpeg', 'image/gif', 'image/webp']::text[];

-- Enable RLS
alter table storage.objects enable row level security;

-- Drop any existing policies to start fresh
drop policy if exists "Allow all operations" on storage.objects;

-- Create a single super-permissive policy for testing
create policy "Allow all operations"
on storage.objects for all
using ( bucket_id = 'writing-frames' )
with check ( bucket_id = 'writing-frames' );

-- Verify the bucket was created
select * from storage.buckets where id = 'writing-frames'; 