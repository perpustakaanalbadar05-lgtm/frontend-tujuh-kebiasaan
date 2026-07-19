import { useState, useEffect } from 'react';
import { Loader2, Printer, Search, FileText, Medal, Download } from 'lucide-react';
import axios from '../../lib/axios';

interface Student {
  id: number;
  name: string;
}

interface ReportData {
  student: {
    id: number;
    name: string;
    nis: string;
    school: string;
  };
  period: {
    month: string;
    year: string;
  };
  summary: {
    total_days_filled: number;
    average_score: number;
    predicate: string;
  };
  habit_breakdown: {
    habit_id: number;
    habit_name: string;
    done_count: number;
    percentage: number;
  }[];
}

const ReportPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  
  // Date states
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState<string>((today.getMonth() + 1).toString().padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState<string>(today.getFullYear().toString());
  
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Jika user adalah siswa, otomatis pilih ID mereka sendiri (dari fetch backend atau local state)
  // Karena kita tidak menyimpan student_id di auth context, kita fetch /students dan otomatis set.

  useEffect(() => {
    // Fetch students list for dropdown (if Admin/Teacher/Parent)
    const fetchStudents = async () => {
      try {
        const response = await axios.get('/students');
        if (response.data.success) {
          const studentsData = response.data.data.data || response.data.data;
          setStudents(studentsData || []); 
          // Auto select first student if role is not student
          if (studentsData && studentsData.length > 0) {
              setSelectedStudentId(studentsData[0].id.toString());
          }
        }
      } catch (err) {
        console.error("Failed to fetch students", err);
      }
    };
    fetchStudents();
  }, []);

  const handleGenerateReport = async () => {
    if (!selectedStudentId) {
      setError('Silakan pilih siswa terlebih dahulu.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setReportData(null);
    
    try {
      const response = await axios.get(`/reports/student/${selectedStudentId}`, {
        params: {
          month: selectedMonth,
          year: selectedYear
        }
      });
      
      if (response.data.success) {
        setReportData(response.data.data);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Gagal memuat laporan. Pastikan Anda memiliki akses.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGlobalExport = async () => {
    try {
      const response = await axios.get('/reports/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'laporan_rekap_siswa.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Gagal mengekspor data laporan');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getPredicateColor = (predicate: string) => {
    switch (predicate) {
      case 'A': return 'bg-green-100 text-green-700 border-green-200';
      case 'B': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'C': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-red-100 text-red-700 border-red-200';
    }
  };

  const getPredicateText = (predicate: string) => {
    switch (predicate) {
      case 'A': return 'Sangat Baik';
      case 'B': return 'Baik';
      case 'C': return 'Cukup';
      default: return 'Kurang';
    }
  };

  const getMonthName = (monthNum: string) => {
    const date = new Date(2000, parseInt(monthNum) - 1, 1);
    return date.toLocaleString('id-ID', { month: 'long' });
  };

  return (
    <div className="space-y-6">
      
      {/* 
        Area Kontrol Filter (Disembunyikan saat dicetak via @media print di index.css)
        Gunakan class 'print:hidden' dari Tailwind.
      */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:hidden space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Laporan & Rekapitulasi</h2>
            <p className="text-gray-500 text-sm">Pilih siswa dan periode bulan untuk mencetak raport individu, atau unduh rekap global.</p>
          </div>
          <button 
            onClick={handleGlobalExport}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
          >
            <Download size={20} /> Export Rekap Excel
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Siswa</label>
            <select 
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30"
            >
              <option value="" disabled>Pilih Siswa...</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          
          <div className="w-full sm:w-32">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Bulan</label>
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30"
            >
              {[...Array(12)].map((_, i) => {
                const m = (i + 1).toString().padStart(2, '0');
                return <option key={m} value={m}>{getMonthName(m)}</option>
              })}
            </select>
          </div>

          <div className="w-full sm:w-32">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tahun</label>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30"
            >
              {[2024, 2025, 2026, 2027].map(y => (
                <option key={y} value={y.toString()}>{y}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button 
              onClick={handleGenerateReport}
              disabled={isLoading}
              className="w-full sm:w-auto bg-[#4CAF50] hover:bg-[#388E3C] text-white px-6 py-2.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 h-[46px]"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              Tampilkan
            </button>
          </div>
        </div>
        
        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
      </div>

      {/* Area Dokumen Raport (Akan dicetak) */}
      {reportData && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden print:shadow-none print:border-none print:m-0 print:p-0">
          
          {/* Header Action (Hidden on Print) */}
          <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center print:hidden">
            <div className="flex items-center gap-2 text-[#2E7D32] font-semibold">
              <FileText className="w-5 h-5" />
              Preview Raport
            </div>
            <button 
              onClick={handlePrint}
              className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <Printer className="w-4 h-4" /> Cetak / Ekspor PDF
            </button>
          </div>

          {/* Canvas Kertas A4 */}
          <div className="p-8 sm:p-12 print:p-4 max-w-4xl mx-auto space-y-8 bg-white print:bg-transparent text-gray-800">
            
            {/* Kop Laporan */}
            <div className="text-center space-y-2 border-b-4 border-[#2E7D32] pb-6">
              <h1 className="text-3xl font-black text-[#1B5E20] uppercase tracking-wide">Raport 7 Kebiasaan</h1>
              <p className="text-lg font-medium text-gray-600">Sistem Manajemen Gerakan Anak Hebat (G7KAIH)</p>
              <p className="text-md text-gray-500">{reportData.student.school}</p>
            </div>

            {/* Identitas Siswa */}
            <div className="grid grid-cols-2 gap-4 text-sm sm:text-base border border-gray-200 rounded-xl p-6 bg-gray-50/50 print:border-gray-300">
              <div>
                <table className="w-full">
                  <tbody>
                    <tr><td className="py-1 font-semibold w-24">Nama</td><td className="py-1 text-gray-700">: {reportData.student.name}</td></tr>
                    <tr><td className="py-1 font-semibold w-24">NIS</td><td className="py-1 text-gray-700">: {reportData.student.nis}</td></tr>
                  </tbody>
                </table>
              </div>
              <div>
                <table className="w-full">
                  <tbody>
                    <tr><td className="py-1 font-semibold w-24">Periode</td><td className="py-1 text-gray-700">: {getMonthName(reportData.period.month)} {reportData.period.year}</td></tr>
                    <tr><td className="py-1 font-semibold w-24">Partisipasi</td><td className="py-1 text-gray-700">: {reportData.summary.total_days_filled} Hari Pengisian</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Skor Utama */}
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1 bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-6 border border-green-200 flex flex-col items-center justify-center text-center print:border-gray-300 print:bg-none">
                <p className="text-sm font-bold tracking-widest text-green-800 uppercase mb-2">Nilai Rata-rata</p>
                <div className="text-5xl font-black text-green-700">{reportData.summary.average_score}</div>
                <p className="text-xs text-green-600 mt-2 font-medium">Skala 0 - 100</p>
              </div>

              <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-6 print:border-gray-300">
                <div className="text-center flex flex-col items-center">
                  <Medal className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-2">Predikat Akhir</p>
                  <div className={`px-8 py-3 rounded-xl border-2 text-2xl font-black ${getPredicateColor(reportData.summary.predicate)} print:border-gray-400 print:bg-transparent print:text-black`}>
                    {reportData.summary.predicate} - {getPredicateText(reportData.summary.predicate)}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabel Rincian Habit */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-[#4CAF50] pl-3">Rincian Capaian 7 Kebiasaan</h3>
              <div className="border border-gray-200 rounded-xl overflow-hidden print:border-gray-400">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-sm text-gray-700 print:bg-gray-200">
                      <th className="p-4 border-b border-gray-200 font-bold">No</th>
                      <th className="p-4 border-b border-gray-200 font-bold">Aspek Kebiasaan</th>
                      <th className="p-4 border-b border-gray-200 font-bold text-center">Frekuensi Dikerjakan</th>
                      <th className="p-4 border-b border-gray-200 font-bold text-center">Persentase</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reportData.habit_breakdown.map((habit, idx) => (
                      <tr key={habit.habit_id} className="text-sm print:text-black">
                        <td className="p-4 w-12 text-center text-gray-500 font-medium">{idx + 1}</td>
                        <td className="p-4 font-semibold text-gray-800">{habit.habit_name}</td>
                        <td className="p-4 text-center">{habit.done_count} Hari</td>
                        <td className="p-4 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold print:border print:border-gray-400 print:bg-transparent print:text-black ${habit.percentage >= 70 ? 'bg-green-100 text-green-700' : habit.percentage >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                            {habit.percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Signature Area */}
            <div className="grid grid-cols-2 gap-4 mt-16 pt-8 text-center text-sm">
              <div>
                <p className="mb-16">Orang Tua / Wali Siswa</p>
                <p className="font-bold underline decoration-gray-300 underline-offset-4">( ........................................ )</p>
              </div>
              <div>
                <p className="mb-16">Wali Kelas / Guru</p>
                <p className="font-bold underline decoration-gray-300 underline-offset-4">( ........................................ )</p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ReportPage;
