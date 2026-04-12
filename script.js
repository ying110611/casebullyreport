// --- 核心工具：获取数据 (统一使用 'incidents' 作为键名) ---
function getReports() {
    const data = localStorage.getItem('incidents');
    return data ? JSON.parse(data) : [];
}

// --- 1. 提交报告逻辑 (用于 report.html) ---
const reportForm = document.getElementById('bullyForm');
if (reportForm) {
    reportForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const reports = getReports();
        
        // 获取选中的严重程度
        const severityChecked = document.querySelector('input[name="severity"]:checked');
        
        const newCase = {
            id: Date.now(),
            aggressor: document.getElementById('aggressorName').value, // 统一叫 aggressor
            date: document.getElementById('incidentDate').value,
            severity: severityChecked ? severityChecked.value : 'Mild',
            description: document.getElementById('description') ? document.getElementById('description').value : '',
            type: "Bullying" // 给一个默认类型
        };
        
        reports.push(newCase);
        localStorage.setItem('incidents', JSON.stringify(reports));
        
        alert("Case Submitted Successfully!");
        window.location.href = 'dashboard.html';
    });
}

// --- 2. 统计数据与清空逻辑 (用于 stats.html) ---
if (window.location.pathname.includes('stats.html')) {
    const reports = getReports();
    const stats = { Mild: 0, Moderate: 0, Severe: 0 };
    
    reports.forEach(r => {
        if (stats[r.severity] !== undefined) stats[r.severity]++;
    });
    
    const total = reports.length;

    // 更新页面上的数字
    if(document.getElementById('totalCount')) {
        document.getElementById('totalCount').innerText = total;
        document.getElementById('mildCount').innerText = stats.Mild;
        document.getElementById('moderateCount').innerText = stats.Moderate;
        document.getElementById('severeCount').innerText = stats.Severe;

        // 动画显示进度条
        setTimeout(() => {
            if (total > 0) {
                if(document.getElementById('mildBar')) document.getElementById('mildBar').style.width = (stats.Mild / total * 100) + '%';
                if(document.getElementById('moderateBar')) document.getElementById('moderateBar').style.width = (stats.Moderate / total * 100) + '%';
                if(document.getElementById('severeBar')) document.getElementById('severeBar').style.width = (stats.Severe / total * 100) + '%';
            }
        }, 100);
    }

    // --- 清空逻辑 ---
    const resetBtn = document.getElementById('clearDataBtn');
    if (resetBtn) {
        resetBtn.onclick = function() {
            if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
                localStorage.removeItem('incidents'); 
                alert("Data Cleared!");
                window.location.reload(); 
            }
        };
    }
}

// --- 3. 名单显示与标红逻辑 (用于 aggressornamelist.html) ---
if (window.location.pathname.includes('aggressornamelist.html')) {
    const reports = getReports();
    const table = document.getElementById('aggressorTableBody');
    const recordCountText = document.getElementById('recordCount');

    if (table) {
        if (recordCountText) recordCountText.innerText = `${reports.length} Records Found`;
        
        table.innerHTML = ""; 
        
        if (reports.length === 0) {
            table.innerHTML = '<tr><td colspan="5" class="py-10 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No records available</td></tr>';
        } else {
            reports.forEach((item, index) => {
                // 判断是否需要标红 (如果同一个名字出现多次)
                const occurrence = reports.filter(r => r.aggressor === item.aggressor).length;
                const isCritical = occurrence >= 3;

                const row = `
                    <tr class="hover:bg-gray-50 transition-colors ${isCritical ? 'bg-red-50' : ''}">
                        <td class="px-8 py-6 font-bold ${isCritical ? 'text-red-700' : 'text-gray-700'}">${item.aggressor}</td>
                        <td class="px-8 py-6 text-sm text-gray-500">${item.type || 'Bullying'}</td>
                        <td class="px-8 py-6">
                            <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                item.severity === 'Severe' ? 'bg-red-100 text-red-600' : 
                                item.severity === 'Moderate' ? 'bg-amber-100 text-amber-600' : 
                                'bg-green-100 text-green-600'
                            }">
                                ${item.severity}
                            </span>
                        </td>
                        <td class="px-8 py-6 text-sm text-gray-400">${item.date}</td>
                        <td class="px-8 py-6 text-right">
                            <button onclick="deleteRecord(${index})" class="bg-red-100 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all">
                                Delete
                            </button>
                        </td>
                    </tr>`;
                table.innerHTML += row;
            });
        }
    }
}

// 删除单条记录的全局函数
window.deleteRecord = function(index) {
    if (confirm("Delete this record?")) {
        let reports = JSON.parse(localStorage.getItem('incidents')) || [];
        reports.splice(index, 1);
        localStorage.setItem('incidents', JSON.stringify(reports));
        window.location.reload();
    }
};