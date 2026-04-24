import { useState } from "react";

const REPO = "lohith-kumar-08/myntra_clone";
const CR_LABELS = ["CR:New", "CR:Approved", "CR:In Progress", "CR:Done", "CR:Deployed", "CR:Hold", "CR:Rejected"];

const getCRStatus = (labels) => {
  const order = ["CR:Deployed", "CR:Done", "CR:In Progress", "CR:Approved", "CR:Hold", "CR:Rejected", "CR:New"];
  for (const s of order) {
    if (labels.includes(s)) return s;
  }
  return "-";
};

const extractFromComment = (comments, keyword) => {
  for (const c of comments) {
    const lines = c.body.split("\n");
    for (const line of lines) {
      if (line.includes(keyword)) {
        const val = line.split("|").map(s => s.trim()).filter(Boolean);
        return val[val.length - 1]?.replace(/@/g, "") || "-";
      }
    }
  }
  return "-";
};

const extractPR = (comments) => {
  for (const c of comments) {
    const match = c.body.match(/\*\*PR\*\*.*#(\d+)/);
    if (match) return `#${match[1]}`;
  }
  return "-";
};

const extractCommit = (comments) => {
  for (const c of comments) {
    const match = c.body.match(/`([a-f0-9]{40})`/);
    if (match) return match[1].substring(0, 7);
  }
  return "-";
};

const statusColor = (status) => {
  const colors = {
    "CR:New": "#E4E669",
    "CR:Approved": "#0075CA",
    "CR:In Progress": "#F9A825",
    "CR:Done": "#6F42C1",
    "CR:Deployed": "#2EA44F",
    "CR:Hold": "#F97316",
    "CR:Rejected": "#D73A4A",
  };
  return colors[status] || "#888";
};

const CRReport = () => {
  const [token, setToken] = useState("");
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState(false);

  const fetchReport = async () => {
    if (!token) {
      setError("Please enter your GitHub Personal Access Token.");
      return;
    }
    setLoading(true);
    setError("");
    setReport([]);

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      };

      // Fetch all issues
      let allIssues = [];
      let page = 1;
      while (true) {
        const res = await fetch(
          `https://api.github.com/repos/${REPO}/issues?state=all&per_page=100&page=${page}`,
          { headers }
        );
        if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
        const data = await res.json();
        if (data.length === 0) break;
        allIssues = [...allIssues, ...data];
        page++;
      }

      // Filter only issues (not PRs) with CR labels
      const crIssues = allIssues.filter(issue => {
        if (issue.pull_request) return false;
        const labelNames = issue.labels.map(l => l.name);
        return labelNames.some(l => CR_LABELS.includes(l));
      });

      // Fetch comments for each issue
      const rows = await Promise.all(
        crIssues.map(async (issue) => {
          const commRes = await fetch(
            `https://api.github.com/repos/${REPO}/issues/${issue.number}/comments?per_page=100`,
            { headers }
          );
          const comments = commRes.ok ? await commRes.json() : [];
          const labelNames = issue.labels.map(l => l.name);

          return {
            id: `#${issue.number}`,
            title: issue.title,
            status: getCRStatus(labelNames),
            createdAt: issue.created_at?.split("T")[0] || "-",
            approvedBy: extractFromComment(comments, "Approved By"),
            approvalDate: extractFromComment(comments, "Approval Date"),
            pr: extractPR(comments),
            commitSha: extractCommit(comments),
            mergedDate: extractFromComment(comments, "Merge Date"),
            deployedAt: extractFromComment(comments, "Deployed At"),
            deployApprovedBy: extractFromComment(comments, "Deployment Approved By"),
            url: issue.html_url,
          };
        })
      );

      setReport(rows);
      setGenerated(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    const headers = ["CR_ID", "Title", "Status", "Created At", "Approved By", "Approval Date", "PR", "Commit SHA", "Merged Date", "Deployed At", "Deploy Approved By"];
    const rows = report.map(r => [
      r.id, `"${r.title}"`, r.status, r.createdAt, r.approvedBy,
      r.approvalDate, r.pr, r.commitSha, r.mergedDate, r.deployedAt, r.deployApprovedBy
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cr-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div style={{ padding: "32px", fontFamily: "sans-serif", maxWidth: "1200px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "8px" }}>Change Request Report</h2>
      <p style={{ color: "#666", marginBottom: "24px" }}>
        Repo: <code>{REPO}</code>
      </p>

      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", alignItems: "center" }}>
        <input
          type="password"
          placeholder="GitHub Personal Access Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          style={{
            padding: "10px 14px", borderRadius: "6px", border: "1px solid #ccc",
            width: "360px", fontSize: "14px"
          }}
        />
        <button
          onClick={fetchReport}
          disabled={loading}
          style={{
            padding: "10px 24px", background: loading ? "#aaa" : "#2EA44F",
            color: "#fff", border: "none", borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer", fontSize: "14px", fontWeight: "600"
          }}
        >
          {loading ? "Generating..." : "Generate Report"}
        </button>

        {generated && report.length > 0 && (
          <button
            onClick={downloadCSV}
            style={{
              padding: "10px 24px", background: "#0075CA", color: "#fff",
              border: "none", borderRadius: "6px", cursor: "pointer",
              fontSize: "14px", fontWeight: "600"
            }}
          >
            Download CSV
          </button>
        )}
      </div>

      {error && (
        <div style={{ color: "#D73A4A", marginBottom: "16px", padding: "12px", background: "#fff0f0", borderRadius: "6px" }}>
          {error}
        </div>
      )}

      {generated && report.length === 0 && !loading && (
        <p style={{ color: "#666" }}>No Change Requests found with CR labels.</p>
      )}

      {report.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#f6f8fa", textAlign: "left" }}>
                {["CR ID", "Title", "Status", "Created", "Approved By", "Approval Date", "PR", "Commit", "Merged", "Deployed At", "Deploy Approved By"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", borderBottom: "2px solid #e1e4e8", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #e1e4e8", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ padding: "10px 12px" }}>
                    <a href={row.url} target="_blank" rel="noreferrer" style={{ color: "#0075CA", textDecoration: "none" }}>{row.id}</a>
                  </td>
                  <td style={{ padding: "10px 12px", maxWidth: "200px" }}>{row.title}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{
                      background: statusColor(row.status), color: "#fff",
                      padding: "3px 10px", borderRadius: "12px", fontSize: "12px", whiteSpace: "nowrap"
                    }}>
                      {row.status}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>{row.createdAt}</td>
                  <td style={{ padding: "10px 12px" }}>{row.approvedBy}</td>
                  <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>{row.approvalDate}</td>
                  <td style={{ padding: "10px 12px" }}>{row.pr}</td>
                  <td style={{ padding: "10px 12px" }}><code>{row.commitSha}</code></td>
                  <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>{row.mergedDate}</td>
                  <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>{row.deployedAt}</td>
                  <td style={{ padding: "10px 12px" }}>{row.deployApprovedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CRReport;
