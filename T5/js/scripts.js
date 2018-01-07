$(document).ready(function() {

	var numOrig, numOrigAntigo;
	var numDest, numDestAntigo;
	var valores, basicas, custos, qtdOrig, qtdDest;
	var ui, vj;
	var indices, valCiclo;
	var parar = false;
	var ficticio;

	$div_m = $('#matriz');
	$tab = $('#tabelas');

	$('#resultado').collapse('hide');

	atualiza();

	var numVarAntigo;
	var numRestAntigo;

	$('#numVar, #numRest').on('click change', function() {
		//salvaCampos(funcao);
		atualiza();
		//preencheCampos();
	});

function limpar() {
	
	numOrig = parseInt($('#numVar').val(), 10);
	numDest = parseInt($('#numRest').val(), 10);

	custos = []; qtdOrig = []; qtdDest = [];
	valores = []; basicas = [];
	ui = []; vj = [];
	indices = []; valCiclo = [];
	ficticio = 0;

	$('#tabelas').empty();
	$('#fp').empty();
	$('#solucao').empty();
}

$('#limpar').click(function() {
	$('#form').trigger("reset");
	$('#resultado').collapse('hide');
	limpar();
});

$('#generate').click(function() {
	geraProblema();
});

$('#calculate').click(function() {
	limpar();
	//preencheProblema(8);
	if(!preencheZero()) { // Se vazio, preenche com problema ja existente

		pegaDados();
		//logProblema();
		imprimeQuadroFP('fp', custos);
		resolver();
		$('#resultado').collapse('show');	
	}
	else {
		$('#form').trigger("reset");
	}
})

function logProblema() {

	numOrigAntigo = parseInt($('#numVar').val(), 10);
	numDestAntigo = parseInt($('#numRest').val(), 10);

	var prob = '';
	for(var i = 1; i <= numOrigAntigo+1; i++) {
		for(var j = 1; j <= numDestAntigo+1; j++) {
			if(i == numOrigAntigo+1 && j == numDestAntigo+1) {
				break;
			}
			var linha = 'document.getElementById("m'+i;
			linha += ','+j+'").value = ';
			if(i < numOrigAntigo) {
				if(j < numDestAntigo+1) {
					linha += custos[i-1][j-1];
				}
				else {
					linha += qtdOrig[i-1];
				}
			}
			else {
				linha += qtdDest[j-1];
			}
			prob += linha + ';\n';
		}
		prob += '\n';
	}

	console.log(prob);
}

// Uso geral

function getSum(total, num) { return total + num; }
function getMaior(maior, num) { return maior > num ? maior : num; }
function getMenor(menor, num) { return num < menor ? num : menor; }

function getMaiorMat(matriz) {
	var maior = 0;
	matriz.forEach(function(item) {
			var maiorDaLinha = item.reduce(getMaior);
			maior = maior > maiorDaLinha ? maior : maiorDaLinha;
		}
	); 
	return maior; 
}

function getMenorMat(matriz) {
	var menor = 0;
	var indice = '';

	matriz.forEach((linha, i) => {
		linha.forEach((item, j) => {
			if(item < menor) {
				menor = item;
				indice = i+' '+j;
	}})});

	return indice; 
}

function contNotNull(array) {
	var cont = 0;
	array.forEach((item) => {
		item != null ? cont++ : ''
	});
	return cont;
}

function copiaMatriz(array) {
	var copia = [];
	array.forEach((linha, index) => {
		copia.push([]);
		linha.forEach((item) => {
			copia[index].push(item);
	})});
	return copia;
}

Array.prototype.containsArray = function(val) {
    var hash = {};
    for(var i=0; i<this.length; i++) {
        hash[this[i]] = i;
    }
    return hash.hasOwnProperty(val);
} 

// Especificas

function atualiza() {
	numOrigAntigo = numOrig;
	numDestAntigo = numDest;

	numOrig = parseInt($('#numVar').val(), 10);
	numDest = parseInt($('#numRest').val(), 10);

	desenhaSistema();
}

function desenhaSistema(){

	$div_m.empty();

	for(var i = 0; i<numOrig+2; i++){
		$row = $('<tr></tr>');
		for(var j = 0; j<numDest+2; j++){
			if(i == 0) {
				if(j > 0 && j < numDest+1) {
					$row.append('<td><input type="text" id="m'+i+','+j+'" class="cell text-center" value="'+j+'" style="background-color: #FFF8DC" readOnly></td>');
				}
				else
					if(j == 0) {
						$row.append('<td><sub>O</sub>&nbsp;&nbsp<sup>D</sup></td>');
					}
					else {
						$row.append('<td></td>');
					}
			}
			else {
				if(i < numOrig+1) {
					if(j == 0) {
						$row.append('<td><input type="text" id="m'+i+','+j+'" class="cell text-center" value="'+i+'" style="background-color: #FFF8DC" readOnly></td>');
					}
					else {
						$row.append('<td><input type="text" id="m'+i+','+j+'" class="cell text-center" placeholder="0"></td>');
					}
				}
				else {
					if(j > 0 && j < numDest+1) {
						$row.append('<td><input type="text" id="m'+i+','+j+'" class="cell text-center" placeholder="0"></td>');
					}
					else {
						$row.append('<td></td>');
					}
				}
			}
		}
		$div_m.append($row);
	}
}

function pegaDados() {

	numOrig = parseInt($('#numVar').val(), 10);
	numDest = parseInt($('#numRest').val(), 10);

	custos = [], qtdOrig = [], qtdDest = [];

	// Qtds ofertadas 
	for(var i = 1; i <= numOrig; i++) {
		qtdOrig.push(parseFloat(document.getElementById('m'+i+','+(numDest+1)).value));
	}

	// Qtds demandadas
	for(var j = 1; j <= numDest; j++) {
		qtdDest.push(parseFloat(document.getElementById('m'+(numOrig+1)+','+j).value));
	}

	for(var i = 1; i <= numOrig; i++) {
		custos.push([]);
		for(var j = 1; j <= numDest; j++) {
			custos[i-1].push(parseFloat(document.getElementById('m'+i+','+j).value));
		}
	}

	var min = $('#tipo').prop('selectedIndex') == 0;

	if(!min) {
		somar = getMaiorMat(custos) + 5;
		custos = custos.map((linha) => {
			return linha.map((item) => {
				return item*-1 + somar;
			})
		})
	}

	var diferencaOrigDest = qtdOrig.reduce(getSum) - qtdDest.reduce(getSum);
	
	if(diferencaOrigDest == 0)
		return;
	else
		if(diferencaOrigDest > 0) {// adicionar ficticio de demanda
			qtdDest.push(diferencaOrigDest);
			for(var i = 0; i < numOrig; i++)
				custos[i].push(0);
			ficticio = ++numDest*-1;
		}
		else {
			qtdOrig.push(diferencaOrigDest*-1); // ficticio de origem
			custos.push([]);
			for(var j = 0; j < numDest; j++)
				custos[custos.length-1].push(0);
			ficticio = ++numOrig;
		}
}

function baseInicial() {
	// Matriz de zeros
	valores = Array.apply(null, new Array(numOrig)).map(() => Array.apply(null, new Array(numDest)).fill(''));

	// Matriz de false
	basicas = Array.apply(null, new Array(numOrig)).map(() => Array.apply(null, new Array(numDest)).fill(false));

	var copiaQtdOrig = qtdOrig.slice();
	var copiaQtdDest = qtdDest.slice();

	// Canto Noroeste
	var i = 0, j = 0;
	while(i < numOrig && j < numDest) {
		if(i > 0 && copiaQtdDest[j] == 0) {
			basicas[i][j] = true;
			valores[i][j] = 0;
			j++;
		}
		basicas[i][j] = true;
		valores[i][j] = copiaQtdOrig[i] < copiaQtdDest[j] ? copiaQtdOrig[i] : copiaQtdDest[j];
		copiaQtdOrig[i] -= valores[i][j];
		copiaQtdDest[j] -= valores[i][j];
		copiaQtdOrig[i] == 0 ? i++ : j++
	}

	$tab.append('<p class="top-space">Base Inicial (Canto Noroeste):</p>');
	imprimeQuadro('tabelas', custos, valores, false);
}

function uivj() {
	//console.log('#########################');
	// Criar vetores
	ui = Array.apply(null, new Array(numOrig));
	vj = Array.apply(null, new Array(numDest));

	// console.log(JSON.stringify(basicas), JSON.stringify(valores));

	// Pegar quantidade de variaveis basicas por linha e salvar num vetor
	ui = ui.map((item, indice) => {return basicas[indice].slice().filter((elem) => elem).length});

	// Pegar quantidade de variaveis basicas por coluna e salvar num vetor
	vj = vj.map((item, indice) => {
		var cont = 0;
		for(var i = 0; i < numOrig; i++)
			if(basicas[i][indice])
				cont++;
		return cont;
	});

	// Pegar indice do maior elemento
	// Se estiver no vj, retornar negativo para diferenciar
	var maiorElemento = ui.reduce(getMaior) >= vj.reduce(getMaior) 
						? ui.indexOf(ui.reduce(getMaior)) 
						: -vj.indexOf(vj.reduce(getMaior));

	// console.log(JSON.stringify(ui), JSON.stringify(vj), maiorElemento);

	// Limpar vetores
	ui.fill(null);
	vj.fill(null);

	// Adicionar zero ao ui ou vj e preencher outros elementos do outro vetor
	if(maiorElemento >= 0) {
		ui[maiorElemento] = 0;
		basicas[maiorElemento].forEach((item, index) => {
			item ? vj[index] = custos[maiorElemento][index] : ''
		});
	}
	else {
		vj[-maiorElemento] = 0;
		for(var i = 0; i < numOrig; i++) {
			if(basicas[i][maiorElemento])
				ui[i] = custos[i][maiorElemento];
		}
	}

	// console.log(JSON.stringify(ui), JSON.stringify(vj));

	var contador = 0;

	while(contNotNull(ui) < ui.length || contNotNull(vj) < vj.length) {

		if(++contador > 100) {
			// console.log('loop uivj ', ui, vj, basicas, valores);
			parar = true;
			break;
		}
		
		if(contNotNull(ui) < numOrig) {
			// console.log('if ui');
			ui = ui.map((itemUi, indexUi) => {
				if(itemUi == null) {
					for(var indexVj = 0; indexVj < vj.length; indexVj++) {
						if(vj[indexVj] != null && basicas[indexUi][indexVj]) {
							return custos[indexUi][indexVj] - vj[indexVj];
						}
					}
				}
				else
					return itemUi;
			});
		}

		if(contNotNull(vj) < numDest) {
			// console.log('if vj');
			vj = vj.map((itemVj, indexVj) => {
				if(itemVj == null) {
					for(var indexUi = 0; indexUi < ui.length; indexUi++) {
						if(ui[indexUi] != null && basicas[indexUi][indexVj]) {
							return custos[indexUi][indexVj] - ui[indexUi];
						}
					}
				}
				else
					return itemVj;
			});
		}
	} 

	// console.log(JSON.stringify(ui), JSON.stringify(vj));
}

function atualizaCr() {
	valores = valores.map((linha, i) => {
		return linha.map((item, j) => {
			if(!basicas[i][j]) {
				return custos[i][j] - (ui[i] + vj[j]);
			}
			else
				return item;
		})
	});

	$tab.append('<p class="top-space">Atualização dos custos reduzidos:</p>');
	imprimeQuadro('tabelas', custos, valores, true);
}

// function encontraCiclo() { // sem log

// 	var menor = getMenorMat(valores);
// 	//console.log('menor encontrado: ', menor);

// 	indices = [], valCiclo = [];
// 	var anteriores = [];
// 	var jIni, iIni, jAtual, iAtual;
// 	var retornarLinha = true; parar = false; // criterio de parada do ciclo
// 	var procurarLinha = true; procurarColuna = true; frente = true; // controle
// 	var mudouColuna = false; mudouLinha = false; // controle

// 	if(menor != '') { 
// 		menor.split(' ');
// 		iIni = parseInt(menor[0]);
// 		jIni = parseInt(menor[2]);
// 		jAtual = jIni;
// 		iAtual = iIni;
// 		indices.push([iAtual, jAtual]);
// 		anteriores.push([iAtual, jAtual]);
// 		valCiclo.push(valores[iAtual][jAtual]);

// 		var contador = 0;
		
// 		while(!parar) {
// 			//console.log('------- indices ', iAtual, jAtual, JSON.stringify(indices));
// 			//console.log('col:', procurarColuna, 'lin:', procurarLinha, 'fren:', frente);
// 			//console.log('numOrig:', numOrig, 'numDest:', numDest);

// 			//console.log('Cond dir:',procurarColuna, frente, jAtual < (numDest - 1));

// 			// Direita
// 			if(procurarColuna && frente && jAtual < (numDest - 1)) {
// 				//console.log('entrou dir');
// 				for(var j = jAtual + 1; j < numDest; j++) {
// 					//console.log('iAtual:',iAtual,'j',j);
// 					if(basicas[iAtual][j] && !anteriores.containsArray([iAtual, j])) {
// 						mudouColuna = true;
// 						jAtual = j;
// 						indices.push([iAtual, jAtual]);
// 						anteriores.push([iAtual, jAtual]);
// 						valCiclo.push(valores[iAtual][jAtual]);
// 						procurarColuna = false;
// 						break;
// 					}
// 				}
// 				if(!retornarLinha && jAtual == jIni && indices.length > 1) {
// 					parar = true;
// 					//console.log('parar dir');
// 					break;
// 				}
// 			}

// 			if(procurarColuna)
// 					frente = false;

// 			//console.log('Cond esq',jAtual > 0, procurarColuna, !frente);

// 			// Esquerda
// 			if(procurarColuna && !frente && jAtual > 0) {
// 				//console.log('entrou esq');
// 				for(var j = jAtual - 1; j >= 0; j--) {
// 					if(basicas[iAtual][j] && !anteriores.containsArray([iAtual, j])) {
// 						mudouColuna = true;
// 						jAtual = j;
// 						indices.push([iAtual, jAtual]);
// 						anteriores.push([iAtual, jAtual]);
// 						valCiclo.push(valores[iAtual][jAtual]);
// 						procurarColuna = false;
// 						break;
// 					}
// 				}
// 				if(!procurarColuna && !retornarLinha && jAtual == jIni && indices.length > 1) {
// 					parar = true;
// 					//console.log('parar esq');
// 					break;
// 				}
// 			}

// 			if(!procurarColuna && indices.length == 2)
// 				retornarLinha = false;

// 			frente = true;
// 			if(mudouColuna) {
// 				//console.log('adicionou',JSON.stringify(indices[indices.length-1]));
// 				procurarLinha = true;
// 			}

// 			// Baixo
// 			if(procurarLinha && frente && iAtual < (numOrig - 1)) {
// 				//console.log('entrou baixo');
// 				for(var i = iAtual + 1; i < numOrig; i++) {
// 					if(basicas[i][jAtual] && !anteriores.containsArray([i, jAtual])) {
// 						mudouLinha = true;
// 						iAtual = i;
// 						indices.push([iAtual, jAtual]);
// 						anteriores.push([iAtual, jAtual]);
// 						valCiclo.push(valores[iAtual][jAtual]);
// 						procurarLinha = false;
// 						break;
// 					}
// 				}
// 				if(!procurarLinha && retornarLinha && iAtual == iIni && indices.length > 1) {
// 					parar = true;
// 					//console.log('parar baixo');
// 					break;
// 				}
// 			}

// 			if(procurarLinha) 
// 				frente = false;

// 			// Cima
// 			if(procurarLinha && !frente && iAtual > 0) {
// 				//console.log('entrou cima');
// 				for(var i = iAtual - 1; i >= 0; i--) {
// 					if(basicas[i][jAtual] && !anteriores.containsArray([i, jAtual])) {
// 						mudouLinha = true;
// 						iAtual = i;
// 						indices.push([iAtual, jAtual]);
// 						anteriores.push([iAtual, jAtual]);
// 						valCiclo.push(valores[iAtual][jAtual]);
// 						procurarLinha = false;
// 						frente = true;
// 						break;
// 					}
// 				}
// 				if(!procurarLinha && retornarLinha && iAtual == iIni && indices.length > 1) {
// 					parar = true;
// 					//console.log('parar cima');
// 					break;
// 				}
// 			}

// 			frente = true;

// 			if(mudouLinha) {
// 				//console.log('adicionou',JSON.stringify(indices[indices.length-1]));
// 			}
// 			//console.log(procurarColuna, procurarLinha);

// 			if(procurarColuna && !procurarLinha && indices.length == 2)
// 				retornarLinha = true;

// 			if(mudouColuna && !mudouLinha) {
// 				//console.log('if 1 removeu', JSON.stringify(indices.pop()));
// 				valCiclo.pop();
// 				if(indices.length == 0) {
// 					//console.log('parar acabaram indices');
// 					break;
// 				}
// 				ultIndice = indices[indices.length-1];
// 				iAtual = ultIndice[0];
// 				jAtual = ultIndice[1];
// 				//frente = false;
// 				procurarColuna = true;
// 				procurarLinha = false;
// 			} 
// 			else
// 				if(!mudouColuna && !mudouLinha) {
// 					//console.log('if 2 removeu', JSON.stringify(indices.pop()));
// 					valCiclo.pop();
// 					if(indices.length == 0) {
// 						//console.log('parar acabaram indices');
// 						break;
// 					}
// 					ultIndice = indices[indices.length-1];
// 					iAtual = ultIndice[0];
// 					jAtual = ultIndice[1];
// 					//frente = false;
// 					if(!procurarColuna && procurarLinha) {
// 						procurarColuna = true;
// 						procurarLinha = false;
// 					}
// 					else {
// 						procurarColuna = false;
// 						procurarLinha = true;
// 					}
// 				}
// 				else {
// 					procurarColuna = true;
// 					procurarLinha = false;
// 				}				

// 			if(++contador > 100) {
// 				//console.log('loop no ciclo ', procurarColuna, procurarLinha, frente);
// 				parar = true;
// 				break;
// 			}

// 			mudouColuna = false;
// 			mudouLinha = false;
// 		}
// 	}
// 	else
// 		parar = true;

// 	var custosImprimir = copiaMatriz(custos);
// 	indices.forEach((item, index) => {
// 		custosImprimir[item[0]][item[1]] = ((index % 2) == 0) ? '+ '.concat(custosImprimir[item[0]][item[1]]) 
// 															  : '- '.concat(custosImprimir[item[0]][item[1]]);
// 	});

// 	$tab.append('<p class="top-space">Ciclo:</p>');
// 	imprimeQuadro('tabelas', custosImprimir, valores, false);

// 	if(indices.length >= 4 && indices.length % 2 == 0) {
// 		//console.clear();
// 		return true;
// 	}
// 	else {
// 		//console.log(JSON.stringify(anteriores));
// 		//console.log('---');
// 		//console.log(JSON.stringify(indices));
// 		return false;
// 	}

// 	//return indices.length >= 4;
// }

function encontraCiclo() {
	console.clear();
	var menor = getMenorMat(valores);
	console.log('menor encontrado: ', menor);

	indices = [], valCiclo = [];
	var anteriores = [];
	var jIni, iIni, jAtual, iAtual;
	var retornarLinha = true; parar = false; // criterio de parada do ciclo
	var procurarLinha = true; procurarColuna = true; frente = true; // controle
	var mudouColuna = false; mudouLinha = false; // controle

	if(menor != '') { 
		menor.split(' ');
		iIni = parseInt(menor[0]);
		jIni = parseInt(menor[2]);
		jAtual = jIni;
		iAtual = iIni;
		indices.push([iAtual, jAtual]);
		anteriores.push([iAtual, jAtual]);
		valCiclo.push(valores[iAtual][jAtual]);

		var contador = 0;
		
		while(!parar) {
			console.log('------- indices ', iAtual, jAtual, JSON.stringify(indices));
			console.log('col:', procurarColuna, 'lin:', procurarLinha, 'fren:', frente);
			console.log('numOrig:', numOrig, 'numDest:', numDest);

			console.log('Cond dir:',procurarColuna, frente, jAtual < (numDest - 1));

			// Direita
			if(procurarColuna && frente && jAtual < (numDest - 1)) {
				console.log('entrou dir');
				for(var j = jAtual + 1; j < numDest; j++) {
					console.log('iAtual:',iAtual,'j',j);
					if(basicas[iAtual][j] && !anteriores.containsArray([iAtual, j])) {
						mudouColuna = true;
						jAtual = j;
						indices.push([iAtual, jAtual]);
						anteriores.push([iAtual, jAtual]);
						valCiclo.push(valores[iAtual][jAtual]);
						procurarColuna = false;
						break;
					}
				}
				if(!retornarLinha && jAtual == jIni && indices.length > 1) {
					parar = true;
					console.log('parar dir');
					break;
				}
			}

			if(procurarColuna)
					frente = false;

			console.log('Cond esq',jAtual > 0, procurarColuna, !frente);

			// Esquerda
			if(procurarColuna && !frente && jAtual > 0) {
				console.log('entrou esq');
				for(var j = jAtual - 1; j >= 0; j--) {
					if(basicas[iAtual][j] && !anteriores.containsArray([iAtual, j])) {
						mudouColuna = true;
						jAtual = j;
						indices.push([iAtual, jAtual]);
						anteriores.push([iAtual, jAtual]);
						valCiclo.push(valores[iAtual][jAtual]);
						procurarColuna = false;
						break;
					}
				}
				if(!procurarColuna && !retornarLinha && jAtual == jIni && indices.length > 1) {
					parar = true;
					console.log('parar esq');
					break;
				}
			}

			if(!procurarColuna && indices.length == 2)
				retornarLinha = false;

			frente = true;
			if(mudouColuna) {
				console.log('adicionou',JSON.stringify(indices[indices.length-1]));
				procurarLinha = true;
			}

			// Baixo
			if(procurarLinha && frente && iAtual < (numOrig - 1)) {
				console.log('entrou baixo');
				for(var i = iAtual + 1; i < numOrig; i++) {
					if(basicas[i][jAtual] && !anteriores.containsArray([i, jAtual])) {
						mudouLinha = true;
						iAtual = i;
						indices.push([iAtual, jAtual]);
						anteriores.push([iAtual, jAtual]);
						valCiclo.push(valores[iAtual][jAtual]);
						procurarLinha = false;
						break;
					}
				}
				if(!procurarLinha && retornarLinha && iAtual == iIni && indices.length > 1) {
					parar = true;
					console.log('parar baixo');
					break;
				}
			}

			if(procurarLinha) 
				frente = false;

			// Cima
			if(procurarLinha && !frente && iAtual > 0) {
				console.log('entrou cima');
				for(var i = iAtual - 1; i >= 0; i--) {
					if(basicas[i][jAtual] && !anteriores.containsArray([i, jAtual])) {
						mudouLinha = true;
						iAtual = i;
						indices.push([iAtual, jAtual]);
						anteriores.push([iAtual, jAtual]);
						valCiclo.push(valores[iAtual][jAtual]);
						procurarLinha = false;
						frente = true;
						break;
					}
				}
				if(!procurarLinha && retornarLinha && iAtual == iIni && indices.length > 1) {
					parar = true;
					console.log('parar cima');
					break;
				}
			}

			frente = true;

			if(mudouLinha) {
				console.log('adicionou',JSON.stringify(indices[indices.length-1]));
			}
			console.log(procurarColuna, procurarLinha);

			if(procurarColuna && !procurarLinha && indices.length == 2)
				retornarLinha = true;

			if(mudouColuna && !mudouLinha) {
				console.log('if 1 removeu', JSON.stringify(indices.pop()));
				valCiclo.pop();
				if(indices.length == 0) {
					console.log('parar acabaram indices');
					break;
				}
				ultIndice = indices[indices.length-1];
				iAtual = ultIndice[0];
				jAtual = ultIndice[1];
				//frente = false;
				procurarColuna = true;
				procurarLinha = false;
			} 
			else
				if(!mudouColuna && !mudouLinha) {
					console.log('if 2 removeu', JSON.stringify(indices.pop()));
					valCiclo.pop();
					if(indices.length == 0) {
						console.log('parar acabaram indices');
						break;
					}
					ultIndice = indices[indices.length-1];
					iAtual = ultIndice[0];
					jAtual = ultIndice[1];
					//frente = false;
					if(!procurarColuna && procurarLinha) {
						procurarColuna = true;
						procurarLinha = false;
					}
					else {
						procurarColuna = false;
						procurarLinha = true;
					}
				}
				else {
					procurarColuna = true;
					procurarLinha = false;
				}				

			if(++contador > 100) {
				console.log('loop no ciclo ', procurarColuna, procurarLinha, frente);
				parar = true;
				break;
			}

			mudouColuna = false;
			mudouLinha = false;
		}
	}
	else
		parar = true;

	var custosImprimir = copiaMatriz(custos);
	indices.forEach((item, index) => {
		custosImprimir[item[0]][item[1]] = ((index % 2) == 0) ? '+ '.concat(custosImprimir[item[0]][item[1]]) 
															  : '- '.concat(custosImprimir[item[0]][item[1]]);
	});

	$tab.append('<p class="top-space">Ciclo:</p>');
	imprimeQuadro('tabelas', custosImprimir, valores, false);

	if(indices.length >= 4 && indices.length % 2 == 0) {
		//console.clear();
		return true;
	}
	else {
		console.log(JSON.stringify(anteriores));
		console.log('---');
		console.log(JSON.stringify(indices));
		return false;
	}

	//return indices.length >= 4;
}

function atualizaBases() {
	var valoresAntigos = valores.slice();
	var vetAux = [];
	valCiclo.forEach((item, index) => {
		if(index % 2 == 1)
			vetAux.push(item);
	});
	var delta = vetAux.reduce(getMenor);
	var indiceSainte = valCiclo.indexOf(delta);

	for(var i = valCiclo.length - 1; i >= 0; i--) {
		var ultIndice = indices.pop();
		var ultI = ultIndice[0];
		var ultJ = ultIndice[1];

		if(i == indiceSainte) { // tirar da base
			basicas[ultI][ultJ] = false;
			valores[ultI][ultJ] = 0;
		}
		else { 
			if(i > 0) {
				if(i % 2 == 0) {
					valores[ultI][ultJ] += delta;
				}
				else {
					valores[ultI][ultJ] -= delta;
				}
			}
			else { // removeu ultimo, adicionar na base
				basicas[ultI][ultJ] = true;
				valores[ultI][ultJ] = delta;
			}
		}
	}

	$tab.append('<p class="top-space">Atualização da base:</p>');
	imprimeQuadro('tabelas', custos, valores, false);
	return true;
}

function checaFim() {
	var quantNBasicasOK = 0;
	var quantNBasicas = numOrig*numDest - (numOrig + numDest - 1);
	valores.map((linha, i) => {
		return linha.map((item, j) => {
			if(!basicas[i][j] && valores[i][j] >= 0) {
				quantNBasicasOK++;
			}
		})
	});
	return quantNBasicas == quantNBasicasOK;
}

function calculaCusto() {
	var soma = 0;
	basicas.forEach((linha, i) => {
		linha.forEach((item,  j) => {
			if(item)
				soma += valores[i][j] * custos[i][j];
	})})
	return soma;
}

function resolver() {
	parar = false;
	baseInicial();
	var contador = 0;
	do {
		if(++contador > 100) {
			$tab.append('<p class="top-space">Encerrado por exceder limite de iterações</p>');
			//console.log('parar resolver');
			parar = true;
			break;
		}
		$tab.append('<h5 class="top-space pull-left">• Iteração '+contador+'</h5><br />');
		//console.log('############### ', contador, JSON.stringify(valores));
		uivj();
		//console.log('ui ', JSON.stringify(ui), ' vj ', JSON.stringify(vj));
		if(parar)
			break;
		atualizaCr();
		//console.log('cr ', contador, JSON.stringify(valores), JSON.stringify(basicas));
		parar = checaFim();
		if(parar)
			break;
		if(!parar) {
			if(!encontraCiclo())
				break;
			atualizaBases();
			//console.log('bases ', contador, JSON.stringify(valores), JSON.stringify(basicas));
		}
		parar = checaFim();
	} while(!parar)
	$tab.append('<p class="top-space">Fim do problema.</p>');

	var valoresImprimir = copiaMatriz(valores);
	basicas.forEach((linha, i) => {
		linha.forEach((item, j) => {
			!item ? valoresImprimir[i][j] = '' : ''
	})});
	imprimeQuadroFP('solucao', valoresImprimir);
	$('#solucao').append('<p>Custo: '+calculaCusto());
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
		return valor;
	if(!isFinite(valor))
		return '&infin;';
	if(valor.toString() == '')
		return '';
	if(checaInteiro(valor, tipo)) {
		return Number.parseInt(tipo == 1 ? Math.floor(valor) : Math.ceil(valor)) 
	}
	 return contaDecimais(valor) > 3 ? valor.toFixed(3) : valor
}

function imprimeQuadroFP(local, custos) {
	$quadro = $('<table class="table" style="border-spacing: 5px; border-collapse: separate;"></table>');

	for(var i = 0; i < numOrig + 2; i++) {
		$row = $('<tr></tr>');
		for(var j = 0; j < numDest + 2; j++) {
			if(i == 0) {
				if(j == 0) {
					$row.append('<td style="border: none"><sub>O</sub>&nbsp;&nbsp<sup>D</sup></td>');
				}
				else { 
					if(j < numDest + 1) {
						if(!(ficticio < 0 && j == -ficticio)) {
							$row.append('<td style="background-color: #FFF8DC;" class="quadro" >'+j+'</td>');
						}
						else {
							$row.append('<td style="background-color: #FFF8DC;" class="quadro" >F</td>');
						}
					}
					else {
						$row.append('<td style="border: none"></td>');
					}
				}
			}
			else {
				if(i < numOrig + 1) {
					if(j == 0) {
						if(!(ficticio > 0 && i == ficticio)) {
							$row.append('<td style="background-color: #FFF8DC;" class="quadro" >'+i+'</td>');
						}
						else {
							$row.append('<td style="background-color: #FFF8DC;" class="quadro" >F</td>');
						}
					}
					else {
						if(j < numDest + 1) {
							$row.append('<td style="" class="quadro" >'+print(custos[i-1][j-1])+'</td>')
						}
						else {
							$row.append('<td style="background-color: #FFF8DC;" class="quadro" >'+print(qtdOrig[i-1])+'</td>');
						}
					}
				}
				else {
					if(j > 0 && j < numDest + 1) {
						$row.append('<td style="background-color: #FFF8DC;" class="quadro" >'+print(qtdDest[j-1])+'</td>');
					}
					else {
						$row.append('<td style="border: none"></td>');
					}
				}
			}
		}
		$quadro.append($row);
	}
	$('#'+local).append($quadro);
}

function imprimeQuadro(local, custos, valores, uivj) {
	//$('#'+local).append('</div>');
	$quadro = $('<table class="table" style="border-spacing: 5px; border-collapse: separate;"></table>');

	var tamCol = 100.0 / (numDest + (uivj ? 4 : 2));

	for(var i = 0; i < numOrig + 2; i++) {
		$row = $('<tr></tr>');
		for(var j = 0; j < numDest + 2; j++) {
			if(i == 0) {
				if(j == 0) {
					$row.append('<td style="border: none"><sub>O</sub>&nbsp;&nbsp<sup>D</sup></td>');
				}
				else {
					if(j < numDest + 1) {
						if(!(ficticio < 0 && j == -ficticio)) {
							$row.append('<td style="background-color: #FFF8DC;" class="quadro" >'+j+'</td>');
						}
						else {
							$row.append('<td style="background-color: #FFF8DC;" class="quadro" >F</td>');
						}
					}
					else {
						$row.append('<td style="border: none">&nbsp;</td>');
						if(uivj) {
							$row.append('<td style="border: none; "></td>');
							$row.append('<td style="background-color: #FFF8DC;" class="quadro">u<sub>i</sub></td>');
						}
					}
				}
			}
			else {
				if(i < numOrig + 1) {
					if(j == 0) {
						if(!(ficticio > 0 && i == ficticio)) {
							$row.append('<td style="background-color: #FFF8DC;" class="quadro" >'+i+'</td>');
						}
						else {
							$row.append('<td style="background-color: #FFF8DC;" class="quadro" >F</td>');
						}
					}
					else {
						if(j < numDest + 1) {
							var ciclo = custos[i-1][j-1].toString().startsWith('+') || custos[i-1][j-1].toString().startsWith('-');
							if(basicas[i-1][j-1]) {
								if(!ciclo) {
									$row.append('<td style="" class="quadro"><sup>'+print(custos[i-1][j-1])+'</sup>&frasl;<sub><strong>'+print(valores[i-1][j-1])+'</strong></sub></td>');
								}
								else {
									$row.append('<td style="background-color: #B0C4DE" class="quadro"><strong class="pull-left">'+custos[i-1][j-1].substring(0,1)+'</strong>&nbsp;<sup>'+print(custos[i-1][j-1].substring(2))+'</sup>&frasl;<sub><strong>'+print(valores[i-1][j-1])+'</strong></sub></td>');
								}
							}
							else {
								if(valores[i-1][j-1].toString() == '') {
									$row.append('<td style="" class="quadro"><sup>'+print(custos[i-1][j-1])+'</sup>&frasl;<sub>-</sub></td>');
								}
								else {
									if(!ciclo) {
										$row.append('<td style="" class="quadro"><sup>'+print(custos[i-1][j-1])+'</sup>&frasl;<sub>('+print(valores[i-1][j-1])+')</sub></td>');
									}
									else {
										$row.append('<td style="background-color: #B0C4DE" class="quadro"><strong class="pull-left">'+custos[i-1][j-1].substring(0,1)+'</strong>&nbsp;<sup>'+print(custos[i-1][j-1].substring(2))+'</sup>&frasl;<sub>('+print(valores[i-1][j-1])+')</sub></td>');
									}
								}
							}
						}
						else {
							$row.append('<td style="background-color: #FFF8DC" class="quadro">'+print(qtdOrig[i-1])+'</td>');
							if(uivj) {
								$row.append('<td style="border: none; ">&nbsp;</td>');
								$row.append('<td style="" class="quadro">'+print(ui[i-1])+'</td>');
							}
						}
					}
				}
				else {
					if(j > 0 && j < numDest + 1) {
						$row.append('<td style="background-color: #FFF8DC" class="quadro">'+print(qtdDest[j-1])+'</td>');
					}
					else {
						$row.append('<td style="border: none"></td>');
					}
				}
			}
		}
		$quadro.append($row);
	}
	if(uivj) {
		$quadro.append('<tr><td style="border: none; ">&nbsp;</td></tr>');
		$row = $('<tr></tr>');
		$row.append('<td style="background-color: #FFF8DC" class="quadro">v<sub>j</sub></td></tr>');
		for(var j = 0; j < numDest; j++)
			$row.append('<td style="" class="quadro">'+print(vj[j])+'</td>');
		$quadro.append($row);
	}

	$('#'+local).append($quadro);
}

function geraProblema() {
	numOrig = Math.round(Math.random()*3) + 2;
	numDest = Math.round(Math.random()*3) + 2;

	document.getElementById('numVar').value = numOrig;
	document.getElementById('numRest').value = numDest;

	desenhaSistema();

	for(var i = 1; i <= numOrig + 1; i++)
		for(var j = 1; j <= numDest + 1; j++)
			if(!(i == numOrig + 1 && j == numDest + 1))
				document.getElementById('m'+i+','+j).value = Math.round(Math.random()*50);
}

function preencheProblema(op) {
	switch(op) {
		case 1:
			numOrig = 2;
			numDest = 4;			
			desenhaSistema();
			document.getElementById('m1,1').value = 5;
			document.getElementById('m1,2').value = 4;
			document.getElementById('m1,3').value = 3;
			document.getElementById('m1,4').value = 2;
			document.getElementById('m1,5').value = 15;

			document.getElementById('m2,1').value = 2;
			document.getElementById('m2,2').value = 4;
			document.getElementById('m2,3').value = 100;
			document.getElementById('m2,4').value = 2;
			document.getElementById('m2,5').value = 15;

			document.getElementById('m3,1').value = 10;
			document.getElementById('m3,2').value = 12;
			document.getElementById('m3,3').value = 8;
			document.getElementById('m3,4').value = 4;
			break;

		case 2:
			numOrig = 2;
			numDest = 4;
			desenhaSistema();
			document.getElementById('m1,1').value = 45;
			document.getElementById('m1,2').value = 17;
			document.getElementById('m1,3').value = 21;
			document.getElementById('m1,4').value = 30;
			document.getElementById('m1,5').value = 15;

			document.getElementById('m2,1').value = 14;
			document.getElementById('m2,2').value = 18;
			document.getElementById('m2,3').value = 19;
			document.getElementById('m2,4').value = 31;
			document.getElementById('m2,5').value = 13;

			document.getElementById('m3,1').value = 9;
			document.getElementById('m3,2').value = 6;
			document.getElementById('m3,3').value = 7;
			document.getElementById('m3,4').value = 9;
			break;

		case 3:
			numOrig = 3;
			numDest = 3;
			desenhaSistema();
			document.getElementById('m1,1').value = 91;
			document.getElementById('m1,2').value = 89;
			document.getElementById('m1,3').value = 90;
			document.getElementById('m1,4').value = 320;

			document.getElementById('m2,1').value = 91;
			document.getElementById('m2,2').value = 91;
			document.getElementById('m2,3').value = 95;
			document.getElementById('m2,4').value = 270;

			document.getElementById('m3,1').value = 87;
			document.getElementById('m3,2').value = 90;
			document.getElementById('m3,3').value = 92;
			document.getElementById('m3,4').value = 150;

			document.getElementById('m4,1').value = 100;
			document.getElementById('m4,2').value = 180;
			document.getElementById('m4,3').value = 300;
			break;

		case 4:
			numOrig = 3;
			numDest = 7;
			desenhaSistema();
			document.getElementById('m1,1').value = 10;
			document.getElementById('m1,2').value = 8;
			document.getElementById('m1,3').value = 16;
			document.getElementById('m1,4').value = 3;
			document.getElementById('m1,5').value = 10;
			document.getElementById('m1,6').value = 25;
			document.getElementById('m1,7').value = 18;
			document.getElementById('m1,8').value = 10;

			document.getElementById('m2,1').value = 19;
			document.getElementById('m2,2').value = 25;
			document.getElementById('m2,3').value = 18;
			document.getElementById('m2,4').value = 7;
			document.getElementById('m2,5').value = 12;
			document.getElementById('m2,6').value = 18;
			document.getElementById('m2,7').value = 19;
			document.getElementById('m2,8').value = 5;

			document.getElementById('m3,1').value = 20;
			document.getElementById('m3,2').value = 17;
			document.getElementById('m3,3').value = 20;
			document.getElementById('m3,4').value = 5;
			document.getElementById('m3,5').value = 14;
			document.getElementById('m3,6').value = 16;
			document.getElementById('m3,7').value = 17;
			document.getElementById('m3,8').value = 16;

			document.getElementById('m4,1').value = 2;
			document.getElementById('m4,2').value = 1;
			document.getElementById('m4,3').value = 3;
			document.getElementById('m4,4').value = 4.5;
			document.getElementById('m4,5').value = 0.5;
			document.getElementById('m4,6').value = 0.6;
			document.getElementById('m4,7').value = 0.95;
			break;

		case 5:
			numOrig = 3;
			numDest = 7;
			desenhaSistema();
			document.getElementById('m1,1').value = 19;
			document.getElementById('m1,2').value = 12;
			document.getElementById('m1,3').value = 20;
			document.getElementById('m1,4').value = 14;
			document.getElementById('m1,5').value = 49;
			document.getElementById('m1,6').value = 44;
			document.getElementById('m1,7').value = 38;
			document.getElementById('m1,8').value = 28;

			document.getElementById('m2,1').value = 29;
			document.getElementById('m2,2').value = 47;
			document.getElementById('m2,3').value = 23;
			document.getElementById('m2,4').value = 48;
			document.getElementById('m2,5').value = 13;
			document.getElementById('m2,6').value = 2;
			document.getElementById('m2,7').value = 49;
			document.getElementById('m2,8').value = 24;

			document.getElementById('m3,1').value = 40;
			document.getElementById('m3,2').value = 34;
			document.getElementById('m3,3').value = 39;
			document.getElementById('m3,4').value = 50;
			document.getElementById('m3,5').value = 19;
			document.getElementById('m3,6').value = 40;
			document.getElementById('m3,7').value = 23;
			document.getElementById('m3,8').value = 9;

			document.getElementById('m4,1').value = 31;
			document.getElementById('m4,2').value = 33;
			document.getElementById('m4,3').value = 30;
			document.getElementById('m4,4').value = 18;
			document.getElementById('m4,5').value = 40;
			document.getElementById('m4,6').value = 27;
			document.getElementById('m4,7').value = 19;
			break;

		case 6:
			numOrig = 5;
			numDest = 5;
			desenhaSistema();
			document.getElementById('m1,1').value = 24;
			document.getElementById('m1,2').value = 37;
			document.getElementById('m1,3').value = 45;
			document.getElementById('m1,4').value = 47;
			document.getElementById('m1,5').value = 23;
			document.getElementById('m1,6').value = 1;

			document.getElementById('m2,1').value = 30;
			document.getElementById('m2,2').value = 34;
			document.getElementById('m2,3').value = 22;
			document.getElementById('m2,4').value = 12;
			document.getElementById('m2,5').value = 45;
			document.getElementById('m2,6').value = 8;

			document.getElementById('m3,1').value = 3;
			document.getElementById('m3,2').value = 42;
			document.getElementById('m3,3').value = 36;
			document.getElementById('m3,4').value = 14;
			document.getElementById('m3,5').value = 19;
			document.getElementById('m3,6').value = 40;

			document.getElementById('m4,1').value = 44;
			document.getElementById('m4,2').value = 35;
			document.getElementById('m4,3').value = 16;
			document.getElementById('m4,4').value = 46;
			document.getElementById('m4,5').value = 37;
			document.getElementById('m4,6').value = 18;

			document.getElementById('m5,1').value = 47;
			document.getElementById('m5,2').value = 33;
			document.getElementById('m5,3').value = 27;
			document.getElementById('m5,4').value = 18;
			document.getElementById('m5,5').value = 14;
			document.getElementById('m5,6').value = 26;

			document.getElementById('m6,1').value = 34;
			document.getElementById('m6,2').value = 45;
			document.getElementById('m6,3').value = 5;
			document.getElementById('m6,4').value = 32;
			document.getElementById('m6,5').value = 6;
			break;

		case 7:
			numOrig = 4;
			numDest = 2;
			desenhaSistema();
			document.getElementById("m1,1").value = 49;
			document.getElementById("m1,2").value = 21;
			document.getElementById("m1,3").value = 7;

			document.getElementById("m2,1").value = 21;
			document.getElementById("m2,2").value = 22;
			document.getElementById("m2,3").value = 21;

			document.getElementById("m3,1").value = 33;
			document.getElementById("m3,2").value = 50;
			document.getElementById("m3,3").value = 18;

			document.getElementById("m4,1").value = 5;
			document.getElementById("m4,2").value = 19;
			document.getElementById("m4,3").value = 50;

			document.getElementById("m5,1").value = 5;
			document.getElementById("m5,2").value = 19;
			break;

		case 8:
			numOrig = 3;
			numDest = 4;
			desenhaSistema();
			document.getElementById("m1,1").value = 8;
			document.getElementById("m1,2").value = 35;
			document.getElementById("m1,3").value = 15;
			document.getElementById("m1,4").value = 22;
			document.getElementById("m1,5").value = 44;

			document.getElementById("m2,1").value = 42;
			document.getElementById("m2,2").value = 1;
			document.getElementById("m2,3").value = 16;
			document.getElementById("m2,4").value = 12;
			document.getElementById("m2,5").value = 19;

			document.getElementById("m3,1").value = 36;
			document.getElementById("m3,2").value = 16;
			document.getElementById("m3,3").value = 47;
			document.getElementById("m3,4").value = 45;
			document.getElementById("m3,5").value = 20;

			document.getElementById("m4,1").value = 9;
			document.getElementById("m4,2").value = 0;
			document.getElementById("m4,3").value = 44;
			document.getElementById("m4,4").value = 48;	
			break;		
	
	}

	document.getElementById('numVar').value = numOrig;
	document.getElementById('numRest').value = numDest;
}

function preencheZero() {
	var cont = 0;
	$('#matriz')
		.find('input')
		.each(function() {
			if($(this).val()=="") {
				$(this).val(0);
				cont++;
			}
		});
	//console.log(cont, numOrig, numDest);
	return ((numOrig*numDest) + numOrig + numDest - cont) == 0;
}

});