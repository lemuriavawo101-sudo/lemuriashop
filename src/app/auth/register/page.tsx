"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from '../auth.module.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        router.push('/auth/signin?registered=true');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Registration failed');
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.title}>REGISTER</h1>
        <p className={styles.subtitle}>Join the Heritage</p>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label>Phone Number</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="e.g. +91 9876543210" />
          </div>
          <div className={styles.formGroup}>
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className={styles.submitBtn}>Create Account</button>
        </form>
        
        <div className={styles.footer}>
          Already registered? <Link href="/auth/signin" className={styles.link}>Sign In</Link>
        </div>
      </div>
    </div>
  );
}
