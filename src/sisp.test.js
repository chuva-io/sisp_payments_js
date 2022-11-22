const Sisp = require('./sisp');
const PAYMENT_ERRORS = require('./utils/paymentErrors');
const FORMAT_ERRORS = require('./utils/formatErrors');

let realDate;
const posID = 90051;
const posAutCode = '123456789A';

// Webhooks
const webhookUrl = 'https://www.chuva.io/payment-response';
const tokenEnrollmentWebhook = 'https://www.chuva.io/token-enrollment';
const tokenPaymentWebhook = 'https://www.chuva.io/token-payment';
const tokenCancelWebhook = 'https://www.chuva.io/token-cancel';

// Sisp Url mocks
const url = 'https://mc.vinti4net.cv/payments';
const tokenEnrollmentUrl = 'https://mc.vinti4net.cv/tokenEnrollment';
const tokenPaymentUrl = 'https://mc.vinti4net.cv/tokenPayment';
const tokenCancelUrl = 'https://mc.vinti4net.cv/tokenCancel';

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
                    name='merchantSession' value='S20210714100158'><input type='hidden' name='token' value=''>
                    <input type='hidden' name='amount' value='89'><input type='hidden' name='currency' value='132'>
                    <input type='hidden' name='is3DSec' value='1'><input type='hidden' name='urlMerchantResponse' value='https://www.chuva.io/payment-response'>
                    <input type='hidden' name='languageMessages' value='pt'><input type='hidden' name='timeStamp'
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
                    name='merchantSession' value='S20210714100158'><input type='hidden' name='token' value=''>
                    <input type='hidden' name='amount' value='89'><input type='hidden' name='currency' value='132'><input type='hidden' name='is3DSec' value='1'>
                    <input type='hidden' name='urlMerchantResponse' value='https://www.chuva.io/payment-response'><input
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
                    name='merchantSession' value='S20210714100158'><input type='hidden' name='token' value=''>
                    <input type='hidden' name='amount' value='89'><input
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

const successDataForTokenEnrollmentRequestForm = `
<html>
  <head>
    <title>Pagamento Vinti4</title>
  </head>
  <body onload='autoPost()'>
    <div>
    <h5>Processando...</h5>
    <form action='https://mc.vinti4net.cv/tokenEnrollment?FingerPrint=XkiCwdkFr1ewwgmdxRyeoHMYIhGmnxV1jCmJDiKIM%2FJVPblkaxTru4Pi%2FTsAuQUYL%2B7rqSC38gLPvcjCPuZCqQ%3D%3D&TimeStamp=2021-07-14%2010%3A01%3A58&FingerPrintVersion=1' method='post'>
      <input type='hidden' name='transactionCode' value='5'><input type='hidden' name='posID' value='90051'>
      <input type='hidden' name='merchantRef' value='1:3:testForm'>
      <input type='hidden' name='merchantSession' value='S20210714100158'>
      <input type='hidden' name='token' value=''>
      <input type='hidden' name='amount' value='89'>
      <input type='hidden' name='currency' value='132'>
      <input type='hidden' name='is3DSec' value='1'>
      <input type='hidden' name='urlMerchantResponse' value='https://www.chuva.io/token-enrollment'>
      <input type='hidden' name='languageMessages' value='pt'>
      <input type='hidden' name='timeStamp' value='2021-07-14 10:01:58'>
      <input type='hidden' name='fingerprintversion' value='1'>
      <input type='hidden' name='entityCode' value=''>
      <input type='hidden' name='referenceNumber' value=''>
      <input type='hidden' name='fingerprint' value='XkiCwdkFr1ewwgmdxRyeoHMYIhGmnxV1jCmJDiKIM/JVPblkaxTru4Pi/TsAuQUYL+7rqSC38gLPvcjCPuZCqQ=='>
    </form>
    <script>function autoPost(){document.forms[0].submit();}</script>
  </body>
</html>
`

