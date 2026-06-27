-- ============================================================
-- CONTROLE GERENCIAL CLIMAX — Esquema PostgreSQL (Railway)
-- Versão: 1.0 | Para migrar do localStorage para banco real
-- ============================================================

-- Usuários e sessões
CREATE TABLE users (
  id           SERIAL PRIMARY KEY,
  username     VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,           -- bcrypt
  role         VARCHAR(20) NOT NULL CHECK (role IN ('funcionario','proprietario')),
  display_name VARCHAR(100),
  active       BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Importações de arquivo de vendas
CREATE TABLE importacoes (
  id          SERIAL PRIMARY KEY,
  file_name   VARCHAR(255),
  imported_by INTEGER REFERENCES users(id),
  imported_at TIMESTAMPTZ DEFAULT NOW(),
  raw_json    JSONB  -- cópia bruta dos dados lidos
);

-- Itens de estoque (por importação)
CREATE TABLE estoque_items (
  id               SERIAL PRIMARY KEY,
  importacao_id    INTEGER REFERENCES importacoes(id) ON DELETE CASCADE,
  system_name      VARCHAR(255) NOT NULL,  -- nome original do PDV
  alias            VARCHAR(255),           -- nome renomeado pelo admin
  estoque_inicial  NUMERIC(10,3) DEFAULT 0,
  estoque_venda    NUMERIC(10,3) DEFAULT 0,
  estoque_final    NUMERIC(10,3) DEFAULT 0,
  vendas           NUMERIC(10,3) DEFAULT 0,
  -- campos calculados (podem ser GENERATED ou calculados na query):
  -- movimentacao = estoque_final - estoque_inicial
  -- auditoria    = vendas - movimentacao
  deleted          BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Log de auditoria (append-only)
CREATE TABLE audit_log (
  id          BIGSERIAL PRIMARY KEY,
  action      VARCHAR(50) NOT NULL,  -- SALVAR_ESTOQUE | EDITAR_ITEM | EXCLUIR_ITEM | RENOMEAR_ITEM
  user_id     INTEGER REFERENCES users(id),
  item_id     INTEGER REFERENCES estoque_items(id),
  field_name  VARCHAR(50),
  old_value   TEXT,
  new_value   TEXT,
  details     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Aliases globais (nome_sistema → alias, por usuário admin)
CREATE TABLE item_aliases (
  system_name VARCHAR(255) PRIMARY KEY,
  alias       VARCHAR(255) NOT NULL,
  updated_by  INTEGER REFERENCES users(id),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_estoque_importacao ON estoque_items(importacao_id);
CREATE INDEX idx_audit_log_created  ON audit_log(created_at DESC);
CREATE INDEX idx_audit_log_user     ON audit_log(user_id);

-- ============================================================
-- VIEW: resumo de auditoria para dashboard
-- ============================================================
CREATE OR REPLACE VIEW vw_auditoria_divergencias AS
SELECT
  ei.id,
  ei.system_name,
  COALESCE(ia.alias, ei.system_name) AS display_name,
  ei.estoque_inicial,
  ei.estoque_final,
  ei.vendas,
  (ei.estoque_final - ei.estoque_inicial)           AS movimentacao,
  (ei.vendas - (ei.estoque_final - ei.estoque_inicial)) AS diferenca,
  i.file_name,
  i.imported_at
FROM estoque_items ei
JOIN importacoes i ON ei.importacao_id = i.id
LEFT JOIN item_aliases ia ON ia.system_name = ei.system_name
WHERE ei.deleted = FALSE
  AND (ei.vendas - (ei.estoque_final - ei.estoque_inicial)) <> 0;
