const Sisp = require('./sisp');

let realDate;
const posID = 90051;
const posAutCode ='123456789A';
const webhookUrl ='https://www.chuva.io/payment-response';

const successData = `
<html>
    <head>
        <title>Pagamento Vinti4</title>
    </head>
    <body onload='autoPost()'>
        <div>
            <h5>Processando...</h5>
            <form
                action='https://mc.vinti4net.cv/Client_VbV_v2/biz_vbv_clientdata.jsp?FingerPrint=iIquEB%2BHNmuaIhNQm1VtCHzlAAtq32gUPnCf1UJLjozClLRFUvT8UDem32tmoKFWbgdLKch6%2BxA2X5i%2FhxWGUg%3D%3D&TimeStamp=2021-07-14%2010%3A01%3A58&FingerPrintVersion=1'
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

      const sisp = new Sisp({posID, posAutCode});
      const result = await sisp.generatePaymentRequestForm(referenceId, total, webhookUrl);

      const expected = successData.replace(/\s/g, '');

      expect(result.replace(/\s/g, '')).toEqual(expected);
    });
  });
});
