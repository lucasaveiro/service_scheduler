-- Drop existing tables if they exist
drop table if exists public.services cascade;

-- Create services table
create table public.services (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    description text,
    duration integer not null default 60,
    price decimal(10,2) not null,
    category text,
    is_active boolean default true,
    location text not null default 'client_location',
    requires_deposit boolean default false,
    deposit_amount decimal(10,2),
    notes text,
    business_id uuid not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Add foreign key constraint
alter table public.services
    add constraint fk_services_business
    foreign key (business_id)
    references public.businesses(id)
    on delete cascade;

-- Create indexes
create index idx_services_business_id on public.services(business_id);
create index idx_services_category on public.services(category);

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
    before update on public.services
    for each row
    execute function public.handle_updated_at();

-- Enable RLS
alter table public.services enable row level security;

-- Create basic policies
create policy "Users can view their own services"
    on services for select
    using (
        business_id in (
            select id from businesses
            where user_id = auth.uid()
        )
    );

create policy "Users can create services"
    on services for insert
    with check (
        business_id in (
            select id from businesses
            where user_id = auth.uid()
        )
    );

create policy "Users can update their own services"
    on services for update
    using (
        business_id in (
            select id from businesses
            where user_id = auth.uid()
        )
    );

create policy "Users can delete their own services"
    on services for delete
    using (
        business_id in (
            select id from businesses
            where user_id = auth.uid()
        )
    );
