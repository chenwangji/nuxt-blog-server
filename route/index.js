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

  // 获取用户资料
  .get('/auth', controller.auth.getAuth)

  // 修改用户资料
  .put('/auth', controller.auth.putAuth)

  // 获取网站信息
  .get('/option', controller.option.getOption)

  // 更改网站信息
  .put('/option', controller.option.putOption)

module.exports = router
