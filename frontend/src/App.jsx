import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import Tickets from "./pages/Tickets";
import CreateTicket from "./pages/CreateTicket";
import TicketDetails from "./pages/TicketDetails";
import Notifications from "./pages/Notifications";
import AdminTickets from "./pages/AdminTickets";
import AgentTickets from "./pages/AgentTickets";
import Register from "./pages/Register";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />

          <Route
         path="/tickets"
         element={<Tickets />}/>
         <Route path="/tickets/create" element={<CreateTicket />} />
          <Route
  path="/admin/tickets"
  element={<AdminTickets />}
/>
          
          <Route
  path="/agent/tickets"
  element={<AgentTickets />}
/>
          
          <Route
  path="/tickets/:id"
  element={<TicketDetails />}
/>

          <Route
  path="/notifications"
  element={<Notifications />}
/>
          
          <Route
            path="/settings"
            element={<h1>Settings</h1>}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;