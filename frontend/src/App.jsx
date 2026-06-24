import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Outlet } from 'react-router-dom';

// --- Icons (simplified for demonstration, typically imported from an icon library) ---
const IconDashboard = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 001 1h3m-6-11v10a1 1 0 001 1h3"></path>
  </svg>
);
const IconTasks = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
  </svg>
);
const IconProjects = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7m-4 0L12 4m-4 3L3 7m4 0h10M3 7l4-3m10 3l4-3M4 16v-4a2 2 0 012-2h12a2 2 0 012 2v4m-12 0h12"></path>
  </svg>
);
const IconTeam = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h2a2 2 0 002-2V7a2 2 0 00-2-2h-2m-4 0H9M7 5H5a2 2 0 00-2 2v10a2 2 0 002 2h2m4 0h2m-4 0v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 0H6a2 2 0 00-2 2v2a2 2 0 002 2h12a2 2 0 002-2v-2a2 2 0 00-2-2h-6z"></path>
  </svg>
);
const IconReports = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
  </svg>
);
const IconSettings = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
  </svg>
);
const IconPlus = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
  </svg>
);

// --- Layout Components ---
const Sidebar = () => {
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
        <h1 className="text-2xl font-bold text-primary">Smart Task Tracker</h1>
      </div>
      <nav className="flex-grow">
        <ul>
          {navItems.map((item) => (
            <li key={item.name} className="mb-2">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary text-white shadow-md'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                {item.icon}
                <span className="ml-3 text-lg font-medium">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto pt-4 border-t border-gray-700 text-sm text-gray-400">
        <p>&copy; 2023 Smart Task Tracker</p>
      </div>
    </aside>
  );
};

const Header = ({ title }) => {
  return (
    <header className="bg-white shadow-md p-4 flex items-center justify-between h-16 z-10">
      <h2 className="text-3xl font-semibold text-text">{title}</h2>
      <button className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-md transition-colors duration-200">
        <IconPlus />
        <span className="ml-2">Create New Task</span>
      </button>
    </header>
  );
};

const Layout = () => {
  // A simple way to get the current page title based on the path
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
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={getTitle()} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet /> {/* Renders the current route's component */}
        </main>
      </div>
    </div>
  );
};

// --- Page Components (Placeholders) ---
const DashboardPage = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-text mb-4">Welcome, Ava!</h3>
      <p className="text-text-light">Your personalized overview of tasks and projects.</p>
      <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-800 rounded-md">
        <p className="font-medium">AI Insight:</p>
        <p>Project 'Alpha' is at 70% completion, but 2 tasks are at risk of delay due to resource overload. Consider reassigning 'Design Mockups' to Ben.</p>
      </div>
    </div>

    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-text mb-4">Upcoming Deadlines</h3>
      <ul className="space-y-3">
        <li className="flex justify-between items-center text-text-light">
          <span>Develop API Endpoints</span>
          <span className="text-sm text-red-500 font-medium">Tomorrow</span>
        </li>
        <li className="flex justify-between items-center text-text-light">
          <span>Review UI/UX Designs</span>
          <span className="text-sm text-yellow-500 font-medium">2 days</span>
        </li>
        <li className="flex justify-between items-center text-text-light">
          <span>Prepare Q3 Report</span>
          <span className="text-sm text-green-500 font-medium">Next Week</span>
        </li>
      </ul>
    </div>

    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-text mb-4">Team Workload</h3>
      <div className="space-y-3">
        <div className="flex items-center">
          <span className="w-24 text-text-light">Ava:</span>
          <div className="flex-1 bg-gray-200 rounded-full h-2.5">
            <div className="bg-primary h-2.5 rounded-full" style={{ width: '80%' }}></div>
          </div>
          <span className="ml-2 text-sm text-text-light">80%</span>
        </div>
        <div className="flex items-center">
          <span className="w-24 text-text-light">Ben:</span>
          <div className="flex-1 bg-gray-200 rounded-full h-2.5">
            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '50%' }}></div>
          </div>
          <span className="ml-2 text-sm text-text-light">50%</span>
        </div>
        <div className="flex items-center">
          <span className="w-24 text-text-light">Charlie:</span>
          <div className="flex-1 bg-gray-200 rounded-full h-2.5">
            <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '65%' }}></div>
          </div>
          <span className="ml-2 text-sm text-text-light">65%</span>
        </div>
      </div>
    </div>

    <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-text mb-4">Project Progress Overview</h3>
      <div className="flex justify-around items-center text-center">
        <div>
          <p className="text-4xl font-bold text-primary">3</p>
          <p className="text-text-light">Active Projects</p>
        </div>
        <div>
          <p className="text-4xl font-bold text-green-500">12</p>
          <p className="text-text-light">Tasks Completed This Week</p>
        </div>
        <div>
          <p className="text-4xl font-bold text-red-500">2</p>
          <p className="text-text-light">Overdue Tasks</p>
        </div>
      </div>
    </div>
  </div>
);

