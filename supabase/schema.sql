-- Create a table for public images
create table images (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  url text not null,
  user_id uuid references auth.users not null
);

-- Set up Row Level Security (RLS)
alter table images enable row level security;

-- Create policies
-- Allow public read access
create policy "Images are viewable by everyone" on images
  for select using (true);

-- Allow authenticated users to insert their own images
create policy "Users can insert their own images" on images
  for insert with check (auth.uid() = user_id);

-- Allow users to update their own images
create policy "Users can update their own images" on images
  for update using (auth.uid() = user_id);

-- Allow users to delete their own images
create policy "Users can delete their own images" on images
  for delete using (auth.uid() = user_id);

-- Create storage bucket for images
insert into storage.buckets (id, name, public) values ('images', 'images', true);

-- Set up storage policies
create policy "Images are publicly accessible" on storage.objects
  for select using (bucket_id = 'images');

create policy "Users can upload images" on storage.objects
  for insert with check (
    bucket_id = 'images' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
  );

create policy "Users can update their own images" on storage.objects
  for update using (
    bucket_id = 'images' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
  );

create policy "Users can delete their own images" on storage.objects
  for delete using (
    bucket_id = 'images' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
  );
