"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './contact.module.css';

function ContactPageInner() {
  const searchParams = useSearchParams();
  const subjectParam = searchParams.get('subject');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'general',
    message: '',
    measurements: '',
    materials: '',
    sampleImage: null as File | null
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeLocation, setActiveLocation] = useState<'nagercoil' | 'chennai'>('nagercoil');

  useEffect(() => {
    if (subjectParam) {
      setFormData(prev => ({ ...prev, subject: subjectParam }));
    }
  }, [subjectParam]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'file') {
      const fileInput = e.target as HTMLInputElement;
      setFormData({ ...formData, sampleImage: fileInput.files ? fileInput.files[0] : null });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          fd.append(key, value as any);
        }
      });

      const resp = await fetch('/api/contact', {
        method: 'POST',
        body: fd
      });
      
      if (resp.ok) {
        setSubmitted(true);
      } else {
        const errorData = await resp.json();
        alert(`Error: ${errorData.error || 'Failed to dispatch inquiry'}`);
      }
    } catch (err) {
      alert('Technical connection failed. Please check your heritage network.');
    } finally {
      setSending(false);
    }
  };

  const isValid = formData.name.length > 1 && formData.email.includes('@') && formData.message.length > 10;

  const locations = {
    nagercoil: {
      name: 'Nagercoil — Heritage Headquarters',
      address: (
        <>
          Lemuria Varmakalari Adimurai<br />
          World Organization, Thaikalam,<br />
          Ramanathichanputhur, Marungoor,<br />
          Kanyakumari District,<br />
          Tamil Nadu — 629402
        </>
      ),
      mapSrc: 'https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d1000!2d77.431838!3d8.182164!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zOMKwMTAnNTUuNiJOIDc3wrAyNSc1NC42IkU!5e0!3m2!1sen!2sin!4v1774846957616',
      mapsLink: 'https://www.google.com/maps?q=8.182164,77.431838',
    },
    chennai: {
      name: 'Chennai — Southern Command',
      address: (
        <>
          Lemuria Varmakalari Adimurai<br />
          World Organization,<br />
          Chennai, Tamil Nadu
        </>
      ),
      mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d299.9319730848278!2d80.20487359963626!3d12.98937986597716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5267196a4746dd%3A0x9ac9246652b5dab0!2sLemuria%20Varmakalari%20Adimurai%20World%20Organization!5e1!3m2!1sen!2sin!4v1774846957616!5m2!1sen!2sin',
      mapsLink: 'https://www.google.com/maps?q=12.989347,80.204967',
    },
  };

  const current = locations[activeLocation];

  return (
    <section className={styles.contactPage}>
      {/* Hero */}
      <div className={styles.heroSection}>
        <span className={styles.tagline}>Heritage Communications</span>
        <h1 className={styles.title}>Contact Us</h1>
        <p className={styles.subtitle}>
          Reach out to our heritage curators for inquiries about artifacts, 
          training programs, or custom commissions.
        </p>
        <div className={styles.divider}></div>
      </div>

      {/* Main Grid */}
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Left: Contact Info Cards */}
          <div className={styles.infoPanel}>
            <div className={styles.infoCard}>
              <div className={styles.infoCardIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <div className={styles.infoCardLabel}>Nagercoil — Headquarters</div>
              <div className={styles.infoCardValue}>
                Lemuria Varmakalari Adimurai<br />
                World Organization, Thaikalam,<br />
                Ramanathichanputhur, Marungoor,<br />
                Kanyakumari District,<br />
                Tamil Nadu — 629402
              </div>
              <p className={styles.infoCardNote}>Visit by appointment only</p>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoCardIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <div className={styles.infoCardLabel}>Chennai — Southern Command</div>
              <div className={styles.infoCardValue}>
                Lemuria Heritage<br />
                Chennai Branch,<br />
                Tamil Nadu
              </div>
              <p className={styles.infoCardNote}>
                <a href="https://maps.app.goo.gl/xYp129jVzwAGrceW8" target="_blank" rel="noopener noreferrer" style={{ color: '#BF953F' }}>
                  View on Google Maps →
                </a>
              </p>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoCardIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <div className={styles.infoCardLabel}>Direct Line</div>
              <div className={styles.infoCardValue}>
                <a href="tel:+919944776601">+91 99447 76601</a><br />
                <a href="tel:+917708244424">+91 77082 44424</a>
              </div>
              <p className={styles.infoCardNote}>Available Mon–Sat, 9 AM – 6 PM IST</p>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoCardIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <div className={styles.infoCardLabel}>Email Archive</div>
              <div className={styles.infoCardValue}>
                <a href="mailto:lemuriamas@gmail.com">lemuriamas@gmail.com</a>
              </div>
              <p className={styles.infoCardNote}>We respond within 24 hours</p>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className={styles.formPanel}>
            {submitted ? (
              <div className={styles.successMessage}>
                <span className={styles.successIcon}>✦</span>
                <h3>Message Dispatched</h3>
                <p>
                  Your inquiry has been received by our heritage curators. 
                  We will respond within 24 hours via the email you provided.
                </p>
              </div>
            ) : (
              <>
                <div className={styles.formTitle}>Send an Inquiry</div>
                <p className={styles.formSubtitle}>
                  Fill out the form below and a member of our curatorial 
                  team will reach out to you promptly.
                </p>
                <form onSubmit={handleSubmit}>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label htmlFor="contact-name">YOUR NAME</label>
                      <input 
                        id="contact-name"
                        name="name" 
                        type="text" 
                        placeholder="Full Name" 
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="contact-email">EMAIL ADDRESS</label>
                      <input 
                        id="contact-email"
                        name="email" 
                        type="email" 
                        placeholder="you@example.com" 
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="contact-phone">PHONE NUMBER</label>
                      <input 
                        id="contact-phone"
                        name="phone" 
                        type="tel" 
                        placeholder="+91 XXXXX XXXXX" 
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="contact-subject">INQUIRY TYPE</label>
                      <select 
                        id="contact-subject"
                        name="subject" 
                        value={formData.subject}
                        onChange={handleChange}
                      >
                        <option value="general">General Inquiry</option>
                        <option value="order">Order Support</option>
                        <option value="custom">Custom Order</option>
                        <option value="training">Training Programs</option>
                        <option value="wholesale">Wholesale / Bulk</option>
                        <option value="media">Media & Press</option>
                      </select>
                    </div>

                    {/* Custom Fields (Conditional or grouped) */}
                    {formData.subject === 'custom' && (
                      <>
                        <div className={`${styles.formGroup} ${styles.formGroupFull} ${styles.fadeSlideIn}`}>
                          <label htmlFor="contact-sample">UPLOAD SAMPLE IMAGE (OPTIONAL)</label>
                          <div className={styles.fileUploadWrapper}>
                            <input 
                              id="contact-sample"
                              name="sampleImage" 
                              type="file" 
                              accept="image/*"
                              onChange={handleChange}
                              className={styles.fileInput}
                            />
                            <div className={styles.fileUploadText}>
                              {formData.sampleImage ? formData.sampleImage.name : 'CLICK TO UPLOAD SAMPLE IMAGE'}
                            </div>
                          </div>
                        </div>
                        <div className={`${styles.formGroup} ${styles.fadeSlideIn}`}>
                          <label htmlFor="contact-measurements">MEASUREMENT DETAILS</label>
                          <input 
                            id="contact-measurements"
                            name="measurements" 
                            type="text" 
                            placeholder="e.g. Length, Width, Weight" 
                            value={formData.measurements}
                            onChange={handleChange}
                          />
                        </div>
                        <div className={`${styles.formGroup} ${styles.fadeSlideIn}`}>
                          <label htmlFor="contact-materials">MATERIAL PREFERENCES</label>
                          <input 
                            id="contact-materials"
                            name="materials" 
                            type="text" 
                            placeholder="e.g. Steel, Wood, Brass" 
                            value={formData.materials}
                            onChange={handleChange}
                          />
                        </div>
                      </>
                    )}

                    <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                      <label htmlFor="contact-message">YOUR MESSAGE</label>
                      <textarea 
                        id="contact-message"
                        name="message" 
                        placeholder="Describe your inquiry in detail..." 
                        value={formData.message}
                        onChange={handleChange}
                        rows={6}
                        required
                      />
                    </div>
                  </div>

                  {formData.subject === 'custom' && (
                    <p className={styles.customNote}>
                      ✦ Further technical details and specifications will be discussed via a phone call after we review your request.
                    </p>
                  )}

                  <button 
                    type="submit" 
                    className={styles.submitBtn}
                    disabled={!isValid || sending}
                  >
                    {sending ? 'DISPATCHING...' : 'DISPATCH INQUIRY'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Map Section — Dual Location */}
        <div className={styles.mapSection}>
          <div className={styles.mapHeader}>
            <h3>Our Sanctuaries</h3>
          </div>
          <div className={styles.locationTabs}>
            <button 
              className={`${styles.locationTab} ${activeLocation === 'nagercoil' ? styles.locationTabActive : ''}`}
              onClick={() => setActiveLocation('nagercoil')}
            >
              <span className={styles.tabDot}></span>
              NAGERCOIL — HQ
            </button>
            <button 
              className={`${styles.locationTab} ${activeLocation === 'chennai' ? styles.locationTabActive : ''}`}
              onClick={() => setActiveLocation('chennai')}
            >
              <span className={styles.tabDot}></span>
              CHENNAI
            </button>
          </div>
          <div className={styles.mapInfo}>
            <span className={styles.mapLocationName}>{current.name}</span>
            <span className={styles.mapLocationAddress}>{current.address}</span>
          </div>
          <div className={styles.mapWrapper}>
            <iframe
              key={activeLocation}
              src={current.mapSrc}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`${current.name} Location`}
            />
          </div>
          <div className={styles.mapActions}>
            <a 
              href={current.mapsLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.openMapBtn}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              OPEN IN GOOGLE MAPS
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
      <ContactPageInner />
    </Suspense>
  );
}
