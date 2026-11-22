import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    if (!stripe || !process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured on the server" },
        { status: 500 }
      );
    }

    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized: valid session required" },
        { status: 401 }
      );
    }

    const userRole = String(
      (session.user as { role?: string }).role || "customer"
    ).toLowerCase();
    if (userRole !== "customer") {
      return NextResponse.json(
        { error: "Forbidden: only customers can initiate checkout" },
        { status: 403 }
      );
    }

    const origin =
      headersList.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const body = await req.json().catch(() => ({}));
    const bookingId = String(body?.bookingId || "").trim();
    const serviceTitle = String(body?.serviceTitle || "").trim();
    const customerEmail = String(
      session.user.email || body?.customerEmail || ""
    ).trim();
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

    const checkoutSession = await stripe.checkout.sessions.create({
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
      success_url: `${origin}/dashboard/customer/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard/customer/payments/cancel`,
    });

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}