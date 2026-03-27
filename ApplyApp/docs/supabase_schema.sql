-- 1. Tabela de Exercícios (Master List)
CREATE TABLE public.exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Treinos (Sessões)
CREATE TABLE public.workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active', -- active, completed
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Exercícios do Treino (Execução/Pivot)
CREATE TABLE public.workout_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  sets INTEGER NOT NULL CHECK (sets > 0),
  reps INTEGER NOT NULL CHECK (reps > 0),
  weight DOUBLE PRECISION NOT NULL CHECK (weight >= 0),
  media_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;

-- Políticas (Policies)
-- Exercícios: Qualquer um pode ler (Read-Only)
CREATE POLICY "Public exercises are viewable by everyone" 
ON public.exercises FOR SELECT USING (true);

-- Treinos: Só o próprio usuário pode ver/editar
CREATE POLICY "Users can manage their own workouts" 
ON public.workouts FOR ALL USING (auth.uid() = user_id);

-- Exercícios do Treino: Só o dono do treino pode ver/editar
CREATE POLICY "Users can manage their own workout exercises" 
ON public.workout_exercises FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.workouts 
    WHERE public.workouts.id = workout_exercises.workout_id 
    AND public.workouts.user_id = auth.uid()
  )
);

-- Inserir alguns exercícios iniciais
INSERT INTO public.exercises (name, muscle_group) VALUES
('Supino Reto', 'Peito'),
('Agachamento', 'Pernas'),
('Puxada Alta', 'Costas'),
('Desenvolvimento', 'Ombros'),
('Rosca Direta', 'Bíceps'),
('Tríceps Pulley', 'Tríceps');
