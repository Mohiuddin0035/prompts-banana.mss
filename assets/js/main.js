let allPrompts = []; 

document.addEventListener("DOMContentLoaded", () => {
    // Session Storage Check for Intro
    if (!sessionStorage.getItem('introShown')) {
        runHeaderTypingEffect().then(() => {
            sessionStorage.setItem('introShown', 'true');
            initializeWebsite();
        });
    } else {
        skipIntroAnimation();
        initializeWebsite();
    }
});

// ============ HEADER ANIMATION LOGIC ============
async function runHeaderTypingEffect() {
    const target = document.getElementById('typing-target');
    const cursor = document.querySelector('.cursor');
    const delay = ms => new Promise(r => setTimeout(r, ms));

    async function typeText(text, speed = 80) {
        for (let char of text) {
            target.innerText += char;
            await delay(speed);
        }
    }
    async function backspace(limit, speed = 50) {
        while (target.innerText.length > limit) {
            target.innerText = target.innerText.slice(0, -1);
            await delay(speed);
        }
    }

    await delay(500);
    await typeText("Shape the unseen.....!", 70);
    await delay(1500);
    await backspace(0, 30);
    await delay(300);
    await typeText("#github.com/mohiuddin0035/", 70);
    await delay(800);
    await backspace(1, 60); 
    cursor.style.display = 'none';
    target.classList.add('neon-hash-active');
    await delay(1200); 
    target.classList.remove('neon-hash-active');
    target.innerHTML = `<span class="final-logo">&lt;prompts/<span class="banana">🍌</span>&gt;</span>`;
    document.querySelectorAll('.fade-in-delayed').forEach(el => el.classList.add('visible'));
}

function skipIntroAnimation() {
    const target = document.getElementById('typing-target');
    const cursor = document.querySelector('.cursor');
    cursor.style.display = 'none';
    target.innerHTML = `<span class="final-logo" style="animation:none; opacity:1; transform:scale(1);">&lt;prompts/<span class="banana">🍌</span>&gt;</span>`;
    document.querySelectorAll('.fade-in-delayed').forEach(el => {
        el.classList.add('visible');
        el.style.transition = 'none';
    });
}

// ============ SYSTEM CLOCK ============
function startSystemClock() {
    const clockElement = document.getElementById('clock');
    if(!clockElement) return;
    function updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-GB', { hour12: false });
        clockElement.innerText = `[${timeString}]`;
    }
    setInterval(updateTime, 1000);
    updateTime(); 
}

// ============ MAIN LOGIC ============
function initializeWebsite() {
    startSystemClock();
    const container = document.getElementById('prompt-container');
    const searchInput = document.getElementById('searchInput');

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
        });

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

// --- UPDATED: Render Cards (Added ID to div) ---
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
        
        // NEW: Assign a specific ID to finding it later
        div.id = `prompt-${item.id}`;

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

// --- UPDATED: Leaderboard (Clickable Items) ---
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
        
        // ADDED: onclick event and class "leaderboard-item"
        html += `<div class="leaderboard-item" onclick="scrollToPrompt(${item.id})" style="${rowStyle}">
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

// --- NEW FUNCTION: Scroll to Prompt ---
window.scrollToPrompt = (id) => {
    // 1. Reset Search (To make sure hidden cards appear)
    const searchInput = document.getElementById('searchInput');
    if(searchInput) {
        searchInput.value = ''; // Clear text
        renderCards(allPrompts); // Show all cards
        observeCards(); // Re-attach animation
    }

    // 2. Close Modal
    closeLeaderboard();

    // 3. Find and Scroll
    setTimeout(() => {
        const element = document.getElementById(`prompt-${id}`);
        if(element) {
            // Smooth scroll to center
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Add Golden Glow Effect
            element.classList.add('highlight-card');
            
            // Remove Glow after 2 seconds
            setTimeout(() => {
                element.classList.remove('highlight-card');
            }, 2000);
        } else {
            console.log("Card not found with ID:", id);
        }
    }, 300); // Small delay to let modal close first
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