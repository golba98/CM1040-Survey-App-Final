import { createRoot } from "react-dom/client";
import { AdminDashboard } from "./admin/AdminDashboard";
import { SurveyApp } from "./survey/SurveyApp";
import "./styles.css";
import "./admin.css";
import "./theme.css";

const root = createRoot(document.getElementById("root")!);
root.render(location.pathname.startsWith("/admin") ? <AdminDashboard /> : <SurveyApp />);
