/*
  # Adicionar gestão financeira

  1. Alterações na tabela registrations
    - `payment_amount` (decimal) - Valor pago
    - `payment_bank` (text) - Banco onde foi feito o PIX

  2. Nova tabela expenses
    - `id` (uuid, primary key)
    - `created_at` (timestamp)
    - `amount` (decimal) - Valor da despesa
    - `category` (text) - Categoria da despesa
    - `description` (text) - Descrição da despesa
    - `receipt_url` (text) - URL do comprovante/nota fiscal
    - `receipt_filename` (text) - Nome do arquivo original

  3. Security
    - Enable RLS on expenses table
    - Add policies for authenticated users
*/

-- Adicionar colunas de valor e banco na tabela registrations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'payment_amount'
  ) THEN
    ALTER TABLE registrations ADD COLUMN payment_amount decimal(10,2);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'registrations' AND column_name = 'payment_bank'
  ) THEN
    ALTER TABLE registrations ADD COLUMN payment_bank text;
  END IF;
END $$;

-- Criar tabela de despesas
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  amount decimal(10,2) NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  receipt_url text,
  receipt_filename text
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view expenses"
  ON expenses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert expenses"
  ON expenses
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update expenses"
  ON expenses
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete expenses"
  ON expenses
  FOR DELETE
  TO authenticated
  USING (true);