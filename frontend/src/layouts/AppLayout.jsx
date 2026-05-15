import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  ChevronDown,
  CheckSquare,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  Sparkles,
  Sun,
  User,
  Users
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Avatar from '../components/Avatar';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/users', label: 'Team', icon: Users, admin: true },
  { to: '/profile', label: 'Settings', icon: Settings }
];

const AppLayout = () => {
  const { user, isAdmin, logout } = useAuth();
  const { dark, toggleDark } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebar = (
    <motion.aside
      animate={{ width: collapsed ? 88 : 296 }}
      transition={{ type: 'spring', stiffness: 300, damping: 34 }}
      className="relative m-5 flex h-[calc(100vh-2.5rem)] flex-col overflow-hidden rounded-[2rem] border border-slate-200/75 bg-white/[0.86] px-4 py-4 shadow-[0_18px_55px_rgba(15,23,42,0.14)] backdrop-blur-md dark:border-white/10 dark:bg-[#0b1020]/[0.86] dark:shadow-[0_20px_60px_rgba(0,0,0,0.38)]"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-violet-500/[0.12] to-transparent dark:from-violet-400/[0.12]" />
      <div className="pointer-events-none absolute -left-12 top-16 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl" />

      <div className="relative mb-6 flex items-center justify-between gap-3">
        <Link to="/" className={`flex min-w-0 items-center gap-3 rounded-2xl transition ${collapsed ? 'justify-center' : ''}`}>
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 font-black text-white shadow-[0_10px_26px_rgba(124,58,237,0.28)] ring-1 ring-white/20"
          >
            <span className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 transition group-hover:opacity-100" />
            TT
          </motion.div>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="truncate text-base font-black leading-tight tracking-tight">Team Task</p>
            </div>
          ) : null}
        </Link>
        <motion.button
          whileHover={{ y: -1, scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/70 text-slate-500 shadow-sm transition hover:border-violet-300 hover:text-violet-700 dark:border-white/10 dark:bg-white/[0.045] dark:text-slate-300 dark:hover:border-violet-400/[0.35] dark:hover:text-white lg:inline-flex"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen className="h-5 w-5" strokeWidth={2.5} /> : <PanelLeftClose className="h-5 w-5" strokeWidth={2.5} />}
        </motion.button>
      </div>

      {!collapsed ? (
        <motion.div
          whileHover={{ y: -2 }}
          className="relative mb-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white/[0.9] to-slate-50/[0.8] p-4 shadow-[0_10px_28px_rgba(15,23,42,0.07)] transition dark:border-white/10 dark:from-white/[0.08] dark:to-white/[0.03] dark:shadow-[0_10px_28px_rgba(0,0,0,0.18)]"
        >
          <div className="absolute right-0 top-0 h-16 w-16 rounded-full bg-emerald-400/10 blur-xl" />
          <div className="relative flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-violet-600 dark:text-violet-200">
                <Sparkles className="h-3.5 w-3.5" />
                Workspace
              </div>
              <p className="mt-2 text-sm font-black">{user?.role} workspace</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-black text-emerald-600 dark:text-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Live
            </span>
          </div>
        </motion.div>
      ) : null}

      <nav className="relative space-y-1">
        {navItems
          .filter((item) => !item.admin || isAdmin)
          .map(({ to, label, icon: Icon }) => (
            <NavLink
              key={`${label}-${to}`}
              to={to}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? label : undefined}
              className="block"
            >
              {({ isActive }) => (
                <motion.div
                  whileHover={{ x: collapsed ? 0 : 3 }}
                  whileTap={{ scale: 0.985 }}
                  className={`relative flex items-center gap-3 overflow-hidden rounded-2xl px-3 py-2.5 text-[14px] font-semibold transition duration-200 ${isActive
                    ? 'text-slate-950 shadow-[0_8px_22px_rgba(124,58,237,0.10)] dark:text-white'
                    : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.055] dark:hover:text-white'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  {isActive ? (
                    <>
                      <motion.span
                        layoutId="sidebar-active-bg"
                        className="absolute inset-0 rounded-2xl border border-violet-300/50 bg-gradient-to-r from-violet-500/[0.14] via-violet-500/[0.08] to-transparent dark:border-violet-400/20 dark:from-violet-500/[0.18] dark:via-violet-500/[0.08]"
                        transition={{ type: 'spring', stiffness: 360, damping: 32 }}
                      />
                      <motion.span layoutId="sidebar-active-line" className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-violet-500 dark:bg-violet-300" />
                    </>
                  ) : null}
                  <Icon className="relative h-5 w-5 shrink-0" strokeWidth={2.25} />
                  {!collapsed ? <span className="relative truncate">{label}</span> : null}
                </motion.div>
              )}
            </NavLink>
          ))}
      </nav>

      <div className="relative mt-auto space-y-3 pt-5">
        {!collapsed ? <div className="h-px bg-gradient-to-r from-transparent via-slate-300/70 to-transparent dark:via-white/[0.12]" /> : null}
        {!collapsed ? (
          <motion.div
            whileHover={{ y: -2 }}
            className="rounded-2xl border border-slate-200/80 bg-white/70 p-3 shadow-sm dark:border-white/10 dark:bg-white/[0.035]"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar name={user?.name} className="h-10 w-10 rounded-xl" />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400 dark:border-[#0b1020]" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-black leading-tight">{user?.name}</p>
                <p className="mt-0.5 truncate text-xs font-semibold text-slate-500 dark:text-slate-400">{user?.email}</p>
              </div>
            </div>
          </motion.div>
        ) : null}
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          className={`flex w-full items-center gap-3 rounded-2xl border border-transparent px-3 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-rose-500/[0.08] hover:text-rose-600 dark:text-slate-300 dark:hover:bg-rose-500/10 dark:hover:text-rose-200 ${collapsed ? 'justify-center px-0' : 'justify-start'}`}
          onClick={handleLogout}
          title="Logout"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-white/[0.07] dark:text-slate-200">
            <LogOut className="h-[18px] w-[18px]" />
          </span>
          {!collapsed ? <span>Logout</span> : null}
        </motion.button>
      </div>
    </motion.aside>
  );

  return (
    <div className="min-h-screen text-slate-950 dark:text-white">
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex">{sidebar}</div>
      <AnimatePresence>
        {mobileOpen ? (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }} transition={{ type: 'spring', damping: 28, stiffness: 260 }} className="relative h-full">
              {sidebar}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div animate={{ paddingLeft: collapsed ? 132 : 332 }} className="hidden lg:block">
        <Topbar user={user} onMenu={() => setMobileOpen(true)} onTheme={toggleDark} dark={dark} onLogout={handleLogout} />
        <main className="px-7 py-7 xl:px-10">
          <Outlet />
        </main>
      </motion.div>

      <div className="lg:hidden">
        <Topbar user={user} onMenu={() => setMobileOpen(true)} onTheme={toggleDark} dark={dark} onLogout={handleLogout} />
        <main className="px-4 py-5 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const Topbar = ({ user, onMenu, onTheme, dark, onLogout }) => (
  <TopbarContent user={user} onMenu={onMenu} onTheme={onTheme} dark={dark} onLogout={onLogout} />
);

const TopbarContent = ({ user, onMenu, onTheme, dark, onLogout }) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const notifications = [
    { title: 'Task board updated', text: 'Your Kanban columns are synced with live task status.' },
    { title: 'Admin workspace', text: 'You can create projects, assign tasks, and manage team members.' },
    { title: 'Reminder', text: 'Drag task cards between columns to update their status.' }
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/82 px-4 py-4 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/72 sm:px-7">
      <div className="flex items-center gap-3">
        <button className="btn-muted h-11 w-11 p-0 lg:hidden" onClick={onMenu} aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
        <label className="relative hidden flex-1 md:block">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="form-input h-11 max-w-2xl !pl-12" placeholder="Search projects, tasks, teammates..." />
        </label>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <button
              className="btn-muted relative h-14 w-14 p-0"
              aria-label="Notifications"
              onClick={() => setNotificationsOpen((value) => !value)}
            >
              <Bell className="h-6 w-6" strokeWidth={2.2} />
              <span className="absolute right-3 top-3 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-950" />
            </button>
            <AnimatePresence>
              {notificationsOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  className="panel absolute right-0 top-14 z-50 w-[min(22rem,calc(100vw-2rem))] p-3 shadow-2xl"
                >
                  <div className="mb-2 flex items-center justify-between px-2">
                    <p className="text-sm font-black">Notifications</p>
                    <span className="rounded-full bg-violet-500/15 px-2 py-1 text-xs font-black text-violet-700 dark:text-violet-200">{notifications.length}</span>
                  </div>
                  <div className="space-y-2">
                    {notifications.map((item) => (
                      <div key={item.title} className="rounded-2xl bg-slate-50 p-3 dark:bg-white/[0.04]">
                        <p className="text-sm font-black">{item.title}</p>
                        <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
          <button className="btn-muted h-14 w-14 p-0" onClick={onTheme} aria-label="Toggle theme">
            {dark ? <Sun className="h-6 w-6" strokeWidth={2.2} /> : <Moon className="h-6 w-6" strokeWidth={2.2} />}
          </button>
          <div className="relative">
            <button className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/85 px-2 py-1.5 shadow-sm transition hover:border-violet-300 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-violet-500/40" onClick={() => setUserOpen((value) => !value)}>
              <Avatar name={user?.name} />
              <div className="hidden pr-1 text-left sm:block">
                <p className="text-sm font-black leading-tight">{user?.name}</p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{user?.role}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </button>
            <AnimatePresence>
              {userOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  className="panel absolute right-0 top-14 z-50 w-64 p-3 shadow-2xl"
                >
                  <div className="border-b border-slate-200 px-2 pb-3 dark:border-white/10">
                    <p className="font-black">{user?.name}</p>
                    <p className="mt-1 truncate text-xs font-semibold text-slate-500 dark:text-slate-400">{user?.email}</p>
                  </div>
                  <Link className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white" to="/profile" onClick={() => setUserOpen(false)}>
                    <User className="h-4 w-4" /> Profile settings
                  </Link>
                  <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-rose-200 transition hover:bg-rose-500/10" onClick={onLogout}>
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
            </div>
        </div>
    </header>
  );
};

export default AppLayout;
