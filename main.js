const books = [];
const isRead = [];
const notRead = [];
const RENDER_EVENT = 'render-book';
const SEARCH_EVENT = 'search-book';
const EDIT_EVENT = 'edit-book';
const NOTE_EVENT = 'note-shelf';
const STORAGE_KEY = 'BOOKSHELF-APP';

document.addEventListener('DOMContentLoaded', () => {
    const submitBook = document.getElementById('bookSubmit');
    const searchSubmit = document.getElementById('searchSubmit');
    const reloadButton = document.getElementById('reloadButton');

    submitBook.addEventListener('click', (event) => {    
        addBook();
        event.preventDefault();
        const inputs = document.querySelectorAll('#inputBookTitle, #inputBookAuthor, #inputBookYear');
        inputs.forEach(input => {
            input.value = '';
        });
    });

    searchSubmit.addEventListener('click', (event) =>{
        event.preventDefault();
        const searchTitle = document.getElementById('searchBookTitle').value;
        if (searchTitle !== '') searchBook(searchTitle);
        else alert('Please fill in the book search field');
    });

    reloadButton.addEventListener('click', (event) => {
        event.preventDefault();
        document.dispatchEvent(new CustomEvent(RENDER_EVENT));
        document.dispatchEvent(new CustomEvent(NOTE_EVENT));
        checkHeadTitle();
    })

    if (isStorageExist()) {
        loadDataFromStorage();
        document.dispatchEvent(new CustomEvent(NOTE_EVENT));
    }
    
});

const makeNote = () => {
    const shelfNote = document.createElement('div');
    shelfNote.innerHTML = '<i class="fa fa-folder-open note" aria-hidden="true"></i>';
    return(shelfNote);
}

const makeNoteUnread = (shelfNote) => {
    shelfNote.setAttribute('id', 'unreadList');
    const unreadBook = document.getElementById('incompleteBookshelfList');
    unreadBook.append(shelfNote);
    return(shelfNote);
}

const makeNoteRead = (shelfNote) => {
    shelfNote.setAttribute('id', 'readList');
    const readBook = document.getElementById('completeBookshelfList');
    readBook.append(shelfNote);
    return(shelfNote);
}

document.addEventListener(NOTE_EVENT, () => {
    const readBookList = document.getElementById('completeBookshelfList');
    const unreadBookList = document.getElementById('incompleteBookshelfList');

    if(!readBookList.hasChildNodes()) makeNoteRead(makeNote());
    if(!unreadBookList.hasChildNodes()) makeNoteUnread(makeNote());
})

const addBook = () => {
    const bookTitle = document.getElementById('inputBookTitle').value;
    const bookAuthor = document.getElementById('inputBookAuthor').value;
    const bookYear = document.getElementById('inputBookYear').value;
    const bookIsRead = document.getElementById('inputBookIsComplete').checked;
    const bookId = generateId();

    checkHeadTitle();

    if(bookTitle !== '' && bookAuthor!=='' && bookYear!=='') {
        if(bookYear >= 1800 && bookYear <= 2023) {
            const bookObject = generateBookObject(bookId, bookTitle, bookAuthor, bookYear, bookIsRead);
            books.push(bookObject);
        } else {
            document.getElementById('error-message').style.display = 'block';
        }
    } else{
        document.getElementById('error-message').style.display = 'block';
    }

    document.dispatchEvent(new CustomEvent(RENDER_EVENT));
    document.dispatchEvent(new CustomEvent(NOTE_EVENT));
    saveData();
};

const generateId = () => {
    return +new Date;
}

const generateBookObject = (id, title, author, year, isComplete) => {
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}

const checkHeadTitle = () => {
    const titleResult = document.getElementById('headTitle');
    if (titleResult !== null) titleResult.remove();
    return;
}

document.addEventListener(RENDER_EVENT, () => {
    const unreadBook = document.getElementById('incompleteBookshelfList');
    unreadBook.innerHTML = '';

    const readBook = document.getElementById('completeBookshelfList');
    readBook.innerHTML = '';
        
    for(let book of books) {
        const bookElement = makeElement(book);
        if (book.isComplete) readBook.appendChild(bookElement);
        else unreadBook.append(bookElement);
    } 
})

