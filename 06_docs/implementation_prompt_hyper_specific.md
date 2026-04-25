You are working on the NationalCarMart.shop website.

NON-NEGOTIABLE IMPLEMENTATION RULE
The attached site mockups are not “inspiration only.”
They are the target design direction for the implemented live site.

Your job is to recreate that exact overall look, feel, hierarchy, mood, and premium visual system in production-quality code, while swapping in the real live content from the repo and platform.

That means:
- use the mockups as the visual source of truth
- use the real inventory data, pricing, payments, vehicle photos, CTAs, forms, and dealership content from the repo / live data sources
- do NOT redesign the mockups into a different concept
- do NOT revert to a generic dealership template
- do NOT simplify the implementation into a plain off-the-shelf auto-site layout
- do NOT introduce white, bright, flat, or default-looking sections unless explicitly required for readability in small UI components

PRIMARY GOAL
Implement a production version of the mockups so the live site looks like the mockups, but populated with real data from the repo and existing platform integrations.

VISUAL SOURCE OF TRUTH
The attached mockups define:
- page structure
- section order
- style language
- spacing mood
- card styles
- button treatments
- badge system
- typography direction
- header / footer styling
- image treatment
- lighting / background mood
- premium black / dark steel / red / blue / white visual system

Think of the task as:
“Build the real website so it feels like these mockups came to life.”

NOT ACCEPTABLE
The following outcomes are wrong:
1. A generic DealerFire-style or dealership-template-looking site
2. A clean-but-boring redesign that loses the aggressive premium identity
3. A layout that uses the mockups only loosely
4. A site that keeps old structure and only changes colors
5. A site where the mockups are treated as marketing art but not actual UI direction
6. A site that feels like a basic inventory portal instead of a premium branded dealership experience

ACCEPTABLE
The correct outcome is:
- the implemented site clearly looks like the mockups
- the same mood carries across homepage, inventory, VDP, finance, trade, service, header, and footer
- the real repo inventory and live vehicle content are injected into the card layouts and sections shown in the mockups
- the final experience feels cinematic, premium, performance-driven, and conversion-focused

CORE DESIGN LANGUAGE
Use the attached muscle-car cinematic concept as the master brand system:
- dark steel and black base
- wet asphalt reflections
- red / blue / white light streak accents
- premium metallic logo treatment
- bold condensed performance typography
- high-contrast vehicle cards
- minimal but sharp glows
- strong CTA buttons
- polished panel borders
- subtle hex / smoke / brushed metal textures where appropriate

BRAND DIRECTION
- black / dark steel / charcoal base
- national red accent
- national blue accent
- steel / silver highlight typography
- cinematic urban night atmosphere
- premium dealership energy
- aggressive but trustworthy
- modern desktop-first
- fully responsive on mobile

REAL DATA RULES
Use real content from the repo / platform for:
- live inventory
- vehicle titles
- photos
- prices
- payment estimates
- mileage
- vehicle attributes
- financing forms
- trade forms
- contact info
- hours
- location
- testimonials/reviews if already connected
- dealership-specific content

If mockups show placeholder vehicles like Hellcats, Corvettes, trucks, SUVs, or finance sections:
- preserve the exact style and layout pattern
- replace those examples with actual matching inventory pulled from the repo or real data source when available
- if a specific category is missing in inventory, keep the design structure but populate with the most visually suitable live units

DO NOT:
- hardcode fake inventory into production
- leave mockup-only fake prices or fake counts in the live build
- leave concept-only labels if repo data exists
- use lorem ipsum

HOMEPAGE IMPLEMENTATION INSTRUCTIONS
Build the homepage to closely match the homepage mockup:
1. Premium dark header
2. Compact logo top-left
3. Nav with Inventory / Financing / Trade / Service / About / Contact
4. Prominent red “Get Approved” CTA
5. Hero section matching mockup composition and tone
6. Main CTA row: Shop Inventory / Get Approved / Value Your Trade
7. Service card row: Inventory / Financing / Trade / Service
8. Featured inventory cards styled like mockup using real repo vehicles
9. Financing confidence strip
10. Trust row: family-owned, fast approvals, Cleveland selection
11. Premium footer

The final homepage should feel visually extremely close to the supplied homepage mockup.

INVENTORY PAGE IMPLEMENTATION INSTRUCTIONS
Build inventory listing pages to closely match the supplied inventory mockup:
- dark filter rail on left
- strong search bar / filter bar at top
- premium inventory cards
- red price, blue payment styling
- live badges like New Arrival / Great Value / Family Favorite only if supported logically
- View Details + Get Approved CTA pattern
- dark steel panels and consistent red/blue glow accents
- result counts and sorting integrated into the mockup-style structure

The inventory page should look like the mockup brought to life with real inventory.

VDP IMPLEMENTATION INSTRUCTIONS
Build vehicle detail pages to closely match the VDP mockup:
- cinematic hero gallery
- strong vehicle title treatment
- right-side pricing / payment / CTA panel
- Get Approved / Check Availability / Value Trade / Call stack
- spec strip
- premium content sections below
- financing / trust / similar vehicles modules

Populate all data from real repo vehicle data, but preserve mockup layout and visual tone.

FINANCE PAGE IMPLEMENTATION INSTRUCTIONS
Build the finance page to match the finance mockup:
- bold hero with premium lighting / city / performance atmosphere
- strong approval message
- fast pre-approval form above fold
- financing-for-every-drive content blocks
- “what to bring”
- FAQ
- bad credit / no credit / first-time buyer / family vehicle confidence messaging
- direct response CTAs

This page should not feel like a boring generic form page.

COMPONENT SYSTEM RULES
Create reusable production components to support the mockup look:
- header
- footer
- hero blocks
- CTA buttons
- inventory cards
- section shells
- feature/service cards
- badge styles
- filter groups
- VDP action panels
- finance info blocks
- trust strips
- icon rows

Create design tokens for:
- colors
- border radii
- card backgrounds
- shadows
- metallic gradients
- red/blue line accents
- typography scale
- section spacing
- hover states
- focus states

MOBILE RULES
Do not lose the brand feel on mobile.
The mobile version should still look premium and aggressive, not like a flattened generic responsive collapse.
Preserve:
- dark surfaces
- visual hierarchy
- bold buttons
- strong card styling
- clear CTA access
- premium feeling condensed layouts

DEVELOPER CHECKPOINTS
Before considering the work complete, verify:
1. Does the site visually resemble the supplied mockups at first glance?
2. Does the homepage hero feel like the mockup?
3. Do inventory cards feel like the mockup cards?
4. Does the VDP feel like the supplied detail mockup?
5. Does the finance page feel like the supplied finance mockup?
6. Does the site still use real repo inventory and real content?
7. Is the experience clearly premium/branded rather than templated?
8. Is mobile still premium?
9. Are CTAs prominent across all key pages?
10. Is the implementation commit-ready?

FINAL DELIVERABLE
Deliver a production-quality implementation where:
- the mockups are clearly reflected in the final site
- real repo inventory/content powers the experience
- the site feels premium, cinematic, modern, and high-converting
- the visual system is consistent sitewide
- the live site looks like the mockups became real

If there is ever a conflict between:
A) keeping the old generic site structure
and
B) matching the supplied mockups more closely,

choose B unless it would break critical functionality.

Summary:
Implement the site mockups as the real site design, and use real inventory / real content from the repo inside that design.