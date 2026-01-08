import React, { useState, useEffect, useCallback } from "react";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Analysis from "./pages/Analysis";
import DailyBudget from "./pages/DailyBudget";
import Investments from "./pages/Investments";
import Retirement from "./pages/Retirement";
import Goals from "./pages/Goals";
import Settings from "./pages/Settings";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import FinancialAssistant from "./pages/FinancialAssistant";
import Cards from "./pages/Cards";

// --- FUNÇÕES AUXILIARES (Sem 'export' = HMR Seguro) ---
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

function setCookie(name, value, hours) {
  const date = new Date();
  date.setTime(date.getTime() + hours * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
}

function deleteCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}

// --- COMPONENTE PRINCIPAL ---
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const authCookie = getCookie("financeapp_auth");
    return authCookie === "true";
  });

  const [currentRoute, setCurrentRoute] = useState(
    () => window.location.pathname
  );
  const [activeTab, setActiveTab] = useState("dashboard");

  const navigate = useCallback((path) => {
    setCurrentRoute(path);
    window.history.pushState({}, "", path);
  }, []);

  useEffect(() => {
    const checkAuth = setInterval(() => {
      const authCookie = getCookie("financeapp_auth");
      if (!authCookie && isAuthenticated) {
        setIsAuthenticated(false);
        navigate("/login");
      }
    }, 60000);
    return () => clearInterval(checkAuth);
  }, [isAuthenticated, navigate]);

  const handleLogin = useCallback(() => {
    setIsAuthenticated(true);
    setCookie("financeapp_auth", "true", 5);
    navigate("/dashboard");
  }, [navigate]);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    deleteCookie("financeapp_auth");
    localStorage.removeItem("financeapp_username");
    navigate("/");
  }, [navigate]);

  useEffect(() => {
    const handlePopState = () => setCurrentRoute(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const renderPage = () => {
    if (currentRoute === "/") return <LandingPage onNavigate={navigate} />;
    if (currentRoute === "/login")
      return <LoginPage onLogin={handleLogin} onNavigate={navigate} />;

    if (currentRoute === "/dashboard") {
      if (!isAuthenticated) {
        navigate("/login");
        return null;
      }

      const pageContent = () => {
        switch (activeTab) {
          case "dashboard":
            return <Dashboard />;
          case "analysis":
            return <Analysis />;
          case "budget":
            return <DailyBudget />;
          case "investments":
            return <Investments />;
          case "retirement":
            return <Retirement />;
          case "goals":
            return <Goals />;
          case "cards":
            return <Cards />;
          case "settings":
            return <Settings />;
          default:
            return <Dashboard />;
        }
      };

      return (
        <>
          <Layout
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
          >
            {pageContent()}
          </Layout>
          <FinancialAssistant />
        </>
      );
    }

    // Fallback
    return <LandingPage onNavigate={navigate} />;
  };

  return <div className="app-container">{renderPage()}</div>;
}

export default App;
