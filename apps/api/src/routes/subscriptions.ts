import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from './auth';

const router = Router();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

const PLANS = [
  { id: 'free', name: 'Starter', price: 0, credits: 20, priceId: null },
  { id: 'creator', name: 'Creator', price: 9.99, credits: 200, priceId: process.env.STRIPE_PRICE_STARTER },
  { id: 'studio', name: 'Studio', price: 29.99, credits: 1000, priceId: process.env.STRIPE_PRICE_PRO },
  { id: 'enterprise', name: 'Enterprise', price: 99.99, credits: 5000, priceId: process.env.STRIPE_PRICE_STUDIO },
];

// GET /api/subscriptions/plans
router.get('/plans', (_req, res) => res.json({ plans: PLANS }));

// GET /api/subscriptions/current
router.get('/current', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const sub = await prisma.subscription.findUnique({ where: { userId: req.userId! } });
    if (!sub) return res.json({ plan: 'free', credits: 20, status: 'active' });
    res.json(sub);
  } catch {
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// POST /api/subscriptions/checkout — create Stripe checkout session
router.post('/checkout', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { planId } = req.body;
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan || !plan.priceId) return res.status(400).json({ error: 'Invalid plan' });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: plan.priceId, quantity: 1 }],
      metadata: { userId: req.userId!, planId },
      success_url: `${process.env.FRONTEND_URL}/dashboard?subscription=success`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
    });
    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/subscriptions/portal — customer billing portal
router.post('/portal', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const sub = await prisma.subscription.findUnique({ where: { userId: req.userId! } });
    if (!sub?.stripeCustomerId) return res.status(404).json({ error: 'No subscription found' });
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });
    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/subscriptions/webhook — Stripe webhook handler
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: any) {
    return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, planId } = session.metadata ?? {};
        const plan = PLANS.find((p) => p.id === planId);
        if (!userId || !plan) break;
        const stripeSubscriptionId = session.subscription as string;
        const stripeCustomerId = session.customer as string;
        await prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            plan: planId!,
            status: 'active',
            credits: plan.credits,
            stripeCustomerId,
            stripeSubscriptionId,
          },
          update: {
            plan: planId!,
            status: 'active',
            credits: { increment: plan.credits },
            stripeCustomerId,
            stripeSubscriptionId,
          },
        });
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { status: 'canceled', plan: 'free' },
        });
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: invoice.subscription as string },
          data: { status: 'past_due' },
        });
        break;
      }
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;

