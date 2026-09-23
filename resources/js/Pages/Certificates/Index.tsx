import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useTranslation } from '@/Hooks/useTranslation';
import { Award, ArrowRight, BookOpen } from 'lucide-react';

interface CertificateItem {
    id: number;
    uuid: string;
    certificate_code: string;
    course_slug: string;
    course_title: string;
    issued_at: string;
}

interface Props {
    certificates: CertificateItem[];
}

export default function Index({ certificates = [] }: Props) {
    const { t } = useTranslation();

    return (
        <AppLayout title={t('certificates.title')}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-10">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 mb-2">
                        <Award className="w-3.5 h-3.5" />
                        <span>Credentials</span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                        {t('certificates.title')}
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        {t('certificates.subtitle')}
                    </p>
                </div>

                {certificates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {certificates.map((cert) => (
                            <Link
                                key={cert.id}
                                href={`/certificates/${cert.uuid}`}
                                className="group p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-primary-500/60 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between space-y-6"
                            >
                                <div className="space-y-3">
                                    <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 text-primary-600 flex items-center justify-center">
                                        <Award className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white group-hover:text-primary-600 transition-colors">
                                        {cert.course_title}
                                    </h3>
                                    <div className="text-xs font-mono text-neutral-400">
                                        Code: <span className="text-primary-600 font-semibold">{cert.certificate_code}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
                                    <span>Issued {cert.issued_at}</span>
                                    <span className="font-semibold text-primary-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                        View Certificate <ArrowRight className="w-3.5 h-3.5" />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-center space-y-4">
                        <Award className="w-12 h-12 text-neutral-300 mx-auto" />
                        <p className="text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
                            {t('certificates.no_certificates')}
                        </p>
                        <Link
                            href="/courses"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-xs font-bold hover:bg-primary-500"
                        >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>{t('common.explore_courses')}</span>
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

