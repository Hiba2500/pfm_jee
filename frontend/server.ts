import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";

import { apiRouter } from "./server/api.js";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const SPRING_BOOT_URL = process.env.BACKEND_URL || "http://localhost:8080";

  app.use(cors());
  app.use(express.json());

  // Proxy API requests to Spring Boot backend, fallback to mock router if offline
  app.use("/api", async (req, res, next) => {
    try {
      const targetUrl = `${SPRING_BOOT_URL}/api${req.url}`;
      const headers: Record<string, string> = {};
      if (req.headers.authorization) headers["Authorization"] = req.headers.authorization;
      if (req.headers["content-type"]) headers["Content-Type"] = req.headers["content-type"] as string;

      const options: RequestInit = {
        method: req.method,
        headers,
      };

      if (["POST", "PUT", "PATCH"].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
        options.body = JSON.stringify(req.body);
      }

      const response = await fetch(targetUrl, options);
      res.status(response.status);
      response.headers.forEach((value, key) => {
        if (!["content-encoding", "content-length", "transfer-encoding"].includes(key.toLowerCase())) {
          res.setHeader(key, value);
        }
      });

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await response.json();
        return res.json(data);
      } else {
        const text = await response.text();
        return res.send(text);
      }
    } catch (backendError) {
      // Spring Boot backend unreachable or offline, fallback to local mock router
      return apiRouter(req, res, next);
    }
  });

  // Fallback for unhandled API routes
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `Route API introuvable : ${req.method} ${req.path}` });
  });

  // Global API error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path.startsWith("/api")) {
      console.error("API Error:", err);
      res.status(err.status || 500).json({ error: err.message || "Erreur interne du serveur" });
    } else {
      next(err);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
