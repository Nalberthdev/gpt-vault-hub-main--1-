# 🤖 GPT Personalizado - Sistema Completo

Um sistema completo de GPT personalizado com controle de acesso, upload de arquivos e interface inspirada no ChatGPT 2025.

## ✨ Características Principais

### 🔐 Sistema de Autenticação
- **Dois tipos de usuário**: Admin e Usuário Comum
- **Login simulado** com credenciais de demonstração
- **Estrutura preparada** para integração futura com Supabase Auth
- **Gerenciamento de permissões** baseado em roles

### 👥 Controle de Permissões

#### 👑 Administrador
- ✅ Acesso total à API
- ✅ Upload e download ilimitado
- ✅ Geração de relatórios e dashboards
- ✅ Gerenciamento de usuários (adicionar, editar, excluir)
- ✅ Comandos administrativos avançados

#### 👤 Usuário Comum
- ✅ Upload restrito (configurável por admin)
- ✅ Download limitado a arquivos autorizados
- ✅ Assistência inteligente via GPT
- ✅ Comandos básicos de análise

### 📁 Upload e Processamento de Arquivos
- **Tipos suportados**: PDF, CSV, DOCX, TXT
- **Análise automática** de conteúdo
- **Extração de dados** de arquivos
- **Geração de relatórios** baseados no conteúdo
- **Validação de limites** por perfil de usuário

### 🎨 Design e Interface
- **Inspirado no ChatGPT 2025** com cores e animações modernas
- **Ícones minimalistas** estilo Apple usando Lucide React
- **Tema claro/escuro** com preferência salva localmente
- **Totalmente responsivo** para desktop e mobile
- **Sistema de design** centralizado com tokens semânticos

### 🤖 GPT Contextual
- **Respostas adaptadas** ao perfil do usuário
- **Comandos inteligentes** reconhecidos automaticamente
- **Contexto de sessão** mantido entre mensagens
- **Interface de chat** fluida com indicadores de digitação

## 🚀 Como Usar

### 📊 Contas de Demonstração

| Tipo | Email | Senha | Funcionalidades |
|------|-------|-------|-----------------|
| **Admin** | `admin@gpt.com` | `admin123` | Acesso total + gerenciamento |
| **Usuário** | `joao@email.com` | `user123` | Funcionalidades básicas |
| **Usuário** | `maria@email.com` | `user123` | Funcionalidades básicas |

### 🎯 Comandos Suportados

#### 📋 Análise de Arquivos
- `"Quero enviar um PDF para análise"`
- `"Preciso processar um arquivo CSV"`
- `"Faça um resumo do documento"`

#### 📊 Relatórios
- `"Gere um relatório com base nos dados"`
- `"Quero ver estatísticas dos meus dados"`
- `"Crie gráficos visuais"`

#### 💾 Downloads
- `"Quero baixar o relatório em PDF"`
- `"Exportar dados em CSV"`
- `"Download dos gráficos"`

#### ⚙️ Sistema
- `"Ativar tema escuro"`
- `"Ativar tema claro"`
- `"Mostrar comandos disponíveis"`

### 🛠️ Painel Administrativo

O painel admin permite:
- **Visualizar todos os usuários** com estatísticas
- **Adicionar novos usuários** com permissões personalizadas
- **Editar usuários existentes** (nome, email, limites)
- **Excluir usuários** com confirmação de segurança
- **Monitorar atividade** e últimos logins

## 🏗️ Arquitetura Técnica

### 📂 Estrutura de Pastas
```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes base (shadcn/ui)
│   ├── LoginForm.tsx   # Formulário de login
│   ├── ChatInterface.tsx # Interface de chat
│   ├── AdminPanel.tsx  # Painel administrativo
│   ├── CommandDemo.tsx # Demonstração de comandos
│   └── MainLayout.tsx  # Layout principal
├── contexts/           # Contextos React
│   ├── AuthContext.tsx # Autenticação e usuários
│   ├── ThemeContext.tsx # Controle de tema
│   └── ChatContext.tsx # Gerenciamento do chat
├── pages/              # Páginas da aplicação
│   ├── Index.tsx       # Página principal
│   └── NotFound.tsx    # Página 404
└── lib/                # Utilitários
    └── utils.ts        # Funções auxiliares
```

