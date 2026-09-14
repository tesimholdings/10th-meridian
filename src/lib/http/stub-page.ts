export function stubHtmlPage(input: {
  title: string;
  body: string;
  status: number;
  backHref?: string;
  backLabel?: string;
}) {
  const backHref = input.backHref ?? "/member/billing";
  const backLabel = input.backLabel ?? "Return to billing";
  return new Response(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(input.title)} · 10th Meridian</title>
    <style>
      :root { color-scheme: dark; }
      body { margin: 0; background: #070809; color: #f4efe4; font-family: Outfit, system-ui, sans-serif; padding: 2.5rem 1.25rem; }
      .label { letter-spacing: 0.18em; text-transform: uppercase; font-size: 11px; color: #b08d4a; }
      h1 { font-family: "Cormorant Garamond", Georgia, serif; font-weight: 400; font-size: 2rem; line-height: 1.15; }
      p { color: #b8b2a6; max-width: 28rem; line-height: 1.55; }
      a { color: #b08d4a; }
    </style>
  </head>
  <body>
    <p class="label">10th Meridian · DEMO</p>
    <h1>${escapeHtml(input.title)}</h1>
    <p>${escapeHtml(input.body)}</p>
    <p><a href="${escapeHtml(backHref)}">${escapeHtml(backLabel)}</a></p>
  </body>
</html>`,
    {
      status: input.status,
      headers: { "content-type": "text/html; charset=utf-8" },
    },
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
