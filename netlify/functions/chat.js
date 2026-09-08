// netlify/functions/chat.js
exports.handler = async function(event, context) {
    const cors = {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'};
    if (event.httpMethod === 'OPTIONS') return {statusCode: 200, headers: cors, body: ''};
    if (event.httpMethod !== 'POST') return {statusCode: 405, headers: cors, body: JSON.stringify({error: 'Method Not Allowed'})};
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return {statusCode: 500, headers: cors, body: JSON.stringify({error: 'GROQ_API_KEY belum disetel di Netlify Environment Variables.'})};
    try {
        const body = JSON.parse(event.body || '{}');
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey},
            body: JSON.stringify({
                model: body.model || 'openai/gpt-oss-120b',
                messages: body.messages || [],
                max_tokens: body.max_tokens || 800,
                temperature: body.temperature || 0.7
            })
        });
        const data = await res.text();
        return {statusCode: res.status, headers: Object.assign({}, cors, {'Content-Type': 'application/json'}), body: data};
    } catch (e) {
        return {statusCode: 500, headers: cors, body: JSON.stringify({error: e.message})};
    }
};
