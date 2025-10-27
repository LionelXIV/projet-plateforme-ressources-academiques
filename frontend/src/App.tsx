import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "../src/composants/header";
import Home from "./pages/Home";
import Publish from "./pages/PagesAdmin/publier";
import Dashboard from "./pages/PagesAdmin/tableauDeBord";
import Login from "./pages/PagesAdmin/Login";
import NotFound from "./pages/Page404";
import DetailCours from "./pages/CaseContenu";


export default function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/publier" element={<Publish />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/details/:id" element={<DetailCours />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
