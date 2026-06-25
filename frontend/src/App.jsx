import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreateTaskModal from './components/CreateTaskModal';
import client from './api/client';

// --- Icons ---
const IconDashboard = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 001 1h3m-6-11v10a1 1 0 001 1h3"></path></svg>
);
const IconTasks = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
);
const IconProjects = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7m-4 0L12 4m-4 3L3 7m4 0h10M3 7l4-3m10 3l4-3M4 16v-4a2 2 0 012-2h12a2 2 0 012 2v4m-12 0h12"></path></svg>
);
const IconTeam = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h2a2 2 0 002-2V7a2 2 0 00-2-2h-2m-4 0H9M7 5H5a2 2 0 00-2 2v10a2 2 0 002 2h2m4 0h2m-4 0v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 0H6a2 2 0 00-2 2v2a2 2 0 002 2h12a2 2 0 002-2v-2a2 2 0 00-2-2h-6z"></path></svg>
);
const IconReports = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
);
const IconSettings = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
);
const IconPlus = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
);
const IconLogout = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
);

// --- Layout Components ---
const Sidebar = () => {
  const { logout } = useContext(AuthContext);
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <IconDashboard /> },
    { name: 'My Tasks', path: '/tasks', icon: <IconTasks /> },
    { name: 'Projects', path: '/projects', icon: <IconProjects /> },
    { name: 'Team', path: '/team', icon: <IconTeam /> },
    { name: 'Reports', path: '/reports', icon: <IconReports /> },
    { name: 'Settings', path: '/settings', icon: <IconSettings /> },
  ];

  return (
    <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col h-full shadow-lg">
      <div className="flex items-center justify-center h-16 border-b border-gray-700 mb-6">
        <h1 className="text-xl font-bold text-primary">Smart Task Tracker</h1>
      </div>
      <nav className="flex-grow">
        <ul>
          {navItems.map((item) => (
            <li key={item.name} className="mb-2">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg transition-colors duration-200 ${
                    isActive ? 'bg-primary text-white shadow-md' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                {item.icon}
                <span className="ml-3 font-medium">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto pt-4 border-t border-gray-700">
        <button onClick={logout} className="w-full flex items-center p-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-200">
          <IconLogout />
          <span className="ml-3 font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

const Header = ({ title, onCreateTask }) => {
  const { user } = useContext(AuthContext);
  
  return (
    <header className="bg-white shadow-sm p-4 flex items-center justify-between h-16 z-10 border-b border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
      <div className="flex items-center space-x-4">
        {user && <span className="text-gray-600 font-medium">Hello, {user.first_name}!</span>}
        <button 
          onClick={onCreateTask}
          className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-md transition-colors duration-200"
        >
          <IconPlus />
          <span className="ml-2">New Task</span>
        </button>
      </div>
    </header>
  );
};

const Layout = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const getTitle = () => {
    const path = window.location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/tasks') return 'My Tasks';
    if (path === '/projects') return 'Projects';
    if (path === '/team') return 'Team';
    if (path === '/reports') return 'Reports';
    if (path === '/settings') return 'Settings';
    return 'Smart Task Tracker';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={getTitle()} onCreateTask={() => setIsModalOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet context={{ openTaskModal: () => setIsModalOpen(true) }} />
        </main>
      </div>
      <CreateTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onTaskCreated={() => window.dispatchEvent(new Event('taskCreated'))} 
      />
    </div>
  );
};

// --- Page Components ---
const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Welcome back, {user?.first_name}!</h3>
        <p className="text-gray-500">Here's what's happening with your projects today.</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Stats</h3>
        <div className="flex justify-around items-center text-center">
          <div><p className="text-3xl font-bold text-primary">0</p><p className="text-gray-500 text-sm mt-1">Active Projects</p></div>
          <div><p className="text-3xl font-bold text-green-500">0</p><p className="text-gray-500 text-sm mt-1">Completed Tasks</p></div>
          <div><p className="text-3xl font-bold text-red-500">0</p><p className="text-gray-500 text-sm mt-1">Overdue Tasks</p></div>
        </div>
      </div>
    </div>
  );
};

const MyTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const response = await client.get('/api/tasks');
      setTasks(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
    const handleTaskCreated = () => fetchTasks();
    window.addEventListener('taskCreated', handleTaskCreated);
    return () => window.removeEventListener('taskCreated', handleTaskCreated);
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': case 'Critical': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Done': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Review': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Task Title</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No tasks found. Click "New Task" to create one!</td></tr>
            ) : (
              tasks.map(task => (
                <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{task.title}</td>
                  <td className="px-6 py-4 text-gray-500 truncate max-w-xs">{task.description || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority || 'Medium'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                      {task.status || 'To Do'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Placeholder pages
const ProjectsPage = () => <div className="bg-white p-6 rounded-xl shadow-sm">Projects coming soon...</div>;
const TeamPage = () => <div className="bg-white p-6 rounded-xl shadow-sm">Team management coming soon...</div>;
const ReportsPage = () => <div className="bg-white p-6 rounded-xl shadow-sm">Reports coming soon...</div>;
const SettingsPage = () => <div className="bg-white p-6 rounded-xl shadow-sm">Settings coming soon...</div>;

// --- Protected Route Wrapper ---
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// --- Main App ---
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="tasks" element={<MyTasksPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
