import crypto from 'crypto';

/**
 * Returns PayU Hosted Payment Gateway Endpoint URL
 */
export function getPayUUrl() {
  const mode = (process.env.PAYU_MODE || 'test').toLowerCase();
  if (mode === 'production' || mode === 'live') {
    return 'https://secure.payu.in/_payment';
  }
  return 'https://test.payu.in/_payment';
}

/**
 * Generate SHA-512 Hash for PayU Payment Request
 * Formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
 */
export function generatePayUHash(params) {
  const merchantKey = process.env.PAYU_MERCHANT_KEY || 'TEST_KEY';
  const merchantSalt = process.env.PAYU_MERCHANT_SALT || 'TEST_SALT';

  const {
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    udf1 = '',
    udf2 = '',
    udf3 = '',
    udf4 = '',
    udf5 = ''
  } = params;

  // Format amount to string with fixed 2 decimals if needed
  const formattedAmount = typeof amount === 'number' ? amount.toFixed(2) : parseFloat(amount).toFixed(2);

  const hashString = `${merchantKey}|${txnid}|${formattedAmount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${merchantSalt}`;

  const hash = crypto.createHash('sha512').update(hashString).digest('hex');

  return {
    hash,
    key: merchantKey,
    txnid,
    amount: formattedAmount,
    actionUrl: getPayUUrl()
  };
}

/**
 * Verify Response SHA-512 Hash from PayU Callback
 * Formula (with additionalCharges): sha512(additionalCharges|SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 * Formula (without additionalCharges): sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 */
export function verifyPayUHash(params) {
  const merchantKey = process.env.PAYU_MERCHANT_KEY || 'TEST_KEY';
  const merchantSalt = process.env.PAYU_MERCHANT_SALT || 'TEST_SALT';

  const {
    status,
    firstname = '',
    amount = '',
    txnid = '',
    posted_hash = '',
    productinfo = '',
    email = '',
    udf1 = '',
    udf2 = '',
    udf3 = '',
    udf4 = '',
    udf5 = '',
    additionalCharges
  } = params;

  const formattedAmount = typeof amount === 'number' ? amount.toFixed(2) : parseFloat(amount).toFixed(2);

  let hashString = '';
  if (additionalCharges) {
    hashString = `${additionalCharges}|${merchantSalt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${formattedAmount}|${txnid}|${merchantKey}`;
  } else {
    hashString = `${merchantSalt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${formattedAmount}|${txnid}|${merchantKey}`;
  }

  const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');

  return {
    isValid: calculatedHash.toLowerCase() === (posted_hash || '').toLowerCase(),
    calculatedHash,
    receivedHash: posted_hash
  };
}
