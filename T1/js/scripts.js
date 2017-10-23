$(document).ready(function() {

	var numVar;
	var numRest;
	var numVarPadrao;
	var matriz = [];
	var b = [];

	var $div_f = $('#func');
	var $div_m = $('#matriz');

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
		$div_f.append('<label for="cell"><input type="number" id="f'+j+'" class="cell" placeholder="1" min="0" data-minlength="1" required><span class="spaced">.x<sub>'+(j+1)+ '</sub></span></label>');
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
				$row.append('<label for="cell"><input type="number" id="m'+i+','+j+'" class="cell" placeholder="0" required><span class="spaced">.x<sub>'+(j+1)+ '</sub> + </span></label>&nbsp;');
			else{
				$row.append('&nbsp;<label for="cell"><input type="number" id="m'+i+','+j+'" class="cell" placeholder="0" required><span>.x<sub>'+(j+1)+ '</sub></span></label>');
				$row.append('&nbsp;<select class="cell" id="signal'+i+'"><option selected>&le;</option><option>=</option><option>&ge;</option></select>')
				$row.append('&nbsp;<label for="cell"><input type="number" id="b'+i+'" class="cell" placeholder="0" required>&nbsp;<span>(b<sub>' + (i+1) +' </sub>)</span></label>');
			}
		}
		$div_m.append($row);
	}
	$last_row = $('<div class="col-sm-12"><strong>x</strong> &ge; 0</div>');
	$div_m.append($last_row);

}

function formaPadrao() {

	validation();

	numVarPadrao = numVar;

	$('#matriz').find('select').each(function() {
		if($(this).prop('selectedIndex') < 2) //>=: 0 =: 1 >=: 2
			numVarPadrao++;
		else
			numVarPadrao += 2;
	});

	var custos = [];
	var base = [];
	var proxInd = numVar;

	for(var i=0; i < numRest; i++) {
		matriz[i] = [];
		b[i] = $('#matriz').find('div').eq(i).find('input').last().val();
		var mudarLinha = 1;
		for(var j=0; j < numVarPadrao; j++) {
			if(j < numVar) {
				matriz[i][j] = $('#matriz').find('div').eq(i).find('input').eq(j).val();
				if(i == 0)
					custos.push(parseInt($('#funcform').find('input').eq(j).val(), 10));
			}
			else {
				if(j != proxInd || !mudarLinha) {
					matriz[i][j] = 0;
				}
				else {
					mudarLinha = 0;
					switch($('#matriz').find('select').eq(i).prop('selectedIndex')) {
					case 0:
						matriz[i][proxInd++] = 1;
						custos.push(0);
						base.push(j);
						break;
					case 1:
						matriz[i][proxInd++] = 1;
						custos.push(Number.MAX_SAFE_INTEGER);
						base.push(j);
						break;
					case 2:
						matriz[i][proxInd++] = -1;
						custos.push(0);
						matriz[i][proxInd++] = 1;
						base.push(j);
						custos.push(Number.MAX_SAFE_INTEGER);
						j++;
						break;
					default:
						alert("Erro na forma padrão" + i + "," + j);
						break;
					}
				}
			}
		}
	}
}

$('#limpar').click(function() {
	$('#funcform, #dados').trigger("reset");
	$('#resultado').collapse('hide');
});

$('#calculate').click(function() {
	formaPadrao();
	$('#resultado').collapse();
})

$('input').on('focusout', function() {
	value = $(this).val();
	min = $(this).attr('min');
	if(value < min || value == '')
		$(this).val(min);
});



function validation() {

	$('#funcform')
		.find('input[type=number]')
		.each(function() {
			if($(this).val()=="" || $(this).val() < 0)
			$(this).val(1);});

	$('#matriz')
		.find('input[type=number]')
		.each(function() {
			if($(this).val()=="" || $(this).val() < 0)
			$(this).val(0);});
}

});