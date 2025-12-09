const app = require('./app.cjs');
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`✅ Backend server is running on http://localhost:${PORT}`);
});