require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')


const app = express()

morgan.token('body', (req, res) => {
  return JSON.stringify(req.body);
});

app.use(express.static('dist'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(people => {
    response.json(people)
  })
})

app.get('/api/info', (request, response) => {
  const now = new Date().toString()
  Person.countDocuments({}).then(count => {
    response.send(`
      <p>Phonebook has info for ${count} people</p>
      <p>${now}</p>
    `)
  })
})

app.get('/api/persons/:id', (request, response) => {
  console.log(request.params.id);
  
  Person.findById(request.params.id.toString())
    .then(person => {
      response.json(person)
    })
    .catch(error => {
      response.statusMessage = 'Requested person not found in database'
      response.status(404).end()
    })
})

app.put('/api/persons/:id', (request, response) => {
  console.log(request.params.id.toString(), request.params.body);
  
  Person.findById(request.params.id.toString())
    .then(existingPerson => {
      console.log('found',existingPerson);
      
        existingPerson.number = request.body.number
        existingPerson.save().then(savedPerson => {
          console.log(savedPerson);    
          response.json(savedPerson)
        })
    })
    .catch(error => {
      response.statusMessage = 'Requested person not found in database'
      response.status(404).end()
    })
})

app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndDelete(request.params.id.toString())
  .then(deletedPerson => {
    response.status(204).end()
  })
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({ 
      error: 'name missing' 
    })
  }

  if (!body.number) {
    return response.status(400).json({ 
      error: 'number missing' 
    })
  }

  Person.find({name: body.name})
    .then(peopleArray => {
      if (peopleArray.length === 0) {
        const newPerson = new Person({
          name: body.name,
          number: body.number,
        })
  
        newPerson.save().then(savedPerson => {
          console.log(savedPerson);    
          response.json(savedPerson)
        })
      } else {
        return response.status(400).json({
          error: 'name must be unique' 
        })
      }    
    })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})