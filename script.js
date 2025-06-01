// Global değişkenler
let items = JSON.parse(localStorage.getItem('shoppingList')) || [];

// DOM elementlerini seçme
const shoppingList = document.querySelector(".shopping-list");
const shoppingForm = document.querySelector(".shopping-form");
const filterButtons = document.querySelectorAll(".filter-buttons button");
const clearBtn = document.querySelector(".clear");
const itemInput = document.querySelector('#item_name');
const categorySelect = document.querySelector('#item_category');
const emptyMessage = document.querySelector('#empty-message');
const itemCount = document.querySelector('#item-count');

// Sayfa yüklendiğinde
document.addEventListener("DOMContentLoaded", function() {
    renderItems(); // İlk yükleme
    updateItemCount();
    setupSortable();
    
    // Event listener'ları ekle
    shoppingForm.addEventListener("submit", handleFormSubmit);
    filterButtons.forEach(button => {
        button.addEventListener("click", handleFilterSelection);
    });
    clearBtn.addEventListener("click", clear);
});

// Form gönderildiğinde
function handleFormSubmit(e) {
    e.preventDefault();
    
    const itemName = itemInput.value.trim();
    const category = categorySelect.value;
    
    if (itemName) {
        addItem(itemName, category);
        itemInput.value = '';
        itemInput.focus();
    }
}

// Yeni öğe ekleme
function addItem(name, category) {
    const item = {
        id: Date.now().toString(),
        name,
        category,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    items.unshift(item);
    saveToLocalStorage();
    renderItems();
    updateItemCount();
    
    // Animasyonlu ekleme
    const newItem = shoppingList.firstElementChild;
    if (newItem) {
        newItem.classList.add('animate__animated', 'animate__fadeInDown');
    }
}

// Öğeleri render etme
function renderItems(filter = 'all') {
    shoppingList.innerHTML = '';
    
    let filteredItems = items;
    if (filter === 'completed') {
        filteredItems = items.filter(item => item.completed);
    } else if (filter === 'incomplete') {
        filteredItems = items.filter(item => !item.completed);
    }
    
    if (filteredItems.length === 0) {
        emptyMessage.classList.remove('d-none');
    } else {
        emptyMessage.classList.add('d-none');
    }
    
    filteredItems.forEach(item => {
        const li = document.createElement('li');
        li.dataset.id = item.id;
        if (item.completed) li.setAttribute('item-completed', '');
        
        li.innerHTML = `
            <div class="checkbox" role="button" aria-label="Tamamlandı olarak işaretle"></div>
            <span class="item-name">${item.name}</span>
            <span class="category-badge">${getCategoryName(item.category)}</span>
            <i class="bi bi-trash delete-icon" role="button" aria-label="Sil"></i>
        `;
        
        // Tamamlama işlemi
        const checkbox = li.querySelector('.checkbox');
        checkbox.addEventListener('click', () => toggleComplete(item.id));
        
        // Silme işlemi
        const deleteIcon = li.querySelector('.delete-icon');
        deleteIcon.addEventListener('click', () => removeItem(item.id));
        
        shoppingList.appendChild(li);
    });
}

// Kategori adını Türkçe olarak alma
function getCategoryName(category) {
    const categories = {
        'genel': 'Genel',
        'meyve': 'Meyve',
        'sebze': 'Sebze',
        'et': 'Et',
        'süt': 'Süt Ürünleri',
        'temel': 'Temel Gıda',
        'temizlik': 'Temizlik'
    };
    return categories[category] || category;
}

// Öğe tamamlama
function toggleComplete(id) {
    items = items.map(item => {
        if (item.id === id) {
            return { ...item, completed: !item.completed };
        }
        return item;
    });
    
    saveToLocalStorage();
    renderItems();
    updateItemCount();
}

// Öğe silme
function removeItem(id) {
    const li = shoppingList.querySelector(`[data-id="${id}"]`);
    if (li) {
        li.classList.add('removing');
        setTimeout(() => {
            items = items.filter(item => item.id !== id);
            saveToLocalStorage();
            renderItems();
            updateItemCount();
        }, 300);
    }
}

// Tüm listeyi temizleme
function clear() {
    if (items.length > 0 && confirm('Tüm listeyi temizlemek istediğinizden emin misiniz?')) {
        items = [];
        saveToLocalStorage();
        renderItems();
        updateItemCount();
    }
}

// Filtreleme
function handleFilterSelection(e) {
    const filter = e.target.getAttribute('item-filter');
    
    // Aktif buton stilini güncelle
    filterButtons.forEach(btn => {
        btn.classList.remove('active', 'btn-primary');
        btn.classList.add('btn-outline-primary');
    });
    e.target.classList.add('active', 'btn-primary');
    e.target.classList.remove('btn-outline-primary');
    
    renderItems(filter);
}

// LocalStorage'a kaydetme
function saveToLocalStorage() {
    localStorage.setItem('shoppingList', JSON.stringify(items));
}

// Ürün sayısını güncelleme
function updateItemCount() {
    const total = items.length;
    const completed = items.filter(item => item.completed).length;
    itemCount.textContent = `${completed}/${total}`;
}

// Sürükle-bırak özelliği
function setupSortable() {
    new Sortable(shoppingList, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        onEnd: function() {
            // Yeni sıralamayı kaydet
            const newItems = [];
            shoppingList.querySelectorAll('li').forEach(li => {
                const itemId = li.dataset.id;
                const item = items.find(i => i.id === itemId);
                if (item) newItems.push(item);
            });
            items = newItems;
            saveToLocalStorage();
        }
    });
}

// Klavye kısayolları
document.addEventListener('keydown', (e) => {
    // ESC tuşu ile input'u temizle
    if (e.key === 'Escape' && document.activeElement === itemInput) {
        itemInput.value = '';
        itemInput.blur();
    }
    
    // Enter tuşu ile form gönder
    if (e.key === 'Enter' && document.activeElement === itemInput) {
        shoppingForm.dispatchEvent(new Event('submit'));
    }
});