-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('tutor', 'veterinario');

-- Add role column to profiles table
ALTER TABLE public.profiles ADD COLUMN role public.user_role NOT NULL DEFAULT 'tutor';

-- Update veterinarios table to reference profiles instead of users
ALTER TABLE public.veterinarios DROP COLUMN user_id;
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

-- Update RLS policies for veterinarios table
DROP POLICY IF EXISTS "Users can view their own veterinarios" ON public.veterinarios;
DROP POLICY IF EXISTS "Users can insert their own veterinarios" ON public.veterinarios;
DROP POLICY IF EXISTS "Users can update their own veterinarios" ON public.veterinarios;
DROP POLICY IF EXISTS "Users can delete their own veterinarios" ON public.veterinarios;

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

-- Update RLS policies for consultas to include veterinarian access
DROP POLICY IF EXISTS "Users can view their own consultas" ON public.consultas;
DROP POLICY IF EXISTS "Users can insert their own consultas" ON public.consultas;
DROP POLICY IF EXISTS "Users can update their own consultas" ON public.consultas;
DROP POLICY IF EXISTS "Users can delete their own consultas" ON public.consultas;

CREATE POLICY "Tutors can manage their pets consultas" ON public.consultas
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Veterinarians can view authorized consultas" ON public.consultas
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.pet_authorizations pa
            JOIN public.profiles prof ON pa.veterinario_profile_id = prof.id
            WHERE pa.pet_id = consultas.pet_id
            AND prof.user_id = auth.uid()
            AND prof.role = 'veterinario'
            AND pa.status = 'active'
            AND 'consultas' = ANY(pa.authorized_data)
        )
    );

CREATE POLICY "Veterinarians can insert consultas for authorized pets" ON public.consultas
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.pet_authorizations pa
            JOIN public.profiles prof ON pa.veterinario_profile_id = prof.id
            WHERE pa.pet_id = consultas.pet_id
            AND prof.user_id = auth.uid()
            AND prof.role = 'veterinario'
            AND pa.status = 'active'
            AND 'consultas' = ANY(pa.authorized_data)
        )
    );

CREATE POLICY "Veterinarians can update consultas for authorized pets" ON public.consultas
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.pet_authorizations pa
            JOIN public.profiles prof ON pa.veterinario_profile_id = prof.id
            WHERE pa.pet_id = consultas.pet_id
            AND prof.user_id = auth.uid()
            AND prof.role = 'veterinario'
            AND pa.status = 'active'
            AND 'consultas' = ANY(pa.authorized_data)
        )
    );

-- Update RLS policies for medicamentos to include veterinarian access
DROP POLICY IF EXISTS "Users can view their own medicamentos" ON public.medicamentos;
DROP POLICY IF EXISTS "Users can insert their own medicamentos" ON public.medicamentos;
DROP POLICY IF EXISTS "Users can update their own medicamentos" ON public.medicamentos;
DROP POLICY IF EXISTS "Users can delete their own medicamentos" ON public.medicamentos;

CREATE POLICY "Tutors can manage their pets medicamentos" ON public.medicamentos
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Veterinarians can view authorized medicamentos" ON public.medicamentos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.pet_authorizations pa
            JOIN public.profiles prof ON pa.veterinario_profile_id = prof.id
            WHERE pa.pet_id = medicamentos.pet_id
            AND prof.user_id = auth.uid()
            AND prof.role = 'veterinario'
            AND pa.status = 'active'
            AND 'medicamentos' = ANY(pa.authorized_data)
        )
    );

CREATE POLICY "Veterinarians can manage medicamentos for authorized pets" ON public.medicamentos
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.pet_authorizations pa
            JOIN public.profiles prof ON pa.veterinario_profile_id = prof.id
            WHERE pa.pet_id = medicamentos.pet_id
            AND prof.user_id = auth.uid()
            AND prof.role = 'veterinario'
            AND pa.status = 'active'
            AND 'medicamentos' = ANY(pa.authorized_data)
        )
    );

CREATE POLICY "Veterinarians can update medicamentos for authorized pets" ON public.medicamentos
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.pet_authorizations pa
            JOIN public.profiles prof ON pa.veterinario_profile_id = prof.id
            WHERE pa.pet_id = medicamentos.pet_id
            AND prof.user_id = auth.uid()
            AND prof.role = 'veterinario'
            AND pa.status = 'active'
            AND 'medicamentos' = ANY(pa.authorized_data)
        )
    );

-- Update RLS policies for vacinas to include veterinarian access
DROP POLICY IF EXISTS "Users can view their own vacinas" ON public.vacinas;
DROP POLICY IF EXISTS "Users can insert their own vacinas" ON public.vacinas;
DROP POLICY IF EXISTS "Users can update their own vacinas" ON public.vacinas;
DROP POLICY IF EXISTS "Users can delete their own vacinas" ON public.vacinas;

CREATE POLICY "Tutors can manage their pets vacinas" ON public.vacinas
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Veterinarians can view authorized vacinas" ON public.vacinas
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.pet_authorizations pa
            JOIN public.profiles prof ON pa.veterinario_profile_id = prof.id
            WHERE pa.pet_id = vacinas.pet_id
            AND prof.user_id = auth.uid()
            AND prof.role = 'veterinario'
            AND pa.status = 'active'
            AND 'vacinas' = ANY(pa.authorized_data)
        )
    );

CREATE POLICY "Veterinarians can manage vacinas for authorized pets" ON public.vacinas
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.pet_authorizations pa
            JOIN public.profiles prof ON pa.veterinario_profile_id = prof.id
            WHERE pa.pet_id = vacinas.pet_id
            AND prof.user_id = auth.uid()
            AND prof.role = 'veterinario'
            AND pa.status = 'active'
            AND 'vacinas' = ANY(pa.authorized_data)
        )
    );

CREATE POLICY "Veterinarians can update vacinas for authorized pets" ON public.vacinas
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.pet_authorizations pa
            JOIN public.profiles prof ON pa.veterinario_profile_id = prof.id
            WHERE pa.pet_id = vacinas.pet_id
            AND prof.user_id = auth.uid()
            AND prof.role = 'veterinario'
            AND pa.status = 'active'
            AND 'vacinas' = ANY(pa.authorized_data)
        )
    );

-- Similar policies for peso, alimentacao, galeria with veterinarian access
CREATE POLICY "Veterinarians can view authorized peso" ON public.peso
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.pet_authorizations pa
            JOIN public.profiles prof ON pa.veterinario_profile_id = prof.id
            WHERE pa.pet_id = peso.pet_id
            AND prof.user_id = auth.uid()
            AND prof.role = 'veterinario'
            AND pa.status = 'active'
            AND 'peso' = ANY(pa.authorized_data)
        )
    );

CREATE POLICY "Veterinarians can view authorized alimentacao" ON public.alimentacao
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.pet_authorizations pa
            JOIN public.profiles prof ON pa.veterinario_profile_id = prof.id
            WHERE pa.pet_id = alimentacao.pet_id
            AND prof.user_id = auth.uid()
            AND prof.role = 'veterinario'
            AND pa.status = 'active'
            AND 'alimentacao' = ANY(pa.authorized_data)
        )
    );

CREATE POLICY "Veterinarians can view authorized galeria" ON public.galeria
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.pet_authorizations pa
            JOIN public.profiles prof ON pa.veterinario_profile_id = prof.id
            WHERE pa.pet_id = galeria.pet_id
            AND prof.user_id = auth.uid()
            AND prof.role = 'veterinario'
            AND pa.status = 'active'
            AND 'galeria' = ANY(pa.authorized_data)
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