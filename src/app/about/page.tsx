import Link from "next/link";
import {
  Wrench,
  ShieldCheck,
  Search,
  Send,
  CheckCircle2,
  CreditCard,
  UserCheck,
  Sparkles,
  ArrowRight,
  Clock,
  Lock,
} from "lucide-react";

export const metadata = {
  title: "How It Works & About | FixMate",
  description:
    "Learn how FixMate connects customers with verified local repair technicians through a transparent, step-by-step service workflow.",
};

export default function AboutPage() {
  const workflowSteps = [
    {
      step: "01",
      title: "Create Your Account",
      description:
        "Sign up in seconds as a Customer looking for reliable repairs or as a Technician ready to offer your expertise.",
      icon: UserCheck,
    },
    {
      step: "02",
      title: "Admin-Verified Services",
      description:
        "Technicians list their repair services with clear details. Every service is reviewed and approved by our Admin team before going live.",
      icon: ShieldCheck,
    },
    {
      step: "03",
      title: "Browse & Send a Request",
      description:
        "Customers search, filter, and compare approved services, then submit a repair request with their address, preferred date, and issue details.",
      icon: Search,
    },
    {
      step: "04",
      title: "Live Job Tracking & Final Quote",
      description:
        "Follow your repair through clear stages: Requested → Accepted → In Progress → Completed, where the technician sets the final service amount.",
      icon: Clock,
    },
    {
      step: "05",
      title: "Secure Stripe Payment",
      description:
        "Pay only after the job is marked Completed. Complete your transaction safely through Stripe Checkout with instant receipt tracking.",
      icon: CreditCard,
    },
  ];

  const stakeholders = [
    {
      role: "For Customers",
      badge: "Customer",
      headline: "Hassle-free repairs with zero upfront guesswork",
      points: [
        "Browse only admin-approved, available repair services",
        "Book with your preferred date, location, and problem notes",
        "Cancel anytime while the request is still pending",
        "Pay securely via Stripe only after work is completed",
      ],
    },
    {
      role: "For Technicians",
      badge: "Technician",
      headline: "Showcase your skills and manage jobs smoothly",
      points: [
        "Publish repair services with custom pricing and images",
        "Accept or decline incoming repair requests on your schedule",
        "Update job progress transparently from start to finish",
        "Set the exact final amount upon completing the repair",
      ],
    },
    {
      role: "Platform Trust",
      badge: "Admin Moderated",
      headline: "Quality control and full transaction visibility",
      points: [
        "Every new or edited service goes through admin verification",
        "Role-based access keeps customer and technician data isolated",
        "End-to-end monitoring of active jobs and Stripe payments",
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-[#0b1120] text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-800/80 bg-[#0f172a] py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            About FixMate & Workflow
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Reliable Home & Device Repairs,{" "}
            <span className="text-teal-400">Built on Transparency</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            FixMate is a modern service marketplace connecting households and
            businesses with skilled local technicians. From admin-verified
            listings to milestone job tracking and post-completion Stripe
            payments, every step is designed for trust.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold px-6 py-3 rounded-xl transition shadow-sm"
            >
              Explore Services
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-[#131b2e] hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold px-6 py-3 rounded-xl transition"
            >
              Join FixMate
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works - 5 Step Pipeline */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            How FixMate Works
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base">
            A clear, five-step pipeline from service discovery to verified
            completion and secure payment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflowSteps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="bg-[#131b2e] border border-slate-800 hover:border-teal-500/40 rounded-2xl p-6 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold tracking-widest text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full">
                      STEP {item.step}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Job Status Pipeline Visual Card */}
          <div className="bg-gradient-to-br from-teal-950/60 to-[#131b2e] border border-teal-500/30 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-3">
                <Wrench className="w-4 h-4" />
                Job Status Pipeline
              </div>
              <h3 className="text-lg font-bold text-white mb-3">
                Real-Time Progress You Can Follow
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-5">
                Every repair job follows a strict, accountable lifecycle so you
                always know where your request stands:
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">
                Requested
              </span>
              <span className="text-teal-400">→</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">
                Accepted
              </span>
              <span className="text-teal-400">→</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">
                In Progress
              </span>
              <span className="text-teal-400">→</span>
              <span className="px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/40">
                Completed & Paid
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem / Roles Breakdown */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#0f172a] border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Built for Every Role in the Repair Process
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              Dedicated dashboards and permissions keep workflows organized for
              customers, technicians, and administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {stakeholders.map((item) => (
              <div
                key={item.role}
                className="bg-[#131b2e] border border-slate-800 rounded-2xl p-7"
              >
                <span className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30 mb-4">
                  {item.badge}
                </span>
                <h3 className="text-xl font-bold text-white mb-2">
                  {item.role}
                </h3>
                <p className="text-sm text-slate-400 mb-6">{item.headline}</p>

                <ul className="space-y-3">
                  {item.points.map((point, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-sm text-slate-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Guarantees */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="bg-[#131b2e] border border-slate-800 rounded-3xl p-8 sm:p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mx-auto mb-5">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Ready to Get Your Next Repair Done Right?
          </h2>
          <p className="mt-3 text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            Browse verified repair services near you or register as a technician
            to start receiving repair requests today.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold px-6 py-3 rounded-xl transition"
            >
              <Send className="w-4 h-4" />
              Browse Approved Services
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-6 py-3 rounded-xl transition"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}