import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Phone, MapPin, Send, CheckCircle2, Globe
} from "lucide-react";
import "./ContactUs.css";

export default function ContactUs() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate network request since there is no backend route for Contact
    setTimeout(() => {
      setLoading(false);
      setToast(true);
      setFormData({ name: "", email: "", message: "" });
      
      setTimeout(() => setToast(false), 4000);
    }, 1200);
  };

  return (
    <section className="spms-contact">
      
      <div className="spms-contact__header">
        <h2 className="spms-contact__title">Get in Touch</h2>
        <p className="spms-contact__subtitle">
          Have questions about the ProjexHub platform or need technical support? 
          Reach out to our administrative team and we’ll get back to you promptly.
        </p>
      </div>

      <div className="spms-contact__grid">
        
        {/* Left Col: Contact Info */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.4 }}
          className="spms-contact__info-col"
        >
          <div className="spms-contact__info-card">
            <div className="spms-contact__icon-wrapper">
              <Mail size={24} />
            </div>
            <div className="spms-contact__info-content">
              <h3>Email Support</h3>
              <p>support@projexhub.edu</p>
            </div>
          </div>

          <div className="spms-contact__info-card">
            <div className="spms-contact__icon-wrapper">
              <Phone size={24} />
            </div>
            <div className="spms-contact__info-content">
              <h3>Phone Technical Desk</h3>
              <p>+91 98765 43210 (Ext. 204)</p>
            </div>
          </div>

          <div className="spms-contact__info-card">
            <div className="spms-contact__icon-wrapper">
              <MapPin size={24} />
            </div>
            <div className="spms-contact__info-content">
              <h3>Campus Office</h3>
              <p>Block A, Administrative Wing, Ground Floor</p>
            </div>
          </div>
          
          <div className="spms-contact__info-card">
            <div className="spms-contact__icon-wrapper">
              <Globe size={24} />
            </div>
            <div className="spms-contact__info-content">
              <h3>Open Source</h3>
              <p>github.com/university/projexhub</p>
            </div>
          </div>
        </motion.div>

        {/* Right Col: Form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.4, delay: 0.1 }}
          className="spms-contact__form-card"
        >
          <form className="spms-contact__form" onSubmit={handleSubmit}>
            <div className="spms-contact__field">
              <label className="spms-contact__label">Full Name</label>
              <input 
                type="text" 
                className="spms-contact__input"
                placeholder="Enter your name" 
                required 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                disabled={loading}
              />
            </div>

            <div className="spms-contact__field">
              <label className="spms-contact__label">University Email</label>
              <input 
                type="email" 
                className="spms-contact__input"
                placeholder="name@university.edu" 
                required 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                disabled={loading}
              />
            </div>

            <div className="spms-contact__field">
              <label className="spms-contact__label">Message</label>
              <textarea 
                className="spms-contact__textarea"
                placeholder="How can we help you?" 
                rows="5" 
                required
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                disabled={loading}
              ></textarea>
            </div>

            <button type="submit" className="spms-contact__btn" disabled={loading}>
              {loading ? (
                <div className="spms-contact__spinner"></div>
              ) : (
                <><Send size={18} /> Send Message</>
              )}
            </button>
          </form>
        </motion.div>

      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="spms-contact__toast"
          >
            <CheckCircle2 size={24} style={{ color: '#10b981', marginTop: '2px' }} />
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
                Message Sent
              </h4>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748b' }}>
                Thank you! We will get back to you shortly.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}