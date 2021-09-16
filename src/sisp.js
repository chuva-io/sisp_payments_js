const { format: formatDate } = require('date-fns');
const sha512 = require('js-sha512');
const btoa = require('btoa');

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
   */
  constructor({ posID, posAutCode }) {
    this.posID = posID;
    this.posAutCode = posAutCode;
  };

  /**
   * GENERATE PAYMENT REQUEST FORM
   * @param {String} referenceId - Required - This is the payment reference. In this case, we need to know which payment was processed when the SISP returns the payment response.
   * @param {Number} total - Required - This is the amount SISP should process the payment.
   * @param {String} webhookUrl - Required - This is the URL the user should be contacted by SISP for payment response.
   * @returns {Document} response - HTML Form to process payments
   */
  generatePaymentRequestForm = (referenceId, total, webhookUrl) => {
    const posID = this.posID;
    const posAutCode = this.posAutCode;
    const CVE_CURRENCY_CODE = '132';

    const merchantSession = `S${formatDate(new Date(), 'yyyyMMddHHmmss')}`;
    const dateTime = formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss');

    const SISP_URL = 'https://mc.vinti4net.cv/Client_VbV_v2/biz_vbv_clientdata.jsp';

    const formData = {
      transactionCode: '1',
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

    const postURL = `${SISP_URL}?FingerPrint=${encodeURIComponent(formData.fingerprint)}&TimeStamp=${encodeURIComponent(formData.timeStamp)}&FingerPrintVersion=${encodeURIComponent(formData.fingerprintversion)}`;

    // Create form to POST to SISP
    let formHtml = '<html><head><title>Pagamento Vinti4</title></head><body onload=\'autoPost()\'><div><h5>Processando...</h5>';

    formHtml += `<form action='${postURL}' method='post'>`;

    Object.keys(formData).forEach((key) => {
      formHtml += `<input type='hidden' name='${key}' value='${formData[key]}'>`;
    });
    formHtml += '</form><script>function autoPost(){document.forms[0].submit();}</script></body></html>';

    return formHtml;
  };

};

module.exports = Sisp;
