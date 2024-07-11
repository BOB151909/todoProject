import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt, faCheck, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [editMode, setEditMode] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [showCompleted, setShowCompleted] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [inputError, setInputError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of items to show per page

  // Fetch the to-dos from the API
  useEffect(() => {
    axios.get('https://668e372ebf9912d4c92d405f.mockapi.io/todolist')
      .then(response => {
        setTodos(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching to-dos:', error);
        setLoading(false);
      });
  }, []);

  // Add a new to-do without time
  const addTodo = () => {
    if (!newTodo.trim()) {
      setInputError('Please enter a valid to-do item.');
      return;
    }

    const newTodoItem = {
      title: newTodo,
      completed: false,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setLoading(true);
    axios.post('https://668e372ebf9912d4c92d405f.mockapi.io/todolist', newTodoItem)
      .then(response => {
        setTodos([...todos, response.data]);
        setNewTodo('');
        setInputError(null);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error adding to-do:', error);
        setInputError('Failed to add new to-do. Please try again later.');
        setLoading(false);
      });
  };

  // Delete a to-do
  const deleteTodo = (id) => {
    setLoading(true);
    axios.delete(`https://668e372ebf9912d4c92d405f.mockapi.io/todolist/${id}`)
      .then(() => {
        setTodos(todos.filter(todo => todo.id !== id));
        setLoading(false);
      })
      .catch(error => {
        console.error('Error deleting to-do:', error);
        setLoading(false);
      });
  };

  // Toggle completion status
  const toggleComplete = (id, completed) => {
    const todo = todos.find(todo => todo.id === id);
    setLoading(true);
    axios.put(`https://668e372ebf9912d4c92d405f.mockapi.io/todolist/${id}`, { ...todo, completed: !completed })
      .then(response => {
        setTodos(todos.map(todo => todo.id === id ? response.data : todo));
        toggleNotification();
        setLoading(false);
      })
      .catch(error => {
        console.error('Error updating completion status:', error);
        setLoading(false);
      });
  };

  // Edit mode functions
  const enterEditMode = (id, title) => {
    setEditMode(id);
    setEditTitle(title);
  };

  const exitEditMode = () => {
    setEditMode(null);
    setEditTitle('');
  };

  const saveEditedTodo = (id) => {
    setLoading(true);
    axios.put(`https://668e372ebf9912d4c92d405f.mockapi.io/todolist/${id}`, { title: editTitle })
      .then(response => {
        setTodos(todos.map(todo => todo.id === id ? { ...todo, title: response.data.title } : todo));
        exitEditMode();
        setLoading(false);
      })
      .catch(error => {
        console.error('Error saving edited to-do:', error);
        setLoading(false);
      });
  };

  // Toggle notification function
  const toggleNotification = () => {
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Format date function (optional)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Notification component
  const Notification = () => {
    return (
      <div className={`fixed bottom-0 right-0 bg-green-500 text-white p-2 rounded-tl-md rounded-tr-md ${showNotification ? 'block' : 'hidden'}`}>
        Task completed!
      </div>
    );
  };

  // Loader component
  const Loader = () => {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-white" />
      </div>
    );
  };

  // Pagination logic
  const indexOfLastTodo = currentPage * itemsPerPage;
  const indexOfFirstTodo = indexOfLastTodo - itemsPerPage;
  const currentTodos = todos.slice(indexOfFirstTodo, indexOfLastTodo);

  const nextPage = () => {
    if (currentPage < Math.ceil(todos.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {loading && <Loader />}
      <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-lg relative">
        <h1 className="text-2xl font-bold mb-4 text-center">To-Do List</h1>
        <div className="mb-4 flex flex-col sm:flex-row">
          <input
            type="text"
            className={`border rounded p-2 mr-2 mb-2 sm:mb-0 flex-1 ${inputError ? 'border-red-500' : ''}`}
            value={newTodo}
            onChange={(e) => {
              setNewTodo(e.target.value);
              setInputError(null);
            }}
            placeholder="Add a new to-do"
          />
          <button
            className="bg-blue-500 text-white p-2 rounded"
            onClick={addTodo}
          >
            <span className="hidden sm:inline">Add</span>
            <FontAwesomeIcon icon={faCheck} className="sm:ml-2" />
          </button>
        </div>
        {inputError && (
          <p className="text-red-500 text-sm mt-2">{inputError}</p>
        )}
        <label className="mb-2 flex items-center">
          <input
            type="checkbox"
            className="form-checkbox h-5 w-5 text-blue-600"
            checked={showCompleted}
            onChange={() => setShowCompleted(!showCompleted)}
          />
          <span className="ml-2">Show Completed Tasks</span>
        </label>
        <ul>
          {currentTodos.map(todo => {
            if (!showCompleted && todo.completed) {
              return null;
            }
            return (
              <li key={todo.id} className="flex justify-between items-center mb-2">
                {editMode === todo.id ? (
                  <input
                    type="text"
                    className="border rounded p-2 mr-2 mb-2 sm:mb-0 flex-1"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                ) : (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-blue-600"
                      checked={todo.completed}
                      onChange={() => toggleComplete(todo.id, todo.completed)}
                    />
                    <span className={`ml-2 ${todo.completed ? 'line-through' : ''}`}>
                      {todo.title}
                    </span>
                  </label>
                )}
                <div>
                  <span className="text-sm text-gray-500">{formatDate(todo.createdAt)}</span>
                  {editMode === todo.id ? (
                    <>
                      <button
                        className="bg-green-500 text-white p-2 rounded ml-2"
                        onClick={() => saveEditedTodo(todo.id)}
                      >
                        <span className="hidden sm:inline">Save</span>
                        <FontAwesomeIcon icon={faCheck} className="sm:ml-2" />
                      </button>
                      <button
                        className="bg-gray-500 text-white p-2 rounded ml-2"
                        onClick={exitEditMode}
                      >
                        <span className="hidden sm:inline">Cancel</span>
                        <FontAwesomeIcon icon={faTimes} className="sm:ml-2" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="bg-blue-500 text-white p-2 rounded ml-2"
                        onClick={() => enterEditMode(todo.id, todo.title)}
                      >
                        <span className="hidden sm:inline">Edit</span>
                        <FontAwesomeIcon icon={faEdit} className="sm:ml-2" />
                      </button>
                      <button
                        className="bg-red-500 text-white p-2 rounded ml-2"
                        onClick={() => deleteTodo(todo.id)}
                      >
                        <span className="hidden sm:inline">Delete</span>
                        <FontAwesomeIcon icon={faTrashAlt} className="sm:ml-2" />
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="flex justify-between mt-4">
          <button
            className="bg-gray-500 text-white p-2 rounded"
            onClick={prevPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="text-gray-700">Page {currentPage} of {Math.ceil(todos.length / itemsPerPage)}</span>
          <button
            className="bg-gray-500 text-white p-2 rounded"
            onClick={nextPage}
            disabled={currentPage === Math.ceil(todos.length / itemsPerPage)}
          >
            Next
          </button>
        </div>
        <Notification />
      </div>
    </div>
  );
};

export default TodoList;
