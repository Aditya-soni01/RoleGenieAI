import React, { useState } from 'react';
import { CheckCircle, Info, AlertTriangle, Shield, Eye, Trash2 } from 'lucide-react';

interface Notification {
  id: number;
  type: 'success' | 'info' | 'warning' | 'verified';
  title: string;
  message: React.ReactNode;
  time: string;
  unread: boolean;
}

const notifications: Notification[] = [
  {
    id: 1,
    type: 'success',
    title: 'Resume Optimized Successfully',
    message: (
      <>
        Your resume for <strong className="text-[#d4e4fa]">"Senior Product Designer at Linear"</strong> has been processed.
        We've increased your keyword match rate by 42%.
      </>
    ),
    time: 'Just now',
    unread: true,
  },
  {
    id: 2,
    type: 'info',
    title: 'New Job Match Found',
    message: (
      <>
        A new position matching your profile has been posted.{' '}
        <span className="mono-label text-[#d0bcff] text-xs">UX_ENG_ROLE_992</span>{' '}
        at Stripe. Highly recommended for your skill set.
      </>
    ),
    time: '2 hours ago',
    unread: true,
  },
  {
    id: 3,
    type: 'warning',
    title: 'Subscription Ending Soon',
    message: 'Your Genie Pro trial will expire in 48 hours. Renew now to maintain access to advanced AI resume generation.',
    time: 'Yesterday',
    unread: false,
  },
  {
    id: 4,
    type: 'verified',
    title: 'Profile Verified',
    message: 'Your identity and education credentials have been successfully verified by the Genie Security Layer.',
    time: 'Oct 24, 2023',
    unread: false,
  },
];

const typeConfig = {
  success: {
    icon: CheckCircle,
    iconColor: 'text-[#4edea3]',
    bgColor: 'bg-[#00a572]/20',
    borderColor: 'border-[#4edea3]/20',
    barColor: 'bg-[#4edea3]',
    barGlow: 'shadow-[0_0_15px_rgba(78,222,163,0.3)]',
  },
  info: {
    icon: Info,
    iconColor: 'text-[#d0bcff]',
    bgColor: 'bg-[#d0bcff]/10',
    borderColor: 'border-[#d0bcff]/10',
    barColor: '',
    barGlow: '',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-[#ffb3af]',
    bgColor: 'bg-[#ffb3af]/10',
    borderColor: 'border-[#ffb3af]/20',
    barColor: '',
    barGlow: '',
  },
  verified: {
    icon: Shield,
    iconColor: 'text-[#4edea3]',
    bgColor: 'bg-[#4edea3]/10',
    borderColor: 'border-[#4edea3]/20',
    barColor: '',
    barGlow: '',
  },
};

const NotificationsPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [items, setItems] = useState(notifications);

  const markAllRead = () => setItems((n) => n.map((i) => ({ ...i, unread: false })));
  const removeItem = (id: number) => setItems((n) => n.filter((i) => i.id !== id));

  const filtered = filter === 'unread' ? items.filter((i) => i.unread) : items;
  const unreadCount = items.filter((i) => i.unread).length;

  return (
    <div className="min-h-screen bg-[#051424] px-8 py-10 max-w-5xl mx-auto">
      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-5xl font-extrabold tracking-tighter text-[#d4e4fa] mb-2">
            Notifications
          </h2>
          <div className="flex items-center gap-3">
            <span
              className="mono-label text-xs py-1 px-2 rounded text-[#4edea3]"
              style={{ background: 'rgba(39,54,71,0.8)', border: '1px solid rgba(73,68,84,0.3)' }}
            >
              ACTIVE_LOG_v2.4
            </span>
            <p className="text-slate-400 text-sm">Stay updated with your AI-driven career progress.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Filter tabs */}
          <div
            className="flex p-1 rounded-xl"
            style={{ background: 'rgba(13,28,45,1)', border: '1px solid rgba(73,68,84,0.15)' }}
          >
            <button
              onClick={() => setFilter('all')}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                filter === 'all' ? 'text-[#d0bcff]' : 'text-slate-400 hover:text-slate-100'
              }`}
              style={{ background: filter === 'all' ? 'rgba(39,54,71,0.8)' : 'transparent' }}
            >
              All {unreadCount > 0 && `(${items.length})`}
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                filter === 'unread' ? 'text-[#d0bcff]' : 'text-slate-400 hover:text-slate-100'
              }`}
              style={{ background: filter === 'unread' ? 'rgba(39,54,71,0.8)' : 'transparent' }}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>

          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-[#d4e4fa] transition-colors hover:bg-[#273647]/40"
            style={{ border: '1px solid rgba(73,68,84,0.3)' }}
          >
            ✓ Mark all as read
          </button>
        </div>
      </header>

      {/* Notifications list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <p className="text-lg">No notifications</p>
          </div>
        ) : (
          filtered.map((notif) => {
            const cfg = typeConfig[notif.type];
            const Icon = cfg.icon;
            return (
              <div
                key={notif.id}
                className={`group relative flex items-center gap-6 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-0.5
                  ${notif.unread ? 'glass-card' : ''}`}
                style={{
                  background: notif.unread ? undefined : 'rgba(13,28,45,0.8)',
                  border: `1px solid rgba(73,68,84,0.15)`,
                }}
              >
                {/* Unread left bar */}
                {notif.unread && cfg.barColor && (
                  <div
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 rounded-r-full ${cfg.barColor} ${cfg.barGlow}`}
                  />
                )}

                {/* Icon */}
                <div
                  className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ${cfg.bgColor} ${cfg.borderColor} border`}
                >
                  <Icon className={`${cfg.iconColor} w-6 h-6`} style={{ fill: 'currentColor', fillOpacity: 0.2 }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-[#d4e4fa] text-base">{notif.title}</h4>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                      <span className="mono-label text-xs text-slate-500 uppercase tracking-widest">
                        {notif.time}
                      </span>
                      {notif.unread && (
                        <div
                          className="w-2 h-2 rounded-full bg-[#d0bcff]"
                          style={{ boxShadow: '0 0 8px rgba(208,188,255,0.8)' }}
                        />
                      )}
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">{notif.message}</p>
                </div>

                {/* Actions (hover) */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 flex-shrink-0">
                  <button
                    className="p-2 rounded-lg text-slate-300 hover:text-white transition-colors"
                    style={{ background: 'rgba(39,54,71,0.8)' }}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeItem(notif.id)}
                    className="p-2 rounded-lg text-slate-300 hover:text-[#ffb4ab] transition-colors"
                    style={{ background: 'rgba(39,54,71,0.8)' }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* AI Insight sidebar card (desktop) */}
      <div className="mt-12">
        <div
          className="p-6 rounded-3xl relative overflow-hidden"
          style={{ background: 'rgba(13,28,45,1)', border: '1px solid rgba(73,68,84,0.15)' }}
        >
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#d0bcff]/10 rounded-full blur-3xl" />
          <h5 className="mono-label text-sm text-[#d0bcff] uppercase tracking-widest mb-4">AI Insight</h5>
          <div className="flex justify-between items-end mb-3">
            <span className="text-xs text-slate-400">Monthly Efficiency</span>
            <span className="text-lg font-bold text-[#d4e4fa]">+18%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#273647] overflow-hidden mb-3">
            <div
              className="h-full rounded-full"
              style={{ width: '72%', background: 'linear-gradient(135deg, #d0bcff 0%, #4edea3 100%)' }}
            />
          </div>
          <p className="text-xs text-slate-500 italic">
            "You are in the top 5% of job seekers this week based on notification response times."
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
