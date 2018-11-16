const config = require('../config')
const controller = require('../controller')
const Router = require('koa-router')

const router = new Router({
  prefix: config.APP.ROOT_PATH
})

// api
router
  /**
   * auth
   */
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

  /**
   * options
   */
  // 获取网站信息
  .get('/option', controller.option.getOption)

  // 更改网站信息
  .put('/option', controller.option.putOption)

  /**
   * qiniu
   */
  // 获取七牛 token
  .get('/qiniu', controller.qiniu.getQN)

  /**
   * tag
   */
  // 获取标签列表
  .get('/tag', controller.tag.getTags)

  // 添加标签
  .post('/tag', controller.tag.postTag)

  // 修改标签
  .put('/tag/:id', controller.tag.putTag)

  // 删除标签
  .delete('/tag/:id', controller.tag.deleteTag)

  // 标签排序
  .patch('/tag', controller.tag.patchTag)

  /**
   * article
   */
  // 文章列表
  .get('/article', controller.article.getArts)

  // 添加文章
  .post('/article', controller.article.postArt)

  // 修改文章状态
  .patch('/article/:id', controller.article.patchArt)

  // 删除文章
  .delete('/article/:id', controller.article.deleteArt)

  // 获取文章
  .get('/article/:id', controller.article.getArt)

  // 修改文章
  .put('/article/:id', controller.article.putArt)

  /**
   * 喜欢
   */
  .post('/like', controller.like.postLike)

module.exports = router
