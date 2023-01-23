const Joi = require('joi');
const { format: formatDate } = require('date-fns');
const TRANSACTION_CODES = require('../constants/transactionCodes');
const SUCCESS_MESSAGE_TYPES = require('../constants/successMessageTypes');

const { generateFingerprint, generateCardPaymentResponseFingerprint } = require('../utils/sispFormUtils');
const validateUserBillingInfoSchema = require('../utils/validateUserBillingInfoSchema');
const FORMAT_ERRORS = require('../utils/formatErrors');
const PAYMENT_ERRORS = require('../utils/paymentErrors');
const { objectToBase64 } = require('../utils/hashFunctions');

const qs = require('qs');

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
   * @param {String} requestFormOptions.transactionCode - This is to specify the type of transaction to be made. 1 means purchase;
   * @param {String} requestFormOptions.currencyCode - Optional - This is to setup the currency
   * @param {String} requestFormOptions.languageMessages - Optional - This is used to setup the languages for the response messages
   * @param {Object} requestFormOptions.userBillingInfo - Optional - This is an object containing information related to the user being billed.
   * @returns {Document} response - HTML Form to process payments
   */
  #generateRequestForm = (referenceId, total, webhookUrl, requestFormOptions = {
    transactionCode: '',
    currencyCode: '',
    languageMessages: '',
    userBillingInfo: null,
  }) => {
    const posID = this.posID;
    const posAutCode = this.posAutCode;
    const url = this.url;

    const ENABLED_3DSEC = '1';
    const DEFAULT_CVE_CURRENCY_CODE = '132';
    const DEFAULT_LANGUAGE_MESSAGES = 'pt';

    const merchantSession = `S${formatDate(new Date(), 'yyyyMMddHHmmss')}`;
    const dateTime = formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss');

    const { transactionCode, userBillingInfo, currencyCode, languageMessages } = requestFormOptions;

    let formData = {
      transactionCode: transactionCode ? transactionCode : TRANSACTION_CODES.purchase,
      posID,
      merchantRef: referenceId,
      merchantSession,
      amount: total,
      currency: currencyCode ? currencyCode : DEFAULT_CVE_CURRENCY_CODE,
      is3DSec: ENABLED_3DSEC,
      urlMerchantResponse: webhookUrl,
      languageMessages: languageMessages ? languageMessages : DEFAULT_LANGUAGE_MESSAGES,
      timeStamp: dateTime,
      fingerprintversion: '1',
      entityCode: '',
      referenceNumber: ''
    };

    formData = {...formData, ...userBillingInfo};
    const purchaseRequestBase64 = objectToBase64(userBillingInfo);
    formData.purchaseRequest = purchaseRequestBase64;

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
      if (formData[key] instanceof Object) {
        Object.keys(formData[key]).forEach((itemKey) => {
          formHtml += `<input type='hidden' name='${key}[${itemKey}]' value='${formData[key][itemKey]}'>`;
        });
      } else {
        formHtml += `<input type='hidden' name='${key}' value='${formData[key]}'>`;
      }
    });
    formHtml += '</form><script>function autoPost(){document.forms[0].submit();}</script></body></html>';

    return formHtml;
  };

  /**
   * GENERATE PAYMENT REQUEST FORM
   * @param {String} referenceId - Required - This is the payment reference. In this case, we need to know which payment was processed when the SISP returns the payment response
   * @param {Number} total - Required - This is the amount SISP should process the payment
   * @param {String} webhookUrl - Required - This is the URL the user should be contacted by SISP for payment response
   * @param {Object} userBillingInfo - Required - This is an object containing information related to the user being billed
   * @param {String} userBillingInfo.acctID - Required - This is the user id at the account
   * @param {Object} userBillingInfo.acctInfo - Required - This is an object that contains information releated to the user account
   * @param {String} userBillingInfo.acctInfo.chAccAgeInd - Optional - This indicates the age of the user account, the acceptable values are: 01 - Without account, 02 - Account created during the transaction, 03 - Account with less than 30 days, 04 - Account age between 30 and 60 days, 05 - Account with more than 60 days
   * @param {String} userBillingInfo.acctInfo.chAccChange - Optional - Date that happened any change to the user account. The required format is - yyyyMMdd
   * @param {String} userBillingInfo.acctInfo.chAccDate - Optinal - Date that the user account was created. The required format is - yyyyMMdd
   * @param {String} userBillingInfo.acctInfo.chAccPwChange - Optinal - Date that the user changed his account password. The required format is - yyyyMMdd
   * @param {String} userBillingInfo.acctInfo.chAccPwChangeInd - Optional - This indicates the age of the user account password, the acceptable values are: 01 - Without password, 02 - password created during the transaction, 03 - password with less than 30 days, 04 - password age between 30 and 60 days, 05 - password with more than 60 days
   * @param {String} userBillingInfo.acctInfo.suspiciousAccActivity - Optional - This indicates suspicious user account activity. Indicates if the merchant has experienced suspicious activity from the user in question (includes previous fraud complaints). Acceptable value are: 01 - none suspect, 02 - suspect
   * @param {String} userBillingInfo.email - Required - Email address of the card holder
   * @param {String} userBillingInfo.addrMatch - Optional - This indicates if the billing address is the same as shipping address. Acceptable values are: Y - yes, N - no, in case it is Y the values filled on billAddr* should be the same as shipAddr*
   * @param {String} userBillingInfo.billAddrCity - Optional - City of the billing address of the card holder
   * @param {String} userBillingInfo.billAddrCountry - Required - The country of the billing address of the card holder, it should be the first 3 digits of the ISO 3166-1
   * @param {String} userBillingInfo.billAddrLine1 - Optional - First billing address of the card holder
   * @param {String} userBillingInfo.billAddrLine2 - Optional - Second billing address of the card holder
   * @param {String} userBillingInfo.billAddrLine3 - Optional - Thrid billing address of the card holder
   * @param {String} userBillingInfo.billAddrPostCode - Optional - Postal code of the billing address of the card holder
   * @param {String} userBillingInfo.billAddrState - Optional - State of the billing address of the card holder. It should be the sub-division of the defined country in ISO 3166-2
   * @param {String} userBillingInfo.shipAddrCity - Optional - City of the delivery address of the card holder
   * @param {String} userBillingInfo.shipAddrCountry - Optional - The country of the delivery address of the card holder, it should be the first 3 digits of the ISO 3166-1
   * @param {String} userBillingInfo.shipAddrLine1 - Optional - First delivery address of the card holder
   * @param {String} userBillingInfo.shipAddrPostCode - Optional - Postal code of the delivery address of the card holder
   * @param {String} userBillingInfo.shipAddrState - Optional - State of the delivery address of the card holder. It should be the sub-division of the defined country in ISO 3166-2
   * @param {Object} userBillingInfo.workPhone - Optional - An Object containing information about work phone number of the card holder
   * @param {String} userBillingInfo.workPhone.cc - Required - This indicates the country code of the country of the phone number, example - 123
   * @param {String} userBillingInfo.workPhone.subscriber - Required - This indicates the phone number of the account holder, it should include the indicator without the + sign, example of a phone number of Cape Verd: 2389573234
   * @param {Object} userBillingInfo.mobilePhone - Required - An Object containing information about personal phone number of the card holder
   * @param {String} userBillingInfo.mobilePhone.cc - Required - This indicates the country code of the country of the phone number, example example - 123
   * @param {String} userBillingInfo.mobilePhone.subscriber - Required - This indicates the phone number of the account holder, it should include the indicator without the + sign, example of a phone number of Cape Verd: 2389573234
   * @param {String} options.languageMessages - Optional - This is used to setup the languages for the response messages.
   * @param {Object} options.currencyCode - Optional - This is to setup the currency.
   * @returns {Document} response - HTML Form to process payments
   */
  generatePaymentRequestForm = (referenceId, total, webhookUrl, userBillingInfo, options = { currencyCode: '', languageMessages: '' }) => {
    const { currencyCode, languageMessages } = options;

    const requestPaymentFormData = Joi.object({
      referenceId: Joi.string().required(),
      total: Joi.number().greater(0).required(),
      webhookUrl: Joi.string().required()
    });

    const { error: requestPaymentFormError } = requestPaymentFormData.validate({ referenceId, total, webhookUrl });

    if (requestPaymentFormError) {
      return {
        code: 401,
        description: `Invalid data error: ${requestPaymentFormError.details
          .map(error => error.message)
          .join(', ')}`
      };
    }

    const error = validateUserBillingInfoSchema(userBillingInfo);

    if (error) {
      return error;
    }

    return this.#generateRequestForm(referenceId, total, webhookUrl, {
      transactionCode: TRANSACTION_CODES.purchase,
      userBillingInfo,
      currencyCode,
      languageMessages
    });
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
      SUCCESS_MESSAGE_TYPES.purchase
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
