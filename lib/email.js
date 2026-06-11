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
// Shared editorial light-theme email layout (matches getpicked.co)
// ---------------------------------------------------------------------------
function emailLayout(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#E8E5DC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#E8E5DC;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#F8F6F0;border:1px solid #DDD9CE;border-radius:16px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:28px 32px 0 32px;">
              <span style="display:inline-block;width:9px;height:9px;border-radius:9px;background-color:#B85A3F;"></span>
              <span style="font-size:20px;font-weight:800;color:#13110E;letter-spacing:0.5px;vertical-align:middle;margin-left:8px;">Picked</span>
              <div style="margin-top:20px;height:1px;background-color:#DDD9CE;"></div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:28px 32px 32px 32px;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:0 32px 28px 32px;">
              <div style="height:1px;background-color:#DDD9CE;margin-bottom:20px;"></div>
              <p style="margin:0;font-size:12px;color:#635D55;">
                Picked — basketball recruiting for Europe · getpicked.co
              </p>
              <p style="margin:8px 0 0 0;font-size:11px;color:#635D55;">
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

// Reusable terracotta CTA button
function ctaButton(text, href) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 0 0;">
  <tr>
    <td style="background-color:#B85A3F;border-radius:999px;">
      <a href="${href}" target="_blank" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
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
    <h1 style="margin:0 0 8px 0;font-size:20px;font-weight:800;color:#13110E;">
      You have a new message
    </h1>
    <p style="margin:0 0 20px 0;font-size:14px;color:#635D55;">
      <strong style="color:#13110E;">${escapeHtml(senderName)}</strong> sent you a message:
    </p>
    <div style="border-left:3px solid #B85A3F;background-color:#F0EEE6;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:4px;">
      <p style="margin:0;font-size:14px;color:#3A332B;line-height:1.5;">
        ${escapeHtml(preview)}
      </p>
    </div>
    ${ctaButton("View conversation", conversationUrl)}
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
    <h1 style="margin:0 0 8px 0;font-size:20px;font-weight:800;color:#13110E;">
      You're invited to a tryout
    </h1>
    <p style="margin:0 0 20px 0;font-size:14px;color:#635D55;">
      <strong style="color:#13110E;">${escapeHtml(teamName)}</strong> has invited you to try out for their team.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;">
      <tr>
        <td style="padding:12px 16px;background-color:#F0EEE6;border-radius:8px 8px 0 0;border-bottom:1px solid #DDD9CE;">
          <span style="font-size:11px;text-transform:uppercase;color:#635D55;letter-spacing:0.5px;">Date</span><br/>
          <span style="font-size:14px;color:#13110E;font-weight:600;">${escapeHtml(formattedDate)}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 16px;background-color:#F0EEE6;border-radius:0 0 8px 8px;">
          <span style="font-size:11px;text-transform:uppercase;color:#635D55;letter-spacing:0.5px;">Location</span><br/>
          <span style="font-size:14px;color:#13110E;font-weight:600;">${escapeHtml(location || "TBD")}</span>
        </td>
      </tr>
    </table>
  `;

  if (message) {
    body += `
    <div style="border-left:3px solid #B85A3F;background-color:#F0EEE6;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:4px;">
      <p style="margin:0 0 4px 0;font-size:11px;text-transform:uppercase;color:#635D55;letter-spacing:0.5px;">Personal message</p>
      <p style="margin:0;font-size:14px;color:#3A332B;line-height:1.5;">
        ${escapeHtml(message)}
      </p>
    </div>
    `;
  }

  body += ctaButton("View invitation", dashboardUrl);

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
