const validateUserBillingInfoSchema = require('./validateUserBillingInfoSchema');
describe('Success cases', () => {
  it('Error should be undefined when userBillingInfo object have all the required fields', () => {
    const validUserBillingInfoschema = {
      acctID: "xpto",
      email: "carlos@email.com",
      billAddrCountry: "123",
      mobilePhone: {
        // Cape Verd country code
        cc: "123",
        subscriber: "2389573234"
      },
    };
    
    const error = validateUserBillingInfoSchema(validUserBillingInfoschema);

    expect(error).toBe(undefined);
  });

  it('Error should be undefined when userBilling object have all the fields with valid data', () => {
    const validUserBillingInfoschema = {
      acctID: "xpto",
      acctInfo: {
        chAccAgeInd: "05",
        chAccChange: "20220328",
        chAccDate: "20220328",
        chAccPwChange: "20220328",
        chAccPwChangeInd: "05",
        suspiciousAccActivity: "01"
      },
      email: "carlos@email.com",
      addrMatch: "N",
      billAddrCity: "City",
      billAddrCountry: "620",
      billAddrLine1: "Mindelo",
      billAddrLine2: "Assomada",
      billAddrLine3: "Rua 4",
      billAddrPostCode: "000",
      billAddrState: "18",
      shipAddrCity: " Palmarejo",
      shipAddrCountry: "620",
      shipAddrLine1: "000",
      shipAddrPostCode: "000",
      shipAddrState: "18",
      workPhone: {
        cc: "123",
        subscriber: "2389573234"
      },
      mobilePhone: {
        cc: "123",
        subscriber: "2389573234"
      },
    };

    const error = validateUserBillingInfoSchema(validUserBillingInfoschema);

    expect(error).toBe(undefined);
  });
});

