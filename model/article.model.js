/** 文章模型 */

const mongoose = require('../mongodb').mongoose
const autoIncreatment = require('mongoose-auto-increment')
const mongoosePaginate = require('mongoose-paginate')

// 自增 id 初始化
autoIncreatment.initialize(mongoose.connection)

const articleSchema = new mongoose.Schema({
  // 文章标题
  title: { type: String, requiredL: true },

  // 关键字
  keyword: { type: String, required: true },

  // 描述
  descript: { type: String, required: false },

  // 标签
  tag: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],

  // 内容
  content: { type: String, required: true },

  // 状态 1-发布 2-草稿
  state: { type: Number, default: 1 },

  // 文章公开状态 1-公开 2-私密
  pubulish: { type: Number, default: 1 },

  // 缩略图
  thumb: { type: Number },

  // 文章分类 1-code 2-think 3-funk
  type: { type: Number },

  // 发布日期
  create_at: { type: Date, default: Date.now },

  // 最后修改日期
  update_at: { type: Date, default: Date.now },

  // 其他元信息
  meta: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 }
  }
})

// 转化为普通 Js 对象
articleSchema.set('toObject', { getters: true })

// 翻页和自增ID
articleSchema.plugin(mongoosePaginate)
articleSchema.plugin(autoIncreatment.plugin, {
  model: 'Article',
  field: 'id',
  startAt: 1,
  incrementBy: 1
})

// 时间更新
articleSchema.pre('findOneAndUpdate', function (next) {
  this.findOneAndUpdate({}, { update_at: Date.now() })
})

// 文章模型
const Article = mongoose.model('Article', articleSchema)

module.exports = Article
