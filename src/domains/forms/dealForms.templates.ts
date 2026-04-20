/**
 * Deal Forms Printing System — template registry.
 *
 * Defines the canonical set of dealership form templates. Each template
 * specifies its sections, field definitions, and display metadata.
 * Adding a new form means adding a new entry here — no page-level logic needed.
 */
import type { DealFormTemplate, PacketPreset, FormFieldDef } from './dealForms.types'

// ---------------------------------------------------------------------------
// Helper factory
// ---------------------------------------------------------------------------

function field(
  id: string,
  label: string,
  dataKey: FormFieldDef['dataKey'],
  section: string,
  opts?: Partial<Pick<FormFieldDef, 'type' | 'required' | 'width' | 'helpText'>>
): FormFieldDef {
  return {
    id,
    label,
    dataKey,
    section,
    type: opts?.type ?? 'text',
    required: opts?.required ?? false,
    width: opts?.width ?? 'half',
    helpText: opts?.helpText,
  }
}

// ---------------------------------------------------------------------------
// Individual form templates
// ---------------------------------------------------------------------------

const buyersOrder: DealFormTemplate = {
  id: 'buyers-order',
  name: "Buyer's Order",
  shortName: "Buyer's Order",
  category: 'deal_documents',
  description: 'Primary purchase agreement showing vehicle, price, trade, and payment structure.',
  version: '1.0',
  printOrder: 1,
  sections: ['Dealer', 'Buyer', 'Vehicle', 'Trade', 'Financial Summary'],
  fields: [
    field('bo-dealer-name', 'Dealer Name', 'dealerName', 'Dealer', { required: true, width: 'half' }),
    field('bo-dealer-address', 'Dealer Address', 'dealerAddress', 'Dealer', { width: 'half' }),
    field('bo-deal-number', 'Deal #', 'dealNumber', 'Dealer', { width: 'third' }),
    field('bo-deal-date', 'Deal Date', 'dealDate', 'Dealer', { type: 'date', width: 'third' }),
    field('bo-salesperson', 'Salesperson', 'salesperson', 'Dealer', { width: 'third' }),

    field('bo-buyer-name', 'Buyer Full Name', 'buyerFullName', 'Buyer', { required: true, width: 'half' }),
    field('bo-buyer-address', 'Address', 'buyerAddress', 'Buyer', { width: 'half' }),
    field('bo-buyer-city', 'City', 'buyerCity', 'Buyer', { width: 'third' }),
    field('bo-buyer-state', 'State', 'buyerState', 'Buyer', { width: 'third' }),
    field('bo-buyer-zip', 'ZIP', 'buyerZip', 'Buyer', { width: 'third' }),
    field('bo-buyer-phone', 'Phone', 'buyerPhone', 'Buyer', { width: 'half' }),
    field('bo-buyer-email', 'Email', 'buyerEmail', 'Buyer', { width: 'half' }),
    field('bo-cobuyer-name', 'Co-Buyer Name', 'coBuyerFullName', 'Buyer', { width: 'full' }),

    field('bo-vin', 'VIN', 'vehicleVIN', 'Vehicle', { required: true, width: 'full' }),
    field('bo-year', 'Year', 'vehicleYear', 'Vehicle', { width: 'third' }),
    field('bo-make', 'Make', 'vehicleMake', 'Vehicle', { width: 'third' }),
    field('bo-model', 'Model', 'vehicleModel', 'Vehicle', { width: 'third' }),
    field('bo-trim', 'Trim', 'vehicleTrim', 'Vehicle', { width: 'half' }),
    field('bo-stock', 'Stock #', 'vehicleStockNumber', 'Vehicle', { width: 'half' }),
    field('bo-mileage', 'Mileage', 'vehicleMileage', 'Vehicle', { type: 'number', width: 'half' }),
    field('bo-color', 'Color', 'vehicleColor', 'Vehicle', { width: 'half' }),

    field('bo-trade-year', 'Trade Year', 'tradeYear', 'Trade', { width: 'third' }),
    field('bo-trade-make', 'Trade Make', 'tradeMake', 'Trade', { width: 'third' }),
    field('bo-trade-model', 'Trade Model', 'tradeModel', 'Trade', { width: 'third' }),
    field('bo-trade-vin', 'Trade VIN', 'tradeVIN', 'Trade', { width: 'half' }),
    field('bo-trade-allowance', 'Trade Allowance', 'tradeAllowance', 'Trade', { type: 'currency', width: 'half' }),
    field('bo-trade-payoff', 'Trade Payoff', 'tradePayoff', 'Trade', { type: 'currency', width: 'half' }),
    field('bo-net-trade', 'Net Trade Value', 'netTradeValue', 'Trade', { type: 'currency', width: 'half' }),

    field('bo-sale-price', 'Sale Price', 'salePrice', 'Financial Summary', { type: 'currency', required: true, width: 'half' }),
    field('bo-down-payment', 'Down Payment', 'downPayment', 'Financial Summary', { type: 'currency', width: 'half' }),
    field('bo-taxes', 'Taxes', 'taxesAmount', 'Financial Summary', { type: 'currency', width: 'half' }),
    field('bo-fees', 'Fees', 'feesAmount', 'Financial Summary', { type: 'currency', width: 'half' }),
    field('bo-total', 'Total Amount Due', 'totalAmountDue', 'Financial Summary', { type: 'currency', width: 'full' }),
  ],
}

