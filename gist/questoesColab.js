/**
*	Adiciona funcoes extras no colabweb da disciplina TAP (2016/2).
*	@author Micael Levi L. C.
*	@version 11-21-2016, 13:20 (GTM-0400)
*	http://bit.ly/colabhack
*
*	status()              	=> retorna a quantidade de questoes resolvidas, erradas e indefindas.
* 	atualizarStatusBar()	=> (cria e) insere retorno da funcao 'status' na barra de informacoes.
*	corretas()	      	=> retorna o titulo das questoes corrigidas.
*	erradas()	      	=> retorna o titulo das questoes erradas.
*	pendentes()	      	=> retorna o titulo das questoes pendentes (nao enviadas ou erradas).
* 	tituloQuestoes()      	=> retorna o titulo de todas as questões (com o nome do arquivo/classe se o arguemento for 1 ou true).
* 	tituloQuestoes.save() 	=> salva em um arquivo (e nao mostra no console) de nome 'tituloQuestoes-hhmm.txt'.
* 	arquivosDasQuestoes() 	=> retorna os nomes dos arquivos de cada questao.
* 	toggleBar()           	=> altera a transparencia da barra de informacoes (menos/mais visivel, com transparencia 0.5).
* 	toggleBar.opacity()   	=> altera a transparencia padrao da barra de informacoes.
* 	maximizarStatus()     	=> maximiza as questoes com o status passado.
* 	minimizarStatus()     	=> minimiza as questoes com o status passado.
*	getUMLtext()		=> imprime o diagrama UML em modo texto (se existir).
*
* 	ATIVIDADE             	=> variavel que contem o titulo da ATIVIDADE.
* 	QTD                   	=> variavel que contem a quantidade de questoes.
**/


// FIXME:
// ======
// Atualizar cor no dialog quando for atualizar o status da questão (otimizar para nao precisar do .each).
// Remover funções inativas.
// Otimizar getUMLtext.
// Ao recuperar os titulos das questoes initDialog.

// TODO:
// =====
// Documentar todoas as funções.
// Função para obter toda a questão (para exportar futuramente, como pdf).
// $('#3').parents[0].textContent() retorna a questão 2 em forma de texto. OU $('#3').parent().text()
// $("div[id='0']") é a questão 1; .parent().text() é o conteúdo.
// Auto minimizar a questão quando status mudar para right
// $('.file-status').change(function(){ console.log( $(this).attr("status") ) })
// Alterar o click do botão que vai para questão, por um href com o id da questão. (#questionQ)
// http://stackoverflow.com/questions/179713/how-to-change-the-href-for-a-hyperlink-using-jquery
// $('.question-title').each(function(index){ questoes += "<a href='#question4' class='titulo-questoes' id='"+index+"'>" +$(this).text()+ "<br></a>"; });
// Marcar/desmarcar texto selecionado (nas questões);
// http://mir3z.github.io/texthighlighter/
// http://www.michaelpstone.net/development/jquery/highlight-and-capture-text-using-jquery/
// https://www.sitepoint.com/10-jquery-text-highlighter-plugins/
// Adicionar efeito "+X pontos", onde X corresponde aos pontos ganhos na questão enviada, que aparece e desaparece rapidamente (com .show.fadeOut(1000))
// https://api.jquery.com/select/
// Adicionar "teclas de atalho" ao pressionar o Alt (ou, meta key = M), para ativar os botões criados.
// Alterar exibição do parse UML para (ao clicar no botão) exibir uma caixa de texto para código Java, com opções de copiar, baixar e editar o código gerado (contento a classe completa).
// Criar função inicializadora de estados; criar função que salva a configuração atual num arquivo .xml ou .json (vide scrub_ajax/); importar configurações de um arquivo remoto.




