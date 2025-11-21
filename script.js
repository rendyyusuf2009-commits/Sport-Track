// 1. STATE DATA (Simpan di Memory Browser)
let activities = [
    { id: 1, type: 'Lari', duration: 30, calories: 300, intensity: 'High', date: '21 Nov' },
    { id: 2, type: 'Gym', duration: 45, calories: 220, intensity: 'Medium', date: '20 Nov' }
];

let challenges = [
    { id: 1, title: 'Bakar 1000 Kalori', target: 1000, current: 520, unit: 'kcal', type: 'calories' },
    { id: 2, title: 'Lari 60 Menit Total', target: 60, current: 30, unit: 'menit', type: 'duration_Lari' }
];

let myChart; // Variabel Global untuk Chart

// 2. FUNGSI RENDER (Menampilkan Data ke Layar)
function renderStats() {
    const totalCal = activities.reduce((acc, curr) => acc + curr.calories, 0);
    const totalDur = activities.reduce((acc, curr) => acc + curr.duration, 0);
    
    document.getElementById('totalCalories').innerText = totalCal + ' kcal';
    document.getElementById('totalDuration').innerText = totalDur + ' min';
    document.getElementById('totalActivities').innerText = activities.length;
}

function renderChallenges() {
    const list = document.getElementById('challengeList');
    list.innerHTML = ''; 

    challenges.forEach(ch => {
        // Hitung Persen Progress
        let percent = Math.min((ch.current / ch.target) * 100, 100);
        let statusColor = percent >= 100 ? 'var(--neon-green)' : 'var(--neon-cyan)';
        let statusText = percent >= 100 ? 'Selesai! 🎉' : `${ch.current} / ${ch.target} ${ch.unit}`;

        const html = `
            <div class="challenge-item" style="border-left-color: ${statusColor}">
                <div style="display:flex; justify-content:space-between; font-size:0.9rem; font-weight:bold;">
                    <span>${ch.title}</span>
                    <span style="color:${statusColor}">${statusText}</span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${percent}%; background: ${statusColor}"></div>
                </div>
            </div>
        `;
        list.innerHTML += html;
    });
}

function renderHistory() {
    const list = document.getElementById('historyList');
    list.innerHTML = '';
    
    // Tampilkan 5 data terakhir (reverse agar yg baru diatas)
    [...activities].reverse().forEach(act => {
        // Tentukan Icon Berdasarkan Jenis
        let icon = 'fa-person-running';
        if(act.type === 'Sepeda') icon = 'fa-bicycle';
        if(act.type === 'Gym') icon = 'fa-dumbbell';
        if(act.type === 'Renang') icon = 'fa-person-swimming';
        if(act.type === 'Yoga') icon = 'fa-spa';

        const html = `
            <div class="history-item">
                <div style="display:flex; align-items:center; gap:15px;">
                    <div style="width:40px; height:40px; background:#334155; border-radius:50%; display:flex; justify-content:center; align-items:center;">
                        <i class="fa-solid ${icon}" style="color:white;"></i>
                    </div>
                    <div>
                        <h4 style="font-size:0.9rem;">${act.type}</h4>
                        <span style="font-size:0.75rem; color:var(--text-muted);">${act.date} • ${act.intensity}</span>
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="font-weight:bold; color:var(--neon-orange);">+${act.calories}</div>
                    <div style="font-size:0.8rem; color:var(--text-muted);">${act.duration}m</div>
                </div>
            </div>
        `;
        list.innerHTML += html;
    });
}

function renderChart() {
    const ctx = document.getElementById('activityChart').getContext('2d');
    
    // Siapkan data 5 terakhir untuk grafik
    const dataSlice = activities.slice(-5);
    const labels = dataSlice.map(a => a.type);
    const dataValues = dataSlice.map(a => a.calories);

    if (myChart) myChart.destroy(); // Hapus chart lama agar tidak menumpuk

    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Kalori',
                data: dataValues,
                backgroundColor: '#f97316',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, grid: { color: '#334155' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

// 3. LOGIC INPUT DATA & EVENT LISTENER
function setIntensity(level, el) {
    document.getElementById('intensityInput').value = level;
    document.querySelectorAll('.btn-option').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
}

document.getElementById('activityForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Mencegah halaman reload

    const type = document.getElementById('typeInput').value;
    const duration = parseInt(document.getElementById('durationInput').value);
    const intensity = document.getElementById('intensityInput').value;

    // Hitung Kalori (Rumus Sederhana)
    let multiplier = 5;
    if (intensity === 'Low') multiplier = 3;
    if (intensity === 'High') multiplier = 8;
    const calories = duration * multiplier;

    // Tambah Data Baru ke Array
    const newActivity = {
        id: Date.now(),
        type: type,
        duration: duration,
        calories: calories,
        intensity: intensity,
        date: 'Hari ini'
    };

    activities.push(newActivity);

    // Update Challenge (Fitur Pintar)
    challenges.forEach(ch => {
        if (ch.type === 'calories') ch.current += calories;
        if (ch.type === `duration_${type}`) ch.current += duration;
    });

    // Refresh Tampilan
    renderStats();
    renderChallenges();
    renderHistory();
    renderChart();

    // Reset Form
    this.reset();
    setIntensity('Medium', document.querySelectorAll('.btn-option')[1]);
    alert(`Berhasil! Kamu membakar ${calories} kalori 🔥`);
});

// 4. INITIALIZE (Jalankan saat halaman dibuka)
renderStats();
renderChallenges();
renderHistory();
setTimeout(renderChart, 500); // Delay sedikit agar Chart.js siap
