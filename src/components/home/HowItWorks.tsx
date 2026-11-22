import { Search, Send, Wrench, CheckCircle2, ArrowRight } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Find a Service",
      description:
        "Browse through our categories and select the exact repair service you need for your device or appliance.",
      icon: Search,
    },
    {
      step: "02",
      title: "Send a Request",
      description:
        "Submit your service booking request with your location, preferred time, and issue description.",
      icon: Send,
    },
    {
      step: "03",
      title: "Technician Fixes It",
      description:
        "Our certified professional technician arrives at your doorstep and repairs the device efficiently.",
      icon: Wrench,
    },
    {
      step: "04",
      title: "Pay After Completion",
      description:
        "Inspect your fully repaired device and complete payment securely after the service is done.",
      icon: CheckCircle2,
    },
  ];

  return (
    <section
      id="how-it-works"
      className="border-b border-slate-900 bg-slate-950 px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        {/* সেকশন হেডার */}
        <div className="mx-auto mb-16 max-w-2xl space-y-3 text-center">
          <span className="rounded-full border border-teal-800/60 bg-teal-950 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-teal-400">
            Simple Workflow
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl pt-5">
            How FixMate Works
          </h2>
          <p className="text-sm text-slate-400 sm:text-base">
            Get your broken devices or appliances repaired in 4 straightforward
            and transparent steps.
          </p>
        </div>

        {/* ৪ ধাপের ভিজ্যুয়াল ফ্লো */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, index) => {
            const IconComponent = item.icon;
            const isLast = index === steps.length - 1;

            return (
              <div
                key={item.step}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-700/80 bg-slate-800/60 p-6 shadow-sm transition duration-300 hover:border-teal-500/50"
              >
                {/* ডেস্কটপে পরবর্তী ধাপের তীর ইন্ডিকেটর */}
                {!isLast && (
                  <div className="pointer-events-none absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-slate-700 bg-slate-900 p-1.5 text-teal-400 shadow lg:flex">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}

                <div>
                  {/* স্টেপ নম্বর ও আইকন */}
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 transition duration-300 group-hover:bg-teal-600 group-hover:text-white">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <span className="text-2xl font-black text-slate-700 transition duration-300 group-hover:text-teal-500/40">
                      {item.step}
                    </span>
                  </div>

                  {/* টাইটেল ও ডেসক্রিপশন */}
                  <h3 className="mb-2 text-lg font-bold text-white transition group-hover:text-teal-300">
                    {item.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-400 sm:text-sm">
                    {item.description}
                  </p>
                </div>

                {/* নিচে ডেকোরেটিভ প্রোগ্রেস লাইন */}
                <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-slate-700/60">
                  <div className="h-full w-0 bg-teal-500 transition-all duration-500 group-hover:w-full" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}