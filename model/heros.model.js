/**
 * 英雄榜模型
 */

const mongoose = require('../mongodb').mongoose
const autoIncrement = require('mongoose-auto-increment')
const mongoosePaginate = require('mongoose-paginate')

// 自增 id 初始化
autoIncrement.initialize(mongoose.connection)

// 留言模型
const herosSchema = new mongoose.Schema({
  // 名称
  name: { type: String },

  // 内容
  content: { type: String, required: true, validate: /\S+/ },

  // 状态
  state: { type: Number, default: 0 },

  // ip
  ip: { type: String },

  // ip 物理地址
  city: { type: String },
  range: { type: String },
  country: { type: String },

  // ua
  agent: { type: String, validate: /\S+/ },

  // 发布日期
  create_time: { type: Date, default: Date.now }
})

// 分页 + 自增ID插件
herosSchema.plugin(mongoosePaginate)
herosSchema.plugin(autoIncrement.plugin, {
  model: 'Heros',
  field: 'id',
  startAt: 1,
  incrementBy: 1
})

// 模型
const Heros = mongoose.model('Heros', herosSchema)

module.exports = Heros