const successDataForTokenPurchaseRequestForm = `
<html>
   <head>
      <title>Pagamento Vinti4</title>
   </head>
   <body onload='autoPost()'>
      <div>
      <h5>Processando...</h5>
      <form action='https://mc.vinti4net.cv/tokenPayment?FingerPrint=ha63EcJbETYQoHK6Cb7HpaK3XzgtOzlySI1mBojE1cSrBnojHtSijrmzqXv5x8HM7keOx4XDKCF0MEaQ0159NA%3D%3D&TimeStamp=2021-07-14%2010%3A01%3A58&FingerPrintVersion=1' method='post'>
        <input type='hidden' name='transactionCode' value='6'><input type='hidden' name='posID' value='90051'>
        <input type='hidden' name='merchantRef' value='1:3:testForm'>
        <input type='hidden' name='merchantSession' value='S20210714100158'>
        <input type='hidden' name='token' value='831561583'>
        <input type='hidden' name='amount' value='89'>
        <input type='hidden' name='currency' value='132'>
        <input type='hidden' name='is3DSec' value='1'>
        <input type='hidden' name='urlMerchantResponse' value='https://www.chuva.io/token-payment'>
        <input type='hidden' name='languageMessages' value='pt'>
        <input type='hidden' name='timeStamp' value='2021-07-14 10:01:58'>
        <input type='hidden' name='fingerprintversion' value='1'>
        <input type='hidden' name='entityCode' value=''>
        <input type='hidden' name='referenceNumber' value=''>
        <input type='hidden' name='fingerprint' value='ha63EcJbETYQoHK6Cb7HpaK3XzgtOzlySI1mBojE1cSrBnojHtSijrmzqXv5x8HM7keOx4XDKCF0MEaQ0159NA=='>
      </form>
      <script>function autoPost(){document.forms[0].submit();}</script>
   </body>
</html>
`

const successDataForTokenCancelRequestForm = `
<html>
   <head>
      <title>Pagamento Vinti4</title>
   </head>
   <body onload='autoPost()'>
      <div>
      <h5>Processando...</h5>
      <form action='https://mc.vinti4net.cv/tokenCancel?FingerPrint=P22%2Bf4m6r%2Bv5nRevMvIBUe3Cay6J%2BgXUEETlLTVbOF7SV7vqPfWjGYlQ5IDBzSn2l8FKNp1oyuyPZhFJYGUVIA%3D%3D&TimeStamp=2021-07-14%2010%3A01%3A58&FingerPrintVersion=1' method='post'>
        <input type='hidden' name='transactionCode' value='7'><input type='hidden' name='posID' value='90051'>
        <input type='hidden' name='merchantRef' value='1:3:testForm'>
        <input type='hidden' name='merchantSession' value='S20210714100158'>
        <input type='hidden' name='token' value='831561583'>
        <input type='hidden' name='amount' value='0'>
        <input type='hidden' name='currency' value='132'>
        <input type='hidden' name='is3DSec' value='1'>
        <input type='hidden' name='urlMerchantResponse' value='https://www.chuva.io/token-cancel'>
        <input type='hidden' name='languageMessages' value='pt'>
        <input type='hidden' name='timeStamp' value='2021-07-14 10:01:58'>
        <input type='hidden' name='fingerprintversion' value='1'>
        <input type='hidden' name='entityCode' value=''>
        <input type='hidden' name='referenceNumber' value=''>
        <input type='hidden' name='fingerprint' value='P22+f4m6r+v5nRevMvIBUe3Cay6J+gXUEETlLTVbOF7SV7vqPfWjGYlQ5IDBzSn2l8FKNp1oyuyPZhFJYGUVIA=='>
      </form>
      <script>function autoPost(){document.forms[0].submit();}</script>
   </body>
</html>
`

