$(document).ready(function() {

	var numVar;
	var numRest;
	var numVarPadrao;
	var matrizIni;
	var matriz = [];
	var b = [];
	var custos = [];
	var base = [];
	var custoReduzido = [];
	var bsobrea = [];
	var artificiais = [];
	var solucao = [];
	var folga = [];
	var tipoProblema;
	var sainte, entrante, fimSimplex;
	var listaBases = [];

	$div_f = $('#func');
	$div_m = $('#matriz');
	$tab = $('#tabelas');

	$('#resultado').collapse('hide');

	atualiza();

	var numVarAntigo;
	var numRestAntigo;
	var funcao = [];
	var sinal = [];

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

	for(var i = 0; i < numRest; i++) {
		b[i] = parseFloat($('#matriz').find('div').eq(i).find('input').last().val());
		matrizIni[i] = [];

		for(var j = 0; j < numVar+1; j++)
			if(j < numVar) {
				funcao.push($('#func').find('input').eq(j).val());
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
	$div_f.append('z = ');
	for(var j = 0; j<numVar; j++){
		$div_f.append('<label for="cell"><input type="number" id="f'+j+'" class="cell" placeholder="0" required><span class="spaced">.x<sub>'+(j+1)+ '</sub></span></label>');
		if(j < numVar-1)
			$div_f.append(' + ');
	}
}

function desenhaSistema(){

	$div_m.empty();

	for(var i = 0; i<numRest; i++){
		$row = $('<div class="col-sm-12" id="l'+i+'"></div>');
		for(var j = 0; j<numVar; j++){
			if(j < numVar-1)
				$row.append('<label><input type="number" id="m'+i+','+j+'" class="cell" placeholder="0" required><span>.x<sub>'+(j+1)+ '</sub> + </span></label>&nbsp;');
			else{
				$row.append('&nbsp;<label><input type="number" id="m'+i+','+j+'" class="cell" placeholder="0" required><span>.x<sub>'+(j+1)+ '</sub></span></label>');
				$row.append('&nbsp;<select class="cell" id="signal'+i+'"><option selected>&le;</option><option>=</option><option>&ge;</option></select>')
				$row.append('&nbsp;<label><input type="number" id="b'+i+'" class="cell" placeholder="0" required>&nbsp;<span>(b<sub>' + (i+1) +' </sub>)</span></label>');
			}
		}
		$div_m.append($row);
	}
	$last_row = $('<div class="col-sm-12"><strong>x</strong> &ge; 0</div>');
	$div_m.append($last_row);
}

function formaPadrao() {
	preencheZero();

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

	var maiorCusto = 0;
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
	for(var j = 0; j < numVarPadrao; j++) {
		var soma = 0;
		for(var i = 0; i < numRest; i++)
			soma += custos[base[i]]*matriz[i][j];
		custoReduzido[j] = custos[j] - soma;
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
	formaPadrao();
	var tipoFim;
	var contador = 0;
	
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

		console.log(bsobrea, sainte);
		

		if(sainte < 0)
			break;

		mostrartabela();

		base[sainte] = entrante;

		pivotamento(entrante, sainte);
	}

	console.log(base, bsobrea, novoVet, entrante, sainte);

	if(entrante < 0) {
			fimSimplex = true;
			for(var i=0; i < base.length; i++)
				if(artificiais.indexOf(base[i]) >= 0 && b[base[i]] != 0) {
					tipoFim = 2; // conjunto vazio
					return tipoFim;
				}
			tipoFim = 1; // finalizou com sucesso
			
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

function calculaSolucao() {
	var z = 0;
	for(var i = 0; i < numVar; i++) {
		base.indexOf(i) >= 0 ? solucao[i] = b[base.indexOf(i)] : solucao[i] = 0
		z += solucao[i]*custos[i];
	};

	return z;
}

function calculaFolga() {
	for(var j = numVar; j < numVarPadrao; j++) {
		if(base.indexOf(j) >= 0 && b[base.indexOf(j)] > 0) {
			var vet = [];
			vet.push(j);
			vet.push(b[base.indexOf(j)]);
			for(var i = 0; i < numRest; i++) {
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

function print(value) {
	if(isNaN(value))
		return ' ';
	if(!isFinite(value))
		return '&infin;';
	 return contaDecimais(value) > 3 ? value.toFixed(3) : value
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
				: $tab.append('Fim do Simplex.');
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
	switch(result) {
		case 1:
			$row = $('<div class="row"></div>');
			$col1 = $('<div class="col-md-6 sol">(x*)<sup>T</sup> = (</div>');

			for(var i = 0; i < numVar; i++)
				i < numVar - 1 ? $col1.append(print(solucao[i])+', ') : $col1.append(print(solucao[i])+')');
			$row.append($col1);

			$col2 = $('<div class="col-md-6 sol">z* = '+print(calculaSolucao()*tipoProblema)+'</div>');
			$row.append($col2);
			$('#solucao').append($row);

			calculaFolga();

			if(folga.length > 0) {
				$('#solucao').append('<br><div class="row" id="folgas"></div>');
				for(var i = 0; i < folga.length; i++) {
					$row2 = $('<div class="col-md-12"></div>');
					$row2.append('Folga de r<sub>'+(folga[i][2] + 1)+'</sub>: x<sub>'+(folga[i][0]+1)+'</sub> = '+print(folga[i][1]));
					$('#solucao').append($row2);
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
	matrizIni = [];;
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
	$('#tabelas').empty();
	$('#fp').empty();
	$('#folgas').empty();
	$('#solucao').empty();
}

$('#limpar').click(function() {
	$('#funcform, #matriz').trigger("reset");
	$('#resultado').collapse('hide');
	limpar();
});

$('#calculate').click(function() {
	limpar();
	if(preencheZero() > 0) {
		var result = simplex();
		mostrartabela();
		imprimeProblema();
		imprimeSolucao(result);

		$('#resultado').collapse('show');
	}
})

// $('#dados').on('focusout','input',function() {
// 	value = $(this).val();
// 	min = $(this).attr('min');
// 	if(value < min || value == '')
// 		$(this).val(min);
// });



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