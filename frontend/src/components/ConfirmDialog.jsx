import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const ConfirmDialog = ({ open, title, message, onConfirm, onClose }) => {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: 0.98 }} className="panel w-full max-w-md p-6 shadow-2xl shadow-black/50">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-black">{title}</h3>
                <p className="mt-2 text-sm text-slate-400">{message}</p>
              </div>
              <button className="btn-muted h-11 w-11 p-0" onClick={onClose} aria-label="Close">
                <X className="h-5 w-5" strokeWidth={2.3} />
              </button>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button className="btn-muted" onClick={onClose}>Cancel</button>
              <button className="inline-flex rounded-2xl bg-rose-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-rose-950/30 transition hover:-translate-y-0.5 hover:bg-rose-500" onClick={onConfirm}>
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
