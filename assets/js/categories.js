let sortable;
let existingSlugs = [];
let categories = [];

document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
});

async function loadCategories() {
    const list = document.getElementById('categoryList');
    if (list) {
        list.innerHTML = '<div class="text-center text-muted py-4"><span class="spinner-border spinner-border-sm"></span> Loading categories...</div>';
    }
    
    try {
        const res = await fetch('/backend/api/categories', { credentials: 'include' });
        const data = await res.json();
        categories = data.items || [];
        existingSlugs = categories.map(c => c.slug).filter(Boolean);
        renderCategories();
        updateParentDropdowns();
    } catch (err) {
        console.error('Failed to load categories:', err);
        if (list) {
            list.innerHTML = '<div class="text-center text-danger py-4">Failed to load categories</div>';
        }
    }
}

function renderCategories() {
    const list = document.getElementById('categoryList');
    if (!list) return;
    
    if (categories.length === 0) {
        list.innerHTML = '<div class="text-center text-muted py-4">No categories yet. <a href="categories-add.html">Add your first category</a></div>';
        return;
    }
    
    // Sort by sort_order, then group by parent
    const sorted = [...categories].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    const parentCats = sorted.filter(c => !c.parent_id);
    const childCats = sorted.filter(c => c.parent_id);
    
    let html = '';
    parentCats.forEach(cat => {
        html += renderCategoryItem(cat, false);
        // Add children
        childCats.filter(c => c.parent_id === cat.id).forEach(child => {
            html += renderCategoryItem(child, true);
        });
    });
    // Orphan children (parent deleted)
    childCats.filter(c => !parentCats.find(p => p.id === c.parent_id)).forEach(child => {
        html += renderCategoryItem(child, true);
    });
    
    list.innerHTML = html;
    initSortable();
}

function renderCategoryItem(cat, isChild) {
    const parentName = cat.parent_id ? categories.find(c => c.id === cat.parent_id)?.name : null;
    return `
        <div class="category-item ${isChild ? 'child' : ''}" data-id="${cat.id}" data-parent="${cat.parent_id || ''}">
            <div class="category-content">
                <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
                <div class="category-info">
                    <h6>${escapeHtml(cat.name)}</h6>
                    <small class="text-muted">${escapeHtml(cat.slug || '')}${parentName ? ' • Child of ' + escapeHtml(parentName) : ''}</small>
                </div>
            </div>
            <div class="category-actions">
                <button class="btn btn-sm btn-icon btn-primary" onclick="editCategory(${cat.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-icon btn-danger" onclick="deleteCategory(${cat.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function initSortable() {
    const categoryList = document.getElementById('categoryList');
    if (!categoryList) return;
    
    if (sortable) {
        sortable.destroy();
    }
    
    sortable = Sortable.create(categoryList, {
        animation: 150,
        handle: '.drag-handle',
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        onEnd: function(evt) {
            const item = evt.item;
            const prevItem = item.previousElementSibling;
            const nextItem = item.nextElementSibling;
            
            // Check if dropped on a parent category (make it a child)
            if (prevItem && !prevItem.classList.contains('child') && evt.newIndex > evt.oldIndex) {
                const parentId = parseInt(prevItem.getAttribute('data-id'));
                const itemId = parseInt(item.getAttribute('data-id'));
                // Don't make a category its own child
                if (parentId !== itemId) {
                    setParentCategory(itemId, parentId);
                    return;
                }
            }
            
            updateCategoryOrder();
        }
    });
}

async function setParentCategory(childId, parentId) {
    try {
        const res = await fetch(`/backend/api/categories?id=${childId}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ parent_id: parentId })
        });
        
        if (res.ok) {
            showAlert('Category moved as subcategory!', 'success');
            await loadCategories();
        } else {
            showAlert('Failed to update category', 'danger');
        }
    } catch (err) {
        showAlert('Error updating category', 'danger');
    }
}

async function updateCategoryOrder() {
    const items = document.querySelectorAll('.category-item');
    const updates = [];
    
    items.forEach((item, index) => {
        const id = parseInt(item.getAttribute('data-id'));
        updates.push(
            fetch(`/backend/api/categories?id=${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sort_order: index })
            })
        );
    });
    
    try {
        await Promise.all(updates);
        showAlert('Category order updated!', 'success');
    } catch (err) {
        showAlert('Failed to update order', 'danger');
    }
}

function updateParentDropdowns() {
    const selects = [document.getElementById('editCategoryParent'), document.getElementById('parentCategory')];
    selects.forEach(select => {
        if (!select) return;
        const currentValue = select.value;
        select.innerHTML = '<option value="">None (Main Category)</option>';
        categories.filter(c => !c.parent_id).forEach(cat => {
            select.innerHTML += `<option value="${cat.id}">${escapeHtml(cat.name)}</option>`;
        });
        select.value = currentValue;
    });
}

function editCategory(id) {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    
    document.getElementById('editCategoryName').value = cat.name || '';
    document.getElementById('editCategorySlug').value = cat.slug || '';
    
    updateParentDropdowns();
    const parentSelect = document.getElementById('editCategoryParent');
    // Remove self from parent options
    const selfOption = parentSelect.querySelector(`option[value="${id}"]`);
    if (selfOption) selfOption.remove();
    parentSelect.value = cat.parent_id || '';
    
    document.getElementById('editCategoryMetaTitle').value = cat.meta_title || '';
    document.getElementById('editCategoryMetaDesc').value = cat.meta_description || '';
    document.getElementById('editCategoryMetaKeywords').value = cat.meta_keywords || '';
    
    const modal = document.getElementById('editCategoryModal');
    modal.setAttribute('data-edit-id', id);
    
    // Use Bootstrap modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

async function saveCategoryEdit() {
    const modal = document.getElementById('editCategoryModal');
    const id = parseInt(modal.getAttribute('data-edit-id'));
    
    const name = document.getElementById('editCategoryName').value.trim();
    const slug = document.getElementById('editCategorySlug').value.trim();
    const parent = document.getElementById('editCategoryParent').value;
    const metaTitle = document.getElementById('editCategoryMetaTitle').value.trim();
    const metaDesc = document.getElementById('editCategoryMetaDesc').value.trim();
    const metaKeywords = document.getElementById('editCategoryMetaKeywords').value.trim();
    
    if (!name) {
        showAlert('Please enter a category name', 'danger');
        return;
    }
    
    try {
        const res = await fetch(`/backend/api/categories?id=${id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                slug,
                parent_id: parent ? parseInt(parent) : null,
                meta_title: metaTitle,
                meta_description: metaDesc,
                meta_keywords: metaKeywords
            })
        });
        
        if (res.ok) {
            bootstrap.Modal.getInstance(modal).hide();
            showAlert('Category updated successfully!', 'success');
            await loadCategories();
        } else {
            showAlert('Failed to update category', 'danger');
        }
    } catch (err) {
        showAlert('Error updating category', 'danger');
    }
}

async function deleteCategory(id) {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
        const res = await fetch(`/backend/api/categories?id=${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (res.ok) {
            showAlert('Category deleted successfully!', 'success');
            await loadCategories();
        } else {
            const data = await res.json();
            showAlert(data.error || 'Failed to delete category', 'danger');
        }
    } catch (err) {
        showAlert('Error deleting category', 'danger');
    }
}
