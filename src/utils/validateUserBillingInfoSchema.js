const Joi = require('joi');
const { CHANGE_ACCOUNT_AGE, SUSPICIOUS_ACCOUNT_ACTIVITY, ADDRESS_MATCH } = require('../constants/userBillingInfoPropertyValues');

const _userBillingInfoSchema = Joi.object({
  acctID: Joi.string().required(),
  acctInfo: Joi.object({
    chAccAgeInd: Joi.string().valid(
      CHANGE_ACCOUNT_AGE.without_account,
      CHANGE_ACCOUNT_AGE.account_created_during_transaction,
      CHANGE_ACCOUNT_AGE.account_created_less_than_30_days,
      CHANGE_ACCOUNT_AGE.account_created_between_30_and_60_days,
      CHANGE_ACCOUNT_AGE.account_with_more_than_60_days,
    ),
    chAccChange: Joi.string(),
    chAccDate: Joi.string(),
    chAccPwChange: Joi.string(),
    chAccPwChangeInd: Joi.string().valid(
      CHANGE_ACCOUNT_AGE.without_account,
      CHANGE_ACCOUNT_AGE.account_created_during_transaction,
      CHANGE_ACCOUNT_AGE.account_created_less_than_30_days,
      CHANGE_ACCOUNT_AGE.account_created_between_30_and_60_days,
      CHANGE_ACCOUNT_AGE.account_with_more_than_60_days,
    ),
    suspiciousAccActivity: Joi.string().valid(
      SUSPICIOUS_ACCOUNT_ACTIVITY.none_suspect,
      SUSPICIOUS_ACCOUNT_ACTIVITY.suspect
    )
  }),

  email: Joi.string().email().required(),

  addrMatch: Joi.string().valid(
    ADDRESS_MATCH.no,
    ADDRESS_MATCH.yes
  ),
  billAddrCity: Joi.string(),
  billAddrCountry: Joi.string().required(),
  billAddrLine1: Joi.string(),
  billAddrLine2: Joi.string(),
  billAddrLine3: Joi.string(),
  billAddrPostCode: Joi.string(),
  billAddrState: Joi.string(),

  shipAddrCity: Joi.when('addrMatch', {
    is: ADDRESS_MATCH.yes,
    then: Joi.string().equal(Joi.ref('billAddrCity')),
    otherwise: Joi.string()
  }),
  shipAddrCountry: Joi.when('addrMatch', {
    is: ADDRESS_MATCH.yes,
    then: Joi.string().equal(Joi.ref('billAddrCountry')),
    otherwise: Joi.string()
  }),
  shipAddrLine1: Joi.when('addrMatch', {
    is: ADDRESS_MATCH.yes,
    then: Joi.string().equal(Joi.ref('billAddrLine1')),
    otherwise: Joi.string()
  }),
  shipAddrPostCode: Joi.when('addrMatch', {
    is: ADDRESS_MATCH.yes,
    then: Joi.string().equal(Joi.ref('billAddrPostCode')),
    otherwise: Joi.string()
  }),
  shipAddrState: Joi.when('addrMatch', {
    is: ADDRESS_MATCH.yes,
    then: Joi.string().equal(Joi.ref('billAddrState')),
    otherwise: Joi.string()
  }),

  workPhone: Joi.object({
    cc: Joi.string().required(),
    subscriber: Joi.string().required()
  }),

  mobilePhone: Joi.object({
    cc: Joi.string().required(),
    subscriber: Joi.string().required()
  }).required()
});

/**
 * Validates the user's billing information against a predefined schema
 *
 * @param {Object} userBillingInfo - An object containing the user's billing information
 * @returns {Object} - An object containing the properties `code` and `description` if validation fails, otherwise returns nothing
 */
const validateUserBillingInfoSchema = (userBillingInfo) => {
  const { error } = _userBillingInfoSchema.validate(userBillingInfo ? userBillingInfo : {});

  if (error) {
    return {
      code: 401,
      description: `Invalid data error: ${error.details
        .map(error => error.message)
        .join(', ')}`
    };
  }
}

module.exports = validateUserBillingInfoSchema;
