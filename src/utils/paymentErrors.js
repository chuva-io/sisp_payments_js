const PAYMENT_ERRORS = {
  fingerprint: {
    code: '001',
    description: 'Payment processing error: Invalid fingerprint'
  },
  cancelled: {
    code: '002',
    description: 'Payment processing error: Cancelled by user'
  },
  processing: {
    code: '003',
    description: 'Payment processing error: Processing error'
  }
};

module.exports = PAYMENT_ERRORS;
