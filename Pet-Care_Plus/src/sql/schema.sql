-- Este arquivo contém os scripts SQL para criar as tabelas necessárias no Supabase.
-- Você pode executar este código no Editor SQL do seu painel Supabase.
-- Lembre-se de ativar as políticas de segurança (RLS) para cada tabela.

-- Tabela de Pets
CREATE TABLE IF NOT EXISTS pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    species VARCHAR(100),
    breed VARCHAR(100),
    birth_date DATE,
    weight NUMERIC(6, 2),
    gender VARCHAR(50),
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS para pets
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seus próprios pets.
CREATE POLICY "user_can_view_own_pets" ON pets
    FOR SELECT USING (auth.uid() = user_id);

-- Política: Usuários podem criar pets para si mesmos.
CREATE POLICY "user_can_create_own_pets" ON pets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar seus próprios pets.
CREATE POLICY "user_can_update_own_pets" ON pets
    FOR UPDATE USING (auth.uid() = user_id);


-- Tabela da Galeria de Fotos
CREATE TABLE IF NOT EXISTS gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS para galeria
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem gerenciar fotos de seus próprios pets.
CREATE POLICY "user_can_manage_own_gallery" ON gallery
    FOR ALL USING (auth.uid() = user_id);


-- Tabela de Acesso de Veterinários
CREATE TABLE IF NOT EXISTS vet_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vet_email VARCHAR(255) NOT NULL,
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    permissions JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(vet_email, pet_id)
);

-- Habilitar RLS para acesso de veterinários
ALTER TABLE vet_access ENABLE ROW LEVEL SECURITY;

-- Política: Tutores podem gerenciar o acesso que concederam.
CREATE POLICY "tutor_can_manage_own_vet_access" ON vet_access
    FOR ALL USING (auth.uid() = tutor_id);

-- Política: Veterinários podem ver os acessos concedidos a eles.
-- (Esta política requer uma tabela de perfis de veterinário ou uma função customizada
-- para verificar se o email do veterinário corresponde ao do usuário logado)
-- Exemplo simplificado (requer ajuste):
-- CREATE POLICY "vet_can_view_granted_access" ON vet_access
--     FOR SELECT USING (vet_email = (SELECT email FROM auth.users WHERE id = auth.uid()));