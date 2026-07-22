# Task Tracker

## Employee
Pragati Dhumal

## Created Date
13 July 2026

## Created Time
07:08 PM IST

## Created At
2026-07-13 07:08 PM IST

## Created By
Unknown

## Task Description

I continued working on the subscription management enhancements with a primary focus on improving the overall subscription experience, introducing support for yearly billing, refining the subscription management workflow, and implementing the required business rules for plan upgrades and downgrades. Throughout the day, I focused on ensuring that the new functionality integrates seamlessly with the existing subscription flow while maintaining a clean, intuitive, and user-friendly interface.

### Subscription Billing Cycle Enhancements

A significant part of today's work involved implementing support for both **Monthly** and **Yearly** subscription plans across the application. I updated the Pricing page and the Manage Subscription page so users can easily switch between different billing cycles without affecting the existing subscription experience.

The implementation includes dynamically updating subscription information based on the selected billing cycle while ensuring the correct pricing, plan details, and billing information are displayed throughout the user journey. I also reviewed the existing subscription architecture to ensure that introducing yearly billing does not impact the current monthly subscription functionality.

### Monthly and Yearly User Interface

I designed and implemented separate UI behavior for the Monthly and Yearly subscription tabs instead of reusing the same layout for both options. The **Yearly** tab is now selected by default according to the business requirements.

Both billing options now have their own presentation while maintaining a consistent design language across the application. I refined the layout, spacing, alignment, typography, and component structure to improve readability and provide a smoother user experience when comparing billing options.

Additional attention was given to maintaining responsive behavior so the subscription interface remains consistent across different screen sizes.

### Subscription Management Business Rules

I implemented the required business logic for subscription management based on the updated product requirements.

Users are no longer allowed to downgrade directly from a **Yearly** subscription to a **Monthly** subscription. The only supported downgrade path is from any paid subscription directly to the **Free** plan.

To support this functionality, I updated the subscription validation logic, revised conditional rendering for downgrade options, and ensured unsupported subscription transitions are prevented throughout the application.

I also reviewed multiple subscription scenarios to confirm that only valid plan transitions are available to users while maintaining a consistent experience.

### Upgrade and Downgrade Flow Improvements

I reviewed the overall subscription management workflow and refined several areas related to plan upgrades and downgrades.

This included improving plan selection behavior, updating button visibility based on the user's current subscription, refining conditional rendering, improving state management, and ensuring the interface correctly reflects the user's active subscription.

I also performed additional code cleanup to improve maintainability and keep the subscription management components organized for future enhancements.

### Subscription UI Refinements

Several visual improvements were made throughout the subscription pages to improve usability and overall user experience.

These refinements included improving spacing, alignment, typography consistency, component hierarchy, and visual organization across the Pricing and Manage Subscription pages.

The objective was to make subscription information easier to understand while maintaining consistency with the application's existing design system.

### Auto-Renewal User Interface

I worked on enhancing the subscription management experience by designing and implementing the Auto-Renewal user interface.

The new interface focuses on presenting subscription-related information in a clear and user-friendly format. It displays important details such as the current subscription plan, billing cycle, next billing date, renewal information, and auto-renewal status, making it easier for users to understand their subscription at a glance.

The layout was designed to integrate seamlessly with the existing application while maintaining responsiveness and visual consistency.

### Subscription Renewal Reminder Popup

I also worked on implementing the Subscription Renewal Reminder Popup feature.

The popup is designed to notify users when their subscription is approaching its renewal or expiration period. It will display important subscription information, encourage users to upgrade or renew their plan, and provide a **"Don't show this again"** option to improve the overall user experience.

Special attention was given to defining the popup behavior so it appears only under the appropriate conditions and does not interrupt critical user workflows such as authentication, checkout, or payment processing.

### Testing and Validation

After completing the implementation, I reviewed and tested multiple subscription scenarios to validate the new functionality.

This included verifying Monthly and Yearly billing selection, checking UI behavior across different subscription states, validating the new downgrade restrictions, reviewing conditional rendering, and ensuring the overall subscription flow behaves consistently.

I also addressed several minor UI inconsistencies identified during testing to improve the overall quality and stability of the subscription management experience.

Overall, today's work was focused on strengthening the subscription management module by expanding billing support, enforcing business rules, improving the subscription user experience, enhancing subscription visibility, and preparing the application for a more complete and user-friendly renewal workflow.

add review and suggest changes also in this
Also  Review and UX Improvement Suggestions
In addition to the subscription enhancements, I reviewed multiple public-facing pages of the Mineral View application from both a usability and user experience perspective to identify opportunities for improving navigation, content organization, and overall visual consistency.
The review covered key pages including the **Home Page, Pricing, Blogs, News, FAQ, Glossary, Contact Us, Know Your Operators, Operator Details, Compare Production Performance, and Footer**.
During the review, I documented several improvement suggestions focused on simplifying page layouts, improving information hierarchy, reducing unnecessary scrolling, enhancing navigation, strengthening call-to-action visibility, improving content readability, and creating a more intuitive experience for mineral owners.
I also prepared recommendations for improving the pricing experience by making plan comparisons clearer, emphasizing yearly savings, refining plan presentation, and simplifying subscription selection. For the Home page, I suggested improvements related to content prioritization, trust-building elements, user journey optimization, and clearer primary actions.
Additionally, I reviewed the Blogs, News, FAQ, and Glossary sections and proposed enhancements such as improved search and filtering, better content categorization, enhanced article layouts, modern accordion designs, stronger visual hierarchy, and improved discoverability of educational resources.
Also added glossary term in xml file.

---

Generated by Governance Workbench
