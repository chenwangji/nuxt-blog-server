/**
 * 标签模型
 */

const mongoose = require('../mongodb').mongoose
const autoIncreatment = require('mongoose-auto-increment')
const mongoosePaginate = require('mongoose-paginate')

// 自增 ID 初始化
autoIncreatment.initialize(mongoose.connection)

const tagSchema = new mongoose.Schema({
  // 标签名称
  name: { type: String, required: true, validate: /\S+/ },

  // 标签描述
  descript: String,

  // 发布日期
  create_at: { type: Date, default: Date.now },

  // 最后修改日期
  update_at: { type: Date },

  // 排序
  sort: { type: Number, default: 0 }
})

// 翻页
tagSchema.plugin(mongoosePaginate)
tagSchema.plugin(autoIncreatment.plugin, {
  model: 'Tag',
  field: 'id',
  startAt: 1,
  incrementBy: 1
})

// 时间更新
tagSchema.pre('findOneAndUpdate', function (next) {
  this.findOneAndUpdate({}, { update_at: Date.now() })
  next()
})

const Tag = mongoose.model('Tag', tagSchema)
module.exports = Tag
