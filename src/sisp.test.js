const Sisp = require('./sisp');
const TRANSACTION_CODES = require('./constants/transactionCodes');
const PAYMENT_ERRORS = require('./utils/paymentErrors');
const FORMAT_ERRORS = require('./utils/formatErrors');

let realDate;
const posID = 90051;
const posAutCode = '123456789A';
const webhookUrl = 'https://www.chuva.io/payment-response';
const url = 'https://mc.vinti4net.cv/payments';

const successDataForPurchaseForm = `
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

const successDataForServicePaymentForm = `
<html>
    <head>
        <title>Pagamento Vinti4</title>
    </head>
    <body onload='autoPost()'>
        <div>
            <h5>Processando...</h5>
            <form
                action='https://mc.vinti4net.cv/payments?FingerPrint=9NrY%2Bc2F915lOrRn%2FTaVEOGUYDs9xaTyWsNB2DiqzrR8XTSRSTRDFWSUxR0ibdkyvd%2FjnP3F5pwqXUtz4D6jIA%3D%3D&TimeStamp=2021-07-14%2010%3A01%3A58&FingerPrintVersion=1'
                method='post'><input type='hidden' name='transactionCode' value='2'><input type='hidden' name='posID'
                    value='90051'><input type='hidden' name='merchantRef' value='1:3:testForm'><input type='hidden'
                    name='merchantSession' value='S20210714100158'><input type='hidden' name='amount' value='89'><input
                    type='hidden' name='currency' value='132'><input type='hidden' name='is3DSec' value='1'><input
                    type='hidden' name='urlMerchantResponse' value='https://www.chuva.io/payment-response'><input
                    type='hidden' name='languageMessages' value='pt'><input type='hidden' name='timeStamp'
                    value='2021-07-14 10:01:58'><input type='hidden' name='fingerprintversion' value='1'><input
                    type='hidden' name='entityCode' value='6'><input type='hidden' name='referenceNumber' value='227045251'><input
                    type='hidden' name='fingerprint'
                    value='9NrY+c2F915lOrRn/TaVEOGUYDs9xaTyWsNB2DiqzrR8XTSRSTRDFWSUxR0ibdkyvd/jnP3F5pwqXUtz4D6jIA=='>
            </form>
            <script>function autoPost() { document.forms[0].submit(); }</script>
    </body>
