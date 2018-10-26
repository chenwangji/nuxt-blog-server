const config = require('../config')
const controller = require('../controller')
const Router = require('koa-router')

const router = new Router({
  prefix: config.APP.ROOT_PATH
})

// api
router
  .get('/', (ctx, next) => {
    ctx.response.body = config.INFO
  })

  // 注册
  .post('/signUp', controller.auth.signUp)

  // 登录
  .post('/login', controller.auth.login)

module.exports = router
