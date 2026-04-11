# Workstation Interaction Model

## Design Philosophy

The workstation is the primary execution surface of Outcome Dealer OS.
It operates as a personal kanban board that aggregates work from across departments.

## Interaction Patterns

### Drag and Drop
- Cards can be dragged between any columns
- Visual feedback: drop target highlights with ring and background color
- Cards show reduced opacity while being dragged
- Moving to "Done" automatically marks card as completed

### Arrow Buttons
- Each card has left/right arrow buttons for quick column movement
- Arrows respect column boundaries (can't move left from first column)
- Click handlers stop propagation to prevent opening the card drawer

### Card Selection
- Clicking a card opens the detail drawer on the right side
- Drawer shows all card metadata, linked records, and lifecycle actions

### Quick Create
- "New Card" button opens a modal dialog
- Fields: title, description, priority, queue type
- New cards default to the Inbox column

### Filtering
- Filter by queue type (all / sales / finance / service / recon / bdc / management / general)
- Filter by priority (all / urgent / high / medium / low)
- Text search across card titles
- Clear button resets all filters

## Keyboard Behavior

- No keyboard shortcuts on the board itself (Cmd+K for global search)
- Keyboard navigation within the drawer for column movement buttons

## Card Drawer

The drawer provides:
1. Full card details (priority, queue, column, status, assignee, due date, source event)
2. Linked record section with "View Record" navigation button
3. Approval shield indicator
4. Tags display
5. **Complete** button (for active cards)
6. **Reopen** button (for completed cards)
7. Column movement buttons for all 5 columns

## Responsive Behavior

- Board uses horizontal scroll on smaller screens
- Columns are fixed width (288px) with flexible height
- Minimum board height ensures usable drag targets
