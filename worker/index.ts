import { handleAdminRequest } from "./admin";
import { type Env } from "./http";
import { submitSurvey } from "./submit";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const path = new URL(request.url).pathname;
    if (path === "/api/survey/submit") return submitSurvey(request, env);
    if (path.startsWith("/api/admin/")) return handleAdminRequest(request, env);
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
