// ==================== GLOBAL VARIABLES ====================
let isAdmin = false;
let leaderboardInitialized = false;
let activityChart = null;
let likesChart = null;

// ==================== DOM CONTENT LOADED ====================
document.addEventListener('DOMContentLoaded', function () {
    loadParticlesJS();
    loadChartJS();
    initializeThemeToggle();
    initializeTitleAnimation();
    initializeFieldCards();
    initializeLeaderboard();
    initializeFeedbackForm();
    initializeStarRating();
    loadReviews();
    checkAdminStatus();
    initializeQuiz();
});

// ==================== LOAD particles.min.js ====================
function loadParticlesJS() {
    const script = document.createElement('script');
    script.src = '/static/particles.min.js';
    script.onload = () => {
        console.log("particles.js loaded");
        initializeParticles();
    };
    script.onerror = () => console.error("particles.js failed");
    document.head.appendChild(script);
}

// ==================== LOAD Chart.js ====================
function loadChartJS() {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = () => {
        console.log("Chart.js loaded");
        initializeCharts();
        initializeScrollAnimations();
    };
    script.onerror = () => console.error("Chart.js failed");
    document.head.appendChild(script);
}

// ==================== PARTICLES ====================
function initializeParticles() {
    if (!document.getElementById('particles-js') || typeof particlesJS === 'undefined') return;
    const isDark = document.body.classList.contains('dark-mode');
    const color = isDark ? '#ffffff' : '#333333';

    particlesJS("particles-js", {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: color },
            shape: { type: "circle" },
            opacity: { value: 0.5 },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 150, color: color, opacity: 0.4, width: 1 },
            move: { enable: true, speed: 3 }
        },
        interactivity: { detect_on: "canvas", events: { onhover: { enable: true, mode: "repulse" } } },
        retina_detect: true
    });
}

// ==================== THEME TOGGLE ====================
function initializeThemeToggle() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    const saved = localStorage.getItem('theme') || 'light';
    if (saved === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('sun-icon')?.style && (document.getElementById('sun-icon').style.display = 'none');
        document.getElementById('moon-icon')?.style && (document.getElementById('moon-icon').style.display = 'block');
    }

    toggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        document.getElementById('sun-icon')?.style && (document.getElementById('sun-icon').style.display = isDark ? 'none' : 'block');
        document.getElementById('moon-icon')?.style && (document.getElementById('moon-icon').style.display = isDark ? 'block' : 'none');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        if (typeof particlesJS !== 'undefined') initializeParticles();
    });
}

// ==================== TITLE ANIMATION ====================
function initializeTitleAnimation() {
    const title = document.getElementById('code-ninja-title');
    if (!title) return;
    const text = 'Developers'.split('');
    title.innerHTML = '';
    text.forEach((l, i) => {
        const s = document.createElement('span');
        s.className = 'letter';
        s.textContent = l === ' ' ? '\u00A0' : l;
        s.style.animationDelay = `${i * 0.1}s`;
        title.appendChild(s);
    });
}

