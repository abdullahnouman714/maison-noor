// Email service — uses Resend when RESEND_API_KEY is set, otherwise logs the
// email (demo mode) so the full checkout -> receipt flow still runs locally.
async function sendEmail({ to, subject, html }) {
  if (process.env.RESEND_API_KEY) {
    const r = await fetch("https://api.resend.com/emails", { method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      body: JSON.stringify({ from: "Maison Noor <orders@maisonnoor.com>", to, subject, html }) });
    return r.ok;
  }
  console.log(`[email:demo] To: ${to} | Subject: ${subject}`);
  return true;
}
const sendOrderConfirmation = (order) => sendEmail({
  to: order.email, subject: `Your Maison Noor order ${order.id} is confirmed`,
  html: `<h2>Shukriya, ${order.customer}!</h2><p>Order <b>${order.id}</b> totalling <b>$${order.total}</b> is confirmed and will ship within 24 hours.</p><p>${order.items.map(i => `${i.name} (${i.size}) x${i.qty}`).join("<br/>")}</p>`,
});
module.exports = { sendEmail, sendOrderConfirmation };
