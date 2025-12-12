require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')

const app = express()

morgan.token('body', (req) => {
  return JSON.stringify(req.body)
})

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

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  console.log(body)

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

  Person.find({ name: body.name })
    .then(peopleArray => {
      if (peopleArray.length === 0) {
        const newPerson = new Person({
          name: body.name,
          number: body.number,
        })

        newPerson.save()
          .then(savedPerson => {
            console.log(savedPerson)
            response.json(savedPerson)
          })
          .catch(error => next(error))
      } else {
        return response.status(400).json({
          error: 'name must be unique'
        })
      }
    })
})

app.put('/api/persons/:id', (request, response, next) => {
  console.log(request.params.id.toString(), request.params.body)

  Person.findById(request.params.id.toString())
    .then(existingPerson => {
      if (!existingPerson) {
        console.log('put, not in db', request.body)
        return response.status(404).end()
      }
      existingPerson.number = request.body.number
      existingPerson.save()
        .then(savedPerson => {
          console.log('updated', savedPerson)
          response.json(savedPerson)
        })
        .catch(error => {
          console.log('update failed')
          next(error)
        })
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id.toString())
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error('error:', error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})