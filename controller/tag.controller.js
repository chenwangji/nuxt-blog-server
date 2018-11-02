/** 标签控制器 */

const Tag = require('../model/tag.model')
const Article = require('../model/article.model')
const { handleError, handleSuccess } = require('../utils/handle')

class TagController {
  // 获取标签列表
  static async getTags (ctx) {
    const { current_page = 1, page_size = 18, keyword = '' } = ctx.query

    // 过滤条件
    const options = {
      sort: { sort: 1 },
      page: Number(current_page),
      limit: Number(page_size)
    }

    // 参数
    const querys = { name: new RegExp(keyword) }

    const tag = await Tag
      .paginate(querys, options)
      .catch(e => {
        ctx.throw(500, '服务器内部错误')
        console.log(e)
      })
    if (tag) {
      let tagClone = JSON.parse(JSON.stringify(tag))

      // 查找文章中的标签聚合
      let $match = {}

      const article = await Article.aggregate([
        { $match },
        { $unwind: '$tag' },
        { $group: {
          _id: '$tag',
          num_tutorial: { $sum: 1 }
        } }
      ])
      if (article) {
        tagClone.docs.forEach(t => {
          const found = article.find(c => String(c._id) === String(t._id))
          t.count = found ? found.num_tutorial : 0
        })
        handleSuccess({
          ctx,
          result: {
            pagination: {
              total: tagClone.total,
              current_page: tagClone.page,
              total_page: tagClone.page,
              page_size: tagClone.limit
            },
            list: tagClone.docs
          },
          message: '列表数据获取成功！'
        })
      } else handleError({ ctx, message: '获取标签列表失败' })
    } else handleError({ ctx, message: '获取标签列表失败' })
  }

  // 添加标签
  static async postTag (ctx) {
    const { name, descript } = ctx.request.body

    const res = await Tag
      .find({ name })
      .catch(e => handleError({ ctx, message: '服务器内部错误' }))
    if (res && res.length !== 0) {
      handleError({ ctx, message: '已存在相同标签名' })
      return false
    }

    const tag = await new Tag({ name, descript })
      .save()
      .catch(e => handleError({ ctx, message: '服务器内部错误' }))

    if (tag) handleSuccess({ ctx, message: '添加标签成功', result: tag })
    else handleError({ ctx, message: '添加标签失败' })
  }

  // 修改标签
  static async putTag (ctx) {
    const _id = ctx.params.id
    const { name, descript } = ctx.request.body
    if (!_id) {
      handleError({ ctx, message: '无效参数' })
      return false
    }
    const res = await Tag
      .findByIdAndUpdate(_id, { name, descript }, { new: true })
      .catch(e => ctx.throw(500, '服务器内部错误'))
    if (res) handleSuccess({ ctx, message: '修改标签成功' })
    else handleError({ ctx, message: '修改标签失败' })
  }

  // 删除标签
  static async deleteTag (ctx) {
    const _id = ctx.params.id
    if (!_id) {
      handleError({ ctx, message: '无效参数' })
      return false
    }
    const res = await Tag
      .findByIdAndRemove(_id)
      .catch(e => ctx.throw(500, '服务器内部错误'))
    if (res) handleSuccess({ ctx, message: '删除标签成功' })
    else handleError({ ctx, message: '删除数据失败' })
  }

  // 标签排序
  static async patchTag (ctx) {
    const { ids } = ctx.request.body
    try {
      for (let i = 0; i < ids.length; i++) {
        await Tag
          .findByIdAndUpdate(ids[i], { sort: i + 1 })
          .catch(e => ctx.throw(500, '服务器内部错误'))
      }
    } catch (e) {
      console.log(e)
      handleError({ ctx, message: '排序成功' })
    }
  }
}

module.exports = TagController
