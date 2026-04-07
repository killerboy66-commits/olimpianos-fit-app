export async function getAIAdvice(message: string) {
  console.log("⚠️ IA externa desativada. Retornando resposta local.");

  if (!message?.trim()) {
    return "Envie sua dúvida para o Zeus.";
  }

  return `Zeus IA está em modo local no momento. Recebi sua mensagem: "${message}". Em breve vamos substituir essa resposta por uma lógica interna do app.`;
}

export const geminiService = {
  async generateText(prompt?: string) {
    if (!prompt?.trim()) {
      return "IA desativada";
    }

    return `IA desativada. Texto recebido: "${prompt}"`;
  },

  async generatePlan() {
    return null;
  },
};