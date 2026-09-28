import { useEffect, useState } from "react";
import {
  Search,
  Ticket,
  UserPlus,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const AdminTickets = () => {
  const { accessToken } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(null);
  const [error, setError] = useState("");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [ticketsResponse, usersResponse] = await Promise.all([
        api.get("/tickets?limit=50", authConfig),
        api.get("/users/agents", authConfig),
      ]);

      setTickets(ticketsResponse.data.tickets);
      setAgents(usersResponse.data.agents);
    } catch (error) {
      console.error("Admin data loading error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load admin data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchData();
    }
  }, [accessToken]);

  const assignTicket = async (ticketId, agentId) => {
    if (!agentId) return;

    try {
      setAssigning(ticketId);

      const response = await api.patch(
        `/tickets/${ticketId}/assign`,
        { agentId },
        authConfig
      );

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket._id === ticketId
            ? response.data.ticket
            : ticket
        )
      );
    } catch (error) {
      console.error("Assignment failed:", error);

      alert(
        error.response?.data?.message ||
          "Failed to assign ticket."
      );
    } finally {
      setAssigning(null);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const value = search.toLowerCase();

    return (
      ticket.title.toLowerCase().includes(value) ||
      ticket.category.toLowerCase().includes(value) ||
      ticket.status.toLowerCase().includes(value)
    );
  });

  return (
    <div className="admin-tickets-page">

      <div className="admin-page-header">
        <div>
          <span className="page-eyebrow">
            ADMIN WORKSPACE
          </span>

          <h1>Ticket Management</h1>

          <p>
            Manage, assign and monitor all support tickets.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchData}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="admin-toolbar">

        <div className="admin-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="admin-ticket-count">
          {filteredTickets.length} tickets
        </div>

      </div>

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Loading tickets...</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="admin-empty">
          <Ticket size={34} />
          <h2>No tickets found</h2>
          <p>There are no tickets matching your search.</p>
        </div>
      ) : (
        <div className="admin-ticket-list">

          {filteredTickets.map((ticket) => (
            <div
              className="admin-ticket-card"
              key={ticket._id}
            >

              <div className="admin-ticket-main">

                <div className="admin-ticket-icon">
                  <Ticket size={20} />
                </div>

                <div>
                  <h3>{ticket.title}</h3>

                  <p>
                    {ticket.category} ·{" "}
                    {ticket.createdBy?.name || "Unknown user"}
                  </p>

                  <div className="admin-ticket-badges">

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

              </div>

              <div className="admin-assignment">

                <label>
                  <UserPlus size={15} />
                  Assign agent
                </label>

                <select
               value={
             typeof ticket.assignedTo === "object"
             ? ticket.assignedTo?._id || ""
             : ticket.assignedTo || ""
               }
               disabled={assigning === ticket._id}
                  onChange={(e) =>
                    assignTicket(
                      ticket._id,
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Unassigned
                  </option>

                  {agents.map((agent) => (
                    <option
                      key={agent._id}
                      value={agent._id}
                    >
                      {agent.name}
                    </option>
                  ))}
                </select>

                {assigning === ticket._id && (
                  <span className="assigning-text">
                    Assigning...
                  </span>
                )}

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
};

export default AdminTickets;