'use strict'

const Koa = require('koa')
const http = require('http')
const config = require('./config')
const pkg = require('./package')
const koaBody = require('koa-body')
const helmet = require('koa-helmet')

const mongodb = require('./mongodb')
const router = require('./route')
const interceptor = require('./middlewares/interceptor')

const app = new Koa()

// database
mongodb.connect()

// middleware
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})
app.use(interceptor)

app.use(helmet())
app.use(koaBody({
  jsonLimit: '10mb',
  formLimit: '10mb',
  textLimit: '10mb'
}))

// 400 500
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (error) {
    console.log(error)
    ctx.body = { code: 0, message: '服务器内部错误' }
  }
  if (ctx.status === 404 || ctx.status === 405) {
    ctx.body = { code: 0, message: '无效的 api 请求' }
  }
})

// router
app
  .use(router.routes())
  .use(router.allowedMethods())

http.createServer(app.callback()).listen(config.APP.PORT, () => {
  console.log(`${pkg.name} run! port at ${config.APP.PORT}.`)
})
