import { useState } from "react";
import { ArrowLeft, Send, Ticket, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const CreateTicket = () => {
  const navigate = useNavigate();
  const { accessToken } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.title.trim() || !formData.description.trim() || !formData.category.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/tickets", formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      navigate("/tickets");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to create ticket. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-ticket-page">

      <button
        className="back-button"
        onClick={() => navigate("/tickets")}
      >
        <ArrowLeft size={18} />
        Back to Tickets
      </button>

      <div className="create-ticket-header">
        <div className="create-ticket-icon">
          <Ticket size={24} />
        </div>

        <div>
          <span className="page-eyebrow">SUPPORT CENTER</span>
          <h1>Create a Ticket</h1>
          <p>
            Tell us what went wrong and we'll help you get it resolved.
          </p>
        </div>
      </div>

      <div className="create-ticket-card">

        {error && (
          <div className="form-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label htmlFor="title">
              Ticket Title <span>*</span>
            </label>

            <input
              id="title"
              name="title"
              type="text"
              placeholder="e.g. Laptop not connecting to Wi-Fi"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Description <span>*</span>
            </label>

            <textarea
              id="description"
              name="description"
              rows="6"
              placeholder="Describe the problem in detail..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">

            <div className="form-group">
              <label htmlFor="category">
                Category <span>*</span>
              </label>

              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select category</option>
                <option value="Technical">Technical</option>
                <option value="Network">Network</option>
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Account">Account</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">
                Priority
              </label>

              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

          </div>

          <div className="form-actions">

            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate("/tickets")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="submit-ticket-button"
              disabled={loading}
            >
              <Send size={18} />

              {loading ? "Creating..." : "Create Ticket"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateTicket;