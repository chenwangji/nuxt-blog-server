/** 评论控制器 */
const { handleError, handleSuccess } = require('../utils/handle')
const Comment = require('../model/comment.model')
const Article = require('../model/article.model')
const geoip = require('geoip-lite')

// 更新文章评论数
const updateArticleCommentCount = (post_ids = []) => {
  post_ids = [...new Set(post_ids)].filter(id => !!id)
  if (post_ids.length) {
    Comment.aggregate([
      { $match: { state: 1, post_id: { $in: post_ids } } },
      { $group: { _id: '$post_id', num_tutorial: { $sum: 1 } } }
    ])
      .then(counts => {
        if (counts.length === 0) {
          Article.update({ id: post_ids[0] }, { $set: { 'meta.comments': 0 } })
            .then(info => {})
            .catch(err => console.log(err))
        } else {
          counts.forEach(count => {
            Article.update(
              { id: count._id },
              { $set: { 'meta.comments': count.num_tutorial } }
            )
              .then(info => {
                // console.log('评论聚合更新成功', info);
              })
              .catch(err => {
                console.warn('评论聚合更新失败', err)
              })
          })
        }
      })
      .catch(err => {
        console.warn('更新评论count聚合数据前，查询失败', err)
      })
  }
}

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
        { content: keywordReg },
        { 'author.name': keywordReg },
        { 'author.email': keywordReg }
      ]
    }

    // 通过 post_id 查询
    if (!Object.is(post_id, undefined)) {
      querys.post_id = post_id
    }

    // 获取评论列表
    const comments = await Comment.paginate(querys, options).catch(() =>
      ctx.throw(500, '服务器内部错错')
    )

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
    const ip = (
      ctx.req.headers['x-forwarded-for'] ||
      ctx.req.headers['x-real-ip'] ||
      ctx.req.connection.remoteAddress ||
      ctx.req.socket.remoteAddress ||
      ctx.req.connection.socket.remoteAddress ||
      ctx.req.ip ||
      ctx.req.ips[0]
    ).replace('::ffff:', '')
    comment.ip = ip
    comment.agent = ctx.headers['user-agent'] || comment.agent

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
      updateArticleCommentCount([res.post_id])
    } else handleError({ ctx, message: '评论发布失败' })
  }

  // 删除评论
  static async deleteComment (ctx) {
    const _id = ctx.params.id

    // const post_id = Array.of(Number(ctx.query.post_ids))

    const res = await Comment.findByIdAndRemove(_id).catch(() =>
      ctx.throw(500, '服务器内部错误')
    )

    if (res) {
      handleSuccess({ ctx, message: '评论删除成功' })
    } else handleError({ ctx, message: '评论删除失败' })
  }

  // 修改评论
  static async putComment (ctx) {
    const _id = ctx.params.id
    let { post_ids, state, author } = ctx.request.body

    if (Object.is(state, undefined) || Object.is(post_ids, undefined)) {
      ctx.throw(401, '参数无效')
      return
    }

    // if (author) author = JSON.parse(author)

    post_ids = Array.of(Number(post_ids))

    const res = await Comment.findByIdAndUpdate(_id, {
      ...ctx.request.body,
      author
    }).catch(() => ctx.throw(500, '服务器内部错误'))

    if (res) {
      handleSuccess({ ctx, message: '评论状态修改成功' })
    } else handleError({ ctx, message: '评论状态修改失败' })
  }
}

module.exports = CommentController
