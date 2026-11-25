/* ========================================
   47都道府県 全国ランキング自動計算

   ・ratings.js の評価取得完了を待つ
   ・0点を含む全47都道府県で順位計算
   ・同点の場合は同順位
   ・順位を n/47 形式で表示
======================================== */

(async function () {
  "use strict";

  const TOTAL_PREFECTURES = 47;

  // 現在の都道府県ID
  const prefectureId = document.body.dataset.prefecture;

  if (!prefectureId) {
    return;
  }

  // HTMLの表示先
  const rankNumberElement =
    document.getElementById("rank-number");

  const rankStatusElement =
    document.getElementById("rank-status");

  const titleStarElement =
    document.getElementById("title-star-image");

  const bodyStarElement =
    document.getElementById("body-star-image");

  /* ========================================
     評価データを取得
  ======================================== */

  const ratingsPromise =
    window.PREFECTURE_RATINGS_PROMISE;

  if (!ratingsPromise) {
    console.error("ratings.js が読み込まれていません。");

    if (rankStatusElement) {
      rankStatusElement.textContent = "読み込みエラー";
    }

    return;
  }

  let ratings;

  try {
    ratings = await ratingsPromise;
  } catch (error) {
    console.error("評価データの取得に失敗しました。", error);

    if (rankStatusElement) {
      rankStatusElement.textContent = "読み込みエラー";
    }

    return;
  }

  /* ========================================
     全47都道府県の評価
  ======================================== */

  const allRatings = Object.values(ratings);

  // 現在の県の評価
  const currentRating = ratings[prefectureId];

  if (currentRating === undefined) {
    if (rankStatusElement) {
      rankStatusElement.textContent = "都道府県ID未登録";
    }

    return;
  }

  /* ========================================
     ランキング計算

     自分より評価が高い県の数 + 1

     同点は同順位
     0点の県も計算に含める
  ======================================== */

  const higherCount = allRatings.filter(
    rating => rating > currentRating
  ).length;

  const rank = higherCount + 1;

  /* ========================================
     順位表示
  ======================================== */

  if (rankNumberElement) {
    rankNumberElement.textContent = `${rank}位`;
  }

  /* ========================================
     評価未設定の表示

     0点の場合は星画像を非表示
     ただし順位計算には含める
  ======================================== */

  if (currentRating === 0) {

    if (rankStatusElement) {
      rankStatusElement.textContent =
        "評価未設定（0点で集計）";
    }

    if (titleStarElement) {
      titleStarElement.hidden = true;
    }

    if (bodyStarElement) {
      bodyStarElement.hidden = true;
    }

  } else {

    if (rankStatusElement) {
      rankStatusElement.textContent = "全国順位";
    }

    if (titleStarElement) {
      titleStarElement.hidden = false;
    }

    if (bodyStarElement) {
      bodyStarElement.hidden = false;
    }

  }

  /* ========================================
     デバッグ用

     開発者ツールのConsoleで
     47都道府県の評価と順位を確認できる
  ======================================== */

  console.log("47都道府県の評価一覧:", ratings);

  console.log("現在の都道府県:", prefectureId);

  console.log("おすすめ度:", currentRating);

  console.log(
    "全国順位:",
    `${rank}/${TOTAL_PREFECTURES}`
  );

})();
