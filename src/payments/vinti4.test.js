const vinti4 = require('./vinti4');

const posAutCode = "123456789A";

describe('Vinti 4', () => {
  describe('processing webhook', () => {
    describe('successful payment', () => {
      let successData;

      beforeEach(() => {
        successData = {
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
          resultFingerPrintVersion: '1'
        };
      });

      it('should return the correct response', async () => {
        const result = await vinti4.processWebhook(posAutCode, successData);
        const expected = { code: 200 };

        expect(result).toEqual(expected);
      });
    });
  });

  describe('handle Vinti4 payment', () => {
    const requestBody1 = {
      merchantRespMerchantRef: '199:301:176'
    };

    const requestBody2 = {
      merchant_ref: '199:301:176'
    };

    const requestBody3 = {
      merchantRef: '199:301:176'
    };

    const expected = {
      store_id: '199',
      order_id: '301',
      ref: '176'
    };

    it('should return the correct response merchantRespMerchantRef', async () => {
      const result = await vinti4.orderDataFromWebhook(requestBody1);

      expect(result).toEqual(
        expect.objectContaining(expected)
      );
    });

    it('should return the correct response merchant_ref', async () => {
      const result = await vinti4.orderDataFromWebhook(requestBody2);

      expect(result).toEqual(
        expect.objectContaining(expected)
      );
    });

    it('should return the correct response merchantRef', async () => {
      const result = await vinti4.orderDataFromWebhook(requestBody3);

      expect(result).toEqual(
        expect.objectContaining(expected)
      );
    });
  });
});
