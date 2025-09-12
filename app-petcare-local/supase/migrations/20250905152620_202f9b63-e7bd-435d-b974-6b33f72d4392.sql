-- Insert sample profiles (these will be created automatically when users sign up)
-- We'll create some mock user IDs for demonstration
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data, aud, role)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'tutor1@email.com', 'encrypted_password_mock', now(), now(), now(), '{"nome": "Maria Silva", "role": "tutor"}', 'authenticated', 'authenticated'),
  ('22222222-2222-2222-2222-222222222222', 'tutor2@email.com', 'encrypted_password_mock', now(), now(), now(), '{"nome": "João Santos", "role": "tutor"}', 'authenticated', 'authenticated'),
  ('33333333-3333-3333-3333-333333333333', 'vet1@email.com', 'encrypted_password_mock', now(), now(), now(), '{"nome": "Dr. Ana Costa", "role": "veterinario"}', 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- Insert sample profiles
INSERT INTO public.profiles (user_id, nome, email, telefone, endereco, role, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Maria Silva', 'tutor1@email.com', '(11) 99999-1234', 'Rua das Flores, 123, São Paulo - SP', 'tutor', now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'João Santos', 'tutor2@email.com', '(11) 88888-5678', 'Av. Paulista, 456, São Paulo - SP', 'tutor', now(), now()),
  ('33333333-3333-3333-3333-333333333333', 'Dr. Ana Costa', 'vet1@email.com', '(11) 77777-9012', 'Clínica Veterinária Pet Care', 'veterinario', now(), now())
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample pets
INSERT INTO public.pets (id, user_id, nome, especie, raca, idade, peso, data_nascimento, cor, sexo, castrado, microchip, observacoes, created_at, updated_at)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Luna', 'Cão', 'Golden Retriever', 3, 28.5, '2021-03-15', 'Dourado', 'femea', true, 'MC123456789', 'Muito carinhosa e ativa', now(), now()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Mimi', 'Gato', 'Persa', 2, 4.2, '2022-07-20', 'Branco', 'femea', true, 'MC987654321', 'Gata calma e independente', now(), now()),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'Thor', 'Cão', 'Pastor Alemão', 5, 35.0, '2019-01-10', 'Preto e marrom', 'macho', false, 'MC456789123', 'Cão protetor e leal', now(), now()),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'Bella', 'Cão', 'Labrador', 4, 25.8, '2020-05-22', 'Chocolate', 'femea', true, 'MC789123456', 'Muito amigável com crianças', now(), now()),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'Pipoca', 'Gato', 'SRD', 1, 3.5, '2023-02-14', 'Tigrado', 'macho', false, NULL, 'Gato jovem e brincalhão', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Insert sample veterinarians
INSERT INTO public.veterinarios (profile_id, nome, clinica, telefone, email, especialidade, crmv, created_at)
VALUES 
  ((SELECT id FROM public.profiles WHERE user_id = '33333333-3333-3333-3333-333333333333'), 'Dr. Ana Costa', 'Clínica Veterinária Pet Care', '(11) 77777-9012', 'vet1@email.com', 'Clínica Geral', 'CRMV-SP 12345', now())
ON CONFLICT (profile_id) DO NOTHING;

-- Insert sample consultas
INSERT INTO public.consultas (user_id, pet_id, data_consulta, hora_consulta, tipo, descricao, diagnostico, tratamento, valor, status, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-01-15', '10:00', 'Consulta de rotina', 'Check-up anual', 'Pet saudável', 'Manter cuidados regulares', 150.00, 'realizada', now(), now()),
  ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2024-01-20', '14:30', 'Vacinação', 'Aplicação de vacina V4', 'Vacinação em dia', 'Próxima dose em 1 ano', 80.00, 'realizada', now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-02-01', '09:00', 'Emergência', 'Ingestão de objeto estranho', 'Corpo estranho no estômago', 'Cirurgia para remoção', 800.00, 'realizada', now(), now()),
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-02-15', '16:00', 'Retorno', 'Avaliação pós-consulta', 'Recuperação boa', 'Continuar medicação', 100.00, 'agendada', now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '2024-02-10', '11:30', 'Consulta de rotina', 'Exame dermatológico', 'Dermatite leve', 'Shampoo medicinal', 120.00, 'realizada', now(), now());

-- Insert sample medicamentos
INSERT INTO public.medicamentos (user_id, pet_id, nome, tipo, dosagem, frequencia, data_inicio, data_fim, veterinario, observacoes, status, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Carprovet', 'Anti-inflamatório', '25mg', '1x ao dia', '2024-02-15', '2024-02-25', 'Dr. Ana Costa', 'Administrar com comida', 'ativo', now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Amoxicilina', 'Antibiótico', '500mg', '2x ao dia', '2024-02-01', '2024-02-08', 'Dr. Ana Costa', 'Completar todo o tratamento', 'finalizado', now(), now()),
  ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Vermífugo', 'Antiparasitário', '1 comprimido', 'Dose única', '2024-01-20', '2024-01-20', 'Dr. Ana Costa', 'Repetir em 3 meses', 'finalizado', now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Shampoo Medicinal', 'Tópico', 'Conforme necessário', '2x por semana', '2024-02-10', '2024-03-10', 'Dr. Ana Costa', 'Deixar agir por 10 minutos', 'ativo', now(), now());

