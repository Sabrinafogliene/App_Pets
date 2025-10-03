CREATE TABLE public.consultations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL,
  user_id uuid NOT NULL,
  type text NOT NULL,
  date date NOT NULL,
  location text,
  observations text,
  created_at timestamp with time zone DEFAULT now(),
  vet_id uuid,
  CONSTRAINT consultations_pkey PRIMARY KEY (id),
  CONSTRAINT consultations_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id),
  CONSTRAINT consultations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT consultations_vet_id_fkey FOREIGN KEY (vet_id) REFERENCES public.profiles(id)
);
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.food_records (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL,
  user_id uuid NOT NULL,
  brand text,
  type text,
  quantity text,
  schedules text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT food_records_pkey PRIMARY KEY (id),
  CONSTRAINT food_records_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id),
  CONSTRAINT food_records_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
ALTER TABLE public.food_records ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.gallery (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL,
  user_id uuid NOT NULL,
  url text,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  file_path text,
  CONSTRAINT gallery_pkey PRIMARY KEY (id),
  CONSTRAINT gallery_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id),
  CONSTRAINT gallery_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.medications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL,
  user_id uuid NOT NULL,
  name text NOT NULL,
  dosage text NOT NULL,
  frequency text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  inicio date,
  termino date,
  CONSTRAINT medications_pkey PRIMARY KEY (id),
  CONSTRAINT medications_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id),
  CONSTRAINT medications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.pet_vet_access (
  pet_id uuid NOT NULL,
  vet_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  tutor_id uuid,
  CONSTRAINT pet_vet_access_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id),
  CONSTRAINT pet_vet_access_vet_id_fkey FOREIGN KEY (vet_id) REFERENCES auth.users(id)
);
ALTER TABLE public.pet_vet_access ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.pets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  species text NOT NULL,
  breed text NOT NULL,
  age text,
  weight text NOT NULL,
  history text,
  created_at timestamp with time zone DEFAULT now(),
  file_path text,
  castrated boolean,
  gender text,
  birthday date,
  registro boolean,
  registration_number text,
  CONSTRAINT pets_pkey PRIMARY KEY (id),
  CONSTRAINT pets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text,
  user_type text NOT NULL,
  crmv text,
  clinic text,
  updated_at timestamp with time zone DEFAULT now(),
  user_id uuid,
  email text,
  is_setup_complete boolean DEFAULT false,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT profiles_id_fkey_new FOREIGN KEY (id) REFERENCES auth.users(id)
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.vaccines (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL,
  user_id uuid NOT NULL,
  name text NOT NULL,
  date date NOT NULL,
  next_dose date,
  created_at timestamp with time zone DEFAULT now(),
  vet_id uuid,
  CONSTRAINT vaccines_pkey PRIMARY KEY (id),
  CONSTRAINT vaccines_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id),
  CONSTRAINT vaccines_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT vaccines_vet_id_fkey FOREIGN KEY (vet_id) REFERENCES public.profiles(id)
);
ALTER TABLE public.vaccines ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.vet_access (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL,
  vet_id uuid NOT NULL,
  tutor_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  permissions ARRAY DEFAULT '{}'::text[],
  vet_email text,
  CONSTRAINT vet_access_pkey PRIMARY KEY (id),
  CONSTRAINT vet_access_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id),
  CONSTRAINT vet_access_vet_id_fkey_new FOREIGN KEY (vet_id) REFERENCES public.profiles(id),
  CONSTRAINT vet_access_tutor_id_fkey_new FOREIGN KEY (tutor_id) REFERENCES public.profiles(id)
);
ALTER TABLE public.vet_access ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.weight_records (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL,
  user_id uuid NOT NULL,
  weight numeric NOT NULL,
  date date NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT weight_records_pkey PRIMARY KEY (id),
  CONSTRAINT weight_records_pet_id_fkey FOREIGN KEY (pet_id) REFERENCES public.pets(id),
  CONSTRAINT weight_records_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
ALTER TABLE public.weight_records ENABLE ROW LEVEL SECURITY;

DROP FUNCTION IF EXISTS public.get_user_by_email(text);
create or replace function public.get_user_by_email(p_email text)
returns jsonb
language plpgsql
security definer
as $$
declare
  user_info jsonb;
begin
  select to_jsonb(u) into user_info
  from auth.users as u
  where u.email = p_email;
  
  if user_info is null then
    return null;
  else
    return user_info;
  end if;
end;
$$;
grant execute on function public.get_user_by_email(text) to authenticated;

drop function if exists public.get_vet_patients(); 
create or replace function public.get_vet_patients()
returns table (
  id uuid,
  name text,
  species text,
  breed text,
  birthday date,
  weight text,        
  gender text,     
  file_path text,     
  castrated boolean,
  registro boolean
)
language plpgsql
security definer
as $$
begin
  return query
  select
    p.id, p.name, p.species, p.breed, p.birthday, p.weight, p.gender, p.file_path, p.castrated, p.registro
  from pets p
  join vet_access va
    on va.pet_id = p.id
  where
    va.vet_id = auth.uid()
    and va.is_active = true;
end;
$$;
grant execute on function public.get_vet_patients() to authenticated;


DROP FUNCTION IF EXISTS public.grant_vet_access(text, uuid, uuid);
create or replace function public.grant_vet_access(
  p_vet_email text,
  p_pet_id uuid,
  p_tutor_id uuid
)
returns void
language plpgsql
security definer
as $$
begin
  INSERT INTO vet_access (vet_email, pet_id, tutor_id, is_active)
  VALUES (p_vet_email, p_pet_id, p_tutor_id, TRUE)
  ON CONFLICT (vet_email, pet_id) DO UPDATE SET is_active = TRUE;
END;
$$;
grant execute on function public.grant_vet_access(text, uuid, uuid) to authenticated;


DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, user_type, full_name, crmv, clinic, email, is_setup_complete)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'user_type',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'crmv',
    new.raw_user_meta_data->>'clinic',
    new.email,
    FALSE 
  );
  RETURN new;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

