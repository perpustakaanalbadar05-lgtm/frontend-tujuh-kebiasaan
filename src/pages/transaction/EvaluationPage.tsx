import React, { useState, useEffect } from 'react';
import { ClipboardList, Loader2, CheckCircle2, Save } from 'lucide-react';
import axios from '../../lib/axios';

interface Evaluation {
  id: number;
  title: string;
  description: string;
}

interface Answers {
  praktik_baik: string;
  kendala: string;
  solusi: string;
  analisis: string;
}

const EvaluationPage = () => {
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [answers, setAnswers] = useState<Answers>({
    praktik_baik: '',
    kendala: '',
    solusi: '',
    analisis: ''
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        const response = await axios.get('/evaluations');
        if (response.data.success) {
          setEvaluation(response.data.data.evaluation);
          if (response.data.data.my_answer) {
            setAnswers(response.data.data.my_answer);
            setIsCompleted(true);
          }
        }
      } catch (error) {
        console.error('Gagal mengambil form evaluasi', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvaluation();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluation) return;

    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      const response = await axios.post(`/evaluations/${evaluation.id}/submit`, {
        answers
      });

      if (response.data.success) {
        setIsCompleted(true);
        setSuccessMessage(response.data.message);
        // Scroll to top to see message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Gagal menyimpan evaluasi', error);
      alert('Terjadi kesalahan saat menyimpan evaluasi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#4CAF50] animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Memuat form evaluasi...</p>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-center">
        <p className="text-red-600 font-medium">Form evaluasi tidak tersedia saat ini.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Info */}
      <div className="bg-gradient-to-r from-[#4CAF50] to-[#2E7D32] rounded-3xl p-8 sm:p-10 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-20">
          <ClipboardList className="w-48 h-48 transform rotate-12" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold mb-4 border border-white/20">
            📝 Evaluasi Akhir Tahun
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{evaluation.title}</h1>
          <p className="text-green-50 text-lg leading-relaxed">{evaluation.description}</p>
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-xl flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-green-800">Berhasil Disimpan</h3>
            <p className="text-green-700 text-sm mt-1">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Evaluation Form */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
        
        {isCompleted && !successMessage && (
          <div className="mb-6 bg-blue-50 text-blue-800 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Anda sudah pernah mengisi form ini sebelumnya. Anda masih dapat memperbarui jawaban di bawah jika diperlukan.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-lg font-bold text-gray-800">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 text-sm">1</span>
              Praktik Baik (Best Practice)
            </label>
            <p className="text-gray-500 text-sm pl-10">Ceritakan praktik baik atau inovasi yang telah Anda lakukan dalam mengimplementasikan 7 Kebiasaan di kelas Anda.</p>
            <div className="pl-10">
              <textarea
                required
                rows={4}
                value={answers.praktik_baik}
                onChange={(e) => setAnswers({...answers, praktik_baik: e.target.value})}
                placeholder="Tuliskan praktik baik di sini..."
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:bg-white transition-colors resize-y"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-lg font-bold text-gray-800">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 text-sm">2</span>
              Kendala di Lapangan
            </label>
            <p className="text-gray-500 text-sm pl-10">Jelaskan hambatan atau tantangan utama yang dihadapi selama penerapan program ini.</p>
            <div className="pl-10">
              <textarea
                required
                rows={4}
                value={answers.kendala}
                onChange={(e) => setAnswers({...answers, kendala: e.target.value})}
                placeholder="Tuliskan kendala di sini..."
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:bg-white transition-colors resize-y"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-lg font-bold text-gray-800">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 text-sm">3</span>
              Solusi yang Dilakukan
            </label>
            <p className="text-gray-500 text-sm pl-10">Apa tindakan kuratif atau solusi yang Anda terapkan untuk mengatasi kendala tersebut?</p>
            <div className="pl-10">
              <textarea
                required
                rows={4}
                value={answers.solusi}
                onChange={(e) => setAnswers({...answers, solusi: e.target.value})}
                placeholder="Tuliskan solusi di sini..."
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:bg-white transition-colors resize-y"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-lg font-bold text-gray-800">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 text-sm">4</span>
              Analisis & Rekomendasi
            </label>
            <p className="text-gray-500 text-sm pl-10">Bagaimana kesimpulan analisis Anda terhadap keefektifan program? Apa saran ke depannya?</p>
            <div className="pl-10">
              <textarea
                required
                rows={4}
                value={answers.analisis}
                onChange={(e) => setAnswers({...answers, analisis: e.target.value})}
                placeholder="Tuliskan analisis & rekomendasi di sini..."
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-[#4CAF50]/30 focus:bg-white transition-colors resize-y"
              />
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-gray-100 flex justify-end pl-10">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 w-full sm:w-auto shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" /> {isCompleted ? 'Perbarui Jawaban' : 'Simpan & Kirim Evaluasi'}
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default EvaluationPage;
