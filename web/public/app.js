    // ================= STATE MANAGEMENT =================
    let currentUser = null; // null means guest. Otherwise { name: '...', email: '...', avatar: '...' }
    let currentAuthTab = 'login';
    let otpCountdownTimer = null;
    let otpSecondsLeft = 300; // 5 minutes

        // Mock Database for Places
    const PLACES_DB = [
      { id: 1, name: 'Chùa Một Cột', category: 'Attraction', province: 'Hà Nội', stars: 4.8, price: 0, address: 'Đội Cấn, Ba Đình, Hà Nội', img: 'https://images.unsplash.com/photo-1509060464153-44667396260f?w=800', desc: 'Di sản văn hóa kiến trúc độc đáo mô phỏng hoa sen nở từ mặt nước, biểu tượng ngàn năm văn hiếnThăng Long.', lat: 50, lng: 70 },
      { id: 2, name: 'Phở Thìn Lò Đúc', category: 'Restaurant', province: 'Hà Nội', stars: 4.7, price: 90000, address: '13 Lò Đúc, Hai Bà Trưng, Hà Nội', img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', desc: 'Phở bò tái lăn trứ danh Hà Thành với nước dùng béo ngậy, thịt bò xào cháy cạnh thơm nức mùi tỏi hành.', lat: 80, lng: 110 },
      { id: 3, name: 'Cà Phê Trứng Giảng 1946', category: 'Cafe', province: 'Hà Nội', stars: 4.9, price: 45000, address: '39 Nguyễn Hữu Huân, Hoàn Kiếm, Hà Nội', img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800', desc: 'Quán cà phê khai sinh ra món Cà phê trứng trứ danh. Vị béo mịn của trứng đánh bông hòa cùng vị đắng đậm đà.', lat: 100, lng: 120 },
      { id: 4, name: 'Cầu Vàng Bà Nà Hills', category: 'Attraction', province: 'Đà Nẵng', stars: 4.9, price: 900000, address: 'Hòa Vang, Đà Nẵng', img: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800', desc: 'Cây cầu đi bộ nổi tiếng thế giới được nâng đỡ bởi hai bàn tay khổng lồ rêu phong trên đỉnh núi mây phủ.', lat: 180, lng: 200 },
      { id: 5, name: 'Bãi Biển Mỹ Khê', category: 'Attraction', province: 'Đà Nẵng', stars: 4.8, price: 0, address: 'Sơn Trà, Đà Nẵng', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', desc: 'Top bãi biển quyến rũ nhất hành tinh với cát trắng mịn, nước biển trong xanh quanh năm mát rượi.', lat: 210, lng: 240 },
      { id: 6, name: 'Mường Thanh Luxury Resort 5★', category: 'Hotel', province: 'Đà Nẵng', stars: 5.0, price: 1850000, address: '270 Võ Nguyên Giáp, Ngũ Hành Sơn, Đà Nẵng', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', desc: 'Khách sạn 5 sao mặt biển Mỹ Khê với hồ bơi vô cực ngắm bình minh toàn cảnh đại dương.', lat: 230, lng: 280 },
      { id: 7, name: 'Thung Lũng Tình Yêu', category: 'Attraction', province: 'Đà Lạt', stars: 4.7, price: 250000, address: 'Đường Mai Anh Đào, Đà Lạt', img: 'https://images.unsplash.com/photo-1583244532610-2a234e7c3eca?w=800', desc: 'Khung cảnh thiên nhiên lãng mạn giữa rừng thông bạt ngàn, đồi hoa cẩm tú cầu và hồ nước trong veo.', lat: 140, lng: 310 },
      { id: 8, name: 'Bánh Căn Lệ Yersin', category: 'Restaurant', province: 'Đà Lạt', stars: 4.6, price: 55000, address: '27/44 Yersin, Đà Lạt', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', desc: 'Bánh căn giòn rụm nhân lòng đỏ trứng gà tươi ăn kèm xíu mại cay nồng giữa không khí sương lạnh.', lat: 160, lng: 340 },
      { id: 9, name: 'InterContinental Phu Quoc Long Beach', category: 'Hotel', province: 'Phú Quốc', stars: 4.9, price: 3400000, address: 'Bãi Trường, Dương Tơ, Phú Quốc', img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800', desc: 'Khu nghỉ dưỡng đẳng cấp quốc tế ven biển Phú Quốc với thiết kế kiến trúc kiến tạo trải nghiệm xa xỉ.', lat: 300, lng: 400 },
      { id: 10, name: 'Hồ Tuyền Lâm & Đường Hầm Đất Sét', category: 'Attraction', province: 'Đà Lạt', stars: 4.8, price: 120000, address: 'KDL Hồ Tuyền Lâm, Đà Lạt', img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800', desc: 'Hồ nước ngọt lớn nhất Đà Lạt bao quanh bởi đồi thông nguyên sinh mát rượi và công trình điêu khắc độc đáo.', lat: 150, lng: 320 },
      { id: 11, name: 'The Hill Station Bakery & Cafe', category: 'Cafe', province: 'Hội An', stars: 4.7, price: 65000, address: '321 Nguyễn Thị Minh Khai, Hội An', img: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800', desc: 'Quán cà phê mang phong cách Indochine hoài cổ trong lòng phố cổ Hội An với bánh ngọt tự làm thơm ngon.', lat: 250, lng: 220 },
      { id: 12, name: 'Nhà Hàng Cơm Phố Cổ', category: 'Restaurant', province: 'Hội An', stars: 4.8, price: 180000, address: '108 Trần Phú, Hội An', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', desc: 'Không gian ẩm thực mộc mạc đặc trưng Hội An với Cao Lầu, Mì Quảng và Bánh vạc chuẩn vị xứ Quảng.', lat: 260, lng: 230 }
    ];

    // Mock Database for Trips
    let TRIPS_DB = [
      { id: 101, name: 'Khám phá Hà Nội mùa thu', province: 'Hà Nội', budget: 3500000, startDate: '2026-08-15', endDate: '2026-08-17', status: 'upcoming', places: [1, 2, 3] },
      { id: 102, name: 'Nghỉ dưỡng biển Đà Nẵng', province: 'Đà Nẵng', budget: 6000000, startDate: '2026-09-22', endDate: '2026-09-25', status: 'upcoming', places: [4, 5, 6] },
      { id: 103, name: 'Phượt Đà Lạt lãng mạn', province: 'Đà Lạt', budget: 4500000, startDate: '2026-07-19', endDate: '2026-07-23', status: 'ongoing', places: [7, 8] },
      { id: 104, name: 'Check-in ẩm thực Hà Nội xưa', province: 'Hà Nội', budget: 2000000, startDate: '2026-06-10', endDate: '2026-06-12', status: 'history', places: [2, 3], diaryNotes: 'Chuyến đi Hà Nội lần này thật tuyệt vời. Chúng tôi đã được thưởng thức món Phở Thìn Lò Đúc trứ danh với vị béo ngậy và đắng nhẹ của cà phê trứng Giảng cổ kính. Cả gia đình ai cũng thích và mong muốn sẽ sớm quay trở lại thủ đô thân yêu!', diaryMood: '🤩 Hào hứng', diaryPhotos: ['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'] }
    ];

    // User Interests
    const ALL_INTERESTS = ['Du lịch Tây Bắc', 'Ẩm thực miền Tây', 'Nghỉ dưỡng Phú Quốc', 'Di sản văn hóa', 'Phượt xe máy', 'Bãi biển hoang sơ', 'Chụp ảnh check-in', 'Du lịch tâm linh'];
    let selectedInterests = ['Di sản văn hóa', 'Chụp ảnh check-in'];

    // Active Selection states
    let selectedActiveCategory = 'All';
    let currentDetailPlace = PLACES_DB[0];
    let selectedReviewRating = 5;
    let activeTripsFilter = 'upcoming';
    let currentPlannerTrip = TRIPS_DB[0];
    let currentPlannerDay = 0; // 0-indexed day select
    let mapZoomLevel = 1.0; // scale factor for simulated map

    // Slider state
    let currentHeroSlideIndex = 0;
    let heroSliderTimer = null;

    // Gallery Modal State
    let activeGalleryImages = [];
    let activeGalleryIndex = 0;

    // Diary Images
    let uploadedDiaryImages = [
      'https://images.unsplash.com/photo-1528127269322-539801943592?w=300',
      'https://images.unsplash.com/photo-1509060464153-44667396260f?w=300',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300'
    ];

    // ================= APP INITIALIZATION =================
    window.addEventListener('DOMContentLoaded', () => {
      // Check localStorage for logged-in user simulation
      const savedUser = localStorage.getItem('travellako_user');
      if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthUI();
      }

      // Init Lucide
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }

      // Render search page initially to populate list
      renderSearchList();
      renderInterestsGrid();
      
      // Start Slider
      startHeroSlider();

      // Show Home screen initially
      navigate('home');
    });

    // ================= TOAST SYSTEM =================
    function showToast(message, type = 'success') {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      
      let borderCol = 'border-successGreen';
      let icon = 'check-circle';
      let textCol = 'text-successGreen';

      if (type === 'error') {
        borderCol = 'border-errorRed';
        icon = 'alert-triangle';
        textCol = 'text-errorRed';
      } else if (type === 'warning') {
        borderCol = 'border-warningYellow';
        icon = 'alert-circle';
        textCol = 'text-warningYellow';
      }

      toast.className = `flex items-center gap-3 bg-white border-l-4 ${borderCol} p-4 rounded-xl shadow-lg w-80 pointer-events-auto fade-in transition-all`;
      toast.innerHTML = `
        <i data-lucide="${icon}" class="${textCol} w-5 h-5 flex-shrink-0"></i>
        <div class="text-xs font-semibold text-slateDark">${message}</div>
      `;
      
      container.appendChild(toast);
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }

      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-x-4');
        setTimeout(() => {
          toast.remove();
        }, 300);
      }, 3000);
    }

    // ================= NAVIGATION SYSTEM =================
    function navigate(pageId) {
      // Show/Hide page views
      const pages = ['home', 'search', 'detail', 'auth', 'trips', 'planner', 'diary', 'profile', 'saved'];
      pages.forEach(p => {
        const el = document.getElementById(`page-${p}`);
        if (el) {
          if (p === pageId) {
            el.classList.remove('hidden');
          } else {
            el.classList.add('hidden');
          }
        }
      });

      // Update select value
      document.getElementById('quick-selector').value = pageId;

      // Hide header, footer, and AI chat bubble on auth page
      const headerEl = document.querySelector('header');
      const footerEl = document.querySelector('footer');
      const aiBubbleEl = document.getElementById('ai-floating-bubble');
      const aiPanelEl = document.getElementById('ai-chat-panel');

      if (pageId === 'auth') {
        if (headerEl) headerEl.classList.add('hidden');
        if (footerEl) footerEl.classList.add('hidden');
        if (aiBubbleEl) aiBubbleEl.classList.add('hidden');
        if (aiPanelEl) aiPanelEl.classList.add('hidden');
      } else {
        if (headerEl) headerEl.classList.remove('hidden');
        if (footerEl) footerEl.classList.remove('hidden');
        if (aiBubbleEl) aiBubbleEl.classList.remove('hidden');
      }

      // Update Header nav state
      const navLinks = document.querySelectorAll('.nav-link');
      navLinks.forEach(link => {
        if (link.getAttribute('data-page') === pageId) {
          link.classList.add('text-oceanBlue', 'border-oceanBlue');
          link.classList.remove('text-slateMuted', 'border-transparent');
        } else {
          link.classList.remove('text-oceanBlue', 'border-oceanBlue');
          link.classList.add('text-slateMuted', 'border-transparent');
        }
      });

      // Dynamic view renders on page switch
      if (pageId === 'detail') {
        renderPlaceDetails();
      } else if (pageId === 'trips') {
        renderTripsList();
      } else if (pageId === 'planner') {
        renderTripPlanner();
      } else if (pageId === 'diary') {
        renderDiaryPage();
      } else if (pageId === 'saved') {
        renderSavedPlacesPage();
      } else if (pageId === 'profile') {
        renderUserProfile();
      } else if (pageId === 'search') {
        renderSearchList();
      }

      // Re-create icons
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ================= USER DROPDOWN TOGGLE =================
    function toggleUserDropdown() {
      const dropdown = document.getElementById('user-dropdown');
      dropdown.classList.toggle('hidden');
    }

    function toggleAiChatPanel() {
      const panel = document.getElementById('ai-chat-panel');
      panel.classList.toggle('hidden');
      panel.classList.toggle('translate-x-full');
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }

    // ================= SLIDER LOGIC =================
    function startHeroSlider() {
      clearInterval(heroSliderTimer);
      heroSliderTimer = setInterval(() => {
        nextHeroSlide();
      }, 5000);
    }

    function nextHeroSlide() {
      const slides = document.querySelectorAll('#hero-slider .slide');
      slides[currentHeroSlideIndex].classList.replace('opacity-100', 'opacity-0');
      currentHeroSlideIndex = (currentHeroSlideIndex + 1) % slides.length;
      slides[currentHeroSlideIndex].classList.replace('opacity-0', 'opacity-100');
    }

    function prevSlide() {
      const slides = document.querySelectorAll('#hero-slider .slide');
      slides[currentHeroSlideIndex].classList.replace('opacity-100', 'opacity-0');
      currentHeroSlideIndex = (currentHeroSlideIndex - 1 + slides.length) % slides.length;
      slides[currentHeroSlideIndex].classList.replace('opacity-0', 'opacity-100');
      startHeroSlider();
    }

    function nextSlide() {
      nextHeroSlide();
      startHeroSlider();
    }

    // ================= SEARCH ACTIONS =================
    function handleHeroSearch() {
      const provinceEl = document.getElementById('hero-province-select');
      const durationEl = document.getElementById('hero-duration-select');
      const budgetEl = document.getElementById('hero-budget-select');

      const province = provinceEl ? provinceEl.value : '';
      const duration = durationEl ? durationEl.value : '3';
      const budget = budgetEl ? parseInt(budgetEl.value) : 3500000;

      if (province) {
        filterProvince = province;
        const sideProv = document.getElementById('sidebar-filter-province');
        if (sideProv) sideProv.value = province;
      }

      filterMaxPrice = budget;
      const sideMax = document.getElementById('sidebar-price-max');
      if (sideMax) sideMax.value = budget;
      
      updatePriceRange('max');
      renderSearchList();
      navigate('search');
      showToast(`AI đang gợi ý các điểm đến tại ${province || 'Việt Nam'} (${duration} ngày)!`, 'success');
    }

    function setBudgetPreset(minVal, maxVal) {
      filterMinPrice = minVal;
      filterMaxPrice = maxVal;

      const sideMin = document.getElementById('sidebar-price-min');
      const sideMax = document.getElementById('sidebar-price-max');
      if (sideMin) sideMin.value = minVal;
      if (sideMax) sideMax.value = maxVal;

      updatePriceRange('min');
      updatePriceRange('max');
      renderSearchList();
      showToast(`Đã chọn khoảng giá: ${minVal.toLocaleString('vi-VN')} - ${maxVal.toLocaleString('vi-VN')} VNĐ`);
    }

    function handleHomeSearch() {
      const province = document.getElementById('search-province') ? document.getElementById('search-province').value : '';
      
      if (province) {
        filterProvince = province;
        const sideProv = document.getElementById('sidebar-filter-province');
        if (sideProv) sideProv.value = province;
        renderSearchList();
        navigate('search');
        showToast(`Tìm kiếm các địa điểm tại ${province}`);
      } else {
        renderSearchList();
        navigate('search');
      }
    }

    function searchByDestination(province) {
      filterProvince = province;
      const sideProv = document.getElementById('sidebar-filter-province');
      if (sideProv) sideProv.value = province;
      renderSearchList();
      navigate('search');
      showToast(`Hiển thị kết quả cho: ${province}`);
    }

    // ================= AUTHENTICATION LOGIC =================
    function togglePasswordVisibility(inputId, buttonId) {
      const input = document.getElementById(inputId);
      const btn = document.getElementById(buttonId);
      if (!input || !btn) return;
      
      if (input.type === 'password') {
        input.type = 'text';
        btn.innerHTML = `
          <svg class="w-5 h-5 text-slateMuted" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"></path>
          </svg>
        `;
      } else {
        input.type = 'password';
        btn.innerHTML = `
          <svg class="w-5 h-5 text-slateMuted" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        `;
      }
    }

    let forgotOtpTimer = null;
    let forgotOtpSecondsLeft = 300;

    function hideAllAuthForms() {
      const forms = ['form-login', 'form-register', 'form-otp', 'form-forgot-email', 'form-forgot-otp', 'form-forgot-reset'];
      forms.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
      });
    }

    function switchAuthTab(tab) {
      currentAuthTab = tab;
      hideAllAuthForms();
      
      const titleContainer = document.getElementById('auth-title-container');
      if (titleContainer) titleContainer.classList.remove('hidden');

      const loginForm = document.getElementById('form-login');
      const regForm = document.getElementById('form-register');
      const tabLogin = document.getElementById('btn-tab-login');
      const tabReg = document.getElementById('btn-tab-register');

      if (tab === 'login') {
        if (loginForm) loginForm.classList.remove('hidden');
        if (tabLogin) tabLogin.className = 'font-heading font-bold text-xl text-oceanBlue border-b-2 border-oceanBlue pb-2.5 focus:outline-none transition-all';
        if (tabReg) tabReg.className = 'font-heading font-bold text-xl text-slateMuted hover:text-slateDark border-b-2 border-transparent pb-2.5 focus:outline-none transition-all';
      } else {
        if (regForm) regForm.classList.remove('hidden');
        if (tabReg) tabReg.className = 'font-heading font-bold text-xl text-oceanBlue border-b-2 border-oceanBlue pb-2.5 focus:outline-none transition-all';
        if (tabLogin) tabLogin.className = 'font-heading font-bold text-xl text-slateMuted hover:text-slateDark border-b-2 border-transparent pb-2.5 focus:outline-none transition-all';
      }
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function showForgotPasswordForm() {
      hideAllAuthForms();
      const titleContainer = document.getElementById('auth-title-container');
      if (titleContainer) titleContainer.classList.add('hidden');

      const forgotEmailForm = document.getElementById('form-forgot-email');
      if (forgotEmailForm) forgotEmailForm.classList.remove('hidden');
      
      const loginEmail = document.getElementById('login-email') ? document.getElementById('login-email').value : '';
      if (loginEmail && document.getElementById('forgot-email')) {
        document.getElementById('forgot-email').value = loginEmail;
      }
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function handleSendResetOtp() {
      const emailInput = document.getElementById('forgot-email');
      const email = emailInput ? emailInput.value.trim() : '';

      if (!email || !email.includes('@')) {
        showToast('Vui lòng nhập địa chỉ email hợp lệ', 'error');
        return;
      }

      hideAllAuthForms();
      const forgotOtpForm = document.getElementById('form-forgot-otp');
      if (forgotOtpForm) forgotOtpForm.classList.remove('hidden');

      startForgotOtpTimer();
      showToast(`Mã OTP khôi phục đã gửi tới ${email}!`, 'warning');
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function startForgotOtpTimer() {
      clearInterval(forgotOtpTimer);
      forgotOtpSecondsLeft = 300;
      const btnResend = document.getElementById('forgot-resend-btn');
      const timerEl = document.getElementById('forgot-otp-timer');
      if (btnResend) btnResend.disabled = true;
      if (timerEl) timerEl.innerText = '05:00';

      forgotOtpTimer = setInterval(() => {
        forgotOtpSecondsLeft--;
        const mins = Math.floor(forgotOtpSecondsLeft / 60);
        const secs = forgotOtpSecondsLeft % 60;
        const minsStr = mins.toString().padStart(2, '0');
        const secsStr = secs.toString().padStart(2, '0');
        
        if (timerEl) timerEl.innerText = `${minsStr}:${secsStr}`;

        if (forgotOtpSecondsLeft <= 0) {
          clearInterval(forgotOtpTimer);
          if (btnResend) btnResend.disabled = false;
          showToast('Mã OTP khôi phục đã hết hạn. Hãy bấm gửi lại.', 'error');
        }
      }, 1000);
    }

    function resendForgotOtp() {
      startForgotOtpTimer();
      showToast('Đã gửi lại mã OTP khôi phục mật khẩu!');
    }

    function handleVerifyResetOtp() {
      const o1 = document.getElementById('forgot-otp-1') ? document.getElementById('forgot-otp-1').value : '';
      const o2 = document.getElementById('forgot-otp-2') ? document.getElementById('forgot-otp-2').value : '';
      const o3 = document.getElementById('forgot-otp-3') ? document.getElementById('forgot-otp-3').value : '';
      const o4 = document.getElementById('forgot-otp-4') ? document.getElementById('forgot-otp-4').value : '';
      const o5 = document.getElementById('forgot-otp-5') ? document.getElementById('forgot-otp-5').value : '';
      const o6 = document.getElementById('forgot-otp-6') ? document.getElementById('forgot-otp-6').value : '';

      const code = o1 + o2 + o3 + o4 + o5 + o6;
      if (code.length < 6) {
        showToast('Vui lòng nhập đủ 6 chữ số OTP', 'error');
        return;
      }

      clearInterval(forgotOtpTimer);
      hideAllAuthForms();
      const resetForm = document.getElementById('form-forgot-reset');
      if (resetForm) resetForm.classList.remove('hidden');

      showToast('Xác minh mã OTP thành công! Nhập mật khẩu mới.', 'success');
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function handleSetNewPassword() {
      const p1 = document.getElementById('forgot-new-pass') ? document.getElementById('forgot-new-pass').value : '';
      const p2 = document.getElementById('forgot-confirm-pass') ? document.getElementById('forgot-confirm-pass').value : '';

      if (!p1 || p1.length < 6) {
        showToast('Mật khẩu mới phải từ 6 ký tự trở lên', 'error');
        return;
      }
      if (p1 !== p2) {
        showToast('Xác nhận mật khẩu mới không khớp!', 'error');
        return;
      }

      // Success animation & return to Login
      if (typeof confetti !== 'undefined') {
        confetti({
          particleCount: 180,
          spread: 90,
          origin: { y: 0.6 }
        });
      }

      showToast('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.', 'success');

      // Pre-fill login email
      const forgotEmail = document.getElementById('forgot-email') ? document.getElementById('forgot-email').value : '';
      if (forgotEmail && document.getElementById('login-email')) {
        document.getElementById('login-email').value = forgotEmail;
      }
      if (document.getElementById('login-password')) {
        document.getElementById('login-password').value = '';
      }

      // Clear forgot form fields
      if (document.getElementById('forgot-new-pass')) document.getElementById('forgot-new-pass').value = '';
      if (document.getElementById('forgot-confirm-pass')) document.getElementById('forgot-confirm-pass').value = '';

      switchAuthTab('login');
    }

    function simulateGoogleAuth() {
      currentUser = {
        name: 'Đăng nhập Google',
        email: 'googletraveler@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
      };
      localStorage.setItem('travellako_user', JSON.stringify(currentUser));
      updateAuthUI();
      showToast('Đăng nhập bằng Google thành công!');
      navigate('home');
    }

    function handleLogin() {
      const email = document.getElementById('login-email').value;
      const pass = document.getElementById('login-password').value;

      if (!email || !pass) {
        showToast('Vui lòng điền đầy đủ email và mật khẩu', 'error');
        return;
      }

      currentUser = {
        name: email.split('@')[0],
        email: email,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
      };
      localStorage.setItem('travellako_user', JSON.stringify(currentUser));
      updateAuthUI();
      showToast('Đăng nhập thành công!');
      navigate('home');
    }

    function handleRegister() {
      const name = document.getElementById('reg-name').value;
      const email = document.getElementById('reg-email').value;
      const pass = document.getElementById('reg-password').value;

      if (!name || !email || !pass) {
        showToast('Vui lòng nhập đầy đủ các trường thông tin', 'error');
        return;
      }

      // Hide both forms, show OTP
      document.getElementById('form-login').classList.add('hidden');
      document.getElementById('form-register').classList.add('hidden');
      document.getElementById('auth-title-container').classList.add('hidden');
      document.getElementById('form-otp').classList.remove('hidden');
      
      startOtpTimer();
      showToast('Đã gửi mã OTP đến email của bạn!', 'warning');
    }

    function startOtpTimer() {
      clearInterval(otpCountdownTimer);
      otpSecondsLeft = 300; // 5 minutes countdown
      document.getElementById('resend-otp-btn').disabled = true;
      document.getElementById('otp-timer').innerText = '05:00';

      otpCountdownTimer = setInterval(() => {
        otpSecondsLeft--;
        const mins = Math.floor(otpSecondsLeft / 60);
        const secs = otpSecondsLeft % 60;
        const minsStr = mins.toString().padStart(2, '0');
        const secsStr = secs.toString().padStart(2, '0');
        
        document.getElementById('otp-timer').innerText = `${minsStr}:${secsStr}`;

        if (otpSecondsLeft <= 0) {
          clearInterval(otpCountdownTimer);
          document.getElementById('resend-otp-btn').disabled = false;
          showToast('Mã OTP đã hết hạn. Hãy bấm gửi lại.', 'error');
        }
      }, 1000);
    }

    function resetOtpTimer() {
      startOtpTimer();
      showToast('Đã gửi lại mã OTP mới!');
    }

    function moveOtpFocus(current, nextId) {
      if (current.value.length === 1) {
        document.getElementById(nextId).focus();
      }
    }

    function verifyOtpCode() {
      const o1 = document.getElementById('otp-1').value;
      const o2 = document.getElementById('otp-2').value;
      const o3 = document.getElementById('otp-3').value;
      const o4 = document.getElementById('otp-4').value;
      const o5 = document.getElementById('otp-5').value;
      const o6 = document.getElementById('otp-6').value;

      const code = o1 + o2 + o3 + o4 + o5 + o6;

      if (code.length < 6) {
        showToast('Vui lòng nhập đủ 6 chữ số OTP', 'error');
        return;
      }

      // Successful simulation
      const name = document.getElementById('reg-name').value;
      const email = document.getElementById('reg-email').value;

      currentUser = {
        name: name || 'Thành viên mới',
        email: email || 'newmember@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
      };
      
      localStorage.setItem('travellako_user', JSON.stringify(currentUser));
      clearInterval(otpCountdownTimer);
      updateAuthUI();
      
      // Celebrate with confetti!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      showToast('Xác minh tài khoản thành công!');
      
      // Clean forms
      document.getElementById('reg-name').value = '';
      document.getElementById('reg-email').value = '';
      document.getElementById('reg-password').value = '';
      document.getElementById('otp-1').value = '';
      document.getElementById('otp-2').value = '';
      document.getElementById('otp-3').value = '';
      document.getElementById('otp-4').value = '';
      document.getElementById('otp-5').value = '';
      document.getElementById('otp-6').value = '';

      // Back to normal
      document.getElementById('auth-title-container').classList.remove('hidden');
      switchAuthTab('login');
      navigate('home');
    }

    function submitOtp() {
      verifyOtpCode();
    }

    function updateAuthUI() {
      const unreg = document.getElementById('auth-unregistered');
      const reg = document.getElementById('auth-registered');
      
      const navTrips = document.getElementById('nav-trips');
      const navDiary = document.getElementById('nav-diary');
      const navProfile = document.getElementById('nav-profile');

      if (currentUser) {
        unreg.classList.add('hidden');
        reg.classList.remove('hidden');
        document.getElementById('header-username').innerText = currentUser.name;
        document.getElementById('header-avatar').src = currentUser.avatar;

        if (navTrips) navTrips.classList.remove('hidden');
        if (navDiary) navDiary.classList.remove('hidden');
        if (navProfile) navProfile.classList.remove('hidden');
      } else {
        unreg.classList.remove('hidden');
        reg.classList.add('hidden');

        if (navTrips) navTrips.classList.add('hidden');
        if (navDiary) navDiary.classList.add('hidden');
        if (navProfile) navProfile.classList.add('hidden');
      }
    }

    function logout() {
      currentUser = null;
      localStorage.removeItem('travellako_user');
      updateAuthUI();
      showToast('Đã đăng xuất khỏi tài khoản.');
      navigate('home');
    }

    function changeProfileAvatar() {
      const avatars = [
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=250',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=250',
        'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=250',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250'
      ];
      const newAvatar = avatars[Math.floor(Math.random() * avatars.length)];
      
      const imgEl = document.getElementById('profile-avatar-img');
      if (imgEl) imgEl.src = newAvatar;
      
      if (currentUser) {
        currentUser.avatar = newAvatar;
        localStorage.setItem('travellako_user', JSON.stringify(currentUser));
        updateAuthUI();
      }
      showToast('Đã cập nhật ảnh đại diện mới thành công!');
    }

    // ================= DIRECTORY / SEARCH PAGE =================
    let filterProvince = '';
    let filterMinPrice = 0;
    let filterMaxPrice = 10000000;
    let filterStars = 0;
    let filterCategories = [];
    let filterKeyword = '';
    let filterSortMode = 'popular';

    function updateCheckedCategories() {
      const checkboxes = document.querySelectorAll('input[name="sidebar-category"]:checked');
      filterCategories = Array.from(checkboxes).map(cb => cb.value);
      
      // Sync mobile checkboxes
      const mobCheckboxes = document.querySelectorAll('input[name="mobile-category"]');
      mobCheckboxes.forEach(cb => {
        cb.checked = filterCategories.includes(cb.value);
      });
    }

    function updateCheckedCategoriesMobile() {
      const checkboxes = document.querySelectorAll('input[name="mobile-category"]:checked');
      filterCategories = Array.from(checkboxes).map(cb => cb.value);
      
      // Sync sidebar checkboxes
      const sideCheckboxes = document.querySelectorAll('input[name="sidebar-category"]');
      sideCheckboxes.forEach(cb => {
        cb.checked = filterCategories.includes(cb.value);
      });
    }

    function updatePriceRange(type) {
      const minInput = document.getElementById('sidebar-price-min');
      const maxInput = document.getElementById('sidebar-price-max');
      const track = document.getElementById('sidebar-price-track');
      const minLabel = document.getElementById('price-min-label');
      const maxLabel = document.getElementById('price-max-label');

      if (!minInput || !maxInput) return;

      let minVal = parseInt(minInput.value);
      let maxVal = parseInt(maxInput.value);

      if (type === 'min') {
        if (minVal > maxVal) {
          minVal = maxVal;
          minInput.value = minVal;
        }
      } else {
        if (maxVal < minVal) {
          maxVal = minVal;
          maxInput.value = maxVal;
        }
      }

      filterMinPrice = minVal;
      filterMaxPrice = maxVal;

      // Update track visually
      const minPercent = (minVal / 10000000) * 100;
      const maxPercent = (maxVal / 10000000) * 100;
      if (track) {
        track.style.left = minPercent + '%';
        track.style.right = (100 - maxPercent) + '%';
      }

      // Update text labels
      if (minLabel) minLabel.innerText = minVal.toLocaleString('vi-VN');
      if (maxLabel) maxLabel.innerText = maxVal.toLocaleString('vi-VN');

      // Sync to mobile input
      const mobMin = document.getElementById('mobile-price-min');
      const mobMax = document.getElementById('mobile-price-max');
      const mobTrack = document.getElementById('mobile-price-track');
      const mobMinLabel = document.getElementById('mobile-price-min-label');
      const mobMaxLabel = document.getElementById('mobile-price-max-label');

      if (mobMin) mobMin.value = minVal;
      if (mobMax) mobMax.value = maxVal;
      if (mobTrack) {
        mobTrack.style.left = minPercent + '%';
        mobTrack.style.right = (100 - maxPercent) + '%';
      }
      if (mobMinLabel) mobMinLabel.innerText = minVal.toLocaleString('vi-VN');
      if (mobMaxLabel) mobMaxLabel.innerText = maxVal.toLocaleString('vi-VN');
    }

    function updateMobilePriceRange(type) {
      const minInput = document.getElementById('mobile-price-min');
      const maxInput = document.getElementById('mobile-price-max');
      const track = document.getElementById('mobile-price-track');
      const minLabel = document.getElementById('mobile-price-min-label');
      const maxLabel = document.getElementById('mobile-price-max-label');

      if (!minInput || !maxInput) return;

      let minVal = parseInt(minInput.value);
      let maxVal = parseInt(maxInput.value);

      if (type === 'min') {
        if (minVal > maxVal) {
          minVal = maxVal;
          minInput.value = minVal;
        }
      } else {
        if (maxVal < minVal) {
          maxVal = minVal;
          maxInput.value = maxVal;
        }
      }

      filterMinPrice = minVal;
      filterMaxPrice = maxVal;

      // Update track visually
      const minPercent = (minVal / 10000000) * 100;
      const maxPercent = (maxVal / 10000000) * 100;
      if (track) {
        track.style.left = minPercent + '%';
        track.style.right = (100 - maxPercent) + '%';
      }

      // Update text labels
      if (minLabel) minLabel.innerText = minVal.toLocaleString('vi-VN');
      if (maxLabel) maxLabel.innerText = maxVal.toLocaleString('vi-VN');

      // Sync to sidebar input
      const sideMin = document.getElementById('sidebar-price-min');
      const sideMax = document.getElementById('sidebar-price-max');
      const sideTrack = document.getElementById('sidebar-price-track');
      const sideMinLabel = document.getElementById('price-min-label');
      const sideMaxLabel = document.getElementById('price-max-label');

      if (sideMin) sideMin.value = minVal;
      if (sideMax) sideMax.value = maxVal;
      if (sideTrack) {
        sideTrack.style.left = minPercent + '%';
        sideTrack.style.right = (100 - maxPercent) + '%';
      }
      if (sideMinLabel) sideMinLabel.innerText = minVal.toLocaleString('vi-VN');
      if (sideMaxLabel) sideMaxLabel.innerText = maxVal.toLocaleString('vi-VN');
    }

    function updateActiveFiltersCount() {
      let count = 0;
      if (filterKeyword) count++;
      if (filterProvince) count++;
      if (filterCategories.length > 0) count += filterCategories.length;
      if (filterStars > 0) count++;
      if (filterMinPrice > 0 || filterMaxPrice < 10000000) count++;
      
      const badges = document.querySelectorAll('.active-filters-count-badge');
      badges.forEach(badge => {
        if (count > 0) {
          badge.innerText = `${count} bộ lọc đang áp dụng`;
          badge.classList.remove('hidden');
        } else {
          badge.classList.add('hidden');
        }
      });
    }

    function updateSortMode(val) {
      filterSortMode = val;
      renderSearchList();
    }

    function resetAllFilters() {
      filterProvince = '';
      filterMinPrice = 0;
      filterMaxPrice = 10000000;
      filterStars = 0;
      filterCategories = [];
      filterKeyword = '';
      filterSortMode = 'popular';

      // Reset DOM elements
      const sidebarKw = document.getElementById('sidebar-filter-keyword');
      if (sidebarKw) sidebarKw.value = '';
      
      const mobileKw = document.getElementById('mobile-filter-keyword');
      if (mobileKw) mobileKw.value = '';

      const sideProv = document.getElementById('sidebar-filter-province');
      if (sideProv) sideProv.value = '';

      const mobProv = document.getElementById('mobile-filter-province');
      if (mobProv) mobProv.value = '';

      const sideStars = document.getElementById('sidebar-filter-stars');
      if (sideStars) sideStars.value = '';

      const mobStars = document.getElementById('mobile-filter-stars');
      if (mobStars) mobStars.value = '';

      // Reset desktop inputs and tracks
      const sideMin = document.getElementById('sidebar-price-min');
      const sideMax = document.getElementById('sidebar-price-max');
      if (sideMin) sideMin.value = 0;
      if (sideMax) sideMax.value = 10000000;
      
      const sideTrack = document.getElementById('sidebar-price-track');
      if (sideTrack) {
        sideTrack.style.left = '0%';
        sideTrack.style.right = '0%';
      }
      
      const sideMinLabel = document.getElementById('price-min-label');
      const sideMaxLabel = document.getElementById('price-max-label');
      if (sideMinLabel) sideMinLabel.innerText = '0';
      if (sideMaxLabel) sideMaxLabel.innerText = '10.000.000';

      // Reset mobile inputs and tracks
      const mobMin = document.getElementById('mobile-price-min');
      const mobMax = document.getElementById('mobile-price-max');
      if (mobMin) mobMin.value = 0;
      if (mobMax) mobMax.value = 10000000;
      
      const mobTrack = document.getElementById('mobile-price-track');
      if (mobTrack) {
        mobTrack.style.left = '0%';
        mobTrack.style.right = '0%';
      }
      
      const mobMinLabel = document.getElementById('mobile-price-min-label');
      const mobMaxLabel = document.getElementById('mobile-price-max-label');
      if (mobMinLabel) mobMinLabel.innerText = '0';
      if (mobMaxLabel) mobMaxLabel.innerText = '10.000.000';

      // Uncheck checkboxes
      const checkboxes = document.querySelectorAll('input[name="sidebar-category"]');
      checkboxes.forEach(cb => cb.checked = false);

      const mobCheckboxes = document.querySelectorAll('input[name="mobile-category"]');
      mobCheckboxes.forEach(cb => cb.checked = false);

      const sortSel = document.getElementById('sidebar-filter-sort');
      if (sortSel) sortSel.value = 'popular';

      renderSearchList();
      showToast('Đã đặt lại toàn bộ bộ lọc.');
    }

    // Mobile Drawer Controls
    function toggleMobileFilterDrawer(show) {
      const drawer = document.getElementById('mobile-filter-drawer');
      const panel = document.getElementById('mobile-drawer-panel');
      if (show) {
        drawer.classList.remove('hidden');
        setTimeout(() => {
          panel.classList.remove('-translate-x-full');
        }, 10);
      } else {
        panel.classList.add('-translate-x-full');
        setTimeout(() => {
          drawer.classList.add('hidden');
        }, 300);
      }
    }

    function applyMobileFilters() {
      // Sync mobile province dropdown
      const mobProv = document.getElementById('mobile-filter-province').value;
      filterProvince = mobProv;
      document.getElementById('sidebar-filter-province').value = mobProv;
      document.getElementById('search-bar-province').value = mobProv;

      // Sync mobile checkboxes
      const mobCheckboxes = document.querySelectorAll('input[name="mobile-category"]:checked');
      filterCategories = Array.from(mobCheckboxes).map(cb => cb.value);
      
      const sideCheckboxes = document.querySelectorAll('input[name="sidebar-category"]');
      sideCheckboxes.forEach(cb => {
        cb.checked = filterCategories.includes(cb.value);
      });

      // Price limit is already synced via updates
      toggleMobileFilterDrawer(false);
      renderSearchList();
      showToast('Đã áp dụng các bộ lọc.');
    }

    // Toggle Search Card Favorite
    function toggleSearchCardFavorite(event, name) {
      event.stopPropagation(); // Stop navigation to detail
      const index = selectedInterests.indexOf(name);
      if (index > -1) {
        selectedInterests.splice(index, 1);
        showToast('Đã xóa khỏi danh sách yêu thích!');
      } else {
        selectedInterests.push(name);
        showToast('Đã thêm vào danh sách yêu thích!');
      }
      renderSearchList();
    }

    // Map View simulation logic
    function toggleMapModal(show) {
      const modal = document.getElementById('search-map-modal');
      if (show) {
        modal.classList.remove('hidden');
        renderSearchMap();
      } else {
        modal.classList.add('hidden');
      }
    }

    function renderSearchMap() {
      const resultsList = document.getElementById('search-map-list');
      const markersContainer = document.getElementById('search-map-markers');
      
      resultsList.innerHTML = '';
      markersContainer.innerHTML = '';

      // Get current filtered items
      const filtered = getFilteredPlaces();

      if (filtered.length === 0) {
        resultsList.innerHTML = `
          <div class="py-12 text-center text-slateMuted text-xs font-semibold">
            Không có địa điểm nào để hiển thị bản đồ.
          </div>
        `;
        return;
      }

      filtered.forEach((item, idx) => {
        // Render item card in sidebar list
        const div = document.createElement('div');
        div.className = 'flex gap-3 bg-white p-3 rounded-xl border border-borderGray hover:border-oceanBlue transition-all cursor-pointer shadow-sm group';
        div.setAttribute('onclick', `highlightMapMarker(${idx})`);
        
        let priceTag = '';
        if (item.category === 'Vui chơi') {
          priceTag = item.price === 0 ? 'Miễn phí' : `Từ ${item.price.toLocaleString('vi-VN')}đ / vé`;
        } else if (item.category === 'Khách sạn') {
          priceTag = `Từ ${item.price.toLocaleString('vi-VN')}đ / đêm`;
        } else if (item.category === 'Nhà hàng') {
          priceTag = item.price === 0 ? 'Miễn phí' : `${(Math.round(item.price * 0.8 / 1000) * 1000).toLocaleString('vi-VN')} - ${(Math.round(item.price * 1.5 / 1000) * 1000).toLocaleString('vi-VN')}đ`;
        } else {
          priceTag = `${(Math.round(item.price * 0.8 / 1000) * 1000).toLocaleString('vi-VN')} - ${(Math.round(item.price * 1.3 / 1000) * 1000).toLocaleString('vi-VN')}đ`;
        }

        div.innerHTML = `
          <img src="${item.img}" class="w-16 h-16 rounded-lg object-cover" alt="${item.name}">
          <div class="flex-grow min-w-0">
            <span class="block text-[10px] text-oceanBlue font-bold uppercase tracking-wider">${item.category}</span>
            <h4 class="font-bold text-xs text-slateDark truncate group-hover:text-oceanBlue transition-colors">${item.name}</h4>
            <div class="flex items-center gap-1.5 text-[10px] text-slateMuted mt-0.5">
              <span class="flex items-center gap-0.5 text-sunsetOrange font-bold"><i data-lucide="star" class="w-3 h-3 fill-current"></i> ${item.stars}</span>
              <span>•</span>
              <span>${item.province}</span>
            </div>
            <span class="block text-[10px] font-bold text-oceanBlue mt-1">${priceTag}</span>
          </div>
        `;
        resultsList.appendChild(div);

        // Render marker dot on map (simulate coordinates scale 15% - 85%)
        const leftPercent = 15 + (item.lng % 70);
        const topPercent = 15 + (item.lat % 70);

        const marker = document.createElement('div');
        marker.id = `map-marker-${idx}`;
        marker.className = 'absolute -translate-x-1/2 -translate-y-1/2 group z-20';
        marker.style.left = `${leftPercent}%`;
        marker.style.top = `${topPercent}%`;
        
        marker.innerHTML = `
          <div class="relative flex flex-col items-center cursor-pointer" onclick="goToDetail(${item.id})">
            <!-- Popover tooltip on hover -->
            <div class="absolute bottom-full mb-2 bg-slateDark text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-none">
              ${item.name}
            </div>
            <!-- Marker Pin -->
            <div class="w-8 h-8 rounded-full bg-oceanBlue hover:bg-sunsetOrange border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-md transition-all transform hover:scale-110 active:scale-95 duration-200">
              ${idx + 1}
            </div>
            <!-- Pin stem/pulse -->
            <div class="w-1.5 h-1.5 bg-oceanBlue/50 rounded-full -mt-0.5 pulse-dot"></div>
          </div>
        `;
        markersContainer.appendChild(marker);
      });

      if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function highlightMapMarker(idx) {
      const marker = document.getElementById(`map-marker-${idx}`);
      if (marker) {
        const pin = marker.querySelector('.w-8');
        pin.classList.remove('bg-oceanBlue');
        pin.classList.add('bg-sunsetOrange', 'scale-125');
        
        // Reset others after 2 seconds
        setTimeout(() => {
          pin.classList.add('bg-oceanBlue');
          pin.classList.remove('bg-sunsetOrange', 'scale-125');
        }, 2000);
      }
    }

    function getFilteredPlaces() {
      return PLACES_DB.filter(item => {
        // Keyword Search
        if (filterKeyword) {
          const matchName = item.name.toLowerCase().includes(filterKeyword.toLowerCase());
          const matchDesc = item.desc && item.desc.toLowerCase().includes(filterKeyword.toLowerCase());
          const matchProv = item.province.toLowerCase().includes(filterKeyword.toLowerCase());
          if (!matchName && !matchDesc && !matchProv) return false;
        }

        // Category Filter (check multiple categories)
        if (filterCategories.length > 0 && !filterCategories.includes(item.category)) {
          return false;
        }

        // Province Filter
        if (filterProvince && item.province !== filterProvince) return false;

        // Stars Filter
        if (filterStars > 0 && item.stars < filterStars) return false;

        // Price Filter (two-ended range limit)
        if (item.price < filterMinPrice || item.price > filterMaxPrice) return false;

        return true;
      });
    }

    function renderSearchList() {
      const resultsDiv = document.getElementById('place-results');
      if (!resultsDiv) return;
      
      // Update badge count
      updateActiveFiltersCount();
      
      resultsDiv.innerHTML = '';

      // Get filtered places
      let filtered = getFilteredPlaces();

      // Sort
      if (filterSortMode === 'stars') {
        filtered.sort((a, b) => b.stars - a.stars);
      } else if (filterSortMode === 'price-low') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (filterSortMode === 'price-high') {
        filtered.sort((a, b) => b.price - a.price);
      }

      // Update count text
      document.getElementById('results-count').innerText = `${filtered.length} địa điểm được tìm thấy`;

      if (filtered.length === 0) {
        resultsDiv.innerHTML = `
          <div class="col-span-full py-16 text-center text-slateMuted text-sm font-semibold bg-white rounded-2xl border border-borderGray">
            <i data-lucide="compass" class="w-10 h-10 mx-auto mb-2 text-slateMuted"></i>
            Không có địa điểm nào phù hợp với bộ lọc của bạn.
          </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
      }

      filtered.forEach(item => {
        const card = document.createElement('div');
        
        const isFav = selectedInterests.includes(item.name);
        const favIconColor = isFav ? 'text-errorRed fill-current' : 'text-white hover:text-errorRed';
        
        let priceTag = '';
        if (item.category === 'Vui chơi') {
          priceTag = item.price === 0 ? 'Miễn phí' : `Từ ${item.price.toLocaleString('vi-VN')}đ / vé`;
        } else if (item.category === 'Khách sạn') {
          priceTag = `Từ ${item.price.toLocaleString('vi-VN')}đ / đêm`;
        } else if (item.category === 'Nhà hàng') {
          priceTag = item.price === 0 ? 'Miễn phí' : `${(Math.round(item.price * 0.8 / 1000) * 1000).toLocaleString('vi-VN')} - ${(Math.round(item.price * 1.5 / 1000) * 1000).toLocaleString('vi-VN')}đ / người`;
        } else {
          priceTag = `${(Math.round(item.price * 0.8 / 1000) * 1000).toLocaleString('vi-VN')} - ${(Math.round(item.price * 1.3 / 1000) * 1000).toLocaleString('vi-VN')}đ`;
        }

        let openHours = '';
        if (item.category === 'Khách sạn') {
          openHours = 'Hỗ trợ 24/7';
        } else if (item.category === 'Vui chơi') {
          openHours = 'Mở cửa: 08:00 - 18:00';
        } else {
          openHours = 'Mở cửa: 07:00 - 22:00';
        }

        const reviewCount = 100 + (item.id * 27) % 150;

        card.className = 'group bg-white rounded-2xl border border-borderGray overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between cursor-pointer relative';
        card.setAttribute('onclick', `goToDetail(${item.id})`);
        
        card.innerHTML = `
          <div class="relative overflow-hidden aspect-[16/9] bg-grayBg">
            <img src="${item.img}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            <span class="absolute top-3 left-3 bg-white/95 text-oceanBlue font-bold text-xs uppercase px-2.5 py-1 rounded-lg shadow-sm z-10">${item.category}</span>
            <button onclick="toggleSearchCardFavorite(event, '${item.name}')" class="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-all shadow-sm z-10">
              <i data-lucide="heart" class="w-4 h-4 ${favIconColor}"></i>
            </button>
          </div>
          
          <div class="p-5 flex-grow flex flex-col justify-between">
            <div class="space-y-2">
              <div class="flex items-center justify-between gap-2 text-[10px] font-bold text-slateMuted">
                <span class="flex items-center gap-1"><i data-lucide="map-pin" class="w-3.5 h-3.5"></i> ${item.province}</span>
                <span class="flex items-center gap-1"><i data-lucide="clock" class="w-3.5 h-3.5"></i> ${openHours}</span>
              </div>
              
              <h3 class="font-heading font-extrabold text-slateDark text-sm line-clamp-1 group-hover:text-oceanBlue transition-colors">${item.name}</h3>
              
              <div class="flex items-center gap-1 text-[11px] text-slateMuted">
                <span class="flex items-center gap-0.5 text-sunsetOrange font-bold"><i data-lucide="star" class="w-3.5 h-3.5 fill-current"></i> ${item.stars}</span>
                <span>(${reviewCount} đánh giá)</span>
              </div>
              
              <p class="text-xs text-slateMuted line-clamp-2 leading-relaxed pt-1">${item.desc || ''}</p>
            </div>
            
            <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <div class="flex flex-col">
                <span class="text-[9px] text-slateMuted font-bold uppercase tracking-wider">Giá tham khảo</span>
                <span class="font-heading font-extrabold text-[13px] text-oceanBlue">${priceTag}</span>
              </div>
              <button class="bg-grayBg group-hover:bg-oceanBlue group-hover:text-white text-slateDark font-bold text-[10px] px-3.5 py-2 rounded-xl transition-all duration-300">
                Xem chi tiết
              </button>
            </div>
          </div>
        `;
        resultsDiv.appendChild(card);
      });

      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }

    function goToDetail(id) {
      const found = PLACES_DB.find(p => p.id === id);
      if (found) {
        currentDetailPlace = found;
        navigate('detail');
      }
    }

    // ================= PLACE DETAILS PAGE =================
    function renderPlaceDetails() {
      const place = currentDetailPlace;
      if (!place) return;

      document.getElementById('detail-hero-img').src = place.img;
      document.getElementById('detail-name').innerText = place.name;
      document.getElementById('detail-stars').innerText = place.stars;
      document.getElementById('detail-address').innerText = place.address;
      document.getElementById('detail-description').innerText = place.desc;
      
      let priceAmount = '';
      let priceUnit = '';

      if (place.price === 0) {
        priceAmount = 'Miễn phí';
        priceUnit = '';
      } else {
        priceAmount = `${place.price.toLocaleString('vi-VN')} đ`;
        if (place.category === 'Khách sạn') {
          priceUnit = '/ đêm';
        } else if (place.category === 'Vui chơi') {
          priceUnit = '/ vé';
        } else if (place.category === 'Nhà hàng') {
          priceUnit = '/ món';
        } else {
          priceUnit = '/ khách';
        }
      }

      document.getElementById('detail-price-amount').innerText = priceAmount;
      document.getElementById('detail-price-unit').innerText = priceUnit;

      document.getElementById('detail-category-badge').innerText = place.category;
      document.getElementById('detail-province-badge').innerText = place.province;

      // Handle Favorite Button UI
      const favBtn = document.getElementById('favorite-btn');
      const isFav = selectedInterests.includes(place.name); // Mock state check
      favBtn.innerHTML = `
        <i data-lucide="heart" class="w-5 h-5 ${isFav ? 'text-errorRed fill-current' : 'text-slateDark'}"></i> 
        ${isFav ? 'Đã lưu yêu thích' : 'Lưu vào yêu thích'}
      `;

      // Render reviews mock
      renderReviewsList();

      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }

    function toggleFavorite() {
      const place = currentDetailPlace;
      const index = selectedInterests.indexOf(place.name);
      if (index > -1) {
        selectedInterests.splice(index, 1);
        showToast('Đã xóa khỏi danh sách yêu thích!');
      } else {
        selectedInterests.push(place.name);
        showToast('Đã thêm vào danh sách yêu thích!');
      }
      renderPlaceDetails();
    }

    // Star Reviews Form Helper
    function setReviewRating(rating) {
      selectedReviewRating = rating;
      const buttons = document.querySelectorAll('.star-btn');
      buttons.forEach((btn, idx) => {
        const starIcon = btn.querySelector('svg');
        if (idx < rating) {
          btn.classList.add('text-sunsetOrange');
          btn.classList.remove('text-slateMuted');
        } else {
          btn.classList.remove('text-sunsetOrange');
          btn.classList.add('text-slateMuted');
        }
      });
    }

    let MOCK_REVIEWS = [
      { author: 'Trần Văn Hoàng', rating: 5, date: '12/06/2026', text: 'Địa điểm tuyệt vời, dịch vụ tốt và đồ ăn rất ngon. Tôi chắc chắn sẽ quay lại cùng bạn bè!' },
      { author: 'Lê Thị Mai', rating: 4, date: '28/05/2026', text: 'Rất đáng để trải nghiệm, view chụp hình cực chất. Tuy nhiên cuối tuần hơi đông một chút.' }
    ];

    function renderReviewsList() {
      const listDiv = document.getElementById('detail-reviews-list');
      listDiv.innerHTML = '';

      MOCK_REVIEWS.forEach(r => {
        const item = document.createElement('div');
        item.className = 'border-b border-slate-100 pb-4';
        
        let starsHtml = '';
        for (let i = 0; i < 5; i++) {
          starsHtml += `<i data-lucide="star" class="w-3.5 h-3.5 ${i < r.rating ? 'text-sunsetOrange fill-current' : 'text-borderGray'}"></i>`;
        }

        item.innerHTML = `
          <div class="flex items-center justify-between mb-1.5">
            <span class="font-bold text-xs text-slateDark">${r.author}</span>
            <span class="text-xs text-slateMuted">${r.date}</span>
          </div>
          <div class="flex items-center gap-0.5 mb-2">${starsHtml}</div>
          <p class="text-xs text-slateMuted leading-relaxed">${r.text}</p>
        `;
        listDiv.appendChild(item);
      });

      if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function submitReview() {
      if (!currentUser) {
        showToast('Vui lòng đăng nhập để gửi đánh giá', 'error');
        navigate('auth');
        return;
      }

      const text = document.getElementById('review-text').value;
      if (!text) {
        showToast('Vui lòng điền nhận xét trước khi gửi', 'error');
        return;
      }

      const newRev = {
        author: currentUser.name,
        rating: selectedReviewRating,
        date: new Date().toLocaleDateString('vi-VN'),
        text: text
      };

      MOCK_REVIEWS.unshift(newRev);
      renderReviewsList();
      document.getElementById('review-text').value = '';
      showToast('Cảm ơn bạn đã gửi đánh giá!');
    }

    // ================= GALLERY MODAL =================
    function showGalleryModal() {
      const place = currentDetailPlace;
      activeGalleryImages = [
        place.img,
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
        'https://images.unsplash.com/photo-1509060464153-44667396260f?w=800',
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
        'https://images.unsplash.com/photo-1583244532610-2a234e7c3eca?w=800'
      ];
      activeGalleryIndex = 0;
      
      document.getElementById('gallery-modal-img').src = activeGalleryImages[0];
      document.getElementById('gallery-modal').classList.remove('hidden');
    }

    function closeGalleryModal() {
      document.getElementById('gallery-modal').classList.add('hidden');
    }

    function slideGalleryImg(dir) {
      activeGalleryIndex = (activeGalleryIndex + dir + activeGalleryImages.length) % activeGalleryImages.length;
      document.getElementById('gallery-modal-img').src = activeGalleryImages[activeGalleryIndex];
    }

    // ================= ADD TO TRIP MODAL LOGIC =================
    function getTripDaysCount(trip) {
      if (!trip.startDate || !trip.endDate) return 3;
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return isNaN(diffDays) ? 3 : diffDays;
    }

    function updateAddModalDays() {
      const selectTrip = document.getElementById('add-to-trip-select');
      const selectDay = document.getElementById('add-to-trip-day-select');
      if (!selectTrip || !selectDay) return;

      const tripId = parseInt(selectTrip.value);
      const trip = TRIPS_DB.find(t => t.id === tripId);
      if (!trip) return;

      const daysCount = getTripDaysCount(trip);
      let dayOptions = '';
      for (let i = 1; i <= daysCount; i++) {
        dayOptions += `<option value="${i}">Ngày ${i}</option>`;
      }
      selectDay.innerHTML = dayOptions;
    }

    function openAddToTripModal() {
      if (!currentUser) {
        showToast('Vui lòng đăng nhập trước khi thao tác', 'error');
        navigate('auth');
        return;
      }

      const modal = document.getElementById('add-to-trip-modal');
      const body = document.getElementById('add-modal-body');
      
      modal.classList.remove('hidden');

      if (TRIPS_DB.length === 0) {
        body.innerHTML = `
          <p class="text-sm text-slateMuted mb-4">Bạn chưa tạo chuyến đi nào. Vui lòng tạo chuyến đi mới trước.</p>
          <button onclick="closeAddToTripModal(); openCreateTripModal();" class="w-full py-2.5 bg-oceanBlue text-white font-bold rounded-lg text-xs">
            Tạo chuyến đi ngay
          </button>
        `;
      } else {
        let options = '';
        TRIPS_DB.forEach(t => {
          options += `<option value="${t.id}">${t.name} (${t.province})</option>`;
        });

        body.innerHTML = `
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slateMuted uppercase tracking-wider mb-2">Chọn chuyến đi của bạn</label>
              <select id="add-to-trip-select" onchange="updateAddModalDays()" class="w-full bg-grayBg border border-borderGray rounded-lg p-2.5 text-sm focus:outline-none text-slateDark font-medium">
                ${options}
              </select>
            </div>
            
            <div>
              <label class="block text-xs font-bold text-slateMuted uppercase tracking-wider mb-2">Chọn Ngày đi</label>
              <select id="add-to-trip-day-select" class="w-full bg-grayBg border border-borderGray rounded-lg p-2.5 text-sm focus:outline-none text-slateDark font-medium">
                <!-- Populate dynamically -->
              </select>
            </div>

            <div class="text-right">
              <button onclick="closeAddToTripModal(); openCreateTripModal();" class="text-xs font-bold text-oceanBlue hover:text-oceanBlueDark transition-colors inline-flex items-center gap-1">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i> Tạo chuyến đi mới
              </button>
            </div>

            <button onclick="submitAddToTrip()" class="w-full py-3 bg-oceanBlue hover:bg-oceanBlueDark text-white font-bold rounded-xl text-xs transition-all shadow mt-4">
              Thêm vào hành trình
            </button>
          </div>
        `;

        updateAddModalDays();
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    }

    function closeAddToTripModal() {
      document.getElementById('add-to-trip-modal').classList.add('hidden');
    }

    function submitAddToTrip() {
      const select = document.getElementById('add-to-trip-select');
      const selectDay = document.getElementById('add-to-trip-day-select');
      if (!select || !selectDay) return;

      const tripId = parseInt(select.value);
      const daySelected = parseInt(selectDay.value);
      const trip = TRIPS_DB.find(t => t.id === tripId);
      const place = currentDetailPlace;

      if (trip && place) {
        if (trip.places.includes(place.id)) {
          showToast('Địa điểm này đã nằm trong lịch trình chuyến đi!', 'warning');
        } else {
          // Insert the place at the correct position for that day (assuming 3 elements per day)
          const targetIndex = Math.min(trip.places.length, daySelected * 3);
          trip.places.splice(targetIndex, 0, place.id);
          showToast(`Đã thêm ${place.name} vào Ngày ${daySelected} của chuyến đi "${trip.name}"`);
        }
      }
      closeAddToTripModal();
    }

    let currentEditTripId = null;

    function openEditTripModal(id, name, budget) {
      currentEditTripId = id;
      document.getElementById('edit-trip-id').value = id;
      document.getElementById('edit-trip-name').value = name;
      document.getElementById('edit-trip-budget').value = budget;
      document.getElementById('edit-trip-modal').classList.remove('hidden');
    }

    function closeEditTripModal() {
      document.getElementById('edit-trip-modal').classList.add('hidden');
    }

    function submitEditTrip() {
      const name = document.getElementById('edit-trip-name').value;
      const budget = document.getElementById('edit-trip-budget').value;

      if (!name || !budget) {
        showToast('Vui lòng điền đầy đủ thông tin', 'error');
        return;
      }

      const trip = TRIPS_DB.find(t => t.id === currentEditTripId);
      if (trip) {
        trip.name = name;
        trip.budget = parseInt(budget);
        showToast('Đã cập nhật chuyến đi thành công!');
        closeEditTripModal();
        renderTripsList();
      }
    }

    // ================= MY TRIPS DASHBOARD =================
    function filterTripsTab(tab) {
      activeTripsFilter = tab;
      
      const tabs = ['upcoming', 'ongoing', 'history'];
      tabs.forEach(t => {
        const btn = document.getElementById(`tab-trip-${t}`);
        if (t === tab) {
          btn.className = 'py-3.5 px-4 text-xs font-extrabold border-b-2 border-oceanBlue text-oceanBlue transition-all';
        } else {
          btn.className = 'py-3.5 px-4 text-xs font-extrabold border-b-2 border-transparent text-slateMuted hover:text-slateDark transition-all';
        }
      });

      renderTripsList();
    }

    function getRemainingDays(startDateStr) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const start = new Date(startDateStr);
      start.setHours(0,0,0,0);
      const diffTime = start.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    function renderTripsList() {
      const grid = document.getElementById('trips-grid-list');
      grid.innerHTML = '';

      const filtered = TRIPS_DB.filter(t => t.status === activeTripsFilter);

      if (filtered.length === 0) {
        grid.innerHTML = `
          <div class="col-span-full py-16 text-center text-slateMuted text-sm font-semibold bg-white rounded-2xl border border-borderGray">
            <i data-lucide="briefcase" class="w-10 h-10 mx-auto mb-2 text-slateMuted"></i>
            Bạn chưa có chuyến đi nào trong mục này.
          </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
      }

      filtered.forEach(t => {
        // Banner image matching province
        let bgImg = 'https://images.unsplash.com/photo-1528127269322-539801943592?w=500';
        if (t.province === 'Hà Nội') bgImg = 'https://images.unsplash.com/photo-1509060464153-44667396260f?w=500';
        else if (t.province === 'Đà Lạt') bgImg = 'https://images.unsplash.com/photo-1583244532610-2a234e7c3eca?w=500';
        else if (t.province === 'Đà Nẵng') bgImg = 'https://images.unsplash.com/photo-1528127269322-539801943592?w=500';
        
        // Progress bar simulation
        const placeCount = t.places.length;
        const progress = placeCount > 0 ? Math.min(100, Math.round(placeCount * 15)) : 0;

        let progressHtml = '';
        if (t.status === 'upcoming') {
          const diffDays = getRemainingDays(t.startDate);
          progressHtml = `
            <div class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-slateDark rounded-full text-xs font-bold w-fit border border-slate-200">
              <i data-lucide="clock" class="w-3.5 h-3.5 text-slateMuted"></i>
              <span>Còn ${diffDays > 0 ? diffDays : 0} ngày</span>
            </div>
          `;
        } else if (t.status === 'ongoing') {
          progressHtml = `
            <div>
              <div class="flex justify-between text-xs font-semibold text-slateDark mb-1">
                <span>Tiến độ hành trình</span>
                <span>${progress}%</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div class="bg-oceanBlue h-1.5 rounded-full transition-all duration-500" style="width: ${progress}%"></div>
              </div>
            </div>
          `;
        } else {
          progressHtml = `
            <div class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold w-fit border border-emerald-100">
              <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-emerald-600"></i>
              <span>Hoàn thành 100%</span>
            </div>
          `;
        }

        const card = document.createElement('div');
        card.className = 'bg-white border border-borderGray rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between';
        
        card.innerHTML = `
          <div>
            <div class="relative h-32 bg-borderGray">
              <img src="${bgImg}" alt="trip cover" class="w-full h-full object-cover">
              <div class="absolute inset-0 bg-black/35"></div>
              <span class="absolute top-4 left-4 bg-sunsetOrange text-white font-bold text-xs uppercase px-2 py-0.5 rounded-lg z-10">${t.province}</span>
              
              <!-- Overlay delete button -->
              <button onclick="event.stopPropagation(); deleteTrip(${t.id})" class="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-red-500/80 backdrop-blur-sm text-white hover:text-white flex items-center justify-center transition-all shadow border border-white/20 z-10" title="Xóa chuyến đi">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
            
            <div class="p-6 space-y-4">
              <div>
                <h3 class="font-heading font-bold text-lg text-slateDark flex items-center gap-1.5">
                  <span>${t.name}</span>
                  <button onclick="event.stopPropagation(); openEditTripModal(${t.id}, '${t.name.replace(/'/g, "\\'")}', ${t.budget})" class="p-1 text-slateMuted hover:text-oceanBlue hover:bg-grayBg rounded transition-colors" title="Chỉnh sửa">
                    <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                  </button>
                </h3>
                <span class="text-xs text-slateMuted font-medium flex items-center gap-1 mt-1">
                  <i data-lucide="calendar" class="w-3.5 h-3.5"></i> ${formatDateRange(t.startDate, t.endDate)}
                </span>
              </div>

              <!-- Status Progress Section -->
              <div>
                ${progressHtml}
              </div>
            </div>
          </div>

          <div class="p-6 pt-0 mt-auto pt-4 border-t border-slate-50">
            <button onclick="goToTripPlanner(${t.id})" class="w-full py-2 bg-oceanBlue hover:bg-oceanBlueDark text-white text-xs font-bold rounded-lg shadow-sm transition-all text-center">
              Xem chi tiết
            </button>
          </div>
        `;
        grid.appendChild(card);
      });

      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }

    function openCreateTripModal() {
      if (!currentUser) {
        showToast('Vui lòng đăng nhập trước khi tạo chuyến đi', 'error');
        navigate('auth');
        return;
      }
      document.getElementById('create-trip-modal').classList.remove('hidden');
    }

    function closeCreateTripModal() {
      document.getElementById('create-trip-modal').classList.add('hidden');
    }

    function submitCreateTrip() {
      const province = document.getElementById('new-trip-province').value;
      const name = document.getElementById('new-trip-name').value;
      const start = document.getElementById('new-trip-start').value;
      const end = document.getElementById('new-trip-end').value;
      const budget = document.getElementById('new-trip-budget').value;

      if (!name || !start || !end || !budget) {
        showToast('Vui lòng nhập đầy đủ các thông tin', 'error');
        return;
      }

      const newTrip = {
        id: Date.now(),
        name: name,
        province: province,
        budget: parseInt(budget),
        startDate: start,
        endDate: end,
        status: 'upcoming',
        places: [] // empty itinerary
      };

      TRIPS_DB.push(newTrip);
      closeCreateTripModal();
      
      // Reset inputs
      document.getElementById('new-trip-name').value = '';
      document.getElementById('new-trip-start').value = '';
      document.getElementById('new-trip-end').value = '';
      document.getElementById('new-trip-budget').value = '';

      showToast(`Đã tạo hành trình "${name}" thành công!`);
      
      // Go directly to planner
      goToTripPlanner(newTrip.id);
    }

    function deleteTrip(id) {
      if (confirm('Bạn có chắc chắn muốn xóa chuyến đi này không?')) {
        TRIPS_DB = TRIPS_DB.filter(t => t.id !== id);
        renderTripsList();
        showToast('Đã xóa chuyến đi thành công.');
      }
    }

    function goToTripPlanner(id) {
      const found = TRIPS_DB.find(t => t.id === id);
      if (found) {
        currentPlannerTrip = found;
        currentPlannerDay = 0; // Reset to Day 1
        mapZoomLevel = 1.0; // Reset map zoom
        activePlannerTab = 'itinerary';
        isDiaryEditing = false;
        activeDiaryMood = '';
        tempPlannerDiaryPhotos = [];
        navigate('planner');
      }
    }

    // ================= TRIP PLANNER PAGE =================
    let dragSourceIndex = null;

    function handleDragStart(e, index) {
      dragSourceIndex = index;
      e.dataTransfer.effectAllowed = 'move';
    }

    function handleDragOver(e) {
      if (e.preventDefault) {
        e.preventDefault();
      }
      return false;
    }

    function handleDrop(e, targetIndex) {
      if (dragSourceIndex === null || dragSourceIndex === targetIndex) return;
      const trip = currentPlannerTrip;
      if (!trip) return;

      const itemsPerDay = 3;
      const globalSrc = currentPlannerDay * itemsPerDay + dragSourceIndex;
      const globalDest = currentPlannerDay * itemsPerDay + targetIndex;

      if (globalSrc >= trip.places.length || globalDest >= trip.places.length) return;

      // Swap places in global array
      const temp = trip.places[globalSrc];
      trip.places[globalSrc] = trip.places[globalDest];
      trip.places[globalDest] = temp;

      dragSourceIndex = null;
      renderTripPlanner();
      showToast('Đã sắp xếp lại lộ trình bằng kéo thả!');
    }

    function changePlannerDay(dayIdx) {
      currentPlannerDay = dayIdx;
      renderTripPlanner();
    }

    function togglePlaceCheckIn(tripId, placeId, checked) {
      const trip = TRIPS_DB.find(t => t.id === tripId);
      if (!trip) return;
      if (!trip.checkedPlaces) trip.checkedPlaces = [];

      if (checked) {
        if (!trip.checkedPlaces.includes(placeId)) {
          trip.checkedPlaces.push(placeId);
        }
      } else {
        trip.checkedPlaces = trip.checkedPlaces.filter(id => id !== placeId);
      }
      renderTripPlanner();
    }

    function zoomMap(dir) {
      mapZoomLevel = Math.max(0.6, Math.min(2.0, mapZoomLevel + dir * 0.15));
      const canvas = document.getElementById('map-canvas-content');
      if (canvas) {
        canvas.style.transform = `scale(${mapZoomLevel})`;
      }
    }

    function getTripDaysCount(startStr, endStr) {
      if (!startStr || !endStr) return 1;
      const start = new Date(startStr);
      const end = new Date(endStr);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays || 1;
    }

    let activePlannerTab = 'itinerary';

    function renderTripPlanner() {
      const trip = currentPlannerTrip;
      if (!trip) return;

      // Initialize sub-tabs selector visibility
      const tabsSelector = document.getElementById('planner-tabs-selector');
      if (tabsSelector) {
        if (trip.status === 'history') {
          tabsSelector.classList.remove('hidden');
        } else {
          tabsSelector.classList.add('hidden');
          activePlannerTab = 'itinerary';
        }
      }

      // Toggle inner tab content displays based on current active tab
      const itnContent = document.getElementById('planner-itinerary-tab-content');
      const dryContent = document.getElementById('planner-diary-tab-content');
      const mapCol = document.querySelector('#page-planner .lg\\:w-2\\/5');
      const leftCol = document.querySelector('#page-planner .lg\\:w-3\\/5');

      if (activePlannerTab === 'itinerary') {
        if (itnContent) itnContent.classList.remove('hidden');
        if (dryContent) dryContent.classList.add('hidden');
        if (mapCol) mapCol.classList.remove('hidden');
        if (leftCol && mapCol) {
          leftCol.className = 'w-full lg:w-3/5 p-6 lg:p-8 space-y-6';
        }
        const itnBtn = document.getElementById('planner-tab-itinerary');
        const dryBtn = document.getElementById('planner-tab-diary');
        if (itnBtn && dryBtn) {
          itnBtn.className = 'py-3.5 px-4 text-xs font-extrabold border-b-2 border-oceanBlue text-oceanBlue transition-all';
          dryBtn.className = 'py-3.5 px-4 text-xs font-extrabold border-b-2 border-transparent text-slateMuted hover:text-slateDark transition-all';
        }
      } else {
        if (itnContent) itnContent.classList.add('hidden');
        if (dryContent) dryContent.classList.remove('hidden');
        if (mapCol) mapCol.classList.add('hidden');
        if (leftCol && mapCol) {
          leftCol.className = 'w-full p-6 lg:p-8 space-y-6 max-w-7xl mx-auto';
        }
        const itnBtn = document.getElementById('planner-tab-itinerary');
        const dryBtn = document.getElementById('planner-tab-diary');
        if (itnBtn && dryBtn) {
          dryBtn.className = 'py-3.5 px-4 text-xs font-extrabold border-b-2 border-oceanBlue text-oceanBlue transition-all';
          itnBtn.className = 'py-3.5 px-4 text-xs font-extrabold border-b-2 border-transparent text-slateMuted hover:text-slateDark transition-all';
        }
        renderPlannerDiaryTab();
      }

      document.getElementById('planner-trip-title').innerText = trip.name;
      document.getElementById('planner-trip-dates').innerText = `${formatDateRange(trip.startDate, trip.endDate)} (${trip.province})`;

      // Budget stats
      const totalBudget = trip.budget;
      let totalCost = 0;
      trip.places.forEach(pId => {
        const p = PLACES_DB.find(item => item.id === pId);
        if (p) totalCost += p.price;
      });

      document.getElementById('planner-budget-status').innerText = `Ngân sách: ${totalCost.toLocaleString('vi-VN')}đ / ${totalBudget.toLocaleString('vi-VN')}đ`;

      const container = document.getElementById('planner-days-container');
      container.innerHTML = '';

      // Day Navigator header
      const totalDays = getTripDaysCount(trip.startDate, trip.endDate);
      let dayNavigatorHtml = `<div class="flex gap-2 pb-2 overflow-x-auto border-b border-borderGray mb-6">`;
      for (let i = 0; i < totalDays; i++) {
        const isActive = i === currentPlannerDay;
        const activeClass = isActive ? 'bg-oceanBlue text-white font-bold' : 'bg-grayBg hover:bg-borderGray text-slateDark border border-borderGray';
        dayNavigatorHtml += `
          <button onclick="changePlannerDay(${i})" class="px-4 py-2 rounded-xl text-xs whitespace-nowrap transition-all shadow-sm ${activeClass}">
            Ngày ${i + 1}
          </button>
        `;
      }
      dayNavigatorHtml += `</div>`;
      container.innerHTML = dayNavigatorHtml;

      // Render Action Buttons based on status
      const actionsContainer = document.getElementById('planner-action-buttons');
      if (actionsContainer) {
        actionsContainer.innerHTML = '';
        if (trip.status === 'upcoming') {
          actionsContainer.innerHTML = `
            <button onclick="openAIOptimizeModal()" class="px-4 py-2.5 bg-sunsetOrange hover:bg-sunsetOrangeDark text-white font-bold rounded-lg shadow flex items-center gap-2 text-xs transition-all">
              <i data-lucide="wand-2" class="w-4 h-4"></i> Tối ưu hóa bằng AI
            </button>
          `;
        } else if (trip.status === 'ongoing') {
          actionsContainer.innerHTML = `
            <button onclick="triggerOngoingAIOptimize()" class="px-4 py-2.5 bg-sunsetOrange hover:bg-sunsetOrangeDark text-white font-bold rounded-lg shadow flex items-center gap-2 text-xs transition-all opacity-80 hover:opacity-100">
              <i data-lucide="wand-2" class="w-4 h-4"></i> Tối ưu hóa bằng AI
            </button>
          `;
        }
      }

      // Check for empty places list
      if (trip.places.length === 0) {
        container.innerHTML += `
          <div class="py-12 text-center text-slateMuted text-xs font-semibold bg-white rounded-2xl border border-borderGray">
            <i data-lucide="plus-circle" class="w-8 h-8 mx-auto mb-2 text-slateMuted"></i>
            Hành trình trống. Hãy tìm địa điểm bên trang tìm kiếm để thêm vào đây!
          </div>
          ${trip.status === 'upcoming' ? `
          <button onclick="navigate('search')" class="w-full py-3 border-2 border-dashed border-slate-200 hover:border-oceanBlue text-slateMuted hover:text-oceanBlue bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs transition-all mt-4">
            <i data-lucide="plus-circle" class="w-4 h-4"></i> Thêm địa điểm vào Ngày ${currentPlannerDay + 1}
          </button>
          ` : ''}
        `;
        document.getElementById('planner-diary-section').innerHTML = '';
        if (typeof lucide !== 'undefined') lucide.createIcons();
        drawPlannerMap([]);
        return;
      }

      // Group places
      const placesList = [];
      trip.places.forEach(pId => {
        const found = PLACES_DB.find(p => p.id === pId);
        if (found) placesList.push(found);
      });

      const itemsPerDay = 3;
      const dayPlaces = placesList.slice(currentPlannerDay * itemsPerDay, (currentPlannerDay + 1) * itemsPerDay);

      if (dayPlaces.length === 0) {
        container.innerHTML += `
          <div class="py-12 text-center text-slateMuted text-xs font-semibold bg-white rounded-2xl border border-borderGray">
            <i data-lucide="plus-circle" class="w-8 h-8 mx-auto mb-2 text-slateMuted"></i>
            Ngày này chưa có địa điểm nào trong lịch trình.
          </div>
          ${trip.status === 'upcoming' ? `
          <button onclick="navigate('search')" class="w-full py-3 border-2 border-dashed border-slate-200 hover:border-oceanBlue text-slateMuted hover:text-oceanBlue bg-white hover:bg-slate-50 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs transition-all mt-4">
            <i data-lucide="plus-circle" class="w-4 h-4"></i> Thêm địa điểm vào Ngày ${currentPlannerDay + 1}
          </button>
          ` : ''}
        `;
        document.getElementById('planner-diary-section').innerHTML = '';
        if (typeof lucide !== 'undefined') lucide.createIcons();
        drawPlannerMap([]);
        return;
      }

      let placesHtml = `
        <div class="relative space-y-6">
          <!-- Vertical dashed timeline line -->
          <div class="absolute left-[20px] upcoming-left-adjust top-6 bottom-6 w-0.5 border-l-2 border-dashed border-oceanBlue/30 z-0"></div>
      `;

      dayPlaces.forEach((p, idx) => {
        const costText = p.price === 0 ? 'Miễn phí' : `${p.price.toLocaleString('vi-VN')}đ`;
        
        if (!trip.checkedPlaces) trip.checkedPlaces = [];
        const isChecked = trip.checkedPlaces.includes(p.id);
        const checkedClass = isChecked ? 'opacity-50 grayscale-[30%]' : '';

        // Status flags
        const isUpcoming = trip.status === 'upcoming';
        const isOngoing = trip.status === 'ongoing';
        const isHistory = trip.status === 'history';

        // 1. Grip handle: only for upcoming
        const gripHtml = isUpcoming ? `
          <div class="cursor-grab text-slateMuted hover:text-slateDark flex-shrink-0 p-1 bg-white hover:bg-grayBg border border-borderGray rounded-lg shadow-sm transition-all" title="Kéo thả để sắp xếp">
            <svg class="w-4 h-4 text-slateMuted" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M7 6a1 1 0 100-2 1 1 0 000 2zM7 11a1 1 0 100-2 1 1 0 000 2zM7 16a1 1 0 100-2 1 1 0 000 2zM13 6a1 1 0 100-2 1 1 0 000 2zM13 11a1 1 0 100-2 1 1 0 000 2zM13 16a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path>
            </svg>
          </div>
        ` : '';

        // 2. Checkbox check-in: enabled on ongoing, disabled/checkmark on history/upcoming
        let checkinHtml = '';
        if (isOngoing) {
          checkinHtml = `
            <div class="flex items-center justify-center flex-shrink-0 bg-white border border-borderGray p-1.5 rounded-lg shadow-sm">
              <input type="checkbox" 
                     onchange="togglePlaceCheckIn(${trip.id}, ${p.id}, this.checked)"
                     ${isChecked ? 'checked' : ''}
                     class="w-4.5 h-4.5 rounded-full border-borderGray text-oceanBlue focus:ring-oceanBlue cursor-pointer"
                     title="Đánh dấu đã ghé thăm">
            </div>
          `;
        } else if (isHistory) {
          if (isChecked) {
            checkinHtml = `
              <div class="flex items-center justify-center flex-shrink-0 bg-emerald-50 border border-emerald-200 p-1.5 rounded-lg shadow-sm text-emerald-600" title="Đã đi qua">
                <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"></path>
                </svg>
              </div>
            `;
          } else {
            checkinHtml = `
              <div class="flex items-center justify-center flex-shrink-0 bg-gray-50 border border-gray-200 p-1.5 rounded-lg shadow-sm text-gray-300">
                <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                </svg>
              </div>
            `;
          }
        } else {
          checkinHtml = `
            <div class="flex items-center justify-center flex-shrink-0 bg-grayBg border border-borderGray p-1.5 rounded-lg shadow-sm opacity-40">
              <input type="checkbox" disabled
                     class="w-4.5 h-4.5 rounded-full border-borderGray text-slateMuted cursor-not-allowed">
            </div>
          `;
        }

        // 3. Delete button: only for upcoming
        const deleteHtml = isUpcoming ? `
          <button onclick="removePlaceFromPlanner(${p.id})" class="opacity-0 group-hover:opacity-100 flex items-center justify-center w-6 h-6 bg-errorRed/10 hover:bg-errorRed/20 text-errorRed rounded-full transition-all border border-errorRed/20 flex-shrink-0" title="Gỡ khỏi lịch trình">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        ` : '';

        // 4. Note Input field: disabled for history
        const noteDisabledAttr = isHistory ? 'disabled' : '';

        placesHtml += `
          <div ${isUpcoming ? 'draggable="true"' : ''} 
               ondragstart="${isUpcoming ? `handleDragStart(event, ${idx})` : ''}" 
               ondragover="${isUpcoming ? 'handleDragOver(event)' : ''}" 
               ondrop="${isUpcoming ? `handleDrop(event, ${idx})` : ''}"
               id="planner-place-${p.id}"
               class="relative flex items-center gap-3 z-10 transition-all ${checkedClass}">
            
            <!-- Grip handle icon (only for Upcoming) -->
            ${gripHtml}

            <!-- Timeline number badge -->
            <div class="w-8 h-8 rounded-full bg-oceanBlue text-white text-xs font-extrabold flex items-center justify-center flex-shrink-0 z-10 border-2 border-white shadow-md">
              ${idx + 1}
            </div>

            <!-- Checkbox / Status Checkmark -->
            ${checkinHtml}

            <!-- Card Content -->
            <div class="flex-grow flex items-center gap-4 bg-white border border-borderGray rounded-2xl p-4 hover:shadow-md transition-all group">
              <!-- Image -->
              <img src="${p.img}" alt="${p.name}" class="w-14 h-14 rounded-xl object-cover flex-shrink-0">

              <!-- Name & Note -->
              <div class="flex-grow min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <h4 class="font-bold text-sm text-slateDark truncate">${p.name}</h4>
                  <span class="text-xs font-bold text-slateMuted whitespace-nowrap">${costText}</span>
                </div>
                <input type="text" ${noteDisabledAttr} placeholder="Nhập ghi chú cá nhân (ví dụ: Chụp ảnh góc 3 giờ chiều)..." class="w-full bg-transparent border-0 text-xs text-slateMuted placeholder-slate-400 p-0 focus:outline-none focus:ring-0 mt-1">
              </div>

              <!-- Delete place button (only for Upcoming) -->
              ${deleteHtml}
            </div>

          </div>
        `;
      });

      placesHtml += `</div>`;

      container.innerHTML += `
        <div class="bg-slate-50/50 border border-borderGray rounded-3xl p-5 space-y-4">
          <div class="flex justify-between items-center pb-2 border-b border-slate-100">
            <span class="font-heading font-extrabold text-sm text-slateDark">Lộ trình Ngày ${currentPlannerDay + 1}</span>
            <span class="text-xs font-bold text-slateMuted">${dayPlaces.length} địa điểm</span>
          </div>
          ${placesHtml}
          
          <!-- Quick Add Button at the bottom (only for upcoming) -->
          ${trip.status === 'upcoming' ? `
          <button onclick="navigate('search')" class="w-full py-3 border-2 border-dashed border-slate-200 hover:border-oceanBlue text-slateMuted hover:text-oceanBlue bg-white hover:bg-slate-50 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs transition-all mt-2 shadow-sm">
            <i data-lucide="plus-circle" class="w-4 h-4"></i> Thêm địa điểm vào Ngày ${currentPlannerDay + 1}
          </button>
          ` : ''}
        </div>
      `;

      // Render Diary / Log area under container
      const diaryContainer = document.getElementById('planner-diary-section');
      if (diaryContainer) {
        diaryContainer.innerHTML = '';
        const noteVal = trip.diaryNotes || '';
        
        if (trip.status === 'ongoing') {
          diaryContainer.innerHTML = `
            <div class="bg-white border border-borderGray rounded-3xl p-5 shadow-sm space-y-4">
              <div class="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div class="w-6 h-6 rounded bg-oceanBlue/10 flex items-center justify-center text-oceanBlue">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"></path>
                  </svg>
                </div>
                <span class="font-heading font-extrabold text-sm text-slateDark">Nhật ký hành trình trong ngày</span>
              </div>
              <textarea onblur="saveOngoingQuickDiary(this.value)" rows="3" placeholder="Ghi nhanh trải nghiệm hôm nay vào đây (Tự động lưu)..." class="w-full p-3 border border-borderGray rounded-xl text-xs focus:outline-none focus:border-oceanBlue bg-grayBg text-slateDark placeholder-slate-400 resize-none">${noteVal}</textarea>
            </div>
          `;
        } else {
          diaryContainer.innerHTML = '';
        }
      }

      // Adjust vertical timeline dashed line position dynamically
      setTimeout(() => {
        const line = container.querySelector('.upcoming-left-adjust');
        if (line) {
          const grip = container.querySelector('.cursor-grab');
          if (grip) {
            line.style.left = '54px';
          } else {
            line.style.left = '20px';
          }
        }
      }, 0);

      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }

      // Draw route on map
      drawPlannerMap(dayPlaces);
    }

    function triggerOngoingAIOptimize() {
      const ok = confirm('Chuyến đi đang diễn ra. Việc tối ưu hóa lại bằng AI có thể thay đổi thứ tự các điểm chưa đi qua. Bạn vẫn muốn tiếp tục?');
      if (ok) {
        openAIOptimizeModal();
      }
    }

    function switchPlannerTab(tabName) {
      activePlannerTab = tabName;
      renderTripPlanner();
    }

    let isDiaryEditing = false;
    let activeDiaryMood = '';
    let tempPlannerDiaryPhotos = [];

    function renderPlannerDiaryTab() {
      const trip = currentPlannerTrip;
      if (!trip) return;

      const container = document.getElementById('planner-diary-tab-content');
      if (!container) return;

      const hasDiary = (trip.diaryNotes && trip.diaryNotes.trim() !== '') || (trip.diaryPhotos && trip.diaryPhotos.length > 0);
      
      if (!hasDiary) {
        isDiaryEditing = true;
      }

      if (isDiaryEditing) {
        if (!activeDiaryMood) {
          activeDiaryMood = trip.diaryMood || '🤩 Hào hứng';
        }
        if (tempPlannerDiaryPhotos.length === 0 && trip.diaryPhotos) {
          tempPlannerDiaryPhotos = [...trip.diaryPhotos];
        }

        const moods = ['🤩 Hào hứng', '🥰 Thư thái', '📸 Sống ảo', '🍜 Ẩm thực', '⛰️ Phượt'];
        let moodSelectorHtml = moods.map(mood => {
          const isActive = activeDiaryMood === mood;
          const activeClass = isActive 
            ? 'bg-oceanBlue text-white border-oceanBlue shadow-sm scale-105' 
            : 'bg-grayBg text-slateDark border-borderGray hover:bg-oceanBlue/10';
          return `
            <button type="button" onclick="selectPlannerDiaryMood('${mood}')" class="mood-pill px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${activeClass}">
              ${mood}
            </button>
          `;
        }).join('');

        let tempPhotosHtml = '';
        if (tempPlannerDiaryPhotos.length > 0) {
          tempPhotosHtml = `
            <div class="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
              ${tempPlannerDiaryPhotos.map((img, idx) => `
                <div class="relative aspect-square rounded-xl overflow-hidden border border-borderGray group shadow-sm">
                  <img src="${img}" class="w-full h-full object-cover">
                  <button type="button" onclick="removePlannerDiaryTempPhoto(${idx})" class="absolute top-1.5 right-1.5 bg-red-500 hover:bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-all">×</button>
                </div>
              `).join('')}
            </div>
          `;
        }

        container.innerHTML = `
          <div class="bg-white border border-borderGray rounded-3xl p-6 md:p-8 shadow-sm space-y-6 max-w-3xl mx-auto">
            <div class="border-b border-borderGray pb-4 flex items-center justify-between">
              <div>
                <h3 class="font-heading font-extrabold text-lg text-slateDark">Viết nhật ký chuyến đi</h3>
                <p class="text-xs text-slateMuted mt-1">Lưu trữ cảm xúc, trải nghiệm và những bức ảnh đáng nhớ</p>
              </div>
              <span class="px-3 py-1 bg-oceanBlue/10 text-oceanBlue font-bold rounded-full text-xs">
                ✨ ${trip.province || 'Du lịch'}
              </span>
            </div>

            <!-- Mood Selector -->
            <div>
              <label class="block text-xs font-bold text-slateMuted uppercase tracking-wider mb-2">Hôm nay bạn cảm thấy thế nào?</label>
              <div class="flex flex-wrap gap-2.5">
                ${moodSelectorHtml}
              </div>
            </div>

            <!-- Feelings Area -->
            <div>
              <label class="block text-xs font-bold text-slateMuted uppercase tracking-wider mb-2">Chia sẻ cảm nhận của bạn</label>
              <textarea id="planner-diary-notes" rows="6" placeholder="Kỷ niệm đáng nhớ nhất của chuyến đi này là gì?..." class="w-full p-4 border border-borderGray focus:border-oceanBlue rounded-2xl text-xs focus:outline-none bg-grayBg leading-relaxed font-medium text-slateDark transition-all resize-none">${trip.diaryNotes || ''}</textarea>
            </div>

            <!-- Photo Uploader -->
            <div>
              <label class="block text-xs font-bold text-slateMuted uppercase tracking-wider mb-2">Tải ảnh kỷ niệm lên (Tối đa 10 ảnh)</label>
              <div onclick="addPlannerDiaryPhoto()" class="border-2 border-dashed border-oceanBlue/40 hover:border-oceanBlue rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-grayBg/60 hover:bg-oceanBlue/5 text-center group">
                <div class="w-10 h-10 rounded-full bg-oceanBlue/10 text-oceanBlue flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <i data-lucide="cloud-upload" class="w-5 h-5"></i>
                </div>
                <span class="text-xs font-bold text-slateDark">Nhấp để thêm ảnh kỷ niệm mẫu HD</span>
                <span class="text-[11px] text-slateMuted mt-0.5">Tự động chọn ảnh độ phân giải cao từ Unsplash</span>
              </div>
              ${tempPhotosHtml}
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-2">
              ${hasDiary ? `
                <button type="button" onclick="cancelPlannerDiaryEdit()" class="flex-1 py-3 border border-borderGray hover:bg-grayBg text-slateDark font-bold rounded-xl transition-all text-xs">
                  Hủy bỏ
                </button>
              ` : ''}
              <button type="button" onclick="savePlannerDiary()" class="flex-1 py-3 bg-oceanBlue hover:bg-oceanBlueDark text-white font-bold rounded-xl transition-all shadow-md text-xs uppercase tracking-wider">
                Lưu Nhật Ký Hành Trình
              </button>
            </div>
          </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
      } else {
        const photos = trip.diaryPhotos || [];
        let photosGridHtml = '';
        
        if (photos.length > 0) {
          const rotations = ['rotate-1', '-rotate-1', 'rotate-2', '-rotate-2'];
          photosGridHtml = `
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              ${photos.map((img, idx) => {
                const rot = rotations[idx % rotations.length];
                return `
                  <div class="bg-white p-2.5 rounded-2xl shadow-md border border-borderGray/80 transform ${rot} hover:rotate-0 hover:scale-105 transition-all duration-300 group cursor-pointer relative">
                    <div class="relative w-full h-44 rounded-xl overflow-hidden bg-slate-100" onclick="openPhotoLightbox('${img}')">
                      <img src="${img}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                      <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <span class="p-2 bg-white/80 backdrop-blur-md rounded-full text-slateDark hover:bg-white shadow transition-all">
                          <i data-lucide="maximize-2" class="w-4 h-4"></i>
                        </span>
                      </div>
                    </div>
                    <div class="pt-2 px-1 flex items-center justify-between">
                      <span class="text-[10px] font-bold text-slateMuted uppercase tracking-wider">Kỷ niệm #${idx + 1}</span>
                      <button onclick="event.stopPropagation(); deleteDiaryPhotoDirect(${idx})" class="p-1 text-slateMuted hover:text-errorRed transition-colors" title="Xóa ảnh này">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `;
        } else {
          photosGridHtml = `
            <div class="text-center py-12 bg-grayBg rounded-2xl border border-dashed border-borderGray">
              <i data-lucide="image-off" class="w-8 h-8 mx-auto mb-2 text-slateMuted opacity-50"></i>
              <p class="text-xs text-slateMuted font-semibold">Chưa có ảnh kỷ niệm nào trong album.</p>
              <button onclick="editPlannerDiary()" class="mt-3 px-4 py-2 bg-oceanBlue/10 text-oceanBlue font-bold rounded-xl text-xs hover:bg-oceanBlue/20 transition-all">
                + Thêm ảnh ngay
              </button>
            </div>
          `;
        }

        container.innerHTML = `
          <div class="space-y-6 max-w-6xl mx-auto w-full px-2">
            
            <!-- Top Controls Bar -->
            <div class="bg-white border border-borderGray rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-oceanBlue/10 text-oceanBlue flex items-center justify-center">
                  <i data-lucide="book-open" class="w-5 h-5"></i>
                </div>
                <div>
                  <h3 class="font-heading font-extrabold text-base text-slateDark">Nhật ký & Album kỷ niệm chuyến đi</h3>
                  <span class="text-xs text-slateMuted">Chuyến đi đã hoàn thành • ${photos.length} hình ảnh</span>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button onclick="goToGlobalDiaryFromPlanner()" class="px-3.5 py-2 bg-oceanBlue/10 hover:bg-oceanBlue/20 text-oceanBlue font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 border border-oceanBlue/20">
                  <i data-lucide="book-open" class="w-3.5 h-3.5"></i> Mở Sổ Tay Hành Trình Tổng
                </button>
                <button onclick="editPlannerDiary()" class="px-4 py-2 bg-oceanBlue hover:bg-oceanBlueDark text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center gap-1.5">
                  <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Chỉnh sửa Nhật Ký
                </button>
              </div>
            </div>

            <!-- Split Card Layout: Left Diary Card + Right Polaroid Gallery -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              <!-- LEFT COLUMN (Emotional Glass Card - 4 cols) -->
              <div class="lg:col-span-4 bg-gradient-to-br from-white to-grayBg border border-borderGray rounded-3xl p-6 shadow-md space-y-5">
                <div class="flex items-center justify-between border-b border-borderGray pb-3">
                  <span class="text-xs font-extrabold text-slateDark uppercase tracking-wider flex items-center gap-1.5">
                    <i data-lucide="heart" class="w-4 h-4 text-sunsetOrange"></i> Cảm nhận chuyến đi
                  </span>
                  <span class="px-3 py-1 bg-oceanBlue/10 text-oceanBlue font-bold rounded-full text-xs border border-oceanBlue/20">
                    ${trip.diaryMood || '🤩 Hào hứng'}
                  </span>
                </div>

                <!-- Clean Vietnamese Note Content (Sans Typography Fix) -->
                <div class="relative py-2 min-h-[120px]">
                  <p class="font-heading font-medium text-xs sm:text-sm text-slateDark leading-relaxed whitespace-pre-line">
                    "${trip.diaryNotes || 'Chuyến đi tuyệt vời với nhiều kỷ niệm đáng nhớ!'}"
                  </p>
                </div>

                <div class="pt-3 border-t border-borderGray flex items-center justify-between text-[11px] text-slateMuted font-bold">
                  <span>📍 ${trip.province || 'Việt Nam'}</span>
                  <span>🗓️ ${trip.endDate || '2026'}</span>
                </div>
              </div>

              <!-- RIGHT COLUMN (Polaroid Photo Masonry - 8 cols) -->
              <div class="lg:col-span-8">
                ${photosGridHtml}
              </div>

            </div>
          </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    }

    function selectPlannerDiaryMood(mood) {
      activeDiaryMood = mood;
      renderPlannerDiaryTab();
    }

    function addPlannerDiaryPhoto() {
      if (tempPlannerDiaryPhotos.length >= 10) {
        showToast('Tối đa chỉ tải lên 10 ảnh kỷ niệm.', 'warning');
        return;
      }
      const pool = [
        'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
        'https://images.unsplash.com/photo-1509060464153-44667396260f?w=800',
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        'https://images.unsplash.com/photo-1583244532610-2a234e7c3eca?w=800'
      ];
      const unused = pool.filter(img => !tempPlannerDiaryPhotos.includes(img));
      const chosen = unused.length > 0 ? unused[Math.floor(Math.random() * unused.length)] : pool[Math.floor(Math.random() * pool.length)];

      tempPlannerDiaryPhotos.push(chosen);
      renderPlannerDiaryTab();
    }

    function removePlannerDiaryTempPhoto(idx) {
      tempPlannerDiaryPhotos.splice(idx, 1);
      renderPlannerDiaryTab();
    }

    function deleteDiaryPhotoDirect(idx) {
      const trip = currentPlannerTrip;
      if (!trip) return;
      if (confirm('Bạn chắc chắn muốn xóa bức ảnh kỷ niệm này?')) {
        trip.diaryPhotos.splice(idx, 1);
        tempPlannerDiaryPhotos = [...trip.diaryPhotos];
        renderPlannerDiaryTab();
        showToast('Đã xóa ảnh kỷ niệm.');
      }
    }

    function savePlannerDiary() {
      const trip = currentPlannerTrip;
      if (!trip) return;

      const notesVal = document.getElementById('planner-diary-notes').value;
      trip.diaryNotes = notesVal;
      trip.diaryMood = activeDiaryMood;
      trip.diaryPhotos = [...tempPlannerDiaryPhotos];

      isDiaryEditing = false;
      renderPlannerDiaryTab();
      showToast('Đã lưu nhật ký hành trình thành công.');
    }

    function cancelPlannerDiaryEdit() {
      isDiaryEditing = false;
      renderPlannerDiaryTab();
    }

    function editPlannerDiary() {
      isDiaryEditing = true;
      const trip = currentPlannerTrip;
      if (trip) {
        activeDiaryMood = trip.diaryMood || '😊 Vui vẻ';
        tempPlannerDiaryPhotos = [...(trip.diaryPhotos || [])];
      }
      renderPlannerDiaryTab();
    }

    // TEMP STATE FOR DIARY MODAL
    let tempDiaryPhotos = [];

    function openTripDiaryModal() {
      const trip = currentPlannerTrip;
      if (!trip) return;

      document.getElementById('diary-notes-input').value = trip.diaryNotes || '';
      tempDiaryPhotos = [...(trip.diaryPhotos || [])];
      renderDiaryModalPhotos();

      document.getElementById('trip-diary-modal').classList.remove('hidden');
    }

    function closeTripDiaryModal() {
      document.getElementById('trip-diary-modal').classList.add('hidden');
    }

    function renderDiaryModalPhotos() {
      const grid = document.getElementById('diary-modal-photos-grid');
      if (!grid) return;
      grid.innerHTML = '';

      tempDiaryPhotos.forEach((p, idx) => {
        grid.innerHTML += `
          <div class="relative w-full h-16 rounded-lg overflow-hidden border border-borderGray group">
            <img src="${p}" class="w-full h-full object-cover">
            <button onclick="removeTempDiaryPhoto(${idx})" class="absolute top-1 right-1 bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shadow opacity-80 hover:opacity-100">×</button>
          </div>
        `;
      });
    }

    function addMockDiaryPhoto() {
      if (tempDiaryPhotos.length >= 10) {
        showToast('Tối đa chỉ tải lên 10 ảnh kỷ niệm.', 'warning');
        return;
      }
      
      const pool = [
        'https://images.unsplash.com/photo-1528127269322-539801943592?w=300',
        'https://images.unsplash.com/photo-1509060464153-44667396260f?w=300',
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300',
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=300',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300',
        'https://images.unsplash.com/photo-1583244532610-2a234e7c3eca?w=300'
      ];

      const unused = pool.filter(img => !tempDiaryPhotos.includes(img));
      const chosen = unused.length > 0 ? unused[Math.floor(Math.random() * unused.length)] : pool[Math.floor(Math.random() * pool.length)];

      tempDiaryPhotos.push(chosen);
      renderDiaryModalPhotos();
    }

    function removeTempDiaryPhoto(idx) {
      tempDiaryPhotos.splice(idx, 1);
      renderDiaryModalPhotos();
    }

    function saveTripDiaryData() {
      const trip = currentPlannerTrip;
      if (!trip) return;

      trip.diaryNotes = document.getElementById('diary-notes-input').value;
      trip.diaryPhotos = [...tempDiaryPhotos];

      closeTripDiaryModal();
      renderTripPlanner();
      showToast('Đã lưu nhật ký hành trình.');
    }

    function saveOngoingQuickDiary(val) {
      const trip = currentPlannerTrip;
      if (!trip) return;

      trip.diaryNotes = val;
      showToast('Tự động lưu nhật ký thành công.');
    }

    function removePlaceFromPlanner(placeId) {
      const trip = currentPlannerTrip;
      if (!trip) return;

      trip.places = trip.places.filter(id => id !== placeId);
      renderTripPlanner();
      showToast('Đã gỡ địa điểm khỏi lịch trình.');
    }

    // SVG MAP ROUTE DRAWING
    function drawPlannerMap(placesList) {
      const svg = document.getElementById('map-svg-routes');
      const markersContainer = document.getElementById('map-markers-container');
      
      svg.innerHTML = '';
      markersContainer.innerHTML = '';

      if (placesList.length === 0) return;

      let pointsStr = '';
      
      placesList.forEach((p, idx) => {
        const x = p.lat * 1.2 + 80;
        const y = p.lng * 1.0 + 80;

        pointsStr += `${x},${y} `;

        const marker = document.createElement('div');
        marker.className = 'absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 group cursor-pointer';
        marker.style.left = `${x}px`;
        marker.style.top = `${y}px`;
        
        marker.innerHTML = `
          <div class="relative flex flex-col items-center">
            <div class="w-7 h-7 rounded-full bg-oceanBlue hover:bg-oceanBlueDark text-white font-extrabold text-[11px] flex items-center justify-center shadow-lg border-2 border-white transition-all transform hover:scale-110">
              ${idx + 1}
            </div>
            <span class="absolute top-8 bg-slateDark/90 text-white font-bold text-[9px] px-1.5 py-0.5 rounded shadow-md whitespace-nowrap select-none transition-all group-hover:scale-105 pointer-events-none">
              ${p.name}
            </span>
          </div>
        `;
        markersContainer.appendChild(marker);
      });

      if (placesList.length > 1) {
        const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        polyline.setAttribute('points', pointsStr.trim());
        polyline.setAttribute('style', 'fill:none;stroke:#0284C7;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;filter: drop-shadow(0px 2px 4px rgba(2, 132, 199, 0.3));');
        svg.appendChild(polyline);
      }
    }

    function openAIOptimizeModal() {
      const modal = document.getElementById('ai-optimize-modal');
      const textarea = document.getElementById('ai-optimize-notes');
      const btn = document.getElementById('btn-submit-ai-optimize');
      
      if (textarea) textarea.value = '';
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>Bắt đầu tối ưu</span>';
      }
      if (modal) modal.classList.remove('hidden');
    }

    function closeAIOptimizeModal() {
      const modal = document.getElementById('ai-optimize-modal');
      if (modal) modal.classList.add('hidden');
    }

    function submitAIOptimize() {
      const btn = document.getElementById('btn-submit-ai-optimize');
      if (!btn) return;

      btn.disabled = true;
      btn.innerHTML = `
        <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Đang tối ưu lịch trình...</span>
      `;

      setTimeout(() => {
        const trip = currentPlannerTrip;
        if (trip && trip.places.length > 1) {
          trip.places.sort((a, b) => a - b);
          renderTripPlanner();
          
          confetti({
            particleCount: 100,
            spread: 50,
            origin: { y: 0.8 }
          });

          showToast('Đã tối ưu hóa lộ trình bằng AI thành công!');
        }
        closeAIOptimizeModal();
      }, 1500);
    }

    // ================= TRIP DIARY & GALLERY PAGE REDESIGN =================
    let selectedDiaryMood = '🤩 Hào hứng';
    let isDiaryPageEditing = false;

    // ================= SMART CROSS-NAVIGATION =================
    function goToTripPlannerFromDiary(tripId) {
      const select = document.getElementById('diary-select-trip');
      const targetId = tripId || (select && select.value ? parseInt(select.value) : null);
      
      let trip = TRIPS_DB.find(t => t.id === targetId);
      if (!trip && TRIPS_DB.length > 0) trip = TRIPS_DB[0];

      if (trip) {
        currentPlannerTrip = trip;
        activePlannerTab = 'itinerary';
        navigate('planner');
        renderTripPlanner();
        showToast(`Đã chuyển tới Lịch trình chi tiết: ${trip.name}`);
      }
    }

    function goToGlobalDiaryFromPlanner() {
      if (currentPlannerTrip) {
        navigate('diary');
        const select = document.getElementById('diary-select-trip');
        if (select) {
          select.value = currentPlannerTrip.id;
          onDiaryTripChanged();
        }
        showToast(`Đã mở Sổ tay hành trình cho: ${currentPlannerTrip.name}`);
      } else {
        navigate('diary');
      }
    }

    function renderDiaryPage() {
      const select = document.getElementById('diary-select-trip');
      if (!select) return;

      select.innerHTML = '';

      if (TRIPS_DB.length === 0) {
        select.innerHTML = `<option value="">Không có chuyến đi đã tạo</option>`;
      } else {
        TRIPS_DB.forEach(t => {
          select.innerHTML += `<option value="${t.id}">${t.name} (${t.province})</option>`;
        });
      }

      onDiaryTripChanged();
    }

    function onDiaryTripChanged() {
      const select = document.getElementById('diary-select-trip');
      if (!select || !select.value) return;

      const tripId = parseInt(select.value);
      const trip = TRIPS_DB.find(t => t.id === tripId);
      if (!trip) return;

      // Update Trip Context Banner
      const titleEl = document.getElementById('diary-banner-title');
      const provEl = document.getElementById('diary-banner-province');
      const datesEl = document.getElementById('diary-banner-dates');
      const budgetEl = document.getElementById('diary-banner-budget');
      const countEl = document.getElementById('diary-banner-places-count');

      if (titleEl) titleEl.innerText = trip.name;
      if (provEl) provEl.innerText = trip.province || 'Việt Nam';
      if (datesEl) datesEl.innerText = `${trip.startDate || '2026-10-12'} đến ${trip.endDate || '2026-10-14'}`;
      if (budgetEl) budgetEl.innerText = trip.budget ? trip.budget.toLocaleString('vi-VN') + 'đ' : '3.500.000đ';
      if (countEl) countEl.innerText = `${trip.places ? trip.places.length : 3}/${trip.places ? trip.places.length : 3}`;

      // Sync photos & mood
      if (trip.diaryPhotos && Array.isArray(trip.diaryPhotos) && trip.diaryPhotos.length > 0) {
        uploadedDiaryImages = [...trip.diaryPhotos];
      } else {
        uploadedDiaryImages = [
          'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
          'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'
        ];
      }

      if (trip.diaryMood) {
        selectedDiaryMood = trip.diaryMood;
      } else {
        selectedDiaryMood = '🤩 Hào hứng';
      }

      // Check if has diary saved
      const hasDiary = (trip.diaryNotes && trip.diaryNotes.trim() !== '') || (trip.diaryPhotos && trip.diaryPhotos.length > 0);
      if (!hasDiary) {
        isDiaryPageEditing = true;
      } else {
        isDiaryPageEditing = false;
      }

      renderDiaryPageContent();
    }

    function renderDiaryPageContent() {
      const select = document.getElementById('diary-select-trip');
      if (!select || !select.value) return;
      const tripId = parseInt(select.value);
      const trip = TRIPS_DB.find(t => t.id === tripId);
      if (!trip) return;

      const mainContainer = document.getElementById('diary-page-main-container');
      const actionContainer = document.getElementById('diary-mode-action-container');
      if (!mainContainer) return;

      const photos = uploadedDiaryImages || [];

      if (!isDiaryPageEditing) {
        // SAVED READ-ONLY VIEW
        if (actionContainer) {
          actionContainer.innerHTML = `
            <button onclick="editDiaryPageEntry()" class="px-4 py-2.5 bg-oceanBlue hover:bg-oceanBlueDark text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5">
              <i data-lucide="edit-3" class="w-4 h-4"></i> Chỉnh Sửa Nhật Ký
            </button>
          `;
        }

        const rotations = ['rotate-1', '-rotate-1', 'rotate-2', '-rotate-2'];
        let photosGridHtml = '';
        if (photos.length > 0) {
          photosGridHtml = `
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              ${photos.map((img, idx) => {
                const rot = rotations[idx % rotations.length];
                return `
                  <div class="bg-white p-2.5 rounded-2xl shadow-md border border-borderGray/80 transform ${rot} hover:rotate-0 hover:scale-105 transition-all duration-300 group cursor-pointer relative">
                    <div class="relative w-full h-44 rounded-xl overflow-hidden bg-slate-100" onclick="openPhotoLightbox('${img}')">
                      <img src="${img}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                      <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <span class="p-2 bg-white/80 backdrop-blur-md rounded-full text-slateDark hover:bg-white shadow transition-all">
                          <i data-lucide="maximize-2" class="w-4 h-4"></i>
                        </span>
                      </div>
                    </div>
                    <div class="pt-2 px-1 flex items-center justify-between">
                      <span class="text-[10px] font-bold text-slateMuted uppercase tracking-wider">Kỷ niệm #${idx + 1}</span>
                      <button onclick="event.stopPropagation(); removeDiaryPhoto('${img}')" class="p-1 text-slateMuted hover:text-errorRed transition-colors" title="Xóa ảnh">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `;
        } else {
          photosGridHtml = `
            <div class="text-center py-12 bg-grayBg rounded-2xl border border-dashed border-borderGray">
              <i data-lucide="image-off" class="w-8 h-8 mx-auto mb-2 text-slateMuted opacity-50"></i>
              <p class="text-xs text-slateMuted font-semibold">Chưa có ảnh kỷ niệm nào trong album.</p>
              <button onclick="editDiaryPageEntry()" class="mt-3 px-4 py-2 bg-oceanBlue/10 text-oceanBlue font-bold rounded-xl text-xs hover:bg-oceanBlue/20 transition-all">
                + Thêm ảnh ngay
              </button>
            </div>
          `;
        }

        mainContainer.innerHTML = `
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <!-- LEFT COLUMN: Emotional Memory Card (5 cols) -->
            <div class="lg:col-span-5 bg-gradient-to-br from-white to-grayBg border border-borderGray rounded-3xl p-6 shadow-md space-y-6">
              <div class="flex items-center justify-between border-b border-borderGray pb-4">
                <span class="text-xs font-extrabold text-slateDark uppercase tracking-wider flex items-center gap-1.5">
                  <i data-lucide="heart" class="w-4 h-4 text-sunsetOrange"></i> Cảm nhận chuyến đi
                </span>
                <span class="px-3.5 py-1 bg-oceanBlue/10 text-oceanBlue font-bold rounded-full text-xs border border-oceanBlue/20">
                  ${trip.diaryMood || '🤩 Hào hứng'}
                </span>
              </div>

              <!-- Clean Vietnamese Typography -->
              <div class="relative py-2 min-h-[140px]">
                <p class="font-heading font-medium text-xs sm:text-sm text-slateDark leading-relaxed whitespace-pre-line">
                  "${trip.diaryNotes || 'Chuyến đi tuyệt vời với nhiều khoảnh khắc đáng nhớ!'}"
                </p>
              </div>

              <!-- Footer Stats & Smart Navigation CTA -->
              <div class="pt-4 border-t border-borderGray space-y-4">
                <div class="flex items-center justify-between text-xs text-slateMuted font-bold">
                  <span>📍 ${trip.province || 'Việt Nam'}</span>
                  <span>🗓️ ${trip.endDate || '2026'}</span>
                </div>
                
                <button onclick="goToTripPlannerFromDiary(${trip.id})" class="w-full py-3 bg-oceanBlue/10 hover:bg-oceanBlue/20 text-oceanBlue font-bold rounded-2xl transition-all text-xs flex items-center justify-center gap-2 border border-oceanBlue/20 shadow-sm">
                  <i data-lucide="map" class="w-4 h-4"></i> Xem Lịch Trình Chi Tiết Chuyến Đi Này
                </button>
              </div>
            </div>

            <!-- RIGHT COLUMN: Polaroid Photo Album (7 cols) -->
            <div class="lg:col-span-7 space-y-6">
              <div class="flex items-center justify-between">
                <h3 class="font-heading font-extrabold text-lg text-slateDark flex items-center gap-2">
                  <i data-lucide="aperture" class="text-oceanBlue w-5 h-5"></i> Bộ sưu tập ảnh Polaroid kỷ niệm
                </h3>
                <span class="px-3 py-1 bg-oceanBlue/10 text-oceanBlue rounded-full text-xs font-bold">
                  ${photos.length} hình ảnh
                </span>
              </div>

              ${photosGridHtml}
            </div>

          </div>
        `;
      } else {
        // EDIT FORM VIEW
        if (actionContainer) {
          actionContainer.innerHTML = '';
        }

        const moods = ['🤩 Hào hứng', '🥰 Thư thái', '📸 Sống ảo', '🍜 Ẩm thực', '⛰️ Phượt'];
        let moodSelectorHtml = moods.map(m => {
          const isActive = selectedDiaryMood === m;
          const activeClass = isActive 
            ? 'bg-oceanBlue text-white border-oceanBlue shadow-sm scale-105' 
            : 'bg-grayBg text-slateDark border-borderGray hover:bg-oceanBlue/10';
          return `
            <button type="button" onclick="selectDiaryMood('${m}')" class="diary-mood-chip px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${activeClass}">
              ${m}
            </button>
          `;
        }).join('');

        mainContainer.innerHTML = `
          <div class="bg-white border border-borderGray rounded-3xl p-6 md:p-8 shadow-sm space-y-6 max-w-4xl mx-auto">
            <div class="border-b border-borderGray pb-4 flex items-center justify-between">
              <div>
                <h3 class="font-heading font-extrabold text-lg text-slateDark">Chỉnh sửa nhật ký hành trình</h3>
                <p class="text-xs text-slateMuted mt-1">Lưu trữ cảm xúc, ghi chú và bộ sưu tập hình ảnh kỷ niệm</p>
              </div>
              <span class="px-3 py-1 bg-oceanBlue/10 text-oceanBlue font-bold rounded-full text-xs">
                ✨ ${trip.province || 'Việt Nam'}
              </span>
            </div>

            <!-- Mood Selector -->
            <div>
              <label class="block text-xs font-bold text-slateMuted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <i data-lucide="smile" class="w-4 h-4 text-sunsetOrange"></i> Tâm trạng & Cảm xúc chuyến đi
              </label>
              <div class="flex flex-wrap gap-2.5">
                ${moodSelectorHtml}
              </div>
            </div>

            <!-- Diary Notes Textarea -->
            <div>
              <label class="block text-xs font-bold text-slateMuted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <i data-lucide="edit-3" class="w-4 h-4 text-oceanBlue"></i> Ghi chú & Kỷ niệm đáng nhớ
              </label>
              <textarea id="diary-content" rows="6" placeholder="Chia sẻ những khoảnh khắc tuyệt vời, địa điểm ấn tượng hoặc món ăn ngon bạn đã thử..." class="w-full p-4 border border-borderGray rounded-2xl text-xs focus:outline-none focus:border-oceanBlue bg-grayBg leading-relaxed font-medium text-slateDark resize-none">${trip.diaryNotes || ''}</textarea>
            </div>

            <!-- Smart Drag and Drop Uploader -->
            <div>
              <label class="block text-xs font-bold text-slateMuted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <i data-lucide="image-plus" class="w-4 h-4 text-coastalTeal"></i> Tải ảnh lên bộ sưu tập kỷ niệm
              </label>
              <div onclick="simulateImageUpload()" class="border-2 border-dashed border-oceanBlue/40 hover:border-oceanBlue rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-grayBg/60 hover:bg-oceanBlue/5 group">
                <div class="w-10 h-10 rounded-full bg-oceanBlue/10 text-oceanBlue flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <i data-lucide="cloud-upload" class="w-5 h-5"></i>
                </div>
                <span class="text-xs font-bold text-slateDark">Kéo thả hình ảnh hoặc nhấp để tải ảnh mẫu HD</span>
                <span class="text-[11px] text-slateMuted mt-0.5">Tự động chọn ảnh sắc nét từ Unsplash</span>
              </div>
            </div>

            <!-- Single Save Action Button (No Duplicates) -->
            <div class="flex gap-3 pt-2">
              <button type="button" onclick="cancelDiaryPageEdit()" class="flex-1 py-3.5 border border-borderGray hover:bg-grayBg text-slateDark font-bold rounded-2xl transition-all text-xs">
                Hủy bỏ
              </button>
              <button type="button" onclick="saveDiaryEntry()" class="flex-1 py-3.5 bg-oceanBlue hover:bg-oceanBlueDark text-white font-bold rounded-2xl transition-all shadow-md text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                <i data-lucide="save" class="w-4 h-4"></i> LƯU NHẬT KÝ HÀNH TRÌNH
              </button>
            </div>
          </div>
        `;
      }

      if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function editDiaryPageEntry() {
      isDiaryPageEditing = true;
      renderDiaryPageContent();
    }

    function cancelDiaryPageEdit() {
      isDiaryPageEditing = false;
      renderDiaryPageContent();
    }

    function selectDiaryMood(moodStr) {
      selectedDiaryMood = moodStr;
      if (isDiaryPageEditing) {
        renderDiaryPageContent();
      }
    }

    function removeDiaryPhoto(imgUrl) {
      const idx = uploadedDiaryImages.indexOf(imgUrl);
      if (idx !== -1) {
        uploadedDiaryImages.splice(idx, 1);
        const tripId = parseInt(document.getElementById('diary-select-trip').value);
        const trip = TRIPS_DB.find(t => t.id === tripId);
        if (trip) {
          trip.diaryPhotos = [...uploadedDiaryImages];
        }
        renderDiaryPageContent();
        showToast('Đã xóa ảnh khỏi kỷ niệm.');
      }
    }

    function simulateImageUpload() {
      showToast('Đang tải ảnh kỷ niệm lên Cloudinary...', 'warning');

      setTimeout(() => {
        const mockImgs = [
          'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
          'https://images.unsplash.com/photo-1583244532610-2a234e7c3eca?w=800',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          'https://images.unsplash.com/photo-1528127269322-539801943592?w=800'
        ];
        const randomImg = mockImgs[Math.floor(Math.random() * mockImgs.length)];
        uploadedDiaryImages.unshift(randomImg);

        const tripId = parseInt(document.getElementById('diary-select-trip').value);
        const trip = TRIPS_DB.find(t => t.id === tripId);
        if (trip) {
          trip.diaryPhotos = [...uploadedDiaryImages];
        }

        renderDiaryPageContent();
        showToast('Đã thêm ảnh vào bộ sưu tập kỷ niệm thành công!', 'success');
      }, 800);
    }

    function saveDiaryEntry() {
      const select = document.getElementById('diary-select-trip');
      const textEl = document.getElementById('diary-content');

      if (!select || !select.value) {
        showToast('Vui lòng chọn chuyến đi trước khi lưu', 'error');
        return;
      }

      const tripId = parseInt(select.value);
      const trip = TRIPS_DB.find(t => t.id === tripId);
      if (trip) {
        trip.diaryNotes = textEl ? textEl.value : '';
        trip.diaryMood = selectedDiaryMood;
        trip.diaryPhotos = [...uploadedDiaryImages];
      }

      isDiaryPageEditing = false;
      renderDiaryPageContent();

      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.7 }
      });

      showToast('Đã lưu nhật ký hành trình thành công!');
    }


    function openPhotoLightbox(imgSrc) {
      const modal = document.getElementById('diary-lightbox-modal');
      const imgEl = document.getElementById('diary-lightbox-img');
      if (modal && imgEl) {
        imgEl.src = imgSrc;
        modal.classList.remove('hidden');
      }
    }

    function closePhotoLightbox() {
      const modal = document.getElementById('diary-lightbox-modal');
      if (modal) {
        modal.classList.add('hidden');
      }
    }

        // ================= USER PROFILE PAGE REDESIGN LOGIC =================
    let currentProfileTab = 'info';
    let selectedTravelPace = 'balanced';
    let selectedCompanionStyle = 'couple';

    function switchProfileTab(tabKey) {
      currentProfileTab = tabKey;
      
      const tabs = ['info', 'ai', 'security'];
      tabs.forEach(t => {
        const navBtn = document.getElementById(`profile-subtab-${t}`);
        const sectionEl = document.getElementById(`profile-section-${t}`);

        if (t === tabKey) {
          if (navBtn) {
            navBtn.className = 'profile-nav-tab py-3.5 px-4 text-xs font-extrabold border-b-2 border-oceanBlue text-oceanBlue transition-all';
          }
          if (sectionEl) {
            sectionEl.classList.remove('hidden');
          }
        } else {
          if (navBtn) {
            navBtn.className = 'profile-nav-tab py-3.5 px-4 text-xs font-extrabold border-b-2 border-transparent text-slateMuted hover:text-slateDark transition-all';
          }
          if (sectionEl) {
            sectionEl.classList.add('hidden');
          }
        }
      });

      if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function setTravelPace(paceKey) {
      selectedTravelPace = paceKey;
      
      const paces = ['relaxed', 'balanced', 'explorer'];
      paces.forEach(p => {
        const btn = document.getElementById(`pace-${p}`);
        if (!btn) return;

        if (p === paceKey) {
          btn.className = 'pace-chip p-4 rounded-2xl border-2 border-oceanBlue bg-oceanBlue/5 text-left transition-all';
          const title = btn.querySelector('span:first-child');
          if (title) title.className = 'block text-sm font-bold text-slateDark mb-1 flex items-center gap-2 font-heading';
        } else {
          btn.className = 'pace-chip p-4 rounded-2xl border border-borderGray bg-grayBg hover:border-oceanBlue text-left transition-all';
          const title = btn.querySelector('span:first-child');
          if (title) title.className = 'block text-sm font-bold text-slateDark mb-1 flex items-center gap-2 font-heading';
        }
      });
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function setCompanionStyle(styleKey) {
      selectedCompanionStyle = styleKey;
      
      const styles = ['solo', 'couple', 'family', 'group'];
      styles.forEach(s => {
        const btn = document.getElementById(`companion-${s}`);
        if (!btn) return;

        if (s === styleKey) {
          btn.className = 'companion-chip py-3 px-4 rounded-xl border-2 border-oceanBlue bg-oceanBlue text-white text-xs font-bold transition-all text-center flex items-center justify-center gap-2';
        } else {
          btn.className = 'companion-chip py-3 px-4 rounded-xl border border-borderGray text-xs font-bold text-slateDark hover:bg-oceanBlue/10 transition-all text-center flex items-center justify-center gap-2';
        }
      });
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function changePassword() {
      const cur = document.getElementById('sec-current-pass');
      const pass = document.getElementById('sec-new-pass');
      const confirm = document.getElementById('sec-confirm-pass');

      if (!cur || !cur.value) {
        showToast('Vui lòng nhập mật khẩu hiện tại', 'error');
        return;
      }
      if (!pass || pass.value.length < 6) {
        showToast('Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
        return;
      }
      if (pass.value !== confirm.value) {
        showToast('Xác nhận mật khẩu mới không trùng khớp', 'error');
        return;
      }

      cur.value = '';
      pass.value = '';
      confirm.value = '';

      showToast('Đã đổi mật khẩu thành công! Vui lòng lưu trữ an toàn.');
      toggleChangePasswordForm();
    }

    function renderUserProfile() {
      if (currentUser) {
        const nameEl = document.getElementById('profile-fullname');
        const emailEl = document.getElementById('profile-email');
        const avatarEl = document.getElementById('profile-avatar-img');
        const dispNameEl = document.getElementById('profile-user-display-name');
        const dispEmailEl = document.getElementById('profile-user-display-email');

        if (nameEl) nameEl.value = currentUser.name;
        if (emailEl) emailEl.value = currentUser.email;
        if (avatarEl) avatarEl.src = currentUser.avatar;
        if (dispNameEl) dispNameEl.innerText = currentUser.name;
        if (dispEmailEl) dispEmailEl.innerText = currentUser.email;
      }
      renderInterestsGrid();
    }

    function saveBasicProfile() {
      const name = document.getElementById('profile-fullname').value;
      if (!name) {
        showToast('Họ tên không được để trống', 'error');
        return;
      }
      if (currentUser) {
        currentUser.name = name;
        localStorage.setItem('travellako_user', JSON.stringify(currentUser));
        updateAuthUI();
      }
      const dispNameEl = document.getElementById('profile-user-display-name');
      if (dispNameEl) dispNameEl.innerText = name;
      showToast('Đã cập nhật thông tin cá nhân cơ bản thành công!');
    }

    function savePersonalization() {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
      showToast('Đã cập nhật dữ liệu huấn luyện AI thành công!');
    }

    function changeProfileAvatar() {
      showToast('Đang chọn ảnh mới...', 'warning');
      setTimeout(() => {
        const avatars = [
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
        ];
        const newAva = avatars[Math.floor(Math.random() * avatars.length)];
        
        document.getElementById('profile-avatar-img').src = newAva;
        if (currentUser) {
          currentUser.avatar = newAva;
          localStorage.setItem('travellako_user', JSON.stringify(currentUser));
          updateAuthUI();
        }
        showToast('Cập nhật ảnh đại diện thành công!');
      }, 800);
    }

    // ================= HELPERS =================
    function formatDateRange(start, end) {
      if (!start || !end) return '';
      const s = new Date(start);
      const e = new Date(end);
      
      const options = { day: 'numeric', month: 'numeric' };
      return `${s.toLocaleDateString('vi-VN', options)} - ${e.toLocaleDateString('vi-VN', options)}/2026`;
    }

    // ================= AI CHAT ASSISTANT SIMULATION =================
    function handleAiInputKey(event) {
      if (event.key === 'Enter') {
        submitAiChatMessage();
      }
    }

    function submitAiChatMessage() {
      const input = document.getElementById('ai-chat-input');
      const text = input.value.trim();
      if (!text) return;

      appendChatMessage(text, 'user');
      input.value = '';

      simulateAiReply(text);
    }

    function sendQuickPrompt(prompt) {
      appendChatMessage(prompt, 'user');
      simulateAiReply(prompt);
    }

    function appendChatMessage(text, sender) {
      const log = document.getElementById('ai-chat-log');
      const msg = document.createElement('div');
      
      if (sender === 'user') {
        msg.className = 'flex justify-end';
        msg.innerHTML = `
          <div class="bg-oceanBlue text-white p-3 rounded-2xl text-xs max-w-[80%] shadow-sm leading-relaxed">
            ${text}
          </div>
        `;
      } else {
        msg.className = 'flex gap-2.5 items-start fade-in';
        msg.innerHTML = `
          <div class="w-8 h-8 rounded-full bg-oceanBlue flex items-center justify-center text-white flex-shrink-0 text-xs">
            <i data-lucide="bot" class="w-4 h-4"></i>
          </div>
          <div class="bg-white border border-borderGray p-3 rounded-2xl text-xs text-slateDark max-w-[80%] shadow-sm leading-relaxed">
            ${text}
          </div>
        `;
      }

      log.appendChild(msg);
      if (typeof lucide !== 'undefined') lucide.createIcons();

      // Scroll log to bottom
      log.scrollTop = log.scrollHeight;
    }

    function simulateAiReply(userText) {
      const log = document.getElementById('ai-chat-log');
      
      // Append typing status
      const typing = document.createElement('div');
      typing.id = 'ai-typing-status';
      typing.className = 'flex gap-2.5 items-start';
      typing.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-oceanBlue flex items-center justify-center text-white flex-shrink-0 text-xs">
          <i data-lucide="bot" class="w-4 h-4"></i>
        </div>
        <div class="bg-white border border-borderGray p-3 rounded-2xl text-xs text-slateMuted italic shadow-sm flex items-center gap-1">
          <span>AI đang phân tích...</span>
          <span class="animate-bounce font-bold">.</span>
          <span class="animate-bounce font-bold" style="animation-delay: 0.2s">.</span>
          <span class="animate-bounce font-bold" style="animation-delay: 0.4s">.</span>
        </div>
      `;
      log.appendChild(typing);
      log.scrollTop = log.scrollHeight;

      setTimeout(() => {
        // Remove typing
        const tStatus = document.getElementById('ai-typing-status');
        if (tStatus) tStatus.remove();

        let replyHtml = '';

        if (userText.includes('Đà Nẵng') || userText.includes('Đà Nẵng 3 ngày')) {
          replyHtml = `
            Đây là lịch trình du lịch **Đà Nẵng 3 ngày 2 đêm** tối ưu cho ngân sách **4 triệu**:
            <br><br>
            📅 **Ngày 1:** Đến Đà Nẵng -> Nhận phòng tại *Khách Sạn Mường Thanh* -> Tắm biển *Mỹ Khê*.
            <br>
            📅 **Ngày 2:** Vui chơi cả ngày tại *Bà Nà Hills* (Tham quan *Cầu Vàng*).
            <br>
            📅 **Ngày 3:** Check-in *Bán đảo Sơn Trà* -> Mua sắm chợ Cồn -> Ra sân bay.
            <br><br>
            💸 **Ước tính chi phí:** Vé Bà Nà Hills (900k) + Khách sạn (1.2M) + Ăn uống & đi lại (1.4M) = **3.500.000đ**.
            <br><br>
            <button onclick="saveItineraryFromChat('Đà Nẵng 3 ngày AI', 'Đà Nẵng', 4000000, [4, 5, 6], '2026-10-12', '2026-10-14')" class="mt-2 w-full py-2.5 bg-oceanBlue hover:bg-oceanBlueDark text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.02] active:scale-[0.98]">
              <i data-lucide="bookmark-plus" class="w-4 h-4"></i> Lưu lịch trình này vào Chuyến đi (1-Click)
            </button>
          `;
        } else if (userText.includes('Hà Nội') || userText.includes('ẩm thực')) {
          replyHtml = `
            Dưới đây là kế hoạch ẩm thực **Hà Nội 2 ngày 1 đêm**:
            <br><br>
            🍜 **Ngày 1:** Thưởng thức *Phở Thìn Lò Đúc* -> Uống *Cafe Giảng Nguyễn Hữu Huân* -> Dạo quanh Hồ Gươm.
            <br>
            🏯 **Ngày 2:** Check-in *Chùa Một Cột* -> Ăn bún chả Phố Cổ -> Mua cốm làng Vòng.
            <br><br>
            💸 **Ước tính chi phí:** Ăn uống (600k) + Lưu trú (500k) + Đi lại (200k) = **1.300.000đ**.
            <br><br>
            <button onclick="saveItineraryFromChat('Ẩm thực Hà Nội 2 ngày', 'Hà Nội', 2500000, [1, 2, 3], '2026-11-05', '2026-11-06')" class="mt-2 w-full py-2.5 bg-oceanBlue hover:bg-oceanBlueDark text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.02] active:scale-[0.98]">
              <i data-lucide="bookmark-plus" class="w-4 h-4"></i> Lưu lịch trình này vào Chuyến đi (1-Click)
            </button>
          `;
        } else {
          // General default reply
          replyHtml = `
            Cảm ơn bạn đã trò chuyện! Tôi đã ghi nhận yêu cầu: "${userText}".
            <br><br>
            Để hỗ trợ tốt nhất, tôi khuyên bạn nên chọn các điểm đến nổi tiếng như **Đà Nẵng**, **Hà Nội**, hoặc **Đà Lạt** để tôi thiết kế một bản lịch trình mẫu chi tiết nhất.
            <br><br>
            Bạn có muốn tham khảo lịch trình **Đà Nẵng** do tôi tự động phân tích không? Hãy click vào các gợi ý câu hỏi ở dưới nhé.
          `;
        }

        appendChatMessage(replyHtml, 'bot');
      }, 1500);
    }

    function saveItineraryFromChat(name, province, budget, placesArray, start, end) {
      if (!currentUser) {
        showToast('Vui lòng đăng nhập trước khi lưu lịch trình', 'error');
        navigate('auth');
        return;
      }

      const newTrip = {
        id: Date.now(),
        name: name,
        province: province,
        budget: budget,
        startDate: start,
        endDate: end,
        status: 'upcoming',
        places: placesArray
      };

      TRIPS_DB.push(newTrip);
      
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      showToast(`Đã lưu thành công chuyến đi "${name}" vào Dashboard!`);
      
      // Automatically switch to trips tab
      navigate('trips');
      toggleAiChatPanel();
    }

    // ================= PRESET BUTTONS FROM HOME =================
    function usePresetItinerary(province, days, budget) {
      if (!currentUser) {
        showToast('Vui lòng đăng nhập trước khi sử dụng lịch trình', 'error');
        navigate('auth');
        return;
      }

      let places = [];
      if (province === 'Hà Nội') places = [1, 2, 3];
      else if (province === 'Đà Nẵng') places = [4, 5, 6];
      else if (province === 'Đà Lạt') places = [7, 8];

      const start = new Date();
      start.setDate(start.getDate() + 15); // in 15 days
      const end = new Date(start);
      end.setDate(end.getDate() + (days - 1));

      const newTrip = {
        id: Date.now(),
        name: `Lịch trình tự đề xuất ${province} ${days} ngày`,
        province: province,
        budget: budget,
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        status: 'upcoming',
        places: places
      };

      TRIPS_DB.push(newTrip);

      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.7 }
      });

      showToast(`Đã thêm lịch trình ${province} vào tài khoản!`);
      goToTripPlanner(newTrip.id);
    }
    // ================= MÀN 9: LOGIC ĐỊA ĐIỂM ĐÃ LƯU (SAVED PLACES) =================
    let activeSavedCategory = 'all';
    let savedPlaceIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; // Default mock favorited places

    function renderSavedPlacesPage() {
      const grid = document.getElementById('saved-places-grid');
      if (!grid) return;

      // Filter places
      let places = PLACES_DB.filter(p => savedPlaceIds.includes(p.id));

      // Stats Counters
      const totalEl = document.getElementById('saved-stat-total');
      const attrEl = document.getElementById('saved-stat-attraction');
      const hotelEl = document.getElementById('saved-stat-hotel');
      const foodEl = document.getElementById('saved-stat-food');

      if (totalEl) totalEl.innerText = places.length;
      if (attrEl) attrEl.innerText = places.filter(p => p.category === 'Attraction').length;
      if (hotelEl) hotelEl.innerText = places.filter(p => p.category === 'Hotel').length;
      if (foodEl) foodEl.innerText = places.filter(p => p.category === 'Restaurant' || p.category === 'Cafe').length;

      filterSavedPlaces();
    }

    function setSavedCategoryFilter(cat) {
      activeSavedCategory = cat;
      const chips = document.querySelectorAll('.saved-filter-chip');
      chips.forEach(c => {
        if (c.id === `saved-chip-${cat}`) {
          c.className = 'saved-filter-chip px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-oceanBlue text-white border border-oceanBlue shadow-sm flex items-center gap-1.5';
        } else {
          c.className = 'saved-filter-chip px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all bg-grayBg border border-borderGray text-slateDark hover:bg-oceanBlue/10 flex items-center gap-1.5';
        }
      });
      filterSavedPlaces();
    }

    function filterSavedPlaces() {
      const grid = document.getElementById('saved-places-grid');
      const searchInput = document.getElementById('saved-search-input');
      if (!grid) return;

      const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      let places = PLACES_DB.filter(p => savedPlaceIds.includes(p.id));

      if (activeSavedCategory !== 'all') {
        places = places.filter(p => p.category === activeSavedCategory);
      }

      if (query) {
        places = places.filter(p => 
          p.name.toLowerCase().includes(query) || 
          (p.province && p.province.toLowerCase().includes(query)) ||
          (p.address && p.address.toLowerCase().includes(query))
        );
      }

      grid.innerHTML = '';

      if (places.length === 0) {
        grid.innerHTML = `
          <div class="col-span-full py-16 text-center text-slateMuted bg-grayBg border border-dashed border-borderGray rounded-3xl space-y-3">
            <div class="w-14 h-14 rounded-full bg-sunsetOrange/10 text-sunsetOrange mx-auto flex items-center justify-center">
              <i data-lucide="heart-off" class="w-7 h-7"></i>
            </div>
            <p class="font-heading font-extrabold text-sm text-slateDark">Chưa có địa điểm đã lưu phù hợp</p>
            <p class="text-xs text-slateMuted max-w-sm mx-auto">Bạn có thể bấm biểu tượng trái tim tại trang Khám phá để lưu địa điểm yêu thích vào đây.</p>
            <button onclick="navigate('search')" class="mt-2 px-4 py-2 bg-oceanBlue text-white font-bold rounded-xl text-xs hover:bg-oceanBlueDark transition-all inline-flex items-center gap-1.5">
              <i data-lucide="compass" class="w-4 h-4"></i> Khám phá địa điểm ngay
            </button>
          </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
      }

      places.forEach(place => {
        const card = document.createElement('div');

        const categoryLabels = {
          'Attraction': 'ATTRACTION',
          'Hotel': 'HOTEL',
          'Restaurant': 'RESTAURANT',
          'Cafe': 'CAFE',
          'Vui chơi': 'ATTRACTION',
          'Khách sạn': 'HOTEL',
          'Nhà hàng': 'RESTAURANT'
        };
        const catBadgeText = categoryLabels[place.category] || (place.category ? place.category.toUpperCase() : 'ATTRACTION');

        let priceTag = '';
        if (place.category === 'Attraction' || place.category === 'Vui chơi') {
          priceTag = (!place.price || place.price === 0) ? '0 - 0đ' : `Từ ${place.price.toLocaleString('vi-VN')}đ / vé`;
        } else if (place.category === 'Hotel' || place.category === 'Khách sạn') {
          priceTag = place.price ? `Từ ${place.price.toLocaleString('vi-VN')}đ / đêm` : '1.200.000 - 2.500.000đ';
        } else if (place.category === 'Restaurant' || place.category === 'Nhà hàng') {
          priceTag = place.price ? `${(Math.round(place.price * 0.8 / 1000) * 1000).toLocaleString('vi-VN')} - ${(Math.round(place.price * 1.5 / 1000) * 1000).toLocaleString('vi-VN')}đ` : '72.000 - 117.000đ';
        } else {
          priceTag = place.price ? `${(Math.round(place.price * 0.8 / 1000) * 1000).toLocaleString('vi-VN')} - ${(Math.round(place.price * 1.3 / 1000) * 1000).toLocaleString('vi-VN')}đ` : '36.000 - 59.000đ';
        }

        let openHours = 'Mở cửa: 07:00 - 22:00';
        if (place.category === 'Hotel' || place.category === 'Khách sạn') {
          openHours = 'Hỗ trợ 24/7';
        } else if (place.category === 'Attraction' || place.category === 'Vui chơi') {
          openHours = 'Mở cửa: 08:00 - 18:00';
        }

        const reviewCount = 100 + (place.id * 27) % 150;
        const img = place.img || place.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800';
        const ratingScore = place.stars || place.rating || '4.8';

        card.className = 'group bg-white rounded-2xl border border-borderGray overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between cursor-pointer relative';
        card.setAttribute('onclick', `showPlaceDetailModal(${place.id})`);

        card.innerHTML = `
          <div class="relative overflow-hidden aspect-[16/9] bg-grayBg">
            <img src="${img}" alt="${place.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            <span class="absolute top-3 left-3 bg-white/95 text-oceanBlue font-extrabold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-lg shadow-sm z-10">${catBadgeText}</span>
            <button onclick="event.stopPropagation(); removeSavedPlace(${place.id})" class="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-all shadow-sm z-10" title="Bỏ lưu yêu thích">
              <i data-lucide="heart" class="w-4 h-4 fill-sunsetOrange text-sunsetOrange"></i>
            </button>
          </div>

          <div class="p-5 flex-grow flex flex-col justify-between">
            <div class="space-y-2">
              <div class="flex items-center justify-between gap-2 text-[10px] font-bold text-slateMuted">
                <span class="flex items-center gap-1 text-slateDark"><i data-lucide="map-pin" class="w-3.5 h-3.5 text-oceanBlue"></i> ${place.province || 'Hà Nội'}</span>
                <span class="flex items-center gap-1"><i data-lucide="clock" class="w-3.5 h-3.5"></i> ${openHours}</span>
              </div>

              <h3 class="font-heading font-extrabold text-slateDark text-sm line-clamp-1 group-hover:text-oceanBlue transition-colors">${place.name}</h3>

              <div class="flex items-center gap-1 text-[11px] text-slateMuted">
                <span class="flex items-center gap-0.5 text-amber-500 font-bold"><i data-lucide="star" class="w-3.5 h-3.5 fill-amber-500 text-amber-500"></i> ${ratingScore}</span>
                <span>(${reviewCount} đánh giá)</span>
              </div>

              <p class="text-xs text-slateMuted line-clamp-2 leading-relaxed pt-1">${place.desc || place.description || 'Địa điểm hấp dẫn không thể bỏ qua với trải nghiệm tuyệt vời.'}</p>
            </div>

            <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <div class="flex flex-col">
                <span class="text-[9px] text-slateMuted font-bold uppercase tracking-wider">Giá tham khảo</span>
                <span class="font-heading font-extrabold text-[13px] text-oceanBlue">${priceTag}</span>
              </div>
              <button onclick="event.stopPropagation(); addSavedPlaceToTrip(${place.id})" class="bg-grayBg group-hover:bg-oceanBlue group-hover:text-white text-slateDark font-bold text-[10px] px-3.5 py-2 rounded-xl transition-all duration-300 border border-borderGray/50 flex items-center gap-1">
                <i data-lucide="plus-circle" class="w-3.5 h-3.5 text-oceanBlue group-hover:text-white"></i> Thêm vào chuyến đi
              </button>
            </div>
          </div>
        `;

        grid.appendChild(card);
      });

      if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function removeSavedPlace(placeId) {
      savedPlaceIds = savedPlaceIds.filter(id => id !== placeId);
      renderSavedPlacesPage();
      showToast('Đã xóa địa điểm khỏi danh sách yêu thích');
    }

    let selectedPlaceIdForTripModal = null;

    function addSavedPlaceToTrip(placeId) {
      const place = PLACES_DB.find(p => p.id === placeId);
      if (!place) return;

      if (TRIPS_DB.length === 0) {
        showToast('Vui lòng tạo chuyến đi trước khi thêm địa điểm', 'warning');
        openCreateTripModal();
        return;
      }

      selectedPlaceIdForTripModal = placeId;
      const modal = document.getElementById('modal-add-to-trip');
      const nameEl = document.getElementById('add-to-trip-place-name');
      const listEl = document.getElementById('modal-trip-list-options');

      if (nameEl) nameEl.innerHTML = `Chọn chuyến đi của bạn để thêm <strong>${place.name}</strong>:`;

      if (listEl) {
        listEl.innerHTML = TRIPS_DB.map(t => {
          const hasPlace = t.places && t.places.includes(placeId);
          return `
            <div onclick="confirmAddPlaceToTrip(${t.id}, ${placeId})" class="p-3.5 border border-borderGray hover:border-oceanBlue rounded-2xl cursor-pointer transition-all bg-grayBg hover:bg-oceanBlue/5 flex items-center justify-between group">
              <div>
                <span class="block text-xs font-bold text-slateDark group-hover:text-oceanBlue transition-colors">${t.name}</span>
                <span class="block text-[11px] text-slateMuted mt-0.5">📍 ${t.province || 'Việt Nam'} • ${t.places ? t.places.length : 0} địa điểm</span>
              </div>
              <span class="px-3 py-1 bg-oceanBlue/10 text-oceanBlue font-bold rounded-xl text-[11px]">
                ${hasPlace ? 'Đã có' : '+ Chọn'}
              </span>
            </div>
          `;
        }).join('');
      }

      if (modal) modal.classList.remove('hidden');
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function confirmAddPlaceToTrip(tripId, placeId) {
      const trip = TRIPS_DB.find(t => t.id === tripId);
      const place = PLACES_DB.find(p => p.id === placeId);
      if (!trip || !place) return;

      if (!trip.places) trip.places = [];

      if (!trip.places.includes(placeId)) {
        trip.places.push(placeId);
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 }
        });
        showToast(`Đã thêm "${place.name}" vào chuyến đi "${trip.name}" thành công!`);
      } else {
        showToast(`"${place.name}" đã có sẵn trong chuyến đi này rồi.`, 'warning');
      }

      closeAddToTripModal();
    }

    function closeAddToTripModal() {
      const modal = document.getElementById('modal-add-to-trip');
      if (modal) modal.classList.add('hidden');
    }
