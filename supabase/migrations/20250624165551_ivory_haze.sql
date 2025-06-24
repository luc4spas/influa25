/*
  # Atualizar schema para Influa Conference 2025

  1. Alterações na tabela registrations
    - Remover coluna church
    - Adicionar coluna shirt_size (P, M, G)
    - Adicionar coluna guardian_name (para menores de 18 anos)

  2. Notas
    - Usar ALTER TABLE para modificar a estrutura existente
    - Manter compatibilidade com dados existentes
*/

-- Adicionar nova coluna para tamanho da camisa
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'shirt_size'
  ) THEN
    ALTER TABLE registrations ADD COLUMN shirt_size text NOT NULL DEFAULT 'M';
  END IF;
END $$;

-- Adicionar nova coluna para nome do responsável
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'guardian_name'
  ) THEN
    ALTER TABLE registrations ADD COLUMN guardian_name text;
  END IF;
END $$;

-- Remover coluna church se existir
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'church'
  ) THEN
    ALTER TABLE registrations DROP COLUMN church;
  END IF;
END $$;