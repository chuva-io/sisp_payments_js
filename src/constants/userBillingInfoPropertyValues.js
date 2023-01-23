const CHANGE_ACCOUNT_AGE = {
  without_account: '01',
  account_created_during_transaction: '02',
  account_created_less_than_30_days: '03',
  account_created_between_30_and_60_days: '04',
  account_with_more_than_60_days: '05'
};

const SUSPICIOUS_ACCOUNT_ACTIVITY = {
  none_suspect: '01',
  suspect: '02'
};

const ADDRESS_MATCH = {
  yes: 'Y',
  no: 'N'
}

module.exports = {
  CHANGE_ACCOUNT_AGE,
  SUSPICIOUS_ACCOUNT_ACTIVITY,
  ADDRESS_MATCH
};
