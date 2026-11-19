// src/components/home/HowItWorks.tsx
import { Search, Send, Wrench, CheckCircle2 } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Find a Service",
      description: "Browse through our categories and select the exact repair service you need for your device or appliance.",
      icon: Search,
    },
    {
      step: "02",
      title: "Send a Request",
      description: "Submit your service booking request with your location, preferred time, and issue description.",
      icon: Send,
    },
    {
      step: "03",
      title: "Technician Fixes It",
      description: "Our certified professional technician arrives at your doorstep and repairs the device efficiently.",
      icon: Wrench,
    },
    {
      step: "04",
      title: "Pay After Completion",
      description: "Inspect your fully repaired device and complete payment securely after the service is done.",
      icon: CheckCircle2,
    },
  ];

  return (
    // এখানে id="how-it-works" সঠিকভাবে বসানো হলো
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-950 border-b border-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* সেকশন হেডার */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-teal-400 font-semibold text-xs uppercase tracking-wider bg-teal-950 px-3.5 py-1.5 rounded-full border border-teal-800/60">
            Simple Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How FixMate Works
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Get your broken devices or appliances repaired in 4 straightforward and transparent steps.
          </p>
        </div>

        {/* ৪ ধাপের গ্রিড ফ্লো */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className="bg-slate-800/60 border border-slate-700/80 p-6 rounded-2xl relative flex flex-col justify-between hover:border-teal-500/50 transition duration-300 shadow-sm group"
              >
                <div>
                  {/* স্টেপ নম্বর ও আইকন */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition duration-300">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black text-slate-700 group-hover:text-teal-500/40 transition duration-300">
                      {item.step}
                    </span>
                  </div>

                  {/* টাইটেল ও ডেসক্রিপশন */}
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-teal-300 transition">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* নিচে ছোট একটি ডেকোরেটিভ লাইন */}
                <div className="w-full h-1 bg-slate-700/60 rounded-full mt-6 overflow-hidden">
                  <div className="w-0 h-full bg-teal-500 group-hover:w-full transition-all duration-500" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}