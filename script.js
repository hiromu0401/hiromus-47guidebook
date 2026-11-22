/* ========================================
   47都道府県ガイド
   ページ遷移アニメーション
======================================== */
document.addEventListener("DOMContentLoaded", () => {
  const pageWrapper = document.querySelector(".page-wrapper");
  const mainMap = document.querySelector("#main-map");
  const hokkaidoTohokuLink = document.querySelector("#hokkaido-tohoku-link");
  const regionButtons = document.querySelectorAll(".region-btn");
  const fadeLinks = document.querySelectorAll("[data-fade-link]");

  /* ========================================
     GSAP読み込み確認
  ======================================== */
  if (typeof gsap === "undefined") {
    console.warn("GSAPが読み込まれていません。");
    return;
  }

  /* ========================================
     アニメーション設定
  ======================================== */
  const FADE_DURATION = 0.2;
  let isAnimating = false;

  /* ========================================
     ページ表示時のフェードイン
  ======================================== */
  if (pageWrapper) {
    gsap.fromTo(
      pageWrapper,
      { opacity: 0 },
      {
        opacity: 1,
        duration: FADE_DURATION,
        ease: "power1.out"
      }
    );
  }

  /* ========================================
     共通フェード遷移
     北海道ページ・戻るボタン用
  ======================================== */
  fadeLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      event.preventDefault();

      if (isAnimating) {
        return;
      }

      isAnimating = true;
      document.body.classList.add("is-animating");

      const destination = link.getAttribute("href");

      gsap.to(pageWrapper, {
        opacity: 0,
        duration: FADE_DURATION,
        ease: "power1.inOut",
        onComplete: () => {
          window.location.href = destination;
        }
      });
    });
  });

  /* ========================================
     index.html 北海道・東北ズーム遷移
  ======================================== */
  if (hokkaidoTohokuLink && mainMap) {
    hokkaidoTohokuLink.addEventListener("click", (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      event.preventDefault();

      if (isAnimating) {
        return;
      }

      isAnimating = true;
      document.body.classList.add("is-animating");

      const destination = hokkaidoTohokuLink.getAttribute("href");

      const timeline = gsap.timeline({
        onComplete: () => {
          window.location.href = destination;
        }
      });

      /* STEP 1：地方ボタンをフェードアウト */
      timeline.to(
        regionButtons,
        {
          opacity: 0,
          duration: 0.3,
          ease: "power1.out"
        },
        0
      );

      /* STEP 2：日本地図を拡大 */
      timeline.to(
        mainMap,
        {
          scale: 1.3,
          transformOrigin: "80% 35%",
          xPercent: -30,
          yPercent: 15,
          duration: 1.2,
          ease: "power2.inOut"
        },
        0
      );

      /* STEP 3：ページ全体をフェードアウト */
      timeline.to(
        pageWrapper,
        {
          opacity: 0,
          duration: FADE_DURATION,
          ease: "power1.inOut"
        },
        1.2
      );
    });
  }

  /* ========================================
     ブラウザの戻る操作による表示崩れ防止
  ======================================== */
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      isAnimating = false;
      document.body.classList.remove("is-animating");

      if (pageWrapper) {
        gsap.set(pageWrapper, {
          clearProps: "opacity"
        });
      }

      if (mainMap) {
        gsap.set(mainMap, {
          clearProps: "transform,transformOrigin"
        });
      }

      if (regionButtons.length > 0) {
        gsap.set(regionButtons, {
          clearProps: "opacity"
        });
      }
    }
  });
});
