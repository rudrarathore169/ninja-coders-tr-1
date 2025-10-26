# Backend Demo Commands

Assumes backend is running on `http://localhost:5000` and you have seeded demo data with `npm run seed`.

1. Health check

```bash
curl http://localhost:5000/api/health
```

2. Register (optional)

```bash
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{"name":"Demo User","email":"demo@example.com","password":"Password123!"}'
```

3. Login

```bash
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"Password123!"}'
```

4. Create order (guest)

```bash
curl -X POST http://localhost:5000/api/orders -H "Content-Type: application/json" -d '{"items":[{"menuItemId":"REPLACE_WITH_ITEM_ID","name":"Garlic Bread","price":3.99,"qty":1}],"tableId":"REPLACE_WITH_TABLE_ID"}'
```

Replace `REPLACE_WITH_ITEM_ID` and `REPLACE_WITH_TABLE_ID` with IDs from your seeded data.

## Stripe CLI (local webhook testing)

If you want to test Stripe webhooks locally, install the Stripe CLI and forward events to your local webhook endpoint:

```bash
# Start listening and forward to local webhook
stripe listen --forward-to http://localhost:5000/api/payments/webhook

# In another terminal you can trigger test events, for example:
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
```

Make sure `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are set in your `.env` when testing with real Stripe events.
