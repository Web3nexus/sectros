import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Mail, Briefcase } from 'lucide-react';
import api from '../services/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const tenant = searchParams.get('tenant');

    if (!token || !email || !tenant) {
      setStatus('error');
      setError('Invalid verification link. Missing parameters.');
      return;
    }

    api.post('auth/verify-email', { token, email, tenant }, { signal: controller.signal })
      .then(res => {
        if (!isMounted) return;
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('auth_user', JSON.stringify(res.data.user));
          if (res.data.tenant_domain) {
            localStorage.setItem('tenant_domain', res.data.tenant_domain);
          }
          setStatus('success');
          setTimeout(() => {
            if (!isMounted) return;
            const protocol = window.location.protocol || 'https:';
            window.location.href = `${protocol}//${res.data.tenant_domain || window.location.host}/dashboard`;
          }, 3000);
        } else {
          setStatus('error');
          setError(res.data?.message || 'Verification failed.');
        }
      })
      .catch(err => {
        if (!isMounted || err.name === 'CanceledError') return;
        setStatus('error');
        setError(err.response?.data?.message || 'Verification failed. The link may have expired.');
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden font-sans">
      <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card/40 backdrop-blur-2xl border border-border/50 rounded-[40px] p-12 max-w-md w-full mx-4 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        {status === 'verifying' && (
          <div className="py-8">
            <div className="w-20 h-20 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <Loader2 className="w-10 h-10 animate-spin" />
            </div>
            <h3 className="text-2xl font-black text-foreground mb-4">Verifying Your Email</h3>
            <p className="text-muted-foreground text-sm font-medium">Please wait while we verify your email address...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-8">
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-foreground mb-4">Email Verified!</h3>
            <p className="text-muted-foreground text-sm font-medium mb-8">
              Your email has been verified successfully. Welcome aboard!
            </p>
            <p className="text-[10px] text-muted-foreground font-medium">
              Redirecting you to your dashboard...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="py-8">
            <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <XCircle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-foreground mb-4">Verification Failed</h3>
            <p className="text-muted-foreground text-sm font-medium mb-8">{error}</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-2xl transition-all"
            >
              Go to Login
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
