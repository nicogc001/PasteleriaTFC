(function () {
    const KEY = "cookie-consent-v2";      // versiona la clave
    const VALID_DAYS = 180;               // caducidad del consentimiento (días)
    let loadersRun = { analytics: false, marketing: false };
  
    window.CookieConsent = {
      get() {
        try { return JSON.parse(localStorage.getItem(KEY)) || null; }
        catch { return null; }
      },
      set(consent) {
        localStorage.setItem(KEY, JSON.stringify(consent));
      },
      isExpired(consent) {
        if (!consent?.ts) return true;
        const ageDays = (Date.now() - consent.ts) / (1000 * 60 * 60 * 24);
        return ageDays > VALID_DAYS;
      },
      apply(consent) {
        if (!consent) return;
        if (consent.analytics && !loadersRun.analytics) {
          this.loadAnalytics(); loadersRun.analytics = true;
        }
        if (consent.marketing && !loadersRun.marketing) {
          this.loadMarketing(); loadersRun.marketing = true;
        }
      },
      // === Añade aquí tus scripts de ANALÍTICA (GTM/GA4) ===
      loadAnalytics() {
        // Ejemplo GA4 (rellena tu ID)
        // if (document.getElementById('ga4')) return;
        // const s = document.createElement("script");
        // s.id = "ga4"; s.async = true;
        // s.src = "https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX";
        // document.head.appendChild(s);
        // window.dataLayer = window.dataLayer || [];
        // function gtag(){dataLayer.push(arguments);}
        // gtag('js', new Date()); gtag('config', 'G-XXXXXXX');
      },
      // === Añade aquí tus scripts de MARKETING (Meta Pixel, etc.) ===
      loadMarketing() {
        // Ejemplo Meta Pixel (rellena tu ID)
        // if (window.fbq) return;
        // !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        // n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
        // n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
        // t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script',
        // 'https://connect.facebook.net/en_US/fbevents.js'); fbq('init', 'PIXEL_ID'); fbq('track', 'PageView');
      }
    };
  
    function qs(id) { return document.getElementById(id); }
    function hideBanner() { const b = qs("cookie-banner"); if (b) b.style.display = "none"; }
    function showBanner() { const b = qs("cookie-banner"); if (b) b.style.display = "block"; }
  
    function fillFromConsent(consent) {
      if (!consent) return;
      const a = qs("cc-analytics");
      const m = qs("cc-marketing");
      if (a) a.checked = !!consent.analytics;
      if (m) m.checked = !!consent.marketing;
    }
  
    function wireUI() {
      const btnAcceptAll = qs("cc-accept-all");
      const btnRejectAll = qs("cc-reject-all");
      const btnSave = qs("cc-save");
      const btnConfig = qs("cc-config");
      const chkAnalytics = qs("cc-analytics");
      const chkMarketing = qs("cc-marketing");
      const panel = document.querySelector(".cc-panel");
  
      btnAcceptAll?.addEventListener("click", () => {
        const consent = { necessary: true, analytics: true, marketing: true, ts: Date.now() };
        CookieConsent.set(consent);
        CookieConsent.apply(consent);
        hideBanner();
      });
  
      btnRejectAll?.addEventListener("click", () => {
        const consent = { necessary: true, analytics: false, marketing: false, ts: Date.now() };
        CookieConsent.set(consent);
        // No aplicamos loaders porque son falsos
        hideBanner();
      });
  
      btnSave?.addEventListener("click", () => {
        const consent = {
          necessary: true,
          analytics: !!chkAnalytics?.checked,
          marketing: !!chkMarketing?.checked,
          ts: Date.now()
        };
        CookieConsent.set(consent);
        CookieConsent.apply(consent);
        hideBanner();
      });
  
      btnConfig?.addEventListener("click", () => {
        if (!panel) return;
        panel.style.display = (panel.style.display === "none" || !panel.style.display) ? "block" : "none";
      });
  
      // Enlace global para “Preferencias de cookies” desde el footer
      window.openCookieSettings = function () {
        showBanner();
        if (panel) panel.style.display = "block";
        fillFromConsent(CookieConsent.get());
      };
    }
  
    document.addEventListener("DOMContentLoaded", () => {
      const consent = CookieConsent.get();
      if (!consent || CookieConsent.isExpired(consent)) {
        showBanner();
      } else {
        CookieConsent.apply(consent);
      }
      wireUI();
      fillFromConsent(consent);
    });
  })();
  