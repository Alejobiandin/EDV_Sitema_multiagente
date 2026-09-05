import type { Express } from "express";
import { ENV } from "./env";

export function registerStorageProxy(app: Express) {
  app.get("/storage/*", async (req, res) => {
    const key = (req.params as Record<string, string>)[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }

    if (!ENV.serviceApiUrl || !ENV.serviceApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }

    try {
      const serviceUrl = new URL(
        "v1/storage/presign/get",
        ENV.serviceApiUrl.replace(/\/+$/, "") + "/",
      );
      serviceUrl.searchParams.set("path", key);

      const forgeResp = await fetch(serviceUrl, {
        headers: { Authorization: `Bearer ${ENV.serviceApiKey}` },
      });

      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }

      const { url } = (await forgeResp.json()) as { url: string };
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }

      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}