DROP FUNCTION IF EXISTS public.invite_vet_by_email(text, uuid);
create or replace function public.invite_vet_by_email(
  vet_email text,
  pet_id uuid
)
returns jsonb
language plpgsql
security definer
as $$
declare
  existing_user_id uuid;
begin
  select id from auth.users where email = vet_email into existing_user_id;
  
  if existing_user_id is not null then
    insert into pet_vet_access (pet_id, vet_id)
    values (pet_id, existing_user_id)
    on conflict (pet_id, vet_id) do nothing;
    return jsonb_build_object('status', 'access_granted', 'user_exists', true);
  else
    perform auth.admin_invite_user_by_email(vet_email, null);
    return jsonb_build_object('status', 'invitation_sent', 'user_exists', false);
  end if;
end;
$$;
grant execute on function public.invite_vet_by_email(text, uuid) to authenticated;

create or replace function public.invite_tutor_by_email(p_email text)
returns jsonb
language plpgsql
security definer
as $$
declare
  existing_user_id uuid;
  current_user_id uuid;
  v_metadata jsonb;
begin
  -- Pega o ID do usuário que está chamando a função (o veterinário logado)
  current_user_id := auth.uid();
  v_metadata := jsonb_build_object('user_type', 'tutor', 'invited_by_vet_id', current_user_id);
  
  -- Verifica se o usuário já existe na tabela de autenticação
  select id from auth.users where email = p_email into existing_user_id;

  if existing_user_id is not null then
    -- Se o usuário já existe
    return jsonb_build_object('status', 'user_exists', 'message', 'Este e-mail já possui cadastro. Peça para o tutor fazer login.');
  else
    -- Se o usuário é novo, chama a função de convite
    -- FORÇA o NULL a ser tratado como TEXT para resolver o erro 'unknown'
    perform auth.admin_invite_user_by_email(
      p_email, 
      NULL::text, -- <--- CORREÇÃO CRÍTICA AQUI
      v_metadata 
    );
    
    return jsonb_build_object('status', 'invitation_sent', 'message', 'Convite enviado com sucesso para o novo tutor.');
  end if;
end;
$$;
grant execute on function public.invite_tutor_by_email(text) to authenticated;

drop policy if exists "Allow insert access to their own records" on public.consultations;
create policy "Allow insert access to their own records"
on public.consultations for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Allow read access to their own records" on public.consultations;
create policy "Vets can view permitted consultations"
on public.consultations for select
to authenticated
using (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.vet_access
    WHERE vet_access.vet_id = auth.uid()
      AND vet_access.pet_id = consultations.pet_id
      AND vet_access.is_active = true
      AND 'consultas' = ANY(vet_access.permissions)
  )
);

drop policy if exists "Allow update access to their own records" on public.consultations;
create policy "Allow update access to their own records"
on public.consultations for update
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Allow delete access to their own records" on public.consultations;
create policy "Allow delete access to their own records"
on public.consultations for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Allow authenticated users to delete their own food records" on public.food_records;
create policy "Allow authenticated users to delete their own food records"
on public.food_records for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Allow authenticated users to select their own food records" on public.food_records;
create policy "Vets can view permitted food records"
on public.food_records for select
to authenticated
using (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.vet_access
    WHERE vet_access.vet_id = auth.uid()
      AND vet_access.pet_id = food_records.pet_id
      AND vet_access.is_active = true
      AND 'alimentacao' = ANY (vet_access.permissions)
  )
);

drop policy if exists "Allow authenticated users to insert their own food records" on public.food_records;
create policy "Allow authenticated users to insert their own food records"
on public.food_records for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Allow authenticated users to update their own food records" on public.food_records;
create policy "Allow authenticated users to update their own food records"
on public.food_records for update
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Allow authenticated users to delete their own photos" on public.gallery;
create policy "Allow authenticated users to delete their own photos"
on public.gallery for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Allow authenticated users to select their own photos" on public.gallery;
create policy "Allow authenticated users to select their own photos"
on public.gallery for select
to authenticated
using (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.vet_access
    WHERE vet_access.vet_id = auth.uid()
      AND vet_access.pet_id = gallery.pet_id
      AND vet_access.is_active = true
      AND 'fotos' = ANY(vet_access.permissions)
  )
);