function status(retornarFormatado){
	var resolvidas = $('.file-button-all[status="ok"]').length;
	var erradas = $('.file-button-all[status="error"]').length;
	var indefinidas = $('.file-button-all[status="not-submitted"]').length;

	var results = resolvidas + ':' + erradas + ':' + indefinidas; // resolvidas:erradas:indefinidas
	if(retornarFormatado) return results;
	results = `${resolvidas} correta(s)\n${erradas} errada(s)\n${indefinidas} indefinida(s)`;

	return results;
}
(function(status){
	status.show = function(naoMostrar){
		var objBarID = 'info-status';
		var $objBar = $('#'+objBarID);
		if( createBar(objBarID, 'info-grade-line', 'info-more') ){
			$objBar = $('#'+objBarID);

			$objBar.attr("colspan",5); // document.getElementById('info-status').setAttribute("colspan",5);
			$objBar.attr("style", "text-align: center");
			$objBar.css('font-size','12pt');
			$objBar.html('<span><nobr id="info-info-status"></nobr></span>');
		}

		if(naoMostrar) $objBar.hide();
		var info = status(1).replace(/(\d+):(\d+):(\d+)/, "$1 resolvida(s) $2 errada(s) $3 não enviada(s)");
		$('#info-info-status').html(info);
	}
})(status)
function atualizarStatusBar(naoMostrar){ status.show(naoMostrar); }


function corretas(){
	var results="";
	for(var i=0; i < QTD; i++){
		var questao = DATA.getElementsByClassName("question")[i];
		var status  = questao.getAttribute("status");
		if(status.localeCompare("right") == 0){
			var titulo = questao.getElementsByClassName("question-title")[0];
			results += titulo.innerHTML + "\n";
		}
	}
	results = results.slice(0, -1).replace(REGEX_REMOVE_HTML,"");

	return results;
}

function erradas(){
	var results="";
	for(var i=0; i < QTD; i++){
		var questao = DATA.getElementsByClassName("question")[i];
		var status  = questao.getAttribute("status");
		if(status.localeCompare("wrong") == 0){
			var titulo = questao.getElementsByClassName("question-title")[0].innerHTML;
			var pontos = '(' + questao.getElementsByClassName("question-grade")[0].innerHTML + ')';
			var erro = "ERRO:" + '[' + questao.getElementsByClassName("file-status")[0].innerHTML + ']';

			results += titulo.addAspas() + ' ' + erro + ' ' + pontos + "\n";
		}
	}
	results = results.slice(0, -1).replace(REGEX_REMOVE_HTML,"");

	return results.slice(1, -1);
}

function pendentes(){
	var results="";
	for(var i=0; i < QTD; i++){
		var questao = DATA.getElementsByClassName("question")[i];
		var status  = questao.getAttribute("status");
		if(status.localeCompare("undefined") == 0 || status.localeCompare("wrong") == 0){
			var titulo = questao.getElementsByClassName("question-title")[0].innerHTML;
			var pontos = '(' + questao.getElementsByClassName("question-grade")[0].innerHTML + ')';
			results += titulo.addAspas() + ' ' + pontos + "\n";
		}
	}
	results = results.slice(0, -1).replace(REGEX_REMOVE_HTML,"");

	return results;
}


function tituloQuestoes(mostrarNumero, mostrarArquivo){
	var results="";

	for(var i=0; i < QTD; i++){
		var questao = DATA.getElementsByClassName("question")[i];
		var status  = questao.getAttribute("status");
		var titulo = questao.getElementsByClassName("question-title")[0].innerHTML;
		var nomeArquivo = questao.getElementsByClassName("file")[0].getAttribute("file"); // .replace(/\.java/,"")

		if(mostrarNumero)
			titulo = titulo.replace(/Quest[^\d]*\s*(\d+)\s*[^\w]\s*(.*)/i, regexReplacerFormatado);
		else
			titulo = titulo.replace(/Quest[^\d]*\s*\d+\s*[^\w]\s*(.*)/i, "$1");

		titulo.addAspas();
		if(mostrarArquivo) titulo += " - " + nomeArquivo;

		results += titulo + "\n";
	}

	results = results.slice(0, -1).replace(REGEX_REMOVE_HTML,"");

	return results;
}
(function(tituloQuestoes){
	tituloQuestoes.save = function(mostrarNumero, mostrarArquivo){
		var data = tituloQuestoes(mostrarNumero, mostrarArquivo);

		if(!data){
			console.error('tituloQuestoes.save: Nenhum dado foi retornado.');
			return;
		}

		var date = new Date();
		var sufix = "-" + date.getHours() + date.getMinutes() + ".txt";
		var filename = ATIVIDADE.replace(/orat[óo]rio/, "").replace(/ /g,"") + sufix;

		if(typeof data === "object") data = JSON.stringify(data, undefined, 4);
		var blob = new Blob([data], {type: 'text'}),
				e    = document.createEvent('MouseEvents'),
				a    = document.createElement('a')

		a.download = filename;
		a.href = window.URL.createObjectURL(blob);
		a.dataset.downloadurl = ['text', a.download, a.href].join(':');
		a.download = filename
		a.href = window.URL.createObjectURL(blob)
		a.dataset.downloadurl = ['text/plain', a.download, a.href].join(':')

		e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		a.dispatchEvent(e);
	}
})(tituloQuestoes)


