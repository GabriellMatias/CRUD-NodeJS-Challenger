const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

// middleware
function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const user = users.find((user) => user.username === username)


  if (!user) {
    return response.status(404).json({ error: 'User not found' })
  }

  request.user = user
  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body
  const userAleradyExists = users.find((user) => user.username === username)

  if (userAleradyExists) {
    return response.status(400).json({ error: 'User already exists' })
  }

  const newUserData = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(newUserData)
  return response.status(201).json(newUserData)

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body


  const newToDoListData = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(newToDoListData)
  return response.status(201).json(newToDoListData)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body
  //pega informacao que vem da URL rota dinamica, o ID
  const { id } = request.params

  const todoExists = user.todos.find(todo => todo.id === id)

  if (!todoExists) {
    return response.status(404).json({ error: 'Todo not found' })
  }


  todoExists.title = title
  todoExists.deadline = new Date(deadline)

  return response.status(200).json(todoExists)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  //pega informacao que vem da URL rota dinamica, o ID
  const { id } = request.params

  const todoExists = user.todos.find(todo => todo.id === id)

  if (!todoExists) {
    return response.status(404).json({ error: 'Todo not found' })
  }

  todoExists.done = true
  return response.status(200).json(todoExists)

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  //pega informacao que vem da URL rota dinamica, o ID
  const { id } = request.params

  const todoIndex = user.todos.findIndex(todo => todo.id === id)
  if (todoIndex === -1) {
    return response.status(404).json({ error: 'Todo not found' })
  }
  user.todos.splice(todoIndex, 1)

  return response.status(204).json()

});

module.exports = app;