# CRM Foundation Notes

## Overview

The CRM foundation layer consists of five core domains that establish customer identity, lead tracking, communication history, and appointment scheduling. These domains form the base for all sales and service operations in the Outcome Dealer OS.

## Domain Hierarchy

```
Households (container)
    ↓
Customers (individuals)
    ↓
Leads (opportunities)
    ↓
├── Communication Events (interaction history)
└── Appointments (scheduled touchpoints)
```

## Core Domains

### 1. Households

**Purpose**: Container for buying units (families, businesses)

**Key Fields**:
- `householdName` - Optional name for business/family
- `householdType` - consumer | business | fleet
- `primaryCustomerId` - Main decision maker
- `preferredStoreId` - Location preference

**Relationships**:
- Has many customers (members)
- Has many leads (through customers)

**Events**: None (passive container)

**Use Cases**:
- Group family members for unified view
- Track business fleet accounts
- Aggregate household-level metrics

---

### 2. Customers

**Purpose**: Individual person records with contact information

**Key Fields**:
- `firstName`, `lastName`, `fullName` - Name variations
- `email`, `phone` - Contact methods
- `address`, `city`, `state`, `zip` - Location
- `lifecycleStage` - lead | prospect | customer | inactive
- `optInSms`, `optInEmail` - Communication consent

**Relationships**:
- Belongs to household (optional)
- Has many leads
- Has many communication events
- Has many appointments

**Events**: None (passive domain)

**Validation**:
- Email format validation
- At least one name field required

**Use Cases**:
- Central identity record
- Contact information management
- Communication consent tracking

---

### 3. Leads

**Purpose**: Sales opportunity tracking with attribution and workflow

**Key Fields**:
- `customerId` - Required customer reference
- `leadSource` - Attribution source
- `sourceCampaignId`, `sourceMedium`, `sourceDetail` - Attribution details
- `intentType` - buy | service | trade | finance | info
- `assignedToUserId`, `assignedTeam` - Ownership
- `status` - new | contacted | qualified | unqualified | converted
- `leadScore` - 0-100 numeric score
- `appointmentStatus`, `showroomStatus`, `soldLostStatus` - Workflow tracking

**Relationships**:
- Belongs to customer (required)
- Belongs to household (optional)
- Has many communication events
- Has many appointments
- Has many trade appraisals (future)
- Has many desk scenarios (future)

**Permissions**:
- `view_leads` - Read access
- `edit_leads` - Create/update access
- `assign_leads` - Assignment changes

**Events**:
- `lead_created` - On creation
- `lead_contacted` - On status progression or outbound contact

**Use Cases**:
- Sales pipeline management
- Lead attribution and ROI tracking
- Assignment and routing
- Conversion tracking

---

### 4. Communication Events

**Purpose**: Audit trail of all customer interactions

**Key Fields**:
- `customerId` - Required customer reference
- `leadId` - Optional lead context
- `channel` - phone | email | sms | chat | in_person
- `direction` - inbound | outbound
- `subject`, `body`, `transcript` - Content
- `summary` - AI-generated summary
- `aiGenerated` - Flag for AI content
- `aiConfidence` - 0-1 confidence score
- `consentChecked` - Consent verification flag

**Relationships**:
- Belongs to customer (required)
- Belongs to lead (optional)

**Permissions**:
- `edit_leads` - Required for creation

**Events**:
- `lead_contacted` - When outbound communication logged to a lead

**Audit Special Handling**:
- Low confidence (<0.8) AI content flagged for review
- Confidence score logged for all AI-generated content

**Use Cases**:
- Complete interaction history
- AI-assisted communication logging
- Compliance and consent tracking
- Response time tracking

---

### 5. Appointments

**Purpose**: Scheduled customer touchpoints and outcomes

**Key Fields**:
- `customerId` - Required customer reference
- `leadId` - Optional lead context
- `appointmentType` - test_drive | appraisal | delivery | service | consultation
- `scheduledFor` - DateTime of appointment
- `status` - scheduled | confirmed | completed | no_show | cancelled
- `assignedUserId` - Assigned staff member
- `showResult` - showed | no_show | rescheduled | cancelled

**Relationships**:
- Belongs to customer (required)
- Belongs to lead (optional)

**Permissions**:
- `edit_leads` - Required for create/update

**Events**:
- `appointment_booked` - On creation
- `appointment_rescheduled` - When scheduledFor changes
- `appointment_no_show` - When marked as no-show

**Validation**:
- Date format validation for scheduledFor
- Must be valid future date for new appointments

**Use Cases**:
- Appointment booking and confirmation
- Show rate tracking
- Staff scheduling
- Customer engagement tracking

## Data Flow Patterns

### New Lead Entry

```
1. Create Customer (if new)
   └─> customer.create audit

2. Create Lead
   ├─> lead.create audit
   └─> lead_created event

3. Log Initial Contact (optional)
   ├─> communication_event.create audit
   └─> lead_contacted event

4. Book Appointment (optional)
   ├─> appointment.create audit
   └─> appointment_booked event
```

