import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import Script from "next/script";
import { RECOMMENDATION_INTENTS } from "../../lib/recommendation-intents";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false
  }
};

function extractSection(source: string, pattern: RegExp, label: string) {
  const match = source.match(pattern);
  if (!match?.[1]) {
    throw new Error(`Unable to extract ${label} from admin-reference.html`);
  }
  return match[1].trim();
}

function buildAdminScript(source: string) {
  const initPattern = /document\.addEventListener\('DOMContentLoaded', \(\) => \{([\s\S]*?)\n\}\);\s*$/;
  const initMatch = source.match(initPattern);

  if (!initMatch?.[1]) {
    throw new Error("Unable to extract admin bootstrap from admin-reference.html");
  }

  const baseScript = source.replace(initPattern, "").trim();
  const initBody = initMatch[1].trim();

  return `${baseScript}

let __SMILES_ADMIN_BOOTED__ = false;

function __bootSmilesAdmin__() {
  if (__SMILES_ADMIN_BOOTED__) return;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', __bootSmilesAdmin__, { once: true });
    return;
  }
  if (!window.firebase) {
    window.setTimeout(__bootSmilesAdmin__, 50);
    return;
  }

  __SMILES_ADMIN_BOOTED__ = true;
  ${initBody}
}

__bootSmilesAdmin__();
`;
}

export default async function AdminPage() {
  const adminHtmlPath = path.join(process.cwd(), "app/admin/admin-reference.html");
  const adminHtml = await readFile(adminHtmlPath, "utf8");

  const styles = extractSection(adminHtml, /<style>([\s\S]*?)<\/style>/, "styles");
  const bodyMarkup = extractSection(adminHtml, /<body>([\s\S]*?)<script>/, "body markup")
    .replaceAll('./index.html#recommendations', '/recommendations')
    .replaceAll('./index.html', '/');
  const inlineScript = extractSection(adminHtml, /<script>([\s\S]*?)<\/script>\s*<\/body>/, "inline script");
  const adminScript = buildAdminScript(inlineScript);
  const recommendationIntents = JSON.stringify(RECOMMENDATION_INTENTS).replace(/</g, "\\u003c");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div dangerouslySetInnerHTML={{ __html: bodyMarkup }} />
      <Script id="smiles-admin-intents" strategy="afterInteractive">
        {`window.SMILESANDPOSTCARDS_RECOMMENDATION_INTENTS = ${recommendationIntents};`}
      </Script>
      <Script id="smiles-admin-script" strategy="afterInteractive">
        {adminScript}
      </Script>
    </>
  );
}
