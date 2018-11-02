// const authIsVerified = require('../utils/auth')

module.exports = async (ctx, next) => {
  /**
   * cors
   */
  const allowedOrigins = [
    // 白名单
  ]
  const { origin = '' } = ctx.request
  if (allowedOrigins.includes(origin) || origin.includes('localhost')) {
    // 不起作用 --- ？？？
    // ctx.set('Access-Control-Allow-Origin', origin)
    ctx.set('Access-Control-Allow-Origin', '*')
  }

  ctx.set({
    'Access-Control-Allow-Headers': 'Authorization, Origin, No-Cache, X-Requested-With, If-Modified-Since, Pragma, Last-Modified, Cache-Control, Expires, Content-Type, X-E4M-With',
    'Access-Control-Allow-Methods': 'PUT,PATCH,POST,GET,DELETE,OPTIONS',
    'Access-Control-Max-Age': '1728000',
    'Content-Type': 'application/json;charset=utf-8',
    'X-Powered-By': 'my_blog 1.0.0'
  })

  // OPTIONS
  if (ctx.request.method === 'OPTIONS') {
    ctx.status = 200
    return false
  }

  /**
   * 排除不需要验证的请求
   */
  const { url, method } = ctx.request
  const isLogin = Object.is(url, '/api/login') && Object.is(method, 'POST')
  const isPostAuth = Object.is(url, '/api/auth') && Object.is(method, 'POST')
  if (isLogin || isPostAuth) {
    await next()
    return false
  }

  /**
   * 拦截所有非管理员的请求
   */
  // if (!authIsVerified(ctx.request) && !Object.is(ctx.request.method, 'GET')) {
  //   ctx.throw(401, { code: -2, message: '身份验证失败！' })
  //   return false
  // }

  await next()
}
