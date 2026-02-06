import { Resend } from "resend";

// Resend client is lazy-initialized to avoid build errors when API key is missing
let _resend = null;
function getResend() {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) return null;
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM_ADDRESS =
  process.env.RESEND_FROM_ADDRESS || "Picked <onboarding@resend.dev>";
const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://getpicked.co";

// ---------------------------------------------------------------------------
// Shared dark-theme email layout
// ---------------------------------------------------------------------------
function emailLayout(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#12121a;border:1px solid #2a2a3e;border-radius:16px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 0 32px;text-align:center;">
              <span style="font-size:28px;">🏀</span>
              <span style="font-size:22px;font-weight:bold;color:#f1f1f4;letter-spacing:-0.5px;vertical-align:middle;margin-left:8px;">PICKED</span>
              <div style="margin-top:16px;height:2px;background:linear-gradient(90deg,transparent,#f97316,transparent);"></div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:0 32px 32px 32px;text-align:center;">
              <div style="height:1px;background-color:#2a2a3e;margin-bottom:24px;"></div>
              <p style="margin:0;font-size:12px;color:#6b7280;">
                Picked — Get Picked.
              </p>
              <p style="margin:8px 0 0 0;font-size:11px;color:#6b7280;">
                You received this email because you have a Picked account.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Reusable orange CTA button
function ctaButton(text, href) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto 0 auto;">
  <tr>
    <td style="background-color:#f97316;border-radius:10px;">
      <a href="${href}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
        ${text}
      </a>
    </td>
  </tr>
</table>`;
}

// ---------------------------------------------------------------------------
// Email: New message notification
// ---------------------------------------------------------------------------
export async function sendNewMessageEmail(
  to,
  senderName,
  messagePreview,
  conversationId
) {
  const conversationUrl = `${BASE_URL}/dashboard/messages/${conversationId}`;
  const preview =
    messagePreview.length > 200
      ? messagePreview.slice(0, 200) + "..."
      : messagePreview;

  const body = `
    <h1 style="margin:0 0 8px 0;font-size:20px;font-weight:bold;color:#f1f1f4;">
      You have a new message
    </h1>
    <p style="margin:0 0 20px 0;font-size:14px;color:#9ca3af;">
      <strong style="color:#f1f1f4;">${escapeHtml(senderName)}</strong> sent you a message:
    </p>
    <div style="border-left:3px solid #f97316;background-color:#1a1a2e;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:4px;">
      <p style="margin:0;font-size:14px;color:#9ca3af;line-height:1.5;">
        ${escapeHtml(preview)}
      </p>
    </div>
    ${ctaButton("View Conversation", conversationUrl)}
  `;

  return send(to, `New message from ${senderName} on Picked`, body);
}

// ---------------------------------------------------------------------------
// Email: Tryout invitation notification
// ---------------------------------------------------------------------------
export async function sendTryoutInvitationEmail(
  to,
  teamName,
  tryoutDate,
  location,
  message
) {
  const dashboardUrl = `${BASE_URL}/dashboard/tryouts`;
  const formattedDate = tryoutDate
    ? new Date(tryoutDate).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "TBD";

  let body = `
    <h1 style="margin:0 0 8px 0;font-size:20px;font-weight:bold;color:#f1f1f4;">
      You're invited to a tryout!
    </h1>
    <p style="margin:0 0 20px 0;font-size:14px;color:#9ca3af;">
      <strong style="color:#f1f1f4;">${escapeHtml(teamName)}</strong> has invited you to try out for their team.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;">
      <tr>
        <td style="padding:12px 16px;background-color:#1a1a2e;border-radius:8px 8px 0 0;border-bottom:1px solid #2a2a3e;">
          <span style="font-size:11px;text-transform:uppercase;color:#6b7280;letter-spacing:0.5px;">Date</span><br/>
          <span style="font-size:14px;color:#f1f1f4;font-weight:500;">${escapeHtml(formattedDate)}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 16px;background-color:#1a1a2e;border-radius:0 0 8px 8px;">
          <span style="font-size:11px;text-transform:uppercase;color:#6b7280;letter-spacing:0.5px;">Location</span><br/>
          <span style="font-size:14px;color:#f1f1f4;font-weight:500;">${escapeHtml(location || "TBD")}</span>
        </td>
      </tr>
    </table>
  `;

  if (message) {
    body += `
    <div style="border-left:3px solid #f97316;background-color:#1a1a2e;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:4px;">
      <p style="margin:0 0 4px 0;font-size:11px;text-transform:uppercase;color:#6b7280;letter-spacing:0.5px;">Personal message</p>
      <p style="margin:0;font-size:14px;color:#9ca3af;line-height:1.5;">
        ${escapeHtml(message)}
      </p>
    </div>
    `;
  }

  body += ctaButton("View Invitation", dashboardUrl);

  return send(to, `Tryout invitation from ${teamName}`, body);
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------
async function send(to, subject, bodyHtml) {
  try {
    const resend = getResend();
    if (!resend) {
      console.warn("[email] RESEND_API_KEY not configured, skipping email");
      return { error: "Email not configured" };
    }
    await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      html: emailLayout(subject, bodyHtml),
    });
    return { success: true };
  } catch (error) {
    console.error("[email] Failed to send:", error?.message || error);
    return { error: error?.message || "Email send failed" };
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
