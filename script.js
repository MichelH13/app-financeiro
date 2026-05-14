let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let myChart;

function toggleModal() {
    document.getElementById('transaction-modal').classList.toggle('active');
}

function addTransaction() {
    const desc = document.getElementById('desc').value;
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;

    if (!desc || !amount) {
        alert("Por favor, preencha a descrição e o valor.");
        return;
    }

    const agora = new Date();
    // Formata a data (Ex: 14 Mai) e a hora (Ex: 20:45)
    const dataDisplay = agora.toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'});
    const horaDisplay = agora.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});

    transactions.push({
        id: Date.now(),
        desc,
        amount: parseFloat(amount),
        category,
        date: dataDisplay,
        time: horaDisplay
    });

    updateApp();
    toggleModal();
    document.getElementById('desc').value = '';
    document.getElementById('amount').value = '';
}

function updateApp() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    renderList();
    renderChart();
}

function renderList() {
    const list = document.getElementById('list');
    const balanceDisplay = document.getElementById('total-balance');
    const chartTotal = document.getElementById('chart-total');
    list.innerHTML = '';
    
    let total = 0;
    let totalGastos = 0;

    [...transactions].reverse().forEach(t => {
        const isEntrada = t.category === "Salario" || t.category === "Dinheiro Extra";
        
        const item = document.createElement('div');
        item.className = 't-item';
        item.innerHTML = `
            <div class="t-info">
                <strong>${t.desc}</strong>
                <span class="t-details">
                    ${t.category} • ${t.date} <span class="t-time">${t.time}</span>
                </span>
            </div>
            <div class="t-amount ${isEntrada ? 'positive' : 'negative'}">
                ${isEntrada ? '+' : '-'} R$ ${t.amount.toFixed(2)}
            </div>
        `;
        list.appendChild(item);
        
        total += isEntrada ? t.amount : -t.amount;
        if (!isEntrada) totalGastos += t.amount;
    });

    balanceDisplay.innerText = `R$ ${total.toFixed(2)}`;
    balanceDisplay.style.color = total >= 0 ? 'var(--success)' : 'var(--danger)';
    chartTotal.innerText = `R$ ${totalGastos.toFixed(2)}`;
}

function renderChart() {
    const ctx = document.getElementById('financeChart').getContext('2d');
    const categorias = ["Salario", "Dinheiro Extra", "Cartao de Credito", "Contas Fixas", "Mercado", "Padaria", "Farmacia", "Telefone", "Combustivel", "Outros"];
    const cores = ['#34c759', '#30b0c7', '#af52de', '#ff373b', '#0400f7', '#ff9500', '#ffcc00', '#007aff', '#ff2d55', '#8e8e93']; 

    const dados = categorias.map(cat => {
        return transactions
            .filter(t => t.category === cat)
            .reduce((sum, t) => sum + t.amount, 0);
    });

    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: dados,
                backgroundColor: cores,
                borderWidth: 0,
                borderRadius: 8,
                hoverOffset: 15
            }]
        },
        options: { 
            cutout: '82%', 
            plugins: { legend: { display: false } },
            animation: { animateRotate: true }
        }
    });
}

function clearAllData() {
    if (confirm("Deseja apagar todos os registros do mês?")) {
        transactions = [];
        updateApp();
    }
}

// Inicializa o sistema
updateApp();