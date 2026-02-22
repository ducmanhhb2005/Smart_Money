# SmartMoney - Ứng dụng Quản lý Tài chính Cá nhân

SmartMoney là một ứng dụng web giúp người dùng quản lý tài chính cá nhân một cách hiệu quả. Ứng dụng bao gồm các tính năng như theo dõi giao dịch, lập ngân sách, đặt mục tiêu tài chính và tích hợp AI để phân tích hóa đơn.

## Demo

Xem video demo: [https://www.youtube.com/watch?v=tJBZoheF_b4](https://www.youtube.com/watch?v=tJBZoheF_b4)

## Tính năng chính

- **Quản lý giao dịch**: Thêm, chỉnh sửa và xóa các giao dịch thu nhập và chi tiêu.
- **Lập ngân sách**: Tạo và theo dõi ngân sách cho các danh mục khác nhau.
- **Đặt mục tiêu**: Thiết lập và theo dõi tiến độ đạt được mục tiêu tài chính.
- **Phân tích AI**: Sử dụng AI để phân tích hóa đơn và tự động tạo giao dịch.
- **Biểu đồ thống kê**: Hiển thị biểu đồ trực quan về tài chính.
- **Xác thực người dùng**: Đăng ký, đăng nhập và bảo mật tài khoản.

## Công nghệ sử dụng

### Backend
- **Node.js** với **Express.js** cho server API
- **Prisma** làm ORM cho cơ sở dữ liệu MySQL
- **JWT** cho xác thực
- **bcryptjs** để mã hóa mật khẩu
- **Google Generative AI** cho phân tích AI
- **Multer** để xử lý upload file

### Frontend
- **React** với **Vite** cho build tool
- **React Router** cho routing
- **Axios** cho HTTP requests
- **Chart.js** và **React Chart.js 2** cho biểu đồ
- **ESLint** cho linting

### Cơ sở dữ liệu
- **MySQL** với **Prisma** schema

## Cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js (phiên bản 16 trở lên)
- MySQL
- npm hoặc yarn

### 1. Clone repository
```bash
git clone <repository-url>
cd SmartMoney
```

### 2. Cài đặt dependencies cho backend
```bash
cd backend
npm install
```

### 3. Cài đặt dependencies cho frontend
```bash
cd ../frontend
npm install
```

### 4. Thiết lập cơ sở dữ liệu
- Tạo một cơ sở dữ liệu MySQL mới
- Sao chép file `.env.example` thành `.env` trong thư mục `backend` và điền thông tin cơ sở dữ liệu:
  ```
  DATABASE_URL="mysql://username:password@localhost:3306/smartmoney"
  JWT_SECRET=your_jwt_secret
  GOOGLE_AI_API_KEY=your_google_ai_api_key
  ```

### 5. Chạy migration và seed dữ liệu
```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

### 6. Chạy backend
```bash
npm run dev
```
Backend sẽ chạy trên `http://localhost:3000` (hoặc port được cấu hình).

### 7. Chạy frontend
Mở terminal mới:
```bash
cd frontend
npm run dev
```
Frontend sẽ chạy trên `http://localhost:5173`.

### 8. Truy cập ứng dụng
Mở trình duyệt và truy cập `http://localhost:5173` để sử dụng ứng dụng.

## Cấu trúc dự án

```
SmartMoney/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.js
│   │   └── migrations/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── index.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── hooks/
│   │   └── App.jsx
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản mới
- `POST /api/auth/login` - Đăng nhập

### Transactions
- `GET /api/transactions` - Lấy danh sách giao dịch
- `POST /api/transactions` - Tạo giao dịch mới
- `PUT /api/transactions/:id` - Cập nhật giao dịch
- `DELETE /api/transactions/:id` - Xóa giao dịch

### Budgets
- `GET /api/budgets` - Lấy danh sách ngân sách
- `POST /api/budgets` - Tạo ngân sách mới
- `PUT /api/budgets/:id` - Cập nhật ngân sách
- `DELETE /api/budgets/:id` - Xóa ngân sách

### Goals
- `GET /api/goals` - Lấy danh sách mục tiêu
- `POST /api/goals` - Tạo mục tiêu mới
- `PUT /api/goals/:id` - Cập nhật mục tiêu
- `DELETE /api/goals/:id` - Xóa mục tiêu

### AI
- `POST /api/ai/analyze-receipt` - Phân tích hóa đơn bằng AI

