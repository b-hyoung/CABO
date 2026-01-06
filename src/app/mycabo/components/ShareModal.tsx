"use client";

import { useEffect, useState } from 'react';
import html2canvas from 'html2canvas';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    reportUrl: string;
    username: string;
}

const ShareModal = ({ isOpen, onClose, reportUrl, username }: Props) => {
    const [copyButtonText, setCopyButtonText] = useState('복사');
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            // Reset button text when modal is closed
            setTimeout(() => {
                setCopyButtonText('복사');
                setIsGeneratingImage(false);
            }, 300);
        }
    }, [isOpen]);
    
    if (!isOpen) return null;

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(reportUrl).then(() => {
            setCopyButtonText('✅ 복사됨!');
            setTimeout(() => setCopyButtonText('복사'), 2000);
        }).catch(err => {
            console.error('URL 복사에 실패했습니다.', err);
            alert('URL 복사에 실패했습니다.');
        });
    };

    const handleSaveAsImage = async () => {
        const reportElement = document.getElementById('report-content');
        if (!reportElement) {
            alert('리포트 요소를 찾을 수 없습니다.');
            return;
        }

        setIsGeneratingImage(true);

        try {
            const canvas = await html2canvas(reportElement, {
                useCORS: true, // For external images like avatars
                scale: 2, // Increase resolution
                backgroundColor: '#09090b' // Match dark theme background
            });
            const image = canvas.toDataURL('image/png');
            
            const link = document.createElement('a');
            link.href = image;
            link.download = `cabo-report-${username}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error('이미지 생성에 실패했습니다:', error);
            alert('이미지 생성에 실패했습니다.');
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const handlePrint = () => {
        onClose(); // Close the modal before printing
        setTimeout(() => window.print(), 100); // Give modal time to disappear
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in-fast no-print modal-backdrop-blur"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl w-full max-w-md p-8 m-4 transform animate-scale-in bg-opacity-95 dark:bg-opacity-95"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-black dark:text-white">리포트 공유하기</h2>
                    <button onClick={onClose} className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">&times;</button>
                </div>

                <div className="space-y-6">
                    {/* 1. URL Copy */}
                    <div>
                        <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">리포트 링크</label>
                        <div className="flex items-center mt-2">
                            <input 
                                type="text" 
                                readOnly 
                                value={reportUrl} 
                                className="w-full bg-zinc-100 dark:bg-zinc-700 text-black dark:text-white rounded-l-md p-2 border border-zinc-200 dark:border-zinc-600 focus:outline-none"
                            />
                            <button 
                                onClick={handleCopyUrl}
                                className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-r-md hover:bg-blue-700 transition-colors w-24"
                            >
                                {copyButtonText}
                            </button>
                        </div>
                    </div>

                    {/* 2. File Save Options */}
                    <div>
                        <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">파일로 저장</label>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                             <button 
                                onClick={handleSaveAsImage}
                                disabled={isGeneratingImage}
                                className="w-full bg-green-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-green-800 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isGeneratingImage ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        생성 중...
                                    </>
                                ) : (
                                    '이미지 파일 (PNG)'
                                )}
                            </button>
                            <button 
                                onClick={handlePrint}
                                className="w-full bg-gray-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                            >
                                PDF로 저장 (인쇄)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
