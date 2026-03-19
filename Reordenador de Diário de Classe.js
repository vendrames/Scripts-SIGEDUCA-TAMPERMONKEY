// ==UserScript==
// @name         Reordenador de Diário de Classe
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Ordena a lista de alunos do diário de classe por ordem alfabética e preenche os campos de posição.
// @author       Vitor Vendrame / Gemini
// @match        http://sigeduca.seduc.mt.gov.br/ged/hwreordenardiario.aspx?HWGedBoletim.aspx*
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @icon         https://cdn-icons-png.flaticon.com/512/5405/5405989.png
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function reordenarLista() {
        let linhasDados = [];
        let tabela = document.querySelector('table[id*="Grid"]') || document.querySelector('.GridWithPaginationContainer');

        if (!tabela) {
            alert("Tabela não encontrada. Aguarde o carregamento total.");
            return;
        }

        $(tabela).find('tr').each(function(i) {
            if (i === 0) return;
            let $linha = $(this);
            let input = $linha.find('input[type="text"]').first();
            let nomeAluno = $linha.find('span[id*="ALUNOM"]').text().trim();
            
            if (!nomeAluno) {
                let spans = $linha.find('span');
                spans.each(function() {
                    let txt = $(this).text().trim();
                    if (txt.length > nomeAluno.length) nomeAluno = txt;
                });
            }

            if (input.length > 0 && nomeAluno.length > 5) {
                linhasDados.push({ nome: nomeAluno, elemento: input[0] });
            }
        });

        linhasDados.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

        linhasDados.forEach((item, index) => {
            item.elemento.value = index + 1;
            item.elemento.dispatchEvent(new Event('change', { bubbles: true }));
            item.elemento.dispatchEvent(new Event('blur', { bubbles: true }));
        });

        alert("Ordenação de " + linhasDados.length + " alunos concluída!");
    }

    function injetarBotao() {
        if (document.getElementById('btnreordenar')) return;

        let btnConfirmar = document.getElementById('BTNCONFIRMAR') || 
                           document.querySelector('input[value="Confirmar"]') ||
                           document.querySelector('input[name="BTNCONFIRMAR"]');

        if (btnConfirmar) {
            let btnReorder = document.createElement("button"); // Mudamos para <button> para aceitar imagem dentro
            btnReorder.id = "btnreordenar";
            
            // Ícone de ordenação do flaticon (Base64)
            const iconUrl = "https://cdn-icons-png.flaticon.com/16/5405/5405989.png";

            btnReorder.innerHTML = `<img src="${iconUrl}" style="width:14px; height:14px; vertical-align:middle; margin-right:5px;"> Reordenar`;
            
            // Aplicamos a classe para manter o padrão
            btnReorder.className = btnConfirmar.className; 
            
            const estilo = window.getComputedStyle(btnConfirmar);
            
            // Estilização para ficar idêntico aos outros e aceitar o ícone
            btnReorder.style.cssText = `
                font-family: ${estilo.fontFamily} !important;
                font-size: ${estilo.fontSize} !important;
                font-weight: bold !important;
                padding: 0 10px !important; /* Ajustado para alinhar com o Confirmar */
                height: ${estilo.height} !important;
                margin-left: 10px !important;
                cursor: pointer !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                background-image: none !important; 
                background-color: #f1f1f1 !important; 
                color: #000000 !important;
                border: 1px solid #707070 !important;
                border-radius: 2px !important;
                width: auto !important;
                min-width: 80px !important;
            `;

            btnReorder.onclick = (e) => {
                e.preventDefault();
                reordenarLista();
            };

            btnConfirmar.parentNode.insertBefore(btnReorder, btnConfirmar.nextSibling);
        }
    }

    setTimeout(injetarBotao, 1500);
    setInterval(injetarBotao, 3000);
})();