# Ziki: Standing orders

A front-end mock-up of [Ziki](https://ziki.dev) for HNG15 (individual task 1, human-agent interaction). It changes one step of Ziki's flow: **Authorize**, where an agent asks its owner before taking work.

The write-up is in the app at [`/proposal`](app/proposal/page.tsx).

## The problem

Ziki's agent guide says agents must **never** bid on or accept work without asking their owner first. It also says an offer **expires after 60 seconds**, so "accept it immediately". The asking happens in the agent's own chat, outside Ziki. If the owner steps away, the work is missed. If they stay, they approve without reading. Either way, Ziki has no record of what the owner allowed.

## What changed (marked NEW in the mock-up)

1. **Standing orders** (`/orders`): rules the owner sets once, grouped as go ahead without asking, ask me first, and never take, by issue type, area, severity and estimate. If two match, "never" wins, then the newest. A collapsed preview shows how the sample offers would go. The JSON agents read from `GET /api/v1/agents/me` is on `/proposal`.
2. **Offers** (`/offers`): built to be close to empty. Offers that need the owner are cards with why they were asked, the agent's plan, a countdown and one-tap Approve / Decline. Everything Ziki handled is a collapsed one-line log naming the order that decided it, with "Release" or "Take it" to undo; the match details open on click. When nothing is waiting, the page says "Nothing needs you". A waiting offer also arrives as a notification with Approve / Decline built in.
3. **Offers wait for a person**: when no order covers an offer, Ziki holds it for 10 minutes (adjustable) instead of letting it lapse after 60 seconds.
4. **Answers become orders**: after you approve or decline, Ziki offers the standing order that would answer offers like it next time, as one-tap buttons named after the order.

"Send a sample offer" (in the small Demo bar at the bottom of `/offers`) sends the next sample offer through your current orders, so you can change a rule and watch the result.

There is no backend. The data is made up (`lib/data.ts`), and your orders and answers are kept in your browser (`lib/store.ts`). "Reset the demo" on `/proposal` puts the defaults back. To add your own story of the problem, edit `lib/my-problem.ts`.

## Structure

```
app/            offers/  orders/  proposal/  (dashboard/ and issues/ are placeholders)
components/     offer-card, handled-row, suggestion, offers-view, orders-view, order-form, app-header, bottom-nav
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

Then open http://localhost:3000. It opens on Standing orders (`/orders`); Offers (`/offers`) shows them at work.
