-- Caderno RD · Setup Supabase
-- Cole no SQL Editor do seu projeto e clique em Run

CREATE TABLE IF NOT EXISTS caderno_respostas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campo TEXT NOT NULL UNIQUE,
  valor TEXT DEFAULT '',
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN NEW.atualizado_em = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_atualizado_em
  BEFORE UPDATE ON caderno_respostas
  FOR EACH ROW EXECUTE FUNCTION update_atualizado_em();

ALTER TABLE caderno_respostas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "acesso_anon"
  ON caderno_respostas FOR ALL TO anon
  USING (true) WITH CHECK (true);
