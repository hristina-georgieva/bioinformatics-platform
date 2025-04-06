// const { response } = require("express");


document.addEventListener('DOMContentLoaded', () => {

    document.addEventListener('click', e => {
  
        if (e.target.classList.contains('search-btn')) {
    
            const choice = document.querySelector("#options");
            const selectedValue = choice.options[choice.selectedIndex].value;

            const searchValue = document.querySelector('#search-input').value;

            if (selectedValue == "search-by-organism-name")
            {    
                fetch('http://localhost:5000/searchByOrganism/' + searchValue)
                .then(response => response.json())
                .then(data => loadHTMLTable(data['data']))
                .catch(err => console.error(err));

            }else if(selectedValue == "search-by-gene-name"){

                fetch('http://localhost:5000/searchByGene/' + searchValue)
                .then(response => response.json())
                .then(data => loadHTMLTable(data['data']))
                .catch(err => console.error(err));

            }else if(selectedValue == "search-by-protein-name"){
                
                fetch('http://localhost:5000/searchByProtein/' + searchValue)
                .then(response => response.json())
                .then(data => loadHTMLTable(data['data']))
                .catch(err => console.error(err));

            }else if(selectedValue === "search-by-motive"){
                
                fetch('http://localhost:5000/searchByMotive/' + searchValue)
                .then(response => response.json())
                .then(data => loadHTMLTable(data['data']))
                .catch(err => console.error(err));
            }
        }

        if (e.target.classList.contains('blast-btn')) {        
                let sequence = document.querySelector('#blast-input').value;

                if(checkIfIsDNASequence(sequence)){
                    const dna = sequence;
                    const protein = translation(dna.toUpperCase());
                    sequence = protein;
                }

                fetch('http://localhost:5000/searchAndAlign/' + sequence)
                .then(response => response.json())
                .then(data => loadHTMLTable(data['data']))
                .catch(err => console.error(err));
        }

        if (e.target.classList.contains('align-sequences-btn')) {
                    
            const searchValues = document.querySelector('#align-sequences-input').value;
            const [sequenceOne, sequenceTwo] = searchValues.split(',');                       
            const result = pairwiseAlign(sequenceOne, sequenceTwo);
            document.querySelector('#align-result').value = result;
            autoResize(document.querySelector('#align-result'));
        }

        if (e.target.classList.contains('transcription')) {
            const dna = document.querySelector('#DNA').value;
            let mRNA = transcription(dna);
            document.querySelector('#mRNA').value = mRNA;
            autoResize(document.querySelector('#mRNA'));
        }
        if (e.target.classList.contains('translation')) {
            let dna = document.querySelector('#DNA').value.toUpperCase();
            let protein = translation(dna);
            document.querySelector('#protein').value = protein;
            autoResize(document.querySelector('#protein'));
        }
        if (e.target.classList.contains('insert-sequence-btn')) {
            let sequence = document.querySelector('#new-sequence-input').value.toUpperCase();
            let organismName = document.querySelector('#new-organism-name-input').value;
            let geneName = document.querySelector('#new-gene-name-input').value;
            let proteinName = document.querySelector('#new-protein-name-input').value;

            if(checkIfIsDNASequence(sequence)){
                const dna = sequence;
                const protein = translation(dna.toUpperCase());
                sequence = protein;
            }
           
            document.querySelector('#new-sequence-input').value = "";
            document.querySelector('#new-organism-name-input').value = "";
            document.querySelector('#new-gene-name-input').value = "";
            document.querySelector('#new-protein-name-input').value = "";

            fetch('http://localhost:5000/insert', {
                headers: {
                    'Content-type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({
                    sequence: sequence,
                    organismName: organismName,
                    geneName: geneName,
                    proteinName: proteinName
                })
            })
            .then(response => response.json())
            .catch(err => console.error(err));
        }
    })
    
    });


function autoResize(textarea) {
    textarea.style.height = 'auto'; 
    textarea.style.height = textarea.scrollHeight + 'px'; 
}

