(() => {

    // =====================================================
    // 初期定義
    // =====================================================
    const pageLanguage = 'ja'; // ライブラリを設置するページのデフォルト言語コード
    const translateTriggerButton = document.querySelector('.translate_trigger');
    const translateDropdown = document.getElementById('custom_lang_dropdown');
    const body = document.body;

    // =====================================================
    // ユーティリティ
    // =====================================================

    // 言語コードから国旗コードを取得
    const getFlagCode = (langCode) => {
        const map = {
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
        return map[langCode] || langCode;
    };

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
    // カスタムリスト生成
    // =====================================================

    // デバウンス付きリスト再構築
    let rebuildTimer;
    const safeBuildCustomList = (comboSelect, languagesConfig) => {
        clearTimeout(rebuildTimer);
        rebuildTimer = setTimeout(() => {
            buildCustomList(comboSelect, languagesConfig);
        }, 100);
    };

    // listItem に言語選択イベントを追加
    // 直前の選択言語を保持
    let lastSelectedLang = null;
    const attachListItemListener = (listItem, langCode, comboSelect) => {
        listItem.addEventListener('click', (event) => {
            event.preventDefault();

            // 同じ言語をクリックした場合は何もせず終了
            if (lastSelectedLang === langCode) {
                body.classList.remove('show-translate');
                return;
            }

            // 言語を記録更新
            const prevLang = lastSelectedLang;
            lastSelectedLang = langCode;

            // セレクトへ反映
            comboSelect.value = langCode;

            // 他言語 → pageLanguage のときだけ 2回通知
            const isBackToPageLanguage =
                langCode === pageLanguage &&
                prevLang &&
                prevLang !== pageLanguage;

            // 選択値変更を翻訳ライブラリに通知する分岐
            if (isBackToPageLanguage) {
                comboSelect.dispatchEvent(new Event('change')); // 1回目

                // microtask に回して 2回目を発火
                Promise.resolve().then(() => {
                    comboSelect.dispatchEvent(new Event('change'));
                });
            } else {
                // 通常の1回通知
                comboSelect.dispatchEvent(new Event('change'));
            }

            // ドロップダウンを閉じる
            body.classList.remove('show-translate');
        });
    };


    // カスタム翻訳リストを再構築(全削除 → 再生成)
    const buildCustomList = (comboSelect, languagesConfig) => {
        const customList = document.getElementById('custom_lang_list');
        if (!customList) return;

        customList.innerHTML = '';

        // 初期言語ボタンを追加
        const initialItem = createFlaggedItem(pageLanguage, '日本語');
        attachListItemListener(initialItem, pageLanguage, comboSelect);
        customList.appendChild(initialItem);

        // 言語リストを作成
        const optionMap = new Map(
            Array.from(comboSelect.options).map(opt => [opt.value, opt])
        );

        languagesConfig.forEach((langCode) => {
            if (langCode === pageLanguage) return;

            const option = optionMap.get(langCode);
            if (!option) return;

            const listItem = createFlaggedItem(langCode, option.textContent);
            attachListItemListener(listItem, langCode, comboSelect);
            customList.appendChild(listItem);
        });
    };

    // =====================================================
    // comboSelect 監視
    // =====================================================

    // comboSelect要素の出現や変化を監視しリストの再構築をトリガー
    const observeComboSelect = (languagesConfig) => {
        let comboSelect = document.querySelector('.goog-te-combo');
        if (!comboSelect) return;

        buildCustomList(comboSelect, languagesConfig);

        // 親ノードのみ監視
        let parentNode = comboSelect.parentNode;
        if (!parentNode) return;

        const observer = new MutationObserver(() => {
            const newSelect = document.querySelector('.goog-te-combo');

            // 新しく生成された場合のみ再構築
            if (newSelect && newSelect !== comboSelect) {
                comboSelect = newSelect;
                parentNode = comboSelect.parentNode;
                if (!parentNode) return;

                safeBuildCustomList(comboSelect, languagesConfig);
            }

            // options の追加・削除・更新があった場合にもリストを再構築
            else if (comboSelect.options.length > 0) {
                safeBuildCustomList(comboSelect, languagesConfig);
            }

        });

        observer.observe(parentNode, { childList: true });
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
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

        const intervalMs = isIOS ? 400 : 200; // iOSデバイスの場合は400ms / それ以外は200ms間隔でポーリング

        // ポーリング開始
        let poll = setInterval(() => {
            const comboSelect = document.querySelector('.goog-te-combo');
            if (comboSelect && comboSelect.options.length) {
                clearInterval(poll);
                observeComboSelect(languagesConfig);
            }
        }, intervalMs);
    };

    // =====================================================
    // Google 翻訳初期化
    // =====================================================

    // ページ読み込み時に Google 翻訳ウィジェットを初期化し comboSelect のポーリング開始
    window.googleTranslateElementInit = () => {
        const options = {
            pageLanguage: pageLanguage,
            includedLanguages: 'ja,en,zh-CN,zh-TW,ko,pt,es,fr', // 翻訳を利用する言語を指定 フロントは並び順に表示
            autoDisplay: false,
        };

        new google.translate.TranslateElement(options, 'google_translate_element');

        const languagesConfig = options.includedLanguages.split(',');

        // comboSelect のポーリング開始
        waitForComboSelect(languagesConfig);
    };

    // =====================================================
    // ドロップダウン表示制御
    // =====================================================

    // 翻訳ドロップダウンの表示を制御
    document.addEventListener('click', (event) => {
        const isVisible = body.classList.contains('show-translate');
        const clickedTrigger = translateTriggerButton && translateTriggerButton.contains(event.target);
        const clickedInsideDropdown = translateDropdown && translateDropdown.contains(event.target);

        if (clickedTrigger) {
            body.classList.toggle('show-translate');
        } else if (!clickedInsideDropdown && isVisible) {
            body.classList.remove('show-translate');
        }
    });
})();

