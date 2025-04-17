
-- Create tables for the CRM system
create type contact_status as enum ('lead', 'prospect', 'customer', 'inactive');

-- Contacts table
create table contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  company text,
  status contact_status default 'lead',
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Activities table for logging interactions
create table activities (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  type text not null,
  description text not null,
  created_at timestamp with time zone default now()
);

-- Tags table
create table tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  color text not null,
  created_at timestamp with time zone default now()
);

-- Contact tags junction table
create table contact_tags (
  contact_id uuid references contacts(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (contact_id, tag_id)
);

-- Enable RLS
alter table contacts enable row level security;
alter table activities enable row level security;
alter table tags enable row level security;
alter table contact_tags enable row level security;

-- Create policies
create policy "Users can view their own contacts"
  on contacts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own contacts"
  on contacts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own contacts"
  on contacts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own contacts"
  on contacts for delete
  using (auth.uid() = user_id);

-- Similar policies for activities
create policy "Users can view their own activities"
  on activities for select
  using (auth.uid() = user_id);

create policy "Users can insert their own activities"
  on activities for insert
  with check (auth.uid() = user_id);

-- Similar policies for tags
create policy "Users can view their own tags"
  on tags for select
  using (auth.uid() = user_id);

create policy "Users can manage their own tags"
  on tags for all
  using (auth.uid() = user_id);

-- Contact tags policies
create policy "Users can view their contact tags"
  on contact_tags for select
  using (
    exists (
      select 1 from contacts
      where contacts.id = contact_tags.contact_id
      and contacts.user_id = auth.uid()
    )
  );

create policy "Users can manage their contact tags"
  on contact_tags for all
  using (
    exists (
      select 1 from contacts
      where contacts.id = contact_tags.contact_id
      and contacts.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
create index contacts_user_id_idx on contacts(user_id);
create index activities_contact_id_idx on activities(contact_id);
create index activities_user_id_idx on activities(user_id);
create index tags_user_id_idx on tags(user_id);