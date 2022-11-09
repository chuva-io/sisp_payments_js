const { format: formatDate } = require('date-fns');
const sha512 = require('js-sha512');
const btoa = require('btoa');
const PAYMENT_ERRORS = require('./utils/paymentErrors');
const FORMAT_ERRORS = require('./utils/formatErrors');
const TRANSACTION_CODES = require('./constants/transactionCodes');
const qs = require('qs');

const toBase64 = (u8) => btoa(String.fromCharCode.apply(null, u8));

const sha512ToBase64 = (input) => toBase64(sha512.digest(input));

const generateFingerprint = (
  posAutCode,
  timestamp,
  amount,
  merchantRef,
  merchantSession,
  posID,
  currency,
  transactionCode,
  entityCode,
  referenceNumber
) => {
  let toHash = `${sha512ToBase64(posAutCode) + timestamp + (Number(parseFloat(amount) * 1000))}${merchantRef}${merchantSession.trim()}${posID}${currency.trim()}${transactionCode.trim()}`;

  if (entityCode) {
    toHash += Number(entityCode.trim());
  }
  if (referenceNumber) {
    toHash += Number(referenceNumber.trim());
  }

  return sha512ToBase64(toHash);
};

class Sisp {
  /**
   * CONFIGURE SISP CREDENTIALS
   * @property {Object} credential - Required - This is the payment payment credentials provided by SISP to allow us to process payments.
   * @property {String} credential.posId - posID provided by SISP
   * @property {String} credential.posAutCode - posAutCode provided by SISP
   * @property {String} credential.url - sispUrl provided by SISP to handle the payments
   */
  constructor({ posID, posAutCode, url }) {
    this.posID = posID;
    this.posAutCode = posAutCode;
    this.url = url;
  };

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
   * @returns {Document} response - HTML Form to process payments
   */
  #generateRequestForm = (referenceId, total, webhookUrl, requestFormOptions = { transactionCode: '', entityCode: '', referenceNumber: '' }) => {
    const posID = this.posID;
    const posAutCode = this.posAutCode;
    const url = this.url;

    const CVE_CURRENCY_CODE = '132';

    const merchantSession = `S${formatDate(new Date(), 'yyyyMMddHHmmss')}`;
    const dateTime = formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss');

    const { transactionCode, entityCode, referenceNumber } = requestFormOptions;

    const formData = {
      transactionCode: transactionCode ? transactionCode : TRANSACTION_CODES.purchase,
      posID,
      merchantRef: referenceId,
      merchantSession,
      amount: total,
      currency: CVE_CURRENCY_CODE,
      is3DSec: '1',
      urlMerchantResponse: webhookUrl,
      languageMessages: 'pt',
      timeStamp: dateTime,
      fingerprintversion: '1',
      entityCode: entityCode ? entityCode : '',
      referenceNumber: referenceNumber ? referenceNumber : ''
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
      formData.referenceNumber
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

  #generateResponseFingerprint = (
    posAutCode,
    messageType,
    clearingPeriod,
    transactionID,
    merchantReference,
    merchantSession,
    amount,
    messageID,
    pan,
    merchantResponse,
    timestamp,
    reference,
    entity,
    clientReceipt,
    additionalErrorMessage,
    reloadCode
  ) => {
    let token = '';
    token += sha512ToBase64(posAutCode);
    token += messageType.trim();
    token += clearingPeriod.replace(/ /g, '');
    token += transactionID.replace(/ /g, '');
    token += merchantReference.trim();
    token += merchantSession.trim();
    token += Math.trunc(amount * 1000);
    token += messageID.trim();
    token += pan.trim();
    token += merchantResponse.trim();
    token += timestamp;

    if (reference) {
      token += Number(reference.trim());
    }

    if (entity) {
      token += Number(entity.trim());
    }

    token += clientReceipt.trim();
    token += additionalErrorMessage.trim();
    token += reloadCode.trim();

    return sha512ToBase64(token);
  };

  /**
   * VALIDATE PAYMENT RESPONSE
   * @param {Object} responseBody - Required - This is the payment response returned by SISP.
   *
   * @returns {Object} response - This should return an object containing payment information.
   * @returns {Number} response.code - This code should be 200 if payment was processed successfully, otherwise it will be 400 or 500
   * @returns {String} response.message - This should be a message about the payment.
   * @returns {Object} response.data - This should be the same data returned by SISP, but it will only be returned if the payment is successfully processed, otherwise it will be undefined.
   */
  validatePayment = (responseBody) => {
    // SUCCESS RESPONSE CONSTANTS
    const successMessageTypes = ["8", "M", "P"];

    // Expected responseBody format is x-www-form-urlencoded string
    if (typeof responseBody != 'string') {
      return FORMAT_ERRORS.invalid;
    }

    // Parse x-www-form-urlencoded response body to JSON format
    const responseBodyObject = qs.parse(responseBody);

    if (successMessageTypes.includes(responseBodyObject.messageType)) {
      const posAutCode = this.posAutCode;
      // Validate fingerprint of the result
      const calculatedFingerPrint = this.#generateResponseFingerprint(
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
        responseBodyObject.merchantRespAdditionalErrorMessage.trim(),
        responseBodyObject.merchantRespReloadCode
      );

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
