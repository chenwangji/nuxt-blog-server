const argv = require('yargs').argv

exports.APP = {
  ROOT_PATH: '/api',
  LIMIT: 16,
  PORT: 8000
}

exports.MONGODB = {
  uri: `mongodb://127.0.0.1:${argv.dbport || '27017'}/my_blog`
  // username: argv.db_username || 'wangji',
  // password: argv.db_password || '123456'
}

exports.INFO = {
  name: 'nuxt-blog',
  version: '1.0.0',
  author: 'wangji',
  site: 'todo',
  powered: ['Vue', 'nuxt', 'Node', 'MongoDB', 'koa', 'Nginx']
}

exports.AUTH = {
  jwtTokenSecret: argv.auth_key || 'my_blog',
  defaultUsername: argv.auth_default_username || 'wangji',
  defaultPassword: argv.auth_default_password || '123456'
}

exports.QINIU = {
  accessKey: argv.qn_accessKey || 'Cl4Fwt0s4BCbM5EEVQNcwGELQWg4i_u79STasYHE',
  secretKey: argv.qn_secretKey || '7b_DfS6flXCeQTg8cHZ20skux3mn2G2TC_9NGIGH',
  bucket: argv.qn_bucket || 'nuxt-blog',
  origin: argv.qn_origin || 'http://nuxt-blog.u.qiniudn.com',
  uploadURL: 'http://up.qiniu.com/'
}
