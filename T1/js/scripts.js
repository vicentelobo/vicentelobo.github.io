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
	var tipoProblema;
	var sainte, entrante;

	$div_f = $('#func');
	$div_m = $('#matriz');
	$tab = $('#tabelas');

	$('#resultado').collapse('hide');

	atualiza();

	$('#numVar, #numRest').on('change click', function() {
		atualiza();
		desenhaSistema();
	});


function atualiza() {

	numVar = parseInt($('#numVar').val(), 10);
	numRest = parseInt($('#numRest').val(), 10);

	escreveFuncao();
	desenhaSistema();
}

function escreveFuncao() {
	$div_f.empty();
	$div_f.append('z = ');
	for(var j = 0; j<numVar; j++){
		$div_f.append('<label for="cell"><input type="number" id="f'+j+'" class="cell" placeholder="1" required><span class="spaced">.x<sub>'+(j+1)+ '</sub></span></label>');
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

	//corrigeB();
	validation();

	matrizIni = [];
	signal = [];

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
		b[i] != 0 ? bsoba.push(b[i]/matriz[i][entrante]) : bsoba.push(0);
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

function simplex() {
	var fimSimplex = false;
	formaPadrao();
	var tipoFim;
	
	while(!fimSimplex) {

		var entrante = calculaCustoReduzido();

		if(entrante < 0) {
			fimSimplex = true;
			for(var i=0; i < base.length; i++)
				if(artificiais.indexOf(base[i]) >= 0 && b[base[i]]) {
					tipoFim = 2; // conjunto vazio
					return tipoFim;
				}
			tipoFim = 1; // finalizou com sucesso
			for(var i = 0; i < numVar; i++)
				base.indexOf(i) >= 0 ? solucao[i] = b[base.indexOf(i)] : solucao[i] = 0;
			return tipoFim;;
		}

		var bsobrea = bsobreaf(entrante);
		mostrartabela();
		var sainte = bsobrea.indexOf(Math.min.apply(null, bsobrea.filter(function(x) {
			return x > 0;
		})));
		if(sainte < 0) {
			fimSimplex = true;
			for(var i=0; i < base.length; i++)
				if(artificiais.indexOf(base[i]) >= 0 && b[base[i]]) {
					tipoFim = 2; // conjunto vazio
					return tipoFim;;
				}
			tipoFim = 3; // conjunto ilimitado
			return tipoFim;
		}

		base[sainte] = entrante;

		pivotamento(entrante, sainte);
	}
}

function contaDecimais(value) {
  if (Math.floor(value) === value) return 0;
  return value.toString().split(".")[1].length || 0;
}

function print(value) {
	if(isNaN(value) || !isFinite(value))
		return '';
	 return contaDecimais(value) > 3 ? value.toFixed(3) : value
}

function mostrartabela() {
	$tab.append('<br><br><br>');
	$table = $('<table class="table table-striped"><tbody></tbody></table>');

	
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
	$row3.append('<td></td><td></td>');
	$table.append($row3);

	$tab.append($table);
}

function limpar() {
	custos = [];
	base = [];
	matriz = [];
	b = [];
	custoReduzido = [];
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

			var z = 0;
			for(var i = 0; i < numVar; i++) {
				i < numVar - 1 ? $col1.append(solucao[i]+', ') : $col1.append(solucao[i]+')');
				z += solucao[i]*custos[i];
			}
			$row.append($col1);

			$col2 = $('<div class="col-md-6 sol">z* = '+z*tipoProblema+'</div>');
			$row.append($col2);
			$('#solucao').append($row);

			break;
		case 2:
			$('#solucao').append('<span class="sol">O conjunto de soluções é vazio.</span>');
			break;
		case 3:
			$('#solucao').append('<span class="sol">O conjunto de soluções é ilimitado.</span>');
			break;
	}
}

$('#limpar').click(function() {
	$('#funcform, #matriz').trigger("reset");
	$('#resultado').collapse('hide');
	$('#tabelas').empty();
	limpar();
});

$('#calculate').click(function() {
	$('#tabelas').empty();
	limpar();
	var result = simplex();
	mostrartabela();
	imprimeProblema();
	imprimeSolucao(result);

	$('#resultado').collapse('show');
})

// $('#dados').on('focusout','input',function() {
// 	value = $(this).val();
// 	min = $(this).attr('min');
// 	if(value < min || value == '')
// 		$(this).val(min);
// });



function validation() {

	$('#funcform')
		.find('input[type=number]')
		.each(function() {
			if($(this).val()=="")
			$(this).val(-1);});

	$('#matriz')
		.find('input[type=number]')
		.each(function() {
			if($(this).val()=="")
			$(this).val(0);});
}

});