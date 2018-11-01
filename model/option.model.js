/**
 * 网站元数据模型
 */

const mongoose = require('../mongodb').mongoose

const optionSchema = new mongoose.Schema({
  // 网站标题
  title: { type: String, required: true },

  // 网站副标题
  sub_title: { type: String, required: true },

  // 关键字
  keyword: { type: String },

  // 网站描述
  descript: { type: String },

  // 站点地址
  url: { type: String, required: true },

  // 网站官邮
  email: String,

  // 备案号
  icp: String,

  // 其他
  meta: {
    likes: { type: Number, default: 0 }
  }
})

const Option = mongoose.model('Option', optionSchema)
module.exports = Option
