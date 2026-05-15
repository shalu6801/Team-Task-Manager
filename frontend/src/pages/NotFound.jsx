import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 text-center dark:bg-slate-950">
    <motion.div className="panel max-w-md p-8" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <p className="eyebrow">404</p>
      <h1 className="mt-2 text-4xl font-black tracking-tight">Page not found</h1>
      <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">The page you are looking for does not exist.</p>
      <Link to="/" className="btn-primary mt-6">Back to dashboard</Link>
    </motion.div>
  </div>
);

export default NotFound;
