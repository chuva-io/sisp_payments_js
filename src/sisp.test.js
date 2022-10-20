const Sisp = require('./sisp');
const PAYMENT_ERRORS = require('./utils/paymentErrors');
const FORMAT_ERRORS = require('./utils/formatErrors');

let realDate;
const posID = 90051;
const posAutCode = '123456789A';
const webhookUrl = 'https://www.chuva.io/payment-response';
const url = 'https://mc.vinti4net.cv/payments';

const successData = `
<html>
    <head>
        <title>Pagamento Vinti4</title>
    </head>
    <body onload='autoPost()'>
        <div>
            <h5>Processando...</h5>
            <form
                action='https://mc.vinti4net.cv/payments?FingerPrint=iIquEB%2BHNmuaIhNQm1VtCHzlAAtq32gUPnCf1UJLjozClLRFUvT8UDem32tmoKFWbgdLKch6%2BxA2X5i%2FhxWGUg%3D%3D&TimeStamp=2021-07-14%2010%3A01%3A58&FingerPrintVersion=1'
                method='post'><input type='hidden' name='transactionCode' value='1'><input type='hidden' name='posID'
                    value='90051'><input type='hidden' name='merchantRef' value='1:3:testForm'><input type='hidden'
                    name='merchantSession' value='S20210714100158'><input type='hidden' name='amount' value='89'><input
                    type='hidden' name='currency' value='132'><input type='hidden' name='is3DSec' value='1'><input
                    type='hidden' name='urlMerchantResponse' value='https://www.chuva.io/payment-response'><input
                    type='hidden' name='languageMessages' value='pt'><input type='hidden' name='timeStamp'
                    value='2021-07-14 10:01:58'><input type='hidden' name='fingerprintversion' value='1'><input
                    type='hidden' name='entityCode' value=''><input type='hidden' name='referenceNumber' value=''><input
                    type='hidden' name='fingerprint'
                    value='iIquEB+HNmuaIhNQm1VtCHzlAAtq32gUPnCf1UJLjozClLRFUvT8UDem32tmoKFWbgdLKch6+xA2X5i/hxWGUg=='>
            </form>
            <script>function autoPost() { document.forms[0].submit(); }</script>
    </body>
</html>`;

