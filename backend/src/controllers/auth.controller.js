import Prisma from '@prisma/client';
const { PrismaClient } = Prisma;
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.js';

const prisma = new PrismaClient();

export const register = async (req, res) => {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }

    try {
        const existingUser = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
        if (existingUser) {
            return res.status(409).json({ message: 'Email hoặc username đã tồn tại' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, username, password: hashedPassword },
        });

        res.status(201).json({ message: 'Đăng ký thành công!', userId: user.id });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};
//Tạo ra token mỗi khi đăng nhập để tránh kẻ gian lấy được APi chỉnh sửa dữ liệu tùy ý
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        }

        const token = generateToken({ userId: user.id, username: user.username });
        
        // trả về cả token và thông tin user trừ password
        const { password: _, ...userWithoutPassword } = user;
        res.json({ message: 'Đăng nhập thành công!', token, user: userWithoutPassword });
        //status:200

    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};
