import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Users, BookOpen, Layers, Target 
} from "lucide-react";
import api from "../../api/axios";
import "./StuProjectDetails.css";

export default function StuProjectDetails() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0 });

  useEffect(() => {
    fetchLiveProjects();
  }, []);

  const fetchLiveProjects = async () => {
    try {
      setLoading(true);
      
      const [groupsRes, staffRes, mappingRes, typesRes] = await Promise.all([
        api.get("/groups"),
        api.get("/master/staff"),
        api.get("/project-group-members"),
        api.get("/master/project-types")
      ]);

      const groups = groupsRes.data.data || groupsRes.data || [];
      const staffList = staffRes.data.data || staffRes.data || [];
      const mappings = mappingRes.data.data || mappingRes.data || [];
      const projTypes = typesRes.data.data || typesRes.data || [];

      let approvedCount = 0;
      let pendingCount = 0;

      const liveCatalog = groups.map(g => {
        // Find Guide
        const guide = staffList.find(s => s.StaffID === g.GuideStaffID);
        
        // Find Type
        const pType = projTypes.find(pt => pt.ProjectTypeID === g.ProjectTypeID);

        // Count Members
        const studentsCount = mappings.filter(m => m.ProjectGroupID === g.ProjectGroupID).length;

        const status = g.ApprovalStatus || "Pending";
        if (status === "Approved") approvedCount++;
        if (status === "Pending") pendingCount++;

        return {
          id: g.ProjectGroupID,
          name: g.ProjectGroupName,
          guide: guide ? guide.StaffName : "Unassigned",
          type: pType ? pType.ProjectTypeName : "General Category",
          status: status,
          studentsCount: studentsCount
        };
      });

      setStats({
        total: liveCatalog.length,
        approved: approvedCount,
        pending: pendingCount
      });

      setProjects(liveCatalog);

    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.name || "").toLowerCase().includes(q) ||
      (p.guide || "").toLowerCase().includes(q) ||
      (p.type || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="spms-stuproj">
      <header className="spms-stuproj__header">
        <div className="spms-stuproj__title-group">
          <h1 className="spms-stuproj__title">Campus Project Catalog</h1>
          <p className="spms-stuproj__subtitle">Explore all registered projects and team formations across the college.</p>
        </div>
      </header>

      <div className="spms-stuproj__toolbar">
        <div className="spms-stuproj__search-wrapper">
          <Search size={18} className="spms-stuproj__search-icon" />
          <input 
            type="text" 
            placeholder="Search by project, guide, or category..." 
            className="spms-stuproj__search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="spms-stuproj__stats">
          <div className="spms-stuproj__stat-item">
            <span className="spms-stuproj__stat-value">{stats.total}</span>
            <span className="spms-stuproj__stat-label">Total Proposed</span>
          </div>
          <div className="spms-stuproj__stat-item">
            <span className="spms-stuproj__stat-value" style={{color: '#15803d'}}>{stats.approved}</span>
            <span className="spms-stuproj__stat-label">Approved</span>
          </div>
          <div className="spms-stuproj__stat-item">
            <span className="spms-stuproj__stat-value" style={{color: '#b45309'}}>{stats.pending}</span>
            <span className="spms-stuproj__stat-label">Pending Review</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="spms-stuproj__grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="spms-stuproj__skeleton-card"></div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="spms-stuproj__empty">
          <div className="spms-stuproj__empty-icon">
            <Target size={28} />
          </div>
          <h3 className="spms-stuproj__empty-title">
            {searchQuery ? "No Matches Found" : "No Projects Registered"}
          </h3>
          <p className="spms-stuproj__empty-subtitle">
            {searchQuery 
              ? "Try adjusting your search criteria." 
              : "There are currently no projects proposed by any student groups."}
          </p>
        </div>
      ) : (
        <div className="spms-stuproj__grid">
          <AnimatePresence>
            {filteredProjects.map((p) => {
              const badgeClass = p.status === 'Approved' ? 'spms-stuproj__badge--approved' 
                               : p.status === 'Rejected' ? 'spms-stuproj__badge--rejected'
                               : 'spms-stuproj__badge--pending';

              return (
                <motion.div 
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="spms-stuproj__card"
                >
                  <div className="spms-stuproj__card-header">
                    <div>
                      <h3 className="spms-stuproj__card-title">{p.name}</h3>
                      <p className="spms-stuproj__card-id">ID: {p.id}</p>
                    </div>
                    <span className={`spms-stuproj__badge ${badgeClass}`}>{p.status}</span>
                  </div>

                  <div className="spms-stuproj__details">
                    <div className="spms-stuproj__detail-row">
                      <Layers size={16} className="spms-stuproj__detail-icon" />
                      <span>{p.type}</span>
                    </div>
                    <div className="spms-stuproj__detail-row">
                      <BookOpen size={16} className="spms-stuproj__detail-icon" />
                      <span>Guide: <strong>{p.guide}</strong></span>
                    </div>
                  </div>

                  <div className="spms-stuproj__footer">
                    <div className="spms-stuproj__taken">
                      <Users size={16} /> Taken By Group
                    </div>
                    <span className="spms-stuproj__count">
                      {p.studentsCount} {p.studentsCount === 1 ? 'Student' : 'Students'}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}