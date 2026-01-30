import Prisma from '@prisma/client';
const { PrismaClient } = Prisma;
const prisma = new PrismaClient();


export const createTransaction = async (req, res) => {
    const userId = req.user.userId;
    const { title, amount, type, category, date } = req.body;

    if (!title || amount == null || !type || !category || !date) {
        return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin giao dịch" });
    }

    try {
        const newTransaction = await prisma.transaction.create({
            data: {
                title,
                amount: parseFloat(amount),
                type,
                category,
                date: new Date(date),
                user: { connect: { id: userId } }, // Kết nối với user thông qua ID
            },
        });
        res.status(201).json(newTransaction);
    } catch (error) {
        console.error("Lỗi khi tạo giao dịch:", error);
        res.status(500).json({ message: 'Lỗi server khi tạo giao dịch', error: error.message });
    }
};

export const getTransactions = async (req, res) => {
    const userId = req.user.userId;
    try {
        const transactions = await prisma.transaction.findMany({
            where: { userId: userId },
            orderBy: { date: 'desc' },
        });
        res.status(200).json(transactions);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách giao dịch:", error);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách giao dịch' });
    }
};

export const updateTransaction = async (req, res) => {
    const userId = req.user.userId;
    const transactionId = parseInt(req.params.id);

    if (isNaN(transactionId)) {
        return res.status(400).json({ message: "ID giao dịch không hợp lệ" });
    }

    try {
        const transaction = await prisma.transaction.findFirst({
            where: { id: transactionId, userId: userId },
        });

        if (!transaction) {
            return res.status(404).json({ message: "Không tìm thấy giao dịch hoặc bạn không có quyền chỉnh sửa" });
        }

        const updatedTransaction = await prisma.transaction.update({
            where: { id: transactionId },
            data: req.body, 
        });
        res.status(200).json(updatedTransaction);
    } catch (error) {
        console.error("Lỗi khi cập nhật giao dịch:", error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật giao dịch' });
    }
};


export const deleteTransaction = async (req, res) => {
    const userId = req.user.userId;
    const transactionId = parseInt(req.params.id);

    if (isNaN(transactionId)) {
        return res.status(400).json({ message: "ID giao dịch không hợp lệ" });
    }

    try {
        const transaction = await prisma.transaction.findFirst({
            where: { id: transactionId, userId: userId },
        });

        if (!transaction) {
            return res.status(404).json({ message: "Không tìm thấy giao dịch hoặc bạn không có quyền xóa" });
        }

        await prisma.transaction.delete({
            where: { id: transactionId },
        });
        
        res.status(200).json({ message: "Đã xóa giao dịch thành công" });
    } catch (error) {
        console.error("Lỗi khi xóa giao dịch:", error);
        res.status(500).json({ message: 'Lỗi server khi xóa giao dịch' });
    }
};