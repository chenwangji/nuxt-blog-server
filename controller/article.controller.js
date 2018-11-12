/**
 * 文章控制器
 */

const Article = require('../model/article.model')
const { handleError, handleSuccess } = require('../utils/handle')

class ArticleControllser {
  // 获取文章列表
  static async getArts (ctx) {
    const {
      current_page = 1,
      page_size = 10,
      keyword = '',
      state = 1,
      publish = 1,
      tag,
      type,
      date,
      hot
    } = ctx.query

    // 过滤条件
    const options = {
      sort: { create_at: -1 },
      page: Number(current_page),
      limit: Number(page_size),
      populate: ['tag'],
      select: '-content'
    }

    // 参数
    const querys = {}

    // 关键词查询
    if (keyword) {
      const keywordReg = new RegExp(keyword)
      querys['$or'] = [
        { 'title': keywordReg },
        { 'content': keywordReg },
        { 'description': keywordReg }
      ]
    }

    // 按照 state 查询
    if (['1', '2'].includes(state)) {
      querys.state = state
    }

    // 按照公开程度查询
    if (['1', '2'].includes(publish)) {
      querys.publish = publish
    }

    // 按照类型程度查询
    if (['1', '2', '3'].includes(type)) {
      querys.type = type
    }

    // 按热度排行
    if (hot) {
      options.sort = {
        'meta.views': -1,
        'meta.likes': -1,
        'meta.comments': -1
      }
    }

    // 时间查询
    if (date) {
      const getDate = new Date(date)
      if (!Object.is(getDate.toString(), 'Invalid Date')) {
        querys.create_at = {
          '$gte': new Date((getDate / 1000 - 60 * 60 * 8) * 1000),
          '$lt': new Date((getDate / 1000 - 60 * 60 * 8) * 1000)
        }
      }
    }

    // 标签
    if (tag) {
      querys.tag = tag
    }

    // 查询
    const result = await Article
      .paginate(querys, options)
      .catch(e => ctx.throw(500, '服务内部错误'))
    if (result) {
      handleSuccess({
        ctx,
        result: {
          pagination: {
            total: result.total,
            current_page: result.page,
            total_page: result.pages,
            page_size: result.limit
          },
          list: result.docs
        },
        message: '列表数据获取成功'
      })
    } else handleError({ ctx, message: '获取列表数据失败' })
  }

  // 添加文章
  static async postArt (ctx) {
    const res = await new Article(ctx.request.body)
      .save()
      .catch(err => {
        console.log(err)
        ctx.throw(500, '服务器内部错误')
      })
    if (res) handleSuccess({ ctx, message: '添加文章成功' })
    else handleError({ ctx, message: '添加违章失败' })
  }

  // 修改文章状态
  static async patchArt (ctx) {
    const _id = ctx.params.id
    const { state, publish } = ctx.request.body

    const querys = {}

    if (state) querys.state = state
    if (publish) querys.publish = publish

    if (!_id) {
      handleError({ ctx, message: '无效参数' })
      return false
    }

    const res = await Article
      .findByIdAndUpdate(_id, querys)
      .catch(e => {
        console.log(e)
        ctx.throw(500, '服务器内部错误')
      })
    if (res) handleSuccess({ ctx, message: '更新文章状态成功' })
    else handleError({ ctx, message: '更新文章状态失败' })
  }
}

module.exports = ArticleControllser
