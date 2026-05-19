import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const userId = url.pathname.split("/").pop();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "ID do aluno não informado." }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    await Promise.allSettled([
      supabaseAdmin.from("atribuicoes").delete().eq("user_id", userId),
      supabaseAdmin.from("ficha_treino_itens").delete().eq("user_id", userId),
      supabaseAdmin.from("periodizacoes").delete().eq("user_id", userId),
      supabaseAdmin.from("cronogramas").delete().eq("user_id", userId),
      supabaseAdmin.from("student_notes").delete().eq("user_id", userId),
      supabaseAdmin.from("avaliacoes_fisicas").delete().eq("user_id", userId),
      supabaseAdmin.from("progresso").delete().eq("user_id", userId),
      supabaseAdmin.from("exercise_loads").delete().eq("user_id", userId),
    ]);

    const { error: dbError } = await supabaseAdmin
      .from("usuarios")
      .delete()
      .eq("id", userId);

    if (dbError) {
      return new Response(JSON.stringify({ error: dbError.message }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    const { error: authError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});