const makeElement = (book) => {
    const articleContainer = document.createElement('article');
    articleContainer.classList.add('book_item');
    articleContainer.setAttribute('id', `book-${book.id}`)
    
    const initialImg = generateImg(book.title);
    const bookImg = document.createElement('div');
    bookImg.classList.add('book_image');
    bookImg.innerHTML = `<p>${initialImg}</p>`;

    const descriptionContainer = document.createElement('div');
    descriptionContainer.classList.add('book_description');

    articleContainer.append(bookImg, descriptionContainer);

    const textTitle = document.createElement('h3');
    textTitle.innerText = book.title;

    const textAuthor = document.createElement('p');
    textAuthor.innerText = `${book.author}`;

    const textYear = document.createElement('p');
    textYear.innerText = `${book.year}`;

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('action');

    const buttonRead = document.createElement('button');
    buttonRead.classList.add('book_icon');
    buttonRead.setAttribute('title', 'Completed');
    buttonRead.innerHTML = '<i class="fa fa-check" aria-hidden="true"></i>';
    buttonRead.addEventListener('click', () => {
        addToCompleteReading(book.id);
        document.dispatchEvent(new CustomEvent(NOTE_EVENT));
    })

    
    const buttonUnread = document.createElement('button');
    buttonUnread.classList.add('book_icon');
    buttonUnread.setAttribute('title', 'Incomplete');
    buttonUnread.innerHTML = '<i class="fa fa-close" aria-hidden="true"></i>';
    buttonUnread.addEventListener('click', () => { 
        addToIncompleteReading(book.id);
        document.dispatchEvent(new CustomEvent(NOTE_EVENT));
    });

    const buttonDelete = document.createElement('button');
    buttonDelete.classList.add('book_icon');
    buttonDelete.setAttribute('title', "Delete");
    buttonDelete.innerHTML = '<i class="fa fa-trash-o" aria-hidden="true"></i>';
    buttonDelete.addEventListener('click', () => { 
        deleteBook(book.id);
        document.dispatchEvent(new CustomEvent(NOTE_EVENT));
    });

    const buttonEdit = document.createElement('button');
    buttonEdit.classList.add('book_icon');
    buttonEdit.setAttribute('title', 'Edit');
    buttonEdit.innerHTML = '<i class="fa fa-pencil" aria-hidden="true"></i>';
    buttonEdit.addEventListener('click', () => { 
        editBook(book.id);
    });

    if (!book.isComplete) buttonContainer.append(buttonRead, buttonDelete, buttonEdit);
    else buttonContainer.append(buttonUnread, buttonDelete, buttonEdit);
    
    descriptionContainer.append(textTitle, textAuthor,textYear);
    articleContainer.append(buttonContainer);
    return articleContainer;
}

const addToIncompleteReading = (id) => {
    checkHeadTitle();
    const bookTarget = findBook(id);
    bookTarget.isComplete = false;
    document.dispatchEvent(new CustomEvent(RENDER_EVENT));
    saveData();
}

const addToCompleteReading = (id) => {
    checkHeadTitle();
    const bookTarget = findBook(id);
    bookTarget.isComplete = true;
    document.dispatchEvent(new CustomEvent(RENDER_EVENT));
    saveData();
}

const deleteBook = (id) => {
    checkHeadTitle();
    const deleteTarget = findBookIndex(id);
    if (deleteTarget === -1) return;

    let confirmDelete = `Book entitled ${books[deleteTarget].title} from ${books[deleteTarget].author} will be deleted`;
    if (confirm(confirmDelete)){
        books.splice(deleteTarget, 1);
        document.dispatchEvent(new CustomEvent(RENDER_EVENT));
        saveData();
    }
    return;
}

const editBook = (id) => {
    checkHeadTitle();
    const overlayEdit = document.getElementById('edit_section');
    overlayEdit.removeAttribute('hidden');
    
    let editTarget = findBook(id);
    const restartInputs = document.querySelectorAll('#editInputBookTitle, #editInputBookAuthor, #editInputBookYear');
    restartInputs.forEach(input => {
        input.value = '';    
    });

    fillEditInput(editTarget);

    const cancelEdit = document.getElementById('editCancelSubmit');
    cancelEdit.addEventListener('click', (event)=> {
        overlayEdit.setAttribute('hidden', true);
        editTarget = '';
        event.preventDefault();
    })
    
    const editedBook = document.getElementById('editSubmit');
    editedBook.addEventListener('click', (event) => {
        let updateTitle = document.getElementById('editInputBookTitle').value;
        let updateAuthor = document.getElementById('editInputBookAuthor').value;
        let updateYear = document.getElementById('editInputBookYear').value;
        
        for (let book of books) {
            if (editTarget.id === book.id) {
                const editedBookObject = generateBookObject(editTarget.id, updateTitle, updateAuthor, updateYear, editTarget.isComplete);
                editArrayBooks(editedBookObject);
            }
        }
        editTarget= '';
        overlayEdit.setAttribute('hidden', true);
        document.dispatchEvent(new CustomEvent(RENDER_EVENT));
        document.dispatchEvent(new CustomEvent(NOTE_EVENT));        
        event.preventDefault();
    })
}

