import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "online",
      system: "Mateus Araujo Portfolio OS",
      timestamp: new Date().toISOString()
    });
  });

  // Contact form endpoint
  app.post("/api/contact", (req, res) => {
    const { name, email, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: "Por favor, preencha todos os campos (nome, email, mensagem)."
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Por favor, informe um endereço de email válido."
      });
    }

    console.log(`[CONTACT RECEIVED] De: ${name} <${email}>: ${message}`);

    return res.json({
      success: true,
      message: `Obrigado pelo contato, ${name}! Sua mensagem foi registrada com sucesso no sistema de Mateus Araujo.`,
      ticketId: `TICK-${Math.floor(100000 + Math.random() * 900000)}`
    });
  });

  // AI Prompt Engineer Assistant Endpoint
  app.post("/api/ai/prompt-engineer", async (req, res) => {
    const { promptText, taskType } = req.body || {};

    if (!promptText) {
      return res.status(400).json({ error: "O texto do prompt é obrigatório." });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const systemInstruction = `Você é o assistente virtual de Engenharia de Prompt no Portfólio de Mateus Araujo. 
Sua missão é otimizar o prompt fornecido pelo usuário tornando-o claro, estruturado, sem ambiguidades e pronto para ser usado em LLMs (como Gemini ou GPT-4).
Formate sua resposta em português com:
1. PROMPT OTIMIZADO (com Persona, Contexto, Instrução Clara e Formato de Saída)
2. EXPLICAÇÃO DAS MELHORIAS REALIZADAS
3. DICAS DE DESEMPENHO (Token efficiency, Few-shotting)`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            { role: 'user', parts: [{ text: `Otimize o seguinte prompt/instrução [Tipo de tarefa: ${taskType || 'Geral'}]:\n\n"${promptText}"` }] }
          ],
          config: {
            systemInstruction,
            temperature: 0.7,
            maxOutputTokens: 1000,
          }
        });

        const reply = response.text || "Prompt processado com sucesso.";
        return res.json({ success: true, optimizedResult: reply, isLiveAI: true });
      } catch (err) {
        console.error("Erro na API do Gemini:", err);
        // Fallback below
      }
    }

    // Offline / Fallback Prompt Optimization Engine
    const fallbackResponse = `### 🚀 PROMPT OTIMIZADO (SISTEMA MATEUS ARAUJO)

**[PERSONA]**
Você é um especialista sênior em ${taskType || 'Gestão e Tecnologia'}.

**[CONTEXTO]**
Você precisa responder com extrema precisão, sem rodeios ou alucinações, focando em entregar valor direto.

**[INSTRUÇÃO PRINCIPAL]**
${promptText}

**[RESCRIÇÃO E FORMATO DE SAÍDA]**
- Responda em tópicos claros e objetivos.
- Utilize tabelas ou tópicos curtos sempre que aplicável.
- Se houver incerteza sobre algum dado, declare explicitamente em vez de inventar.

---
### 💡 MELHORIAS APLICADAS PELO ENGENHEIRO DE PROMPT:
1. **Atribuição de Papel (Role Assignment):** Delimitamos a persona do modelo para calibrar o tom de voz.
2. **Definição Clara de Formato:** Estabelecemos estrutura de tópicos para evitar respostas prolixas.
3. **Controle de Alucinação:** Adicionamos salvaguarda de checagem factual.`;

    return res.json({
      success: true,
      optimizedResult: fallbackResponse,
      isLiveAI: false,
      note: "Modo simulado de Engenharia de Prompt (Para chamadas ao vivo com Gemini, configure a GEMINI_API_KEY no painel de segredos)."
    });
  });

  // Serve static files in production or mount Vite middleware in development
  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Mateus Araujo OS] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
