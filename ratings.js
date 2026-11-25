/* ========================================
   47都道府県 おすすめ度自動取得

   ・各HTMLの星画像ファイル名から評価を抽出
   ・本文用の星画像を優先
   ・画像が存在しない場合は0点
   ・HTMLが存在しない場合も0点
   ・全47都道府県をランキングに含める
======================================== */

(function () {
  "use strict";

  /* ========================================
     47都道府県のHTMLファイル一覧

     新しい県を作成した場合は、
     このファイル名に合わせて保存してください。
  ======================================== */

  const prefectureFiles = {
    // 北海道・東北
    hokkaido: "hokkaido.html",
    aomori: "aomori.html",
    iwate: "iwate.html",
    miyagi: "miyagi.html",
    akita: "akita.html",
    yamagata: "yamagata.html",
    fukushima: "fukushima.html",

    // 関東
    ibaraki: "ibaraki.html",
    tochigi: "tochigi.html",
    gunma: "gunma.html",
    saitama: "saitama.html",
    chiba: "chiba.html",
    tokyo: "tokyo.html",
    kanagawa: "kanagawa.html",

    // 中部
    niigata: "niigata.html",
    toyama: "toyama.html",
    ishikawa: "ishikawa.html",
    fukui: "fukui.html",
    yamanashi: "yamanashi.html",
    nagano: "nagano.html",
    gifu: "gifu.html",
    shizuoka: "shizuoka.html",
    aichi: "aichi.html",

    // 近畿
    mie: "mie.html",
    shiga: "shiga.html",
    kyoto: "kyoto.html",
    osaka: "osaka.html",
    hyogo: "hyogo.html",
    nara: "nara.html",
    wakayama: "wakayama.html",

    // 中国
    tottori: "tottori.html",
    shimane: "shimane.html",
    okayama: "okayama.html",
    hiroshima: "hiroshima.html",
    yamaguchi: "yamaguchi.html",

    // 四国
    tokushima: "tokushima.html",
    kagawa: "kagawa.html",
    ehime: "ehime.html",
    kochi: "kochi.html",

    // 九州・沖縄
    fukuoka: "fukuoka.html",
    saga: "saga.html",
    nagasaki: "nagasaki.html",
    kumamoto: "kumamoto.html",
    oita: "oita.html",
    miyazaki: "miyazaki.html",
    kagoshima: "kagoshima.html",
    okinawa: "okinawa.html"
  };

  /* ========================================
     星画像のファイル名から評価を抽出

     星4.5_本文.png → 4.5
     星5_タイトル.png → 5
     形式が一致しなければ null
  ======================================== */

  function extractRating(imagePath) {
    if (!imagePath) {
      return null;
    }

    let fileName;

    try {
      const url = new URL(imagePath, document.baseURI);

      fileName = decodeURIComponent(
        url.pathname.split("/").pop()
      );
    } catch (error) {
      return null;
    }

    const match = fileName.match(
      /^星([0-5](?:\.5)?)_(本文|タイトル)\.png$/
    );

    if (!match) {
      return null;
    }

    const rating = Number(match[1]);

    // 0～5点、0.5刻みのみ有効
    if (
      rating < 0 ||
      rating > 5 ||
      !Number.isInteger(rating * 2)
    ) {
      return null;
    }

    return rating;
  }

  /* ========================================
     HTMLから星画像を探す

     ① 本文用の星画像
     ② タイトル用の星画像

     この順番で探す
  ======================================== */

  function findRatingImage(htmlDocument) {
    const images = Array.from(
      htmlDocument.querySelectorAll("img[src]")
    );

    // 本文用を優先
    const bodyImage = images.find(image => {
      const src = image.getAttribute("src");
      const rating = extractRating(src);

      return (
        rating !== null &&
        decodeURIComponent(
          new URL(src, htmlDocument.baseURI)
            .pathname.split("/").pop()
        ).endsWith("_本文.png")
      );
    });

    if (bodyImage) {
      return bodyImage.getAttribute("src");
    }

    // 本文用がなければタイトル用
    const titleImage = images.find(image => {
      const src = image.getAttribute("src");
      return extractRating(src) !== null;
    });

    return titleImage
      ? titleImage.getAttribute("src")
      : null;
  }

  /* ========================================
     指定画像が実在するか確認

     ファイルが見つからなければ false
  ======================================== */

  async function imageExists(imageUrl) {
    try {
      const response = await fetch(imageUrl, {
        method: "HEAD"
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /* ========================================
     1都道府県の評価を取得
  ======================================== */

  async function getPrefectureRating(
    prefectureId,
    fileName
  ) {
    try {
      const pageUrl = new URL(
        "./" + fileName,
        document.baseURI
      );

      let htmlDocument;

      // 現在開いている県のHTMLは再取得しない
      if (
        document.body.dataset.prefecture === prefectureId
      ) {
        htmlDocument = document;
      } else {
        const response = await fetch(pageUrl);

        // HTMLが存在しない場合は0点
        if (!response.ok) {
          return 0;
        }

        const htmlText = await response.text();

        htmlDocument = new DOMParser().parseFromString(
          htmlText,
          "text/html"
        );
      }

      // HTMLから星画像を取得
      const imagePath = findRatingImage(htmlDocument);

      // 星画像の記載がない場合は0点
      if (!imagePath) {
        return 0;
      }

      // ファイル名から星評価を取得
      const rating = extractRating(imagePath);

      if (rating === null) {
        return 0;
      }

      // HTMLの場所を基準に画像URLを解決
      const imageUrl = new URL(imagePath, pageUrl);

      // 実際に画像ファイルが存在するか確認
      const exists = await imageExists(imageUrl);

      if (!exists) {
        return 0;
      }

      return rating;

    } catch (error) {
      // HTML取得エラーなどは0点
      return 0;
    }
  }

  /* ========================================
     47都道府県の評価を一括取得
  ======================================== */

  async function loadAllRatings() {
    const entries = Object.entries(prefectureFiles);

    const results = await Promise.all(
      entries.map(async ([prefectureId, fileName]) => {
        const rating = await getPrefectureRating(
          prefectureId,
          fileName
        );

        return [prefectureId, rating];
      })
    );

    return Object.fromEntries(results);
  }

  /* ========================================
     ランキング計算側に評価データを渡す
  ======================================== */

  window.PREFECTURE_RATINGS_PROMISE = loadAllRatings();

})();