const retailPurchaseAgreement: DealFormTemplate = {
  id: 'retail-purchase-agreement',
  name: 'Retail Purchase Agreement',
  shortName: 'Retail Agreement',
  category: 'deal_documents',
  description: 'Formal retail purchase agreement for signed deals.',
  version: '1.0',
  printOrder: 2,
  sections: ['Parties', 'Vehicle', 'Terms'],
  fields: [
    field('rpa-dealer-name', 'Dealer Name', 'dealerName', 'Parties', { required: true, width: 'half' }),
    field('rpa-dealer-lic', 'Dealer License', 'dealerLicenseNumber', 'Parties', { width: 'half' }),
    field('rpa-buyer-name', 'Buyer Full Name', 'buyerFullName', 'Parties', { required: true, width: 'half' }),
    field('rpa-cobuyer-name', 'Co-Buyer Name', 'coBuyerFullName', 'Parties', { width: 'half' }),
    field('rpa-buyer-address', 'Buyer Address', 'buyerAddress', 'Parties', { width: 'full' }),
    field('rpa-vin', 'VIN', 'vehicleVIN', 'Vehicle', { required: true, width: 'full' }),
    field('rpa-vehicle-desc', 'Vehicle Description', 'vehicleDescription', 'Vehicle', { width: 'full' }),
    field('rpa-stock', 'Stock #', 'vehicleStockNumber', 'Vehicle', { width: 'half' }),
    field('rpa-mileage', 'Mileage', 'vehicleMileage', 'Vehicle', { type: 'number', width: 'half' }),
    field('rpa-sale-price', 'Purchase Price', 'salePrice', 'Terms', { type: 'currency', required: true, width: 'half' }),
    field('rpa-deal-type', 'Deal Type', 'dealType', 'Terms', { width: 'half' }),
    field('rpa-sale-date', 'Sale Date', 'saleDate', 'Terms', { type: 'date', width: 'half' }),
    field('rpa-salesperson', 'Salesperson', 'salesperson', 'Terms', { width: 'half' }),
    field('rpa-fi-manager', 'F&I Manager', 'fiManager', 'Terms', { width: 'half' }),
  ],
}

