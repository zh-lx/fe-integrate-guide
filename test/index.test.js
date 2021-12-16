const { add, sub } = require('../src/index');
const expect = require('chai').expect;

describe('测试', function () {
  it('加法', function () {
    const result = add(2, 3);
    expect(result).to.be.equal(5);
  });

  it('减法', function () {
    const result = sub(2, 3);
    expect(result).to.be.equal(-1);
  });
});
