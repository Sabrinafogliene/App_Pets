-- First, remove the overly permissive policy for tutors
DROP POLICY IF EXISTS "Tutors can view authorized veterinarians" ON public.veterinarios;

-- Create a security definer function that returns filtered veterinarian data
-- This prevents harvesting of sensitive contact information
CREATE OR REPLACE FUNCTION public.get_authorized_veterinarians_safe()
RETURNS TABLE (
    id uuid,
    profile_id uuid,
    nome text,
    crmv text,
    especialidade text,
    clinica text,
    created_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Create a more restrictive policy that only allows veterinarians to see their own full data
CREATE POLICY "Veterinarians can view their own full data" 
ON public.veterinarios
FOR SELECT 
USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE profiles.id = veterinarios.profile_id
        AND profiles.user_id = auth.uid()
        AND profiles.role = 'veterinario'
    )
);

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.get_authorized_veterinarians_safe() TO authenticated;