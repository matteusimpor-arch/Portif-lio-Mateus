import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Persistent Guestbook Data Storage Helper
interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  createdAt: string; // ISO string
  dateFormatted: string;
  timeFormatted: string;
  status: "approved" | "pending" | "hidden";
  avatarLetter: string;
}

const GUESTBOOK_FILE = path.join(process.cwd(), "guestbook_data.json");
const STATS_FILE = path.join(process.cwd(), "stats_data.json");

interface SiteStats {
  totalVisits: number;
  totalSignatures: number;
  updatedAt: string;
}

function loadStats(): SiteStats {
  try {
    if (fs.existsSync(STATS_FILE)) {
      const data = fs.readFileSync(STATS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Erro ao carregar estatísticas:", err);
  }
  return { totalVisits: 1, totalSignatures: 0, updatedAt: new Date().toISOString() };
}

function saveStats(stats: SiteStats): boolean {
  try {
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Erro ao salvar estatísticas:", err);
    return false;
  }
}

function loadGuestbook(): GuestbookEntry[] {
  try {
    if (fs.existsSync(GUESTBOOK_FILE)) {
      const data = fs.readFileSync(GUESTBOOK_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Erro ao carregar guestbook:", err);
  }
  return [];
}

function saveGuestbook(entries: GuestbookEntry[]): boolean {
  try {
    fs.writeFileSync(GUESTBOOK_FILE, JSON.stringify(entries, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Erro ao salvar guestbook:", err);
    return false;
  }
}

// In-memory cache synced with file
let guestbookEntries: GuestbookEntry[] = loadGuestbook();
let siteStats: SiteStats = loadStats();

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

  // =========================================================================
  // ANALYTICS & STATS ENDPOINTS (ATOMIC VISIT COUNTING & REAL SIGNATURES)
  // =========================================================================
  app.get("/api/analytics/stats", (_req, res) => {
    try {
      siteStats = loadStats();
      guestbookEntries = loadGuestbook();
      const approvedSignaturesCount = guestbookEntries.filter((e) => e.status !== "hidden").length;
      
      return res.json({
        success: true,
        totalVisits: Math.max(1, siteStats.totalVisits),
        totalSignatures: approvedSignaturesCount,
        updatedAt: siteStats.updatedAt
      });
    } catch (err) {
      console.error("Erro ao obter estatísticas:", err);
      return res.status(500).json({ success: false, error: "Erro ao obter estatísticas." });
    }
  });

  app.post("/api/analytics/visit", (_req, res) => {
    try {
      siteStats = loadStats();
      siteStats.totalVisits = (siteStats.totalVisits || 0) + 1;
      siteStats.updatedAt = new Date().toISOString();
      saveStats(siteStats);

      return res.json({
        success: true,
        totalVisits: siteStats.totalVisits
      });
    } catch (err) {
      console.error("Erro ao registrar visita:", err);
      return res.status(500).json({ success: false, error: "Erro ao registrar visita." });
    }
  });

  // =========================================================================
  // GUESTBOOK / LIVRO DE VISITAS ENDPOINTS (PERSISTENT & REAL-TIME)
  // =========================================================================
  app.get("/api/guestbook", (_req, res) => {
    try {
      // Reload from disk to keep any external updates synced
      guestbookEntries = loadGuestbook();
      
      // Filter out hidden entries for public visitors
      const publicEntries = guestbookEntries
        .filter((entry) => entry.status !== "hidden")
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return res.json({
        success: true,
        count: publicEntries.length,
        signatures: publicEntries
      });
    } catch (err) {
      console.error("Erro ao listar guestbook:", err);
      return res.status(500).json({ success: false, error: "Erro ao ler livro de visitas." });
    }
  });

  app.post("/api/guestbook", (req, res) => {
    try {
      const { name, message } = req.body || {};

      // 1. Validation
      if (!name || typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          error: "Por favor, informe seu nome ou apelido."
        });
      }

      if (!message || typeof message !== "string" || !message.trim()) {
        return res.status(400).json({
          success: false,
          error: "Por favor, escreva uma mensagem antes de assinar."
        });
      }

      // 2. Strict Sanitization: Strip HTML tags and control chars
      const sanitizedName = name
        .replace(/<[^>]*>?/gm, "")
        .replace(/[^\p{L}\p{N}\s.,!?'"()\-@_#]/gu, "")
        .trim()
        .slice(0, 50);

      const sanitizedMessage = message
        .replace(/<[^>]*>?/gm, "")
        .trim()
        .slice(0, 200);

      if (sanitizedName.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Nome inválido."
        });
      }

      if (sanitizedMessage.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Mensagem vazia após formatação."
        });
      }

      // 3. Format Date and Time in Brasília / Local standard (DD/MM/YYYY • HH:mm)
      const now = new Date();
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");

      const dateFormatted = `${day}/${month}/${year}`;
      const timeFormatted = `${hours}:${minutes}`;

      // Extract first valid letter for avatar
      const firstLetter = sanitizedName.charAt(0).toUpperCase() || "M";

      const newEntry: GuestbookEntry = {
        id: `sig_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        name: sanitizedName,
        message: sanitizedMessage,
        createdAt: now.toISOString(),
        dateFormatted,
        timeFormatted,
        status: "approved",
        avatarLetter: firstLetter
      };

      // Reload fresh, append, and persist
      guestbookEntries = loadGuestbook();
      guestbookEntries.unshift(newEntry);
      saveGuestbook(guestbookEntries);

      console.log(`[GUESTBOOK] Nova assinatura de "${sanitizedName}": "${sanitizedMessage}"`);

      return res.status(201).json({
        success: true,
        message: "Assinatura registrada!",
        entry: newEntry,
        totalCount: guestbookEntries.filter((e) => e.status !== "hidden").length
      });
    } catch (err) {
      console.error("Erro ao registrar no guestbook:", err);
      return res.status(500).json({
        success: false,
        error: "Falha ao salvar assinatura. Tente novamente."
      });
    }
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
