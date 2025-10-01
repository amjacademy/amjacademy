(() => {
  const sampleAnnouncements = [
    {
      id: 1,
      title: "Ganesh Chaturthi Holiday",
      message: "On account of Ganesh Chaturthi, AMJ Academy will not be conducting classes between 3 AM IST on Wednesday, 27 Aug 2025 and 2 AM IST on Thursday, 28 Aug 2025. Classes will resume normally from 3 AM IST on Thursday, 28 Aug 2025.",
      duration: "03:00",
      receiver: "All"
    }
  ];
  localStorage.setItem('announcements', JSON.stringify(sampleAnnouncements));
  localStorage.setItem('announcementClosed', 'false');
  console.log("Sample announcement added to localStorage.");
})();
