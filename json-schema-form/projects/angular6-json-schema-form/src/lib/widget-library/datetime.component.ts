import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { JsonSchemaFormService } from '../json-schema-form.service';

@Component({
  selector: 'datetime-widget',
  template: `
    <div class="date-time-container" [class]="options?.htmlClass">
		  <div class="customBgDiv">
			<label *ngIf="options?.title"
			  [attr.for]="'control' + layoutNode?._id"
			  [class]="options?.labelHtmlClass" [class.sr-only]="options?.notitle" [innerHTML]="options?.title">
			</label>
			<div class="date-container">
			  <input type="text"
				class="date-input"
				[class.invalid-date]="isValid === false"
				placeholder="{{placeholder}}"
				[ngModel]="dateValue"
				(keyup)="onInputFieldChanged($event)"
			  />
			  <my-date-picker [options]="datePickerOptions"
        (dateChanged)="onDateChanged($event)">
			  </my-date-picker>
			</div>
		  </div>
		</div>
     `,
  styles: [`
    datetime-widget {
      display: block;
    }
    .date-container {
      width: 100%;
      float: left;
      position: relative;
    }
    .mydp {
      width: 25px;
      position: absolute;
      right: 33px;
      top: 4px;
    }
    .selectiongroup {
      height: 20px;
    }
    .date-input {
      width: calc(100% - 31px);
      padding: 5px;
      padding-right: 30px;
      border: 1px solid #bdbdbd;
    }
    .invalid-date .date-input {
      color: #F1DEDE!important;
    }
    .mydp .selbtngroup {
      height: auto;
    }
  `]
})

export class DatetimeComponent implements OnInit {

  formControl: AbstractControl;
  controlValue: any;
  dateValue: any;
  controlName: string;
  options: any;
  isValid: boolean;
  placeholder = 'yyyy-mm-dd';
  datePickerOptions: any = {
    dateFormat: 'yyyy-mm-dd',
    showClearDateBtn: false,
    showInputField: false
  };

  @Input() layoutNode: any;
  @Input() layoutIndex: number[];
  @Input() dataIndex: number[];

  constructor(
    private jsf: JsonSchemaFormService
  ) {}

  ngOnInit() {
    this.options = this.layoutNode.options;
    this.jsf.initializeControl(this);
    this.setDate();
  }

  /*
  * Date picker change event
  **********************************************************/
  public onDateChanged(event: any) {
    const date = event.formatted;
    this.dateValue = date;
    this.isValid = true;
    this.jsf.updateValue(this, date);
  }

  /*
  * Manage the input field change event
  **********************************************************/
  public onInputFieldChanged(event: any) {
    const date = event.target.value;
    this.isValid = this.validate(date);

    const fd = this.formattedDate(date);

    // #. update the value
    this.jsf.updateValue(this, fd);
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
    return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
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

  /*
  * Set the default date from form values
  **********************************************************/
  private setDate() {
    const date: any = this.controlValue;
    if (date) {
      this.dateValue = this.formattedDate(date);
      this.isValid = this.validate(date);
    }
  }
}
