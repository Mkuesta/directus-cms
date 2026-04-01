import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, Shield, Clock, ArrowRight, HelpCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Thank You for Your Order - Medlead',
  description: 'Your order has been confirmed successfully.',
  robots: {
    index: false,
  },
};

interface ThankYouPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const params = await searchParams;
  const sessionId = params.session_id || '';

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-12 sm:py-16 pt-32">
      {/* Success Header */}
      <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-100 mb-6 animate-in zoom-in duration-500">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
          Thank You for Your Order!
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
          Your healthcare lead list is being prepared. You&apos;ll receive a download link shortly.
        </p>
      </div>

      {/* Trust badges */}
      <div className="flex flex-wrap justify-center gap-4 mb-10 animate-in fade-in duration-700 delay-150">
        <div className="flex items-center gap-2 bg-teal-50 px-4 py-2 rounded-full border border-teal-200">
          <Shield className="w-4 h-4 text-secondary" />
          <span className="text-sm font-medium text-slate-700">HIPAA Compliant</span>
        </div>
        <div className="flex items-center gap-2 bg-teal-50 px-4 py-2 rounded-full border border-teal-200">
          <Download className="w-4 h-4 text-secondary" />
          <span className="text-sm font-medium text-slate-700">Instant Download</span>
        </div>
        <div className="flex items-center gap-2 bg-teal-50 px-4 py-2 rounded-full border border-teal-200">
          <Clock className="w-4 h-4 text-secondary" />
          <span className="text-sm font-medium text-slate-700">24/7 Support</span>
        </div>
      </div>

      {/* Order Info Card */}
      {sessionId && (
        <Card className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 border-teal-200">
          <CardContent className="p-6 sm:p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Your Download Is Ready
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Check your email for the download link. You can also download directly from the link sent to your inbox.
            </p>
            <p className="text-sm text-slate-500">
              Order reference: <span className="font-mono">{sessionId.slice(0, 20)}...</span>
            </p>
          </CardContent>
        </Card>
      )}

      {/* What happens next */}
      <Card className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 border-slate-200">
        <CardContent className="p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            What happens next?
          </h2>

          <div className="relative">
            <div className="absolute left-[19px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary to-teal-100" />

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/30">
                  1
                </div>
                <div className="pt-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Download your list</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Your CSV/Excel file is ready for download via the link in your confirmation email.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-teal-100 border-2 border-teal-300 flex items-center justify-center text-primary font-bold text-sm">
                  2
                </div>
                <div className="pt-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Import into your CRM</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Import the lead data into your CRM, email marketing tool, or outreach platform.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-slate-400 font-bold text-sm">
                  3
                </div>
                <div className="pt-1">
                  <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Start your outreach</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Begin connecting with verified healthcare professionals using your targeted lead list.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-in fade-in duration-500 delay-500">
        <Button size="lg" className="bg-primary hover:bg-primary/90" asChild>
          <Link href="/list-builder">
            <ArrowRight className="mr-2 h-4 w-4" />
            Build Another List
          </Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/contact">
            <HelpCircle className="mr-2 h-4 w-4" />
            Need Help?
          </Link>
        </Button>
      </div>

      {/* Support footer */}
      <div className="text-center pt-8 border-t border-slate-200 animate-in fade-in duration-500 delay-500">
        <p className="text-sm text-slate-500 mb-2">
          Have a question about your order?
        </p>
        <Link href="/contact" className="text-primary font-medium hover:underline text-sm">
          Our team responds within 24 hours
        </Link>
      </div>
    </div>
  );
}