const successDataForTokenServicePaymentForm = `
<html>
   <head>
      <title>Pagamento Vinti4</title>
   </head>
   <body onload='autoPost()'>
      <div>
      <h5>Processando...</h5>
      <form action='https://mc.vinti4net.cv/tokenPayment?FingerPrint=2oWCXsjhFv1%2BMRuKMe2Q%2FkPzRLTzmAygzR6au0dzOHiNMETXGG4ANZhISW36cf7ci%2BH17dNc8hcl87HpjNQihA%3D%3D&TimeStamp=2021-07-14%2010%3A01%3A58&FingerPrintVersion=1' method='post'>
        <input type='hidden' name='transactionCode' value='2'><input type='hidden' name='posID' value='90051'>
        <input type='hidden' name='merchantRef' value='1:3:testForm'>
        <input type='hidden' name='merchantSession' value='S20210714100158'>
        <input type='hidden' name='token' value='831561583'>
        <input type='hidden' name='amount' value='89'>
        <input type='hidden' name='currency' value='132'>
        <input type='hidden' name='is3DSec' value='1'>
        <input type='hidden' name='urlMerchantResponse' value='https://www.chuva.io/token-payment'>
        <input type='hidden' name='languageMessages' value='pt'>
        <input type='hidden' name='timeStamp' value='2021-07-14 10:01:58'>
        <input type='hidden' name='fingerprintversion' value='1'>
        <input type='hidden' name='entityCode' value='6'>
        <input type='hidden' name='referenceNumber' value='227045251'>
        <input type='hidden' name='fingerprint' value='2oWCXsjhFv1+MRuKMe2Q/kPzRLTzmAygzR6au0dzOHiNMETXGG4ANZhISW36cf7ci+H17dNc8hcl87HpjNQihA=='>
      </form>
      <script>function autoPost(){document.forms[0].submit();}</script>
   </body>
</html>
`