function arquivosDasQuestoes(){
	var results="";
	for(var i=0; i < QTD; ++i)
		results += document.getElementsByClassName("file")[i].getAttribute("file") + "\n";

	return results;
}


function toggleBar(){
	if(document.getElementById('grade-skills') == null){
		var styleBar = document.createElement('style');
		styleBar.type = 'text/css';
		styleBar.id = 'grade-skills';
		styleBar.innerHTML = '.info-grade-skills { opacity: 0.5; }';
		document.head.appendChild(styleBar);
	}

	var data = $('.info-grade-line');
	if(data.hasClass('info-grade-skills')) data.removeClass('info-grade-skills');
	else data.addClass('info-grade-skills');

	return styleBar;
}
(function(toggleBar){
	toggleBar.opacity = function(value){
		var element = document.getElementById('grade-skills');
		if(element == null) element = toggleBar();
		element.innerHTML = ".info-grade-skills { opacity: "+ value +"; }";
	}
})(toggleBar)



// ========================= [ AUXILIARES ] ========================= //

String.prototype.addAspas = function() {
    return this.replace(/^(.*)$/, "\"$1\"");
}


// https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/String/replace
function regexReplacerFormatado(match, number, title){
	return [number, title].join('_'); // => q_titulo da questao de numero q
}


// cria um table row e insere um table data com o id passado.
function createBar(dataid, classe, rowid){
	if(document.getElementById(dataid) != null) return false;
	var tableRef = document.getElementById('info-info').getElementsByTagName('tbody')[0];
	var newRow   = tableRef.insertRow(tableRef.rows.length);
	newRow.id = rowid;
	// appendTableDataOnBar(dataid, classe, rowid);

	// cria e insere um table data com o id x, na table row de id y na posicao final.
	var appendOnBar = function(idx, classx, idy){
		var row =  document.getElementById(idy);
		var newCell = row.insertCell(row.cells.length);
		newCell.id = idx;
		newCell.className = classx;
	}

	appendOnBar(dataid, classe, rowid);

	return true;
}


function createButton(id, title, element, func){
	if(document.getElementById(id) != null) return;
	var button = document.createElement("BUTTON");
	button.style.cursor = 'pointer';
	button.id = id;
	button.innerHTML = title;
	if(func) button.onclick = func;
	element.appendChild(button);
}


// estado = {"right", "wrong", "undefined"}
function maximizarStatus(estado, mostrar){
	if(mostrar){
		// $('.question[status='+estado+']').show();
		$(`.question[status="${estado}"]`).show();
		return;
	}

	$(`div[status=${estado}]`).each(function() {
		$(this).find(".maximize").each(function() {
			parent = $(this).parent();
			$(this).remove();
			labHeight = $(parent).data("labHeight");
			$(parent).prepend("<div class='minimize'><img src='res/minimize.png'/></div>").animate( { height: labHeight }, 200, function(){ $(this).css("height", "auto");} );
     		});
	});
}

function minimizarStatus(estado, esconder){
	if(esconder){
		// $('.question[status="'+estado+'"]').hide();
		$(`.question[status="${estado}"]`).hide();
		return;
	}

	$(`div[status=${estado}]`).each(function() {
		$(this).find(".minimize").each(function(){
			 parent = $(this).parent();
			 $(this).remove();
			 labHeight = $(parent).height();
			 $(parent).data("labHeight", labHeight).prepend("<div class='maximize'><img src='res/maximize.png'/></div>").animate( { height:"30px" }, 200);
		});
	});
}


