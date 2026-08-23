/**
 * Semester Board sync endpoint.
 * One KV key holding one JSON blob. Last write wins.
 *
 * Deploy:
 *   npm create cloudflare@latest board-sync -- --type=hello-world
 *   (replace src/index.js with this file)
 *   npx wrangler kv namespace create BOARD
 *   -> paste the returned id into wrangler.toml as shown below
 *   npx wrangler secret put SECRET      # pick a long random string
 *   npx wrangler deploy
 *
 * wrangler.toml:
 *   name = "board-sync"
 *   main = "src/index.js"
 *   compatibility_date = "2026-01-01"
 *   [[kv_namespaces]]
 *   binding = "BOARD"
 *   id = "<the id wrangler printed>"
 *
 * Then in the app: settings -> sync endpoint = https://board-sync.<you>.workers.dev
 * and shared secret = whatever you put in SECRET.
 */

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,PUT,OPTIONS",
  "access-control-allow-headers": "x-key,content-type",
  "access-control-max-age": "86400",
};

const json = (body, status = 200) =>
  new Response(body, { status, headers: { ...CORS, "content-type": "application/json" } });

export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

    if (!env.SECRET || req.headers.get("x-key") !== env.SECRET)
      return json(JSON.stringify({ error: "bad key" }), 401);

    if (req.method === "GET") {
      const v = await env.BOARD.get("state");
      return json(v || "{}");
    }

    if (req.method === "PUT") {
      const body = await req.text();
      if (body.length > 4_000_000) return json(JSON.stringify({ error: "too big" }), 413);
      try {
        JSON.parse(body);
      } catch {
        return json(JSON.stringify({ error: "not json" }), 400);
      }
      await env.BOARD.put("state", body);
      // keep a rolling daily snapshot so a bad last-write is recoverable
      const day = new Date().toISOString().slice(0, 10);
      await env.BOARD.put("snap:" + day, body, { expirationTtl: 60 * 60 * 24 * 30 });
      return json(JSON.stringify({ ok: true }));
    }

    return json(JSON.stringify({ error: "method" }), 405);
  },
};
