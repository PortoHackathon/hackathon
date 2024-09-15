let myChartPrevisao;  // Declare a variável globalmente para acessar em várias funções
let myChartRaps;

document.querySelector('form').addEventListener('submit', function(e) {
    e.preventDefault();  // Impede o recarregamento da página
    
    // Exibe o toast
    let toastEl = document.getElementById('successToast');
    let toast = new bootstrap.Toast(toastEl);
    toast.show();

    // Salva o telefone no LocalStorage
    let phoneValue = document.getElementById('telefone').value;
    localStorage.setItem('telefone', phoneValue);
});

// Preenche o campo com o valor salvo, se houver
document.addEventListener('DOMContentLoaded', () => {
    let savedPhone = localStorage.getItem('telefone');
    if (savedPhone) {
        document.getElementById('telefone').value = savedPhone;
    }
});

document.addEventListener("DOMContentLoaded", () => {
    fetchRAPsFile();
    fetchPrevisaoFile();

    setInterval(() => {
        fetchRAPsFile();
        fetchPrevisaoFile();
    }, 10000);
});

document.getElementById('btnRAPs').addEventListener('click', function () {
    document.getElementById('contentRAPs').classList.add('active');
    document.getElementById('btnRAPs').classList.add('active');
    document.getElementById('contentPrevisao').classList.remove('active');
    document.getElementById('btnPrevisao').classList.remove('active');
});

document.getElementById('btnPrevisao').addEventListener('click', function () {
    document.getElementById('contentPrevisao').classList.add('active');
    document.getElementById('btnPrevisao').classList.add('active');
    document.getElementById('contentRAPs').classList.remove('active');
    document.getElementById('btnRAPs').classList.remove('active');
});

// RAPs
async function fetchRAPsFile() {
    await fetch('https://e8f5-201-93-183-173.ngrok-free.app/validar_pasta_ecac', {
        headers: {
            'ngrok-skip-browser-warning': 'true'
        }
    })
        .then(response => response.json())
        .then(data => {
            populateTablesRAPs(data);
        })
        .catch(error => console.error('Error fetching data:', error));
}

function populateTablesRAPs(data) {
    let erros = data.erro;
    let sucesso = data.sucesso;
    let nao_encontradas = data.nao_encontradas;

    addListErro(erros);
    addListSucesso(sucesso);
    addListNaoEncontrado(nao_encontradas);

    // Conta os itens para cada status
    const countErros = erros.length;
    const countSucesso = sucesso.length;
    const countNaoEncontrado = nao_encontradas.length;


    getAndCompareCountsRapsLocalStorage(countErros, countNaoEncontrado);
    saveCountsRapsLocalStorage(countErros, countNaoEncontrado);

    // Atualiza o gráfico com os dados
    updateChart(countErros, countSucesso, countNaoEncontrado);
    showCountRaps(countErros, countSucesso, countNaoEncontrado);
}

function getAndCompareCountsRapsLocalStorage(countErros, countNaoEncontrado) {
    const countErrosLocal = parseInt(localStorage.getItem('countErrosRaps')) || 0;
    const countNaoEncontradoLocal = parseInt(localStorage.getItem('countNaoEncontradoRaps')) || 0;

    console.log(countErros, countErrosLocal);

    console.log(countNaoEncontrado, countNaoEncontradoLocal);

    const telefone = localStorage.getItem('telefone');

    const errosChanged = countErros !== countErrosLocal || countErros > countErrosLocal;
    const naoEncontradoChanged = countNaoEncontrado !== countNaoEncontradoLocal || countNaoEncontrado > countNaoEncontradoLocal;

    // console.log(errosChanged, naoEncontradoChanged);

    if (errosChanged || naoEncontradoChanged) {
        const message = `Erros: ${countErros}, Não Enviado: ${countNaoEncontrado}`;
        
        window.electron.notify(message);

        if(telefone) {
            fetch(`http://127.0.0.1:5000/validar_pasta_ecac?phone_number=${telefone}`);
        }
    }
}

function saveCountsRapsLocalStorage(countErros, countNaoEncontrado) {
    localStorage.setItem('countErrosRaps', countErros);
    localStorage.setItem('countNaoEncontradoRaps', countNaoEncontrado);
}

function showCountRaps(countErros, countSucesso, countNaoEncontrado) {
    let erro = document.querySelector('#erro-tab');
    let sucesso = document.querySelector('#sucesso-tab');
    let naoEncontrado = document.querySelector('#nao-enviado-tab');

    erro.innerHtml = `
    <span class="badge bg-danger">${countErros}</span>
    `;

    sucesso.innerHtml = `
    <span class="badge bg-success">${countSucesso}</span>
    `;

    naoEncontrado.innerHtml = `
    <span class="badge bg-warning">${countNaoEncontrado}</span>
    `;
}

