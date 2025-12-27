"use client";
import { useState } from "react";

export function ToastDemo() {
  const [show, setShow] = useState(false);
  return (
    <div>
      <button
        className="px-4 py-2 bg-accent text-white rounded"
        onClick={() => {
          setShow(true);
          setTimeout(() => setShow(false), 2000);
        }}
      >
        Show Toast
      </button>
      {show && (
        <div className="fixed bottom-8 right-8 bg-card text-foreground px-6 py-3 rounded shadow-lg border animate-fade-in">
          <span>Toast notification!</span>
        </div>
      )}
    </div>
  );
}
