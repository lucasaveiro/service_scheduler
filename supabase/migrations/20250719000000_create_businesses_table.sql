-- Create the update_updated_at function first
create or replace function public.update_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Drop existing tables if they exist
drop table if exists public.businesses cascade;

-- Create businesses table
create table public.businesses (
    id uuid default gen_random_uuid() primary key,
    user_id uuid not null,
    name text not null,
    type text not null,
    contact_email text not null,
    contact_phone text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Add foreign key constraint
alter table public.businesses
    add constraint fk_businesses_user
    foreign key (user_id)
    references auth.users(id)
    on delete cascade;

-- Create index
create index idx_businesses_user_id on public.businesses(user_id);

-- Function for updating timestamps
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- Create trigger
create trigger set_updated_at
    before update on public.businesses
    for each row
    execute function public.handle_updated_at();

-- Enable RLS
alter table public.businesses enable row level security;

-- Create basic policies
create policy "Users can view their own business"
    on businesses for select
    using (user_id = auth.uid());

create policy "Users can create business"
    on businesses for insert
    with check (user_id = auth.uid());

create policy "Users can update their own business"
    on businesses for update
    using (user_id = auth.uid());

create policy "Users can delete their own business"
    on businesses for delete
    using (user_id = auth.uid());
