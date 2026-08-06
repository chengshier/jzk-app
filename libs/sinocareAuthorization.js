const HEALTH_DEVICE_REDIRECT_URL = '/pages/jk/health/device';

function authorizationPayload(response) {
  return response && response.data ? response.data : (response || {});
}

function startSinocareAuthorization({ prepareAuthorization, navigateTo }) {
  return prepareAuthorization({ redirectUrl: HEALTH_DEVICE_REDIRECT_URL }).then(response => {
    const authorizationUrl = authorizationPayload(response).authorizationUrl;
    if (!authorizationUrl) {
      throw new Error('授权链接未返回');
    }
    return navigateTo({
      url: '/pages/users/web_page/index?webUel=' + encodeURIComponent(authorizationUrl) + '&title=' + encodeURIComponent('三诺CGM授权')
    });
  });
}

module.exports = { startSinocareAuthorization };
