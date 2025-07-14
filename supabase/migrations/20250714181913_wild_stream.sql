/*
  # Adicionar colunas para controle de entrega de camisas

  1. Novas Colunas na tabela registrations
    - `shirt_delivered` (boolean) - Se a camisa foi entregue
    - `shirt_delivery_date` (timestamptz) - Data da entrega
    - `shirt_delivery_notes` (text) - Observações sobre a entrega

  2. Alterações
    - Adicionar colunas com valores padrão apropriados
    - shirt_delivered padrão false (não entregue)
*/

-- Adicionar coluna para controle se a camisa foi entregue
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'shirt_delivered'
  ) THEN
    ALTER TABLE registrations ADD COLUMN shirt_delivered boolean DEFAULT false;
  END IF;
END $$;

-- Adicionar coluna para data de entrega da camisa
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'shirt_delivery_date'
  ) THEN
    ALTER TABLE registrations ADD COLUMN shirt_delivery_date timestamptz;
  END IF;
END $$;

-- Adicionar coluna para observações sobre a entrega
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'shirt_delivery_notes'
  ) THEN
    ALTER TABLE registrations ADD COLUMN shirt_delivery_notes text;
  END IF;
END $$;