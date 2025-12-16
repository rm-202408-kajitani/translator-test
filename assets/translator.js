
(() => {

    // =====================================================
    // 初期定義
    // =====================================================
    const COMBO_SELECT_SELECTOR = '.goog-te-combo';
    const SHOW_TRANSLATE_CLASS = 'show-translate';

    const translateContainer = document.querySelector('.translate_container');
    const translateTriggerButton = document.querySelector('.translate_trigger');
    const translateDropdown = document.getElementById('custom_lang_dropdown');

    const PAGE_LANGUAGE_CODE = 'ja'; // ライブラリを設置するページのデフォルト言語コード
    const PAGE_LANGUAGE_LABEL = '日本語'; // ライブラリを設置するページのデフォルト言語ラベル
    const PAGE_INCLUDE_LANGUAGES = 'ja,en,zh-CN,zh-TW,ko,pt,es,fr'; // 利用する翻訳言語コードリスト

    // 翻訳オプション設定
    const options = {
        pageLanguage: PAGE_LANGUAGE_CODE,
        includedLanguages: PAGE_INCLUDE_LANGUAGES,
        autoDisplay: false,
    };
    const languagesConfig = options.includedLanguages.split(',');

    let comboSelect = null; // 翻訳セレクト要素を保持する変数
    let lastSelectedLang = null; // 直前の選択言語を保持する変数


    // 国旗コードマッピング
    const flagCodeMap = {
        'ar': 'sa',  // アラビア語 -> サウジアラビア
        'cs': 'cz',  // チェコ語 -> チェコ
        'da': 'dk',  // デンマーク語 -> デンマーク
        'de': 'de',  // ドイツ語 -> ドイツ
        'el': 'gr',  // ギリシャ語 -> ギリシャ
        'en': 'us',  // 英語 -> アメリカ合衆国 イギリス国旗を出す場合は us → gb に変更
        'es': 'es',  // スペイン語 -> スペイン メキシコ国旗を出す場合は後ろを es → mx に変更
        'fi': 'fi',  // フィンランド語 -> フィンランド
        'fr': 'fr',  // フランス語 -> フランス
        'he': 'il',  // ヘブライ語 -> イスラエル
        'hi': 'in',  // ヒンディー語 -> インド
        'id': 'id',  // インドネシア語 -> インドネシア
        'it': 'it',  // イタリア語 -> イタリア
        'ja': 'jp',  // 日本語 -> 日本
        'ko': 'kr',  // 韓国語 -> 韓国
        'ms': 'my',  // マレー語 -> マレーシア
        'nl': 'nl',  // オランダ語 -> オランダ
        'no': 'no',  // ノルウェー語 -> ノルウェー
        'pl': 'pl',  // ポーランド語 -> ポーランド
        'pt': 'pt',  // ポルトガル語 -> ポルトガル ブラジル国旗を出す場合は後ろを pt → br に変更
        'ru': 'ru',  // ロシア語 -> ロシア
        'sv': 'se',  // スウェーデン語 -> スウェーデン
        'th': 'th',  // タイ語 -> タイ
        'tl': 'ph',  // タガログ語 -> フィリピン
        'tr': 'tr',  // トルコ語 -> トルコ
        'uk': 'ua',  // ウクライナ語 -> ウクライナ
        'vi': 'vn',  // ベトナム語 -> ベトナム
        'zh-CN': 'cn', // 中国語 (簡体字) -> 中国
        'zh-TW': 'tw', // 中国語 (繁体字) -> 台湾
    };

    // =====================================================
    // ユーティリティ
    // =====================================================

    // 選択された言語に基づいて状態を更新し翻訳ライブラリに通知
    const updateComboSelect = (langCode) => {
        comboSelect.value = langCode;
        comboSelect.dispatchEvent(new Event('change'));
    };

    // ページ言語に戻った場合に翻訳ライブラリに再通知
    const notifyTranslate = (langCode, prevLang) => {
        const isBackToPageLanguage =
            langCode === PAGE_LANGUAGE_CODE &&
            prevLang &&
            prevLang !== PAGE_LANGUAGE_CODE;

        if (isBackToPageLanguage) {
            // PAGE_LANGUAGE_CODE を選んだ際の不必要な翻訳を避けるために(日本語ページ内の「FAQ」表記が「よくある質問」に翻訳される等)
            // PAGE_LANGUAGE_CODE 選択時は 2回 change を発火させてウィジェット側の表示言語を PAGE_LANGUAGE_CODE → auto に変える
            // (Google翻訳ウィジェットの仕様で PAGE_LANGUAGE_CODE で設定した言語のボタンを2回押すと auto になるため)
            Promise.resolve().then(() => {
                comboSelect.dispatchEvent(new Event('change'));
            });
        }
    };

    // ドロップダウンを閉じる
    const closeTranslateDropdown = () => {
        translateContainer.classList.remove(SHOW_TRANSLATE_CLASS);
    };

    // =====================================================
    // UI要素生成
    // =====================================================

    // 言語コードから国旗コードを取得
    const getFlagCode = (langCode) =>
        flagCodeMap[langCode] || langCode;

    // 国旗画像付きリストアイテムの生成
    const createFlaggedItem = (langCode, label) => {
        const container = document.createElement('a');
        container.href = '#';
        container.role = 'menuitem';
        container.className = 'custom-lang-item';
        container.dataset.lang = langCode;

        const img = document.createElement('img');
        img.src = `https://flagcdn.com/w20/${getFlagCode(langCode)}.png`;
        img.alt = `${langCode} flag`;
        img.className = 'flag-icon';

        const span = document.createElement('span');
        span.className = 'lang-label';
        span.textContent = label;

        container.append(img, span);
        return container;
    };

    // =====================================================
    // 言語選択ロジック
    // =====================================================

    // listItem に言語選択イベントを追加
    const selectLanguage = (langCode) => {
        if (lastSelectedLang === langCode) {
            closeTranslateDropdown();
            return;
        }

        const prevLang = lastSelectedLang;
        lastSelectedLang = langCode;

        updateComboSelect(langCode);
        notifyTranslate(langCode, prevLang);

        closeTranslateDropdown();
    };

    // listItem にクリックイベントを追加
    const attachListItemListener = (listItem, langCode) => {
        listItem.addEventListener('click', (event) => {
            event.preventDefault();
            selectLanguage(langCode);
        });
    };

    // =====================================================
    // カスタムリスト生成
    // =====================================================

    // ヘルパー
    // optionMap 作成
    const createOptionMap = () => {
        if (!comboSelect) return new Map(); // comboSelect が未定義の場合は空のMapを返す
        return new Map(Array.from(comboSelect.options).map(opt => [opt.value, opt]));
    };

    // 言語リストアイテム作成
    const createLanguageListItem = (langCode, label) => {
        const item = createFlaggedItem(langCode, label);
        attachListItemListener(item, langCode);
        return item;
    };

    // ページデフォルト言語のリストアイテム作成
    const createInitialLanguageItem = () =>
        createLanguageListItem(PAGE_LANGUAGE_CODE, PAGE_LANGUAGE_LABEL);

    // ヘルパーおわり

    // メイン処理
    // カスタム翻訳リストの構築
    const buildCustomList = (languagesConfig) => {
        const customList = document.getElementById('custom_lang_list');
        if (!customList || !comboSelect) return;

        customList.innerHTML = '';

        const optionMap = createOptionMap();

        customList.appendChild(createInitialLanguageItem());

        languagesConfig
            .filter(lang => lang !== PAGE_LANGUAGE_CODE)
            .forEach(langCode => {
                const option = optionMap.get(langCode);
                if (!option) return;

                customList.appendChild(createLanguageListItem(langCode, option.textContent));
            });
    };

    // ラッパー
    // デバウンス付きリスト再構築
    let rebuildTimer; // タイマーIDを上書きして保持し続ける
    const safeBuildCustomList = (languagesConfig) => {
        clearTimeout(rebuildTimer);
        rebuildTimer = setTimeout(() => {
            buildCustomList(languagesConfig);
        }, 200);
    };

    // =====================================================
    // comboSelect 監視
    // =====================================================

    // comboSelect要素の出現や変化を監視しリストの再構築をトリガー
    const observeComboSelect = (languagesConfig) => {
        // 発見した comboSelect をトップスコープの変数に代入
        const newComboSelect = document.querySelector(COMBO_SELECT_SELECTOR);
        if (!newComboSelect) return;

        comboSelect = newComboSelect; // トップスコープの変数に代入

        buildCustomList(languagesConfig);

        // 親ノードのみ監視
        let parentNode = comboSelect.parentNode;
        if (!parentNode) return;

        const observer = new MutationObserver(() => {
            const newSelect = document.querySelector(COMBO_SELECT_SELECTOR);

            // 新しく生成された場合のみ再構築
            if (newSelect && newSelect !== comboSelect) {
                comboSelect = newSelect;
                parentNode = comboSelect.parentNode;
                if (!parentNode) return;

                safeBuildCustomList(languagesConfig);
            }

            // options の追加・削除・更新があった場合にもリストを再構築
            else if (comboSelect.options.length > 0) {
                safeBuildCustomList(languagesConfig);
            }

        });

        observer.observe(parentNode, { childList: true, attributes: true });
    };

    // =====================================================
    // comboSelect 出現待ち(ポーリング)
    // =====================================================

    // 指定した言語リストに基づいて翻訳セレクトが出現するまで定期的に確認
    const waitForComboSelect = (languagesConfig) => {
        // UA定義
        const ua = navigator.userAgent || navigator.vendor || window.opera;

        // UAとTouchからiOS / iPadOSを検出
        const isIOS =
            /iPad|iPhone|iPod/.test(ua) ||
            ((navigator.userAgentData?.platform === 'MacIntel') && navigator.maxTouchPoints > 1);

        const intervalMs = isIOS ? 400 : 200; // iOSデバイスの場合は400ms / それ以外は200ms間隔でポーリング

        // ポーリング開始
        let poll = setInterval(() => {
            const el = document.querySelector(COMBO_SELECT_SELECTOR);
            if (el && el.options.length) {
                comboSelect = el;
                clearInterval(poll);
                poll = null;
                observeComboSelect(languagesConfig);
            }
        }, intervalMs);
    };

    // =====================================================
    // ドロップダウン表示制御
    // =====================================================

    // 翻訳ドロップダウンの表示を制御
    document.addEventListener('click', (event) => {
        const isVisible = translateContainer.classList.contains(SHOW_TRANSLATE_CLASS);
        const clickedTrigger = translateTriggerButton && translateTriggerButton.contains(event.target);
        const clickedInsideDropdown = translateDropdown && translateDropdown.contains(event.target);

        if (clickedTrigger) {
            translateContainer.classList.toggle(SHOW_TRANSLATE_CLASS);
        } else if (!clickedInsideDropdown && isVisible) {
            closeTranslateDropdown();
        }
    });

    // =====================================================
    // Google 翻訳初期化
    // =====================================================

    // ページ読み込み時に Google 翻訳ウィジェットを初期化し comboSelect のポーリング開始
    window.googleTranslateElementInit = () => {
        new google.translate.TranslateElement(options, 'google_translate_element');

        // comboSelect のポーリング開始
        waitForComboSelect(languagesConfig);
    };

})();
