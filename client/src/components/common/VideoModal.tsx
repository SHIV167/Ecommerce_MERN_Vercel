import { ReactNode } from "react";
import { createPortal } from "react-dom";

interface VideoModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function VideoModal({ open, onClose, children }: VideoModalProps) {
  if (!open) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70"
      style={{ backdropFilter: "blur(2px)" }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl w-[92vw] max-w-[400px] md:max-w-[600px] p-0 overflow-hidden border border-gray-200"
        style={{
          maxHeight: "90vh",
          minHeight: "220px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 z-10 text-gray-700 bg-white bg-opacity-90 rounded-full p-2 hover:bg-primary hover:text-white transition border border-gray-300 shadow"
          onClick={onClose}
          aria-label="Close video"
          style={{
            fontSize: 22,
            lineHeight: 1,
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          &times;
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}
