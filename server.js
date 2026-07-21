const express = require('express');
const app = express();

app.use(express.json());

// フォルダごとに個別のURLで公開する設定
app.use('/vietnamese', express.static('./Vietnamese'));
app.use('/english', express.static('./English'));

// Renderに設定した環境変数からAPIキーを読み込む
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post('/translate', async (req, res) => {
    try {
        if (!GEMINI_API_KEY) {
            return res.status(500).json({ error: "GEMINI_API_KEY is not set in environment variables." });
        }

        const textToTranslate = req.body.text;
        
        // Gemini 2.0 Flash のAPIエンドポイント
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `以下の日本語をベトナム語に翻訳して: ${textToTranslate}` }]
                }]
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => console.log('サーバーが起動しました: http://localhost:3000'));
