/**
 * 喜欢控制器
 */

const Article = require('../model/article.model')
const { handleSuccess, handleError } = require('../utils/handle')

class LikeController {
  // 添加
  static async postLike (ctx) {
    const { _id, type } = ctx.request.body

    if (!_id || ![0, 1].includes(Number(type))) {
      handleError({ ctx, message: '无效参数' })
      return false
    }

    // type 0-文章 1-评论
    const res = await Article
      .findById(_id)
      .catch(() => ctx.throw(500, '服务器内部错误'))

    if (res) {
      if (Number(type) === 0) res.meta.likes += 1
      else res.likes += 1
      const info = await res
        .save()
        .catch(() => ctx.throw(500, '服务器内部错误'))
      if (info) handleSuccess({ ctx, message: '操作成功' })
      else handleError({ ctx, message: '操作失败' })
    } else handleError({ ctx, message: '操作失败' })
  }
}

module.exports = LikeController
