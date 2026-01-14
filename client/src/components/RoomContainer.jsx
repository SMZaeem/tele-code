import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiFileText, FiFolder } from 'react-icons/fi';
import CollaborativeEditor from './CollaborativeEditor';
import FileManagerModal from './FileManagerModal';
import { socket } from '../socket';

const RoomContainer = () => {
    const { roomId } = useParams();
    const [activeView, setActiveView] = useState('text');
    
    // 1. STATE LIFTED UP: Files live here now
    const [files, setFiles] = useState([]);

    useEffect(() => {
        // Join the room
        socket.emit('join-room', roomId);

        // 2. LISTENERS MOVED HERE (Always Active)
        socket.on('load-files', (loadedFiles) => {
            // Ensure we don't get duplicates if server sends multiple times
            setFiles(loadedFiles); 
        });

        socket.on('new-file', (newFile) => {
            setFiles(prev => [...prev, newFile]);
        });

        socket.on('file-deleted', (deletedFileKey) => {
            // Remove the file with the matching Key from the list
            setFiles(prev => prev.filter(file => file.key !== deletedFileKey));
        });

        // Cleanup
        return () => {
            socket.off('join-room');
            socket.off('load-files');
            socket.off('new-file');
            socket.off('file-deleted');
        }
    }, [roomId]);

    return (
        <div className="h-screen w-screen bg-dark-900 relative overflow-hidden">
            
            <div className={`h-full w-full ${activeView === 'text' ? 'block' : 'hidden'}`}>
               <CollaborativeEditor roomId={roomId} socket={socket} />
            </div>

            {/* 3. PASS STATE DOWN AS PROPS */}
            {activeView === 'files' && (
                 <FileManagerModal 
                    roomId={roomId} 
                    socket={socket} 
                    files={files}          // Pass the list
                    setFiles={setFiles}    // Pass the updater (for your own uploads)
                    onClose={() => setActiveView('text')} 
                 />
            )}

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
                    {/* Show a red dot if there are files! */}
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