const fillEditInput = (bookTarget) => {
    document.getElementById('editInputBookTitle').value = bookTarget.title;
    document.getElementById('editInputBookAuthor').value = bookTarget.author;
    document.getElementById('editInputBookYear').value = bookTarget.year;
}

const editArrayBooks = (editedObject) => {
    const editedBookIndex = findBookIndex(editedObject.id);
    books[editedBookIndex].title = editedObject.title;
    books[editedBookIndex].author = editedObject.author;
    books[editedBookIndex].year = editedObject.year;
    saveData()
    return books;
}

const findBook = (bookId) => {
    for (let book of books) {
        if (book.id === bookId) return book;
    }
    return null;
}

const findBookIndex = (bookId) => {
    for(const index in books) {
        if(books[index].id === bookId) return index;
    }
    return -1;
}

const saveData = () => {
    if (isStorageExist()) {
        const bookParsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, bookParsed);
    }
}
 
const isStorageExist = () => {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

function loadDataFromStorage() {
    const serializedBook = localStorage.getItem(STORAGE_KEY);
    let fetchBook = JSON.parse(serializedBook);
    if (fetchBook !== null) {
        for (const book of fetchBook) {
            books.push(book);
        }
    }
    document.dispatchEvent(new CustomEvent(RENDER_EVENT));
}

const searchBook = (searchTitle) => {
    const searchForm = document.getElementById('searchBook');
    const comparingBookResult = comparingBook(searchTitle.toUpperCase());
    
    if (comparingBookResult.length === 0 ){
        checkHeadTitle();
        document.dispatchEvent(new CustomEvent(RENDER_EVENT));
        document.dispatchEvent(new CustomEvent(NOTE_EVENT));
        alert(`Book entitled ${searchTitle} is not found!`);
    }
    else {
        document.dispatchEvent(new CustomEvent(SEARCH_EVENT, {detail: comparingBookResult}));
        checkTitleHead(searchTitle);
    }
    searchForm.reset();
};

const checkTitleHead = (searchTitle) => {
    const titleResult = document.getElementById('headTitle');
    if (titleResult === null) elemenBookResult(searchTitle);
    else {
        titleResult.remove();
        elemenBookResult(searchTitle);
    }
}

const comparingBook = (searchedText) => {
    const bookSearchResult = [];
    for (let book of books) {
        let titleText = book.title.toUpperCase();
        if (titleText.includes(searchedText)) bookSearchResult.push(book);
    }
    return bookSearchResult;
};

document.addEventListener(SEARCH_EVENT, (books) => {
    const unreadBook = document.getElementById('incompleteBookshelfList');
    unreadBook.innerHTML = '';

    const readBook = document.getElementById('completeBookshelfList');
    readBook.innerHTML = '';

    for(let book of books.detail) {
        const bookElement = makeElement(book);
        if (book.isComplete) readBook.appendChild(bookElement);
        else unreadBook.append(bookElement);
    }
    document.dispatchEvent(new CustomEvent(NOTE_EVENT));
});

const elemenBookResult = (bookSearch) => {
    const mainDiv = document.getElementsByTagName('main');
    const beforeDiv = document.getElementById('unreadBook');
    const resultTitle = document.createElement('h2');
    resultTitle.setAttribute('id', 'headTitle');
    resultTitle.innerText = `Menampilkan Buku Berjudul "${bookSearch}"`;
    resultTitle.style.color = 'black';
    resultTitle.style.textAlign = 'center';
    mainDiv[0].insertBefore(resultTitle, beforeDiv);
}

function generateImg(title) {
    const words = title.split(" ");
    let initials = "";
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (word) {
            initials += word[0].toUpperCase();
        }
    }
    if (initials.length >= 2) {
        initials = initials.slice(0, 2);
    }
    return initials;
}