const creditApplicationPrintout: DealFormTemplate = {
  id: 'credit-application-printout',
  name: 'Credit Application Printout',
  shortName: 'Credit App',
  category: 'credit_finance',
  description: 'Printed copy of the completed credit application for signatures.',
  version: '1.0',
  printOrder: 5,
  sections: ['Applicant', 'Employment', 'Residence', 'Co-Applicant'],
  fields: [
    field('cap-buyer-name', 'Applicant Full Name', 'buyerFullName', 'Applicant', { required: true, width: 'half' }),
    field('cap-buyer-dob', 'Date of Birth', 'buyerDOB', 'Applicant', { type: 'date', width: 'half' }),
    field('cap-buyer-ssn', 'SSN (Last 4)', 'buyerSSNMasked', 'Applicant', { type: 'masked', width: 'third' }),
    field('cap-buyer-dl', "Driver's License #", 'buyerDLNumber', 'Applicant', { width: 'third' }),
    field('cap-buyer-dl-state', 'DL State', 'buyerDLState', 'Applicant', { width: 'third' }),
    field('cap-buyer-phone', 'Phone', 'buyerPhone', 'Applicant', { width: 'half' }),
    field('cap-buyer-email', 'Email', 'buyerEmail', 'Applicant', { width: 'half' }),
    field('cap-buyer-address', 'Current Address', 'buyerAddress', 'Residence', { width: 'full' }),
    field('cap-buyer-city', 'City', 'buyerCity', 'Residence', { width: 'third' }),
    field('cap-buyer-state', 'State', 'buyerState', 'Residence', { width: 'third' }),
    field('cap-buyer-zip', 'ZIP', 'buyerZip', 'Residence', { width: 'third' }),
    field('cap-buyer-housing', 'Housing Status', 'buyerHousingStatus', 'Residence', { width: 'half' }),
    field('cap-buyer-housing-pmt', 'Monthly Housing Payment', 'buyerMonthlyHousing', 'Residence', { type: 'currency', width: 'half' }),
    field('cap-employer', 'Employer Name', 'buyerEmployer', 'Employment', { width: 'half' }),
    field('cap-occupation', 'Occupation', 'buyerOccupation', 'Employment', { width: 'half' }),
    field('cap-income', 'Gross Monthly Income', 'buyerMonthlyIncome', 'Employment', { type: 'currency', width: 'half' }),
    field('cap-cobuyer-name', 'Co-Applicant Name', 'coBuyerFullName', 'Co-Applicant', { width: 'half' }),
    field('cap-cobuyer-dob', 'Co-Applicant DOB', 'coBuyerDOB', 'Co-Applicant', { type: 'date', width: 'half' }),
    field('cap-cobuyer-employer', 'Co-Applicant Employer', 'coBuyerEmployer', 'Co-Applicant', { width: 'half' }),
    field('cap-cobuyer-income', 'Co-Applicant Income', 'coBuyerMonthlyIncome', 'Co-Applicant', { type: 'currency', width: 'half' }),
  ],
}

const dealRecap: DealFormTemplate = {
  id: 'deal-recap',
  name: 'Deal Recap',
  shortName: 'Deal Recap',
  category: 'deal_documents',
  description: 'Summary of all deal numbers for manager and F&I review.',
  version: '1.0',
  printOrder: 3,
  sections: ['Deal Info', 'Buyer', 'Vehicle', 'Structure', 'Lender'],
  fields: [
    field('dr-deal-number', 'Deal #', 'dealNumber', 'Deal Info', { width: 'third' }),
    field('dr-deal-date', 'Deal Date', 'dealDate', 'Deal Info', { type: 'date', width: 'third' }),
    field('dr-deal-type', 'Deal Type', 'dealType', 'Deal Info', { width: 'third' }),
    field('dr-salesperson', 'Salesperson', 'salesperson', 'Deal Info', { width: 'half' }),
    field('dr-fi-manager', 'F&I Manager', 'fiManager', 'Deal Info', { width: 'half' }),
    field('dr-buyer', 'Buyer', 'buyerFullName', 'Buyer', { required: true, width: 'half' }),
    field('dr-cobuyer', 'Co-Buyer', 'coBuyerFullName', 'Buyer', { width: 'half' }),
    field('dr-vin', 'VIN', 'vehicleVIN', 'Vehicle', { width: 'full' }),
    field('dr-year', 'Year', 'vehicleYear', 'Vehicle', { width: 'third' }),
    field('dr-make', 'Make', 'vehicleMake', 'Vehicle', { width: 'third' }),
    field('dr-model', 'Model', 'vehicleModel', 'Vehicle', { width: 'third' }),
    field('dr-sale-price', 'Sale Price', 'salePrice', 'Structure', { type: 'currency', required: true, width: 'third' }),
    field('dr-down', 'Down Payment', 'downPayment', 'Structure', { type: 'currency', width: 'third' }),
    field('dr-trade-allowance', 'Trade Allowance', 'tradeAllowance', 'Structure', { type: 'currency', width: 'third' }),
    field('dr-trade-payoff', 'Trade Payoff', 'tradePayoff', 'Structure', { type: 'currency', width: 'third' }),
    field('dr-taxes', 'Taxes', 'taxesAmount', 'Structure', { type: 'currency', width: 'third' }),
    field('dr-fees', 'Fees', 'feesAmount', 'Structure', { type: 'currency', width: 'third' }),
    field('dr-amount-financed', 'Amount Financed', 'amountFinanced', 'Structure', { type: 'currency', width: 'third' }),
    field('dr-term', 'Term (Months)', 'termMonths', 'Structure', { type: 'number', width: 'third' }),
    field('dr-apr', 'APR', 'apr', 'Structure', { width: 'third' }),
    field('dr-payment', 'Monthly Payment', 'monthlyPayment', 'Structure', { type: 'currency', width: 'third' }),
    field('dr-lender', 'Lender', 'lenderName', 'Lender', { width: 'half' }),
    field('dr-lender-status', 'Decision Status', 'lenderDecisionStatus', 'Lender', { width: 'half' }),
  ],
}

