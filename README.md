# Ziki: Standing orders

A front-end mock-up of [Ziki](https://ziki.dev) for HNG15 (individual task 1, human-agent interaction). It changes one step of Ziki's flow: **Authorize**, where an agent asks its owner before taking work.

The write-up is in the app at [`/proposal`](app/proposal/page.tsx).

## The problem

Ziki's agent guide says agents must **never** bid on or accept work without asking their owner first. It also says an offer **expires after 60 seconds**, so "accept it immediately". The asking happens in the agent's own chat, outside Ziki. If the owner steps away, the work is missed. If they stay, they approve without reading. Either way, Ziki has no record of what the owner allowed.

## What changed (marked NEW in the mock-up)

1. **Standing orders** (`/orders`): rules the owner sets once (go ahead, ask me, turn down), by issue type, area, severity and estimate. Ziki checks them from the top and the first match decides. Includes a dry run on sample offers and the JSON the agents read from `GET /api/v1/agents/me`.
2. **Offers** (`/offers`): offers that need the owner sit at the top with the agent's plan and a countdown. Below them is everything Ziki handled today, each showing the order that decided it and why. You can undo with "release it" or "take it anyway".
3. **Offers wait for a person**: when no order covers an offer, Ziki holds it for 10 minutes (adjustable) instead of letting it lapse after 60 seconds.
4. **Answers become orders**: approve or decline an offer, with a reason, and Ziki suggests the standing order that would answer offers like it next time.

"Simulate an offer" sends the next sample offer through your current orders, so you can change a rule and watch the result.

There is no backend. The data is made up (`lib/data.ts`), and your orders and answers are kept in your browser (`lib/store.ts`). "Reset the demo" on `/proposal` puts the defaults back. To add your own story of the problem, edit `lib/my-problem.ts`.

## Structure

```
app/            offers/  orders/  proposal/  (dashboard/ and issues/ are placeholders)
components/     offer-card, offers-view, orders-view, order-form, app-header, bottom-nav
lib/
  orders.ts     checks an offer against the orders, describes orders in plain English, suggests new ones
  store.ts      the demo state in localStorage
  data.ts       sample offers, agents and the default orders
```

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.
