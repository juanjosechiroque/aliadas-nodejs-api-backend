const { isProductionEnv } = require('../config');

const ACCESS_TOKEN_COOKIE = 'aliadas_access_token';

function baseCookieOptions() {
  if (isProductionEnv) {
    return {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    };
  }
  return {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
  };
}

function setAuthCookie(res, token, maxAgeMs) {
  res.cookie(ACCESS_TOKEN_COOKIE, token, {
    ...baseCookieOptions(),
    maxAge: maxAgeMs,
  });
}

function clearAuthCookie(res) {
  const opts = baseCookieOptions();
  res.clearCookie(ACCESS_TOKEN_COOKIE, {
    path: opts.path,
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
  });
}

module.exports = {
  ACCESS_TOKEN_COOKIE,
  setAuthCookie,
  clearAuthCookie,
};
