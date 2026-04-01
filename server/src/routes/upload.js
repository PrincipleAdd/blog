const express = require('express')
const path = require('path')
const fs = require('fs')
const authMiddleware = require('../middleware/auth')

const router = express.Router()

// 确保上传目录存在
const UPLOAD_DIR = path.join(__dirname, '../../uploads')
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

// POST /api/admin/upload - 上传图片（需认证）
// 接收 base64 或 multipart，返回图片 URL
router.post('/', authMiddleware, (req, res) => {
  try {
    const { base64, filename } = req.body
    if (!base64) return res.status(400).json({ error: '缺少图片数据' })

    // 解析 base64
    const matches = base64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/)
    if (!matches) return res.status(400).json({ error: '无效的图片格式' })

    const mimeType = matches[1]
    const data = matches[2]
    const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'png'
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const filePath = path.join(UPLOAD_DIR, name)

    fs.writeFileSync(filePath, Buffer.from(data, 'base64'))

    res.json({ url: `/uploads/${name}` })
  } catch (err) {
    console.error('上传失败:', err)
    res.status(500).json({ error: '上传失败' })
  }
})

module.exports = router
