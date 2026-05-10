import type { Provider } from "@supabase/supabase-js";

type OAuthOptions = {
  redirectTo?: string;
  queryParams?: Record<string, string>;
};

export async function signInWithSupabaseOAuth(provider: Provider, options: OAuthOptions = {}) {
  if (typeof window === "undefined") {
    return {
      data: null,
      error: new Error("OAuth sign-in can only be started in a browser."),
    };
  }

  const serverEnv = typeof process !== "undefined" ? process.env : {};
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || serverEnv.SUPABASE_URL;

  if (!supabaseUrl) {
    return {
      data: null,
      error: new Error("Missing Supabase URL for OAuth sign-in."),
    };
  }

  const oauthUrl = new URL("/functions/v1/oauth", supabaseUrl);
  oauthUrl.searchParams.set("provider", provider);

  if (options.redirectTo) {
    oauthUrl.searchParams.set("redirect_to", options.redirectTo);
  }

  if (options.queryParams) {
    oauthUrl.searchParams.set("query_params", JSON.stringify(options.queryParams));
  }

  window.location.assign(oauthUrl.toString());

  return {
    data: { provider, url: oauthUrl.toString() },
    error: null,
  };
}