### 🎨 Sistema de Design
- **Cores HSL** definidas em CSS custom properties
- **Tokens semânticos** para consistência
- **Variantes customizadas** em componentes shadcn
- **Gradientes e sombras** modernas
- **Animações suaves** com cubic-bezier

### 🔄 Gerenciamento de Estado
- **AuthContext**: Autenticação e gerenciamento de usuários
- **ThemeContext**: Controle de tema claro/escuro
- **ChatContext**: Mensagens e interações do chat
- **LocalStorage**: Persistência de preferências

## 🛠️ Instalação e Desenvolvimento

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Comandos
```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 🔮 Integração Futura com Supabase

O sistema foi arquitetado para facilitar a integração com Supabase:

### 🔄 Migração de Autenticação
- **AuthContext** pode ser facilmente adaptado para Supabase Auth
- **Estrutura de usuários** já compatível com tabelas SQL
- **Permissões** mapeáveis para Row Level Security (RLS)

### 💾 Armazenamento de Arquivos
- **Upload de arquivos** pode usar Supabase Storage
- **URLs de download** já estruturadas no sistema
- **Metadados de arquivos** prontos para banco de dados

### 🗄️ Banco de Dados
```sql
-- Tabela de usuários (esquema sugerido)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('admin', 'user')) DEFAULT 'user',
  upload_limit INTEGER,
  download_limit INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- Tabela de arquivos
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 🔐 Políticas de RLS

O script `supabase_policies.sql` contém um conjunto de políticas de segurança para
garantir que os dados inseridos em `appointments`, `available_slots` e `profiles`
respeitem as regras de acesso. Para aplicá-las, execute o arquivo no console SQL
do Supabase:

```bash
psql $DB_URL -f supabase_policies.sql
```

Essas políticas permitem que qualquer usuário autenticado crie agendamentos,
enquanto a gestão de horários disponíveis fica restrita a administradores
(campo `is_admin` na tabela `profiles`).

## 🎯 Casos de Uso

### 👤 Usuário Comum
1. **Login** com credenciais
2. **Upload** de documento pessoal (PDF, CSV)
3. **Conversa** com GPT sobre o arquivo
4. **Download** de relatório gerado
5. **Alternância** de tema conforme preferência

### 👑 Administrador
1. **Login** com privilégios admin
2. **Visualização** de dashboard com métricas
3. **Adição** de novos usuários
4. **Configuração** de limites e permissões
5. **Análise** de atividade do sistema
6. **Processamento** de múltiplos arquivos simultaneamente

## 📈 Próximos Passos

### 🚀 Funcionalidades Planejadas
- [ ] **Integração Supabase** completa
- [ ] **API de processamento** de arquivos real
- [ ] **Notificações** em tempo real
- [ ] **Histórico** de conversas
- [ ] **Exportação** avançada de dados
- [ ] **API externa** para integrações

### 🔧 Melhorias Técnicas
- [ ] **Testes unitários** com Jest
- [ ] **Testes E2E** com Playwright
- [ ] **PWA** para instalação mobile
- [ ] **Service Workers** para offline
- [ ] **Performance** otimizada

## 🤝 Contribuição

Este sistema foi criado como uma base sólida e modular. A arquitetura permite:
- **Fácil extensão** de funcionalidades
- **Manutenção** simplificada
- **Integração** com backends reais
- **Customização** de design e comportamento

---

💡 **Dica**: Explore todos os comandos disponíveis na aba "Comandos" da interface para ver o potencial completo do sistema!