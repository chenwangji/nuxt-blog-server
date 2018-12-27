/**
 * 留言控制器
 */

const { handleError, handleSuccess } = require('../utils/handle')
const Heros = require('../model/heros.model')
const geoip = require('geoip-lite')
const authIsVerified = require('../utils/auth')

class HerosController {
  static async getHeros (ctx) {
    let {
      current_page = 1,
      page_size = 12,
      keyword = '',
      state = ''
    } = ctx.query

    // 过滤条件
    const options = {
      sort: { _id: +1 },
      page: Number(current_page),
      limit: Number(page_size)
    }

    // 查询参数
    const querys = { name: new RegExp(keyword) }

    // 审核状态查询
    if (['1', '2', '3'].includes(state)) {
      querys.state = Number(state)
    }

    // 前台请求只能请求 state === 1 的留言
    if (!authIsVerified(ctx.request)) querys.state = 1

    // 查询
    const result = await Heros.paginate(querys, options).catch(() =>
      ctx.throw(500, '服务器内部错误')
    )

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
        message: '列表数据获取成功！'
      })
    } else handleError({ ctx, message: '列表数据获取失败！' })
  }

  // 发布留言
  static async postHero (ctx) {
    const { body: hero } = ctx.request

    // 获取ip地址以及物理地理地址
    const ip = (
      ctx.req.headers['x-forwarded-for'] ||
      ctx.req.headers['x-real-ip'] ||
      ctx.req.connection.remoteAddress ||
      ctx.req.socket.remoteAddress ||
      ctx.req.connection.socket.remoteAddress ||
      ctx.req.ip ||
      ctx.req.ips[0]
    ).replace('::ffff:', '')

    hero.state = 0
    hero.ip = ip
    hero.agent = ctx.headers['user-agent'] || hero.agent

    const ip_location = geoip.lookup(ip)

    if (ip_location) {
      hero.city = ip_location.city
      hero.range = ip_location.range
      hero.country = ip_location.country
    }

    const res = await new Heros(hero)
      .save()
      .catch(() => ctx.throw(500, '服务器内部错误'))

    if (res) {
      handleSuccess({ ctx, message: '数据提交审核成功，请耐心等待' })
    } else handleError({ ctx, message: '提交数据失败' })
  }

  // 删除留言
  static async deleteHero (ctx) {
    const _id = ctx.params.id

    if (!_id) {
      handleError({ ctx, message: '无效参数' })
      return false
    }

    const res = await Heros
      .findOneAndRemove(_id)
      .catch(e => ctx.throw(500, '服务器内部错误'))

    if (res) handleSuccess({ ctx, message: '删除数据成功' })
    else handleError({ ctx, message: '删除数据失败' })
  }

  static async patchHero (ctx) {
    const { state, _id } = ctx.request.body

    if (!state || !_id) {
      ctx.throw(401, '参数无效')
      return false
    }

    const res = await Heros
      .update({ _id }, { state })
      .catch(e => ctx.throw(500, '服务器内部错误'))

    if (res) handleSuccess({ ctx, message: '修改状态成功' })
    else handleError({ ctx, message: '修改状态失败' })
  }
}

module.exports = HerosController
