import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import axios from '../../lib/axios';

interface Holiday {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  type: string; // 'national', 'school'
  description?: string;
}

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchHolidays = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/master/holidays');
        if (response.data.success) {
          setHolidays(response.data.data.data || response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch holidays:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHolidays();
  }, []);

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Generate calendar days
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const days = [];
  const DAYS_OF_WEEK = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  // Empty slots for previous month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push({ day: null, date: null, type: 'empty' });
  }

  // Actual days
  for (let i = 1; i <= daysInMonth; i++) {
    const currentIterDate = new Date(year, month, i);
    // Format to YYYY-MM-DD local time correctly
    const dateStr = currentIterDate.toLocaleDateString('en-CA'); // en-CA gives YYYY-MM-DD
    
    // Check if it's a holiday
    const holiday = holidays.find(h => {
      return dateStr >= h.start_date && dateStr <= h.end_date;
    });

    days.push({
      day: i,
      date: dateStr,
      type: holiday ? 'holiday' : 'normal',
      holidayData: holiday,
      isToday: new Date().toLocaleDateString('en-CA') === dateStr,
      isWeekend: currentIterDate.getDay() === 0 || currentIterDate.getDay() === 6
    });
  }

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Kalender Akademik</h2>
          <p className="text-sm text-gray-500">Visualisasi jadwal kegiatan dan hari libur sekolah.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        {/* Calendar Header Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <CalendarIcon size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              {monthNames[month]} {year}
            </h3>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={prevMonth}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 font-medium transition-colors text-sm"
            >
              Hari Ini
            </button>
            <button 
              onClick={nextMonth}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#4CAF50] animate-spin mb-4" />
            <p className="text-gray-500">Memuat data kalender...</p>
          </div>
        ) : (
          <div className="w-full">
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-px mb-2">
              {DAYS_OF_WEEK.map((d, i) => (
                <div key={d} className={`text-center font-bold text-sm py-2 ${i === 0 || i === 6 ? 'text-red-500' : 'text-gray-500'}`}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((d, idx) => (
                <div 
                  key={idx} 
                  className={`
                    min-h-[100px] p-2 rounded-xl border relative transition-all
                    ${d.type === 'empty' ? 'border-transparent bg-transparent' : 'border-gray-100 bg-gray-50/30 hover:shadow-md'}
                    ${d.isToday ? 'ring-2 ring-[#4CAF50] bg-green-50/30' : ''}
                    ${d.type === 'holiday' ? 'bg-red-50/50 border-red-100' : ''}
                  `}
                >
                  {d.day && (
                    <>
                      <div className="flex justify-between items-start">
                        <span className={`
                          inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold
                          ${d.isToday ? 'bg-[#4CAF50] text-white' : (d.isWeekend || d.type === 'holiday') ? 'text-red-600' : 'text-gray-700'}
                        `}>
                          {d.day}
                        </span>
                      </div>
                      
                      {d.holidayData && (
                        <div className="mt-2 text-xs">
                          <div className={`p-1.5 rounded-lg border ${d.holidayData.type === 'national' ? 'bg-red-100 border-red-200 text-red-800' : 'bg-orange-100 border-orange-200 text-orange-800'} font-medium line-clamp-2 leading-tight`}>
                            {d.holidayData.name}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 pt-4 border-t border-gray-100 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <span className="w-3 h-3 rounded-full bg-[#4CAF50]"></span> Hari Ini
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <span className="w-3 h-3 rounded-full bg-red-100 border border-red-200"></span> Libur Nasional
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <span className="w-3 h-3 rounded-full bg-orange-100 border border-orange-200"></span> Libur Sekolah
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
