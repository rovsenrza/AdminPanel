let shortDescriptionEditor;
let fullDescriptionEditor;
let extraFieldCounter = 0;
let imagePreviews = [];
let existingSlugs = [];

document.addEventListener('DOMContentLoaded', function() {
    initEditors();
    initForm();
    initSlugGeneration();
});

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
    document.getElementById('newsForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('newsTitle').value;
        const shortDesc = shortDescriptionEditor.root.innerText;
        const fullDesc = fullDescriptionEditor.root.innerText;
        
        const formData = {
            title: title,
            slug: document.getElementById('newsSlug').value,
            category: document.getElementById('newsCategory').value,
            shortDescription: shortDescriptionEditor.root.innerHTML,
            fullDescription: fullDescriptionEditor.root.innerHTML,
            videoUrl: document.getElementById('videoUrl').value,
            published: document.getElementById('publishStatus').checked,
            images: imagePreviews,
            extraFields: getExtraFields(),
            metaTitle: document.getElementById('newsMetaTitle').value || title,
            metaDescription: document.getElementById('newsMetaDesc').value || shortDesc.substring(0, 160),
            metaKeywords: document.getElementById('newsMetaKeywords').value || extractKeywords(title + ' ' + shortDesc + ' ' + fullDesc)
        };
        
        console.log('Saving news:', formData);
        showAlert('News saved successfully!', 'success');
        
        setTimeout(() => {
            window.location.href = 'news.html';
        }, 1500);
    });
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
    const extraFieldDivs = document.querySelectorAll('.extra-field');
    
    extraFieldDivs.forEach(div => {
        const name = div.querySelector('.extra-field-name').value;
        const type = div.querySelector('.extra-field-type').value;
        let value = '';
        
        const valueInput = div.querySelector('.extra-field-value');
        if (valueInput) {
            if (type === 'switch') {
                value = valueInput.checked;
            } else if (type === 'image' || type === 'file') {
                value = valueInput.files[0] ? valueInput.files[0].name : '';
            } else {
                value = valueInput.value;
            }
        }
        
        if (name) {
            fields.push({ name, type, value });
        }
    });
    
    return fields;
}
