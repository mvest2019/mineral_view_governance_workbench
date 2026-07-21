# Task Tracker

## Employee
Shubham Kamble

## Created Date
21 July 2026

## Created Time
06:35 PM IST

## Created At
2026-07-21 06:35 PM IST

## Created By
Unknown

## Task Description

All technical updates made to the **Non-Consent** page were verified against standard onshore joint operating protocols—such as the AAPL Form 610—to ensure precise coverage of risk multipliers, payout triggers, and joint venture rights. Concurrently, the website appearance audit identified actionable UI/UX optimizations designed to improve reading flow, increase session duration, and seamlessly guide users through complex financial and regulatory topics.

1. Quality Assurance Audit & Content Optimization: "Non-Consent in Oil and Gas"

The first dedicated multi-hour segment of today's sprint involved a deep-dive review and technical enhancement of our existing operator-facing page for **Non-Consent**. In upstream joint-venture operations, a non-consent election is a critical contractual decision where a working interest owner chooses not to participate in a proposed well operation (such as drilling, deepening, sidetracking, or reworking).

Today's audit ensured the page provides a clear, balanced, and technically rigorous explanation of how non-consent mechanisms function, protecting the operator's capital while clarifying the non-consenting party's rights and financial obligations.

- **Contractual Sequence Under Joint Operating Agreements (JOAs):**
  - *Notice and Election Windows:* Refined the explanation of standard JOA notice procedures (such as under AAPL Form 610). When a party proposes a subsequent well operation, non-operating partners are bound to a strict election window—typically 30 days under standard conditions or 48 hours when a drilling rig is actively on location.
  - *Legal Distinction of Non-Consent Status:* Enhanced the text to clarify that electing non-consent does not strip an owner of their underlying leasehold title. Instead, it acts as a temporary contractual relinquishment of operating rights and revenue streams tied specifically to that proposed wellbore or designated spacing unit.
- **The Mechanics of Non-Consent Risk Penalty Multipliers:**
  - *Carrying the Capital Risk:* Detailed how consenting partners step in to absorb 100% of the non-consenting owner's financial obligation. In exchange for carrying this front-loaded financial risk, consenting parties are legally entitled to recover all out-of-pocket operating costs plus a substantial risk penalty multiplier out of the well's initial revenue.
  - *Granular Multiplier Scaling:* Provided clear educational context on how risk penalty percentages scale based on the operational and geological risk profile of the proposal. The text outlines standard onshore industry ranges, showing that penalties typically sit between 100% and 200% for standard surface equipment and routine lease operating expenses, but scale from 300% to 400% for high-risk exploratory wells or deep horizontal completions.
- **Accounting Milestones: Before Payout (BPO) to After Payout (APO) Transitions:**
  - *Revenue Redirection (BPO Phase):* Documented the joint account workflow during the Before Payout (BPO) stage. During this period, 100% of the non-consenting partner's net revenue interest (minus basic lessor royalties) is directed to the consenting parties until the full cost plus the penalty multiplier is satisfied.
  - *The Back-In Option (APO Milestone):* Clarified the exact operational moment when After Payout (APO) is achieved. Once the penalty is fully recouped, the non-consenting party automatically "backs into" their original working interest share, regaining their proportional net revenue distributions while resuming responsibility for ongoing Lease Operating Expenses (LOEs).
- **Portfolio Impact and Financial Considerations:**
  - *Borrowing Base Adjustments:* Added practical value by outlining how frequent non-consent elections can impact an investor's balance sheet. Because lenders place a heavy discount on non-revenue-producing, unrecovered BPO interests during reserve-based lending (RBL) evaluations, maintaining unrecovered non-consent positions can temporarily reduce available credit capacity.

2. Frontend Interface & Usability Review: New Website Appearance Audit

To ensure our dense, technical content is easily digestible for landmen, investors, and regulatory managers, several hours of today's sprint were dedicated to a thorough usability and visual design audit of our updated website appearance. Improving the site's frontend design hierarchy directly supports user retention, reduces bounce rates, and enhances search performance.

- **Layout Structure & Visual Hierarchy for Dense Content:**
  - *Typography and Line Spacing:* Evaluated line height, paragraph spacing, and font sizes across long-form glossary pages. Recommended setting line-height to `1.65` and adding subtle contrasting backgrounds to blockquotes, equations, and technical callout boxes to break up dense walls of text.
  - *Table Rendering on Mobile Devices:* Identified potential display bottlenecks where complex multi-column accounting tables (such as BPO/APO metrics or penalty ranges) require horizontal scrolling on mobile screens. Suggested responsive CSS layouts and collapsible table structures to maintain seamless readability across all device types.
- **Navigation, Search, and Interactivity Enhancements:**
  - *Sticky Table of Contents (ToC):* Proposed adding a persistent, sidebar-anchored table of contents on long-form glossary pages, allowing readers to jump directly to specific subtopics like tax mechanics, legal risks, or state regulatory procedures.
  - *Inline Terminology Tooltips ("Hover Dictionary"):* Suggested implementing lightweight inline tooltips for advanced industry acronyms (such as *LOE*, *IDC*, *COPAS*, and *JIB*). When users hover over these acronyms within a text, a small popup displays a quick definition, keeping readers engaged without navigating away from the page.
- **Call-to-Action (CTA) and Related Content Placement:**
  - *Internal Linking & Related Term Cards:* Reviewed the placement of cross-referenced glossary links. Recommended adding visual "Related Terms" cards at the bottom of each page to intuitively guide users to connected topics (e.g., linking the **Non-Consent** page directly to **Payout (BPO/APO)**, **JOA**, and **Farmout Agreement**).
  - *Disclaimers & Educational Clarity:* Recommended standardizing the placement of generic educational disclaimers across all technical pages, ensuring they are clearly visible in the footer or sidebar without distracting from the main body content.

Operations and Website Experience Integration Matrix

To illustrate how today's content refinements and visual usability proposals align to support user engagement and technical precision, the following alignment matrix summarizes today's outputs:

**Work Focus Zone****Target Reader Persona****Core Technical / Usability Anchor****Value-Added Enhancements Introduced Today****Non-Consent Glossary Audit**• Working Interest Owners
• Joint Venture Auditors
• Upstream Landmen• AAPL Form 610 JOA
• COPAS Accounting Protocols
• Statutory Pooling Rules• Refined election windows (30 days / 48 hours), penalty scaling (100%–400%), and BPO/APO back-in mechanics.
• Added practical context on how unrecovered BPO interests affect borrowing base calculations.**Website Appearance Audit**• Platform Visitors
• Mobile Readers
• Web Developers• Responsive UX Design
• Readability Best Practices
• Frontend Navigation• Proposed responsive CSS adjustments for complex data tables.
• Recommended a sticky Table of Contents and inline terminology tooltips to increase on-page retention time.

---

Generated by Governance Workbench