const tradeAppraisalWorksheet: DealFormTemplate = {
  id: 'trade-appraisal-worksheet',
  name: 'Trade Appraisal / Trade Worksheet',
  shortName: 'Trade Worksheet',
  category: 'trade',
  description: "Appraisal worksheet for the customer's trade-in vehicle.",
  version: '1.0',
  printOrder: 10,
  sections: ['Customer', 'Trade Vehicle', 'Appraisal Values'],
  fields: [
    field('ta-buyer-name', 'Customer Name', 'buyerFullName', 'Customer', { required: true, width: 'half' }),
    field('ta-date', 'Appraisal Date', 'dealDate', 'Customer', { type: 'date', width: 'half' }),
    field('ta-year', 'Year', 'tradeYear', 'Trade Vehicle', { required: true, width: 'third' }),
    field('ta-make', 'Make', 'tradeMake', 'Trade Vehicle', { required: true, width: 'third' }),
    field('ta-model', 'Model', 'tradeModel', 'Trade Vehicle', { required: true, width: 'third' }),
    field('ta-trim', 'Trim', 'tradeTrim', 'Trade Vehicle', { width: 'third' }),
    field('ta-vin', 'VIN', 'tradeVIN', 'Trade Vehicle', { width: 'two-thirds' }),
    field('ta-mileage', 'Mileage', 'tradeMileage', 'Trade Vehicle', { type: 'number', width: 'half' }),
    field('ta-condition', 'Condition Notes', 'tradeConditionNotes', 'Trade Vehicle', { type: 'textarea', width: 'full' }),
    field('ta-acv', 'Actual Cash Value (ACV)', 'tradeACV', 'Appraisal Values', { type: 'currency', width: 'half' }),
    field('ta-allowance', 'Trade Allowance', 'tradeAllowance', 'Appraisal Values', { type: 'currency', width: 'half' }),
    field('ta-payoff', 'Payoff Amount', 'tradePayoff', 'Appraisal Values', { type: 'currency', width: 'half' }),
    field('ta-net-trade', 'Net Trade Value', 'netTradeValue', 'Appraisal Values', { type: 'currency', width: 'half' }),
    field('ta-payoff-lender', 'Payoff Lender', 'tradePayoffLender', 'Appraisal Values', { width: 'full' }),
  ],
}

const privacyNotice: DealFormTemplate = {
  id: 'privacy-notice',
  name: 'Privacy Notice',
  shortName: 'Privacy Notice',
  category: 'disclosure',
  description: 'Gramm-Leach-Bliley Act privacy disclosure for the customer.',
  version: '1.0',
  printOrder: 20,
  sections: ['Parties'],
  fields: [
    field('pn-dealer-name', 'Dealer Name', 'dealerName', 'Parties', { required: true, width: 'half' }),
    field('pn-buyer-name', 'Customer Name', 'buyerFullName', 'Parties', { required: true, width: 'half' }),
    field('pn-date', 'Date', 'dealDate', 'Parties', { type: 'date', width: 'half' }),
    field('pn-buyer-address', 'Customer Address', 'buyerAddress', 'Parties', { width: 'half' }),
  ],
}

