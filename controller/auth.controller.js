/**
 * 登录控制器
 */

const Auth = require('../model/auth.model')
const config = require('../config')

const {
  handleError,
  handleSuccess
} = require('../utils/handle')

const jwt = require('jsonwebtoken')
const crypto = require('crypto')

// md5 编码
const md5Incode = pwd => {
  return crypto
    .createHash('md5')
    .update(pwd)
    .digest('hex')
}

class AuthController {
  // 注册
  static async signUp (ctx) {
    const { username, password, name, slogan, gravatar } = ctx.request.body
    const auth = await Auth
      .findOne({ username })
      .catch(err => {
        console.log(err)
        ctx.throw(500, '服务器错误')
      })
    console.log(auth)
    if (auth) handleError({ ctx, message: '账户已存在' })
    else {
      const res = new Auth({
        name, username, slogan, gravatar, password: md5Incode(password)
      })
        .save()
        .catch(() => ctx.throw(500, '服务器内部错误'))

      if (res) {
        handleSuccess({ ctx, message: '注册成功' })
      } else {
        handleError({ ctx, message: '注册失败' })
      }
    }
  }
  // 登录
  static async login (ctx) {
    const { username, password } = ctx.request.body

    const auth = await Auth
      .findOne({ username })
      .catch(err => {
        console.log(err)
        ctx.throw(500, '服务器内部错误')
      })
    if (auth) {
      if (auth.password === md5Incode(password)) {
        const token = jwt.sign({
          name: auth.name,
          password: auth.password,
          exp: Math.floor(Date.now() / 1000 + 60 * 60 * 24 * 7)
        }, config.AUTH.jwtTokenSecret)

        handleSuccess({ ctx, result: { token, lifeTime: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) }, message: '登陆成功' })
      } else handleError({ ctx, message: '密码错误！' })
    } else handleError({ ctx, message: '账户不存在' })
  }

  // 获取用户信息
  static async getAuth (ctx) {
    const auth = await Auth
      .findOne({}, 'name username slogan gravatar')
      .catch(err => {
        ctx.throw(500, '服务器内部错误')
        console.log(err)
      })
    if (auth) {
      handleSuccess({ ctx, result: auth, message: '获取用户资料成功' })
    } else handleError({ ctx, message: '获取用户资料失败' })
  }

  // 修改用户信息
  static async putAuth (ctx) {
    const { _id, name, username, slogan, gravatar, oldPassword, newPassword } = ctx.request.body
    const _auth = await Auth
      .findOne({}, '_id name slogan gravatar password')
      .catch(err => {
        console.log(err)
        ctx.throw(500, '服务器内部错误')
      })
    if (_auth) {
      if (_auth.password !== md5Incode(oldPassword)) handleError({ ctx, message: '原密码错误' })
      else {
        const password = newPassword === '' ? oldPassword : newPassword
        const auth = await Auth
          .findByIdAndUpdate(
            _id,
            { _id, name, username, slogan, gravatar, password: md5Incode(password) },
            { new: true }
          )
          .catch(err => {
            console.log(err)
            ctx.throw(500, '服务器内部错误')
          })
        if (auth) handleSuccess({ ctx, result: auth, message: '修改用户资料成功' })
        else handleError({ ctx, message: '修改用户资料失败' })
      }
    } else handleError({ ctx, message: '修改用户资料失败' })
  }
}

module.exports = AuthController
