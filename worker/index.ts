interface Env {
  SHARED_PIN: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    // Allow unlock page, unlock API, and assets
    if (
      url.pathname === "/unlock.html" ||
      url.pathname === "/__unlock" ||
      url.pathname.startsWith("/assets")
    ) {
      return handlePublic(request, env, ctx);
    }

    // Check auth cookie
    const cookie = request.headers.get("Cookie") || "";
    if (!cookie.includes("auth=1")) {
      return Response.redirect(
        new URL("/unlock.html", url.origin).toString(),
        302,
      );
    }

    return handlePublic(request, env, ctx);
  },
};

async function handlePublic(request: Request, env: Env, ctx: ExecutionContext) {
  const url = new URL(request.url);

  // Handle PIN submission
  if (url.pathname === "/__unlock" && request.method === "POST") {
    const { pin } = (await request.json()) as { pin: string };

    if (pin === env.SHARED_PIN) {
      return new Response("OK", {
        headers: {
          "Set-Cookie": "auth=1; Path=/; HttpOnly; Secure; SameSite=Lax",
        },
      });
    }

    return new Response("Invalid PIN", { status: 401 });
  }
}