const odometerStatement: DealFormTemplate = {
  id: 'odometer-statement',
  name: 'Odometer Disclosure Statement',
  shortName: 'Odometer Disclosure',
  category: 'disclosure',
  description: 'Federal odometer disclosure as required by TIMA.',
  version: '1.0',
  printOrder: 21,
  sections: ['Vehicle', 'Parties'],
  fields: [
    field('od-vin', 'VIN', 'vehicleVIN', 'Vehicle', { required: true, width: 'full' }),
    field('od-year', 'Year', 'vehicleYear', 'Vehicle', { required: true, width: 'third' }),
    field('od-make', 'Make', 'vehicleMake', 'Vehicle', { required: true, width: 'third' }),
    field('od-model', 'Model', 'vehicleModel', 'Vehicle', { required: true, width: 'third' }),
    field('od-mileage', 'Odometer Reading', 'vehicleMileage', 'Vehicle', { type: 'number', required: true, width: 'half' }),
    field('od-buyer', 'Buyer Name', 'buyerFullName', 'Parties', { required: true, width: 'half' }),
    field('od-dealer', 'Selling Dealer', 'dealerName', 'Parties', { required: true, width: 'half' }),
    field('od-date', 'Transfer Date', 'deliveryDate', 'Parties', { type: 'date', width: 'half' }),
  ],
}

const arbitrationAcknowledgment: DealFormTemplate = {
  id: 'arbitration-acknowledgment',
  name: 'Arbitration / Delivery Acknowledgment',
  shortName: 'Delivery Ack',
  category: 'delivery',
  description: 'Customer acknowledgment of arbitration agreement and vehicle delivery.',
  version: '1.0',
  printOrder: 22,
  sections: ['Parties', 'Vehicle', 'Delivery'],
  fields: [
    field('aa-buyer', 'Buyer Name', 'buyerFullName', 'Parties', { required: true, width: 'half' }),
    field('aa-cobuyer', 'Co-Buyer Name', 'coBuyerFullName', 'Parties', { width: 'half' }),
    field('aa-vin', 'VIN', 'vehicleVIN', 'Vehicle', { required: true, width: 'full' }),
    field('aa-vehicle', 'Vehicle Description', 'vehicleDescription', 'Vehicle', { width: 'full' }),
    field('aa-delivery-date', 'Delivery Date', 'deliveryDate', 'Delivery', { type: 'date', required: true, width: 'half' }),
    field('aa-dealer', 'Dealer Name', 'dealerName', 'Delivery', { required: true, width: 'half' }),
  ],
}

const weOwe: DealFormTemplate = {
  id: 'we-owe',
  name: 'We Owe / Due Bill',
  shortName: 'We Owe',
  category: 'delivery',
  description: 'Records items the dealership owes the customer after delivery.',
  version: '1.0',
  printOrder: 25,
  sections: ['Parties', 'Vehicle', 'Items Owed'],
  fields: [
    field('wo-dealer', 'Dealer Name', 'dealerName', 'Parties', { required: true, width: 'half' }),
    field('wo-buyer', 'Buyer Name', 'buyerFullName', 'Parties', { required: true, width: 'half' }),
    field('wo-vin', 'VIN', 'vehicleVIN', 'Vehicle', { width: 'full' }),
    field('wo-vehicle', 'Vehicle', 'vehicleDescription', 'Vehicle', { width: 'full' }),
    field('wo-sale-date', 'Sale Date', 'saleDate', 'Parties', { type: 'date', width: 'half' }),
    field('wo-delivery-date', 'Delivery Date', 'deliveryDate', 'Parties', { type: 'date', width: 'half' }),
  ],
}

