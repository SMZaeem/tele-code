import React, { useState, useRef } from 'react'; // No useEffect needed now
import axios from 'axios';
import { FiX, FiUploadCloud, FiDownload, FiExternalLink, FiTrash2 } from 'react-icons/fi';

// 1. Receive files and setFiles from props
const FileManagerModal = ({ roomId, socket, onClose, files, setFiles }) => {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    // (Deleted the useEffect block completely)

    const handleDelete = (fileKey) => {
        if (confirm("Are you sure you want to delete this file for everyone?")) {
            socket.emit('delete-file', { roomId, fileKey });
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);

        try {
            // Get Presigned URL
            const { data } = await axios.post(`${BACKEND_URL}/api/files/upload-url`, {
                fileName: file.name,
                fileType: file.type,
                roomId: roomId
            });

            const { uploadUrl, fileKey, publicUrl } = data;

            // Upload to S3
            await axios.put(uploadUrl, file, {
                headers: { 'Content-Type': file.type }
            });

            const fileData = {
                name: file.name,
                url: publicUrl,
                key: fileKey,
                size: (file.size / 1024).toFixed(2) + ' KB',
                type: file.type
            };

            // Notify Server
            socket.emit('file-uploaded', { roomId, fileData });
            
            // 2. Update PARENT state (Optimistic update for yourself)
            setFiles(prev => [...prev, fileData]);

        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
            <div className="bg-dark-800 w-full max-w-2xl rounded-xl shadow-2xl border border-dark-700 flex flex-col max-h-[80vh]">
                
                <div className="flex justify-between items-center p-6 border-b border-dark-700">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                         Room Files ({files.length})
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                        <FiX size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {files.length === 0 ? (
                        <div className="text-center text-gray-500 py-10">
                            No files shared yet.
                        </div>
                    ) : (
                        files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-dark-900 p-4 rounded-lg border border-dark-700">
                                <div>
                                    <p className="text-white font-medium truncate max-w-[300px]">{file.name}</p>
                                    <p className="text-sm text-gray-500">{file.size}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-blue-400 transition" title="View">
                                        <FiExternalLink size={20} />
                                    </a>
                                    {/* For simple download, we use the same link */}
                                    <a href={file.url} download className="p-2 text-gray-400 hover:text-green-400 transition" title="Download">
                                         <FiDownload size={20} />
                                    </a>
                                    <button 
                                        onClick={() => handleDelete(file.key)}
                                        className="p-2 text-gray-400 hover:text-red-500 transition hover:bg-red-500/10 rounded-full" 
                                        title="Delete for Everyone">
                                        <FiTrash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 border-t border-dark-700 bg-dark-900/50 rounded-b-xl">
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileUpload} 
                        className="hidden" 
                        disabled={isUploading}
                    />
                    <button 
                        onClick={() => fileInputRef.current.click()}
                        disabled={isUploading}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all
                            ${isUploading ? 'bg-dark-700 text-gray-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                    >
                        <FiUploadCloud size={20} />
                        {isUploading ? 'Uploading...' : 'Upload File'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FileManagerModal;