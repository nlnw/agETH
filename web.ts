import express from "express";
import { runPrompt } from "./chatbot";

const app = express();

app.get("/stream", async (req, res) => {
  const prompt = (req.query.prompt as string) || "default prompt";

  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Transfer-Encoding", "chunked");

  try {
    const stream = await runPrompt(prompt);

    for await (const chunk of stream) {
      res.write(chunk + "\n");
    }
    res.end("Stream complete!\n");
  } catch (error) {
    res.status(500).send("Error streaming response");
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