const fundingLenderCoverSheet: DealFormTemplate = {
  id: 'funding-lender-cover-sheet',
  name: 'Funding / Lender Cover Sheet',
  shortName: 'Lender Cover',
  category: 'credit_finance',
  description: 'Cover sheet submitted with funding package to lender.',
  version: '1.0',
  printOrder: 6,
  showForDealTypes: ['retail_finance'],
  sections: ['Lender', 'Deal', 'Vehicle', 'Buyer'],
  fields: [
    field('fl-lender', 'Lender Name', 'lenderName', 'Lender', { required: true, width: 'half' }),
    field('fl-lender-address', 'Lender Address', 'lenderAddress', 'Lender', { width: 'half' }),
    field('fl-dealer', 'Dealer Name', 'dealerName', 'Lender', { required: true, width: 'half' }),
    field('fl-dealer-phone', 'Dealer Phone', 'dealerPhone', 'Lender', { width: 'half' }),
    field('fl-deal-number', 'Deal #', 'dealNumber', 'Deal', { width: 'third' }),
    field('fl-deal-date', 'Deal Date', 'dealDate', 'Deal', { type: 'date', width: 'third' }),
    field('fl-deal-type', 'Deal Type', 'dealType', 'Deal', { width: 'third' }),
    field('fl-amount-financed', 'Amount Financed', 'amountFinanced', 'Deal', { type: 'currency', required: true, width: 'third' }),
    field('fl-apr', 'APR', 'apr', 'Deal', { width: 'third' }),
    field('fl-term', 'Term', 'termMonths', 'Deal', { type: 'number', width: 'third' }),
    field('fl-monthly-payment', 'Monthly Payment', 'monthlyPayment', 'Deal', { type: 'currency', width: 'half' }),
    field('fl-vin', 'VIN', 'vehicleVIN', 'Vehicle', { required: true, width: 'full' }),
    field('fl-year', 'Year', 'vehicleYear', 'Vehicle', { width: 'third' }),
    field('fl-make', 'Make', 'vehicleMake', 'Vehicle', { width: 'third' }),
    field('fl-model', 'Model', 'vehicleModel', 'Vehicle', { width: 'third' }),
    field('fl-buyer', 'Buyer Name', 'buyerFullName', 'Buyer', { required: true, width: 'half' }),
    field('fl-cobuyer', 'Co-Buyer Name', 'coBuyerFullName', 'Buyer', { width: 'half' }),
  ],
}

const titleRegistrationWorksheet: DealFormTemplate = {
  id: 'title-registration-worksheet',
  name: 'Title / Registration Worksheet',
  shortName: 'Title Worksheet',
  category: 'title_registration',
  description: 'Internal worksheet for title processing and registration.',
  version: '1.0',
  printOrder: 30,
  sections: ['Vehicle', 'Buyer', 'Title Info'],
  fields: [
    field('tr-vin', 'VIN', 'vehicleVIN', 'Vehicle', { required: true, width: 'full' }),
    field('tr-year', 'Year', 'vehicleYear', 'Vehicle', { required: true, width: 'third' }),
    field('tr-make', 'Make', 'vehicleMake', 'Vehicle', { required: true, width: 'third' }),
    field('tr-model', 'Model', 'vehicleModel', 'Vehicle', { required: true, width: 'third' }),
    field('tr-stock', 'Stock #', 'vehicleStockNumber', 'Vehicle', { width: 'half' }),
    field('tr-mileage', 'Mileage', 'vehicleMileage', 'Vehicle', { type: 'number', width: 'half' }),
    field('tr-buyer', 'Registered Owner', 'buyerFullName', 'Buyer', { required: true, width: 'half' }),
    field('tr-cobuyer', 'Co-Owner', 'coBuyerFullName', 'Buyer', { width: 'half' }),
    field('tr-buyer-address', 'Registration Address', 'buyerAddress', 'Buyer', { width: 'full' }),
    field('tr-city', 'City', 'buyerCity', 'Buyer', { width: 'third' }),
    field('tr-state', 'State', 'buyerState', 'Buyer', { width: 'third' }),
    field('tr-zip', 'ZIP', 'buyerZip', 'Buyer', { width: 'third' }),
    field('tr-sale-price', 'Sale Price', 'salePrice', 'Title Info', { type: 'currency', width: 'half' }),
    field('tr-sale-date', 'Sale Date', 'saleDate', 'Title Info', { type: 'date', width: 'half' }),
    field('tr-lender', 'Lienholder', 'lenderName', 'Title Info', { width: 'full' }),
    field('tr-dealer', 'Selling Dealer', 'dealerName', 'Title Info', { required: true, width: 'half' }),
    field('tr-dealer-lic', 'Dealer License', 'dealerLicenseNumber', 'Title Info', { width: 'half' }),
  ],
}

