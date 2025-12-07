import Prisma from '@prisma/client';
const { PrismaClient } = Prisma;
const prisma = new PrismaClient();

//lấy tất cả giao dịch của người dùng
export const getTransactions = async (req, res) => {
    const userId = req.user.userId; //Lấy từ middleware
    try {
        const transactions = await prisma.transaction.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
        });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

//Tạo giao dịch mới
export const createTransaction = async (req, res) => {
    const userId = req.user.userId;
    const { title, amount, type, category, date } = req.body;
    try {
        const newTransaction = await prisma.transaction.create({
            data: { title, amount: parseFloat(amount), type, category, date: new Date(date), userId },
        });
        res.status(201).json(newTransaction);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};
