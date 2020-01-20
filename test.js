const express = require('express')
const app = express()
app.use(express.json())
const books = [
    {title: 'Harry Potter', id: 1},
    {title: 'Twilight', id: 2},
    {title: 'Lorien Legacies', id: 3}
 ]

//READ Request Handlers
app.get('/test', (req, res) => {
    res.send('aSpArAgUs');
    });
     
app.get('/api/books', (req,res)=> {
    res.send(books);
        });

//PORT ENVIRONMENT VARIABLE
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}..`));

 