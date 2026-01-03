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
// Hàm helper để chuyển đổi buffer ảnh sang định dạng Gemini yêu cầu
function fileToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType
    },
  };
}
export const parseReceiptWithGemini = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Vui lòng upload một file ảnh hóa đơn.' });
    }

    try {
        // Sử dụng model có khả năng xử lý hình ảnh (multimodal)
        // Gemini 1.5 Flash là lựa chọn tuyệt vời vì nó nhanh và mạnh
        const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

        const prompt = `
            Analyze the following receipt image. Identify each individual item purchased.
            For each item, extract its name, and its final price (quantity * unit price).
            Based on the item name and the store name (if available), determine a suitable category from this list: "Ăn uống", "Thực phẩm", "Di chuyển", "Hóa đơn", "Giải trí", "Sức khỏe", "Mua sắm", "Khác".
            
            Return the result as a valid JSON object with a single key "transactions", which is an ARRAY of objects.
            Each object in the array must have these keys:
            - "title": string (name of the item).
            - "amount": number (the total price for that item).
            - "category": string (the determined category).
            - "type": string (this should always be "EXPENSE").

            Example output format: { "transactions": [{ "title": "...", "amount": ..., "category": "...", "type": "EXPENSE" }] }
            
            Do not include summary items like "Tiền hàng", "Tổng cộng", or "VAT". Only include actual purchased items.
            Return ONLY the JSON object.
        `;

        // Chuyển đổi file ảnh người dùng upload thành định dạng mà Gemini hiểu
        const generationConfig = { responseMimeType: "application/json" };
         const imagePart = { 
            inlineData: { 
                data: req.file.buffer.toString("base64"), 
                mimeType: req.file.mimetype 
            } 
        };
        const result = await model.generateContent([prompt, imagePart], { generationConfig });
        const response = await result.response;
        const jsonText = response.text();
        
        const parsedData = JSON.parse(jsonText.replace(/```json|```/g, '').trim());

        // Kiểm tra xem kết quả có đúng định dạng không
        if (!parsedData.transactions || !Array.isArray(parsedData.transactions)) {
            throw new Error("AI did not return the expected format ({\"transactions\": [...]}).");
        }

        res.status(200).json({
            message: "Phân tích hóa đơn thành công",
            // Trả về mảng transactions
            data: parsedData.transactions 
        });

    } catch (error) {
        console.error('Lỗi khi gọi Gemini (multimodal) API:', error);
        res.status(500).json({ message: 'Lỗi server khi phân tích hóa đơn.', error: error.message });
    }
};


