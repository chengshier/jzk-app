const assert = require('assert');

const { startSinocareAuthorization } = require('../libs/sinocareAuthorization');

async function testRequestsServerGeneratedAuthorizationUrlAndOpensWebView() {
  const calls = [];
  await startSinocareAuthorization({
    prepareAuthorization: payload => {
      calls.push(['prepare', payload]);
      return Promise.resolve({ data: { authorizationUrl: 'https://sinocare.example/authorize?token=safe' } });
    },
    navigateTo: options => calls.push(['navigate', options])
  });

  assert.deepStrictEqual(calls[0], ['prepare', { redirectUrl: '/pages/jk/health/device' }]);
  assert.deepStrictEqual(calls[1], ['navigate', {
    url: '/pages/users/web_page/index?webUel=' + encodeURIComponent('https://sinocare.example/authorize?token=safe') + '&title=' + encodeURIComponent('三诺CGM授权')
  }]);
}

async function testRejectsWhenServerDoesNotReturnAuthorizationUrl() {
  await assert.rejects(() => startSinocareAuthorization({
    prepareAuthorization: () => Promise.resolve({ data: {} }),
    navigateTo: () => assert.fail('navigation must not happen')
  }), /授权链接未返回/);
}

Promise.resolve()
  .then(testRequestsServerGeneratedAuthorizationUrlAndOpensWebView)
  .then(testRejectsWhenServerDoesNotReturnAuthorizationUrl)
  .then(() => console.log('sinocareAuthorization tests passed'))
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
