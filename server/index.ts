import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("VITE_SUPABASE_URL carregada?", !!supabaseUrl);
console.log("SUPABASE_SERVICE_ROLE_KEY carregada?", !!supabaseServiceRoleKey);

if (!supabaseUrl) {
  throw new Error("Falta VITE_SUPABASE_URL no .env");
}

if (!supabaseServiceRoleKey) {
  throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY no .env");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// log simples de todas as requisições
app.use((req, _res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  next();
});

app.get("/", (_req, res) => {
  res.json({ ok: true, message: "API do Olimpianos Fit online" });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, message: "API do Olimpianos Fit online" });
});

app.post("/create-student", async (req, res) => {
  try {
    console.log("📥 body recebido em /create-student:", req.body);

    const { nome, email, senha, objetivo, foto } = req.body;

    const normalizedName = String(nome || "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedPassword = String(senha || "");
    const normalizedGoal = String(objetivo || "").trim();
    const normalizedPhoto = String(foto || "").trim();

    if (!normalizedName) {
      return res.status(400).json({ error: "Nome é obrigatório." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: "E-mail inválido." });
    }

    if (normalizedPassword.length < 6) {
      return res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres." });
    }

    console.log("🔐 Criando usuário no Auth:", normalizedEmail);

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        password: normalizedPassword,
        email_confirm: true,
      });

    if (authError) {
      console.error("❌ authError createUser:", authError);
      return res.status(400).json({ error: authError.message });
    }

    if (!authData?.user?.id) {
      console.error("❌ authData sem user.id:", authData);
      return res.status(400).json({ error: "Não foi possível criar o usuário no Auth." });
    }

    const authUserId = authData.user.id;
    console.log("✅ Usuário criado no Auth:", authUserId);

    console.log("💾 Inserindo em usuarios...");

    const { error: dbError } = await supabaseAdmin.from("usuarios").insert({
      id: authUserId,
      nome: normalizedName,
      email: normalizedEmail,
      objetivo: normalizedGoal,
      foto: normalizedPhoto,
      role: "aluno",
      status: "ativo",
    });

    if (dbError) {
      console.error("❌ dbError insert usuarios:", dbError);

      await supabaseAdmin.auth.admin.deleteUser(authUserId);

      return res.status(400).json({ error: dbError.message });
    }

    console.log("✅ Aluno salvo na tabela usuarios");

    return res.json({
      ok: true,
      message: "Aluno criado com sucesso.",
      userId: authUserId,
    });
  } catch (error) {
    console.error("❌ Erro em /create-student:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
});

const deleteStudentHandler = async (req: express.Request, res: express.Response) => {
  try {
    const userId = String(req.params.id || "").trim();

    console.log("🗑️ Tentando excluir aluno:", userId);

    if (!userId) {
      return res.status(400).json({ error: "ID não informado." });
    }

    const { data: userData, error: userFetchError } = await supabaseAdmin
      .from("usuarios")
      .select("id, email")
      .eq("id", userId)
      .maybeSingle();

    if (userFetchError) {
      console.error("❌ userFetchError:", userFetchError);
      return res.status(400).json({ error: userFetchError.message });
    }

    if (!userData) {
      return res.status(404).json({ error: `Aluno não encontrado para o id ${userId}.` });
    }

    console.log("✅ Aluno encontrado:", userData);

    const cleanupResults = await Promise.allSettled([
      supabaseAdmin.from("atribuicoes").delete().eq("user_id", userId),
      supabaseAdmin.from("ficha_treino_itens").delete().eq("user_id", userId),
      supabaseAdmin.from("periodizacoes").delete().eq("user_id", userId),
      supabaseAdmin.from("cronogramas").delete().eq("user_id", userId),
      supabaseAdmin.from("student_notes").delete().eq("user_id", userId),
      supabaseAdmin.from("avaliacoes_fisicas").delete().eq("user_id", userId),
      supabaseAdmin.from("progresso").delete().eq("user_id", userId),
      supabaseAdmin.from("exercise_loads").delete().eq("user_id", userId),
    ]);

    console.log("🧹 cleanupResults:", cleanupResults);

    const { error: dbError } = await supabaseAdmin
      .from("usuarios")
      .delete()
      .eq("id", userId);

    if (dbError) {
      console.error("❌ dbError delete usuarios:", dbError);
      return res.status(400).json({ error: dbError.message });
    }

    console.log("✅ Registro removido da tabela usuarios");

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error("❌ authError deleteUser:", authError);
    } else {
      console.log("✅ Usuário removido do Auth");
    }

    return res.json({
      ok: true,
      message: "Aluno excluído com sucesso.",
    });
  } catch (error) {
    console.error("❌ Erro em /delete-student/:id:", error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
};

// registra os dois métodos
app.delete("/delete-student/:id", deleteStudentHandler);
app.post("/delete-student/:id", deleteStudentHandler);

app.listen(PORT, () => {
  console.log(`✅ API rodando em http://localhost:${PORT}`);
});