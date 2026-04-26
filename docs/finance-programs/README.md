# Finance Program Match Engine Seed Package

This folder is intended to hold source lender/bank program documents for the Outcome Dealer OS Finance Program Match Engine.

## Seed files already added

- `src/data/finance-programs/lender_program_rules_seed.csv`

## Recommended source document location

Add uploaded bank/lender guideline files under:

- `docs/finance-programs/source-docs/`

Keep the original PDF/image filenames whenever possible so match results can cite the lender source document and page/section.

## Implementation rule

The seeded rules are for dealership guideline matching only. The app must not treat these as final approvals or denials. UI language must say:

- Appears to fit guideline
- Needs review
- Potential guideline conflict
- Bank callback controls
- Subject to lender approval

AI-extracted lender rules must remain draft/in-review until an admin approves them.

## Hardcoding strategy

1. Parse `lender_program_rules_seed.csv` into a typed seed module.
2. Convert numeric rule fields into numbers/decimals.
3. Keep source document and source detail attached to every rule.
4. Build deterministic match functions from the structured rows.
5. Keep all lender documents in this folder for auditability.
6. Add a later admin upload/review flow for new lender programs.
