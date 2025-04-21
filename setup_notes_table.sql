-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Drop existing table if it exists
drop table if exists public.notes;

-- Create notes table with correct column names
create table public.notes (
    id uuid default uuid_generate_v4() primary key,
    title text,
    content text,
    thumbnail text,
    thumbnailPath text,
    userid uuid references auth.users(id) not null,
    canvasState jsonb,
    frameSize jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create trigger function for updating updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger
create trigger update_notes_updated_at
    before update on notes
    for each row
    execute function update_updated_at_column();

-- Enable RLS
alter table public.notes enable row level security;

-- Create policies
create policy "Users can view their own notes"
on notes for select
using (auth.uid() = userid);

create policy "Users can create their own notes"
on notes for insert
with check (auth.uid() = userid);

create policy "Users can update their own notes"
on notes for update
using (auth.uid() = userid);

create policy "Users can delete their own notes"
on notes for delete
using (auth.uid() = userid); 