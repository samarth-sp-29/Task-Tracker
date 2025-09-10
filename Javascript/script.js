window.onload = () => {
  let cards = document.querySelectorAll(".card");
  let lists = document.querySelectorAll(".list");
  let addTaskBtn = document.getElementById("addTaskBtn");
  let taskInput = document.getElementById("taskInput");

  let cardIdCounter = 4; // start from 4 since 1,2,3 already exist

  // Load saved state on page load
  loadSavedState();

  // Function to save current state to localStorage
  function saveState() {
    const state = {
      cardIdCounter: cardIdCounter,
      lists: {}
    };

    // Save each list's cards
    lists.forEach(list => {
      const listId = list.id;
      const cards = Array.from(list.querySelectorAll('.card')).map(card => ({
        id: card.id,
        text: card.textContent.replace('❌', '').trim() // Remove delete button text
      }));
      state.lists[listId] = cards;
    });

    localStorage.setItem('kanbanState', JSON.stringify(state));
  }

  // Function to load saved state from localStorage
  function loadSavedState() {
    const savedState = localStorage.getItem('kanbanState');
    if (!savedState) return;

    try {
      const state = JSON.parse(savedState);
      cardIdCounter = state.cardIdCounter || 4;

      // Clear existing cards first
      lists.forEach(list => {
        const cards = list.querySelectorAll('.card');
        cards.forEach(card => card.remove());
      });

      // Recreate cards from saved state
      Object.entries(state.lists).forEach(([listId, cards]) => {
        const list = document.getElementById(listId);
        if (!list) return;

        cards.forEach(cardData => {
          const newCard = document.createElement("div");
          newCard.classList.add("card");
          newCard.setAttribute("draggable", "true");
          newCard.setAttribute("id", cardData.id);
          newCard.innerText = cardData.text;

          list.appendChild(newCard);
          addCardFeatures(newCard);
        });
      });

    } catch (error) {
      console.error('Error loading saved state:', error);
    }
  }

  // Function to add drag & delete functionality to a card
  function addCardFeatures(card) {
    // Make draggable
    card.addEventListener("dragstart", dragStart);
    card.addEventListener("dragend", dragEnd);

    // Add delete button (only if it doesn't already exist)
    if (!card.querySelector('.remove-btn')) {
      let removeBtn = document.createElement("button");
      removeBtn.innerHTML = "❌";
      removeBtn.classList.add("remove-btn");
      removeBtn.addEventListener("click", () => {
        card.remove();
        saveState(); // Save after deletion
      });
      card.appendChild(removeBtn);
    }
  }

  // Add features to existing cards
  for (let card of cards) {
    addCardFeatures(card);
  }

  // Add drag events to lists
  for (let list of lists) {
    list.addEventListener("dragover", dragOver);
    list.addEventListener("dragenter", dragEnter);
    list.addEventListener("dragleave", dragLeave);
    list.addEventListener("drop", dragDrop);
  }

  // Create new card when user adds task
  addTaskBtn.addEventListener("click", () => {
    let taskText = taskInput.value.trim();
    if (taskText === "") return;

    let newCard = document.createElement("div");
    newCard.classList.add("card");
    newCard.setAttribute("draggable", "true");
    newCard.setAttribute("id", "card" + cardIdCounter++);
    newCard.innerText = taskText;

    document.getElementById("list1").appendChild(newCard);

    addCardFeatures(newCard); // make it draggable + removable
    taskInput.value = ""; // clear input
    
    saveState(); // Save after adding new task
  });

  // Also allow pressing Enter to add task
  taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addTaskBtn.click();
    }
  });

  // Drag Functions
  function dragStart(e) {
    e.dataTransfer.setData("text/plain", this.id);
  }

  function dragEnd(e) {
    console.log("Drag Ended");
  }

  function dragOver(e) {
    e.preventDefault();
  }

  function dragEnter(e) {
    e.preventDefault();
    this.classList.add("over");
  }

  function dragLeave(e) {
    this.classList.remove("over");
  }

  function dragDrop(e) {
    let id = e.dataTransfer.getData("text/plain");
    let card = document.getElementById(id);
    this.appendChild(card);
    this.classList.remove("over");
    
    saveState(); // Save after moving a card
  }

  // Optional: Add a clear all data button (for testing)
  function clearAllData() {
    localStorage.removeItem('kanbanState');
    location.reload(); // Refresh page to reset to initial state
  }

  // Uncomment the line below to add a clear button to your HTML
  // You can add this button to your HTML: <button onclick="clearAllData()">Clear All Data</button>
  window.clearAllData = clearAllData;
};