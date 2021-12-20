const Sisp = require('./index');

describe('index', () => {
  it('should be exported correctly', () => {
    const sisp = new Sisp({
      posID: 900512,
      posAutCode: '123456789ssA'
    });

    expect(sisp).toBeDefined();
  });
});
