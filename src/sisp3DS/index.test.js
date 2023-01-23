const Sisp = require('./index');

const Sisp3DS = require('./sisp');

describe('index', () => {
  it('should be exported correctly', () => {
    const sisp = new Sisp({
      posID: 900512,
      posAutCode: '123456789ssA',
      url: 'https://mc.vinti4net.cv/payments'
    });

    expect(sisp).toBeInstanceOf(Sisp3DS);
  });
});
