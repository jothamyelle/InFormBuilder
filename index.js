exports.informBuilder = function() {
  function renderStartingPoint () {
    const body = document.querySelector('body');
    body.innerHTML += `
    <div class="formBuildArea">
      
      <div id="stagingArea">
        
        <div id="beginnerItem" class="staged">Drop Stuff Here</div>
        
      </div>

      <div id="options">
        <div id="optionsList"></div>
      </div>
      <div id="controls">
        
          <div class="controls" draggable="true" title="Form Title" data-type="">
              <h1><label>Title</label></h1>
          </div>

          <div class="controls" draggable="true" title="Section Header" data-type="">
              <h2><label>Header</label></h2>
          </div>
    
          <div class="controls" draggable="true" title="Question or instructions to fill the field" data-type="">
              <label>Instructions</label>
          </div>
    
          <div class="controls" draggable="true" title="Checkbox" data-type="checkbox">
              <label>Checkbox</label><span class="requiredDisplay"></span>
          </div>

          <div class="controls" draggable="true" title="Radio Button" data-type="radio">
              <label>Radio Button</label><span class="requiredDisplay"></span>
          </div>
    
          <div class="controls" draggable="true" title="Select" data-type="select">
              <label>Select</label><span class="requiredDisplay"></span>
          </div>

          <div class="controls" draggable="true" title="Select Multiple" data-type="select multiple">
              <label>Select Multiple</label><span class="requiredDisplay"></span>
          </div>
    
          <div class="controls" draggable="true" title="Text" data-type="text">
              <label>Text</label><span class="requiredDisplay"></span>
          </div>

          <div class="controls" draggable="true" title="Text Area" data-type="textarea">
              <label>Text Area</label><span class="requiredDisplay"></span><br>
          </div>

          <div class="controls" draggable="true" title="Date" data-type="date">
              <label>Date</label><span class="requiredDisplay"></span>
          </div>

          <div class="controls" draggable="true" title="Time" data-type="time">
              <label>Time</label><span class="requiredDisplay"></span>
          </div>

          <div class="controls" draggable="true" title="Number" data-type="number">
              <label>Number</label><span class="requiredDisplay"></span>
          </div>

          <div class="controls" draggable="true" title="Email" data-type="email">
              <label>Email</label><span class="requiredDisplay"></span>
          </div>

      </div>
    </div>
    <button id="resetButton">Reset</button>
    <button id="saveButton">Save</button>`;
  }

  renderStartingPoint();

  // gets the current object's location in the window
  function offset(currentElement) {
    let rect = currentElement.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
  }

  // takes the current element and returns it's middle Y value
  function getTargetMiddle(currentElement) {
    let divHeight = currentElement.offsetHeight;
    let targetPositionYTop = Math.max(document.documentElement.scrollTop,document.body.scrollTop);
    let targetPositionYBottom = targetPositionYTop + divHeight;
    targetMiddle = ((targetPositionYBottom - targetPositionYTop) / 2) + targetPositionYTop;
  }

  function addAllEventListeners(currentElement) {
    currentElement.addEventListener('dragstart', handleDragStart, false);
    currentElement.addEventListener('dragenter', handleDragEnter, false);
    currentElement.addEventListener('dragover', handleDragOver, false);
    currentElement.addEventListener('dragleave', handleDragLeave, false);
    if (currentElement.parentNode.id === 'stagingArea') {
      currentElement.addEventListener('drop', handleDrop, false);
    }
    currentElement.addEventListener('dragend', handleDragEnd, false);
  }

  // Change Option to form control

  function createDeleteButton() {
    const button = document.createElement('button');
    button.classList.add('deleteControl');
    button.innerHTML = 'Delete';
    return button;
  }

  function createDuplicateButton() {
    const button = document.createElement('button');
    button.classList.add('duplicateControl');
    button.innerHTML = 'Duplicate';
    return button;
  }

  function createFormInput(inputType) {
    let input;
    switch (inputType) {
      case 'textarea':
        input = document.createElement('textarea');
        break;
      case 'select':
        input = document.createElement('select');
        break;
      case 'select multiple':
        input = document.createElement('select multiple');
        input.setAttribute('multiple', '');
        break;
      default:
        input = document.createElement('input');
        input.setAttribute('type', inputType);
    }
    return input; 
  }

  function turnToFormControl(node) {
    const inputType = node.dataset.type;
    if (inputType) {
      let correctDataTypes = [
        'text',
        'textarea',
        'date',
        'time',
        'number',
        'email'
      ]
      if(correctDataTypes.includes(inputType)) {
        node.append(createFormInput(inputType));
      }
    }

    const deleteButton = createDeleteButton();
    node.append(deleteButton);
    addDeleteListener(deleteButton);
    
    const duplicateButton = createDuplicateButton();
    node.append(duplicateButton);
    addDuplicateListener(duplicateButton);

    controlClickDisplayOptions(node);
    
    return node;
  }

  // copies the node being dragged, removes the controls class,
  // adds the staged class, sets the id to a new number, and
  // ensures the opacity goes back to normal

  function duplicateDraggedControl() {
    let newStagedElement = dragSrcEl.cloneNode(true);
    newStagedElement.classList.remove('controls');
    newStagedElement.classList.add('staged');
    newStagedElement.setAttribute('id', idCounter++);
    newStagedElement.style.opacity = '1';
    turnToFormControl(newStagedElement);
    return newStagedElement;
  }

  function handleElementInserts(currentElement, elementToDrop) {
    if(event.clientY < targetMiddle) {
      currentElement.insertAdjacentElement('beforebegin', elementToDrop);
    } else {
      currentElement.insertAdjacentElement('afterend', elementToDrop);
    }
  }

  function createOption(id, type) {
    return {
      id: id,
      type: type,
      value: '',
      label: '',
      controlOptions: [],
      required: false,
      multiple: true,
      maxlength: 255,
      placeholder: ''
    }
  }

  function createAppropriateOptionsList(currentElement) {
    let options = {};

    // check the current element's title to see what type of input it is
    // and change the options accordingly
    switch(currentElement.title)  {
      case 'Form Title':
        options = createOption(currentElement.id, 'title'); 
        break;
      case 'Section Header':
        options = createOption(currentElement.id, 'header'); 
        break;
      case 'Question or instructions to fill the field':
        options = createOption(currentElement.id, 'paragraph'); 
        break;
      case 'Select Multiple':
        options = createOption(currentElement.id, 'selectMultiple'); 
        break;
      default:
        options = createOption(currentElement.id, currentElement.dataset.type); 
    }

    listOfDisplayOptions[currentElement.id] = options;
  }

  function updateControlOption(currentElement, option, index) {
    listOfDisplayOptions[currentElement.id].controlOptions[index] = option.value;
  }

  function updateStagingAreaHTML(element, type) {
    let currentElement = listOfDisplayOptions[element.id];
    let labelName = "";
    let inputType = "";
    if(type.includes('radio')) {
      labelName = currentElement.label || "Radio";
      inputType = 'radio';
    } else if (type.includes('check')) {
      labelName = currentElement.label || "Checkbox";
      inputType = 'checkbox';
    } else if (type.includes('Multiple')) {
      labelName = currentElement.label || "Select Multiple";
      inputType = 'select multiple';
    } else {
      labelName = currentElement.label || "Select";
      inputType = 'select';
    }
    // get the number of rows currently there and then loop through and create a checkbox/dropdown/radio option for each
    let htmlToDisplay = "";
    let controlOptionsArray = listOfDisplayOptions[currentElement.id].controlOptions;
    let controlInStagingArea = document.getElementById(currentElement.id);
    
    controlInStagingArea.innerHTML = `
    <button id="control${currentElement.id}DuplicateButton" class="duplicateControl">Duplicate</button>
    <span class="requiredDisplay"></span><br>
    <label>${labelName}</label>
    <div id="control${currentElement.id}MultiOptions"></div>
    <button id="control${currentElement.id}DeleteButton" class="deleteControl">Delete</button></div>`;

    let multiOptionsDiv = document.getElementById(`control${currentElement.id}MultiOptions`);

    switch(inputType) {
      case 'select':
      case 'select multiple':
        let selectHTML = `<${inputType}>`;
        controlOptionsArray.forEach((option, index) => {
          selectHTML += `<option>${controlOptionsArray[index]}</option>
          `;
        });
        selectHTML += `</select>`;
        multiOptionsDiv.innerHTML = selectHTML;
      break;
      default:
      controlOptionsArray.forEach((option, index) => {
        multiOptionsDiv.innerHTML += `
          <p>
          <input type="${inputType}" class="checkboxOption" value="${controlOptionsArray[index]}"/>
          <label>${controlOptionsArray[index]}</label>  
          </p>
          `;
        });
      break;
    }
    
    let deleteButton = document.getElementById(`control${currentElement.id}DeleteButton`);
    let duplicateButton = document.getElementById(`control${currentElement.id}DuplicateButton`);
    addDeleteListener(deleteButton);
    addDuplicateListener(duplicateButton);
  }

  function addControlOption(elementId, className) {
    let controlInputs = document.getElementsByClassName(className);
    let controlInput = controlInputs[controlInputs.length - 1]
    let newRow = controlInput.cloneNode();
    controlInput.insertAdjacentElement('afterend', newRow);
    newRow.value = '';
    listOfDisplayOptions[elementId].controlOptions[controlInputs.length - 1] = newRow.value;
    let elementObject = document.getElementById(elementId);
    let index = controlInputs.length - 1;
    newRow.addEventListener('keyup', event => {
      updateControlOption(elementObject, newRow, index);
    });
    newRow.addEventListener('change', event => {
      updateControlOption(elementObject, newRow, index);
      updateStagingAreaHTML(elementObject, className);
    });
  }

  function displayAppropriateOptions(elementObject) {
    let htmlToDisplay = "";
    let controlOptionsArray = listOfDisplayOptions[elementObject.id].controlOptions;
    switch(elementObject.type) {
      case 'title':
      htmlToDisplay += `
        <label>Form Title</label>
        <input type="text" class="formTitleValue" value="${elementObject.value}"/>
      `;
      break;
      case 'header':
      htmlToDisplay += `
        <label>Section Header</label>
        <input type="text" class="headerValue" value="${elementObject.value}"/>
      `;
      break;
      case 'paragraph':
      htmlToDisplay += `
        <label>Instructions or Question</label>
        <textarea class="instructionsValue"/>${elementObject.value}</textarea>
      `;
      break;
      case 'checkbox':
        htmlToDisplay += `
        <label>Label</label>
        <input type="text" class="checkLabel" value="${elementObject.label}"/>
        <br/>
        <label>Checkbox Options</label>`;
        if(controlOptionsArray.length > 0) {
          controlOptionsArray.forEach((option, index) => {
            htmlToDisplay += `
            <input type="text" class="checkboxOption" value="${controlOptionsArray[index]}"/>`;
          });
        } else {
          htmlToDisplay += `
          <input type="text" class="checkboxOption"/>`;
        }
        htmlToDisplay += `
        <br/>
        <button onclick="addControlOption(${elementObject.id}, 'checkboxOption')">+ Add Option</button>
        <br/>
        <label>Required</label>
        <input type="checkbox" class="checkRequired" ${elementObject.required ? 'checked' : ''}/>
        `;
      break;
      case 'radio':
      htmlToDisplay += `
      <label>Label</label>
      <input type="text" class="radioLabel" value="${elementObject.label}"/>
      <br/>
        <label>Radio Options</label>`;
        if(controlOptionsArray.length > 0) {
          controlOptionsArray.forEach((option, index) => {
            htmlToDisplay += `
            <input type="text" class="radioOption" value="${controlOptionsArray[index]}"/>`;
          });
        } else {
          htmlToDisplay += `
          <input type="text" class="radioOption"/>`;
        }
        htmlToDisplay += `
        <br/>
        <button onclick="addControlOption(${elementObject.id}, 'radioOption')">+ Add Option</button>
        <br/>
        <label>Required</label>
        <input type="checkbox" class="radioRequired"${elementObject.required ? 'checked' : ''}/>
        `;
        break;
        case 'select':
        htmlToDisplay += `
      <label>Label</label>
      <input type="text" class="selectLabel" value="${elementObject.label}"/>
      <br/>
      <label>Select Options</label>`;
      if(controlOptionsArray.length > 0) {
        controlOptionsArray.forEach((option, index) => {
          htmlToDisplay += `
          <input type="text" class="selectOption" value="${controlOptionsArray[index]}"/>`;
        });
      } else {
        htmlToDisplay += `
        <input type="text" class="selectOption"/>`;
      }
      htmlToDisplay += `
      <br/>
      <button onclick="addControlOption(${elementObject.id}, 'selectOption')">+ Add Option</button>
      <br/>
      <label>Required</label>
      <input type="checkbox" class="selectRequired" ${elementObject.required ? 'checked' : ''}/>
        `;
      break;
      case 'selectMultiple':
        htmlToDisplay += `
        <label>Label</label>
        <input type="text" class="selectMultipleLabel" value="${elementObject.label}"/>
        <br/>
        <label>Select Multiple Options</label>`;
        if(controlOptionsArray.length > 0) {
          controlOptionsArray.forEach((option, index) => {
            htmlToDisplay += `
            <input type="text" class="selectMultipleOption" value="${controlOptionsArray[index]}"/>`;
          });
        } else {
          htmlToDisplay += `
          <input type="text" class="selectMultipleOption"/>`;
        }
        htmlToDisplay += `
        <br/>
        <button onclick="addControlOption(${elementObject.id}, 'selectMultipleOption')">+ Add Option</button>
        <br/>
        <label>Required</label>
        <input type="checkbox" class="selectMultipleMultipleRequired" ${elementObject.required ? 'checked' : ''}/>
        `;
      break;
      case 'text':
      htmlToDisplay += `
        <label>Label</label>
        <input type="text" class="textLabel" value="${elementObject.label}"/>
        <label>Placeholder</label>
        <input type="text" class="textPlaceholder" value="${elementObject.placeholder}"/>
        <label>Required</label>
        <input type="checkbox" class="textRequired" ${elementObject.required ? 'checked' : ''}/>
        <label>Maximum Length</label>
        <input type="number" class="textMaxlength" value="${elementObject.maxlength}"/>
        `;
      break;
      case 'textarea':
      htmlToDisplay += `
        <label>Label</label>
        <input type="text" class="textareaLabel" value="${elementObject.label}"/>
        <label>Placeholder</label>
        <input type="text" class="textareaPlaceholder" value="${elementObject.placeholder}"/>
        <label>Required</label>
        <input type="checkbox" class="textareaRequired" ${elementObject.required ? 'checked' : ''}/>
        <label>Maximum Length</label>
        <input type="number" class="textareaMaxlength" value="${elementObject.maxlength}"/>
        `;
      break;
      case 'date':
      htmlToDisplay += `
        <label>Label</label>
        <input type="text" class="dateLabel" value="${elementObject.label}"/>
        <label>Required</label>
        <input type="checkbox" class="dateRequired" ${elementObject.required ? 'checked' : ''}/>
        `;
      break;
      case 'time':
      htmlToDisplay += `
        <label>Label</label>
        <input type="text" class="timeLabel" value="${elementObject.label}"/>
        <label>Required</label>
        <input type="checkbox" class="timeRequired" ${elementObject.required ? 'checked' : ''}/>
        `;
      break;
      case 'number':
      htmlToDisplay += `
        <label>Label</label>
        <input type="text" class="numberLabel" value="${elementObject.label}"/>
        <label>Placeholder</label>
        <input type="number" class="numberPlaceholder" value="${elementObject.placeholder}"/>
        <label>Required</label>
        <input type="checkbox" class="numberRequired" ${elementObject.required ? 'checked' : ''}/>
        <label>Maximum Length</label>
        <input type="number" class="numberMaxlength" value="${elementObject.maxlength}"/>
        `;
      break;
      case 'email':
        htmlToDisplay += `
        <label>Label</label>
        <input type="text" class="emailLabel" value="${elementObject.label}"/>
        <label>Placeholder</label>
        <input type="text" class="emailPlaceholder" value="${elementObject.placeholder}"/>
        <label>Required</label>
        <input type="checkbox" class="emailRequired" ${elementObject.required ? 'checked' : ''}/>
        <label>Maximum Length</label>
        <input type="number" class="emailMaxlength" value="${elementObject.maxlength}"/>
        `;
      break;
    }

    let optionsList = document.getElementById('optionsList');
    optionsList.innerHTML = '';
    optionsList.insertAdjacentHTML('afterbegin', htmlToDisplay);
    
    // add event listeners to all the multiple options inputs
    let optionClasses = ['checkboxOption','radioOption','selectOption', 'selectMultipleOption'];
    optionClasses.forEach(optionClass => {
      Array.from(document.getElementsByClassName(optionClass)).forEach(function(option, index) {
        option.addEventListener('keyup', event => {
          updateControlOption(elementObject, option, index);
        });
        option.addEventListener('change', event => {
          updateStagingAreaHTML(elementObject, optionClass);
        });
      });
    });

    // add listeners to all the inputs in the options area
    let controlsValueArray = ['formTitleValue','headerValue','instructionsValue'];
    controlsValueArray.forEach(controlValue => {
      addOptionListeners(controlValue, elementObject, 'value');
    });

    let controlsLabelArray = ['checkLabel', 'radioLabel', 'selectLabel', 'selectMultipleLabel', 'textLabel', 'textareaLabel', 'dateLabel', 'timeLabel', 'numberLabel', 'emailLabel'];
    controlsLabelArray.forEach(controlLabel => {
      addOptionListeners(controlLabel, elementObject, 'label');
    });

    let controlsPlaceholderArray = ['textPlaceholder', 'textareaPlaceholder', 'numberPlaceholder', 'emailPlaceholder'];
    controlsPlaceholderArray.forEach(controlPlaceholder => {
      addOptionListeners(controlPlaceholder, elementObject, 'placeholder');
    });

    let controlsMaxlengthArray = ['textMaxlength', 'textareaMaxlength', 'numberMaxlength', 'emailMaxlength'];
    controlsMaxlengthArray.forEach(controlMaxlength => {
      addNumberListener(controlMaxlength, elementObject, 'maxlength');
    });

    let controlsRequiredArray = ['checkRequired', 'radioRequired', 'selectRequired', 'selectMultipleRequired', 'textRequired', 'textareaRequired', 'dateRequired', 'timeRequired', 'numberRequired', 'emailRequired'];
    controlsRequiredArray.forEach(controlRequired => {
      addOptionCheckboxListener(controlRequired, elementObject, 'required');
    });  
  }

  function addOptionListeners(className, elementObject, prop) {
    Array.from(document.getElementsByClassName(className)).forEach(function (element) {
      element.addEventListener('keyup', function() {
        listOfDisplayOptions[elementObject.id][prop] = element['value'];
        const control = document.getElementById(elementObject.id);
        if (prop === 'value' || prop === 'label') {
          control.querySelector('label').textContent = element['value'];
        } else if (prop === 'placeholder') {
          if (control.dataset.type === 'textarea') {
            control.querySelector('textarea').setAttribute('placeholder', element['value']);
          } else {
            control.querySelector('input').setAttribute('placeholder', element['value']);
          } 
        }
      })
    })
  }

  function addNumberListener(className, elementObject, prop) {
    Array.from(document.getElementsByClassName(className)).forEach(function (element) {
      element.addEventListener('change', function() {
        listOfDisplayOptions[elementObject.id][prop] = element['value'];
        const control = document.getElementById(elementObject.id);
      })
    })
  }

  function addOptionCheckboxListener(className, elementObject, prop) {
    Array.from(document.getElementsByClassName(className)).forEach(function (element) {
      element.addEventListener('change', function() {
        listOfDisplayOptions[elementObject.id][prop] = listOfDisplayOptions[elementObject.id][prop] ? false : true;
        const control = document.getElementById(elementObject.id);
        if (prop === 'required') {
          if (listOfDisplayOptions[elementObject.id][prop]) {
            control.getElementsByClassName('requiredDisplay')[0].textContent = '*';
          } else {
            control.getElementsByClassName('requiredDisplay')[0].textContent = '';          
          }
        }
      })
    })
  }

  // takes the current element and decides where to place to object in
  // staging area, depending on where the border is displaying
  function handleDropPlacement(currentElement) {
    // check if the drag is happening from controls area, or within the staging area
    if (dragSrcEl.parentNode.id === 'controls') {
      let newStagedElement = duplicateDraggedControl();
      handleElementInserts(currentElement, newStagedElement);
      createAppropriateOptionsList(newStagedElement);
      displayAppropriateOptions(listOfDisplayOptions[newStagedElement.id]);
    } else {
      handleElementInserts(currentElement, dragSrcEl);
    }
  }

  function controlClickDisplayOptions(node) {
    node.addEventListener('click', function() {
      displayAppropriateOptions(listOfDisplayOptions[node.id]);
    })
  }

  // removes the irrelevant classes
  function removeDragOverClasses(currentElement) {
    currentElement.classList && currentElement.classList.contains('over-top') ? currentElement.classList.remove('over-top') : false;
    currentElement.classList && currentElement.classList.contains('over-bottom') ? currentElement.classList.remove('over-bottom') : false;
  }

  function createbeginnerItem() {
    beginnerItem = document.createElement('div');
    beginnerItem.setAttribute('id', 'beginnerItem');
    beginnerItem.classList.add('staged');
    beginnerItem.textContent = 'Drop Stuff Here';

    return beginnerItem;
  }

  function addDeleteListener(button) {
    button.addEventListener('click', function() {
      button.parentElement.remove();
      if(!stagingArea.innerHTML.trim()) {
        const beginnerItem = createbeginnerItem(); 
        stagingArea.append(beginnerItem);
        addAllEventListeners(beginnerItem);
      }
    })
  }

  function addDuplicateListener(button) {
    button.addEventListener('click', function() {
      listOfDisplayOptions[0].id = 0;

      const control = button.parentElement;
      const clone = control.cloneNode(true);
      const cloneDelete = clone.getElementsByClassName('deleteControl')[0];
      addDeleteListener(cloneDelete);
      
      const cloneDuplicate = clone.getElementsByClassName('duplicateControl')[0];
      addDuplicateListener(cloneDuplicate);
      clone.setAttribute('id', idCounter++);
      const clone_id = clone.id;
      control.insertAdjacentElement('afterend', clone);
      addAllEventListeners(clone);

      listOfDisplayOptions[clone.id] = {id: parseInt(clone.id),
        type: listOfDisplayOptions[control.id].type,
        value: listOfDisplayOptions[control.id].value,
        label: listOfDisplayOptions[control.id].label,
        controlOptions: [],
        required: listOfDisplayOptions[control.id].required,
        multiple: listOfDisplayOptions[control.id].multiple,
        maxlength: listOfDisplayOptions[control.id].maxlength,
        placeholder: listOfDisplayOptions[control.id].placeholder };

        listOfDisplayOptions[control.id].controlOptions.forEach(option => {
          listOfDisplayOptions[clone.id].controlOptions.push(option);
        });

      displayAppropriateOptions(clone);
      controlClickDisplayOptions(clone);
    })
  }

  // Reset Button
  function addResetButtonListener(){
    const resetButton = document.getElementById('resetButton');
    const stagingArea = document.getElementById('stagingArea');
    
    resetButton.addEventListener('click', function() {
      const confirmation = confirm('Are you sure?');
      if (confirmation) {
        stagingArea.innerHTML = '';
        const beginnerItem = createbeginnerItem(); 
        stagingArea.append(beginnerItem);
        addAllEventListeners(beginnerItem);
      }
    })
  }

  // Save Button

  function addSaveButtonListener() {
    const saveButton = document.getElementById('saveButton');
    const savedFormTemplate = [];
    saveButton.addEventListener('click', function() { 
      console.log(JSON.stringify(listOfDisplayOptions));
      return JSON.stringify(savedFormTemplate);
    })
  }

  // Delete Buttons
  function addDeleteButtonListener(){
    const deleteButtons = document.getElementsByClassName('deleteControl');
    
    Array.prototype.forEach.call(deleteButtons, function(button) {
      addDeleteListener(button);
    })
  }

  // Duplicate Buttons
  function addDuplicateButtonListener(){
    const duplicateButtons = document.getElementsByClassName('duplicateControl');
    
    Array.prototype.forEach.call(duplicateButtons, function(button) {
      addDuplicateListener(button);
    })
  }

  let dragSrcEl = null;
  let targetMiddle = 0;
  let idCounter = 0;
  let listOfDisplayOptions = {};

  function handleDragStart(event) {
    this.style.opacity = '0.4';
    dragSrcEl = this;

    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', this.innerHTML);
  }

  function handleDragOver(event) {
    if (event.preventDefault) {
      event.preventDefault(); // Necessary. Allows us to drop.
    }
    getTargetMiddle(this);

    if(event.clientY  < targetMiddle) {
      this.classList.add('over-top');
      this.classList && this.classList.contains('over-bottom') ? this.classList.remove('over-bottom') : false;
    } else {
      this.classList.add('over-bottom');
      this.classList && this.classList.contains('over-top') ? this.classList.remove('over-top') : false;
    }
    event.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.

    return false;
  }

  function handleDragEnter(event) {
    // this / event.target is the current hover target.
  }

  function handleDragLeave(event) {
    removeDragOverClasses(this);
  }

  function handleDrop(event) {
    // this / event.target is current target element.
    if (event.stopPropagation) {
      event.stopPropagation(); // Stops some browsers from redirecting.
      
      // Don't do anything if dropping the same column we're dragging.
      if (dragSrcEl != this) {
        // deal with the drop placement
        getTargetMiddle(this);
        handleDropPlacement(this);
        removeDragOverClasses(this);

        // get rid of the placeholder item
        if(document.getElementById('beginnerItem')) {
          document.getElementById('beginnerItem').remove();
        }

        let stagedRows = document.querySelectorAll('#stagingArea .staged');
        [].forEach.call(stagedRows, function(stagedRow) {
          addAllEventListeners(stagedRow);
        });
      }
    
      return false;
    }
  }

  function handleDragEnd(event) {
    // this/event.target is the source nodevent.
    this.style.opacity = '1';

    [].forEach.call(stagedRows, function (stagedRow) {
        removeDragOverClasses(this);
    });
  }

  let stagedRows = document.querySelectorAll('#stagingArea .staged');
  [].forEach.call(stagedRows, function(stagedRow) {
    addAllEventListeners(stagedRow);
  });

  var controlRows = document.querySelectorAll('#controls .controls');
  [].forEach.call(controlRows, function(controlRow) {
    addAllEventListeners(controlRow);
  });


  addResetButtonListener();
  addSaveButtonListener();
  addDeleteButtonListener();
  addDuplicateButtonListener();
}