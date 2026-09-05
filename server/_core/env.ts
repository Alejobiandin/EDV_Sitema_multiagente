export const ENV = {
  cookieSecret: process.env.JWT_SECRET || "cambia-esta-clave-en-produccion",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
  llmBaseUrl: process.env.LLM_BASE_URL ?? "https://api.openai.com/v1",
  llmApiKey: process.env.LLM_API_KEY ?? process.env.OPENAI_API_KEY ?? "",
  llmModel: process.env.LLM_MODEL ?? "",
  serviceApiUrl: process.env.SERVICE_API_URL ?? "",
  serviceApiKey: process.env.SERVICE_API_KEY ?? "",
};