// https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide/Regular_Expressions
function getUMLtext(tblID){
	if(tblID){
		var linhas = [], tags = ["classname","attributes","methods"];  // admite que o diagrama possui 3 grupos distintos.
		var i=1;

		$("#"+tblID).find('tbody').find('tr').each(function() {
			var chaves = "{}";
			var children = $(this).children();
			var linha = $(this).text();

			if(children.length > 1){ // admite que o elemento tem pelo menos 2 objetos (o ícone e o nome)
						var iconeSVG = $(this).children().first();

						/// FIXME otimizar esta parte (não usar for each):
						// (c) http://api.jquery.com/jquery.each/
						var modificadorAcesso = "";
						jQuery.each(MOD_ACESSO, function(i, val){
							if(iconeSVG.children().hasClass(val)){ // admite que os modificadores de acesso estão definidos nas classes das imagens.
				   	 			modificadorAcesso = `${val} `;
								return false;
							}
						})
						jQuery.each(SEM_IMPLEMENTAR, function(i, val){
							if(iconeSVG.children().hasClass(val)){ // admite que os modificadores de acesso estão definidos nas classes das imagens.
				   	 			chaves = ";";
								return false;
							}
						})


						if(linha.match(REGEX_ATRIBUTOS))
							linha = linha.replace(REGEX_ATRIBUTOS, "$2 $1;");
						else if(linha.match(REGEX_METODOS))
							linha = linha.replace(REGEX_METODOS,"$2 $1"+chaves);

						linha = `${modificadorAcesso}${linha}`.trim();
						if(!linhas.contains(linha)) linhas.push(linha);
			}
			else{
				if((linha.trim().length == 0) && (i < tags.length)){
					linhas.push(" ");
					i++;
				}
			}

		});
		// 		linhas = linhas.filter(v => v.length > 1);
		// 		console.log( linhas.join("\n")  );
		linhas.shift(); // remoção do nome da classe.
		linhas.shift(); // remoção da quebra de linha resultante.
		return linhas.join("\n");
	}
  return null;
}


function atualizarCoresQuestoesDialog(){
	$('.titulo-questoes').each(function(){
		var questionTitleID = $(this).attr("id");
		var cor = CORES.indefinida;

		// var statusDaQuestao = $(`.question-title[id="${questionTitleID}"]`).parent().attr("status").toLocaleLowerCase().trim();
		var statusDaQuestao = $('#questao'+questionTitleID).find('.file-button-all').attr("status");
		if(statusDaQuestao == STATUS.correta) cor = CORES.correta;
		else if(statusDaQuestao == STATUS.errada) cor = CORES.errada;
		$(`.titulo-questoes[id="${questionTitleID}"]`).css("color", cor);
	});
}


function toggleBarraExtra(){
	var barraExtra = $('#info-status');
	if( barraExtra.is(":visible") ) barraExtra.hide(100);
	else barraExtra.show(100);
}


// atualiza a ação do botão toggleCorretas.
function atualizarAcaoBotao(funcNova){
	// (c) http://stackoverflow.com/questions/17987607/using-jquery-attr-or-prop-to-set-attribute-value-not-working
	$.ajax({
		success: function (result) {
			$('#btnToggleCorretas').attr("onclick", funcNova);
	    }
	});
}


function alterarBotaoSair(){
	var botaoSairObject = $('#info-sair').find("nobr");
	var botaoSairInnerHTML = botaoSairObject.html();
	botaoSairObject.html(botaoSairInnerHTML.replace(/sair/i, "Voltar"));
}



// ========================= [ INICIALIZADORES ] ========================= //

// define id para as questões e tabelas de diagramas UML.
function initTitulosQuestoes(){
	$('.question-title').each(function(index){
		$(this).attr("id", index+1);
	});
	$('.question').each(function(index){
		$(this).attr("id", `questao${index+1}`);
		$(this).find('.uml-class').attr("id", `uml-${index+1}`);
	});
}

