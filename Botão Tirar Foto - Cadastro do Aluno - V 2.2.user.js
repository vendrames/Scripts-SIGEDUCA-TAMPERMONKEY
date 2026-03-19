// ==UserScript==
// @name         Botão Tirar Foto - Cadastro do Aluno
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  Inserção do botão "Tirar foto" e instruções de ajuda para o Firefox.
// @author       Vitor Vendrame / Gemini
// @match        *://sigeduca.seduc.mt.gov.br/ged/hwtmgedaluno.aspx?*
// @icon         https://cdn-icons-png.flaticon.com/16/4181/4181788.png
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const style = document.createElement('style');
    style.innerHTML = `
        #UPLOADIFYFOTOContainer { margin: 0 !important; padding: 0 !important; height: auto !important; }
        
        .container-botoes-foto { 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            gap: 5px; 
            margin-top: 2px;
        }

        #btn-tirar-foto-aluno {
            background-color: #ff9800 !important;
            color: #ffffff !important;
            border: 1px solid #e68a00 !important;
            width: 130px !important;
            height: 30px !important;
            border-radius: 4px !important;
            font-family: Verdana, Arial, sans-serif !important;
            font-size: 15px !important;
            cursor: pointer;
        }

        #help-icon-camera {
            cursor: help;
            width: 18px;
            height: 18px;
        }

        #camera-modal {
            display: none; position: fixed; z-index: 9999;
            left: 0; top: 0; width: 100%; height: 100%;
            background-color: rgba(0,0,0,0.8); align-items: center; justify-content: center;
        }
        #camera-container { background: white; padding: 20px; border-radius: 8px; text-align: center; }
        video { width: 320px; height: 240px; border: 2px solid #ccc; display: block; margin-bottom: 10px; background: #000; }
        .btn-capture { background: #27ae60; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; font-weight: bold; }
        .btn-close { background: #c0392b; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; margin-left: 10px; }
    `;
    document.head.appendChild(style);

    const modal = document.createElement('div');
    modal.id = 'camera-modal';
    modal.innerHTML = `
        <div id="camera-container">
            <h3 style="margin-top:0">Capturar Foto</h3>
            <video id="video-preview" autoplay playsinline></video>
            <button class="btn-capture" id="capture-snapshot">Capturar</button>
            <button class="btn-close" id="close-camera">Cancelar</button>
            <canvas id="snapshot-canvas" style="display:none;" width="320" height="240"></canvas>
        </div>
    `;
    document.body.appendChild(modal);

    let currentStream = null;

    const mostrarAjuda = () => {
        const msg = `Passo a Passo no Firefox:\n\n` +
                    `1. Digite about:config na barra de endereços e aperte Enter.\n` +
                    `2. Clique no botão "Aceitar o risco e continuar".\n` +
                    `3. Na barra de pesquisa, cole: media.devices.insecure.enabled\n` +
                    `4. Altere o valor para true clicando no botão de alternar.\n` +
                    `5. Agora, procure por: media.getusermedia.insecure.enabled\n` +
                    `6. Mude também para true.\n` +
                    `7. Reinicie o Firefox e tente clicar no botão "Tirar foto" novamente.`;
        alert(msg);
    };

    const startCamera = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("O navegador bloqueou a câmera por este site não ser seguro (HTTP).\n\nPor favor, clique no ícone de interrogação ao lado para ver as instruções.");
            return;
        }
        try {
            currentStream = await navigator.mediaDevices.getUserMedia({ video: true });
            document.getElementById('video-preview').srcObject = currentStream;
            modal.style.display = 'flex';
        } catch (err) {
            alert("Erro ao abrir a câmera: " + err.message);
        }
    };

    const stopCamera = () => {
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }
        modal.style.display = 'none';
    };

    const takePhoto = () => {
        const video = document.getElementById('video-preview');
        const canvas = document.getElementById('snapshot-canvas');
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, 320, 240);
        const dataURL = canvas.toDataURL('image/png');
        const imgAluno = document.querySelector('img[id*="FOTOALUNO"]');
        if (imgAluno) { imgAluno.src = dataURL; }
        stopCamera();
    };

    const inserirElementos = () => {
        const containerOriginal = document.getElementById('UPLOADIFYFOTOContainer');
        if (containerOriginal && !document.getElementById('btn-tirar-foto-aluno')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'container-botoes-foto';

            const btnTirar = document.createElement('button');
            btnTirar.id = 'btn-tirar-foto-aluno';
            btnTirar.innerText = 'Tirar foto';
            btnTirar.onclick = (e) => { e.preventDefault(); startCamera(); };

            const imgAjuda = document.createElement('img');
            imgAjuda.id = 'help-icon-camera';
            imgAjuda.src = 'https://cdn-icons-png.flaticon.com/32/471/471664.png'; // Ícone de interrogação
            imgAjuda.title = 'Instrução para permissão da câmera no navegador Firefox';
            imgAjuda.onclick = (e) => { e.preventDefault(); mostrarAjuda(); };

            wrapper.appendChild(btnTirar);
            wrapper.appendChild(imgAjuda);
            containerOriginal.insertAdjacentElement('afterend', wrapper);
        }
    };

    document.getElementById('capture-snapshot').onclick = takePhoto;
    document.getElementById('close-camera').onclick = stopCamera;

    setInterval(() => {
        if (document.getElementById('UPLOADIFYFOTOContainer')) inserirElementos();
    }, 1000);
})();
