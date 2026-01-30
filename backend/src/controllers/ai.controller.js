import { GoogleGenerativeAI } from "@google/generative-ai";
import Prisma from '@prisma/client';
const { PrismaClient } = Prisma;
const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


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
        return res.status(400).json({ message: 'Vui lòng upload một file ảnh hóa đơn' });
    }

    try {
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

/**
 * Thuật toán phát hiện các giao dịch lặp lại hàng tháng
 * transactions - Danh sách tất cả giao dịch
 * category - Tên danh mục cần kiểm tra
 * @returns {boolean}
 */
function detectRecurringTransactions(transactions, category) {
    if (category === 'Tiết kiệm Mục tiêu') return false; 

    const categoryTransactions = transactions
        .filter(t => t.category === category && t.type === 'EXPENSE')
        .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (categoryTransactions.length < 2) return false;

    let recurringPairs = 0;
    for (let i = 0; i < categoryTransactions.length - 1; i++) {
        const currentTrx = categoryTransactions[i];
        
        // Tìm giao dịch ở tháng tiếp theo
        const nextMonthTrx = categoryTransactions.find(t => {
            const daysDiff = (t.date.getTime() - currentTrx.date.getTime()) / (1000 * 60 * 60 * 24);
            return daysDiff >= 28 && daysDiff <= 32;
        });

        if (nextMonthTrx) {
            const amountDiff = Math.abs(nextMonthTrx.amount - currentTrx.amount) / currentTrx.amount;
            if (amountDiff <= 0.1) { // Chênh lệch không quá 10%
                recurringPairs++;
            }
        }
    }
    
    // Nếu có ít nhất 1 cặp giao dịch lặp lại thì coi là recurring
    return recurringPairs > 0;
}
export const generateSavingPlan = async (req, res) => {
    const userId = req.user.userId;
    const { goalId, baseMonths } = req.body;

    if (!goalId) {
        return res.status(400).json({ message: "Vui lòng cung cấp ID của mục tiêu" });
    }
    if (!baseMonths || !Array.isArray(baseMonths) || baseMonths.length === 0) {
        return res.status(400).json({ message: "Vui lòng chọn ít nhất một tháng để làm cơ sở phân tích" });
    }

    try {
        // Giai đoạn 1: Thu thập và tiền xử lý dữ liệu

        const goal = await prisma.goal.findFirst({ where: { id: goalId, userId } });
        if (!goal) return res.status(404).json({ message: "Không tìm thấy mục tiêu" });

        const allTransactions = await prisma.transaction.findMany({ where: { userId } });
        
        const transactions = allTransactions.filter(t => {
            const monthYear = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`;
            return baseMonths.includes(monthYear);
        });

        const validTransactions = transactions.filter(t => t.category !== 'Tiết kiệm Mục tiêu');

        if (validTransactions.length < 5) {
            return res.status(400).json({ message: "Các tháng bạn chọn có quá ít dữ liệu để phân tích" });
        }

        const divisor = baseMonths.length; // Số tháng thực tế được chọn để chia trung bình
        let analysisMessagePrefix = `Dựa trên phân tích chi tiêu của ${divisor} tháng bạn đã chọn`;
        
        const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
        const avg_monthly_income = totalIncome / divisor;

        const allCategories = new Set(validTransactions.filter(t => t.type === 'EXPENSE').map(t => t.category));
        
        const analyzedCategories = Array.from(allCategories).map(category => {
            const categoryTransactions = validTransactions.filter(t => t.category === category && t.type === 'EXPENSE');
           
            const total_spend_period = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
            const amounts = categoryTransactions.map(t => t.amount);
            
            const avg_spend = total_spend_period / divisor;
            const avg_frequency = categoryTransactions.length / divisor;

            const mean = amounts.length > 0 ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 0;
            const variance = amounts.length > 0 ? amounts.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / amounts.length : 0;
            const volatility = Math.sqrt(variance);
            
            const is_recurring = detectRecurringTransactions(allTransactions, category); // Dùng allTransactions để tìm kiếm lặp lại tốt hơn
            
            return { name: category, avg_spend, avg_frequency, volatility, is_recurring };
        });

        // Giai đoạn 2: Thuật toán chấm điểm linh hoạt
        const categoryFlexibilityMap = { "Giải trí": 0.9, "Mua sắm": 0.8, "Quà tặng & Từ thiện": 0.7, "Ăn uống": 0.6, "Di chuyển": 0.4, "Gia đình": 0.3, "Sức khỏe": 0.2, "Giáo dục": 0.1, "Hóa đơn": 0.0, "Khác": 0.5 };
        const w_base = 0.6, w_volatility = 0.4;
        
        const max_volatility = Math.max(1, ...analyzedCategories.map(c => c.volatility));

        const scoredCategories = analyzedCategories.map(cat => {
            if (cat.is_recurring) return { ...cat, flexibility_score: 0.0 };
            
            const base_score = categoryFlexibilityMap[cat.name] ?? 0.5;
            const normalized_volatility = max_volatility > 0 ? (cat.volatility / max_volatility) : 0;
            const final_score = (base_score * w_base) + (normalized_volatility * w_volatility);
            
            return { ...cat, flexibility_score: Math.max(0, Math.min(final_score, 1)) };
        });
        
        // Giai đoạn 3: Thuật toán tối ưu hóa phân bổ
        const months_left = goal.deadline ? Math.max(1, ((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24 * 30))) : 12; // Mặc định 12 tháng nếu không có deadline
        const savings_needed = Math.max(0, goal.targetAmount - goal.currentAmount);
        const monthly_saving_target = savings_needed / months_left;
        
        const total_avg_spend = scoredCategories.reduce((sum, cat) => sum + cat.avg_spend, 0);
        const projected_saving = avg_monthly_income - total_avg_spend;
        const shortfall = monthly_saving_target - projected_saving;

        if (shortfall <= 0) {
            const surplus = Math.abs(shortfall);
            const monthsToGoal = (projected_saving > 0) ? Math.max(1, Math.ceil(savings_needed / projected_saving)) : Infinity;

            let analysis = `Chúc mừng! Với thói quen chi tiêu hiện tại (tiết kiệm khoảng ${projected_saving.toLocaleString('vi-VN')} đ/tháng), bạn đang trên đà đạt được mục tiêu "${goal.name}".`;
            if (isFinite(monthsToGoal)) {
                 analysis += ` Bạn có thể đạt được mục tiêu trong khoảng ${monthsToGoal} tháng, sớm hơn dự kiến!`;
            }
        
            const recommended_budgets = scoredCategories.map(cat => ({ category: cat.name, amount: cat.avg_spend }));
            
            return res.status(200).json({
                analysis: analysis,
                suggestions: [{
                    category: "Gợi ý",
                    action: `Bạn đang dư ra khoảng ${surplus.toLocaleString('vi-VN')} đ mỗi tháng so với kế hoạch. Hãy cân nhắc đầu tư khoản này hoặc đặt thêm một mục tiêu mới!`,
                    savingEstimate: 0
                }],
                recommended_budgets
            });
        }
        
        const candidates = scoredCategories.filter(c => c.flexibility_score > 0);
        const total_contribution_score = candidates.reduce((sum, cat) => sum + (cat.avg_spend * cat.flexibility_score), 0);

        if (total_contribution_score <= 0) {
            return res.status(400).json({ message: "Không thể tạo kế hoạch vì không có hạng mục nào có thể cắt giảm" });
        }

        const suggestions = [];
        const recommended_budgets = [];
        
        scoredCategories.forEach(cat => {
            let recommended_cut = 0;
            if (cat.flexibility_score > 0) {
                const contribution_score = cat.avg_spend * cat.flexibility_score;
                const proportion = contribution_score / total_contribution_score;
                recommended_cut = shortfall * proportion;
            }

            if (recommended_cut > 10000) {
                suggestions.push({
                    category: cat.name,
                    action: `Đề xuất cắt giảm khoảng ${Math.round(recommended_cut/10000)*10000}đ.`, // Làm tròn đến 10,000đ
                    savingEstimate: recommended_cut
                });
            }

            recommended_budgets.push({
                category: cat.name,
                amount: Math.max(0, cat.avg_spend - recommended_cut)
            });
        });

        //Giai đoạn 4: Tạo phản hồi cuối cùng
        const finalPlan = {
            analysis: `${analysisMessagePrefix} Để đạt được mục tiêu "${goal.name}", bạn cần tiết kiệm thêm khoảng ${Math.round(shortfall/10000)*10000}đ mỗi tháng. Kế hoạch đề xuất như sau:`,
            suggestions: suggestions.sort((a,b) => b.savingEstimate - a.savingEstimate),
            recommended_budgets: recommended_budgets
        };
        
        res.status(200).json(finalPlan);

    } catch (error) {
        console.error("Lỗi khi tạo kế hoạch tiết kiệm:", error);
        res.status(500).json({ message: 'Lỗi server khi tạo kế hoạch tiết kiệm', error: error.message });
    }
};
