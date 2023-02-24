import "./App.css";
import { useEffect, useState } from "react";

// On initialise la variable mais on y assigne aucune valeur pour l'instant
let nextId;

function App() {
  const [pendingTodoLabel, setPendingTodoLabel] = useState("");

  const [todos, setTodos] = useState(null);

  useEffect(() => {
    // La fonction du useEffect ne pouvant être déclarée "async" (pk ? https://www.codingspark.io/blog/comment-utiliser-une-async-function-dans-un-hook-useeffect-avec-react),
    // Je créé alors une fonction async à l'intérieur que j'éxécute juste après l'avoir déclarée
    const loadInitialTodos = async () => {
      let initialTodos; // On initialise la variable mais on y assigne aucune valeur pour l'instant

      const storedItem = localStorage.getItem("todos");

      if (storedItem !== null) {
        initialTodos = JSON.parse(storedItem);
      } else {
        const response = await fetch(
          "https://jsonplaceholder.typicode.com/users/1/todos"
        );
        initialTodos = await response.json();
      }

      // Ici je créé un tableau d'id à partir d'un tableau de todo
      const initialTodosIds = initialTodos.map((initialTodo) => initialTodo.id);

      // Puis je trouve l'id max,
      // Le premier 0 est la dans le cas où initialTodosIds est vide 
      const maxId = Math.max(0, ...initialTodosIds);

      // Puis je met à jour le nextId en conséquence pour éviter tout conflit d'id
      nextId = maxId + 1;

      // Et enfin je met à jour le state
      setTodos(initialTodos);
    };

    // Ne pouvant pas

    loadInitialTodos();

    // Je veux que cet effect ne soit joué qu'au démarrage du composant,
    // je donne donc un tableau de dépendance vide juste en dessous
  }, []);

  useEffect(() => {
    if (todos !== null) {
      localStorage.setItem("todos", JSON.stringify(todos));
    }

    // Je veux que cet effect soit joué à chaque changement du state todos,
    // je met donc le state todos dans le tableau de dépendance de l'effect
  }, [todos]);

  const handlePendingTodoLabelChange = (event) => {
    setPendingTodoLabel(event.target.value);
  };

  const handlePendingTodoLabelSubmit = (event) => {
    event.preventDefault();
    setPendingTodoLabel("");
    const newTodo = {
      id: nextId++,
      title: pendingTodoLabel.trim(),
      completed: false,
    };
    setTodos([newTodo, ...todos]);
  };

  const handleTodoCompletedChange = (todoToChange, newCompleted) => {
    const newTodos = todos.map((todo) => {
      // Ne pas modifier les todos qui n'ont pas l'id de la todo qu'ont veut modifier
      if (todo.id !== todoToChange.id) {
        return todo;
      }

      // Si on arrive jusque la, c'est que l'id du todo courant du map est celui de la todo qu'on veut modifier
      // On retourne donc dans ce cas un nouvel objet de todo  
      return {
        ...todoToChange,
        completed: newCompleted,
      };
    });

    setTodos(newTodos);
  };

  const handleTodoTextChange = (todoToChange, newText) => {
    const newTodos = todos.map((todo) => {
      // Ne pas modifier les todos qui n'ont pas l'id de la todo qu'ont veut modifier
      if (todo.id !== todoToChange.id) {
        return todo;
      }

      // Si on arrive jusque la, c'est que l'id du todo courant du map est celui de la todo qu'on veut modifier
      // On retourne donc dans ce cas un nouvel objet de todo  
      return {
        ...todoToChange,
        title: newText,
      };
    });

    setTodos(newTodos);
  };
  const handleTodoDelete = (todoToDelete) => {
    const newTodos = todos.filter((todo) => {
      // Ne garder que les todos qui ont un id différent de la todo qu'on veut supprimer
      return todo.id !== todoToDelete.id;
    });

    setTodos(newTodos);
  };

  if (todos === null) {
    // Tant que todos est === null, cela veut dire que l'on est pas encore sûr de l'état initial de la liste des todos
    // On affiche donc un indicateur de chargement, ici un simple texte
    return <h1>Veuillez patienter pendant le chargement des todos...</h1>;
  }

  // Sinon, c'est que les todos ont été chargée, on peut donc afficher l'application
  return (
    <div>
      <form onSubmit={handlePendingTodoLabelSubmit}>
        <input
          type="text"
          placeholder="Acheter PQ"
          value={pendingTodoLabel}
          onChange={handlePendingTodoLabelChange}
        />
        {/* string.trim() permet de retourner une nouvelle chaine dans laquelle on aurait supprimé les espaces avants et après */}
        <button disabled={pendingTodoLabel.trim().length === 0} type="submit">
          Ajouter
        </button>
      </form>
      <ul>
        {todos.map((todo) => {
          return (
            <li
              key={todo.id}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={(event) =>
                  handleTodoCompletedChange(todo, event.target.checked)
                }
              />
              <input
                type="text"
                value={todo.title}
                onChange={(event) =>
                  handleTodoTextChange(todo, event.target.value)
                }
                style={{
                  textDecoration: todo.completed ? "line-through" : "initial",
                }}
              />
              <button onClick={() => handleTodoDelete(todo)}>❌</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default App;
