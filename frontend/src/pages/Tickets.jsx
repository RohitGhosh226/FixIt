import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Ticket as TicketIcon,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Tickets = () => {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();

        if (search) params.append("search", search);
        if (status) params.append("status", status);
        if (priority) params.append("priority", priority);
        params.append("limit", "20");

        const response = await api.get(
          `/tickets?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        setTickets(response.data.tickets);
      } catch (error) {
        console.error("Failed to fetch tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchTickets();
    }
  }, [accessToken, search, status, priority]);

  return (
    <div className="tickets-page">

      {/* HEADER */}

      <div className="tickets-header">
        <div>
          <span className="section-eyebrow">SUPPORT</span>

          <h1>My Tickets</h1>

          <p>
            Track and manage your support requests.
          </p>
        </div>

        <button
          className="create-ticket-btn"
          onClick={() => navigate("/tickets/create")}
        >
          <Plus size={18} />
          Create Ticket
        </button>
      </div>

      {/* FILTER BAR */}

      <div className="ticket-filters">

        <div className="search-box">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-select">
          <Filter size={16} />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="filter-select">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

      </div>

      {/* TICKETS */}

      {loading ? (
        <div className="dashboard-loading">
          <div className="loading-spinner" />
          <p>Loading tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="empty-state tickets-empty">
          <TicketIcon size={34} />

          <h3>No tickets found</h3>

          <p>
            Try changing your filters or create a new ticket.
          </p>
        </div>
      ) : (
        <div className="tickets-container">

          {tickets.map((ticket) => (
            <div
              className="ticket-card"
              key={ticket._id}
              onClick={() =>
                navigate(`/tickets/${ticket._id}`)
              }
            >

              <div className="ticket-card-left">

                <div className="ticket-card-icon">
                  <TicketIcon size={19} />
                </div>

                <div>
                  <h3>{ticket.title}</h3>

                  <p>
                    {ticket.category} ·{" "}
                    {new Date(
                      ticket.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>

              </div>

              <div className="ticket-card-right">

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

                <ArrowUpRight
                  size={17}
                  className="ticket-arrow"
                />

              </div>

            </div>
          ))}

        </div>
      )}
    </div>
  );
};

export default Tickets;