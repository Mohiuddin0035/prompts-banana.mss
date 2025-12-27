let allPrompts = []; 

document.addEventListener("DOMContentLoaded", () => {
    // Check if intro was already shown in this session
    if (!sessionStorage.getItem('introShown')) {
        // Jodi age na dekhe thake -> Run Animation
        runHeaderTypingEffect().then(() => {
            sessionStorage.setItem('introShown', 'true'); // Mark as shown
            initializeWebsite();
        });
    } else {
        // Jodi age dekhe thake -> Skip Animation & Show Content Instantly
        skipIntroAnimation();
        initializeWebsite();
    }
});

// ============ HEADER ANIMATION LOGIC ============
async function runHeaderTypingEffect() {
    const target = document.getElementById('typing-target');
    const cursor = document.querySelector('.cursor');
    const delay = ms => new Promise(r => setTimeout(r, ms));

    // Typing Helper
    async function typeText(text, speed = 80) {
        for (let char of text) {
            target.innerText += char;
            await delay(speed);
        }
    }

    // Backspace Helper
    async function backspace(limit, speed = 50) {
        while (target.innerText.length > limit) {
            target.innerText = target.innerText.slice(0, -1);
            await delay(speed);
        }
    }

    // Step 1: Type "Create your imagination.....!"
    await delay(500);
    await typeText("Create your imagination.....!", 70);
    await delay(1500); // Wait for reading

    // Step 2: Delete Everything
    await backspace(0, 30);
    await delay(300);

    // Step 3: Type "#https://github.com/mohiuddin0035/"
    await typeText("#https://github.com/mohiuddin0035/", 70);
    await delay(800);

    // Step 4: Backspace until ONLY "#" remains
    await backspace(1, 60); 

    // Step 5: Glow Effect
    cursor.style.display = 'none'; // Hide cursor
    target.classList.add('neon-hash-active'); // Scale Up & Glow Blue
    await delay(1200); 

    // Step 6: Final Logo Swap (Pop Effect)
    target.classList.remove('neon-hash-active');
    target.innerHTML = `<span class="final-logo">&lt;prompts/<span class="banana">🍌</span>&gt;</span>`;
    
    // Reveal Subtitle and Search
    document.querySelectorAll('.fade-in-delayed').forEach(el => el.classList.add('visible'));
}

// --- NEW FUNCTION: Skip Animation Logic ---
function skipIntroAnimation() {
    const target = document.getElementById('typing-target');
    const cursor = document.querySelector('.cursor');

    // Hide cursor immediately
    cursor.style.display = 'none';

    // Show Final Logo immediately (No animation)
    target.innerHTML = `<span class="final-logo" style="animation:none; opacity:1; transform:scale(1);">&lt;prompts/<span class="banana">🍌</span>&gt;</span>`;

    // Show Search & Subtitle immediately
    document.querySelectorAll('.fade-in-delayed').forEach(el => {
        el.classList.add('visible');
        el.style.transition = 'none'; // No fade effect, just show
    });
}


// ============ SYSTEM CLOCK LOGIC ============
function startSystemClock() {
    const clockElement = document.getElementById('clock');
    if(!clockElement) return; // Safety check
    
    function updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-GB', { hour12: false });
        clockElement.innerText = `[${timeString}]`;
    }
    setInterval(updateTime, 1000);
    updateTime(); 
}


// ============ MAIN WEBSITE LOGIC ============
function initializeWebsite() {
    startSystemClock(); // Start the clock

    const container = document.getElementById('prompt-container');
    const searchInput = document.getElementById('searchInput');

    // Fetch Data
    fetch('data/prompts.json')
        .then(response => response.json())
        .then(data => {
            allPrompts = data;
            renderCards(allPrompts);
            setupLeaderboard(allPrompts);
            observeCards();
        })
        .catch(error => {
            console.error('Error:', error);
            // container.innerHTML = '<p style="text-align:center; color:red;">Error loading database._</p>';
        });

    // Search Logic
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim().replace('#', '');
            if (searchTerm === "") { renderCards(allPrompts); } 
            else {
                const filtered = allPrompts.filter(item => 
                    item.tags.some(tag => tag.toLowerCase().includes(searchTerm))
                );
                renderCards(filtered);
            }
            observeCards();
        });
    }
}

// Render Cards
function renderCards(data) {
    const container = document.getElementById('prompt-container');
    if(!container) return;
    container.innerHTML = '';
    
    if(data.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#666;">No prompts found._</p>';
        return;
    }

    data.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('card');
        
        const rating = item.rating || 0;
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let starsHTML = "★".repeat(fullStars);
        if (hasHalfStar) starsHTML += "½";
        
        div.innerHTML = `
            <div class="card-img-wrapper"><img src="${item.image}" alt="${item.title}" class="card-img" loading="lazy"></div>
            <div class="card-content">
                <div class="rating-box" title="Rated ${rating}/5">${starsHTML} <span class="star-score">(${rating})</span></div>
                <h3 class="card-title">>${item.title}</h3>
                <div class="card-prompt-box">
                    <p>${item.prompt}</p>
                    <button class="copy-btn" onclick="copyText(this)">COPY</button>
                    <input type="hidden" value="${item.prompt}">
                </div>
                <div class="tags">${item.tags.map(tag => `<span>#${tag}</span>`).join('')}</div>
            </div>`;
        container.appendChild(div);
    });
}

// Leaderboard Logic
function setupLeaderboard(data) {
    const list = document.getElementById('leaderboard-list');
    if(!list) return;

    const sorted = [...data].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10);
    let html = '';
    sorted.forEach((item, index) => {
        let rankBadge = '';
        let rowStyle = 'padding: 15px 10px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: space-between;';
        if (index === 0) { rankBadge = '🥇'; rowStyle += 'background: linear-gradient(90deg, rgba(255,215,0,0.1), transparent); border-left: 3px solid #FFD700;'; }
        else if (index === 1) { rankBadge = '🥈'; }
        else if (index === 2) { rankBadge = '🥉'; }
        else { rankBadge = `#${index + 1}`; }
        
        html += `<div style="${rowStyle}">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <span style="font-size:1.2rem;">${rankBadge}</span>
                        <span style="font-weight:bold; color: var(--text-main); font-size: 0.95rem;">${item.title}</span>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:end;">
                        <span style="color:var(--accent); font-weight:bold;">${item.rating}</span>
                        <span style="font-size:0.65rem; color:#666;">Editor Rating</span>
                    </div>
                </div>`;
    });
    list.innerHTML = html;
}

// Utils
window.openLeaderboard = () => { document.getElementById('leaderboard-modal').style.display = 'block'; }
window.closeLeaderboard = () => { document.getElementById('leaderboard-modal').style.display = 'none'; }
window.onclick = (event) => { if (event.target == document.getElementById('leaderboard-modal')) document.getElementById('leaderboard-modal').style.display = "none"; }

function copyText(btn) {
    navigator.clipboard.writeText(btn.nextElementSibling.value).then(() => {
        let original = btn.innerText; btn.innerText = "COPIED!"; btn.style.color = "#3b82f6"; btn.style.borderColor = "#3b82f6";
        setTimeout(() => { btn.innerText = original; btn.style.color = ""; btn.style.borderColor = ""; }, 2000);
    });
}

function observeCards() {
    const cards = document.querySelectorAll('.card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
    }, { threshold: 0.1 });
    cards.forEach(card => observer.observe(card));
}