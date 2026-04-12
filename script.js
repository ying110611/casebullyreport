// --- 核心工具：获取数据 ---
function getReports() {
    const data = localStorage.getItem('safeCampusReports');
    return data ? JSON.parse(data) : [];
}

// --- 1. 提交报告逻辑 (用于 report.html) ---
const reportForm = document.getElementById('bullyForm');
if (reportForm) {
    reportForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const reports = getReports();
        const newCase = {
            id: Date.now(),
            aggressorName: document.getElementById('aggressorName').value,
            date: document.getElementById('incidentDate').value,
            severity: document.querySelector('input[name="severity"]:checked').value,
            description: document.getElementById('description').value
        };
        reports.push(newCase);
        localStorage.setItem('safeCampusReports', JSON.stringify(reports));
        alert("Case Submitted!");
        window.location.href = 'dashboard.html';
    });
}

// --- 2. 统计数据与清空逻辑 (用于 stats.html) ---
if (window.location.pathname.includes('stats.html')) {
    const reports = getReports();
    const stats = { Mild: 0, Moderate: 0, Severe: 0 };
    
    reports.forEach(r => stats[r.severity]++);
    const total = reports.length;

    // 显示数字
    if(document.getElementById('totalCount')) {
        document.getElementById('totalCount').innerText = total;
        document.getElementById('mildCount').innerText = stats.Mild;
        document.getElementById('moderateCount').innerText = stats.Moderate;
        document.getElementById('severeCount').innerText = stats.Severe;

        // 动画显示进度条
        setTimeout(() => {
            if (total > 0) {
                document.getElementById('mildBar').style.width = (stats.Mild / total * 100) + '%';
                document.getElementById('moderateBar').style.width = (stats.Moderate / total * 100) + '%';
                document.getElementById('severeBar').style.width = (stats.Severe / total * 100) + '%';
            }
        }, 100);
    }

    // --- 清空逻辑 ---
    const resetBtn = document.getElementById('clearDataBtn');
    if (resetBtn) {
        resetBtn.onclick = function() {
            if (confirm("Are you sure you want to delete all 46 cases? This cannot be undone.")) {
                localStorage.removeItem('safeCampusReports'); // 删掉内存里的数据
                alert("Data Cleared!");
                window.location.reload(); // 刷新页面，数字就会变回0
            }
        };
    }
}

// --- 3. 名单标红逻辑 (用于 aggressornamelist.html) ---
if (window.location.pathname.includes('aggressornamelist.html')) {
    const reports = getReports();
    const table = document.getElementById('aggressorTableBody');
    if (table) {
        const counts = {};
        reports.forEach(r => counts[r.aggressorName] = (counts[r.aggressorName] || 0) + 1);
        
        table.innerHTML = ""; 
        Object.keys(counts).forEach(name => {
            const count = counts[name];
            const isRed = count >= 3;
            const row = `
                <tr style="${isRed ? 'background:#fee2e2' : ''}">
                    <td class="px-8 py-4 ${isRed ? 'text-red-700 font-bold' : ''}">${name}</td>
                    <td class="px-8 py-4">${count} Incidents</td>
                    <td class="px-8 py-4">${isRed ? '⚠️ CRITICAL' : 'Monitoring'}</td>
                </tr>`;
            table.innerHTML += row;
        });
    }
}