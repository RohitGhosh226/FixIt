import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Bell,
  Settings,
  LogOut,
  Wrench,
  ShieldCheck,
} from "lucide-react";

import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      logout();
      navigate("/login");
    }
  };

 const navItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "My Tickets",
    path: "/tickets",
    icon: Ticket,
  },
  {
    label: "Create Ticket",
    path: "/tickets/create",
    icon: PlusCircle,
  },
  {
    label: "Notifications",
    path: "/notifications",
    icon: Bell,
  },
  ...(user?.role === "admin"
    ? [
        {
          label: "Admin Tickets",
          path: "/admin/tickets",
          icon: ShieldCheck,
        },
      ]
    : []),
    ...(user?.role === "agent"
  ? [
      {
        label: "Assigned Tickets",
        path: "/agent/tickets",
        icon: Ticket,
      },
    ]
  : []),
];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Wrench size={21} />
          </div>

          <span>FixIt</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <NavLink to="/settings" className="nav-item">
            <Settings size={19} />
            <span>Settings</span>
          </NavLink>

          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <p className="topbar-label">Workspace</p>
            <h2>Support Center</h2>
          </div>

          <div className="profile">
            <div className="avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>

            <div className="profile-info">
              <strong>{user?.name}</strong>
              <span>{user?.role}</span>
            </div>
          </div>
        </header>

        <section className="page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default DashboardLayout;