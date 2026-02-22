import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './AddByReceiptPage.module.css';
import * as api from '../../services/api';
import EditableTransactionRow from './EditableTransactionRow/EditableTransactionRow';
const AddByReceiptPage = () => {
    const navigate = useNavigate();

    //quản lý file và các bước xử lý
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [transactions, setTransactions] = useState([]); 
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    //useRef để có thể click vào input file vô hình
    const fileInputRef = useRef(null);

    //người dùng chọn file ảnh
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            setError('');
            setTransactions([]);

            // Tạo URL tạm thời để xem trước ảnh
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setSelectedFile(null);
            setPreviewUrl(null);
        }
    };

    //Kích hoạt input file khi người dùng click vào vùng upload
    const handleUploadBoxClick = () => {
        fileInputRef.current.click();
    };

    // Xử lý khi người dùng nhấn nút Phân tích
    const handleAnalyzeReceipt = async () => {
        if (!selectedFile) {
            setError('Vui lòng chọn một file ảnh hóa đơn.');
            return;
        }
        setIsLoading(true);
        setError('');
        setTransactions([]);

        try {
            // gửi ảnh và nhận về JSON đã phân tích
            const response = await api.parseReceiptWithAI(selectedFile);
            setTransactions(response.data.data);
            
        } catch (err) {
            setError(err.response?.data?.message || 'Xảy ra lỗi trong quá trình phân tích');
        } finally {
            setIsLoading(false);
        }
    };
    //Cập nhật một giao dịch trong danh sách
    const handleUpdateTransaction = (index, updatedTransaction) => {
        const newTransactions = [...transactions];
        newTransactions[index] = updatedTransaction;
        setTransactions(newTransactions);
    };

    //Xóa một giao dịch khỏi danh sách
    const handleDeleteTransaction = (index) => {
        setTransactions(transactions.filter((_, i) => i !== index));
    };
    // Xử lý khi người dùng xác nhận và lưu giao dịch
    const handleConfirmAllTransactions = async () => {
        if (transactions.length === 0) return;
        
        setIsLoading(true); //Hiển thị loading cho nút xác nhận
        try {
            //gửi tất cả các request tạo giao dịch song song
            await Promise.all(
                transactions.map(t => api.createTransaction({
                    ...t,
                    date: new Date().toISOString(), // Dùng chung 1 ngày
                }))
            );
            
            alert(`Đã thêm thành công ${transactions.length} giao dịch từ hóa đơn!`);
            navigate('/dashboard', { state: { refresh: true } });

        } catch (err) {
            setError('Lưu một hoặc nhiều giao dịch thất bại. Vui lòng thử lại');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <header className={styles.header}>
                    <Link to="/dashboard" className={styles.backButton}>&larr; Quay lại Dashboard</Link>
                    <h1>Thêm giao dịch bằng hóa đơn</h1>
                    <p>Tải lên ảnh hóa đơn của bạn, AI sẽ tự động điền thông tin</p>
                </header>

                {/* Vùng Upload */}
                <div className={styles.uploadArea}>
                    <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className={styles.fileInput}
                    />
                    {previewUrl ? (
                        <div className={styles.previewContainer} onClick={handleUploadBoxClick}>
                            <img src={previewUrl} alt="Xem trước hóa đơn" className={styles.previewImage} />
                            <div className={styles.changeImageOverlay}>Nhấn để đổi ảnh khác</div>
                        </div>
                    ) : (
                        <div className={styles.uploadBox} onClick={handleUploadBoxClick}>
                            <span>📷</span>
                            <p>Nhấn để chọn hoặc kéo thả ảnh vào đây</p>
                        </div>
                    )}
                </div>

                {/* Nút Phân tích */}
                {selectedFile && (
                    <button onClick={handleAnalyzeReceipt} disabled={isLoading} className={styles.analyzeButton}>
                        {isLoading ? 'AI đang xử lý...' : 'Bắt đầu phân tích'}
                    </button>
                )}

                {/* Hiển thị lỗi */}
                {error && <p className={styles.error}>{error}</p>}
                
                {/* Vùng kết quả */}
                {transactions.length > 0 && (
                    <div className={styles.resultContainer}>
                        <h4>AI đề xuất các giao dịch sau:</h4>
                        <div className={styles.editableList}>
                            {transactions.map((t, index) => (
                                <EditableTransactionRow
                                    key={index} // Dùng index làm key ở đây là tạm ổn vì danh sách không sắp xếp lại
                                    index={index}
                                    transaction={t}
                                    onUpdate={handleUpdateTransaction}
                                    onDelete={handleDeleteTransaction}
                                />
                            ))}
                        </div>
                        <p className={styles.note}>Kiểm tra lại thông tin trước khi xác nhận.</p>
                        <button onClick={handleConfirmAllTransactions} disabled={isLoading} className={styles.confirmButton}>
                            {isLoading ? 'Đang lưu...' : `Xác nhận & Lưu ${transactions.length} Giao dịch`}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddByReceiptPage;