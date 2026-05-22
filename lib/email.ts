import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!
const FROM = 'iFox Social <noreply@ifoxsocial.com>'

export async function sendPaymentNotificationToAdmin(companyName: string, amount: number) {
  return resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `Yeni Ödeme Bildirimi — ${companyName}`,
    html: `<p><strong>${companyName}</strong> ${amount} TL ödeme bildirimi gönderdi. Admin panelinden onaylayın.</p>`,
  })
}

export async function sendApprovalEmail(toEmail: string, name: string) {
  return resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: 'iFox Social — Hesabınız Onaylandı',
    html: `<p>Merhaba ${name},</p><p>Ödemeniz onaylandı. Artık panele giriş yapabilirsiniz.</p>`,
  })
}

export async function sendRejectionEmail(toEmail: string, name: string, notes?: string) {
  return resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: 'iFox Social — Ödeme Onaylanamadı',
    html: `<p>Merhaba ${name},</p><p>Ödemeniz onaylanamadı.${notes ? ` Not: ${notes}` : ''}</p><p>Destek için bize ulaşın.</p>`,
  })
}

export async function sendPasswordResetEmail(toEmail: string, name: string, resetUrl: string) {
  return resend.emails.send({
    from: FROM,
    to: toEmail,
    subject: 'iFox Social — Şifre Sıfırlama',
    html: `
      <p>Merhaba ${name},</p>
      <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
      <p><a href="${resetUrl}" style="background:#667eea;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">Şifremi Sıfırla</a></p>
      <p style="color:#888;font-size:13px;">Bu bağlantı <strong>1 saat</strong> geçerlidir. Eğer bu talebi siz yapmadıysanız görmezden gelebilirsiniz.</p>
    `,
  })
}