describe('Error cases', () => {
  describe('Required info error cases', () => {
    it('Error should be defined when userBillingInfo object don\'t have the acctID field', () => {
  
      const invalidUserBillingInfoschema = {
        billAddrCountry: "123",
        email: "carlos@email.com",
        mobilePhone: {
          // Cape Verd country code
          cc: "123",
          subscriber: "2389573234"
        },
      };
      
      const error = validateUserBillingInfoSchema(invalidUserBillingInfoschema);
  
      expect(error).toBeDefined();
      expect(error.code).toBe(401);
      expect(error.description).toBe('Invalid data error: "acctID" is required');
    });
  
    it('Error should be defined when userBillingInfo object don\'t have the email field', () => {
  
      const invalidUserBillingInfoschema = {
        acctID: "xpto",
        billAddrCountry: "123",
        mobilePhone: {
          // Cape Verd country code
          cc: "123",
          subscriber: "2389573234"
        },
      };
      
      const error = validateUserBillingInfoSchema(invalidUserBillingInfoschema);
  
      expect(error).toBeDefined();
      expect(error.code).toBe(401);
      expect(error.description).toBe('Invalid data error: "email" is required');
    });
  
    it('Error should be defined when userBillingInfo object don\'t have the billAddrCountry field', () => {
  
      const invalidUserBillingInfoschema = {
        acctID: "xpto",
        email: "carlos@email.com",
        mobilePhone: {
          // Cape Verd country code
          cc: "123",
          subscriber: "2389573234"
        },
      };
      
      const error = validateUserBillingInfoSchema(invalidUserBillingInfoschema);
  
      expect(error).toBeDefined();
      expect(error.code).toBe(401);
      expect(error.description).toBe('Invalid data error: "billAddrCountry" is required');
    });
  
    it('Error should be defined when userBillingInfo object don\'t have the mobilePhone field', () => {
  
      const invalidUserBillingInfoschema = {
        acctID: "xpto",
        email: "carlos@email.com",
        billAddrCountry: "123",
      };
      
      const error = validateUserBillingInfoSchema(invalidUserBillingInfoschema);
  
      expect(error).toBeDefined();
      expect(error.code).toBe(401);
      expect(error.description).toBe('Invalid data error: "mobilePhone" is required');
    });
  
    it('Error should be defined when userBillingInfo object don\'t have the mobilePhone.cc field', () => {
  
      const invalidUserBillingInfoschema = {
        acctID: "xpto",
        email: "carlos@email.com",
        billAddrCountry: "123",
        mobilePhone: {
          subscriber: "2389573234"
        },
      };
      
      const error = validateUserBillingInfoSchema(invalidUserBillingInfoschema);
  
      expect(error).toBeDefined();
      expect(error.code).toBe(401);
      expect(error.description).toBe('Invalid data error: "mobilePhone.cc" is required');
    });
  
    it('Error should be defined when userBillingInfo object don\'t have the mobilePhone.subscriber field', () => {
  
      const invalidUserBillingInfoschema = {
        acctID: "xpto",
        email: "carlos@email.com",
        billAddrCountry: "123",
        mobilePhone: {
          cc: "123"
        },
      };
      
      const error = validateUserBillingInfoSchema(invalidUserBillingInfoschema);
  
      expect(error).toBeDefined();
      expect(error.code).toBe(401);
      expect(error.description).toBe('Invalid data error: "mobilePhone.subscriber" is required');
    });
  });

  describe('Invalid data error cases', () => {
    it('Error should be defined when userBillingInfo object have invalid value for acctInfo.chAccAgeInd field', () => {
      const invalidUserBillingInfoschema = {
        acctID: "xpto",
        email: "carlos@email.com",
        billAddrCountry: "123",
        acctInfo: {
          chAccAgeInd: 'xpto',
        },
        mobilePhone: {
          // Cape Verd country code
          cc: "123",
          subscriber: "2389573234"
        },
      };

      const error = validateUserBillingInfoSchema(invalidUserBillingInfoschema);
  
      expect(error).toBeDefined();
      expect(error.code).toBe(401);
      expect(error.description).toBe('Invalid data error: \"acctInfo.chAccAgeInd\" must be one of [01, 02, 03, 04, 05]');
    });

    it('Error should be defined when userBillingInfo object have invalid value for acctInfo.chAccPwChangeInd field', () => {
      const invalidUserBillingInfoschema = {
        acctID: "xpto",
        email: "carlos@email.com",
        billAddrCountry: "123",
        acctInfo: {
          chAccPwChangeInd: 'xpto',
        },
        mobilePhone: {
          // Cape Verd country code
          cc: "123",
          subscriber: "2389573234"
        },
      };

      const error = validateUserBillingInfoSchema(invalidUserBillingInfoschema);
  
      expect(error).toBeDefined();
      expect(error.code).toBe(401);
      expect(error.description).toBe('Invalid data error: \"acctInfo.chAccPwChangeInd\" must be one of [01, 02, 03, 04, 05]');
    });

    it('Error should be defined when userBillingInfo object have invalid value for acctInfo.suspiciousAccActivity field', () => {
      const invalidUserBillingInfoschema = {
        acctID: "xpto",
        email: "carlos@email.com",
        billAddrCountry: "123",
        acctInfo: {
          suspiciousAccActivity: 'xpto',
        },
        mobilePhone: {
          // Cape Verd country code
          cc: "123",
          subscriber: "2389573234"
        },
      };

      const error = validateUserBillingInfoSchema(invalidUserBillingInfoschema);
  
      expect(error).toBeDefined();
      expect(error.code).toBe(401);
      expect(error.description).toBe('Invalid data error: \"acctInfo.suspiciousAccActivity\" must be one of [01, 02]');
    });

    it('Error should be defined when userBillingInfo object have invalid value for addrMatch field', () => {
      const invalidUserBillingInfoschema = {
        acctID: "xpto",
        email: "carlos@email.com",
        billAddrCountry: "123",
        addrMatch: 'xpto',
        mobilePhone: {
          // Cape Verd country code
          cc: "123",
          subscriber: "2389573234"
        },
      };

      const error = validateUserBillingInfoSchema(invalidUserBillingInfoschema);
  
      expect(error).toBeDefined();
      expect(error.code).toBe(401);
      expect(error.description).toBe('Invalid data error: \"addrMatch\" must be one of [N, Y]');
    });
  });
});
