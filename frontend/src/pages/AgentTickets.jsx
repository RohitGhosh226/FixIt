import { useEffect, useState } from "react";
import {
  Search,
  Ticket,
  RefreshCw,
  ArrowUpRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const AgentTickets = () => {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const authConfig = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      params.append("limit", "50");

      if (search) {
        params.append("search", search);
      }

      if (status) {
        params.append("status", status);
      }

      const response = await api.get(
        `/tickets?${params.toString()}`,
        authConfig
      );

      setTickets(response.data.tickets);
    } catch (error) {
      console.error("Agent tickets error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchTickets();
    }
  }, [accessToken, search, status]);

  const getStatusClass = (ticketStatus) => {
    return `status-badge status-${ticketStatus}`;
  };

  return (
    <div className="agent-tickets-page">

      {/* Header */}
      <div className="agent-page-header">

        <div>
          <span className="page-eyebrow">
            AGENT WORKSPACE
          </span>

          <h1>My Assigned Tickets</h1>

          <p>
            Manage the support tickets assigned to you.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchTickets}
        >
          <RefreshCw size={17} />
          Refresh
        </button>

      </div>

      {/* Toolbar */}
      <div className="agent-toolbar">

        <div className="agent-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search assigned tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="agent-filter"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="in-progress">
            In Progress
          </option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <span className="agent-ticket-count">
          {tickets.length} tickets
        </span>

      </div>

      {/* Content */}
      {loading ? (
        <div className="agent-loading">
          <div className="loading-spinner"></div>
          <p>Loading assigned tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="agent-empty">

          <div className="agent-empty-icon">
            <Ticket size={32} />
          </div>

          <h2>No assigned tickets</h2>

          <p>
            Tickets assigned to you will appear here.
          </p>

        </div>
      ) : (
        <div className="agent-ticket-list">

          {tickets.map((ticket) => (
            <div
              className="agent-ticket-card"
              key={ticket._id}
              onClick={() =>
                navigate(`/tickets/${ticket._id}`)
              }
            >

              <div className="agent-ticket-left">

                <div className="agent-ticket-icon">
                  <Ticket size={20} />
                </div>

                <div className="agent-ticket-info">

                  <h3>{ticket.title}</h3>

                  <p>
                    {ticket.category} ·{" "}
                    {ticket.createdBy?.name || "Customer"}
                  </p>

                  <div className="agent-ticket-badges">

                    <span
                      className={getStatusClass(
                        ticket.status
                      )}
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

              </div>

              <ArrowUpRight
                className="agent-ticket-arrow"
                size={20}
              />

            </div>
          ))}

        </div>
      )}

    </div>
  );
};

export default AgentTickets;