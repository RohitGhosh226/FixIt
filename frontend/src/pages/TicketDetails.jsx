import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Clock3,
  User,
  MessageSquare,
  Send,
  Paperclip,
  Activity,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken,user } = useAuth();
  console.log("CURRENT USER:", user);

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);

  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState("");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        setLoading(true);
        setError("");

        const [ticketResponse, commentsResponse, activityResponse] =
          await Promise.all([
            api.get(`/tickets/${id}`, authConfig),
            api.get(`/comments/${id}`, authConfig),
            api.get(`/activity/${id}`, authConfig),
          ]);

        setTicket(ticketResponse.data.ticket);
        setComments(commentsResponse.data.comments);
        setActivities(activityResponse.data.activities);
      } catch (error) {
        console.error("Failed to load ticket:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load ticket."
        );
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchTicketData();
    }
  }, [id, accessToken]);

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!comment.trim()) return;

    try {
      setCommentLoading(true);

      const response = await api.post(
        `/comments/${id}`,
        {
          message: comment,
        },
        authConfig
      );

      setComments((prev) => [...prev, response.data.comment]);
      setComment("");
      
      // Refresh activity after adding comment
      const activityResponse = await api.get(
        `/activity/${id}`,
        authConfig
      );

      setActivities(activityResponse.data.activities);
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setCommentLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getStatusClass = (status) => {
    return `status-badge status-${status}`;
  };

  const getPriorityClass = (priority) => {
    return `priority-badge priority-${priority}`;
  };

  if (loading) {
    return (
      <div className="ticket-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading ticket...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="ticket-details-error">
        <h2>Unable to load ticket</h2>
        <p>{error || "Ticket not found."}</p>

        <button onClick={() => navigate("/tickets")}>
          <ArrowLeft size={18} />
          Back to Tickets
        </button>
      </div>
    );
  }

  return (
    <div className="ticket-details-page">

      {/* Back */}
      <button
        className="back-button"
        onClick={() => navigate("/tickets")}
      >
        <ArrowLeft size={18} />
        Back to Tickets
      </button>

      {/* Header */}
<div className="ticket-details-header">
  <div>
    <span className="page-eyebrow">
      TICKET DETAILS
    </span>

    <h1>{ticket.title}</h1>

    <div className="ticket-meta">
      <span className={getStatusClass(ticket.status)}>
        {ticket.status}
      </span>

      <span className={getPriorityClass(ticket.priority)}>
        {ticket.priority}
      </span>

      <span className="ticket-category">
        {ticket.category}
      </span>
    </div>

    {user?.role === "agent" &&
      ticket.assignedTo?._id === user.id && (
        <div className="agent-status-control">
          <label>Update status</label>

          <select
            value={ticket.status}
            onChange={async (e) => {
              try {
                const newStatus = e.target.value;

                const response = await api.put(
                  `/tickets/${ticket._id}`,
                  { status: newStatus },
                  authConfig
                );

                setTicket(response.data.ticket);

                const activityResponse = await api.get(
                  `/activity/${ticket._id}`,
                  authConfig
                );

                setActivities(
                  activityResponse.data.activities
                );
              } catch (error) {
                console.error(
                  "Failed to update status:",
                  error
                );
              }
            }}
          >
            <option value="open">Open</option>
            <option value="in-progress">
              In Progress
            </option>
            <option value="resolved">
              Resolved
            </option>
            <option value="closed">
              Closed
            </option>
          </select>
        </div>
      )}
  </div>
</div>

      {/* Main layout */}
      <div className="ticket-details-grid">

        {/* Left */}
        <div className="ticket-details-main">

          {/* Description */}
          <section className="details-card">

            <div className="details-card-header">
              <h2>Description</h2>
            </div>

            <p className="ticket-description">
              {ticket.description}
            </p>

          </section>

          {/* Comments */}
          <section className="details-card">

            <div className="details-card-header">
              <div className="section-title">
                <MessageSquare size={19} />
                <h2>Comments</h2>
              </div>

              <span className="comment-count">
                {comments.length}
              </span>
            </div>

            <div className="comments-list">

              {comments.length === 0 ? (
                <div className="empty-comments">
                  <MessageSquare size={28} />
                  <p>No comments yet.</p>
                  <span>
                    Start the conversation below.
                  </span>
                </div>
              ) : (
                comments.map((item) => (
                  <div
                    className="comment-item"
                    key={item._id}
                  >
                    <div className="comment-avatar">
                      {item.user?.name
                        ?.charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="comment-content">

                      <div className="comment-top">
                        <strong>
                          {item.user?.name || "User"}
                        </strong>

                        <span>
                          {formatDate(item.createdAt)}
                        </span>
                      </div>

                      <p>{item.message}</p>

                    </div>
                  </div>
                ))
              )}

            </div>

            {/* Add comment */}
            <form
              className="comment-form"
              onSubmit={handleAddComment}
            >
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                rows="3"
              />

              <button
                type="submit"
                disabled={commentLoading || !comment.trim()}
              >
                <Send size={17} />

                {commentLoading
                  ? "Sending..."
                  : "Add Comment"}
              </button>
            </form>

          </section>

        </div>

        {/* Right */}
        <aside className="ticket-details-sidebar">

          {/* Information */}
          <section className="details-card">

            <div className="details-card-header">
              <h2>Ticket Information</h2>
            </div>

            <div className="ticket-info-list">

              <div className="ticket-info-item">
                <span>
                  <User size={16} />
                  Created by
                </span>

                <strong>
                  {ticket.createdBy?.name || "You"}
                </strong>
              </div>

              <div className="ticket-info-item">
                <span>
                  <User size={16} />
                  Assigned to
                </span>

                <strong>
                  {ticket.assignedTo?.name || "Unassigned"}
                </strong>
              </div>

              <div className="ticket-info-item">
                <span>
                  <Clock3 size={16} />
                  Created
                </span>

                <strong>
                  {formatDate(ticket.createdAt)}
                </strong>
              </div>

              <div className="ticket-info-item">
                <span>
                  Updated
                </span>

                <strong>
                  {formatDate(ticket.updatedAt)}
                </strong>
              </div>

            </div>

          </section>

          {/* Attachments */}
          <section className="details-card">

            <div className="details-card-header">
              <div className="section-title">
                <Paperclip size={18} />
                <h2>Attachments</h2>
              </div>
            </div>

            {ticket.attachments?.length === 0 ? (
              <div className="no-attachments">
                No attachments
              </div>
            ) : (
              <div className="attachments-list">
                {ticket.attachments.map((file, index) => (
                  <a
                    href={`http://localhost:5000${file}`}
                    target="_blank"
                    rel="noreferrer"
                    key={index}
                  >
                    <Paperclip size={15} />
                    Attachment {index + 1}
                  </a>
                ))}
              </div>
            )}

          </section>

          {/* Activity */}
          <section className="details-card">

            <div className="details-card-header">
              <div className="section-title">
                <Activity size={18} />
                <h2>Activity</h2>
              </div>
            </div>

            <div className="activity-list">

              {activities.length === 0 ? (
                <div className="no-activity">
                  No activity yet.
                </div>
              ) : (
                activities.map((item) => (
                  <div
                    className="activity-item"
                    key={item._id}
                  >
                    <div className="activity-dot"></div>

                    <div>
                      <strong>
                        {item.user?.name || "User"}
                      </strong>

                      <p>{item.details}</p>

                      <span>
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}

            </div>

          </section>

        </aside>

      </div>
    </div>
  );
};

export default TicketDetails;