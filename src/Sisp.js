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
};

module.exports = Sisp;
