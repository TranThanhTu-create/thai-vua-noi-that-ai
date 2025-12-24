
import React, { useState, useCallback } from 'react';
import { RoomType, DesignStyle, DesignSuggestion, DesignFormData } from './types';
import { generateInteriorDesigns, editInteriorDesign } from './services/geminiService';

const LoadingOverlay: React.FC<{ message: string }> = ({ message }) => (
  <div className="fixed inset-0 bg-[#0E1F16]/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
    <div className="bg-[#162C21] rounded-[2.5rem] p-12 max-w-md w-full text-center shadow-[0_0_50px_rgba(61,255,111,0.15)] border border-[#3DFF6F]/20">
      <div className="relative w-24 h-24 mx-auto mb-10">
        <div className="absolute inset-0 rounded-full border-4 border-[#3DFF6F]/10 border-t-[#3DFF6F] animate-spin shadow-[0_0_15px_rgba(61,255,111,0.4)]"></div>
        <div className="absolute inset-3 bg-[#0E1F16] rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-[#3DFF6F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
      </div>
      <h3 className="text-3xl font-black text-white mb-4 tracking-tight neon-text-glow uppercase">Thái Vua Nội Thất</h3>
      <p className="text-slate-400 text-sm leading-relaxed font-medium mb-6">{message}</p>
      <div className="text-[10px] text-[#3DFF6F] font-black uppercase tracking-[0.3em] opacity-80">Kiến tạo không gian hoàng gia</div>
    </div>
  </div>
);

const Header: React.FC<{ onReset: () => void }> = ({ onReset }) => (
  <header className="bg-[#0E1F16]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40">
    <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
      <div className="flex items-center gap-4 cursor-pointer group" onClick={onReset}>
        <div className="flex flex-col">
          <span className="text-2xl font-black text-white tracking-tighter leading-none">
            THÁI VUA <span className="text-[#3DFF6F] neon-text-glow">NỘI THẤT</span>
          </span>
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">KIẾN TẠO KHÔNG GIAN SỐNG</span>
        </div>
      </div>
      <nav className="hidden md:flex gap-10 items-center">
        <a href="https://tnthome.com.vn/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#3DFF6F] font-bold transition-all uppercase text-xs tracking-widest">Dự án mẫu</a>
        <button onClick={onReset} className="text-slate-400 hover:text-white font-bold transition-all uppercase text-xs tracking-widest flex items-center gap-2">
          Bắt đầu lại
        </button>
        <a href="https://zalo.me/0989972189" target="_blank" rel="noopener noreferrer" className="bg-white/5 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#3DFF6F] hover:text-black transition-all border border-white/10">Liên hệ</a>
      </nav>
    </div>
  </header>
);

