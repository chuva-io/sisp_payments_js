const { format: formatDate } = require('date-fns');
const PAYMENT_ERRORS = require('./utils/paymentErrors');
const FORMAT_ERRORS = require('./utils/formatErrors');
const TRANSACTION_CODES = require('./constants/transactionCodes');
const SUCCESS_MESSAGE_TYPES = require('./constants/successMessageTypes');
const { sha512ToBase64 } = require('./utils/hashFunctions');
const { generateFingerprint, generateCardPaymentResponseFingerprint } = require('./utils/sispFormUtils');

const qs = require('qs');

class Sisp {
  /**
   * CONFIGURE SISP CREDENTIALS
   * @param {Object} credentials - Required - These are the payment credentials provided by SISP to allow us to process payments.
   * @param {String} credentials.posID - posID provided by SISP
   * @param {String} credentials.posAutCode - posAutCode provided by SISP
   * @param {String} credentials.url - sispUrl provided by SISP to handle the payments
   */
  constructor(credentials) {
    this.credentials = credentials;
  }

  /**
   * GENERATE REQUEST FORM
   * @param {String} referenceId - Required - This is the payment reference. In this case, we need to know which payment was processed when the SISP returns the payment response.
   * @param {Number} total - Required - This is the amount SISP should process the payment.
   * @param {String} webhookUrl - Required - This is the URL the user should be contacted by SISP for payment response.
   * @param {Object} requestFormOptions - Optional - This is the options for the payment form to be generated.
   * @param {String} requestFormOptions.transactionCode - This is to specify the type of transaction to be made.
   * 1 means purchase;
   * 2 means service payment;
   * 3 means phone recharge.
   * @param {String} requestFormOptions.entityCode - This is the code of the entity that will receive the payment.
   * It should be present when the transactionCode is equal to 2 or 3.
   * It is not required when transactionCode is equal to 1.
   * @param {String} requestFormOptions.referenceNumber - This is the reference number of the service to be paid.
   * When transactionCode is equal to 2 the reference number is the reference number of the invoice to be paid.
   * When transactionCode is equal to 3, the reference number should be the phone number to be recharged.
   * It should be present when the transactionCode is equal to 2 or 3.
   * It is not required when transactionCode is equal to 1.
   * @param {String} token - Optional - This is the token used to authenticate the requests that use tokenization.
   * @returns {Document} response - HTML Form to process payments
   */
  generateRequestForm(referenceId, total, webhookUrl, requestFormOptions = {}, token) {
    const {
      posID,
      posAutCode,
      url
    } = this.credentials;

    const CVE_CURRENCY_CODE = '132';

    const merchantSession = `S${formatDate(new Date(), 'yyyyMMddHHmmss')}`;
    const dateTime = formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss');

    const {
      transactionCode = TRANSACTION_CODES.purchase,
      entityCode = '',
      referenceNumber = ''
    } = requestFormOptions;

    const formData = {
      transactionCode,
      posID,
      merchantRef: referenceId,
      merchantSession,
      token: token || '',
      amount: total,
      currency: CVE_CURRENCY_CODE,
      is3DSec: '1',
      urlMerchantResponse: webhookUrl,
      languageMessages: 'pt',
      timeStamp: dateTime,
      fingerprintversion: '1',
      entityCode,
      referenceNumber
    };

    // GENERATE FINGERPRINT AND ADD TO SHIPPING DATA
    formData.fingerprint = generateFingerprint(
      posAutCode,
      formData.timeStamp,
      formData.amount,
      formData.merchantRef,
      formData.merchantSession,
      formData.posID,
      formData.currency,
      formData.transactionCode,
      formData.entityCode,
      formData.referenceNumber,
      formData.token
    );

    const postURL = `${url}?FingerPrint=${encodeURIComponent(formData.fingerprint)}&TimeStamp=${encodeURIComponent(formData.timeStamp)}&FingerPrintVersion=${encodeURIComponent(formData.fingerprintversion)}`;

    // Create form to POST to SISP
    let formHtml = '<html><head><title>Pagamento Vinti4</title></head><body onload=\'autoPost()\'><div><h5>Processando...</h5>';

    formHtml += `<form action='${postURL}' method='post'>`;

    Object.keys(formData).forEach((key) => {
      formHtml += `<input type='hidden' name='${key}' value='${formData[key]}'>`;
    });
    formHtml += '</form><script>function autoPost(){document.forms[0].submit();}</script></body></html>';

    return formHtml;
  };