const buyerInformationSheet: DealFormTemplate = {
  id: 'buyer-information-sheet',
  name: 'Buyer Information Sheet',
  shortName: 'Buyer Info',
  category: 'buyer_information',
  description: 'Full buyer profile used for deal file and F&I records.',
  version: '1.0',
  printOrder: 4,
  sections: ['Buyer Identity', 'Contact', 'Employment & Income'],
  fields: [
    field('bi-full-name', 'Full Legal Name', 'buyerFullName', 'Buyer Identity', { required: true, width: 'half' }),
    field('bi-dob', 'Date of Birth', 'buyerDOB', 'Buyer Identity', { type: 'date', width: 'half' }),
    field('bi-dl', "Driver's License #", 'buyerDLNumber', 'Buyer Identity', { width: 'half' }),
    field('bi-dl-state', 'DL State', 'buyerDLState', 'Buyer Identity', { width: 'half' }),
    field('bi-ssn-masked', 'SSN (Last 4)', 'buyerSSNMasked', 'Buyer Identity', { type: 'masked', width: 'half' }),
    field('bi-address', 'Address', 'buyerAddress', 'Contact', { width: 'full' }),
    field('bi-city', 'City', 'buyerCity', 'Contact', { width: 'third' }),
    field('bi-state', 'State', 'buyerState', 'Contact', { width: 'third' }),
    field('bi-zip', 'ZIP', 'buyerZip', 'Contact', { width: 'third' }),
    field('bi-phone', 'Phone', 'buyerPhone', 'Contact', { width: 'half' }),
    field('bi-email', 'Email', 'buyerEmail', 'Contact', { width: 'half' }),
    field('bi-housing', 'Housing Status', 'buyerHousingStatus', 'Employment & Income', { width: 'half' }),
    field('bi-housing-pmt', 'Monthly Housing', 'buyerMonthlyHousing', 'Employment & Income', { type: 'currency', width: 'half' }),
    field('bi-employer', 'Employer', 'buyerEmployer', 'Employment & Income', { width: 'half' }),
    field('bi-occupation', 'Occupation', 'buyerOccupation', 'Employment & Income', { width: 'half' }),
    field('bi-income', 'Gross Monthly Income', 'buyerMonthlyIncome', 'Employment & Income', { type: 'currency', width: 'half' }),
  ],
}

const coBuyerInformationSheet: DealFormTemplate = {
  id: 'cobuyer-information-sheet',
  name: 'Co-Buyer Information Sheet',
  shortName: 'Co-Buyer Info',
  category: 'buyer_information',
  description: 'Full co-buyer/joint applicant profile.',
  version: '1.0',
  printOrder: 4,
  sections: ['Co-Buyer Identity', 'Contact', 'Employment & Income'],
  fields: [
    field('cb-full-name', 'Co-Buyer Full Name', 'coBuyerFullName', 'Co-Buyer Identity', { required: true, width: 'half' }),
    field('cb-dob', 'Date of Birth', 'coBuyerDOB', 'Co-Buyer Identity', { type: 'date', width: 'half' }),
    field('cb-dl', "Driver's License #", 'coBuyerDLNumber', 'Co-Buyer Identity', { width: 'half' }),
    field('cb-ssn', 'SSN (Last 4)', 'coBuyerSSNMasked', 'Co-Buyer Identity', { type: 'masked', width: 'half' }),
    field('cb-address', 'Address', 'coBuyerAddress', 'Contact', { width: 'full' }),
    field('cb-city', 'City', 'coBuyerCity', 'Contact', { width: 'third' }),
    field('cb-state', 'State', 'coBuyerState', 'Contact', { width: 'third' }),
    field('cb-zip', 'ZIP', 'coBuyerZip', 'Contact', { width: 'third' }),
    field('cb-phone', 'Phone', 'coBuyerPhone', 'Contact', { width: 'half' }),
    field('cb-email', 'Email', 'coBuyerEmail', 'Contact', { width: 'half' }),
    field('cb-employer', 'Employer', 'coBuyerEmployer', 'Employment & Income', { width: 'half' }),
    field('cb-income', 'Gross Monthly Income', 'coBuyerMonthlyIncome', 'Employment & Income', { type: 'currency', width: 'half' }),
  ],
}