function addListErro(erros) {
    let tbodyErro;
    let details;

    tbodyErro = document.querySelector('#contentRAPs #tbody-erro');
    tbodyErro.innerHTML = '';

    erros.forEach(arquivo => {
        tbodyErro.insertAdjacentHTML('beforeend', `
        <tr>
            <td>${arquivo.nome_arquivo}</td>
            <td><span class="badge bg-danger">Erro</span></td>
            <td>${arquivo.detalhe_erro}</td>
            <td><button class="btn btn-primary" type="button" data-bs-toggle="collapse"
                    data-bs-target="#${arquivo.nome_arquivo}" aria-expanded="false"
                    aria-controls="${arquivo.nome_arquivo}">Detalhes</button>
            </td>
        </tr>
        <tr class="collapse" id="${arquivo.nome_arquivo}">
            <td colspan="6">
                <div class="p-3 bg-light">
                    <h5>Detalhes do Arquivo ${arquivo.nome_arquivo}</h5>
                        <table class="table table-bordered mt-3">
                            <thead class="table-dark">
                                <tr>
                                    <th>Nome do Navio</th>
                                    <th>Status</th>
                                    <th>Detalhe do Erro</th>
                                </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        </table>
                </div>
            </td>
        </tr>
        `);

        arquivo.navios.forEach(navio => {
            details = document.getElementById(`${arquivo.nome_arquivo}`);
            details = details.querySelector('tbody');

            details.insertAdjacentHTML('beforeend', `
        <tr>
            <td>${navio.nome_navio ?? '-'}</td>
            <td>${navio.status ?? '-'}</td>
            <td>${navio.detalhe_erro ?? '-'}</td>
        </tr>
        `);
        });
    });
}

function addListSucesso(sucesso) {
    let tbodySucesso;

    tbodySucesso = document.querySelector('#contentRAPs #tbody-sucesso');
    tbodySucesso.innerHTML = '';

    sucesso.forEach(arquivo => {
        tbodySucesso.insertAdjacentHTML('beforeend', `
        <tr>
            <td>${arquivo.nome_arquivo ?? '-'}</td>
            <td><span class="badge bg-success">Sucesso</span></td>
        </tr>
        `);
    });
}

function addListNaoEncontrado(nao_encontrado) {
    let tbodyNaoEncontrado;

    tbodyNaoEncontrado = document.querySelector('#contentRAPs #tbody-nao-encontrado');
    tbodyNaoEncontrado.innerHTML = '';

    nao_encontrado.forEach(arquivo => {
        tbodyNaoEncontrado.insertAdjacentHTML('beforeend', `
        <tr>
            <td>${arquivo.nomenavio ?? '-'}</td>
            <td><span class="badge bg-warning">Não Enviado</span></td>
            <td>${arquivo.viagem ?? '-'}</td>
        </tr>
        `);
    });
}

function updateChart(errosCount, sucessoCount, naoEncontradoCount) {
    const ctx = document.getElementById('chartRAP').getContext('2d');

    if (myChartRaps) {
        myChartRaps.destroy();
    }

    const data = {
        labels: ['Arquivos Corretos', 'Arquivos com Erro', 'Arquivos Não Enviados'],
        datasets: [{
            label: 'Status de Processamento de Arquivos',
            data: [sucessoCount, errosCount, naoEncontradoCount],  // Atualiza com os valores contados
            backgroundColor: [
                'rgba(75, 192, 192, 0.2)',  // Cor para "corretos"
                'rgba(255, 99, 132, 0.2)',  // Cor para "com erro"
                'rgba(255, 206, 86, 0.2)'   // Cor para "não enviados"
            ],
            hoverOffset: 4
        }]
    };

    const config = {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    enabled: true
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Status de Arquivos'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Número de Arquivos'
                    }
                }
            }
        },
    };

    myChartRaps = new Chart(ctx, config);
}


// Previsão

async function fetchPrevisaoFile() {
    await fetch('https://e8f5-201-93-183-173.ngrok-free.app/validar_pasta_eaped', {
        headers: {
            'ngrok-skip-browser-warning': 'true'
        }
    })
        .then(response => response.json())
        .then(data => {
            populateTablesPrevisao(data);
        })
        .catch(error => console.error('Error fetching data:', error));
}

