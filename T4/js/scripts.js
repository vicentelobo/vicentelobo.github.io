$(document).ready(function() {

	var numVar, numVarAntigo;
	var numRest, numRestAntigo;
	var numVarPadrao, numVarPadraoAntigo;
	var matrizIni = [];
	var matriz = [], copiaMatriz = [];
	var b = [], copiaB = [];
	var custos = [], copiaCustos = [];
	var base = [], copiaBase = [];
	var artificiais = [], copiaArtificiais = [];
	var listaBases = [], copiaListaBases = [];
	var custoReduzido = [];
	var bsobrea = [];
	var solucao = [];
	var folga = [];
	var tipoProblema;
	var sainte, entrante, fimSimplex;
	var variaveisInteiras = [];
	var maiorCusto = 0;
	var novaIteracao;

	var funcao = [];
	var sinal = [], copiaSinal = [];

	var maiorSolucaoInteira = Number.NEGATIVE_INFINITY;
	var solucoesInteiras = [], folgasInteiras = [];
	var contador = 0;
	var nivel = 0;

	$div_f = $('#func');
	$div_m = $('#matriz');
	$div_vi = $('#inteiras');
	$tab = $('#tabelas');

	$('#resultado').collapse('hide');

	atualiza();


	$('#numVar, #numRest').on('click change', function() {
		numVarAntigo = 0
		numRestAntigo = 0;
		salvaCampos(funcao);
		atualiza();
		preencheCampos();
	});

function salvaCampos() {
	funcao = [];
	matrizIni = [];
	b = [];
	sinal = [];
	variaveisInteiras = [];

	for(var i = 0; i < numRest; i++) {
		b[i] = parseFloat($('#matriz').find('div').eq(i).find('input').last().val());
		matrizIni[i] = [];

		for(var j = 0; j < numVar+1; j++)
			if(j < numVar) {
				funcao.push($('#func').find('input').eq(j).val());
				variaveisInteiras.push($('#vi'+j).is(":checked"));
				matrizIni[i].push($('#matriz').find('div').eq(i).find('input').eq(j).val());
			}
			else {
				sinal.push($('#signal'+i).prop('selectedIndex'));
		}
	}
}


function atualiza() {
	numVarAntigo = numVar;
	numRestAntigo = numRest;

	numVar = parseInt($('#numVar').val(), 10);
	numRest = parseInt($('#numRest').val(), 10);

	escreveFuncao();
	desenhaSistema();
}

function preencheCampos() {
	for(var i = 0; i < numRestAntigo; i++) {
		$('#matriz').find('div').eq(i).find('input').last().val(b[i] == 0 ? "" : b[i]);

		for(var j = 0; j < numVarAntigo+1; j++) {
			if(j < numVarAntigo) {
				$('#func').find('input').eq(j).val(funcao[j] == 0 ? "" : funcao[j]);
				$('#vi'+j).prop('checked', variaveisInteiras[j]);
				$('#matriz').find('div').eq(i).find('input').eq(j).val(matrizIni[i][j] == 0 ? "" : matrizIni[i][j]);
			}
			else {
				$('#signal'+i+' option:eq('+sinal[i]+')').prop('selected', true);
				$('#signal'+i).change();
			}
		}
	}
}

function escreveFuncao() {
	$div_f.empty();
	$div_vi.empty();

	$div_f.append('z = ');
	for(var j = 0; j<numVar; j++){
		$div_f.append('<label for="cell"><input type="number" id="f'+j+'" class="cell" placeholder="0" required><span class="spaced">.x<sub>'+(j+1)+ '</sub></span></label>');
		$div_vi.append('<label class="checkbox-inline"><input type="checkbox" id="vi'+j+'" value="">x<sub>'+(j+1)+'</sub>&nbsp;&nbsp;</label>')
		if(j < numVar-1)
			$div_f.append(' + ');
	}

}

function desenhaSistema(){

	$div_m.empty();

	for(var i = 0; i<numRest; i++){
		$row1 = $('<div class="col-sm-12" id="l'+i+'"></div>');
		for(var j = 0; j<numVar; j++){
			if(j < numVar-1)
				$row1.append('<label><input type="number" id="m'+i+','+j+'" class="cell" placeholder="0" required><span>.x<sub>'+(j+1)+ '</sub> + </span></label>&nbsp;');
			else{
				$row1.append('&nbsp;<label><input type="number" id="m'+i+','+j+'" class="cell" placeholder="0" required><span>.x<sub>'+(j+1)+ '</sub></span></label>');
				$row1.append('&nbsp;<select class="cell" id="signal'+i+'"><option selected>&le;</option><option>=</option><option>&ge;</option></select>')
				$row1.append('&nbsp;<label><input type="number" id="b'+i+'" class="cell" placeholder="0" required>&nbsp;<span>(b<sub>' + (i+1) +' </sub>)</span></label>');
			}
		}
		$div_m.append($row1);
	}
	$last_row = $('<div class="col-sm-12"><strong>x</strong> &ge; 0</div>');
	$div_m.append($last_row);
}

function leVariaveisInteiras() {
	variaveisInteiras = [];
	for(var i = 0; i < numVar; i++)
		variaveisInteiras.push($('#vi'+i).is(":checked"));
}

function formaPadrao() {
	preencheZero();

	matriz = [];
	matrizIni = [];
	signal = [];
	b = [];

	for(var i = 0; i < numRest; i++) {
		matrizIni[i] = [];
		for(var j = 0; j < numVar+1; j++) {
			if(j < numVar) {
				matrizIni[i][j] = parseFloat($('#matriz').find('div').eq(i).find('input').eq(j).val());
			}
			else {
				matrizIni[i][j] = $('#matriz').find('div').eq(i).find('select').first().prop('selectedIndex');
				matrizIni[i][j+1] = parseFloat($('#matriz').find('div').eq(i).find('input').last().val());

			}
		}
		if(matrizIni[i][numVar+1] < 0) { // corrigir b
			matrizIni[i][numVar+1] *= -1;
			for(var j = 0; j < numVar; j++)
				matrizIni[i][j] != 0 ? matrizIni[i][j] *= -1 : matrizIni[i][j];
			matrizIni[i][numVar] < 1 ? matrizIni[i][numVar] = 2 : matrizIni[i][numVar] = 0; // mudar sinal da equacao
		}
		signal[i] = matrizIni[i][numVar];
	}

	numVarPadrao = numVar;

	// Verificar quantidade de variaveis padrao pelo sinal das restricoes
	for(var i = 0; i < numRest; i++) {
		matrizIni[i][numVar] < 2 ? numVarPadrao++ : numVarPadrao += 2; //>=: 0 =: 1 >=: 2
	}

	maiorCusto = 0;
	var proxInd = numVar;
	var mudouMaior = false;

	// Corrigir funcao objetivo se for selecionada maximizacao
	$('#tipo').prop('selectedIndex') == 0 ? tipoProblema = 1 : tipoProblema = -1;
	var corrigeZ = tipoProblema;

	for(var i=0; i < numRest; i++) {
		matriz[i] = [];
		b[i] = matrizIni[i][numVar+1]; 

		var mudarLinha = 1;
		for(var j=0; j < numVarPadrao; j++) {
			if(j < numVar) {
				matriz[i][j] = matrizIni[i][j];
				if(i == 0) {
					custos.push(parseFloat($('#funcform').find('input').eq(j).val()));
					maiorCusto = custos[custos.length - 1] > maiorCusto ? custos[custos.length - 1] : maiorCusto
					custos[custos.length - 1] *= corrigeZ;
				}
			}
			else {
				// Corrigir M das artificiais
				if(j == numVar && !mudouMaior) {
					maiorCusto *= 10;
					mudouMaior = true;
					if(!maiorCusto)
						maiorCusto = 10;
				}

				if(j != proxInd || !mudarLinha) {
					matriz[i][j] = 0;
				}
				else {
					mudarLinha = 0;

					switch(matrizIni[i][numVar]) {
					case 0:
						matriz[i][proxInd++] = 1;
						custos.push(0);
						base.push(parseFloat(j));
						break;
					case 1:
						matriz[i][proxInd++] = 1;
						custos.push(maiorCusto);
						base.push(parseFloat(j));
						artificiais.push(j);
						break;
					case 2:
						matriz[i][proxInd++] = -1;
						custos.push(0);
						matriz[i][proxInd++] = 1;
						j++;
						base.push(parseFloat(j));
						custos.push(maiorCusto);
						artificiais.push(j);
						break;
					default:
						alert("Erro na forma padrão" + i + "," + j);
						break;
					}
				}
			}
		}
	}
	
	for(var i = 0; i < numRest; i++) {
		for(var j = 0; j < numVarPadrao; j++) {
			matrizIni[i][j] = matriz[i][j];
			if(j == numVarPadrao - 1)
				matrizIni[i][j+1] = b[i]
		}
	}

	//adicionaListaBases(base);
}

function calculaCustoReduzido() {
	custoReduzido = [];
	for(var j = 0; j < numVarPadrao; j++) {
		var soma = 0;
		for(var i = 0; i < numRest; i++)
			soma += custos[base[i]]*matriz[i][j];
		custoReduzido.push(custos[j] - soma);
	}
	var menorcr = Math.min.apply(null, custoReduzido);
	if(menorcr >= 0) return -1;
	else return custoReduzido.indexOf(menorcr);
}

function bsobreaf(entrante) {
	var bsoba = [];
	for(var i = 0; i < numRest; i++)
		bsoba.push(b[i]/matriz[i][entrante]);
	return bsoba;
}

function pivotamento(entrante, sainte) {
	var pivo = matriz[sainte][entrante];
	b[sainte] /= pivo;

	for(var j = 0; j < numVarPadrao; j++) {
		matriz[sainte][j] /= pivo;
	}

	for(var i = 0; i < numRest; i++) {
		pivo = matriz[i][entrante];
		if(i != sainte) {
			b[i] -= b[sainte]*pivo;
			for(var j = 0; j < numVarPadrao; j++)
				matriz[i][j] -= matriz[sainte][j]*pivo;
		}
	}
}

Array.prototype.containsArray = function(val) {
    var hash = {};
    for(var i=0; i<this.length; i++) {
        hash[this[i]] = i;
    }
    return hash.hasOwnProperty(val);
}

function adicionaListaBases(base) {
	var vet = base.slice();
	listaBases.push(vet);
}

function selecaoLexicografica(sainte1, sainte2) {
	var pivo1 = matriz[sainte1][entrante];
	var pivo2 = matriz[sainte2][entrante];

	for(var i = 0; i < numVarPadrao; i++) {
		var num1 = Math.abs(matriz[sainte1][i]/pivo1);
		var num2 = Math.abs(matriz[sainte2][i]/pivo2);
		if(num1 < num2)
			return sainte1;
		if(num1 > num2)
			return sainte2;
	}
	return sainte2;
}

function simplex() {
	fimSimplex = false;
	//formaPadrao();
	var tipoFim;
	
	while(!fimSimplex) {
		calculaSolucao();

		entrante = calculaCustoReduzido(base);
		bsobrea = bsobreaf(entrante);

		if(entrante < 0)
			break;

		sainte = Math.min.apply(null, bsobrea.filter(function(x) {
			return x >= 0;
		}));

		if(!isFinite(sainte))
			break;

		if(listaBases.containsArray(base)) {
			var novoVet = bsobrea.slice();
			novoVet.splice(bsobrea.indexOf(sainte), 1);
			sainte = Math.min.apply(null, novoVet.filter(function(x) {
				return x > 0;
			}));
			if(!isFinite(sainte))
				break;
			sainte = bsobrea.indexOf(sainte);
		}
		else {
			adicionaListaBases(base);
			var sainte1 = bsobrea.indexOf(sainte);
			var sainte2 = bsobrea.lastIndexOf(sainte);
			sainte = sainte1 == sainte2 ? sainte1 : selecaoLexicografica(sainte1, sainte2)
		}
		

		if(sainte < 0)
			break;

		//mostrartabela();

		base[sainte] = entrante;

		pivotamento(entrante, sainte);
	}

	if(entrante < 0) {
			fimSimplex = true;
			for(var i=0; i < base.length; i++)
				if(artificiais.indexOf(base[i]) >= 0 && b[base[i]] != 0) {
					tipoFim = 2; // conjunto vazio
					return tipoFim;
				}
			tipoFim = 1; // finalizou com sucesso
			var vet = [];
			for(var i = 0; i < b.length; i++)
				vet.push(checaInteiro(b[i]))
			return tipoFim;;
	}

	if(sainte < 0 || !isFinite(sainte)) {
			fimSimplex = true;
			for(var i=0; i < base.length; i++)
				if(artificiais.indexOf(base[i]) >= 0 && b[base[i]] != 0) {
					tipoFim = 2; // conjunto vazio
					return tipoFim;;
				}
			tipoFim = 3; // conjunto ilimitado
			return tipoFim;
	}
}

function imprimeSolucaoSimplificado($tab) {
	calculaSolucao();

	$tab.append('(x*)<sup>T</sup> = (');

	for(var i = 0; i < numVar; i++)
		i < numVar - 1 ? $tab.append(print(solucao[i])+', ') : $tab.append(print(solucao[i])+')');
}

function mostrarArvoreBL(indice, xBifurcado, proxBifurcado, bnovo) {
	$tab.append('<br>');

	$tabulacao = $('<br><span></span>');
	for(var i = 0; i < nivel; i++)
		$tabulacao.append('&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;')

	$tab.append($tabulacao.clone());
	$tab.append('<strong>P<sub>'+indice+'</sub></strong>');
	if(contador) {
		$tab.append($tabulacao.clone());
		var sinalG = sinal[sinal.length-1] == 0 ? '&le;' : '&ge;'
		$tab.append('Nova restrição: x<sub>'+(xBifurcado+1)+'</sub>&nbsp;'+ sinalG +'&nbsp;'+print(bnovo));
	}
	$tab.append($tabulacao.clone());
	$tab.append('Solução: ');
	imprimeSolucaoSimplificado($tab);
	$tab.append($tabulacao.clone());
	$tab.append('Resultado: z = '+print(calculaSolucao()*tipoProblema));
	$tab.append($tabulacao.clone());
	$tab.append('Situação: ');
	switch(proxBifurcado) {
		case 0:
			$tab.append('Parar ramo.');
			break;
		default:
			$tab.append('Bifurcar x<sub>'+(proxBifurcado)+'</sub>.');
			break;
	}
}

function adicionaRestricao(variavel, tipo, novoB) {
	copiaCustos.push(0);
	if(tipo) // 0 - <= , 1 - >=
		copiaCustos.push(maiorCusto);

	for(var i = 0; i < numRest; i++) {
		copiaMatriz[i].push(0);
		if(tipo)
			copiaMatriz[i].push(0);
	}
	
	var vet = [];

	for(var j = 0; j < numVarPadrao; j++)
		j == variavel ? vet.push(1) : vet.push(0)
	if(!tipo)
		vet.push(1);
	else {
		vet.push(-1);
		vet.push(1);
	}

	numRest++;
	numVarPadrao += (tipo+1);	

	copiaMatriz.push(vet);

	copiaB.push(novoB);

	tipo == 0 ? copiaSinal.push(0) : copiaSinal.push(2)

	if(tipo)
		copiaArtificiais.push(numVarPadrao-1);
	copiaBase.push(numVarPadrao-1);
}

function removeRestricao(tipo) {
	copiaCustos.splice(numVarPadrao-1, 1);
	if(tipo) // 0 - <= , 1 - >=
		copiaCustos.splice(numVarPadrao-2, 1);

	for(var i = 0; i < numRest; i++) {
		copiaMatriz[i].splice(numVarPadrao-1, 1);
		if(tipo)
			copiaMatriz[i].splice(numVarPadrao-2, 1);
	}

	copiaMatriz.splice(numRest-1, 1);
	copiaB.splice(numRest-1, 1);
	copiaSinal.splice(numRest-1, 1);
	copiaBase.splice(numRest-1, 1);

	if(tipo)
		copiaArtificiais.splice(artificiais.length, 1);

	numRest--;
	numVarPadrao -= (tipo+1);
}

function melhoraSolucao() {
	var z = calculaSolucao()*tipoProblema;
	if(z < maiorSolucaoInteira)
		return;
	for(var i = 0; i < numVar; i++)
		if(variaveisInteiras[i] && !checaInteiro(solucao[i]))
			return;

	var novaSolucao = solucao.slice();
	solucoesInteiras.push(novaSolucao);
	maiorSolucaoInteira = z;

	calculaFolga();
	folgasInteiras.push(folga.slice());

}

function salvaFP() {
	copiaB = b.slice();
	copiaCustos = custos.slice();
	copiaBase = base.slice();
	copiaArtificiais = artificiais.slice();
	copiaListaBases = listaBases.slice();

	for(var i = 0; i < numRest; i++)
		copiaSinal.push($('#signal'+i).prop('selectedIndex'));

	for(var i = 0; i < matriz.length; i++)
		copiaMatriz.push(matriz[i].slice());

}

function recuperaFP() {
	b = copiaB.slice();
	custos = copiaCustos.slice();
	base = copiaBase.slice();
	artificiais = copiaArtificiais.slice();
	listaBases = copiaListaBases.slice();
	sinal = copiaSinal.slice();

	matriz = [];
	for(var i = 0; i < copiaMatriz.length; i++)
		matriz.push(copiaMatriz[i].slice());
}

function branchAndBound(pai, indice, limiteInicial) {
	var tipoFim;

	if(!contador) {
		numRestAntigo = numRest;
		numVarPadraoAntigo = numVarPadrao;
		leVariaveisInteiras();
	}

	recuperaFP();
	var tipoFim;
	tipoFim = simplex();

	if(tipoFim != 1) {
		mostrarArvoreBL(indice, pai, 0, limiteInicial);
		return tipoFim;
	}

	var sol = calculaSolucao()*tipoProblema;
	
	if(sol < maiorSolucaoInteira) {
		mostrarArvoreBL(indice, pai, 0, limiteInicial);
		return -1;
	}

	var mudou = false;
	var limiteSuperior, limiteInferior;

	for(var i = 0; i < numVar; i++)
		if(variaveisInteiras[i] && !checaInteiro(solucao[i])) {

			limiteInferior = Math.floor(solucao[i]);
			limiteSuperior = Math.ceil(solucao[i]);

			mudou = true;
			mostrarArvoreBL(indice, pai, (i+1), limiteInicial);
			nivel++;
			var contadorAntigo = contador;
			contador+=2;

			adicionaRestricao(i, 0, limiteInferior);
			recuperaFP();

			var bifurcacao1 = branchAndBound(i, contadorAntigo+1, limiteInferior);
			if(bifurcacao1 == 1)
				melhoraSolucao();

			removeRestricao(0);
			recuperaFP();

			adicionaRestricao(i, 1, limiteSuperior);
			recuperaFP();
			
			var bifurcacao2 = branchAndBound(i, contadorAntigo+2, limiteSuperior);
			if(bifurcacao2 == 1)
				melhoraSolucao();

			removeRestricao(1);
			recuperaFP();
			nivel--;

			//break;
		}

	if(!mudou) 
		mostrarArvoreBL(indice, pai, 0, limiteInicial);

	return 1;

}

function calculaSolucao() {
	var z = 0;
	for(var i = 0; i < numVar; i++) {
		base.indexOf(i) >= 0 ? solucao[i] = b[base.indexOf(i)] : solucao[i] = 0
		z += solucao[i]*custos[i];
	};
	return z;
}

function calculaFolga() {
	folga = [];
	for(var j = numVar; j < numVarPadraoAntigo; j++) {
		if(base.indexOf(j) >= 0 && b[base.indexOf(j)] > 0) {
			var vet = [];
			vet.push(j);
			vet.push(b[base.indexOf(j)]);
			for(var i = 0; i < numRestAntigo; i++) {
				if(matrizIni[i][j] != 0)
					vet.push(i);
			}
			folga.push(vet);
		}
	}
}

function contaDecimais(value) {
  if (Math.floor(value) === value) return 0;
  return value.toString().split(".")[1].length || 0;
}

function checaInteiro(valor, tipo) {
	var aux = Math.abs(valor);
	var aux1 = aux - Math.floor(aux);
	var aux2 = Math.ceil(aux) - aux;
	if(aux1 < 1e-10) {
		tipo = 1;
		return true;
	}
	if(aux2 < 1e-10) {
		tipo = 2;
		return true;
	}
	tipo = 0;
	return false;
}

function print(valor) {
	if(isNaN(valor))
		return ' ';
	if(!isFinite(valor))
		return '&infin;';
	if(checaInteiro(valor, tipo)) {
		return Number.parseInt(tipo == 1 ? Math.floor(valor) : Math.ceil(valor)) 
	}
	 return contaDecimais(valor) > 3 ? valor.toFixed(3) : valor
}

function mostrartabela() {
	$tab.append('<br><br><br>');
	$table = $('<table class="table table-striped matriz"><tbody></tbody></table>');

	
	$row1 = $('<tr><td><strong>c</strong></td><td></td></tr>')
	for(var i = 0; i < numVarPadrao; i++) {
		$row1.append('<td>'+ print(custos[i]) +'</td>');
	}
	$row1.append('<td></td><td></td>');
	$table.append($row1);

	$row2 = $('<tr><td></td><td></td>');
	for(var i = 0; i < numVarPadrao; i++)
		$row2.append('<td><strong>x<sub>'+(i+1)+'</sub></strong></td>');
	$row2.append('<td><strong>b</strong></td><td><strong><sup>b</sup>&frasl;<sub>a</sub></strong></td>');
	$table.append($row2);

	for(var i=0; i<base.length; i++) {
		$row = $('<tr><td>'+ print(custos[base[i]]) +'</td><td><strong>x<sub>'+(base[i] + 1)+'</sub></strong></td></tr>');
		for(var j=0; j<numVarPadrao; j++) {
			$row.append('<td>'+ print(matriz[i][j]) +'</td>');
		}
		$row.append('<td>'+ print(b[i])+'</td><td>'+ print(bsobrea[i]) +'</td>');
		$table.append($row);
	}

	$row3 = $('<tr><td></td><td><strong>c<sub>r</sub></strong></td></tr>')
	for(var i = 0; i < numVarPadrao; i++)
		$row3.append('<td>'+ print(custoReduzido[i]) +'</td>');
	$row3.append('<td>'+print(calculaSolucao())+'</td><td></td>');
	$table.append($row3);

	$tab.append($table);

	!fimSimplex ? $tab.append('Sai da base x<sub>'+(base[sainte]+1)+'</sub> e entra x<sub>'+(entrante+1)+'</sub>.')
				: novaIteracao ? $tab.append('Fim do Simplex, porém nem todas as<br> variáveis desejadas estão inteiras. <br>Adicionar novas restrições e continuar. ')
							   : $tab.append('Fim do Simplex.')
}

function imprimeProblema() {
	$div_fp = $('#fp');

	$row1 = $('<div class="row"></div>');
	$col1 = $('<div class="col-md-2"><strong>minimizar</strong></div>');
	$row1.append($col1);

	$col2 = $('<div class="col-md-10"> z = </div>');
	for(var i = 0; i < custos.length; i++)
		i != custos.length - 1 ? $col2.append(custos[i]+'.x<sub>'+(i+1)+'</sub> + ') : $col2.append(custos[i]+'.x<sub>'+(i+1)+'</sub>');

	$row1.append($col2);
	$div_fp.append($row1);

	$row2 = $('<div class="row"></div>');
	$col3 = $('<div class="col-md-2"><strong>s. a. </strong></div>');

	$row2.append($col3);
	$col4 = $('<div class="col-md-10"></div>');

	for(var i = 0; i < numRest; i++) {
		$col = $('<div class="col-md-12"></div>');
		for(var j = 0; j < numVarPadrao; j++) {
			j != numVarPadrao - 1 ? $col.append(matrizIni[i][j]+'.x<sub>'+(j+1)+'</sub> + ') 
								  : $col.append(matrizIni[i][j]+'.x<sub>'+(j+1)+'</sub> = '+ matrizIni[i][j+1]);
		}
		$col4.append($col);
	}
	$col4.append('<div class="col-md-12"><strong>x</strong> &ge; 0</div>');
	$row2.append($col4);
	$div_fp.append($row2);
}

function imprimeSolucao(result) {
	console.log(folgasInteiras);
	switch(result) {
		case 0:
			$('#solucao').append('<span class="sol">Não foi possível encontrar uma solução.</span>');
			break; 
		case 1:
			$row1 = $('<div class="row"></div>');
			$row1.append(('<div class="col-md-12 sol">z* = '+print(maiorSolucaoInteira)+'</div><br>'));
			$('#solucao').append($row1);

			for(var k = 0; k < solucoesInteiras.length; k++) {
				$row = $('<div class="row"></div>');
				$div = $('<div class="col-md-12 sol"><br>(x*)<sup>T</sup> = (</div>')

				console.log(solucoesInteiras[k]);

				for(var i = 0; i < numVar; i++)
					i < numVar - 1 ? $div.append(print(solucoesInteiras[k][i])+', ') : $div.append(print(solucoesInteiras[k][i])+')');
				$row.append($div);

				$('#solucao').append($row);

				if(folgasInteiras[k].length > 0) {
					$new_row = $('<div class="row"></div>')
					for(var i = 0; i < folga.length; i++) {
						$new_row = $('<div class="col-md-12"></div>');
						$new_row.append('Folga de r<sub>'+(folgasInteiras[k][i][2] + 1)+'</sub>: x<sub>'+(folgasInteiras[k][i][0]+1)+'</sub> = '+print(folgasInteiras[k][i][1]));
						$('#solucao').append($new_row);
					}
				}
			}

			break;
		case 2:
			$('#solucao').append('<span class="sol">O conjunto de soluções é vazio.</span>');
			break;
		case 3:
			$('#solucao').append('<span class="sol">O conjunto de soluções é ilimitado.</span>');
			break;
	}
}


function limpar() {
	matrizIni = [];
	matriz = [];
	b = [];
	custos = [];
	base = [];
	custoReduzido = [];
	bsobrea = [];
	artificiais = [];
	solucao = [];
	folga = [];
	listaBases = [];
	variaveisInteiras = [];
	copiaMatriz = [];
	copiaB = [];
	copiaCustos = [];
	copiaBase = [];
	copiaArtificiais = [];
	copiaListaBases = [];
	copiaSinal = [];
	$('#tabelas').empty();
	$('#fp').empty();
	$('#folgas').empty();
	$('#solucao').empty();
	numVar = parseInt($('#numVar').val(), 10);
	numRest = parseInt($('#numRest').val(), 10);
	contador = 0;
	nivel = 0;
	maiorSolucaoInteira = Number.NEGATIVE_INFINITY;
	solucoesInteiras = [];
	sinal = [];
}

$('#limpar').click(function() {
	$('#funcform, #matriz').trigger("reset");
	$('#resultado').collapse('hide');
	limpar();
	for(var i = 0; i < numVar; i++)
		$('#vi'+i).prop('checked', false);
});

$('#calculate').click(function() {
	limpar();
	if(preencheZero() > 0) {
		formaPadrao();
		salvaFP();
		imprimeProblema();
		result = branchAndBound(0, 0, 0);
		imprimeSolucao(result);

		recuperaFP();

		$('#resultado').collapse('show');
	}
})

function preencheZero() {
	var cont = 0;
	$('#funcform, #matriz')
		.find('input[type=number]')
		.each(function() {
			if($(this).val()=="") {
				$(this).val(0);
				cont++;
			}
		});

	return ((numVar*numRest)+numVar+numRest) - cont;
}

});