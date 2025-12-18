'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Loader, X } from 'lucide-react';
import { useUser } from '@/lib/user-context';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onForgotPassword?: () => void;
  onCreateAccount?: () => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess, onForgotPassword, onCreateAccount }: LoginModalProps) {
  const { loginOrSignup, isLoading: userLoading } = useUser();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  const handleReset = () => {
    setPhone('');
    setPassword('');
    setError('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!phone.trim() || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);

    try {
      // Login only (no signup)
      const result = await loginOrSignup(phone, password);

      if (!result.success) {
        setError(result.message);
        setLoading(false);
      } else {
        // Success - close modal and callback
        setTimeout(() => {
          handleClose();
          onSuccess?.();
        }, 800);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Login</h2>
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setPhone(value);
                  }}
                  placeholder="0549537343 or 0206819878"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                  disabled={loading || userLoading}
                  autoFocus
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                  disabled={loading || userLoading}
                />
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onForgotPassword?.();
                  }}
                  className="text-xs text-red-600 hover:text-red-700 mt-2 font-medium"
                >
                  Forgot password?
                </button>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg"
                  >
                    <AlertCircle size={18} />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                  disabled={loading || userLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || userLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                >
                  {loading || userLoading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </button>
              </div>

              {/* Sign up link */}
              <div className="text-center text-sm text-gray-600 pt-2">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onCreateAccount?.();
                  }}
                  className="text-red-600 hover:text-red-700 font-semibold"
                >
                  Create account
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
