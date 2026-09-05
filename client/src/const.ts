export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const startLogin = async () => {
  const response = await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({}) });
  if (!response.ok) throw new Error("No se pudo iniciar la sesión local");
  window.location.reload();
};
