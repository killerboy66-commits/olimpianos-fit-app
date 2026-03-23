# Olimpianos Fit - Sistema de Gestão de Treinos

Este é um sistema completo para personal trainers gerenciarem seus alunos, periodizações e treinos mensais.

## 🚀 Como Rodar Localmente

1.  **Clone o repositório:**
    ```bash
    git clone <seu-repositorio-url>
    cd olimpianos-fit
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente:**
    Crie um arquivo `.env` na raiz do projeto e preencha com suas credenciais do Supabase e Google AI:
    ```env
    VITE_SUPABASE_URL=seu_url_do_supabase
    VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
    GEMINI_API_KEY=sua_chave_da_google_ai
    ```

4.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

## 🌐 Deploy (Vercel / Netlify)

Para colocar o site no ar:

1.  Conecte seu repositório do GitHub à **Vercel** ou **Netlify**.
2.  Nas configurações de **Environment Variables** do projeto, adicione as mesmas chaves do arquivo `.env`:
    *   `VITE_SUPABASE_URL`
    *   `VITE_SUPABASE_ANON_KEY`
    *   `GEMINI_API_KEY`
3.  O deploy será feito automaticamente!

## 🛠️ Tecnologias Utilizadas

*   **React + Vite**
*   **Tailwind CSS**
*   **Supabase** (Banco de Dados e Autenticação)
*   **Google Gemini AI** (Geração de Logos e Assistência)
*   **Lucide React** (Ícones)
*   **Framer Motion** (Animações)