const App: React.FC = () => {
  const initialFormData: DesignFormData = {
    roomType: RoomType.LivingRoom,
    style: DesignStyle.Modern,
    budget: '250',
    image: null,
    requirements: '',
  };

  const [formData, setFormData] = useState<DesignFormData>(initialFormData);
  const [suggestions, setSuggestions] = useState<DesignSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [selectedDesign, setSelectedDesign] = useState<DesignSuggestion | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const ZALO_GROUP_LINK = "https://zalo.me/g/qbtawp875";
  const ZALO_PERSONAL_LINK = "https://zalo.me/0989972189";

  const suggestionPills = [
    "Sử dụng gỗ tự nhiên ấm cúng",
    "Tông màu trắng xám hiện đại",
    "Có đèn chùm pha lê sang trọng",
    "Bố cục tối giản nhiều ánh sáng",
    "Thiết kế phong thủy tài lộc"
  ];

  const handleReset = useCallback(() => {
    if (suggestions.length > 0 || formData.image) {
      if (!window.confirm("Bạn muốn bắt đầu thiết kế cho căn phòng khác?")) return;
    }
    setFormData(initialFormData);
    setSuggestions([]);
    setSelectedDesign(null);
    setEditPrompt('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [suggestions.length, formData.image]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, image: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!formData.image) return alert("Vui lòng tải lên ảnh căn phòng của bạn!");
    
    setIsLoading(true);
    setLoadingMessage("AI đang kiến tạo không gian theo phong cách hoàng gia...");
    
    try {
      const displayBudget = parseFloat(formData.budget) >= 1000 ? "Trên 1 Tỷ VNĐ" : `${formData.budget} Triệu VNĐ`;
      const results = await generateInteriorDesigns(
        formData.image,
        formData.roomType,
        formData.style,
        displayBudget,
        formData.requirements,
        3
      );

      setSuggestions(results.map((res, index) => ({
        id: `int-${Date.now()}-${index}`,
        imageUrl: res.imageUrl,
        title: `Phương án ${index + 1}: ${formData.roomType}`,
        description: res.description,
        estimatedCost: displayBudget
      })));
      
      setTimeout(() => document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' }), 300);
    } catch (error) {
      alert("Hệ thống đang bận phục vụ. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditDesign = async () => {
    if (!selectedDesign || !editPrompt.trim()) return;
    setIsEditing(true);
    setLoadingMessage(`Đang tinh chỉnh chi tiết theo ý muốn của bạn...`);
    try {
      const updatedImageUrl = await editInteriorDesign(selectedDesign.imageUrl, editPrompt);
      if (updatedImageUrl) {
        const updatedDesign = { ...selectedDesign, imageUrl: updatedImageUrl };
        setSelectedDesign(updatedDesign);
        setSuggestions(prev => prev.map(s => s.id === selectedDesign.id ? updatedDesign : s));
        setEditPrompt('');
      }
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0E1F16]">
      <Header onReset={handleReset} />
      <main className="flex-grow max-w-7xl mx-auto px-4 py-12 w-full">
        <section className="text-center mb-16">
          <div className="inline-block px-5 py-2 mb-8 rounded-full bg-[#3DFF6F]/10 border border-[#3DFF6F]/30 text-[#3DFF6F] text-[10px] font-black tracking-[0.3em] uppercase neon-glow">
            Premium Interior Intelligence
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-normal leading-tight">
            Thái Vua <br/><span className="text-[#3DFF6F] neon-text-glow italic">Nội Thất</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Biến ảnh chụp hiện trạng thành bản vẽ 3D đẳng cấp chỉ với vài dòng mô tả.
          </p>
        </section>

        <section className="grid lg:grid-cols-2 gap-12 mb-24 items-stretch">
          <div className="bg-[#162C21] p-10 rounded-[3rem] shadow-2xl border border-white/5 flex flex-col justify-between">
            <div className="space-y-8">
              <h2 className="text-2xl font-black flex items-center gap-4 text-white">
                <span className="flex items-center justify-center bg-[#3DFF6F] text-black w-9 h-9 rounded-xl text-lg font-black">1</span>
                Tải ảnh & Nhập yêu cầu
              </h2>
              
              <div className="relative group">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="room-upload" />
                <label htmlFor="room-upload" className={`flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-[2.5rem] cursor-pointer transition-all duration-500 ${formData.image ? 'border-[#3DFF6F] bg-[#3DFF6F]/5' : 'border-white/10 hover:border-[#3DFF6F]/50 bg-black/20'}`}>
                  {formData.image ? (
                    <img src={formData.image} className="h-full w-full object-cover rounded-[2.5rem]" alt="Preview" />
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-[#3DFF6F]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#3DFF6F]/20">
                         <svg className="w-8 h-8 text-[#3DFF6F]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                      </div>
                      <p className="text-white font-black text-lg">Chụp/Tải ảnh phòng</p>
                      <p className="text-slate-500 text-xs mt-2">Phòng khách, bếp, ngủ... hiện tại</p>
                    </div>
                  )}
                </label>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#3DFF6F] uppercase ml-2">Loại phòng</label>
                  <select className="w-full px-6 py-4 bg-[#0E1F16] border border-white/10 rounded-2xl text-white font-bold appearance-none cursor-pointer hover:border-[#3DFF6F]/30 transition-all" value={formData.roomType} onChange={e => setFormData(p => ({ ...p, roomType: e.target.value as RoomType }))}>
                    {Object.values(RoomType).map(t => <option key={t} value={t} className="bg-[#162C21]">{t}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#3DFF6F] uppercase ml-2">Phong cách</label>
                  <select className="w-full px-6 py-4 bg-[#0E1F16] border border-white/10 rounded-2xl text-white font-bold appearance-none cursor-pointer hover:border-[#3DFF6F]/30 transition-all" value={formData.style} onChange={e => setFormData(p => ({ ...p, style: e.target.value as DesignStyle }))}>
                    {Object.values(DesignStyle).map(s => <option key={s} value={s} className="bg-[#162C21]">{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-[#3DFF6F] uppercase ml-2">Yêu cầu thiết kế chi tiết</label>
                <textarea 
                  className="w-full px-6 py-5 bg-[#0E1F16] border border-white/10 rounded-[2rem] text-white font-medium min-h-[140px] focus:border-[#3DFF6F]/50 outline-none transition-all placeholder:text-slate-600" 
                  placeholder="VD: Thay bộ sofa sang màu cam nổi bật, thêm kệ sách lớn áp trần, đổi sàn gỗ màu óc chó..." 
                  value={formData.requirements} 
                  onChange={e => setFormData(p => ({ ...p, requirements: e.target.value }))}
                />
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-[9px] text-slate-500 font-bold uppercase mt-1 mr-2 italic">Gợi ý:</span>
                  {suggestionPills.map(s => (
                    <button 
                      key={s} 
                      onClick={() => setFormData(p => ({ ...p, requirements: (p.requirements ? p.requirements + ', ' : '') + s }))}
                      className="text-[9px] px-3 py-1 bg-white/5 border border-white/10 rounded-full text-slate-400 hover:text-[#3DFF6F] hover:border-[#3DFF6F]/30 transition-all font-bold"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#0E1F16] p-8 rounded-[2rem] border border-white/5 space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black text-[#3DFF6F] uppercase">Ngân sách dự kiến</label>
                  <div className="text-right">
                    <span className="text-3xl font-black text-white">{formData.budget}</span>
                    <span className="text-sm font-black text-[#3DFF6F] ml-2">Triệu VNĐ</span>
                  </div>
                </div>
                <input type="range" min="50" max="1000" step="10" value={formData.budget} onChange={e => setFormData(p => ({ ...p, budget: e.target.value }))} className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#3DFF6F]" />
              </div>
            </div>

            <button onClick={handleGenerate} disabled={isLoading} className="mt-12 w-full bg-[#3DFF6F] text-black font-black py-6 rounded-[2rem] shadow-[0_15px_30px_rgba(61,255,111,0.2)] text-xl uppercase tracking-widest hover:scale-[1.02] hover:brightness-110 active:scale-95 transition-all">
              {isLoading ? 'Đang sáng tạo không gian...' : 'BẮT ĐẦU THIẾT KẾ'}
            </button>
          </div>

          <div className="bg-[#162C21] rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden flex flex-col justify-center border border-white/5">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            </div>
            <h3 className="text-4xl font-black mb-8 leading-tight">Tại sao khách hàng <br/>chọn <span className="text-[#3DFF6F]">Thái Vua Nội Thất?</span></h3>
            <ul className="space-y-8 relative z-10">
              <li className="flex gap-4 group">
                <div className="bg-[#3DFF6F]/10 p-2 rounded-lg text-[#3DFF6F] h-fit group-hover:bg-[#3DFF6F] group-hover:text-black transition-all duration-300">✓</div>
                <div><p className="font-black text-lg">Bản vẽ 16:9 Toàn Cảnh</p><p className="text-slate-400 text-sm">Góc nhìn rộng toàn cảnh không gian, bao quát mọi góc cạnh căn phòng.</p></div>
              </li>
              <li className="flex gap-4 group">
                <div className="bg-[#3DFF6F]/10 p-2 rounded-lg text-[#3DFF6F] h-fit group-hover:bg-[#3DFF6F] group-hover:text-black transition-all duration-300">✓</div>
                <div><p className="font-black text-lg">Hiểu Mọi Yêu Cầu</p><p className="text-slate-400 text-sm">AI của chúng tôi hiểu ngôn ngữ thiết kế thực tế để đưa ra kết quả sát nhất.</p></div>
              </li>
              <li className="flex gap-4 group">
                <div className="bg-[#3DFF6F]/10 p-2 rounded-lg text-[#3DFF6F] h-fit group-hover:bg-[#3DFF6F] group-hover:text-black transition-all duration-300">✓</div>
                <div><p className="font-black text-lg">Thi Công Trọn Gói</p><p className="text-slate-400 text-sm">Sau khi ưng ý bản vẽ, đội ngũ Thái Vua Nội Thất sẽ hiện thực hóa nó cho bạn.</p></div>
              </li>
            </ul>
          </div>
        </section>

        {suggestions.length > 0 && (
          <section id="results-section" className="mb-32">
            <h2 className="text-5xl font-black text-white mb-12 text-center uppercase tracking-tighter">Bộ sưu tập cho bạn</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {suggestions.map((s, idx) => (
                <div key={s.id} onClick={() => setSelectedDesign(s)} className={`bg-[#162C21] rounded-[3rem] overflow-hidden border-4 cursor-pointer transition-all duration-500 hover:translate-y-[-10px] ${selectedDesign?.id === s.id ? 'border-[#3DFF6F] shadow-[0_0_40px_rgba(61,255,111,0.2)]' : 'border-white/5'}`}>
                  <img src={s.imageUrl} className="w-full aspect-video object-cover" alt={s.title} />
                  <div className="p-8 text-center bg-gradient-to-t from-black/50 to-transparent">
                    <h3 className="text-xl font-black text-white mb-2">{s.title}</h3>
                    <p className="text-[#3DFF6F] font-black text-sm uppercase tracking-widest">{s.estimatedCost}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {selectedDesign && (
          <section className="mb-32">
            <div className="bg-[#162C21] rounded-[4rem] p-10 border border-white/5 grid lg:grid-cols-2 gap-12 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
              <div className="rounded-[3rem] overflow-hidden aspect-video bg-black relative border border-white/10">
                <img src={selectedDesign.imageUrl} className="w-full h-full object-cover" alt="Selected" />
                {isEditing && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-[#3DFF6F]">
                    <div className="w-12 h-12 border-4 border-[#3DFF6F] border-t-transparent animate-spin rounded-full mb-4"></div>
                    <span className="font-black uppercase tracking-widest">Đang tinh chỉnh...</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center space-y-10">
                <div>
                  <h2 className="text-4xl font-black mb-4">Tùy biến bản thiết kế</h2>
                  <p className="text-slate-400 font-medium italic">"Bạn chưa hài lòng? Hãy nhắn AI thay đổi bất cứ chi tiết nào"</p>
                </div>
                <textarea 
                  className="w-full p-8 bg-[#0E1F16] border border-white/10 rounded-[2rem] text-white h-48 focus:border-[#3DFF6F]/40 outline-none transition-all placeholder:text-slate-700" 
                  placeholder="VD: Hãy thay sàn gỗ sang gạch vân đá trắng, bỏ rèm cửa sổ và thêm vài chậu cây lớn ở góc phòng..." 
                  value={editPrompt} 
                  onChange={e => setEditPrompt(e.target.value)} 
                />
                <div className="space-y-4">
                  <button onClick={handleEditDesign} disabled={isEditing || !editPrompt.trim()} className="w-full bg-[#3DFF6F] text-black font-black py-6 rounded-[2rem] uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all">Cập nhật thiết kế</button>
                  <button onClick={() => window.open(ZALO_GROUP_LINK, '_blank')} className="w-full bg-[#0068FF] text-white font-black py-6 rounded-[2rem] flex items-center justify-center gap-3 hover:brightness-110 transition-all uppercase tracking-widest text-sm">THAM GIA NHÓM ZALO NHÀ ĐẸP</button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="bg-[#0E1F16] border-t border-white/5 py-16 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
          <a 
            href={ZALO_PERSONAL_LINK} 
            target="_blank" 
            rel="noopener noreferrer"
            className="mb-8 px-10 py-4 bg-[#3DFF6F] text-black font-black rounded-full uppercase tracking-widest text-sm hover:scale-110 transition-transform shadow-[0_0_20px_rgba(61,255,111,0.3)]"
          >
            TƯ VẤN QUA ZALO
          </a>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.4em] mb-4">
            &copy; {new Date().getFullYear()} THÁI VUA NỘI THẤT - KIẾN TẠO KHÔNG GIAN HOÀNG GIA
          </p>
          <div className="flex justify-center gap-8 text-slate-700 text-[10px] font-black uppercase tracking-widest">
            <a href="#" className="hover:text-[#3DFF6F] transition-colors">Điều khoản</a>
            <a href="#" className="hover:text-[#3DFF6F] transition-colors">Bảo mật</a>
            <a href="#" className="hover:text-[#3DFF6F] transition-colors">Dịch vụ</a>
          </div>
        </div>
      </footer>
      {isLoading && <LoadingOverlay message={loadingMessage} />}
    </div>
  );
};

export default App;
