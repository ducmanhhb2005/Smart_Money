import Prisma from '@prisma/client';
const { PrismaClient } = Prisma;
const prisma = new PrismaClient();

export const createGoal = async (req, res) => {
    const userId = req.user.userId;
    const { name, targetAmount, deadline } = req.body;

    if (!name || !targetAmount) {
        return res.status(400).json({ message: "Vui lòng điền tên và số tiền mục tiêu" });
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
        res.status(500).json({ message: 'Lỗi server khi tạo mục tiêu' });
    }
};

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
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách mục tiêu' });
    }
};

export const updateGoal = async (req, res) => {
    const userId = req.user.userId;
    const goalId = parseInt(req.params.id);
    const { name, targetAmount, currentAmount, deadline } = req.body;
    
    try {
        const goal = await prisma.goal.findFirst({
            where: { id: goalId, userId: userId },
        });
        if (!goal) {
            return res.status(404).json({ message: "Không tìm thấy mục tiêu hoặc bạn không có quyền" });
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
        res.status(500).json({ message: 'Lỗi server khi cập nhật mục tiêu' });
    }
};

export const deleteGoal = async (req, res) => {
    const userId = req.user.userId;
    const goalId = parseInt(req.params.id);

    try {
        const goal = await prisma.goal.findFirst({
            where: { id: goalId, userId: userId },
        });
        if (!goal) {
            return res.status(404).json({ message: "Không tìm thấy mục tiêu hoặc bạn không có quyền" });
        }

        await prisma.goal.delete({ where: { id: goalId } });
        res.status(200).json({ message: "Đã xóa mục tiêu thành công" });
    } catch (error) {
        console.error("Lỗi khi xóa mục tiêu:", error);
        res.status(500).json({ message: 'Lỗi server khi xóa mục tiêu' });
    }
};
export const addSavingsToGoal = async (req, res) => {
    const userId = req.user.userId;
    const goalId = parseInt(req.params.id);
    const { amount, date } = req.body;

    if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: "Vui lòng nhập số tiền hợp lệ" });
    }

    try {
        const [updatedGoal, newTransaction] = await prisma.$transaction(async (tx) => {
            // Kiểm tra Goal
            const goal = await tx.goal.findFirst({
                where: { id: goalId, userId: userId },
            });
            if (!goal) throw new Error("Không tìm thấy mục tiêu");

            //Cập nhật Goal (Tăng currentAmount)
            const updated = await tx.goal.update({
                where: { id: goalId },
                data: { currentAmount: { increment: parseFloat(amount) } },
            });

            //Tạo Transaction (Loại EXPENSE)
            const transaction = await tx.transaction.create({
                data: {
                    title: `Tiết kiệm cho: ${goal.name}`,
                    amount: parseFloat(amount),
                    type: 'EXPENSE',
                    category: 'Tiết kiệm Mục tiêu', // Category cố định để AI lọc sau này
                    date: date ? new Date(date) : new Date(),
                    userId: userId,
                },
            });
            
            return [updated, transaction];
        });
        
        res.status(200).json({ message: "Thêm tiền tiết kiệm thành công!", data: updatedGoal });
    } catch (error) {
        console.error("Lỗi addSavingsToGoal:", error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};