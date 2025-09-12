-- Criar trigger para automaticamente criar registro na tabela veterinarios quando um veterinário se cadastra

-- Primeiro, vamos criar uma função que será executada quando um novo profile veterinário for criado
CREATE OR REPLACE FUNCTION public.handle_new_veterinario_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Se o novo profile é de um veterinário, criar registro na tabela veterinarios
  IF NEW.role = 'veterinario' THEN
    INSERT INTO public.veterinarios (profile_id, nome, email)
    VALUES (
      NEW.id,
      NEW.nome,
      NEW.email
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Criar o trigger que executa após inserção de um novo profile
CREATE TRIGGER on_new_veterinario_profile
  AFTER INSERT ON public.profiles
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_veterinario_profile();

-- Inserir os veterinários existentes que não estão na tabela veterinarios
INSERT INTO public.veterinarios (profile_id, nome, email)
SELECT 
  p.id,
  p.nome,
  p.email
FROM public.profiles p
WHERE p.role = 'veterinario'
AND NOT EXISTS (
  SELECT 1 FROM public.veterinarios v 
  WHERE v.profile_id = p.id
);