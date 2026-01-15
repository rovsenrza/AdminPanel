let shortDescriptionEditor;
let fullDescriptionEditor;
let extraFieldCounter = 0;
let imagePreviews = [];
let existingSlugs = [];
let categories = [];

document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
    initEditors();
    initForm();
    initSlugGeneration();
});

async function loadCategories() {
    const select = document.getElementById('newsCategory');
    if (!select) return;
    
    try {
        const res = await fetch('/backend/api/categories', { credentials: 'include' });
        const data = await res.json();
        categories = data.items || [];
        
        select.innerHTML = '<option value="">Select Category</option>';
        categories.forEach(cat => {
            const prefix = cat.parent_id ? '— ' : '';
            select.innerHTML += `<option value="${cat.id}">${prefix}${cat.name}</option>`;
        });
    } catch (err) {
        select.innerHTML = '<option value="">Failed to load categories</option>';
        console.error('Failed to load categories:', err);
    }
}

function initEditors() {
    const toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'header': 1 }, { 'header': 2 }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'font': [] }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['clean']
    ];

    shortDescriptionEditor = new Quill('#shortDescriptionEditor', {
        theme: 'snow',
        modules: {
            toolbar: toolbarOptions
        }
    });

    fullDescriptionEditor = new Quill('#fullDescriptionEditor', {
        theme: 'snow',
        modules: {
            toolbar: toolbarOptions
        }
    });
}

function initForm() {
    document.getElementById('newsForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const title = document.getElementById('newsTitle').value.trim();
        const categoryId = parseInt(document.getElementById('newsCategory').value);
        const shortDesc = shortDescriptionEditor.root.innerText;
        const fullDesc = fullDescriptionEditor.root.innerText;
        
        if (!title || !categoryId) {
            showAlert('Please fill in required fields', 'danger');
            return;
        }
        
        const newsData = {
            title: title,
            slug: document.getElementById('newsSlug').value.trim(),
            category_id: categoryId,
            short_desc_html: shortDescriptionEditor.root.innerHTML,
            full_desc_html: fullDescriptionEditor.root.innerHTML,
            video_url: document.getElementById('videoUrl').value.trim(),
            published: document.getElementById('publishStatus').checked,
            meta_title: document.getElementById('newsMetaTitle').value.trim() || title,
            meta_description: document.getElementById('newsMetaDesc').value.trim() || shortDesc.substring(0, 160),
            meta_keywords: document.getElementById('newsMetaKeywords').value.trim() || extractKeywords(title + ' ' + shortDesc + ' ' + fullDesc)
        };
        
        try {
            const res = await fetch('/backend/api/news', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newsData)
            });
            
            if (res.ok) {
                const data = await res.json();
                const newsId = data.id;
                
                if (imagePreviews.length > 0) {
                    await uploadNewsImages(newsId);
                }
                
                showAlert('News saved successfully!', 'success');
                setTimeout(() => {
                    window.location.href = 'news.html';
                }, 1500);
            } else {
                showAlert('Failed to save news', 'danger');
            }
        } catch (err) {
            showAlert('Error saving news', 'danger');
        }
    });
}

async function uploadNewsImages(newsId) {
    for (const preview of imagePreviews) {
        if (!preview.file) continue;
        
        const formData = new FormData();
        formData.append('image', preview.file);
        
        try {
            const res = await fetch('/backend/api/upload', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });
            
            if (res.ok) {
                const data = await res.json();
                await fetch('/backend/api/news/images', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        news_id: newsId,
                        path: data.path
                    })
                });
            }
        } catch (err) {
            console.error('Failed to upload image:', err);
        }
    }
}

function initSlugGeneration() {
    const titleInput = document.getElementById('newsTitle');
    const slugInput = document.getElementById('newsSlug');
    
    if (titleInput && slugInput) {
        titleInput.addEventListener('input', async function() {
            const baseSlug = generateSlug(this.value);
            const uniqueSlug = await checkSlugUnique(baseSlug, existingSlugs);
            slugInput.value = uniqueSlug;
        });
    }
}

function extractKeywords(text) {
    const words = text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 4);
    
    const wordCount = {};
    words.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    const sortedWords = Object.entries(wordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(entry => entry[0]);
    
    return sortedWords.join(', ');
}

