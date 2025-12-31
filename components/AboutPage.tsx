
import React from 'react';

const AboutPage: React.FC = () => {
    const creators = [
        "يعقوب المهاجري",
        "أسامة شميس",
        "محمد الإدريسي",
        "سليمان العربي"
    ];

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-8 text-right" dir="rtl">
            <header className="text-center mb-12">
                <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-l from-sky-400 to-emerald-400 bg-clip-text text-transparent mb-4">
                    حول الموقع
                </h1>
                <div className="h-1 w-24 bg-sky-500 mx-auto rounded-full"></div>
            </header>

            <div className="grid grid-cols-1 gap-8">
                <section className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-8 rounded-2xl shadow-2xl">
                    <h2 className="text-2xl font-bold text-sky-300 mb-6 flex items-center gap-3">
                        <span className="text-3xl">🚀</span>
                        الرؤية والمهمة
                    </h2>
                    <p className="text-slate-300 leading-relaxed text-lg mb-6">
                        تم تصميم هذا المشروع ليكون أداة تعليمية تفاعلية تهدف إلى تبسيط مفاهيم هياكل البيانات والخوارزميات (DSA) للطلاب والمبرمجين. نحن نؤمن بأن الفهم البصري هو أقصر طريق لاستيعاب أعقد المفاهيم البرمجية.
                    </p>
                </section>

                <section className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-8 rounded-2xl shadow-2xl">
                    <h2 className="text-2xl font-bold text-emerald-300 mb-8 flex items-center gap-3">
                        <span className="text-3xl">👥</span>
                        فريق العمل
                    </h2>
                    <p className="text-slate-400 mb-8 text-lg font-medium">
                        تطوير وفكرة وإعداد:
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {creators.map((name, index) => (
                            <div 
                                key={index} 
                                className="group bg-slate-900/50 border border-slate-700 p-5 rounded-xl transition-all duration-300 hover:border-sky-500 hover:bg-slate-800"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-sky-400 font-bold group-hover:bg-sky-500 group-hover:text-white transition-colors">
                                        {index + 1}
                                    </div>
                                    <span className="text-xl font-semibold text-slate-200 group-hover:text-sky-400 transition-colors">
                                        {name}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="text-center py-8">
                    <p className="text-slate-500 italic">
                        تم الإعداد بكل شغف لدعم المحتوى التعليمي التقني العربي.
                    </p>
                    <p className="text-slate-600 mt-2 text-sm font-mono">
                        © {new Date().getFullYear()} Algorithm Visualizer Project
                    </p>
                </section>
            </div>
        </div>
    );
};

export default AboutPage;
