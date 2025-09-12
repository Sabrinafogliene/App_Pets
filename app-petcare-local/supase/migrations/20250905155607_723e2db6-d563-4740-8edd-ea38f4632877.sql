-- Atualizar dados existentes para o usuário real
-- O user_id real é: cc9ae7f1-5cdd-4f76-b18f-51264177e63d

-- Atualizar pets
UPDATE pets 
SET user_id = 'cc9ae7f1-5cdd-4f76-b18f-51264177e63d'
WHERE user_id = '11111111-1111-1111-1111-111111111111';

-- Atualizar consultas
UPDATE consultas 
SET user_id = 'cc9ae7f1-5cdd-4f76-b18f-51264177e63d'
WHERE user_id = '11111111-1111-1111-1111-111111111111';

-- Atualizar medicamentos
UPDATE medicamentos 
SET user_id = 'cc9ae7f1-5cdd-4f76-b18f-51264177e63d'
WHERE user_id = '11111111-1111-1111-1111-111111111111';

-- Atualizar vacinas
UPDATE vacinas 
SET user_id = 'cc9ae7f1-5cdd-4f76-b18f-51264177e63d'
WHERE user_id = '11111111-1111-1111-1111-111111111111';

-- Atualizar peso
UPDATE peso 
SET user_id = 'cc9ae7f1-5cdd-4f76-b18f-51264177e63d'
WHERE user_id = '11111111-1111-1111-1111-111111111111';

-- Atualizar lembretes
UPDATE lembretes 
SET user_id = 'cc9ae7f1-5cdd-4f76-b18f-51264177e63d'
WHERE user_id = '11111111-1111-1111-1111-111111111111';

-- Atualizar alimentacao
UPDATE alimentacao 
SET user_id = 'cc9ae7f1-5cdd-4f76-b18f-51264177e63d'
WHERE user_id = '11111111-1111-1111-1111-111111111111';

-- Atualizar galeria
UPDATE galeria 
SET user_id = 'cc9ae7f1-5cdd-4f76-b18f-51264177e63d'
WHERE user_id = '11111111-1111-1111-1111-111111111111';