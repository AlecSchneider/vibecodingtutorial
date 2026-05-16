import { httpRouter } from "convex/server";
import { registerRoutes } from "@convex-dev/stripe";
import { components } from "./_generated/api";

const http = httpRouter();

registerRoutes(http, components.stripe, {
  webhookPath: "/stripe/webhook",
});

export default http;