const successDataForTokenRechargeRequestForm = `
<html>
   <head>
      <title>Pagamento Vinti4</title>
   </head>
   <body onload='autoPost()'>
      <div>
      <h5>Processando...</h5>
      <form action='https://mc.vinti4net.cv/tokenPayment?FingerPrint=kM51QKkWU7ycCaBbpiXfllmEOIlJukZyj5FgxcpPEiLUthhmYT6osEdMhg0MWmmnFcVcEcRFlwsTR%2B4ZanCi2Q%3D%3D&TimeStamp=2021-07-14%2010%3A01%3A58&FingerPrintVersion=1' method='post'>
        <input type='hidden' name='transactionCode' value='3'><input type='hidden' name='posID' value='90051'>
        <input type='hidden' name='merchantRef' value='1:3:testForm'>
        <input type='hidden' name='merchantSession' value='S20210714100158'>
        <input type='hidden' name='token' value='831561583'>
        <input type='hidden' name='amount' value='89'>
        <input type='hidden' name='currency' value='132'>
        <input type='hidden' name='is3DSec' value='1'>
        <input type='hidden' name='urlMerchantResponse' value='https://www.chuva.io/token-payment'>
        <input type='hidden' name='languageMessages' value='pt'>
        <input type='hidden' name='timeStamp' value='2021-07-14 10:01:58'>
        <input type='hidden' name='fingerprintversion' value='1'>
        <input type='hidden' name='entityCode' value='2'>
        <input type='hidden' name='referenceNumber' value='9573234'>
        <input type='hidden' name='fingerprint' value='kM51QKkWU7ycCaBbpiXfllmEOIlJukZyj5FgxcpPEiLUthhmYT6osEdMhg0MWmmnFcVcEcRFlwsTR+4ZanCi2Q=='>
      </form>
      <script>function autoPost(){document.forms[0].submit();}</script>
   </body>
</html>
`

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
          const paymentSuccessData = 'messageType=8&merchantRespCP=1047&merchantRespTid=00004787&merchantRespMerchantRef=52&merchantRespMerchantSession=S20210714100158&merchantRespPurchaseAmount=89&merchantRespMessageID=Zo23nJ2P9C3i3e5Z70K1&merchantRespPan=************4242&merchantResp=C&merchantRespErrorCode=&merchantRespErrorDescription=&merchantRespErrorDetail=&languageMessages=pt&merchantRespTimeStamp=2021-07-14%2010%3A01%3A58&merchantRespReferenceNumber=&merchantRespEntityCode=&merchantRespClientReceipt=&merchantRespAdditionalErrorMessage=&merchantRespReloadCode=&resultFingerPrint=j2hcuvti%2B1GUtdm8FiLr%2FB7MyT7OBKnswL6AnKy2LTGTRx0CBojFCvkzsyM3Z8Z%2BIzdF0%2FRxta%2FY2B9D9aRqKA%3D%3D&UserCancelled=false&resultFingerPrintVersion=1';

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
          const paymentSuccessData = 'messageType=P&merchantRespCP=1047&merchantRespTid=00004787&merchantRespMerchantRef=52&merchantRespMerchantSession=S20210714100158&merchantRespPurchaseAmount=89&merchantRespMessageID=Zo23nJ2P9C3i3e5Z70K1&merchantRespPan=************4242&merchantResp=C&merchantRespErrorCode=&merchantRespErrorDescription=&merchantRespErrorDetail=&languageMessages=pt&merchantRespTimeStamp=2021-07-14%2010%3A01%3A58&merchantRespReferenceNumber=227045251&merchantRespEntityCode=6&merchantRespClientReceipt=Pagamento+de+Servicos%3Cbr%2F%3E+++++++N.+Movimento+Cartao%3A+0%3Cbr%2F%3E%3Cbr%2F%3E+++Empresa%3A+CVMULTIMEDIA%3Cbr%2F%3E+++Morada%3A+Rua+Cabo+Verde+Telecom+N.1%3Cbr%2F%3E+++Capital+Social%3A+1.000.000.000+CVE%3Cbr%2F%3E+++N+Contribuinte%3A+252337182%3Cbr%2F%3E+++Reg+Cons.%3A+415%2F95%2F1207%3Cbr%2F%3E%3Cbr%2F%3E++++++++++Entidade%3A+6%3Cbr%2F%3E++++++++++Referencia%3A+9573234%3Cbr%2F%3E++++++++++Montante%3A+100%2400+ESCUDO%3Cbr%2F%3E%3Cbr%2F%3E+--------------------------------------%3Cbr%2F%3E%3Cbr%2F%3E&merchantRespAdditionalErrorMessage=&merchantRespReloadCode=&resultFingerPrint=qL05i21q4uq54hv6lAglb1QPImQrQJgVA6HFsr2FMYrpGvm2Of6LppTqjzgF3pqX9Tf%2BBKwAesfT5Zs6DcR2xw%3D%3D&resultFingerPrintVersion=1';
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
          const paymentSuccessData = 'messageType=M&merchantRespCP=1047&merchantRespTid=00004787&merchantRespMerchantRef=52&merchantRespMerchantSession=S20210714100158&merchantRespPurchaseAmount=89&merchantRespMessageID=Zo23nJ2P9C3i3e5Z70K1&merchantRespPan=************4242&merchantResp=C&merchantRespErrorCode=&merchantRespErrorDescription=&merchantRespErrorDetail=&languageMessages=pt&merchantRespTimeStamp=2021-07-14%2010%3A01%3A58&merchantRespReferenceNumber=9573234&merchantRespEntityCode=2&merchantRespClientReceipt=CVMovel%3Cbr%2F%3E%20CARREGAMENTO%20TELEMOVEL%3Cbr%2F%3E%3Cbr%2F%3E%20VALOR%20C%2F%20IVA%3A%20100%2C00%20ESCUDO%3Cbr%2F%3E%3Cbr%2F%3E%20REFERENCIA%20PAGAMENTO%3A%20102161250%3Cbr%2F%3E%3Cbr%2F%3E%20Dentro%20de%20instantes%20recebera%20uma%20%3Cbr%2F%3E%20mensagem%20de%20confirmacao%20do%20%3Cbr%2F%3E%20carregamento%20no%20seu%20telemovel.%3Cbr%2F%3E%3Cbr%2F%3E%20Prazo%20de%20reclamacao%20ate%2048H%2C%20%3Cbr%2F%3E%20apos%20a%20realizacao%20da%20operacao%3Cbr%2F%3E%3Cbr%2F%3E%20www.cvmovel.cv%3Cbr%2F%3E%20Atendimento%20ao%20cliente%20180%3Cbr%2F%3E%3Cbr%2F%3E%20CVMovel%20S.A.%3Cbr%2F%3E%20NIF.%3A%20252337000%3Cbr%2F%3E%20Registo%20Comercial%20n.%201935%3Cbr%2F%3E--------------------------------------%3Cbr%2F%3E%3Cbr%2F%3E%3Cbr%2F%3E---%20INICIO%20890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234%20FIM%3Cbr%2F%3E&merchantRespAdditionalErrorMessage=%20&merchantRespReloadCode=000000000000&resultFingerPrint=NojaMiZSl78ZtkGxaBnjjn%2FMvRtdfkPkYI7IJjdK%2FEa7OriZ9qD3r8iBm5iZ8PD2P4pRPKId36n1ZqXV0YSv4Q%3D%3D&resultFingerPrintVersion=1';

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
    });
  });

  describe('Tokenization', () => {
    describe('Generate form', () => {
      it('should return the correct form for token enrollment', () => {
        const referenceId = '1:3:testForm';
        const total = 89;
  
        const sisp = new Sisp({ posID, posAutCode, url: tokenEnrollmentUrl });
  
        const result = sisp.generateTokenEnrollmentRequestForm(referenceId, total, tokenEnrollmentWebhook);
  
        const expected = successDataForTokenEnrollmentRequestForm.replace(/\s/g, '');
  
        expect(result.replace(/\s/g, '')).toEqual(expected);
      });

      it('should return the correct form for token payment', () => {
        const referenceId = '1:3:testForm';
        const total = 89;
        const token = '831561583';
  
        const sisp = new Sisp({ posID, posAutCode, url: tokenPaymentUrl });
  
        const result = sisp.generateTokenPurchaseRequestForm(referenceId, total, tokenPaymentWebhook, token);
  
        const expected = successDataForTokenPurchaseRequestForm.replace(/\s/g, '');
  
        expect(result.replace(/\s/g, '')).toEqual(expected);
      });

      it('should return the correct form for token cancel', () => {
        const referenceId = '1:3:testForm';
        const total = 89;
        const token = '831561583';
  
        const sisp = new Sisp({ posID, posAutCode, url: tokenCancelUrl });
  
        const result = sisp.generateTokenCancelRequestForm(referenceId, tokenCancelWebhook, token);
  
        const expected = successDataForTokenCancelRequestForm.replace(/\s/g, '');
  
        expect(result.replace(/\s/g, '')).toEqual(expected);
      });

      it('should return the correct form for token service payment', () => {
        const referenceId = '1:3:testForm';
        const total = 89;
        const token = '831561583';

        const entityCode = '6';
        const referenceNumber = '227045251';
  
        const sisp = new Sisp({ posID, posAutCode, url: tokenPaymentUrl });
  
        const result = sisp.generateTokenServicePaymentRequestForm(referenceId, total, tokenPaymentWebhook, entityCode, referenceNumber, token);
  
        const expected = successDataForTokenServicePaymentForm.replace(/\s/g, '');
  
        expect(result.replace(/\s/g, '')).toEqual(expected);
      });

      it('should return the correct form for token phone recharge', () => {
        const referenceId = '1:3:testForm';
        const total = 89;
        const token = '831561583';

        const entityCode = '2';
        const phoneNumber = '9573234';
  
        const sisp = new Sisp({ posID, posAutCode, url: tokenPaymentUrl });
  
        const result = sisp.generateTokenRechargeRequestForm(referenceId, total, tokenPaymentWebhook, entityCode, phoneNumber, token);
  
        const expected = successDataForTokenRechargeRequestForm.replace(/\s/g, '');
  
        expect(result.replace(/\s/g, '')).toEqual(expected);
      });
    });

    describe('Successful requests', () => {
      it('should return undefined if messageType is A and transactionCode is for token enrollment', () => {
        const successData = 'messageType=A&merchantRespMerchantRef=52&merchantRespMerchantSession=S20210714100158&merchantRespMessageID=Zo23nJ2P9C3i3e5Z70K1&merchantResp=0&merchantRespCP=1047&merchantRespTid=00004787&languageMessages=pt&merchantRespTimeStamp=2021-07-14%2010%3A01%3A58&token=150481477&tokenDescription=BCA&maxAmountAllowed=100&limitDate=2022-11-23&maxNumberOfTransactions=10&resultFingerPrint=eZ5%2FkTpA9RvrhwvmYUNnoYDKuixMkOn5xegfkDZXZigDPH7dV5JlAE%2FSo%2FOFs9x9yn4W%2FTCWASWqvcIYDp0ovw%3D%3D&resultFingerPrintVersion=1&merchantRespPan=%2A%2A%2A%2A%2A%2A%2A%2A%2A%2A%2A%2A0285';

        const referenceId = '1:3:testForm';
        const total = 89;

        const sisp = new Sisp({ posID, posAutCode, url: tokenEnrollmentUrl });

        const requestFormResult = sisp.generateTokenEnrollmentRequestForm(referenceId, total, tokenEnrollmentWebhook);

        const formExpected = successDataForTokenEnrollmentRequestForm.replace(/\s/g, '');

        const result = sisp.validatePayment(successData);
        const expected = undefined;

        expect(requestFormResult.replace(/\s/g, '')).toEqual(formExpected);
        expect(result).toEqual(expected);
      });

      it('should return undefined if messageType is B and transactionCode is for token purchase', () => {
        const successData = 'messageType=B&merchantRespMerchantRef=52&merchantRespMerchantSession=S20210714100158&merchantRespMessageID=Zo23nJ2P9C3i3e5Z70K1&merchantResp=0&merchantRespCP=1047&merchantRespTid=00004787&approvalCode=016961&merchantRespPurchaseAmount=89&languageMessages=pt&merchantRespTimeStamp=2021-07-14%2010%3A01%3A58&resultFingerPrint=DtKhDWm6vCsP35xgExhNN%2F8ChHu8d8hURKUkmnlq8nZ5pgnYpoyGZfInMB6u8H6SkdYioFQ88rjRWCts5o1dDQ%3D%3D&resultFingerPrintVersion=1&merchantRespClientReceipt=%20&merchantRespReloadCode=000000000000&merchantRespReferenceNumber=&merchantRespEntityCode=';

        const referenceId = '1:3:testForm';
        const total = 89;
        const token = '831561583';

        const sisp = new Sisp({ posID, posAutCode, url: tokenPaymentUrl });

        const requestFormResult = sisp.generateTokenPurchaseRequestForm(referenceId, total, tokenPaymentWebhook, token);

        const formExpected = successDataForTokenPurchaseRequestForm.replace(/\s/g, '');

        const result = sisp.validatePayment(successData);
        const expected = undefined;

        expect(requestFormResult.replace(/\s/g, '')).toEqual(formExpected);
        expect(result).toEqual(expected);
      });

      it('should return undefined if messageType is C and transactionCode is for token cancel', () => {
        const successData = 'messageType=C&merchantRespMerchantRef=52&merchantRespMerchantSession=S20210714100158&merchantRespMessageID=Zo23nJ2P9C3i3e5Z70K1&merchantResp=0&merchantRespCP=1047&merchantRespTid=00004787&approvalCode=&merchantRespPurchaseAmount=0&languageMessages=pt&merchantRespTimeStamp=2021-07-14%2010%3A01%3A58&resultFingerPrint=rhAXh4vy3iqhVDx7c%2FUKumaGEazn4His7xjBH6WldM38oCOVkfge%2BI8ZBHe3U93gi0wf1gOqv%2FxJaH3KBC5B2g%3D%3D&resultFingerPrintVersion=1&merchantRespClientReceipt=&merchantRespReloadCode=&merchantRespReferenceNumber=&merchantRespEntityCode=';

        const referenceId = '1:3:testForm';
        const token = '831561583';

        const sisp = new Sisp({ posID, posAutCode, url: tokenCancelUrl });

        const requestFormResult = sisp.generateTokenCancelRequestForm(referenceId, tokenCancelWebhook, token);

        const formExpected = successDataForTokenCancelRequestForm.replace(/\s/g, '');

        const result = sisp.validatePayment(successData);
        const expected = undefined;

        expect(requestFormResult.replace(/\s/g, '')).toEqual(formExpected);
        expect(result).toEqual(expected);
      });

      it('should return undefined if messageType is B and transactionCode is for service payment with token', () => {
        const successData = 'messageType=B&merchantRespMerchantRef=52&merchantRespMerchantSession=S20210714100158&merchantRespMessageID=Zo23nJ2P9C3i3e5Z70K1&merchantResp=0&merchantRespCP=1047&merchantRespTid=00004787&approvalCode=016961&merchantRespPurchaseAmount=89&languageMessages=pt&merchantRespTimeStamp=2021-07-14%2010%3A01%3A58&resultFingerPrint=qJ7kdNFauLM0V3CX06mRTwXMx803TLDg5hUtbU6oW%2Bv4Eca6ikYBK8gPEVtzJx%2B85G7r0tfmPvw8hn5fB5gvSg%3D%3D&resultFingerPrintVersion=1&merchantRespClientReceipt=%20Pagamento%20de%20Servicos%3Cbr%2F%3E%20N.%20Movimento%20Cartao%3A%200%3Cbr%2F%3E%3Cbr%2F%3E%20Empresa%3A%20CVMULTIMEDIA%3Cbr%2F%3E%20Morada%3A%20Rua%20Cabo%20Verde%20Telecom%20N.1%3Cbr%2F%3E%20Capital%20Social%3A%201.000.000.000%20CVE%3Cbr%2F%3E%20N%20Contribuinte%3A%20252337182%3Cbr%2F%3E%20Reg%20Cons.%3A%20415%2F95%2F1207%3Cbr%2F%3E%3Cbr%2F%3E%20Entidade%3A%206%3Cbr%2F%3E%20Referencia%3A%20227045251%3Cbr%2F%3E%20Montante%3A%20100%2400%20ESCUDO%3Cbr%2F%3E%3Cbr%2F%3E%20--------------------------------------%3Cbr%2F%3E%3Cbr%2F%3E&merchantRespReloadCode=000000000000&merchantRespReferenceNumber=227045251&merchantRespEntityCode=6';

        const referenceId = '1:3:testForm';
        const total = 89;
        const token = '831561583';

        const entityCode = '6';
        const referenceNumber = '227045251';

        const sisp = new Sisp({ posID, posAutCode, url: tokenPaymentUrl });

        const requestFormResult = sisp.generateTokenServicePaymentRequestForm(referenceId, total, tokenPaymentWebhook, entityCode, referenceNumber, token);

        const formExpected = successDataForTokenServicePaymentForm.replace(/\s/g, '');

        const result = sisp.validatePayment(successData);
        const expected = undefined;

        expect(requestFormResult.replace(/\s/g, '')).toEqual(formExpected);
        expect(result).toEqual(expected);
      });

      it('should return undefined if messageType is B and transactionCode is for phone recharge with token', () => {
        const successData = 'messageType=B&merchantRespMerchantRef=52&merchantRespMerchantSession=S20210714100158&merchantRespMessageID=Zo23nJ2P9C3i3e5Z70K1&merchantResp=0&merchantRespCP=1047&merchantRespTid=00004787&approvalCode=016961&merchantRespPurchaseAmount=89&languageMessages=pt&merchantRespTimeStamp=2021-07-14%2010%3A01%3A58&resultFingerPrint=WI3Nh7ukA2OtAlueVToQ3NBHHjsNwFLNGEBYrKS5yHtCYtYtxkB7pAnncC%2FarDODZWhcZ2BFMDJ54ABGeF1lCA%3D%3D&resultFingerPrintVersion=1&merchantRespClientReceipt=CVMovel%3Cbr%2F%3E%20CARREGAMENTO%20TELEMOVEL%3Cbr%2F%3E%3Cbr%2F%3E%20VALOR%20C%2F%20IVA%3A%20100%2C00%20ESCUDO%3Cbr%2F%3E%3Cbr%2F%3E%20REFERENCIA%20PAGAMENTO%3A%20102161250%3Cbr%2F%3E%3Cbr%2F%3E%20Dentro%20de%20instantes%20recebera%20uma%20%3Cbr%2F%3E%20mensagem%20de%20confirmacao%20do%20%3Cbr%2F%3E%20carregamento%20no%20seu%20telemovel.%3Cbr%2F%3E%3Cbr%2F%3E%20Prazo%20de%20reclamacao%20ate%2048H%2C%20%3Cbr%2F%3E%20apos%20a%20realizacao%20da%20operacao%3Cbr%2F%3E%3Cbr%2F%3E%20www.cvmovel.cv%3Cbr%2F%3E%20Atendimento%20ao%20cliente%20180%3Cbr%2F%3E%3Cbr%2F%3E%20CVMovel%20S.A.%3Cbr%2F%3E%20NIF.%3A%20252337000%3Cbr%2F%3E%20Registo%20Comercial%20n.%201935%3Cbr%2F%3E--------------------------------------%3Cbr%2F%3E%3Cbr%2F%3E%3Cbr%2F%3E---%20INICIO%20890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234%20FIM%3Cbr%2F%3E&merchantRespReloadCode=000000000000&merchantRespReferenceNumber=9573234&merchantRespEntityCode=2';

        const referenceId = '1:3:testForm';
        const total = 89;
        const token = '831561583';

        const entityCode = '2';
        const phoneNumber = '9573234';

        const sisp = new Sisp({ posID, posAutCode, url: tokenPaymentUrl });

        const requestFormResult = sisp.generateTokenRechargeRequestForm(referenceId, total, tokenPaymentWebhook, entityCode, phoneNumber, token);

        const formExpected = successDataForTokenRechargeRequestForm.replace(/\s/g, '');

        const result = sisp.validatePayment(successData);
        const expected = undefined;

        expect(requestFormResult.replace(/\s/g, '')).toEqual(formExpected);
        expect(result).toEqual(expected);
      });
    });
  });

  describe('Error Payment', () => {
    it('should return code 003 if messageType is different from "8", "M", "P", "A", "B" or "C"', () => {
      const paymentSuccessData = 'messageType=D&merchantRespCP=1047&merchantRespTid=00004787&merchantRespMerchantRef=52&merchantRespMerchantSession=S20200626121231&merchantRespPurchaseAmount=400.00&merchantRespMessageID=Zo23nJ2P9C3i3e5Z70K1&merchantRespPan=************4242&merchantResp=C&merchantRespErrorCode=&merchantRespErrorDescription=&merchantRespErrorDetail=&languageMessages=pt&merchantRespTimeStamp=2020-06-26+12%3A11%3A01&merchantRespReferenceNumber=&merchantRespEntityCode=&merchantRespClientReceipt=&merchantRespAdditionalErrorMessage=&merchantRespReloadCode=&resultFingerPrint=GXtUrKOwPtZwTbGiuDEjERoPvsmAUOCB9HRC2Smr%2B%2FVocZVluiTzmgbquPJpjPz3yuW0Ouhz05lRWUfF02mJtA%3D%3D&UserCancelled=false&resultFingerPrintVersion=1';

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
      const paymentSuccessData = 'messageType=6&merchantRespCP=1047&merchantRespTid=00004787&merchantRespMerchantRef=52&merchantRespMerchantSession=S20200626121231&merchantRespPurchaseAmount=400.00&merchantRespMessageID=Zo23nJ2P9C3i3e5Z70K1&merchantRespPan=************4242&merchantResp=C&merchantRespErrorCode=&merchantRespErrorDescription=&merchantRespErrorDetail=&languageMessages=pt&merchantRespTimeStamp=2020-06-26+12%3A11%3A01&merchantRespReferenceNumber=&merchantRespEntityCode=&merchantRespClientReceipt=&merchantRespAdditionalErrorMessage=&merchantRespReloadCode=&resultFingerPrint=GXtUrKOwPtZwTbGiuDEjERoPvsmAUOCB9HRC2Smr%2B%2FVocZVluiTzmgbquPJpjPz3yuW0Ouhz05lRWUfF02mJtA%3D%3D&UserCancelled=true&resultFingerPrintVersion=1';

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
      const paymentSuccessData = 'messageType=8&merchantRespCP=1047&merchantRespTid=00004787&merchantRespMerchantRef=52&merchantRespMerchantSession=S20200626121231&merchantRespPurchaseAmount=89&merchantRespMessageID=Zo23nJ2P9C3i3e5Z70K1&merchantRespPan=************4242&merchantResp=C&merchantRespErrorCode=&merchantRespErrorDescription=&merchantRespErrorDetail=&languageMessages=pt&merchantRespTimeStamp=2020-06-26+12%3A11%3A01&merchantRespReferenceNumber=&merchantRespEntityCode=&merchantRespClientReceipt=&merchantRespAdditionalErrorMessage=&merchantRespReloadCode=&resultFingerPrint=GXtUrKOwPtZwTbGiuDEjERoPvsmAUOCB9HRC2Smr%2B%2FVocZVluiTzmgbquPJpjPz3yuW0Ouhz05lRWUfF02mJtA%3D%3D&UserCancelled=true&resultFingerPrintVersion=1';

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
