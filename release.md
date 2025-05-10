## Summary

This release formalizes a delivery focused on frontend changes in the Console.

The most noticeable change is a rework of the "Monitoring" section, which now provides clearer information about the status of your modules.

We now fetch memory metrics directly from the Internet Computer management interface. This gives more granular data, which is now displayed. A new polar diagram has also been added to show where most of the data is stored.

This update also introduces a new "Health Check" section, which explains when and why a module can become frozen during its grace period. The goal is to help anticipate such events.

In relation to this, the presentation of the "auto-refill threshold" was improved, as the previous wording was misleading. Auto-refill doesn’t trigger when the threshold alone is reached, but when enough cycles are available to cover both the grace period and the threshold. This is now referred to as the "threshold trigger".

## Overview

> [!NOTE]
> No new versions of the modules (smart contracts), crates or libraries included.

## Changes

Here is a list of changes included in this release:

### Console (Frontend)

The console UI/UX has been improved as follows:

### Features

- Use ICP management to fetch memory metrics.
- Make a few types non-optional.
- Review the common Monitoring section.
- Implement the "Health Check" group.
- Revise auto-refill wording and improve the description of "Freezing Threshold" and "Grace Period".
- Change tabs from buttons to links to improve accessibility.
- Improve the step related to the primary domain in the Hosting wizard for authentication.
- Migrate upload components to Svelte v5.

### Fixes

- Cap Analytics pagination periodicity if the period is longer than the selected range.
- Fix issue where today was not included in the Analytics period when fetching data.

### Refactoring

- Move and rename Monitoring components to accommodate changes.
