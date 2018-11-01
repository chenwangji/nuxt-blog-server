/**
 * 网站信息控制器
 */

const Option = require('../model/option.model')
const { handleSuccess, handleError } = require('../utils/handle')

class OptionController {
  // 获取信息
  static async getOption (ctx) {
    const option = await Option
      .findOne()
      .catch(err => {
        ctx.throw(500, '服务器内部错误')
        console.log(err)
      })
    if (option) handleSuccess({ ctx, result: option, message: '获取配置项成功' })
    else handleError({ ctx, message: '获取配置项失败' })
  }

  // 修改信息
  static async putOption (ctx) {
    const { _id } = ctx.request.body
    const option = await (_id
      ? Option.findByIdAndUpdate(_id, ctx.request.body, { new: true }).catch(() => ctx.throw(500, '服务器内部错误'))
      : new Option(ctx.request.body).save().catch(() => ctx.throw(500, '服务器内部错误'))
    )
    if (option) handleSuccess({ ctx, result: option._id, message: '修改配置项成功' })
    else handleError({ ctx, message: '修改配置项失败' })
  }
}

module.exports = OptionController
