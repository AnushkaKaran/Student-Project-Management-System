import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="grid">
        <div>
          <h4>About</h4>
          <p>
            Final Year Project Dashboard — clarity, consistency, exportable reports.
          </p>
        </div>
        <div>
          <h4>Contact</h4>
          <p>Email: projectsupport@example.com</p>
          <p>GitHub: github.com/example</p>
        </div>
        <div>
          <h4>Links</h4>
          <p><a href="#features">Features</a></p>
          <p><a href="#reports">Reports</a></p>
        </div>
      </div>
      <div className="copy">© 2026 Final Year Project Dashboard</div>
    </footer>
  );
}