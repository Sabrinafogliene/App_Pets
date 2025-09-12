-- Fix remaining functions with mutable search path

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Update prevent_role_change function 
CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF NEW.role <> OLD.role THEN
    RAISE EXCEPTION 'A alteração do papel do usuário não é permitida.';
  END IF;
  RETURN NEW;
END;
$function$;