function pairwiseAlign (sequenceOne, sequenceTwo) {
    let coincidences = '';
    let maxLength = 0;

    if(sequenceOne.length >= sequenceTwo.length){
        maxLength = sequenceOne.length;
        for(let i=0; i<sequenceTwo.length; i++){
            const charFrom1 = sequenceOne.charAt(i);
            const charFrom2 = sequenceTwo.charAt(i);
            if(charFrom1 === charFrom2){
                coincidences += "|";
            }else if((charFrom1.toLowerCase()==='a'&&charFrom2.toLowerCase()==='t') || 
                (charFrom1.toLowerCase()==='t'&&charFrom2.toLowerCase()==='a') ||
                (charFrom1.toLowerCase()==='c'&&charFrom2.toLowerCase()==='g') ||
                (charFrom1.toLowerCase()==='g'&&charFrom2.toLowerCase()==='c')){
                    coincidences += "*";
            }else{
                coincidences += ' ';
            }
        }
    }else{
        maxLength = sequenceTwo.length;
        for(let i=0; i<sequenceOne.length; i++){
            const charFrom1 = sequenceOne.charAt(i);
            const charFrom2 = sequenceTwo.charAt(i);
            if(sequenceOne.charAt(i) === sequenceTwo.charAt(i)){
                coincidences += "|";
            }else if((charFrom1.toLowerCase()==='a'&&charFrom2.toLowerCase()==='t') || 
                (charFrom1.toLowerCase()==='t'&&charFrom2.toLowerCase()==='a') ||
                (charFrom1.toLowerCase()==='c'&&charFrom2.toLowerCase()==='g') ||
                (charFrom1.toLowerCase()==='g'&&charFrom2.toLowerCase()==='c')){
                    coincidences += "*";
            }else{
                coincidences += ' ';
            }
        }
    }

    
    if(sequenceOne.length <= 150 && sequenceTwo.length <= 150){
        return `${sequenceOne}\n${coincidences}\n${sequenceTwo}`;
    }else{
        let result = '';
        let start = 0;
        let end = 150;
        for(let i=0; i<Math.ceil(maxLength / 150); i++){
            result += `${sequenceOne.slice(start, end)}\n${coincidences.slice(start, end)}\n${sequenceTwo.slice(start, end)}\n\n`;
            start += 150;
            end += 150;
        }
        
        return result;
    }
}

function checkIfIsDNASequence(sequence) {
    return /^[ATGC]+$/i.test(sequence);
}
  
function transcription (dna) {
    let mRNA = '';
    for(let i=0; i<dna.length; i++){
        if(dna.charAt(i).toUpperCase()==='A'){
            mRNA += 'A';
        }else if(dna.charAt(i).toUpperCase()==='G'){
            mRNA += 'G';
        }else if(dna.charAt(i).toUpperCase()==='C'){
            mRNA += 'C';
        }else if(dna.charAt(i).toUpperCase()==='T'){
            mRNA += 'U';
        }
    }
    return mRNA;
}

