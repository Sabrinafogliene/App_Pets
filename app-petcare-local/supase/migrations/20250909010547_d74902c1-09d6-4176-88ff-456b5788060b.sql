-- Atualizar o trigger handle_new_veterinario_signup para também criar registro na tabela veterinarios

CREATE OR REPLACE FUNCTION public.handle_new_veterinario_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Verificar se é um veterinário e criar registro na tabela veterinarios
  IF NEW.role = 'veterinario' THEN
    -- Inserir na tabela veterinarios
    INSERT INTO public.veterinarios (profile_id, nome, email)
    VALUES (NEW.id, NEW.nome, NEW.email);
    
    -- Processar convites pendentes (código original)
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