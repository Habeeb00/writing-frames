-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create notes table
create table if not exists public.notes (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    title text,
    content text,
    thumbnail text,
    thumbnailPath text,
    userid uuid references auth.users(id) not null,
    canvasState jsonb,
    frameSize jsonb
);

-- Enable Row Level Security
alter table public.notes enable row level security;

-- Create policies
drop policy if exists "Notes are viewable by owner." on notes;
create policy "Notes are viewable by owner." 
    on notes for select 
    using (auth.uid() = userid);

drop policy if exists "Notes are insertable by owner." on notes;
create policy "Notes are insertable by owner." 
    on notes for insert 
    with check (auth.uid() = userid);

drop policy if exists "Notes are updatable by owner." on notes;
create policy "Notes are updatable by owner." 
    on notes for update 
    using (auth.uid() = userid);

drop policy if exists "Notes are deletable by owner." on notes;
create policy "Notes are deletable by owner." 
    on notes for delete 
    using (auth.uid() = userid);

-- Create updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

drop trigger if exists update_notes_updated_at on notes;
create trigger update_notes_updated_at
    before update on notes
    for each row
    execute function update_updated_at_column();
