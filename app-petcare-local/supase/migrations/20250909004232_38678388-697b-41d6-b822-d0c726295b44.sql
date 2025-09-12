-- Remove conflicting "Deny all access" policies that are blocking legitimate user access
-- These policies override more specific policies and make the application non-functional

-- Drop the conflicting deny all policy from profiles table
DROP POLICY IF EXISTS "Deny all access to profiles" ON public.profiles;

-- Drop the conflicting deny all policy from veterinarios table  
DROP POLICY IF EXISTS "Deny all access to veterinarios" ON public.veterinarios;

-- Drop the conflicting deny all policy from convites_pendentes table
DROP POLICY IF EXISTS "Deny all access to invites" ON public.convites_pendentes;