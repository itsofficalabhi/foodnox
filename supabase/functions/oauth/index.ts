import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const allowedProviders = new Set(["google", "apple", "azure", "facebook", "github"]);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const requestUrl = new URL(req.url);
  const provider = requestUrl.searchParams.get("provider") ?? "";
  const redirectTo = requestUrl.searchParams.get("redirect_to") ?? undefined;
  const rawQueryParams = requestUrl.searchParams.get("query_params");

  if (!allowedProviders.has(provider)) {
    return Response.json(
      { error: "Unsupported OAuth provider." },
      { status: 400, headers: corsHeaders },
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey =
    Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    return Response.json(
      { error: "Supabase OAuth environment variables are missing." },
      { status: 500, headers: corsHeaders },
    );
  }

  let queryParams: Record<string, string> | undefined;
  if (rawQueryParams) {
    try {
      queryParams = JSON.parse(rawQueryParams);
    } catch {
      return Response.json(
        { error: "Invalid OAuth query params." },
        { status: 400, headers: corsHeaders },
      );
    }
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      queryParams,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    return Response.json(
      { error: error?.message ?? "Could not start OAuth sign-in." },
      { status: 500, headers: corsHeaders },
    );
  }

  return Response.redirect(data.url, 302);
});