drop policy if exists "Allow authenticated users to insert their own photos" on public.gallery;
create policy "Allow authenticated users to insert their own photos"
on public.gallery for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Allow authenticated users to update their own photos" on public.gallery;
create policy "Allow authenticated users to update their own photos"
on public.gallery for update
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Allow authenticated users to read their own records" on public.medications;
create policy "Vets can view permitted medications"
on public.medications for select
to authenticated
using (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.vet_access
    WHERE vet_access.vet_id = auth.uid()
      AND vet_access.pet_id = medications.pet_id
      AND vet_access.is_active = true
      AND 'medicamentos' = ANY (vet_access.permissions)
  )
); 

drop policy if exists "Allow authenticated users to insert their own records" on public.medications;
create policy "Allow authenticated users to insert their own records"
on public.medications for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Allow authenticated users to update their own records" on public.medications;
create policy "Allow authenticated users to update their own records"
on public.medications for update
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Allow authenticated users to delete their own records" on public.medications;
create policy "Allow authenticated users to delete their own records"
on public.medications for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Allow vet and tutor to read" on public.pet_vet_access;
create policy "Allow vet and tutor to read"
on public.pet_vet_access for select
to authenticated
using (auth.uid() = vet_id or auth.uid() = tutor_id);

drop policy if exists "Users can delete their own pets" on public.pets;
create policy "Users can delete their own pets"
on public.pets for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can update their own pets" on public.pets;
create policy "Users can update their own pets"
on public.pets for update
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own pets" on public.pets;
create policy "Users can insert their own pets"
on public.pets for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Vets can view pet details they have access to" on public.pets;
create policy "Vets can view pet details they have access to"
on public.pets for select
to authenticated
using (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM public.vet_access 
    WHERE vet_access.vet_id = auth.uid()
    AND vet_access.pet_id = pets.id
    AND vet_access.is_active = TRUE
  )
);

drop policy if exists "Allow insert for authenticated users" on public.profiles;
create policy "Allow insert for authenticated users"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can view their own profile and others" on public.profiles;
create policy "Allow authenticated users to read their own profile"
on public.profiles for select
to authenticated
using ((auth.uid()= id) OR (user_type = 'vet'));

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can delete their own profile" on public.profiles;
create policy "Users can delete their own profile"
on public.profiles for delete
to authenticated
using (auth.uid() = id);

drop policy if exists "Usuários podem criar seu próprio perfil" on public.profiles;
create policy "Usuários podem criar seu próprio perfil"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Allow read access to their own records" on public.vaccines;
create policy "Vets can view permitted vaccines"
on public.vaccines for select
to authenticated
using (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.vet_access
    WHERE vet_access.vet_id = auth.uid()
      AND vet_access.pet_id = vaccines.pet_id
      AND vet_access.is_active = true
      AND 'vacinas' = ANY (vet_access.permissions)
  )

);

drop policy if exists "Allow insert access to their own records" on public.vaccines;
create policy "Allow insert access to their own records"
on public.vaccines for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Allow update access to their own records" on public.vaccines;
create policy "Allow update access to their own records"
on public.vaccines for update
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Allow delete access to their own records" on public.vaccines;
create policy "Allow delete access to their own records"
on public.vaccines for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Tutors and Vets can view granted access" on public.vet_access;
create policy "Tutors and Vets can view granted access"
on public.vet_access for select
to authenticated
using (auth.uid() = tutor_id OR auth.id() = vet_id);

drop policy if exists "Tutors can grant new vet access" on public.vet_access;
create policy "Vet can register own access on setup"
on public.vet_access for insert
to authenticated
with check (auth.uid() = vet_id);

drop policy if exists "Tutors can revoke access for their own pets" on public.vet_access;
create policy "Tutors can revoke access for their own pets"
on public.vet_access for delete
to authenticated
using (auth.uid() = tutor_id);

drop policy if exists "Tutors can update access for their own pets" on public.vet_access;
create policy "Tutors can update access for their own pets"
on public.vet_access for update
to authenticated
using (auth.uid() = tutor_id);

drop policy if exists "Allow authenticated users to delete their own records" on public.weight_records;
create policy "Allow authenticated users to delete their own records"
on public.weight_records for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Allow authenticated users to select their own records" on public.weight_records;
create policy "Vets can view permitted weight records"
on public.weight_records for select
to authenticated
using (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.vet_access
    WHERE vet_access.vet_id = auth.uid()
      AND vet_access.pet_id = weight_records.pet_id
      AND vet_access.is_active = true
      AND 'peso' = ANY (vet_access.permissions)
  )
);

drop policy if exists "Allow authenticated users to insert their own records" on public.weight_records;
create policy "Allow authenticated users to insert their own records"
on public.weight_records for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Allow authenticated users to update their own records" on public.weight_records;
create policy "Allow authenticated users to update their own records"
on public.weight_records for update
to authenticated
using (auth.uid() = user_id);