-- Insert sample vacinas
INSERT INTO public.vacinas (user_id, pet_id, nome, laboratorio, lote, data_aplicacao, data_proxima, veterinario, local_aplicacao, observacoes, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'V10', 'Zoetis', 'LOT123', '2024-01-15', '2025-01-15', 'Dr. Ana Costa', 'Subcutânea', 'Pet reagiu bem', now(), now()),
  ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'V4 Felina', 'Merial', 'LOT456', '2024-01-20', '2025-01-20', 'Dr. Ana Costa', 'Subcutânea', 'Primeira dose', now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Antirrábica', 'Instituto Butantan', 'LOT789', '2023-11-15', '2024-11-15', 'Dr. Ana Costa', 'Intramuscular', 'Vacina obrigatória', now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'V10', 'Zoetis', 'LOT321', '2023-12-01', '2024-12-01', 'Dr. Ana Costa', 'Subcutânea', 'Revacinação anual', now(), now()),
  ('11111111-1111-1111-1111-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'V4 Felina', 'Merial', 'LOT654', '2023-08-14', '2024-08-14', 'Dr. Ana Costa', 'Subcutânea', 'Primeira vacinação', now(), now());

-- Insert sample alimentacao
INSERT INTO public.alimentacao (user_id, pet_id, tipo_alimento, marca, quantidade, horarios, data_registro, observacoes, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Ração Premium', 'Royal Canin Golden Retriever', '300g por dia', ARRAY['08:00', '18:00'], '2024-02-15', 'Dividido em 2 refeições', now(), now()),
  ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Ração para Gatos', 'Whiskas Persa', '80g por dia', ARRAY['07:00', '12:00', '19:00'], '2024-02-15', 'Ração específica para gatos persas', now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Ração Premium', 'Pedigree Pastor Alemão', '400g por dia', ARRAY['07:30', '17:30'], '2024-02-15', 'Ração para cães de grande porte', now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Ração Premium', 'Hill\'s Labrador', '350g por dia', ARRAY['08:00', '18:00'], '2024-02-15', 'Controle de peso', now(), now()),
  ('11111111-1111-1111-1111-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Ração para Filhotes', 'Whiskas Filhote', '100g por dia', ARRAY['06:00', '12:00', '18:00'], '2024-02-15', 'Ração específica para filhotes', now(), now());

-- Insert sample peso records
INSERT INTO public.peso (user_id, pet_id, peso, data_pesagem, observacoes, created_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 28.5, '2024-02-15', 'Peso ideal', now()),
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 28.2, '2024-01-15', 'Leve perda de peso', now()),
  ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 4.2, '2024-02-15', 'Peso estável', now()),
  ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 4.0, '2024-01-20', 'Ganho de peso saudável', now()),
  ('22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 35.0, '2024-02-01', 'Peso adequado para a raça', now()),
  ('22222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 25.8, '2024-02-10', 'Peso controlado', now()),
  ('11111111-1111-1111-1111-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 3.5, '2024-02-14', 'Crescimento normal', now());

-- Insert sample galeria
INSERT INTO public.galeria (user_id, pet_id, titulo, descricao, url_imagem, data_foto, created_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Luna no parque', 'Brincando com a bolinha', '/placeholder.svg', '2024-02-10', now()),
  ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Mimi dormindo', 'Soneca da tarde', '/placeholder.svg', '2024-02-08', now()),
  ('22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Thor no jardim', 'Guardando a casa', '/placeholder.svg', '2024-02-05', now()),
  ('22222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Bella na praia', 'Primeiro passeio na praia', '/placeholder.svg', '2024-01-28', now()),
  ('11111111-1111-1111-1111-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Pipoca brincando', 'Com seu brinquedo favorito', '/placeholder.svg', '2024-02-12', now());

-- Insert sample lembretes
INSERT INTO public.lembretes (user_id, pet_id, titulo, descricao, data_lembrete, hora_lembrete, tipo, status, created_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Consulta de retorno', 'Avaliação do tratamento', '2024-02-20', '16:00', 'consulta', 'pendente', now()),
  ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Vermífugo', 'Administrar próxima dose', '2024-04-20', '09:00', 'medicamento', 'pendente', now()),
  ('22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Vacinação antirrábica', 'Renovar vacina antirrábica', '2024-11-15', '10:00', 'vacina', 'pendente', now()),
  ('22222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Banho e tosa', 'Higienização mensal', '2024-03-01', '14:00', 'banho', 'pendente', now()),
  ('11111111-1111-1111-1111-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Segunda dose V4', 'Completar vacinação', '2024-03-14', '11:00', 'vacina', 'pendente', now());

-- Insert some pet authorizations for demonstration
INSERT INTO public.pet_authorizations (pet_id, veterinario_profile_id, tutor_user_id, authorized_data, status, authorized_at, created_at, updated_at)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', (SELECT id FROM public.profiles WHERE user_id = '33333333-3333-3333-3333-333333333333'), '11111111-1111-1111-1111-111111111111', ARRAY['consultas', 'medicamentos', 'vacinas'], 'active', now(), now(), now()),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', (SELECT id FROM public.profiles WHERE user_id = '33333333-3333-3333-3333-333333333333'), '22222222-2222-2222-2222-222222222222', ARRAY['consultas', 'medicamentos', 'vacinas', 'peso'], 'active', now(), now(), now())
ON CONFLICT (pet_id, veterinario_profile_id) DO NOTHING;