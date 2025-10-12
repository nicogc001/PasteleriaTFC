// elementos/cookies.js
(function () {
    const KEY = "cookie-consent-v1";
  
    const CookieConsent = {
      get() {
        try { return JSON.parse(localStorage.getItem(KEY)) || null; }
        catch { return null; }
      },
      set(consent) {
        localStorage.setItem(KEY, JSON.stringify(consent));
      },
      apply(consent) {
        if (!consent) return;
        // Activa librerías según preferencias
        if (consent.analytics) loadAnalytics();
        if (consent.marketing) loadMarketing();
      }
    };
  
    function loadAnalytics() {
      // Ejemplo: Google Analytics (comentado)
      // const s = document.createElement("script");
      // s.src = "https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX";
      // s.async = true;
      // document.head.appendChild(s);
      // window.dataLayer = window.dataLayer || [];
      // function gtag(){dataLayer.push(arguments);}
      // gtag('js', new Date());
      // gtag('config', 'G-XXXXXXX', { 'anonymize_ip': true });
    }
  
    function loadMarketing() {
      // Ejemplo: Meta Pixel (comentado)
      // const s = document.createElement("script");
      // s.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      // n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      // n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];
      // s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
      // fbq('init','XXXXXXXXXXXXXXX');fbq('track','PageView');`;
      // document.head.appendChild(s);
    }
  
    function hideBanner() {
      const el = document.getElementById("cookie-banner");
      if (el) el.style.display = "none";
    }
  
    function showBanner() {
      const el = document.getElementById("cookie-banner");
      if (el) el.style.display = "block";
    }
  
    function wireUI() {
      const btnAcceptAll = document.getElementById("cc-accept-all");
      const btnSave = document.getElementById("cc-save");
      const btnConfig = document.getElementById("cc-config");
      const btnRejectAll = document.getElementById("cc-reject-all");
  
      const chkAnalytics = document.getElementById("cc-analytics");
      const chkMarketing = document.getElementById("cc-marketing");
      const panel = document.querySelector(".cc-panel");
  
      if (btnAcceptAll) {
        btnAcceptAll.addEventListener("click", () => {
          const consent = { necessary: true, analytics: true, marketing: true, ts: Date.now() };
          CookieConsent.set(consent);
          CookieConsent.apply(consent);
          hideBanner();
        });
      }
  
      if (btnRejectAll) {
        btnRejectAll.addEventListener("click", () => {
          const consent = { necessary: true, analytics: false, marketing: false, ts: Date.now() };
          CookieConsent.set(consent);
          CookieConsent.apply(consent);
          hideBanner();
        });
      }
  
      if (btnSave) {
        btnSave.addEventListener("click", () => {
          const consent = {
            necessary: true,
            analytics: !!chkAnalytics?.checked,
            marketing: !!chkMarketing?.checked,
            ts: Date.now(),
          };
          CookieConsent.set(consent);
          CookieConsent.apply(consent);
          hideBanner();
        });
      }
  
      if (btnConfig && panel) {
        btnConfig.addEventListener("click", () => {
          panel.style.display = panel.style.display === "none" ? "block" : "none";
        });
      }
    }
  
    // Punto único de inicio (lo llamaremos tras inyectar el HTML)
    window.initCookieBanner = function initCookieBanner() {
      const consent = CookieConsent.get();
      if (consent) {
        CookieConsent.apply(consent);
        hideBanner();
      } else {
        showBanner();
      }
      wireUI();
    };
  })();
  