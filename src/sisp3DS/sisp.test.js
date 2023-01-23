const Sisp = require('./sisp');
const PAYMENT_ERRORS = require('../utils/paymentErrors');
const FORMAT_ERRORS = require('../utils/formatErrors');

let realDate;
const posID = 90051;
const posAutCode = '123456789A';

// Webhooks
const webhookUrl = 'https://www.chuva.io/payment-response';

// Sisp Url mocks
const url = 'https://mc.vinti4net.cv/payments';

const successDataForPurchaseFormWith3DSec = `
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
                    name='merchantSession' value='S20210714100158'>
                    <input type='hidden' name='amount' value='89'><input type='hidden' name='currency' value='132'>
                    <input type='hidden' name='is3DSec' value='1'><input type='hidden' name='urlMerchantResponse' value='https://www.chuva.io/payment-response'>
                    <input type='hidden' name='languageMessages' value='pt'><input type='hidden' name='timeStamp'
                    value='2021-07-14 10:01:58'><input type='hidden' name='fingerprintversion' value='1'><input
                    type='hidden' name='entityCode' value=''><input type='hidden' name='referenceNumber' value=''>
                    <input type='hidden' name='acctID' value='xpto'>
                    <input type='hidden' name='email' value='carlos@email.com'>
                    <input type='hidden' name='billAddrCountry' value='123'>
                    <input type='hidden' name='mobilePhone[cc]' value='123'>
                    <input type='hidden' name='mobilePhone[subscriber]' value='2389573234'>
                    <input type='hidden' name='purchaseRequest' value='eyJhY2N0SUQiOiJ4cHRvIiwiZW1haWwiOiJjYXJsb3NAZW1haWwuY29tIiwiYmlsbEFkZHJDb3VudHJ5IjoiMTIzIiwibW9iaWxlUGhvbmUiOnsiY2MiOiIxMjMiLCJzdWJzY3JpYmVyIjoiMjM4OTU3MzIzNCJ9fQ=='>
                    <input type='hidden' name='fingerprint' value='iIquEB+HNmuaIhNQm1VtCHzlAAtq32gUPnCf1UJLjozClLRFUvT8UDem32tmoKFWbgdLKch6+xA2X5i/hxWGUg=='>
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

  describe('Card payment', () => {
    describe('Generate Payment Form', () => {
      describe('Success cases', () => {
        it('should return the correct form for purchase with 3DSec', () => {
          const referenceId = '1:3:testForm';
          const total = 89;
    
          const sisp = new Sisp({ posID, posAutCode, url });
          const result = sisp.generatePaymentRequestForm(referenceId, total, webhookUrl, {
            acctID: "xpto",
            email: "carlos@email.com",
            billAddrCountry: "123",
            mobilePhone: {
              // Cape Verd country code
              cc: "123",
              subscriber: "2389573234"
            },
          });
    
          const expected = successDataForPurchaseFormWith3DSec.replace(/\s/g, '');
    
          expect(result.replace(/\s/g, '')).toEqual(expected);
        });
      });

      describe('Invalid data cases', () => {
        it('should return error if the referenceId is not defined', () => {
          const total = 89;

          const sisp = new Sisp({ posID, posAutCode, url });
          const result = sisp.generatePaymentRequestForm(total, webhookUrl, {
            acctID: "xpto",
            email: "carlos@email.com",
            billAddrCountry: "123",
            mobilePhone: {
              // Cape Verd country code
              cc: "123",
              subscriber: "2389573234"
            },
          });

          expect(result).toBeDefined();
          expect(result.code).toBe(401);
          expect(result.description).toBe('Invalid data error: "referenceId" must be a string');
        });

        it('should return error if the total is not defined', () => {
          const referenceId = '1:3:testForm';

          const sisp = new Sisp({ posID, posAutCode, url });
          const result = sisp.generatePaymentRequestForm(referenceId, webhookUrl, {
            acctID: "xpto",
            email: "carlos@email.com",
            billAddrCountry: "123",
            mobilePhone: {
              // Cape Verd country code
              cc: "123",
              subscriber: "2389573234"
            },
          });

          expect(result).toBeDefined();
          expect(result.code).toBe(401);
          expect(result.description).toBe('Invalid data error: "total" must be a number');
        });

        it('should return error if the total is equal to 0', () => {
          const referenceId = '1:3:testForm';

          const sisp = new Sisp({ posID, posAutCode, url });
          const result = sisp.generatePaymentRequestForm(referenceId, 0, webhookUrl, {
            acctID: "xpto",
            email: "carlos@email.com",
            billAddrCountry: "123",
            mobilePhone: {
              // Cape Verd country code
              cc: "123",
              subscriber: "2389573234"
            },
          });

          expect(result).toBeDefined();
          expect(result.code).toBe(401);
          expect(result.description).toBe('Invalid data error: "total" must be greater than 0');
        });

        it('should return error if the total is less than 0', () => {
          const referenceId = '1:3:testForm';

          const sisp = new Sisp({ posID, posAutCode, url });
          const result = sisp.generatePaymentRequestForm(referenceId, -1, webhookUrl, {
            acctID: "xpto",
            email: "carlos@email.com",
            billAddrCountry: "123",
            mobilePhone: {
              // Cape Verd country code
              cc: "123",
              subscriber: "2389573234"
            },
          });

          expect(result).toBeDefined();
          expect(result.code).toBe(401);
          expect(result.description).toBe('Invalid data error: "total" must be greater than 0');
        });

        it('should return error if the webhookUrl is not defined', () => {
          const referenceId = '1:3:testForm';
          const total = 89;

          const sisp = new Sisp({ posID, posAutCode, url });
          const result = sisp.generatePaymentRequestForm(referenceId, total, null, {
            acctID: "xpto",
            email: "carlos@email.com",
            billAddrCountry: "123",
            mobilePhone: {
              // Cape Verd country code
              cc: "123",
              subscriber: "2389573234"
            },
          });

          expect(result).toBeDefined();
          expect(result.code).toBe(401);
          expect(result.description).toBe('Invalid data error: "webhookUrl" must be a string');
        });

        it('should return error if userBillingInfo is missing', () => {
          const referenceId = '1:3:testForm';
          const total = 89;
    
          const sisp = new Sisp({ posID, posAutCode, url });
    
          const result = sisp.generatePaymentRequestForm(referenceId, total, webhookUrl);
    
          expect(result).toBeDefined();
          expect(result.code).toBe(401);
          expect(result.description).toBe('Invalid data error: "acctID" is required');
        });
      });
    });

    describe('Processing Payment Response', () => {
      describe('Successful Payment', () => {
        it('should return undefined if messageType is 8 and transactionCode is for purchase with 3DSec', () => {
          const paymentSuccessData = 'messageType=8&merchantRespCP=1047&merchantRespTid=00004787&merchantRespMerchantRef=52&merchantRespMerchantSession=S20210714100158&merchantRespPurchaseAmount=89&merchantRespMessageID=Zo23nJ2P9C3i3e5Z70K1&merchantRespPan=************4242&merchantResp=C&merchantRespErrorCode=&merchantRespErrorDescription=&merchantRespErrorDetail=&languageMessages=pt&merchantRespTimeStamp=2021-07-14%2010%3A01%3A58&merchantRespReferenceNumber=&merchantRespEntityCode=&merchantRespClientReceipt=&merchantRespAdditionalErrorMessage=&merchantRespReloadCode=&resultFingerPrint=j2hcuvti%2B1GUtdm8FiLr%2FB7MyT7OBKnswL6AnKy2LTGTRx0CBojFCvkzsyM3Z8Z%2BIzdF0%2FRxta%2FY2B9D9aRqKA%3D%3D&UserCancelled=false&resultFingerPrintVersion=1';

          const referenceId = '1:3:testForm';
          const total = 89;

          const sisp = new Sisp({ posID, posAutCode, url });

          const requestFormResult = sisp.generatePaymentRequestForm(referenceId, total, webhookUrl, {
            acctID: "xpto",
            email: "carlos@email.com",
            billAddrCountry: "123",
            mobilePhone: {
              // Cape Verd country code
              cc: "123",
              subscriber: "2389573234"
            },
          });

          const formExpected = successDataForPurchaseFormWith3DSec.replace(/\s/g, '');

          const result = sisp.validatePayment(paymentSuccessData);
          const expected = undefined;

          expect(requestFormResult.replace(/\s/g, '')).toEqual(formExpected);
          expect(result).toEqual(expected);
        });
      });
    });
  });

  describe('Error Payment', () => {

    it('should return code 003 if messageType is different from "8", "M", "P", "A", "B" or "C"', () => {
      const invalidPaymentData = 'messageType=D&merchantRespCP=1047&merchantRespTid=00004787&merchantRespMerchantRef=52&merchantRespMerchantSession=S20200626121231&merchantRespPurchaseAmount=400.00&merchantRespMessageID=Zo23nJ2P9C3i3e5Z70K1&merchantRespPan=************4242&merchantResp=C&merchantRespErrorCode=&merchantRespErrorDescription=&merchantRespErrorDetail=&languageMessages=pt&merchantRespTimeStamp=2020-06-26+12%3A11%3A01&merchantRespReferenceNumber=&merchantRespEntityCode=&merchantRespClientReceipt=&merchantRespAdditionalErrorMessage=&merchantRespReloadCode=&resultFingerPrint=GXtUrKOwPtZwTbGiuDEjERoPvsmAUOCB9HRC2Smr%2B%2FVocZVluiTzmgbquPJpjPz3yuW0Ouhz05lRWUfF02mJtA%3D%3D&UserCancelled=false&resultFingerPrintVersion=1';

      const referenceId = '1:3:testForm';
      const total = 89;

      const sisp = new Sisp({ posID, posAutCode, url });
      const requestFormResult = sisp.generatePaymentRequestForm(referenceId, total, webhookUrl, {
        acctID: "xpto",
        email: "carlos@email.com",
        billAddrCountry: "123",
        mobilePhone: {
          // Cape Verd country code
          cc: "123",
          subscriber: "2389573234"
        },
      });

      const formExpected = successDataForPurchaseFormWith3DSec.replace(/\s/g, '');

      const result = sisp.validatePayment(invalidPaymentData);
      const expected = PAYMENT_ERRORS.processing;

      expect(requestFormResult.replace(/\s/g, '')).toEqual(formExpected);
      expect(result).toEqual(expected);
    });

    it('should return code 002 if user cancel payment', () => {
      const paymentResponseData = 'messageType=6&merchantRespCP=1047&merchantRespTid=00004787&merchantRespMerchantRef=52&merchantRespMerchantSession=S20200626121231&merchantRespPurchaseAmount=400.00&merchantRespMessageID=Zo23nJ2P9C3i3e5Z70K1&merchantRespPan=************4242&merchantResp=C&merchantRespErrorCode=&merchantRespErrorDescription=&merchantRespErrorDetail=&languageMessages=pt&merchantRespTimeStamp=2020-06-26+12%3A11%3A01&merchantRespReferenceNumber=&merchantRespEntityCode=&merchantRespClientReceipt=&merchantRespAdditionalErrorMessage=&merchantRespReloadCode=&resultFingerPrint=GXtUrKOwPtZwTbGiuDEjERoPvsmAUOCB9HRC2Smr%2B%2FVocZVluiTzmgbquPJpjPz3yuW0Ouhz05lRWUfF02mJtA%3D%3D&UserCancelled=true&resultFingerPrintVersion=1';

      const referenceId = '1:3:testForm';
      const total = 89;

      const sisp = new Sisp({ posID, posAutCode, url });
      const requestFormResult = sisp.generatePaymentRequestForm(referenceId, total, webhookUrl, {
        acctID: "xpto",
        email: "carlos@email.com",
        billAddrCountry: "123",
        mobilePhone: {
          // Cape Verd country code
          cc: "123",
          subscriber: "2389573234"
        },
      });

      const formExpected = successDataForPurchaseFormWith3DSec.replace(/\s/g, '');

      const result = sisp.validatePayment(paymentResponseData);
      const expected = PAYMENT_ERRORS.cancelled;

      expect(requestFormResult.replace(/\s/g, '')).toEqual(formExpected);
      expect(result).toEqual(expected);
    });

    it('should return code 001 if the generated fingerprint is invalid', () => {
      const invalidPaymentData = 'messageType=8&merchantRespCP=1047&merchantRespTid=00004787&merchantRespMerchantRef=52&merchantRespMerchantSession=S20200626121231&merchantRespPurchaseAmount=89&merchantRespMessageID=Zo23nJ2P9C3i3e5Z70K1&merchantRespPan=************4242&merchantResp=C&merchantRespErrorCode=&merchantRespErrorDescription=&merchantRespErrorDetail=&languageMessages=pt&merchantRespTimeStamp=2020-06-26+12%3A11%3A01&merchantRespReferenceNumber=&merchantRespEntityCode=&merchantRespClientReceipt=&merchantRespAdditionalErrorMessage=&merchantRespReloadCode=&resultFingerPrint=GXtUrKOwPtZwTbGiuDEjERoPvsmAUOCB9HRC2Smr%2B%2FVocZVluiTzmgbquPJpjPz3yuW0Ouhz05lRWUfF02mJtA%3D%3D&UserCancelled=true&resultFingerPrintVersion=1';

      const referenceId = '1:3:testForm';
      const total = 89;

      const sisp = new Sisp({ posID, posAutCode, url });
      const requestFormResult = sisp.generatePaymentRequestForm(referenceId, total, webhookUrl, {
        acctID: "xpto",
        email: "carlos@email.com",
        billAddrCountry: "123",
        mobilePhone: {
          // Cape Verd country code
          cc: "123",
          subscriber: "2389573234"
        },
      });

      const formExpected = successDataForPurchaseFormWith3DSec.replace(/\s/g, '');

      const result = sisp.validatePayment(invalidPaymentData);
      const expected = PAYMENT_ERRORS.fingerprint;

      expect(requestFormResult.replace(/\s/g, '')).toEqual(formExpected);
      expect(result).toEqual(expected);
    });
  });

  describe('Format Error', () => {
    it('should return invalid format if the validatePayment parameter is not an x-www-form-urlencoded', () => {
      const invalidPaymentData = {
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
      const requestFormResult = sisp.generatePaymentRequestForm(referenceId, total, webhookUrl, {
        acctID: "xpto",
        email: "carlos@email.com",
        billAddrCountry: "123",
        mobilePhone: {
          // Cape Verd country code
          cc: "123",
          subscriber: "2389573234"
        },
      });

      const formExpected = successDataForPurchaseFormWith3DSec.replace(/\s/g, '');

      const result = sisp.validatePayment(invalidPaymentData);
      const expected = FORMAT_ERRORS.invalid;

      expect(requestFormResult.replace(/\s/g, '')).toEqual(formExpected);
      expect(result).toEqual(expected);
    });
  });
});
