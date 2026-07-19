import { useState, useEffect } from 'react';
import { History, Lock, FileText, Loader2, Calendar } from 'lucide-react';
import axios from '../../lib/axios';

interface JournalDetail {
  habit: { name: string };
  is_done: boolean;
  time_performed: string;
}

interface Journal {
  id: number;
  journal_date: string;
  score: number;
  status: string;
  details: JournalDetail[];
  teacher_approval: { status: string } | null;
  parent_approval: { status: string } | null;
}

const JournalHistoryPage = () => {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchJournals();
  }, []);

  const fetchJournals = async () => {
    try {
      const response = await axios.get('/journals');
      if (response.data.success) {
        setJournals(response.data.data.data); // Assuming paginated response
      }
    } catch (error) {
      console.error('Failed to fetch journals', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isLocked = (j: Journal) => {
    return (j.teacher_approval && ['approved', 'rejected'].includes(j.teacher_approval.status)) ||
           (j.parent_approval && ['approved', 'rejected'].includes(j.parent_approval.status));
  };

  const getStatusBadge = (j: Journal) => {
    if (isLocked(j)) {
      return (
        <span className="flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold">
          <Lock size={12} /> Terkunci
        </span>
      );
    }
    return (
      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
        Draft (Bisa Diubah)
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Riwayat Jurnal</h2>
          <p className="text-gray-500">Lihat semua catatan kebiasaan yang pernah Anda kumpulkan.</p>
        </div>
        <div className="p-4 bg-green-50 rounded-full text-green-600">
          <History size={32} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {journals.map((journal) => (
          <div key={journal.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative">
            <div className="bg-gray-50 px-5 py-4 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2 text-gray-700 font-bold">
                <Calendar size={18} className="text-green-600" />
                {journal.journal_date}
              </div>
              {getStatusBadge(journal)}
            </div>
            
            <div className="p-5">
              <div className="mb-4">
                <p className="text-sm text-gray-500 font-medium mb-1">Skor Kepatuhan</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-green-600">{journal.score}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase">Rincian Kebiasaan</p>
                {journal.details.map((detail, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 flex items-center gap-2">
                      {detail.is_done ? (
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-red-400"></div>
                      )}
                      {detail.habit.name}
                    </span>
                    <span className="text-gray-500 font-mono text-xs">
                      {detail.time_performed ? detail.time_performed.substring(0, 5) : '-'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {journals.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center bg-white rounded-xl border border-gray-200 border-dashed">
            <FileText className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg font-medium">Belum ada riwayat jurnal.</p>
            <p className="text-gray-400 text-sm">Mulai isi jurnal pertama Anda hari ini!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalHistoryPage;
