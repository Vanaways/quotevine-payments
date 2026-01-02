import oracledb from 'oracledb';

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_STRING,
};

export async function getConnection() {
  return await oracledb.getConnection(dbConfig);
}

export interface CashflowDetails {
  cashflowId: number;
  proposalId: number;
  clientId: number;
  description: string | null;
  netAmount: number;
  taxAmount: number | null;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  fullyPaidFlag: string | null;
  invoiceReference: string | null;
}

export async function getCashflowByHash(hash: string): Promise<CashflowDetails | null> {
  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute<{
      SIMPLE_CASHFLOW_ID: number;
      PROPOSAL_ID: number;
      CLIENT_ID: number;
      DESCRIPTION: string | null;
      NET_AMOUNT: number;
      TAX_AMOUNT: number | null;
      PAID_AMOUNT: number;
      FULLY_PAID_FLAG: string | null;
      INVOICE_REFERENCE: string | null;
    }>(
      `SELECT
        SIMPLE_CASHFLOW_ID,
        PROPOSAL_ID,
        CLIENT_ID,
        DESCRIPTION,
        NET_AMOUNT,
        NVL(TAX_AMOUNT, 0) as TAX_AMOUNT,
        PAID_AMOUNT,
        FULLY_PAID_FLAG,
        INVOICE_REFERENCE
      FROM QUOTEVINE.SIMPLE_CASHFLOW
      WHERE SIMPLE_CASHFLOW_ID_HASH = HEXTORAW(:hash)`,
      { hash },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!result.rows || result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    const netAmount = row.NET_AMOUNT || 0;
    const taxAmount = row.TAX_AMOUNT || 0;
    const totalAmount = netAmount + taxAmount;
    const paidAmount = row.PAID_AMOUNT || 0;
    const outstandingAmount = totalAmount - paidAmount;

    return {
      cashflowId: row.SIMPLE_CASHFLOW_ID,
      proposalId: row.PROPOSAL_ID,
      clientId: row.CLIENT_ID,
      description: row.DESCRIPTION,
      netAmount,
      taxAmount,
      totalAmount,
      paidAmount,
      outstandingAmount,
      fullyPaidFlag: row.FULLY_PAID_FLAG,
      invoiceReference: row.INVOICE_REFERENCE,
    };
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

export async function markCashflowAsPaid(
  cashflowId: number,
  amount: number,
  paymentReference: string
): Promise<void> {
  let connection;
  try {
    connection = await getConnection();

    await connection.execute(
      `UPDATE QUOTEVINE.SIMPLE_CASHFLOW
       SET PAID_AMOUNT = PAID_AMOUNT + :amount,
           PAID_DATE = SYSTIMESTAMP,
           PAYMENT_REFERENCE = :paymentReference,
           FULLY_PAID_FLAG = CASE
             WHEN (PAID_AMOUNT + :amount) >= (NET_AMOUNT + NVL(TAX_AMOUNT, 0)) THEN 'Y'
             ELSE 'N'
           END,
           LAST_UPDATE_DATE = SYSTIMESTAMP
       WHERE SIMPLE_CASHFLOW_ID = :cashflowId`,
      {
        amount,
        paymentReference,
        cashflowId
      }
    );

    await connection.commit();
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

export async function recordStripePayment(
  clientId: number,
  cashflowId: number,
  paymentId: string,
  amount: number,
  status: string
): Promise<void> {
  let connection;
  try {
    connection = await getConnection();

    await connection.execute(
      `INSERT INTO QUOTEVINE.STRIPE_PAYMENT (
        STRIPE_PAYMENT_ID,
        CLIENT_ID,
        SIMPLE_CASHFLOW_ID,
        PAYMENT_ID,
        AMOUNT,
        CAPTURED_FLAG,
        CURRENCY,
        PAID_FLAG,
        REFUNDED_FLAG,
        STATUS,
        SELF_PAY_FLAG,
        CREATED_BY,
        CREATION_DATE,
        LAST_UPDATED_BY,
        LAST_UPDATE_DATE
      ) VALUES (
        QUOTEVINE.STRIPE_PAYMENT_SEQ.NEXTVAL,
        :clientId,
        :cashflowId,
        :paymentId,
        :amount,
        'Y',
        'GBP',
        'Y',
        'N',
        :status,
        'Y',
        0,
        SYSTIMESTAMP,
        0,
        SYSTIMESTAMP
      )`,
      { clientId, cashflowId, paymentId, amount, status }
    );

    await connection.commit();
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}