function translation (DNA) {
    let protein = '';

    const DNALength = DNA.length;
    for(let i=0; i<DNALength/3; i++){
        const firstThree = DNA.slice(0, 3);
        DNA = DNA.slice(3);
        if(DNA.length === 1 || DNA.length === 2){
            break;
        }
        if(firstThree.charAt(0) === 'A'){
            if(firstThree.charAt(1) === 'G'){
                if(firstThree.charAt(2) === 'G' || firstThree.charAt(2) === 'A'){
                    protein += 'R';
                }else if(firstThree.charAt(2) === 'C' || firstThree.charAt(2) === 'T'){
                    protein += 'S';
                }
            }else if(firstThree.charAt(1) === 'A'){
                if(firstThree.charAt(2) === 'G' || firstThree.charAt(2) === 'A'){
                    protein += 'K';
                }else if(firstThree.charAt(2) === 'C' || firstThree.charAt(2) === 'T'){
                    protein += 'N';
                }
            }else if(firstThree.charAt(1) === 'C'){
                if(firstThree.charAt(2) === 'G' || firstThree.charAt(2) === 'A' || firstThree.charAt(2) === 'C' || firstThree.charAt(2) === 'T'){
                    protein += 'T';
                }
            }else if(firstThree.charAt(1) === 'T'){
                if(firstThree.charAt(2) === 'G'){
                    protein += 'M';
                }else if(firstThree.charAt(2) === 'A' || firstThree.charAt(2) === 'C' || firstThree.charAt(2) === 'T'){
                    protein += 'I';
                }
            }
        }else if(firstThree.charAt(0) === 'C'){
            if(firstThree.charAt(1) === 'G'){
                if(firstThree.charAt(2) === 'G' || firstThree.charAt(2) === 'A' || firstThree.charAt(2) === 'C' || firstThree.charAt(2) === 'T'){
                    protein += 'R';
                }
            }else if(firstThree.charAt(1) === 'A'){
                if(firstThree.charAt(2) === 'G' || firstThree.charAt(2) === 'A'){
                    protein += 'Q';
                }else if(firstThree.charAt(2) === 'C' || firstThree.charAt(2) === 'T'){
                    protein += 'H';
                }
            }else if(firstThree.charAt(1) === 'C'){
                if(firstThree.charAt(2) === 'G' || firstThree.charAt(2) === 'A' || firstThree.charAt(2) === 'C' || firstThree.charAt(2) === 'T'){
                    protein += 'P';
                }
            }else if(firstThree.charAt(1) === 'T'){
                if(firstThree.charAt(2) === 'G' || firstThree.charAt(2) === 'A' || firstThree.charAt(2) === 'C' || firstThree.charAt(2) === 'T'){
                    protein += 'L';
                }
            }
        }else if(firstThree.charAt(0) === 'T'){
            if(firstThree.charAt(1) === 'G'){
                if(firstThree.charAt(2) === 'G'){
                    protein += 'W';
                }else if(firstThree.charAt(2) === 'A'){
                    protein += '';
                }else if(firstThree.charAt(2) === 'C' || firstThree.charAt(2) === 'T'){
                    protein += 'C';
                }
            }else if(firstThree.charAt(1) === 'A'){
                if(firstThree.charAt(2) === 'G' || firstThree.charAt(2) === 'A'){
                    protein += '';
                }else if(firstThree.charAt(2) === 'C' || firstThree.charAt(2) === 'T'){
                    protein += 'Y';
                }
            }else if(firstThree.charAt(1) === 'C'){
                if(firstThree.charAt(2) === 'G' || firstThree.charAt(2) === 'A' || firstThree.charAt(2) === 'C' || firstThree.charAt(2) === 'T'){
                    protein += 'S';
                }
            }else if(firstThree.charAt(1) === 'T'){
                if(firstThree.charAt(2) === 'G' || firstThree.charAt(2) === 'A'){
                    protein += 'L';
                }else if(firstThree.charAt(2) === 'C' || firstThree.charAt(2) === 'T'){
                    protein += 'F';
                }
            }
        }else if(firstThree.charAt(0) === 'G'){
            if(firstThree.charAt(1) === 'G'){
                if(firstThree.charAt(2) === 'G' || firstThree.charAt(2) === 'A' || firstThree.charAt(2) === 'C' || firstThree.charAt(2) === 'T'){
                    protein += 'G';
                }
            }else if(firstThree.charAt(1) === 'A'){
                if(firstThree.charAt(2) === 'G' || firstThree.charAt(2) === 'A'){
                    protein += 'E';
                }else if(firstThree.charAt(2) === 'C' || firstThree.charAt(2) === 'T'){
                    protein += 'D';
                }
            }else if(firstThree.charAt(1) === 'C'){
                if(firstThree.charAt(2) === 'G' || firstThree.charAt(2) === 'A' || firstThree.charAt(2) === 'C' || firstThree.charAt(2) === 'T'){
                    protein += 'A';
                }
            }else if(firstThree.charAt(1) === 'T'){
                if(firstThree.charAt(2) === 'G' || firstThree.charAt(2) === 'A' || firstThree.charAt(2) === 'C' || firstThree.charAt(2) === 'T'){
                    protein += 'V';
                }
            }
        }
    }
    return protein;
}

function loadHTMLTable(data) {
    const table = document.querySelector('table tbody');

    if (data.length === 0) {
        table.innerHTML = "<tr><td class='no-data' colspan='5'>Няма намерени резултати!</td></tr>";
        return;
    }

    let tableHtml = "";

    data.forEach(function ({id, protein_sequence, organism_name, gene_name, protein_name, length, coincidences, percentOfCoincidences}) {
        tableHtml += "<tr>";
        tableHtml += `<td>${id}</td>`;
        tableHtml += `<td margin="20px">${protein_sequence}</td>`;
        tableHtml += `<td>${organism_name}</td>`;
        tableHtml += `<td>${gene_name}</td>`;
        tableHtml += `<td>${protein_name}</td>`;
        tableHtml += `<td>${length}</td>`;
        if(coincidences){
            tableHtml += `<td>${coincidences}</td>`;
        }
        if(percentOfCoincidences){
            tableHtml += `<td>${percentOfCoincidences}</td>`;
        }
        tableHtml += "</tr>";
    });

    table.innerHTML = tableHtml;
}
