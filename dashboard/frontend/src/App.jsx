import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const fetchStatus = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/status");

      if (!response.ok) {
        throw new Error("Failed to fetch monitoring status");
      }

      const data = await response.json();
      setStatus(data);
setHistory((prev) => [
  {
    status: data.status,
    output: data.output,
    time: new Date().toLocaleTimeString(),
  },
  ...prev,
].slice(0, 10));
setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard">
      <header className="header">
        <div>
          <h1>Sentinel<span>Watch</span></h1>
          <p>Website Monitoring & Downtime Alert System</p>
        </div>
        <div className="live">
          <span className="dot"></span> LIVE MONITORING
        </div>
      </header>

      <main>
        <div className="section-title">
          <h2>Monitoring Overview</h2>
          <p>Real-time infrastructure health</p>
        </div>

        {error ? (
          <div className="status-card critical">
            <h2>CONNECTION ERROR</h2>
            <p>{error}</p>
          </div>
        ) : !status ? (
          <div className="status-card">
            <h2>Loading monitoring data...</h2>
          </div>
        ) : (
          <>
            <div className={`status-card ${status.status.toLowerCase()}`}>
              <div className="status-icon">
                {status.status === "OK" ? "✓" : "!"}
              </div>
              <div>
                <p className="status-label">CURRENT SYSTEM STATUS</p>
                <h2>{status.status}</h2>
                <p>{status.output}</p>
              </div>
            </div>

            <div className="cards">
              <div className="card">
                <p>HOST</p>
                <h3>{status.host}</h3>
              </div>

              <div className="card">
                <p>MONITORED SERVICE</p>
                <h3>{status.service}</h3>
              </div>

              <div className="card">
                <p>STATUS</p>
                <h3 className={status.status === "OK" ? "green" : "red"}>
                  {status.status}
                </h3>
              </div>

              <div className="card">
                <p>LAST CHECK</p>
                <h3>
                  {new Date(Number(status.lastCheck) * 1000).toLocaleString()}
                </h3>
              </div>
            </div>
          </>
        )}

        <div className="section-title">
          <h2>Monitoring Details</h2>
        </div>

        <div className="details">
          <div className="detail-row">
            <span>Monitoring Engine</span>
            <strong>Nagios Core 4</strong>
          </div>
          <div className="detail-row">
            <span>Monitoring Method</span>
            <strong>HTTP Health Check</strong>
          </div>
          <div className="detail-row">
            <span>Refresh Interval</span>
            <strong>5 Seconds</strong>
          </div>
          <div className="detail-row">
            <span>Alert System</span>
            <strong>Email Notifications</strong>
          </div>
          <div className="detail-row">
            <span>Infrastructure</span>
            <strong>Vagrant + Ansible</strong>
          </div>
        </div>
      </main>
       <div className="section-title">
  <h2>Recent Monitoring History</h2>
  <p>Latest monitoring checks</p>
</div>

<div className="details">
  {history.length === 0 ? (
    <p>No monitoring history available.</p>
  ) : (
    history.map((item, index) => (
      <div className="detail-row" key={index}>
        <span>{item.time}</span>
        <strong className={item.status === "OK" ? "green" : "red"}>
          {item.status}
        </strong>
      </div>
    ))
  )}
</div>
      <footer>
        Website Downtime Alert System | Built with React, Node.js & Nagios
      </footer>
    </div>
  );
}

export default App;
