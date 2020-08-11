if (!localStorage.getItem('awito')) localStorage.setItem('awito', JSON.stringify(db))

let dataBase = JSON.parse(localStorage.getItem('awito'));

const modalAdd = document.querySelector('.modal__add'),
      addAd    = document.querySelector('.add__ad'),
      modalBtnSubmit = document.querySelector('.modal__btn-submit'),
      modalSubmit    = document.querySelector('.modal__submit'),
      modalItem      = document.querySelector('.modal__item'),
      catalog        = document.querySelector('.catalog'),
      menuСontainer  = document.querySelector('.menu__container'),
      menuLinkLast   = document.querySelector('.menu__link-last'),
      searchInput    = document.querySelector('.search__input'),
      filterContainer = document.querySelector('.search__filter-container')
      modalBtnWarning= document.querySelector('.modal__btn-warning'),
      modalFileInput = document.querySelector('.modal__file-input'),
      modalFileBtn   = document.querySelector('.modal__file-btn'),
      modalImageAdd  = document.querySelector('.modal__image-add'),
      modalDeleteItem= document.querySelector('.modal__delete-item'),
      modalDeleteTrueBtn = document.querySelector('.delete-true'),
      modalDeleteFalseBtn= document.querySelector('.delete-false');

const textFileBtn = modalFileBtn.textContent;
const srcModalImage = modalImageAdd.src;
let state = {};

       //CREATED ARRAY FROM ELEMENTS FROM MODAL SUBMIT (WITHOUT BUTTONS)
const elementsModalSubmit = [...modalSubmit.elements]
                            .filter(elem => elem.tagName !== 'BUTTON' && elem.type !== 'submit');


const infoPhoto = {}
let deleteItemId = null;


const saveDB = () => localStorage.setItem('awito', JSON.stringify(dataBase))



const checkForm = () =>{
    const validForm = elementsModalSubmit.every(elem => elem.value);//return true when all forms elements have value
    modalBtnSubmit.disabled = !validForm;
    modalBtnWarning.style.display = validForm ? 'none' : ''; 
}



const closeModal = event => {
        const target = event.target;
        if(target.closest('.modal__close') ||
            event.code === 'Escape' ||
            target.classList.contains('modal')) {
                modalAdd.classList.add('hide');
                modalItem.classList.add('hide');
                modalDeleteItem.classList.add('hide');
                document.removeEventListener('keydown', closeModal);
                modalImageAdd.src = srcModalImage;
                modalFileBtn.textContent = textFileBtn;
                modalSubmit.reset();
                checkForm();
        }
}

const closeFilterContainer = e =>{
    if (!e.target.closest('.search__filter-form') && e.target!=searchInput && searchInput.dataset.deepsearch=='false'){
        filterContainer.classList.add('hide')
    }
}

document.addEventListener('keydown', closeModal)
document.addEventListener('click', closeFilterContainer)

const renderCards = () =>{
    catalog.textContent = '';
    
    dataBase.forEach((item,i) => {
        
        catalog.insertAdjacentHTML('beforeend', `
            
            <li class="card" data-id="${i}">
                <img class="card__image" src="data:image/jpeg;base64,${item.image}" alt="advertising_img">
                <div class="card__description">
                    <h3 class="card__header">${item.nameItem}</h3>
                    <div class="card__price">${numberDivider(item.costItem)} грн</div>
                </div>
                <div class="card__close-button hide" data-id="${i}">&#10008;</div>
            </li>

        `);
        
        const newCard = catalog.lastElementChild;
        const cardCloseBtn = newCard.querySelector('.card__close-button');

        newCard.addEventListener("mouseenter", cardControl);
        cardCloseBtn.addEventListener('click', e => {
            e.stopPropagation();
            modalDeleteItem.classList.remove('hide');
            deleteItemId = i;
        })

    })
    
}

const cardControl = function(event){

    const target = event.target;
    const card = target.closest('.card')
    let timeoutId = setTimeout(()=>{
            card.querySelector('.card__close-button').classList.remove('hide')
    },1000)

    card.addEventListener('mouseleave',()=>{
        setTimeout(()=>{
            card.querySelector('.card__close-button').classList.add('hide')
        },1000)
        
        clearTimeout(timeoutId)
    })
    
}