// inicializar alterações da grade.
function initGrade(){
	atualizarStatusBar();
  	document.getElementById('info-info-div').style.cursor = 'pointer';

	$('#info-info').click( function(){ // $('.info-grade-line')
		toggleBarraExtra();
	});
}

// inicializar criações e inserções dos botões
function initBotoes(){
	atualizarStatusBar(1);

	var barraGrande = document.getElementsByClassName('banner-table-title')[0];
	createButton('btnToggleTransparencia', "toggle transparência", barraGrande, toggleBar); // id,title,element,funcOnClick
	// createBar('info-toggle', 'info-grade-line', 'info-plus'); // id,class
	// var barraPlus = document.getElementById('info-toggle');
	// createButton('btnToggle', "toggle", barraPlus, toggleBar); // id,title,element,funcOnClick
	createButton('btnToggleCorretas', "esconder corretas", barraGrande, ''); // id,title,element,funcOnClick
	$('#btnToggleCorretas').attr('onclick', 'minimizarStatus("right",false)');

	$('#btnToggleCorretas').click(
		function(){
			// lblAtual  := button innerHTML name
			// max_min   := 'max' means maximizarStatus(), 'min' means minimizarStatus()

			var lblAtual = $(this).text();

			if( lblAtual.search("esconder") >= 0 ){
				lblAtual = "mostrar";
				max_min = "maximizar";
			}
			else{
				lblAtual = "esconder";
				max_min = "minimizar";
			}

			var funcNova = $('#btnToggleCorretas').attr("onclick").replace(/maximizar|minimizar/i, max_min);
			atualizarAcaoBotao(funcNova);

			$(this).html( $(this).text().replace(/\w+/, lblAtual) ); // atualiza o texto do botão.
	 	}
	);
}

// inicializar criação e inserção da checkbox
function initCheckbox(){
	var barraGrande = document.getElementsByClassName('banner-table-title')[0];
	var checador = null;
	if( (checador = document.getElementById('cbCorretas') ) == null)
	checador = document.createElement("INPUT");
	checador.type = "checkbox"; // checador.setAttribute("type", "checkbox");
	checador.id = "cbCorretas";
	checador.style.cursor = "pointer";
	barraGrande.appendChild(checador);

	$('#cbCorretas').change(function(){
		var estaMarcado = $(this).is(":checked");
		var funcNova = $('#btnToggleCorretas').attr("onclick").replace(/true|false/i, estaMarcado);
		atualizarAcaoBotao(funcNova);
	});
}

// inicializar e criar caixa de mensagem com as questões
function initDialog(){
	var barraGrande = document.getElementsByClassName('banner-table-title')[0];

	var objetoPai = document.createElement("DIV");
	var questoes="";

	// FIXME ir do botão ao parent com id 'question-title' para obter o título
	$('.file-button-all').each(function(){
		var parentQuestion = $(this).parent().parent().parent();
	  	var parentQuestionTitle = parentQuestion.find('.question-title').first();
		var index = parentQuestionTitle.attr("id");
		var arquivoDaQuestao = $(this).attr("file");
		var idLinkado = `#questao${index}`;
		var pontosGrade = $(idLinkado).find('.question-grade').text().replaceAll(" ","");
		questoes += `<a href="${idLinkado}" id="${index}" class='titulo-questoes'><b>${parentQuestionTitle.text()}</b> <i>(${arquivoDaQuestao})</i> ${(pontosGrade ? `= ${pontosGrade}` : "")}<br></a>`;

	});
	objetoPai.innerHTML = questoes;

	var dia = document.createElement("DIV");
	dia.title = ATIVIDADE;
	dia.id = "dialog-message";
	dia.appendChild(objetoPai);
	document.head.appendChild(dia);

	questoes = $('.question-title').text().replace(/quest/ig, "\n$&").substring(1);
	if( sistemaOperacional().indexOf("Win") >= 0 ) questoes = questoes.replace(/$/mg, '\r');

	createButton("btnQuestoes", "questões", barraGrande);
	var dialogQuestoes = $("#dialog-message").dialog({
				autoOpen: false,
				resizable: false,
				modal: true,
				width: 'auto',
				buttons: {
					Ok: function(){ $(this).dialog( "close" ); },
					Baixar: function(){ console.save(questoes, ATIVIDADE+'.txt'); }
				}});
	$('#btnQuestoes').click(function() { dialogQuestoes.dialog('open'); });

	// $('.question-title[id="4"]')
	// $('.titulo-questoes[id="4"]')
	$('.titulo-questoes').each(function(){ atualizarCoresQuestoesDialog(); });
	// $('.titulo-questoes').css('cursor', 'pointer');

	// Ao clicar na questão X de id X-1, vá para o objeto $('.question')[X-1]; $("span[id='0']") é a questão 1; .text() é o seu título.
	$('.titulo-questoes').click(function(){
		var qid = $(this).attr("id");
		$("#dialog-message").dialog("close");
		goTo(qid);
	});

}

