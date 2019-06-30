import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { JsonSchemaFormService } from '../json-schema-form.service';
import { buildTitleMap } from '../shared/index';
import clone from 'lodash-es/clone';
import filter from 'lodash-es/filter';
import merge from 'lodash-es/merge';
import uniqWith from 'lodash-es/uniqWith';
import isEqual from 'lodash-es/isEqual';

@Component({
  selector: 'table-widget',
  template: `
    <div [class]="options?.htmlClass">
      <div class="tableClass">
        <table class="tableComponent" [id]="layoutHead._id">
          <caption class="captionTitle">
            {{
              layoutHead?.options?.title
            }}
          </caption>
          <thead class="thead">
            <th
              class="thComponent"
              *ngFor="let layoutItem of layoutHdElement; let i = index"
            >
              <!-- && (layout[layout.length - 1].tupleItems || 0 < (layout.length - 2)) -->
              {{ layoutNodes[i]?.options?.title }}
            </th>
            <!--  <th class="thComponent" colspan="2">
            Actions
        </th> -->
          </thead>
          <tbody>
            <tr *ngFor="let head of data; let j = index">
              <td
                style=""
                *ngFor="let layoutItem of layoutNodes; let i = index"
                (click)="setActiveRow($event, undefined, i)"
              >
                <!-- for dropdown-->
                <select
                  #inputControl
                  *ngIf="
                    layoutItem.options.hasOwnProperty('enum') &&
                    layoutNodes[i].type !== 'autocomplete'
                  "
                  [(ngModel)]="
                    layoutNodes[i]?.controlValue
                      ? layoutNodes[i]?.controlValue
                      : head[(layoutNodes[i]?.name)]
                  "
                  [name]="controlName ? controlName : layoutNodes[i]?.name"
                  [class.fieldHtmlClass]="
                    layoutNodes[i]?.options?.fieldHtmlClass
                  "
                  [disabled]="controlDisabled"
                  [id]="'control' + j"
                  [required]="layoutNodes[i]?.options?.required"
                  (change)="onChange($event, layoutNodes[i]?.type, j, i)"
                  (input)="setFormDirty($event)"
                  (focusout)="ValidateValue($event)"
                >
                  [class.first-input]="j === data.length -1 && i === 0"
                  <option
                    *ngFor="let selectItem of layoutItem.options.enum"
                    [value]="selectItem"
                    [selected]="selectItem === layoutNodes[i]?.controlValue"
                    >{{ selectItem }}</option
                  >
                </select>

                <!--- for autocomplete--->

                <div
                  ngui-auto-complete
                  *ngIf="layoutNodes[i].type == 'autocomplete'"
                  class="autoCompleteDiv"
                  [accept-user-input]="true"
                  [source]="arrayOfStrings"
                >
                  <input
                    [class.not-picked]="validateAutoComplete(j)"
                    [id]="'control' + j"
                    [(ngModel)]="
                      layoutNodes[i]?.controlValue
                        ? layoutNodes[i]?.controlValue
                        : head[(layoutNodes[i]?.name)]
                    "
                    [value]="layoutNodes[i]?.controlValue"
                    [name]="controlName ? controlName : layoutNodes[i]?.name"
                    (change)="onChange($event, layoutNodes[i]?.type, j, i)"
                    (blur)="onChange($event, layoutNodes[i]?.type, j)"
                    (input)="onChange($event, layoutNodes[i]?.type, j)"
                    [class.first-input]="j === data.length - 1 && i === 0"
                    class="form-control"
                  />
                </div>

                <!--- for Date and time --->
                <div
                  *ngIf="
                    layoutNodes[i].type == 'date' ||
                    layoutNodes[i].type == 'datetime-local'
                  "
                  class="date-time"
                >
                  <div class="date-control">
                    <input
                      type="text"
                      class="date-input"
                      [class.invalid-date]="isValidDate(layoutNodes[i], j)"
                      [ngModel]="getDateVal(layoutNodes[i], i, head, j)"
                      (keyup)="
                        onDateUpdated($event, layoutNodes[i], head, j, i)
                      "
                      [class.first-input]="j === data.length - 1 && i === 0"
                    />
                    [options]="datePickerOptions"
                    (dateChanged)="onDateChanged($event, layoutNodes[i], head,
                    j)"
                  </div>
                </div>

                <input
                  #inputControl
                  *ngIf="
                    !layoutItem.options.hasOwnProperty('enum') &&
                    (layoutNodes[i].type !== 'autocomplete' &&
                      layoutNodes[i].type !== 'date' &&
                      layoutNodes[i].type !== 'datetime-local')
                  "
                  [(ngModel)]="
                    layoutNodes[i]?.controlValue
                      ? layoutNodes[i]?.controlValue
                      : head[(layoutNodes[i]?.name)]
                  "
                  [attr.aria-describedby]="
                    'control' + layoutNodes[i]?._id + 'Status'
                  "
                  [attr.list]="'control' + layoutNodes[i]?._id + 'Autocomplete'"
                  [attr.maxlength]="layoutNodes[i]?.options?.maxLength"
                  [attr.minlength]="layoutNodes[i]?.options?.minLength"
                  [attr.pattern]="layoutNodes[i]?.options?.pattern"
                  [attr.required]="layoutNodes[i]?.options?.required"
                  [class.fieldHtmlClass]="
                    layoutNodes[i]?.options?.fieldHtmlClass
                  "
                  [disabled]="controlDisabled"
                  [id]="'control' + j"
                  [name]="controlName ? controlName : layoutNodes[i]?.name"
                  [readonly]="
                    layoutNodes[i]?.options?.readonly ? 'readonly' : null
                  "
                  [type]="layoutNodes[i]?.type"
                  (keypress)="eventHandler($event, i, j)"
                  (input)="updateValue($event)"
                  [class.first-input]="j === data.length - 1 && i === 0"
                  (focusout)="ValidateValue($event)"
                />
              </td>
              <!--
      <td class="delete" style="text-align: center;">
        <button
          class="customDeleteButton"
          title="Delete"
          style="position: relative; z-index: 20;"
          type="button"
          (click)="removeItem(j,layoutHead?.dataPointer,layoutHead?.name)">
        </button>
      </td>
	  <td>
     <button  *ngIf="(data.length-1)== j? true : false" title="Add Row"
     (click)="addItem(layoutHead?.dataPointer,layoutHead?.name,$event)" class="customAddButton" > </button>
	  </td>
      	 --></tr>
          </tbody>
        </table>
        <div class="btnWrapper">
          <button
            title="Add Row"
            (click)="addItem(layoutHead?.dataPointer, layoutHead?.name, $event)"
            class="customAddButton"
          ></button>
          <button
            class="customDeleteButton"
            title="Delete"
            [disabled]="activeRow == undefined ? true : false"
            (click)="
              removeItem($event, layoutHead?.dataPointer, layoutHead?.name)
            "
          ></button>
          <button
            title="Move Up"
            [disabled]="activeRow == 0 ? true : false"
            (click)="moveActiveRow($event, -1)"
            class="customMoveUp"
          ></button>
          <button
            title="Move Down"
            [disabled]="activeRow == data.length - 1 ? true : false"
            (click)="moveActiveRow($event, 1)"
            class="customMoveDown"
          ></button>
        </div>
      </div>
      <div
        *ngIf="layoutHead?.options?.description && layoutIndex?.length == 1"
        class="help-block-description"
      >
        <div
          [innerHTML]="'Description of ' + layoutHead?.options?.title + ':'"
        ></div>
        <div
          class="help-block"
          [innerHTML]="layoutHead?.options?.description"
        ></div>
      </div>
    </div>
  `,
  styles: [
    `
      .date-time {
        float: left;
        width: 100%;
      }
      .date-control {
        min-width: 105px;
        position: relative;
        width: 100%;
        float: left;
      }
      input.date-input {
        border-radius: 0.25em;
        /*border: 0px none;*/
        padding: 5px;
        padding-right: 25px;
        float: left;
        width: 100%;
      }
      .mydp {
        position: absolute;
        right: 4px;
        top: 4px;
      }
      .selbtngroup {
        height: 25px;
      }
      .not-picked {
        color: #ff4444 !important;
      }
    `
  ]
})
export class TableComponent implements OnInit {
  constructor(public jsf: JsonSchemaFormService, public elem: ElementRef) {}
  invalidDates: any = {};
  controlName: string;
  controlValue: any;
  controlDisabled = false;
  disableAdd = false;
  data: any;
  isNotPicked = false;
  datePickerOptions: any = {
    dateFormat: 'yyyy-mm-dd',
    showClearDateBtn: false,
    showInputField: false
  };
  @Input() layoutNode: any;
  @Input() layoutNodes: any;
  @Input() layoutHdElement: any;
  @Input() layoutHead: any;
  @Input() layoutIndex: number[];
  arrayOfStrings: any = [];
  arrayOfValues: any = [];
  options: any;
  public setMultiColumn = false;
  private staticValues: string[]; // -> Hold enum values from the schema

