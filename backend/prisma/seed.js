// backend/prisma/seed.js

// Dùng cách import này để tương thích với cả ESM và CJS
import Prisma from '@prisma/client';
const { PrismaClient } = Prisma;
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu quá trình seeding...');

  // --- 1. Tạo User mẫu ---
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user1 = await prisma.user.upsert({
    where: { email: 'testuser@gmail.com' }, // Tìm user bằng email để tránh tạo trùng lặp
    update: {}, // Nếu đã tồn tại, không làm gì cả
    create: {
      email: 'testuser@gmail.com',
      username: 'testuser',
      password: hashedPassword,
    },
  });
  console.log(`Đã tạo hoặc cập nhật user: ${user1.username}`);

  // --- 2. Tạo các Giao dịch mẫu cho User 1 ---
  // Prisma sẽ tự động kết nối các giao dịch này với user1 thông qua `userId`
  
  await prisma.transaction.createMany({
    data: [
      {
        title: 'Lương tháng 5',
        amount: 15000000,
        type: 'INCOME',
        category: 'Lương',
        date: new Date('2024-05-25'),
        userId: user1.id,
      },
      {
        title: 'Tiền thuê nhà',
        amount: 3500000,
        type: 'EXPENSE',
        category: 'Nhà ở',
        date: new Date('2024-06-01'),
        userId: user1.id,
      },
      {
        title: 'Ăn trưa với đồng nghiệp',
        amount: 150000,
        type: 'EXPENSE',
        category: 'Ăn uống',
        date: new Date('2024-06-02'),
        userId: user1.id,
      },
      {
        title: 'Đi siêu thị',
        amount: 850000,
        type: 'EXPENSE',
        category: 'Mua sắm',
        date: new Date('2024-06-03'),
        userId: user1.id,
      },
      {
        title: 'Tiền thưởng dự án',
        amount: 2000000,
        type: 'INCOME',
        category: 'Thưởng',
        date: new Date('2024-06-05'),
        userId: user1.id,
      },
    ],
    skipDuplicates: true, // Bỏ qua nếu có lỗi trùng lặp (ví dụ: chạy seed nhiều lần)
  });
  console.log('Đã tạo các giao dịch mẫu.');

  // --- 3. Tạo Budget mẫu ---
  await prisma.budget.create({
    data: {
      category: 'Ăn uống',
      amount: 3000000,
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-06-30'),
      userId: user1.id,
    }
  });
  console.log('Đã tạo ngân sách mẫu.');
  
  // --- 4. Tạo Goal mẫu ---
  await prisma.goal.create({
    data: {
      name: 'Mua điện thoại mới',
      targetAmount: 20000000,
      currentAmount: 5000000,
      deadline: new Date('2024-12-31'),
      userId: user1.id,
    }
  });
  console.log('Đã tạo mục tiêu mẫu.');

  console.log('Seeding hoàn tất!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });