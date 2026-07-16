import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="flex flex-col">
      <div className="mb-8 text-center lg:text-left">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Selamat Datang 👋</h2>
        <p className="text-gray-500">Silakan masuk menggunakan akun Anda.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        {/* Username/Email Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 block">
            Username / Email
          </label>
          <input
            type="text"
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