  activeRow = 0;

  ngOnInit() {
    this.layoutHead = this.layoutNode;
    this.layoutNodes = this.layoutHead.items[0].items == undefined ? this.layoutHead.items : this.layoutHead.items[0].items;
    this.layoutHdElement = this.layoutHead.items[0].items == undefined ? this.layoutHead.items : this.layoutHead.items[0].items;
    this.layoutHdElement = this.filterValues(this.layoutHdElement);
    this.layoutNodes = this.filterValues(this.layoutHdElement);
    const controlData = this.jsf.getFormControl(this).value;

    /*****  autocomplete  */

    for (let j = 0; j < this.layoutNodes.length; j++) {
      this.options = this.layoutNodes[j].options;
      if (this.layoutNodes[j].type === 'autocomplete') {
        this.arrayOfValues = buildTitleMap(
          this.options.titleMap || this.options.enumNames,
          this.options.enum,
          !!this.options.required
        );
        /// Initialize
        this.jsf.initializeControl(this);

        // Added the value to ddl if not availabl
        for (let i = 0; i < this.arrayOfValues.length; i++) {
          this.arrayOfStrings.push(this.arrayOfValues[i].name);
        }

        this.staticValues = clone(this.arrayOfStrings);

        const fieldValue = controlData[j][this.layoutNodes[j].name];
        if (fieldValue && this.arrayOfStrings.indexOf(fieldValue) === -1) {
          this.arrayOfStrings.push(fieldValue);
        }
      }
    }

    this.data = controlData;
  }

