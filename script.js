/* ========================================
   47都道府県ガイド
   ページ遷移アニメーション
======================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ========================================
     共通要素
  ======================================== */

  const pageWrapper = document.querySelector(".page-wrapper");

  const mainMap = document.querySelector("#main-map");

  const hokkaidoTohokuLink =
    document.querySelector("#hokkaido-tohoku-link");

  const regionButtons =
    document.querySelectorAll(".region-btn");


  /* ========================================
     GSAPが読み込めなかった場合
  ======================================== */

  if (typeof gsap === "undefined") {
    console.warn("GSAPが読み込まれていません。");
    return;
  }


  /* ========================================
     ページ表示時のフェードイン
  ======================================== */

  if (pageWrapper) {

    gsap.fromTo(
      pageWrapper,

      {
        opacity: 0
      },

      {
        opacity: 1,
        duration: 0.2,
        ease: "power1.out"
      }
    );

  }


  /* ========================================
     北海道・東北ボタンが存在しない場合
     （別ページではここで終了）
  ======================================== */

  if (!hokkaidoTohokuLink || !mainMap) {
    return;
  }


  /* ========================================
     多重クリック防止
  ======================================== */

  let isAnimating = false;


  /* ========================================
     北海道・東北ボタンをクリック
  ======================================== */

  hokkaidoTohokuLink.addEventListener("click", (event) => {

    /* 通常のページ遷移を停止 */
    event.preventDefault();

    /* アニメーション中は再実行しない */
    if (isAnimating) {
      return;
    }

    isAnimating = true;

    document.body.classList.add("is-animating");


    /* ========================================
       アニメーションタイムライン
    ======================================== */

    const timeline = gsap.timeline({

      onComplete: () => {

        /* アニメーション終了後にページ遷移 */
        window.location.href =
          hokkaidoTohokuLink.getAttribute("href");

      }

    });


    /* ========================================
       STEP 1
       地方ボタンをフェードアウト
       0秒〜0.3秒
    ======================================== */

    timeline.to(
      regionButtons,

      {
        opacity: 0,
        duration: 0.3,
        ease: "power1.out"
      },

      0
    );


    /* ========================================
       STEP 2
       日本地図を指定位置へ拡大
       0秒〜1.2秒
    ======================================== */

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

    /* ========================================
       STEP 3
       ページ全体をフェードアウト
       1.2秒〜1.6秒
    ======================================== */

    timeline.to(
      pageWrapper,

      {
        opacity: 0,

        duration: 0.2,

        ease: "power1.inOut"
      },

      1.2
    );


  });


  /* ========================================
     戻る操作による表示崩れ防止
  ======================================== */

  window.addEventListener("pageshow", (event) => {

    if (event.persisted) {

      isAnimating = false;

      document.body.classList.remove("is-animating");

      gsap.set(pageWrapper, {
        clearProps: "opacity"
      });

      gsap.set(mainMap, {
        clearProps: "transform,transformOrigin"
      });

      gsap.set(regionButtons, {
        clearProps: "opacity"
      });

    }

  });

});
