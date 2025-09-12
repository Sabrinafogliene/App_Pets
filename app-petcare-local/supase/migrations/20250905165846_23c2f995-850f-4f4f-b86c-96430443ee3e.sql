-- Create a secure view for veterinarian public information
-- This limits exposure of sensitive contact details while maintaining functionality

CREATE OR REPLACE VIEW public.veterinarios_public AS
SELECT 
    v.id,
    v.profile_id,
    v.nome,
    v.crmv,
    v.especialidade,
    v.clinica,
    v.created_at
    -- Explicitly excluding: telefone, email, endereco
FROM public.veterinarios v;

-- Enable RLS on the view
ALTER VIEW public.veterinarios_public SET (security_invoker = true);

-- Create RLS policies for the secure view
CREATE POLICY "Tutors can view public info of authorized veterinarians" 
ON public.veterinarios_public
FOR SELECT 
USING (
    EXISTS (
        SELECT 1
        FROM pet_authorizations pa
        JOIN pets p ON pa.pet_id = p.id
        WHERE pa.veterinario_profile_id = veterinarios_public.profile_id
        AND p.user_id = auth.uid()
        AND pa.status = 'active'
    )
);

CREATE POLICY "Veterinarians can view their own public info" 
ON public.veterinarios_public
FOR SELECT 
USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE profiles.id = veterinarios_public.profile_id
        AND profiles.user_id = auth.uid()
        AND profiles.role = 'veterinario'
    )
);

-- Update the main veterinarios table policies to be more restrictive
-- Remove the broad tutor access policy and replace with more specific ones

DROP POLICY IF EXISTS "Tutors can view authorized veterinarians" ON public.veterinarios;

-- Only veterinarians can access their full contact information
-- Tutors should use the veterinarios_public view instead
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

-- Keep the management policy for veterinarians
-- (This was already properly restricted)