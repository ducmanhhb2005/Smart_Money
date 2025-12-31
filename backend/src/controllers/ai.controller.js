import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Hàm này nhận một đoạn text thô (từ OCR/voice sau này) và phân tích nó
export const parseTextToTransaction = async (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ message: "Vui lòng cung cấp đoạn text để phân tích." });
    }

    try {
        // Lấy model gemini-pro
        const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

        // Cải tiến prompt để Gemini chắc chắn trả về JSON
        const generationConfig = {
            responseMimeType: "application/json",
        };

        const prompt = `
            From the following Vietnamese text, extract transaction details.
            Text: "${text}"
            
            Extract these fields: 
            - "title": string (the name of the transaction),
            - "amount": number (the numeric value of the money),
            - "category": string (one of: "Ăn uống", "Mua sắm", "Di chuyển", "Hóa đơn", "Giải trí", "Lương", "Sức khỏe", "Giáo dục", "Khác").
            
            Return ONLY the JSON object.
        `;

        // Sử dụng configuration mới
        const result = await model.generateContent(prompt, generationConfig);
        const response = await result.response;
       let jsonString = response.text();
        
        // Tìm vị trí bắt đầu của JSON '{' và kết thúc '}'
        const startIndex = jsonString.indexOf('{');
        const endIndex = jsonString.lastIndexOf('}');
        
        if (startIndex === -1 || endIndex === -1) {
            throw new Error("Gemini did not return a valid JSON object.");
        }
        
        // Cắt lấy chuỗi JSON thuần túy
        jsonString = jsonString.substring(startIndex, endIndex + 1);
        
        const transactionData = JSON.parse(jsonString);
        res.status(200).json({
            message: "Phân tích text thành công",
            data: transactionData
        });

    } catch (error) {
        console.error('Lỗi khi gọi Gemini API:', error);
        res.status(500).json({ message: 'Lỗi server khi phân tích text.', error: error.message });
    }
};