function addImageInput() {
    const container = document.getElementById('imageInputsContainer');
    const newInput = document.createElement('div');
    newInput.className = 'mb-2 d-flex gap-2 align-items-center image-input-group';
    newInput.innerHTML = `
        <input type="file" class="form-control" accept="image/*" onchange="previewImage(this)">
        <button type="button" class="btn btn-danger btn-icon" onclick="removeImageInput(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    container.appendChild(newInput);
}

function previewImage(input) {
    if (!input.files || !input.files[0]) return;
    
    const file = input.files[0];
    
    if (!validateImageSize(file, 400)) {
        input.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        imagePreviews.push({
            file: file,
            dataUrl: e.target.result
        });
    };
    reader.readAsDataURL(file);
}

function removeImageInput(btn) {
    const group = btn.closest('.image-input-group');
    const index = Array.from(group.parentElement.children).indexOf(group);
    if (index >= 0 && index < imagePreviews.length) {
        imagePreviews.splice(index, 1);
    }
    group.remove();
}

function removeImageInput(button) {
    button.closest('.image-input-group').remove();
}

function previewImage(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        if (!validateImageSize(file, 400)) {
            input.value = '';
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const previewContainer = document.getElementById('imagePreviewContainer');
            const previewDiv = document.createElement('div');
            previewDiv.className = 'image-preview';
            previewDiv.innerHTML = `
                <img src="${e.target.result}" alt="Preview">
                <button type="button" class="image-preview-remove" onclick="removeImagePreview(this)">
                    <i class="fas fa-times"></i>
                </button>
            `;
            previewContainer.appendChild(previewDiv);
            imagePreviews.push(e.target.result);
        };
        
        reader.readAsDataURL(file);
    }
}

function removeImagePreview(button) {
    button.closest('.image-preview').remove();
}

function addExtraField() {
    extraFieldCounter++;
    const container = document.getElementById('extraFieldsContainer');
    const fieldId = `extraField${extraFieldCounter}`;
    
    const fieldDiv = document.createElement('div');
    fieldDiv.className = 'extra-field';
    fieldDiv.id = fieldId;
    fieldDiv.innerHTML = `
        <div class="extra-field-header">
            <h6>Extra Field #${extraFieldCounter}</h6>
            <button type="button" class="btn btn-sm btn-danger" onclick="removeExtraField('${fieldId}')">
                <i class="fas fa-trash"></i> Remove
            </button>
        </div>
        <div class="row">
            <div class="col-md-6">
                <div class="mb-3">
                    <label class="form-label">Field Name</label>
                    <input type="text" class="form-control extra-field-name" placeholder="e.g., Author, Price, etc.">
                </div>
            </div>
            <div class="col-md-6">
                <div class="mb-3">
                    <label class="form-label">Field Type</label>
                    <select class="form-select extra-field-type" onchange="updateExtraFieldInput(this, '${fieldId}')">
                        <option value="text">Text Input</option>
                        <option value="textarea">Text Area</option>
                        <option value="switch">Switch (Yes/No)</option>
                        <option value="select">Dropdown List</option>
                        <option value="image">Image</option>
                        <option value="file">File (PDF, ZIP, RAR, etc.)</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="extra-field-input-container">
            <div class="mb-3">
                <label class="form-label">Value</label>
                <input type="text" class="form-control extra-field-value">
            </div>
        </div>
    `;
    
    container.appendChild(fieldDiv);
}

function removeExtraField(fieldId) {
    document.getElementById(fieldId).remove();
}

function updateExtraFieldInput(select, fieldId) {
    const fieldType = select.value;
    const container = document.querySelector(`#${fieldId} .extra-field-input-container`);
    
    let inputHtml = '';
    
    switch(fieldType) {
        case 'text':
            inputHtml = `
                <div class="mb-3">
                    <label class="form-label">Value</label>
                    <input type="text" class="form-control extra-field-value">
                </div>
            `;
            break;
        case 'textarea':
            inputHtml = `
                <div class="mb-3">
                    <label class="form-label">Value</label>
                    <textarea class="form-control extra-field-value" rows="3"></textarea>
                </div>
            `;
            break;
        case 'switch':
            inputHtml = `
                <div class="mb-3">
                    <div class="form-check form-switch">
                        <input class="form-check-input extra-field-value" type="checkbox">
                        <label class="form-check-label">Enable</label>
                    </div>
                </div>
            `;
            break;
        case 'select':
            inputHtml = `
                <div class="mb-3">
                    <label class="form-label">Options (comma-separated)</label>
                    <input type="text" class="form-control" placeholder="Option 1, Option 2, Option 3">
                </div>
                <div class="mb-3">
                    <label class="form-label">Selected Value</label>
                    <select class="form-select extra-field-value">
                        <option value="">Select an option</option>
                    </select>
                </div>
            `;
            break;
        case 'image':
            inputHtml = `
                <div class="mb-3">
                    <label class="form-label">Image</label>
                    <input type="file" class="form-control extra-field-value" accept="image/*">
                </div>
            `;
            break;
        case 'file':
            inputHtml = `
                <div class="mb-3">
                    <label class="form-label">File</label>
                    <input type="file" class="form-control extra-field-value" accept=".pdf,.zip,.rar,.doc,.docx,.xls,.xlsx">
                </div>
            `;
            break;
    }
    
    container.innerHTML = inputHtml;
}

function getExtraFields() {
    const fields = [];
    const fieldElements = document.querySelectorAll('.extra-field');
    
    fieldElements.forEach(field => {
        const type = field.querySelector('[data-field-type]')?.getAttribute('data-field-type') || 'text';
        const nameInput = field.querySelector('[data-field-name]');
        const name = nameInput ? nameInput.value : '';
        let value = '';
        
        if (type === 'switch') {
            const checkbox = field.querySelector('input[type="checkbox"]');
            value = checkbox ? checkbox.checked : false;
        } else if (type === 'image' || type === 'file') {
            const fileInput = field.querySelector('input[type="file"]');
            value = fileInput && fileInput.files[0] ? fileInput.files[0].name : '';
        } else {
            const input = field.querySelector('input, textarea, select');
            value = input ? input.value : '';
        }
        
        fields.push({ type, name, value });
    });
    
    return fields;
}
