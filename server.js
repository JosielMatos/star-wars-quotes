const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient
require('dotenv').config()

MongoClient.connect(process.env.DB_STRING, {useUnifiedTopology: true})
.then(client => {
    console.log('Connected to Database')
    const db = client.db('star-wars-quotes')
    const quotesCollection = db.collection('quotes')
    const port = process.env.PORT || 3000

    app.set('view engine', 'ejs')

    app.use(express.urlencoded({ extended: true }))
    app.use(express.json())
    app.use(express.static('public'))

    app.get('/', (req, res) => {
        db.collection('quotes').find().toArray()
            .then(results => {
                res.render('index.ejs', {quotes: results})
            })
            .catch(error => console.error(error))
    })

    app.post('/quotes', (req, res) => {
        quotesCollection.insertOne(req.body)
            .then(result => {
                res.redirect('/')
            })
            .catch(error => console.error(error))
    })

    app.put('/quotes', (req, res) => {
        quotesCollection.findOneAndUpdate(
            { name: 'Yoda' },
            {
                $set: {
                    name: req.body.name,
                    quote: req.body.quote
                }
            },
            {
                upsert: true
            }
        ).then(result => {
            res.json('Success')
        })
        .catch(error => console.error(error))
    })

    app.delete('/quotes', (req, res) => {
        quotesCollection.deleteOne(
            { name: req.body.name }
        ).then(result => {
            if (result.deletedCount === 0) {
                return res.json('No quote to delete')
            }
            res.json(`Deleted Darth Vader's quote`)
        }).catch(error => console.error(error))
    })

    app.listen(port, function() {
        console.log(`listening on ${port}`)
    })
}).catch(error => console.error(error))

