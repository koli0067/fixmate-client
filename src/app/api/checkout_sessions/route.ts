import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const headersList = await headers();
    const origin = headersList.get("origin") || "http://localhost:3000";

    const body = await req.json().catch(() => ({}));
    const bookingId = String(body?.bookingId || "").trim();
    const serviceTitle = String(body?.serviceTitle || "").trim();
    const customerEmail = String(body?.customerEmail || "").trim();
    const amountDollars = Number(body?.amount);

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(amountDollars) || amountDollars <= 0) {
      return NextResponse.json(
        { error: "Valid positive amount is required" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(amountDollars * 100),
            product_data: {
              name: serviceTitle || `FixMate Booking #${bookingId}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId,
        customerEmail,
      },
      success_url: `${origin}/customer/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/customer/payments/cancel`,
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}