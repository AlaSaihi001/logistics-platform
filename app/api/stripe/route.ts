// app/api/stripe/route.ts
import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, invoiceId } = body;

    if (!amount || !invoiceId) {
      return NextResponse.json(
        { error: "Missing amount or invoiceId" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Facture ${invoiceId}`,
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `http://localhost:3000/dashboard/client/factures/${invoiceId}?status=success`,
      cancel_url: `http://localhost:3000/dashboard/client/factures/${invoiceId}?status=cancel`,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err) {
    console.error("Stripe error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
