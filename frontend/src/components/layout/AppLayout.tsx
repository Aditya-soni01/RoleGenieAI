import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, Settings } from 'lucide-react';
import { authStore } from '@/store/authStore';
import Sidebar from '@/components/layout/Sidebar';
import clsx from 'clsx';

const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, logout } = authStore();

  const handleLogout = () => {
    logout();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out lg:relative lg:z-auto lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Sidebar onClose={closeSidebar} />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-slate-700 bg-slate-800 shadow-sm">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            {/* Left side: menu toggle + title */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className="inline-flex items-center justify-center rounded-md p-2 text-slate-300 hover:bg-slate-700 hover:text-white lg:hidden"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              <h1 className="text-xl font-semibold text-white">
                AI Job Assistant
              </h1>
            </div>

            {/* Right side: user menu */}
            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-3">
                  {/* User avatar */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600">
                    <span className="text-sm font-semibold text-white">
                      {`${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() || user.username?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>

                  {/* User info */}
                  <div className="hidden flex-col sm:flex">
                    <p className="text-sm font-medium text-white">
                      {`${user.first_name} ${user.last_name}`.trim() || user.username}
                    </p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>

                  {/* Dropdown menu */}
                  <div className="relative group">
                    <button
                      className="rounded-md p-2 text-slate-300 hover:bg-slate-700 hover:text-white"
                      aria-label="User menu"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </button>

                    {/* Dropdown content */}
                    <div className="absolute right-0 mt-0 w-48 rounded-lg border border-slate-600 bg-slate-800 py-1 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-10">
                      <button
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                        aria-label="Settings"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white border-t border-slate-600"
                        aria-label="Logout"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto bg-slate-900">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;