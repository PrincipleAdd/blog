const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'blog-secret-key';

// 模拟 db 模块，避免测试依赖真实数据库
jest.mock('../src/models/db', () => {
  const mockBcrypt = require('bcryptjs');
  const passwordHash = mockBcrypt.hashSync('admin123', 10);
  const mockDb = {
    prepare: jest.fn().mockReturnValue({
      get: jest.fn((username) => {
        if (username === 'admin') {
          return { id: 1, username: 'admin', password_hash: passwordHash };
        }
        return undefined;
      })
    })
  };
  return { db: mockDb };
});

const { login, verifyToken, hashPassword } = require('../src/services/authService');

describe('认证服务 - authService', () => {
  describe('login()', () => {
    test('正确的用户名和密码应返回 token 和 expiresIn', () => {
      const result = login('admin', 'admin123');

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('expiresIn', 86400);
      expect(typeof result.token).toBe('string');

      // 验证 token 内容正确
      const decoded = jwt.verify(result.token, JWT_SECRET);
      expect(decoded.userId).toBe(1);
      expect(decoded.username).toBe('admin');
    });

    test('不存在的用户名应抛出错误', () => {
      expect(() => login('nonexistent', 'password')).toThrow('用户名或密码错误');
    });

    test('错误的密码应抛出错误', () => {
      expect(() => login('admin', 'wrongpassword')).toThrow('用户名或密码错误');
    });
  });

  describe('verifyToken()', () => {
    test('有效的 token 应返回 userId 和 username', () => {
      const token = jwt.sign({ userId: 1, username: 'admin' }, JWT_SECRET, { expiresIn: 86400 });
      const result = verifyToken(token);

      expect(result).toEqual({ userId: 1, username: 'admin' });
    });

    test('无效的 token 应抛出错误', () => {
      expect(() => verifyToken('invalid.token.here')).toThrow();
    });

    test('过期的 token 应抛出错误', () => {
      const token = jwt.sign({ userId: 1, username: 'admin' }, JWT_SECRET, { expiresIn: '-1s' });
      expect(() => verifyToken(token)).toThrow();
    });
  });

  describe('hashPassword()', () => {
    test('应返回 bcrypt 哈希字符串', () => {
      const hash = hashPassword('mypassword');

      expect(typeof hash).toBe('string');
      // bcrypt 哈希以 $2a$ 或 $2b$ 开头
      expect(hash).toMatch(/^\$2[ab]\$/);
    });

    test('哈希结果应能通过 bcrypt 验证', () => {
      const password = 'testpassword123';
      const hash = hashPassword(password);

      expect(bcrypt.compareSync(password, hash)).toBe(true);
    });

    test('不同密码应生成不同的哈希', () => {
      const hash1 = hashPassword('password1');
      const hash2 = hashPassword('password2');

      expect(hash1).not.toBe(hash2);
    });
  });
});