  public validateAutoComplete(row: number) {
    const controlData = this.jsf.getFormControl(this).value;
    const value = controlData[row]['name'];
    return this.staticValues.indexOf(value) === -1;
  }

  public onDateUpdated(event: any, node: any, head: any, row: number, column: number) {
    const type = node ? node.type : undefined;
    const val = event.target.value;
    const date = this.formattedDate(val);
    if (this.validate(date)) {
      this.invalidDates[node.name + node._id + row] = false;
    } else {
      this.invalidDates[node.name + node._id + row] = true;
    }

    this.data[row][node.name] = date;
    this.triggerDateChange(date, type, row);
    this.addNewEmptyRow(event, column, row);
  }

  public isValidDate(node: any, row: number) {
    return this.invalidDates[node.name + node._id + row];
  }

  public onDateChanged(event: any, node: any, head: any, row: number) {
    const type = node ? node.type : undefined;
    const date: string = event.formatted || '';
    this.data[row][node.name] = date;
    this.triggerDateChange(date, type, row);
  }

  public getDateVal(layNode: any, index: number, head: any, row: number) {
    const val: any = head[layNode.name] || '';
    let result;
    if (val) {
      result = this.formattedDate(val);
    }

    if (this.validate(result)) {
      this.invalidDates[layNode.name + layNode._id + row] = false;
    } else {
      this.invalidDates[layNode.name + layNode._id + row] = true;
    }

    return result;
  }

