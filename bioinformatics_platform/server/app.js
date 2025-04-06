const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const dbService = require('./dbService');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended : false }));


app.get('/searchByOrganism/:organism_name', (request, response) => {
    const { organism_name } = request.params;
    const db = dbService.getDbServiceInstance();

    const result = db.searchByOrganismName(organism_name);
    
    result
    .then(data => response.json({data : data}))
    .catch(err => console.error(err));
});

app.get('/searchByGene/:gene_name', (request, response) => {
    const { gene_name } = request.params;
    const db = dbService.getDbServiceInstance();

    const result = db.searchByGeneName(gene_name);
    
    result
    .then(data => response.json({data : data}))
    .catch(err => console.error(err));
});

app.get('/searchByProtein/:protein_name', (request, response) => {
    const { protein_name } = request.params;
    const db = dbService.getDbServiceInstance();

    const result = db.searchByProteinName(protein_name);
    
    result
    .then(data => response.json({data : data}))
    .catch(err => console.error(err));
});

app.get('/searchByMotive/:motive', (request, response) => {
    const { motive } = request.params;
    const db = dbService.getDbServiceInstance();

    const result = db.searchByMotive(motive);
    
    result
    .then(data => response.json({data : data}))
    .catch(err => console.error(err));
});

app.get('/searchAndAlign/:sequence', (request, response) => {
    const { sequence } = request.params;
    const db = dbService.getDbServiceInstance();

    const result = db.searchAndAlign(sequence);
    
    result
    .then(data => response.json({data : data}))
    .catch(err => console.error(err));
});

app.post('/insert', (request, response) => {
    const { sequence, organismName, geneName, proteinName } = request.body;
    const db = dbService.getDbServiceInstance();

    const result = db.insertNewSequence(sequence, organismName, geneName, proteinName);

    result
    .then(data => response.json({success : true}))
    .catch(err => console.error(err));
});

app.listen(process.env.PORT, () => console.log('app is running'));