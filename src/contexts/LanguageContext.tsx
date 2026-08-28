import { createContext, useContext, useState, type ReactNode } from 'react';

type Language = 'id' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation data
const translations: Record<Language, Record<string, string>> = {
  id: {
    // Navbar
    'nav.features': 'Fitur',
    'nav.howItWorks': 'Cara Kerja',
    'nav.faq': 'FAQ',
    'nav.signIn': 'Masuk',
    'nav.getStarted': 'Mulai',
    'nav.logout': 'Keluar',
    'nav.dashboard': 'Dashboard',
    
    // Hero Section
    'hero.title1': 'Pahami presentasi Anda.',
    'hero.title2': 'Kuasai pidato Anda.',
    'hero.subtitle': 'Upload slide Anda, latih pidato Anda, dan biarkan AI melatih Anda di setiap kata. Dapatkan feedback nyata tentang penyampaian, konten, dan kepercayaan diri Anda.',
    'hero.startPracticing': 'Mulai Berlatih',
    'hero.tryItOut': 'Coba Sekarang',
    
    // Features Section
    'features.label': 'Fitur',
    'features.title': 'Semua yang Anda butuhkan untuk',
    'features.titleHighlight': 'menguasai presentasi Anda',
    'features.subtitle': 'Dari analisis slide hingga pelatihan pidato, Untion mencakup setiap aspek persiapan Anda.',
    'feature.uploadSlides': 'Upload Slide Anda',
    'feature.uploadSlidesDesc': 'Drag slide PPT atau PDF Anda dan AI kami langsung menganalisis setiap slide — struktur, alur konten, dan hierarki visual.',
    'feature.practiceSpeech': 'Latih Pidato Anda',
    'feature.practiceSpeechDesc': 'Presentasikan materi Anda secara langsung. Engine speech-to-text kami mentranskripsi penyampaian Anda secara real-time, menangkap setiap kata dan jeda.',
    'feature.aiFeedback': 'Mesin Umpan Balik AI',
    'feature.aiFeedbackDesc': 'Dapatkan koreksi cerdas tentang akurasi pidato Anda, typo konten slide, informasi yang hilang, dan kecepatan presentasi.',
    'feature.contentCorrections': 'Koreksi Konten',
    'feature.contentCorrectionsDesc': 'AI memindai slide Anda untuk mencari typo, celah faktual, dan masalah format — menyarankan perbaikan agar materi Anda sempurna.',
    'feature.confidenceScore': 'Skor Kepercayaan Diri',
    'feature.confidenceScoreDesc': 'Lacak peningkatan Anda seiring waktu dengan skor kesiapan yang menunjukkan seberapa baik Anda menguasai materi Anda.',
    'feature.groupMode': 'Mode Grup',
    'feature.groupModeDesc': 'Melatih sebagai tim? Setiap anggota dapat berlatih bagian mereka dan AI memeriksa semua orang siap untuk hari besar.',
    
    // How It Works Section
    'howItWorks.label': 'Cara Kerja',
    'howItWorks.title': 'Enam langkah menuju',
    'howItWorks.titleHighlight': 'penguasaan presentasi',
    'step.01': '01',
    'step.02': '02',
    'step.03': '03',
    'step.04': '04',
    'step.05': '05',
    'step.06': '06',
    'step.uploadPpt': 'Upload PPT Anda',
    'step.uploadPptDesc': 'Drag & drop file presentasi Anda. AI kami langsung mengurai setiap slide dan memetakan poin-poin kunci pembicaraan.',
    'step.configure': 'Konfigurasi & Jelaskan',
    'step.configureDesc': 'Tambahkan deskripsi singkat presentasi Anda dan atur batas waktu untuk setiap pembicara. Sempurna untuk sesi grup.',
    'step.setDuration': 'Atur Durasi',
    'step.setDurationDesc': 'Pilih berapa menit setiap anggota tim mendapat waktu untuk berlatih. Timer akan membuat semua orang tetap pada jalur selama giliran mereka.',
    'step.practiceOutLoud': 'Latih dengan Keras',
    'step.practiceOutLoudDesc': 'Tekan rekam dan presentasikan seperti itu hal nyata. Speech-to-text menangkap semua yang Anda katakan secara real-time.',
    'step.getReview': 'Dapatkan Tinjauan AI',
    'step.getReviewDesc': 'Terima feedback detail: koreksi pidato, typo konten, materi yang hilang, dan skor kesiapan.',
    'step.presentConfidence': 'Presentasikan Dengan Percaya Diri',
    'step.presentConfidenceDesc': 'Masuki ruangan mengetahui slide Anda solid, pidato Anda sempurna, dan tim Anda siap.',
    
    // Value Props
    'value.masterMaterial': 'Kuasai Materi Anda',
    'value.masterMaterialDesc': 'Identifikasi kesenjangan dalam pengetahuan Anda sebelum Anda memasuki ruangan.',
    'value.perfectDelivery': 'Sempurnakan Penyampaian Anda',
    'value.perfectDeliveryDesc': 'Dapatkan feedback yang dapat ditindaklanjuti tentang kecepatan, nada, dan kejelasan.',
    'value.savePrepTime': 'Hemat Waktu Persiapan',
    'value.savePrepTimeDesc': 'Fokus pada latihan yang efektif daripada menebak apa yang perlu dikerjakan.',
    
    // FAQ Section
    'faq.label': 'FAQ',
    'faq.title': 'Punya pertanyaan?',
    'faq.titleHighlight': 'Kami punya jawaban.',
    'faq.subtitle': 'Semua yang perlu Anda ketahui tentang Untion dan cara membantu Anda menguasai presentasi berikutnya.',
    'faq.q1': 'Bagaimana ulasan presentasi AI bekerja?',
    'faq.a1': 'Cukup upload PPT Anda dan mulai presentasi menggunakan mikrofon Anda. AI kami menggunakan speech-to-text untuk mentranskripsi penyampaian Anda secara real-time, kemudian menganalisisnya terhadap konten slide Anda untuk memberikan feedback tentang kecepatan, akurasi, dan kelengkapan.',
    'faq.q2': 'Apakah benar-benar gratis untuk siswa?',
    'faq.a2': 'Ya! Kami membangun Untion khusus untuk siswa, dan fitur praktik inti akan selalu gratis. Kami mungkin memperkenalkan fitur tim premium untuk pengguna enterprise nanti.',
    'faq.q3': 'Bisakah saya berlatih dengan grup saya?',
    'faq.a3': 'Ya, mode Multiplayer kami yang akan datang akan memungkinkan Anda mengundang anggota grup. Setiap orang dapat melatih slide spesifik mereka, dan AI akan mengevaluasi kesiapan tim secara keseluruhan.',
    'faq.q4': 'Format file apa yang didukung?',
    'faq.a4': 'Kami hanya mendukung file PDF. Jika Anda memiliki presentasi PowerPoint (.ppt/.pptx) atau Google Slides, silakan ekspor sebagai PDF terlebih dahulu. Di PowerPoint: File → Save As → PDF. Di Google Slides: File → Download → PDF Document.',
    
    // CTA Section
    'cta.title': 'Berhenti khawatir.',
    'cta.titleHighlight': 'Mulai presentasikan.',
    'cta.subtitle': 'Bergabunglah dengan ribuan siswa yang berlatih lebih cerdas dengan feedback bertenaga AI. Presentasi A-grade Anda dimulai di sini.',
    'cta.button': 'Mulai — Gratis',
    'cta.note': 'Tidak memerlukan kartu kredit · Gratis untuk siswa',
    
    // Footer
    'footer.tagline': 'Pahami Presentasi Anda. Pelatih bertenaga AI untuk siswa.',
    'footer.description': 'Proyek Untion.',
    'footer.credit': 'Dibangun untuk siswa, oleh siswa',
    
    // Common
    'common.cancel': 'Batal',
    'common.save': 'Simpan',
    'common.close': 'Tutup',
    'common.upload': 'Upload',
    'common.loading': 'Memuat...',
    'common.error': 'Terjadi kesalahan',
    'common.success': 'Berhasil',
    
    // Group Practice
    'group.createRoom': 'Buat Ruang Baru',
    'group.joinRoom': 'Bergabung dengan Ruang',
    'group.roomName': 'Nama Ruang',
    'group.roomCode': 'Kode Ruang',
    'group.members': 'Anggota',
    'group.uploadPDF': 'Upload PDF',
    'group.startSession': 'Mulai Sesi',
    'group.leaveRoom': 'Keluar',
    'group.copied': 'Disalin!',
    'group.copy': 'Salin',
    'group.shareCode': 'Bagikan kode ini ke anggota tim Anda',
    'group.nextSteps': 'Langkah Berikutnya',
    'group.step1': 'Pemimpin upload presentasi PDF',
    'group.step2': 'Pemimpin mengatur slide untuk setiap anggota',
    'group.step3': 'Semua bergantian mempresentasikan slide mereka',
    'group.teamMembers': 'Anggota Tim',
    'group.leaderControls': 'Kontrol Pemimpin',
    'group.waitingForLeader': 'Menunggu Pemimpin',
    
    // Modals
    'modal.createRoom.title': 'Buat Ruang Baru',
    'modal.createRoom.description': 'Mulai sesi latihan grup baru',
    'modal.createRoom.namePlaceholder': 'Contoh: Latihan Presentasi Produk',
    'modal.createRoom.nameHelper': 'Buat nama yang deskriptif agar tim Anda mudah mengenali',
    'modal.createRoom.afterCreate': 'Setelah membuat ruang:',
    'modal.createRoom.info1': 'Anda akan mendapat kode 6 karakter untuk tim bergabung',
    'modal.createRoom.info2': 'Upload presentasi dan atur slide untuk setiap anggota',
    'modal.createRoom.info3': 'Mulai sesi latihan bersama',
    'modal.createRoom.creating': 'Membuat...',
    'modal.createRoom.create': 'Buat Ruang',
    
    'modal.joinRoom.title': 'Bergabung dengan Ruang',
    'modal.joinRoom.codeLabel': 'Kode Ruang',
    'modal.joinRoom.codePlaceholder': 'ABC123',
    'modal.joinRoom.codeHelper': 'karakter',
    'modal.joinRoom.afterJoin': 'Setelah bergabung:',
    'modal.joinRoom.info1': 'Anda akan masuk ke ruang tunggu bersama tim',
    'modal.joinRoom.info2': 'Pemimpin akan mengatur slide untuk Anda',
    'modal.joinRoom.info3': 'Mulai latihan presentasi bersama',
    'modal.joinRoom.joining': 'Bergabung...',
    'modal.joinRoom.join': 'Bergabung',
    
    'modal.uploadPDF.title': 'Upload Presentasi',
    'modal.uploadPDF.fileLabel': 'File PDF',
    'modal.uploadPDF.dragDrop': 'Drag PDF di sini atau klik untuk upload',
    'modal.uploadPDF.maxSize': 'Maksimal 50MB',
    'modal.uploadPDF.processing': 'Memproses PDF...',
    'modal.uploadPDF.durationLabel': 'Durasi per Anggota (menit)',
    'modal.uploadPDF.durationHelper': 'Setiap anggota akan mendapat {duration} menit untuk presentasi',
    'modal.uploadPDF.tips': 'Tips',
    'modal.uploadPDF.tip1': 'File harus dalam format PDF',
    'modal.uploadPDF.tip2': 'Maksimal ukuran 50MB',
    'modal.uploadPDF.tip3': 'Slide akan dibagi ke semua anggota',
    'modal.uploadPDF.uploading': 'Uploading',
    
    // Dashboard
    'dashboard.title': 'Bagaimana Anda ingin berlatih?',
    'dashboard.subtitle': 'Pilih mode latihan untuk presentasi Anda. Anda dapat beralih mode kapan saja.',
    'dashboard.soloPractice': 'Solo Practice',
    'dashboard.soloPracticeDesc': 'Sempurnakan penyampaian Anda secara independen. Upload slide Anda dan dapatkan feedback AI yang disesuaikan dengan performa dan kecepatan pribadi Anda.',
    'dashboard.startSolo': 'Mulai Solo',
    'dashboard.groupPractice': 'Group Practice',
    'dashboard.groupPracticeDesc': 'Berkolaborasi dengan tim Anda. Bagi slide presentasi, latih bersama secara real-time, dan pastikan semua orang siap untuk pitch.',
    'dashboard.createRoom': 'Buat Ruang',
    'dashboard.home': 'Home',
    
    // Auth - General
    'auth.backToHome': 'Kembali ke Home',
    'auth.title': 'Untion',
    
    // Login Page
    'auth.login.title': 'Selamat datang kembali',
    'auth.login.subtitle': 'Masuk ke akun Anda untuk melanjutkan',
    'auth.login.email': 'Alamat Email',
    'auth.login.password': 'Kata Sandi',
    'auth.login.forgotPassword': 'Lupa password?',
    'auth.login.button': 'Masuk',
    'auth.login.signingIn': 'Masuk...',
    'auth.login.noAccount': 'Belum punya akun?',
    'auth.login.createAccount': 'Buat akun',
    
    // Register Page
    'auth.register.title': 'Buat akun',
    'auth.register.subtitle': 'Mulai latihan presentasi Anda hari ini',
    'auth.register.username': 'Nama Pengguna',
    'auth.register.email': 'Alamat Email',
    'auth.register.password': 'Kata Sandi',
    'auth.register.passwordHint': 'Minimal 6 karakter.',
    'auth.register.button': 'Buat Akun',
    'auth.register.creating': 'Membuat Akun...',
    'auth.register.haveAccount': 'Sudah punya akun?',
    'auth.register.signIn': 'Masuk',
    
    // Solo Practice - Setup Page
    'practice.solo.setup.title': 'Persiapkan presentasi Anda',
    'practice.solo.setup.subtitle': 'Upload slide Anda sebagai PDF dan beri tahu kami topiknya sehingga AI dapat mengevaluasi pemahaman Anda dengan akurat.',
    'practice.solo.setup.convertPpt': 'Punya file PowerPoint?',
    'practice.solo.setup.convertPptHint': 'Konversi ke PDF terlebih dahulu: Buka di PowerPoint → File → Save As → PDF',
    'practice.solo.setup.fileLabel': 'Upload Presentasi (PDF saja)',
    'practice.solo.setup.fileError': 'File Tidak Valid',
    'practice.solo.setup.fileErrorPdf': 'Hanya file PDF yang didukung. Silakan konversi PowerPoint Anda ke PDF terlebih dahulu.',
    'practice.solo.setup.fileErrorSize': 'Ukuran file melebihi batas 50MB. Silakan gunakan file yang lebih kecil.',
    'practice.solo.setup.dragDrop': 'Klik untuk upload atau drag and drop',
    'practice.solo.setup.pdfOnly': 'PDF saja (Maks 50MB)',
    'practice.solo.setup.descriptionLabel': 'Apa presentasi ini tentang?',
    'practice.solo.setup.descriptionPlaceholder': 'Jelaskan secara singkat topik utama, audiens target, dan tujuan presentasi ini...',
    'practice.solo.setup.descriptionHint': 'Ini membantu pelatih AI kami membandingkan penyampaian Anda yang diucapkan dengan pesan yang Anda maksudkan.',
    'practice.solo.setup.durationLabel': 'Target Durasi (Menit)',
    'practice.solo.setup.durationPlaceholder': 'Contoh: 15',
    'practice.solo.setup.durationUnit': 'Menit',
    'practice.solo.setup.button': 'Lanjutkan ke Ruang Praktik',
    
    // Solo Practice - Session Page
    'practice.solo.session.navbar': 'Setup Solo Practice',
    'practice.solo.session.soloMode': 'Solo Mode',
    'practice.solo.session.finish': 'Selesai',
    'practice.solo.session.listening': 'Mendengarkan... Mulai berbicara.',
    'practice.solo.session.turnOn': 'Nyalakan microphone untuk mulai transkrip.',
    'practice.solo.session.recording': 'Merekam',
    'practice.solo.session.noPresentation': 'Tidak ada presentasi yang dimuat.',
    'practice.solo.session.goToSetup': 'Pergi ke Setup',
    'practice.solo.session.liveTranscript': 'Transkrip Langsung',
    
    // Solo Practice - Result Page
    'practice.solo.result.title': 'Hasil Sesi',
    'practice.solo.result.greatJob': 'Bagus, {username}!',
    'practice.solo.result.backToDashboard': 'Kembali ke Dashboard',
    'practice.solo.result.overallScore': 'Skor Keseluruhan',
    'practice.solo.result.duration': 'Durasi',
    'practice.solo.result.pacing': 'Kecepatan',
    'practice.solo.result.wpm': 'wpm',
    'practice.solo.result.fillerWords': 'Filler Words',
    'practice.solo.result.times': 'kali',
    'practice.solo.result.rubricFeedback': 'Feedback Rubrik Terperinci',
    'practice.solo.result.rubricDesc': 'Berdasarkan standar presentasi akademis.',
    'practice.solo.result.keyStrengths': 'Kekuatan Utama',
    'practice.solo.result.improvements': 'Area untuk Ditingkatkan',
    'practice.solo.result.analyzing': 'AI sedang menganalisis presentasi Anda...',
    'practice.solo.result.scoring': 'Mencetak akurasi konten, kecepatan, dan struktur berdasarkan standar akademis.',
    'practice.solo.result.failed': 'Analisis Gagal',
    'practice.solo.result.failedMsg': 'Gagal menganalisis presentasi. Silakan periksa API key Anda atau coba lagi.',
    'practice.solo.result.tryAgain': 'Coba Lagi',
    'practice.solo.result.emptySession': 'Sesi presentasi tidak menghasilkan transkrip. Pastikan microphone terhubung dan izin akses microphone sudah diberikan.',
    'practice.solo.result.noContent': 'Tidak ada konten yang disampaikan. Silakan coba lagi dan pastikan microphone aktif saat berbicara.',
    'practice.solo.result.contentAccuracy': 'Content Accuracy',
    'practice.solo.result.structureFlow': 'Structure & Flow',
    'practice.solo.result.vocabulary': 'Vocabulary & Terminology',
    'practice.solo.result.fillerWordsAspect': 'Filler Words & Hesitation',
    'practice.solo.result.pacingTime': 'Pacing & Time Management',
    'practice.solo.result.clarity': 'Clarity & Confidence',
    'practice.solo.result.structureCannotEvaluate': 'Tidak dapat mengevaluasi struktur karena tidak ada transkrip.',
    'practice.solo.result.vocabularyCannotEvaluate': 'Tidak dapat mengevaluasi penggunaan istilah karena tidak ada transkrip.',
    'practice.solo.result.fillerWordsNotDetected': 'Tidak terdeteksi filler words karena tidak ada audio yang terekam.',
    'practice.solo.result.pacingCannotEvaluate': 'Tidak dapat mengukur kecepatan bicara karena tidak ada transkrip.',
    'practice.solo.result.clarityCannotEvaluate': 'Tidak dapat menilai kejelasan karena tidak ada konten.',
    'practice.solo.result.tried': 'Anda telah mencoba fitur practice session',
    'practice.solo.result.improvementMic1': 'Pastikan microphone terhubung dengan benar',
    'practice.solo.result.improvementMic2': 'Berikan izin akses microphone di browser',
    'practice.solo.result.improvementMic3': 'Klik tombol microphone untuk mulai merekam sebelum berbicara',
    
    // Group Lobby Page
    'groupLobby.title': 'Group Practice',
    'groupLobby.collaborate': 'Berkolaborasi dengan tim Anda',
    'groupLobby.badge': 'Latihan Bersama',
    'groupLobby.heading': 'Siap berlatih dengan',
    'groupLobby.headingTeam': 'tim Anda?',
    'groupLobby.subtitle': 'Buat ruang untuk memimpin tim Anda, atau bergabung dengan ruang yang ada menggunakan kode. Latihan bersama secara real-time dengan presentasi bergantian.',
    'groupLobby.createRoom': 'Buat Ruang',
    'groupLobby.createRoomDesc': 'Mulai sesi latihan baru sebagai pemimpin. Anda akan mengkonfigurasi presentasi, mengatur slide ke anggota tim, dan mengelola sesi.',
    'groupLobby.youreLeader': 'Anda pemimpin',
    'groupLobby.controlSettings': 'Kontrol pengaturan sesi',
    'groupLobby.joinRoom': 'Bergabung dengan Ruang',
    'groupLobby.joinRoomDesc': 'Masukkan kode ruang 6 karakter untuk bergabung dengan sesi latihan tim Anda. Latih slide yang diberikan saat giliran Anda.',
    'groupLobby.teamMember': 'Anggota tim',
    'groupLobby.needCode': 'Perlu kode ruang',
    'groupLobby.howItWorks': 'Cara Kerja Group Practice',
    'groupLobby.step1': 'Pemimpin membuat',
    'groupLobby.step1Desc': 'ruang dan mengupload presentasi PDF',
    'groupLobby.step2': 'Tim bergabung',
    'groupLobby.step2Desc': 'menggunakan kode ruang dan menunggu sesi dimulai',
    'groupLobby.step3': 'Bergantian',
    'groupLobby.step3Desc': 'mempresentasikan slide yang diberikan dan dapatkan feedback AI',
  },
  en: {
    // Navbar
    'nav.features': 'Features',
    'nav.howItWorks': 'How It Works',
    'nav.faq': 'FAQ',
    'nav.signIn': 'Sign In',
    'nav.getStarted': 'Get Started',
    'nav.logout': 'Logout',
    'nav.dashboard': 'Dashboard',
    
    // Hero Section
    'hero.title1': 'Understand your presentation.',
    'hero.title2': 'Nail your speech.',
    'hero.subtitle': 'Upload your slides, practice your speech, and let AI coach you through every word. Get real feedback on your delivery, content, and confidence.',
    'hero.startPracticing': 'Start Practicing',
    'hero.tryItOut': 'Try It Out',
    
    // Features Section
    'features.label': 'Features',
    'features.title': 'Everything you need to',
    'features.titleHighlight': 'nail your presentation',
    'features.subtitle': 'From slide analysis to speech coaching, Untion covers every angle of your preparation.',
    'feature.uploadSlides': 'Upload Your Slides',
    'feature.uploadSlidesDesc': 'Drop your PPT or PDF and our AI instantly analyzes every slide — structure, content flow, and visual hierarchy.',
    'feature.practiceSpeech': 'Practice Your Speech',
    'feature.practiceSpeechDesc': 'Present your material live. Our speech-to-text engine transcribes your delivery in real time, capturing every word and pause.',
    'feature.aiFeedback': 'AI Feedback Engine',
    'feature.aiFeedbackDesc': 'Get intelligent corrections on your speech accuracy, slide content typos, missing information, and presentation pacing.',
    'feature.contentCorrections': 'Content Corrections',
    'feature.contentCorrectionsDesc': 'The AI scans your slides for typos, factual gaps, and formatting issues — suggesting fixes so your material is bulletproof.',
    'feature.confidenceScore': 'Confidence Score',
    'feature.confidenceScoreDesc': 'Track your improvement over time with a readiness score that shows how well you know your material.',
    'feature.groupMode': 'Group Mode',
    'feature.groupModeDesc': 'Practicing as a team? Each member can rehearse their section and the AI checks everyone is prepared for the big day.',
    
    // How It Works Section
    'howItWorks.label': 'How It Works',
    'howItWorks.title': 'Six steps to',
    'howItWorks.titleHighlight': 'presentation mastery',
    'step.01': '01',
    'step.02': '02',
    'step.03': '03',
    'step.04': '04',
    'step.05': '05',
    'step.06': '06',
    'step.uploadPpt': 'Upload Your PPT',
    'step.uploadPptDesc': 'Drag & drop your presentation file. Our AI instantly parses every slide and maps out the key talking points.',
    'step.configure': 'Configure & Describe',
    'step.configureDesc': 'Add a brief description of your presentation and set the time limit for each speaker. Perfect for group sessions.',
    'step.setDuration': 'Set Duration',
    'step.setDurationDesc': 'Choose how many minutes each team member gets to practice. The timer will keep everyone on track during their turn.',
    'step.practiceOutLoud': 'Practice Out Loud',
    'step.practiceOutLoudDesc': 'Hit record and present like it\'s the real thing. Speech-to-text captures everything you say in real time.',
    'step.getReview': 'Get AI Review',
    'step.getReviewDesc': 'Receive detailed feedback: speech corrections, content typos, missing material, and a readiness score.',
    'step.presentConfidence': 'Present With Confidence',
    'step.presentConfidenceDesc': 'Walk into the room knowing your slides are solid, your speech is polished, and your team is prepared.',
    
    // Value Props
    'value.masterMaterial': 'Master Your Material',
    'value.masterMaterialDesc': 'Identify gaps in your knowledge before you step into the room.',
    'value.perfectDelivery': 'Perfect Your Delivery',
    'value.perfectDeliveryDesc': 'Get actionable feedback on pacing, tone, and clarity.',
    'value.savePrepTime': 'Save Prep Time',
    'value.savePrepTimeDesc': 'Focus on practicing effectively rather than guessing what needs work.',
    
    // FAQ Section
    'faq.label': 'FAQ',
    'faq.title': 'Got questions?',
    'faq.titleHighlight': 'We\'ve got answers.',
    'faq.subtitle': 'Everything you need to know about Untion and how it helps you ace your next presentation.',
    'faq.q1': 'How does the AI presentation review work?',
    'faq.a1': 'Simply upload your PPT and start presenting using your microphone. Our AI uses speech-to-text to transcribe your delivery in real-time, then analyzes it against the content of your slides to provide feedback on pacing, accuracy, and completeness.',
    'faq.q2': 'Is it really free for students?',
    'faq.a2': 'Yes! We built Untion specifically for students, and core practice features will always be free. We may introduce premium team features for enterprise users later.',
    'faq.q3': 'Can I practice with my group?',
    'faq.a3': 'Yes, our upcoming Multiplayer mode will allow you to invite group members. Each person can practice their specific slides, and the AI will evaluate the overall team readiness.',
    'faq.q4': 'What file formats are supported?',
    'faq.a4': 'We support PDF files only. If you have a PowerPoint (.ppt/.pptx) or Google Slides presentation, please export it as PDF first. In PowerPoint: File → Save As → PDF. In Google Slides: File → Download → PDF Document.',
    
    // CTA Section
    'cta.title': 'Stop worrying.',
    'cta.titleHighlight': 'Start presenting.',
    'cta.subtitle': 'Join thousands of students who practice smarter with AI-powered feedback. Your next A-grade presentation starts here.',
    'cta.button': 'Get Started — It\'s Free',
    'cta.note': 'No credit card required · Free for students',
    
    // Footer
    'footer.tagline': 'Understand Your Presentation. AI-powered coach for students.',
    'footer.description': 'Untion Project.',
    'footer.credit': 'Built for students, by students',
    
    // Common
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.close': 'Close',
    'common.upload': 'Upload',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success',
    
    // Group Practice
    'group.createRoom': 'Create New Room',
    'group.joinRoom': 'Join Room',
    'group.roomName': 'Room Name',
    'group.roomCode': 'Room Code',
    'group.members': 'Members',
    'group.uploadPDF': 'Upload PDF',
    'group.startSession': 'Start Session',
    'group.leaveRoom': 'Leave',
    'group.copied': 'Copied!',
    'group.copy': 'Copy',
    'group.shareCode': 'Share this code with your team members',
    'group.nextSteps': 'Next Steps',
    'group.step1': 'Leader uploads presentation PDF',
    'group.step2': 'Leader assigns slide ranges to members',
    'group.step3': 'Everyone takes turns presenting their slides',
    'group.teamMembers': 'Team Members',
    'group.leaderControls': 'Leader Controls',
    'group.waitingForLeader': 'Waiting for Leader',
    
    // Modals
    'modal.createRoom.title': 'Create New Room',
    'modal.createRoom.description': 'Start a new group practice session',
    'modal.createRoom.namePlaceholder': 'e.g., Product Pitch Practice',
    'modal.createRoom.nameHelper': 'Choose a descriptive name that your team will recognize',
    'modal.createRoom.afterCreate': 'After creating room:',
    'modal.createRoom.info1': 'You will get a 6-character code for team to join',
    'modal.createRoom.info2': 'Upload presentation and assign slides for each member',
    'modal.createRoom.info3': 'Start practice session together',
    'modal.createRoom.creating': 'Creating...',
    'modal.createRoom.create': 'Create Room',
    
    'modal.joinRoom.title': 'Join Room',
    'modal.joinRoom.codeLabel': 'Room Code',
    'modal.joinRoom.codePlaceholder': 'ABC123',
    'modal.joinRoom.codeHelper': 'characters',
    'modal.joinRoom.afterJoin': 'After joining:',
    'modal.joinRoom.info1': 'You will enter the waiting room with the team',
    'modal.joinRoom.info2': 'Leader will assign slides for you',
    'modal.joinRoom.info3': 'Start practice presentation together',
    'modal.joinRoom.joining': 'Joining...',
    'modal.joinRoom.join': 'Join',
    
    'modal.uploadPDF.title': 'Upload Presentation',
    'modal.uploadPDF.fileLabel': 'PDF File',
    'modal.uploadPDF.dragDrop': 'Drag PDF here or click to upload',
    'modal.uploadPDF.maxSize': 'Max 50MB',
    'modal.uploadPDF.processing': 'Processing PDF...',
    'modal.uploadPDF.durationLabel': 'Duration per Member (minutes)',
    'modal.uploadPDF.durationHelper': 'Each member will get {duration} minutes to present',
    'modal.uploadPDF.tips': 'Tips',
    'modal.uploadPDF.tip1': 'File must be in PDF format',
    'modal.uploadPDF.tip2': 'Maximum size 50MB',
    'modal.uploadPDF.tip3': 'Slides will be divided among all members',
    'modal.uploadPDF.uploading': 'Uploading',
    
    // Dashboard
    'dashboard.title': 'How would you like to practice?',
    'dashboard.subtitle': 'Choose a practice mode for your presentation. You can always switch modes later.',
    'dashboard.soloPractice': 'Solo Practice',
    'dashboard.soloPracticeDesc': 'Perfect your delivery independently. Upload your slides and get AI feedback tailored entirely to your personal performance and pacing.',
    'dashboard.startSolo': 'Start Solo',
    'dashboard.groupPractice': 'Group Practice',
    'dashboard.groupPracticeDesc': 'Collaborate with your team. Divide presentation slides, practice together in real-time, and ensure everyone is ready for the pitch.',
    'dashboard.createRoom': 'Create Room',
    'dashboard.home': 'Home',
    
    // Auth - General
    'auth.backToHome': 'Back to Home',
    'auth.title': 'Untion',
    
    // Login Page
    'auth.login.title': 'Welcome back',
    'auth.login.subtitle': 'Sign in to your account to continue',
    'auth.login.email': 'Email address',
    'auth.login.password': 'Password',
    'auth.login.forgotPassword': 'Forgot password?',
    'auth.login.button': 'Sign in',
    'auth.login.signingIn': 'Signing in...',
    'auth.login.noAccount': 'Don\'t have an account?',
    'auth.login.createAccount': 'Create an account',
    
    // Register Page
    'auth.register.title': 'Create an account',
    'auth.register.subtitle': 'Start practicing your presentations today',
    'auth.register.username': 'Username',
    'auth.register.email': 'Email address',
    'auth.register.password': 'Password',
    'auth.register.passwordHint': 'Must be at least 6 characters long.',
    'auth.register.button': 'Create Account',
    'auth.register.creating': 'Creating Account...',
    'auth.register.haveAccount': 'Already have an account?',
    'auth.register.signIn': 'Sign in instead',
    
    // Solo Practice - Setup Page
    'practice.solo.setup.title': 'Prepare your presentation',
    'practice.solo.setup.subtitle': 'Upload your slides as PDF and tell us what they are about so the AI can evaluate your understanding accurately.',
    'practice.solo.setup.convertPpt': 'Have a PowerPoint file?',
    'practice.solo.setup.convertPptHint': 'Convert it to PDF first: Open in PowerPoint → File → Save As → PDF',
    'practice.solo.setup.fileLabel': 'Upload Presentation (PDF only)',
    'practice.solo.setup.fileError': 'Invalid File',
    'practice.solo.setup.fileErrorPdf': 'Only PDF files are supported. Please convert your PowerPoint to PDF first.',
    'practice.solo.setup.fileErrorSize': 'File size exceeds 50MB limit. Please use a smaller file.',
    'practice.solo.setup.dragDrop': 'Click to upload or drag and drop',
    'practice.solo.setup.pdfOnly': 'PDF only (Max 50MB)',
    'practice.solo.setup.descriptionLabel': 'What is this presentation about?',
    'practice.solo.setup.descriptionPlaceholder': 'Briefly explain the main topic, target audience, and the goal of this presentation...',
    'practice.solo.setup.descriptionHint': 'This helps our AI coach compare your spoken delivery with your intended message.',
    'practice.solo.setup.durationLabel': 'Target Duration (Minutes)',
    'practice.solo.setup.durationPlaceholder': 'e.g. 15',
    'practice.solo.setup.durationUnit': 'Minutes',
    'practice.solo.setup.button': 'Continue to Practice Room',
    
    // Solo Practice - Session Page
    'practice.solo.session.navbar': 'Solo Practice Setup',
    'practice.solo.session.soloMode': 'Solo Mode',
    'practice.solo.session.finish': 'Finish',
    'practice.solo.session.listening': 'Listening... Start speaking.',
    'practice.solo.session.turnOn': 'Turn on the microphone to begin transcription.',
    'practice.solo.session.recording': 'Recording',
    'practice.solo.session.noPresentation': 'No presentation loaded.',
    'practice.solo.session.goToSetup': 'Go to Setup',
    'practice.solo.session.liveTranscript': 'Live Transcript',
    
    // Solo Practice - Result Page
    'practice.solo.result.title': 'Session Results',
    'practice.solo.result.greatJob': 'Great job, {username}!',
    'practice.solo.result.backToDashboard': 'Back to Dashboard',
    'practice.solo.result.overallScore': 'Overall Score',
    'practice.solo.result.duration': 'Duration',
    'practice.solo.result.pacing': 'Pacing',
    'practice.solo.result.wpm': 'wpm',
    'practice.solo.result.fillerWords': 'Filler Words',
    'practice.solo.result.times': 'times',
    'practice.solo.result.rubricFeedback': 'Detailed Rubric Feedback',
    'practice.solo.result.rubricDesc': 'Based on academic presentation standards.',
    'practice.solo.result.keyStrengths': 'Key Strengths',
    'practice.solo.result.improvements': 'Areas for Improvement',
    'practice.solo.result.analyzing': 'AI is analyzing your presentation...',
    'practice.solo.result.scoring': 'Scoring content accuracy, pacing, and structure based on academic standards.',
    'practice.solo.result.failed': 'Analysis Failed',
    'practice.solo.result.failedMsg': 'Failed to analyze the presentation. Please check your API keys or try again.',
    'practice.solo.result.tryAgain': 'Try Again',
    'practice.solo.result.emptySession': 'The presentation session did not produce a transcript. Make sure your microphone is connected and microphone access permissions have been granted.',
    'practice.solo.result.noContent': 'No content was delivered. Please try again and make sure your microphone is active when speaking.',
    'practice.solo.result.contentAccuracy': 'Content Accuracy',
    'practice.solo.result.structureFlow': 'Structure & Flow',
    'practice.solo.result.vocabulary': 'Vocabulary & Terminology',
    'practice.solo.result.fillerWordsAspect': 'Filler Words & Hesitation',
    'practice.solo.result.pacingTime': 'Pacing & Time Management',
    'practice.solo.result.clarity': 'Clarity & Confidence',
    'practice.solo.result.structureCannotEvaluate': 'Cannot evaluate structure because there is no transcript.',
    'practice.solo.result.vocabularyCannotEvaluate': 'Cannot evaluate terminology usage because there is no transcript.',
    'practice.solo.result.fillerWordsNotDetected': 'No filler words detected because no audio was recorded.',
    'practice.solo.result.pacingCannotEvaluate': 'Cannot measure speaking speed because there is no transcript.',
    'practice.solo.result.clarityCannotEvaluate': 'Cannot assess clarity because there is no content.',
    'practice.solo.result.tried': 'You have tried the practice session feature',
    'practice.solo.result.improvementMic1': 'Make sure your microphone is properly connected',
    'practice.solo.result.improvementMic2': 'Grant microphone access permission in your browser',
    'practice.solo.result.improvementMic3': 'Click the microphone button to start recording before speaking',
    
    // Group Lobby Page
    'groupLobby.title': 'Group Practice',
    'groupLobby.collaborate': 'Collaborate with your team',
    'groupLobby.badge': 'Practice Together',
    'groupLobby.heading': 'Ready to practice with',
    'groupLobby.headingTeam': 'your team?',
    'groupLobby.subtitle': 'Create a room to lead your team, or join an existing room with a code. Practice together in real-time with turn-based presentations.',
    'groupLobby.createRoom': 'Create Room',
    'groupLobby.createRoomDesc': 'Start a new practice session as the leader. You\'ll configure the presentation, assign slides to team members, and manage the session.',
    'groupLobby.youreLeader': 'You\'re the leader',
    'groupLobby.controlSettings': 'Control session settings',
    'groupLobby.joinRoom': 'Join Room',
    'groupLobby.joinRoomDesc': 'Enter a 6-character room code to join your team\'s practice session. Practice your assigned slides when it\'s your turn.',
    'groupLobby.teamMember': 'Team member',
    'groupLobby.needCode': 'Need a room code',
    'groupLobby.howItWorks': 'How Group Practice Works',
    'groupLobby.step1': 'Leader creates',
    'groupLobby.step1Desc': 'a room and uploads the presentation PDF',
    'groupLobby.step2': 'Team joins',
    'groupLobby.step2Desc': 'using the room code and waits for the session to start',
    'groupLobby.step3': 'Take turns',
    'groupLobby.step3Desc': 'presenting your assigned slides and get AI feedback',
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Get from localStorage or default to 'id'
    const saved = localStorage.getItem('language');
    return (saved === 'en' || saved === 'id') ? saved : 'id';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