  private triggerDateChange(date: string, type: any, row: any) {
    this.onChange({
      target: {
        value: date
      }
    }, type, row);
  }

  /*
   * Validate the date
   **********************************************************/
  private validate(date: string) {
    if (!date) {
      return true;
    }

    const values = date.split('-');

    // #. Year validation
    const year: any = values[0] ? values[0] : '';
    if (year.length !== 4) {
      return false;
    }

    if (isNaN(year)) {
      return false;
    }

    // #. Month validation
    let month: any = values[1] ? values[1] : '';
    if (month.length === 0 || month.length > 2) {
      return false;
    }

    month = parseInt(month, 10);
    if (isNaN(month) || (month < 1 || month > 12)) {
      return false;
    }

    // #. Day validation
    let day: any = values[2] ? values[2] : '';
    if (day.length === 0 || day.length > 2) {
      return false;
    }

    day = parseInt(day, 10);
    if (isNaN(day) || (day < 1 || day > 31)) {
      return false;
    }

    if (month && day) {
      const months_31 = [1, 3, 5, 7, 8, 10, 12];

      // #. Feb must be max 29 - TODO leap year
      if (month === 2 && day > 29) {
        return false;
      }

      if (months_31.indexOf(month) !== -1 && day > 31) {
        return false;
      } else if (months_31.indexOf(month) === -1 && day > 30) {
        return false;
      }

      if (!this.isLeapYear(year) && month === 2 && day > 28) {
        return false;
      }
    }

    return true;
  }

  /*
   * Check year is leap year or not
   **********************************************************/
  private isLeapYear(year: number) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  /*
   * Format the selcted date
   **********************************************************/
  private formattedDate(date: string) {
    const values = date.split('-');
    const valid = [];

    const y = values[0] ? values[0] : undefined;
    const m = values[1] ? values[1] : undefined;
    const d = values[2] ? values[2] : undefined;
    if (y) {
      valid.push(y);
      if (m) {
        valid.push(m);
        if (d) {
          valid.push(d);
        }
      }
    }

    return valid.join('-');
  }

  // Function to update value on input.
  updateValue(event: any) {
    this.setMultiColumn = false;
    this.setFormDirty(event);
    this.evalValue(this.jsf.data, this.layoutHead.dataPointer, this.data);
    this.jsf.dataChanges.next(this.jsf.data);
    try {
      this.jsf.updateValue(this, event.target.value);
    } catch (e) {}

    /*  else if (this.setMultiColumn && this.checkIfDataExists(event.target.value)) {
          let savedData = this.getValue(this.jsf.data, this.layoutHead.dataPointer);
          var tempObj = savedData == undefined ? JSON.stringify([]) : JSON.stringify(_.uniqWith(savedData, _.isEqual));
          this.data = JSON.parse(tempObj);
          alert("Duplicate! Selected item already exists.");
      } */
  }

  ValidateValue(event: any) {
    if (!this.checkIfDataExists(event.target.value)) {
    } else {
      const tempObj = JSON.stringify(uniqWith(this.data, isEqual));
      this.data = JSON.parse(tempObj);
      this.evalTestValue(this.jsf.data, this.layoutHead.dataPointer, this.data);
      this.jsf.dataChanges.next(this.jsf.data);
      try {
        this.jsf.updateValue(this, '');
      } catch (e) {}
      alert('Duplicate! Selected item already exists.');
    }
  }