### Lead Progression

```
1. Update Lead Status
   ├─> lead.update audit (before/after)
   └─> lead_contacted event (if status → contacted/qualified)

2. Log Follow-up Communications
   ├─> communication_event.create audit
   └─> lead_contacted event (if outbound)

3. Update Appointment Status
   ├─> appointment.update audit (before/after)
   └─> appointment_no_show event (if no-show)
```

## Query Patterns

### Household View
```typescript
const detail = await getHouseholdDetail(householdId)
// Returns:
// - household
// - members (all customers)
// - leads (all household leads)
// - communications (all customer communications)
// - appointments (all customer appointments)
```

### Customer View
```typescript
const detail = await getCustomerDetail(customerId)
// Returns:
// - customer
// - household (if linked)
// - leads (customer's opportunities)
```

### Lead View
```typescript
const detail = await getLeadDetail(leadId)
// Returns:
// - lead
// - customer
// - household (if linked)
// - communications (lead-specific)
// - appointments (lead-specific)
```

## Permission Model

### Read Permissions
- Households: Implicit through customer/lead visibility
- Customers: Implicit through lead visibility
- Leads: `view_leads` required
- Communications: `view_leads` required (lead context)
- Appointments: `view_leads` required (lead context)

### Write Permissions
- Households: `edit_leads` implied
- Customers: `edit_leads` implied
- Leads Create: `edit_leads`
- Leads Update: `edit_leads`
- Leads Assign: `assign_leads`
- Communications Create: `edit_leads`
- Appointments Create/Update: `edit_leads`

## Audit Strategy

### What's Logged
- All creates: Full after state
- All updates: Before and after state
- Actor context: User ID, role, source
- AI context: Confidence score, review flag

### What's NOT Logged
- Read operations
- Query operations
- List operations
- Permission checks

### Retention
- Audit logs are permanent
- No automatic deletion
- Archive strategy TBD

## Event Strategy

### Event Purposes
1. **Downstream Workflows**: Trigger automated actions
2. **Integration Sync**: Notify external systems
3. **Analytics**: Feed reporting pipelines
4. **Notifications**: Alert users of state changes

### Event Consumers (Future)
- Automation engine (AI agent actions)
- Integration sync service (DMS, CRM)
- Notification service (SMS, email)
- Analytics pipeline (reporting)

## AI Integration Points

### Current AI Capabilities
1. **Communication Summarization**: Generate summaries of call transcripts, emails
2. **Confidence Scoring**: Rate AI-generated content quality
3. **Review Flagging**: Flag low-confidence content for human review

### Future AI Capabilities
1. **Lead Scoring**: AI-powered lead quality prediction
2. **Next Best Action**: Recommend next steps for leads
3. **Sentiment Analysis**: Analyze communication tone
4. **Response Generation**: Draft follow-up messages

## Migration from Legacy

When migrating from existing CRM:

1. **Import Customers First**
   - Create households as needed
   - Link customers to households
   - Preserve original IDs in notes

2. **Import Leads Second**
   - Link to migrated customers
   - Map legacy statuses to new statuses
   - Preserve attribution data

3. **Import Communication History**
   - Link to customers and leads
   - Mark as migrated data (no events)
   - Preserve timestamps

4. **Import Appointments Last**
   - Only import future appointments
   - Link to customers and leads
   - Update statuses as needed

## Metrics and KPIs

### Lead Metrics
- Lead volume by source
- Lead conversion rate by source
- Time to first contact
- Time to qualification
- Lead score distribution

### Appointment Metrics
- Appointment show rate
- Average time to appointment
- Appointment outcome distribution
- Appointments per lead

### Communication Metrics
- Average response time
- Communication frequency
- Channel preference
- AI-generated content usage

## Known Limitations

1. **No Deduplication**: Customer/household dedup is manual
2. **Simple Scoring**: Lead scoring is basic numeric (future: AI-powered)
3. **No Bulk Operations**: All operations are single-record
4. **No Complex Workflows**: Status transitions are simple (future: workflow engine)
5. **No Email Integration**: Communication logging is manual (future: inbox integration)
6. **No Calendar Sync**: Appointments don't sync to calendars (future: integration)

## Next Steps

After CRM foundation (PR 7), the next layer builds sales structure (PR 8):

1. **Vehicle Catalog**: Make/model/trim reference data
2. **Inventory Units**: Vehicles in stock with recon tracking
3. **Trade Appraisals**: Customer trade valuations with approval workflow
4. **Desk Scenarios**: Payment structure calculations
5. **Quotes**: Customer-facing presentations

These domains will reference leads and build upon the CRM foundation.

## Related Documentation

- [Domain Service Pattern](./domain_service_pattern.md) - How services are structured
- [Event Taxonomy](./event_taxonomy.md) - Event definitions
- [Permissions Matrix](./permissions_matrix.md) - Role-based permissions
- [Schema Overview](./schema_overview.md) - Database schema