// criando e setando botões nos diagramas.
function initParseUMLButton(){
  // (c) https://css-tricks.com/snippets/jquery/make-an-jquery-hasattr/
	$('.uml-class[id]').each(function(){
		var idCorrente = $(this).attr("id");
		var tabelaCorrente = document.getElementById(idCorrente);
		var buttonID = `btnGetText-${idCorrente}`;

		var parentUML = document.getElementById(idCorrente).parentElement;
		var elementoAlvo = parentUML;
		if("UMLCLASS".localeCompare(parentUML.nodeName) != 0) elementoAlvo = document.getElementById(idCorrente);

		if(elementoAlvo != null){
			createButton(buttonID, "parse UML", elementoAlvo);
			$('#'+buttonID).click(function(){
				var UMLtexto = getUMLtext(idCorrente).trim();
				console.info(`\n=========== [UML TRADUZIDO DA QUESTÃO ${idCorrente.replace(/[^\d]+(\d+)/, "$1")}] ===========`);
				console.log(UMLtexto);
				alert(UMLtexto);
			});
		}

	});
}

function initToggleColor(){
	/* "highlight" objetos com a tag 'li' quando o cursor estiver em cima.
	$("li").mouseover( function(){ $(this).css('background-color', 'yellow'); } )
	$("li").hover( function(){ $(this).css('background-color', ''); } )
	*/
	// (c) https://api.jquery.com/dblclick/
	$("li").dblclick( function(){
	  var corAtual = $(this).css('background-color');
	  if(corAtual != "transparent") corAtual = "transparent";
	  else corAtual = CORES.amarelado; // "#ffff7b"

	  $(this).css('background-color', corAtual);
	})
}

function initKeyEvents(){
	var ultimoDigitoValido = 48+QTD;

	// (c) https://css-tricks.com/snippets/javascript/javascript-keycodes/
	// (c) http://stackoverflow.com/questions/7999806/jquery-how-to-trigger-click-event-on-href-element
	document.addEventListener("keydown", function(event) {
		if(event.keyCode > 48 && event.keyCode <= ultimoDigitoValido){
			var ultimoDigitoApertado = event.keyCode - 48;
			var hyperlinkReferenceDigit = $(`.titulo-questoes[id=${ultimoDigitoApertado}]`).attr("href");
			if(typeof hyperlinkReferenceDigit != typeof undefined)
				window.location.href = hyperlinkReferenceDigit;
		}
		var ehOEsc = (event.keyCode == 27); // keycode da tecla Esc
		if(ehOEsc) toggleBarraExtra();
	});
}



// ========================= [ NAO AUTORAIS ] ========================= //

// (c) https://webdev.icomp.ufam.edu.br/lab/res/scripts.js
function alterarFileupload() {
    $("#fileupload").fileupload({
        dataType: "json",
        url: "",
        autoUpload: true,
        singleFileUploads: false,
        maxNumberOfFiles: 100,
        formData: { ajax_func: "checkFiles" },
        start: function (e) {
        },
        add: function(e, data) {
            qDiv = $(lastClickedButton).parents(".question");
            //qStatus = $(qDiv).find(".file-status");
            qStatus = $(qDiv).find(".file-status[file='" + lastClickedButtonFile + "']");
            $(qStatus).html("Verificando arquivo(s) ...");

            if (data.files.length > acceptedFiles.length) {
                $(qStatus).attr("status", "error").html("Quantidade de arquivos maior que o aceito!");
                return;
            }

            for (i=0; i<data.files.length; i++) {
                name = data.files[i].name;
                extension = name.substr(name.lastIndexOf(".")+1).toLowerCase();

                if (allowedExts.indexOf(extension) == -1) {
                    $(qStatus).attr("status", "error").html("Extensão de arquivo inválida (" + extension + ")!");
                    console.log("Extensao " + extension + " nao está em:");
                    console.log(allowedExts);
                    return;
                }

                if (acceptedFiles.indexOf(name) == -1) {
                    $(qStatus).attr("status", "error").html("Nome de arquivo inválido (" + name + ")!");
                    return;
                }

                if (data.files[i].size > 10000000) {
                    $(qStatus).attr("status", "error").html("Tamanho de arquivo maior que o permitido!");
                    return;
                }

            }

            for (i=0; i<data.files.length; i++) {
                name = data.files[i].name.substr(0, data.files[i].name.length-5);
                qDiv = $("#File_" + name).parents(".question");
                qStatus = $(qDiv).find(".file-status").attr("status", "unknown").html("Enviando e corrigindo arquivo ...");
                $(qDiv).attr("status", "unknown");
            }

            fileUploadRequest = data.submit();
            longExperimentsExecuting = true;
            if ($(lastClickedButton).hasAttr("time")) {
                longExperimentsTimer = setTimeout(function () { updateLongExperiments(2, $(lastClickedButton).attr("time"), false) }, 2000);
            } else {
                longExperimentsTimer = setTimeout(function () { updateLongExperiments(10, 10, true) }, 10000);
            }

        },
        drop: function (e, data) {
            lastClickedButton = $(".file-button").first();
        },
        done: function (e, data) {
            hideLongExperiments();

            qDiv = $(lastClickedButton).parents(".question");
            qStatus = $(qDiv).find(".file-status[file='" + lastClickedButtonFile + "']").attr("status", lastClickedButtonStatus).html(lastClickedButtonHtml);

            result = data.result;

            if (result.status == "ok") {
                for (var fileId in result.files) {
                    if (result.files.hasOwnProperty(fileId)) {
                        file = result.files[fileId];
                        //fDiv = $(".file[file='" + fileId + "']").attr("grade", file.grade).attr("grade-max", file.gradeMax);
                        $(".file-button-all[file='" + fileId + "']").attr("status", file.status).attr("grade", file.grade).attr("grade-max", file.gradeMax);
                        $(".file-status[file='" + fileId + "']").attr("status", file.status).html(file.statusMsg);
                        $(".file-messages[file='" + fileId + "']").html(file.fileMsg.replaceAll(" \\[NL\\] ", "<br>"));
                    }
                }
            }
            else {
                $(qStatus).attr("status", "error").html(result.message);
                $(qDiv).find(".file-button-all[file='" + lastClickedButtonFile + "']").attr("status", "error");
                $(qDiv).find(".file-messages[file='" + lastClickedButtonFile + "']").attr("status", "error").html("");
            }

            var atualizarStatus = ( lastClickedButtonStatus !==  qStatus.attr("status") );

            updateStatus();
	    if(atualizarStatus){
		     atualizarStatusBar();
		     atualizarCoresQuestoesDialog();
	    }

            if (typeof result.grade !== "undefined") {
                $("#grade").html(result.grade);
            }
            if (typeof result.countdown !== "undefined") {
                countdown = result.countdown;
                updateCountdown();
            }

            lastClickedButton = null;
            fileUploadRequest = null;
        },
        fail: function (e, data) {
            hideLongExperiments();
            qDiv = $(lastClickedButton).parents(".question");
            qStatus = $(qDiv).find(".file-status[file='" + lastClickedButtonFile + "']").attr("status", "error").html("Erro ao enviar aquivo!");
            lastClickedButton = null;
            fileUploadRequest = null;
        }
    });
}


