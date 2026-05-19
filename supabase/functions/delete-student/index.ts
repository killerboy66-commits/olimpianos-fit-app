import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "DELETE, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    let userId = url.pathname.split("/").filter(Boolean).pop();

    if (req.method === "POST" && !userId) {
      const body = await req.json().catch(() => ({}));
      userId = body.userId;
    }

    console.log("ID recebido:", userId);

    if (!userId || userId === "delete-student") {
      return new Response(JSON.stringify({ error: "ID do aluno não informado." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const tabelas = [
      "atribuicoes",
      "ficha_treino_itens",
      "periodizacoes",
      "cronogramas",
      "student_notes",
      "avaliacoes_fisicas",
      "progresso",
      "exercise_loads",
    ];

    for (const tabela of tabelas) {
      const { error } = await supabaseAdmin.from(tabela).delete().eq("user_id", userId);

      if (error) {
        console.log(`Erro ao limpar ${tabela}:`, error.message);
      } else {
        console.log(`Limpeza OK: ${tabela}`);
      }
    }

    const { error: dbError } = await supabaseAdmin
      .from("usuarios")
      .delete()
      .eq("id", userId);

    if (dbError) {
      console.log("Erro ao excluir da tabela usuarios:", dbError.message);

      return new Response(JSON.stringify({ error: dbError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.log("Erro ao excluir do Auth:", authError.message);

      return new Response(JSON.stringify({ error: authError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.log("Erro geral:", err);

    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});