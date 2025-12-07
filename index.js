const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

morgan.token('body', (req, res) => {
  return JSON.stringify(req.body);
});

app.use(express.static('dist'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/info', (request, response) => {
  const now = new Date().toString()

  response.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${now}</p>
  `)
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(person => person.id === id)
  if (person) {
    response.json(person)
  } else {
    response.statusMessage = 'Requested person not found in persons'
    response.status(404).end()
  }
})

app.put('/api/persons/:id', (request, response) => {
  const id = request.params.id.toString()
  
  const idx = persons.findIndex((person) => {
      console.log(person.id, id);
    
      if (person.id === id) {
        return(true)
      } else {
        return(false)
      }
    }
  )  
  
  if (idx > -1) {
    persons[idx].number = request.params.number
    response.json(persons[idx])
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(persons => persons.id !== id)

  response.status(204).end()
})

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

const generateId = () => {
  let id = getRandomInt(1000).toString()
  while(persons.find(person => person.id === id)) {
    id = getRandomInt(1000).toString()
  }
  return(id)
}

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

  if (persons.find(person => person.name === body.name)) {
    return response.status(400).json({ 
      error: 'name must be unique' 
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  }
  console.log('new', person);
  
  persons = persons.concat(person)

  response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})