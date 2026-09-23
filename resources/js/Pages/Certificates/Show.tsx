import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useTranslation } from '@/Hooks/useTranslation';
import { Award, Printer, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';

interface Props {
    certificate: {
        uuid: string;
        certificate_code: string;
        student_name: string;
        course_title: string;
        course_slug: string;
        issued_at: string;
    };
}

export default function Show({ certificate }: Props) {
    const { t } = useTranslation();

    function handlePrint() {
        window.print();
    }

    return (
        <AppLayout title={`${t('certificates.certificate_of_completion')} - ${certificate.student_name}`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Actions Bar */}
                <div className="flex items-center justify-between mb-8 print:hidden">
                    <Link
                        href="/certificates"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>{t('certificates.title')}</span>
                    </Link>

                    <button
                        type="button"
                        onClick={handlePrint}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
                    >
                        <Printer className="w-4 h-4" />
                        <span>{t('certificates.download_pdf')}</span>
                    </button>
                </div>

                {/* Printable Certificate Canvas */}
                <div className="p-8 sm:p-14 rounded-3xl bg-white text-slate-900 border-8 border-double border-slate-200 shadow-2xl relative overflow-hidden text-center space-y-8 print:border-4 print:shadow-none print:m-0 print:p-8">
                    {/* Background Seal Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                        <Award className="w-96 h-96 text-emerald-600" />
                    </div>

                    <div className="relative z-10 space-y-3">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto shadow-sm">
                            <Award className="w-8 h-8" />
                        </div>

                        <div className="text-xs font-bold uppercase tracking-widest text-emerald-600 font-mono">
                            CodeMaster Academy &bull; Certificate of Mastery
                        </div>

                        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-serif">
                            {t('certificates.certificate_of_completion')}
                        </h1>
                    </div>

                    <div className="relative z-10 space-y-3 max-w-xl mx-auto">
                        <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                            {t('certificates.this_certifies')}
                        </p>
                        <h2 className="text-2xl sm:text-4xl font-extrabold text-emerald-700 underline decoration-emerald-200 underline-offset-8">
                            {certificate.student_name}
                        </h2>
                        <p className="text-sm text-slate-600 leading-relaxed font-sans pt-2">
                            {t('certificates.has_completed')}
                        </p>
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                            {certificate.course_title}
                        </h3>
                    </div>

                    <div className="relative z-10 pt-10 border-t border-slate-200 grid grid-cols-2 gap-8 max-w-md mx-auto text-left text-xs">
                        <div>
                            <div className="text-slate-400 uppercase font-semibold text-[10px]">
                                {t('certificates.issued_on')}
                            </div>
                            <div className="font-semibold text-slate-800 mt-0.5">
                                {certificate.issued_at}
                            </div>
                        </div>
                        <div>
                            <div className="text-slate-400 uppercase font-semibold text-[10px]">
                                {t('certificates.certificate_id')}
                            </div>
                            <div className="font-mono font-bold text-emerald-600 mt-0.5">
                                {certificate.certificate_code}
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 flex items-center justify-center gap-1.5 text-xs text-slate-400 pt-4">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span>Officially verified by CodeMaster Platform &bull; Bilingual Credentials</span>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

