const mysql = require('mysql');
const dotenv = require('dotenv');
let instance = null;
dotenv.config();

const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT
});

connection.connect((err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('db ' + connection.state);
});


class DbService {
    static getDbServiceInstance() {
        return instance ? instance : new DbService();
    }

    async searchByOrganismName(organism_name) {
        try {
            const responseFromSequences = await new Promise((resolve, reject) => {
                const query1 = "SELECT * FROM sequences WHERE organism_name = ?;";

                connection.query(query1, [organism_name], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });

            
            
            const responseFromGenes = await new Promise((resolve, reject) => {
                const query2 = "SELECT * FROM genes;";

                connection.query(query2, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            })
            
            responseFromSequences.map(el => {
                el.gene_name = responseFromGenes.find(e => e.id===el.gene_id).name;
                el.protein_name = responseFromGenes.find(e => e.id===el.gene_id).protein_name;
            });
            
            return responseFromSequences;
        } catch (error) {
            console.error(error);
        }
    }

    async searchByGeneName(gene_name) {
        try {
            const responseFromGenes = await new Promise((resolve, reject) => {
                const query1 = "SELECT * FROM genes WHERE name = ?;";

                connection.query(query1, [gene_name], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });

            
            const responseFromSequences = await new Promise((resolve, reject) => {
                const query2 = "SELECT * FROM sequences WHERE gene_id = ?;";

                connection.query(query2, [responseFromGenes[0].id], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            })
            responseFromSequences.map(el => {
                el.gene_name = responseFromGenes[0].name;
                el.protein_name = responseFromGenes[0].protein_name;
            });
            
            return responseFromSequences;
        } catch (error) {
            console.error(error);
        }
    }

    async searchByProteinName(protein_name) {
        try {
            const responseFromGenes = await new Promise((resolve, reject) => {
                const query1 = "SELECT * FROM genes WHERE protein_name = ?;";

                connection.query(query1, [protein_name], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });

            
            const responseFromSequences = await new Promise((resolve, reject) => {
                const query2 = "SELECT * FROM sequences WHERE gene_id = ?;";

                connection.query(query2, [responseFromGenes[0].id], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            })
            responseFromSequences.map(el => {
                el.gene_name = responseFromGenes[0].name;
                el.protein_name = responseFromGenes[0].protein_name;
            });
            
            return responseFromSequences;
        } catch (error) {
            console.error(error);
        }
    }

    async searchByMotive(motive) {
        try {
            const responseFromSequences = await new Promise((resolve, reject) => {
                const query1 = "SELECT * FROM sequences;";

                connection.query(query1, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            
            const responseFromGenes = await new Promise((resolve, reject) => {
                const query2 = "SELECT * FROM genes;";

                connection.query(query2, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            })


            const result = responseFromSequences
            .filter(elem => elem.protein_sequence.includes(motive));
            

            result
            .map(el => {
                el.gene_name = responseFromGenes.find(e => e.id===el.gene_id).name;
                el.protein_name = responseFromGenes.find(e => e.id===el.gene_id).protein_name;
            });
            
        
            return result;
        } catch (error) {
            console.error(error);
        }
    }

    async searchAndAlign(sequence) {
        try {
            const responseFromSequences = await new Promise((resolve, reject) => {
                const query1 = "SELECT * FROM sequences;";

                connection.query(query1, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });
            
            const responseFromGenes = await new Promise((resolve, reject) => {
                const query2 = "SELECT * FROM genes;";

                connection.query(query2, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            })

            responseFromSequences.map((el) => {
                let startIndex = 0;
                for(let i=0; i<el.protein_sequence.length; i++){
                    if(el.protein_sequence.charAt(i) === sequence.charAt(0)){
                        startIndex = i;
                        break;
                    }
                }
                let coincidences = 0;
                let comparisons = 0;
                for(let index=startIndex; index<el.protein_sequence.length; index++){
                    comparisons ++;
                    if(el.protein_sequence.charAt(index) === sequence.charAt(index-startIndex)){
                        coincidences ++;
                    }
                }
                const percentOfCoincidences = 100.00-(((comparisons-coincidences)*100)/comparisons);
                el.coincidences = coincidences;
                el.percentOfCoincidences = percentOfCoincidences.toFixed(2);
            })

            const result = responseFromSequences
            .filter(elem => elem.percentOfCoincidences>30.00);

            result
            .map(el => {
                el.gene_name = responseFromGenes.find(e => e.id===el.gene_id).name;
                el.protein_name = responseFromGenes.find(e => e.id===el.gene_id).protein_name;
            });
        
            
            return result;
        } catch (error) {
            console.error(error);
        }
    }


    async insertNewSequence(sequence, organismName, geneName, proteinName) {
        try{
            const sequenceLength = sequence.length;

            const responseFromGenes = await new Promise((resolve, reject) => {
                const query2 = "SELECT * FROM genes;";

                connection.query(query2, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });

            const gene = responseFromGenes.find(el => el.name.toLowerCase()==geneName.toLowerCase());

            let geneId;

            if (gene) {
                geneId = gene.id;
            }else {
                const insertGene = await new Promise ((resolve, reject) => {
                    const query = "INSERT INTO genes (name, protein_name) VALUES (?,?);";
    
                    connection.query(query, [geneName, proteinName], (err, result) => {
                        if (err) reject(new Error(err.message));
                        resolve(result.insertId);
                    })
                });
                geneId = insertGene; 
            }

            const insertId = await new Promise ((resolve, reject) => {
                const query = "INSERT INTO sequences (protein_sequence, organism_name, gene_id, length) VALUES (?,?,?,?);";

                connection.query(query, [sequence, organismName, geneId, sequenceLength], (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result.insertId);
                })
            });
            console.log(insertId);
        }catch(error) {
            console.error(error);
        }
    }

}

module.exports = DbService;