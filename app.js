/*
  ========================================
  LÓGICA DA APLICAÇÃO (JavaScript Moderno & Profissional)
  ========================================
  Melhorias:
  - Geração dinâmica de anos.
  - Formatação de moeda com Intl.
  - Validação robusta.
*/

class Despesa {
	constructor(ano, mes, dia, tipo, descricao, valor) {
		this.ano = ano;
		this.mes = mes;
		this.dia = dia;
		this.tipo = tipo;
		this.descricao = descricao;
		this.valor = valor;
	}

	validarDados() {
		for (let i in this) {
			if (this[i] == undefined || this[i] == '' || this[i] == null) {
				return false;
			}
		}
		return true;
	}
}

class Bd {
	constructor() {
		let id = localStorage.getItem('id');
		if (id === null) {
			localStorage.setItem('id', 0);
		}
	}

	getProximoId() {
		let proximoId = localStorage.getItem('id');
		return parseInt(proximoId) + 1;
	}

	gravar(d) {
		let id = this.getProximoId();
		localStorage.setItem(id, JSON.stringify(d));
		localStorage.setItem('id', id);
	}

	recuperarTodosRegistros() {
		let despesas = [];
		let id = localStorage.getItem('id');

		for (let i = 1; i <= id; i++) {
			let despesa = JSON.parse(localStorage.getItem(i));
			if (despesa === null) continue;
			despesa.id = i;
			despesas.push(despesa);
		}
		return despesas;
	}

	pesquisar(despesa) {
		let despesasFiltradas = this.recuperarTodosRegistros();

		if (despesa.ano != '') despesasFiltradas = despesasFiltradas.filter(d => d.ano == despesa.ano);
		if (despesa.mes != '') despesasFiltradas = despesasFiltradas.filter(d => d.mes == despesa.mes);
		if (despesa.dia != '') despesasFiltradas = despesasFiltradas.filter(d => d.dia == despesa.dia);
		if (despesa.tipo != '') despesasFiltradas = despesasFiltradas.filter(d => d.tipo == despesa.tipo);
		if (despesa.descricao != '') despesasFiltradas = despesasFiltradas.filter(d => d.descricao == despesa.descricao);
		if (despesa.valor != '') despesasFiltradas = despesasFiltradas.filter(d => d.valor == despesa.valor);

		return despesasFiltradas;
	}

	remover(id) {
		localStorage.removeItem(id);
	}
}

const bd = new Bd();

/*
  ========================================
  FUNÇÕES UTILITÁRIAS (Helpers)
  ========================================
*/

// Carrega os anos dinamicamente no select
function carregarAnos() {
	const selectAno = document.getElementById('ano');
	if (!selectAno) return; // Se não estiver na página que tem esse campo, sai.

	const anoAtual = new Date().getFullYear();
	const anoInicio = anoAtual - 10; // Ano de início do projeto ou arbitrário
	const anoFim = anoAtual;

	// Limpa opções existentes (mantendo a primeira "Ano")
	selectAno.innerHTML = '<option value="">Ano</option>';

	// Loop reverso para mostrar o ano atual primeiro
	for (let i = anoFim; i >= anoInicio; i--) {
		const option = document.createElement('option');
		option.value = i;
		option.text = i;
		selectAno.add(option);
	}
}

// Formata valor para moeda brasileira (BRL)
function formatarMoeda(valor) {
	return new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'BRL'
	}).format(valor);
}

/*
  ========================================
  FUNÇÕES DE INTERFACE (UI)
  ========================================
*/

// Inicialização da página
document.addEventListener('DOMContentLoaded', () => {
	carregarAnos();

	// Se estiver na página de consulta, carrega a lista
	if (document.getElementById('listaDespesas')) {
		carregaListaDespesas();
	}
});

function cadastrarDespesa() {
	const ano = document.getElementById('ano');
	const mes = document.getElementById('mes');
	const dia = document.getElementById('dia');
	const tipo = document.getElementById('tipo');
	const descricao = document.getElementById('descricao');
	const valor = document.getElementById('valor');

	const despesa = new Despesa(
		ano.value,
		mes.value,
		dia.value,
		tipo.value,
		descricao.value.trim(),
		valor.value
	);

	if (despesa.validarDados()) {
		bd.gravar(despesa);
		mostrarModal(true, 'Sucesso!', 'Despesa cadastrada com sucesso.');

		// Limpa campos
		ano.value = '';
		mes.value = '';
		dia.value = '';
		tipo.value = '';
		descricao.value = '';
		valor.value = '';
	} else {
		mostrarModal(false, 'Erro!', 'Preencha todos os campos corretamente.');
	}
}

function carregaListaDespesas(despesas = [], filtro = false) {
	if (despesas.length == 0 && filtro == false) {
		despesas = bd.recuperarTodosRegistros();
	}

	const listaDespesas = document.getElementById('listaDespesas');
	listaDespesas.innerHTML = '';

	despesas.forEach(function (d) {
		const linha = listaDespesas.insertRow();

		linha.insertCell(0).innerHTML = `${d.dia}/${d.mes}/${d.ano}`;

		switch (d.tipo) {
			case '1': d.tipo = 'Alimentação'; break;
			case '2': d.tipo = 'Educação'; break;
			case '3': d.tipo = 'Lazer'; break;
			case '4': d.tipo = 'Saúde'; break;
			case '5': d.tipo = 'Transporte'; break;
		}
		linha.insertCell(1).innerHTML = d.tipo;
		linha.insertCell(2).innerHTML = d.descricao;

		// Uso da formatação profissional
		linha.insertCell(3).innerHTML = formatarMoeda(d.valor);

		const btn = document.createElement('button');
		btn.className = 'btn btn-danger';
		btn.innerHTML = '<i class="fas fa-trash"></i>';
		btn.id = `id_despesa_${d.id}`;
		btn.onclick = function () {
			let id = this.id.replace('id_despesa_', '');
			bd.remover(id);
			window.location.reload();
		}
		linha.insertCell(4).append(btn);
	});
}

function pesquisarDespesa() {
	const ano = document.getElementById('ano').value;
	const mes = document.getElementById('mes').value;
	const dia = document.getElementById('dia').value;
	const tipo = document.getElementById('tipo').value;
	const descricao = document.getElementById('descricao').value;
	const valor = document.getElementById('valor').value;

	const despesa = new Despesa(ano, mes, dia, tipo, descricao, valor);
	const despesas = bd.pesquisar(despesa);

	carregaListaDespesas(despesas, true);
}

function mostrarModal(sucesso, titulo, mensagem) {
	const modal = document.getElementById('modalRegistraDespesa');
	const tituloEl = document.getElementById('modal_titulo');
	const conteudoEl = document.getElementById('modal_conteudo');
	const btnEl = document.getElementById('modal_btn');

	tituloEl.innerHTML = titulo;
	conteudoEl.innerHTML = mensagem;

	if (sucesso) {
		tituloEl.className = 'text-success';
		btnEl.className = 'btn btn-primary';
	} else {
		tituloEl.className = 'text-danger';
		btnEl.className = 'btn btn-danger';
	}

	modal.classList.add('active');
}

function fecharModal() {
	const modal = document.getElementById('modalRegistraDespesa');
	modal.classList.remove('active');
}