describe('SISP Payment', () => {
  beforeEach(async () => {
    // Mock the whole Date class with a fixed date instance
    const currentDate = new Date('2021-07-14T11:01:58.135Z');

    realDate = Date;

    global.Date = class extends Date {
      constructor(date) {
        if (date) {
          return super(date);
        }
        return currentDate;
      }
    };
  });

  afterEach(async () => {
    // Cleanup
    global.Date = realDate;
  });

  describe('Generate Payment Form', () => {
    it('should return the correct response', async () => {
      const referenceId = '1:3:testForm';
      const total = 89;

      const sisp = new Sisp({ posID, posAutCode, url });
      const result = await sisp.generatePaymentRequestForm(referenceId, total, webhookUrl);

      const expected = successData.replace(/\s/g, '');

      expect(result.replace(/\s/g, '')).toEqual(expected);
    });
  });

  describe('Processing Payment Response', () => {
    describe('Successful Payment', () => {
      it('should return undefined if messageType is 8', async () => {
        const paymentSuccessData = 'messageType=8&merchantRespCP=1047&merchantRespTid=00004787&merchantRespMerchantRef=52&merchantRespMerchantSession=S20200626121231&merchantRespPurchaseAmount=400.00&merchantRespMessageID=Zo23nJ2P9C3i3e5Z70K1&merchantRespPan=************4242&merchantResp=C&merchantRespErrorCode=&merchantRespErrorDescription=&merchantRespErrorDetail=&languageMessages=pt&merchantRespTimeStamp=2020-06-26+12%3A11%3A01&merchantRespReferenceNumber=&merchantRespEntityCode=&merchantRespClientReceipt=&merchantRespAdditionalErrorMessage=&merchantRespReloadCode=&resultFingerPrint=GXtUrKOwPtZwTbGiuDEjERoPvsmAUOCB9HRC2Smr%2B%2FVocZVluiTzmgbquPJpjPz3yuW0Ouhz05lRWUfF02mJtA%3D%3D&UserCancelled=false&resultFingerPrintVersion=1'

        const referenceId = '1:3:testForm';
        const total = 89;

        const sisp = new Sisp({ posID, posAutCode, url });
        const requestFormResult = await sisp.generatePaymentRequestForm(referenceId, total, webhookUrl);

        const formExpected = successData.replace(/\s/g, '');

        const result = await sisp.validatePayment(paymentSuccessData);
        const expected = undefined;

        expect(requestFormResult.replace(/\s/g, '')).toEqual(formExpected);
        expect(result).toEqual(expected);
      });

      it('should return undefined if messageType is 10', async () => {
        const paymentSuccessData = 'messageType=10&merchantRespCP=1047&merchantRespTid=00004787&merchantRespMerchantRef=52&merchantRespMerchantSession=S20200626121231&merchantRespPurchaseAmount=400.00&merchantRespMessageID=Zo23nJ2P9C3i3e5Z70K1&merchantRespPan=************4242&merchantResp=C&merchantRespErrorCode=&merchantRespErrorDescription=&merchantRespErrorDetail=&languageMessages=pt&merchantRespTimeStamp=2020-06-26+12%3A11%3A01&merchantRespReferenceNumber=&merchantRespEntityCode=&merchantRespClientReceipt=&merchantRespAdditionalErrorMessage=&merchantRespReloadCode=&resultFingerPrint=zjuDVwa1ZiAXHUW0PY3ulSOFAcQVdufhOtAxE1q8h%2BgZhyxqupgfagqZrWtIugY0kb4zi2OLA%2FaoqAouJyvxDA%3D%3D&UserCancelled=false&resultFingerPrintVersion=1'
        const referenceId = '1:3:testForm';
        const total = 89;

        const sisp = new Sisp({ posID, posAutCode, url });
        const requestFormResult = await sisp.generatePaymentRequestForm(referenceId, total, webhookUrl);

        const formExpected = successData.replace(/\s/g, '');

        const result = await sisp.validatePayment(paymentSuccessData);
        const expected = undefined;

        expect(requestFormResult.replace(/\s/g, '')).toEqual(formExpected);
        expect(result).toEqual(expected);
      });

      it('should return undefined if messageType is M', async () => {
        const paymentSuccessData = 'messageType=M&merchantRespCP=1047&merchantRespTid=00004787&merchantRespMerchantRef=52&merchantRespMerchantSession=S20200626121231&merchantRespPurchaseAmount=400.00&merchantRespMessageID=Zo23nJ2P9C3i3e5Z70K1&merchantRespPan=************4242&merchantResp=C&merchantRespErrorCode=&merchantRespErrorDescription=&merchantRespErrorDetail=&languageMessages=pt&merchantRespTimeStamp=2020-06-26+12%3A11%3A01&merchantRespReferenceNumber=&merchantRespEntityCode=&merchantRespClientReceipt=&merchantRespAdditionalErrorMessage=&merchantRespReloadCode=&resultFingerPrint=6%2FAB7qPfq32CeNDFrvi4iU30vc9jPiJiPds9yiptL1hErpQSXVeLWsvgtUVRv7MuvEJaO6pSkkKCR2X8XORYLg%3D%3D&UserCancelled=false&resultFingerPrintVersion=1'

        const referenceId = '1:3:testForm';
        const total = 89;

        const sisp = new Sisp({ posID, posAutCode, url });
        const requestFormResult = await sisp.generatePaymentRequestForm(referenceId, total, webhookUrl);

        const formExpected = successData.replace(/\s/g, '');

        const result = await sisp.validatePayment(paymentSuccessData);
        const expected = undefined;

        expect(requestFormResult.replace(/\s/g, '')).toEqual(formExpected);
        expect(result).toEqual(expected);
      });

      it('should return undefined if messageType is P', async () => {
        const paymentSuccessData = 'messageType=P&merchantRespCP=1047&merchantRespTid=00004787&merchantRespMerchantRef=52&merchantRespMerchantSession=S20200626121231&merchantRespPurchaseAmount=400.00&merchantRespMessageID=Zo23nJ2P9C3i3e5Z70K1&merchantRespPan=************4242&merchantResp=C&merchantRespErrorCode=&merchantRespErrorDescription=&merchantRespErrorDetail=&languageMessages=pt&merchantRespTimeStamp=2020-06-26+12%3A11%3A01&merchantRespReferenceNumber=&merchantRespEntityCode=&merchantRespClientReceipt=&merchantRespAdditionalErrorMessage=&merchantRespReloadCode=&resultFingerPrint=623aUzWxGVU8Stp8hlck9hLZo9%2F%2BT9xvs3lxNDkDwa2z2PQWF25LO9IjozPtdU95dlG8eAMTGj2cW%2B2QpIQ%2B4w%3D%3D&UserCancelled=false&resultFingerPrintVersion=1'

        const referenceId = '1:3:testForm';
        const total = 89;

        const sisp = new Sisp({ posID, posAutCode, url });
        const requestFormResult = await sisp.generatePaymentRequestForm(referenceId, total, webhookUrl);

        const formExpected = successData.replace(/\s/g, '');

        const result = await sisp.validatePayment(paymentSuccessData);
        const expected = undefined;

        expect(requestFormResult.replace(/\s/g, '')).toEqual(formExpected);
        expect(result).toEqual(expected);
      });
    });

    describe('Error Payment', () => {
      it('should return code 003 if messageType is different from "8", "10", "M" or "P"', async () => {
        const paymentSuccessData = 'messageType=A&merchantRespCP=1047&merchantRespTid=00004787&merchantRespMerchantRef=52&merchantRespMerchantSession=S20200626121231&merchantRespPurchaseAmount=400.00&merchantRespMessageID=Zo23nJ2P9C3i3e5Z70K1&merchantRespPan=************4242&merchantResp=C&merchantRespErrorCode=&merchantRespErrorDescription=&merchantRespErrorDetail=&languageMessages=pt&merchantRespTimeStamp=2020-06-26+12%3A11%3A01&merchantRespReferenceNumber=&merchantRespEntityCode=&merchantRespClientReceipt=&merchantRespAdditionalErrorMessage=&merchantRespReloadCode=&resultFingerPrint=GXtUrKOwPtZwTbGiuDEjERoPvsmAUOCB9HRC2Smr%2B%2FVocZVluiTzmgbquPJpjPz3yuW0Ouhz05lRWUfF02mJtA%3D%3D&UserCancelled=false&resultFingerPrintVersion=1'

        const referenceId = '1:3:testForm';
        const total = 89;

        const sisp = new Sisp({ posID, posAutCode, url });
        const requestFormResult = await sisp.generatePaymentRequestForm(referenceId, total, webhookUrl);

        const formExpected = successData.replace(/\s/g, '');

        const result = sisp.validatePayment(paymentSuccessData);
        const expected = PAYMENT_ERRORS.processing;

        expect(requestFormResult.replace(/\s/g, '')).toEqual(formExpected);
        expect(result).toEqual(expected);
      });

      it('should return code 002 if user cancel payment', async () => {
        const paymentSuccessData = 'messageType=A&merchantRespCP=1047&merchantRespTid=00004787&merchantRespMerchantRef=52&merchantRespMerchantSession=S20200626121231&merchantRespPurchaseAmount=400.00&merchantRespMessageID=Zo23nJ2P9C3i3e5Z70K1&merchantRespPan=************4242&merchantResp=C&merchantRespErrorCode=&merchantRespErrorDescription=&merchantRespErrorDetail=&languageMessages=pt&merchantRespTimeStamp=2020-06-26+12%3A11%3A01&merchantRespReferenceNumber=&merchantRespEntityCode=&merchantRespClientReceipt=&merchantRespAdditionalErrorMessage=&merchantRespReloadCode=&resultFingerPrint=GXtUrKOwPtZwTbGiuDEjERoPvsmAUOCB9HRC2Smr%2B%2FVocZVluiTzmgbquPJpjPz3yuW0Ouhz05lRWUfF02mJtA%3D%3D&UserCancelled=true&resultFingerPrintVersion=1'

        const referenceId = '1:3:testForm';
        const total = 89;

        const sisp = new Sisp({ posID, posAutCode, url });
        const requestFormResult = await sisp.generatePaymentRequestForm(referenceId, total, webhookUrl);

        const formExpected = successData.replace(/\s/g, '');

        const result = sisp.validatePayment(paymentSuccessData);
        const expected = PAYMENT_ERRORS.cancelled;

        expect(requestFormResult.replace(/\s/g, '')).toEqual(formExpected);
        expect(result).toEqual(expected);
      });
    });

    describe('Format Error', () => {
      it('should return invalid format if the validatePayment parameter is not an x-www-form-urlencoded', async () => {
        const paymentSuccessData = {
          languageMessages: 'pt',
          merchantResp: 'C',
          merchantRespAdditionalErrorMessage: '',
          merchantRespCP: '1047',
          merchantRespClientReceipt: '',
          merchantRespEntityCode: '',
          merchantRespErrorCode: '',
          merchantRespErrorDescription: '',
          merchantRespErrorDetail: '',
          merchantRespMerchantRef: '52',
          merchantRespMerchantSession: 'S20200626121231',
          merchantRespMessageID: 'Zo23nJ2P9C3i3e5Z70K1',
          merchantRespPan: '************4242',
          merchantRespPurchaseAmount: '400.00',
          merchantRespReferenceNumber: '',
          merchantRespReloadCode: '',
          merchantRespTid: '00004787',
          merchantRespTimeStamp: '2020-06-26 12:11:01',
          messageType: '8',
          resultFingerPrint: 'GXtUrKOwPtZwTbGiuDEjERoPvsmAUOCB9HRC2Smr+/VocZVluiTzmgbquPJpjPz3yuW0Ouhz05lRWUfF02mJtA==',
          resultFingerPrintVersion: '1',
          UserCancelled: 'false'
        };

        const referenceId = '1:3:testForm';
        const total = 89;

        const sisp = new Sisp({ posID, posAutCode, url });
        const requestFormResult = await sisp.generatePaymentRequestForm(referenceId, total, webhookUrl);

        const formExpected = successData.replace(/\s/g, '');

        const result = sisp.validatePayment(paymentSuccessData);
        const expected = FORMAT_ERRORS.invalid;

        expect(requestFormResult.replace(/\s/g, '')).toEqual(formExpected);
        expect(result).toEqual(expected);
      });
    });
  });
});
