/** 评论模型 */

const autoIncrement = require('mongoose-auto-increment')
const mongoosePaginate = require('mongoose-paginate')
const mongoose = require('../mongodb').mongoose

// 自增 ID 初始化
autoIncrement.initialize(mongoose.connection)

// 评论 schema
const commentSchema = new mongoose.Schema({
  // 评论所在的文章 _id, 0 代表系统留言板
  post_id: { type: Number, required: true },

  // pid, 0 代表默认发言
  pid: { type: Number, default: 0 },

  // 内容
  content: { type: String, required: true, validate: /\S+/ },

  // 被赞数
  likes: { type: Number, default: 0 },

  // ip
  ip: { type: String },

  // ip 物理地址
  city: { type: String },
  range: { type: String },
  country: { type: String },

  // 用户 ua
  agent: { type: String, validate: /\S+/ },

  // 评论产生者
  // author: {
  //   name: { type: String, required: true, validate: /\S+/ },
  //   email: { type: String, required: true, validate: /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/ },
  //   site: { type: String, validate: /^((https|http):\/\/)+[A-Za-z0-9]+\.[A-Za-z0-9]+[/=?%\-&_~`@[\]':+!]*([^<>""])*$/ }
  // },

  // 状态 0待审核 1通过 2不通过
  state: { type: Number, default: 1 },

  // 发布日期
  create_ate: { type: Date, default: Date.now },

  // 最后修改日期
  update_at: { type: Date }
})

// 翻页插件
commentSchema.plugin(mongoosePaginate)
// 自增 ID 插件
commentSchema.plugin(autoIncrement.plugin, {
  model: 'Comment',
  field: 'id',
  startAt: 1,
  incrementBy: 1
})

// 时间更新
commentSchema.pre('findOneAndUpdate', function (next) {
  this.findOneAndUpdate({}, { update_at: Date.now() })
  next()
})

const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment
