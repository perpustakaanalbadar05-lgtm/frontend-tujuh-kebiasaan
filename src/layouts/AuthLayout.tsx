import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex">
      {/* Left Side: Illustration / Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#E8F5E9] relative flex-col items-center justify-center p-12 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#4CAF50] blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-[#2E7D32] blur-[120px]" />
        </div>
        
        {/* Main Illustration */}
        <div className="relative z-10 text-center flex flex-col items-center">
          <div className="mb-8 w-80 h-80 bg-white/40 backdrop-blur-md rounded-2xl border border-white/50 p-4 shadow-xl flex items-center justify-center">
            {/* Generated illustration image */}
            <img 
              src="/login-illustration.png" 
              alt="G7KAIH Education Illustration" 
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <h1 className="text-4xl font-bold text-[#2E7D32] mb-4">
            Gerakan 7 Kebiasaan<br/>Anak Indonesia Hebat
          </h1>
          <p className="text-[#333333] text-lg max-w-md">
            Platform digital terintegrasi untuk mencetak generasi penerus bangsa yang berkarakter, cerdas, dan tangguh.
          </p>
        </div>
      </div>

      {/* Right Side: Form (Full width on mobile) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
