-- Update the handle_new_user function to handle role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Update RLS policies for consultas to include veterinarian access
DROP POLICY IF EXISTS "Tutors can manage their pets consultas" ON public.consultas;
DROP POLICY IF EXISTS "Veterinarians can view authorized consultas" ON public.consultas;
DROP POLICY IF EXISTS "Veterinarians can insert consultas for authorized pets" ON public.consultas;  
DROP POLICY IF EXISTS "Veterinarians can update consultas for authorized pets" ON public.consultas;

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
DROP POLICY IF EXISTS "Tutors can manage their pets medicamentos" ON public.medicamentos;
DROP POLICY IF EXISTS "Veterinarians can view authorized medicamentos" ON public.medicamentos;
DROP POLICY IF EXISTS "Veterinarians can manage medicamentos for authorized pets" ON public.medicamentos;
DROP POLICY IF EXISTS "Veterinarians can update medicamentos for authorized pets" ON public.medicamentos;

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

CREATE POLICY "Veterinarians can insert medicamentos for authorized pets" ON public.medicamentos
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
DROP POLICY IF EXISTS "Tutors can manage their pets vacinas" ON public.vacinas;
DROP POLICY IF EXISTS "Veterinarians can view authorized vacinas" ON public.vacinas;
DROP POLICY IF EXISTS "Veterinarians can manage vacinas for authorized pets" ON public.vacinas;
DROP POLICY IF EXISTS "Veterinarians can update vacinas for authorized pets" ON public.vacinas;

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

CREATE POLICY "Veterinarians can insert vacinas for authorized pets" ON public.vacinas
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