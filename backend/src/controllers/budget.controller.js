// backend/src/controllers/budget.controller.js
import Prisma from '@prisma/client';
const { PrismaClient } = Prisma;
const prisma = new PrismaClient();

// === TẠO NGÂN SÁCH MỚI ===
export const createBudget = async (req, res) => {
    const userId = req.user.userId;
    const { category, amount, startDate, endDate } = req.body;

    if (!category || !amount || !startDate || !endDate) {
        return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin ngân sách." });
    }

    try {
        const newBudget = await prisma.budget.create({
            data: {
                category,
                amount: parseFloat(amount),
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                user: { connect: { id: userId } },
            },
        });
        res.status(201).json(newBudget);
    } catch (error) {
        console.error("Lỗi khi tạo ngân sách:", error);
        res.status(500).json({ message: 'Lỗi server khi tạo ngân sách.' });
    }
};

// === LẤY TẤT CẢ NGÂN SÁCH ===
export const getBudgets = async (req, res) => {
    const userId = req.user.userId;
    try {
        const budgets = await prisma.budget.findMany({
            where: { userId: userId },
            orderBy: { startDate: 'desc' },
        });
        res.status(200).json(budgets);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách ngân sách:", error);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách ngân sách.' });
    }
};

// === CẬP NHẬT NGÂN SÁCH ===
 export const updateBudget = async (req, res) => {
     const userId = req.user.userId;
     const budgetId = parseInt(req.params.id);
    const { category, amount, startDate, endDate } = req.body;
     try {
         const budget = await prisma.budget.findFirst({
             where: { id: budgetId, userId: userId },
         });

         if (!budget) {
             return res.status(404).json({ message: "Không tìm thấy ngân sách hoặc bạn không có quyền." });
         }

         const dataToUpdate = {};
        if (category) dataToUpdate.category = category;
        if (amount) dataToUpdate.amount = parseFloat(amount); // Chuyển đổi sang số
        if (startDate) dataToUpdate.startDate = new Date(startDate); // Chuyển đổi sang ngày
        if (endDate) dataToUpdate.endDate = new Date(endDate); // Chuyển đổi sang ngày
         const updatedBudget = await prisma.budget.update({
             where: { id: budgetId },
             data: dataToUpdate,
         });
         res.status(200).json(updatedBudget);
     } catch (error) {
         res.status(500).json({ message: 'Lỗi server khi cập nhật ngân sách.' });
     }
 };

 // === XÓA NGÂN SÁCH ===
 export const deleteBudget = async (req, res) => {
     const userId = req.user.userId;
     const budgetId = parseInt(req.params.id);

     try {
         const budget = await prisma.budget.findFirst({
             where: { id: budgetId, userId: userId },
         });

         if (!budget) {
             return res.status(404).json({ message: "Không tìm thấy ngân sách hoặc bạn không có quyền." });
         }

         await prisma.budget.delete({ where: { id: budgetId } });
         res.status(200).json({ message: "Đã xóa ngân sách thành công." });
     } catch (error) {
         res.status(500).json({ message: 'Lỗi server khi xóa ngân sách.' });
     }
 };