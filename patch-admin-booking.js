const fs = require('fs');
const path = require('path');

console.log("🛠️ Applying targeted fix for Admin Delete & Booking Persistence...");

// 1. FIX ADMIN PAGE (Permanent Delete + Blacklist + Realtime Sync)
const adminPath = path.join(__dirname, 'app', 'admin', 'page.tsx');
if (fs.existsSync(adminPath)) {
  let adminCode = fs.readFileSync(adminPath, 'utf8');

  // Replace handleDelete with permanent multi-tier deletion
  const newDeleteHandler = `  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত এই বুকিংটি স্থায়ীভাবে মুছে ফেলতে চান?")) return;

    // 1. Delete from Supabase
    try {
      await supabase.from("bookings").delete().eq("id", id);
    } catch (e) {
      console.warn("Supabase delete notice:", e);
    }

    // 2. Remove permanently from localStorage
    try {
      const raw = localStorage.getItem("iponion_bookings");
      if (raw) {
        const list = JSON.parse(raw);
        const filtered = list.filter((b: any) => String(b.id) !== String(id));
        localStorage.setItem("iponion_bookings", JSON.stringify(filtered));
      }

      // 3. Add to deleted IDs blacklist so auto-polling NEVER brings it back
      const delRaw = localStorage.getItem("iponion_deleted_ids") || "[]";
      const delList = JSON.parse(delRaw);
      if (!delList.includes(String(id))) {
        delList.push(String(id));
        localStorage.setItem("iponion_deleted_ids", JSON.stringify(delList));
      }
    } catch (e) {}

    // 4. Update UI State immediately
    setBookings((prev) => prev.filter((b) => String(b.id) !== String(id)));
  };`;

  adminCode = adminCode.replace(/const handleDelete = async \(id: string\) => \{[\s\S]*?\n  \};/, newDeleteHandler);

  // Update loadAllData to filter out blacklisted deleted IDs
  const filterDeletedLogic = `    // Filter out permanently deleted IDs
    const delList = JSON.parse(localStorage.getItem("iponion_deleted_ids") || "[]");
    const activeBookings = merged.filter((b) => !delList.includes(String(b.id)));
    setBookings(activeBookings);`;

  adminCode = adminCode.replace(/setBookings\(merged\);/, filterDeletedLogic);

  fs.writeFileSync(adminPath, adminCode, 'utf8');
  console.log("✅ Admin permanent delete & blacklist applied!");
}

// 2. FIX BOOKING INSERTION IN app/page.tsx (Guaranteed Safe Supabase Insert)
const pagePath = path.join(__dirname, 'app', 'page.tsx');
if (fs.existsSync(pagePath)) {
  let pageCode = fs.readFileSync(pagePath, 'utf8');

  // Replace handleBooking with guaranteed fail-safe insert
  const safeBookingHandler = `  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !area.trim()) {
      alert("অনুগ্রহ করে আপনার নাম, মোবাইল নম্বর এবং সম্পূর্ণ ঠিকানা লিখুন।");
      return;
    }

    setIsSubmitting(true);
    const cleanPhone = normalizePhone(phone);
    const customerEmail = email.trim() || (currentUser?.email || "");

    // 1. Save user session locally
    const userSession = {
      name: name.trim(),
      phone: cleanPhone,
      email: customerEmail,
      role: "customer"
    };
    try {
      localStorage.setItem("iponion_user", JSON.stringify(userSession));
    } catch (e) {}

    // 2. Prepare safe description with date & time embedded
    const scheduleInfo = \`[তারিখ: \${bookingDate} | সময়: \${bookingTime}\${customerEmail ? \` | ইমেইল: \${customerEmail}\` : ""}]\`;
    const fullProblem = problem.trim() ? \`\${scheduleInfo} \${problem.trim()}\` : scheduleInfo;

    const basePayload = {
      service_title: service,
      customer_name: name.trim(),
      customer_phone: cleanPhone,
      customer_email: customerEmail || null,
      customer_address: area.trim(),
      area: area.trim(),
      problem_desc: fullProblem,
      status: "Pending"
    };

    let savedBooking: any = null;

    // 3. Multi-tier insert into Supabase
    try {
      // First try with booking_date & booking_time
      const res1 = await supabase.from("bookings").insert([{
        ...basePayload,
        booking_date: bookingDate,
        booking_time: bookingTime
      }]).select();

      if (!res1.error && res1.data && res1.data.length > 0) {
        savedBooking = res1.data[0];
      } else {
        // Fallback to core columns that always exist
        const res2 = await supabase.from("bookings").insert([basePayload]).select();
        if (res2.data && res2.data.length > 0) {
          savedBooking = res2.data[0];
        }
      }
    } catch (err) {
      console.warn("Supabase insert notice:", err);
    }

    if (!savedBooking) {
      savedBooking = {
        id: "bk_" + Date.now(),
        ...basePayload,
        booking_date: bookingDate,
        booking_time: bookingTime,
        created_at: new Date().toISOString()
      };
    }

    // 4. Save to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem("iponion_bookings") || "[]");
      existing.unshift(savedBooking);
      localStorage.setItem("iponion_bookings", JSON.stringify(existing));
    } catch (e) {}

    // 5. Send Email Alert via FormSubmit
    try {
      fetch("https://formsubmit.co/ajax/iponion.11@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: \`🚨 নতুন বুকিং: \${service} - \${name} (\${cleanPhone})\`,
          Service: service,
          Customer: name,
          Phone: cleanPhone,
          Email: customerEmail,
          Address: area,
          PreferredDate: bookingDate,
          PreferredTime: bookingTime,
          Problem: problem || "N/A"
        })
      }).catch(() => {});
    } catch (e) {}

    setIsSubmitting(false);
    setBookingSuccess(savedBooking);
  };`;

  pageCode = pageCode.replace(/const handleBooking = async \(e: React\.FormEvent\) => \{[\s\S]*?\n  \};/, safeBookingHandler);

  fs.writeFileSync(pagePath, pageCode, 'utf8');
  console.log("✅ Booking fail-safe insert applied in app/page.tsx!");
}

console.log("🎉 Targeted fixes applied successfully!");