  setFormDirty(event: any) {
    if (event.target.value != '' && event.target.value != undefined) {
      this.jsf.formGroup.markAsDirty();
    }
  }
  checkIfDataExists(value) {
    const arr = [];
    const temp = this.data.filter(res => {
      if (Object.keys(res).length >= 1) {
        this.setMultiColumn = true;
        arr.push(res);
        return res;
      }
    });
    if (this.setMultiColumn) {
      const tempObj = JSON.parse(
        JSON.stringify(uniqWith(this.data, isEqual))
      );
      if (tempObj.length == this.data.length) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }
  // Function to evaluate object based on path, and set the value provided.
  evalValue(obj, path, value) {
    let i;
    path = this.clearPath(path);
    for (i = 0; i < path.length - 1; i++) {
      if (obj[path[i]] == undefined) {
        obj[path[i]] = {};
      }
      obj = obj[path[i]];
      try {
        if (i == path.length - 2) {
          if (typeof obj[path[path.length - 1]] == 'object' && obj[path[path.length - 1]].length > 0) {
            if (value && typeof value == 'object' && Object.keys(value[0]).length > 0) {
              merge(obj[path[path.length - 1]], value);
            } else {
              obj[path[path.length - 1]] = value;
            }
          } else {
            obj[path[path.length - 1]] = value;
          }
        }
      } catch (e) {
        if (i == path.length - 1) {
          if (typeof obj[path[path.length - 1]] == 'object' && obj[path[path.length - 1]].length > 0) {
            if (value && typeof value == 'object' && Object.keys(value[0]).length > 0) {
              merge(obj[path[path.length - 1]], value);
            } else {
              obj[path[path.length - 1]] = value;
            }
          } else {
            obj[path[path.length - 1]] = value;
          }
        }
      }
    }
    if (path.length == 1) {
      obj[path[0]] = value;
    }
  }

  evalDeleteValue(obj, path, value) {
    let i;
    path = this.clearPath(path);
    for (i = 0; i < path.length - 1; i++) {
      if (obj[path[i]] == undefined) {
        obj[path[i]] = {};
      }
      obj = obj[path[i]];
      try {
        if (i == path.length - 2) {
          if (typeof obj[path[path.length - 1]] == 'object' && obj[path[path.length - 1]].length > 0) {
            if (value && typeof value == 'object' && Object.keys(value[0]).length > 0) {
              obj[path[path.length - 1]] = value;
            } else {
              obj[path[path.length - 1]] = value;
            }
          } else {
            obj[path[path.length - 1]] = value;
          }
        }
      } catch (e) {
        if (i == path.length - 1) {
          if (typeof obj[path[path.length - 1]] == 'object' && obj[path[path.length - 1]].length > 0) {
            if (value && typeof value == 'object' && Object.keys(value[0]).length > 0) {
              obj[path[path.length - 1]] = value;
            } else {
              obj[path[path.length - 1]] = value;
            }
          } else {
            obj[path[path.length - 1]] = value;
          }
        }
      }
    }
    if (path.length == 1) {
      obj[path[0]] = value;
    }
  }

  // Function to evaluate object based on path, and set the value provided.
  evalTestValue(obj, path, value) {
    let i;
    path = this.clearPath(path);
    for (i = 0; i < path.length - 1; i++) {
      if (obj[path[i]] == undefined) {
        obj[path[i]] = {};
      }
      obj = obj[path[i]];
      try {
        if (i == path.length - 2) {
          obj[path[path.length - 1]] = value;
        }
      } catch (e) {
        if (i == path.length - 1) {
          obj[path[path.length - 1]] = value;
        }
      }
    }
    if (path.length == 1) {
      obj[path[0]] = value;
    }
  }

  // Function to get value from object based on path.
  getValue(obj, path) {
    let i;
    path = this.clearPath(path);
    let oldObj = obj;

    for (i = 0; i <= path.length - 1; i++) {
      oldObj = obj;
      try {
        obj = obj[path[i]];
        if (i == path.length - 1) {
          return obj;
        }
      } catch (e) {
        return undefined;
      }
    }
  }
  // Function to clear path for evaluating data.
  clearPath(path: string) {
    path = path.replace(new RegExp('/', 'g'), '.').slice(1);
    const arrpath = path.split('.');
    path = this.clean(arrpath, '');
    return path;
  }
  // Function to clear a value from array
  clean(arr: any, deleteValue: string, type?: boolean) {
    type = type == undefined ? true : type;
    for (let i = 0; i < arr.length; i++) {
      if ((arr[i] == deleteValue && type) || ((arr[i].indexOf(deleteValue) != -1) && type == false)) {
        arr.splice(i, 1);
        i--;
      }
    }
    return arr;
  }

  filterValues(someArray: any) {
    const finalArray = someArray.filter(function(el) {
      return el.type !== '$ref';
    });

    return finalArray.filter(function (item, pos, array) {
      return array.map(function (mapItem) {
        return mapItem['_id'];
      }).indexOf(item['_id']) === pos;
    });

    //  return finalArray;
  }

  // Function to delete row
  removeItem(e, path, key) {
    e.preventDefault();
    const event = this.activeRow == undefined ? 0 : this.activeRow;
    let savedData = this.getValue(this.jsf.data, path);
    const customSavedDat = this.getValue(this.jsf.customSavedData, path);
    savedData = customSavedDat == undefined ? savedData : customSavedDat;
    if (savedData != undefined) {
      savedData.splice(event, 1);
    }
    const initialValues = {};
    if (savedData == undefined) {
      initialValues[key] = [];
      if (this.data != undefined) {
        this.data.splice(event, 1);
        for (const j of this.data) {
          this.createDefaultValues(this.layoutNodes, key, initialValues);
        }
      }
      if (this.data.length == 0) {
        this.createDefaultValues(this.layoutNodes, key, initialValues);
      } else {
        this.createDefaultValues(this.layoutNodes, key, initialValues);
      }
    } else if (savedData.length == 0) {
      initialValues[key] = [];
      this.createDefaultValues(this.layoutNodes, key, initialValues);
    } else {
      initialValues[key] = [];
      for (let _i = 0, _a = savedData; _i < _a.length; _i++) {
        if (_a[_i] == undefined) {
          this.createDefaultValues(this.layoutNodes, key, initialValues);
          this.setValues(initialValues[key][0], key, savedData, _i);
        }
      }
    }
    this.data = savedData == undefined ? initialValues[key] : (savedData.length == 0 ? initialValues[key] : savedData);
    if (this.jsf.customSavedData == undefined) {
      this.jsf.customSavedData = this.jsf.data;
      this.jsf.customSavedData['_id'] = this.layoutHead._id;
    } else {
      this.evalDeleteValue(this.jsf.customSavedData, path, this.data);
    }
    this.evalDeleteValue(this.jsf.data, path, this.data);
    this.jsf.formGroup.markAsDirty();
    this.jsf.dataChanges.next(this.jsf.customSavedData);
    try {
      this.jsf.updateValue(this, '');
    } catch (e) {}

    setTimeout(() => {
      // this.setRemoveFocus(); gck
    }, 200);
  }
  // Function to add new row
  addItem(path, key, event) {
    event.preventDefault();
    const initialData = this.data;
    if (initialData !== undefined && initialData.length !== 0) {
      const initialValues = {};
      initialValues[key] = [];
      const lastData = initialData[initialData.length - 1];
      this.createDefaultValues(this.layoutNodes, key, initialValues);
      const newData = initialValues[key][0];
      if (JSON.stringify(lastData) !== JSON.stringify(newData)) {
        initialData.push(newData);
        this.data = initialData;
        this.evalValue(this.jsf.data, path, this.data);
      }
    } else {
      const initialValues = {};
      initialValues[key] = [];
      if (this.data != undefined) {
        for (const j of this.data) {
          this.createDefaultValues(this.layoutNodes, key, initialValues);
        }
      }
      // For default new row..
      this.createDefaultValues(this.layoutNodes, key, initialValues);
      this.data = initialValues[key];
      this.evalValue(this.jsf.data, path, this.data);
    }
    if (this.jsf.customSavedData == undefined) {
      this.jsf.customSavedData = this.jsf.data;
      this.jsf.customSavedData['_id'] = this.layoutHead._id;
    } else {
      this.evalValue(this.jsf.customSavedData, path, this.data);
    }
    setTimeout(() => {
      // this.setFocus(); gck
    }, 200);
  }
  // Function to create default value for cols in table
  createDefaultValues(data: any, key: string, initialValues: any) {
    const tempObj = {};
    for (const i of data) {
      const tempKey = i.name;
      tempObj[tempKey] = '';
    }
    initialValues[key].push({});
    return initialValues;
  }

  setValues(data: any, key: string, initialValues: any, index: number) {
    initialValues[index] = data;
    return initialValues;
  }

  // Function to iterate JSON and replacing the null with values.
  traverseObj(o: any, initialValues: any, key: string) {
    let obj: any;
    for (const i of initialValues) {
      obj = initialValues[i];
    }
    // let type = typeof o;
    if (typeof o === 'object') {
      for (const key in o) {
        if (o[key] == null) {
          o[key] = obj[0];
        }
      }
    }
    return o;
  }

  onChange(event, type, row, column?: number) {
    if (event.target.value !== '' && event.target.value !== undefined) {
      this.jsf.formGroup.markAsDirty();
    }

    if (type === 'autocomplete') {
      this.data[row]['name'] = event.target.value;
    }

    this.evalValue(this.jsf.data, this.layoutHead.dataPointer, this.data);
    this.jsf.dataChanges.next(this.jsf.data);

    try {
      // this.validateAutoComplete(row, event.target.value);
      this.jsf.updateValue(this, event.target.value);
      this.addNewEmptyRow(event, column, row);
    } catch (e) {
      // Todo
    }
  }

  eventHandler(event, column, row) {
    this.addNewEmptyRow(event, column, row);
  }

  addNewEmptyRow(event: any, columnIndex, row) {
    if (event.keyCode === 13) {
      event.preventDefault();
      let isLastInputLastRow: boolean;
      let isLastInputRandom: boolean;
      let isLastRow = false;
      if (row + 1 === this.data.length) {
        isLastRow = true;
      }

      // #. Check last column last row input
      isLastInputRandom = this.layoutNodes[columnIndex + 1] === undefined;
      if (isLastInputRandom === true && isLastRow === true) {
        isLastInputLastRow = true;
      } else {
        isLastInputLastRow = false;
      }

      if (isLastInputLastRow === true) {
        this.addItem(this.layoutHead.dataPointer, this.layoutHead.name, event);
      }

      if (isLastInputLastRow === true || isLastInputRandom === true) {
        setTimeout(() => {
          const elem = this.elem.nativeElement.getElementsByClassName('first-input');
          if (elem[0]) {
            elem[0].focus();
          }
        }, 250);
      }
    }
  }
  setActiveRow(event, item) {
    let el: any;
    if (event && event.target && event.target.parentElement && event.target.parentElement.parentElement) {
      el = event.target.parentElement.parentElement;
    } else {
      el = item;
    }

    const tableComp = filter(
      document.querySelectorAll('.tableComponent'),
      res => {
        return res.id === this.layoutHead._id;
      }
    );

    const rows = tableComp[0]['rows'];
    for (let i = 0; i < rows.length; i++) {
      if (rows[i] === el) {
        rows[i].className = 'tdselect';
        this.activeRow = i;
      } else {
        rows[i].className = '';
      }
    }
  }

  moveActiveRow(event, move) {
    event.preventDefault();
    this.activeRow = this.activeRow == undefined ? 0 : this.activeRow;
    try {
      const tableComp = filter(
        document.querySelectorAll('.tableComponent'),
        res => {
          return res.id == this.layoutHead._id;
        }
      );
      const rows = tableComp[0]['rows'];
      const parentNode = rows[this.activeRow].parentNode;
      if (this.activeRow == 0 && move == -1) {
        this.setActiveRow(undefined, rows[this.activeRow]);
      } else {
        if (this.activeRow > 0 && this.activeRow < rows.length && move == -1) {
          parentNode.insertBefore(
            rows[this.activeRow],
            rows[this.activeRow + move]
          );
        } else if (
          this.activeRow >= 0 &&
          this.activeRow < rows.length &&
          move == 1
        ) {
          parentNode.insertBefore(
            rows[this.activeRow + move],
            rows[this.activeRow]
          );
        }
        this.moveArrayElements(
          this.data,
          this.activeRow,
          this.activeRow + move,
          move,
          rows
        );
      }
      try {
        this.elem.nativeElement
          .getElementsByClassName('tdselect')[0]
          .getElementsByTagName('input')[0]
          .focus();
      } catch (e) {}
      this.evalTestValue(this.jsf.data, this.layoutHead.dataPointer, this.data);
      this.jsf.formGroup.markAsDirty();
      this.jsf.dataChanges.next(this.jsf.data);
      try {
        this.jsf.updateValue(this, '');
      } catch (e) {}
    } catch (e) {}
  }

  moveArrayElements(array: Array < any > , oldIndex: number, newIndex: number, move: number, rows: any) {
    const temp1 = array[oldIndex];
    const temp2 = array[newIndex];
    array[oldIndex] = temp2;
    array[newIndex] = temp1;
    this.data = array;
    this.setActiveRow(undefined, rows[this.activeRow + move]);
    try {
      this.elem.nativeElement
        .getElementsByClassName('tdselect')[0]
        .getElementsByTagName('input')[0]
        .focus();
    } catch (e) {}
  }

  setFocus() {
    try {
      const tableComp = filter(
        document.querySelectorAll('.tableComponent'),
        function(res) {
          return res.id == this.layoutHead._id;
        }
      );
      let rows = [];
      if (tableComp.length > 0) {
        rows = tableComp[0]['rows'];
        if (rows.length > 0) {
          for (let i = 0; i < rows.length; i++) {
            if (i == rows.length - 1) {
              rows[i].className = 'tdselect';
              this.activeRow = i;
            } else {
              rows[i].className = '';
            }
          }
        }
      }
      if (this.elem.nativeElement.getElementsByTagName('input')[this.elem.nativeElement.getElementsByTagName('input').length - 1] != undefined) {
        const colCnt = this.elem.nativeElement.getElementsByTagName('input').length /rows.length;
        this.elem.nativeElement
          .getElementsByTagName('input')
          [
            this.elem.nativeElement.getElementsByTagName('input').length -
              colCnt
          ].focus();
      } else {
        this.elem.nativeElement.getElementsByTagName('textarea')[0].focus();
      }
    } catch (e) {}
  }

  setRemoveFocus() {
    try {
      const tableComp = filter(
        document.querySelectorAll('.tableComponent'),
        function(res) {
          return res.id == this.layoutHead._id;
        }
      );
      let rows = [];
      if (tableComp.length > 0) {
        rows = tableComp[0]['rows'];
        if (rows.length > 0) {
          if (this.activeRow == rows.length) {
            this.activeRow = this.activeRow - 1;
          }
          for (let i = 0; i < rows.length; i++) {
            if (i == this.activeRow) {
              rows[i].className = 'tdselect';
            } else {
              rows[i].className = '';
            }
          }
        }
      }
      if (
        this.elem.nativeElement.getElementsByTagName('input')[
          this.elem.nativeElement.getElementsByTagName('input').length - 1
        ] != undefined
      ) {
        const colCnt =
          this.elem.nativeElement.getElementsByTagName('input').length /
          rows.length;
        const rowCnt = this.activeRow + 1;
        this.elem.nativeElement
          .getElementsByTagName('input')
          [rowCnt * colCnt - colCnt].focus();
      } else {
        this.elem.nativeElement.getElementsByTagName('textarea')[0].focus();
      }
    } catch (e) {}
  }
}
