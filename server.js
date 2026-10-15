
const express = require("express");
const cors = require("cors");

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "20kb" }));

app.use(cors({
  origin: process.env.APP_ORIGIN,
  methods: ["POST"],
  allowedHeaders: ["Content-Type"]
}));

app.get("/", (req, res) => {
  res.send("Rizz AI Server aktif 🧠");
});

app.post("/chat", async (req, res) => {
  try {
    const key = process.env.OPENAI_API_KEY;
    const message = req.body.message;

    if (!key) {
      return res.status(500).json({
        error: "API key belum diatur di server."
      });
    }

    if (
      typeof message !== "string" ||
      !message.trim() ||
      message.length > 4000
    ) {
      return res.status(400).json({
        error: "Pesan tidak valid."
      });
    }

    const history = Array.isArray(req.body.history)
      ? req.body.history.slice(-8)
      : [];

    const input = [];

    for (const item of history) {
      if (
        item &&
        ["user", "assistant"].includes(item.role) &&
        typeof item.content === "string"
      ) {
        input.push({
          role: item.role,
          content: item.content.slice(0, 4000)
        });
      }
    }

    input.push({
      role: "user",
      content: message.trim()
    });

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + key
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          instructions:
            "Kamu adalah Rizz AI, asisten yang ramah. " +
            "Jawab dalam bahasa Indonesia dengan jelas. " +
            "Bantu belajar, coding, menulis, dan menjawab pertanyaan.",
          input,
          max_output_tokens: 700
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("AI API error:", response.status);
      return res.status(502).json({
        error: "Layanan AI gagal. Periksa konfigurasi API."
      });
    }

    if (typeof data.output_text !== "string") {
      return res.status(502).json({
        error: "Jawaban AI tidak tersedia."
      });
    }

    res.json({ reply: data.output_text });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: "Terjadi kesalahan pada server."
    });
  }
});

const port = process.env.PORT || 10000;

app.listen(port, "0.0.0.0", () => {
  console.log("Rizz AI siap di port " + port);
});
