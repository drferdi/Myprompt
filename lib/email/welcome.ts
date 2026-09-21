// Drferdi CTE V2 — Welcome Email
// Sent once after new user is created in Prisma via /api/auth/callback
// Fire-and-forget: failures are logged but never break the registration flow

import { Resend } from 'resend'

const FROM = process.env.RESEND_FROM_EMAIL ?? 'Drferdi <noreply@sentrahai.com>'

function buildWelcomeHtml(name: string): string {
  const displayName = name || 'Sobat Drferdi'

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Selamat Datang di Drferdi CTE</title>
</head>
<body style="margin:0;padding:0;background-color:#0d0d0d;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d0d0d;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#111111;border-radius:12px;border:1px solid #222222;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #1a1a1a;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#eb5939;border-radius:8px;padding:8px 10px;margin-right:12px;">
                    <span style="color:#ffffff;font-size:16px;font-weight:700;">⚡</span>
                  </td>
                  <td style="padding-left:12px;">
                    <span style="color:#b7ab98;font-size:18px;font-weight:700;letter-spacing:-0.3px;">Drferdi CTE</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <h1 style="color:#f0ebe3;font-size:24px;font-weight:700;margin:0 0 12px;letter-spacing:-0.5px;">
                Selamat datang, ${displayName}! 🎉
              </h1>
              <p style="color:#b7ab98;font-size:15px;line-height:1.7;margin:0 0 24px;">
                Akun Drferdi CTE kamu sudah aktif. Kamu sekarang bisa mulai mengoptimalkan prompt dan mendapatkan hasil yang lebih baik dari AI manapun.
              </p>

              <!-- Feature list -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:12px 16px;background-color:#161616;border-radius:8px;margin-bottom:8px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#eb5939;font-size:14px;padding-right:12px;">⚡</td>
                        <td style="color:#b7ab98;font-size:14px;line-height:1.5;">
                          <strong style="color:#f0ebe3;">Prompt Optimizer</strong> — Ubah ide kasar jadi super-prompt terstruktur
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="height:6px;"></td></tr>
                <tr>
                  <td style="padding:12px 16px;background-color:#161616;border-radius:8px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#eb5939;font-size:14px;padding-right:12px;">📊</td>
                        <td style="color:#b7ab98;font-size:14px;line-height:1.5;">
                          <strong style="color:#f0ebe3;">Prompt Evaluator</strong> — Skor kualitas prompt dengan feedback spesifik
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="height:6px;"></td></tr>
                <tr>
                  <td style="padding:12px 16px;background-color:#161616;border-radius:8px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#eb5939;font-size:14px;padding-right:12px;">📚</td>
                        <td style="color:#b7ab98;font-size:14px;line-height:1.5;">
                          <strong style="color:#f0ebe3;">Template Library</strong> — Ratusan template siap pakai untuk berbagai kebutuhan
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://sentrahai.com'}/optimizer"
                       style="display:inline-block;background-color:#eb5939;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:8px;letter-spacing:-0.2px;">
                      Mulai Sekarang →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #1a1a1a;">
              <p style="color:#555555;font-size:12px;line-height:1.6;margin:0;text-align:center;">
                Kamu menerima email ini karena baru mendaftar di Drferdi CTE.<br/>
                Jika bukan kamu yang mendaftar, abaikan email ini.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function buildWelcomePlainText(name: string): string {
  const displayName = name || 'Sobat Drferdi'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://sentrahai.com'
  return [
    `Selamat datang, ${displayName}!`,
    '',
    'Akun Drferdi CTE kamu sudah aktif. Mulai optimalkan prompt kamu di:',
    `${appUrl}/optimizer`,
    '',
    'Fitur yang tersedia:',
    '- Prompt Optimizer: Ubah ide kasar jadi super-prompt terstruktur',
    '- Prompt Evaluator: Skor kualitas prompt dengan feedback spesifik',
    '- Template Library: Ratusan template siap pakai',
    '',
    'Kamu menerima email ini karena baru mendaftar di Drferdi CTE.',
    'Jika bukan kamu yang mendaftar, abaikan email ini.',
    '',
    `Berhenti berlangganan: ${appUrl}/unsubscribe`,
  ].join('\n')
}

export async function sendWelcomeEmail(email: string, name: string | null): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    // Silently skip in dev if not configured
    return
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://sentrahai.com'

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Selamat datang di Drferdi CTE ⚡',
    html: buildWelcomeHtml(name ?? ''),
    text: buildWelcomePlainText(name ?? ''),
    headers: {
      // Required by Gmail/Yahoo bulk sender rules (enforced Feb 2024) + GDPR/CAN-SPAM
      'List-Unsubscribe': `<${appUrl}/unsubscribe?email=${encodeURIComponent(email)}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  })
}