const categoryFilter = event => {
    const target = event.target;
    if(!target.closest('a')) return

   
    menuLinkLast.classList.remove('hide')

    if(target.closest('.menu__link-last') == menuLinkLast){
        dataBase = JSON.parse(localStorage.getItem('awito')) || [];
        menuLinkLast.classList.add('hide')
    } else {
        dataBase = JSON.parse(localStorage.getItem('awito')) || [];
        dataBase = dataBase.filter(item=>{
            return item.category == target.dataset.category
         })
    }
    

    renderCards()
}

const searchFilter = event => {
if(catalog.parentNode.firstChild.tagName == 'SPAN') catalog.parentNode.firstChild.remove() 
    
    const {target} = event;
    dataBase = JSON.parse(localStorage.getItem('awito'));

    dataBase = dataBase.filter(item=>{
        const name = item.nameItem.toUpperCase(),
              inputValue = target.value.toUpperCase(),
              description= item.descriptionItem.toUpperCase();

        return JSON.parse(searchInput.dataset.deepsearch) ? 
            name.includes(inputValue) || description.includes(inputValue) : 
            name.slice(0,inputValue.length) == inputValue
           
    })

    dataBase.length == 0 ? 
        catalog.parentNode.insertAdjacentHTML('afterbegin',`<span>Ничего не найдено</span>`) : 
        dataBase
    
    renderCards()
}
searchInput.addEventListener('focus',e=>{
    const {target} = e;
    filterContainer.classList.remove('hide')
    
})
searchInput.addEventListener('input', searchFilter)

filterContainer.addEventListener('click', e =>{
    let target = e.target;
    if (target.id == 'deepSearchFilter'){
        target.checked ? searchInput.dataset.deepsearch=true : searchInput.dataset.deepsearch = false;
    }
})

menuСontainer.addEventListener('click', categoryFilter)

modalFileInput.addEventListener('change', e=>{
    const target = e.target;
    const file = target.files[0];

    const reader = new FileReader();
    
    infoPhoto.fileName = file.name;
    infoPhoto.size = file.size;
    
    reader.readAsBinaryString(file);
    reader.addEventListener('load', event=>{
        
        if (infoPhoto.size < 1000000){
            modalFileBtn.textContent = infoPhoto.fileName;
            infoPhoto.base64 = btoa(event.target.result);
            modalImageAdd.src = `data:image/jpeg;base64,${infoPhoto.base64}`
        } else {
            modalFileBtn.textContent = 'Размер фала должен быть не более 1МБ'
            modalFileInput.value = '';
            checkForm();
        }


        
    })
})


modalSubmit.addEventListener('input', checkForm)

modalSubmit.addEventListener('submit', e => {
    e.preventDefault();
    const itemObj = {}
    for (const elem of elementsModalSubmit){
        itemObj[elem.name] = elem.value;
    }
    itemObj.image = infoPhoto.base64;
    dataBase.push(itemObj)
    closeModal({target: modalAdd})
    saveDB()
    renderCards()
})

addAd.addEventListener('click', ()=>{
    modalAdd.classList.remove('hide');
    modalBtnSubmit.disabled = true;
    document.addEventListener('keydown', closeModal)
});

modalAdd.addEventListener('click', closeModal)
modalItem.addEventListener('click', closeModal)
modalDeleteItem.addEventListener('click', closeModal);

modalDeleteTrueBtn.addEventListener('click', event =>{
    closeModal({target:modalDeleteItem})
    dataBase.splice(deleteItemId,1);
    saveDB()
    renderCards()
})

modalDeleteFalseBtn.addEventListener('click', event =>{
    closeModal({target:modalDeleteItem})
})

catalog.addEventListener('click', function(e) {
    const target = e.target;
    
    if (target.closest('.card')){
        let cardID = target.closest('.card').dataset.id;
        let cardData = dataBase[cardID];
        
        
        
        modalItem.classList.remove('hide');
        modalItem.querySelector('.modal__header-item').textContent = cardData.nameItem;
        modalItem.querySelector('.modal__status-item').textContent = statusTranslate(cardData.status);
        modalItem.querySelector('.modal__description-item').textContent = cardData.descriptionItem;
        modalItem.querySelector('.modal__cost-item').textContent = cardData.costItem + ' грн';
        modalItem.querySelector('.modal__image-item').src = `data:image/jpeg;base64,${cardData.image}`
        document.addEventListener('keydown', closeModal)
    }
})
renderCards()