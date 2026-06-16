
# Favela Business 🚀

A plataforma definitiva para impulsionar talentos da comunidade através de tecnologia, IA e visibilidade.

## 🛠️ Checklist de Configuração (Supabase)

Você já obteve a URL do projeto. Siga estes passos finais:

### 1. Variáveis de Ambiente
Configure estas chaves no seu ambiente de deploy (Vercel) ou arquivo `.env`:
- `SUPABASE_URL`: `https://jqosthyntotqcueokhvg.supabase.co`
- `SUPABASE_ANON_KEY`: (Pegue em Settings > API > anon/public no Supabase)
- `API_KEY`: (Sua chave do Google Gemini)

### 2. Criar Tabelas (SQL Editor)
Vá no **SQL Editor** do Supabase e execute:
```sql
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  avatar_url TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  terms_accepted BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE providers (
  id TEXT PRIMARY KEY,
  owner_id TEXT REFERENCES profiles(id),
  name TEXT NOT NULL,
  service_type TEXT,
  description TEXT,
  optimized_description TEXT,
  contact TEXT,
  category TEXT,
  location JSONB,
  image_url TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at BIGINT
);
```

### 3. Storage para Fotos
1. Vá em **Storage** no Supabase.
2. Crie um Bucket chamado `avatars`.
3. Mude para **Public** (essencial para as imagens aparecerem no site).

---
**Favela Business © 2025** - Transformando comunidades através da tecnologia.