</html>`;

const successDataForPhoneRechargeForm = `
<html>
    <head>
        <title>Pagamento Vinti4</title>
    </head>
    <body onload='autoPost()'>
        <div>
            <h5>Processando...</h5>
            <form
                action='https://mc.vinti4net.cv/payments?FingerPrint=brBCI9rd%2F%2BxAw9EGx4OaT1ZV2aNiTXoAVee9e6vvss%2B4FFGQ%2Bq8BK5%2FrCdtH3CPJp52ZhcqYiFe%2BU9ovv9MR8A%3D%3D&TimeStamp=2021-07-14%2010%3A01%3A58&FingerPrintVersion=1'
                method='post'><input type='hidden' name='transactionCode' value='3'><input type='hidden' name='posID'
                    value='90051'><input type='hidden' name='merchantRef' value='1:3:testForm'><input type='hidden'
                    name='merchantSession' value='S20210714100158'><input type='hidden' name='amount' value='89'><input
                    type='hidden' name='currency' value='132'><input type='hidden' name='is3DSec' value='1'><input
                    type='hidden' name='urlMerchantResponse' value='https://www.chuva.io/payment-response'><input
                    type='hidden' name='languageMessages' value='pt'><input type='hidden' name='timeStamp'
                    value='2021-07-14 10:01:58'><input type='hidden' name='fingerprintversion' value='1'><input
                    type='hidden' name='entityCode' value='2'><input type='hidden' name='referenceNumber' value='9573234'><input
                    type='hidden' name='fingerprint'
                    value='brBCI9rd/+xAw9EGx4OaT1ZV2aNiTXoAVee9e6vvss+4FFGQ+q8BK5/rCdtH3CPJp52ZhcqYiFe+U9ovv9MR8A=='>
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
    it('should return the correct form for purchase', () => {
      const referenceId = '1:3:testForm';
      const total = 89;

      const sisp = new Sisp({ posID, posAutCode, url });
      const result = sisp.generatePaymentRequestForm(referenceId, total, webhookUrl);

      const expected = successDataForPurchaseForm.replace(/\s/g, '');

      expect(result.replace(/\s/g, '')).toEqual(expected);
    });

    it('should return the correct form for service payment', () => {
      const referenceId = '1:3:testForm';
      const total = 89;

      const sisp = new Sisp({ posID, posAutCode, url });

      const entityCode = '6';
      const referenceNumber = '227045251';

      const result = sisp.generateServicePaymentRequestForm(referenceId, total, webhookUrl, entityCode, referenceNumber);

      const expected = successDataForServicePaymentForm.replace(/\s/g, '');

      expect(result.replace(/\s/g, '')).toEqual(expected);
    });

    it('should return the correct form for phone recharge', () => {
      const referenceId = '1:3:testForm';
      const total = 89;

      const sisp = new Sisp({ posID, posAutCode, url });

      const entityCode = '2';
      const phoneNumber = '9573234';

      const result = sisp.generateRechargeRequestForm(referenceId, total, webhookUrl, entityCode, phoneNumber);

      const expected = successDataForPhoneRechargeForm.replace(/\s/g, '');

      expect(result.replace(/\s/g, '')).toEqual(expected);
    });
  });

  describe('Processing Payment Response', () => {
    describe('Successful Payment', () => {
      it('should return undefined if messageType is 8 and transactionCode is for purchase', () => {
        const paymentSuccessData = 'messageType=8&merchantRespCP=1047&merchantRespTid=00004787&merchantRespMerchantRef=52&merchantRespMerchantSession=S20210714100158&merchantRespPurchaseAmount=89&merchantRespMessageID=Zo23nJ2P9C3i3e5Z70K1&merchantRespPan=************4242&merchantResp=C&merchantRespErrorCode=&merchantRespErrorDescription=&merchantRespErrorDetail=&languageMessages=pt&merchantRespTimeStamp=2021-07-14%2010%3A01%3A58&merchantRespReferenceNumber=&merchantRespEntityCode=&merchantRespClientReceipt=&merchantRespAdditionalErrorMessage=&merchantRespReloadCode=&resultFingerPrint=j2hcuvti%2B1GUtdm8FiLr%2FB7MyT7OBKnswL6AnKy2LTGTRx0CBojFCvkzsyM3Z8Z%2BIzdF0%2FRxta%2FY2B9D9aRqKA%3D%3D&UserCancelled=false&resultFingerPrintVersion=1'

        const referenceId = '1:3:testForm';
        const total = 89;

        const sisp = new Sisp({ posID, posAutCode, url });

        const requestFormResult = sisp.generatePaymentRequestForm(referenceId, total, webhookUrl);

        const formExpected = successDataForPurchaseForm.replace(/\s/g, '');

        const result = sisp.validatePayment(paymentSuccessData);
        const expected = undefined;

        expect(requestFormResult.replace(/\s/g, '')).toEqual(formExpected);
        expect(result).toEqual(expected);
      });

      it('should return undefined if messageType is P and transactionCode is for service payment', () => {
        const paymentSuccessData = 'messageType=P&merchantRespCP=1047&merchantRespTid=00004787&merchantRespMerchantRef=52&merchantRespMerchantSession=S20210714100158&merchantRespPurchaseAmount=89&merchantRespMessageID=Zo23nJ2P9C3i3e5Z70K1&merchantRespPan=************4242&merchantResp=C&merchantRespErrorCode=&merchantRespErrorDescription=&merchantRespErrorDetail=&languageMessages=pt&merchantRespTimeStamp=2021-07-14%2010%3A01%3A58&merchantRespReferenceNumber=227045251&merchantRespEntityCode=6&merchantRespClientReceipt=Pagamento+de+Servicos%3Cbr%2F%3E+++++++N.+Movimento+Cartao%3A+0%3Cbr%2F%3E%3Cbr%2F%3E+++Empresa%3A+CVMULTIMEDIA%3Cbr%2F%3E+++Morada%3A+Rua+Cabo+Verde+Telecom+N.1%3Cbr%2F%3E+++Capital+Social%3A+1.000.000.000+CVE%3Cbr%2F%3E+++N+Contribuinte%3A+252337182%3Cbr%2F%3E+++Reg+Cons.%3A+415%2F95%2F1207%3Cbr%2F%3E%3Cbr%2F%3E++++++++++Entidade%3A+6%3Cbr%2F%3E++++++++++Referencia%3A+9573234%3Cbr%2F%3E++++++++++Montante%3A+100%2400+ESCUDO%3Cbr%2F%3E%3Cbr%2F%3E+--------------------------------------%3Cbr%2F%3E%3Cbr%2F%3E&merchantRespAdditionalErrorMessage=&merchantRespReloadCode=&resultFingerPrint=qL05i21q4uq54hv6lAglb1QPImQrQJgVA6HFsr2FMYrpGvm2Of6LppTqjzgF3pqX9Tf%2BBKwAesfT5Zs6DcR2xw%3D%3D&resultFingerPrintVersion=1'
        const referenceId = '1:3:testForm';
        const total = 89;

        const sisp = new Sisp({ posID, posAutCode, url });
        
        const entityCode = '6';
        const referenceNumber = '227045251';

        const requestFormResult = sisp.generateServicePaymentRequestForm(referenceId, total, webhookUrl, entityCode, referenceNumber);

        const formExpected = successDataForServicePaymentForm.replace(/\s/g, '');

        const result = sisp.validatePayment(paymentSuccessData);
        const expected = undefined;

        expect(requestFormResult.replace(/\s/g, '')).toEqual(formExpected);
        expect(result).toEqual(expected);
      });

      it('should return undefined if messageType is M and transactionCode is for phone recharge', () => {
        const paymentSuccessData = 'messageType=M&merchantRespCP=1047&merchantRespTid=00004787&merchantRespMerchantRef=52&merchantRespMerchantSession=S20210714100158&merchantRespPurchaseAmount=89&merchantRespMessageID=Zo23nJ2P9C3i3e5Z70K1&merchantRespPan=************4242&merchantResp=C&merchantRespErrorCode=&merchantRespErrorDescription=&merchantRespErrorDetail=&languageMessages=pt&merchantRespTimeStamp=2021-07-14%2010%3A01%3A58&merchantRespReferenceNumber=9573234&merchantRespEntityCode=2&merchantRespClientReceipt=CVMovel%3Cbr%2F%3E%20CARREGAMENTO%20TELEMOVEL%3Cbr%2F%3E%3Cbr%2F%3E%20VALOR%20C%2F%20IVA%3A%20100%2C00%20ESCUDO%3Cbr%2F%3E%3Cbr%2F%3E%20REFERENCIA%20PAGAMENTO%3A%20102161250%3Cbr%2F%3E%3Cbr%2F%3E%20Dentro%20de%20instantes%20recebera%20uma%20%3Cbr%2F%3E%20mensagem%20de%20confirmacao%20do%20%3Cbr%2F%3E%20carregamento%20no%20seu%20telemovel.%3Cbr%2F%3E%3Cbr%2F%3E%20Prazo%20de%20reclamacao%20ate%2048H%2C%20%3Cbr%2F%3E%20apos%20a%20realizacao%20da%20operacao%3Cbr%2F%3E%3Cbr%2F%3E%20www.cvmovel.cv%3Cbr%2F%3E%20Atendimento%20ao%20cliente%20180%3Cbr%2F%3E%3Cbr%2F%3E%20CVMovel%20S.A.%3Cbr%2F%3E%20NIF.%3A%20252337000%3Cbr%2F%3E%20Registo%20Comercial%20n.%201935%3Cbr%2F%3E--------------------------------------%3Cbr%2F%3E%3Cbr%2F%3E%3Cbr%2F%3E---%20INICIO%20890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234%20FIM%3Cbr%2F%3E&merchantRespAdditionalErrorMessage=%20&merchantRespReloadCode=000000000000&resultFingerPrint=NojaMiZSl78ZtkGxaBnjjn%2FMvRtdfkPkYI7IJjdK%2FEa7OriZ9qD3r8iBm5iZ8PD2P4pRPKId36n1ZqXV0YSv4Q%3D%3D&resultFingerPrintVersion=1'

        const referenceId = '1:3:testForm';
        const total = 89;

        const sisp = new Sisp({ posID, posAutCode, url });
        
        const entityCode = '2';
        const phoneNumber = '9573234';

        const requestFormResult = sisp.generateRechargeRequestForm(referenceId, total, webhookUrl, entityCode, phoneNumber);

        const formExpected = successDataForPhoneRechargeForm.replace(/\s/g, '');

        const result = sisp.validatePayment(paymentSuccessData);
        const expected = undefined;

        expect(requestFormResult.replace(/\s/g, '')).toEqual(formExpected);
        expect(result).toEqual(expected);
      });
    });

    describe('Error Payment', () => {
      it('should return code 003 if messageType is different from "8", "M" or "P"', () => {
        const paymentSuccessData = 'messageType=A&merchantRespCP=1047&merchantRespTid=00004787&merchantRespMerchantRef=52&merchantRespMerchantSession=S20200626121231&merchantRespPurchaseAmount=400.00&merchantRespMessageID=Zo23nJ2P9C3i3e5Z70K1&merchantRespPan=************4242&merchantResp=C&merchantRespErrorCode=&merchantRespErrorDescription=&merchantRespErrorDetail=&languageMessages=pt&merchantRespTimeStamp=2020-06-26+12%3A11%3A01&merchantRespReferenceNumber=&merchantRespEntityCode=&merchantRespClientReceipt=&merchantRespAdditionalErrorMessage=&merchantRespReloadCode=&resultFingerPrint=GXtUrKOwPtZwTbGiuDEjERoPvsmAUOCB9HRC2Smr%2B%2FVocZVluiTzmgbquPJpjPz3yuW0Ouhz05lRWUfF02mJtA%3D%3D&UserCancelled=false&resultFingerPrintVersion=1'

        const referenceId = '1:3:testForm';
        const total = 89;

        const sisp = new Sisp({ posID, posAutCode, url });
        const requestFormResult = sisp.generatePaymentRequestForm(referenceId, total, webhookUrl);

        const formExpected = successDataForPurchaseForm.replace(/\s/g, '');

        const result = sisp.validatePayment(paymentSuccessData);
        const expected = PAYMENT_ERRORS.processing;

        expect(requestFormResult.replace(/\s/g, '')).toEqual(formExpected);
        expect(result).toEqual(expected);
      });

      it('should return code 002 if user cancel payment', () => {
        const paymentSuccessData = 'messageType=A&merchantRespCP=1047&merchantRespTid=00004787&merchantRespMerchantRef=52&merchantRespMerchantSession=S20200626121231&merchantRespPurchaseAmount=400.00&merchantRespMessageID=Zo23nJ2P9C3i3e5Z70K1&merchantRespPan=************4242&merchantResp=C&merchantRespErrorCode=&merchantRespErrorDescription=&merchantRespErrorDetail=&languageMessages=pt&merchantRespTimeStamp=2020-06-26+12%3A11%3A01&merchantRespReferenceNumber=&merchantRespEntityCode=&merchantRespClientReceipt=&merchantRespAdditionalErrorMessage=&merchantRespReloadCode=&resultFingerPrint=GXtUrKOwPtZwTbGiuDEjERoPvsmAUOCB9HRC2Smr%2B%2FVocZVluiTzmgbquPJpjPz3yuW0Ouhz05lRWUfF02mJtA%3D%3D&UserCancelled=true&resultFingerPrintVersion=1'

        const referenceId = '1:3:testForm';
        const total = 89;

        const sisp = new Sisp({ posID, posAutCode, url });
        const requestFormResult = sisp.generatePaymentRequestForm(referenceId, total, webhookUrl);

        const formExpected = successDataForPurchaseForm.replace(/\s/g, '');

        const result = sisp.validatePayment(paymentSuccessData);
        const expected = PAYMENT_ERRORS.cancelled;

        expect(requestFormResult.replace(/\s/g, '')).toEqual(formExpected);
        expect(result).toEqual(expected);
      });

      it('should return code 001 if the generated fingerprint is invalid', () => {
        const paymentSuccessData = 'messageType=8&merchantRespCP=1047&merchantRespTid=00004787&merchantRespMerchantRef=52&merchantRespMerchantSession=S20200626121231&merchantRespPurchaseAmount=89&merchantRespMessageID=Zo23nJ2P9C3i3e5Z70K1&merchantRespPan=************4242&merchantResp=C&merchantRespErrorCode=&merchantRespErrorDescription=&merchantRespErrorDetail=&languageMessages=pt&merchantRespTimeStamp=2020-06-26+12%3A11%3A01&merchantRespReferenceNumber=&merchantRespEntityCode=&merchantRespClientReceipt=&merchantRespAdditionalErrorMessage=&merchantRespReloadCode=&resultFingerPrint=GXtUrKOwPtZwTbGiuDEjERoPvsmAUOCB9HRC2Smr%2B%2FVocZVluiTzmgbquPJpjPz3yuW0Ouhz05lRWUfF02mJtA%3D%3D&UserCancelled=true&resultFingerPrintVersion=1'

        const referenceId = '1:3:testForm';
        const total = 89;

        const sisp = new Sisp({ posID, posAutCode, url });
        const requestFormResult = sisp.generatePaymentRequestForm(referenceId, total, webhookUrl);

        const formExpected = successDataForPurchaseForm.replace(/\s/g, '');

        const result = sisp.validatePayment(paymentSuccessData);
        const expected = PAYMENT_ERRORS.fingerprint;

        expect(requestFormResult.replace(/\s/g, '')).toEqual(formExpected);
        expect(result).toEqual(expected);
      });
    });

    describe('Format Error', () => {
      it('should return invalid format if the validatePayment parameter is not an x-www-form-urlencoded', () => {
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
        const requestFormResult = sisp.generatePaymentRequestForm(referenceId, total, webhookUrl);

        const formExpected = successDataForPurchaseForm.replace(/\s/g, '');

        const result = sisp.validatePayment(paymentSuccessData);
        const expected = FORMAT_ERRORS.invalid;

        expect(requestFormResult.replace(/\s/g, '')).toEqual(formExpected);
        expect(result).toEqual(expected);
      });
    });
  });
});
