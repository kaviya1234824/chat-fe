import { useEffect } from "react";

type Message = {
    text: string;
    sender: "user" | "assistant"; 
  };
  
const DB_NAME = "ChatHistoryDB";
const STORE_NAME = "messages";

export const useChatHistory = () => {
  const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const saveMessage = async (message: { text: string; sender: string }) => {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.add({ text: message.text, sender: message.sender, timestamp: Date.now() });
  };

  const getChatHistory = async (): Promise<Message[]> => {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
  
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        resolve(
          request.result.map((msg: { text: string; sender: string }) => ({
            text: msg.text,
            sender: msg.sender as "user" | "assistant", 
          }))
        );
      };
      request.onerror = () => reject(request.error);
    });
  };
  

  const clearChatHistory = async () => {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).clear();
  };

  return { saveMessage, getChatHistory, clearChatHistory };
};
