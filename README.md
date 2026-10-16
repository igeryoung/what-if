# What-if Studio

輸入一個「如果…」題目，由 Claude Code 自動查證、寫畫面、配樂、算繪，產出約一分鐘（58–75 秒）直式短片的中文版和英文版，
以及兩種語言的 YouTube Shorts 標題、內文和標籤。

## 結構

    films/<id>/      一支片的全部：畫面程式（*.tsx）、score.py → score.wav、素材、meta.json、
                     thumb.tsx（縮圖）、out/（zh.mp4、en.mp4、thumb_zh.jpg、thumb_en.jpg、檢查圖）、session/（Studio 製作紀錄）
    films/archive/   封存的舊片（Studio 不列出、tsc 不檢查，引擎也不註冊）
    engine/          共用程式：Root（自動註冊每支片的中英文版本）、kit/（字型、元件、語言切換、地球）、assets/
    studio/          網頁介面與排程（server.mjs、index.html、topics.json 擲骰題庫）
    tools/           stills.mjs（檢查畫格）、render.mjs（算繪 mp4）、thumb.mjs（縮圖）、score.sh（配樂 → −14 LUFS）、
                     voice.sh（旁白 narration.json → mix_zh.wav、mix_en.wav）
    docs/            BRIEF.md（給 Claude 的製作規範）、CHEATSHEET.md（API 與骨架）、examples/
    lib/             第三方音訊工具與樂器取樣（lib/.venv 是它的 Python 環境）
    vendor/          headless Chrome、Python 3.12（lib/.venv 用的直譯器）
    archive/         舊的獨立專案（cpr-60s、earth-10x、earth-10x-v2 的原始碼）與 log

## 安裝（在專案根目錄）

    npm ci                                                    # Remotion（node_modules）
    git clone https://github.com/lemomo-ai/lemo-opuscar.git lib   # 音訊工具（配樂用）
    uv venv lib/.venv --python 3.12
    uv pip install --python lib/.venv/bin/python -r lib/requirements.txt -r lib/requirements-music.txt
    sh lib/tools/fetch.sh instruments vsco2ce                 # 樂器取樣，約 1.1 GB
    sh lib/tools/fetch.sh instruments vcsl
    sh lib/tools/fetch.sh instruments freepats
    uv pip install --python lib/.venv/bin/python edge-tts      # 旁白（微軟線上語音：中文 HsiaoChen、英文 Andrew）

另外需要 ffmpeg，以及能在本機執行的 `claude` CLI。headless Chrome 可以放在
`vendor/chrome-headless-shell-linux64/`；沒有的話，Remotion 第一次算繪時會自己下載。

## 使用

    node studio/server.mjs          # Studio：http://127.0.0.1:8787（PORT / HOST / MAX_RUNNING 環境變數可改）

手動製作或修改一支片（都在專案根目錄執行）：

    npx tsc -p .                            # 型別檢查
    sh tools/score.sh <id>                  # films/<id>/score.py → score.wav
    sh tools/voice.sh <id>                  # films/<id>/narration.json + score.wav → mix_zh.wav、mix_en.wav（旁白，需要網路）
    node tools/stills.mjs <id> 2 10 30      # films/<id>/out/stills/sheet_zh.jpg、sheet_en.jpg
    node tools/render.mjs <id>              # films/<id>/out/zh.mp4、en.mp4
    node tools/thumb.mjs <id>               # films/<id>/thumb.tsx → out/thumb_zh.jpg、thumb_en.jpg、thumb_small.jpg
    npx remotion studio engine/index.ts     # 即時預覽

## 雙語

每支片的 `index.tsx` 匯出 `LANGS = ['zh', 'en']`，畫面文字寫成 `t('中文', 'English')`。
同一份畫面和配樂會註冊成兩個 composition：`<id>`（中文）和 `<id>-en`（英文）。
舊片（只有中文）在 Studio 對它按「修改」並輸入「加上英文版」即可補上。

## Studio 注意事項

- 每個題目會以 `claude -p --permission-mode acceptEdits` 在本目錄執行，預先允許 Bash/Read/Write/Edit/Glob/Grep/WebSearch/WebFetch，
  所以 server 最好只綁 127.0.0.1。
- 對已完成的片按「修改」會 `--resume` 同一個 Claude session。

## 經驗法則

- 不要對 CSS `filter: blur()` 做動畫（多執行緒算繪時會拿到過期畫面）；靜態的 SVG blur 可以。
- 1080×1920；文字放在 y≈200–1500（平台介面會蓋住底部約 400 px 和右側）。
- 換場切在配樂的小節線上，重拍放在換場點。
- 結尾要回到開場畫面並回答開頭的問題：答案句用標題大小、停 2.5 秒以上，最後一格等於第一格（Shorts 重播會無縫接上）；
  不要淡出到黑、開頭也不要從黑淡入。配樂用終止和弦收尾，不要一路淡出。檢查 `out/<lang>_ends.jpg`。
- 響度 −14 LUFS、true peak −1.5 dB。
- 沒有下載 piano 取樣，鋼琴請用 'upright'。
