-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('tutor', 'veterinario');

-- Add role column to profiles table
ALTER TABLE public.profiles ADD COLUMN role public.user_role NOT NULL DEFAULT 'tutor';

-- Drop existing policies for veterinarios table first
DROP POLICY IF EXISTS "Users can view their own veterinarios" ON public.veterinarios;
DROP POLICY IF EXISTS "Users can insert their own veterinarios" ON public.veterinarios;
DROP POLICY IF EXISTS "Users can update their own veterinarios" ON public.veterinarios;
DROP POLICY IF EXISTS "Users can delete their own veterinarios" ON public.veterinarios;

-- Now we can safely drop the column and add the new one
ALTER TABLE public.veterinarios DROP COLUMN user_id CASCADE;
ALTER TABLE public.veterinarios ADD COLUMN profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Create pet_authorizations table for veterinarian access control
CREATE TABLE public.pet_authorizations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    veterinario_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tutor_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    authorized_data TEXT[] NOT NULL DEFAULT '{}', -- Array of authorized data types: consultas, medicamentos, vacinas, peso, alimentacao, galeria
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked')),
    authorized_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(pet_id, veterinario_profile_id)
);

-- Enable RLS on pet_authorizations
ALTER TABLE public.pet_authorizations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for pet_authorizations
CREATE POLICY "Tutors can manage authorizations for their pets" ON public.pet_authorizations
    FOR ALL USING (
        tutor_user_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM public.pets WHERE id = pet_id AND user_id = auth.uid())
    );

CREATE POLICY "Veterinarians can view their authorizations" ON public.pet_authorizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.id = veterinario_profile_id 
            AND profiles.role = 'veterinario'
        )
    );

-- Create new RLS policies for veterinarios table
CREATE POLICY "Veterinarian profiles can manage their data" ON public.veterinarios
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = veterinarios.profile_id 
            AND profiles.user_id = auth.uid()
            AND profiles.role = 'veterinario'
        )
    );

CREATE POLICY "Tutors can view authorized veterinarians" ON public.veterinarios
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.pet_authorizations pa
            JOIN public.pets p ON pa.pet_id = p.id
            WHERE pa.veterinario_profile_id = veterinarios.profile_id
            AND p.user_id = auth.uid()
            AND pa.status = 'active'
        )
    );

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id_param UUID DEFAULT auth.uid())
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM public.profiles WHERE user_id = user_id_param;
$$;

-- Create function to check if veterinarian has access to pet
CREATE OR REPLACE FUNCTION public.veterinarian_has_pet_access(pet_id_param UUID, data_type_param TEXT DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.pet_authorizations pa
        JOIN public.profiles prof ON pa.veterinario_profile_id = prof.id
        WHERE pa.pet_id = pet_id_param
        AND prof.user_id = auth.uid()
        AND prof.role = 'veterinario'
        AND pa.status = 'active'
        AND (data_type_param IS NULL OR data_type_param = ANY(pa.authorized_data))
    );
$$;

-- Add trigger for pet_authorizations
CREATE TRIGGER update_pet_authorizations_updated_at 
    BEFORE UPDATE ON public.pet_authorizations 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_pet_authorizations_pet_id ON public.pet_authorizations(pet_id);
CREATE INDEX idx_pet_authorizations_veterinario_profile_id ON public.pet_authorizations(veterinario_profile_id);
CREATE INDEX idx_pet_authorizations_tutor_user_id ON public.pet_authorizations(tutor_user_id);
CREATE INDEX idx_pet_authorizations_status ON public.pet_authorizations(status);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_veterinarios_profile_id ON public.veterinarios(profile_id);