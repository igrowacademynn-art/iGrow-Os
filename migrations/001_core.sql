CREATE TABLE IF NOT EXISTS migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS records (
 id uuid PRIMARY KEY, kind text NOT NULL, data jsonb NOT NULL,
 version integer NOT NULL DEFAULT 1,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS records_kind_idx ON records(kind,created_at DESC);
CREATE INDEX IF NOT EXISTS records_data_idx ON records USING gin(data jsonb_path_ops);
CREATE UNIQUE INDEX IF NOT EXISTS unique_attendance ON records((data->>'studentId'),(data->>'batchId'),(data->>'date')) WHERE kind='attendance';
CREATE UNIQUE INDEX IF NOT EXISTS one_open_visit ON records((data->>'studentId')) WHERE kind='visits' AND data->>'exitAt' IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS unique_sku ON records(lower(data->>'sku')) WHERE kind='items';
CREATE TABLE IF NOT EXISTS users (
 id uuid PRIMARY KEY, name text NOT NULL, email text NOT NULL UNIQUE, password_hash text NOT NULL,
 role text NOT NULL CHECK(role IN ('admin','frontdesk','teacher','accounts','parent')),
 family_id uuid REFERENCES records(id), active boolean NOT NULL DEFAULT true,
 CHECK(role!='parent' OR family_id IS NOT NULL)
);
CREATE TABLE IF NOT EXISTS sessions (
 token_hash text PRIMARY KEY, user_id uuid NOT NULL REFERENCES users(id), expires_at timestamptz NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);
CREATE TABLE IF NOT EXISTS login_attempts (key text PRIMARY KEY, failures integer NOT NULL DEFAULT 0, blocked_until timestamptz);
CREATE TABLE IF NOT EXISTS audit (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, actor_id uuid REFERENCES users(id),
 action text NOT NULL, record_id uuid, before_data jsonb, after_data jsonb,
 reason text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS private_files (
 record_id uuid PRIMARY KEY REFERENCES records(id), bytes bytea NOT NULL, mime text NOT NULL,
 CHECK(octet_length(bytes)<=2097152)
);
CREATE TABLE IF NOT EXISTS idempotency (key uuid PRIMARY KEY, actor_id uuid NOT NULL REFERENCES users(id), response jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE SEQUENCE IF NOT EXISTS receipt_seq;
CREATE TABLE IF NOT EXISTS bootstrap (singleton boolean PRIMARY KEY DEFAULT true CHECK(singleton), completed_at timestamptz NOT NULL DEFAULT now());
