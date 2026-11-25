const express = require("express");
const cors = require("cors");
const { execFile } = require("child_process");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

const projectRoot = path.resolve(__dirname, "../..");

let latestStatus = null;
const history = [];

function getNagiosStatus(callback) {
  execFile(
    "vagrant",
    ["ssh", "monitor", "-c", "sudo cat /var/lib/nagios4/status.dat"],
    { cwd: projectRoot, timeout: 15000 },
    (error, stdout) => {
      if (error) return callback(error);

      const blocks = stdout.match(/servicestatus\s*\{[^}]*\}/g) || [];

      const service = blocks
        .map((block) => {
          const fields = {};

          block.replace(/^\s*(\w+)=([^\n]*)/gm, (_, key, value) => {
            fields[key] = value.trim();
          });

          return fields;
        })
        .find(
          (item) =>
            item.host_name === "monitored-website" &&
            item.service_description === "HTTP Website Availability"
        );

      if (!service) {
        return callback(new Error("Monitored service not found"));
      }

      callback(null, service);
    }
  );
}

function collectData() {
  getNagiosStatus((error, service) => {
    if (error) {
      console.error("Monitoring collection error:", error.message);
      return;
    }

    const states = {
      0: "OK",
      1: "WARNING",
      2: "CRITICAL",
      3: "UNKNOWN",
    };

    const output = service.plugin_output || "";
    const timeMatch = output.match(/(?:time=([\d.]+)s|in\s+([\d.]+)\s+second(?:s)?\s+response time)/i);
    const data = {
      host: service.host_name,
      service: service.service_description,
      status: states[service.current_state] || "UNKNOWN",
      output,
      lastCheck: service.last_check,
      lastStateChange: service.last_state_change,
      responseTime: timeMatch
      ? Number(timeMatch[1] || timeMatch[2]) * 1000
      : null,
      recordedAt: new Date().toISOString(),
    };

    latestStatus = data;

    history.unshift(data);
    if (history.length > 500) history.pop();
  });
}

collectData();
setInterval(collectData, 5000);

app.get("/api/status", (req, res) => {
  if (!latestStatus) {
    return res.status(503).json({ error: "Monitoring data not yet available" });
  }

  res.json(latestStatus);
});

app.get("/api/history", (req, res) => {
  const total = history.length;
  const okCount = history.filter((item) => item.status === "OK").length;

  res.json({
    samples: history,
    totalChecks: total,
    uptimePercentage: total ? Number(((okCount / total) * 100).toFixed(2)) : 0,
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Monitoring API running at http://localhost:${PORT}`);
});
