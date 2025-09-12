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