import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sha1Hex(message: string): Promise<string> {
  const data = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  // ── Verify caller is super_admin ────────────────────────────────────────
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing Authorization" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const anonClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } }
  );
  const serviceClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const { data: { user }, error: userError } = await anonClient.auth.getUser();
  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Unauthenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const { data: profile } = await serviceClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "super_admin") {
    return new Response(JSON.stringify({ error: "Forbidden: super_admin required" }), {
      status: 403,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  // ── Parse body ──────────────────────────────────────────────────────────
  let body: { public_ids: string[] };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const { public_ids } = body;
  if (!Array.isArray(public_ids) || public_ids.length === 0) {
    return new Response(JSON.stringify({ error: "public_ids must be a non-empty array" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  // ── Cloudinary credentials ──────────────────────────────────────────────
  const CLOUD_NAME = Deno.env.get("CLOUDINARY_CLOUD_NAME") ?? "doeovg6x9";
  const API_KEY = Deno.env.get("CLOUDINARY_API_KEY") ?? "";
  const API_SECRET = Deno.env.get("CLOUDINARY_API_SECRET") ?? "";

  if (!API_KEY || !API_SECRET) {
    return new Response(JSON.stringify({ error: "Cloudinary credentials not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  // ── Delete each image from Cloudinary ───────────────────────────────────
  const deleted: string[] = [];
  const failed: string[] = [];

  for (const publicId of public_ids) {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = await sha1Hex(
      `public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`
    );

    const form = new FormData();
    form.append("public_id", publicId);
    form.append("timestamp", String(timestamp));
    form.append("api_key", API_KEY);
    form.append("signature", signature);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`,
        { method: "POST", body: form }
      );
      const result = await res.json();
      if (result.result === "ok" || result.result === "not found") {
        deleted.push(publicId);
      } else {
        console.error(`Cloudinary error for ${publicId}:`, result);
        failed.push(publicId);
      }
    } catch (err) {
      console.error(`Network error deleting ${publicId}:`, err);
      failed.push(publicId);
    }
  }

  // ── Remove processed rows from Supabase ────────────────────────────────
  if (deleted.length > 0) {
    const { error: dbError } = await serviceClient
      .from("pending_image_deletions")
      .delete()
      .in("public_id", deleted);
    if (dbError) console.error("DB cleanup error (non-fatal):", dbError);
  }

  return new Response(JSON.stringify({ deleted, failed }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
});