function populateTablesPrevisao(data) {
    let erros = data.erro;
    let sucesso = data.sucesso;

    addListErroPrevisao(erros);
    addListSucessoPrevisao(sucesso);

    // // Conta os itens para cada status
    const countErros = erros.length;
    const countSucesso = sucesso.length;

    getAndCompareCountsPrevisaoLocalStorage(countErros);
    saveCountsPrevisaoLocalStorage(countErros);

    // // Atualiza o gráfico com os dados
    updateChartPrevisao(countErros, countSucesso);
    showCountPrevisao(countErros, countSucesso);
}

function getAndCompareCountsPrevisaoLocalStorage(countErros) {
    const countErrosLocal = parseInt(localStorage.getItem('countErrosPrevisao')) || 0;

    const telefone = localStorage.getItem('telefone');

    const errosChanged = countErros !== countErrosLocal || countErros > countErrosLocal;

    console.log(errosChanged);

    if (errosChanged) {
        const message = `Erros: ${countErros}`;
        window.electron.notify(message);

        if(telefone) {
            fetch(`http://127.0.0.1:5000/validar_pasta_ecac?phone_number=${telefone}`);
        }
    }
}

function saveCountsPrevisaoLocalStorage(countErros, countSucesso) {
    localStorage.setItem('countErrosPrevisao', countErros);
}

function showCountPrevisao(countErros, countSucesso) {
    let erro = document.querySelector('#erroPrevisao-tab');
    let sucesso = document.querySelector('#sucessoPrevisao-tab');

    erro.innerHtml = `
    <span class="badge bg-danger">${countErros}</span>
    `;

    sucesso.innerHtml = `
    <span class="badge bg-success">${countSucesso}</span>
    `;
}

function addListErroPrevisao(erros) {
    let tbodyErro;
    let details;

    tbodyErro = document.querySelector('#contentPrevisao #tbody-erro');
    tbodyErro.innerHTML = '';

    erros.forEach(arquivo => {
        tbodyErro.insertAdjacentHTML('beforeend', `
        <tr>
            <td>${arquivo.nome_arquivo}</td>
            <td><span class="badge bg-danger">Erro</span></td>
            <td>${arquivo.detalhe_erro}</td>
            <td><button class="btn btn-primary" type="button" data-bs-toggle="collapse"
                    data-bs-target="#${arquivo.nome_arquivo}" aria-expanded="false"
                    aria-controls="${arquivo.nome_arquivo}">Detalhes</button>
            </td>
        </tr>
        <tr class="collapse" id="${arquivo.nome_arquivo}">
            <td colspan="6">
                <div class="p-3 bg-light">
                    <h5>Detalhes do Arquivo ${arquivo.nome_arquivo}</h5>
                        <table class="table table-bordered mt-3">
                            <thead class="table-dark">
                                <tr>
                                    <th>Viagem</th>
                                    <th>Status</th>
                                    <th>Detalhe do Erro</th>
                                </tr>
                            </thead>
                            <tbody>
                            </tbody>
                        </table>
                </div>
            </td>
        </tr>
        `);

        arquivo.atracacoes.forEach(atracacao => {
            details = document.getElementById(`${arquivo.nome_arquivo}`);
            details = details.querySelector('tbody');

            details.insertAdjacentHTML('beforeend', `
        <tr>
            <td>${atracacao.viagem ?? '-'}</td>
            <td>${atracacao.status ?? '-'}</td>
            <td>${atracacao.detalhe_erro ?? '-'}</td>
        </tr>
        `);
        });
    });
}

function addListSucessoPrevisao(sucesso) {
    let tbodySucesso;

    tbodySucesso = document.querySelector('#contentPrevisao #tbody-sucesso');
    tbodySucesso.innerHTML = '';

    sucesso.forEach(arquivo => {
        tbodySucesso.insertAdjacentHTML('beforeend', `
        <tr>
            <td>${arquivo.nome_arquivo ?? '-'}</td>
            <td><span class="badge bg-success">Sucesso</span></td>
        </tr>
        `);
    });
}

function updateChartPrevisao(errosCount, sucessoCount, naoEncontradoCount) {
    const ctx = document.getElementById('chartPrevisao').getContext('2d');

    if (myChartPrevisao) {
        myChartPrevisao.destroy();
    }

    const data = {
        labels: ['Arquivos Corretos', 'Arquivos com Erro'],
        datasets: [{
            label: 'Status de Processamento de Arquivos',
            data: [sucessoCount, errosCount],  // Atualiza com os valores contados
            backgroundColor: [
                'rgba(75, 192, 192, 0.2)',  // Cor para "corretos"
                'rgba(255, 99, 132, 0.2)',  // Cor para "com erro"
            ],
            hoverOffset: 4
        }]
    };

    const config = {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    enabled: true
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Status de Arquivos'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Número de Arquivos'
                    }
                }
            }
        },
    };

    myChartPrevisao = new Chart(ctx, config);
}