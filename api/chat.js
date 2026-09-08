// api/chat.js - Serverless Backend Proxy untuk Groq API
export default async function handler(req, res) {
    // Header CORS agar bisa diakses dari frontend mana pun
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: { message: 'Hanya method POST yang diperbolehkan.' } });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ 
            error: { message: 'GROQ_API_KEY belum dikonfigurasi di Environment Variables Vercel.' } 
        });
    }

    try {
        const { messages, model, max_tokens, temperature } = req.body;

        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': Bearer 
            },
            body: JSON.stringify({
                model: model || 'openai/gpt-oss-120b',
                messages: messages || [],
                max_tokens: max_tokens || 800,
                temperature: temperature ?? 0.7
            })
        });

        const data = await groqResponse.json();
        return res.status(groqResponse.status).json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        return res.status(500).json({ 
            error: { message: error.message || 'Terjadi kesalahan pada server proxy.' } 
        });
    }
}
