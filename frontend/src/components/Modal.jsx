import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const Modal = ({ open, title, children, onClose }) => {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: 0.98 }} className="panel max-h-[92vh] w-full max-w-2xl overflow-auto p-6 shadow-2xl shadow-black/50">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-xl font-black">{title}</h2>
              <button className="btn-muted h-11 w-11 p-0" onClick={onClose} aria-label="Close">
                <X className="h-5 w-5" strokeWidth={2.3} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default Modal;
