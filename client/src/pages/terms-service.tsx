import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-900 dark:via-background dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="Insydz Logo" 
                className="w-10 h-10 rounded-xl object-contain"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Insydz
              </span>
            </div>
            <Button
              onClick={() => setLocation("/")}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Terms of Service
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Last Updated: December 30, 2025
        </p>

        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Welcome to Insydz. By accessing or using our website, platform, or services (collectively, the "Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Services.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              These Terms constitute a legally binding agreement between you (either as an individual or on behalf of an entity) and Insydz. We reserve the right to modify these Terms at any time, and your continued use of the Services constitutes acceptance of any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Description of Services</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Insydz provides an analytics platform that aggregates, processes, and analyzes e-commerce data to provide business insights, market intelligence, and predictive analytics. Our Services include but are not limited to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Data analytics and visualization dashboards</li>
              <li>AI-powered insights and recommendations</li>
              <li>Product performance tracking and monitoring</li>
              <li>Market trend analysis and forecasting</li>
              <li>Competitor analysis and benchmarking</li>
              <li>Custom reports and alerts</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Account Registration and Eligibility</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3.1 Eligibility</h3>
            <p className="text-gray-700 dark:text-gray-300">
              You must be at least 18 years old and have the legal capacity to enter into binding contracts to use our Services. By using our Services, you represent and warrant that you meet these requirements.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">3.2 Account Security</h3>
            <p className="text-gray-700 dark:text-gray-300">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Provide accurate and complete registration information</li>
              <li>Keep your account information up to date</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Not share your account credentials with others</li>
              <li>Be solely responsible for any actions taken using your account</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">3.3 Account Termination</h3>
            <p className="text-gray-700 dark:text-gray-300">
              We reserve the right to suspend or terminate your account at our sole discretion if you violate these Terms or engage in fraudulent, abusive, or illegal activities.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Subscription Plans and Payments</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4.1 Subscription Tiers</h3>
            <p className="text-gray-700 dark:text-gray-300">
              We offer multiple subscription tiers (Free, Basic, Premium, Enterprise) with varying features and usage limits. Details of each plan are available on our website and may be updated from time to time.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">4.2 Billing and Payments</h3>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Paid subscriptions are billed monthly in advance</li>
              <li>All fees are in Indian Rupees (INR) unless otherwise stated</li>
              <li>Payment is due immediately upon subscription activation</li>
              <li>You authorize us to charge your payment method automatically</li>
              <li>Failed payments may result in service suspension</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">4.3 Price Changes</h3>
            <p className="text-gray-700 dark:text-gray-300">
              We reserve the right to modify subscription pricing with 30 days' advance notice. Price changes will not affect your current billing cycle but will apply to subsequent renewals.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">4.4 Refunds</h3>
            <p className="text-gray-700 dark:text-gray-300">
              All purchases are final. We do not offer refunds for subscription fees, including partial months, downgrades, or cancellations. Please review your plan details carefully before completing your purchase. For billing-related questions, contact billing@insydz.com.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">4.5 Cancellation</h3>
            <p className="text-gray-700 dark:text-gray-300">
              You may cancel your subscription at any time. Cancellations take effect at the end of the current billing period. You will continue to have access to paid features until the end of that period.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Acceptable Use Policy</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              You agree not to use our Services to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon intellectual property rights of others</li>
              <li>Transmit malware, viruses, or harmful code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Engage in data scraping or automated data collection beyond permitted API usage</li>
              <li>Resell or redistribute our Services without authorization</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Upload false, misleading, or fraudulent information</li>
              <li>Interfere with the proper functioning of the Services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Intellectual Property Rights</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6.1 Our Content</h3>
            <p className="text-gray-700 dark:text-gray-300">
              All content, features, and functionality of our Services, including but not limited to software, text, graphics, logos, and trademarks, are owned by Insydz or our licensors and are protected by intellectual property laws.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">6.2 Your Data</h3>
            <p className="text-gray-700 dark:text-gray-300">
              You retain ownership of any data you upload or provide to our Services. By using our Services, you grant us a limited, non-exclusive license to process, analyze, and display your data for the purpose of providing our Services.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">6.3 Feedback</h3>
            <p className="text-gray-700 dark:text-gray-300">
              If you provide feedback, suggestions, or ideas about our Services, you grant us the right to use such feedback without compensation or obligation to you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Disclaimers and Limitations</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7.1 Service Availability</h3>
            <p className="text-gray-700 dark:text-gray-300">
              We strive to provide continuous access to our Services but do not guarantee uninterrupted availability. Services may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">7.2 Data Accuracy</h3>
            <p className="text-gray-700 dark:text-gray-300">
              While we use advanced algorithms and reliable data sources, we do not guarantee the accuracy, completeness, or timeliness of any data, insights, or recommendations provided through our Services. You are responsible for independently verifying any critical information.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">7.3 No Professional Advice</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Our Services provide informational content and analytics tools only. We do not provide financial, legal, investment, or business advice. You should consult qualified professionals before making important business decisions.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">7.4 AS-IS Basis</h3>
            <p className="text-gray-700 dark:text-gray-300">
              THE SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-700 dark:text-gray-300">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, INSYDZ SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICES.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mt-3">
              IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS EXCEED THE AMOUNT YOU PAID TO US IN THE 12 MONTHS PRECEDING THE CLAIM, OR ₹10,000, WHICHEVER IS LESS.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Indemnification</h2>
            <p className="text-gray-700 dark:text-gray-300">
              You agree to indemnify, defend, and hold harmless Insydz, its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses (including reasonable attorneys' fees) arising out of or related to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Your use or misuse of the Services</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another party</li>
              <li>Your breach of any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Third-Party Services and Links</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Our Services may contain links to third-party websites or integrate with third-party services. We are not responsible for the content, privacy practices, or terms of service of any third-party sites or services. Your use of third-party services is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">11. Data Protection and Privacy</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Our collection, use, and protection of your personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using our Services, you consent to our data practices as described in the Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">12. Governing Law and Dispute Resolution</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">12.1 Governing Law</h3>
            <p className="text-gray-700 dark:text-gray-300">
              These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">12.2 Jurisdiction</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Any legal action or proceeding arising out of or related to these Terms or the Services shall be brought exclusively in the courts of New Delhi, India, and you consent to the personal jurisdiction of such courts.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-6">12.3 Dispute Resolution</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Before filing any legal action, you agree to attempt to resolve any dispute informally by contacting us at legal@insydz.com. We will work in good faith to resolve the dispute within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">13. Modifications to Services and Terms</h2>
            <p className="text-gray-700 dark:text-gray-300">
              We reserve the right to modify, suspend, or discontinue any aspect of our Services at any time with or without notice. We may also update these Terms periodically. Material changes will be communicated via email or through our platform. Your continued use of the Services after changes take effect constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">14. Severability</h2>
            <p className="text-gray-700 dark:text-gray-300">
              If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions will remain in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">15. Entire Agreement</h2>
            <p className="text-gray-700 dark:text-gray-300">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and Insydz regarding the use of our Services and supersede all prior agreements and understandings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">16. Contact Information</h2>
            <p className="text-gray-700 dark:text-gray-300">
              If you have any questions about these Terms, please contact us:
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl mt-4">
              <p className="text-gray-700 dark:text-gray-300"><strong>Email:</strong> legal@insydz.com</p>
              <p className="text-gray-700 dark:text-gray-300"><strong>Support:</strong> support@insydz.com</p>
              <p className="text-gray-700 dark:text-gray-300"><strong>Phone:</strong> +91 98765 43210</p>
              <p className="text-gray-700 dark:text-gray-300"><strong>Address:</strong> New Delhi, India</p>
            </div>
          </section>

          <section className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Acknowledgment:</strong> By clicking "I Agree" or by accessing or using our Services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2026 <span className="text-purple-400 font-bold">Insydz</span>. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
