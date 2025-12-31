// backend/test-gemini.js

import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("LỖI: Không tìm thấy GEMINI_API_KEY trong file .env!");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function runTest() {
    console.log("==============================================");
    console.log("Bắt đầu kiểm tra kết nối đến Google Gemini...");
    console.log("==============================================");

    try {
        console.log("\n1. Đang thử gửi một prompt đơn giản...");
        
        // Chọn một model cụ thể để test. Nếu dòng này lỗi, API key có vấn đề.
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = "Viết 'Hello World' bằng tiếng Việt";
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("\n✅ KIỂM TRA THÀNH CÔNG!");
        console.log("   => Phản hồi từ Gemini:", text.trim());
        console.log("   => Điều này xác nhận API Key của bạn HỢP LỆ và có thể kết nối.");
        
        // Nếu muốn xem danh sách model (dù không cần thiết nữa), cách làm đúng là phải qua một API khác
        // nhưng cách test trực tiếp này hiệu quả hơn để xác định vấn đề.

    } catch (error) {
        console.error("\n❌ ĐÃ XẢY RA LỖI KẾT NỐI:");
        if (error.message.includes('API key not valid')) {
            console.error("   => Lỗi: API key không hợp lệ. Vui lòng kiểm tra lại key trong file .env hoặc tạo key mới.");
        } else if (error.message.includes('404 Not Found')) {
            console.error("   => Lỗi: Không tìm thấy model 'gemini-pro'. Điều này rất lạ, có thể API key của chị bị giới hạn.");
            console.error("   => GỢI Ý: Hãy thử tạo một API Key hoàn toàn mới.");
        } else {
             console.error("   => Lỗi chi tiết:", error.message);
        }
    } finally {
        console.log("\n==============================================");
        console.log("Kiểm tra hoàn tất.");
        console.log("==============================================");
    }
}

runTest();