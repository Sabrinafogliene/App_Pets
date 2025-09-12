-- Fix Function Search Path Mutable security issue
-- Set explicit search_path for all SECURITY DEFINER functions to prevent security vulnerabilities

-- Update get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(user_id_param uuid DEFAULT auth.uid())
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
    SELECT role FROM public.profiles WHERE user_id = user_id_param;
$function$;

-- Update veterinarian_has_pet_access function  
CREATE OR REPLACE FUNCTION public.veterinarian_has_pet_access(pet_id_param uuid, data_type_param text DEFAULT NULL::text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
    SELECT EXISTS (
        SELECT 1 FROM public.pet_authorizations pa
        JOIN public.profiles prof ON pa.veterinario_profile_id = prof.id
        WHERE pa.pet_id = pet_id_param
        AND prof.user_id = auth.uid()
        AND prof.role = 'veterinario'
        AND pa.status = 'active'
        AND (data_type_param IS NULL OR data_type_param = ANY(pa.authorized_data))
    );
$function$;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    INSERT INTO public.profiles (user_id, nome, email, role)
    VALUES (
        NEW.id, 
        NEW.raw_user_meta_data ->> 'nome', 
        NEW.email,
        COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'tutor'::public.user_role)
    );
    RETURN NEW;
END;
$function$;

-- Update handle_new_veterinario_signup function
CREATE OR REPLACE FUNCTION public.handle_new_veterinario_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW.role = 'veterinario' THEN
    INSERT INTO public.pet_authorizations (tutor_user_id, pet_id, veterinario_profile_id, authorized_data, expires_at, status)
    SELECT
      cp.tutor_user_id,
      cp.pet_id,
      NEW.id,
      cp.authorized_data,
      cp.expires_at,
      'active'
    FROM public.convites_pendentes cp
    WHERE cp.veterinario_email = NEW.email;

    DELETE FROM public.convites_pendentes
    WHERE veterinario_email = NEW.email;
  END IF;
  RETURN NEW;
END;
$function$;

-- Update get_authorized_veterinarians_safe function
CREATE OR REPLACE FUNCTION public.get_authorized_veterinarians_safe()
RETURNS TABLE(id uuid, profile_id uuid, nome text, crmv text, especialidade text, clinica text, created_at timestamp with time zone)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $function$
    SELECT 
        v.id,
        v.profile_id,
        v.nome,
        v.crmv,
        v.especialidade,
        v.clinica,
        v.created_at
    FROM veterinarios v
    WHERE EXISTS (
        SELECT 1
        FROM pet_authorizations pa
        JOIN pets p ON pa.pet_id = p.id
        WHERE pa.veterinario_profile_id = v.profile_id
        AND p.user_id = auth.uid()
        AND pa.status = 'active'
    );
$function$;