  /**
   * GENERATE PAYMENT REQUEST FORM
   * @deprecated
   * @param {String} referenceId - Required - This is the payment reference. In this case, we need to know which payment was processed when the SISP returns the payment response.
   * @param {Number} total - Required - This is the amount SISP should process the payment.
   * @param {String} webhookUrl - Required - This is the URL the user should be contacted by SISP for payment response.
   * @returns {Document} response - HTML Form to process payments
   */
  generatePaymentRequestForm = (referenceId, total, webhookUrl) => {
    return this.#generateRequestForm(referenceId, total, webhookUrl, {
      transactionCode: TRANSACTION_CODES.purchase
    });
  };

  /**
   * GENERATE SERVICE PAYMENT REQUEST FORM
   * @param {String} referenceId - Required - This is the payment reference. In this case, we need to know which payment was processed when the SISP returns the payment response.
   * @param {Number} total - Required - This is the amount SISP should process the payment.
   * @param {String} webhookUrl - Required - This is the URL the user should be contacted by SISP for payment response.
   * @param {String} entityCode - Required - This is the code of the entity that will receive the payment.
   * @param {String} referenceNumber - Required - This is the reference number of the service to be paid.
   * @returns {Document} response - HTML Form to process payments
   */
  generateServicePaymentRequestForm = (referenceId, total, webhookUrl, entityCode, referenceNumber) => {
    return this.#generateRequestForm(referenceId, total, webhookUrl, {
      transactionCode: TRANSACTION_CODES.service_payment,
      entityCode,
      referenceNumber
    });
  };

  /**
   * GENERATE RECHARGE REQUEST FORM
   * @param {String} referenceId - Required - This is the payment reference. In this case, we need to know which payment was processed when the SISP returns the payment response.
   * @param {Number} total - Required - This is the amount SISP should process the payment.
   * @param {String} webhookUrl - Required - This is the URL the user should be contacted by SISP for payment response.
   * @param {String} entityCode - Required - This is the code of the entity that will receive the payment.
   * @param {String} phoneNumber - Required - This is the phone number to be recharged.
   * @returns {Document} response - HTML Form to process payments
   */
  generateRechargeRequestForm = (referenceId, total, webhookUrl, entityCode, phoneNumber) => {
    return this.#generateRequestForm(referenceId, total, webhookUrl, {
      transactionCode: TRANSACTION_CODES.phone_recharge,
      entityCode,
      referenceNumber: phoneNumber
    });
  };

  /**
   * GENERATE TOKEN ENROLLMENT REQUEST FORM
   * @param {String} referenceId - Required - This is the token enrollment request reference. In this case, we need to know which token enrollment request was processed when the SISP returns the token enrollment response.
   * @param {Number} total - Required - This is the minimal amount accepted for a payment
   * @param {String} webhookUrl - Required - This is the URL the user should be contacted by SISP for the token enrollment response.
   * @returns {Document} response - HTML Form to process payments
   */
  generateTokenEnrollmentRequestForm = (referenceId, total, webhookUrl) => {
    return this.#generateRequestForm(referenceId, total, webhookUrl, {
      transactionCode: TRANSACTION_CODES.token_enrollment
    });
  };

  /**
   * GENERATE TOKEN CANCEL REQUEST FORM
   * @param {String} referenceId - Required - This is the token cancel request reference. In this case, we need to know which token cancel request was processed when the SISP returns the token cancel response.
   * @param {String} webhookUrl - Required - This is the URL the user should be contacted by SISP for the token cancel response.
   * @param {String} token - Required - The token to be canceled. It is also used to authenticate the request.
   * @returns {Document} response - HTML Form to process payments
   */
   generateTokenCancelRequestForm = (referenceId, webhookUrl, token) => {
    return this.#generateRequestForm(referenceId, 0, webhookUrl, {
      transactionCode: TRANSACTION_CODES.token_cancel
    }, token);
  };

  /**
   * GENERATE TOKEN PAYMENT REQUEST FORM
   * @param {String} referenceId - Required - This is the payment request reference. In this case, we need to know which payment request was processed when the SISP returns the payment response.
   * @param {Number} total - Required - This is the amount SISP should process the payment.
   * @param {String} webhookUrl - Required - This is the URL the user should be contacted by SISP for the payment response.
   * @param {String} token - Required - This is the token used to authenticate the request.
   * @returns {Document} response - HTML Form to process payments
   */
  generateTokenPurchaseRequestForm = (referenceId, total, webhookUrl, token) => {
    return this.#generateRequestForm(referenceId, total, webhookUrl, {
      transactionCode: TRANSACTION_CODES.token_purchase
    }, token);
  };

  /**
   * GENERATE TOKEN SERVICE PAYMENT REQUEST FORM
   * @param {String} referenceId - Required - This is the service payment request reference. In this case, we need to know which service payment was processed when the SISP returns the service payment response.
   * @param {Number} total - Required - This is the amount SISP should process the payment.
   * @param {String} webhookUrl - Required - This is the URL the user should be contacted by SISP for the service payment response.
   * @param {String} entityCode - Required - This is the code of the entity that will receive the payment.
   * @param {String} referenceNumber - Required - This is the reference number of the service to be paid.
   * @param {String} token - Required - This is the token used to authenticate the request.
   * @returns {Document} response - HTML Form to process payments
   */
  generateTokenServicePaymentRequestForm = (referenceId, total, webhookUrl, entityCode, referenceNumber, token) => {
    return this.#generateRequestForm(referenceId, total, webhookUrl, {
      transactionCode: TRANSACTION_CODES.service_payment,
      entityCode,
      referenceNumber
    }, token);
  };

  /**
   * GENERATE TOKEN RECHARGE REQUEST FORM
   * @param {String} referenceId - Required - This is the phone recharge request reference. In this case, we need to know which phone recharge request was processed when the SISP returns the phone recharge response.
   * @param {Number} total - Required - This is the amount SISP should process the payment.
   * @param {String} webhookUrl - Required - This is the URL the user should be contacted by SISP for the phone recharge response.
   * @param {String} entityCode - Required - This is the code of the entity that will receive the payment.
   * @param {String} phoneNumber - Required - This is the phone number to be recharged.
   * @param {String} token - Required - This is the token used to authenticate the request.
   * @returns {Document} response - HTML Form to process payments
   */
  generateTokenRechargeRequestForm = (referenceId, total, webhookUrl, entityCode, phoneNumber, token) => {
    return this.#generateRequestForm(referenceId, total, webhookUrl, {
      transactionCode: TRANSACTION_CODES.phone_recharge,
      entityCode,
      referenceNumber: phoneNumber
    }, token);
  };

  /**
   * GENERATE CARD PAYMENT RESPONSE FINGERPRINT
   * @param {String} posAutCode - Required - The POS auth code. This is the credential provided by SISP that is used to construct this class.
   * @param {String} messageType - Required - The message type
   * @param {String} merchantReference - Required - The payment reference.
   * @param {String} merchantSession - Required - It identifies the customer's session on the merchant portal. It must be generated by the merchant's system.
   * @param {String} messageID - Required - The message identifier generated for the transaction.
   * @param {String} merchantResponse - Required - Transaction response code. Together with the messageType it indicates the success or failure of the transaction.
   * @param {String} clearingPeriod - Required - The period in which the transaction took place.
   * @param {String} transactionID - Required - The transaction Identifier, together with the clearingPeriod they uniquely identify a transaction on the vinti4 network.
   * @param {String} timestamp - Required - The timestamp of the transaction response.
   * @param {String} responseToken - Required - This field contains the digit sequences that represent the card.
   * @param {String} tokenDescription - Required - This field represents the description of the created token
   * @param {Number} maxAmountAllowed - Required - Maximum amount of total payments allowed.
   * @param {String} maxNumberOfTransactions - Required - Maximum and total number of payments to be made.
   * @param {String} limitDate - Required - Token expiration date
   * @param {String} merchantRespPan - Required - This field is truncated in the following format ***********1234, where: “1234” is the last 4 digits of the PAN.
   * @returns {String} response - The generated fingerprint (e.g. "eZ5/kTpA9RvrhwvmYUNnoYDKuixMkOn5xegfkDZXZigDPH7dV5JlAE/So/OFs9x9yn4W/TCWASWqvcIYDp0ovw==")
   */
  #generateTokenEnrollmentResponseFingerprint = (
    posAutCode,
    messageType,
    merchantReference,
    merchantSession,
    messageID,
    merchantResponse,
    clearingPeriod,
    transactionID,
    timestamp,
    responseToken,
    tokenDescription,
    maxAmountAllowed,
    maxNumberOfTransactions,
    limitDate,
    merchantRespPan
  ) => {
    let token = '';

    token += sha512ToBase64(posAutCode);

    if (messageType) {
      token += messageType.trim();
    }

    if (merchantReference) {
      token += merchantReference.trim();
    }

    if (merchantSession) {
      token += merchantSession.trim();
    }

    if (messageID) {
      token += messageID.trim();
    }

    if (merchantResponse) {
      token += merchantResponse.trim();
    }

    if (clearingPeriod) {
      token += clearingPeriod.replace(/ /g, '');
    }

    if (transactionID) {
      token += transactionID.replace(/ /g, '');
    }

    token += timestamp;

    if (responseToken) {
      token += responseToken.trim();
    }

    if (tokenDescription) {
      token += tokenDescription.trim();
    }

    if (maxAmountAllowed) {
      token += Math.trunc(maxAmountAllowed * 1000);
    }

    if (maxNumberOfTransactions) {
      token += maxNumberOfTransactions.trim();
    }

    if (limitDate) {
      token += limitDate.split('-').join('');
    }

    if (merchantRespPan) {
      token += merchantRespPan.trim().substring(merchantRespPan.length - 4);
    }

    return sha512ToBase64(token);
  };

  /**
   * GENERATE CARD PAYMENT RESPONSE FINGERPRINT
   * @param {String} posAutCode - Required - The POS auth code. This is the credential provided by SISP that is used to construct this class.
   * @param {String} messageType - Required - The message type
   * @param {String} merchantReference - Required - The payment reference.
   * @param {String} merchantSession - Required - It identifies the customer's session on the merchant portal. It must be generated by the merchant's system.
   * @param {String} messageID - Required - The message identifier generated for the transaction.
   * @param {String} merchantResponse - Required - Transaction response code. Together with the messageType it indicates the success or failure of the transaction.
   * @param {String} clearingPeriod - Required - The period in which the transaction took place.
   * @param {String} transactionID - Required - The transaction Identifier, together with the clearingPeriod they uniquely identify a transaction on the vinti4 network.
   * @param {String} timestamp - Required - The timestamp of the transaction response.
   * @param {String} approvalCode - Required - The transaction approval code
   * @param {Number} merchantRespPurchaseAmount - Required - The transaction amount.
   * @param {String} merchantRespClientReceipt - Required - Transaction receipt (if Service Payment or Recharge).
   * @param {String} merchantRespReloadCode - Required - Reload Code. This field is filled to zero when a recharge operation is carried out in RealTime
   * @param {String} merchantRespReferenceNumber - Required - Service reference that you intend to pay (if it is Service Payment or Recharge).
   * @param {String} merchantRespEntityCode - Required - Service Entity Code (if Service Payment or Recharge).
   * @returns {String} response - The generated fingerprint (e.g. "eZ5/kTpA9RvrhwvmYUNnoYDKuixMkOn5xegfkDZXZigDPH7dV5JlAE/So/OFs9x9yn4W/TCWASWqvcIYDp0ovw==")
   */
  #generateTokenPaymentResponseFingerprint = (
    posAutCode,
    messageType,
    merchantReference,
    merchantSession,
    messageID,
    merchantResponse,
    clearingPeriod,
    transactionID,
    timestamp,
    approvalCode,
    merchantRespPurchaseAmount,
    merchantRespClientReceipt,
    merchantRespReloadCode,
    merchantRespReferenceNumber,
    merchantRespEntityCode
  ) => {
    let token = '';

    token += sha512ToBase64(posAutCode);

    if (messageType) {
      token += messageType.trim();
    }

    if (merchantReference) {
      token += merchantReference.trim();
    }

    if (merchantSession) {
      token += merchantSession.trim();
    }

    if (messageID) {
      token += messageID.trim();
    }

    if (merchantResponse) {
      token += merchantResponse.trim();
    }

    if (clearingPeriod) {
      token += clearingPeriod.replace(/ /g, '');
    }

    if (transactionID) {
      token += transactionID.replace(/ /g, '');
    }

    if (approvalCode) {
      token += approvalCode.trim();
    }

    if (merchantRespPurchaseAmount) {
      token += Math.trunc(merchantRespPurchaseAmount * 1000);
    }

    token += timestamp;

    if (merchantRespClientReceipt) {
      token += merchantRespClientReceipt.trim();
    }

    if (merchantRespReloadCode) {
      token += merchantRespReloadCode.trim();
    }

    if (merchantRespReferenceNumber) {
      token += merchantRespReferenceNumber.trim();
    }

    if (merchantRespEntityCode) {
      token += merchantRespEntityCode.trim();
    }

    return sha512ToBase64(token);
  };

  /**
   * VALIDATE PAYMENT RESPONSE
   * @param {String} responseBody - Required - This is the payment response returned by SISP.
   *
   * @returns {Object|undefined} response - In case of erros this should return an object containing payment error information, otherwise it returns undefined
   * @returns {Number} response.code - This code should be 001 if payment fingerprint is invalid, otherwise it will be 002 for payment canceled by the user or 003 if there is a payment processing error
   * @returns {String} response.description - This should be a description about the payment error.
   */
  validatePayment = (responseBody) => {
    // SUCCESS RESPONSE CONSTANTS
    const successMessageTypes = [
      SUCCESS_MESSAGE_TYPES.purchase,
      SUCCESS_MESSAGE_TYPES.phone_recharge,
      SUCCESS_MESSAGE_TYPES.service_payment,
      SUCCESS_MESSAGE_TYPES.token_enrollment_request,
      SUCCESS_MESSAGE_TYPES.token_payment,
      SUCCESS_MESSAGE_TYPES.token_cancel
    ];

    // Expected responseBody format is x-www-form-urlencoded string
    if (typeof responseBody != 'string') {
      return FORMAT_ERRORS.invalid;
    }

    // Parse x-www-form-urlencoded response body to JSON format
    const responseBodyObject = qs.parse(responseBody);

    if (successMessageTypes.includes(responseBodyObject.messageType)) {
      const posAutCode = this.posAutCode;
      // Validate fingerprint of the result

      let calculatedFingerPrint = '';

      switch (responseBodyObject.messageType) {
        case SUCCESS_MESSAGE_TYPES.purchase:
        case SUCCESS_MESSAGE_TYPES.phone_recharge:
        case SUCCESS_MESSAGE_TYPES.service_payment:
          calculatedFingerPrint = generateCardPaymentResponseFingerprint(
            posAutCode,
            responseBodyObject.messageType,
            responseBodyObject.merchantRespCP,
            responseBodyObject.merchantRespTid,
            responseBodyObject.merchantRespMerchantRef,
            responseBodyObject.merchantRespMerchantSession,
            responseBodyObject.merchantRespPurchaseAmount,
            responseBodyObject.merchantRespMessageID,
            responseBodyObject.merchantRespPan,
            responseBodyObject.merchantResp,
            responseBodyObject.merchantRespTimeStamp,
            responseBodyObject.merchantRespReferenceNumber,
            responseBodyObject.merchantRespEntityCode,
            responseBodyObject.merchantRespClientReceipt,
            responseBodyObject.merchantRespAdditionalErrorMessage, 
            responseBodyObject.merchantRespReloadCode
          );
          break;
        case SUCCESS_MESSAGE_TYPES.token_enrollment_request:
          calculatedFingerPrint = this.#generateTokenEnrollmentResponseFingerprint(
            posAutCode,
            responseBodyObject.messageType,
            responseBodyObject.merchantRespMerchantRef,
            responseBodyObject.merchantRespMerchantSession,
            responseBodyObject.merchantRespMessageID,
            responseBodyObject.merchantResp,
            responseBodyObject.merchantRespCP,
            responseBodyObject.merchantRespTid,
            responseBodyObject.merchantRespTimeStamp,
            responseBodyObject.token,
            responseBodyObject.tokenDescription,
            responseBodyObject.maxAmountAllowed,
            responseBodyObject.maxNumberOfTransactions,
            responseBodyObject.limitDate,
            responseBodyObject.merchantRespPan
          );
          break;
        case SUCCESS_MESSAGE_TYPES.token_payment:
          calculatedFingerPrint = this.#generateTokenPaymentResponseFingerprint(
            posAutCode,
            responseBodyObject.messageType,
            responseBodyObject.merchantRespMerchantRef,
            responseBodyObject.merchantRespMerchantSession,
            responseBodyObject.merchantRespMessageID,
            responseBodyObject.merchantResp,
            responseBodyObject.merchantRespCP,
            responseBodyObject.merchantRespTid,
            responseBodyObject.merchantRespTimeStamp,
            responseBodyObject.approvalCode,
            responseBodyObject.merchantRespPurchaseAmount,
            responseBodyObject.merchantRespClientReceipt,
            responseBodyObject.merchantRespReloadCode,
            responseBodyObject.merchantRespReferenceNumber,
            responseBodyObject.merchantRespEntityCode
          );
          break;
        case SUCCESS_MESSAGE_TYPES.token_cancel:
          calculatedFingerPrint = this.#generateTokenPaymentResponseFingerprint(
            posAutCode,
            responseBodyObject.messageType,
            responseBodyObject.merchantRespMerchantRef,
            responseBodyObject.merchantRespMerchantSession,
            responseBodyObject.merchantRespMessageID,
            responseBodyObject.merchantResp,
            responseBodyObject.merchantRespCP,
            responseBodyObject.merchantRespTid,
            responseBodyObject.merchantRespTimeStamp,
            responseBodyObject.approvalCode,
            responseBodyObject.merchantRespPurchaseAmount,
            responseBodyObject.merchantRespClientReceipt,
            responseBodyObject.merchantRespReloadCode,
            responseBodyObject.merchantRespReferenceNumber,
            responseBodyObject.merchantRespEntityCode
          );
          break;
      }

      // Validade success fingerprint
      if (responseBodyObject.resultFingerPrint === calculatedFingerPrint) {
        // Handle Successful Payment
        return;
      } else {
        return PAYMENT_ERRORS.fingerprint;
      }
    }
    else if (responseBodyObject.UserCancelled === 'true') {
      return PAYMENT_ERRORS.cancelled;
    }
    else {
      return PAYMENT_ERRORS.processing;
    }
  };
};

module.exports = Sisp;
