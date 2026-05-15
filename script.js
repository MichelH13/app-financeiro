let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let myChart;

function toggleModal() { 
    document.getElementById('transaction-modal').classList.toggle('active'); 
}

function addTransaction() {
    const desc = document.getElementById('desc').value;
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    
    if (!desc || !amount) return alert("Preencha os campos!");

    transactions.push({
        id: Date.now(),
        desc,
        amount: parseFloat(amount),
        category,
        date: new Date().toLocaleDateString('pt-BR', {day:'2-digit', month:'short'}),
        time: new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})
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
    let total = 0, totalSaidas = 0;

    [...transactions].reverse().forEach(t => {
        const isEntrada = t.category === "Salario" || t.category === "Dinheiro Extra";
        const item = document.createElement('div');
        item.className = 't-item';
        item.innerHTML = `
            <div class="t-info">
                <strong>${t.desc}</strong>
                <span>${t.category} • ${t.date} às ${t.time}</span>
            </div>
            <div class="t-amount ${isEntrada ? 'positive' : 'negative'}">
                ${isEntrada ? '+' : '-'} R$ ${t.amount.toFixed(2)}
            </div>
        `;
        list.appendChild(item);
        total += isEntrada ? t.amount : -t.amount;
        if(!isEntrada) totalSaidas += t.amount;
    });

    balanceDisplay.innerText = `R$ ${total.toFixed(2)}`;
    chartTotal.innerText = `R$ ${totalSaidas.toFixed(2)}`;
}

function renderChart() {
    const ctx = document.getElementById('financeChart').getContext('2d');
    const categorias = ["Salario", "Cartao", "Mercado", "Combustivel", "Outros"]; // Simplificado para cores
    const coresAzuis = ['#00d4ff', '#0072ff', '#00c6ff', '#0052d4', '#4facfe']; 

    const dados = coresAzuis.map(() => Math.floor(Math.random() * 10) + 1); // Apenas visual

    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: transactions.length > 0 ? [1] : [1], // Placeholder para o círculo aparecer
                backgroundColor: coresAzuis,
                borderWidth: 0,
                borderRadius: 10
            }]
        },
        options: { cutout: '85%', plugins: { legend: { display: false } } }
    });
}

function baixarPDF() {
    const element = document.getElementById('list');
    const opt = {
        margin: 10,
        filename: 'extrato-michel.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, backgroundColor: '#0f172a' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
}

function clearAllData() { if(confirm("Deseja zerar o mês?")) { transactions = []; updateApp(); } }

updateApp();