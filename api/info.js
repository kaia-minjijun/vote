export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    localIP: 'vercel',
    port: 80,
    serverPort: 443,
    voteUrl: `https://${req.headers.host}/vote`
  });
}