const MyTasksPage = () => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-2xl font-semibold text-text mb-6">My Tasks</h3>
    <div className="mb-4 flex space-x-4">
      <button className="px-4 py-2 bg-primary text-white rounded-md shadow-sm">List View</button>
      <button className="px-4 py-2 bg-gray-200 text-text-light rounded-md hover:bg-gray-300">Board View</button>
      <button className="px-4 py-2 bg-gray-200 text-text-light rounded-md hover:bg-gray-300">Calendar View</button>
      <button className="px-4 py-2 bg-gray-200 text-text-light rounded-md hover:bg-gray-300">Timeline View</button>
    </div>

    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Task Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Project
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Due Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Priority
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Edit</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">
              Develop User Authentication
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
              Project Alpha
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
              2023-11-15
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                High
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                In Progress
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <a href="#" className="text-primary hover:text-secondary">Edit</a>
            </td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">
              Design Database Schema
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
              Project Alpha
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
              2023-11-10
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                High
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                Completed
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <a href="#" className="text-primary hover:text-secondary">Edit</a>
            </td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text">
              Research AI Prioritization Models
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
              Internal R&D
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
              2023-11-20
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                Medium
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                In Progress
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <a href="#" className="text-primary hover:text-secondary">Edit</a>
            </td>
          </tr>
          {/* More tasks can be added here */}
        </tbody>
      </table>
    </div>
  </div>
);

const ProjectsPage = () => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-2xl font-semibold text-text mb-4">Projects Overview</h3>
    <p className="text-text-light">This section will display a list of projects, their status, and team members.</p>
    <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-800 rounded-md">
        <p className="font-medium">AI Insight:</p>
        <p>Project 'Beta' is progressing ahead of schedule. Consider reallocating resources to 'Project Gamma' which shows early signs of resource contention.</p>
      </div>
  </div>
);

const TeamPage = () => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-2xl font-semibold text-text mb-4">Team Management</h3>
    <p className="text-text-light">Manage team members, roles, and view individual workloads.</p>
    <div className="mt-4 p-4 bg-purple-50 border-l-4 border-purple-500 text-purple-800 rounded-md">
        <p className="font-medium">AI Recommendation:</p>
        <p>Ben's skills are highly aligned with 'Feature X' in Project Alpha. He currently has 50% capacity. Recommended for assignment.</p>
      </div>
  </div>
);

const ReportsPage = () => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-2xl font-semibold text-text mb-4">Analytics & Reports</h3>
    <p className="text-text-light">Generate detailed reports on task completion, team performance, and project health.</p>
    <div className="mt-4 p-4 bg-orange-50 border-l-4 border-orange-500 text-orange-800 rounded-md">
        <p className="font-medium">Data-Driven Insight:</p>
        <p>Average task completion time for 'Development' tasks has increased by 15% in the last month. Investigate potential bottlenecks.</p>
      </div>
  </div>
);

const SettingsPage = () => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-2xl font-semibold text-text mb-4">Settings</h3>
    <p className="text-text-light">Configure your profile, notification preferences, and integrations.</p>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="tasks" element={<MyTasksPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          {/* Add more routes for other features as they are developed */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center h-full text-text-light">
    <h1 className="text-6xl font-bold text-gray-400">404</h1>
    <p className="text-2xl mt-4">Page Not Found</p>
    <NavLink to="/" className="mt-6 text-primary hover:underline">Go to Dashboard</NavLink>
  </div>
);

export default App;