// ==================== FIELD CARDS ====================
function initializeFieldCards() {
    const cards = document.querySelectorAll('.field-card');
    const overlay = document.getElementById('dialog-overlay');
    if (!cards.length || !overlay) return;

    window.addEventListener('scroll', () => {
        cards.forEach(c => c.classList.toggle('expanded', window.scrollY > 300));
    });

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const field = card.dataset.field.toLowerCase();
            document.getElementById('dialog-title').textContent = `${card.querySelector('h2').innerText} - Select Resource`;
            overlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';

            document.querySelectorAll('.dialog-option').forEach(opt => {
                const res = opt.dataset.resource;
                const name = res === 'note' ? 'note' : res === 'paperset' ? 'paperset' : res;
                opt.href = `/${field}${name}`;
            });
        });
    });

    document.getElementById('dialog-close')?.addEventListener('click', () => {
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
}

// ==================== LEADERBOARD ====================
function initializeLeaderboard() {
    if (leaderboardInitialized || !document.getElementById('leaderboard-list')) return;
    leaderboardInitialized = true;

    const data = [
        { name: "Rahul Kumar", score: 98, field: "BSc", rank: 1 },
        { name: "Priya Sharma", score: 95, field: "BTech", rank: 2 },
        { name: "Amit Patel", score: 92, field: "BSc", rank: 3 },
        { name: "Neha Singh", score: 89, field: "BCA", rank: 4 },
        { name: "Vikram Gupta", score: 87, field: "BTech", rank: 5 }
    ];

    const list = document.getElementById("leaderboard-list");
    list.innerHTML = "";
    data.forEach((p, i) => {
        const trophy = p.rank <= 3 ? (p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : '🥉') : '🏆';
        const item = document.createElement("div");
        item.className = "leaderboard-item";
        item.style.animationDelay = `${i * 0.1}s`;
        item.innerHTML = `
            <div class="rank">#${p.rank}</div>
            <div class="trophy">${trophy}</div>
            <div class="info"><div class="name">${p.name}</div><div class="field">${p.field}</div></div>
            <div class="score">${p.score}</div>
        `;
        item.addEventListener("click", () => showPopup(p, trophy));
        list.appendChild(item);
    });
}

function showPopup(p, t) {
    const popup = document.getElementById("leaderboard-popup");
    if (!popup) return;
    document.getElementById("popup-name").textContent = p.name;
    document.getElementById("popup-field").textContent = `Field: ${p.field}`;
    document.getElementById("popup-score").textContent = `Score: ${p.score}`;
    document.getElementById("popup-rank").textContent = `Rank: #${p.rank}`;
    document.getElementById("popup-trophy").textContent = t;
    popup.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function closePopup() {
    const popup = document.getElementById("leaderboard-popup");
    if (popup) popup.style.display = "none", document.body.style.overflow = "auto";
}

// ==================== CHARTS ====================
function initializeCharts() {
    if (!document.getElementById('activity-chart')) return;

    const actCtx = document.getElementById('activity-chart').getContext('2d');
    activityChart = new Chart(actCtx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Active Users',
                data: [60, 40, 20, 30, 20, 10, 0],
                borderColor: '#f80606',
                backgroundColor: 'rgba(233, 30, 99, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    const likesCtx = document.getElementById('likes-chart').getContext('2d');
    likesChart = new Chart(likesCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Likes',
                data: [10, 40, 20, 60, 10, 40],
                backgroundColor: 'rgba(233, 30, 99, 0.6)',
                borderColor: '#e91e63',
                borderWidth: 2
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function initializeScrollAnimations() {
    const actSec = document.querySelector('#activity-chart')?.closest('.chart-section');
    const likesSec = document.querySelector('#likes-chart')?.closest('.chart-section');
    if (!actSec || !likesSec) return;

    const actData = [240, 140, 120, 320, 350, 410, 350];
    const likesData = [450, 620, 780, 890, 1020, 1150];
    let actDone = false, likesDone = false;

    window.addEventListener('scroll', () => {
        if (!actDone && isInViewport(actSec)) { animateChart(activityChart, actData); actDone = true; }
        if (!likesDone && isInViewport(likesSec)) { animateChart(likesChart, likesData); likesDone = true; }
    });
}

function isInViewport(el) {
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
}

function animateChart(chart, target) {
    let step = 0;
    const total = 60;
    const interval = setInterval(() => {
        step++;
        const progress = step / total;
        chart.data.datasets[0].data = target.map(v => Math.floor(v * progress));
        chart.update('none');
        if (step >= total) {
            clearInterval(interval);
            chart.data.datasets[0].data = target;
            chart.update();
        }
    }, 2000 / total);
}

// ==================== FEEDBACK + REVIEWS ====================
function initializeFeedbackForm() {
    const form = document.getElementById('feedback-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('feedback-name').value.trim();
        const email = document.getElementById('feedback-email').value.trim();
        const message = document.getElementById('feedback-message').value.trim();
        const rating = document.getElementById('rating-value').value || 5;
        const phone = document.getElementById('phone')?.value || '';
        const quiz_name = document.getElementById('quiz_name')?.value || 'General Review';

        if (!name || !email || !message) return showToast('Fill all fields!', 'error');

        const fd = new FormData();
        fd.append('name', name); fd.append('email', email); fd.append('phone', phone);
        fd.append('quiz_name', quiz_name); fd.append('score', rating); fd.append('feedback', message);

        fetch('/submit', { method: 'POST', body: fd })
            .then(r => r.json())
            .then(d => {
                if (d.status === 'success') {
                    showToast('Thank you!');
                    form.reset();
                    document.getElementById('rating-value').value = '5';
                    updateStarDisplay(5);
                    loadReviews(); // AUTO REFRESH
                } else showToast('Error: ' + d.message, 'error');
            })
            .catch(() => showToast('Network error!', 'error'));
    });
}

function initializeStarRating() {
    const stars = document.querySelectorAll('.star');
    const val = document.getElementById('rating-value');
    if (!stars.length) return;

    stars.forEach(s => {
        s.addEventListener('click', () => { val.value = s.dataset.rating; updateStarDisplay(s.dataset.rating); });
        s.addEventListener('mouseenter', () => updateStarDisplay(s.dataset.rating));
    });
    document.querySelector('.star-rating')?.addEventListener('mouseleave', () => updateStarDisplay(val.value || 5));
    updateStarDisplay(5);
}

function updateStarDisplay(r) {
    document.querySelectorAll('.star').forEach((s, i) => s.classList.toggle('active', i < r));
}

// ==================== LOAD REVIEWS FROM DB (100% FIXED!) ====================
// YE FUNCTION REPLACE KARO (loadReviews)
function loadReviews() {
    fetch('/get-queue')
        .then(r => r.json())
        .then(queue => {
            const container = document.getElementById('reviewsContainer');
            if (!container) return;

            document.getElementById('reviewCount') && (document.getElementById('reviewCount').textContent = queue.length);

            if (queue.length === 0) {
                container.innerHTML = `<p style="text-align:center;opacity:0.7;">No reviews yet!</p>`;
                return;
            }

            container.innerHTML = queue.map((r, i) => `
                <div class="review-card" style="padding:5px; border:1px solid #ddd; border-radius:8px; margin-bottom:15px; animation-delay:${i*0.1}s;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;text-align:center; margin-left:210px;">
                        <div>
                            <div style="font-weight:bold;text-align:center">${r.name}</div>
                            <div style="font-size:0.9em; color:#666;text-align:center">${r.email}</div>
                            <div style="margin:5px 0;text-align:center;">Rating:
                                ${[...Array(5)].map((_,j) => `
                                    <svg class="${j<r.score?'star active':'star'}" style="width:16px;height:16px;display:inline-block;" viewBox="0 0 24 24">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="${j<r.score?'#FFD700':'#CCC'}" />
                                    </svg>
                                `).join('')}
                            </div>
                            <p style="margin:8px 0 0; line-height:1.5;">${r.feedback}</p>
                            <small style="color:#888;">${new Date(r.created_at).toLocaleDateString()}</small>
                        </div>

                        <!-- SIRF FIRST REVIEW KO DUSTBIN -->
                        ${i === 0 ? `
                            <button onclick="deleteFirstReview(${r.id})" 
                                    style="background:none; border:none; cursor:pointer; font-size:1.4em; color:#e74c3c;"
                                    title="Delete First Review">
                                ❌
                            </button>
                        ` : ''}
                    </div>
                </div>
            `).join('');
        })
        .catch(err => console.error("Queue load error:", err));
}

// YE FUNCTION ADD KARO (deleteFirstReview)
function deleteFirstReview(id) {
    if (!confirm('Delete FIRST review?')) return;

    fetch('/delete-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    })
    .then(r => r.json())
    .then(d => {
        if (d.status === 'success') {
            showToast('First review deleted!');
            loadReviews();
        } else {
            showToast('Error', 'error');
        }
    });
}

function deleteReview(id) {
    if (!confirm('Delete?')) return;
    fetch('/delete-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    }).then(r => r.json()).then(d => {
        d.status === 'success' ? (showToast('Deleted'), loadReviews()) : showToast('Error');
    });
}

// ==================== ADMIN ====================
function checkAdminStatus() { isAdmin = localStorage.getItem('isAdmin') === 'true'; updateAdminUI(); }
function adminLogin() {
    const p = prompt('Password:') || '';
    if (p === 'dev123') { isAdmin = true; localStorage.setItem('isAdmin', 'true'); updateAdminUI(); loadReviews(); showToast('Admin ON'); }
    else showToast('Wrong!', 'error');
}
function adminLogout() { isAdmin = false; localStorage.removeItem('isAdmin'); updateAdminUI(); loadReviews(); showToast('Logged out'); }
function updateAdminUI() {
    ['adminLogin', 'adminLogout', 'warningBox'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle('hidden', id === 'adminLogin' ? isAdmin : !isAdmin);
    });
}

// ==================== TOAST ====================
function showToast(msg, type = 'success') {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.className = `toast show ${type}`;
    setTimeout(() => t.classList.remove('show'), 3000);
}

// ==================== QUIZ ====================
function initializeQuiz() { /* Your quiz code */ }

   fetch('/get-queue')
        .then(response => response.json())
        .then(data => {
            const list = document.getElementById('reviews-list');
            data.forEach(review => {
                const li = document.createElement('li');
                li.textContent = `${review.name}: ${review.feedback}`;
                list.appendChild(li);
            });
        });
    