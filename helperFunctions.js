// takes the current element and returns it's middle Y value
function getTargetMiddle(currentElement) {
  let divHeight = currentElement.offsetHeight;
  let targetPositionYTop = offset(currentElement).top;
  let targetPositionYBottom = targetPositionYTop + divHeight;
  targetMiddle = ((targetPositionYBottom - targetPositionYTop) / 2) + targetPositionYTop;
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
  if (inputType === 'textarea') {
    return document.createElement('textarea');
  }
  if (inputType === 'select') {
    return document.createElement('select');
  }  
  if (inputType === 'select multiple') {
    const input = document.createElement('select');
    input.setAttribute('multiple', '');
    return input;
  }
  const input = document.createElement('input');
  input.setAttribute('type', inputType);
  return input;
}

function turnToFormControl(node) {

  const inputType = node.dataset.type;
  node.append(createFormInput(inputType));

  const deleteButton = createDeleteButton();
  node.append(deleteButton);
  addDeleteListener(deleteButton);
  
  const duplicateButton = createDuplicateButton();
  node.prepend(duplicateButton);
  addDuplicateListener(duplicateButton);
  
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

// takes the current element and decides where to place to object in
// staging area, depending on where the border is displaying
function handleDropPlacement(currentElement) {
  // check if the drag is happening from controls area, or within the staging area
  if (dragSrcEl.parentNode.id === 'controls') {
    let newStagedElement = duplicateDraggedControl();
    handleElementInserts(currentElement, newStagedElement);
    
  } else {
    handleElementInserts(currentElement, dragSrcEl);
  }
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
  beginnerItem.addEventListener('dragstart', handleDragStart, false);
  beginnerItem.addEventListener('dragenter', handleDragEnter, false);
  beginnerItem.addEventListener('dragover', handleDragOver, false);
  beginnerItem.addEventListener('dragleave', handleDragLeave, false);
  beginnerItem.addEventListener('drop', handleDrop, false);
  beginnerItem.addEventListener('dragend', handleDragEnd, false);

  return beginnerItem;
}

function addDeleteListener(button) {
  button.addEventListener('click', function() {
    button.parentElement.remove();
    console.log('The staging area is', stagingArea.innerHTML);
    if(!stagingArea.innerHTML.trim()) {
      stagingArea.append(createbeginnerItem());
    }
  })
}

function addDuplicateListener(button) {
  button.addEventListener('click', function() {
    const control = button.parentElement;
    const clone = control.cloneNode(true);
    
    const cloneDelete = clone.getElementsByClassName('deleteControl')[0];
    addDeleteListener(cloneDelete);
    
    const cloneDuplicate = clone.getElementsByClassName('duplicateControl')[0];
    addDuplicateListener(cloneDuplicate);
    control.parentElement.insertBefore(clone, control);

    clone.addEventListener('dragstart', handleDragStart, false);
    clone.addEventListener('dragenter', handleDragEnter, false);
    clone.addEventListener('dragover', handleDragOver, false);
    clone.addEventListener('dragleave', handleDragLeave, false);
    clone.addEventListener('drop', handleDrop, false);
    clone.addEventListener('dragend', handleDragEnd, false);

  })
}