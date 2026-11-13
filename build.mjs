// Assemble the static site and embed its public API endpoint.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const configuredUrl = process.env.PRODUCTION_API_URL?.trim();
let apiUrl = "";

if (configuredUrl) {
    const url = URL.parse(configuredUrl);
    const apiPath = url?.pathname.replace(/\/+$/, "");
    if (url?.protocol !== "https:" || !apiPath?.endsWith("/api")
        || url.username || url.password || url.search || url.hash) {
        throw new Error("PRODUCTION_API_URL must be a public HTTPS URL ending in /api.");
    }
    apiUrl = url.origin + apiPath;
}

const html = readFileSync("index.html", "utf8").replace(
    'name="clinic-api-url" content=""',
    `name="clinic-api-url" content="${apiUrl.replaceAll("&", "&amp;")}"`
);

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist/css", { recursive: true });
cpSync("js", "dist/js", { recursive: true });
cpSync("assets", "dist/assets", { recursive: true });
writeFileSync("dist/index.html", html);
