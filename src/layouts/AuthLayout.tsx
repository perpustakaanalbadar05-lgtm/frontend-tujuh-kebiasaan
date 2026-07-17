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
        
        {/* Main Typography */}
        <div className="relative z-10 flex flex-col items-start w-full max-w-lg px-8">
          <div className="mb-6 inline-flex items-center justify-center px-4 py-2 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-sm">
            <span className="text-[#2E7D32] font-semibold text-sm tracking-widest uppercase">Portal Sistem G7KAIH</span>
          </div>
          
          <h1 className="text-6xl lg:text-7xl font-extrabold text-[#1B5E20] leading-tight mb-6 tracking-tight">
            Gerakan <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4CAF50] to-[#2E7D32]">
              7 Kebiasaan
            </span> <br />
            Anak Hebat.
          </h1>
          
          <p className="text-[#333333] text-xl font-medium max-w-md leading-relaxed border-l-4 border-[#4CAF50] pl-6">
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