const insuranceVerification: DealFormTemplate = {
  id: 'insurance-verification',
  name: 'Insurance Verification Form',
  shortName: 'Insurance Verify',
  category: 'delivery',
  description: 'Records proof-of-insurance at time of delivery.',
  version: '1.0',
  printOrder: 26,
  sections: ['Vehicle', 'Buyer', 'Insurance'],
  fields: [
    field('iv-buyer', 'Buyer Name', 'buyerFullName', 'Buyer', { required: true, width: 'half' }),
    field('iv-vin', 'VIN', 'vehicleVIN', 'Vehicle', { required: true, width: 'full' }),
    field('iv-year', 'Year', 'vehicleYear', 'Vehicle', { width: 'third' }),
    field('iv-make', 'Make', 'vehicleMake', 'Vehicle', { width: 'third' }),
    field('iv-model', 'Model', 'vehicleModel', 'Vehicle', { width: 'third' }),
    field('iv-delivery-date', 'Delivery Date', 'deliveryDate', 'Insurance', { type: 'date', width: 'half' }),
  ],
}

// ---------------------------------------------------------------------------
// Template registry
// ---------------------------------------------------------------------------

export const DEAL_FORM_TEMPLATES: DealFormTemplate[] = [
  buyersOrder,
  retailPurchaseAgreement,
  dealRecap,
  buyerInformationSheet,
  coBuyerInformationSheet,
  creditApplicationPrintout,
  fundingLenderCoverSheet,
  tradeAppraisalWorksheet,
  privacyNotice,
  odometerStatement,
  arbitrationAcknowledgment,
  weOwe,
  insuranceVerification,
  titleRegistrationWorksheet,
]

export function getTemplate(id: string): DealFormTemplate | undefined {
  return DEAL_FORM_TEMPLATES.find((t) => t.id === id)
}

export function getTemplatesByCategory(category: DealFormTemplate['category']): DealFormTemplate[] {
  return DEAL_FORM_TEMPLATES.filter((t) => t.category === category).sort(
    (a, b) => a.printOrder - b.printOrder
  )
}

// ---------------------------------------------------------------------------
// Packet presets
// ---------------------------------------------------------------------------

export const PACKET_PRESETS: PacketPreset[] = [
  {
    id: 'standard-retail',
    name: 'Standard Retail Packet',
    description: "Buyer's Order, Retail Agreement, Deal Recap, Buyer Info, Privacy Notice, Odometer",
    formIds: [
      'buyers-order',
      'retail-purchase-agreement',
      'deal-recap',
      'buyer-information-sheet',
      'privacy-notice',
      'odometer-statement',
    ],
    dealTypes: ['retail_finance', 'cash'],
  },
  {
    id: 'finance-packet',
    name: 'Finance Deal Packet',
    description: 'Full finance packet including credit app, lender cover sheet, and all deal docs',
    formIds: [
      'buyers-order',
      'retail-purchase-agreement',
      'deal-recap',
      'buyer-information-sheet',
      'credit-application-printout',
      'funding-lender-cover-sheet',
      'privacy-notice',
      'odometer-statement',
    ],
    dealTypes: ['retail_finance'],
  },
  {
    id: 'cash-deal',
    name: 'Cash Deal Packet',
    description: "Buyer's Order, Retail Agreement, Privacy Notice, Odometer",
    formIds: [
      'buyers-order',
      'retail-purchase-agreement',
      'buyer-information-sheet',
      'privacy-notice',
      'odometer-statement',
    ],
    dealTypes: ['cash'],
  },
  {
    id: 'delivery-packet',
    name: 'Delivery Packet',
    description: 'Delivery acknowledgment, We Owe, Insurance Verification, Odometer',
    formIds: [
      'arbitration-acknowledgment',
      'we-owe',
      'insurance-verification',
      'odometer-statement',
    ],
  },
  {
    id: 'title-packet',
    name: 'Title Packet',
    description: 'Title worksheet and odometer for title processing',
    formIds: ['title-registration-worksheet', 'odometer-statement'],
  },
  {
    id: 'trade-packet',
    name: 'Trade Packet',
    description: 'Trade worksheet and related documents',
    formIds: ['trade-appraisal-worksheet', 'buyers-order'],
  },
]

export const FORM_CATEGORY_LABELS: Record<DealFormTemplate['category'], string> = {
  buyer_information: 'Buyer Information',
  deal_documents: 'Deal Documents',
  disclosure: 'Disclosures',
  trade: 'Trade',
  credit_finance: 'Credit & Finance',
  title_registration: 'Title & Registration',
  delivery: 'Delivery',
  wholesale: 'Wholesale',
}
