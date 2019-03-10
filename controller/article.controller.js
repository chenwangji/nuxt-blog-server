/**
 * 文章控制器
 */

const Article = require('../model/article.model')
const { handleError, handleSuccess } = require('../utils/handle')
const authIsVerified = require('../utils/auth')

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

    // 前台请求需要写死为公开状态和发布状态
    if (!authIsVerified(ctx.request)) {
      querys.state = 2
      querys.publish = 2
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
      .catch(() => ctx.throw(500, '服务器内部错误'))
    if (res) handleSuccess({ ctx, message: '更新文章状态成功' })
    else handleError({ ctx, message: '更新文章状态失败' })
  }

  // 删除文章
  static async deleteArt (ctx) {
    const _id = ctx.params.id

    if (!_id) {
      handleError({ ctx, message: '无效参数' })
      return false
    }

    const res = await Article
      .findByIdAndRemove(_id)
      .catch(() => ctx.throw(500, '服务器内部错误'))
    if (res) handleSuccess({ ctx, message: '删除文章成功' })
    else handleError({ ctx, message: '删除文章失败' })
  }

  // 根据文章 id 获取内容
  static async getArt (ctx) {
    const _id = ctx.params.id

    if (!_id) {
      handleError({ ctx, message: '无效参数' })
      return false
    }

    const res = await Article
      .findById(_id)
      .populate('tag')
      .catch(() => ctx.throw(500, '服务器内部错误'))
    if (res) {
      // 每次请求，views 自增1
      res.meta.views += 1
      res.save()
      handleSuccess({ ctx, message: '文章获取成功', result: res })
    } else handleError({ ctx, message: '获取文章失败' })
  }

  // 修改文章
  static async putArt (ctx) {
    const _id = ctx.params.id

    const { title, keyword } = ctx.request.body

    delete ctx.request.body.create_at
    delete ctx.request.body.update_at
    delete ctx.request.body.meta

    if (!_id) {
      handleError({ ctx, message: '无效参数' })
      return false
    }

    if (!title || !keyword) {
      handleError({ ctx, message: 'title 和 keyword 必填' })
      return false
    }

    const res = await Article
      .findByIdAndUpdate(_id, ctx.request.body)
      .catch(() => ctx.throw(500, '服务器内部错误'))

    if (res) handleSuccess({ ctx, message: '更新文章成功' })
    else handleError({ ctx, message: '更新文章失败' })
  }

  // 文章归档
  static async getAllArts (ctx) {
    // const current_page = 1
    // const page_size = 10000

    // 过滤条件
    // const options = {
    //   sort: { create_at: -1 },
    //   page: current_page,
    //   limit: page_size,
    //   populate: ['tag'],
    //   select: '-content'
    // }

    // 参数
    const querys = {
      state: 2,
      publish: 2
    }

    const article = await Article.aggregate([
      { $match: querys },
      { $project: {
        year: { $year: '$create_at' },
        month: { $month: '$create_at' },
        title: 1,
        create_at: 1
      } },
      {
        $group: {
          _id: {
            year: '$year',
            month: '$month'
          },
          article: {
            $push: {
              title: '$title',
              _id: '$_id',
              create_at: '$create_at'
            }
          }
        }
      }
    ])
    if (article) {
      let yearList = [...new Set(article.map(item => item._id.year))]
        .sort((a, b) => b - a)
        .map(item => {
          let monthList = []
          article.forEach(n => {
            // 同一年
            if (n._id.year === item) {
              monthList.push({ month: n._id.month, articleList: n.article.reverse() })
            }
          })
          return { year: item, monthList: monthList.sort((a, b) => b.month - a.month) }
        })

      handleSuccess({ ctx, result: yearList, message: '获取内容成功' })
    } else handleError({ ctx, message: '获取内容失败' })
  }
}

module.exports = ArticleControllser
