function generateUniqueId(question) {
    return btoa(question).substr(0, 8) + Math.random().toString(36).substr(2, 4);
}

function encrypt(text, key) {
    return CryptoJS.AES.encrypt(text, key).toString();
}

function decrypt(ciphertext, key) {
    return CryptoJS.AES.decrypt(ciphertext, key).toString(CryptoJS.enc.Utf8);
}

function storeLink(id, longUrl) {
    const key = Math.random().toString(36).substr(2, 10);
    const linkData = {
        url: encrypt(longUrl, key),
        timestamp: Date.now()
    };
    localStorage.setItem(id, JSON.stringify(linkData));
    return key;
}

function getShortUrl(id, key) {
    return `${window.location.origin}/${id}/${key}`;
}

document.getElementById('questionForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const question = document.getElementById('question').value;
    const encodedQuestion = encodeURIComponent(question);
    const baseUrl = "https://chat.openai.com/?q=Hey,+i+just+asked+my+friend+a+silly+question:+%22";
    const suffix = "%22+but+then+I+realised+I+could+just+ask+ai.+Please+answer+my+question,+but+weave+into+it+teachings+about+when+its+best+to+ask+an+ai+a+question+vs+asking+a+friend+the+question";
    const longUrl = baseUrl + encodedQuestion + suffix;
    
    const id = generateUniqueId(question);
    const key = storeLink(id, longUrl);
    const shortUrl = getShortUrl(id, key);
    
    document.getElementById('generatedLink').value = shortUrl;
    document.getElementById('result').classList.remove('hidden');
});

function copyLink() {
    const linkInput = document.getElementById('generatedLink');
    linkInput.select();
    document.execCommand('copy');
    alert('Link copied to clipboard!');
}

// Clean up expired links
function cleanupExpiredLinks() {
    const now = Date.now();
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const data = JSON.parse(localStorage.getItem(key));
        if (now - data.timestamp > 24 * 60 * 60 * 1000) { // 24 hours
            localStorage.removeItem(key);
        }
    }
}

// Run cleanup on page load and every hour
cleanupExpiredLinks();
setInterval(cleanupExpiredLinks, 60 * 60 * 1000);