/**
 * QuoteVine API Client
 * Handles communication with the QuoteVine API for cashflow operations
 */

// QV Cashflow API (for marking as paid)
const QV_API_BASE_URL = process.env.QV_CASHFLOW_API_URL || 'https://vansalesuk.quotevineapp.com/qvine';
const QV_API_KEY = process.env.QV_CASHFLOW_API_KEY || '';

// QV Communications API (for lookups)
const QV_COMMS_API_URL = process.env.QUOTEVINE_API_URL || 'https://qv-communications.coolify.vanaways.co.uk';
const QV_COMMS_API_KEY = process.env.QUOTEVINE_API_KEY || '';

/**
 * Lookup cashflow IDs from hash using QV Communications API
 */
export async function lookupCashflowIds(cashflowIdHash: string): Promise<QVCashflowIds | null> {
  const url = `${QV_COMMS_API_URL}/api/cashflow/lookup?cashflowIdHash=${cashflowIdHash.toLowerCase()}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': QV_COMMS_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`QV Communications API lookup failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    if (!data.success || !data.data) {
      console.error('QV Communications API lookup returned unsuccessful response');
      return null;
    }

    return {
      relationshipId: data.data.relationshipId,
      opportunityId: data.data.opportunityId,
      quoteId: data.data.quoteId,
      cashflowId: data.data.cashflowId,
    };
  } catch (error) {
    console.error('Error looking up cashflow IDs:', error);
    return null;
  }
}

export interface QVCashflowIds {
  relationshipId: number;
  opportunityId: number;
  quoteId: number;
  cashflowId: number;
}

/**
 * Complete cashflow details for payment page display
 */
export interface CashflowDetails {
  ids: QVCashflowIds;
  description: string | null;
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  isFullyPaid: boolean;
}

/**
 * Get complete cashflow details by hash - combines Communications API lookup with QV Cashflow API
 */
export async function getCashflowDetailsByHash(hash: string): Promise<CashflowDetails | null> {
  // First, look up the IDs using Communications API
  const ids = await lookupCashflowIds(hash);
  if (!ids) {
    console.error('Could not look up cashflow IDs for hash:', hash);
    return null;
  }

  // Then get the full cashflow details from QV Cashflow API
  const cashflow = await getQVCashflow(ids);
  if (!cashflow) {
    console.error('Could not get cashflow details for IDs:', ids);
    return null;
  }

  const netAmount = cashflow.net_amount || 0;
  const taxAmount = cashflow.tax_amount || 0;
  const totalAmount = netAmount + taxAmount;
  const paidAmount = cashflow.paid_amount || 0;
  const outstandingAmount = totalAmount - paidAmount;

  return {
    ids,
    description: cashflow.description,
    netAmount,
    taxAmount,
    totalAmount,
    paidAmount,
    outstandingAmount,
    isFullyPaid: paidAmount >= totalAmount,
  };
}

export interface QVCashflow {
  cashflow_id: number;
  cashflow_type: string;
  description: string | null;
  net_amount: number;
  tax_amount: number;
  vat_rate_type: string | null;
  paid_amount: number;
  paid_date: string | null;
  payment_reference: string | null;
  admin_view_only_flag: string;
  account_owner_view_only_flag: string;
}

/**
 * Get a cashflow from the QuoteVine API
 */
export async function getQVCashflow(ids: QVCashflowIds): Promise<QVCashflow | null> {
  const url = `${QV_API_BASE_URL}/quotevine/api/v2/relationships/${ids.relationshipId}/opportunities/${ids.opportunityId}/quotes/${ids.quoteId}/cashflows/${ids.cashflowId}/`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'api-key': QV_API_KEY,
        'Content-Type': 'application/json',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      console.error(`QV API GET failed: ${response.status} ${response.statusText}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching QV cashflow:', error);
    return null;
  }
}

/**
 * Mark a cashflow as paid in the QuoteVine API
 */
export async function markQVCashflowAsPaid(
  ids: QVCashflowIds,
  paidAmount: number,
  paidDate: string,
  paymentReference: string
): Promise<boolean> {
  const url = `${QV_API_BASE_URL}/quotevine/api/v2/relationships/${ids.relationshipId}/opportunities/${ids.opportunityId}/quotes/${ids.quoteId}/cashflows/${ids.cashflowId}/`;

  // First, get the current cashflow to preserve existing fields
  const currentCashflow = await getQVCashflow(ids);
  if (!currentCashflow) {
    console.error('Could not fetch current cashflow to update');
    return false;
  }

  // Build the update payload, preserving existing values
  const payload = {
    cashflow_type: currentCashflow.cashflow_type,
    description: currentCashflow.description,
    net_amount: currentCashflow.net_amount,
    vat_rate_type: currentCashflow.vat_rate_type || 'Standard',
    admin_view_only_flag: currentCashflow.admin_view_only_flag || 'N',
    account_owner_view_only_flag: currentCashflow.account_owner_view_only_flag || 'N',
    paid_date: paidDate,
    paid_amount: paidAmount,
    payment_reference: paymentReference,
  };

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'api-key': QV_API_KEY,
        'Content-Type': 'application/json',
      },
      redirect: 'follow',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`QV API PUT failed: ${response.status} ${response.statusText}`, errorText);
      return false;
    }

    console.log(`Successfully marked cashflow ${ids.cashflowId} as paid via QV API`);
    return true;
  } catch (error) {
    console.error('Error updating QV cashflow:', error);
    return false;
  }
}
