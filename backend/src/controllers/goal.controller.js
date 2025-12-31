// backend/src/controllers/goal.controller.js
import Prisma from '@prisma/client';
const { PrismaClient } = Prisma;
const prisma = new PrismaClient();

// === TẠO MỤC TIÊU MỚI ===
export const createGoal = async (req, res) => {
    const userId = req.user.userId;
    const { name, targetAmount, deadline } = req.body;

    if (!name || !targetAmount) {
        return res.status(400).json({ message: "Vui lòng điền tên và số tiền mục tiêu." });
    }

    try {
        const newGoal = await prisma.goal.create({
            data: {
                name,
                targetAmount: parseFloat(targetAmount),
                deadline: deadline ? new Date(deadline) : null,
                user: { connect: { id: userId } },
            },
        });
        res.status(201).json(newGoal);
    } catch (error) {
        console.error("Lỗi khi tạo mục tiêu:", error);
        res.status(500).json({ message: 'Lỗi server khi tạo mục tiêu.' });
    }
};

// === LẤY TẤT CẢ MỤC TIÊU ===
export const getGoals = async (req, res) => {
    const userId = req.user.userId;
    try {
        const goals = await prisma.goal.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(goals);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách mục tiêu:", error);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách mục tiêu.' });
    }
};

// === CẬP NHẬT MỤC TIÊU ===
export const updateGoal = async (req, res) => {
    const userId = req.user.userId;
    const goalId = parseInt(req.params.id);
    const { name, targetAmount, currentAmount, deadline } = req.body;
    
    try {
        const goal = await prisma.goal.findFirst({
            where: { id: goalId, userId: userId },
        });
        if (!goal) {
            return res.status(404).json({ message: "Không tìm thấy mục tiêu hoặc bạn không có quyền." });
        }

        // Xây dựng object data để cập nhật, xử lý kiểu dữ liệu
        const dataToUpdate = {};
        if (name) dataToUpdate.name = name;
        if (targetAmount) dataToUpdate.targetAmount = parseFloat(targetAmount);
        if (currentAmount != null) dataToUpdate.currentAmount = parseFloat(currentAmount);
        if (deadline) dataToUpdate.deadline = new Date(deadline);

        const updatedGoal = await prisma.goal.update({
            where: { id: goalId },
            data: dataToUpdate,
        });
        res.status(200).json(updatedGoal);
    } catch (error) {
         console.error("Lỗi khi cập nhật mục tiêu:", error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật mục tiêu.' });
    }
};

// === XÓA MỤC TIÊU ===
export const deleteGoal = async (req, res) => {
    const userId = req.user.userId;
    const goalId = parseInt(req.params.id);

    try {
        const goal = await prisma.goal.findFirst({
            where: { id: goalId, userId: userId },
        });
        if (!goal) {
            return res.status(404).json({ message: "Không tìm thấy mục tiêu hoặc bạn không có quyền." });
        }

        await prisma.goal.delete({ where: { id: goalId } });
        res.status(200).json({ message: "Đã xóa mục tiêu thành công." });
    } catch (error) {
        console.error("Lỗi khi xóa mục tiêu:", error);
        res.status(500).json({ message: 'Lỗi server khi xóa mục tiêu.' });
    }
};