// (c) http://stackoverflow.com/questions/11849562/how-to-save-the-output-of-a-console-logobject-to-a-file
(function(console){
console.save = function(data, filename){

    if(!data) {
        console.error('Console.save: No data')
        return;
    }

    if(!filename) filename = 'console.saved'

    if(typeof data === "object"){
        data = JSON.stringify(data, undefined, 4)
    }

    var blob = new Blob([data], {type: 'text/json'}),
        e    = document.createEvent('MouseEvents'),
        a    = document.createElement('a')

    a.download = filename
    a.href = window.URL.createObjectURL(blob)
    a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    a.dispatchEvent(e)
 }
})(console)


// (c) http://www.javascripter.net/faq/operatin.htm
// (c) http://stackoverflow.com/questions/7044944/jquery-javascript-to-detect-os-without-a-plugin
function sistemaOperacional(){
	/*
	var OSName="";
	if (navigator.appVersion.indexOf("Win")!=-1) OSName="Windows";
	if (navigator.appVersion.indexOf("Mac")!=-1) OSName="MacOS";
	if (navigator.appVersion.indexOf("X11")!=-1) OSName="UNIX";
	if (navigator.appVersion.indexOf("Linux")!=-1) OSName="Linux";
	return OSName;
	*/

	return navigator.platform; // {Win32, Linux x86_64, Mac}
}


// (c) http://stackoverflow.com/questions/13735912/anchor-jumping-by-using-javascript
// (c) http://stackoverflow.com/questions/6677035/jquery-scroll-to-element
function goTo(h){
	/*
	var top = document.getElementById(h).offsetTop; // = $('#'+h).offset().top;
	window.scrollTo(0, top);
	*/
	$('html, body').animate({
	    scrollTop: $('#'+h).offset().top
	}, 500);
}


// (c) https://css-tricks.com/snippets/javascript/javascript-array-contains/
// Array.prototype.[method name] allows you to define/overwrite an objects method
// needle is the item you are searching for
// this is a special variable that refers to "this" instance of an Array.
// returns true if needle is in the array, and false otherwise
Array.prototype.contains = function ( needle ) {
   for (i in this) {
       if (this[i] == needle) return true;
   }
   return false;
}



// ====================================== [ MAIN ] ====================================== //

if(document.URL.search("webdev.icomp") >= 0){

	if(typeof DATA == typeof undefined)
	 var DATA = document.getElementsByTagName("DIV")[6].getElementsByTagName("DIV")[1].getElementsByTagName("DIV")[0]; // o banco de questões.
	var QTD = DATA.getElementsByClassName("file-button-all").length; // quantidade de questões.
	var REGEX_REMOVE_HTML = new RegExp("<[^>]*>","g"); //// ==  /<[^>]*>/g
	var ATIVIDADE = document.getElementsByClassName('preface-title')[0].innerHTML;
	var REGEX_ATRIBUTOS = new RegExp("(\\w+):\\s*(.+)"); // .replace(REGEX_ATRIBUTOS, "$2 $1;").trim();
	var REGEX_METODOS   = new RegExp("(\\w+\\([^\\)]*\\))(?::\\s*(.+))?"); // .replace(REGEX_METODOS,"$2 $1{}").trim();

	var CORES = {"correta":'green', "ok":'green' , "errada":'red', "erro":'red', "indefinida":'lightgray', "desconhecida":'lightgray', "amarelado":'rgb(255, 255, 122)'};
	var MOD_ACESSO = ["public", "private", "protected", "default"];
	var SEM_IMPLEMENTAR = ["abstract"];
	var STATUS = {"correta":'ok', "errada":'error'}; // atributo de acordo com classe 'file-button-all'

	$(document).ready(function() {

		alterarBotaoSair(); // Altera o rótulo "Sair" para "Voltar" (manter coerência).

		initTitulosQuestoes();
		initParseUMLButton();
		initGrade();
		initBotoes();
		initCheckbox();
		initDialog();

		alterarFileupload(); // adicona verificador de status para atualizar a barra de status quando a questão alterar de status.
		initToggleColor(); // altera a cor de fundo dos objetos (da tag 'li') ao dar dois cliques sobre eles.
		initKeyEvents();
	});
}
else{
	alert("o script não foi injetado!");
}
