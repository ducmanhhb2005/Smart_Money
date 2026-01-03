import React, {useState} from 'react'
import styles from './AiTestPage.module.css'
import * as api from '../../services/api';
import {Link} from 'react-router-dom';
const AiTestPage = () => {
    const [inputText, setInputText] = useState('Đi highland coffee với bạn bè hết 55k');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleAnalyze = async () => {
        if (!inputText.trim()) {
            setError('Vui lòng nhập văn bản để phân tích.');
            return;
        }
        setError('');
        setLoading(true);
        setResult(null);
        try {
            const {data} = await api.parseTextToTransaction(inputText);
            setResult(data.data);
        }
        catch (err) {
            setError(err.response?.data?.message || 'Đã xảy ra lỗi khi phân tích văn bản');
        } finally {
            setLoading(false);
        }
    }
        return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <header className={styles.header}>
                    <Link to="/dashboard" className={styles.backButton}>&larr; Quay lại Dashboard</Link>
                    <h1>Kiểm tra Tính năng Phân tích AI</h1>
                    <p>Nhập một câu mô tả chi tiêu và xem Gemini trích xuất thông tin.</p>
                </header>

                <div className={styles.inputSection}>
                    <textarea
                        rows="4"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="VD: Mua 2 ly trà sữa hết 70 nghìn đồng"
                    />
                    <button onClick={handleAnalyze} disabled={loading}>
                        {loading ? 'Đang phân tích...' : 'Phân tích bằng AI'}
                    </button>
                </div>

                {error && <p className={styles.error}>{error}</p>}

                {result && (
                    <div className={styles.resultSection}>
                        <h3>Kết quả phân tích:</h3>
                        <pre>
                            {JSON.stringify(result, null, 2)}
                        </pre>
                        <p className={styles.suggestion}>
                            Bạn có thể dùng kết quả này để tự động điền vào form "Thêm Giao dịch".
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
export default AiTestPage;