-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table for user data
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT,
    email TEXT,
    telefone TEXT,
    endereco TEXT,
    foto_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pets table
CREATE TABLE public.pets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    especie TEXT NOT NULL,
    raca TEXT,
    idade INTEGER,
    peso DECIMAL(5,2),
    data_nascimento DATE,
    cor TEXT,
    sexo TEXT CHECK (sexo IN ('macho', 'femea')),
    castrado BOOLEAN DEFAULT false,
    microchip TEXT,
    foto_url TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create veterinarios table
CREATE TABLE public.veterinarios (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    clinica TEXT,
    telefone TEXT,
    email TEXT,
    endereco TEXT,
    especialidade TEXT,
    crmv TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create consultas table
CREATE TABLE public.consultas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    veterinario_id UUID REFERENCES public.veterinarios(id) ON DELETE SET NULL,
    data_consulta DATE NOT NULL,
    hora_consulta TIME,
    tipo TEXT NOT NULL,
    descricao TEXT,
    diagnostico TEXT,
    tratamento TEXT,
    observacoes TEXT,
    valor DECIMAL(10,2),
    status TEXT NOT NULL DEFAULT 'agendada' CHECK (status IN ('agendada', 'realizada', 'cancelada')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medicamentos table
CREATE TABLE public.medicamentos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    tipo TEXT,
    dosagem TEXT,
    frequencia TEXT,
    data_inicio DATE NOT NULL,
    data_fim DATE,
    veterinario TEXT,
    observacoes TEXT,
    status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'finalizado', 'pausado')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vacinas table
CREATE TABLE public.vacinas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    laboratorio TEXT,
    lote TEXT,
    data_aplicacao DATE NOT NULL,
    data_proxima DATE,
    veterinario TEXT,
    local_aplicacao TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create alimentacao table
CREATE TABLE public.alimentacao (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    tipo_alimento TEXT NOT NULL,
    marca TEXT,
    quantidade TEXT,
    horarios TEXT[], -- Array of feeding times
    data_registro DATE NOT NULL DEFAULT CURRENT_DATE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create peso table
CREATE TABLE public.peso (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    peso DECIMAL(5,2) NOT NULL,
    data_pesagem DATE NOT NULL DEFAULT CURRENT_DATE,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create galeria table
CREATE TABLE public.galeria (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE,
    titulo TEXT,
    descricao TEXT,
    url_imagem TEXT NOT NULL,
    data_foto DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lembretes table
CREATE TABLE public.lembretes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descricao TEXT,
    data_lembrete DATE NOT NULL,
    hora_lembrete TIME,
    tipo TEXT NOT NULL CHECK (tipo IN ('consulta', 'medicamento', 'vacina', 'banho', 'outro')),
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'concluido', 'cancelado')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veterinarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alimentacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peso ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galeria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lembretes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for pets
CREATE POLICY "Users can view their own pets" ON public.pets
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own pets" ON public.pets
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own pets" ON public.pets
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own pets" ON public.pets
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for veterinarios
CREATE POLICY "Users can view their own veterinarios" ON public.veterinarios
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own veterinarios" ON public.veterinarios
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own veterinarios" ON public.veterinarios
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own veterinarios" ON public.veterinarios
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for consultas
CREATE POLICY "Users can view their own consultas" ON public.consultas
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own consultas" ON public.consultas
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own consultas" ON public.consultas
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own consultas" ON public.consultas
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for medicamentos
CREATE POLICY "Users can view their own medicamentos" ON public.medicamentos
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own medicamentos" ON public.medicamentos
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own medicamentos" ON public.medicamentos
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own medicamentos" ON public.medicamentos
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for vacinas
CREATE POLICY "Users can view their own vacinas" ON public.vacinas
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own vacinas" ON public.vacinas
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own vacinas" ON public.vacinas
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own vacinas" ON public.vacinas
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for alimentacao
CREATE POLICY "Users can view their own alimentacao" ON public.alimentacao
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own alimentacao" ON public.alimentacao
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own alimentacao" ON public.alimentacao
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own alimentacao" ON public.alimentacao
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for peso
CREATE POLICY "Users can view their own peso records" ON public.peso
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own peso records" ON public.peso
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own peso records" ON public.peso
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own peso records" ON public.peso
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for galeria
CREATE POLICY "Users can view their own galeria" ON public.galeria
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own galeria" ON public.galeria
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own galeria" ON public.galeria
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own galeria" ON public.galeria
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for lembretes
CREATE POLICY "Users can view their own lembretes" ON public.lembretes
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own lembretes" ON public.lembretes
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own lembretes" ON public.lembretes
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own lembretes" ON public.lembretes
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON public.pets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_consultas_updated_at BEFORE UPDATE ON public.consultas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_medicamentos_updated_at BEFORE UPDATE ON public.medicamentos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vacinas_updated_at BEFORE UPDATE ON public.vacinas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_alimentacao_updated_at BEFORE UPDATE ON public.alimentacao FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup and create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, nome, email)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'nome', NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_pets_user_id ON public.pets(user_id);
CREATE INDEX idx_consultas_user_id ON public.consultas(user_id);
CREATE INDEX idx_consultas_pet_id ON public.consultas(pet_id);
CREATE INDEX idx_medicamentos_user_id ON public.medicamentos(user_id);
CREATE INDEX idx_medicamentos_pet_id ON public.medicamentos(pet_id);
CREATE INDEX idx_vacinas_user_id ON public.vacinas(user_id);
CREATE INDEX idx_vacinas_pet_id ON public.vacinas(pet_id);
CREATE INDEX idx_alimentacao_user_id ON public.alimentacao(user_id);
CREATE INDEX idx_alimentacao_pet_id ON public.alimentacao(pet_id);
CREATE INDEX idx_peso_user_id ON public.peso(user_id);
CREATE INDEX idx_peso_pet_id ON public.peso(pet_id);
CREATE INDEX idx_galeria_user_id ON public.galeria(user_id);
CREATE INDEX idx_galeria_pet_id ON public.galeria(pet_id);
CREATE INDEX idx_lembretes_user_id ON public.lembretes(user_id);
CREATE INDEX idx_lembretes_data ON public.lembretes(data_lembrete);

-- Create storage bucket for pet photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'pet-photos',
    'pet-photos',
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Create storage policies for pet photos
CREATE POLICY "Users can view all pet photos" ON storage.objects
    FOR SELECT USING (bucket_id = 'pet-photos');

CREATE POLICY "Users can upload their own pet photos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'pet-photos' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own pet photos" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'pet-photos' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own pet photos" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'pet-photos' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );