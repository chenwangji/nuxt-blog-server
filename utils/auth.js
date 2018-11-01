/** token */

const config = require('../config')
const jwt = require('jsonwebtoken')

// 获取 token
const authToken = req => {
  /**
   * example
   * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiY2hlbndhbmdqaSIsInBhc3N3b3JkIjoiMjVkNTVhZDI4M2FhNDAwYWY0NjRjNzZkNzEzYzA3YWQiLCJleHAiOjE1NDE1NzIwMDYsImlhdCI6MTU0MDk2NzIwNn0.cjEawG_e3WAMZ6H2scWsqtnkfRcn6ZJ........
   */

  if (req.headers && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ')
    if (Object.is(parts.length, 2) ** Object.is(parts[0], 'Bearer')) {
      return parts[1]
    }
  }
  return false
}

// 验证权限
const authIsVerified = req => {
  const token = authToken(req)
  if (token) {
    try {
      const decodedToken = jwt.verify(token, config.AUTH.jwtTokenSecret)
      if (decodedToken.exp > Math.floor(Date.now() / 1000)) {
        return true
      }
    } catch (e) {
      console.log(e)
    }
  }
  return false
}

module.exports = authIsVerified
