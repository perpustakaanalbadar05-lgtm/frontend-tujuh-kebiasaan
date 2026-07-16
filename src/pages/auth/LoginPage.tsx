import React, { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../lib/axios';

const LoginPage = () => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await axios.post('/login', formData);
      if (response.data.success) {
        login(response.data.data.access_token, response.data.data.user);
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg('Terjadi kesalahan pada server. Pastikan backend aktif.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="mb-8 text-center lg:text-left">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Selamat Datang di PPMU 👋</h2>
        <p className="text-gray-500">Silakan masuk menggunakan akun Anda.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {errorMsg}
          </div>
        )}
        
        {/* Username/Email Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 block">
            Username / Email
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            placeholder="Masukkan username atau email"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/20 focus:border-[#4CAF50] transition-colors"
            required
          />
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 block">
              Kata Sandi
            </label>
            <a href="#" className="text-sm text-[#4CAF50] hover:text-[#2E7D32] hover:underline font-medium">
              Lupa sandi?
            </a>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="Masukkan kata sandi"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/20 focus:border-[#4CAF50] transition-colors"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="remember"
            className="w-4 h-4 text-[#4CAF50] rounded border-gray-300 focus:ring-[#4CAF50]"
          />
          <label htmlFor="remember" className="ml-2 text-sm text-gray-600 cursor-pointer">
            Ingat saya
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#4CAF50] hover:bg-[#388E3C] text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-[0_4px_14px_0_rgba(76,175,80,0.39)] hover:shadow-[0_6px_20px_rgba(76,175,80,0.23)] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Masuk <LogIn size={20} />
            </>
          )}
        </button>
      </form>
      
      {/* Footer / Copyright */}
      <div className="mt-12 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} G7KAIH System. All rights reserved.</p>
      </div>
    </div>
  );
};

export default LoginPage;
