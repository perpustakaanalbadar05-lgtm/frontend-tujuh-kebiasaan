import React, { useState } from 'react';
import { Loader2, Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from '../../lib/axios';

const ImportDataPage = () => {
  const [activeTab, setActiveTab] = useState<'siswa' | 'guru'>('siswa');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage({ text: '', type: '' });
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const endpoint = activeTab === 'siswa' ? '/master/students/template' : '/master/teachers/template';
      const filename = activeTab === 'siswa' ? 'template_data_siswa.xlsx' : 'template_data_guru.xlsx';
      
      const response = await axios.get(endpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Gagal mendownload template.');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage({ text: 'Pilih file terlebih dahulu.', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage({ text: '', type: '' });

    const formData = new FormData();
    formData.append('file', file);

    const endpoint = activeTab === 'siswa' ? '/import/students' : '/import/teachers';

    try {
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setMessage({ text: response.data.message || `Data ${activeTab} berhasil diimport!`, type: 'success' });
        setFile(null); // Reset form
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || `Gagal mengimport data ${activeTab}. Pastikan format file sesuai template.`;
      setMessage({ text: msg, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Import Data Massal</h2>
          <p className="text-gray-500 text-sm mt-1">Unggah file Excel (.xlsx) untuk menambahkan data dalam jumlah banyak secara otomatis.</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 gap-4 mt-6">
          <button
            onClick={() => { setActiveTab('siswa'); setFile(null); setMessage({text:'', type:''}); }}
            className={`pb-3 font-semibold text-sm transition-colors relative ${activeTab === 'siswa' ? 'text-[#4CAF50]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Data Siswa
            {activeTab === 'siswa' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4CAF50] rounded-t-md"></div>}
          </button>
          <button
            onClick={() => { setActiveTab('guru'); setFile(null); setMessage({text:'', type:''}); }}
            className={`pb-3 font-semibold text-sm transition-colors relative ${activeTab === 'guru' ? 'text-[#4CAF50]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Data Guru
            {activeTab === 'guru' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4CAF50] rounded-t-md"></div>}
          </button>
        </div>

        {/* Content */}
        <div className="pt-6">
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Panduan Import:</p>
              <ul className="list-disc ml-4 space-y-1">
                <li>Gunakan template Excel resmi yang disediakan.</li>
                <li>Pastikan tidak mengubah nama kolom di baris pertama.</li>
                <li>Maksimal ukuran file adalah 5MB.</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button 
              onClick={handleDownloadTemplate}
              className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-sm w-full sm:w-auto"
            >
              <Download size={18} /> Unduh Template {activeTab === 'siswa' ? 'Siswa' : 'Guru'}
            </button>
          </div>

          {message.text && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <p className="font-medium text-sm">{message.text}</p>
            </div>
          )}

          <form onSubmit={handleUpload} className="max-w-xl">
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">File Excel (.xlsx)</label>
              
              <div className="flex items-center justify-center w-full">
                <label htmlFor="file-upload" className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${file ? 'border-[#4CAF50] bg-green-50/30' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileSpreadsheet className={`w-10 h-10 mb-3 ${file ? 'text-[#4CAF50]' : 'text-gray-400'}`} />
                    <p className="mb-2 text-sm text-gray-500">
                      {file ? <span className="font-semibold text-gray-700">{file.name}</span> : <><span className="font-semibold">Klik untuk upload</span> atau drag and drop</>}
                    </p>
                    {!file && <p className="text-xs text-gray-500">XLSX, XLS, atau CSV</p>}
                  </div>
                  <input id="file-upload" type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileChange} />
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading || !file}
                className="w-full bg-[#4CAF50] hover:bg-[#388E3C] text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                {isLoading ? 'Mengunggah...' : 'Upload Data'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ImportDataPage;
