# AGNT v1.44.14 — Buyer MarketPulse recommendations

- Buyer recommendations now draw from the retained, current My Market campaigns as well as the latest daily MarketPulse feed. A new or updated buyer can match a listing from an earlier day while it remains current.
- A price update with no repeated property configuration uses the configuration already recorded for that campaign, and the latest stated guide. Sold, withdrawn, under-offer and auction-result updates close earlier open recommendations.
- Existing buyer eligibility, budget, suburb and configuration rules and outcomes remain unchanged. No data format, Firebase path or service-worker lifecycle change; only the release cache identifier advances.
