const fs = require('fs');
const path = require('path');

const homePagePath = path.join(__dirname, 'app/page.tsx');

if (fs.existsSync(homePagePath)) {
  let content = fs.readFileSync(homePagePath, 'utf8');

  // 1. Update Top Bar Header with both numbers
  content = content.replace(
    /<div className="flex items-center gap-4 text-slate-300">[\s\S]*?<\/div>/,
    `<div className="flex flex-wrap items-center gap-3 sm:gap-4 text-slate-300">
            <a href="tel:01991477412" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone size={11} className="text-lime-400" />
              মোবাইল: <strong className="text-white font-mono">01991477412</strong>
            </a>
            <span className="text-white/20">•</span>
            <a href="tel:096116786" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone size={11} className="text-[#5894FF]" />
              টেল: <strong className="text-white font-mono">096116786</strong>
            </a>
            <span className="hidden sm:inline-flex items-center gap-1">
              <Clock size={11} className="text-amber-400" /> ২৪/৭ অন-কল সাপোর্ট
            </span>
          </div>`
  );

  // 2. Update Hero Section CTA Buttons
  content = content.replace(
    /<a href="tel:01991477412"[\s\S]*?<\/a>\s*<a href="https:\/\/wa\.me\/8801991477412"/,
    `<a href="tel:01991477412" className="px-5 py-3.5 bg-[#81B472] hover:bg-[#72a363] text-white rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 transition-all">
                <Phone size={16} /> 01991477412
              </a>
              <a href="tel:096116786" className="px-5 py-3.5 bg-[#5894FF] hover:bg-[#4382f5] text-white rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 transition-all">
                <Phone size={16} /> 096116786
              </a>
              <a href="https://wa.me/8801991477412"`
  );

  // 3. Update Contact Details Section
  content = content.replace(
    /<div className="flex items-center gap-3">\s*<Phone size=\{18\}[\s\S]*?<\/div>\s*<\/div>/,
    `<div className="flex items-start gap-3">
                  <Phone size={18} className="text-[#81B472] flex-shrink-0 mt-1" />
                  <div>
                    <strong className="text-slate-900">হটলাইন ও টেলিফোন যোগাযোগ:</strong>
                    <p className="font-mono text-slate-700 mt-1">
                      মোবাইল ও WhatsApp: <a href="tel:01991477412" className="font-bold text-slate-900 hover:underline">01991477412</a>
                    </p>
                    <p className="font-mono text-slate-700 mt-0.5">
                      টেলিফোন (IP Phone): <a href="tel:096116786" className="font-bold text-[#5894FF] hover:underline">096116786</a>
                    </p>
                  </div>
                </div>`
  );

  // 4. Update Footer Copyright Bar
  content = content.replace(
    /© \{new Date\(\)\.getFullYear\(\)\} IPonion \(আইপিওনিয়ন\)[\s\S]*?<\/div>/,
    `হটলাইন: <a href="tel:01991477412" className="text-white hover:underline">01991477412</a> • টেলিফোন: <a href="tel:096116786" className="text-[#5894FF] hover:underline">096116786</a> • মোহাম্মদপুর, ঢাকা<br className="sm:hidden" /> | © {new Date().getFullYear()} IPonion. All rights reserved.
          </div>`
  );

  fs.writeFileSync(homePagePath, content, 'utf8');
  console.log('✓ app/page.tsx updated with new telephone number: 096116786');
}
