require('dotenv').config();
const { format: formatDate } = require('date-fns');
const sha512 = require('js-sha512');
const btoa = require('btoa');


const CVE_CURRENCY_CODE = '132';

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
  let toHash = `${sha512ToBase64(posAutCode) + timestamp + (Number(parseFloat(amount) * 1000))}${merchantRef}${merchantSession.trim()}${posID.trim()}${currency.trim()}${transactionCode.trim()}`;

  if (entityCode) {
    toHash += Number(entityCode.trim());
  }
  if (referenceNumber) {
    toHash += Number(referenceNumber.trim());
  }

  return sha512ToBase64(toHash);
};

const generateResponseFingerprint = (
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
  entity,
  reference,
  clientReceipt,
  additionalErrorMessage
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
  token += clientReceipt.trim();
  token += additionalErrorMessage.trim();

  return sha512ToBase64(token);
};

const orderDataFromWebhook = (requestBody) => {
  const { merchantRespMerchantRef, merchant_ref, merchantRef } = requestBody;

  if (merchant_ref) {
    const [store_id, order_id, ref] = merchant_ref.split(':');

    return { store_id, order_id, ref };
  }

  if (merchantRespMerchantRef) {
    const [store_id, order_id, ref] = merchantRespMerchantRef.split(':');

    return { store_id, order_id, ref };
  }

  if (merchantRef) {
    const [store_id, order_id, ref] = merchantRef.split(':');

    return { store_id, order_id, ref };
  }
};

module.exports = {

  generatePaymentForm: (fileName, storeId, orderId, orderTotal) => {
    const posID = process.env.SISP_VINTI4_POS_ID;
    const posAutCode = process.env.SISP_VINTI4_POS_AUT_CODE;
    const amount = `${orderTotal}`;
    const merchantRef = `${storeId}:${orderId}:${fileName}`;
    const merchantSession = `S${formatDate(new Date(), 'yyyyMMddHHmmss')}`;
    const dateTime = formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss');

    const responseUrl = process.env.SISP_VINTI4_WEBHOOK_URL;

    const formData = {
      transactionCode: '1',
      posID,
      merchantRef,
      merchantSession,
      amount,
      currency: CVE_CURRENCY_CODE,
      is3DSec: '1',
      urlMerchantResponse: responseUrl,
      languageMessages: 'pt',
      timeStamp: dateTime,
      fingerprintversion: '1',
      entityCode: '',
      referenceNumber: ''
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

    const postURL = `${process.env.SISP_VINTI4_URL}?FingerPrint=${encodeURIComponent(formData.fingerprint)}&TimeStamp=${encodeURIComponent(formData.timeStamp)}&FingerPrintVersion=${encodeURIComponent(formData.fingerprintversion)}`;

    // Create form to POST to SISP
    let formHtml = '<html><head><title>Pagamento Vinti4</title></head><body onload=\'autoPost()\'><div><h5>Processando...</h5>';

    formHtml += `<form action='${postURL}' method='post'>`;

    Object.keys(formData).forEach((key) => {
      formHtml += `<input type='hidden' name='${key}' value='${formData[key]}'>`;
    });
    formHtml += '</form><script>function autoPost(){document.forms[0].submit();}</script></body></html>';

    return formHtml;
  },

  // returns { code: 400, message: 'error' }
  processWebhook: async (data) => {
    const successMessageTypes = ['8', '10', 'M', 'P'];

    if (successMessageTypes.includes(data.messageType)) {
      const posAutCode = process.env.SISP_VINTI4_POS_AUT_CODE;

      // Validate the fingerprint
      const responseFingerprint = generateResponseFingerprint(
        posAutCode,
        data.messageType,
        data.merchantRespCP,
        data.merchantRespTid,
        data.merchantRespMerchantRef,
        data.merchantRespMerchantSession,
        data.merchantRespPurchaseAmount,
        data.merchantRespMessageID,
        data.merchantRespPan,
        data.merchantResp,
        data.merchantRespTimeStamp,
        data.merchantRespReferenceNumber,
        data.merchantRespEntityCode,
        data.merchantRespClientReceipt,
        data.merchantRespAdditionalErrorMessage.trim(),
        data.merchantRespReloadCode
      );

      if (data.resultFingerPrint === responseFingerprint) {
        try {
          return ({ code: 200 });
        }
        catch (error) {
          return ({ code: 500, message: `Payment processing error: ${error}` });
        }
      }
      else {
        return ({ code: 400, message: 'Payment processing error: Invalid fingerprint' });
      }
    }
    else if (data.UserCancelled === 'true') {
      return ({ code: 400, message: 'Payment processing cancelled' });
    }
    else {
      return ({ code: 400, message: 'Payment processing error' });
    }
  },

  orderDataFromWebhook

};
