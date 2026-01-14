import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { SocketIOProvider } from 'y-socket.io';
import { MonacoBinding } from 'y-monaco';

const CollaborativeEditor = ({ roomId, socket }) => {
    const [editorRef, setEditorRef] = useState(null);

    // Callback when Monaco editor mounts correctly
    function handleEditorDidMount(editor, monaco) {
        setEditorRef(editor);
    }

    useEffect(() => {
        if (!editorRef || !roomId || !socket) return;

        // 1. Create Yjs Document
        const ydoc = new Y.Doc();

        // 2. Create Provider to sync with backend via existing socket
        // We reuse the socket instance we passed in as a prop
        const provider = new SocketIOProvider(
            import.meta.env.VITE_BACKEND_URL,
            roomId,
            ydoc,
            { autoConnect: true, socket: socket } // Important: pass existing socket
        );

        // 3. Define the shared text type
        const ytext = ydoc.getText('monaco');

        // 4. Bind Yjs text -> Monaco Editor Model
        const binding = new MonacoBinding(
            ytext,
            editorRef.getModel(),
            new Set([editorRef]),
            provider.awareness
        );

        // Cleanup on unmount or roomId change
        return () => {
            binding.destroy();
            provider.destroy();
            ydoc.destroy();
        };

    }, [editorRef, roomId, socket]);

    return (
        <Editor
            height="100vh"
            width="100vw"
            theme="vs-dark" // Dark theme
            defaultLanguage="javascript"
            defaultValue="// Start typing to share..."
            onMount={handleEditorDidMount}
            options={{
                minimap: { enabled: false },
                fontSize: 16,
                wordWrap: 'on',
                padding: { top: 20 },
                fontFamily: 'Fira Code, monospace', // Looks better if they have it installed
                scrollBeyondLastLine: false,
                automaticLayout: true, // Resizes nicely
                quickSuggestions: false, // Disables automatic suggestions while typing
                suggestOnTriggerCharacters: false, // Disables triggering suggestions by typing triggers (like '.')
                snippetSuggestions: "none", // Removes snippet suggestions
                wordBasedSuggestions: false, // Disables word-based completion
            }}
        />
    );
};

export default CollaborativeEditor;