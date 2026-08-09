import { Resend } from "resend";
import { Order } from "../types/index.js";

const resend = new Resend(process.env.RESEND_API_KEY ?? "");
const FROM_EMAIL = "Kanz Electronics <onboarding@resend.dev>"; // switch to your own domain once verified

function wrapper(title: string, body: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
      <div style="background: #0f172a; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 18px; letter-spacing: 1px;">KANZ ELECTRONICS</h1>
      </div>
      <div style="border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; padding: 24px;">
        <h2 style="color: #0f172a; margin-top: 0;">${title}</h2>
        ${body}
        <p style="color: #64748b; font-size: 12px; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          Kanz Electronics · Dubai, UAE · +971 4 280 900 3434
        </p>
      </div>
    </div>
  `;
}

function itemsList(order: Order): string {
  return order.items
    .map(
      (item) =>
        `<div style="display:flex; justify-content:space-between; padding:6px 0; font-size:14px; color:#334155;">
          <span>${item.quantity}× ${item.name}${item.size ? ` (${item.size})` : ""}</span>
          <span>${(item.price * item.quantity).toFixed(2)} د.إ</span>
        </div>`
    )
    .join("");
}

export async function sendOrderPlacedEmail(order: Order) {
  const html = wrapper(
    "Your order has been placed! 🎉",
    `<p>Hi ${order.customer.name}, thank you for shopping with us. We've received your order and will begin processing it shortly.</p>
     <p style="font-weight:600; color:#0f172a;">Order ${order.id}</p>
     ${itemsList(order)}
     <p style="font-weight:700; margin-top:12px; border-top:1px solid #e2e8f0; padding-top:12px;">Total: ${order.total.toFixed(2)} د.إ</p>
     <p style="margin-top:16px;">Delivering to: ${order.customer.address}, ${order.customer.city}, ${order.customer.emirate}</p>`
  );
  await resend.emails.send({
    from: FROM_EMAIL,
    to: order.customer.email,
    subject: `Order Confirmed — ${order.id}`,
    html,
  });
}

export async function sendOrderStatusEmail(order: Order) {
  const statusContent: Record<string, { subject: string; title: string; message: string }> = {
    confirmed: {
      subject: "Your order is confirmed",
      title: "Order Confirmed ✔",
      message: "Great news! Your order has been confirmed and is now being packed.",
    },
    shipped: {
      subject: "Your order is on the way",
      title: "Order Shipped 🚚",
      message: "Your order has left our warehouse and is on its way to you.",
    },
    delivered: {
      subject: "Your order has been delivered",
      title: "Delivered ✅",
      message: "Your order has been delivered. We hope you enjoy your new electronics! Thank you for shopping with Kanz Electronics.",
    },
  };

  const content = statusContent[order.status];
  if (!content) return;

  const html = wrapper(
    content.title,
    `<p>Hi ${order.customer.name}, ${content.message}</p>
     <p style="font-weight:600; color:#0f172a;">Order ${order.id}</p>
     ${itemsList(order)}
     <p style="font-weight:700; margin-top:12px; border-top:1px solid #e2e8f0; padding-top:12px;">Total: ${order.total.toFixed(2)} د.إ</p>`
  );

  await resend.emails.send({
    from: FROM_EMAIL,
    to: order.customer.email,
    subject: `${content.subject} — ${order.id}`,
    html,
  });
}