import { useEffect, useState } from "react";
import {
  Ticket,
  CircleDot,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowUpRight,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Dashboard = () => {
  const { user, accessToken } = useAuth();

  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [statsResponse, ticketsResponse] = await Promise.all([
          api.get("/dashboard/stats", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }),

          api.get("/tickets?limit=5", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }),
        ]);

        setStats(statsResponse.data.stats);
        setTickets(ticketsResponse.data.tickets);
      } catch (error) {
        console.error("Dashboard loading error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      loadDashboard();
    }
  }, [accessToken]);

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const statCards = [
    {
      label: "Total Tickets",
      value: stats?.total ?? 0,
      icon: Ticket,
      className: "stat-indigo",
    },
    {
      label: "Open",
      value: stats?.open ?? 0,
      icon: CircleDot,
      className: "stat-blue",
    },
    {
      label: "In Progress",
      value: stats?.inProgress ?? 0,
      icon: Clock3,
      className: "stat-orange",
    },
    {
      label: "Resolved",
      value: stats?.resolved ?? 0,
      icon: CheckCircle2,
      className: "stat-green",
    },
    {
      label: "Closed",
      value: stats?.closed ?? 0,
      icon: CheckCircle2,
      className: "stat-purple",
    },
    {
      label: "Urgent",
      value: stats?.urgent ?? 0,
      icon: AlertTriangle,
      className: "stat-red",
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Loading your workspace...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* HERO */}
      <section className="dashboard-hero">
        <div>
          <span className="hero-eyebrow">YOUR WORKSPACE</span>

          <h1>
            {getGreeting()}, {user?.name} <span>👋</span>
          </h1>

          <p>
            Here's an overview of your support activity and recent tickets.
          </p>
        </div>

        <button
          className="create-ticket-btn"
          onClick={() => {
            window.location.href = "/tickets/create";
          }}
        >
          <Plus size={18} />
          Create Ticket
        </button>
      </section>

      {/* STATS */}
      <section className="stats-grid">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              className={`stat-card ${card.className}`}
              key={card.label}
            >
              <div className="stat-card-top">
                <div className="stat-icon">
                  <Icon size={20} />
                </div>

                <ArrowUpRight size={17} className="stat-arrow" />
              </div>

              <div className="stat-value">
                {card.value}
              </div>

              <div className="stat-label">
                {card.label}
              </div>
            </div>
          );
        })}
      </section>

      {/* RECENT TICKETS */}
      <section className="recent-section">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">ACTIVITY</span>
            <h2>Recent Tickets</h2>
          </div>

          <a href="/tickets" className="view-all">
            View all
            <ArrowUpRight size={16} />
          </a>
        </div>

        {tickets.length === 0 ? (
          <div className="empty-state">
            <Ticket size={30} />
            <h3>No tickets yet</h3>
            <p>Create your first support ticket to get started.</p>
          </div>
        ) : (
          <div className="ticket-list">
            {tickets.map((ticket) => (
              <div className="ticket-row" key={ticket._id}>

                <div className="ticket-main">
                  <div className="ticket-icon">
                    <Ticket size={18} />
                  </div>

                  <div>
                    <h3>{ticket.title}</h3>

                    <p>
                      {ticket.category} ·{" "}
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="ticket-meta">
                  <span
                    className={`status-badge status-${ticket.status}`}
                  >
                    {ticket.status}
                  </span>

                  <span
                    className={`priority-badge priority-${ticket.priority}`}
                  >
                    {ticket.priority}
                  </span>
                </div>

              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default Dashboard;