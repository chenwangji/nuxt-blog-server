/** 评论控制器 */
const { handleError, handleSuccess } = require('../utils/handle')
const Comment = require('../model/comment.model')
// const Article = require('../model/article.model')
const geoip = require('geoip-lite')

class CommentController {
  // 获取评论列表
  static async getComments (ctx) {
    let {
      sort = -1,
      current_page = 1,
      page_size = 20,
      keyword = '',
      post_id,
      state
    } = ctx.query

    sort = Number(sort)

    // 过滤条件
    const options = {
      sort: { _id: sort },
      page: Number(current_page),
      limit: Number(page_size)
    }

    // 排序字段
    if ([1, -1].includes(sort)) {
      options.sort = { _id: sort }
    } else if (Object.is(sort, 2)) {
      options.sort({ likes: -1 })
    }

    // 查询参数
    let querys = {}

    // 状态查询
    if (state && ['0', '1', '2'].includes(state)) {
      querys.state = state
    }

    // 关键词查询
    if (keyword) {
      const keywordReg = new RegExp(keyword)
      querys['$or'] = [
        { 'content': keywordReg },
        { 'author.name': keywordReg },
        { 'author.email': keywordReg }
      ]
    }

    // 通过 post_id 查询
    if (!Object.is(post_id, undefined)) {
      querys.post_id = post_id
    }

    // 获取评论列表
    const comments = await Comment
      .paginate(querys, options)
      .catch(() => ctx.throw(500, '服务器内部错错'))

    if (comments) {
      handleSuccess({
        ctx,
        message: '评论列表获取成功',
        result: {
          pagination: {
            total: comments.total,
            current_page: options.page,
            total_page: comments.pages,
            per_page: options.limit
          },
          data: comments.docs
        }
      })
    } else handleError({ ctx, message: '获取评论列表失败' })
  }

  // 发布评论
  static async postComment (ctx) {
    const { body: comment } = ctx.request

    // 获取 ip 地址及物理地址
    const ip = (ctx.req.headers['x-forwarded-for'] ||
      ctx.req.headers['x-real-ip'] ||
      ctx.req.connection.remoteAddress ||
      ctx.req.socket.remoteAddress ||
      ctx.req.connection.socket.remoteAddress ||
      ctx.req.ip ||
      ctx.req.ips[0]).replace('::ffff:', '')
    comment.ip = ip
    comment.agent = ctx.headers['user-agent'] || comment.agent
    console.log(comment)

    const ipLocation = geoip.lookup(ip)

    if (ipLocation) {
      comment.city = ipLocation.city
      comment.range = ipLocation.range
      comment.country = ipLocation.country
    }

    comment.likes = 0
    // comment.author = JSON.parse(comment.author)

    const res = await new Comment(comment)
      .save()
      .catch(() => ctx.throw(500, '服务器内部错误'))

    if (res) {
      handleSuccess({ ctx, result: res, message: '评论发布成功' })
    } else handleError({ ctx, message: '评论发布失败' })
  }
}

module.exports = CommentController
