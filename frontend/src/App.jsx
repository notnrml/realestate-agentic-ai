import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import AdvisorTab from './components/advisor/AdvisorTab';
import MarketTrendsTab from './components/market-trends/MarketTrendsTab';
import GoalsTab from './components/goals/GoalsTab';
import PortfolioPage from './components/portfolio/PortfolioPage';
const navItems = [
  {
    section: 'Main',
    items: [
      {
        name: 'Market Trends',
        path: '/trends',
        description: 'Dubai rental market insights',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        )
      },
      {
        name: 'My Portfolio',
        path: '/portfolio',
        description: 'Manage your properties',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        )
      },
      {
        name: 'Advisor',
        path: '/advisor',
        description: 'Smart investment suggestions',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        )
      },
      {
        name: 'Goals',
        path: '/goals',
        description: 'Set your investment targets',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
      },
    ]
  },
  {
    section: 'Analytics',
    items: [
      {
        name: 'Performance',
        path: '/performance',
        description: 'Portfolio performance metrics',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      },
      {
        name: 'Market Research',
        path: '/research',
        description: 'Deep market analysis',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )
      },
      {
        name: 'Reports',
        path: '/reports',
        description: 'Generated insights',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      },
    ]
  }
];

// Main App component that provides the Router context
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

// Rename the original App function to AppContent
function AppContent() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Left Sidebar */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-72 bg-slate-800 shadow-lg fixed h-full border-r border-slate-700/50 flex flex-col"
      >
        <div className="p-6 border-b border-slate-700/50">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <motion.span
                className="text-accent-500"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >●</motion.span>
              Remmi
            </h1>
            <p className="text-sm text-slate-400 mt-1">AI-Powered Real Estate Assistant</p>
          </motion.div>
        </div>

        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          {navItems.map((section) => (
            <div key={section.section} className="mb-6">
              <h2 className="text-sm font-semibold text-slate-400 px-4 mb-2">{section.section}</h2>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <NavItem key={item.name} {...item} />
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <motion.div
            className="bg-slate-700/30 rounded-lg p-4"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="w-8 h-8 rounded-full bg-accent-400/20 flex items-center justify-center"
                animate={{
                  boxShadow: ['0 0 0 0 rgba(96, 165, 250, 0.2)', '0 0 0 10px rgba(96, 165, 250, 0)'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <span className="text-accent-400 text-sm">AI</span>
              </motion.div>
              <div>
                <p className="text-sm font-medium text-white">AI Assistant</p>
                <p className="text-xs text-slate-400">Active & Learning</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

        {/* Main Content */}
        <motion.div
          className="flex-1 ml-72"
          animate={{
            marginRight: isChatOpen ? '24rem' : '0',
            transition: { type: "spring", stiffness: 200, damping: 25 }
          }}
        >
          {/* Top Bar */}
          <div className="h-16 bg-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
            <PageTitle />
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-accent-400"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </motion.button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/trends" element={<MarketTrendsTab />} />
              <Route path="/advisor" element={<AdvisorTab />} />
			        <Route path="/portfolio" element={<PortfolioPage />} /> 
              <Route path="/goals" element={<GoalsTab />} />
              <Route path="/performance" element={<EmptyPage title="Performance" />} />
              <Route path="/research" element={<EmptyPage title="Market Research" />} />
              <Route path="/reports" element={<EmptyPage title="Reports" />} />
              <Route path="/settings" element={<EmptyPage title="Settings" />} />
              <Route path="/notifications" element={<EmptyPage title="Notifications" />} />
              <Route path="/help" element={<EmptyPage title="Help Center" />} />
            </Routes>
          </AnimatePresence>
        </motion.div>

      {/* Floating Chat Button */}
      <motion.div
        initial={false}
        animate={isChatOpen ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
        className="fixed right-8 bottom-8 z-50"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsChatOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 shadow-lg flex items-center justify-center relative group overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary-400/80 to-accent-400/80 opacity-0 group-hover:opacity-100 transition-opacity"
            animate={{
              background: [
                "linear-gradient(45deg, rgba(59, 130, 246, 0.8) 0%, rgba(139, 92, 246, 0.8) 100%)",
                "linear-gradient(180deg, rgba(59, 130, 246, 0.8) 0%, rgba(139, 92, 246, 0.8) 100%)",
                "linear-gradient(225deg, rgba(59, 130, 246, 0.8) 0%, rgba(139, 92, 246, 0.8) 100%)",
                "linear-gradient(270deg, rgba(59, 130, 246, 0.8) 0%, rgba(139, 92, 246, 0.8) 100%)",
              ]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="relative z-10 text-white"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </motion.div>
          <motion.div
            className="absolute -inset-1 rounded-full border-2 border-primary-300/30"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.button>
      </motion.div>

      {/* Chat Sidebar */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{
              x: 400,
              opacity: 0,
              scale: 0.5,
              borderRadius: "100%"
            }}
            animate={{
              x: 0,
              opacity: 1,
              scale: 1,
              borderRadius: "0%"
            }}
            exit={{
              x: 400,
              opacity: 0,
              scale: 0.5,
              borderRadius: "100%"
            }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 25,
              mass: 1
            }}
            className="fixed right-0 top-0 w-96 h-full bg-slate-800 border-l border-slate-700/50 shadow-lg overflow-hidden"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col h-full"
            >
              <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.7, 1],
                      background: [
                        "linear-gradient(45deg, rgba(59, 130, 246, 1) 0%, rgba(139, 92, 246, 1) 100%)",
                        "linear-gradient(225deg, rgba(59, 130, 246, 1) 0%, rgba(139, 92, 246, 1) 100%)",
                      ]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-2 h-2 rounded-full"
                  />
                  <div>
                    <h2 className="text-white font-medium">AI Assistant</h2>
                    <p className="text-xs text-slate-400">Analyzing market data in real-time</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsChatOpen(false)}
                  className="p-2 hover:bg-slate-700/50 rounded-full transition-colors text-slate-400 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-slate-700/30 rounded-lg p-4 max-w-[85%]"
                  >
                    <p className="text-white text-sm leading-relaxed">
                      I'm your proactive AI assistant, continuously analyzing:
                      <ul className="mt-2 space-y-1 text-slate-300">
                        <li>• Real-time market dynamics</li>
                        <li>• Your portfolio performance</li>
                        <li>• Investment opportunities</li>
                        <li>• ROI optimization strategies</li>
                      </ul>
                    </p>
                  </motion.div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-700/50">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="What insights would you like to explore?"
                    className="w-full bg-slate-700/30 text-white placeholder-slate-400 rounded-lg pl-4 pr-14 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-primary-400 hover:text-primary-300 hover:bg-slate-700/30 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5 rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ name, path, description, icon }) {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <motion.li
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        to={path}
        className={`block p-3 rounded-lg transition-all duration-200 relative overflow-hidden ${
          isActive
            ? 'bg-slate-700/50 text-white border border-slate-600/50'
            : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
        }`}
      >
        {isActive && (
          <>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-500/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            <motion.div
              className="absolute inset-0 rounded-lg"
              animate={{
                background: [
                  "radial-gradient(circle at 0% 0%, rgba(96, 165, 250, 0.15) 0%, transparent 50%)",
                  "radial-gradient(circle at 100% 0%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)",
                  "radial-gradient(circle at 100% 100%, rgba(96, 165, 250, 0.15) 0%, transparent 50%)",
                  "radial-gradient(circle at 0% 100%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)",
                  "radial-gradient(circle at 0% 0%, rgba(96, 165, 250, 0.15) 0%, transparent 50%)",
                ]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </>
        )}
        <div className="relative z-10 flex items-center space-x-3">
          <div className={`${isActive ? 'text-primary-400' : 'text-slate-400'}`}>
            {icon}
          </div>
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-xs text-slate-500">{description}</div>
          </div>
        </div>
      </Link>
    </motion.li>
  );
}

function PageTitle() {
  const location = useLocation();
  const currentNav = navItems.find(item => item.items.some(i => i.path === location.pathname)) || navItems[0].items[0];

  return (
    <motion.h2
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-lg font-medium text-white flex items-center gap-2"
    >
      {currentNav.name}
      <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse"></span>
    </motion.h2>
  );
}

function Home() {
  const cards = [
    {
      title: 'Active Properties',
      value: '12',
      trend: '+2 this month',
      color: 'from-emerald-500/20 to-emerald-500/5'
    },
    {
      title: 'Average ROI',
      value: '8.2%',
      trend: '↑ 0.5%',
      color: 'from-blue-500/20 to-blue-500/5'
    },
    {
      title: 'Market Opportunities',
      value: '5',
      trend: 'High potential',
      color: 'from-purple-500/20 to-purple-500/5'
    },
    {
      title: 'AI Suggestions',
      value: '3',
      trend: 'Updated today',
      color: 'from-orange-500/20 to-orange-500/5'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="p-8"
    >
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">Welcome to Remmi</h1>
        <p className="text-lg text-slate-400 mb-8">Your AI-powered real estate assistant is analyzing the market.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <motion.div
              key={card.title}
              whileHover={{ scale: 1.02, y: -5 }}
              className={`rounded-xl p-6 bg-gradient-to-b ${card.color} backdrop-blur-sm border border-white/5 shadow-lg`}
            >
              <h3 className="text-sm font-medium text-slate-400">{card.title}</h3>
              <p className="text-2xl font-semibold text-white mt-2">{card.value}</p>
              <p className="text-sm text-slate-400 mt-1">{card.trend}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">AI Activity</h2>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-3 h-3 rounded-full bg-accent-400"
            />
          </div>
          <div className="space-y-3">
            {[
              'Analyzing market trends in Dubai Marina',
              'Updating ROI calculations for your portfolio',
              'Monitoring price changes in JVC area'
            ].map((activity, index) => (
              <motion.div
                key={activity}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 text-slate-400"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent-400"></span>
                {activity}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyPage({ title }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="p-8"
    >
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-slate-800/50 rounded-xl p-12 border border-slate-700/50">
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-12 h-12 rounded-full bg-accent-400/20 mx-auto mb-6 flex items-center justify-center"
          >
            <div className="w-6 h-6 rounded-full bg-accent-400 animate-pulse" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-4">{title}</h1>
          <p className="text-slate-400">This section is currently being enhanced by our AI.</p>
        </div>
      </div>
    </motion.div>
  );
}

export default App;
