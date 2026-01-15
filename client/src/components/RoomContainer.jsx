import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiFileText, FiFolder, FiShare2, FiCheck } from 'react-icons/fi'; // Added FiShare2, FiCheck
import CollaborativeEditor from './CollaborativeEditor';
import FileManagerModal from './FileManagerModal';
import { socket } from '../socket';

const RoomContainer = () => {
    const { roomId } = useParams();
    const [activeView, setActiveView] = useState('text');
    const [files, setFiles] = useState([]);
    
    // --- NEW STATE for the "Copied!" feedback ---
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        socket.emit('join-room', roomId);

        socket.on('load-files', (loadedFiles) => setFiles(loadedFiles));
        socket.on('new-file', (newFile) => setFiles(prev => [...prev, newFile]));
        socket.on('file-deleted', (deletedFileKey) => {
            setFiles(prev => prev.filter(file => file.key !== deletedFileKey));
        });

        return () => {
            socket.off('join-room');
            socket.off('load-files');
            socket.off('new-file');
            socket.off('file-deleted');
        }
    }, [roomId]);

    // --- NEW FUNCTION: Handle Copy Link ---
    const handleCopyInvite = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            // Reset the icon back after 2 seconds
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="h-screen w-screen bg-dark-900 relative overflow-hidden">
            
            {/* Main Editor Area */}
            <div className={`h-full w-full ${activeView === 'text' ? 'block' : 'hidden'}`}>
               <CollaborativeEditor roomId={roomId} socket={socket} />
            </div>

            {/* --- NEW SHARE BUTTON (Top Right) --- */}
            <div className="absolute top-6 right-6 z-50">
                <button 
                    onClick={handleCopyInvite}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg font-medium transition-all duration-300
                        ${copied 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                            : 'bg-dark-800 text-gray-400 border border-dark-700 hover:text-white hover:border-gray-500'
                        }`}
                >
                    {copied ? <FiCheck size={18} /> : <FiShare2 size={18} />}
                    <span className="text-sm">{copied ? 'Copied!' : 'Invite'}</span>
                </button>
            </div>

            {/* Modal */}
            {activeView === 'files' && (
                 <FileManagerModal 
                    roomId={roomId} 
                    socket={socket} 
                    files={files}          
                    setFiles={setFiles}    
                    onClose={() => setActiveView('text')} 
                 />
            )}

            {/* Bottom Buttons */}
            <div className="absolute bottom-6 right-6 flex gap-4 z-50">
                <button 
                    onClick={() => setActiveView('text')}
                    className={`p-4 rounded-full shadow-lg transition-all ${activeView === 'text' ? 'bg-blue-600 text-white' : 'bg-dark-800 text-gray-400 hover:bg-dark-700'}`}
                >
                    <FiFileText size={24} />
                </button>
                <button 
                     onClick={() => setActiveView('files')}
                    className={`p-4 rounded-full shadow-lg transition-all ${activeView === 'files' ? 'bg-blue-600 text-white' : 'bg-dark-800 text-gray-400 hover:bg-dark-700'}`}
                >
                    <div className="relative">
                        <FiFolder size={24} />
                        {files.length > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>}
                    </div>
                </button>
            </div>
        </div>
    );
};

export default RoomContainer;